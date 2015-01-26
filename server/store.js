/*
	The store library is miso's way to allow models to be stored and retreived.
	It is a lightweight approach in that it is able to utalise an adaptor for 
	different ways of storing the data, so this is essentially just a "data
	mapping service" that can serialise / deserialise model data between the 
	client and server.

	See: system/adaptor/adaptor.readme.md for details
*/

var fs = require('fs'),
	miso = require('../server/miso.util.js'),
	model = require('model');
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








// Setup the blueprint of the model. This is where you can
// setup the model properties, defaults, and validations
var Foo = function () {
 this.setAdapter('mongo', {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "dbName":"mydatabase"
  });

  // Define the whitelisted properties on the model.
  // Properties not listed wont be saved
  this.defineProperties({
    name: { type: 'string', required: true },
    description: { type: 'text' },
    enabled: { type: 'boolean' },
    archived: { type: 'boolean' },
  });
};

// This registers the model with the model package so
// things like associations can work
Foo = model.register('Foo', Foo);
/*
Foo.first(1, function (err, model) {
  // Check if there was an error with the DB
  if (err) throw new Error('Uh oh, something broke' + err);

  // If there was no error, but no model was found it must be missing
  if (!err && !model) throw new Error('Foo not found');

  // Update the model's name property
  model.name = "New name!";

  // Once we're done updating properties we can call save on the model.
  // Save will send the current model data to the DB you specified
  model.save(function (err, updatedModel) {
    if (err) throw new Error('Could not save the model');
    console.log("The model was updated!");
  });
});
*/

var foo = Foo.create();

foo.updateProperties({
	name: "Test"
});


if (foo.isValid()) {

	console.log("Here...");

	foo.save(function (err, data) {

		console.log('SAVED', arguments);
		if (err) {
			throw err;
		}
		console.log('New item saved!');
	});
}









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