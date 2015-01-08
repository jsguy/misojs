var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	app = express(),
	m = require('mithril'),
	render = require('mithril-node-render'),
	_ = require('lodash'),
	Signal = require('signals'),
	models = require('./m')(),
	controllers = require('./c')(app, true);


//	TODO: Create JSON API from controller pathes



//	Our client-side JS
app.use(express.static(path.join(__dirname, 'client')));

//  Fake global storage for now..
GLOBAL.store = {
	load: function load(type, id) {
		return {
			then: function(cb){
				setTimeout(function(){
					//	Read the user.json file
					var r = JSON.parse(fs.readFileSync("client/user.json", 'utf8'));
					cb(r);
				}, 0);


				// fs.readFileSync("client/user.json", { encoding: 'utf8'}, function(str){
				// 	cb(JSON.parse(str));
				// });
			}
		}
	}
};

//	TODO: Need to render the front-end version of the M/V/C.

/*	

//	http://lhorie.github.io/mithril/routing.html
m.route(document.body, "/", {
    "/": home,
    "/login": login,
    "/dashboard": dashboard,
});


{
	"path": { controller: function, view: function }
}


*/

console.log(controllers);

console.log("--- model ---");
console.log(JSON.stringify(models));

var server = app.listen(3330, function () {
	var host = server.address().address,
		port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port)
})