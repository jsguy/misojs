[
	INPUT({onchange: m.withAttr("value", ctrl.description), value: ctrl.description()}),
	BUTTON({onclick: ctrl.add.bind(ctrl, ctrl.description)}, "Add"),
	TABLE([
	    ctrl.list.map(function(task, index) {
	        return TR([
	            TD([
	                m("input[type=checkbox]", {onclick: m.withAttr("checked", task.done), checked: task.done()})
	            ]),
	            TD({style: {textDecoration: task.done() ? "line-through" : "none"}}, task.description()),
	        ])
	    })
	])
]