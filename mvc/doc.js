var m = require('mithril'),
	miso = require('../modules/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	//	Grab the generated client version...
	docs = require('../public/miso.documentation.js');

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
			return DIV({"class": "doc cw"}, [
				DIV("Below is a list of documentation for miso:"),
				UL([
					miso.each(model.docs, function(doc, key){
						//	Skip home page...
						if(key !== "Home.md") {
							return LI(
								A({href: "/doc/" + key, config: m.route}, model.niceName(key))
							);
						} 
					})
				]),
				DIV("Examples:"),
				UL([
					LI(A({href: "/todos", config: m.route}, "Todos example")),
					LI(A({href: "/users", config: m.route}, "Users example"))
				]),
				//	Use manual prism, so that it works in SPA mode
				SCRIPT({src: "/external/prism/prism.js", "data-manual": ""})
			]);
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
			return DIV({"class": "doc cw"}, [
				LINK({href: "/external/prism/prism.css", rel: "stylesheet"}),
				H1(model.niceName(model.id)),
				ARTICLE(m.trust(model.docs[model.id])),
				//	Use manual prism, so that it works in SPA mode
				SCRIPT({src: "/external/prism/prism.js", "data-manual": ""}),
				SCRIPT("Prism.highlightAll();")
			]);
		}
	}
};