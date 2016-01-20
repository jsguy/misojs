//	This exposes an api api on "/api/" + apiType

//
//	TODO: 
//
//	* Guard against XSS and do what you can to safeguard against abuse
//		ref: https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
//	* Role based access permissions
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
				res[responseType](apiInstance.utils.response.apply(null, arguments));
			},
			respondErr = function(){
				res[responseType](apiInstance.utils.response.apply(null, [null, arguments]));
			};

		//	CORS headers to allow Cordova to work
		//	TODO: Limit to required domain
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");
		//	CORS required response
		if (req.method === "OPTIONS") {
		    return res.status(200).end();
		}

		if(action){
			api.api[action](data, req, res).then(respond, respondErr);
		} else {
			res[responseType](apiInstance.utils.response.apply(null, [null, "No action specified"]));
		}
	});

	return {
		client: clientApi,
		server: serverApi
	};
};
