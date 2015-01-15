//	This generates the client side code from our routes/controller/views
//	TODO: 
//		* Use templates
//		* Allow for lazy loading some routes (configure in cfg/routes.json)

var fs = require('fs'),
	_ = require('lodash'),
	exec = require('child_process').exec;

module.exports = function(routes){
	var cr = [
		"//  Fake global storage for now..",
		"var store = {",
		"	load: function load(type, id) {",
		"		if (!type) {",
		"			throw new Error('no type provided to load model');",
		"		}",
		"		if (!id) {",
		"			throw new Error('no id provided to load model');",
		"		}",
		"",
		"		return m.request({",
		"			method: 'GET',",
		"			//url: 'api/' + type + '/' + id),",
		"			url: '/user.json'",
		"		});",
		"	}",
		"},",

		"Signal = function(){",
		"	var onceBindings = [];",
		"	return {",
		"		addOnce: function(fn){",
		"			onceBindings.push(fn);",
		"		},",
		"		dispatch: function(){",
		"			for(var i = 0; i < onceBindings.length; i += 1) {",
		"				onceBindings[i]();",
		"			}",
		"			onceBindings = [];",
		"		}",
		"	};",
		"};",


		"//	Get a parameter",
		"getParam = function(key, params){",
		"	return m.route.param(key);",
		"};",
		"m.route.mode = \"pathname\";",
		"m.route(document.body, '/', "
	].join("\n");


	//	Grab our controller file names
	var usedControllers = {},
		cFiles = [];

	_.forOwn(routes, function(route, idx){
		if(!usedControllers[route.name]) {
			cFiles.push("./c/" + route.file);
			usedControllers[route.name] = route.name;
		}
	})

	//	Run browserify
	//	TODO: Check if we need to do so - compare file dates to the output.
	var output = "./client/miso.js",
		//cmd = "browserify -u mithril " + cFiles.join(" ") + ">" + output;
		//cmd = "browserify " + cFiles.join(" ") + ">" + output;
		cmd = "browserify --igv m ./c/main.js >" + output;

	exec(cmd, function (error, stdout, stderr) {
	  // output is in stdout
	  console.log('bify', arguments);
	});
};