#!/usr/bin/env node
/*
	Miso project management system

	TODO:

	. Add scaffolding for mvc

*/
//	https://www.npmjs.com/package/minimist
var argv = require('minimist')(process.argv.slice(2)),
	fs = require('fs-extra'),
	npm = require('npm'),
	_ = require("lodash"),
	pjson = require('../package.json'),
	serverConfigFile = 'cfg/server.json',
	serverConfig = require('../' + serverConfigFile),
	routesConfigFile = 'cfg/routes.json',
	environment = process.env.NODE_ENV || "development",
	name = pjson.name,
	version = pjson.version,
	misoPath = __dirname + "/../",
	userPath = process.cwd(),
	print = function(){
		console.log.apply(console, arguments);
	},
	error = function(){
		console.error.apply(console, arguments);
	},
	createdProject = false,
	projectPath,
	//	What to exclude
	excludeFiles = ['mvc', 'documentation', 'skeletons', 'bin', 'README.md'],
	//	What to always copy
	copyFiles = ['mvc/layout.js', 'modules'],
	//	Creates a new project folder and copies all required files
	createProject = function(projectPath, projectName){
		if(!fs.existsSync(projectPath)) {
			print("Create new project: '" +projectName + "'...");
			//	Create the new directory
			fs.mkdirSync(projectPath);

			//	Loop on all our files
			fs.readdirSync(misoPath)
				.filter(function(file) {
					//	All files that don't start with '.' and are not in the exclude list
					return ((file.indexOf('.') !== 0) && excludeFiles.indexOf(file) == -1);
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

			//	Copy the specific files
			_.forOwn(copyFiles, function(fileName) {
				//	Copy files and directories, using real paths
				file = fs.realpathSync(misoPath + fileName);
				var stat = fs.statSync(file),
					toPath = projectPath + "/" + fileName;

				if(stat.isDirectory()) {
					file = fs.realpathSync(file + "/../" + fileName);
				}

				fs.copySync(file, toPath);
			});


			//	Create package
			fs.writeFileSync(projectPath +"/package.json", createPackage(projectName));

			print("* Project successfully created.");
			createdProject = true;
		} else {
			error("Project directory already exists:", projectName, ", remove it before creating project");
		}
		return true;
	},
	//	Creates the required package JSON for a new project
	//	A rather crude, but effective way to do it...
	createPackage = function(projectName){
		var myJSON = pjson;
		myJSON.name = projectName;
		myJSON.description = projectName + " - an awesome project based on miso";
		delete myJSON.bin;
		delete myJSON.private;
		delete myJSON.repository;
		delete myJSON.author;
		delete myJSON.homepage;
		delete myJSON.bugs;

		return JSON.stringify(myJSON, undefined, 2);
	},
	//	Adds a skeleton onto a project
	addSkeleton = function(type, projectPath, projectName){
		var skeletonPath = fs.realpathSync(misoPath+"/skeletons/" + type);

		if(fs.existsSync(skeletonPath)) {
			if(fs.existsSync(projectPath)) {
				fs.copySync(skeletonPath, projectPath);
				print("* Added '" + type + "' skeleton to " + projectName);
			} else {
				error("Project not found: " + projectPath);
			}
		} else {
			error("Skeleton not found: " + type);
		}
	};

print("Miso version " + version);

try {
	if(argv["?"]) {
		var item = argv["?"],
			helpObjects = {
				'n': [
					"Creates a new project in the given directory, for example:",
					"",
					"  " + name + " -n myapp",
					"",
					"Will create a new project in the 'myapp' directory, (as long as it is empty)"
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

		print("Help for:", argv["?"]);
		print("");

		if(helpObjects[item]) {
			_.each(helpObjects[item], function(txt){
				print(txt);
			})
		} else {
			print("Help for " + item + " not found.");
		}
	} else if(argv._.indexOf('run') !== -1){

		//	TODO: check this is a miso project.
		print("Running project for: " + environment);
		npm.load(pjson, function (err) {
			npm.commands.run([environment], function(){
				print("Miso run completed");
			});
		});

	} else if(argv.n) {
		//	Check for absolute path
		if(argv.n.indexOf("/") !== 0) {
			projectPath = userPath + "/" + argv.n;
		} else {
			projectPath = argv.n;
		}


		//	Add any files required for authentication here
		if(argv.a) {
			copyFiles.push('mvc/login.js');
			copyFiles.push('mvc/user.js');
		}

		//	See if it worked, then check if we're also creating a skeleton.
		if(createProject(projectPath, argv.n)) {
			//	Apply specified or default skeleton
			addSkeleton(argv.s? argv.s: "default", projectPath, argv.n);

			//	Update settings and routes
			if(argv.a) {
				serverConfig.authentication = serverConfig.authentication ||{};
				serverConfig.authentication.enabled = true;
				fs.writeFileSync(projectPath + "/" + serverConfigFile, JSON.stringify(serverConfig, undefined, 2), {encoding: 'utf8'});

				var routesConfig = require(projectPath + "/" + routesConfigFile);
				routesConfig = routesConfig || {};
				routesConfig["/login"] = { "method": "get", "name": "login", "action": "index" };
				fs.writeFileSync(projectPath + "/" + routesConfigFile, JSON.stringify(routesConfig, undefined, 2), {encoding: 'utf8'});

				print("* Added authentication support");
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
			"  -s                  Add a skeleton to your new app",
			"  -a                  Add authentication capability to your new app",
			"  run                 Runs the project in the current directory"
		];
		_.each(helpText, function(txt){
			print(txt);
		});
	}
} catch(ex) {
	error("Exception:", ex);
}

if(createdProject) {
	print("To run your new project:");
	print("");
	print("cd " + argv.n);
	print("miso run");
}

//	Add a new line at the end...
print("");