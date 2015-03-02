//	miso adaptor override example
var db = require('../../../system/adaptor/flatfiledb/api.server.js');

module.exports = function(m){
	var ad = db(m);

	ad.hello = function(cb, err, args){
		cb("world");
	};

	return ad;
};