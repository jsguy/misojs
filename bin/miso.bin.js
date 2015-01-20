#!/usr/bin/env node
/*
	Miso project management system

	TODO:

	. Add skeleton directory for various apps, including:
		- Default (Empty project)
		- User admin (current thing)
		- [future] SPA (Single Page App)
	. Only copy the required files for each skeleton type
	. Add scaffolding for mvc

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
	excludeFiles = ['skeletons', 'bin', 'README.md', ''],
	createProject = function(projectPath, nParam){
		if(!fs.existsSync(projectPath)) {
			console.log("Create new project: '" +nParam + "'...");

			//	Create the new directory
			fs.mkdirSync(projectPath);

			//	Loop on our files
			fs.readdirSync(misoPath)
				.filter(function(file) {
					//	All files that don't start with '.' and are not in the exclude list
					return (file.indexOf('.') !== 0) && (excludeFiles.indexOf(file) == -1);
				})
				.forEach(function(fileName) {
					//	Copy files and directories, using real paths
					file = fs.realpathSync(misoPath + fileName);
					var stat = fs.statSync(file),
						toPath = projectPath + "/" + fileName;

					if(stat.isDirectory()) {
						file = fs.realpathSync(file + "/../" + fileName);
					}

					fs.copySync(file, toPath);
				});
			console.log("Project successfully created.");
		} else {
			console.log("Project already exists:", nParam, "use -u to update");
		}
		return true;
	},
	addSkeleton = function(type, projectPath, projectName){
		var skeletonPath = fs.realpathSync(misoPath+"/skeletons/" + type);

		if(fs.existsSync(skeletonPath)) {
			if(fs.existsSync(projectPath)) {
				fs.copySync(skeletonPath, projectPath);
				console.log("Added '" + type + "' skeleton to " + projectName);
			} else {
				console.log("Project not found: " + projectPath);
			}
		} else {
			console.log("Skeleton not found: " + type);
		}

	};

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

		//	See if it worked, then check if we're also creating a skeleton.
		if(createProject(projectPath, argv.n)) {

			//	We can also apply a skeleton when creating a new project
			if(argv.s) {
				addSkeleton(argv.s, projectPath, argv.n);
			}

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
			"  -s                  Create a skeleton app, valid skeletons: 'todo'",
			"  run                 Runs the project in the current directory"
		];
		_.each(helpText, function(txt){
			console.log(txt);
		});
	}
} catch(ex) {
	console.log("Error:", ex);
}
//	Add a new line at the end...
console.log("");