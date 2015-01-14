//	TODO: This should be a generated file that we use as "main" for browserify...

var m = require('mithril'),
	home = require('home'),
	user = require('user');

m.route.mode = "pathname";
m.route(document.body, '/', {
	"/": {
		controller: home,
		view: function(ctrl){
			return DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
				DIV('Hello ', ctrl.name, { rotate: ctrl.rotate }),
				A({ href: '/user/1', config: m.route}, "User")
			]) 
		}
	}
});
