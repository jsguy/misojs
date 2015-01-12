var Signal = require('signals'),
	fs = require('fs'),
	//  Fake storage for now..
	//  TODO: We need a JSON api
	store = {
		load: function load(type, id) {
			return {
				then: function(cb){
					setTimeout(function(){
						//	Just read the user.json file
						var r = JSON.parse(fs.readFileSync("client/user.json", 'utf8'));
						cb(r);
					}, 0);
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
	* Solution for Signal - might need a semaphore in the controller index file to see 
		if we're loading anything, like mithril does on the frontend
*/

//	Index user
module.exports.index = function(params) {
	var scope = {
			users: [],
			onReady: new Signal()
		};

	store.load('user').then(function(loadedUsers) {
		scope.users = loadedUsers;
		scope.onReady.dispatch();
	});

	return scope;
};

//	Edit user
module.exports.edit = function(params) {
	var userId = getParam('user_id', params),
		scope = {
			user: null,
			isServer: !!(typeof module !== 'undefined' && module.exports),
			onReady: new Signal()
		};

	store.load("user", userId).then(function(loadedUser) {
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
};