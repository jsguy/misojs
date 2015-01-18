var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

//	Home page
module.exports.index = {
	controller: function(){
		this.name = "world";
		this.rotate = m.prop();
		this.set = function(prop, value){
			return function(){
				prop(value);
			};
		};

		return this;
	},
	view: function(ctrl){
		with(sugartags) {
			return DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
				DIV("G'day ", ctrl.name, { rotate: ctrl.rotate }),
				UL([
					LI(A({ href: '/user/1', config: m.route}, "User view example")),
					LI(A({ href: '/todo', config: m.route}, "Todos example"))
				])
			]);
		}
	}
};