UL({class: "listy"}, [
	ctrl.pages().map(function(page) {
		return LI(A({href: page.url}, page.title), page.title)
	})
])