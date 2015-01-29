/*	Miso main javascript file generator

	* Is used by browserify to create /miso.js

	TODO:

	* Ability to configure required libs
*/
var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

module.exports.index = function(ctrl){
	var usedRoute = {};
	with(sugartags) {
		return [
			"/* NOTE: This is a generated file, please do not modify it, your changes will be lost */",
			// //	Required libs
			"var Promiz = require('promiz');",

			// "var sugartags = require('../server/mithril.sugartags.node.js')(m);",
			// "var bindings = require('../server/mithril.bindings.node.js')(m);",
			// "var store = require('../server/store.js');",
			"module.exports = function(m){",
			"	return {",
			//	Grab our api action methods
			(Object.keys(ctrl.api).map(function(key) {
				//return "'" + key + "': " + ctrl.api[key].toString();
				return "'" + key + "': " + ctrl.api[key];
			})).join(",\n"),

			"	};",

			"};"
		].join("\n");
	};
};