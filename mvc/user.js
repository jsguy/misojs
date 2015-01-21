var store = require('../server/store.js')(this),
	miso = require('../server/miso.util.js'),
	validate = require('../common/miso.validate.js'),
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
		this.email = m.p(data.email);
		this.id = m.p(data.id);
		
		//	Returns object with each filed, with true for each valid field,
		//	or an error messages for each invalid field.
		this.isValid = validate.validate(this, {
			name: {
				'isRequired': "You must enter a name"
			},
			email: {
				'isRequired': "You must enter an email address",
				'isEmail': "Must be a valid email address"
			}
		});

		return this;
	},
	controller: function(params) {
		var self = this,
			userId = miso.getParam('user_id', params);

		store.load('user', userId).then(function(user) {
			user.email = "isNOTemail.com";
			self.user = new module.exports.edit.model(user);

			//	Testing...
			console.log(self.user.isValid());
			console.log(self.user.isValid('name'));
			console.log(self.user.isValid('email'));

		});

		return self;
	},
	view: function(ctrl){
		with(sugartags) {
			return [
				DIV([
					LABEL("Name"),
					INPUT({value: ctrl.user.name()})
				]),
				DIV({class: ctrl.user.isValid('email')? "valid": "invalid"}, [
					LABEL("Email"),
					INPUT({value: ctrl.user.email()})
				])
			];
		}
	}
};