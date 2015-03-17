//	miso login api example
var ffdba = require('../../../system/api/flatfiledb/flatfiledb.api.js'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	bcrypt = require('bcrypt');

//	Extend the flatfiledb api with login-specfic methods
module.exports = function(utils){
	var db = ffdba(utils),
		modelType = 'user.edit.user';

	//	See if we have a user
	//	TODO: hash password
	db.login = function(cb, err, args, session){
		//	Find matching username
		db.find(function(data) {
			if(data.length > 0) {
				//	Compare to hashed password
				bcrypt.compare(args.model.password, data[0].password, function(error, res) {
					if(error) {
						return err(false);
					}
				    // res == true 
				    if(res == true) {

				    	//	TODO: We need to notify the ssession here...

				    	//	TODO - use the secret from the server config.
				    	session.isLoggedIn = true;

				    	cb(true);
				    } else {
				    	cb(false);
				    }
				});

			} else {
				cb(false);
			}
		}, err, {
			type: modelType, query: { 
				name: args.model.username
			}
		});
	};


	//	TODO: We need to ba able to restrict user model access
	//	by api type.


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

	return db;
};