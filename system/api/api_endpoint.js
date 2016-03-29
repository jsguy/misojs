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

module.exports = function(args){
//module.exports = function(app, apiType, apiPath, apiRequirePath){

	args.apiPath = args.apiPath || "/api";
	args.apiRequirePath = (typeof args.apiRequirePath !== 'undefined')? args.apiRequirePath: '../api/' + args.apiType + '/' + args.apiType + '.api.js';

	var apiInstance = require('../api/api.js')(args.app),
		myApi = require(args.apiRequirePath)(apiInstance.utils),
		api = apiInstance.create(myApi),
		serverApi = apiInstance.createServer(myApi),
		clientApi = apiInstance.createClient(myApi, null, args.apiPath + "/" + args.apiType),
		responseType = 'json';

	//	API setup
	//	TODO: We need to push in the session here, so we can login, etc...
	args.app.use(args.apiPath + "/" + args.apiType + "/:action", function(req, res, next){
		var action = req.params.action,
			data = req.body,
			respond = function(){
				res[responseType](apiInstance.utils.response.apply(null, arguments));
			},
			respondErr = function(){
				res[responseType](apiInstance.utils.response.apply(null, [null, arguments]));
			};

		//	CORS headers to allow Cordova to work
		res.header("Access-Control-Allow-Origin", args.serverConfig.apiAllowOrigin);
		res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
		res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header");
		//	CORS required response
		if (req.method === "OPTIONS") {
		    return res.status(200).end();
		}


		//	Here I need the user roles - let's assume we can
		//	use the session...
		//	TODO: Check authentication here as well first.
		var session = req.session || {},
			//	TODO: hard coded user! Should be real...
			user = session && session.user? session.user: {
				name: "you",
				roles: ['support']
			};

		if(!miso.checkPermissions(args.permissions, user, args.serverConfig.apiPath.substring(1) + "." + args.apiType, action)){
			//	TODO: See if we can handle a 403 in mithril - for now, let's assume this is easier.
			//res.status(403);
			return res[responseType](apiInstance.utils.response(null, {access: "denied"}));
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