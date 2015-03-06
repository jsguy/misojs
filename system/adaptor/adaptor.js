/*
	The concept for the adaptors is that we can create an api for
	any action, with arbitrary arguments, and the framework will
	pass those arguments to the same serverside action

	ie: we are not opinionated of how it works, beyond how 
		to call methods, so that we can override them.


	TODO:

	* Clean up what methods we need from here...

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


	//	Creates actions for use in the server generated code
	//	Note: cannot use a real promise here, as mithril breaks...
	makeServerGenerateAction = function(action, adaptor){
		return ["function(){",
			"	var args = Array.prototype.slice.call(arguments, 0),",
			"		errResult,",
			"		errFunc = function(){errResult=arguments; doneFunc()},",
			"		successResult,",
			"		successFunc = function(){successResult=arguments; doneFunc()},",
			"		isReady = false,",
			"		doneFunc = function(){isReady = true;};",
			"	",
			"	args.unshift(successFunc, errFunc);",
			"	result = myAdaptor['"+action+"'].apply(this, args);",
			//	Add a binding object, so we can block till ready
			"	var bindScope = arguments.callee.caller;",
			"	bindScope._misoReadyBinding = miso.readyBinderFactory();",
			"	return { then: function(cb, err){",
			"		doneFunc = bindScope._misoReadyBinding.bind(function(){",
			"			if(errResult){",
			"				err(errResult);",
			" 			} else {",
			"				cb(miso.response(successResult[0]));",
			"			}",
			"		});",
			"		if(isReady){",
			"			process.nextTick(doneFunc)",
			"		}",
			"	}};",
			"}"].join("\n");
	},

	//	Creates client action method
	makeClientAction = function(action, adaptor, apiPath){
		return ["function(args, options){",
			"	options = options || {};",
			"	var requestObj = {",
			"		method:'post', ",
			"		url: '"+apiPath + "/" + action + "',",
			"		data: args",
			"	};",
			"	for(var i in options) {if(options.hasOwnProperty(i)){",
			"		requestObj[i] = options[i];",
			"	}}",
			//	Unwrap the model, so we can post the data
			"	if(args.model) {",
			" 		args.model = getModelData(args.model);",
			"	}",
			//	For background requests, we must use a computation.
			"	if(requestObj.background) {",
			"		m.startComputation();",
			//	Create our own deferred
			"		var myDeferred = m.deferred();",
			//	When we're good and ready
			"		m.request(requestObj).then(function(){",
			"			myDeferred.resolve.apply(this, arguments);",
			"			m.endComputation();",
			"		});",
			"		return myDeferred.promise;",
			"	} else {",
			"		return m.request(requestObj);",
			"	}",
			"}"].join("\n");
	};



module.exports = function() {
	return self = {
		utils: {
			//	Returns a model
			getModel: function(type){
				return GLOBAL.misoModels["model." + type];
			},
			//	Remove any unrequired model data, and get actual values
			getModelData: function(model){
				//	Excludes isValid method
				var i, result = {};
				for(i in model) {if(model.hasOwnProperty(i)) {
					if(i !== "isValid") {
						result[i] = (typeof model[i] == "function")? model[i](): model[i];
					}
				}}

				return result;
			},
			//	Returns structure of a model
			getModelStructure: function(type){
				var model = GLOBAL.misoModels["model." + type],
					st = self.utils.getModelData(new model({}));

				for(var s in st) {
					st[s] = String;
				}

				return st;
			},
	
			//	We always use a JSON RPC 2.0 response
			//
			//	Note: this is applied in the api.js file.
			//
			response: function(result, err, id){
				var res = {
					jsonrpc: "2.0",
					id: null
				};

				//	Can't have both result and error
				//	Favour error
				if(err) {
					res.error = err;
				} else {
					res.result = result;
				}

				return res;
			}
		},


		//	Server adaptor - makes calls to the actual adaptor
		create: function(adaptor, utils) {
			var obj = {}

			for(var i in adaptor) {
				obj[i] = makeServerAction(i, adaptor);
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		},


		//	Server adaptor - makes calls to the actual adaptor
		createServer: function(adaptor, utils) {
			var obj = {}

			for(var i in adaptor) {
				obj[i] = makeServerGenerateAction(i, adaptor);
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		},


		//	Client adaptor - remote calls with a serialised model
		createClient: function(adaptor, utils, apiPath) {
			var obj = {};
			
			for(var i in adaptor) {
				obj[i] = makeClientAction(i, adaptor, apiPath);
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		}
	};
};