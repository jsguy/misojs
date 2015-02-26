var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	miso = require('../server/miso.util.js'),
	api = require('../system/api.server.js')(m, this);

var self = module.exports.index = {
	models: {
		//	Our todo model
		todo: function(data){
			this.text = data.text;
			this.done = m.prop(data.done == "false"? false: data.done);
			this._id = data._id;
		}
	},
	controller: function(params) {
		var ctrl = this,
			myTodos = [{text: "Learn miso"}, {text: "Build miso app"}];

		ctrl.list = Object.keys(myTodos).map(function(key) {
			return new self.models.todo(myTodos[key]);
		});


		ctrl.addTodo = function(e){
			var value = ctrl.vm.input();
			if(value) {
				var newTodo = new self.models.todo({
					text: ctrl.vm.input(),
					done: false
				});
				ctrl.list.push(newTodo);
				ctrl.vm.input("");
			}
			e.preventDefault();
			return false;
		};



		ctrl.vm = {
			left: function(){
				var count = 0;
				ctrl.list.map(function(todo) {
					count += todo.done() ? 0 : 1;
				});
				return count;
			},
			done: function(todo){
				return function() {
					todo.done(!todo.done());
				}
			},
			input: m.p("")
		};

		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return [
				STYLE(".done{text-decoration: line-through;}"),
				H1("Todos - " + ctrl.vm.left() + " of " + ctrl.list.length + " remaining"),
				UL([
					ctrl.list.map(function(todo){
						return LI({ class: todo.done()? "done": "", onclick: ctrl.vm.done(todo) }, todo.text);
					})
				]),
				FORM({ onsubmit: ctrl.addTodo }, [
					INPUT({ type: "text", value: ctrl.vm.input, placeholder: "Add todo"}),
					BUTTON({ type: "submit"}, "Add")
				])
			]
		};
	}
};