var m = require('mithril');
//	Various utilities that normalise usage across client and server
module.exports = {
	//	Get a parameter
	getParam: function(key, params){
		return m.route.param(key);
	}
};