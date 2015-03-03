//	endpoint adaptor to make http requests via flickr
var request = require('request'),
	flickrJsonParser = function(jsonpData){
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
			var url = "http://api.flickr.com/services/feeds/photos_public.gne?format=json";

			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					cb(flickrJsonParser(body));
				} else {
					err(error);
				}
			});
		}
	};
};