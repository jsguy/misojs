var express = require('express'),
	path = require('path'),
	app = express(),
	server = require('./cfg/server.json'),
	routeConfig	= require('./cfg/routes.json'),
	mvc = require('./mvc');

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/client')));

//	Create our app
mvc(app, routeConfig, true);

//	Run the server
var server = app.listen(server.port, function () {
	var info = server.address();;
	console.log('Miso is listening at http://%s:%s', info.address, info.port);
});