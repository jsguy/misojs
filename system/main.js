/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var m = require('mithril');
var sugartags = require('../server/mithril.sugartags.node.js')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var store = require('../server/store.js');
var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var todo = require('../mvc/todo.js');


if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.getElementById('misoAttachmentNode'), '/', {
'/users/new': user.new,
'/': home.index,
'/todos': todo.index,
'/user/:user_id': user.edit,
'/users': user.index
});