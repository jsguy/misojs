var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	docs = require('../server/miso.documentation.js');

var index = module.exports.index = {
	models: {
		//	Our model
		hello: function(data){
			this.who = m.p(data.who);
		}
	},
	controller: function(params) {
		this.model = new index.models.hello({
			docs: docs()
		});
		return this;
	},
	view: function(ctrl) {
		var model = ctrl.model;
		with(sugartags) {
			return [
				DIV("Hello " + model.who()),
				A({href: "/hello/Leo", config: m.route}, "Click me for the edit action")
			];
		}
	}
};

var edit = module.exports.edit = {
	controller: function(params) {
		var who = miso.getParam('hello_id', params);
		this.model = new index.models.hello({who: who});
		return this;
	},
	view: function(ctrl) {
		var model = ctrl.model;
		with(sugartags) {
			return [
				//DIV("Hello " + model.who())
			];
		}
	}
};