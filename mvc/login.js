/* Example login mvc */
var m = require('mithril'),
	miso = require('../modules/miso.util.js'),
	mdl = require('mithril.component.mdl')(m),
	sugartags = require('mithril.sugartags')(m),
	authentication = require('../system/api/authentication/api.server.js')(m),
	session = require('../system/api/session/api.server.js')(m);

var index = module.exports.login = {
	models: {
		login: function(data){
			this.url = data.url;
			this.isLoggedIn = m.prop(false);
			this.username = m.prop(data.username||"");
			this.password = m.prop("");
		}
	},
	controller: function(params) {
		var ctrl = this,
			url = miso.getParam('url', params),
			logout = miso.getParam('logout', params);

		ctrl.model = new index.models.login({url: url});

		//	Note: this does not execute on the server as it 
		//	is a DOM event.
		ctrl.login = function(e){
			e.preventDefault();
			//	Call the server method to see if we're logged in
			authentication.login({type: 'login.index.login', model: ctrl.model}).then(function(data){
				if(data.result.isLoggedIn == true) {
					//	Woot, we're in!
					misoGlobal.isLoggedIn = true;
					misoGlobal.user = data.result.user;
					ctrl.model.isLoggedIn(true);

					console.log("Welcome " + misoGlobal.user.name + ", you've been logged in");

					//	Will show the username when logged in
					misoGlobal.renderHeader();

					if(url){
						m.route(url);
					} else {
						//	Go to default URL?
						m.route("/");
					}
				} else {
					//	Nope, nope, nope
					console.log("Invalid username/password combination");
				}
			});
			return false;
		};

		if(logout) {
			//	TODO: Handle error
			authentication.logout({}).then(function(data){
				console.log("You've been logged out");
				//	Woot, we're out!
				ctrl.model.isLoggedIn(false);
				// misoGlobal.isLoggedIn = false;
				// delete misoGlobal.userName;
				//	Will remove the username when logged out
				misoGlobal.renderHeader();
			});
		}

		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV({"class": "cw cf"}, 
				ctrl.model.isLoggedIn()? "You've been logged in": [
				DIV(ctrl.model.url? "Please log in to go to " + ctrl.model.url: "Please log in"),
				FORM({ onsubmit: ctrl.login }, [
					DIV(
						INPUT({ type: "text", value: ctrl.model.username, placeholder: "Username"})
					),
					DIV(
						INPUT({ type: "password", value: ctrl.model.password})
					),
					mdl.mButton({type: "submit", text: "Login"})
				])
			]);
		}
	},
	authenticate: false
};