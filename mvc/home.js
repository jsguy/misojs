var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Home page
module.exports.index = {
	controller: function(){
		this.installButtonText = "Install miso now";
		this.installButtonLink = "#install";
		//this.introText = "Create apps faster than ever before";

		//	TODO: Add animation from mithril.animate

		this.introText = "Create isomorphic JavaScript apps in a snap!";
		this.install = function(){
			var h = "installation";
			var top = document.getElementById(h).offsetTop;
		    window.scrollTo(0, top);
		    console.log()
		};
		return this;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV([
				DIV({ class: "intro" }, [
					DIV({ class: "introText" }, ctrl.introText),
					BUTTON({ class: "installButton", onclick: ctrl.install }, ctrl.installButtonText )
				]),
				DIV({ class: "cw" }, [
					H2({id: "installation"}, A({name: "installation", class: "heading"},"Installation") ),
					P("To install miso, use npm:"),
					PRE({ class: "javascript" },[
						CODE("npm install misojs -g")
					])
				]),
				DIV({ class: "cw" }, [
					H2(A({name: "gettingstarted", class: "heading"},"Getting started") ),
					P("To create and run a new app in the current directory:"),
					PRE({ class: "javascript" },[
						CODE("miso -n myApp\ncd myApp && npm install\nmiso run")
					]),
					P("Congratulations, you are now running your very own miso app!")
				]),
				DIV({ class: "cw" }, [
					UL([
						LI(A({ href: '/todos', config: m.route}, "Todos example (single url SPA)")),
						LI(A({ href: '/users', config: m.route}, "Users example (multiple url SPA)"))
					])
				])
			]);
		}
	}
};