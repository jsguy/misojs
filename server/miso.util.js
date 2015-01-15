//	Various utilities that normalise usage across client and server
module.exports = {
	getParam: function(key, params){
		return params[key];
	}
};