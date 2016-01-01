//	Nav MVC
var navMVC = {
	models: {
		nav: function(){
			var me = this;
			//	Access the header model
			me.header = misoGlobal.header;
			me.items = [
				{href: "/", text: "Home", icon: "home"},
				{href: "/test", text: "Test", icon: "hand-spock-o"}
			];
			me.clickLink = function(link){
				return function(e){
					e.preventDefault();
					me.header.toggleMenu();
					m.route(link.href);
				}
			}
		}
	},
	controller: function() {
		//	Expose the model
		misoGlobal.nav = new navMVC.models.nav();
		return {model: misoGlobal.nav};
	},
	view: function(ctrl) {
		var o = ctrl.model;
		with(sugartags){
			return DIV([
				UL(
					o.items.map(function(link, idx) {
						return LI(
							A({href: link.href, class: "nav-link", config: m.route, onclick: o.clickLink(link)},
  								SPAN([
  									I({className: "fa fa-" + link.icon}),
  									SPAN(link.text)
  								])
  							)
						);
					})
				)
			]);
		}
	}
};

m.mount(document.getElementsByClassName("miso-nav")[0], navMVC);
