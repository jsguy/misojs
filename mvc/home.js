var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	smoothScroll = require('../public/js/mithril.smoothscroll.js');

//	Home page
var self = module.exports.index = {
	models: {
		intro: function() {
			this.text = m.p("Create apps in a snap!");
			this.ani = m.p(0);
			this.demoImgSrc = m.p("img/misodemo.gif");
		}
	},
	controller: function(){
		var ctrl = this;

		ctrl.replay = function(){
			var tmpSrc = ctrl.model.demoImgSrc();
			ctrl.model.demoImgSrc("");
			setTimeout(function(){
				ctrl.model.demoImgSrc(tmpSrc);
			},0);
		};

		ctrl.model = new self.models.intro();
		return this;
	},

	view: function(ctrl){
		var o = ctrl.model;
		with(sugartags) {
			return DIV([
				DIV({"class": "intro"}, [
					DIV({"class": "introText"}, o.text()),
					DIV({"class": "demoImg"}, [
						IMG({id: "demoImg", src: o.demoImgSrc()}),
						SPAN({"class": "replayButton", onclick: ctrl.replay}, "Replay")
					]),
					A({"class": "installButton", config: smoothScroll(ctrl), href: "#installation"}, "Install miso now")
				]),

				DIV({"class": "cw"}, [
					H2(A({name: "what", "class": "heading"},"What is miso?") ),
					P("Miso is an open source isomorphic javascript framework that allows you to write complete apps with much less effort than other frameworks. Miso features:",[
						UL({"class": "dotList"}, [
							LI("Single page apps with serverside rendered HTML for the first page - works perfectly with SEO and older browsers"),
							LI("Beautiful URLs - with a flexible routing system: automate some routes, take full control of others"),
							LI("Tiny clientside footprint - less than 25kb (gzipped and minified)"),
							LI("Fast live-code reload - smarter reload to help you work faster"),
							LI(["High performance - virtual dom engine, tiny footprint, faster than the rest", A({href: "http://lhorie.github.io/mithril/benchmarks.html", target: "_blank"}, "*")]),
							LI("Much less code - create a deployable app in less than 30 lines of code"),
							LI("Open source - MIT licensed")
						])
					]),
					P("Miso utilises excellent open source libraries and frameworks to create an extremely efficient full web stack. These frameworks include:"),
					DIV({"class": "frameworks"}, [
						DIV({"class": "fwcontainer cf"},[
							A({"class": "fwLink", href: "http://lhorie.github.io/mithril/", target: "_blank"},
							SPAN({"class": "fw mithril"})),
							A({"class": "fwLink", href: "http://expressjs.com/", target: "_blank"},SPAN({"class": "fw express"})),
							A({"class": "fwLink", href: "http://browserify.org/", target: "_blank"},SPAN({"class": "fw browserify"})),
							A({"class": "fwLink", href: "http://nodemon.io/", target: "_blank"},SPAN({"class": "fw nodemon"}))
						])
					])
				]),

				DIV({"class": "cw"}, [
					H2({id: "installation"}, A({name: "installation", "class": "heading"},"Installation") ),
					P("To install miso, use npm:"),
					PRE({"class": "javascript"},[
						CODE("npm install misojs -g")
					])
				]),

				DIV({"class": "cw"}, [
					H2(A({name: "gettingstarted", "class": "heading"},"Getting started") ),
					P("To create and run a miso app in a new directory:"),
					PRE({"class": "javascript"},[
						CODE("miso -n myApp\ncd myApp\nmiso run")
					]),
					P("Congratulations, you are now running your very own miso app in the 'myApp' directory!")
				]),

				DIV({"class": "cw"}, [
					H2(A({name: "examples", "class": "heading"},"Examples")),
					UL([
						LI(A({ href: '/todos', config: m.route}, "Todos example (single url SPA)")),
						LI(A({ href: '/users', config: m.route}, "Users example (multiple url SPA)"))
					]),
					H2({name: "documentation", "class": "heading"}, "Documentation"),
					A({href:"https://github.com/jsguy/misojs/wiki", target: "_blank"}, "Documentation can be found on the wiki")
				])
			]);
		}
	}
};
