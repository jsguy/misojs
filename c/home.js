var m = require('mithril');

//	Home page
module.exports.home = function(params) {
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
};