var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Home page
module.exports.index = {
	controller: function(){
		this.installButton = "Install miso now";
		this.installButtonLink = "#install";
		//this.introText = "Create apps faster than ever before";
		this.introText = "Create tiny efficient isomorphic JS apps in a snap!";
		return this;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV([
				DIV({ class: "intro" }, [
					DIV({ class: "introText" }, ctrl.introText ),
					BUTTON({ class: "installButton" }, ctrl.installButton )
				]),
				DIV({ class: "box" }, [
					H2(A({name: "installation", class: "heading"},"Installation") ),
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
						LI(A({ href: '/user/1', config: m.route}, "User edit example")),
						LI(A({ href: '/todos', config: m.route}, "Todos example"))
					])
				])
			]);
		}
	}
};