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

	/*	Use a JSON RPC 2.0 response
		this is used by the server response in the adaptor.
	*/
	response: function(result, err, id){
		var res = {
			jsonrpc: "2.0",
			id: null
		};

		//	Can't have both result and error
		//	Favour error
		if(err) {
			res.error = err;
		} else {
			res.result = result;
		}

		return res;
	},

	//	Get parameters for an action
	getParam: function(key, params, def){
		return typeof params[key] !== "undefined"? params[key]: def;
	},

	//	Testing ready binder
	//	NOTE: We somehow need to share this with the createRoute method...
	readyBinderFactory: function(){
		var bindings = [],
			afterBindings = [],
			myBindings = {
				bind: function(cb) {
					bindings.push(cb);

					//	Return a function that will remove this binding and
					//	fire the ready function if there are no more bindings
					return (function(index){
						return function(){
							bindings[index]();
							bindings.splice(index, 1);
							if(!myBindings.hasBindings()) {
								myBindings.ready();
							}
						};
					}(bindings.length -1));
				},
				bindLast: function(cb) {
					afterBindings.push(cb);
				},
				ready: function(){
					for(var i = 0; i < bindings.length; i += 1) {
						bindings[i]();
					}
					bindings = [];
					for(var i = 0; i < afterBindings.length; i += 1) {
						afterBindings[i]();
					}
					afterBindings = [];
				},
				hasBindings: function() {
					return bindings.length > 0;
				}
			};
		return myBindings;
	}
};