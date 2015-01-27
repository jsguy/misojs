/*
	The concept for the adaptors is that we can create an api for
	any action, with arbitrary arguments, and the framework will
	pass those arguments to the same serverside action

	For example:

	if(model.isValid() === true) {
		store.save(model).then(function(result){
			//	Result now contains something....
			//	TODO: This should be a JSON RPC 2.0 result?
		});
	}

	This will save the model, as long as it is valid.

	store.find

*/

var fs = require('fs'),
	miso = require('../../server/miso.util.js'),
	Promiz = require('promiz'),
	//	Creates actions for use on the server
	makeServerAction = function(action, adaptor){
		return function(){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = adaptor[action];

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(adaptor, args);
			});
		};
	},
	//	Creates client action method
	//	TODO: export these to a frontend file.
	//	It should be named [name].client.adaptor.js
	makeClientAction = function(action, adaptor){
		return function(){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = function(){
					//	Sooo... this hits the API, which calls the 
					//	adaptor on the server?
					//	TODO: we need to expose the adaptor methods
					//	AS an API...
					return m.request();
				};

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(adaptor, args);
			});
		};
	};


//	Remove any unrequired model data, and get actual values
module.exports.getModelData = function(model){
	//	Excludes isValid method
	var i, result = {};
	for(i in model) {if(model.hasOwnProperty(i)) {
		if(i !== "isValid") {
			result[i] = (typeof model[i] == "function")? model[i](): model[i];
		}
	}}

	return result;
};

//	Use a proper json response
module.exports.jsonResponse = function(obj){
	var result = {
		jsonrpc: "2.0",
		id: null
	};

	result = _.assign(result, obj);

	//	Can't have both result and error, so remove result
	if(obj.error && obj.result) {
		delete obj.result;
	}

	return result;
};



//	Server adaptor - makes calls to the actual adaptor
module.exports.create = function(name, adaptor) {
	//	TODO: Add a binding object, so we can block till ready!
	//	TODO: This probably belongs in the api?
	//scope._misoReadyBinding = miso.readyBinderFactory();
	var obj = {}

	for(var i in adaptor) {
		obj[i] = makeServerAction(i, adaptor);
	}

	return obj;
};

//	Client adaptor - remote calls with a serialised model
module.exports.createClient = function(name, adaptor) {
	//	TODO: Add a binding object, so we can block till ready!
	//	TODO: This probably belongs in the api?
	//scope._misoReadyBinding = miso.readyBinderFactory();
	var obj = {}

	for(var i in adaptor) {
		obj[i] = makeClientAction(i, adaptor);
	}

	return obj;
};