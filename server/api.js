//	Adaptor api 
//
//	TODO: 
//
//	* Safeguard against abuse
//	* Check role based access
//	* Guard against XSS
//	* Anything else?
//
module.exports = function(app, adaptorType, apiPath){
	apiPath = apiPath || "/api";
	var adaptorInstance = require('../system/adaptor/adaptor.js')(app),
		myAdaptor = require('../system/adaptor/' + adaptorType + '/' + adaptorType + '.adaptor.js')(adaptorInstance.utils),
		adaptor = adaptorInstance.create(myAdaptor),
		serverAdaptor = adaptorInstance.createServer(myAdaptor),
		clientAdaptor = adaptorInstance.createClient(myAdaptor, null, apiPath),
		responseType = 'json';

	//	API setup
	app.use(apiPath + "/:action", function(req, res, next){
		var action = req.params.action,
			data = req.body,
			respond = function(){
				res[responseType](adaptorInstance.utils.response.apply(null, arguments));
			};

		if(action){
			//	TODO: Can we actually use the error response 
			//	for something different?
			adaptor
				.api[action](data)
				.then(respond, respond);
		} else {
			res[responseType](adaptorInstance.utils.response.apply(null, [null,"No action specified"]));
		}
	});

	return {
		client: clientAdaptor,
		server: serverAdaptor
	};
};