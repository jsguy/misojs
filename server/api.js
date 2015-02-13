//	This exposes an adaptor api on /api

//
//	TODO: 
//
//	* Guard against XSS
//	* Safeguard against abuse
//	* Check role based access
//	* Anything else?
//
//

var miso = require('../server/miso.util.js');

module.exports = function(app, adaptorType, apiPath){
	apiPath = apiPath || "/api";
	var adaptorInstance = require('../system/adaptor/adaptor.js')(app),
		myAdaptor = require('../system/adaptor/' + adaptorType + '/' + adaptorType + '.adaptor.js')(adaptorInstance.utils),
		adaptor = adaptorInstance.create(myAdaptor),
		serverAdaptor = adaptorInstance.createServer(myAdaptor),
		clientAdaptor = adaptorInstance.createClient(myAdaptor, null, apiPath),
		responseType = 'json',
		/*	Use a JSON RPC 2.0 response
			* Either include a 'result' OR an 'error' attribute - if 
				error, no result will be sent.
			* 'id' is optional but might be useful in some circumstances, 
				eg: if you use multiple simultaneous requests
		*/
		jsonRpcResponse = function(result, err, id){
			var res = {
				jsonrpc: "2.0",
				id: null
			};

			//	Can't have both result and error
			if(err) {
				res.error = err;
			} else {
				res.result = result;
			}

			return result;
		};

	//	API setup
	app.use(apiPath + "/:action", function(req, res, next){
		var action = req.params.action,
			data = req.body,
			respond = function(){
				res[responseType](adaptorInstance.utils.response.apply(null, arguments));
			};

		if(action){
			adaptor.api[action](data).then(respond, respond);
		} else {
			res[responseType](adaptorInstance.utils.response.apply(null, [null,"No action specified"]));
		}
	});

	return {
		client: clientAdaptor,
		server: serverAdaptor
	};
};