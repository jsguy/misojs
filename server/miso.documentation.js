//	Grabs the documentation files and returns as object
//	Also generates the client side version on startup
var fs = require('fs'),
	marked = require('marked'),
	path = require('path'),
	getExtension = function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	},
	docPath = "./documentation/misojs.wiki",
	docs = {};

//	Read the documentation files
fs.readdirSync(docPath)
	.filter(function(file) {
		//	All md files that don't start with '.'
		return (file.indexOf('.') !== 0) && getExtension(file) == "md";
	})
	.forEach(function(file) {
		var docFile = path.join(docPath, file);
		docs[file] = marked(fs.readFileSync(docFile, {encoding: 'utf8'}), {gfm: true});
	});

//	Write out client/miso.documentation.js
fs.writeFileSync("./client/miso.documentation.js", "module.exports = function(){ return " + JSON.stringify(docs) + "; };");

module.exports = function(){
	return docs;
};