var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m);

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


	/*

		This is how we do

		TODO: 
		* This will show screenshots with annotations, 60/40 split
		* From start to finish creating the todo app


		What's miso all about?

		Stats:

		* Full stack isomorphic framework - uses Mithril MVC on both client and server
		* Tiny footprint - less than 25kb (gzipped and minified)
		* Open source (MIT licensed) - do what you like, the code is fully open source

		Fun to work with:

		* Fast live-code reload - smarter reload to help you work faster
		* High performance - virtual dom engine, tiny footprint, fast as!
		* Much less code - create a deployable app in less than 30 lines of code
		
		Built using high quality open source software including:

		* Node.js
		* Express 4
		* Browserify
		* Mithril


		Why miso?

		* Tiny footprint - other isomorphic frameworks have huge footprints (~400kb or more)
		* Really fast to work with - other isomorphic frameworks take forever to update when developing
		* Data store adaptors - create an adaptor for storing data on anything!

		What state is the project in?

		* The project is deployable as-is!
		* We are adding more core features, such as sessions, use managements, etc.
		


	*/


	view: function(ctrl){
		var o = ctrl.model;
		with(sugartags) {
			return DIV([
				DIV({class: "intro"}, [
					DIV({class: "introText"},[
						o.text().split("").map(function(t, i){
							t = (t == " ")? "&nbsp;": t;
							return SPAN({config: aniLetters(o.ani, i)}, m.trust(t));
						})
					]),
					BUTTON({class: "installButton", onclick: ctrl.install }, ctrl.installButtonText )
				]),


				DIV({class: "cw"}, [
					H2(A({name: "installation", class: "heading"},"What is miso?") ),
					P("Miso is an open source isomorphic javascript framework that allows your to write complete apps with much less effort than other frameworks. It utalises excellent open source libraries and frameworks to create an extremely efficient full web stack. These frameworks include:"),
					DIV({class: "frameworks"}, [
						DIV({class: "fwcontainer cf"},[
							SPAN({class: "fw mithril"}),
							SPAN({class: "fw express"}),
							SPAN({class: "fw browserify"}),
							SPAN({class: "fw nodemon"})
						])
					]),
				]),

				DIV({class: "cw"}, [
					H2({id: "installation"}, A({name: "installation", class: "heading"},"Installation") ),
					P("To install miso, use npm:"),
					PRE({class: "javascript"},[
						CODE("npm install misojs -g")
					])
				]),

				DIV({class: "cw"}, [
					H2(A({name: "gettingstarted", class: "heading"},"Getting started") ),
					P("To create and run a new app in the current directory:"),
					PRE({class: "javascript"},[
						CODE("miso -n myApp\ncd myApp && npm install\nmiso run")
					]),
					P("Congratulations, you are now running your very own miso app!")
				]),

				DIV({class: "cw"}, [
					H2(A({name: "examples", class: "heading"},"Examples")),
					UL([
						LI(A({ href: '/todos', config: m.route}, "Todos example (single url SPA)")),
						LI(A({ href: '/users', config: m.route}, "Users example (multiple url SPA)"))
					])
				])
			]);
		}
	}
};