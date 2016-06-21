var m = require('mithril'),
	mdl = require('mithril.component.mdl')(m),
	sugartags = require('mithril.sugartags')(m),
	miso = require('../modules/miso.util.js'),
	smoothScroll = require('../public/js/mithril.smoothscroll.js');

//	Home page - 
var self = module.exports.index = {
	models: {
		intro: function() {
			this.headerText = "<img class='miso-logo' src='/img/miso_logo_mfirst.png'>";
			this.textByline = m.p("CREATE APPS IN A SNAP");
			this.scrollOffset = m.p();
		}
	},
	controller: function(){
		var ctrl = this;

		ctrl.model = new self.models.intro();

		miso.setHeader(ctrl.model.headerText);

		return this;
	},

	view: function(ctrl){
		var o = ctrl.model;
		with(sugartags) {
			return DIV({"class": "main-container"}, [
				DIV({"class": "box box--even intro"},
					DIV({"class": "inner inner--intro"}, [
						DIV({"class": "intro-byline"}, o.textByline()),
						H1({"class": "intro-heading"}, "UNIVERSAL JAVASCRIPT APPS"),
						P({"class": "intro-text"}, "Miso.js is a framework that enables you to create sites and apps for desktop and mobile"),
						mdl.mLinkButton({text: "Install miso now", config: smoothScroll(ctrl), href: "#installation"})
					])
				),

				DIV({"class": "box box--odd"}, 
					DIV({"class": "inner"}, [
						H2(A({name: "what", "class": "heading"},"What is miso?") ),
						P("Miso is an open source isomorphic javascript framework that allows you to write complete apps with much less effort than other frameworks. Miso features:",[
							UL({"class": "dotList"}, [
								LI("Much less code - create a deployable app in less than 30 lines of code"),
								LI("Single page app with serverside rendered HTML - works perfectly with SEO and older browsers"),
								LI("Beautiful URL routing system: automate some routes, take full control of others"),
								LI("Smart live-code reload - auto reload to help you develop faster"),
								LI("Open source - MIT licensed")
							])
						]),
						P("Miso utilises excellent open source libraries and frameworks to create an extremely efficient full web stack.")
					])
				),

				DIV({"class": "box box--even"},
					DIV({"class": "inner"}, [
						H2(A({name: "gettingstarted", "class": "heading"},"Getting started") ),
						H3({id: "installation"}, A({name: "installation", "class": "heading"},"Installation") ),
						P("To install miso, use npm:"),
						PRE({"class": "javascript"},[
							CODE("npm install misojs -g")
						]),
						H3({id: "create"}, A({name: "create", "class": "heading"},"Create an app") ),
						P("To create and run a miso app in a new directory:"),
						PRE({"class": "javascript"},[
							CODE("miso -n myApp\ncd myApp\nmiso run")
						]),
						P("Congratulations, you are now running your very own miso app in the 'myApp' directory!")
					])
				),

				DIV({"class": "box box--odd"},
					DIV({"class": "inner"}, [
						H2(A({name: "examples", "class": "heading"},"Examples")),
						UL([
							LI(A({ href: '/todos', config: m.route}, "Todos example (single url SPA)")),
							LI(A({ href: '/users', config: m.route}, "Users example (multiple url SPA)"))
						]),
						H2({name: "documentation", "class": "heading"}, "Documentation"),
						A({href:"/docs"}, "Documentation can be found here")
					])
				)
			]);
		}
	}
};
