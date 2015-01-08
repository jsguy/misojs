//	Mithril templates.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(m){
	m.templates = {};

	//	Returns a template from either a function or string
	//	Note: use 'data' as the variable for the data
	m.template = function(tmpl, data){
		try{
			var isFunc = (typeof tmpl == 'function'), t, f, result;
			if(isFunc) {
				result = tmpl(data);
			} else {
				t = document.getElementById(tmpl);
				t = t? t.innerHTML: tmpl;

				//	Use sugar tags if they are available
				f = (m.sugarTags? 
					new Function("data", 'with(m.sugarTags) {return(' + t + ')};'):
					new Function("data", 'return(' + t + ')'));
				result = f(data);
			}

			return result;
		} catch(e){
			var msg = e.message;
			console.log(msg);
			return "Mithril template error: " + msg + ".";
		}
	};

	//	Returns an ajax loadable template
	m.template.load = function(url){
		return m.request({
			method: "GET",
			url: url,
			deserialize: function(value) {
				return value;
			}
		});
	};

	//	Defines a template for later use
	m.template.define = function(name, tmpl){
		m.templates[name] = tmpl;
	};


	//	Compiles a defined template
	m.template.compile = function(name, data){
		return m.template(m.templates[name], data);
	};

	if (typeof module != "undefined" && module !== null && module.exports) module.exports = m.template;
	else if (typeof define === "function" && define.amd) define(function() {return m.template});

}(typeof m !== "undefined"? m: {}));