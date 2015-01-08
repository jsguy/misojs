/*
	Note: this is a singleton to load all controllers and map their routes on startup of app.

	Here we generate routes based on supported action names, auto-mapped actions are:

	Action 		Method 		URL 						Description

	index 		GET 		[controller] + 's'			List the items
	edit 		GET 		[controller]/[id]			Display a form to edit the item
	delete 		POST 		[controller]/[id]/delete 	Deletes an item
	new 		GET 		[controller]/new 			Display a form to add a new item
	create 		POST 		[controller] 				Creates a new item
	update 		POST 		[controller]/[id] 			Updates an item

	Note: We are using RESTful-style URLs, but only GET and POST here,
		we could obviously add PUT, DELETE and so on, but we're keeping 
		this basic for now. This is because some browsers, eg: IE7/IE8
		do not properly support PUT and DELETE, so it's safer to exclude
		those methods. I know this is opinionated behaviour, but you can
		always add a custom route if you really want it.

	Ref:
	http://stackoverflow.com/questions/2456820/problem-with-jquery-ajax-with-delete-method-in-ie

	Note: if you want custom routes, add a config object on the route, for example:

		module.exports.config = {
			routes: [
				{ path: "/login": method: "post", middle: null, action: "authenticateUser" }
			]
		}

	Would expose the login method to be POSTed, with no middleware.

	Action naming convention refs:
	http://mvccontrib.codeplex.com/wikipage?title=SimplyRestfulRouting&referringTitle=Documentation
	http://stephenwalther.com/archive/2008/06/27/asp-net-mvc-tip-11-use-standard-controller-action-names
*/

var fs			= require('fs'),
	path		= require('path'),
	_			= require('lodash'),
	routeConfig	= require('../cfg/routes.json'),
	routes		= {},
	m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	vm = require('vm'),
	getView = function(fileName){
		return fs.readFileSync("./v/" + fileName, "utf8");
	},
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

			'</head>',
			'<body>',
			content,
			
			//	Add any client JS here!
			'<script src="/mithril.js"></script>',
			'<script src="/mithril.animate.js"></script>',
			'<script src="/mithril.sugartags.js"></script>',
			//'<script src="/mithril.bindings.js"></script>',
			//	Clientside "routes"

			'<script src="/clientroutes.js"></script>',

			'</body>',
			'</html>'
		].join('');
	},
	getExtension = function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	},

	//	Passport route middleware to ensure user is authenticated.
	//	Use this route middleware on any resource that needs to be protected.  If
	//	the request is authenticated (typically via a persistent login session),
	//	the request will proceed.  Otherwise, the user will be redirected to the
	//	login page.
	//	Note: see authenticate.js for authentication implementation
	auth = function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		req.qmessage("error", "Please login to continue");
		//	Only allow smart redirects on GETs
		if(req.method == "GET") {
			res.redirect('/login?from=' + encodeURIComponent(req.url));
		} else {
			res.redirect('/login');
		}
	},

	//	Check if the list of routes has the specified action
	hasRouteAction = function(action, routes){
		var hasAction = false;
		if(routes && routes.length > 0) {
			_.forOwn(routes, function(r) {
				if(r.action == action) {
					hasAction = true;
					return false;
				}
			});
		}
		return hasAction;
	};

//	Import all routes
fs.readdirSync(__dirname)
	.filter(function(file) {
		//	All js files that don't start with '.' and are not index.js
		return (file.indexOf('.') !== 0) && (file !== 'index.js') && getExtension(file) == "js";
	})
	.forEach(function(file) {
		var routeFile = require(path.join(__dirname, file)),
			routeName = file.substr(0, file.lastIndexOf("."));
		routes[routeName] = routeFile;
	});

//	Map the routes for the controllers
module.exports = function(app, verbose) {

	//var createRoute = function(route, name, path, method, action, template) {
	var routeMap = {},
		createRoute = function(args) {
			//var view = getView(args.template? args.template: args.name + "." + args.action + ".js");
			var myView = getView(args.template? args.template: args.name + "." + args.action + ".js");
			//	Setup the route on the app
			app[args.method](args.path, function(req, res) {
				//	Assume if no view, it is named [controller name][action].js
				var view = myView = getView(args.template? args.template: args.name + "." + args.action + ".js"),
					scope = args.route[args.action](req.params);
				if (!scope || !scope.onReady) {
					return res.end(skin(renderView(view, scope)));
				}
				scope.onReady.addOnce(function() {
					res.end(skin(renderView(view, scope)));
				});
			});

			//	Idea: simply inject string representations of functions
			//	for the controller and views
			routeMap[args.path] = {
				controller: args.route[args.action].toString(),
				view: "function(ctrl){ return " + myView + " })"
			};
		};

	_.forOwn(routes, function(route, name){
		var cfg = {
			secure: true,
			name: name,
			prefix: ""
		}, path, method;

		//	Add configured routes
		if(routeConfig[name]) {
			cfg.routes = routeConfig[name];
		}

		//	Any configuration options
		if (route.config) {
			cfg = _.extend(cfg, route.config);
		}

		verbose && console.log('ROUTE', cfg.name);

		//	Note: The list is pluralised with an s always, so name your 
		//	controller accordingly, eg: don't name it 'users', it should be 'user'
		for (var action in route) {
			//	Skip "reserved" exports
			if (~['config'].indexOf(action)) continue;
			// route exports
			switch (action) {
				//	Display an index page with a list of items
				case 'index':
					method = 'get';
					path = '/' + cfg.name + 's';
					break;
				//	An item to edit
				case 'edit':
					method = 'get';
					path = '/' + cfg.name + '/:' + cfg.name + '_id';
					break;
				//	Delete an item
				case 'delete':
					method = 'post';
					path = '/' + cfg.name + '/:' + cfg.name + '_id/delete';
					break;
				case 'new':
					method = 'get';
					path = '/' + cfg.name + '/new';
					break;
				//	Create an item
				case 'create':
					method = 'post';
					path = '/' + cfg.name;
					break;
				//	Update an item
				case 'update':
					method = 'post';
					path = '/' + cfg.name + '/:' + cfg.name + '_id';
					break;
				default:
					//	If unmapped action, throw error
					if(!hasRouteAction(action, cfg.routes? cfg.routes: [])) {
						throw new Error('Unmapped route: ' + name + '.' + action + ' please map it or make it a private function');
					} else {
						continue;
					}
			}

			path = cfg.prefix + path;

			//	Setup route, optionally secured
			createRoute({
				route: route,
				name: name,
				path: path,
				middleware: cfg.secure? auth: [],
				method: method,
				action: action
			});

			verbose && console.log('     %s %s -> %s', method.toUpperCase(), path, action);
		}

		//	Custom route mappings
		if(cfg.routes) {
			_.forOwn(cfg.routes, function(r) {
				path = cfg.prefix + r.path;
				verbose && console.log('     %s %s -> %s', r.method.toUpperCase(), path, r.action);
				createRoute({
					route: route,
					name: name,
					path: path,
					method: r.method,
					action: r.action,
					view: r.view
				});
			});
		}
	});
	return routeMap;
};