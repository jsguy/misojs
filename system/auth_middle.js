//	Authentication middleware
//
//	If authentication is enabled in the server config, we verify that
//	the route is authenticated using the authentication secret.
//
module.exports = function(args, req, res, next) {
	var serverConfig = GLOBAL.serverConfig,
		//	If enabled and if(force auth)? force auth: (auth all)
		shallAuthenticate = serverConfig.authentication.enabled && 
		(typeof args.route[args.action].authenticate !== "undefined")?
			args.route[args.action].authenticate: 
			serverConfig.authentication.all;

	//	Only authenticate if needed
	if(shallAuthenticate) {
		//	Apply the authentication middleware
		var loginUrlPattern = GLOBAL.serverConfig.authentication.loginUrlPattern,
			secret = GLOBAL.serverConfig.authentication.secret;

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
	} else {
		//	No auth required for this route
		next();
	}
};