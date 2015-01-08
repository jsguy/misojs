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

//	All the routes
m.route(document.body, '/', {
	'/': {
		controller: function (params) {
			var scope = {
				name: "world",
				rotate: m.prop(),
				set: function(prop, value){
					return function(){
						prop(value);
					};
				}
			};
			return scope;
		},
		view: function(ctrl){
			return DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
				DIV('Hello ', ctrl.name, { rotate: ctrl.rotate }),
				A({ href: '/user/1', config: m.route}, "User")
			]) 
		}
	},
	'/users': {
		controller: function (params) {
			var userId = params ? params.id : m.route.param('id'),
				scope = {
					user: null
				};

			store.load('user', userId).then(function(loadedUser) {
				scope.user = loadedUser;
			});

			return scope;
		},
		view: function(ctrl){
			return DIV('All the users') 
		}
	},
	'/user/:id': {
		controller: function (params) {
			console.log('user controller');
			var userId = getParam('id', params),
				scope = {
					user: null
				};

			store.load('user', userId).then(function(loadedUser) {
				scope.user = loadedUser;
			});

			return scope;
		},
		view: function(ctrl){
			console.log('ctrl', ctrl);
			return DIV('waddup ' + ctrl.user.name + '!') 
		} 
	} 
});