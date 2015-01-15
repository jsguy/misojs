var Signal = require('signals'),
	store = require('../server/store.js'),
	miso = require('../server/miso.util.js');

/*
	TODO

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
	var userId = miso.getParam('user_id', params),
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