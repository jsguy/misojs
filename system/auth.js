//	Setup authentication
//
//	TODO:
//	
//	* Ability to redirect to login page
//	* Ability to send JSON RPC 2.0 response
//	* NOTE: Need to:
//		- setup JSON RPC 2.0 for all API calls
//		- create a generic message handler
//
//
module.exports = function(app, secret){
	return function(options) {
		console.log('options', options);
		return function(req, res, next) {
			var sess = req.session;

			//	We are authenticated
			if(sess.authenticated === secret) {
				return next();
			} else {
				if(options.requestType == "JSON") {
					//	Respond with JSON RPC 2.0
				} else {
					//	Redirect to login
				}
			}
		};
	};
};