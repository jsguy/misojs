//	Miso authentication api example
//
//	This example uses bcrypt to encode/decode passwords, 
//
var ffdba = require('../../../system/api/flatfiledb/flatfiledb.api.js'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	bcrypt = require('bcrypt'),
	secret = GLOBAL.serverConfig.authentication.secret;

//	Extend the flatfiledb api with login-specfic methods
module.exports = function(utils){
	var db = ffdba(utils),
		modelType = 'user.edit.user';

	//	Login a user
	db.login = function(cb, err, args, req){
		//	Find matching username
		db.find(function(data) {
			if(data.length > 0) {
				//	Compare to hashed password
				bcrypt.compare(args.model.password, data[0].password, function(error, res) {
					if(error) {
						return err(false);
					}
				    if(res == true) {
				    	//	Set the authSecret - this is the only place 
				    	//	where this should happen.
				    	req.session.authenticationSecret = secret;
				    	req.session.userName = data[0].name;
				    	cb({isLoggedIn: true, userName: data[0].name});
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
			cb(result);
		}, err, {
			type: modelType, 
			query: args.query
		});
	};

	//	Save a user including password hash
	//	ref: http://codahale.com/how-to-safely-store-a-password/
	db.saveUser = function(cb, err, args){
		//	Get an instance of the model
		var Model = utils.getModel(modelType), model, validation;

		if(!Model) {
			return err("Model not found " + modelType);
		}

		model = new Model(args.model);
		//	We require validation to create a user.
		//	Models that cannot be validated are not saved
		validation = model.isValid? model.isValid(): false;

		//	Validate the model data
		if(validation === true) {
			var data = utils.getModelData(model);

			//	TODO: fix _id issue.
			data._id = data.id || data._id || uuid.v4();

			//	Use bcrypt to salt and save password
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(data.password, salt, function(err, hash) {
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