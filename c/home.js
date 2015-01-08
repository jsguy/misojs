var Signal = require('signals'),
	m = require('mithril');

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
		//onReady: new Signal()
	};
	// setTimeout(function(){
	// 	scope.onReady.dispatch();
	// },10);
	return scope;
};