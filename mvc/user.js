var store = require('../server/store.js'),
	miso = require('../server/miso.util.js'),
	m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Index user
module.exports.index = {
	controller: function(params) {
		var self = this;
		this.users = [];
		this.onReady = new miso.readyBinder();

		store.load('user').then(function(loadedUsers) {
			self.users = loadedUsers;
			self.onReady.ready();
		});

		return self;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV('All the users would be listed here');
		}
	}
};

//	Edit user
module.exports.edit = {
	controller: function(params) {
		var self = this,
			userId = miso.getParam('user_id', params);

		console.log('user id', userId);

		self.user = null;
		self.isServer = miso.isServer();
		self.onReady = new miso.readyBinder();

		store.load('user', userId).then(function(loadedUser) {
			self.user = loadedUser;
			self.onReady.ready();
		});

		return self;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV('Hello ' + ctrl.user.name + '!');
		}
	}
};