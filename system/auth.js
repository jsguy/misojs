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
	var loginUrlPattern = GLOBAL.serverConfig.authentication.loginUrlPattern;
	//	options are passed in from the mvc action, eg: user.edit
	//	has an example
	return function(options) {
		return function(req, res, next) {
			if(typeof secret === "undefined") {
				throw "authenticationSecret not defined in serverConfig";
			}

			//	Check if we are authenticated
			if(req.session.authenticationSecret === secret) {
				//	Let the client know we're logged in
				req.session.isLoggedIn = true;
				return next();
			} else {
				//	TODO: Add ability to respond with JSON RPC 2.0
				return res.redirect(loginUrlPattern.split("[ORIGINALURL]").join(req.originalUrl));
			}
		};
	};
};