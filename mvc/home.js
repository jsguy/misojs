var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Home page
module.exports.index = {
	controller: function(){
		this.installButton = "Install miso now";
		this.introText = "Create apps faster than ever before";
		return this;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV([
				DIV({ class: "intro" }, [
					DIV({ class: "introText" }, ctrl.introText ),
					BUTTON({ class: "installButton" }, ctrl.installButton ),
				]),
				UL([
					LI(A({ href: '/user/1', config: m.route}, "User edit example")),
					LI(A({ href: '/todos', config: m.route}, "Todos example"))
				])
			]);
		}
	}
};