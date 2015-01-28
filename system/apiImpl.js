/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
module.exports.index = {
	return {
'save': function (){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = function(){
					//	Sooo... this hits the API, which calls the 
					//	adaptor on the server?
					//	TODO: we need to expose the adaptor methods
					//	AS an API...
					//return m.request();
					/*
						m.request({
							method:'post', 
							url: '/api/save', 
							data: {
								type: 'user.edit.user'
							}
						}).then(function(result){
							console.log('SAVE', result);
						});
					*/
					m.request({
						method:'post', 
						url: apiPath + '/' + action, 
						data: arguments
					}).then(function(result){
						console.log('ACTION', action, result);
					});
				};

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(adaptor, args);
			});
		},
'findById': function (){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = function(){
					//	Sooo... this hits the API, which calls the 
					//	adaptor on the server?
					//	TODO: we need to expose the adaptor methods
					//	AS an API...
					//return m.request();
					/*
						m.request({
							method:'post', 
							url: '/api/save', 
							data: {
								type: 'user.edit.user'
							}
						}).then(function(result){
							console.log('SAVE', result);
						});
					*/
					m.request({
						method:'post', 
						url: apiPath + '/' + action, 
						data: arguments
					}).then(function(result){
						console.log('ACTION', action, result);
					});
				};

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(adaptor, args);
			});
		},
'findByModel': function (){
			//	Create an array for the arguments
			var args = Array.prototype.slice.call(arguments, 0),
				method = function(){
					//	Sooo... this hits the API, which calls the 
					//	adaptor on the server?
					//	TODO: we need to expose the adaptor methods
					//	AS an API...
					//return m.request();
					/*
						m.request({
							method:'post', 
							url: '/api/save', 
							data: {
								type: 'user.edit.user'
							}
						}).then(function(result){
							console.log('SAVE', result);
						});
					*/
					m.request({
						method:'post', 
						url: apiPath + '/' + action, 
						data: arguments
					}).then(function(result){
						console.log('ACTION', action, result);
					});
				};

			return new Promiz(function(cb, err){
				//	Add model, cb, err at the front of the 
				args.unshift(cb, err);
				//	Run the method
				method.apply(adaptor, args);
			});
		}
	};
};