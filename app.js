#!/usr/bin/env node
/*
	WIP: when the app is created, we should have options to include:

	* sessions
	* authentication

	This needs to either be:

	* options in /bin/miso.bin.js
	* options in server.json
	* or perhaps a mixture of both?

*/

var express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	//	TODO: For dev only
	reload = require('./modules/reload'),
	path = require('path'),
	app = express(),
	environment = app.get('env'),
	serverConfig = require('./system/config.js')(environment),
	routeConfig	= require('./cfg/routes.json'),

	mvc = require('./system');

//	TODO: Set session store
//	Setup session
//	These settings fix the config: https://github.com/sahat/hackathon-starter/issues/169
serverConfig.session.resave = serverConfig.session.resave || false;
serverConfig.session.saveUninitialized = serverConfig.session.saveUninitialized || false;
app.use(session(serverConfig.session));

//	We parse application/x-www-form-urlencoded and application/json
//	TODO: Add any further defaults here and make configurable
app.use(bodyParser.urlencoded({limit: serverConfig.uploadLimit, extended: false}));
app.use(bodyParser.json({limit: serverConfig.uploadLimit}));

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/public')));
if(serverConfig.staticPath) {
	app.use(serverConfig.staticPath, express.static('public'));
}


//	Basic error handling
//	TODO: make configurable
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

var misoAppOptions = {
	routeConfig: routeConfig,
	throwUnmappedActions: true,
	verbose: true
}, exitWhenReady;

//	Check for exit
process.argv.forEach(function(val, index) {
	if(val == "exitWhenReady") {
		exitWhenReady = true;
	}
});

if(exitWhenReady) {
	misoAppOptions.exitWhenReady = true;
	misoAppOptions.forceBrowserify = true;
}

//	Create our miso app
mvc(app, misoAppOptions);

//	Either wait for misoready then exit or run the server
if(misoAppOptions.exitWhenReady) {
	process.exit();
} else {
	//	Run the server
	var server = app.listen(serverConfig.port, function () {
		var info = server.address(),
			address = info.address;

		if(address == "::") {
			address = "localhost";
		}

		console.log('');
		console.log('Miso is listening at http://%s:%s in %s mode', address, info.port, environment);
		console.log('');

		//	For dev-eyes only
		if(environment !== 'production') {
			reload(server, app);
		}
	});		
}