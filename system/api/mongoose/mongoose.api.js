/*
	Mongoose miso api example



	To create an api, create a function that can receive a set of utilities, 
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
var mongoose = require('mongoose'),
	uuid = require('node-uuid');

mongoose.connect('mongodb://localhost/testmiso');


//	Creates a cache for the constructed models 
//	so we're not creating new ones all the time
var modelCache = {};


module.exports = function(utils){

	//	Gets a mongoose model
	var getMongooseModel = function(type){
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
		//
		//	find is called like so:
		//	
		//		api.find({type: MODEL_DESIGNATOR}).then(SUCCESSFUNC, ERRORFUNC);
		//	
		//	Where:
		//	
		//		* MODEL_DESIGNATOR is the fully qualified name for the model, which is CONTROLLER.ACTION.MODELNAME, eg: 'todo.index.todo'
		//		* SUCCESSFUNC is a function that will be called if the query completed successfully
		//		* ERRORFUNC is a function that will be called if the query failed to execute properly
		//	
		find: function(cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type),
				query = args.query,
				fields = args.fields || null,
				options = args.options || {};

			if(!Model) {
				return err("Model not found " + args.type);
			}

			//	Get an instance of a mongoose model
			var MonModel = getMongooseModel(args.type);

			MonModel.find(query, fields, options, function (errorText, docs) {
				if (errorText) {
					return err(errorText);
				}
				return cb(docs);
			});
		},
		//
		//	save is called like so:
		//	
		//		api.save({type: MODEL_DESIGNATOR, model: MODEL}).then(SUCCESSFUNC, ERRORFUNC);
		//	
		//	Where:
		//	
		//		* MODEL_DESIGNATOR is the fully qualified name for the model, which is CONTROLLER.ACTION.MODELNAME, eg: 'todo.index.todo'
		//		* MODEL is a miso model
		//		* SUCCESSFUNC is a function that will be called if the query completed successfully
		//		* ERRORFUNC is a function that will be called if the query failed to execute properly
		//	
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
				var MonModel = getMongooseModel(args.type);
				var modelInstance = new MonModel(utils.getModelData(model));

				if(!modelInstance._id) {
					modelInstance._id = modelInstance._id || uuid.v4();
					modelInstance.save(function (errorText) {
						if (errorText) {
							return err(errorText);
						}
						return cb({ id: modelInstance._id });
					});
				} else {
					modelInstance._id = modelInstance._id || uuid.v4();
					modelInstance.update(modelInstance, function (errorText) {
						if (errorText) {
							return err(errorText);
						}
						return cb(modelInstance._id);
					});
				}
			} else {
				//	Send beack the validation errors
				return err(validation);
			}
		},
		//	Delete
		remove: function(cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type),
				id = args._id,
				model,
				MonModel;

			if(!Model) {
				return err("Model not found " + args.type);
			}

			MonModel = getMongooseModel(args.type);

			MonModel.findByIdAndRemove(id, function (errorText, docs) {
				if (errorText) {
					return err(errorText);
				}
				return cb(docs);
			});
		}
	};
};