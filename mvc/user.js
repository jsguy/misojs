var store = require('../server/store.js')(this),
	miso = require('../server/miso.util.js'),
	m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Index user
module.exports.index = {
	controller: function(params) {
		var self = this;
		this.users = [];

		store.load('user', 1).then(function(loadedUsers) {
			self.users = loadedUsers;
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
	model: function(data){
		this.name = m.p(data.name);
		this.id = m.p(data.id);
		return this;
	},
	controller: function(params) {
		var self = this,
			userId = miso.getParam('user_id', params);

		store.load('user', userId).then(function(user) {
			self.user = new module.exports.edit.model(user);
		});

		return self;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV('Hello ' + ctrl.user.name() + '!');
		}
	}
};