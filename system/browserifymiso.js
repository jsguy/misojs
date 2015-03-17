var transformTools = require('browserify-transform-tools'),
	path = require('path'),
	fs = require('fs'),
	//	Base directory we assume the server path is being accessed from
	baseDir = "./mvc/";

//	Swap server for client, if the equivelent client/ file exists
module.exports = transformTools.makeRequireTransform('browserifymiso', {
		jsFilesOnly: true,
		evaluateArguments: true
	},
	function (args, opts, done) {
		var find = "server",
			replace = "client";

		//	Check if we find something
		if(args && args.length > 0){

			//	Check if it has the word "server" in it
			if(args[0].indexOf(find) !== -1) {
				//	If we have the same file with "client" where 
				//	"server" was, use it for the client script.
				var file = args[0].split(find).join(replace);
				if(fs.existsSync(baseDir + file) && fs.statSync(baseDir + file).isFile()){
					done(null, "require(\"" + file + "\")");
				} else {
					done();
				}
			} else {
				//	Check if there is a ".client" file
				var file = args[0];
				file = file.substr(0, file.lastIndexOf(".") + 1) + replace + file.substr(file.lastIndexOf("."));

				if(fs.existsSync(baseDir + file) && fs.statSync(baseDir + file).isFile()){
					done(null, "require(\"" + file + "\")");
				} else {
					done();
				}
			}
		} else {
			done();
		}
	}
);