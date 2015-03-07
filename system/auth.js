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
	//	options are passed in from the mvc action, eg: user.edit
	//	has an example
	return function(options) {
		console.log('auth options', options);
		return function(req, res, next) {
			var sess = req.session;

			console.log('authing...', sess);

			//	We are authenticated
			if(sess && sess.authenticated === secret) {
				return next();
			} else {

				console.log('not auth', req.originalUrl);

				if(options.requestType == "JSON") {
					//	Respond with JSON RPC 2.0
				} else {
					//	Redirect to login action, pass in req.originalUrl so the user can do somethign with it
					return res.redirect("/login?url=" + req.originalUrl);
				}
			}
		};
	};
};