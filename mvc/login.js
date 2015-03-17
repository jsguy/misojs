/* Example login mvc */
var m = require('mithril'),
	miso = require('../modules/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	ldb = require('../modules/api/authentication/api.server.js')(m);

var index = module.exports.index = {
	models: {
		login: function(data){
			this.url = data.url;
			this.username = m.prop(data.username||"");
			this.password = m.prop("");
		}
	},
	//	args: {params, query, session}
	controller: function(params) {

		var display = "dude";

		//	session is only ever on the server side,
		//	so here the below code only ever runs on
		//	the server.
		//	Now, how to we get it to the client?
		//
		//	Idea: use an api endpoint 
		//	that can be used to store/get session
		//	info. We need to load the session info
		//	when the page is loaded, so we need a way 
		//	to pass in req.session somehow on each request
		if(params && params.session) {
			//console.log('session', params.session);
			params.session.who = "World";
			display = params.session.who;
		}


		var ctrl = this,
			url = miso.getParam('url', params);

		ctrl.who = m.prop(display);

		ctrl.model = new index.models.login({url: url});

		//	NOTE: THIS NEVER EXECUTES ON THE BACKEND, AS IT IS AN EVENT
		ctrl.login = function(e){
			e.preventDefault();
			ldb.login({type: 'login.index.login', model: ctrl.model}).then(function(data){
				//console.log('response', data);
				//	if data === true, redirect to the url,
				//	as we are now logged in.
			});
			return false;
		}

		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return [
				DIV("G'day "+ctrl.who()+", you need to log in to go to " + ctrl.model.url),
				FORM({ onsubmit: ctrl.login }, [
					INPUT({ type: "text", value: ctrl.model.username, placeholder: "Username"}),
					INPUT({ type: "password", value: ctrl.model.password}),
					BUTTON({ type: "submit"}, "Login")
				])
			]
		}
	}
};