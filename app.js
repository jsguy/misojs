var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	app = express(),
	m = require('mithril'),
	render = require('mithril-node-render'),
	_ = require('lodash'),
	Signal = require('signals'),
	models = require('./m')(),
	controllers = require('./c')(app, true),
	routegenerator = require('./server/routegenerator.js')(controllers);

//	Our client-side JS
app.use(express.static(path.join(__dirname, 'client')));


// console.log("--- model ---");
// console.log(models);

var server = app.listen(3330, function () {
	var host = server.address().address,
		port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port)
})