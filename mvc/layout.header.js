//	Header MVC
var headerMVC = {
	models: {
		header: function(){
			var me = this;
			me.text = m.p("Header");
			me.isMenuShown = m.p(false);
			me.toggleMenu = function(e){
				e.preventDefault();
				me.isMenuShown(!me.isMenuShown());
				var el = document.body;
				el.className = "";
				if(me.isMenuShown()) {
					el.className = "menu-active";
				}
			};
		}
	},
	controller: function() {
		//	Expose the header model
		misoGlobal.header = new headerMVC.models.header();
		return {model: misoGlobal.header};
	},
	view: function(ctrl) {
		var o = ctrl.model;
		with(sugartags){
			return m("div", [
				SPAN({className: "button-back"}, I({className: "fa fa-chevron-left"})),
				SPAN(m.trust(o.text())),
  				A({href: "#", class: "button-menu", onclick: o.toggleMenu},
  					SPAN(I({className: "fa fa-bars"}))
  				)
			]);
		}
	}
};

m.mount(document.getElementsByClassName("miso-header")[0], headerMVC);