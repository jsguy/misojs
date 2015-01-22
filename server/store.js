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


//	Simulated store
//	TODO: This should interact with the API once we have it.
module.exports = function(scope) {
	//	Add a binding object, so we can block till ready
	scope._misoReadyBinding = miso.readyBinderFactory();

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
			var v = model.isValid();
			if(v === true) {
				console.log('Save', type, model);
			} else {
				console.log('Model invalid', v);
			}
		}
	};
};