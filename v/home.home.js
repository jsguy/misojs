DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
	DIV("G'day ", ctrl.name, { rotate: ctrl.rotate }),
	UL([
		LI(A({ href: '/user/1', config: m.route}, "User view example")),
		LI(A({ href: '/todos', config: m.route}, "Todos example"))
	])
])