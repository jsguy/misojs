var m = require('mithril'),
    //  TODO: Use store to store the todos.
    store = require('../server/store.js');

var Todo = function(data) {
    this.description = m.prop(data.description);
    this.done = m.prop(false);
};

module.exports.index =function() {
    return {
        list: [],
        description: m.prop(""),
        add: function(description) {
            if (description()) {
                var todo = new Todo({
                    description: description()
                });
                this.list.push(todo);
                this.description("");
                store.save('todo', todo);
            }
        }
    };
};