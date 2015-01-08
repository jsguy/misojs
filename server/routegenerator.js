//	Create JSON API from controller pathes

var fs = require('fs');

module.exports = function(routes){
	//console.log(controllers.split("\\n").join("\n").split("\\t").join("\t"));
	console.log('generator', routes);

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
		"//	Get a parameter",
		"getParam = function(key, params){",
		"	return m.route.param(key);",
		"};",
		"m.route.mode = \"pathname\";",
		"m.route(document.body, '/', "
	].join("\n");

	cr += JSON.stringify(routes)
		.split("\\n").join("\n")
		.split("\\t").join("\t")
		.split("\"controller\":\"fu").join("\n\t\"controller\": fu")
		.split("}\",\"view\":\"fu").join("},\n\t\"view\":fu")
		.split("})\"}").join("}}")
		.split("\\\"").join("\"");



	cr += ");\n";

	fs.writeFileSync("client/clientroutes.js", cr);
};