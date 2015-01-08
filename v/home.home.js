DIV({ hover: [ctrl.set(ctrl.rotate, 225), ctrl.set(ctrl.rotate, 0)] }, [
	DIV('Hello ', ctrl.name, { rotate: ctrl.rotate }),
	A({ href: '/user/1', config: m.route}, "User")
])