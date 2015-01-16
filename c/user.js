var store = require('../server/store.js'),
	miso = require('../server/miso.util.js');

//	Index user
module.exports.index = function(params) {
	var scope = {
			users: [],
			onReady: new miso.readyBinder()
		};

	store.load('user').then(function(loadedUsers) {
		scope.users = loadedUsers;
		scope.onReady.ready();
	});

	return scope;
};

//	Edit user
module.exports.edit = function(params) {
	var userId = miso.getParam('user_id', params),
		scope = {
			user: null,
			isServer: miso.isServer(),
			onReady: new miso.readyBinder()
		};

	store.load('user', userId).then(function(loadedUser) {
		scope.user = loadedUser;
		scope.onReady.ready();
	});

	return scope;
};