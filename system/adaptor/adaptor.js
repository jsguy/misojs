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
	_ = require('lodash'),
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
	makeClientAction = function(action, adaptor, apiPath){
		return function(){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = function(){
					//	Sooo... this hits the API, which calls the 
					//	adaptor on the server?
					//	TODO: we need to expose the adaptor methods
					//	AS an API...
					//return m.request();
					/*
						m.request({
							method:'post', 
							url: '/api/save', 
							data: {
								type: 'user.edit.user'
							}
						}).then(function(result){
							console.log('SAVE', result);
						});
					*/
					m.request({
						method:'post', 
						url: apiPath + '/' + action, 
						data: arguments
					}).then(function(result){
						console.log('ACTION', action, result);
					});
				};

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(adaptor, args);
			});
		};
	};


module.exports = function(app) {
	return {
		utils: {
			//	Returns a model
			getModel: function(type){
				return app.get("model." + type);
			},
			//	Remove any unrequired model data, and get actual values
			modelToDataObject: function(model){
				//	Excludes isValid method
				var i, result = {};
				for(i in model) {if(model.hasOwnProperty(i)) {
					if(i !== "isValid") {
						result[i] = (typeof model[i] == "function")? model[i](): model[i];
					}
				}}

				return result;
			},
			/*	Use a JSON RPC 2.0 response

				* Either include a 'result' OR an 'error' attribute - if error, no result will be sent.
				* 'id' is optional but might be useful in some circumstances, eg: if you use multiple simultaneous requests
			*/
			response: function(result, err, id){
				var res = {
					jsonrpc: "2.0",
					id: null
				};

				//	Can't have both result and error
				if(err) {
					res.error = err;
				} else {
					res.result = result;
				}

				console.log('RESPONSE result ', result);

				return result;
			},
			//	Our response type
			responseType: "json"
		},


		//	Server adaptor - makes calls to the actual adaptor
		create: function(adaptor, utils) {
			//	TODO: Add a binding object, so we can block till ready!
			//	TODO: This probably belongs in the api?
			//scope._misoReadyBinding = miso.readyBinderFactory();
			var obj = {}

			for(var i in adaptor) {
				obj[i] = makeServerAction(i, adaptor);
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		},



		//	Client adaptor - remote calls with a serialised model
		createClient: function(adaptor, utils, apiPath) {
			//	TODO: Add a binding object, so we can block till ready!
			//	TODO: This probably belongs in the api?
			//scope._misoReadyBinding = miso.readyBinderFactory();
			var obj = {};

			for(var i in adaptor) {
				obj[i] = makeClientAction(i, adaptor, apiPath);
			}

			//console.log('client api', obj);

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		}
	};
};