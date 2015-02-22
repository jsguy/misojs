/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var m = require('mithril');
var sugartags = require('mithril.sugartags')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var animate = require('../client/js/mithril.animate.js')(m);
var restrictions = require('../server/miso.restrictions.js');
var restrict = function(route, actionName){
	return route;

};
var restrictObj = ({&quot;_COMMENT&quot;:&quot;Default is allow: '*', if you specify an 'allow', it will override&quot;,&quot;_COMMENT2&quot;:&quot;If you specify an 'allow', it will override&quot;,&quot;app&quot;:{&quot;todo.index&quot;:{&quot;deny&quot;:[&quot;finance&quot;,&quot;support&quot;]},&quot;hello.edit&quot;:{&quot;deny&quot;:&quot;*&quot;,&quot;allow&quot;:[&quot;support&quot;]}},&quot;db&quot;:{&quot;_COMMENT&quot;:&quot;Ok, we need to figure out how to secure stuff&quot;,&quot;_COMMENT2&quot;:&quot; - we now have a generic 'find' method&quot;,&quot;_COMMENT3&quot;:&quot; - what we really want to do is lock down specific&quot;,&quot;_COMMENT4&quot;:&quot; models, so let's try to use that...&quot;,&quot;/find&quot;:{&quot;todo.index.todo&quot;:{&quot;allow&quot;:[&quot;admin&quot;,&quot;support&quot;]}}}});
var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var doc = require('../mvc/doc.js');

var hello = require('../mvc/hello.js');

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
'/hellos': restrict(hello.index, 'hello.index'),
'/todos': restrict(todo.index, 'todo.index'),
'/user/:user_id': restrict(user.edit, 'user.edit'),
'/users': restrict(user.index, 'user.index')
});