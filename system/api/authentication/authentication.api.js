//	Miso authentication api example
//
//	This example uses bcryptjs to encode/decode passwords, 
//
var ffdba = require('../../../system/api/flatfiledb/flatfiledb.api.js'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	bcryptjs = require('bcryptjs'),
	secret = GLOBAL.serverConfig.authentication.secret;

//	Extends the flatfiledb api with login-specfic methods
module.exports = function(utils){
	var db = ffdba(utils),
		modelType = 'user.edit.user';

	//	Login a user
	db.login = function(cb, err, args, req){
		//	Find matching username
		db.find(function(data) {
			if(data.length > 0) {
				//	Compare to hashed password
				bcryptjs.compare(args.model.password, data[0].password, function(error, result) {
					if(error) {
						return err(false);
					}
				    if(result) {
				    	//	Set the authSecret - this is the only
				    	//	place where this happens.
				    	//	The value is used in auth_middle.js
				    	req.session.authenticationSecret = secret;
						req.session.user = {
							name: data[0].name,
							roles: data[0].roles
						};
				    	cb({isLoggedIn: true, user: req.session.user});
				    } else {
				    	cb({isLoggedIn: false});
				    }
				});

			} else {
				cb({isLoggedIn: false});
			}
		}, err, {
			type: modelType, query: { 
				name: args.model.username
			}
		});
	};

	//	Log out a user
	db.logout = function(cb, err, args, req){
		delete req.session.authenticationSecret;
		delete req.session.user;
		cb({isLoggedIn: false});
	};

	//	Load users, excluding the password hash
	db.findUsers = function(cb, err, args){
		db.find(function(data){
			var result = [];
			if(data && data.length > 0) {
				//	remove the password hash
				_.forOwn(data, function(item){
					result.push(_.assign({},item));
					delete result[result.length-1].password;
				});
			}


 			console.log('found user', result[0].roles);


			cb(result);
		}, err, {
			type: modelType, 
			query: args.query
		});
	};

	//	TODO: Requires auth for this method.

	//	Save a user including password hash
	//	ref: http://codahale.com/how-to-safely-store-a-password/
	db.saveUser = function(cb, err, args){
		//	Get an instance of the model
		var Model = utils.getModel(modelType), model, validation;

		if(!Model) {
			return err("Model not found " + modelType);
		}

		/*
			The process

			* Get model data
			* Re-create nodel from data
			* Validate the model
			* Get data from model
			* Save data

		*/

		console.log("=================================");
		console.log('args.model', args.model);
		console.log("=================================");

		model = new Model(args.model);

		console.log("------- roles -------");
		console.log(model.roles[0]());
		console.log("---------------------");


		//	We require validation to create a user.
		//	Models that cannot be validated are not saved
		validation = model.isValid? model.isValid(): false;

		console.log('save user roles', validation);

		//	Validate the model data
		if(validation === true) {
			console.log('Save user');
			var data = utils.rGetModelData(model);

			console.log('Got data', data);

			//	TODO: fix _id issue.
			data._id = data.id || data._id || uuid.v4();

			//	Fix 

			//	Use bcryptjs to salt and save password
			bcryptjs.genSalt(10, function(err, salt) {
				bcryptjs.hash(data.password, salt, function(err, hash) {
					data.password = hash;
					db.save(cb, err, {
						type: modelType, 
						model: data
					});
				});
			});
		} else {
			//	Send back the validation errors
			return err(validation);
		}
	};

	db.authenticate = db.authenticate || [];
	db.authenticate.push("saveUser");

	return db;
};