/*
	The store library is miso's way to allow models to be stored and retreived.
	It is a lightweight approach in that it is able to utalise an adaptor for 
	different ways of storing the data, so this is essentially just a "data
	mapping service" that can serialise / deserialise model data between the 
	client and server.

	Note: it is NOT an abstraction layer. Instead the concept is that the adaptor 
	will provide the correct level of functionality for anything beyond the 
	following basic methods:

	isValid - validates that the model is valid

	//	TODO: Do we wwant the following???

	save
	load
	update
	delete

	In order to support other functionality, an RPC method is available:



	For example, 

	See: system/adaptor/adaptor.readme.md for details
*/

var fs = require('fs'),
	miso = require('../../server/miso.util.js'),
	Promiz = require('promiz')





var p = new Promiz(function(cb, err){
	setTimeout(function(){

		cb('boo!');
		//err('doh!');
	}, 500);
});

p.then(function(txt){
	console.log('then', txt);
},function(){
	console.log('ERROR');
});







//	Store adaptor
//	TODO: the scope 
module.exports = function(scope, adaptor) {
	//	Add a binding object, so we can block till ready
	scope._misoReadyBinding = miso.readyBinderFactory();

	//	Remove any unrequired model data, and get actual values
	//	Excludes isValid method
	var getModelData = function(model){
		var i, result = {};
		for(i in model) {if(model.hasOwnProperty(i)) {
			if(i !== "isValid") {
				result[i] = (typeof model[i] == "function")? model[i](): model[i];
			}
		}}

		return result;
	},
	//	TODO: do we need to force this perhaps?
	jsonResponse = function(obj){
		var result = {
			jsonrpc: "2.0",
			id: null
		};

		result = _.assign(result, obj);

		//	Can't have both result and error
		if(obj.error && obj.result) {
			delete obj.result;
		}

		return result;
	};

	return {

		//	TODO: This should be the only method we expose.
		//	
		//	* On client, this is a remote call with a serialised model
		//	* On server, we make the actual call
		//	
		//	TODO: USe an actual thennable solution
		do: function(action, model){
			var actionDone,
				//	Grab everything after action and model
				args = Array.prototype.slice.call(arguments, 2);
			//	TODO: pass any arguments from here - as long as action and model are first.
			//	



			console.log('action, model, args',action, model, args);

			var result;

			return Promiz.all([
				Promiz.resolve(function(cb){
					//console.log();
					setTimeout(function(){
						console.log('1111');
						result = getModelData(model);
						cb(result);
					}, 1000);
				}),
				Promiz.resolve(function(cb){
//					adaptor[action].apply(scope, result);

					setTimeout(function(){
						console.log('2222');
						adaptor[action].apply(scope, result);
						cb('hehe');
					}, 500);
				})
			]);



/*
			return new Promiz(function(cb, err){
				//	Bind to miso ready
				//scope._misoReadyBinding.bind(function(){
					var method = adaptor[action];

					console.log('method', method);

					//	Do whatever, then cb or err call backs
					if(typeof method == 'function') {
						//	Call it with our saved arguments and model first
						args.unshift(getModelData(model));

						console.log('run method', method, scope, args);
						cb(method.apply(scope, args));
					} else {
						err("No method " + action + " found on adaptor");
					}
				//});
			});

*/

/*
			return {
				then: function(cb){
					//	Note: we hook into the misReady functionality in the scope.
					//	TODO: The scope should probably be the model?
					actionDone = scope._misoReadyBinding.bind(function(){
						cb(r);
					});
				}
			}
			*/
		}
	};
};