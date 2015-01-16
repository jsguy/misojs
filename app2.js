var express = require('express'),
	path = require('path'),
	app = express(),
	server = require('./cfg/server.cfg.json'),
	//Signal = require('signals'),
	// models = require('./m')(),
	// controllers = require('./c')(app, true),
	// routegenerator = require('./server/miso.routegenerator.js');
	mvc = require('./mvc')(app, true);


//	Generate the routes
//routegenerator(controllers);

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/mvc')));

//	Run the server
var server = app.listen(server.port, function () {
	var host = server.address().address,
		port = server.address().port;
	console.log('Miso is listening at http://%s:%s', host, port)
})