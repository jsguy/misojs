/*
	The concept for the apis is that we can create an endpoint for
	any action, with arbitrary arguments, and the framework will
	pass those arguments to the same serverside action

	ie: we are not opinionated of how it works, beyond how 
		to call methods, so that we can override them.

	TODO: Figure out how to meaningfully debug this?

*/

//	TODO: Authentication goes in here... I think.

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
		var authList = api.authenticate,
			shallAuth = false;
		authList = typeof authList == 'object'? authList: [authList];
		_.each(authList, function(auth){
			if(auth == action) {
				shallAuth = true;
				return false;
			}
		});

		//	TODO: Apply authentication here.
		//	We simply need to check misoGlobal.isLoggedIn
		if(api.authenticate) {
			//console.log('auth', api.authenticate, shallAuth);
		}


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

			(shallAuth? "": ""
				// "console.log('auth "+action+"');": 
				// "console.log('no auth "+action+"');"
			),

			"	myApi['"+action+"'].apply(this, args);",


			//	Add a binding object, so we can block till ready
			"	var bindScope = arguments.callee.caller;",
			"	bindScope._misoReadyBinding = miso.readyBinderFactory();",
			"	return { then: function(cb, err){",
      		"   var deferred = m.deferred();",
			"		doneFunc = bindScope._misoReadyBinding.bind(function(){",
			"			if(errResult){",
			"				err(errResult);",
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
			"			url: '"+apiPath + "/" + action + "',",
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
				obj[i] = makeServerGenerateAction(i, api);
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
				obj[i] = makeClientAction(i, api, apiPath);
			}

			return {
				api: obj,
				utils: _.assign({}, module.exports.utils, utils || {})
			};
		}
	};
};
