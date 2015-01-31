/*
	Mongoose miso adaptor example



	To create an adaptor, create a function that can receive a set of utilities, 
	and returns an object with action methods to expose to the api.

	The methods must use the following signature:

		function(cb, err, args)


	Where:

	* cb is a success callback
	* err is an error callback
	* args is an object with any parameters you might require

	This is because we automatically generate:

	* A RESTful API route for every action method
	* A consistent server/client api
	* The client API is a lightweight shim to use the API seamlessly

 */



//	TODO: Move to /cfg
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/testmiso');



//	Creates a cache for the constructed models 
//	so we're not creating new ones all the time
var modelCache = {};


module.exports = function(utils){

	//	Gets a mongoose model
	var getMongooseModel = function(type, model){
		var monModel;
		if(modelCache[type]) {
			monModel = modelCache[type];
		} else {
			monModel = mongoose.model(type, utils.getModelStructure(type));
		}
		
		modelCache[type] = monModel;
		return monModel;
	};
	return {
		find: function(cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type), model,
				conditions = args.conditions,
				fields = args.fields || null,
				options = args.options || {};

			if(!Model) {
				return err("Model not found " + args.type);
			} else {
				model = new Model(args.model || {});
			}

			//	Get an instance of a mongoose model
			var MonModel = getMongooseModel(args.type, model);

			MonModel.find(conditions, fields, options, function (errorText, docs) {
				if (errorText) {
					return err(errorText);
				}
				return cb(docs);
			});
		},
		save: function(cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type), model, validation;

			if(!Model) {
				return err("Model not found " + args.type);
			}

			model = new Model(args.model);
			validation = model.isValid? model.isValid(): true;

			//	Validate the model data
			if(validation === true) {
				//	Get an instance of a mongoose model
				var MonModel = getMongooseModel(args.type, model);
				var modelInstance = new MonModel(utils.getModelData(model));

				modelInstance.save(function (errorText) {
					if (errorText) {
						return err(errorText);
					}
					return cb("saved model!");
				});
			} else {
				//	Send beack the validation errors
				return err(validation);
			}
		},
		findById: function(cb, err, args){
			console.log('findbyid', args);
			setTimeout(function(){
				cb("found by id: " + args.id);
			}, 200);
		},
		findByModel: function(cb, err, args){
			console.log('findbymodel', args.model, args.whatever);
			setTimeout(function(){
				cb("found model!");
			}, 300);
		}
	};
};