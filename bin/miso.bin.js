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
	//	Configs
	packagePath = '../package.json',
	serverConfigFile = 'cfg/server.json',
	routesConfigFile = 'cfg/routes.json',
	environment = process.env.NODE_ENV || "development",
	misoPath = __dirname + "/../",
	userPath = process.cwd(),
	userPackagePath = userPath + '/package.json',
	pjson = require(packagePath),
	name = pjson.name,
	version = pjson.version,
	serverConfig = require('../' + serverConfigFile),
	userPjson,
	print = function(){
		console.log.apply(console, arguments);
	},
	error = function(){
		console.error.apply(console, arguments);
	},
	fileExists = function(filePath) {
	    try {
	        return fs.statSync(filePath).isFile();
	    } catch (err) {
	        return false;
	    }
	},
	createdProject = false,
	projectPath,
	//	What to exclude
	excludeFiles = ['mvc', 'documentation', 'skeletons', 'bin', 'README.md'],
	//	What to always copy
	//copyFiles = ['mvc/layout_plain.js', 'modules'],
	copyFiles = ['mvc/layout_mobilefirst.js', 'mvc/layout.header.js', 'mvc/layout.nav.js', 'modules'],
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
	},
	showHelp = function(){
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
			"  -i                  Install a miso package",
			"  run                 Runs the project in the current directory"
		];
		_.each(helpText, function(txt){
			print(txt);
		});
	};

print("Miso version " + version);

//	Default to run
// if(argv._.length == 0) {
// 	argv._.push('run');
// }
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
				'c': [
					"Compiles miso.js and exits, optionally specify an environemnt for the config, for example:",
					"",
					"  " + name + " -c development",
					"",
					"Will compile miso.js for the project in the current directory"
				],
				'i': [
					"Installs a miso package, for example:",
					"",
					"  " + name + " -i misojs-codemirror-component",
					"",
					"Will install the misojs codemirror component"
				],
				'run': [
				]
			};

		if(item === true) {
			showHelp();
		} else {
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
		}
	} else if(argv.i) {

		print("Installing: " + argv.i);

		npm.load(pjson, function (err) {
			npm.commands.install([argv.i], function(err, status, result) {
				if(err) {
					print("Error: " + JSON.stringify(err));
				} else {
					var installDir = process.cwd() + "/" + Object.keys(result)[0];
					var pjfile = installDir + "/package.json";
					if(pjfile){
						print('grab', pjfile);
						//	Read package.json
						var packagejson = require(pjfile);
						//print(packagejson);
						//	See if there are any external parts
						if(packagejson.miso && packagejson.miso.external) {
							//	Install externals
							_.each(packagejson.miso.external, function(value, key) {
								var src = installDir + "/" + key,
									dest = "./public/external/" + value,
									dirStructure = dest.substr(0, dest.lastIndexOf("/"));
								print('Install external:', dest);
								fs.mkdirsSync(dirStructure);
								fs.copySync(src, dest);
							});
						}

						if(fileExists(userPackagePath)) {
							userPjson = require(userPackagePath);
						} else {
							print("Miso could not find user package", userPackagePath);
							process.exit(1);
						}

						//	Save in package.json as a miso dependancy
						userPjson.miso = userPjson.miso || {};
						userPjson.miso.dependencies = userPjson.miso.dependencies || {};
						//	Add our package here...
						userPjson.miso.dependencies[userPjson.name] = userPjson.version;

						//	Update the package
						print('Update package:', userPjson, userPackagePath);
						fs.writeFileSync(userPackagePath, JSON.stringify(userPjson, false, 2));

					} else {
						print("Error: not installed as expected");
					}
				}
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
				serverConfig.api = serverConfig.api || [];
				serverConfig.api.push("session");
				serverConfig.api.push("authentication");
				fs.writeFileSync(projectPath + "/" + serverConfigFile, JSON.stringify(serverConfig, undefined, 2), {encoding: 'utf8'});

				var routesConfig = require(projectPath + "/" + routesConfigFile);
				routesConfig = routesConfig || {};
				routesConfig["/login"] = { "method": "get", "name": "login", "action": "index" };
				fs.writeFileSync(projectPath + "/" + routesConfigFile, JSON.stringify(routesConfig, undefined, 2), {encoding: 'utf8'});

				print("* Added authentication support");
			}
		}


	} else if(argv.c){
		var env = argv.c !== "true"?
			argv.c:
			environment;

		npm.load(pjson, function (err) {
			process.env.NODE_ENV = env;
			npm.commands.run([env], function(){
				print("Miso run completed");
			});
		});
	} else {
		npm.load(pjson, function (err) {
			npm.commands.run([environment], function(err){
				if(err) {
					if(err.errno == -2) {
						print("Error: Not a project directory - Miso needs a package.json file to run");
					} else {
						print("Error: Something went wrong");
						print(err);
					}
					print("Run Miso with '-?' to get help");
				} else {
					print("Miso run completed");
				}
			});
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