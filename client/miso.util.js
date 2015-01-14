//	Various utilities that normalise usage across client and server
var miso = {
	//	Get a parameter
	getParam = function(key, params){
		return m.route.param(key);
	}
};