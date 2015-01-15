//	This generates the client side code from our routes/controller/views
//	TODO: 
//		* Allow for lazy loading some routes (configure in cfg/routes.json)

var fs = require('fs'),
	_ = require('lodash'),
	m = require('mithril'),
	render = require('mithril-node-render'),
	exec = require('child_process').exec;

module.exports = function(routes){

	//	TODO: 
	//	
	//	* Might want to externalise this
	//	* Add ability to configure things, add/remove required libs, etc.
	//	
	var view = function(ctrl) {
		var usedRoute = {};
		return [
			"/* NOTE: This is a generated file, please do not modify, your changes will be lost */",
			"var m = require('mithril');",
			
			//	Required libs
			"var sugartags = require('../server/mithril.sugartags.node.js')(m);",
			"var bindings = require('../server/mithril.bindings.node.js')(m);",
			"var store = require('../server/store.js');",
			
			//	All our route files
			(ctrl.routes.map(function(route, idx) {
				var result = usedRoute[route.name]? "" :
					"var " + route.name + " = require('../c/" + route.name + "');";
				usedRoute[route.name] = route;
				return result;
			})).join("\n"),

			//	Expose mithril - might be good for debugging...
			"if(typeof window !== 'undefined') {",
			"	window.m = m;",
			"}",

			"	",
			"m.route.mode = 'pathname';",
			"m.route(document.body, '/', {",

			//	Add the route map for mithril here
			(ctrl.routes.map(function(route, idx) {
				return [
					"'" + route.path + "': {",
					"	controller: " + route.name + "." + route.action + ",",
					"	view: function(ctrl){",
					"		with(sugartags) {",
					"			return 	" + route.view,
					"		}",
					"	}",
					"}"
				].join("\n");
			})).join(",\n"),
			"});"
		].join("\n");
	};

	//	Grab our controller file names
	var routeList = [],
		mainFile = './c/main.js',
		output = "./client/miso.js",
		browserifyCmd = "browserify --igv m " + mainFile + " >" + output,
		mainFileModified = fs.statSync(mainFile).mtime,
		lastRouteModified = new Date(1970,0,1);

	//	Generate list of routes
	_.forOwn(routes, function(route, idx){
		routeList.push(route);

		lastRouteModified = (lastRouteModified > route.stats.mtime)?
			lastRouteModified: 
		 	route.stats.mtime;

		lastRouteModified = (lastRouteModified > route.viewStats.mtime)?
			lastRouteModified: 
		 	route.viewStats.mtime;
	});

	//	Output our main JS file for browserify
	fs.writeFileSync(mainFile, render(view({
		routes: routeList
	})));

	//	Run browserify, if we need to do so - compare file dates to the output.
	if(lastRouteModified > mainFileModified) {
		exec(browserifyCmd, function (error, stdout, stderr) {
			if(error) {
				throw error
			}
		});
	}
};