var express = require('express'),
	bodyParser = require('body-parser'),

	//	TODO: For dev only
	reload = require('./server/reload'),

	path = require('path'),
	app = express(),
	serverConfig = require('./cfg/server.json'),
	routeConfig	= require('./cfg/routes.json'),
	mvc = require('./system');

// parse application/x-www-form-urlencoded and  application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/client')));





//	START setup adaptor



//	PROBLEM: I need to inject the ability to make server-side models for the adaptor



//	serverConfig.adaptor
var adaptor = require('./system/adaptor/' + serverConfig.adaptor + '/' + serverConfig.adaptor + '.adaptor.js');

console.log(adaptor);

//	API setup
app.use("/api/:action", function(req, res, next){
	var action = req.params.action,
		data = req.body;

	//	TODO: Safeguard against abuse...
	if(action){
		adaptor.api[action](data).then(function(){
			res[adaptor.utils.responseType](adaptor.utils.response.apply(null, arguments));
		});
	} else {
		console.log("something else?");
		res[adaptor.utils.responseType](adaptor.utils.response.apply(null, [null,"No action specified"]));
	}
});





//	END setup adaptor






//	Setup API
//require('./server/api.js')(app);



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
var server = app.listen(serverConfig.port, function () {
	var info = server.address();
	console.log('Miso is listening at http://%s:%s', info.address, info.port);
});


//	For dev only - auto reloading
reload(server, app);