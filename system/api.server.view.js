/*	Miso main javascript file generator

	* Is used by browserify to create /miso.js

	TODO:

	* Ability to configure required libs
*/
var m = require('mithril');

module.exports.index = function(ctrl){
	return [
		"/* NOTE: This is a generated file, please do not modify it, your changes will be lost */",
		"var utils = require('../system/adaptor/adaptor.js')().utils;",
		"var miso = require('../server/miso.util.js');",
		"var myAdaptor = require('../system/adaptor/" + ctrl.adaptor + "/" + ctrl.adaptor + ".adaptor.js')(utils);",
		"module.exports = function(m, scope){",
		"	return {",
		//	Grab our api action methods
		(Object.keys(ctrl.api).map(function(key) {
			return "'" + key + "': " + ctrl.api[key];
		})).join(",\n"),
		"	};",
		"};"
	].join("\n");
};