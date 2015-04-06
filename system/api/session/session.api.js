//	Api to interact with the session
//	Key to store user session object on
var sessKey = "misoUserSessionObject";

//	When set client side, it is available both client and server
//	side.
module.exports = function(utils){
	return {
		get: function(cb, err, args, req){
			var value = (req && req.session && req.session[sessKey] && req.session[sessKey][args.key])? req.session[sessKey][args.key]: null;
			cb(value);
		},
		//	TODO: Security for set method - this should be for 
		//	logged in users only presumably?
		set: function(cb, err, args, req){
			//	We want to set the value in the session here...
			//	TODO: Ensure this will be saved using the default 
			//	session auto-save feature.

			if(req && req.session){
				req.session[sessKey] = req.session[sessKey] || {};
				req.session[sessKey][args.key] = args.value;
				cb(true);
			} else {
				cb(false);
			}
		}
	};
};