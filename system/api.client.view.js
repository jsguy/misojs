/*	Miso main javascript file generator

	* Is used by browserify to create /miso.js

	TODO:

	* Ability to configure required libs
*/
var m = require('mithril');

module.exports.index = function(ctrl){
	var usedRoute = {};
	return [
		"/* NOTE: This is a generated file, please do not modify it, your changes will be lost */",
		"module.exports = function(m){",

		//	TODO: guard against incorrect model types here...
		//	For example, forgetting the "new" keyword in front of 
		//	the model instanciation

		"	var getModelData = function(model){",
		"		var i, result = {};",
		"		for(i in model) {if(model.hasOwnProperty(i)) {",
		"			if(i !== 'isValid') {",
		"				result[i] = (typeof model[i] == 'function')? model[i](): model[i];",
		"			}",
		"		}}",
		"		return result;",
		"	};",

		"	return {",
		//	Grab our api action methods
		(Object.keys(ctrl.api).map(function(key) {
			return "'" + key + "': " + ctrl.api[key];
		})).join(",\n"),
		"	};",
		"};"
	].join("\n");
};