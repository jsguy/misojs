/* NOTE: This is a generated file, please do not modify, your changes will be lost */
var m = require('mithril');
var sugartags = require('../server/mithril.sugartags.node.js')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var store = require('../server/store.js');
var home = require('../c/home');
var user = require('../c/user');

if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.body, '/', {
'/': {
	controller: home.home,
	view: function(ctrl){
		with(sugartags) {
			return 	DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
	DIV("G'day ", ctrl.name, { rotate: ctrl.rotate }),
	A({ href: '/user/1', config: m.route}, "User")
])
		}
	}
},
'/users': {
	controller: user.index,
	view: function(ctrl){
		with(sugartags) {
			return 	DIV('All the users would be listed here')
		}
	}
},
'/user/:user_id': {
	controller: user.edit,
	view: function(ctrl){
		with(sugartags) {
			return 	DIV('Hello ' + ctrl.user.name + '! Server: ' + ctrl.isServer)
		}
	}
}
});