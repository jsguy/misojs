/*	


	WIP: This should be a generated file that we use as "main" for browserify...




*/
var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	store = require('../server/store.js'),
	//getParam = require('../server/get')
	home = require('../c/home'),
	user = require('../c/user');

//	Expose to window
// if(typeof window !== "undefined") {
// 	window.m = m;
// }

m.route.mode = "pathname";
m.route(document.body, '/', {
	"/": {
		controller: home.home,
		view: function(ctrl){
			with(sugartags) {
			return 	DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
					DIV('Hello ', ctrl.name, { rotate: ctrl.rotate }),
					A({ href: '/user/1', config: m.route}, "User")
				])
			} 
		}
	},
	"/user/:user_id":{
		controller: user.edit,
		view: function(ctrl){
			with(sugartags) {
				return DIV('Hello ' + ctrl.user.name + '! Server: ' + ctrl.isServer)
			}
		}
	}
});
