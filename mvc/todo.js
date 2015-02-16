/*
	This is a sample todo app that uses the single url mvc miso pattern
*/
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	miso = require('../server/miso.util.js'),
	api = require('../system/api.server.js')(m, this);

//	Basic todo app
var self = module.exports.index = {
	models: {
		//	Our todo model
		todo: function(data){
			this.text = data.text;
			this.done = m.p(data.done);
			this._id = data._id;
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
				var newTodo = new self.models.todo({
					text: ctrl.vm.input(),
					done: false
				});
				ctrl.model.todos.push(newTodo);
				ctrl.vm.input("");
				api.save({ type: 'todo.index.todo', model: newTodo } ).then(function(res){
					newTodo._id = res.result.id;
				});
			}
			e.preventDefault();
			return false;
		};

		ctrl.archive = function(){
			var list = [];
			ctrl.model.todos().map(function(todo) {
				if(!todo.done()) {
					list.push(todo); 
				} else {
					//	Delete
					api.remove({ type: 'todo.index.todo', _id: todo._id }).then(function(response){
						console.log(response.result);
					});
				}
			});
			ctrl.model.todos(list);
		};

		ctrl.done = function(todo){
			return function() {
				todo.done(!todo.done());
				api.save({ type: 'todo.index.todo', model: todo } ).then(function(res){
					todo._id = res.result.id;
				});
			}
		};

		//	Load our todos
		api.find({type: 'todo.index.todo'}).then(function(data) {
			var loadedTodos = data.result || [];
			if(data.error){
				return console.log("Error " + data.error);
			}

			var list = Object.keys(loadedTodos).map(function(key) {
				var myTodo = loadedTodos[key];
				myTodo.done = !! (myTodo.done !== "false");
				return new self.models.todo(myTodo);
			});

			ctrl.model = new ctrl.vm.todoList(list);
		}, function(){
			console.log('Error', arguments);
		});

		return ctrl;
	},
	view: function(ctrl) {
		var c = ctrl,
			t = c.model;
		with(sugartags) {
			return DIV({ class: "cw" }, [
				STYLE(".done{text-decoration: line-through;}"),
				H1("Todos - " + c.vm.left() + " of " + t.todos().length + " remaining"),
				BUTTON({ onclick: c.archive }, "Archive"),
				UL([
					t.todos().map(function(todo, idx){
						return LI({ class: todo.done()? "done": "", onclick: c.done(todo) }, todo.text);
					})
				]),
				FORM({ onsubmit: c.addTodo }, [
					INPUT({ type: "text", value: c.vm.input, placeholder: "Add todo"}),
					BUTTON({ type: "submit"}, "Add")
				])
			]);
		}
	}
};