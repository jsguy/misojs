var fs = require('fs'),
	miso = require('../server/miso.util.js');
/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
});
*/


//	Simulated store - thennable
//	TODO: This should interact with the API once we have it.
module.exports = function(scope) {
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
	};

	return {
		load: function(type, args){
			var r, loadDone;
			fs.readFile("client/user.json", {encoding:'utf8'}, function(err, data){
				r = JSON.parse(data);
				loadDone();
			});
			return {
				then: function(cb){
					loadDone = scope._misoReadyBinding.bind(function(){
						cb(r);
					});
				}
			};
		},
		save: function(type, model){
			var subType = type.split("."),
				saveDone = function(){
					throw "No callback set... now what?";
				}, 
				data, 
				v = model.isValid? model.isValid(): true;

			//	Simulate async
			setTimeout(function(){
				if(v === true) {
					data = getModelData(model);
					console.log('Saving', type, data);
					saveDone(null, "Saved " + subType[0]);
				} else {
					console.log('Model invalid', v);
					saveDone(v);
				}
			}, 10);


			return {
				then: function(cb){
					saveDone = function(){
						cb.apply(cb, arguments);
					};
				}
			}
		}
	};
};