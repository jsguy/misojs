/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var m = require('mithril');
var sugartags = require('../server/mithril.sugartags.node.js')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var animate = require('../client/mithril.animate.js')(m);
var restrictions = require('../server/miso.restrictions.js');
var restrict = function(route, actionName){
	return route;

};
var restrictObj = ({"_COMMENT":"Default is allow: '*', if you specify an allow, it becomes the default","app":{"todo.index":{"deny":["finance"]},"hello.edit":{"_COMMENT_deny":"*","allow":["support"]}},"db":{"_COMMENT":"Ok, we need to figure out how to secure stuff","_COMMENT2":" - we now have a generic 'find' method","_COMMENT3":" - what we really want to do is lock down specific","_COMMENT4":" models, so let's try to use that...","/find":{"todo.index.todo":{"allow":["admin","support"]}}}});
var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var hello = require('../mvc/hello.js');

var todo = require('../mvc/todo.js');


if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.getElementById('misoAttachmentNode'), '/', {
'/users/new': restrict(user.new, 'user.new'),
'/': restrict(home.index, 'home.index'),
'/hello/:hello_id': restrict(hello.edit, 'hello.edit'),
'/hellos': restrict(hello.index, 'hello.index'),
'/todos': restrict(todo.index, 'todo.index'),
'/user/:user_id': restrict(user.edit, 'user.edit'),
'/users': restrict(user.index, 'user.index')
});