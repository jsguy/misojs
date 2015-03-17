//	This exposes an api api on "/api/" + apiType

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

module.exports = function(app, apiType, apiPath, apiRequirePath){
	apiPath = apiPath || "/api";
	apiRequirePath = (typeof apiRequirePath !== 'undefined')? apiRequirePath: '../api/' + apiType + '/' + apiType + '.api.js';
	var apiInstance = require('../api/api.js')(app),
		myApi = require(apiRequirePath)(apiInstance.utils),
		api = apiInstance.create(myApi),
		serverApi = apiInstance.createServer(myApi),
		clientApi = apiInstance.createClient(myApi, null, apiPath + "/" + apiType),
		responseType = 'json';

	//	API setup
	//	TODO: We need to push in the session here, so we can login, etc...
	app.use(apiPath + "/" + apiType + "/:action", function(req, res, next){
		var action = req.params.action,
			data = req.body,
			respond = function(){

				//	TODO: req.session to be pushed in...

				//console.log('respond', responseType, req.session, arguments);

				res[responseType](apiInstance.utils.response.apply(null, arguments));
			};

		if(action){
			//api.api[action](data).then(respond, respond);
			api.api[action](data, req.session).then(respond, respond);
		} else {
			res[responseType](apiInstance.utils.response.apply(null, [null, "No action specified"]));
		}
	});

	return {
		client: clientApi,
		server: serverApi
	};
};