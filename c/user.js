var Signal = require('signals'),
	fs = require('fs'),
	//  Fake storage for now..
	store = {
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
	},
	getParam = function(key, params){
		return params[key];
	};

/*

	TODO

	* Extract method to get parameters
	* Solution for Signal - might need a semaphore in the controller index file to see if we're loading anything, like mithril does on the frontend

 */

//	Index user
module.exports.index = function(params) {
	var userId = params ? params.id : m.route.param('id'),
		scope = {
			user: null,
			onReady: new Signal()
		};

	store.load('user', userId).then(function(loadedUser) {
		console.log('and then...', loadedUser);
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
};

//	Index, edit, create, update, delete

//	Edit user
module.exports.edit = function(params) {
	var userId = getParam('id', params),
		scope = {
			user: null,
			onReady: new Signal()
		};

	console.log('userId - ', userId);

	store.load("user", userId).then(function(loadedUser) {
		console.log('and then...', loadedUser);
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
};

//	Index, edit, create, update, delete