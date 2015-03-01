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

var miso = require('../../server/miso.util.js');

module.exports = function(app, adaptorType, apiPath){
	apiPath = apiPath || "/api";
	var adaptorInstance = require('../adaptor/adaptor.js')(app),
		myAdaptor = require('../adaptor/' + adaptorType + '/' + adaptorType + '.adaptor.js')(adaptorInstance.utils),
		adaptor = adaptorInstance.create(myAdaptor),
		serverAdaptor = adaptorInstance.createServer(myAdaptor),
		clientAdaptor = adaptorInstance.createClient(myAdaptor, null, apiPath + "/" + adaptorType),
		responseType = 'json';

	//	API setup
	app.use(apiPath + "/" + adaptorType + "/:action", function(req, res, next){
		var action = req.params.action,
			data = req.body,
			respond = function(){
				res[responseType](adaptorInstance.utils.response.apply(null, arguments));
			};

		if(action){
			adaptor.api[action](data).then(respond, respond);
		} else {
			res[responseType](adaptorInstance.utils.response.apply(null, [null, "No action specified"]));
		}
	});

	return {
		client: clientAdaptor,
		server: serverAdaptor
	};
};