/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var m = require('mithril');
var sugartags = require('mithril.sugartags')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var animate = require('../client/js/mithril.animate.js')(m);
var restrictions = require('../server/miso.restrictions.js');
var restrict = function(route, actionName){
	return route;

};
var restrictObj = ({"_COMMENT":"Default is allow: '*', if you specify an 'allow', it will override","_COMMENT2":"If you specify an 'allow', it will override","app":{"COMMENT_todo.index":{"deny":["finance","support"]},"COMMENT_hello.edit":{"deny":"*","allow":["support"]}},"db":{"_COMMENT":"Ok, we need to figure out how to secure stuff","_COMMENT2":" - we now have a generic 'find' method","_COMMENT3":" - what we really want to do is lock down specific","_COMMENT4":" models, so let's try to use that...","/find":{"todo.index.todo":{"allow":["admin","support"]}}}});
var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var doc = require('../mvc/doc.js');

var hello = require('../mvc/hello.js');
var redo = require('../mvc/redo.js');
var todo = require('../mvc/todo.js');


if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.getElementById('misoAttachmentNode'), '/', {
'/users/new': restrict(user.new, 'user.new'),
'/': restrict(home.index, 'home.index'),
'/doc/:doc_id': restrict(doc.edit, 'doc.edit'),
'/docs': restrict(doc.index, 'doc.index'),
'/hello/:hello_id': restrict(hello.edit, 'hello.edit'),
'/redos': restrict(redo.index, 'redo.index'),
'/todos': restrict(todo.index, 'todo.index'),
'/user/:user_id': restrict(user.edit, 'user.edit'),
'/users': restrict(user.index, 'user.index')
});