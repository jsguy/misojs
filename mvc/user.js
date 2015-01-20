var store = require('../server/store.js')(this),
	validator = require('validator'),
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

var isNotEmpty = function(value){
	return typeof value !== "undefined" && value !== "" && value !== null;
}

//	Edit user
module.exports.edit = {
	model: function(data){
		var self = this;
		self.name = m.p(data.name);
		self.email = m.p(data.email);
		self.id = m.p(data.id);
		
		//	Returns object with each filed, with true for each valid field,
		//	or an error messages for each invalid field.
		this.validateModel = function(){
			// return {
			// 	email: isNotEmpty() && validator.isEmail(self.email())? true: "Must be a valid email address",
			// }
			return {
				name: {
					'required': "You must enter a name"
				},
				email: {
					'required': "You must enter an email address",
					'email': "Must be a valid email address"
				}
			}
		};

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