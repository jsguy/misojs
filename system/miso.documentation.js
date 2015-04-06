//	Grabs the documentation files and returns as object
//	Also generates the client side version on startup
var fs = require('fs'),
	marked = require('marked'),
	path = require('path'),
	getExtension = function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	},
	docPath = "../documentation/misojs.wiki",
	docs = {};

var renderer = new marked.Renderer();

//	Use anchored headings
renderer.heading = function (text, level) {
	var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

	return '<h' + level + '><a name="' +
		escapedText +
		'" class="anchor" href="#' +
		escapedText +
		'"><span class="header-link">' +
		text + '</span></a></h' + level + '>';
};

//	Override the links
renderer.link = function (href, title, text) {
	var target;

	if(href.indexOf("../") == 0 || href.indexOf("https://github.com/jsguy/misojs/wiki/") || href.indexOf("http://github.com/jsguy/misojs/wiki/")) {
		//	Assume wiki/doc link
		href = "/doc/" + href.substr(href.lastIndexOf("/") + 1) + ".md";
	} else if(href.indexOf("http") == 0) {
		//	If starts with "http", we want a _blank target
		target = "_blank";
	}

	return '<a href="' + href + '"' + 
		(title? ' title="' + title + '"': '') + 
		(target? ' target="' + target + '"': '') + 
		'>' + text + '</a>';
};

//	Read the documentation files
fs.readdirSync(docPath)
	.filter(function(file) {
		//	All md files that don't start with '.'
		return (file.indexOf('.') !== 0) && getExtension(file) == "md";
	})
	.forEach(function(file) {
		var docFile = path.join(docPath, file);
		docs[file] = marked(fs.readFileSync(docFile, {encoding: 'utf8'}), {
			gfm: true,
			renderer: renderer
		});
		//	Fix anchor tags that go external
		//docs[file] = docs[file].split("....")
	});

//	Write out client/miso.documentation.js
fs.writeFileSync("../public/miso.documentation.js", "module.exports = function(){ return " + JSON.stringify(docs) + "; };");

module.exports = function(){
	return docs;
};