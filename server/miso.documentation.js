var fs = require('fs'),
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
		console.log(docFile);
		docs[file] = fs.readFileSync(docFile, {encoding: 'utf8'});
	});


//	Write out client/miso.documentation.js
fs.writeFileSync("./client/miso.documentation.js", "module.exports = function(){ return " + JSON.stringify(docs) + "; };");

module.exports = function(){
	return docs;
};