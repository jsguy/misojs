var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m);

var self = module.exports.index = {
	controller: function(params) {
		return this;
	},
	view: function(ctrl) {
		with(sugartags) {
			return [
				H1("Welcome to miso"),
				P("This is an empty project, please change it into something awesome."),
				A({href: "http://misojs.com/doc/Getting-started.md", target: "_blank"}, "Read the getting started guide")
			]
		};
	}
};