var fs			= require('fs'),
	path		= require('path'),
	_			= require('lodash'),
	routeConfig	= require('../cfg/routes.cfg.json'),
	routes		= {},
	m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	//templates = require('../server/mithril.templates.node.js'),
	vm = require('vm'),
	exec = require('child_process').exec,
	render = require('mithril-node-render'),
	//  Render a view
	//  The controller is always exposed as "ctrl"
	renderView = function(view, ctrl){
		var script = vm.createScript(view, 'theview.js');
		sugartags.ctrl = ctrl;
		sugartags.m = m;
		return render(script.runInNewContext(sugartags), ctrl);
	};
	//	TODO: below belongs in layout templates
	//  Puts the lotion on its...
	skin = function(content) {
		return [
			'<!doctype html>',
			'<html>',
			'<head>',
			'<style>html,body{ font-family: sans-serif }</style>',
			'</head>',
			'<body>',
			content,
			//	The generated client script
			'<script src="/mvcmiso.js"></script>',
			'</body>',
			'</html>'
		].join('');
	},
	getExtension = function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	};


//	Import all routes
fs.readdirSync(__dirname)
	.filter(function(file) {
		//	All js files that don't start with '.' and are not index.js or main.js
		return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'mvcmain.js') && (file !== 'mvcmiso.js') && getExtension(file) == "js";
	})
	.forEach(function(file) {
		var routeFile = path.join(__dirname, file),
			routeStats = fs.statSync(routeFile),
			route = require(routeFile),
			routeName = file.substr(0, file.lastIndexOf("."));
		routes[routeName] = {
			method: 'get',
			action: 'index',
			name: routeName,
			path: "/" + routeName,
			route: route,
			file: file,
			stats: routeStats
		};
	});

//	Map the routes for the controllers
module.exports = function(app, verbose) {

	//var createRoute = function(route, name, path, method, action, template) {
	var routeMap = {},
		createRoute = function(args) {
			console.log('createRoute', args);
			//	Setup the route on the app
			app[args.method](args.path, function(req, res) {


				// var	scope = args.route[args.action](req.params);
				// if (!scope || !scope.onReady) {
				// 	return res.end(skin(renderView(args.view, scope)));
				// }
				// scope.onReady.bind(function() {
				// 	res.end(skin(renderView(args.view, scope)));
				// });

				var	scope = args.route[args.action].controller((req.params));
				if (!scope || !scope.onReady) {
					return res.end(skin(renderView(args.view, scope)));
				}
				scope.onReady.bind(function() {
					res.end(skin(renderView(scope.view, scope)));
				});



			});

			routeMap[args.path] = args;
		};




/*
	This generates the client side code from our routes/controller/views
*/


	//	TODO: 
	//	
	//	* Might want to externalise this?
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
					"var " + route.name + " = require('../mvc/" + route.name + "');";
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
					"'" + route.path + "': " + route.name
				].join("\n");
			})).join(",\n"),
			"});"
		].join("\n");
	};

	//	Grab our controller file names
	var routeList = [],
		mainFile = './mvc/mvcmain.js',
		output = "./mvc/mvcmiso.js",
		outputMap = "./mvc/mvcmiso.js.map.json",
		browserifyCmd = "browserify " + mainFile + " >" + output,
		//browserifyCmd = "browserify " + mainFile + " -d -p [minifyify --map /miso.js.map.json --output "+outputMap+"] >" + output,

//
		mainFileModified = fs.existsSync(mainFile)? fs.statSync(mainFile).mtime: new Date(1970,0,1),
		lastRouteModified = new Date(1970,0,1);

	//	Generate list of routes
	_.forOwn(routes, function(route, idx){
		routeList.push(route);

		//console.log(route);

		//	Check controller timestamp
		lastRouteModified = (lastRouteModified > route.stats.mtime)?
			lastRouteModified: 
		 	route.stats.mtime;

		createRoute(route);

	});

	//	Output our main JS file for browserify
	fs.writeFileSync(mainFile, render(view({
		routes: routeList
	})));

	//	Run browserify if we need to do so: only when 
	//	either a controller or view has changed.
	//if(lastRouteModified > mainFileModified) {
		//	We use exec to run it - this gives us a little more flexibility
		exec(browserifyCmd, function (error, stdout, stderr) {
			if(error) {
				throw error
			}
		});
	//}






};