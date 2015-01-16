/* NOTE: This is a generated file, please do not modify, your changes will be lost */
var m = require('mithril');
var sugartags = require('../server/mithril.sugartags.node.js')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var store = require('../server/store.js');
var todo = require('../mvc/todo');
if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.body, '/', {
'/todo': todo
});