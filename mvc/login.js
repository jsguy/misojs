/* Example login mvc */
var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	ldb = require('../modules/adaptor/login/api.server.js')(m);

var index = module.exports.index = {
	models: {
		login: function(data){
			this.url = data.url;
			this.username = m.prop(data.username||"");
			this.password = m.prop("");
		}
	},
	controller: function(params) {
		var ctrl = this,
			url = miso.getParam('url', params);

		ctrl.model = new index.models.login({url: url});

		ctrl.login = function(e){
			e.preventDefault();
			ldb.login({type: 'login.index.login', model: ctrl.model}).then(function(data){
				console.log('response', data);
			});
			return false;
		}

		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return [
				DIV("G'day, you need to log in to go to " + ctrl.model.url),
				FORM({ onsubmit: ctrl.login }, [
					INPUT({ type: "text", value: ctrl.model.username, placeholder: "Username"}),
					INPUT({ type: "password", value: ctrl.model.password}),
					BUTTON({ type: "submit"}, "Login")
				])
			]
		}
	}
};