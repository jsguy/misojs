(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//	Various utilities that normalise usage between client and server
//	This is the client version
//	See /server/miso.util.js for server version
var m = require('mithril');

module.exports = {
	//	Are we on the server?
	isServer: function() {
		return false;
	},
	
	//	Each abstraction
	//	
	//	miso.each(['hello', 'world'], function(value, key){
	//		console.log(value, key);
	//	});
	//	//	hello 0\nhello 1
	//
	// 	miso.each({'hello': 'world'}, function(value, key){
	//		console.log(value, key);
	//	});
	//	//	world hello
	//
	each: function(obj, fn) {
		if(Object.prototype.toString.call(obj) === '[object Array]' ) {
			return obj.map(fn);
		} else if(typeof obj == 'object') {
			return Object.keys(obj).map(function(key){
				return fn(obj[key], key);
			});
		} else {
			return fn(obj);
		}
	},

	readyBinder: function(){
		var bindings = [];
		return {
			bind: function(cb) {
				bindings.push(cb);
			},
			ready: function(){
				for(var i = 0; i < bindings.length; i += 1) {
					bindings[i]();
				}
			}
		};
	},
	//	Get parameters for an action
	getParam: function(key, params, def){
		return typeof m.route.param(key) !== "undefined"? m.route.param(key): def;
	}
};
},{"mithril":13}],2:[function(require,module,exports){
/*
	mithril.animate - Copyright 2014 jsguy
	MIT Licensed.
*/
(function(){
var mithrilAnimate = function (m) {
	//	Known prefiex
	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
	transitionProps = ['TransitionProperty', 'TransitionTimingFunction', 'TransitionDelay', 'TransitionDuration', 'TransitionEnd'],
	transformProps = ['rotate', 'rotatex', 'rotatey', 'scale', 'skew', 'translate', 'translatex', 'translatey', 'matrix'],

	defaultDuration = 400,

	err = function(msg){
		(typeof window != "undefined") && window.console && console.error && console.error(msg);
	},
	
	//	Capitalise		
	cap = function(str){
		return str.charAt(0).toUpperCase() + str.substr(1);
	},

	//	For checking what vendor prefixes are native
	div = document.createElement('div'),

	//	vendor prefix, ie: transitionDuration becomes MozTransitionDuration
	vp = function (prop) {
		var pf;
		//	Handle unprefixed
		if (prop in div.style) {
			return prop;
		}

		//	Handle keyframes
		if(prop == "@keyframes") {
			for (var i = 0; i < prefixes.length; i += 1) {
				//	Testing using transition
				pf = prefixes[i] + "Transition";
				if (pf in div.style) {
					return "@-" + prefixes[i].toLowerCase() + "-keyframes";
				}
			}
			return prop;
		}

		for (var i = 0; i < prefixes.length; i += 1) {
			pf = prefixes[i] + cap(prop);
			if (pf in div.style) {
				return pf;
			}
		}
		//	Can't find it - return original property.
		return prop;
	},

	//	See if we can use native transitions
	supportsTransitions = function() {
		var b = document.body || document.documentElement,
			s = b.style,
			p = 'transition';

		if (typeof s[p] == 'string') { return true; }

		// Tests for vendor specific prop
		p = p.charAt(0).toUpperCase() + p.substr(1);

		for (var i=0; i<prefixes.length; i++) {
			if (typeof s[prefixes[i] + p] == 'string') { return true; }
		}

		return false;
	},

	//	Converts CSS transition times to MS
	getTimeinMS = function(str) {
		var result = 0, tmp;
		str += "";
		str = str.toLowerCase();
		if(str.indexOf("ms") !== -1) {
			tmp = str.split("ms");
			result = Number(tmp[0]);
		} else if(str.indexOf("s") !== -1) {
			//	s
			tmp = str.split("s");
			result = Number(tmp[0]) * 1000;
		} else {
			result = Number(str);
		}

		return Math.round(result);
	},

	//	Set style properties
	setStyleProps = function(obj, props){
		for(var i in props) {if(props.hasOwnProperty(i)) {
			obj.style[vp(i)] = props[i];
		}}
	},

	//	Set props for transitions and transforms with basic defaults
	setTransitionProps = function(args){
		var props = {
				//	ease, linear, ease-in, ease-out, ease-in-out, cubic-bezier(n,n,n,n) initial, inherit
				TransitionTimingFunction: "ease",
				TransitionDuration: defaultDuration + "ms",
				TransitionProperty: "all"
			},
			p, i, tmp, tmp2, found;

		//	Set any allowed properties 
		for(p in args) { if(args.hasOwnProperty(p)) {
			tmp = 'Transition' + cap(p);
			tmp2 = p.toLowerCase();
			found = false;

			//	Look at transition props
			for(i = 0; i < transitionProps.length; i += 1) {
				if(tmp == transitionProps[i]) {
					props[transitionProps[i]] = args[p];
					found = true;
					break;
				}
			}

			//	Look at transform props
			for(i = 0; i < transformProps.length; i += 1) {
				if(tmp2 == transformProps[i]) {
					props[vp("transform")] = props[vp("transform")] || "";
					props[vp("transform")] += " " +p + "(" + args[p] + ")";
					found = true;
					break;
				}
			}

			if(!found) {
				props[p] = args[p];
			}
		}}
		return props;
	},

	//	Fix animatiuon properties
	//	Normalises transforms, eg: rotate, scale, etc...
	normaliseTransformProps = function(args){
		var props = {},
			tmpProp,
			p, i, found,
			normal = function(props, p, value){
				var tmp = p.toLowerCase(),
					found = false, i;

				//	Look at transform props
				for(i = 0; i < transformProps.length; i += 1) {
					if(tmp == transformProps[i]) {
						props[vp("transform")] = props[vp("transform")] || "";
						props[vp("transform")] += " " +p + "(" + value + ")";
						found = true;
						break;
					}
				}

				if(!found) {
					props[p] = value;
				} else {
					//	Remove transform property
					delete props[p];
				}
			};

		//	Set any allowed properties 
		for(p in args) { if(args.hasOwnProperty(p)) {
			//	If we have a percentage, we have a key frame
			if(p.indexOf("%") !== -1) {
				for(i in args[p]) { if(args[p].hasOwnProperty(i)) {
					normal(args[p], i, args[p][i]);
				}}
				props[p] = args[p];
			} else {
				normal(props, p, args[p]);
			}
		}}

		return props;
	},


	//	If an object is empty
	isEmpty = function(obj) {
		for(var i in obj) {if(obj.hasOwnProperty(i)) {
			return false;
		}}
		return true; 
	},
	//	Creates a hashed name for the animation
	//	Use to create a unique keyframe animation style rule
	aniName = function(props){
		return "ani" + JSON.stringify(props).split(/[{},%":]/).join("");
	},
	animations = {},

	//	See if we can use transitions
	canTrans = supportsTransitions();

	//	IE10+ http://caniuse.com/#search=css-animations
	m.animateProperties = function(el, args, cb){
		el.style = el.style || {};
		var props = setTransitionProps(args), time;

		if(typeof props.TransitionDuration !== 'undefined') {
			props.TransitionDuration = getTimeinMS(props.TransitionDuration) + "ms";
		} else {
			props.TransitionDuration = defaultDuration + "ms";
		}

		time = getTimeinMS(props.TransitionDuration) || 0;

		//	See if we support transitions
		if(canTrans) {
			setStyleProps(el, props);
		} else {
			//	Try and fall back to jQuery
			//	TODO: Switch to use velocity, it is better suited.
			if(typeof $ !== 'undefined' && $.fn && $.fn.animate) {
				$(el).animate(props, time);
			}
		}

		if(cb){
			setTimeout(cb, time+1);
		}
	};

	//	Trigger a transition animation
	m.trigger = function(name, value, options, cb){
		options = options || {};
		var ani = animations[name];
		if(!ani) {
			return err("Animation " + name + " not found.");
		}

		return function(e){
			var args = ani.fn(function(){
				return typeof value == 'function'? value(): value;
			});

			//	Allow override via options
			for(i in options) if(options.hasOwnProperty(i)) {{
				args[i] = options[i];
			}}

			m.animateProperties(e.target, args, cb);
		};
	};

	//	Adds an animation for bindings and so on.
	m.addAnimation = function(name, fn, options){
		options = options || {};

		if(animations[name]) {
			return err("Animation " + name + " already defined.");
		} else if(typeof fn !== "function") {
			return err("Animation " + name + " is being added as a transition based animation, and must use a function.");
		}

		options.duration = options.duration || defaultDuration;

		animations[name] = {
			options: options,
			fn: fn
		};

		//	Add a default binding for the name
		m.addBinding(name, function(prop){
			m.bindAnimation(name, this, fn, prop);
		}, true);
	};

	m.addKFAnimation = function(name, arg, options){
		options = options || {};

		if(animations[name]) {
			return err("Animation " + name + " already defined.");
		}

		var init = function(props) {
			var aniId = aniName(props),
				hasAni = document.getElementById(aniId),
				kf;

			//	Only insert once
			if(!hasAni) {
				animations[name].id = aniId;

				props = normaliseTransformProps(props);
				//  Create keyframes
				kf = vp("@keyframes") + " " + aniId + " " + JSON.stringify(props)
					.split("\"").join("")
					.split("},").join("}\n")
					.split(",").join(";")
					.split("%:").join("% ");

				var s = document.createElement('style');
				s.setAttribute('id', aniId);
				s.id = aniId;
				s.textContent = kf;
				//  Might not have head?
				document.head.appendChild(s);
			}

			animations[name].isInitialised = true;
			animations[name].options.animateImmediately = true;
		};

		options.duration = options.duration || defaultDuration;
		options.animateImmediately = options.animateImmediately || false;

		animations[name] = {
			init: init,
			options: options,
			arg: arg
		};

		//	Add a default binding for the name
		m.addBinding(name, function(prop){
			m.bindAnimation(name, this, arg, prop);
		}, true);
	};


	/*	Options - defaults - what it does:

		Delay - unedefined - delays the animation
		Direction - 
		Duration
		FillMode - "forward" makes sure it sticks: http://www.w3schools.com/cssref/css3_pr_animation-fill-mode.asp
		IterationCount, 
		Name, PlayState, TimingFunction
	
	*/

	//	Useful to know, 'to' and 'from': http://lea.verou.me/2012/12/animations-with-one-keyframe/
	m.animateKF = function(name, el, options, cb){
		options = options || {};
		var ani = animations[name], i, props = {};
		if(!ani) {
			return err("Animation " + name + " not found.");
		}

		//	Allow override via options
		ani.options = ani.options || {};
		for(i in options) if(options.hasOwnProperty(i)) {{
			ani.options[i] = options[i];
		}}

		if(!ani.isInitialised && ani.init) {
			ani.init(ani.arg);
		}

		//	Allow animate overrides
		for(i in ani.options) if(ani.options.hasOwnProperty(i)) {{
			props[vp("animation" + cap(i))] = ani.options[i];
		}}

		//	Set required items and default values for props
		props[vp("animationName")] = ani.id;
		props[vp("animationDuration")] = (props[vp("animationDuration")]? props[vp("animationDuration")]: defaultDuration) + "ms";
		props[vp("animationDelay")] = props[vp("animationDelay")]? props[vp("animationDuration")] + "ms": undefined;
		props[vp("animationFillMode")] = props[vp("animationFillMode")] || "forwards";

		el.style = el.style || {};

		//	Use for callback
		var endAni = function(){
			//	Remove listener
			el.removeEventListener("animationend", endAni, false);
			if(cb){
				cb(el);
			}
		};

		//	Remove animation if any
		el.style[vp("animation")] = "";
		el.style[vp("animationName")] = "";

		//	Must use two request animation frame calls, for FF to
		//	work properly, does not seem to have any adverse effects
		requestAnimationFrame(function(){
			requestAnimationFrame(function(){
				//	Apply props
				for(i in props) if(props.hasOwnProperty(i)) {{
					el.style[i] = props[i];
				}}

				el.addEventListener("animationend", endAni, false);
			});
		});
	};

	m.triggerKF = function(name, options){
		return function(){
			m.animateKF(name, this, options);
		};
	};

	m.bindAnimation = function(name, el, options, prop) {
		var ani = animations[name];

		if(!ani && !ani.name) {
			return err("Animation " + name + " not found.");
		}

		if(ani.fn) {
			m.animateProperties(el, ani.fn(prop));
		} else {
			var oldConfig = el.config;
			el.config = function(el, isInit){
				if(!ani.isInitialised && ani.init) {
					ani.init(options);
				}
				if(prop() && isInit) {
					m.animateKF(name, el, options);
				}
				if(oldConfig) {
					oldConfig.apply(el, arguments);
				}
			};
		}
	};



	/* Default transform2d bindings */
	var basicBindings = ['scale', 'scalex', 'scaley', 'translate', 'translatex', 'translatey', 
		'matrix', 'backgroundColor', 'backgroundPosition', 'borderBottomColor', 
		'borderBottomWidth', 'borderLeftColor', 'borderLeftWidth', 'borderRightColor', 
		'borderRightWidth', 'borderSpacing', 'borderTopColor', 'borderTopWidth', 'bottom', 
		'clip', 'color', 'fontSize', 'fontWeight', 'height', 'left', 'letterSpacing', 
		'lineHeight', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'maxHeight', 
		'maxWidth', 'minHeight', 'minWidth', 'opacity', 'outlineColor', 'outlineWidth', 
		'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'right', 'textIndent', 
		'textShadow', 'top', 'verticalAlign', 'visibility', 'width', 'wordSpacing', 'zIndex'],
		degBindings = ['rotate', 'rotatex', 'rotatey', 'skewx', 'skewy'], i;

	//	Basic bindings where we pass the prop straight through
	for(i = 0; i < basicBindings.length; i += 1) {
		(function(name){
			m.addAnimation(name, function(prop){
				var options = {};
				options[name] = prop();
				return options;
			});
		}(basicBindings[i]));
	}

	//	Degree based bindings - conditionally postfix with "deg"
	for(i = 0; i < degBindings.length; i += 1) {
		(function(name){
			m.addAnimation(name, function(prop){
				var options = {}, value = prop();
				options[name] = isNaN(value)? value: value + "deg";
				return options;
			});
		}(degBindings[i]));
	}

	//	Attributes that require more than one prop
	m.addAnimation("skew", function(prop){
		var value = prop();
		return {
			skew: [
				value[0] + (isNaN(value[0])? "":"deg"), 
				value[1] + (isNaN(value[1])? "":"deg")
			]
		};
	});



	//	A few more bindings
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







if (typeof module != "undefined" && module !== null && module.exports) {
	module.exports = mithrilAnimate;
} else if (typeof define === "function" && define.amd) {
	define(function() {
		return mithrilAnimate;
	});
} else {
	mithrilAnimate(typeof window != "undefined"? window.m || {}: {});
}

}());
},{}],3:[function(require,module,exports){
//  Smooth scrolling for links
//  Usage:      A({config: smoothScroll(ctrl), href: "#top"}, "Back to top")
module.exports = function(ctrl){
	//var root = (typeof document !== 'undefined')? document.body || document.documentElement: this,
	var root = (typeof navigator !== 'undefined')? /firefox|trident/i.test(navigator.userAgent) ? document.documentElement : document.body: null,
		easeInOutSine = function (t, b, c, d) {
			//  http://gizma.com/easing/
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		};

	return function(element, isInitialized) {
		if(!isInitialized) {
			element.addEventListener("click", function(e) {
				var startTime,
					startPos = root.scrollTop,
					endPos = document.getElementById(/[^#]+$/.exec(this.href)[0]).getBoundingClientRect().top,
					hash = this.href.substr(this.href.lastIndexOf("#")),
					maxScroll = root.scrollHeight - window.innerHeight,
					scrollEndValue = (startPos + endPos < maxScroll)? endPos: maxScroll - startPos,
					duration = typeof ctrl.duration !== 'undefined'? ctrl.duration: 1500,
					scrollFunc = function(timestamp) {
						startTime = startTime || timestamp;
						var elapsed = timestamp - startTime,
							progress = easeInOutSine(elapsed, startPos, scrollEndValue, duration);
						root.scrollTop = progress;
						if(elapsed < duration) {
							requestAnimationFrame(scrollFunc);
						} else {
							if(history.pushState) {
								history.pushState(null, null, hash);
							} else {
								location.hash = hash;
							}

						}
					};

				requestAnimationFrame(scrollFunc)
				e.preventDefault();
			});
		}
	};
};
},{}],4:[function(require,module,exports){
module.exports = function(){ return {"Creating-a-todo-app.md":"<p>In this article we will create a fully functional todo app, complete with details of how to use the database API and persisting/loading your data. We recommend you first read the [Getting started] article, and understand the miso fundamentals such as where to place models and how to creating a miso controller. Please do that first, it only takes 2 minutes.</p>\n<h2><a name=\"todo-app\" class=\"anchor\" href=\"#todo-app\"><span class=\"header-link\">Todo app</span></a></h2><p>We will now create a new app using the <a href=\"/doc/Patterns#single-url-mvc.md\">single url pattern</a>, which means it handles all actions autonomously, plus looks a lot like a normal mithril app.</p>\n<p>In <code>/mvc</code> save a new file as <code>todo.js</code> with the following content: </p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {},\n    controller: function(params) {\n        return this;\n    },\n    view: function(ctrl) {\n        return &quot;TODO&quot;;\n    }\n};\n</code></pre>\n<p>Now open: <a href=\"/doc/todos.md\">http://localhost:6476/todos</a> and you&#39;ll see the word &quot;TODO&quot;. You&#39;ll notice that the url is &quot;/todos&quot; with an &#39;s&#39; on the end - as we are using <a href=\"/doc/How-miso-works#route-by-convention.md\">route by convention</a> to map our route.</p>\n<p>Next let&#39;s create the model for our todos - change the <code>models</code> attribute to the following:</p>\n<pre><code class=\"lang-javascript\">models: {\n    //    Our todo model\n    todo: function(data){\n        this.text = data.text;\n        this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n        this._id = data._id;\n    }\n},\n</code></pre>\n<p>Each line in the model does the following:</p>\n<ul>\n<li><code>this.text</code> - The text that is shown on the todo</li>\n<li><code>this.data</code> - This represents if the todo has been completed - we ensure that we handle the &quot;false&quot; values correctly, as ajax responses are always strings.</li>\n<li><code>this._id</code> - The key for the todo - you must use <code>_id</code> for this</li>\n</ul>\n<p>The model can now be used to store and retreive todos - miso automatically picks up any objects on the <code>models</code> attribute of your mvc file, and maps it in the API. We will soon see how that works. Next add the following code as the controller:</p>\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n    this.list = Object.keys(myTodos).map(function(key) {\n        return new self.models.todo(myTodos[key]);\n    });\n    return this;\n},\n</code></pre>\n<p>This does the following:</p>\n<ul>\n<li>Creates <code>myTodos</code> which is a list of objects that represents todos</li>\n<li><code>this.list</code> - creates a list of todo model objects by using <code>new self.models.todo(...</code> on each myTodos object.</li>\n<li><code>return this</code> must be done in all controllers, it makes sure that miso can correctly get access to the controller object.</li>\n</ul>\n<p>Now update the view like so:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    return m(&quot;UL&quot;, [\n        ctrl.list.map(function(todo){\n            return m(&quot;LI&quot;, todo.text)\n        })\n    ]);\n}\n</code></pre>\n<p>This will iterate on your newly created list of todo model objects and display the on screen. Your complete program should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {\n        //    Our todo model\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n        this.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n        return this;\n    },\n    view: function(ctrl) {\n        return m(&quot;UL&quot;, [\n            ctrl.list.map(function(todo){\n                return m(&quot;LI&quot;, todo.text)\n            })\n        ]);\n    }\n};\n</code></pre>\n<blockquote>\nSo far we have only used pure mithril to create our app - miso did do some of the grunt-work behind the scenes, but we can do much more.\n</blockquote>\n\n\n<p>Let us add some useful libraries, change the top section to:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    api = require(&#39;../system/api.server.js&#39;)(m, this);\n</code></pre>\n<p>This will include the following libraries:</p>\n<ul>\n<li><a href=\"/doc/mithril.sugartags.md\">mithril.sugartags</a> - allows rendering HTML using tags that look a little more like HTML than standard mithril</li>\n<li><a href=\"/doc/mithril.bindings.md\">mithril.bindings</a> Bi-directional data bindings for richer models</li>\n<li>miso utilities - isomorphic abstraction for common tasks</li>\n<li>api - the configured database adaptor</li>\n</ul>\n<p>Let us start with the sugar tags, update the view to read:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return UL([\n            ctrl.list.map(function(todo){\n                return LI(todo.text)\n            })\n        ])\n    };\n}\n</code></pre>\n<p>So using sugartags allows us to write more concise views, that look more like natural HTML.</p>\n<p>Next let us update the functionality a little - add the following method to the controller:</p>\n<pre><code class=\"lang-javascript\">this.done = function(todo){\n    return function() {\n        todo.done(!todo.done());\n    }\n};\n</code></pre>\n<p>This method will return a function that toggles the <code>done</code> attribute on the passed in todo. Next change the view to:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return [\n            STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n            UL([\n                ctrl.list.map(function(todo){\n                    return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.done(todo) }, todo.text);\n                })\n            ])\n        ]\n    };\n}\n</code></pre>\n<p>This will make the list of todos clickable, and put a strike-through the todo when it is set to &quot;done&quot;.</p>\n","Getting-started.md":"<p>This guide will take you through making your first miso app, it is assumed that you know the basics of how to use nodejs and mithril.</p>\n<h2><a name=\"installation\" class=\"anchor\" href=\"#installation\"><span class=\"header-link\">Installation</span></a></h2><p>To install miso, use npm:</p>\n<pre><code class=\"lang-javascript\">npm install misojs -g\n</code></pre>\n<p>To create and run a miso app in a new directory:</p>\n<pre><code class=\"lang-javascript\">miso -n myapp\ncd myapp\nmiso run\n</code></pre>\n<p>You should now see something like:</p>\n<pre><code>Miso is listening at http://localhost:6476 in development mode\n</code></pre><p>Open your browser at <code>http://localhost:6476</code> and you will see the default miso screen</p>\n<h2><a name=\"hello-world-app\" class=\"anchor\" href=\"#hello-world-app\"><span class=\"header-link\">Hello world app</span></a></h2><p>Create a new file <code>hello.js</code> in <code>myapp/mvc</code> like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new edit.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;Hello &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<p>Then open <a href=\"/doc/YOURNAME.md\">http://localhost:6476/hello/YOURNAME</a> and you should see &quot;Hello YOURNAME&quot;. Change the url to have your actual name instead of YOURNAME, you now know miso :)</p>\n<p>Let us take a look at what each piece of the code is actually doing:</p>\n<h3><a name=\"includes\" class=\"anchor\" href=\"#includes\"><span class=\"header-link\">Includes</span></a></h3><blockquote>\nSummary: Mithril is the only required library when apps, but using other included libraries is very useful\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n</code></pre>\n<p>Here we grab mithril, then miso utilities and sugar tags - technically speaking, we really only need mithril, but the other libraries are very useful as well as we will see.</p>\n<h3><a name=\"models\" class=\"anchor\" href=\"#models\"><span class=\"header-link\">Models</span></a></h3><blockquote>\nSummary: Use the automatic routing when you can, always put models on the &#39;models&#39; attribute of your mvc file\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n</code></pre>\n<p>Here a few important things are going on:</p>\n<ul>\n<li><p>By placing our <code>mvc</code> object on <code>module.exports.edit</code>, automatic routing is applied by miso - you can read more about <a href=\"/doc/How-miso-works#route-by-convention.md\">how the automatic routing works here</a>. </p>\n</li>\n<li><p>Placing our <code>hello</code> model on the <code>models</code> attribute of the object ensures that miso can figure out what your models are, and will create a persistence API automatically for you when the server starts up, so that you can save your models into the database.</p>\n</li>\n</ul>\n<h3><a name=\"controller\" class=\"anchor\" href=\"#controller\"><span class=\"header-link\">Controller</span></a></h3><blockquote>\nSummary: DO NOT forget to &#39;return this;&#39; in the controller, it is vital!\n</blockquote>\n\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var who = miso.getParam(&#39;hello_id&#39;, params);\n    this.model = new edit.models.hello({who: who});\n    return this;\n},\n</code></pre>\n<p>The controller uses <code>miso.getParam</code> to retreive the parameter - this is so that it can work seamlessly on both the server and client side. We create a new model, and very importantly <code>return this</code> ensures that miso can get access to the controller correctly.</p>\n<h3><a name=\"view\" class=\"anchor\" href=\"#view\"><span class=\"header-link\">View</span></a></h3><blockquote>\nSummary: Use sugartags to make the view look more like HTML\n</blockquote>\n\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return DIV(&quot;Hello &quot; + ctrl.model.who());\n    }\n}\n</code></pre>\n<p>The view is simply a javascript function that returns a structure. Here we use the <code>sugartags</code> library to render the DIV tag - this is strictly not required, but I find that people tend to understand the sugartags syntax better than pure mithril, as it looks a little more like HTML, though of course you could use standard mithril syntax if you prefer.</p>\n<h3><a name=\"next\" class=\"anchor\" href=\"#next\"><span class=\"header-link\">Next</span></a></h3><p>You now have a complete hello world app, and understand the fundamentals of the structure of a miso mvc application.</p>\n<p>We have only just scraped the surface of what miso is capable of, so next we recommend you read:</p>\n<p><a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a></p>\n","Goals.md":"<h1><a name=\"primary-goals\" class=\"anchor\" href=\"#primary-goals\"><span class=\"header-link\">Primary goals</span></a></h1><ul>\n<li>Easy setup of <a href=\"/doc/.md\">isomorphic</a> application based on <a href=\"/doc/mithril.js.md\">mithril</a></li>\n<li>Skeleton / scaffold / Boilerplate to allow users to very quickly get up and running.</li>\n<li>minimal core</li>\n<li>easy extendible</li>\n<li>DB agnostic (e. G. plugins for different ORM/ODM)</li>\n</ul>\n<h1><a name=\"components\" class=\"anchor\" href=\"#components\"><span class=\"header-link\">Components</span></a></h1><ul>\n<li>Routing</li>\n<li>View rendering</li>\n<li>i18n/l10n</li>\n<li>Rest-API (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>optional Websockets (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>easy testing (headless and Browser-Tests)</li>\n<li>login/session handling</li>\n<li>models with validation</li>\n</ul>\n<h1><a name=\"useful-libs\" class=\"anchor\" href=\"#useful-libs\"><span class=\"header-link\">Useful libs</span></a></h1><p>Here are some libraries we are considering using, (in no particular order):</p>\n<ul>\n<li>leveldb</li>\n<li>mithril-query</li>\n<li>translate.js</li>\n<li>i18next</li>\n</ul>\n<p>And some that we&#39;re already using:</p>\n<ul>\n<li>express</li>\n<li>browserify</li>\n<li>mocha/expect</li>\n<li>mithril-node-render</li>\n<li>mithril-sugartags</li>\n<li>mithril-bindings</li>\n<li>mithril-animate</li>\n<li>lodash</li>\n<li>validator</li>\n</ul>\n","Home.md":"<p>Welcome to the misojs wiki!</p>\n<h1><a name=\"getting-started\" class=\"anchor\" href=\"#getting-started\"><span class=\"header-link\">Getting started</span></a></h1><p>See the <a href=\"/doc/misojs#install.md\">install guide</a>.\nRead <a href=\"/doc/How-miso-works.md\">how miso works</a>, and check out <a href=\"/doc/Patterns.md\">the patterns</a>, then create something cool!</p>\n","How-miso-works.md":"<h2><a name=\"models-views-controllers\" class=\"anchor\" href=\"#models-views-controllers\"><span class=\"header-link\">Models, views, controllers</span></a></h2><p>When creating a route, you must assign a controller and a view to it - this is achieved by creating a file in the <code>/mvc</code> directory - by convention, you should name it as per the path you want, (see the <a href=\"/doc/#routing.md\">routing section</a> for details).</p>\n<p>Here is a minimal example using the sugartags, and getting a parameter:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nmodule.exports.index = {\n    controller: function(params) {\n        this.who = miso.getParam(&#39;who&#39;, params, &#39;world&#39;);\n        return this;\n    },\n    view: function(ctrl){\n        with(sugartags) {\n            return DIV(&#39;Hello &#39; + ctrl.who);\n        }\n    }\n};\n</code></pre>\n<p>Save this into a file <code>/mvc/hello.js</code>, and open <a href=\"/doc/hellos.md\">http://localhost/hellos</a>, this will show &quot;Hello world&quot;. Note the &#39;s&#39; on the end - this is due to how the <a href=\"/doc/#route-by-convention.md\">route by convention</a> works.</p>\n<p>Now open <code>/cfg/routes.json</code>, and add the following routes:</p>\n<pre><code class=\"lang-javascript\">    &quot;/hello&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/hello/:who&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; }\n</code></pre>\n<p>Save the file, and go back to the browser, and you&#39;ll see an error! This is because we have now overridden the automatic route. Open <a href=\"/doc/hello.md\">http://localhost/hello</a>, and you&#39;ll see our action. Now open <a href=\"/doc/YOURNAME.md\">http://localhost/hello/YOURNAME</a>, and you&#39;ll see it getting the first parameter, and greeting you!</p>\n<h2><a name=\"routing\" class=\"anchor\" href=\"#routing\"><span class=\"header-link\">Routing</span></a></h2><p>The routing can be defined in one of two ways</p>\n<h3><a name=\"route-by-convention\" class=\"anchor\" href=\"#route-by-convention\"><span class=\"header-link\">Route by convention</span></a></h3><p>You can use a naming convention as follows:</p>\n<table>\n<thead>\n<tr>\n<th>Action</th>\n<th>Method</th>\n<th>URL</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>index</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39;</td>\n<td>List the items</td>\n</tr>\n<tr>\n<td>edit</td>\n<td>GET</td>\n<td>[controller]/[id]</td>\n<td>Display a form to edit the item</td>\n</tr>\n<tr>\n<td>new</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39; + &#39;/new&#39;</td>\n<td>Display a form to add a new item</td>\n</tr>\n</tbody>\n</table>\n<p>Say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/users&quot;.<br>Now say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.edit = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/user/:user_id&quot;, so that users can access via a route such as &quot;/user/27&quot; for use with ID of 27. <em>Note:</em> You can get the user_id using a miso utility: <code>var userId = miso.getParam(&#39;user_id&#39;, params);</code>.</p>\n<h3><a name=\"route-by-configuration\" class=\"anchor\" href=\"#route-by-configuration\"><span class=\"header-link\">Route by configuration</span></a></h3><p>By using <code>/cfg/routes.json</code> config file:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;[Pattern]&quot;: { &quot;method&quot;: &quot;[Method]&quot;, &quot;name&quot;: &quot;[Route name]&quot;, &quot;action&quot;: &quot;[Action]&quot; }\n}\n</code></pre>\n<p>Where:</p>\n<ul>\n<li><strong>Pattern</strong> - the <a href=\"/doc/#routing-patterns.md\">route pattern</a> we want, including any parameters</li>\n<li><strong>Method</strong> - one of &#39;GET&#39;, &#39;POST&#39;, &#39;PUT&#39;, &#39;DELETE&#39;</li>\n<li><strong>Route</strong> name - name of your route file from /mvc</li>\n<li><strong>Action</strong> - name of the action to call on your route file from /mvc</li>\n</ul>\n<p><strong>Example</strong></p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;home&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This will map a &quot;GET&quot; to the root of the URL for the <code>index</code> action in <code>home.js</code></p>\n<p><strong>Note:</strong> The routing config will override any automatically defined routes, so if you need multiple routes to point to the same action, you must manually define them. For example, if you have a mvc file named &quot;term.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/terms&quot;. Now, if you want to map it also to &quot;/AGB&quot;, you will need to add two entries in the routes config:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/terms&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/AGB&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This is because Miso assumes that if you override the defaulted routes, you actually want to replace them, not just override them. <em>Note:</em> this is correct behaviour, as it minority case is when you want more than one route pointing to the same action.</p>\n<h3><a name=\"routing-patterns\" class=\"anchor\" href=\"#routing-patterns\"><span class=\"header-link\">Routing patterns</span></a></h3><table>\n<thead>\n<tr>\n<th>Type</th>\n<th>Example</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Path</td>\n<td>&quot;/abcd&quot; - match paths starting with /abcd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/abc?d&quot; - match paths starting with /abcd and /abd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab+cd&quot; - match paths starting with /abcd, /abbcd, /abbbbbcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab*cd&quot; - match paths starting with /abcd, /abxcd, /abFOOcd, /abbArcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/a(bc)?d&quot; - will match paths starting with /ad and /abcd</td>\n</tr>\n<tr>\n<td>Regular Expression</td>\n<td>/\\/abc&#124;\\/xyz/ - will match paths starting with /abc and /xyz</td>\n</tr>\n<tr>\n<td>Array</td>\n<td>[&quot;/abcd&quot;, &quot;/xyza&quot;, /\\/lmn&#124;\\/pqr/] - match paths starting with /abcd, /xyza, /lmn, and /pqr</td>\n</tr>\n</tbody>\n</table>\n<h3><a name=\"links\" class=\"anchor\" href=\"#links\"><span class=\"header-link\">Links</span></a></h3><p>When you create links, in order to get the app to work as an SPA, you must pass in m.route as a config, so that the history will be updated correctly, for example:</p>\n<pre><code class=\"lang-javascript\">A({href:&quot;/users/new&quot;, config: m.route}, &quot;Add new user&quot;)\n</code></pre>\n<p>This will correctly work as a SPA. If you leave out <code>config: m.route</code>, the app will still work, but the page will reload every time the link is followed.</p>\n<ul>\n<li>Lightweight footprint</li>\n<li>Full-stack isomorphic framework</li>\n<li>SPA that renders the initial page server side</li>\n<li>Data models with isomorphic validation</li>\n<li>Auto-reload browser on changes</li>\n</ul>\n<h2><a name=\"data-models\" class=\"anchor\" href=\"#data-models\"><span class=\"header-link\">Data models</span></a></h2><p>Data models are progressively enhanced mithril models - you simply create your model as usual, then add validation and type information as it becomes pertinent.\nFor example, say you have a model like so:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n    return this;\n}\n</code></pre>\n<p>In order to make it validatable, add the validator module:</p>\n<pre><code class=\"lang-javascript\">var validate = require(&#39;validator.modelbinder&#39;);\n</code></pre>\n<p>Then add a <code>isValid</code> validation method to your model, with any declarations based on <a href=\"/doc/validator.js#validators.md\">node validator</a>:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n\n    //    Validate the model        \n    this.isValid = validate.bind(this, {\n        name: {\n            isRequired: &quot;You must enter a name&quot;\n        },\n        email: {\n            isRequired: &quot;You must enter an email address&quot;,\n            isEmail: &quot;Must be a valid email address&quot;\n        }\n    });\n\n    return this;\n};\n</code></pre>\n<p>This creates a method that the miso database adaptor can use to validate your model.\nYou get full access to the validation info as well, so you can show an error message near your field, for example:</p>\n<pre><code class=\"lang-javascript\">user.isValid(&#39;email&#39;)\n</code></pre>\n<p>Will return <code>true</code> if the <code>email</code> property of your user model is valid, or a list of errors messages if it is invalid:</p>\n<pre><code class=\"lang-javascript\">[&quot;You must enter an email address&quot;, &quot;Must be a valid email address&quot;]\n</code></pre>\n<p>So you can for example add a class name to a div surrounding your field like so:</p>\n<pre><code class=\"lang-javascript\">DIV({class: (ctrl.user.isValid(&#39;email&#39;) == true? &quot;valid&quot;: &quot;invalid&quot;)}, [...\n</code></pre>\n<p>And show the error messages like so:</p>\n<pre><code class=\"lang-javascript\">SPAN(ctrl.user.isValid(&#39;email&#39;) == true? &quot;&quot;: ctrl.user.isValid(&#39;email&#39;).join(&quot;, &quot;))\n</code></pre>\n<h2><a name=\"database-adaptor-api-and-model-interaction\" class=\"anchor\" href=\"#database-adaptor-api-and-model-interaction\"><span class=\"header-link\">Database adaptor, api and model interaction</span></a></h2><p>Miso uses the model definitions that you declare in your <code>mvc</code> file to build up a set of models that the API can use, the model definitions work like this:</p>\n<ul>\n<li>On the models attribute of the mvc, we  define a standard mithril data model, (ie: a javascript object where properties can be either standard javascript data types, or a function that works as a getter/setter, eg: <code>m.prop</code>)</li>\n<li>On server startup, miso reads this and creates a cache of the model objects, including the name space of the model, eg: &quot;hello.edit.hello&quot;</li>\n<li>Models can optionally include data validation information, and the database adaptor will get access to this.</li>\n</ul>\n<p>Assuming we have a model in the hello.models object like so:</p>\n<pre><code class=\"lang-javascript\">hello: function(data){\n    this.who = m.prop(data.who);\n    this.isValid = validate.bind(this, {\n        who: {\n            isRequired: &quot;You must know who you are talking to&quot;\n        }\n    });\n}\n</code></pre>\n<p>The API works like this:</p>\n<ul>\n<li>We create an endpoint at <code>/api</code> where each we load whatever adaptor is configured in <code>/cfg/server.json</code>, and expose each method. For example <code>/api/save</code> is available for the default <code>flatfiledb</code> adaptor.</li>\n<li>Next we create a set of API files - one for client, (/system/api.client.js), and one for server (/system/api.server.js) - each have the same methods, but do vastly different things:<ul>\n<li>api.client.js is a thin wrapper that uses mithril&#39;s m.request to create an ajax request to the server API, it simply passes messages back and forth (in JSON RPC 2.0 format).</li>\n<li>api.server.js calls the database adaptor methods, which in turn handles models and validation so for example when a request is made and a <code>type</code> and <code>model</code> is included, we can re-construct the data model based on this info, for example you might send: {type: &#39;hello.edit.hello&#39;, model: {who: &#39;Dave&#39;}}, this can then be cast back into a model that we can call the <code>isValid</code> method on.</li>\n</ul>\n</li>\n</ul>\n<p><strong>Now, the important bit:</strong> The reason for all this functionality is that mithril internally delays rendering to the DOM whilst a request is going on, so we need to handle this within miso - in order to be able to render things on the server - so we have a binding system that delays rendering whilst an async request is still being executed. That means mithril-like code like this:</p>\n<pre><code class=\"lang-javascript\">controller: function(){\n    var ctrl = this;\n    api.find({type: &#39;hello.index.hello&#39;}).then(function(data) {\n        var list = Object.keys(data.result).map(function(key) {\n            var myHello = data.result[key];\n            return new self.models.hello(myHello);\n        });\n        ctrl.model = new ctrl.vm.todoList(list);\n    });\n    return ctrl;\n}\n</code></pre>\n<p>Will still work. Note: the magic here is that there is absolutely nothing in the code above that runs a callback to let mithril know the data is ready - this is a design feature of mithril to delay rendering automatically whilst an <code>m.request</code> is in progress, so we cater for this to have the ability to render the page server-side first, so that SEO works out of the box.</p>\n<h2><a name=\"client-vs-server-code\" class=\"anchor\" href=\"#client-vs-server-code\"><span class=\"header-link\">Client vs server code</span></a></h2><p>In miso, you include files using the standard nodejs <code>require</code> function. When you need to do something that works differently in the browser than the server, there are a few ways you can achieve it:</p>\n<ul>\n<li>The recommended way is to create and require a file in the <code>server/</code> directory, and then create the same file in the <code>client/</code> directory, and miso will automatically load that file for you on the client side.</li>\n<li>If this is not to your liking, another option is to use <code>miso.util</code> - you can use <code>miso.util.isServer()</code> to test if you&#39;re on the server or not, though it is better practice to use the server/client directory method.</li>\n</ul>\n<h2><a name=\"requiring-files\" class=\"anchor\" href=\"#requiring-files\"><span class=\"header-link\">Requiring files</span></a></h2><p>When requiring files, be sure to do so in a static manner so that browserify is able to compile the client side script. Always use:</p>\n<pre><code class=\"lang-javascript\">var miso = require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>NEVER DO ANY OF THESE:</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar miso = new require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>This will create an object, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar thing = &#39;miso&#39;;\nvar miso = require(&#39;../server/&#39;+thing+&#39;.util.js&#39;);\n</code></pre>\n<p>This will create an expression, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n","Patterns.md":"<p>There are several ways you can write your app and miso is not opinionated about how you go about this so it is important that you choose a pattern that suits your needs. Below are a few suggested patterns to follow when developing apps.</p>\n<p><strong>Note:</strong> miso is a single page app that loads server rendered HTML from any URL, so that SEO works out of the box.</p>\n<h2><a name=\"single-url-mvc\" class=\"anchor\" href=\"#single-url-mvc\"><span class=\"header-link\">Single url mvc</span></a></h2><p>In this pattern everything that your mvc needs to do is done on a single url for all the associated actions. The advantage for this style of development is that you have everything in one mvc container, and you don&#39;t need to map any routes - of course the downside being that there are no routes for the user to bookmark. This is pattern works well for smaller entities where there are not too many interactions that the user can do - this is essentially how most mithril apps are written - self-contained, and at a single url.</p>\n<p>Here is a &quot;hello world&quot; example using the single url pattern</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new self.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>This would expose a url /hellos (note: the &#39;s&#39;), and would display &quot;Hello world&quot;. (You can change the route using custom routing)</p>\n<h2><a name=\"multi-url-mvc\" class=\"anchor\" href=\"#multi-url-mvc\"><span class=\"header-link\">Multi url mvc</span></a></h2><p>In this pattern we expose multiple mvc routes that in turn translate to multiple URLs. This is useful for splitting up your app, and ensuring each mvc has its own sets of concerns.</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar index = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new index.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who()),\n                A({href: &quot;/hello/Leo&quot;, config: m.route}, &quot;Click me for the edit action&quot;)\n            ];\n        }\n    }\n};\n\nvar edit = module.exports.edit = {\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new index.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>Here we also expose a &quot;/hello/[NAME]&quot; url, that will show your name when you visit /hello/[YOUR NAME], so there are now multiple urls for our SPA:</p>\n<ul>\n<li><strong>/hellos</strong> - this is intended to be an index page that lists all your &quot;hellos&quot;</li>\n<li><strong>/hello/[NAME]</strong> - this is intended to be an edit page where you can edit your &quot;hellos&quot;</li>\n</ul>\n<p>Note that the anchor tag has <code>config: m.route</code> in it&#39;s options - this is so that we can route automatically though mithril</p>\n"}; };
},{}],5:[function(require,module,exports){
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
module.exports = function(m){
	var getModelData = function(model){
		var i, result = {};
		for(i in model) {if(model.hasOwnProperty(i)) {
			if(i !== 'isValid') {
				if(i == 'id') {
					result['_id'] = (typeof model[i] == 'function')? model[i](): model[i];
				} else {
					result[i] = (typeof model[i] == 'function')? model[i](): model[i];
				}
			}
		}}
		return result;
	};
	return {
'find': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/adapt/find',
		data: args
	});
},
'save': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/adapt/save',
		data: args
	});
},
'remove': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/adapt/remove',
		data: args
	});
},
'hello': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/adapt/hello',
		data: args
	});
}
	};
};
},{}],6:[function(require,module,exports){
var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	db = require("../modules/adaptor/adapt/api.client.js")(m);

var edit = module.exports.edit = {
	models: {
		hello: function(data){
			this.who = m.prop(data.who);
		}
	},
	controller: function(params) {
		var ctrl = this,
			who = miso.getParam('adapt_id', params);

		db.hello({}).then(function(data){
			ctrl.model.who(data.result);
		});

		ctrl.model = new edit.models.hello({who: who});
		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV("G'day " + ctrl.model.who());
		}
	}
};
},{"../modules/adaptor/adapt/api.client.js":5,"../server/miso.util.js":1,"mithril":13,"mithril.sugartags":12}],7:[function(require,module,exports){
var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	//	Grab the generated client version...
	docs = require('../client/miso.documentation.js');

var index = module.exports.index = {
	models: {
		//	Our model
		docs: function(data){
			this.docs = data.docs;
			this.id = data.id;
			this.niceName = function(name){
				return name.substr(0,name.lastIndexOf(".md")).split("-").join(" ");
			};
		}
	},
	controller: function(params) {
		this.model = new index.models.docs({
			docs: docs()
		});
		return this;
	},
	view: function(ctrl) {
		var model = ctrl.model;
		with(sugartags) {
			return DIV({"class": "doc cw"}, [
				DIV("Below is a list of documentation for miso:"),
				UL([
					miso.each(model.docs, function(doc, key){
						//	Skip home page...
						if(key !== "Home.md") {
							return LI(
								A({href: "/doc/" + key, config: m.route}, model.niceName(key))
							);
						} 
					})
				]),
				DIV("Examples:"),
				UL([
					LI(A({href: "/todos", config: m.route}, "Todos example")),
					LI(A({href: "/users", config: m.route}, "Users example"))
				]),
				//	Use manual prism, so that it works in SPA mode
				SCRIPT({src: "/external/prism/prism.js", "data-manual": ""})
			]);
		}
	}
};

var edit = module.exports.edit = {
	controller: function(params) {
		var doc_id = miso.getParam('doc_id', params);
		this.model = new index.models.docs({
			docs: docs(),
			id: doc_id
		});
		return this;
	},
	view: function(ctrl) {
		var model = ctrl.model;
		with(sugartags) {
			return DIV({"class": "doc cw"}, [
				LINK({href: "/external/prism/prism.css", rel: "stylesheet"}),
				H1(model.niceName(model.id)),
				ARTICLE(m.trust(model.docs[model.id])),
				//	Use manual prism, so that it works in SPA mode
				SCRIPT({src: "/external/prism/prism.js", "data-manual": ""}),
				SCRIPT("Prism.highlightAll();")
			]);
		}
	}
};
},{"../client/miso.documentation.js":4,"../server/miso.util.js":1,"mithril":13,"mithril.sugartags":12}],8:[function(require,module,exports){
var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m);

var edit = module.exports.edit = {
	models: {
		hello: function(data){
			this.who = m.prop(data.who);
		}
	},
	controller: function(params) {
		var who = miso.getParam('hello_id', params);
		this.model = new edit.models.hello({who: who});
		return this;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV("G'day " + ctrl.model.who());
		}
	}
};
},{"../server/miso.util.js":1,"mithril":13,"mithril.sugartags":12}],9:[function(require,module,exports){
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	smoothScroll = require('../client/js/mithril.smoothscroll.js');

//	Home page
var self = module.exports.index = {
	models: {
		intro: function() {
			this.text = m.p("Create apps in a snap!");
			this.ani = m.p(0);
			this.demoImgSrc = m.p("img/misodemo.gif");
		}
	},
	controller: function(){
		var ctrl = this;

		ctrl.replay = function(){
			var tmpSrc = ctrl.model.demoImgSrc();
			ctrl.model.demoImgSrc("");
			setTimeout(function(){
				ctrl.model.demoImgSrc(tmpSrc);
			},0);
		};

		ctrl.model = new self.models.intro();
		return this;
	},

	view: function(ctrl){
		var o = ctrl.model;
		with(sugartags) {
			return DIV([
				DIV({"class": "intro"}, [
					DIV({"class": "introText"}, o.text()),
					DIV({"class": "demoImg"}, [
						IMG({id: "demoImg", src: o.demoImgSrc()}),
						SPAN({"class": "replayButton", onclick: ctrl.replay}, "Replay")
					]),
					A({"class": "installButton", config: smoothScroll(ctrl), href: "#installation"}, "Install miso now")
				]),

				DIV({"class": "cw"}, [
					H2(A({name: "what", "class": "heading"},"What is miso?") ),
					P("Miso is an open source isomorphic javascript framework that allows you to write complete apps with much less effort than other frameworks. Miso features:",[
						UL({"class": "dotList"}, [
							LI("Single page apps with serverside rendered HTML for the first page - works perfectly with SEO and older browsers"),
							LI("Beautiful URLs - with a flexible routing system: automate some routes, take full control of others"),
							LI("Tiny clientside footprint - less than 25kb (gzipped and minified)"),
							LI("Fast live-code reload - smarter reload to help you work faster"),
							LI(["High performance - virtual dom engine, tiny footprint, faster than the rest", A({href: "http://lhorie.github.io/mithril/benchmarks.html", target: "_blank"}, "*")]),
							LI("Much less code - create a deployable app in less than 30 lines of code"),
							LI("Open source - MIT licensed")
						])
					]),
					P("Miso utilises excellent open source libraries and frameworks to create an extremely efficient full web stack. These frameworks include:"),
					DIV({"class": "frameworks"}, [
						DIV({"class": "fwcontainer cf"},[
							A({"class": "fwLink", href: "http://lhorie.github.io/mithril/", target: "_blank"},
							SPAN({"class": "fw mithril"})),
							A({"class": "fwLink", href: "http://expressjs.com/", target: "_blank"},SPAN({"class": "fw express"})),
							A({"class": "fwLink", href: "http://browserify.org/", target: "_blank"},SPAN({"class": "fw browserify"})),
							A({"class": "fwLink", href: "http://nodemon.io/", target: "_blank"},SPAN({"class": "fw nodemon"}))
						])
					])
				]),

				DIV({"class": "cw"}, [
					H2({id: "installation"}, A({name: "installation", "class": "heading"},"Installation") ),
					P("To install miso, use npm:"),
					PRE({"class": "javascript"},[
						CODE("npm install misojs -g")
					])
				]),

				DIV({"class": "cw"}, [
					H2(A({name: "gettingstarted", "class": "heading"},"Getting started") ),
					P("To create and run a miso app in a new directory:"),
					PRE({"class": "javascript"},[
						CODE("miso -n myApp\ncd myApp\nmiso run")
					]),
					P("Congratulations, you are now running your very own miso app in the 'myApp' directory!")
				]),

				DIV({"class": "cw"}, [
					H2(A({name: "examples", "class": "heading"},"Examples")),
					UL([
						LI(A({ href: '/todos', config: m.route}, "Todos example (single url SPA)")),
						LI(A({ href: '/users', config: m.route}, "Users example (multiple url SPA)"))
					]),
					H2({name: "documentation", "class": "heading"}, "Documentation"),
					A({href:"https://github.com/jsguy/misojs/wiki", target: "_blank"}, "Documentation can be found on the wiki")
				])
			]);
		}
	}
};

},{"../client/js/mithril.smoothscroll.js":3,"mithril":13,"mithril.sugartags":12}],10:[function(require,module,exports){
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	db = require("../system/adaptor/flatfiledb/api.client.js")(m);

var self = module.exports.index = {
	models: {
		todo: function(data){
			this.text = data.text;
			this.done = m.prop(data.done == "false"? false: data.done);
			this._id = data._id;
		}
	},
	controller: function(params) {
		var ctrl = this;

		db.find({type: 'todo.index.todo'}).then(function(data) {
			ctrl.list = Object.keys(data.result).map(function(key) {
				return new self.models.todo(data.result[key]);
			});
		});

		ctrl.addTodo = function(e){
			var value = ctrl.vm.input();
			if(value) {
				var newTodo = new self.models.todo({
					text: ctrl.vm.input(),
					done: false
				});
				ctrl.list.push(newTodo);
				ctrl.vm.input("");
				db.save({ type: 'todo.index.todo', model: newTodo } ).then(function(res){
					newTodo._id = res.result;
				});
			}
			e.preventDefault();
			return false;
		};

		ctrl.archive = function(){
			var list = [];
			ctrl.list.map(function(todo) {
				if(!todo.done()) {
					list.push(todo); 
				} else {
					db.remove({ type: 'todo.index.todo', _id: todo._id }).then(function(response){
						console.log(response.result);
					});
				}
			});
			ctrl.list = list;
		};

		ctrl.vm = {
			left: function(){
				var count = 0;
				ctrl.list.map(function(todo) {
					count += todo.done() ? 0 : 1;
				});
				return count;
			},
			done: function(todo){
				return function() {
					todo.done(!todo.done());
				}
			},
			input: m.prop("")
		};

		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return [
				STYLE(".done{text-decoration: line-through;}"),
				H1("Todos - " + ctrl.vm.left() + " of " + ctrl.list.length + " remaining"),
				BUTTON({ onclick: ctrl.archive }, "Archive"),
				UL([
					ctrl.list.map(function(todo){
						return LI({ class: todo.done()? "done": "", onclick: ctrl.vm.done(todo) }, todo.text);
					})
				]),
				FORM({ onsubmit: ctrl.addTodo }, [
					INPUT({ type: "text", value: ctrl.vm.input, placeholder: "Add todo"}),
					BUTTON({ type: "submit"}, "Add")
				])
			]
		};
	}
};
},{"../system/adaptor/flatfiledb/api.client.js":18,"mithril":13,"mithril.sugartags":12}],11:[function(require,module,exports){
/*
	This is a sample user management app that uses the
	multiple url miso pattern.
*/
var miso = require('../server/miso.util.js'),
	validate = require('validator.modelbinder'),
	m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	bindings = require('../server/mithril.bindings.node.js')(m),
	api = require("../system/adaptor/flatfiledb/api.client.js")(m);

var self = module.exports;

//	Shared view
var editView = function(ctrl){
	with(sugartags) {
		return DIV({ class: "cw" }, [
			H2({"class": "pageHeader"}, ctrl.header),
			ctrl.user ? [
				DIV([
					LABEL("Name"), INPUT({value: ctrl.user.name}),
					DIV({"class": (ctrl.user.isValid('name') == true || !ctrl.showErrors? "valid": "invalid") + " indented"}, [
						ctrl.user.isValid('name') == true || !ctrl.showErrors? "": ctrl.user.isValid('name').join(", ")
					])
				]),
				DIV([
					LABEL("Email"), INPUT({value: ctrl.user.email}),
					DIV({"class": (ctrl.user.isValid('email') == true || !ctrl.showErrors? "valid": "invalid") + " indented" }, [
						ctrl.user.isValid('email') == true || !ctrl.showErrors? "": ctrl.user.isValid('email').join(", ")
					])
				]),
				DIV({"class": "indented"},[
					BUTTON({onclick: ctrl.save, class: "positive"}, "Save user"),
					BUTTON({onclick: ctrl.remove, class: "negative"}, "Delete user")
				])
			]: DIV("User not found")
		]);
	}
};


//	User list
module.exports.index = {
	controller: function(params) {
		var ctrl = this;

		ctrl.vm = {
			userList: function(users){
				this.users = m.p(users);
			}
		};

		api.find({type: 'user.edit.user'}).then(function(data) {
			if(data.error) {
				console.log("Error " + data.error);
				return;
			}
			if(data.result) {
				var list = Object.keys(data.result).map(function(key) {
					return new self.edit.models.user(data.result[key]);
				});

				ctrl.users = new ctrl.vm.userList(list);
			} else {
				ctrl.users = new ctrl.vm.userList([]);
			}
		}, function(){
			console.log('Error', arguments);
		});

		return this;
	},
	view: function(ctrl){
		var c = ctrl,
			u = c.users;

		with(sugartags) {
			return DIV({ class: "cw" }, [
				UL([
					u.users().map(function(user, idx){
						return LI(A({ href: '/user/' + user.id(), config: m.route}, user.name() + " - " + user.email()));
					})
				]),
				A({"class":"button positive mtop", href:"/users/new", config: m.route}, "Add new user")
			]);
		}
	}
};


//	New user
module.exports.new = {
	controller: function(params) {
		var ctrl = this;
		ctrl.user = new self.edit.models.user({name: "", email: ""});
		ctrl.header = "New user";
		ctrl.showErrors = false;

		ctrl.save = function(){
			if(ctrl.user.isValid() !== true) {
				ctrl.showErrors = true;
				console.log('User is not valid');
			} else {
				//	TODO: return a proper THEN.
				api.save({ type: 'user.edit.user', model: ctrl.user } ).then(function(){
					console.log("Added user", arguments);
					m.route("/users");
				});
			}
		};

		return ctrl;
	},
	view: editView
};


//	Edit user
module.exports.edit = {
	models: {
		user: function(data){
			this.name = m.p(data.name||"");
			this.email = m.p(data.email||"");
			this.id = m.p(data._id||"");

			//	Validate the model
			this.isValid = validate.bind(this, {
				name: {
					isRequired: "You must enter a name"
				},
				email: {
					isRequired: "You must enter an email address",
					isEmail: "Must be a valid email address"
				}
			});

			return this;
		}
	},
	controller: function(params) {
		var ctrl = this,
			userId = miso.getParam('user_id', params);

		ctrl.header = "Edit user " + userId;

		//	Load our user
		api.find({type: 'user.edit.user', query: {_id: userId}}).then(function(data) {
			var user = data.result;
			if(user && user.length > 0) {
				ctrl.user = new self.edit.models.user(user[0]);
			} else {
				console.log('User not found', userId);
			}
		}, function(){
			console.log('Error', arguments);
		});

		ctrl.save = function(){
			api.save({ type: 'user.edit.user', model: ctrl.user } ).then(function(){
				console.log("Saved user", arguments);
				m.route("/users");
			});
		};

		ctrl.remove = function(){
			if(confirm("Delete user?")) {
				api.remove({ type: 'user.edit.user', _id: userId }).then(function(data){
					console.log(data.result);
					m.route("/users");
				});
			}
		};

		return ctrl;
	},
	view: editView
	/*
	,
	//	Any authentication info
	authenticate: {
		roles: ['admin', 'support']
	}
	*/
};

},{"../server/miso.util.js":1,"../server/mithril.bindings.node.js":17,"../system/adaptor/flatfiledb/api.client.js":18,"mithril":13,"mithril.sugartags":12,"validator.modelbinder":14}],12:[function(require,module,exports){
//	Mithril sugar tags.
//	Copyright (C) 2015 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(){
var mithrilSugartags = function(m, scope){
	m.sugarTags = m.sugarTags || {};
	scope = scope || m;

	var arg = function(l1, l2){
			var i;
			for (i in l2) {if(l2.hasOwnProperty(i)) {
				l1.push(l2[i]);
			}}
			return l1;
		}, 
		getClassList = function(args){
			var i, result;
			for(i in args) {
				if(args[i] && args[i].class) {
					return typeof (args[i].class == "string")? 
						args[i].class.split(" "):
						false;
				}
			}
		},
		makeSugarTag = function(tag) {
			var c, el;
			return function() {
				var args = Array.prototype.slice.call(arguments);
				//	if class is string, allow use of cache
				if(c = getClassList(args)) {
					el = [tag + "." + c.join(".")];
					//	Remove class tag, so we don't duplicate
					for(var i in args) {
						if(args[i] && args[i].class) {
							delete args[i].class;
						}
					}
				} else {
					el = [tag];
				}
				return (m.e? m.e: m).apply(this, arg(el, args));
			};
		},
		tagList = ["A","ABBR","ACRONYM","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BDI","BDO","BIG","BLOCKQUOTE","BODY","BR","BUTTON","CANVAS","CAPTION","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST","DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAME","FRAMESET","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME","IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","META","METER","NAV","NOSCRIPT","OBJECT","OL","OPTGROUP","OPTION","OUTPUT","P","PARAM","PRE","PROGRESS","Q","RP","RT","RUBY","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN","SPLIT","STRONG","STYLE","SUB","SUMMARY","SUP","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD","TIME","TITLE","TR","TRACK","TT","UL","VAR","VIDEO","WBR"],
		lowerTagCache = {},
		i;

	//	Create sugar'd functions in the required scopes
	for (i in tagList) {if(tagList.hasOwnProperty(i)) {
		(function(tag){
			var lowerTag = tag.toLowerCase();
			scope[tag] = lowerTagCache[lowerTag] = makeSugarTag(lowerTag);
		}(tagList[i]));
	}}

	//	Lowercased sugar tags
	m.sugarTags.lower = function(){
		return lowerTagCache;
	};

	return scope;
};

if (typeof module != "undefined" && module !== null && module.exports) {
	module.exports = mithrilSugartags;
} else if (typeof define === "function" && define.amd) {
	define(function() {
		return mithrilSugartags;
	});
} else {
	mithrilSugartags(
		typeof window != "undefined"? window.m || {}: {},
		typeof window != "undefined"? window: {}
	);
}

}());
},{}],13:[function(require,module,exports){
var m = (function app(window, undefined) {
	var OBJECT = "[object Object]", ARRAY = "[object Array]", STRING = "[object String]", FUNCTION = "function";
	var type = {}.toString;
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
	var voidElements = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;

	// caching commonly used variables
	var $document, $location, $requestAnimationFrame, $cancelAnimationFrame;

	// self invoking function needed because of the way mocks work
	function initialize(window){
		$document = window.document;
		$location = window.location;
		$cancelAnimationFrame = window.cancelAnimationFrame || window.clearTimeout;
		$requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
	}

	initialize(window);


	/*
	 * @typedef {String} Tag
	 * A string that looks like -> div.classname#id[param=one][param2=two]
	 * Which describes a DOM node
	 */

	/*
	 *
	 * @param {Tag} The DOM node tag
	 * @param {Object=[]} optional key-value pairs to be mapped to DOM attrs
	 * @param {...mNode=[]} Zero or more Mithril child nodes. Can be an array, or splat (optional)
	 *
	 */
	function m() {
		var args = [].slice.call(arguments);
		var hasAttrs = args[1] != null && type.call(args[1]) === OBJECT && !("tag" in args[1]) && !("subtree" in args[1]);
		var attrs = hasAttrs ? args[1] : {};
		var classAttrName = "class" in attrs ? "class" : "className";
		var cell = {tag: "div", attrs: {}};
		var match, classes = [];
		if (type.call(args[0]) != STRING) throw new Error("selector in m(selector, attrs, children) should be a string")
		while (match = parser.exec(args[0])) {
			if (match[1] === "" && match[2]) cell.tag = match[2];
			else if (match[1] === "#") cell.attrs.id = match[2];
			else if (match[1] === ".") classes.push(match[2]);
			else if (match[3][0] === "[") {
				var pair = attrParser.exec(match[3]);
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
			}
		}
		if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ");


		var children = hasAttrs ? args[2] : args[1];
		if (type.call(children) === ARRAY) {
			cell.children = children
		}
		else {
			cell.children = hasAttrs ? args.slice(2) : args.slice(1)
		}

		for (var attrName in attrs) {
			if (attrName === classAttrName) cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName];
			else cell.attrs[attrName] = attrs[attrName]
		}
		return cell
	}
	function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
		//`build` is a recursive function that manages creation/diffing/removal of DOM elements based on comparison between `data` and `cached`
		//the diff algorithm can be summarized as this:
		//1 - compare `data` and `cached`
		//2 - if they are different, copy `data` to `cached` and update the DOM based on what the difference is
		//3 - recursively apply this algorithm for every array and for the children of every virtual element

		//the `cached` data structure is essentially the same as the previous redraw's `data` data structure, with a few additions:
		//- `cached` always has a property called `nodes`, which is a list of DOM elements that correspond to the data represented by the respective virtual element
		//- in order to support attaching `nodes` as a property of `cached`, `cached` is *always* a non-primitive object, i.e. if the data was a string, then cached is a String instance. If data was `null` or `undefined`, cached is `new String("")`
		//- `cached also has a `configContext` property, which is the state storage object exposed by config(element, isInitialized, context)
		//- when `cached` is an Object, it represents a virtual element; when it's an Array, it represents a list of elements; when it's a String, Number or Boolean, it represents a text node

		//`parentElement` is a DOM element used for W3C DOM API calls
		//`parentTag` is only used for handling a corner case for textarea values
		//`parentCache` is used to remove nodes in some multi-node cases
		//`parentIndex` and `index` are used to figure out the offset of nodes. They're artifacts from before arrays started being flattened and are likely refactorable
		//`data` and `cached` are, respectively, the new and old nodes being diffed
		//`shouldReattach` is a flag indicating whether a parent node was recreated (if so, and if this node is reused, then this node must reattach itself to the new parent)
		//`editable` is a flag that indicates whether an ancestor is contenteditable
		//`namespace` indicates the closest HTML namespace as it cascades down from an ancestor
		//`configs` is a list of config functions to run after the topmost `build` call finishes running

		//there's logic that relies on the assumption that null and undefined data are equivalent to empty strings
		//- this prevents lifecycle surprises from procedural helpers that mix implicit and explicit return statements (e.g. function foo() {if (cond) return m("div")}
		//- it simplifies diffing code
		//data.toString() is null if data is the return value of Console.log in Firefox
		if (data == null || data.toString() == null) data = "";
		if (data.subtree === "retain") return cached;
		var cachedType = type.call(cached), dataType = type.call(data);
		if (cached == null || cachedType !== dataType) {
			if (cached != null) {
				if (parentCache && parentCache.nodes) {
					var offset = index - parentIndex;
					var end = offset + (dataType === ARRAY ? data : cached.nodes).length;
					clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end))
				}
				else if (cached.nodes) clear(cached.nodes, cached)
			}
			cached = new data.constructor;
			if (cached.tag) cached = {}; //if constructor creates a virtual dom element, use a blank object as the base cached node instead of copying the virtual el (#277)
			cached.nodes = []
		}

		if (dataType === ARRAY) {
			//recursively flatten array
			for (var i = 0, len = data.length; i < len; i++) {
				if (type.call(data[i]) === ARRAY) {
					data = data.concat.apply([], data);
					i-- //check current index again and flatten until there are no more nested arrays at that index
				}
			}
			
			var nodes = [], intact = cached.length === data.length, subArrayCount = 0;

			//keys algorithm: sort elements without recreating them if keys are present
			//1) create a map of all existing keys, and mark all for deletion
			//2) add new keys to map and mark them for addition
			//3) if key exists in new list, change action from deletion to a move
			//4) for each key, handle its corresponding action as marked in previous steps
			//5) copy unkeyed items into their respective gaps
			var DELETION = 1, INSERTION = 2 , MOVE = 3;
			var existing = {}, unkeyed = [], shouldMaintainIdentities = false;
			for (var i = 0; i < cached.length; i++) {
				if (cached[i] && cached[i].attrs && cached[i].attrs.key != null) {
					shouldMaintainIdentities = true;
					existing[cached[i].attrs.key] = {action: DELETION, index: i}
				}
			}
			if (shouldMaintainIdentities) {
				if (data.indexOf(null) > -1) data = data.filter(function(x) {return x != null})
				
				var keysDiffer = false
				if (data.length != cached.length) keysDiffer = true
				else for (var i = 0, cachedCell, dataCell; cachedCell = cached[i], dataCell = data[i]; i++) {
					if (cachedCell.attrs && dataCell.attrs && cachedCell.attrs.key != dataCell.attrs.key) {
						keysDiffer = true
						break
					}
				}
				
				if (keysDiffer) {
					for (var i = 0, len = data.length; i < len; i++) {
						if (data[i] && data[i].attrs) {
							if (data[i].attrs.key != null) {
								var key = data[i].attrs.key;
								if (!existing[key]) existing[key] = {action: INSERTION, index: i};
								else existing[key] = {
									action: MOVE,
									index: i,
									from: existing[key].index,
									element: parentElement.childNodes[existing[key].index] || $document.createElement("div")
								}
							}
							else unkeyed.push({index: i, element: parentElement.childNodes[i] || $document.createElement("div")})
						}
					}
					var actions = []
					for (var prop in existing) actions.push(existing[prop])
					var changes = actions.sort(sortChanges);
					var newCached = new Array(cached.length)

					for (var i = 0, change; change = changes[i]; i++) {
						if (change.action === DELETION) {
							clear(cached[change.index].nodes, cached[change.index]);
							newCached.splice(change.index, 1)
						}
						if (change.action === INSERTION) {
							var dummy = $document.createElement("div");
							dummy.key = data[change.index].attrs.key;
							parentElement.insertBefore(dummy, parentElement.childNodes[change.index] || null);
							newCached.splice(change.index, 0, {attrs: {key: data[change.index].attrs.key}, nodes: [dummy]})
						}

						if (change.action === MOVE) {
							if (parentElement.childNodes[change.index] !== change.element && change.element !== null) {
								parentElement.insertBefore(change.element, parentElement.childNodes[change.index] || null)
							}
							newCached[change.index] = cached[change.from]
						}
					}
					for (var i = 0, len = unkeyed.length; i < len; i++) {
						var change = unkeyed[i];
						parentElement.insertBefore(change.element, parentElement.childNodes[change.index] || null);
						newCached[change.index] = cached[change.index]
					}
					cached = newCached;
					cached.nodes = new Array(parentElement.childNodes.length);
					for (var i = 0, child; child = parentElement.childNodes[i]; i++) cached.nodes[i] = child
				}
			}
			//end key algorithm

			for (var i = 0, cacheCount = 0, len = data.length; i < len; i++) {
				//diff each item in the array
				var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);
				if (item === undefined) continue;
				if (!item.nodes.intact) intact = false;
				if (item.$trusted) {
					//fix offset of next element if item was a trusted string w/ more than one html element
					//the first clause in the regexp matches elements
					//the second clause (after the pipe) matches text nodes
					subArrayCount += (item.match(/<[^\/]|\>\s*[^<]/g) || []).length
				}
				else subArrayCount += type.call(item) === ARRAY ? item.length : 1;
				cached[cacheCount++] = item
			}
			if (!intact) {
				//diff the array itself
				
				//update the list of DOM nodes by collecting the nodes from each item
				for (var i = 0, len = data.length; i < len; i++) {
					if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes)
				}
				//remove items from the end of the array if the new array is shorter than the old one
				//if errors ever happen here, the issue is most likely a bug in the construction of the `cached` data structure somewhere earlier in the program
				for (var i = 0, node; node = cached.nodes[i]; i++) {
					if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]])
				}
				if (data.length < cached.length) cached.length = data.length;
				cached.nodes = nodes
			}
		}
		else if (data != null && dataType === OBJECT) {
			if (!data.attrs) data.attrs = {};
			if (!cached.attrs) cached.attrs = {};

			var dataAttrKeys = Object.keys(data.attrs)
			var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0)
			//if an element is different enough from the one in cache, recreate it
			if (data.tag != cached.tag || dataAttrKeys.join() != Object.keys(cached.attrs).join() || data.attrs.id != cached.attrs.id) {
				if (cached.nodes.length) clear(cached.nodes);
				if (cached.configContext && typeof cached.configContext.onunload === FUNCTION) cached.configContext.onunload()
			}
			if (type.call(data.tag) != STRING) return;

			var node, isNew = cached.nodes.length === 0;
			if (data.attrs.xmlns) namespace = data.attrs.xmlns;
			else if (data.tag === "svg") namespace = "http://www.w3.org/2000/svg";
			else if (data.tag === "math") namespace = "http://www.w3.org/1998/Math/MathML";
			if (isNew) {
				if (data.attrs.is) node = namespace === undefined ? $document.createElement(data.tag, data.attrs.is) : $document.createElementNS(namespace, data.tag, data.attrs.is);
				else node = namespace === undefined ? $document.createElement(data.tag) : $document.createElementNS(namespace, data.tag);
				cached = {
					tag: data.tag,
					//set attributes first, then create children
					attrs: hasKeys ? setAttributes(node, data.tag, data.attrs, {}, namespace) : data.attrs,
					children: data.children != null && data.children.length > 0 ?
						build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs) :
						data.children,
					nodes: [node]
				};
				if (cached.children && !cached.children.nodes) cached.children.nodes = [];
				//edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
				if (data.tag === "select" && data.attrs.value) setAttributes(node, data.tag, {value: data.attrs.value}, {}, namespace);
				parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			else {
				node = cached.nodes[0];
				if (hasKeys) setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
				cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs);
				cached.nodes.intact = true;
				if (shouldReattach === true && node != null) parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			//schedule configs to be called. They are called after `build` finishes running
			if (typeof data.attrs["config"] === FUNCTION) {
				var context = cached.configContext = cached.configContext || {};

				// bind
				var callback = function(data, args) {
					return function() {
						return data.attrs["config"].apply(data, args)
					}
				};
				configs.push(callback(data, [node, !isNew, context, cached]))
			}
		}
		else if (typeof dataType != FUNCTION) {
			//handle text nodes
			var nodes;
			if (cached.nodes.length === 0) {
				if (data.$trusted) {
					nodes = injectHTML(parentElement, index, data)
				}
				else {
					nodes = [$document.createTextNode(data)];
					if (!parentElement.nodeName.match(voidElements)) parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
				}
				cached = "string number boolean".indexOf(typeof data) > -1 ? new data.constructor(data) : data;
				cached.nodes = nodes
			}
			else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
				nodes = cached.nodes;
				if (!editable || editable !== $document.activeElement) {
					if (data.$trusted) {
						clear(nodes, cached);
						nodes = injectHTML(parentElement, index, data)
					}
					else {
						//corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
						//we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
						if (parentTag === "textarea") parentElement.value = data;
						else if (editable) editable.innerHTML = data;
						else {
							if (nodes[0].nodeType === 1 || nodes.length > 1) { //was a trusted string
								clear(cached.nodes, cached);
								nodes = [$document.createTextNode(data)]
							}
							parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
							nodes[0].nodeValue = data
						}
					}
				}
				cached = new data.constructor(data);
				cached.nodes = nodes
			}
			else cached.nodes.intact = true
		}

		return cached
	}
	function sortChanges(a, b) {return a.action - b.action || a.index - b.index}
	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		for (var attrName in dataAttrs) {
			var dataAttr = dataAttrs[attrName];
			var cachedAttr = cachedAttrs[attrName];
			if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr)) {
				cachedAttrs[attrName] = dataAttr;
				try {
					//`config` isn't a real attributes, so ignore it
					if (attrName === "config" || attrName == "key") continue;
					//hook event handlers to the auto-redrawing system
					else if (typeof dataAttr === FUNCTION && attrName.indexOf("on") === 0) {
						node[attrName] = autoredraw(dataAttr, node)
					}
					//handle `style: {...}`
					else if (attrName === "style" && dataAttr != null && type.call(dataAttr) === OBJECT) {
						for (var rule in dataAttr) {
							if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule]
						}
						for (var rule in cachedAttr) {
							if (!(rule in dataAttr)) node.style[rule] = ""
						}
					}
					//handle SVG
					else if (namespace != null) {
						if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr);
						else if (attrName === "className") node.setAttribute("class", dataAttr);
						else node.setAttribute(attrName, dataAttr)
					}
					//handle cases that are properties (but ignore cases where we should use setAttribute instead)
					//- list and form are typically used as strings, but are DOM element references in js
					//- when using CSS selectors (e.g. `m("[style='']")`), style is used as a string, but it's an object in js
					else if (attrName in node && !(attrName === "list" || attrName === "style" || attrName === "form" || attrName === "type")) {
						//#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
						if (tag !== "input" || node[attrName] !== dataAttr) node[attrName] = dataAttr
					}
					else node.setAttribute(attrName, dataAttr)
				}
				catch (e) {
					//swallow IE's invalid argument errors to mimic HTML's fallback-to-doing-nothing-on-invalid-attributes behavior
					if (e.message.indexOf("Invalid argument") < 0) throw e
				}
			}
			//#348 dataAttr may not be a string, so use loose comparison (double equal) instead of strict (triple equal)
			else if (attrName === "value" && tag === "input" && node.value != dataAttr) {
				node.value = dataAttr
			}
		}
		return cachedAttrs
	}
	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				try {nodes[i].parentNode.removeChild(nodes[i])}
				catch (e) {} //ignore if this fails due to order of events (see http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
				cached = [].concat(cached);
				if (cached[i]) unload(cached[i])
			}
		}
		if (nodes.length != 0) nodes.length = 0
	}
	function unload(cached) {
		if (cached.configContext && typeof cached.configContext.onunload === FUNCTION) cached.configContext.onunload();
		if (cached.children) {
			if (type.call(cached.children) === ARRAY) {
				for (var i = 0, child; child = cached.children[i]; i++) unload(child)
			}
			else if (cached.children.tag) unload(cached.children)
		}
	}
	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index];
		if (nextSibling) {
			var isElement = nextSibling.nodeType != 1;
			var placeholder = $document.createElement("span");
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling || null);
				placeholder.insertAdjacentHTML("beforebegin", data);
				parentElement.removeChild(placeholder)
			}
			else nextSibling.insertAdjacentHTML("beforebegin", data)
		}
		else parentElement.insertAdjacentHTML("beforeend", data);
		var nodes = [];
		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index]);
			index++
		}
		return nodes
	}
	function autoredraw(callback, object) {
		return function(e) {
			e = e || event;
			m.redraw.strategy("diff");
			m.startComputation();
			try {return callback.call(object, e)}
			finally {
				endFirstComputation()
			}
		}
	}

	var html;
	var documentNode = {
		appendChild: function(node) {
			if (html === undefined) html = $document.createElement("html");
			if ($document.documentElement && $document.documentElement !== node) {
				$document.replaceChild(node, $document.documentElement)
			}
			else $document.appendChild(node);
			this.childNodes = $document.childNodes
		},
		insertBefore: function(node) {
			this.appendChild(node)
		},
		childNodes: []
	};
	var nodeCache = [], cellCache = {};
	m.render = function(root, cell, forceRecreation) {
		var configs = [];
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
		var id = getCellCacheKey(root);
		var isDocumentRoot = root === $document;
		var node = isDocumentRoot || root === $document.documentElement ? documentNode : root;
		if (isDocumentRoot && cell.tag != "html") cell = {tag: "html", attrs: {}, children: cell};
		if (cellCache[id] === undefined) clear(node.childNodes);
		if (forceRecreation === true) reset(root);
		cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs);
		for (var i = 0, len = configs.length; i < len; i++) configs[i]()
	};
	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element);
		return index < 0 ? nodeCache.push(element) - 1 : index
	}

	m.trust = function(value) {
		value = new String(value);
		value.$trusted = true;
		return value
	};

	function gettersetter(store) {
		var prop = function() {
			if (arguments.length) store = arguments[0];
			return store
		};

		prop.toJSON = function() {
			return store
		};

		return prop
	}

	m.prop = function (store) {
		//note: using non-strict equality check here because we're checking if store is null OR undefined
		if (((store != null && type.call(store) === OBJECT) || typeof store === FUNCTION) && typeof store.then === FUNCTION) {
			return propify(store)
		}

		return gettersetter(store)
	};

	var roots = [], modules = [], controllers = [], lastRedrawId = null, lastRedrawCallTime = 0, computePostRedrawHook = null, prevented = false, topModule;
	var FRAME_BUDGET = 16; //60 frames per second = 1 call per 16 ms
	m.module = function(root, module) {
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
		var index = roots.indexOf(root);
		if (index < 0) index = roots.length;
		var isPrevented = false;
		if (controllers[index] && typeof controllers[index].onunload === FUNCTION) {
			var event = {
				preventDefault: function() {isPrevented = true}
			};
			controllers[index].onunload(event)
		}
		if (!isPrevented) {
			m.redraw.strategy("all");
			m.startComputation();
			roots[index] = root;
			var currentModule = topModule = module;
			var controller = new module.controller;
			//controllers may call m.module recursively (via m.route redirects, for example)
			//this conditional ensures only the last recursive m.module call is applied
			if (currentModule === topModule) {
				controllers[index] = controller;
				modules[index] = module
			}
			endFirstComputation();
			return controllers[index]
		}
	};
	m.redraw = function(force) {
		//lastRedrawId is a positive number if a second redraw is requested before the next animation frame
		//lastRedrawID is null if it's the first redraw and not an event handler
		if (lastRedrawId && force !== true) {
			//when setTimeout: only reschedule redraw if time between now and previous redraw is bigger than a frame, otherwise keep currently scheduled timeout
			//when rAF: always reschedule redraw
			if (new Date - lastRedrawCallTime > FRAME_BUDGET || $requestAnimationFrame === window.requestAnimationFrame) {
				if (lastRedrawId > 0) $cancelAnimationFrame(lastRedrawId);
				lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET)
			}
		}
		else {
			redraw();
			lastRedrawId = $requestAnimationFrame(function() {lastRedrawId = null}, FRAME_BUDGET)
		}
	};
	m.redraw.strategy = m.prop();
	function redraw() {
		var forceRedraw = m.redraw.strategy() === "all";
		for (var i = 0, root; root = roots[i]; i++) {
			if (controllers[i]) {
				m.render(root, modules[i].view(controllers[i]), forceRedraw)
			}
		}
		//after rendering within a routed context, we need to scroll back to the top, and fetch the document title for history.pushState
		if (computePostRedrawHook) {
			computePostRedrawHook();
			computePostRedrawHook = null
		}
		lastRedrawId = null;
		lastRedrawCallTime = new Date;
		m.redraw.strategy("diff")
	}

	var pendingRequests = 0;
	m.startComputation = function() {pendingRequests++};
	m.endComputation = function() {
		pendingRequests = Math.max(pendingRequests - 1, 0);
		if (pendingRequests === 0) m.redraw()
	};
	var endFirstComputation = function() {
		if (m.redraw.strategy() == "none") {
			pendingRequests--
			m.redraw.strategy("diff")
		}
		else m.endComputation();
	}

	m.withAttr = function(prop, withAttrCallback) {
		return function(e) {
			e = e || event;
			var currentTarget = e.currentTarget || this;
			withAttrCallback(prop in currentTarget ? currentTarget[prop] : currentTarget.getAttribute(prop))
		}
	};

	//routing
	var modes = {pathname: "", hash: "#", search: "?"};
	var redirect = function() {}, routeParams, currentRoute;
	m.route = function() {
		//m.route()
		if (arguments.length === 0) return currentRoute;
		//m.route(el, defaultRoute, routes)
		else if (arguments.length === 3 && type.call(arguments[1]) === STRING) {
			var root = arguments[0], defaultRoute = arguments[1], router = arguments[2];
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source);
				if (!routeByValue(root, router, path)) {
					m.route(defaultRoute, true)
				}
			};
			var listener = m.route.mode === "hash" ? "onhashchange" : "onpopstate";
			window[listener] = function() {
				if (currentRoute != normalizeRoute($location[m.route.mode])) {
					redirect($location[m.route.mode])
				}
			};
			computePostRedrawHook = setScroll;
			window[listener]()
		}
		//config: m.route
		else if (arguments[0].addEventListener) {
			var element = arguments[0];
			var isInitialized = arguments[1];
			var context = arguments[2];
			element.href = (m.route.mode !== 'pathname' ? $location.pathname : '') + modes[m.route.mode] + this.attrs.href;
			element.removeEventListener("click", routeUnobtrusive);
			element.addEventListener("click", routeUnobtrusive)
		}
		//m.route(route, params)
		else if (type.call(arguments[0]) === STRING) {
			currentRoute = arguments[0];
			var args = arguments[1] || {}
			var queryIndex = currentRoute.indexOf("?")
			var params = queryIndex > -1 ? parseQueryString(currentRoute.slice(queryIndex + 1)) : {}
			for (var i in args) params[i] = args[i]
			var querystring = buildQueryString(params)
			var currentPath = queryIndex > -1 ? currentRoute.slice(0, queryIndex) : currentRoute
			if (querystring) currentRoute = currentPath + (currentPath.indexOf("?") === -1 ? "?" : "&") + querystring;

			var shouldReplaceHistoryEntry = (arguments.length === 3 ? arguments[2] : arguments[1]) === true;

			if (window.history.pushState) {
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, $document.title, modes[m.route.mode] + currentRoute);
					setScroll()
				};
				redirect(modes[m.route.mode] + currentRoute)
			}
			else $location[m.route.mode] = currentRoute
		}
	};
	m.route.param = function(key) {
		if (!routeParams) throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()")
		return routeParams[key]
	};
	m.route.mode = "search";
	function normalizeRoute(route) {return route.slice(modes[m.route.mode].length)}
	function routeByValue(root, router, path) {
		routeParams = {};

		var queryStart = path.indexOf("?");
		if (queryStart !== -1) {
			routeParams = parseQueryString(path.substr(queryStart + 1, path.length));
			path = path.substr(0, queryStart)
		}

		for (var route in router) {
			if (route === path) {
				m.module(root, router[route]);
				return true
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

			if (matcher.test(path)) {
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || [];
					var values = [].slice.call(arguments, 1, -2);
					for (var i = 0, len = keys.length; i < len; i++) routeParams[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
					m.module(root, router[route])
				});
				return true
			}
		}
	}
	function routeUnobtrusive(e) {
		e = e || event;
		if (e.ctrlKey || e.metaKey || e.which === 2) return;
		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;
		var currentTarget = e.currentTarget || this;
		var args = m.route.mode === "pathname" && currentTarget.search ? parseQueryString(currentTarget.search.slice(1)) : {};
		m.route(currentTarget[m.route.mode].slice(modes[m.route.mode].length), args)
	}
	function setScroll() {
		if (m.route.mode != "hash" && $location.hash) $location.hash = $location.hash;
		else window.scrollTo(0, 0)
	}
	function buildQueryString(object, prefix) {
		var str = [];
		for(var prop in object) {
			var key = prefix ? prefix + "[" + prop + "]" : prop, value = object[prop];
			str.push(value != null && type.call(value) === OBJECT ? buildQueryString(value, key) : encodeURIComponent(key) + "=" + encodeURIComponent(value))
		}
		return str.join("&")
	}
	function parseQueryString(str) {
		var pairs = str.split("&"), params = {};
		for (var i = 0, len = pairs.length; i < len; i++) {
			var pair = pairs[i].split("=");
			params[decodeSpace(pair[0])] = pair[1] ? decodeSpace(pair[1]) : ""
		}
		return params
	}
	function decodeSpace(string) {
		return decodeURIComponent(string.replace(/\+/g, " "))
	}
	function reset(root) {
		var cacheKey = getCellCacheKey(root);
		clear(root.childNodes, cellCache[cacheKey]);
		cellCache[cacheKey] = undefined
	}

	m.deferred = function () {
		var deferred = new Deferred();
		deferred.promise = propify(deferred.promise);
		return deferred
	};
	function propify(promise) {
		var prop = m.prop();
		promise.then(prop);
		prop.then = function(resolve, reject) {
			return propify(promise.then(resolve, reject))
		};
		return prop
	}
	//Promiz.mithril.js | Zolmeister | MIT
	//a modified version of Promiz.js, which does not conform to Promises/A+ for two reasons:
	//1) `then` callbacks are called synchronously (because setTimeout is too slow, and the setImmediate polyfill is too big
	//2) throwing subclasses of Error cause the error to be bubbled up instead of triggering rejection (because the spec does not account for the important use case of default browser error handling, i.e. message w/ line number)
	function Deferred(successCallback, failureCallback) {
		var RESOLVING = 1, REJECTING = 2, RESOLVED = 3, REJECTED = 4;
		var self = this, state = 0, promiseValue = 0, next = [];

		self["promise"] = {};

		self["resolve"] = function(value) {
			if (!state) {
				promiseValue = value;
				state = RESOLVING;

				fire()
			}
			return this
		};

		self["reject"] = function(value) {
			if (!state) {
				promiseValue = value;
				state = REJECTING;

				fire()
			}
			return this
		};

		self.promise["then"] = function(successCallback, failureCallback) {
			var deferred = new Deferred(successCallback, failureCallback);
			if (state === RESOLVED) {
				deferred.resolve(promiseValue)
			}
			else if (state === REJECTED) {
				deferred.reject(promiseValue)
			}
			else {
				next.push(deferred)
			}
			return deferred.promise
		};

		function finish(type) {
			state = type || REJECTED;
			next.map(function(deferred) {
				state === RESOLVED && deferred.resolve(promiseValue) || deferred.reject(promiseValue)
			})
		}

		function thennable(then, successCallback, failureCallback, notThennableCallback) {
			if (((promiseValue != null && type.call(promiseValue) === OBJECT) || typeof promiseValue === FUNCTION) && typeof then === FUNCTION) {
				try {
					// count protects against abuse calls from spec checker
					var count = 0;
					then.call(promiseValue, function(value) {
						if (count++) return;
						promiseValue = value;
						successCallback()
					}, function (value) {
						if (count++) return;
						promiseValue = value;
						failureCallback()
					})
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					failureCallback()
				}
			} else {
				notThennableCallback()
			}
		}

		function fire() {
			// check if it's a thenable
			var then;
			try {
				then = promiseValue && promiseValue.then
			}
			catch (e) {
				m.deferred.onerror(e);
				promiseValue = e;
				state = REJECTING;
				return fire()
			}
			thennable(then, function() {
				state = RESOLVING;
				fire()
			}, function() {
				state = REJECTING;
				fire()
			}, function() {
				try {
					if (state === RESOLVING && typeof successCallback === FUNCTION) {
						promiseValue = successCallback(promiseValue)
					}
					else if (state === REJECTING && typeof failureCallback === "function") {
						promiseValue = failureCallback(promiseValue);
						state = RESOLVING
					}
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					return finish()
				}

				if (promiseValue === self) {
					promiseValue = TypeError();
					finish()
				}
				else {
					thennable(then, function () {
						finish(RESOLVED)
					}, finish, function () {
						finish(state === RESOLVING && RESOLVED)
					})
				}
			})
		}
	}
	m.deferred.onerror = function(e) {
		if (type.call(e) === "[object Error]" && !e.constructor.toString().match(/ Error/)) throw e
	};

	m.sync = function(args) {
		var method = "resolve";
		function synchronizer(pos, resolved) {
			return function(value) {
				results[pos] = value;
				if (!resolved) method = "reject";
				if (--outstanding === 0) {
					deferred.promise(results);
					deferred[method](results)
				}
				return value
			}
		}

		var deferred = m.deferred();
		var outstanding = args.length;
		var results = new Array(outstanding);
		if (args.length > 0) {
			for (var i = 0; i < args.length; i++) {
				args[i].then(synchronizer(i, true), synchronizer(i, false))
			}
		}
		else deferred.resolve([]);

		return deferred.promise
	};
	function identity(value) {return value}

	function ajax(options) {
		if (options.dataType && options.dataType.toLowerCase() === "jsonp") {
			var callbackKey = "mithril_callback_" + new Date().getTime() + "_" + (Math.round(Math.random() * 1e16)).toString(36);
			var script = $document.createElement("script");

			window[callbackKey] = function(resp) {
				$document.body.removeChild(script);
				options.onload({
					type: "load",
					target: {
						responseText: resp
					}
				});
				window[callbackKey] = undefined
			};

			script.onerror = function(e) {
				$document.body.removeChild(script);

				options.onerror({
					type: "error",
					target: {
						status: 500,
						responseText: JSON.stringify({error: "Error making jsonp request"})
					}
				});
				window[callbackKey] = undefined;

				return false
			};

			script.onload = function(e) {
				return false
			};

			script.src = options.url
				+ (options.url.indexOf("?") > 0 ? "&" : "?")
				+ (options.callbackKey ? options.callbackKey : "callback")
				+ "=" + callbackKey
				+ "&" + buildQueryString(options.data || {});
			$document.body.appendChild(script)
		}
		else {
			var xhr = new window.XMLHttpRequest;
			xhr.open(options.method, options.url, true, options.user, options.password);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr});
					else options.onerror({type: "error", target: xhr})
				}
			};
			if (options.serialize === JSON.stringify && options.data && options.method !== "GET") {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (options.deserialize === JSON.parse) {
				xhr.setRequestHeader("Accept", "application/json, text/*");
			}
			if (typeof options.config === FUNCTION) {
				var maybeXhr = options.config(xhr, options);
				if (maybeXhr != null) xhr = maybeXhr
			}

			var data = options.method === "GET" || !options.data ? "" : options.data
			if (data && (type.call(data) != STRING && data.constructor != window.FormData)) {
				throw "Request data should be either be a string or FormData. Check the `serialize` option in `m.request`";
			}
			xhr.send(data);
			return xhr
		}
	}
	function bindData(xhrOptions, data, serialize) {
		if (xhrOptions.method === "GET" && xhrOptions.dataType != "jsonp") {
			var prefix = xhrOptions.url.indexOf("?") < 0 ? "?" : "&";
			var querystring = buildQueryString(data);
			xhrOptions.url = xhrOptions.url + (querystring ? prefix + querystring : "")
		}
		else xhrOptions.data = serialize(data);
		return xhrOptions
	}
	function parameterizeUrl(url, data) {
		var tokens = url.match(/:[a-z]\w+/gi);
		if (tokens && data) {
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1);
				url = url.replace(tokens[i], data[key]);
				delete data[key]
			}
		}
		return url
	}

	m.request = function(xhrOptions) {
		if (xhrOptions.background !== true) m.startComputation();
		var deferred = m.deferred();
		var isJSONP = xhrOptions.dataType && xhrOptions.dataType.toLowerCase() === "jsonp";
		var serialize = xhrOptions.serialize = isJSONP ? identity : xhrOptions.serialize || JSON.stringify;
		var deserialize = xhrOptions.deserialize = isJSONP ? identity : xhrOptions.deserialize || JSON.parse;
		var extract = xhrOptions.extract || function(xhr) {
			return xhr.responseText.length === 0 && deserialize === JSON.parse ? null : xhr.responseText
		};
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data);
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize);
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event;
				var unwrap = (e.type === "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity;
				var response = unwrap(deserialize(extract(e.target, xhrOptions)));
				if (e.type === "load") {
					if (type.call(response) === ARRAY && xhrOptions.type) {
						for (var i = 0; i < response.length; i++) response[i] = new xhrOptions.type(response[i])
					}
					else if (xhrOptions.type) response = new xhrOptions.type(response)
				}
				deferred[e.type === "load" ? "resolve" : "reject"](response)
			}
			catch (e) {
				m.deferred.onerror(e);
				deferred.reject(e)
			}
			if (xhrOptions.background !== true) m.endComputation()
		};
		ajax(xhrOptions);
		deferred.promise(xhrOptions.initialValue);
		return deferred.promise
	};

	//testing API
	m.deps = function(mock) {
		initialize(window = mock || window);
		return window;
	};
	//for internal testing only, do not use `m.deps.factory`
	m.deps.factory = app;

	return m
})(typeof window != "undefined" ? window : {});

if (typeof module != "undefined" && module !== null && module.exports) module.exports = m;
else if (typeof define === "function" && define.amd) define(function() {return m});

},{}],14:[function(require,module,exports){
var validator = require('validator');

/* 	This binder allows you to create a validation method on a model, (plain 
	javascript function that defines some properties), that can return a set 
	of error messages for invalid values.
	
	The validations are from https://github.com/chriso/validator.js	

	## Example

	Say you have an object like so:

		var User = function(){
			this.name = "bob";
			this.email = "bob_at_email.com";
		}, user = new User();

	Now if you wanted to create an isValid function that can be used to ensure 
	you don't have an invalid email address, you simply add:


	To your model, so you get:

		var User = function(){
			this.name = "bob";
			this.email = "bob_at_email.com";
			this.isValid = modelbinder.bind(this, {
				email: {
					'isEmail': "Must be a valid email address"
				}
			});
		}, user = new User();

	Then just call the `isValid` method to see if it is valid - if it is
	invalid, (as it will be in this case), you will get an object like so:

		user.isValid()
		//	Returns: { email: ["Must be a valid email address"] }

	You can also check if a particular field is valid like so:

		user.isValid('email');

 */
module.exports = {
	bind: function(self, vObj){
		return function(name){
			var result = {},
				tmp,
				hasInvalidField = false,
				//	For some reason node-validator doesn't have this...
				isNotEmpty = function(value){
					return typeof value !== "undefined" && value !== "" && value !== null;
				},
				//	Get value of property from 'self', which can be a function.
				getValue = function(name){
					return typeof self[name] == "function"? self[name](): self[name];
				},
				//	Validates a value against a set of validations
				//	Returns true if the value is valid, or an object 
				validate = function(name, value, validations) {
					var validation,
						tmp,
						result = [];
					for(validation in validations) {
						if(validation == "isRequired") {
							//	use our "isRequired" function
							tmp = isNotEmpty(value)? true: validations[validation]; 
						} else {
							//	Use validator method
							tmp = validator[validation](value)? true: validations[validation]; 
						}

						//	Handle multiple messages
						if(tmp !== true) {
							result = (result === true || result == "undefined")? []: result;
							result.push(tmp);
						} else {
							result = true;
						}
					}
					return result;
				};

			if(name) {
				result = validate(name, getValue(name), vObj[name]);
			} else {
				//	Validate the whole model
				for(name in vObj) {
					tmp = validate(name, getValue(name), vObj[name]);
					if(tmp !== true) {
						hasInvalidField = true;
					}
					result[name] = tmp;
				}
				if(!hasInvalidField) {
					result = true;
				}
			}

			return result;
		}
	}
};
},{"validator":15}],15:[function(require,module,exports){
/*!
 * Copyright (c) 2014 Chris O'Hara <cohara87@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function (name, definition) {
    if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        this[name] = definition();
    }
})('validator', function (validator) {

    'use strict';

    validator = { version: '3.27.0' };

    var email = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

    var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;

    var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/
      , isbn13Maybe = /^(?:[0-9]{13})$/;

    var ipv4Maybe = /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/
      , ipv6 = /^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/;

    var uuid = {
        '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i
      , '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      , '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      , all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    };

    var alpha = /^[a-zA-Z]+$/
      , alphanumeric = /^[a-zA-Z0-9]+$/
      , numeric = /^-?[0-9]+$/
      , int = /^(?:-?(?:0|[1-9][0-9]*))$/
      , float = /^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/
      , hexadecimal = /^[0-9a-fA-F]+$/
      , hexcolor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    var ascii = /^[\x00-\x7F]+$/
      , multibyte = /[^\x00-\x7F]/
      , fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/
      , halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

    var base64 = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/;

    var phones = {
      'zh-CN': /^(\+?0?86\-?)?1[345789][0-9]{9}$/,
      'en-ZA': /^(\+?27|0)(\d{9})$/,
      'en-AU': /^(\+?61|0)4(\d{8})/
    };

    validator.extend = function (name, fn) {
        validator[name] = function () {
            var args = Array.prototype.slice.call(arguments);
            args[0] = validator.toString(args[0]);
            return fn.apply(validator, args);
        };
    };

    //Right before exporting the validator object, pass each of the builtins
    //through extend() so that their first argument is coerced to a string
    validator.init = function () {
        for (var name in validator) {
            if (typeof validator[name] !== 'function' || name === 'toString' ||
                    name === 'toDate' || name === 'extend' || name === 'init') {
                continue;
            }
            validator.extend(name, validator[name]);
        }
    };

    validator.toString = function (input) {
        if (typeof input === 'object' && input !== null && input.toString) {
            input = input.toString();
        } else if (input === null || typeof input === 'undefined' || (isNaN(input) && !input.length)) {
            input = '';
        } else if (typeof input !== 'string') {
            input += '';
        }
        return input;
    };

    validator.toDate = function (date) {
        if (Object.prototype.toString.call(date) === '[object Date]') {
            return date;
        }
        date = Date.parse(date);
        return !isNaN(date) ? new Date(date) : null;
    };

    validator.toFloat = function (str) {
        return parseFloat(str);
    };

    validator.toInt = function (str, radix) {
        return parseInt(str, radix || 10);
    };

    validator.toBoolean = function (str, strict) {
        if (strict) {
            return str === '1' || str === 'true';
        }
        return str !== '0' && str !== 'false' && str !== '';
    };

    validator.equals = function (str, comparison) {
        return str === validator.toString(comparison);
    };

    validator.contains = function (str, elem) {
        return str.indexOf(validator.toString(elem)) >= 0;
    };

    validator.matches = function (str, pattern, modifiers) {
        if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
            pattern = new RegExp(pattern, modifiers);
        }
        return pattern.test(str);
    };

    validator.isEmail = function (str) {
        return email.test(str);
    };

    var default_url_options = {
        protocols: [ 'http', 'https', 'ftp' ]
      , require_tld: true
      , require_protocol: false
      , allow_underscores: false
      , allow_trailing_dot: false
    };

    validator.isURL = function (url, options) {
        if (!url || url.length >= 2083) {
            return false;
        }
        if (url.indexOf('mailto:') === 0) {
            return false;
        }
        options = merge(options, default_url_options);
        var protocol, user, pass, auth, host, hostname, port,
            port_str, path, query, hash, split;
        split = url.split('://');
        if (split.length > 1) {
            protocol = split.shift();
            if (options.protocols.indexOf(protocol) === -1) {
                return false;
            }
        } else if (options.require_protocol) {
            return false;
        }
        url = split.join('://');
        split = url.split('#');
        url = split.shift();
        hash = split.join('#');
        if (hash && /\s/.test(hash)) {
            return false;
        }
        split = url.split('?');
        url = split.shift();
        query = split.join('?');
        if (query && /\s/.test(query)) {
            return false;
        }
        split = url.split('/');
        url = split.shift();
        path = split.join('/');
        if (path && /\s/.test(path)) {
            return false;
        }
        split = url.split('@');
        if (split.length > 1) {
            auth = split.shift();
            if (auth.indexOf(':') >= 0) {
                auth = auth.split(':');
                user = auth.shift();
                if (!/^\S+$/.test(user)) {
                    return false;
                }
                pass = auth.join(':');
                if (!/^\S*$/.test(user)) {
                    return false;
                }
            }
        }
        hostname = split.join('@');
        split = hostname.split(':');
        host = split.shift();
        if (split.length) {
            port_str = split.join(':');
            port = parseInt(port_str, 10);
            if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
                return false;
            }
        }
        if (!validator.isIP(host) && !validator.isFQDN(host, options) &&
                host !== 'localhost') {
            return false;
        }
        if (options.host_whitelist &&
                options.host_whitelist.indexOf(host) === -1) {
            return false;
        }
        if (options.host_blacklist &&
                options.host_blacklist.indexOf(host) !== -1) {
            return false;
        }
        return true;
    };

    validator.isIP = function (str, version) {
        version = validator.toString(version);
        if (!version) {
            return validator.isIP(str, 4) || validator.isIP(str, 6);
        } else if (version === '4') {
            if (!ipv4Maybe.test(str)) {
                return false;
            }
            var parts = str.split('.').sort(function (a, b) {
                return a - b;
            });
            return parts[3] <= 255;
        }
        return version === '6' && ipv6.test(str);
    };

    var default_fqdn_options = {
        require_tld: true
      , allow_underscores: false
      , allow_trailing_dot: false
    };

    validator.isFQDN = function (str, options) {
        options = merge(options, default_fqdn_options);

        /* Remove the optional trailing dot before checking validity */
        if (options.allow_trailing_dot && str[str.length - 1] === '.') {
            str = str.substring(0, str.length - 1);
        }
        var parts = str.split('.');
        if (options.require_tld) {
            var tld = parts.pop();
            if (!parts.length || !/^[a-z]{2,}$/i.test(tld)) {
                return false;
            }
        }
        for (var part, i = 0; i < parts.length; i++) {
            part = parts[i];
            if (options.allow_underscores) {
                if (part.indexOf('__') >= 0) {
                    return false;
                }
                part = part.replace(/_/g, '');
            }
            if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
                return false;
            }
            if (part[0] === '-' || part[part.length - 1] === '-' ||
                    part.indexOf('---') >= 0) {
                return false;
            }
        }
        return true;
    };

    validator.isAlpha = function (str) {
        return alpha.test(str);
    };

    validator.isAlphanumeric = function (str) {
        return alphanumeric.test(str);
    };

    validator.isNumeric = function (str) {
        return numeric.test(str);
    };

    validator.isHexadecimal = function (str) {
        return hexadecimal.test(str);
    };

    validator.isHexColor = function (str) {
        return hexcolor.test(str);
    };

    validator.isLowercase = function (str) {
        return str === str.toLowerCase();
    };

    validator.isUppercase = function (str) {
        return str === str.toUpperCase();
    };

    validator.isInt = function (str) {
        return int.test(str);
    };

    validator.isFloat = function (str) {
        return str !== '' && float.test(str);
    };

    validator.isDivisibleBy = function (str, num) {
        return validator.toFloat(str) % validator.toInt(num) === 0;
    };

    validator.isNull = function (str) {
        return str.length === 0;
    };

    validator.isLength = function (str, min, max) {
        var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
        var len = str.length - surrogatePairs.length;
        return len >= min && (typeof max === 'undefined' || len <= max);
    };

    validator.isByteLength = function (str, min, max) {
        return str.length >= min && (typeof max === 'undefined' || str.length <= max);
    };

    validator.isUUID = function (str, version) {
        var pattern = uuid[version ? version : 'all'];
        return pattern && pattern.test(str);
    };

    validator.isDate = function (str) {
        return !isNaN(Date.parse(str));
    };

    validator.isAfter = function (str, date) {
        var comparison = validator.toDate(date || new Date())
          , original = validator.toDate(str);
        return !!(original && comparison && original > comparison);
    };

    validator.isBefore = function (str, date) {
        var comparison = validator.toDate(date || new Date())
          , original = validator.toDate(str);
        return original && comparison && original < comparison;
    };

    validator.isIn = function (str, options) {
        var i;
        if (Object.prototype.toString.call(options) === '[object Array]') {
            var array = [];
            for (i in options) {
                array[i] = validator.toString(options[i]);
            }
            return array.indexOf(str) >= 0;
        } else if (typeof options === 'object') {
            return options.hasOwnProperty(str);
        } else if (options && typeof options.indexOf === 'function') {
            return options.indexOf(str) >= 0;
        }
        return false;
    };

    validator.isCreditCard = function (str) {
        var sanitized = str.replace(/[^0-9]+/g, '');
        if (!creditCard.test(sanitized)) {
            return false;
        }
        var sum = 0, digit, tmpNum, shouldDouble;
        for (var i = sanitized.length - 1; i >= 0; i--) {
            digit = sanitized.substring(i, (i + 1));
            tmpNum = parseInt(digit, 10);
            if (shouldDouble) {
                tmpNum *= 2;
                if (tmpNum >= 10) {
                    sum += ((tmpNum % 10) + 1);
                } else {
                    sum += tmpNum;
                }
            } else {
                sum += tmpNum;
            }
            shouldDouble = !shouldDouble;
        }
        return !!((sum % 10) === 0 ? sanitized : false);
    };

    validator.isISBN = function (str, version) {
        version = validator.toString(version);
        if (!version) {
            return validator.isISBN(str, 10) || validator.isISBN(str, 13);
        }
        var sanitized = str.replace(/[\s-]+/g, '')
          , checksum = 0, i;
        if (version === '10') {
            if (!isbn10Maybe.test(sanitized)) {
                return false;
            }
            for (i = 0; i < 9; i++) {
                checksum += (i + 1) * sanitized.charAt(i);
            }
            if (sanitized.charAt(9) === 'X') {
                checksum += 10 * 10;
            } else {
                checksum += 10 * sanitized.charAt(9);
            }
            if ((checksum % 11) === 0) {
                return !!sanitized;
            }
        } else  if (version === '13') {
            if (!isbn13Maybe.test(sanitized)) {
                return false;
            }
            var factor = [ 1, 3 ];
            for (i = 0; i < 12; i++) {
                checksum += factor[i % 2] * sanitized.charAt(i);
            }
            if (sanitized.charAt(12) - ((10 - (checksum % 10)) % 10) === 0) {
                return !!sanitized;
            }
        }
        return false;
    };

    validator.isMobilePhone = function(str, locale) {
        if (locale in phones) {
            return phones[locale].test(str);
        }
        return false;
    };

    validator.isJSON = function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    validator.isMultibyte = function (str) {
        return multibyte.test(str);
    };

    validator.isAscii = function (str) {
        return ascii.test(str);
    };

    validator.isFullWidth = function (str) {
        return fullWidth.test(str);
    };

    validator.isHalfWidth = function (str) {
        return halfWidth.test(str);
    };

    validator.isVariableWidth = function (str) {
        return fullWidth.test(str) && halfWidth.test(str);
    };

    validator.isSurrogatePair = function (str) {
        return surrogatePair.test(str);
    };

    validator.isBase64 = function (str) {
        return base64.test(str);
    };

    validator.isMongoId = function (str) {
        return validator.isHexadecimal(str) && str.length === 24;
    };

    validator.ltrim = function (str, chars) {
        var pattern = chars ? new RegExp('^[' + chars + ']+', 'g') : /^\s+/g;
        return str.replace(pattern, '');
    };

    validator.rtrim = function (str, chars) {
        var pattern = chars ? new RegExp('[' + chars + ']+$', 'g') : /\s+$/g;
        return str.replace(pattern, '');
    };

    validator.trim = function (str, chars) {
        var pattern = chars ? new RegExp('^[' + chars + ']+|[' + chars + ']+$', 'g') : /^\s+|\s+$/g;
        return str.replace(pattern, '');
    };

    validator.escape = function (str) {
        return (str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\//g, '&#x2F;'));
    };

    validator.stripLow = function (str, keep_new_lines) {
        var chars = keep_new_lines ? '\x00-\x09\x0B\x0C\x0E-\x1F\x7F' : '\x00-\x1F\x7F';
        return validator.blacklist(str, chars);
    };

    validator.whitelist = function (str, chars) {
        return str.replace(new RegExp('[^' + chars + ']+', 'g'), '');
    };

    validator.blacklist = function (str, chars) {
        return str.replace(new RegExp('[' + chars + ']+', 'g'), '');
    };

    var default_normalize_email_options = {
        lowercase: true
    };

    validator.normalizeEmail = function (email, options) {
        options = merge(options, default_normalize_email_options);
        if (!validator.isEmail(email)) {
            return false;
        }
        var parts = email.split('@', 2);
        parts[1] = parts[1].toLowerCase();
        if (options.lowercase) {
            parts[0] = parts[0].toLowerCase();
        }
        if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
            if (!options.lowercase) {
                parts[0] = parts[0].toLowerCase();
            }
            parts[0] = parts[0].replace(/\./g, '').split('+')[0];
            parts[1] = 'gmail.com';
        }
        return parts.join('@');
    };

    function merge(obj, defaults) {
        obj = obj || {};
        for (var key in defaults) {
            if (typeof obj[key] === 'undefined') {
                obj[key] = defaults[key];
            }
        }
        return obj;
    }

    validator.init();

    return validator;

});

},{}],16:[function(require,module,exports){
/*	miso restrictions
	Restrict users access to controller actions based on roles 
*/
var miso = require('../server/miso.util.js'),
	hasRole = function(userRoles, roles){
		var hasRole = false;
		//	All roles
		if(userRoles == "*") {
			return true;
		}
		//	Search each user role
		miso.each(userRoles, function(userRole){
			userRole = (typeof userRole !== "string")? userRole: [userRole];
			//	Search each role
			miso.each(roles, function(role){
				if(userRole == role) {
					hasRole = true;
					return false;
				}
			});
		});
		return hasRole;
	};

module.exports = function(restrictions, user){
	var pass = true;

	//	Apply deny first, then allow.
	if(restrictions && user && user.roles){
		if(restrictions.deny) {
			pass = ! hasRole(user.roles, restrictions.deny);
		}
		if(restrictions.allow) {
			pass = hasRole(user.roles, restrictions.allow);
		}
	}

	return pass;
};
},{"../server/miso.util.js":1}],17:[function(require,module,exports){
//	Mithril bindings.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(){
var mithrilBindings = function(m){
	m.bindings = m.bindings || {};

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
		};

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

	//	Hide node
	m.addBinding("hide", function(prop){
		this.style = {
			display: m.unwrap(prop)? "none" : ""
		};
	}, true);

	//	Toggle value(s) on click
	m.addBinding('toggle', function(prop){
		this.onclick = function(){
			//	Toggle allows an enum list to be toggled, eg: [prop, value2, value2]
			var isFunc = typeof prop === 'function', tmp, i, vals = [], val, tVal;

			//	Toggle boolean
			if(isFunc) {
				value = prop();
				prop(!value);
			} else {
				//	Toggle enumeration
				tmp = prop[0];
				val = tmp();
				vals = prop.slice(1);
				tVal = vals[0];

				for(i = 0; i < vals.length; i += 1) {
					if(val == vals[i]) {
						if(typeof vals[i+1] !== 'undefined') {
							tVal = vals[i+1];
						}
						break;
					}
				}
				tmp(tVal);
			}
		};
	}, true);

	//	Set hover states, a'la jQuery pattern
	m.addBinding('hover', function(prop){
		this.onmouseover = prop[0];
		if(prop[1]) {
			this.onmouseout = prop[1];
		}
	}, true );

	//	Add value bindings for various event types 
	var events = ["Input", "Keyup", "Keypress"],
		createBinding = function(name, eve){
			//	Bi-directional binding of value
			m.addBinding(name, function(prop) {
				if (typeof prop == "function") {
					this.value = prop();
					this[eve] = m.withAttr("value", prop);
				} else {
					this.value = prop;
				}
			}, true);
		};

	for(var i = 0; i < events.length; i += 1) {
		var eve = events[i];
		createBinding("value" + eve, "on" + eve.toLowerCase());
	}


	//	Set a value on a property
	m.set = function(prop, value){
		return function() {
			prop(value);
		};
	};

	/*	Returns a function that can trigger a binding 
		Usage: onclick: m.trigger('binding', prop)
	*/
	m.trigger = function(){
		var args = Array.prototype.slice.call(arguments);
		return function(){
			var name = args[0],
				argList = args.slice(1);
			if (m.bindings[name]) {
				m.bindings[name].func.apply(this, argList);
			}
		};
	};

	return m.bindings;
};

if (typeof module != "undefined" && module !== null && module.exports) {
	module.exports = mithrilBindings;
} else if (typeof define === "function" && define.amd) {
	define(function() {
		return mithrilBindings;
	});
} else {
	mithrilBindings(typeof window != "undefined"? window.m || {}: {});
}

}());
},{}],18:[function(require,module,exports){
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
module.exports = function(m){
	var getModelData = function(model){
		var i, result = {};
		for(i in model) {if(model.hasOwnProperty(i)) {
			if(i !== 'isValid') {
				if(i == 'id') {
					result['_id'] = (typeof model[i] == 'function')? model[i](): model[i];
				} else {
					result[i] = (typeof model[i] == 'function')? model[i](): model[i];
				}
			}
		}}
		return result;
	};
	return {
'find': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/flatfiledb/find',
		data: args
	});
},
'save': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/flatfiledb/save',
		data: args
	});
},
'remove': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/flatfiledb/remove',
		data: args
	});
}
	};
};
},{}],19:[function(require,module,exports){
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var m = require('mithril');
var sugartags = require('mithril.sugartags')(m);
var bindings = require('../server/mithril.bindings.node.js')(m);
var animate = require('../client/js/mithril.animate.js')(m);
var restrictions = require('../server/miso.restrictions.js');
var restrict = function(route, actionName){
	return route;

};
var restrictObj = ({"_COMMENT":"Default is allow: '*', if you specify an 'allow', it will override","_COMMENT2":"If you specify an 'allow', it will override","app":{"COMMENT_todo.index":{"deny":["finance","support"]},"COMMENT_hello.edit":{"deny":"*","allow":["support"]}},"db":{"_COMMENT":"Ok, we need to figure out how to secure stuff","_COMMENT2":" - we now have a generic 'find' method","_COMMENT3":" - what we really want to do is lock down specific","_COMMENT4":" models, so let's try to use that...","/find":{"todo.index.todo":{"allow":["admin","support"]}}}});
var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var adapt = require('../mvc/adapt.js');
var doc = require('../mvc/doc.js');

var hello = require('../mvc/hello.js');
var todo = require('../mvc/todo.js');


if(typeof window !== 'undefined') {
	window.m = m;
}
	
m.route.mode = 'pathname';
m.route(document.getElementById('misoAttachmentNode'), '/', {
'/users/new': restrict(user.new, 'user.new'),
'/': restrict(home.index, 'home.index'),
'/adapt/:adapt_id': restrict(adapt.edit, 'adapt.edit'),
'/doc/:doc_id': restrict(doc.edit, 'doc.edit'),
'/docs': restrict(doc.index, 'doc.index'),
'/hello/:hello_id': restrict(hello.edit, 'hello.edit'),
'/todos': restrict(todo.index, 'todo.index'),
'/user/:user_id': restrict(user.edit, 'user.edit'),
'/users': restrict(user.index, 'user.index')
});
},{"../client/js/mithril.animate.js":2,"../mvc/adapt.js":6,"../mvc/doc.js":7,"../mvc/hello.js":8,"../mvc/home.js":9,"../mvc/todo.js":10,"../mvc/user.js":11,"../server/miso.restrictions.js":16,"../server/mithril.bindings.node.js":17,"mithril":13,"mithril.sugartags":12}]},{},[19]);
