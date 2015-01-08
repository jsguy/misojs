var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	app = express(),
	server = require('./cfg/server.cfg.json'),
	m = require('mithril'),
	render = require('mithril-node-render'),
	_ = require('lodash'),
	Signal = require('signals'),
	models = require('./m')(),
	controllers = require('./c')(app, true),
	routegenerator = require('./server/miso.routegenerator.js');

//	Generate the routes
routegenerator(controllers);

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, 'client')));

//	Run the server
var server = app.listen(server.port, function () {
	var host = server.address().address,
		port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port)
})