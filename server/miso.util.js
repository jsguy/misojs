//	Various utilities that normalise usage between client and server
//	This is the server version
//	See /client/miso.util.js for client version

module.exports = {
	//	Are we on the server?
	isServer: function() {
		return true;
	},
	readyBinder: function(){
		var bindings = [];
		return {
			bind: function(cb) {
				bindings.push(cb);
			},
			ready: function(){
				for(var i = 0; i < bindings.length; i += 1) {
					bindings[i]();
				}
			}
		};
	},
	//	Get parameters for an action
	getParam: function(key, params){
		return params[key];
	},


};