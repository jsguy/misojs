/*	Miso main javascript file generator

	* Is used by browserify to create /miso.js

	TODO:

	* Ability to configure required libs
*/
var fs = require('fs'),
	m = require('mithril'),
	sugartags = require('mithril.sugartags')(m);

module.exports.index = function(ctrl){
	var usedRoute = {},
		serverConfig = ctrl.serverConfig;

	with(sugartags) {
		return [
			"/* NOTE: This is a generated file, please do not modify it, your changes will be lost */",
			"var m = require('mithril');",
			
			//	Required libs
			"var sugartags = require('mithril.sugartags')(m);",
			"var bindings = require('mithril.bindings')(m);",
			"var animate = require('../public/js/mithril.animate.js')(m);",
			
			//	Grab the header so we can re-render
			"var layout = require('"+serverConfig.layout+"');",

			//	Setup a restrict method
			//	TODO: Need user roles here, then copy index.js
			//	functionality.
			"var restrict = function(route, actionName){",

			//	Only include this if authentication is enabled
			//	TODO: Move this out and make configurable
			(serverConfig.authentication.enabled? [

				//	If authentication is turned on, we can use permissions
				"	if(typeof route.authenticate !== 'undefined'? route.authenticate: "+serverConfig.all+"){",

				"console.log('secured route', route, actionName);",

				//	Hardcoded user for now
				//	TODO: need real user for permissions!
				"		var oldController = route.controller,",
				" 			user = {", 
				"				name: 'you',",
				"				roles: ['admin']",
				"			};",
				"		route.controller = function() {",
				//	We trust the isLoggedIn attribute - the server
				//	will guard against non-logged in data.


				"			var isLoggedIn = misoGlobal.isLoggedIn;",

							//	Hardcoded login path for now
				"			if(!isLoggedIn) {",
				//"				return m.route('/login?url=' + m.route() );",

				"				return m.route('"+serverConfig.authentication.loginUrlPattern+"'.replace('[ORIGINALURL]', m.route()));",

				"			} else {",
				"				console.log('You are logged in!');",
				"			}",

				//	Apply permissions
				//	TODO: We need to add a method to do this, as the 
				//	permissions might not exist, etc...

				"console.log('permissionObj', permissionObj);",

				//	Use trust, so && is rendered correctly
				m.trust("	if(permissionObj && permissionObj.app && permissionObj.app[actionName] && !permissions(permissionObj.app[actionName], user)){"),
				//	ACCESS DENIED - user can only get here if they hack the url or
				//	if we accidentally let them click a link to a restricted area
				"				console.log('ACCESS DENIED');",
				"				return false;",
				"			}",

				"			oldController.apply(this, arguments);",

				"		};",

				"	}"

			]: ""),

			"	return route;",

			"},",

			//	Inject the parameters
			"injectParams = function(route){",
			"	var oldController = route.controller;",
			"	route.controller = function() {",
			"		var args = [].slice.apply(arguments);",
			"		args.unshift({params: m.route.param()});",
			"		oldController.apply(this, args);",
			"	};",
			"	return route;",
			"},",

//			"var permissionObj = (" + ctrl.permissions + ");",
			//"var permissionObj = (" + (ctrl.permissions? JSON.stringify(ctrl.restrictions): "{}") + ");",
			"permissionObj = {};",

			//	Ensure we always have misoGlobal
			"var misoGlobal = misoGlobal || {};",

			"if(typeof window !== \"undefined\"){",
			"	window.misoGlobal = misoGlobal;",
			"}",

			//	All our route files
			(ctrl.routes.map(function(route, idx) {
				var result = usedRoute[route.name]? "" :
					"var " + route.name + " = require('../mvc/" + route.name + ".js');";
				usedRoute[route.name] = route;
				return result;
			})).join("\n"),

			//	Expose mithril - this is useful for client debugging.
			"if(typeof window !== 'undefined') {",
			"	window.m = m;",
			"}",

			"	",
			"m.route.mode = 'pathname';",

			//	Wait for cordova
			(serverConfig.cordova?
				// dispatch deviceready event eventually (for local testing)
				["(function(doc){",
				"	var eName = 'deviceready',",
				"		event = new Event(eName),",
				"		eventFired = false;",
				"",
				"	doc.addEventListener(eName, function(){",
				"		eventFired = true;",
				"	});",
				"",
				"	setTimeout(function(){",
				"		if(!eventFired) {",
				"			doc.dispatchEvent(event);",
				"		}",
				"	}, 1000);",
				"}(typeof document !== 'undefined'? document: {",
				"	addEventListener: function(){},",
				"	dispatchEvent: function(){}",
				"}))",
				"document.addEventListener('deviceready', function(){"].join("\n"):
				""),

			//	Any layout add-ins, use m.trust to allow encoded chars to work as expected
			m.trust((ctrl.serverConfig.layoutComponents? ctrl.serverConfig.layoutComponents.map(function(file, idx) {
				return fs.readFileSync(file, {encoding: "utf8"});
			}): []).join("\n")),

			//	Setup our routes
			"m.route("+ctrl.attachmentNodeSelector+", '/', {",
				//	Add the route map
				(ctrl.routes.map(function(route, idx) {
					return [
						"'" + route.path + "': restrict(injectParams(" + route.name + "." + route.action + "), '" + route.name + "." + route.action + "')"
					].join("\n");
				})).join(",\n"),
			"});",

			//	Global function to render the header
			"misoGlobal.renderHeader = function(obj){",
			"	var headerNode = document.getElementById('misoHeaderNode');",
			"	if(headerNode){",
			"		m.render(document.getElementById('misoHeaderNode'), layout.headerContent? layout.headerContent({misoGlobal: obj || misoGlobal}): '');",
			"	}",
			"};",

			"misoGlobal.renderHeader();",

			//	Wait for cordova
			(serverConfig.cordova?
				"}, false);":
				"")
		];
	};
};