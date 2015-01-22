var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	app = express(),
	server = require('./cfg/server.json'),
	routeConfig	= require('./cfg/routes.json'),
	mvc = require('./mvc');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/client')));

//	Setup API
require('./server/api.js')(app);

//	Basic error handling
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
var server = app.listen(server.port, function () {
	var info = server.address();;
	console.log('Miso is listening at http://%s:%s', info.address, info.port);
});