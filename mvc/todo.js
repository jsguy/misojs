var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	bindings = require('../server/mithril.bindings.node.js')(m);

//	Basic todo app
module.exports.index = {
	model: function() {
		var self = this;
		self.todos = m.p([
			{ text: "learn mithril", done: m.p(true) },
      		{ text: "build a mithril app", done: m.p(false) }
      	]);
      	self.input = m.p("");
		self.left = function(){
			var count = 0;
			self.todos().map(function(todo) {
				count += todo.done() ? 0 : 1;
			});
			return count;
		};
		self.archive = function(){
			var list = [];
			self.todos().map(function(todo) {
				if(!todo.done()) { list.push(todo); }
			});
			self.todos(list);
		};
	},
	controller: function() {
		var model = this.model = new function() {
			var self = this;
			self.todos = m.p([
				{ text: "learn mithril", done: m.p(true) },
	      		{ text: "build a mithril app", done: m.p(false) }
	      	]);
	      	self.input = m.p("");
			self.left = function(){
				var count = 0;
				self.todos().map(function(todo) {
					count += todo.done() ? 0 : 1;
				});
				return count;
			};
			self.archive = function(){
				var list = [];
				self.todos().map(function(todo) {
					if(!todo.done()) { list.push(todo); }
				});
				self.todos(list);
			};
		}();
		this.addTodo = function(){
			var value = model.input();
			if(value) {
				//	Using bindings model push for arrays
				model.todos.push({text: model.input(), done: m.p(false)});
				model.input("");
			}
			return false;
		};
	},
	view: function(data) {
		var t = data.model;
		return [
			m.e("h1", "Mithril bindings Todos - " + t.left() + " of " + t.todos().length + " remaining"),
			m.e("button", { onclick: t.archive }, "Archive"),
			m.e("ul", [
				t.todos().map(function(todo, idx){
					return m.e("li", { class: todo.done()? "done": "", toggle: todo.done }, todo.text);
				})
			]),
			m.e("form", { onsubmit: data.addTodo }, [
				m.e("input", { type: "text", value: t.input, placeholder: "Add todo"}),
				m.e("button", { type: "submit"}, "Add")
			])
		];
	}
};