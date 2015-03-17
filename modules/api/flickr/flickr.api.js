//	endpoint api to make http requests via flickr
var request = require('request'),
	miso = require('../../../modules/miso.util.js'),
	//	Parse out the unwanted parts of the json
	//	typically this would be run on the client
	//	we run this using "request" on  the server, so
	//	no need for the jsonp callback
	jsonParser = function(jsonpData){
		var json, startPos, endPos;
		try {
			startPos = jsonpData.indexOf('({');
			endPos = jsonpData.lastIndexOf('})');
			json = jsonpData
				.substring(startPos+1, endPos+1)
				.split("\n").join("")
				.split("\\'").join("'");

			return JSON.parse(json);
		} catch(ex) {
			console.log("ERROR", ex);
			return "{}";
		}
	};

module.exports = function(utils){
	return {
		photos: function(cb, err, args){
			args = args || {};
			var url = "http://api.flickr.com/services/feeds/photos_public.gne?format=json";
			//	Add parameters
			url += miso.each(args, function(value, key){
				return "&" + key + "=" + value;
			});

			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					cb(jsonParser(body));
				} else {
					err(error);
				}
			});
		}
	};
};