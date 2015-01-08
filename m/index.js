/*
	Singleton to load all models on startup
*/
var fs			= require('fs'),
	path		= require('path'),
	lodash		= require('lodash'),
	getExtension = function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	};

//	Returns an object with all the models
module.exports = function() {
	var models = {};
	fs.readdirSync(__dirname).filter(function(file) {
			return (file.indexOf('.') !== 0) && getExtension(file) == "js" && file.indexOf(".model.js") !== -1;
		}).forEach(function(file) {
			var modelName = file.substr(0,file.indexOf("."));
			models[modelName] = require(path.join(__dirname, file));
		});
	 
	return models;
};