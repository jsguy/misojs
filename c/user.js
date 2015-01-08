var Signal = require('signals'),
	store = GLOBAL.store,
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

	store.load("user", userId).then(function(loadedUser) {
		console.log('and then...', loadedUser);
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
};

//	Index, edit, create, update, delete