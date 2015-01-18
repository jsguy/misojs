/* NOTE: This is a generated file, please do not modify, your changes will be lost */
var m = require('mithril');
var sugartags = require('../server/mithril.sugartags.node.js')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var store = require('../server/store.js');
var home = require('../mvc/home.js');
var user = require('../mvc/user.js');
var todo = require('../mvc/todo.js');

if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.getElementById('misoAttachment'), '/', {
'/': home.index,
'/user/:user_id': user.edit,
'/todo': todo.index,
'/user': user.index
});