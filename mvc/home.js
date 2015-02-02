var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Home page
module.exports.index = {
	controller: function(){
		this.installButtonText = "Install miso now";
		this.installButtonLink = "#install";
		//this.introText = "Create apps faster than ever before";
		this.introText = "Create tiny efficient isomorphic JS apps in a snap!";
		this.install = function(){
			var h = "installation";
			// 	url = location.href;
			// location.href = "#" + h;
			// history.replaceState(null,null,url);


var top = document.getElementById(h).offsetTop; //Getting Y of target element
    window.scrollTo(0, top);        

		};
		return this;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV([
				DIV({ class: "intro" }, [
					DIV({ class: "introText" }, ctrl.introText ),
					BUTTON({ class: "installButton", onclick: ctrl.install }, ctrl.installButtonText )
				]),
				DIV({ class: "box" }, [
					H2({id: "installation"}, A({name: "installation", class: "heading"},"Installation") ),
					P("To install miso, use npm:"),
					PRE({ class: "javascript" },[
						CODE("npm install misojs -g")
					])
				]),
				DIV({ class: "box" }, [
					H2(A({name: "gettingstarted", class: "heading"},"Getting started") ),
					P("To create and run a new app in the current directory:"),
					PRE({ class: "javascript" },[
						CODE("miso -n myApp\ncd myApp && npm install\nmiso run")
					]),
					P("Congratulations, you are now running your very own miso app!")
				]),
				DIV({ class: "box" }, [
					UL([
						LI(A({ href: '/todos', config: m.route}, "Todos example (single url SPA)")),
						LI(A({ href: '/users', config: m.route}, "Users example (multiple url SPA)"))
					])
				])
			]);
		}
	}
};