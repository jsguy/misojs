/*
	This is a sample user management app that uses the 
	multi url miso pattern.
*/
var //store = require('../server/store.js')(this),
	miso = require('../server/miso.util.js'),
	validate = require('validator.modelbinder'),
	m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m),
	bindings = require('../server/mithril.bindings.node.js')(m);

var api = require('../system/api.server.js')(m, this);

//	TODO: This might be a useful practice - use self as module.exports
var self = module.exports;

//	TODO: Ability to load this from a separate file?
var editView = function(ctrl){
	with(sugartags) {
		return [
			H2({class: "pageHeader"}, ctrl.header),
			DIV([
				LABEL("Name"), INPUT({value: ctrl.user.name}),
				DIV({class: ctrl.user.isValid('name') == true? "valid": "invalid"}, [
					ctrl.user.isValid('name') == true? "": ctrl.user.isValid('name').join(", ")
				])
			]),
			DIV([
				LABEL("Email"), INPUT({value: ctrl.user.email}),
				DIV({class: (ctrl.user.isValid('email') == true? "valid": "invalid") + " indented" }, [
					ctrl.user.isValid('email') == true? "": ctrl.user.isValid('email').join(", ")
				])
			]),
			DIV({class: "indented"},[
				BUTTON({onclick: ctrl.save, class: "positive"}, "Save user")
			])
		];
	}
};


//	Index user
module.exports.index = {
	controller: function(params) {
		var ctrl = this;

		ctrl.vm = {
			userList: function(users){
				this.users = m.p(users);
			}
		};

		api.find({type: 'user.edit.user'}).then(function(users) {
			var list = Object.keys(users).map(function(key) {
				return new self.edit.models.user(users[key]);
			});

			ctrl.users = new ctrl.vm.userList(list);
		}, function(){
			console.log('Error', arguments);
		});

		return this;
	},
	view: function(ctrl){
		var c = ctrl,
			u = c.users;
		with(sugartags) {
			return UL([
				u.users().map(function(user, idx){
					return LI({}, "name:" + user.name);
				})
			])
		}
	}
};

//	New user
module.exports.new = {
	controller: function(params) {
		var ctrl = this;
		ctrl.user = self.edit.models.user({});
		ctrl.header = "New user";

		ctrl.save = function(){
			api.save({ type: 'user.edit.user', model: ctrl.user } ).then(function(){
				console.log("Saved", arguments);
			});
		};
		return ctrl;
	},
	view: editView
};


//	Edit user
module.exports.edit = {
	models: {
		user: function(data){
			this.name = m.p(data.name);
			this.email = m.p(data.email);
			this.id = m.p(data.id);

			//	Validate the model		
			this.isValid = validate.bind(this, {
				name: {
					'isRequired': "You must enter a name"
				},
				email: {
					'isRequired': "You must enter an email address",
					'isEmail': "Must be a valid email address"
				}
			});

			return this;
		}
	},
	controller: function(params) {
		var ctrl = this,
			userId = miso.getParam('user_id', params);

		ctrl.header = "Edit user " + userId;

		// store.load('user', userId).then(function(user) {
		// 	user.email = "is_email.com";
		// 	ctrl.user = new module.exports.edit.models.user(user);
		// });

		//	Load our user
		api.find({type: 'user.edit.user', _id: userId}).then(function(user) {
			ctrl.user = self.edit.models.user(user);
		}, function(){
			console.log('Error', arguments);
		});

		ctrl.save = function(){
			// //	Type of model, and the data
			// store.save('user.edit.models.user', ctrl.user).then(function(res){
			// 	console.log(res.result? res.result: res.error);
			// });


			api.save({ type: 'todo.index.todo', model: newTodo } ).then(function(){
				console.log("Saved", arguments);
			});

		};

		return ctrl;
	},
	view: editView
};