var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	db = require('../modules/adaptor/adapt/api.server.js')(m);

var edit = module.exports.edit = {
	models: {
		hello: function(data){
			this.who = m.prop(data.who);
		}
	},
	controller: function(params) {
		var ctrl = this,
			who = miso.getParam('adapt_id', params);

		db.hello({}).then(function(data){
			ctrl.model.who(data.result);
		});

		ctrl.model = new edit.models.hello({who: who});
		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV("G'day " + ctrl.model.who());
		}
	}
};