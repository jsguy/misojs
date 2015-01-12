//  Fake global storage for now..
var store = {
	load: function load(type, id) {
		if (!type) {
			throw new Error('no type provided to load model');
		}
		if (!id) {
			throw new Error('no id provided to load model');
		}

		return m.request({
			method: 'GET',
			//url: 'api/' + type + '/' + id),
			url: '/user.json'
		});
	}
},
Signal = function(){
	var onceBindings = [];
	return {
		addOnce: function(fn){
			onceBindings.push(fn);
		},
		dispatch: function(){
			for(var i = 0; i < onceBindings.length; i += 1) {
				onceBindings[i]();
			}
			onceBindings = [];
		}
	};
};
//	Get a parameter
getParam = function(key, params){
	return m.route.param(key);
};
m.route.mode = "pathname";
m.route(document.body, '/', {"/":{
	"controller": function (params) {
	var scope = {
		name: "world",
		rotate: m.prop(),
		set: function(prop, value){
			return function(){
				prop(value);
			};
		}
		//onReady: new Signal()
	};
	// setTimeout(function(){
	// 	scope.onReady.dispatch();
	// },10);
	return scope;
},
	"view":function(ctrl){ return DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
	DIV('Hello ', ctrl.name, { rotate: ctrl.rotate }),
	A({ href: '/user/1', config: m.route}, "User")
]) })","file":"home.js"},"/users":{
	"controller": function (params) {
	var scope = {
			users: [],
			onReady: new Signal()
		};

	store.load('user').then(function(loadedUsers) {
		scope.users = loadedUsers;
		scope.onReady.dispatch();
	});

	return scope;
},
	"view":function(ctrl){ return DIV('All the users would be listed here') })","file":"user.js"},"/user/:user_id":{
	"controller": function (params) {
	var userId = getParam('user_id', params),
		scope = {
			user: null,
			isServer: !!(typeof module !== 'undefined' && module.exports),
			onReady: new Signal()
		};

	store.load("user", userId).then(function(loadedUser) {
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
},
	"view":function(ctrl){ return DIV('Hello ' + ctrl.user.name + '! Server: ' + ctrl.isServer) })","file":"user.js"}});
