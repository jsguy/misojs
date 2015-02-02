var express = require('express'),
	bodyParser = require('body-parser'),

	//	TODO: For dev only
	reload = require('./server/reload'),

	path = require('path'),
	app = express(),
	serverConfig = require('./cfg/server.json'),
	routeConfig	= require('./cfg/routes.json'),
	mvc = require('./system');

//	We parse application/x-www-form-urlencoded and application/json
//	TODO: Add any further defaults here and make configurable
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/client')));

//	Basic error handling
//	TODO: make configurable
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

//	Create our miso app
mvc(app, {
	routeConfig: routeConfig,
	throwUnmappedActions: true,
	verbose: true
});

//	Run the server
var server = app.listen(serverConfig.port, function () {
	var info = server.address(),
		address = info.address;

	//	Fix for chrome - it doesn't like 0.0.0.0
	if(address == "0.0.0.0") {
		address = "localhost";
	}

	console.log('');
	console.log('Miso is listening at http://%s:%s', address, info.port);
});

//	For dev only - auto reloading, TODO: environment support
reload(server, app);