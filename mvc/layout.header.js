var miso = require('../modules/miso.util.js');

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
			me.scrollOffset = m.p();
		}
	},
	controller: function() {
		//	Expose the header model
		var model = this.model = misoGlobal.header = new headerMVC.models.header();

		//	Check for the offset
		if(!miso.isServer()) {
			//	Ref: http://stackoverflow.com/a/3464890
			var doc = document.documentElement,
				top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
			var setOffset = function(){
				top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
				//console.log('so', top);
				model.scrollOffset(top);
			}
			setInterval(setOffset, 300);
		}

		return this;
	},
	view: function(ctrl) {
		var o = ctrl.model;
		with(sugartags){
			return m("SECTION", {className: "miso-header" + (o.scrollOffset() > 400? " scrolled": "")},
				m("div", [
					(o.backLink()? 
						A({href: o.backLink(), config: m.route}, [
							SPAN({className: "button-back"}, I({className: "fa fa-arrow-left"})),
							SPAN(m.trust(o.text()))
						])
					: SPAN(m.trust(o.text()))),
	  				A({href: "#", class: "button-menu", onclick: o.toggleMenu},
	  					SPAN(I({className: "fa fa-bars"}))
	  				)
				])
			);
		}
	}
};

m.mount(document.getElementsByClassName("miso-header--surround")[0], headerMVC);