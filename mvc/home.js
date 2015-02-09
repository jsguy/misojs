var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Animation binder
var aniLetters = function(prop, delay){
	return function(el){
		(typeof window !== 'undefined') && setTimeout(function(){
			var value = prop()? 1: 0;
			m.animateProperties(el, {
				scale: (value * 10) + 1,
				opacity: 1-value,
				duration: "1s"
			});
		}, delay * 100);
	};
};

//	Home page
var self = module.exports.index = {
	models: {
		intro: function() {
			this.text = m.p("Create isomorphic JavaScript apps in a snap!");
			this.ani = m.p(0);
		}
	},
	controller: function(){
		var ctrl = this;
		ctrl.installButtonText = "Install miso now";
		ctrl.installButtonLink = "#install";

		ctrl.install = function(){
			var h = "installation";
			var top = document.getElementById(h).offsetTop;
		    window.scrollTo(0, top);
		};

		ctrl.model = new self.models.intro();
		return this;
	},
	view: function(ctrl){
		var o = ctrl.model;
		with(sugartags) {
			return DIV([
				DIV({ class: "intro" }, [
					DIV({ class: "introText" },[
						o.text().split("").map(function(t, i){
							t = (t == " ")? "&nbsp;": t;
							return SPAN({config: aniLetters(o.ani, i)}, m.trust(t));
						})
					]),
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