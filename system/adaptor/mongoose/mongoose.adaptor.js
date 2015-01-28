/*
	WIP: Create a mongoose adaptor
*/

//	Use miso adaptor
//var adaptor = require('../adaptor.js');

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

//	Test for now...
//module.exports = adaptor.create('mongoose', {
module.exports = function(utils){
	return {
		save: function(cb, err, args){
			var Model = utils.getModel(args.type),
				model,
				valid;

			if(!Model) {
				return err("Model not found " + args.type);
			}

			model = new Model(args.model);
			valid = model.isValid();

			if(valid === true) {
				console.log('SAVE', args.type, model);
				return cb("saved model!");
			} else {
				console.log('NOT SAVED', valid);
				return err(valid);
			}
		},
		findById: function(cb, err, args){
			console.log('findbyid', args);
			setTimeout(function(){
				cb("found by id: " + args.id);
			}, 200);
		},
		findByModel: function(cb, err, args){
			console.log('findbymodel', args.model, args.whatever);
			setTimeout(function(){
				cb("found model!");
			}, 300);
		}
	};
};

/*
var model = {id: 12};

module.exports.api.findById({type: 'user', id: 12}).then(function(result){
	console.log("CCCBBB", result);
});

module.exports.api.findByModel({model: model }).then(function(result, model){
	console.log("CCCBBB", arguments);
});
*/

//	Example usage in an mvc ?



