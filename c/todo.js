var m = require('mithril'),
    //  TODO: Use store to store the todos.
    store = require('../server/store.js');

var todo = {
    Todo: function(data) {
        this.description = m.prop(data.description);
        this.done = m.prop(false);
    }
};

module.exports.index =function() {
    return {
        list: [],
        description: m.prop(""),
        add: function(description) {
            if (description()) {
                this.list.push(new todo.Todo({
                    description: description()
                }));
                this.description("");
            }
        }
    };
};