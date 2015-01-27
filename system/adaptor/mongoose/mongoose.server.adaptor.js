//	Always use our adaptor
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

var myAdaptor = {
	findById: function(cb){
		setTimeout(function(){
			cb("found it!", obj);
		}, 1000);
	}
},
obj = {},
ada = adaptor(obj, myAdaptor);

console.log('ada', ada);

ada.do('findById', {
		id: 12
	})
	.then(function(){
		console.log("CCCBBB", arguments);
	});