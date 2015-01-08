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
]) }},"/users":{
	"controller": function (params) {
	var userId = params ? params.id : m.route.param('id'),
		scope = {
			user: null,
			onReady: new Signal()
		};

	store.load('user', userId).then(function(loadedUser) {
		console.log('and then...', loadedUser);
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
},
	"view":function(ctrl){ return DIV('All the users') }},"/user/:user_id":{
	"controller": function (params) {
	var userId = getParam('id', params),
		scope = {
			user: null,
			onReady: new Signal()
		};

	store.load("user", userId).then(function(loadedUser) {
		console.log('and then...', loadedUser);
		scope.user = loadedUser;
		scope.onReady.dispatch();
	});

	return scope;
},
	"view":function(ctrl){ return DIV('waddup ' + ctrl.user.name + '!') }}});
