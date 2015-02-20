var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	docs = require('../server/miso.documentation.js');

var index = module.exports.index = {
	models: {
		//	Our model
		docs: function(data){
			this.docs = data.docs;
			this.id = data.id;
			this.niceName = function(name){
				return name.substr(0,name.lastIndexOf(".md")).split("-").join(" ");
			};
		}
	},
	controller: function(params) {
		this.model = new index.models.docs({
			docs: docs()
		});
		return this;
	},
	view: function(ctrl) {
		var model = ctrl.model;
		with(sugartags) {
			return [
				UL([
					miso.each(model.docs, function(doc, key){
						return LI(
							A({href: "/doc/" + key, config: m.route}, model.niceName(key))
						);
					})
				])
			];
		}
	}
};

var edit = module.exports.edit = {
	controller: function(params) {
		var doc_id = miso.getParam('doc_id', params);
		this.model = new index.models.docs({
			docs: docs(),
			id: doc_id
		});
		return this;
	},
	view: function(ctrl) {
		var model = ctrl.model;
		with(sugartags) {
			return [
				STYLE(""),
				H2(model.niceName(model.id)),
				DIV({"class": ""}, m.trust(model.docs[model.id]))
			];
		}
	}
};