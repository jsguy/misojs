#!/usr/bin/env node
/*
	Miso project management system

	TODO:

	. Add skeleton directory for various apps, including:
		- Default (Empty project)
		- User admin (current thing)
		- [future] SPA (Single Page App)
	. Only copy the required files for each skeleton type

*/
//	https://www.npmjs.com/package/minimist
var argv = require('minimist')(process.argv.slice(2)),
	fs = require('fs-extra'),
	npm = require('npm'),
	_ = require("lodash"),
	pjson = require('../package.json'),
	name = pjson.name,
	version = pjson.version,
	misoPath = __dirname + "/../",
	userPath = process.cwd(),
	projectPath,

	//	List of files to ignore
	ignoreFiles = [
		""
	],

	//	List of files we copy when using -u to update
	updateFileList = [
		"controllers/index.js"
	];

console.log("Miso version " + version);

try {
	if(argv["?"]) {
		var item = argv["?"],
			helpObjects = {
				'n': [
					"Creates a new project in the given directory, for example:",
					"",
					"  " + name + " -n myProject",
					"",
					"Will create a new project in the 'myProject' directory, (as long as it is empty)"
				],
				'u': [
					"Not yet ready..."
				],
				'run': [
				]
			};

		if(item.indexOf("-") ==0) {
			item = item.substr(1);
		}

		console.log("Help for:", argv["?"]);
		console.log("");

		if(helpObjects[item]) {
			_.each(helpObjects[item], function(txt){
				console.log(txt);
			})
		} else {
			console.log("Help for " + item + " not found.");
		}
	} else if(argv._.indexOf('run') !== -1){

		//	TODO: check this is a miso project.
		console.log("Running project...");
		npm.load(pjson, function (err) {
			npm.commands.run(["rundev"], function(){
				console.log("Miso run completed");
			});
		});

	} else if(argv.n) {
		//	Check for absolute path
		if(argv.n.indexOf("/") !== 0) {
			projectPath = userPath + "/" + argv.n;
		} else {
			projectPath = argv.n;
		}
		//	
		if(!fs.existsSync(projectPath)) {
			console.log("Create new project: '" +argv.n + "'...");
			fs.mkdirSync(projectPath);
			fs.copySync(misoPath, projectPath);
			console.log("Project successfully created.");
		} else {
			console.log("Project already exists:", argv.n, "use -u to update");
		}
	} else {
		//	Show the help screen
		var helpText = [
			"Usage: "+name+" <command> [args]",
			"       "+name+" -? [command]",
			"",
			"Commands:",
			"  -?                  Shows help for a particular command, eg: '"+name+" -? n' shows help for creating a new project",
			"  -n                  Create a new project",
			//"  -u                  Update a project to the current version",
			"  run                 Runs the project in the current directory"
		];
		_.each(helpText, function(txt){
			console.log(txt);
		});
	}
} catch(ex) {
	console.log("Error:", ex);
}

console.log("");
