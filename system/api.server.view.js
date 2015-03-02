/*	Miso main javascript file generator

	* Is used by browserify to create /miso.js

	TODO:

	* Ability to configure required libs
*/
var m = require('mithril');

module.exports.index = function(ctrl){
	return [
		"/* NOTE: This is a generated file, please do not modify it, your changes will be lost */",
		"var utils = require('"+ctrl.adaptorPath+"adaptor.js')().utils;",
		"var miso = require('../../../server/miso.util.js');",
		"var myAdaptor = require('../" + ctrl.adaptor + "/" + ctrl.adaptor + ".adaptor.js')(utils);",
		"module.exports = function(m){",
		"	return {",
		//	Grab our api action methods
		(Object.keys(ctrl.api).map(function(key) {
			return "'" + key + "': " + ctrl.api[key];
		})).join(",\n"),
		"	};",
		"};"
	].join("\n");
};