/*
	The concept for the apis is that we can create an endpoint for
	any action, with arbitrary arguments, and the framework will
	pass those arguments to the same serverside action

	ie: we are not opinionated of how it works, beyond how 
		to call methods, so that we can override them.
*/
var fs = require('fs'),
	miso = require('../../modules/miso.util.js'),
	_ = require('lodash'),
	Promiz = require('promiz'),

	//	Creates actions for use on the server
	makeServerAction = function(action, api){
		return function(){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = api[action];

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(api, args);
			});
		};
	},


	//	Creates actions for use in the server generated code
	//	Note: cannot use a real promise here, as mithril breaks...
	makeServerGenerateAction = function(action, api){
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
			"	myApi['"+action+"'].apply(this, args);",
			//	Add a binding object, so we can block till ready
			"	var bindScope = arguments.callee.caller;",
			"	bindScope._misoReadyBinding = miso.readyBinderFactory();",
			"	return { then: function(cb, err){",
      		"   var deferred = m.deferred();",
			"		doneFunc = bindScope._misoReadyBinding.bind(function(){",
			"			if(errResult){",
			"				if(err) {",
			" 					err(errResult);",
			" 				} else {",
			" 					throw JSON.stringify(errResult, null, 4);",
			" 				}",
			" 			} else {",
			"				cb(miso.response(successResult[0]));",
      		"       deferred.resolve(miso.response(successResult[0]));",
			"			}",
			"		});",
			"		if(isReady){",
			"			process.nextTick(doneFunc)",
			"		}",
      		"   	return deferred.promise;",
			"	}};",
			"}"].join("\n");
	},

	//	Creates client action method
	makeClientAction = function(action, api, apiPath){
		return ["function(args, options){",
			"	args = args || {};",
			"	options = options || {};",
			"	var requestObj = {",
			"			method:'post', ",
			"			url: apiClientPath + '"+apiPath + "/" + action + "',",
			"			data: args",
			"		},",
			"		rootNode = document.documentElement || document.body;",
			"	for(var i in options) {if(options.hasOwnProperty(i)){",
			"		requestObj[i] = options[i];",
			"	}}",
			//	Unwrap the model, so we can post the data
			"	if(args.model) {",
			" 		args.model = getModelData(args.model);",
			"	}",
			//	Create our own deferred, so we get control of the request
			//	Add loader class
			"	rootNode.className += ' loading';",
			//	Create deferred
			"	var myDeferred = m.deferred();",
			"	m.request(requestObj).then(function(){",
			//	Turn off loader class name
			"		rootNode.className = rootNode.className.split(' loading').join('');",
			"		myDeferred.resolve.apply(this, arguments);",
			//	Need this because of the background request
			"		if(requestObj.background){",
			"			m.redraw(true);",
			"		}",
			"	});",
			"	return myDeferred.promise;",
			"}"].join("\n");
	};



module.exports = function() {
	return self = {
		utils: {
			//	Returns a model
			getModel: function(type){
				return GLOBAL.misoModels["model." + type];
			},


// var stringifyObjectNumbers = function(obj){
//     if(typeof obj === "object" && obj !== null) {
//         for(var i in obj) {if(obj.hasOwnProperty(i)) {
//             obj[i] = stringifyObjectNumbers(obj[i]);
//         }}
//         return obj;
//     } else if(Object.prototype.toString.call(obj) === '[object Array]') {
//         for(var i = 0; i < obj.length; i += 1) {
//             obj[i] = stringifyObjectNumbers(obj[i]);
//         }
//         return obj;
//     } else if(!isNaN(obj)) {
//         return "" + obj;
//     }
//     return obj;
// };


			//	Remove any unrequired model data, and get actual values
			rGetModelData: function(obj){
				console.log('rGet --------------------------------------');
				if(Object.prototype.toString.call(obj) === '[object Array]') {
					console.log('rGet array');
					var result = [];
					for(var i = 0; i < obj.length; i += 1) {
						console.log('check array', i);
						result[i] = self.utils.rGetModelData(obj[i]);
					}
					return result;
				} else if(typeof obj === "object" && obj !== null) {
					console.log('rGet obj', obj);
					var result = {};
					for(var i in obj) {if(i !== "isValid" && obj.hasOwnProperty(i)) {
						console.log('check', i);
						result[i] = self.utils.rGetModelData(obj[i]);
					}}
					return result;
				} else if(typeof obj == "function") {
					console.log('rGet function');
					return obj();
				}
				console.log('rGet nothing');
				return obj;
			},



			//	Remove any unrequired model data, and get actual values
			getModelData: function(model){
				//	Excludes isValid method
				var i, result = {};
				for(i in model) {if(model.hasOwnProperty(i)) {
					if(i !== "isValid" && i !== "__structure") {
						//result[i] = (typeof model[i] == "function")? model[i](): model[i];
						if(typeof model[i] == "function") {
							result[i] = model[i]();
							//	Remove _id if it is undefined
							if(i == "_id" && typeof result[i] == "undefined") {
								delete result[i];
							}
						} else {
							result[i] = model[i];
						}
					}
				}}

				return result;
			},
			//	Returns structure of a model
			getModelStructure: function(type){
				var model = GLOBAL.misoModels["model." + type],
					structure = (new model({})).__structure,
					st = {},
					s, t;

				if(st) {
					for(s in structure) {
						t = structure[s];
						st[s] = (
							t == "String"? String:
							t == "Number"? Number:
							t == "Date"? Date:
							//t == "Buffer"? Buffer:
							t == "Boolean"? Boolean:
							//t == "Mixed"? Mixed:
							//t == "Objectid"? Objectid:
							t == "Array"? Array:
							String
						);

					}
				}

				return st;
			},
	
			//	Use mis response type - this is applied in the api_endpoint.js file.
			response: miso.response
		},

		//	Server api creates actions
		create: function(api, utils) {
			var obj = {}

			for(var i in api) {
				obj[i] = makeServerAction(i, api);
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		},


		//	Server api - makes calls to the actual api
		createServer: function(api, utils) {
			var obj = {};

			for(var i in api) {
				//	Direct access to anything starting with an _
				if(i.indexOf("_") !== 0) {
					obj[i] = makeServerGenerateAction(i, api);
				} else {
					obj[i] = "myApi['"+i+"']";//api[i];
				}
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		},


		//	Client api - remote calls with a serialised model
		createClient: function(api, utils, apiPath) {
			var obj = {};
			
			for(var i in api) {
				//	Exclude anything that starts with an "_"
				if(i.indexOf("_") !== 0) {
					obj[i] = makeClientAction(i, api, apiPath);
				}
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		}
	};
};
