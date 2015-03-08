//	miso login adaptor example
var ffdba = require('../../../system/adaptor/flatfiledb/flatfiledb.adaptor.js'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	bcrypt = require('bcrypt');

//	Extend the flatfiledb adaptor with login-specfic methods
module.exports = function(utils){
	var db = ffdba(utils),
		modelType = 'user.edit.user';

	//	See if we have a user
	//	TODO: hash password
	db.login = function(cb, err, args){
		//	Find matching username
		db.find(function(data) {
			if(data.length > 0) {
				//	Compare to hashed password
				bcrypt.compare(args.model.password, data[0].password, function(error, res) {
					if(error) {
						return err(false);
					}
				    // res == true 
				    if(res === true) {

				    	//	TODO: We need to create a session here...
				    	//	Note: this isn't teh right place to do that 
				    	//	it should be done in the login mvc ... probably?

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
	//	by adaptor type.


	//	Load users, excluding the password hash
	db.findUsers = function(cb, err, args){
		db.find(function(data){
				if(data && data.length > 0) {
					//	remove the password hash
					_.forOwn(data, function(item){
						delete item.password;
					})
				}
				cb(data);
			}, err, {
			type: modelType, 
			model: args.model
		});
	};

	//	Save a user including password hash
	//	ref: http://codahale.com/how-to-safely-store-a-password/
	db.saveUser = function(cb, err, args){
		//	Get an instance of the model
		var Model = utils.getModel(args.type), model, validation;

		if(!Model) {
			return err("Model not found " + args.type);
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
						type: args.type, 
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