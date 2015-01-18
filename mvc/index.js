/*
	Main Miso MVC generator
*/
var fs			= require('fs'),
	path		= require('path'),
	_			= require('lodash'),
	routes		= {},
	m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	//templates = require('../server/mithril.templates.node.js'),
	vm = require('vm'),
	exec = require('child_process').exec,
	render = require('mithril-node-render'),

	//	Force the browserify to run?
	forceBrowserify = true,
	attachmentNode = "document.getElementById('misoAttachment')",

	//	TODO: below belongs in layout templates
	//  Puts the lotion on its...
	skin = function(content) {
		return [
			'<!doctype html>',
			'<html>',
			'<head>',
			'<link rel="stylesheet" href="/css/style.css"/>',
			'</head>',
			'<body>',
			'<header><a href="/">MISO</a> - Mithril ISOmetric Javascript</header>',
			'<div id="misoAttachment">',
			content,
			'</div>',
			//	The generated client script
			'<script src="/miso.js"></script>',
			'</body>',
			'</html>'
		].join('');
	},
	getExtension = function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	}, 
	hasMappedRouteActions = {};


//	Map the routes for the controllers
//	This generates the client side code from our routes/controller/views
module.exports = function(app, routeConfig, verbose) {

	//	Add configured routes
	if(routeConfig) {
		_.forOwn(routeConfig, function(routeObj, routePath){
			var file = routeObj.name + ".js",
				routeFile = path.join(__dirname, file),
				route = require(routeFile),
				routeStats = fs.statSync(routeFile),
				routeName = file.substr(0, file.lastIndexOf("."));

			routes[routePath] = routes[routePath] || {};

			_.assign(routes[routePath], {
				route: route,
				method: routeObj.method,
				name: routeObj.name,
				action: routeObj.action,
				path: routePath,
				file: file,
				stats: routeStats
			});

			hasMappedRouteActions[routeObj.name + "." + routeObj.action] = routes[routePath];

		});
	}

	//	Import non configured routes
	fs.readdirSync(__dirname)
		.filter(function(file) {
			//	All js files that don't start with '.' and are not index.js or main.js
			return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'mvcmain.js') && (file !== 'miso.js') && getExtension(file) == "js";
		})
		.forEach(function(file) {
			var routeFile = path.join(__dirname, file),
				route = require(routeFile),
				routeStats = fs.statSync(routeFile),
				routeName = file.substr(0, file.lastIndexOf(".")),
				routePath = "/" + routeName;

			//	Create routes using path as key
			//	TODO: different methods would change the key
			_.forOwn(route, function(idx, action){
				if(!hasMappedRouteActions[routeName + "." + action]) {
					routes[routePath] = {
						route: route,
						method: 'get',
						name: routeName,
						action: action,
						path: routePath,
						file: file,
						stats: routeStats
					};
				} else {
					verbose && console.log('skip', routeName + "." + action);
				}
			});
		});

	var routeMap = {},
		//	route, name, path, method, action
		createRoute = function(args) {
			//	Setup the route on the app
			app[args.method](args.path, function(req, res) {
				try{
					var scope = _.isFunction(args.route[args.action].controller)?
							args.route[args.action].controller(req.params):
							args.route[args.action].controller,
						mvc = args.route[args.action];
					if (!scope || !scope.onReady) {
						var result = render(_.isFunction(mvc.view)? mvc.view(scope): mvc.view, scope);
						res.end(skin(result));
					} else {
						scope.onReady.bind(function() {
							var result = render(_.isFunction(mvc.view)? mvc.view(scope): mvc.view, scope);
							res.end(skin(result));
						});
					}
				} catch(ex){
					//	TODO: Soemthing with this
					throw ex;
				}
			});

			verbose && console.log('     %s %s -> %s.%s', args.method.toUpperCase(), args.path, args.name, args.action);

			routeMap[args.path] = args;
		};

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
					"var " + route.name + " = require('../mvc/" + route.name + ".js');";
				usedRoute[route.name] = route;
				return result;
			})).join("\n"),

			//	Expose mithril - might be good for debugging...
			"if(typeof window !== 'undefined') {",
			"	window.m = m;",
			"}",

			"	",
			"m.route.mode = 'pathname';",
			"m.route("+attachmentNode+", '/', {",

			//	Add the route map for mithril here
			(ctrl.routes.map(function(route, idx) {
				return [
					"'" + route.path + "': " + route.name + "." + route.action
				].join("\n");
			})).join(",\n"),
			"});"
		].join("\n");
	};

	//	Grab our controller file names
	var routeList = [],
		mainFile = './mvc/mvcmain.js',
		output = "./client/miso.js",
		outputMap = "./client/miso.js.map.json",
		browserifyCmd = "browserify " + mainFile + " >" + output,
		//browserifyCmd = "browserify " + mainFile + " -d -p [minifyify --map /miso.js.map.json --output "+outputMap+"] >" + output,

		mainFileModified = fs.existsSync(mainFile)? fs.statSync(mainFile).mtime: new Date(1970,0,1),
		lastRouteModified = new Date(1970,0,1);

	//	Generate list of routes
	_.forOwn(routes, function(route, idx){
		//	Check controller timestamp
		lastRouteModified = (lastRouteModified > route.stats.mtime)?
			lastRouteModified: 
		 	route.stats.mtime;

		routeList.push(route);
		createRoute(route);
	});

	//	Output our main JS file for browserify
	fs.writeFileSync(mainFile, render(view({
		routes: routeList
	})));

	//	Run browserify when either a controller or view has changed.
	//	We use exec to run it - this gives us a little more flexibility

	if(forceBrowserify || lastRouteModified > mainFileModified) {
		exec(browserifyCmd, function (error, stdout, stderr) {
			if(error) {
				throw error
			}
		});
	}
};