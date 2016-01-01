/*
	Instagram signin code

*/




//	Endpoint api to make http requests via instagram
var request = require('request'),
	miso = require('../../../modules/miso.util.js'),
	ig = require('instagram-node').instagram();

//	"instagram": {
//		"clientId": "894a72a48ae849d8ba843720e8240f52",
//		"clientSecret": "35548e4fc9784c0cad421539d3fbd1af"
//	},


// Every call to `ig.use()` overrides the `client_id/client_secret`
// or `access_token` previously entered if they exist.
//	TODO: Grab from serverconfig

var config = {
	client_id: '894a72a48ae849d8ba843720e8240f52',
    client_secret: '35548e4fc9784c0cad421539d3fbd1af',
    redirect_url: 'http://misojs.com/instagram',
    //	Go to the following URL to get a code:
	//	https://api.instagram.com/oauth/authorize/?client_id=894a72a48ae849d8ba843720e8240f52&redirect_uri=http://misojs.com/instagram&response_type=code&scope=basic+public_content+follower_list+comments+relationships+likes

    code: '5de4a03b3d744a1389fb70747ce727d9',
	//	My access token
	access_token: '36445530.894a72a.b5ea511cc2354ccc81068e2b8e2dd884'
};


//	https://api.instagram.com/oauth/authorize/?client_id=894a72a48ae849d8ba843720e8240f52&redirect_uri=http://misojs.com/instagram&response_type=code
//	yielded: 4706cfa887bd4beda5c97d7700c34c34

//ig.use({ access_token: config.access_token});
ig.use({
	client_id: config.client_id,
	client_secret: config.client_secret
});



//	Ref: http://stackoverflow.com/a/30608596
/*
request.post(
	{
		form: {
			client_id: config.client_id,
			client_secret: config.client_secret,
			grant_type: 'authorization_code',
			redirect_uri: config.redirect_url,
			code: config.code
		},
	    url: 'https://api.instagram.com/oauth/access_token'
	},
	function (err, response, body) {
		if (err) {
			console.log("error in Post", err)
		}else{
			console.log('it worked', JSON.parse(body))
		}
	}
);
*/


module.exports = function(utils){
	return {
		tag: function(cb, err, args){
			args = args || {};
			//var url = "https://api.instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=code";
			// //	Add parameters
			// url += miso.each(args, function(value, key){
			// 	return "&" + key + "=" + value;
			// });

			// request(url, function (error, response, body) {
			// 	if (!error && response.statusCode == 200) {
			// 		cb(jsonParser(body));
			// 	} else {
			// 		err(error);
			// 	}
			// });

			ig.use({ access_token: config.access_token});

			//console.log('tag', args.tag, config.access_token);

			//ig.tag_search(args.tag, function(err, result, remaining, limit) {

			//ig.tag_media_recent('tag', [options,] function(err, medias, pagination, remaining, limit) {});


			ig.tag_media_recent(args.tag, {min_id: 0, max_id: 999999999999}, function(err, medias, pagination, remaining, limit) {
				console.log('result', arguments);
				cb(medias);
			});


		}
	};
};