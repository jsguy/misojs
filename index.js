/*
	Isomorphic mirthril "misojs.com"

	Express-based isomorphic framework

	. Small base browser JS footprint (< 50kb gzip/minified)
	. Ability to render the page HTML in the first request, no matter what URL (It's quicker for the user, and would wrok with SEO without magic), subsequent pages are rendered in the browser
	. Ability to load specific routes on demand, instead of bundling everything (Small to medium sized Meteor apps have 1mb+ JS, this is not acceptable)
	. We will need a way to specify client and server specific JS
	. Need ability to auto-generate API based on model - prefer singleton on startup over generator (same thing really, just different invocation)
	. 


	Read:

	https://gist.github.com/StephanHoyer/bddccd9e159828867d2a


*/


var m = require('mithril'),
	render = require('mithril-node-render'),
	sugartags = require('./mithril.sugartags.node.js')(m),
	fs = require('fs'),
	vm = require('vm'),
	getView = function(fileName){
		return fs.readFileSync("view/" + fileName, "utf8");
	},
	//	Render a view
	renderView = function(view, ctrl){
		var script = vm.createScript(view, 'theview.js');
		sugartags.ctrl = ctrl;
		return render(script.runInNewContext(sugartags), ctrl);
	},
	//	Should make requests to our API only, so we get a predictable 
	//	URL pattern that can be mapped back to the controller, so that
	//	we can run it directly on the backend
	mRequest = function(xhrOptions){

	};


var view = getView("pagelinks.js"),
	ctrl = {
		pages: function() {
			var l = [];
			for(var i = 0; i < 10000; i += 1) {
				l.push({ url: "/page" + i, title: "page " + i });
			}
			return l;
		}
	};

console.log(renderView(view, ctrl));


/*


//namespace
var app = {};

//model
app.PageList = function() {
	return m.request({method: "GET", url: "pages.json"});
};

//controller
app.controller = function() {
	var pages = app.PageList();
	return {
		pages: pages,
		rotate: function() {
			pages().push(pages().shift());
		}
	}
};

//view
app.view = function(ctrl) {
	return [
		ctrl.pages().map(function(page) {
			return m("a", {href: page.url}, page.title);
		}),
		m("button", {onclick: ctrl.rotate}, "Rotate links")
	];
};

//initialize
m.module(document.getElementById("example"), app);






 */