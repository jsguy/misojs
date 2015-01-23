var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	store = require('../server/store.js')(this),
	bindings = require('../server/mithril.bindings.node.js')(m);

//	Basic todo app
module.exports.index = {
	models: {
		//	Our todo model
		todo: function(data){
			this.text = data.text;
			this.done = m.p(data.done);
		}
	},
	controller: function(params) {
		var ctrl = this;

		//	View model
		ctrl.vm = {
			todoList: function(todos){
				this.todos = m.p(todos);
			},
			//	How many are left
			left: function(){
				var count = 0;
				ctrl.model.todos().map(function(todo) {
					count += todo.done() ? 0 : 1;
				});
				return count;
			},
			input: m.p("")
		};

		ctrl.addTodo = function(e){
			var value = ctrl.vm.input();
			if(value) {
				var newTodo = new module.exports.index.models.todo({text: ctrl.vm.input(), done: false});
				ctrl.model.todos.push(newTodo);
				ctrl.vm.input("");
				store.save('todo.index.models.todo', newTodo).then(function(res){
					console.log(res.result? res.result: res.error);
				});
			}
			e.preventDefault();
			return false;
		};

		ctrl.archive = function(){
			var list = [];
			ctrl.model.todos().map(function(todo) {
				if(!todo.done()) { list.push(todo); }
			});
			ctrl.model.todos(list);
		};

		//	Fake call to store.load
		store.load('todo', 1).then(function(loadedTodos) {
			ctrl.model = new ctrl.vm.todoList([
				new module.exports.index.models.todo({ text: "learn mithril", done: true}),
      			new module.exports.index.models.todo({ text: "build a mithril app", done: false})
			]);
		});

		return ctrl;
	},
	view: function(ctrl) {
		var c = ctrl,
			t = c.model;
		return [
			m.e("style", ".done{text-decoration: line-through;}"),
			m.e("h1", "Todos - " + c.vm.left() + " of " + t.todos().length + " remaining"),
			m.e("button", { onclick: c.archive }, "Archive"),
			m.e("ul", [
				t.todos().map(function(todo, idx){
					return m.e("li", { class: todo.done()? "done": "", toggle: todo.done }, todo.text);
				})
			]),
			m.e("form", { onsubmit: c.addTodo }, [
				m.e("input", { type: "text", value: c.vm.input, placeholder: "Add todo"}),
				m.e("button", { type: "submit"}, "Add")
			])
		];
	}
};