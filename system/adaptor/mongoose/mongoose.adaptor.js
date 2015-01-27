/*
	Create a mongoose adaptor
*/

//	Use miso adaptor
var adaptor = require('../adaptor.js');

//	--- BEGIN TEST CODE FOR ADAPTOR

/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) {
  	console.log(err);
  }// ...
  console.log('meow');
});

*/

//	Creates a model from an object
var objectToModel = function(){
	//	TODO: do we need this for mongoose?
};

//	Test for now...
module.exports = adaptor.create('mongoose', {
	save: function(cb, err, model){
		setTimeout(function(){
			cb("saved model" + JSON.stringify(model));
		}, 10);
	},
	findById: function(cb, err, type, id){
		setTimeout(function(){
			cb("found by id: " + id);
		}, 10);
	},
	findByModel: function(cb, err, model, whatever){
		console.log('findbymodel', model, whatever);
		setTimeout(function(){
			cb("found model!");
		}, 10);
	}
});


var model = {
	id: 12
};

module.exports.findById(12).then(function(result){
	console.log("CCCBBB", result);
});

module.exports.findByModel(model).then(function(result, model){
	console.log("CCCBBB", arguments);
});
