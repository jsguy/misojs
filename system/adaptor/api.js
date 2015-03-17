//	This exposes an adaptor api on "/api/" + adaptorType

//
//	TODO: 
//
//	* Guard against XSS
//	* Safeguard against abuse
//	* Check role based access
//	* Anything else?
//
//

var miso = require('../../modules/miso.util.js');

module.exports = function(app, adaptorType, apiPath, adaptorRequirePath){
	apiPath = apiPath || "/api";
	adaptorRequirePath = (typeof adaptorRequirePath !== 'undefined')? adaptorRequirePath: '../adaptor/' + adaptorType + '/' + adaptorType + '.adaptor.js';
	var adaptorInstance = require('../adaptor/adaptor.js')(app),
		myAdaptor = require(adaptorRequirePath)(adaptorInstance.utils),
		adaptor = adaptorInstance.create(myAdaptor),
		serverAdaptor = adaptorInstance.createServer(myAdaptor),
		clientAdaptor = adaptorInstance.createClient(myAdaptor, null, apiPath + "/" + adaptorType),
		responseType = 'json';

	//	API setup
	//	TODO: We need to push in the session here, so we can login, etc...
	app.use(apiPath + "/" + adaptorType + "/:action", function(req, res, next){
		var action = req.params.action,
			data = req.body,
			respond = function(){

				//	TODO: req.session to be pushed in...

				//console.log('respond', responseType, req.session, arguments);

				res[responseType](adaptorInstance.utils.response.apply(null, arguments));
			};

		if(action){
			//adaptor.api[action](data).then(respond, respond);
			adaptor.api[action](data, req.session).then(respond, respond);
		} else {
			res[responseType](adaptorInstance.utils.response.apply(null, [null, "No action specified"]));
		}
	});

	return {
		client: clientAdaptor,
		server: serverAdaptor
	};
};