/*	Miso main javascript file generator

	* Is used by browserify to create /miso.js

	TODO:

	* Ability to configure required libs
*/
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m);

module.exports.index = function(ctrl){
	var usedRoute = {};
	with(sugartags) {
		return [
			"/* NOTE: This is a generated file, please do not modify it, your changes will be lost */",
			"var m = require('mithril');",
			
			//	Required libs
			"var sugartags = require('mithril.sugartags')(m);",
			"var bindings = require('../server/mithril.bindings.node.js')(m);",
			"var animate = require('../client/js/mithril.animate.js')(m);",
			"var restrictions = require('../server/miso.permissions.js');",
			"var auth = require('../system/auth.js');",
			

			//	Setup a restrict method
			//	TODO: Need user roles here, then copy index.js
			//	functionality.
			"var restrict = function(route, actionName){",

//			"	console.log('route.authenticate', route.authenticate);",

			//	If authentication is turned on, we can use permissions
			"	if(route.authenticate){",

			//	Hardcoded user for now
			"		var oldController = route.controller, user = {", 
			"			name: 'you',",
			"			roles: ['admin']",
			"		}, isLoggedIn = false;",
			"		route.controller = function() {",

			//	Hardcoded login path for now
			"			if(!isLoggedIn) {",
			"				console.log('redirect to login');",
			"				return m.route('/login?url=' + m.route() );",
			"			}",

			"			console.log(restrictObj.app[actionName]);",

			"			if(!restrictions(restrictObj.app[actionName], user)){",
							//	ACCESS DENIED - show login page?
			//"				return res.end(skin(["ACCESS DENIED"],{}));",
			"				console.log('ACCESS DENIED');",
			"			}",



			"			console.log('auth here...', actionName);",
			"			oldController.apply(this, arguments);",

			"		};",

			"	}",

			"	return route;",

			"};",

//			"var restrictObj = (" + ctrl.restrictions + ");",
			"var restrictObj = (" + ctrl.restrictions + ");",

			//	All our route files
			(ctrl.routes.map(function(route, idx) {
				var result = usedRoute[route.name]? "" :
					"var " + route.name + " = require('../mvc/" + route.name + ".js');";
				usedRoute[route.name] = route;
				return result;
			})).join("\n"),

			//	Expose mithril - might be good for debugging...
			//	TODO: Can probably remove this...?
			"if(typeof window !== 'undefined') {",
			"	window.m = m;",
			"}",

			"	",
			"m.route.mode = 'pathname';",
			"m.route("+ctrl.attachmentNodeSelector+", '/', {",

			//	Add the route map for mithril here
			(ctrl.routes.map(function(route, idx) {
				return [
					"'" + route.path + "': restrict(" + route.name + "." + route.action + ", '" + route.name + "." + route.action + "')"
				].join("\n");
			})).join(",\n"),
			"});"
		].join("\n");
	};
};