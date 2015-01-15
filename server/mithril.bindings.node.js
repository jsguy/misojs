//	Mithril bindings.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed

module.exports = function(m){
	m = m || {};

	//	Pub/Sub based extended properties
	m.p = function(value) {
		var self = this,
			subs = [],
			prevValue,
			delay = false,
			//  Send notifications to subscribers
			notify = function (value, prevValue) {
				var i;
				for (i = 0; i < subs.length; i += 1) {
					subs[i].func.apply(subs[i].context, [value, prevValue]);
				}
			},
			prop = function() {
				if (arguments.length) {
					value = arguments[0];
					if (prevValue !== value) {
						var tmpPrev = prevValue;
						prevValue = value;
						notify(value, tmpPrev);
					}
				}
				return value;
			};

		//	Allow push on arrays
		prop.push = function(val) {
			if(value.push && typeof value.length !== "undefined") {
				value.push(val);
			}
			prop(value);
		}

		//	Subscribe for when the value changes
		prop.subscribe = function (func, context) {
			subs.push({ func: func, context: context || self });
			return prop;
		};

		//	Allow property to not automatically render
		prop.delay = function(value) {
			delay = !!value;
			return prop;
		};

		//	Automatically update rendering when a value changes
		//	As mithril waits for a request animation frame, this should be ok.
		//	You can use .delay(true) to be able to manually handle updates
		prop.subscribe(function(val){
			if(!delay) {
				m.startComputation();
				m.endComputation();
			}
			return prop;
		});

		return prop;
	};

	//	Element function that applies our extended bindings
	//	Note: 
	//		. Some attributes can be removed when applied, eg: custom attributes
	//	
	m.e = function(element, attrs, children) {
		var merged = []
		for (var name in attrs) {
			if (m.bindings[name]) {
				m.bindings[name].func.apply(attrs, [attrs[name]]);
				if(m.bindings[name].removeable) {
					delete attrs[name];
				}
			}
		}
		return m(element, attrs, children);
	};

	//	Add bindings method
	//	Non-standard attributes do not need to be rendered, eg: valueInput
	//	so they are set as removable
	m.addBinding = function(name, func, removeable){
		m.bindings = m.bindings || {};
		m.bindings[name] = {
			func: func,
			removeable: removeable
		};
	};

	//	Get the underlying value of a property
	m.unwrap = function(prop) {
		return (typeof prop == "function")? prop(): prop;
	};

	//	Bi-directional binding of value
	m.addBinding("value", function(prop) {
		if (typeof prop == "function") {
			this.value = prop();
			this.onchange = m.withAttr("value", prop);
		} else {
			this.value = prop;
		}
	});

	//	Bi-directional binding of checked property
	m.addBinding("checked", function(prop) {
		if (typeof prop == "function") {
			this.checked = prop();
			this.onchange = m.withAttr("checked", prop);
		} else {
			this.checked = prop;
		}
	});

	//	Add value bindings for various event types 
	var events = ["Input", "Keyup", "Keypress"];
	for(var i = 0; i < events.length; i += 1) {
		var eve = events[i];
		(function(name, eve){
			//	Bi-directional binding of value
			m.addBinding(name, function(prop) {
				if (typeof prop == "function") {
					this.value = prop();
					this[eve] = m.withAttr("value", prop);
				} else {
					this.value = prop;
				}
			}, true);
		}("value" + eve, "on" + eve.toLowerCase()));
	}

	/* Set of default bindings */
	m = m || {};
	//	Hide node
	m.addBinding("hide", function(prop){
		this.style = {
			display: m.unwrap(prop)? "none" : ""
		};
	}, true);

	//	Toggle boolean value on click
	m.addBinding('toggle', function(prop){
		this.onclick = function(){
			var value = prop();
			prop(!value);
		}
	}, true);

	//	Set hover states, a'la jQuery pattern
	m.addBinding('hover', function(prop){
		this.onmouseover = prop[0];
		if(prop[1]) {
			this.onmouseout = prop[1];
		}
	}, true );
};