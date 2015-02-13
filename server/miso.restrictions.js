/*	miso restrictions
	Restrict users access to controller actions based on roles 
*/
var _ = require('lodash'),
	hasRole = function(userRoles, roles){
		var hasRole = false;
		if(userRoles == "*") {
			return true;
		}
		_.forOwn(userRoles, function(userRole){
			userRole = (typeof userRole !== "string")? userRole: [userRole];
			_.forOwn(roles, function(role){
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