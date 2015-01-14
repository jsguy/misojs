//	This generates the client side code from our routes/controller/views
//	TODO: 
//		* Use templates
//		* Allow for lazy loading some routes (configure in cfg/routes.json)

var fs = require('fs'),
	_ = require('lodash'),
	browserify = require('browserify'),
	b = browserify({

		//	Test separate client/server store
		browser: {
			"./server/store.js": "./client/store.js"
		},


		standalone: "mylib"
		//	TODO: Way to set browser version of a lib - maybe transforms?
		// browser: {
		// 	"user.js": "" 
		// }
	});

// b.add('./browser/main.js');
// b.bundle().pipe(process.stdout);


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

	//console.log('routes', routes);

	// cr += JSON.stringify(routes)
	// 	.split("\\n").join("\n")
	// 	.split("\\t").join("\t")
	// 	.split("\"controller\":\"fu").join("\n\t\"controller\": fu")
	// 	.split("}\",\"view\":\"fu").join("},\n\t\"view\":fu")
	// 	.split("})\"}").join("}}")
	// 	.split("\\\"").join("\"");


	cr = "";


	// b.add("./server/store.js", {
	// 	browser: 		
	// });

	var usedControllers = {};

	_.forOwn(routes, function(route, idx){
		if(!usedControllers[route.name]) {
			console.log('rrrrr', route.name);
			b.add("./c/" + route.file);
			usedControllers[route.name] = route.name;
		}
	})

	b.bundle(function(e, b){
		cr += b.toString('utf8');
		fs.writeFileSync("client/newclientroutes.js", cr);
	});


// b.add('./browser/main.js');
// b.bundle().pipe(process.stdout);


	// cr += ");\n";
	// fs.writeFileSync("client/newclientroutes.js", cr);
};