/*	miso restrictions
	Restrict users access to controller actions based on roles 
*/
var miso = require('../server/miso.util.js'),
	hasRole = function(userRoles, roles){
		var hasRole = false;
		//	All roles
		if(userRoles == "*") {
			return true;
		}
		//	Search each user role
		miso.each(userRoles, function(userRole){
			userRole = (typeof userRole !== "string")? userRole: [userRole];
			//	Search each role
			miso.each(roles, function(role){
				if(userRole == role) {
					hasRole = true;
					return false;
				}
			});
		});
		return hasRole;
	};

module.exports = function(restrictions, user){
	var pass = true;

	//	Apply deny first, then allow.
	if(restrictions && user && user.roles){
		if(restrictions.deny) {
			pass = ! hasRole(user.roles, restrictions.deny);
		}
		if(restrictions.allow) {
			pass = hasRole(user.roles, restrictions.allow);
		}
	}

	return pass;
};