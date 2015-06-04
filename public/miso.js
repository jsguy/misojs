(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//	Various utilities that normalise usage between client and server
//	This is the client version - see miso.util.js for server version
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
	},

	//	Get info for an action from the params
	routeInfo: function(params){
		/*

			path: req.path,
			params: req.params, 
			query: req.query, 
			session: session

		*/
		return {
			path: m.route(),
			params: req.params, 
			query: req.query, 
			session: session
		}
	}
};
},{"mithril":11}],2:[function(require,module,exports){
var m = require('mithril'),
	miso = require("../modules/miso.util.client.js"),
	sugartags = require('mithril.sugartags')(m),
	//	Grab the generated client version...
	docs = require('../public/miso.documentation.js');

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
},{"../modules/miso.util.client.js":1,"../public/miso.documentation.js":16,"mithril":11,"mithril.sugartags":10}],3:[function(require,module,exports){
var m = require('mithril'),
	miso = require("../modules/miso.util.client.js"),
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
},{"../modules/miso.util.client.js":1,"mithril":11,"mithril.sugartags":10}],4:[function(require,module,exports){
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	smoothScroll = require('../public/js/mithril.smoothscroll.js');

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
					A({href:"/docs"}, "Documentation can be found here")
				])
			]);
		}
	}
};

},{"../public/js/mithril.smoothscroll.js":15,"mithril":11,"mithril.sugartags":10}],5:[function(require,module,exports){
/*	Miso custom layout page
	Example custom layout page - it removes most components
*/
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	authentication = require("../system/api/authentication/api.client.js")(m);

//	The full layout - always only rendered server side
module.exports.view = function(ctrl){
	with(sugartags) {
		return [
			m.trust("<!doctype html>"),
			HTML([
				HEAD([
					TITLE("Miso app"),
					LINK({href: '/css/style.css', rel:'stylesheet'})
				]),
				BODY([
					SECTION({id: ctrl.misoAttachmentNode}, ctrl.content),
					SCRIPT({src: '/miso.js'}),
					(ctrl.reload? SCRIPT({src: '/reload.js'}): "")
				])
			])
		];
	}
};
},{"../system/api/authentication/api.client.js":17,"mithril":11,"mithril.sugartags":10}],6:[function(require,module,exports){
/* Example login mvc */
var m = require('mithril'),
	miso = require("../modules/miso.util.client.js"),
	sugartags = require('mithril.sugartags')(m),
	authentication = require("../system/api/authentication/api.client.js")(m),
	session = require("../system/api/session/api.client.js")(m);

var index = module.exports.index = {
	models: {
		login: function(data){
			this.url = data.url;
			this.isLoggedIn = m.prop(false);
			this.username = m.prop(data.username||"");
			this.password = m.prop("");
		}
	},
	controller: function(params) {
		var ctrl = this,
			url = miso.getParam('url', params),
			logout = miso.getParam('logout', params);

		ctrl.model = new index.models.login({url: url});

		//	Note: this does not execute on the server as it 
		//	is a DOM event.
		ctrl.login = function(e){
			e.preventDefault();
			//	Call the server method to see if we're logged in
			authentication.login({type: 'login.index.login', model: ctrl.model}).then(function(data){
				if(data.result.isLoggedIn == true) {
					//	Woot, we're in!
					misoGlobal.isLoggedIn = true;
					misoGlobal.userName = data.result.userName;
					ctrl.model.isLoggedIn(true);

					console.log("Welcome " + misoGlobal.userName + ", you've been logged in");

					//	Will show the username when logged in
					misoGlobal.renderHeader();

					if(url){
						m.route(url);
					} else {
						//	Go to default URL?
						m.route("/");
					}
				}
			});
			return false;
		};

		if(logout) {
			authentication.logout({}).then(function(data){
				console.log("You've been logged out");
				//	Woot, we're out!
				ctrl.model.isLoggedIn(false);
				// misoGlobal.isLoggedIn = false;
				// delete misoGlobal.userName;
				//	Will remove the username when logged out
				misoGlobal.renderHeader();
			});
		}

		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV({"class": "cw cf"}, 
				ctrl.model.isLoggedIn()? "You've been logged in": [
				DIV(ctrl.model.url? "Please log in to go to " + ctrl.model.url: "Please log in"),
				FORM({ onsubmit: ctrl.login }, [
					INPUT({ type: "text", value: ctrl.model.username, placeholder: "Username"}),
					INPUT({ type: "password", value: ctrl.model.password}),
					BUTTON({ type: "submit"}, "Login")
				])
			]);
		}
	},
	authenticate: false
};
},{"../modules/miso.util.client.js":1,"../system/api/authentication/api.client.js":17,"../system/api/session/api.client.js":19,"mithril":11,"mithril.sugartags":10}],7:[function(require,module,exports){
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	db = require("../system/api/flatfiledb/api.client.js")(m);

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

		ctrl.list = [];

		db.find({type: 'todo.index.todo'}, {background: true, initialValue: []}).then(function(data) {
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
			return DIV({"class": "cw cf"}, [
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
			]);
		}
	}
	//	Test authenticate
	//,authenticate: true
};
},{"../system/api/flatfiledb/api.client.js":18,"mithril":11,"mithril.sugartags":10}],8:[function(require,module,exports){
/*
	This is a sample user management app that uses the
	multiple url miso pattern.
*/
var miso = require("../modules/miso.util.client.js"),
	validate = require('validator.modelbinder'),
	m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	bindings = require('mithril.bindings')(m),
	api = require("../system/api/authentication/api.client.js")(m),
	self = module.exports;

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
				DIV([
					LABEL("Password"), INPUT({value: ctrl.user.password, type: 'password'}),
					DIV({"class": (ctrl.user.isValid('password') == true || !ctrl.showErrors? "valid": "invalid") + " indented" }, [
						ctrl.user.isValid('password') == true || !ctrl.showErrors? "": ctrl.user.isValid('password').join(", ")
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

		api.findUsers({type: 'user.edit.user'}).then(function(data) {
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
				api.saveUser({ type: 'user.edit.user', model: ctrl.user } ).then(function(){
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
			//	Password is always empty first
			this.password = m.p(data.password||"");
			this.id = m.p(data._id||"");

			//	Validate the model
			this.isValid = validate.bind(this, {
				name: {
					isRequired: "You must enter a name"
				},
				password: {
					isRequired: "You must enter a password"
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
		api.findUsers({type: 'user.edit.user', query: {_id: userId}}).then(function(data) {
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
			if(ctrl.user.isValid() !== true) {
				ctrl.showErrors = true;
				console.log('User is not valid');
			} else {
				api.saveUser({ type: 'user.edit.user', model: ctrl.user } ).then(function(){
					console.log("Saved user", arguments);
					m.route("/users");
				});
			}
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
	//	Any authentication info
	//, authenticate: true
};

},{"../modules/miso.util.client.js":1,"../system/api/authentication/api.client.js":17,"mithril":11,"mithril.bindings":9,"mithril.sugartags":10,"validator.modelbinder":12}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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


	/**
	 * @typedef {String} Tag
	 * A string that looks like -> div.classname#id[param=one][param2=two]
	 * Which describes a DOM node
	 */

	/**
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
			if (attrName === classAttrName) {
				if (attrs[attrName] !== "") cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName];
			}
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
									element: cached.nodes[existing[key].index] || $document.createElement("div")
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
			var currentModule = topModule = module = module || {};
			var controller = new (module.controller || function() {});
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
	var blank = function() {return ""}
	function redraw() {
		var forceRedraw = m.redraw.strategy() === "all";
		for (var i = 0, root; root = roots[i]; i++) {
			if (controllers[i]) {
				m.render(root, modules[i].view ? modules[i].view(controllers[i]) : blank(), forceRedraw)
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
				var path = $location[m.route.mode]
				if (m.route.mode === "pathname") path += $location.search
				if (currentRoute != normalizeRoute(path)) {
					redirect(path)
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
			var oldRoute = currentRoute;
			currentRoute = arguments[0];
			var args = arguments[1] || {}
			var queryIndex = currentRoute.indexOf("?")
			var params = queryIndex > -1 ? parseQueryString(currentRoute.slice(queryIndex + 1)) : {}
			for (var i in args) params[i] = args[i]
			var querystring = buildQueryString(params)
			var currentPath = queryIndex > -1 ? currentRoute.slice(0, queryIndex) : currentRoute
			if (querystring) currentRoute = currentPath + (currentPath.indexOf("?") === -1 ? "?" : "&") + querystring;

			var shouldReplaceHistoryEntry = (arguments.length === 3 ? arguments[2] : arguments[1]) === true || oldRoute === arguments[0];

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
	function normalizeRoute(route) {
		return route.slice(modes[m.route.mode].length)
	}
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
			var valueType = type.call(value)
			var pair = value != null && (valueType === OBJECT) ?
				buildQueryString(value, key) :
				valueType === ARRAY ?
					value.map(function(item) {return encodeURIComponent(key + "[]") + "=" + encodeURIComponent(item)}).join("&") :
					encodeURIComponent(key) + "=" + encodeURIComponent(value)
			str.push(pair)
		}
		return str.join("&")
	}
	
	function parseQueryString(str) {
		var pairs = str.split("&"), params = {};
		for (var i = 0, len = pairs.length; i < len; i++) {
			var pair = pairs[i].split("=");
			params[decodeURIComponent(pair[0])] = pair[1] ? decodeURIComponent(pair[1]) : ""
		}
		return params
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
				script.parentNode.removeChild(script);
				options.onload({
					type: "load",
					target: {
						responseText: resp
					}
				});
				window[callbackKey] = undefined
			};

			script.onerror = function(e) {
				script.parentNode.removeChild(script);

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

},{}],12:[function(require,module,exports){
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
},{"validator":13}],13:[function(require,module,exports){
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

    validator = { version: '3.32.0' };

    var emailAddress = /((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))/;
    var displayName = /([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~\.]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~\.]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\s)*/;

    var email = new RegExp('^' + emailAddress.source + '$', 'i');
    var emailWithDisplayName = new RegExp('^' + displayName.source + '<' + emailAddress.source + '>$', 'i');

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
      , numeric = /^[-+]?[0-9]+$/
      , int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/
      , float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/
      , hexadecimal = /^[0-9a-fA-F]+$/
      , hexcolor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    var ascii = /^[\x00-\x7F]+$/
      , multibyte = /[^\x00-\x7F]/
      , fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/
      , halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

    var base64 = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/;

    var phones = {
      'zh-CN': /^(\+?0?86\-?)?1[345789]\d{9}$/,
      'en-ZA': /^(\+?27|0)\d{9}$/,
      'en-AU': /^(\+?61|0)4\d{8}$/,
      'en-HK': /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
      'fr-FR': /^(\+?33|0)[67]\d{8}$/,
      'pt-PT': /^(\+351)?9[1236]\d{7}$/,
      'el-GR' : /^(\+30)?((2\d{9})|(69\d{8}))$/
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

    var default_email_options = {
        allow_display_name: false
    };

    validator.isEmail = function (str, options) {
        options = merge(options, default_email_options);

        return email.test(str) || (options.allow_display_name === true && emailWithDisplayName.test(str));
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
            if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
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
        var chars = keep_new_lines ? '\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F' : '\\x00-\\x1F\\x7F';
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
        if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
            parts[0] = parts[0].toLowerCase().replace(/\./g, '');
            if (parts[0][0] === '+') {
                return false;
            }
            parts[0] = parts[0].split('+')[0];
            parts[1] = 'gmail.com';
        } else if (options.lowercase) {
            parts[0] = parts[0].toLowerCase();
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

},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
module.exports = function(){ return {"Api.md":"<p>The data apis in miso are a way to create a RESTful endpoint that you can interact with via an easy to use API.</p>\n<blockquote>\nNote: you must enable your api by adding it to the &quot;api&quot; attribute in the <code>/cfg/server.development.json</code> file, or whatever environment you are using.\n</blockquote>\n\n<h2><a name=\"how-does-an-api-work-\" class=\"anchor\" href=\"#how-does-an-api-work-\"><span class=\"header-link\">How does an api work?</span></a></h2><p>The apis in miso do a number of things:</p>\n<ul>\n<li>Allow database access via a thin wrapper, for example to access mongodb, we wrap the popular <a href=\"/doc/mongoose.md\">mongoose npm</a> ODM package</li>\n<li>Waits till mithril is ready - mithril has a unique feature ensures the view doesn&#39;t render till data has been retrieved - the api makes sure we adhere to this</li>\n<li>Apis can work as a proxy, so if you want to access a 3rd party service, an api is a good way to do that - you can then also build in caching, or any other features you may wish to add.</li>\n<li>Apis can be restricted by permissions (coming soon) </li>\n</ul>\n<h2><a name=\"how-should-you-use-apis\" class=\"anchor\" href=\"#how-should-you-use-apis\"><span class=\"header-link\">How should you use apis</span></a></h2><p>There are numerous scenarios where you might want to use an api:</p>\n<ul>\n<li>For database access (miso comes with a bunch of database apis)</li>\n<li>For calling 3rd party end-points - using an api will allow you to create caching and setup permissions on the end-point</li>\n</ul>\n<h2><a name=\"extending-an-existing-api\" class=\"anchor\" href=\"#extending-an-existing-api\"><span class=\"header-link\">Extending an existing api</span></a></h2><p>If you want to add your own methods to an api, you can simply extend one of the existing apis, for example, to extend the <code>flatfiledb</code> API, create a new directory and file in <code>/modules/api/adapt/adapt.api.js</code>:</p>\n<pre><code class=\"lang-javascript\">var db = require(&#39;../../../system/api/flatfiledb/flatfiledb.api.js&#39;);\n\nmodule.exports = function(m){\n    var ad = db(m);\n    ad.hello = function(cb, err, args, req){\n        cb(&quot;world&quot;);\n    };\n    return ad;\n};\n</code></pre>\n<p>Then add the api to the <code>/cfg/server.development.json</code> file like so:</p>\n<pre><code class=\"lang-javascript\">&quot;api&quot;: &quot;adapt&quot;\n</code></pre>\n<p>Then require the new api file in your mvc file like so:</p>\n<pre><code class=\"lang-javascript\">db = require(&#39;../modules/api/adapt/api.server.js&#39;)(m);\n</code></pre>\n<p>You can now add an api call in the controller like so:</p>\n<pre><code class=\"lang-javascript\">db.hello({}).then(function(data){\n// do something with data.result\n});\n</code></pre>\n<p>The arguments to each api endpoint must be the same, ie:</p>\n<pre><code class=\"lang-javascript\">function(cb, err, args, req)\n</code></pre>\n<p>Where:</p>\n<table>\n<thead>\n<tr>\n<th>Argument</th>\n<th>Purpose</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>cb</td>\n<td>A callback you must call when you are done - any data you return will be available on <code>data.result</code> in the response</td>\n</tr>\n<tr>\n<td>err</td>\n<td>A callback you must call if an unrecoverable error occurred, eg: &quot;database connection timeout&quot;. Do not use for things like &quot;no data found&quot;</td>\n</tr>\n<tr>\n<td>args</td>\n<td>A set of arguments passed in to the api method</td>\n</tr>\n<tr>\n<td>req</td>\n<td>The request object from the request</td>\n</tr>\n</tbody>\n</table>\n<p>The complete mvc example looks like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../modules/api/adapt/api.server.js&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            who = miso.getParam(&#39;adapt_id&#39;, params);\n\n        db.hello({}).then(function(data){\n            ctrl.model.who(data.result);\n        });\n\n        ctrl.model = new edit.models.hello({who: who});\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;G&#39;day &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<h2><a name=\"creating-custom-apis\" class=\"anchor\" href=\"#creating-custom-apis\"><span class=\"header-link\">Creating custom apis</span></a></h2><p>You can add your own custom apis in the <code>/modules/apis</code> directory, they have the same format as the included apis, here is an example api that calls the flickr API:</p>\n<pre><code class=\"lang-javascript\">//    endpoint api to make http requests via flickr\nvar request = require(&#39;request&#39;),\n    miso = require(&#39;../../../server/miso.util.js&#39;),\n    //    Parse out the unwanted parts of the json\n    //    typically this would be run on the client\n    //    we run this using &quot;request&quot; on  the server, so\n    //    no need for the jsonp callback\n    jsonParser = function(jsonpData){\n        var json, startPos, endPos;\n        try {\n            startPos = jsonpData.indexOf(&#39;({&#39;);\n            endPos = jsonpData.lastIndexOf(&#39;})&#39;);\n            json = jsonpData\n                .substring(startPos+1, endPos+1)\n                .split(&quot;\\n&quot;).join(&quot;&quot;)\n                .split(&quot;\\\\&#39;&quot;).join(&quot;&#39;&quot;);\n\n            return JSON.parse(json);\n        } catch(ex) {\n            console.log(&quot;ERROR&quot;, ex);\n            return &quot;{}&quot;;\n        }\n    };\n\nmodule.exports = function(utils){\n    return {\n        photos: function(cb, err, args, req){\n            args = args || {};\n            var url = &quot;http://api.flickr.com/services/feeds/photos_public.gne?format=json&quot;;\n            //    Add parameters\n            url += miso.each(args, function(value, key){\n                return &quot;&amp;&quot; + key + &quot;=&quot; + value;\n            });\n\n            request(url, function (error, response, body) {\n                if (!error &amp;&amp; response.statusCode == 200) {\n                    cb(jsonParser(body));\n                } else {\n                    err(error);\n                }\n            });\n        }\n    };\n};\n</code></pre>\n<p>To use it in your mvc file, simply:</p>\n<pre><code class=\"lang-javascript\">flickr = require(&#39;../modules/api/flickr/api.server.js&#39;)(m);\n</code></pre>\n<p>And then call it like so in your controller:</p>\n<pre><code class=\"lang-javascript\">flickr.photos({tags: &quot;Sydney opera house&quot;, tagmode: &quot;any&quot;}).then(function(data){\n    ctrl.model.flickrData(data.result.items);\n});\n</code></pre>\n","Authentication.md":"<h2><a name=\"authentication\" class=\"anchor\" href=\"#authentication\"><span class=\"header-link\">Authentication</span></a></h2><p>Authentication is the process of making sure a user is who they say they are - usually this is done by using a username and password, but it can also be done via an access token, 3rd-party services such as OAuth, or something like OpenID, or indeed Google, Facebook, GitHUb, etc...</p>\n<p>In miso, the authentication feature has:</p>\n<ul>\n<li>The ability to see if the user has logged in (via a secret value on the server-side session)</li>\n<li>The ability to redirect to a login page if they haven&#39;t logged in</li>\n</ul>\n<p>You can configure the authentication in <code>/cfg/server.json</code>, and set the authentication attribute on the action that requires it.</p>\n<p>For example, in <code>/cfg/server.json</code>, you can set:</p>\n<pre><code class=\"lang-javascript\">&quot;authentication&quot;: {\n    &quot;enabled&quot;: true,\n    &quot;all&quot;: false,\n    &quot;secret&quot;: &quot;im-so-miso&quot;,\n    &quot;strategy&quot;: &quot;default&quot;,\n    &quot;loginUrlPattern&quot;: &quot;/login?url=[ORIGINALURL]&quot;\n}\n</code></pre>\n<p>Where:</p>\n<ul>\n<li><strong>enabled</strong> will enable our authentication behaviour</li>\n<li><strong>all</strong> will set the default behaviour of authentication for all actions, default is &quot;false&quot;, ie: no authentication required</li>\n<li><strong>secret</strong> is the secret value that is set on the session</li>\n<li><strong>loginUrlPattern</strong> is a URL pattern where we will substitute &quot;[ORIGINALURL]&quot; for the originally requested URL.</li>\n<li><strong>middleware</strong> is the authentication middleware to use, default is &quot;../system/auth_middle&quot;</li>\n</ul>\n<p>Now, if you want a particular action to be authenticated, you can override the default (all) value in each of your actions, for example to need authentication on the <code>index</code> action of your todos app, set:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {\n    ...,\n    authenticate: true\n};\n</code></pre>\n<p>This will override the default value of the &quot;all&quot; attribute form the server config authentication and make authentication required on this action.\nIf your app is mainly a secure app, you&#39;ll want to set &quot;all&quot; attribute to true and override the &quot;login&quot; and, (if you have one), the &quot;forgot password&quot; pages, and so as to not require authentication, ie:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {\n    ...,\n    authenticate: false\n};\n</code></pre>\n<h3><a name=\"sample-implementation\" class=\"anchor\" href=\"#sample-implementation\"><span class=\"header-link\">Sample implementation</span></a></h3><p>In Miso, we have a sample implementation of authentication that uses the flatfiledb api. There are 4 main components in the sample authentication process:</p>\n<ul>\n<li><p>The authenticate api <code>/system/api/authenticate</code> - handles saving and loading of users, plus checking if the password matches.</p>\n</li>\n<li><p>The login mechanism <code>/mvc/login.js</code> - simply allows you to enter a username and password and uses the authentication api to log you in</p>\n</li>\n<li><p>User management <code>/mvc/users.js</code> - Uses the authentication api to add a user with an encrypted password</p>\n</li>\n<li><p>Authentication middleware <code>/system/auth_middle.js</code> - applies authentication on the server for actions - this is a core feature of how miso does the authentication - it simply checks if the secret is set on the session, and redirects to the configured &quot;loginUrlPattern&quot; URL if it doesn&#39;t match the secret.</p>\n</li>\n</ul>\n<p>Ideally you will not need to change the authentication middleware, as the implementation simply requires you to set the &quot;authenticationSecret&quot; on the request object session - you can see how this works in <code>/system/api/authenticate/authenticate.api.js</code>.</p>\n<h3><a name=\"how-the-sample-implementation-works\" class=\"anchor\" href=\"#how-the-sample-implementation-works\"><span class=\"header-link\">How the sample implementation works</span></a></h3><ul>\n<li>When authentication is required for access to an action, and you haven&#39;t authenticated, you are redirected to the <code>/login</code> action</li>\n<li>At <code>/login</code> you can authenticate with a username and password (which can be created at <code>/users</code>)</li>\n<li>When authenticated, a secret key is set on the session, this is used to check if a user is logged in every time they access an action that requires authentication.</li>\n</ul>\n<p>Note: the authentication secret is only ever kept on the server, so the client code simply has a boolean to say if it is logged in - this means it will try to access authenticated urls if <code>misoGlobal.isLoggedIn</code> is set to &quot;true&quot;. Of course the server will deny access to any data api end points, so your data is safe.</p>\n<h2><a name=\"sessions\" class=\"anchor\" href=\"#sessions\"><span class=\"header-link\">Sessions</span></a></h2><p>When the user is authenticated, they are provided with a session - this can be used to store temporary data and is accessible via <code>/system/api/session/api.server.js</code>. You can use it like so in your <code>mvc</code> files:</p>\n<pre><code class=\"lang-javascript\">var session = require(&#39;../system/api/session/api.server.js&#39;)(m);\n\nsession.get({key: &#39;userName&#39;}).then(function(data){\n    console.log(data.result);\n});\n</code></pre>\n<p>These are the methods available on the session api:</p>\n<table>\n<thead>\n<tr>\n<th>Method</th>\n<th>Purpose</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>get({key: key})</td>\n<td>Retrieves a value from the session for the given key</td>\n</tr>\n<tr>\n<td>set({key: key, value: value})</td>\n<td>Sets a value in the session for the given key</td>\n</tr>\n</tbody>\n</table>\n<p>Note: Each user of your app has a session that is stored on the server, so each time you access it, it will make a XHR request. Use it sparingly!</p>\n","Contributing.md":"<p>In order to contribute to misojs, please keep the following in mind:</p>\n<h2><a name=\"when-adding-a-pull-request\" class=\"anchor\" href=\"#when-adding-a-pull-request\"><span class=\"header-link\">When adding a pull request</span></a></h2><ul>\n<li>Be sure to only make small changes, anything more than 4 files will need to be reviewed</li>\n<li>Make sure you explain <em>why</em> you&#39;re making the change, so we understand what the change is for</li>\n<li>Add a unit test if appropriate</li>\n<li>Do not be offended if we ask you to add a unit test before accepting a pull request</li>\n<li>Use tabs not spaces (we are not flexible on this - it is a moot discussion - I really don&#39;t care, we just needed to pick one, and tabs it is)</li>\n</ul>\n","Creating-a-todo-app-part-2-persistence.md":"<p>In this article we will add data persistence functionality to our todo app from the <a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a> article. We recommend you first read that as we are going to use the app you made in this article, so if you don&#39;t already have one, grab a copy of it <a href=\"/doc/Creating-a-todo-app#completed-todo-app.md\">from here</a>, and save it in <code>/mvc/todo.js</code>.</p>\n<p>First add the <code>flatfiledb</code> api to the <code>cfg/server.development.json</code> file:</p>\n<pre><code class=\"lang-javascript\">&quot;api&quot;: &quot;flatfiledb&quot;\n</code></pre>\n<p>This makes miso load the api and expose it at the configured API url, default is &quot;/api&quot; + api name, so for the flatfiledb it will be <code>/api/flatfiledb</code>. This is all abstracted away, so you do not need to worry about what the URL is when using the api - you simply call the method you want, and the miso api takes care of the rest.</p>\n<p>Now require the db api at the the top of the todo.js file:</p>\n<pre><code class=\"lang-javascript\">db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n</code></pre>\n<p>Next add the following in the <code>ctrl.addTodo</code> function underneath the line that reads <code>ctrl.vm.input(&quot;&quot;);</code>:</p>\n<pre><code class=\"lang-javascript\">db.save({ type: &#39;todo.index.todo&#39;, model: newTodo } ).then(function(res){\n    newTodo._id = res.result;\n});\n</code></pre>\n<p>This will save the todo to the database when you click the &quot;Add&quot; button.</p>\n<p>Let us take a quick look at how the api works - the way that you make requests to the api depends entirely on which api you are using, for example for the flatfiledb, we have:</p>\n<table>\n<thead>\n<tr>\n<th>Method</th>\n<th>Action</th>\n<th>Parameters</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>save</td>\n<td>Save or updates a model</td>\n<td>{ type: TYPE, model: MODEL }</td>\n</tr>\n<tr>\n<td>find</td>\n<td>Finds one or more models of the give type</td>\n<td>{ type: TYPE, query: QUERY }</td>\n</tr>\n<tr>\n<td>remove</td>\n<td>Removes an instance of a model</td>\n<td>{ type: TYPE, id: ID }</td>\n</tr>\n</tbody>\n</table>\n<p>Where the attributes are:</p>\n<table>\n<thead>\n<tr>\n<th>Attribute</th>\n<th>Use</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>TYPE</td>\n<td>The namespace of the model, say you have todo.js, and the model is on <code>module.exports.index.modules.todo</code>, the type would be &quot;todo.index.todo&quot;</td>\n</tr>\n<tr>\n<td>MODEL</td>\n<td>This is an object representing the model - eg: a standard mithril model</td>\n</tr>\n<tr>\n<td>QUERY</td>\n<td>An object with attributes to filter the query results</td>\n</tr>\n<tr>\n<td>ID</td>\n<td>A unique ID for a record</td>\n</tr>\n</tbody>\n</table>\n<p>Every method returns a <a href=\"/doc/mithril.deferred.html#differences-from-promises-a-.md\">mithril style promise</a>, which means you must attach a <code>.then</code> callback function.\nBe sure to check the methods for each api, as each will vary, depending on the functionality.</p>\n<p>Now, let us add the capability to load our todos, add the following to the start of the controller, just after the <code>var ctrl = this</code>:</p>\n<pre><code class=\"lang-javascript\">db.find({type: &#39;todo.index.todo&#39;}).then(function(data) {\n    ctrl.list = Object.keys(data.result).map(function(key) {\n        return new self.models.todo(data.result[key]);\n    });\n});\n</code></pre>\n<p>This will load your todos when the app loads up. Be sure to remove the old static list, ie: remove these lines:</p>\n<pre><code class=\"lang-javascript\">myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n\nctrl.list = Object.keys(myTodos).map(function(key) {\n    return new self.models.todo(myTodos[key]);\n});\n</code></pre>\n<p>Now you can try adding a todo, and it will save and load!</p>\n<p>Next let us add the ability to remove your completed todos in the archive method - extend the <code>if</code> statement by adding an <code>else</code> like so: </p>\n<pre><code class=\"lang-javascript\">} else {\n    api.remove({ type: &#39;todo.index.todo&#39;, _id: todo._id }).then(function(response){\n        console.log(response.result);\n    });\n}\n</code></pre>\n<p>This will remove the todo from the data store.</p>\n<p>You now have a complete todo app, your app should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.prop(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this;\n\n        db.find({type: &#39;todo.index.todo&#39;}).then(function(data) {\n            ctrl.list = Object.keys(data.result).map(function(key) {\n                return new self.models.todo(data.result[key]);\n            });\n        });\n\n        ctrl.addTodo = function(e){\n            var value = ctrl.vm.input();\n            if(value) {\n                var newTodo = new self.models.todo({\n                    text: ctrl.vm.input(),\n                    done: false\n                });\n                ctrl.list.push(newTodo);\n                ctrl.vm.input(&quot;&quot;);\n                db.save({ type: &#39;todo.index.todo&#39;, model: newTodo } ).then(function(res){\n                    newTodo._id = res.result;\n                });\n            }\n            e.preventDefault();\n            return false;\n        };\n\n        ctrl.archive = function(){\n            var list = [];\n            ctrl.list.map(function(todo) {\n                if(!todo.done()) {\n                    list.push(todo); \n                } else {\n                    db.remove({ type: &#39;todo.index.todo&#39;, _id: todo._id }).then(function(response){\n                        console.log(response.result);\n                    });\n                }\n            });\n            ctrl.list = list;\n        };\n\n        ctrl.vm = {\n            left: function(){\n                var count = 0;\n                ctrl.list.map(function(todo) {\n                    count += todo.done() ? 0 : 1;\n                });\n                return count;\n            },\n            done: function(todo){\n                return function() {\n                    todo.done(!todo.done());\n                }\n            },\n            input: m.prop(&quot;&quot;)\n        };\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n                H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n                BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n                UL([\n                    ctrl.list.map(function(todo){\n                        return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                    })\n                ]),\n                FORM({ onsubmit: ctrl.addTodo }, [\n                    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n                    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n                ])\n            ]\n        };\n    }\n};\n</code></pre>\n","Creating-a-todo-app.md":"<p>In this article we will create a functional todo app - we recommend you first read the <a href=\"/doc/Getting-started.md\">Getting started</a> article, and understand the miso fundamentals such as where to place models and how to create a miso controller.</p>\n<h2><a name=\"todo-app\" class=\"anchor\" href=\"#todo-app\"><span class=\"header-link\">Todo app</span></a></h2><p>We will now create a new app using the <a href=\"/doc/Patterns#single-url-mvc.md\">single url pattern</a>, which means it handles all actions autonomously, plus looks a lot like a normal mithril app.</p>\n<p>In <code>/mvc</code> save a new file as <code>todo.js</code> with the following content: </p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {},\n    controller: function(params) {\n        var ctrl = this;\n        return ctrl;\n    },\n    view: function(ctrl) {\n        return &quot;TODO&quot;;\n    }\n};\n</code></pre>\n<p>Now open: <a href=\"/doc/todos.md\">http://localhost:6476/todos</a> and you&#39;ll see the word &quot;TODO&quot;. You&#39;ll notice that the url is &quot;/todos&quot; with an &#39;s&#39; on the end - as we are using <a href=\"/doc/How-miso-works#route-by-convention.md\">route by convention</a> to map our route.</p>\n<p>Next let&#39;s create the model for our todos - change the <code>models</code> attribute to the following:</p>\n<pre><code class=\"lang-javascript\">models: {\n    todo: function(data){\n        this.text = data.text;\n        this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n        this._id = data._id;\n    }\n},\n</code></pre>\n<p>Each line in the model does the following:</p>\n<ul>\n<li><code>this.text</code> - The text that is shown on the todo</li>\n<li><code>this.done</code> - This represents if the todo has been completed - we ensure that we handle the &quot;false&quot; values correctly, as ajax responses are always strings.</li>\n<li><code>this._id</code> - The key for the todo</li>\n</ul>\n<p>The model can now be used to store and retreive todos - miso automatically picks up any objects on the <code>models</code> attribute of your mvc file, and maps it in the API. We will soon see how that works. Next add the following code as the controller:</p>\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var ctrl = this,\n        myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n    ctrl.list = Object.keys(myTodos).map(function(key) {\n        return new self.models.todo(myTodos[key]);\n    });\n    return ctrl;\n},\n</code></pre>\n<p>This does the following:</p>\n<ul>\n<li>Creates <code>myTodos</code> which is a list of objects that represents todos</li>\n<li><code>this.list</code> - creates a list of todo model objects by using <code>new self.models.todo(...</code> on each myTodos object.</li>\n<li><code>return this</code> must be done in all controllers, it makes sure that miso can correctly get access to the controller object.</li>\n</ul>\n<p>Note: we always create a local variable <code>ctrl</code> that points to the controller, as it can be used to access variables in the controller from nested functions. You will see this usage later on in this article.</p>\n<p>Now update the view like so:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    return m(&quot;UL&quot;, [\n        ctrl.list.map(function(todo){\n            return m(&quot;LI&quot;, todo.text)\n        })\n    ]);\n}\n</code></pre>\n<p>This will iterate on your newly created list of todo model objects and display the on screen. Your todo app should now look like this:</p>\n<h3><a name=\"half-way-point\" class=\"anchor\" href=\"#half-way-point\"><span class=\"header-link\">Half-way point</span></a></h3><pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n        ctrl.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n        return ctrl;\n    },\n    view: function(ctrl) {\n        return m(&quot;UL&quot;, [\n            ctrl.list.map(function(todo){\n                return m(&quot;LI&quot;, todo.text)\n            })\n        ]);\n    }\n};\n</code></pre>\n<blockquote>\nSo far we have only used pure mithril to create our app - miso did do some of the grunt-work behind the scenes, but we can do much more.\n</blockquote>\n\n\n<p>Let us add some useful libraries, change the top section to:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m);\n</code></pre>\n<p>This will include the following libraries:</p>\n<ul>\n<li><a href=\"/doc/mithril.sugartags.md\">mithril.sugartags</a> - allows rendering HTML using tags that look a little more like HTML than standard mithril</li>\n<li><a href=\"/doc/mithril.bindings.md\">mithril.bindings</a> Bi-directional data bindings for richer models</li>\n</ul>\n<p>Let us start with the sugar tags, update the view to read:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return UL([\n            ctrl.list.map(function(todo){\n                return LI(todo.text)\n            })\n        ])\n    };\n}\n</code></pre>\n<p>So using sugartags allows us to write more concise views, that look more like natural HTML.</p>\n<p>Next let us add a <a href=\"/doc/what-is-a-view-model.html.md\">view model</a> to the controller. A view model is simply a model that contains data about the view, and auxillary functionality, ie: data and other things that we don&#39;t want to persist. Add this to the controller:</p>\n<pre><code class=\"lang-javascript\">ctrl.vm = {\n    done: function(todo){\n        return function() {\n            todo.done(!todo.done());\n        }\n    }\n};\n</code></pre>\n<p>This method will return a function that toggles the <code>done</code> attribute on the passed in todo. </p>\n<blockquote>\nYou might be tempted to put this functionality into the model, but in miso, we need to strictly keep data in the data model, as we are able to persist it.\n</blockquote>\n\n<p>Next update the view to:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return [\n            STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n            UL([\n                ctrl.list.map(function(todo){\n                    return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                })\n            ])\n        ]\n    };\n}\n</code></pre>\n<p>This will make the list of todos clickable, and put a strike-through the todo when it is set to &quot;done&quot;, neat!</p>\n<p>Now let us add a counter, to show how many todos are left, put this into the view model you created in the previous step:</p>\n<pre><code class=\"lang-javascript\">left: function(){\n    var count = 0;\n    ctrl.list.map(function(todo) {\n        count += todo.done() ? 0 : 1;\n    });\n    return count;\n}\n</code></pre>\n<p>And in the view, add the following above the UL:</p>\n<pre><code class=\"lang-javascript\">H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n</code></pre>\n<p>This will now display a nice header showing how many todos are left.</p>\n<p>Next let us add an input field, so you can add new todos, in the view model, (the <code>ctrl.vm</code> object), add the following line:</p>\n<pre><code class=\"lang-javascript\">input: m.p(&quot;&quot;)\n</code></pre>\n<p>In the controller, add:</p>\n<pre><code class=\"lang-javascript\">ctrl.addTodo = function(e){\n    var value = ctrl.vm.input();\n    if(value) {\n        var newTodo = new self.models.todo({\n            text: ctrl.vm.input(),\n            done: false\n        });\n        ctrl.list.push(newTodo);\n        ctrl.vm.input(&quot;&quot;);\n    }\n    e.preventDefault();\n    return false;\n};\n</code></pre>\n<p>This function creates a new todo based on the input text, and adds it to the list of todos.</p>\n<p>And in the view just below the UL, add:</p>\n<pre><code class=\"lang-javascript\">FORM({ onsubmit: ctrl.addTodo }, [\n    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n])\n</code></pre>\n<p>As you can see, we assign the <code>addTodo</code> method of the controller to the onsubmit function of the form, so that it will correctly add the todo when you click the &quot;Add&quot; button.</p>\n<p>Next, let us add the ability to archive old todos, add the following into the controller:</p>\n<pre><code class=\"lang-javascript\">ctrl.archive = function(){\n    var list = [];\n    ctrl.list.map(function(todo) {\n        if(!todo.done()) {\n            list.push(todo); \n        }\n    });\n    ctrl.list = list;\n};\n</code></pre>\n<p>And this button below the H1:</p>\n<pre><code class=\"lang-javascript\">BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n</code></pre>\n<h3><a name=\"completed-todo-app\" class=\"anchor\" href=\"#completed-todo-app\"><span class=\"header-link\">Completed todo app</span></a></h3><p>And you can now archive your todos. This completes the todo app functionally, your complete todo app should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.prop(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n\n        ctrl.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n\n        ctrl.addTodo = function(e){\n            var value = ctrl.vm.input();\n            if(value) {\n                var newTodo = new self.models.todo({\n                    text: ctrl.vm.input(),\n                    done: false\n                });\n                ctrl.list.push(newTodo);\n                ctrl.vm.input(&quot;&quot;);\n            }\n            e.preventDefault();\n            return false;\n        };\n\n        ctrl.archive = function(){\n            var list = [];\n            ctrl.list.map(function(todo) {\n                if(!todo.done()) {\n                    list.push(todo); \n                }\n            });\n            ctrl.list = list;\n        };\n\n        ctrl.vm = {\n            left: function(){\n                var count = 0;\n                ctrl.list.map(function(todo) {\n                    count += todo.done() ? 0 : 1;\n                });\n                return count;\n            },\n            done: function(todo){\n                return function() {\n                    todo.done(!todo.done());\n                }\n            },\n            input: m.p(&quot;&quot;)\n        };\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n                H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n                BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n                UL([\n                    ctrl.list.map(function(todo){\n                        return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                    })\n                ]),\n                FORM({ onsubmit: ctrl.addTodo }, [\n                    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n                    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n                ])\n            ]\n        };\n    }\n};\n</code></pre>\n<p>Next we recommend you read</p>\n<p><a href=\"/doc/Creating-a-todo-app-part-2-persistence.md\">Creating a todo app part 2 - persistence</a>, where we will go through adding data persistence functionality.</p>\n","Debugging.md":"<h1><a name=\"debugging-a-miso-app\" class=\"anchor\" href=\"#debugging-a-miso-app\"><span class=\"header-link\">Debugging a miso app</span></a></h1><p>In order to debug a miso app, (or any isomorphic JavaScript app for that matter), you&#39;ll need to be able to debug on both the client and the server. Here we will demonstrate debugging the client-side code using Chrome, and the server code using JetBrains WebStorm 9. Miso can actually be debugged using any standard node and client-side debugging tools that support source maps.</p>\n<p>In this example we&#39;re going to debug the example <code>todos</code> app, so be sure you know how it works, and you know how to install it - if you don&#39;t know how, please read the <a href=\"/doc/Creating-a-todo-app.md\">todos app tutorial</a> first.</p>\n<blockquote>\nOne thing to keep in mind is how miso works: it is isomorphic which means that the code we have is able to run both server and client side. Of course it doesn&#39;t always run on both sides, so here is a handy little table to explain what typically runs where and when, for the todos example:\n</blockquote>\n\n<table>\n<thead>\n<tr>\n<th>File</th>\n<th>action</th>\n<th>Server</th>\n<th>Client</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>/mvc/todo.js</td>\n<td>index</td>\n<td>Runs when a browser loads up <code>/todos</code></td>\n<td>Runs when you interact with anything</td>\n</tr>\n<tr>\n<td>/system/api/flatfiledb.api.js</td>\n<td>find</td>\n<td>Runs when index is run either server (directly) or client side (through the api)</td>\n<td>Never runs on the client - an ajax request is automatically generated by miso</td>\n</tr>\n</tbody>\n</table>\n<p>Those are the only files that are used in the todos example.</p>\n<h2><a name=\"client-side-miso-debugging\" class=\"anchor\" href=\"#client-side-miso-debugging\"><span class=\"header-link\">Client-side miso debugging</span></a></h2><p>Firstly let us make sure that we&#39;ve configured Chrome correctly:</p>\n<ul>\n<li>Open the dev tools (CMD + ALT + J on Mac, F12 on PC)</li>\n<li>Click the setting cog </li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/chrome_cog.jpg\" alt=\"Chrome cog\"></p>\n<ul>\n<li>Scroll down to the &quot;Sources&quot; section</li>\n<li>Make sure that &quot;Enable JavaScript source maps&quot; is ticked and close the settings.</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/chrome_settings.jpg\" alt=\"Chrome todos source\"></p>\n<p>Now Chrome is ready to interact with miso. Next run the miso todo app in development mode - i.e. in the directory you setup miso, run the following:</p>\n<pre><code>miso run\n</code></pre><p>When you&#39;re up and running, go to the todos URL, if everything is setup with defaults, it will be:</p>\n<p><a href=\"/doc/todos.md\">http://localhost:6476/todos</a></p>\n<p>Next open the dev tools in Chrome and:</p>\n<ul>\n<li>Click the &quot;Sources&quot; tab</li>\n<li>Open the &quot;mvc&quot; folder</li>\n<li>Click on the &quot;todo.js&quot; file</li>\n</ul>\n<p>You should now see a todo.js file in the right-hand pane</p>\n<p><img src=\"http://jsguy.com/miso_img/chrome_source_todos.jpg\" alt=\"Chrome todos source\"></p>\n<ul>\n<li>Scroll down to the last line inside the <code>addTodo</code> method</li>\n<li>Click on the line-number next to the return statement to set a breakpoint</li>\n</ul>\n<p>You should now see a mark next to the line, and a breakpoint in the list of breakpoints.</p>\n<p><img src=\"http://jsguy.com/miso_img/chrome_breakpoint.jpg\" alt=\"Chrome todos source\"></p>\n<p>Now we want to try and trigger that breakpoint:</p>\n<ul>\n<li>Enter a value in the &quot;Add todo&quot; box</li>\n<li>Click the &quot;Add&quot; button</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/miso_todos_add.jpg\" alt=\"Chrome todos source\"></p>\n<p>You should now see the breakpoint in action, complete with your value in the local scope.</p>\n<p><img src=\"http://jsguy.com/miso_img/chrome_breakpoint_active.jpg\" alt=\"Chrome todos source\"></p>\n<p>And that&#39;s it for client-side debugging - you can now use the Chrome debugger to inspect and manipulate values, etc...</p>\n<h2><a name=\"server-side-miso-debugging\" class=\"anchor\" href=\"#server-side-miso-debugging\"><span class=\"header-link\">Server-side miso debugging</span></a></h2><blockquote>\nNote: Please clear any breakpoint you might have set in Chrome, so it won&#39;t interfere with our server-side debugging session - of course you can use both together, but for now let us clear them, and also stop the miso server, if it is still running, as we will get WebStorm to handle it for us.\n</blockquote>\n\n<p>In this example we&#39;re going to use <a href=\"/doc/.md\">WebStorm</a> - you can use any IDE that supports node debugging, or free tools such as <a href=\"/doc/node-inspector.md\">node-inspector</a>, so this is simply for illustrative purposes.</p>\n<p>First we need to setup our project, so in Webstorm:</p>\n<ul>\n<li>Create a new project, setting your miso directory as the root.</li>\n<li>Add a new node project configuration, with the following settings:</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_configure_project.jpg\" alt=\"Chrome todos source\"></p>\n<ul>\n<li>Now hit the debug button</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_debug_button.jpg\" alt=\"Chrome todos source\"></p>\n<p>You should see miso running in the WebStorm console like so:</p>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_console.jpg\" alt=\"Chrome todos source\"></p>\n<ul>\n<li>Now open <code>/system/api/flatfiledb/flatfiledb.api.js</code>, and put a breakpoint on the last line of the <code>find</code> method.</li>\n</ul>\n<p>Now if you go back to your browser todos app:</p>\n<p><a href=\"/doc/todos.md\">http://localhost:6476/todos</a></p>\n<p>Reload the page, and you will see the breakpoint being activated in WebStorm:</p>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_breakpoint_active.jpg\" alt=\"Chrome todos source\"></p>\n<p>Now click the &quot;resume program button&quot;, and you&#39;ll see that the breakpoint it is immediately invoked again! </p>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_breakpoint_data.jpg\" alt=\"Chrome todos source\"></p>\n<p>This is simply because miso renders the first page on the server - so depending on how you structure your queries, it will use the API twice - once from the server side rendering, and once from the client-side. Don&#39;t worry - this only happens on initial page load in order to render the first page both server side and client side, you can read more about how that works here:</p>\n<p><a href=\"/doc/How-miso-works#first-page-load.md\">How miso works: First page load</a></p>\n<p>So, you are now able to inspect the values, and do any kind of server side debugging you like.</p>\n","Getting-started.md":"<p>This guide will take you through making your first miso app, it is assumed that you know the basics of how to use nodejs and mithril.</p>\n<h2><a name=\"installation\" class=\"anchor\" href=\"#installation\"><span class=\"header-link\">Installation</span></a></h2><p>To install miso, use npm:</p>\n<pre><code class=\"lang-javascript\">npm install misojs -g\n</code></pre>\n<p>To create and run a miso app in a new directory:</p>\n<pre><code class=\"lang-javascript\">miso -n myapp\ncd myapp\nmiso run\n</code></pre>\n<p>You should now see something like:</p>\n<pre><code>Miso is listening at http://localhost:6476 in development mode\n</code></pre><p>Open your browser at <code>http://localhost:6476</code> and you will see the default miso screen</p>\n<h2><a name=\"hello-world-app\" class=\"anchor\" href=\"#hello-world-app\"><span class=\"header-link\">Hello world app</span></a></h2><p>Create a new file <code>hello.js</code> in <code>myapp/mvc</code> like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new edit.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;Hello &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<p>Then open <a href=\"/doc/YOURNAME.md\">http://localhost:6476/hello/YOURNAME</a> and you should see &quot;Hello YOURNAME&quot;. Change the url to have your actual name instead of YOURNAME, you now know miso :)</p>\n<p>Let us take a look at what each piece of the code is actually doing:</p>\n<h3><a name=\"includes\" class=\"anchor\" href=\"#includes\"><span class=\"header-link\">Includes</span></a></h3><blockquote>\nSummary: Mithril is the only required library when apps, but using other included libraries is very useful\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n</code></pre>\n<p>Here we grab mithril, then miso utilities and sugar tags - technically speaking, we really only need mithril, but the other libraries are very useful as well as we will see.</p>\n<h3><a name=\"models\" class=\"anchor\" href=\"#models\"><span class=\"header-link\">Models</span></a></h3><blockquote>\nSummary: Use the automatic routing when you can, always put models on the &#39;models&#39; attribute of your mvc file\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n</code></pre>\n<p>Here a few important things are going on:</p>\n<ul>\n<li><p>By placing our <code>mvc</code> object on <code>module.exports.edit</code>, automatic routing is applied by miso - you can read more about <a href=\"/doc/How-miso-works#route-by-convention.md\">how the automatic routing works here</a>. </p>\n</li>\n<li><p>Placing our <code>hello</code> model on the <code>models</code> attribute of the object ensures that miso can figure out what your models are, and will create a persistence API automatically for you when the server starts up, so that you can save your models into the database.</p>\n</li>\n</ul>\n<h3><a name=\"controller\" class=\"anchor\" href=\"#controller\"><span class=\"header-link\">Controller</span></a></h3><blockquote>\nSummary: DO NOT forget to &#39;return this;&#39; in the controller, it is vital!\n</blockquote>\n\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var who = miso.getParam(&#39;hello_id&#39;, params);\n    this.model = new edit.models.hello({who: who});\n    return this;\n},\n</code></pre>\n<p>The controller uses <code>miso.getParam</code> to retreive the parameter - this is so that it can work seamlessly on both the server and client side. We create a new model, and very importantly <code>return this</code> ensures that miso can get access to the controller correctly.</p>\n<h3><a name=\"view\" class=\"anchor\" href=\"#view\"><span class=\"header-link\">View</span></a></h3><blockquote>\nSummary: Use sugartags to make the view look more like HTML\n</blockquote>\n\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return DIV(&quot;Hello &quot; + ctrl.model.who());\n    }\n}\n</code></pre>\n<p>The view is simply a javascript function that returns a structure. Here we use the <code>sugartags</code> library to render the DIV tag - this is strictly not required, but I find that people tend to understand the sugartags syntax better than pure mithril, as it looks a little more like HTML, though of course you could use standard mithril syntax if you prefer.</p>\n<h3><a name=\"next\" class=\"anchor\" href=\"#next\"><span class=\"header-link\">Next</span></a></h3><p>You now have a complete hello world app, and understand the fundamentals of the structure of a miso mvc application.</p>\n<p>We have only just scraped the surface of what miso is capable of, so next we recommend you read:</p>\n<p><a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a></p>\n","Goals.md":"<h1><a name=\"primary-goals\" class=\"anchor\" href=\"#primary-goals\"><span class=\"header-link\">Primary goals</span></a></h1><ul>\n<li>Easy setup of <a href=\"/doc/.md\">isomorphic</a> application based on <a href=\"/doc/mithril.js.md\">mithril</a></li>\n<li>Skeleton / scaffold / Boilerplate to allow users to very quickly get up and running.</li>\n<li>minimal core</li>\n<li>easy extendible</li>\n<li>DB agnostic (e. G. plugins for different ORM/ODM)</li>\n</ul>\n<h1><a name=\"components\" class=\"anchor\" href=\"#components\"><span class=\"header-link\">Components</span></a></h1><ul>\n<li>Routing</li>\n<li>View rendering</li>\n<li>i18n/l10n</li>\n<li>Rest-API (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>optional Websockets (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>easy testing (headless and Browser-Tests)</li>\n<li>login/session handling</li>\n<li>models with validation</li>\n</ul>\n<h1><a name=\"useful-libs\" class=\"anchor\" href=\"#useful-libs\"><span class=\"header-link\">Useful libs</span></a></h1><p>Here are some libraries we are considering using, (in no particular order):</p>\n<ul>\n<li>leveldb</li>\n<li>mithril-query</li>\n<li>translate.js</li>\n<li>i18next</li>\n</ul>\n<p>And some that we&#39;re already using:</p>\n<ul>\n<li>express</li>\n<li>browserify</li>\n<li>mocha/expect</li>\n<li>mithril-node-render</li>\n<li>mithril-sugartags</li>\n<li>mithril-bindings</li>\n<li>mithril-animate</li>\n<li>lodash</li>\n<li>validator</li>\n</ul>\n","Home.md":"<p>Welcome to the misojs wiki!</p>\n<h2><a name=\"getting-started\" class=\"anchor\" href=\"#getting-started\"><span class=\"header-link\">Getting started</span></a></h2><p>Read the <a href=\"/doc/Getting-started.md\">Getting started</a> guide!</p>\n<h2><a name=\"more-info\" class=\"anchor\" href=\"#more-info\"><span class=\"header-link\">More info</span></a></h2><p>See the <a href=\"/doc/misojs#install.md\">install guide</a>.\nRead <a href=\"/doc/How-miso-works.md\">how miso works</a>, and check out <a href=\"/doc/Patterns.md\">the patterns</a>, then create something cool!</p>\n","How-miso-works.md":"<h2><a name=\"models-views-controllers\" class=\"anchor\" href=\"#models-views-controllers\"><span class=\"header-link\">Models, views, controllers</span></a></h2><p>When creating a route, you must assign a controller and a view to it - this is achieved by creating a file in the <code>/mvc</code> directory - by convention, you should name it as per the path you want, (see the <a href=\"/doc/#routing.md\">routing section</a> for details).</p>\n<p>Here is a minimal example using the sugartags, and getting a parameter:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nmodule.exports.index = {\n    controller: function(params) {\n        this.who = miso.getParam(&#39;who&#39;, params, &#39;world&#39;);\n        return this;\n    },\n    view: function(ctrl){\n        with(sugartags) {\n            return DIV(&#39;Hello &#39; + ctrl.who);\n        }\n    }\n};\n</code></pre>\n<p>Save this into a file <code>/mvc/hello.js</code>, and open <a href=\"/doc/hellos.md\">http://localhost/hellos</a>, this will show &quot;Hello world&quot;. Note the &#39;s&#39; on the end - this is due to how the <a href=\"/doc/#route-by-convention.md\">route by convention</a> works.</p>\n<p>Now open <code>/cfg/routes.json</code>, and add the following routes:</p>\n<pre><code class=\"lang-javascript\">    &quot;/hello&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/hello/:who&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; }\n</code></pre>\n<p>Save the file, and go back to the browser, and you&#39;ll see an error! This is because we have now overridden the automatic route. Open <a href=\"/doc/hello.md\">http://localhost/hello</a>, and you&#39;ll see our action. Now open <a href=\"/doc/YOURNAME.md\">http://localhost/hello/YOURNAME</a>, and you&#39;ll see it getting the first parameter, and greeting you!</p>\n<h2><a name=\"routing\" class=\"anchor\" href=\"#routing\"><span class=\"header-link\">Routing</span></a></h2><p>The routing can be defined in one of two ways</p>\n<h3><a name=\"route-by-convention\" class=\"anchor\" href=\"#route-by-convention\"><span class=\"header-link\">Route by convention</span></a></h3><p>You can use a naming convention as follows:</p>\n<table>\n<thead>\n<tr>\n<th>Action</th>\n<th>Method</th>\n<th>URL</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>index</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39;</td>\n<td>List the items</td>\n</tr>\n<tr>\n<td>edit</td>\n<td>GET</td>\n<td>[controller]/[id]</td>\n<td>Display a form to edit the item</td>\n</tr>\n<tr>\n<td>new</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39; + &#39;/new&#39;</td>\n<td>Display a form to add a new item</td>\n</tr>\n</tbody>\n</table>\n<p>Say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/users&quot;.<br>Now say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.edit = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/user/:user_id&quot;, so that users can access via a route such as &quot;/user/27&quot; for use with ID of 27. <em>Note:</em> You can get the user_id using a miso utility: <code>var userId = miso.getParam(&#39;user_id&#39;, params);</code>.</p>\n<h3><a name=\"route-by-configuration\" class=\"anchor\" href=\"#route-by-configuration\"><span class=\"header-link\">Route by configuration</span></a></h3><p>By using <code>/cfg/routes.json</code> config file:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;[Pattern]&quot;: { &quot;method&quot;: &quot;[Method]&quot;, &quot;name&quot;: &quot;[Route name]&quot;, &quot;action&quot;: &quot;[Action]&quot; }\n}\n</code></pre>\n<p>Where:</p>\n<ul>\n<li><strong>Pattern</strong> - the <a href=\"/doc/#routing-patterns.md\">route pattern</a> we want, including any parameters</li>\n<li><strong>Method</strong> - one of &#39;GET&#39;, &#39;POST&#39;, &#39;PUT&#39;, &#39;DELETE&#39;</li>\n<li><strong>Route</strong> name - name of your route file from /mvc</li>\n<li><strong>Action</strong> - name of the action to call on your route file from /mvc</li>\n</ul>\n<p><strong>Example</strong></p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;home&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This will map a &quot;GET&quot; to the root of the URL for the <code>index</code> action in <code>home.js</code></p>\n<p><strong>Note:</strong> The routing config will override any automatically defined routes, so if you need multiple routes to point to the same action, you must manually define them. For example, if you have a mvc file named &quot;term.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/terms&quot;. Now, if you want to map it also to &quot;/AGB&quot;, you will need to add two entries in the routes config:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/terms&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/AGB&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This is because Miso assumes that if you override the defaulted routes, you actually want to replace them, not just override them. <em>Note:</em> this is correct behaviour, as it minority case is when you want more than one route pointing to the same action.</p>\n<h3><a name=\"routing-patterns\" class=\"anchor\" href=\"#routing-patterns\"><span class=\"header-link\">Routing patterns</span></a></h3><table>\n<thead>\n<tr>\n<th>Type</th>\n<th>Example</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Path</td>\n<td>&quot;/abcd&quot; - match paths starting with /abcd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/abc?d&quot; - match paths starting with /abcd and /abd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab+cd&quot; - match paths starting with /abcd, /abbcd, /abbbbbcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab*cd&quot; - match paths starting with /abcd, /abxcd, /abFOOcd, /abbArcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/a(bc)?d&quot; - will match paths starting with /ad and /abcd</td>\n</tr>\n<tr>\n<td>Regular Expression</td>\n<td>/\\/abc&#124;\\/xyz/ - will match paths starting with /abc and /xyz</td>\n</tr>\n<tr>\n<td>Array</td>\n<td>[&quot;/abcd&quot;, &quot;/xyza&quot;, /\\/lmn&#124;\\/pqr/] - match paths starting with /abcd, /xyza, /lmn, and /pqr</td>\n</tr>\n</tbody>\n</table>\n<h3><a name=\"links\" class=\"anchor\" href=\"#links\"><span class=\"header-link\">Links</span></a></h3><p>When you create links, in order to get the app to work as an SPA, you must pass in m.route as a config, so that the history will be updated correctly, for example:</p>\n<pre><code class=\"lang-javascript\">A({href:&quot;/users/new&quot;, config: m.route}, &quot;Add new user&quot;)\n</code></pre>\n<p>This will correctly work as a SPA. If you leave out <code>config: m.route</code>, the app will still work, but the page will reload every time the link is followed.</p>\n<p>Note: if you are planning to manually route, ie: use <code>m.route</code>, be sure to use the name of the route, not a URL. Ie: if you have a route &quot;/account&quot;, using <code>m.route(&quot;http://p1.io/account&quot;)</code> won&#39;t match, mithril is expecting <code>m.route(&quot;/account&quot;)</code> instead of the full URL.</p>\n<h2><a name=\"data-models\" class=\"anchor\" href=\"#data-models\"><span class=\"header-link\">Data models</span></a></h2><p>Data models are progressively enhanced mithril models - you simply create your model as usual, then add validation and type information as it becomes pertinent.\nFor example, say you have a model like so:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n    return this;\n}\n</code></pre>\n<p>In order to make it validatable, add the validator module:</p>\n<pre><code class=\"lang-javascript\">var validate = require(&#39;validator.modelbinder&#39;);\n</code></pre>\n<p>Then add a <code>isValid</code> validation method to your model, with any declarations based on <a href=\"/doc/validator.js#validators.md\">node validator</a>:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n\n    //    Validate the model        \n    this.isValid = validate.bind(this, {\n        name: {\n            isRequired: &quot;You must enter a name&quot;\n        },\n        email: {\n            isRequired: &quot;You must enter an email address&quot;,\n            isEmail: &quot;Must be a valid email address&quot;\n        }\n    });\n\n    return this;\n};\n</code></pre>\n<p>This creates a method that the miso database api can use to validate your model.\nYou get full access to the validation info as well, so you can show an error message near your field, for example:</p>\n<pre><code class=\"lang-javascript\">user.isValid(&#39;email&#39;)\n</code></pre>\n<p>Will return <code>true</code> if the <code>email</code> property of your user model is valid, or a list of errors messages if it is invalid:</p>\n<pre><code class=\"lang-javascript\">[&quot;You must enter an email address&quot;, &quot;Must be a valid email address&quot;]\n</code></pre>\n<p>So you can for example add a class name to a div surrounding your field like so:</p>\n<pre><code class=\"lang-javascript\">DIV({class: (ctrl.user.isValid(&#39;email&#39;) == true? &quot;valid&quot;: &quot;invalid&quot;)}, [...\n</code></pre>\n<p>And show the error messages like so:</p>\n<pre><code class=\"lang-javascript\">SPAN(ctrl.user.isValid(&#39;email&#39;) == true? &quot;&quot;: ctrl.user.isValid(&#39;email&#39;).join(&quot;, &quot;))\n</code></pre>\n<h2><a name=\"database-api-and-model-interaction\" class=\"anchor\" href=\"#database-api-and-model-interaction\"><span class=\"header-link\">Database api and model interaction</span></a></h2><p>Miso uses the model definitions that you declare in your <code>mvc</code> file to build up a set of models that the API can use, the model definitions work like this:</p>\n<ul>\n<li>On the models attribute of the mvc, we  define a standard mithril data model, (ie: a javascript object where properties can be either standard javascript data types, or a function that works as a getter/setter, eg: <code>m.prop</code>)</li>\n<li>On server startup, miso reads this and creates a cache of the model objects, including the name space of the model, eg: &quot;hello.edit.hello&quot;</li>\n<li>Models can optionally include data validation information, and the database api will get access to this.</li>\n</ul>\n<p>Assuming we have a model in the hello.models object like so:</p>\n<pre><code class=\"lang-javascript\">hello: function(data){\n    this.who = m.prop(data.who);\n    this.isValid = validate.bind(this, {\n        who: {\n            isRequired: &quot;You must know who you are talking to&quot;\n        }\n    });\n}\n</code></pre>\n<p>The API works like this:</p>\n<ul>\n<li>We create an endpoint at <code>/api</code> where each we load whatever api is configured in <code>/cfg/server.json</code>, and expose each method. For example <code>/api/save</code> is available for the default <code>flatfiledb</code> api.</li>\n<li>Next we create a set of API files - one for client, (/system/api.client.js), and one for server (/system/api.server.js) - each have the same methods, but do vastly different things:<ul>\n<li>api.client.js is a thin wrapper that uses mithril&#39;s m.request to create an ajax request to the server API, it simply passes messages back and forth (in JSON RPC 2.0 format).</li>\n<li>api.server.js calls the database api methods, which in turn handles models and validation so for example when a request is made and a <code>type</code> and <code>model</code> is included, we can re-construct the data model based on this info, for example you might send: {type: &#39;hello.edit.hello&#39;, model: {who: &#39;Dave&#39;}}, this can then be cast back into a model that we can call the <code>isValid</code> method on.</li>\n</ul>\n</li>\n</ul>\n<p><strong>Now, the important bit:</strong> The reason for all this functionality is that mithril internally delays rendering to the DOM whilst a request is going on, so we need to handle this within miso - in order to be able to render things on the server - so we have a binding system that delays rendering whilst an async request is still being executed. That means mithril-like code like this:</p>\n<pre><code class=\"lang-javascript\">controller: function(){\n    var ctrl = this;\n    api.find({type: &#39;hello.index.hello&#39;}).then(function(data) {\n        var list = Object.keys(data.result).map(function(key) {\n            var myHello = data.result[key];\n            return new self.models.hello(myHello);\n        });\n        ctrl.model = new ctrl.vm.todoList(list);\n    });\n    return ctrl;\n}\n</code></pre>\n<p>Will still work. Note: the magic here is that there is absolutely nothing in the code above that runs a callback to let mithril know the data is ready - this is a design feature of mithril to delay rendering automatically whilst an <code>m.request</code> is in progress, so we cater for this to have the ability to render the page server-side first, so that SEO works out of the box.</p>\n<h2><a name=\"client-vs-server-code\" class=\"anchor\" href=\"#client-vs-server-code\"><span class=\"header-link\">Client vs server code</span></a></h2><p>In miso, you include files using the standard nodejs <code>require</code> function. When you need to do something that works differently in the client than the server, there are a few ways you can achieve it:</p>\n<ul>\n<li>The recommended way is to create and require a file in the <code>modules/</code> directory, and then create the same file with a &quot;.client&quot; before the extension, and miso will automatically load that file for you on the client side instead. For example if you have <code>/modules/something.js</code>, if you create <code>/modules/something.client.js</code>, miso will automatically use that on the client.</li>\n<li>Another option is to use <code>miso.util</code> - you can use <code>miso.util.isServer()</code> to test if you&#39;re on the server or not, though it is better practice to use the &quot;.client&quot; method mentioned above - only use <code>isServer</code> if you absolutely have no other option.</li>\n</ul>\n<h2><a name=\"first-page-load\" class=\"anchor\" href=\"#first-page-load\"><span class=\"header-link\">First page load</span></a></h2><p>When a new user enters your site via a URL, and miso loads the first page, a number of things happen:</p>\n<ul>\n<li>The server generates the page, including any data the user might have access to. This is mainly for SEO purposes, but also to make the perceptible loading time less, plus provide beautiful urls out of the box. </li>\n<li>Once the page has loaded, mithril kicks in and creates a XHR (ajax) request to retreive the data, and setup any events and the virtual DOM, etc.</li>\n</ul>\n<p>Now you might be thinking: we don&#39;t really need that 2nd request for data - it&#39;s already in the page, right? Well, sort of - you see miso does not make any assumptions about the structure of your data, or how you want to use it in your models, so there is no way for us to re-use that data, as it could be any structure.\nAnother key feature of miso is the fact that all actions can be bookmarkable - for example the <a href=\"/doc/users.md\">/users</a> app - click on a user, and see the url change - we didn&#39;t do another server round-trip, but rather just a XHR request that returned the data we required - the UI was completely rendered client side - so it&#39;s really on that first time we load the page that you end up loading the data twice.</p>\n<p>So that is the reason the architecture works the way it does, and has that seemingly redundant 2nd request for the data - it is a small price to pay for SEO, and perceptibly quick loading pages and as mentioned, it only ever happens on the first page load.</p>\n<p>Of course you could implement caching of the data yourself, if the 2nd request is an issue - after all you might be loading quite a bit of data. One way to do this would be like so (warning: rather contrived example follows):</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../modules/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            who = miso.getParam(&#39;hello_id&#39;, params);\n\n        //    Check if our data is available, if so: use it.\n        if(typeof myPerson !== &quot;undefined&quot;) {\n            ctrl.model = new edit.models.hello({who: myPerson});\n        } else {\n        //    If not, load it first.\n            db.find({type: &#39;user.edit.user&#39;}).then(function(data) {\n                ctrl.model = new edit.models.hello({who: data.result[0].name});\n            });\n        }\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                //    Add a client side global variable with our data\n                SCRIPT(&quot;var myPerson = &#39;&quot; + ctrl.model.who() + &quot;&#39;&quot;),\n                DIV(&quot;G&#39;day &quot; + ctrl.model.who())\n            ]\n        }\n    }\n};\n</code></pre>\n<p>So this will only load the data on the server side - as you can see, we need to know the shape of the data to use it, and we are using a global variable here to store the data client side - I don&#39;t really recommend this approach, as it seems like a lot of work to save a single XHR request. However I understand you might have unique circumstances where the first data load could be a problem, so at least this is an option you can use to cache the data on first page load.</p>\n<h2><a name=\"requiring-files\" class=\"anchor\" href=\"#requiring-files\"><span class=\"header-link\">Requiring files</span></a></h2><p>When requiring files, be sure to do so in a static manner so that browserify is able to compile the client side script. Always use:</p>\n<pre><code class=\"lang-javascript\">var miso = require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>NEVER DO ANY OF THESE:</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar miso = new require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>This will create an object, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar thing = &#39;miso&#39;;\nvar miso = require(&#39;../server/&#39;+thing+&#39;.util.js&#39;);\n</code></pre>\n<p>This will create an expression, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n","Patterns.md":"<p>There are several ways you can write your app and miso is not opinionated about how you go about this so it is important that you choose a pattern that suits your needs. Below are a few suggested patterns to follow when developing apps.</p>\n<p><strong>Note:</strong> miso is a single page app that loads server rendered HTML from any URL, so that SEO works out of the box.</p>\n<h2><a name=\"single-url-mvc\" class=\"anchor\" href=\"#single-url-mvc\"><span class=\"header-link\">Single url mvc</span></a></h2><p>In this pattern everything that your mvc needs to do is done on a single url for all the associated actions. The advantage for this style of development is that you have everything in one mvc container, and you don&#39;t need to map any routes - of course the downside being that there are no routes for the user to bookmark. This is pattern works well for smaller entities where there are not too many interactions that the user can do - this is essentially how most mithril apps are written - self-contained, and at a single url.</p>\n<p>Here is a &quot;hello world&quot; example using the single url pattern</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new self.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>This would expose a url /hellos (note: the &#39;s&#39;), and would display &quot;Hello world&quot;. (You can change the route using custom routing)</p>\n<h2><a name=\"multi-url-mvc\" class=\"anchor\" href=\"#multi-url-mvc\"><span class=\"header-link\">Multi url mvc</span></a></h2><p>In this pattern we expose multiple mvc routes that in turn translate to multiple URLs. This is useful for splitting up your app, and ensuring each mvc has its own sets of concerns.</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar index = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new index.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who()),\n                A({href: &quot;/hello/Leo&quot;, config: m.route}, &quot;Click me for the edit action&quot;)\n            ];\n        }\n    }\n};\n\nvar edit = module.exports.edit = {\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new index.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>Here we also expose a &quot;/hello/[NAME]&quot; url, that will show your name when you visit /hello/[YOUR NAME], so there are now multiple urls for our SPA:</p>\n<ul>\n<li><strong>/hellos</strong> - this is intended to be an index page that lists all your &quot;hellos&quot;</li>\n<li><strong>/hello/[NAME]</strong> - this is intended to be an edit page where you can edit your &quot;hellos&quot;</li>\n</ul>\n<p>Note that the anchor tag has <code>config: m.route</code> in it&#39;s options - this is so that we can route automatically though mithril</p>\n"}; };
},{}],17:[function(require,module,exports){
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
'find': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/find',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'save': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/save',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'remove': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/remove',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'authenticate': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/authenticate',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'login': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/login',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'logout': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/logout',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'findUsers': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/findUsers',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'saveUser': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/authentication/saveUser',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
}
	};
};
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
'find': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/flatfiledb/find',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'save': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/flatfiledb/save',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'remove': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/flatfiledb/remove',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'authenticate': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/flatfiledb/authenticate',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
}
	};
};
},{}],19:[function(require,module,exports){
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
'get': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/session/get',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
},
'set': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: '/api/session/set',
			data: args
		},
		rootNode = document.documentElement || document.body;
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	rootNode.className += ' loading';
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		rootNode.className = rootNode.className.split(' loading').join('');
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background){
			m.redraw(true);
		}
	});
	return myDeferred.promise;
}
	};
};
},{}],20:[function(require,module,exports){
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */var m = require('mithril');var sugartags = require('mithril.sugartags')(m);var bindings = require('mithril.bindings')(m);var animate = require('../public/js/mithril.animate.js')(m);var permissions = require('../system/miso.permissions.js');var layout = require('../mvc/layout_plain.js');var restrict = function(route, actionName){	return route;},permissionObj = {};var misoGlobal = misoGlobal || {};var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var doc = require('../mvc/doc.js');

var hello = require('../mvc/hello.js');
var login = require('../mvc/login.js');
var todo = require('../mvc/todo.js');

if(typeof window !== 'undefined') {	window.m = m;}	m.route.mode = 'pathname';m.route(document.getElementById('misoAttachmentNode'), '/', {'/users/new': restrict(user.new, 'user.new'),
'/': restrict(home.index, 'home.index'),
'/doc/:doc_id': restrict(doc.edit, 'doc.edit'),
'/docs': restrict(doc.index, 'doc.index'),
'/hello/:hello_id': restrict(hello.edit, 'hello.edit'),
'/login': restrict(login.index, 'login.index'),
'/todos': restrict(todo.index, 'todo.index'),
'/user/:user_id': restrict(user.edit, 'user.edit'),
'/users': restrict(user.index, 'user.index')});misoGlobal.renderHeader = function(obj){	var headerNode = document.getElementById('misoHeaderNode');	if(headerNode){		m.render(document.getElementById('misoHeaderNode'), layout.headerContent? layout.headerContent({misoGlobal: obj || misoGlobal}): '');	}};misoGlobal.renderHeader();
},{"../mvc/doc.js":2,"../mvc/hello.js":3,"../mvc/home.js":4,"../mvc/layout_plain.js":5,"../mvc/login.js":6,"../mvc/todo.js":7,"../mvc/user.js":8,"../public/js/mithril.animate.js":14,"../system/miso.permissions.js":21,"mithril":11,"mithril.bindings":9,"mithril.sugartags":10}],21:[function(require,module,exports){
/*	miso permissions
	Permit users access to controller actions based on roles 
*/
var miso = require("../modules/miso.util.client.js"),
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

//	Determine if the user has access to an APP action
//	TODO: 
module.exports.app = function(permissions, actionName, userRoles){
	//	TODO: Probably need to use pass=false by default, but first:
	//
	//	* Add global config for pass default in server.json
	//	* 
	//
	var pass = true;

	//	Apply deny first, then allow.
	if(permissions && userRoles){
		if(permissions.deny) {
			pass = ! hasRole(user.roles, permissions.deny);
		}
		if(permissions.allow) {
			pass = hasRole(user.roles, permissions.allow);
		}
	}

	return pass;
};


//	Determine if the user has access to an API action
//	TODO: 
module.exports.api = function(permissions, actionName, userRoles){
	//	TODO: Probably need to use pass=false by default, but first:
	//
	//	* Add global config for pass default in server.json
	//	* 
	//
	var pass = true;

	//	Apply deny first, then allow.
	if(permissions && userRoles){
		if(permissions.deny) {
			pass = ! hasRole(user.roles, permissions.deny);
		}
		if(permissions.allow) {
			pass = hasRole(user.roles, permissions.allow);
		}
	}

	return pass;
};
},{"../modules/miso.util.client.js":1}]},{},[20])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL21pc28udXRpbC5jbGllbnQuanMiLCJtdmMvZG9jLmpzIiwibXZjL2hlbGxvLmpzIiwibXZjL2hvbWUuanMiLCJtdmMvbGF5b3V0X3BsYWluLmpzIiwibXZjL2xvZ2luLmpzIiwibXZjL3RvZG8uanMiLCJtdmMvdXNlci5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsLmJpbmRpbmdzL2Rpc3QvbWl0aHJpbC5iaW5kaW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsLnN1Z2FydGFncy9taXRocmlsLnN1Z2FydGFncy5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCJub2RlX21vZHVsZXMvdmFsaWRhdG9yLm1vZGVsYmluZGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3ZhbGlkYXRvci92YWxpZGF0b3IuanMiLCJwdWJsaWMvanMvbWl0aHJpbC5hbmltYXRlLmpzIiwicHVibGljL2pzL21pdGhyaWwuc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL21pc28uZG9jdW1lbnRhdGlvbi5qcyIsInN5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qcyIsInN5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuY2xpZW50LmpzIiwic3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5jbGllbnQuanMiLCJzeXN0ZW0vbWFpbi5qcyIsInN5c3RlbS9taXNvLnBlcm1pc3Npb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNya0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cdFZhcmlvdXMgdXRpbGl0aWVzIHRoYXQgbm9ybWFsaXNlIHVzYWdlIGJldHdlZW4gY2xpZW50IGFuZCBzZXJ2ZXJcbi8vXHRUaGlzIGlzIHRoZSBjbGllbnQgdmVyc2lvbiAtIHNlZSBtaXNvLnV0aWwuanMgZm9yIHNlcnZlciB2ZXJzaW9uXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdC8vXHRBcmUgd2Ugb24gdGhlIHNlcnZlcj9cblx0aXNTZXJ2ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0XG5cdC8vXHRFYWNoIGFic3RyYWN0aW9uXG5cdC8vXHRcblx0Ly9cdG1pc28uZWFjaChbJ2hlbGxvJywgJ3dvcmxkJ10sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuXHQvL1x0XHRjb25zb2xlLmxvZyh2YWx1ZSwga2V5KTtcblx0Ly9cdH0pO1xuXHQvL1x0Ly9cdGhlbGxvIDBcXG5oZWxsbyAxXG5cdC8vXG5cdC8vIFx0bWlzby5lYWNoKHsnaGVsbG8nOiAnd29ybGQnfSwgZnVuY3Rpb24odmFsdWUsIGtleSl7XG5cdC8vXHRcdGNvbnNvbGUubG9nKHZhbHVlLCBrZXkpO1xuXHQvL1x0fSk7XG5cdC8vXHQvL1x0d29ybGQgaGVsbG9cblx0Ly9cblx0ZWFjaDogZnVuY3Rpb24ob2JqLCBmbikge1xuXHRcdGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nICkge1xuXHRcdFx0cmV0dXJuIG9iai5tYXAoZm4pO1xuXHRcdH0gZWxzZSBpZih0eXBlb2Ygb2JqID09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXtcblx0XHRcdFx0cmV0dXJuIGZuKG9ialtrZXldLCBrZXkpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmbihvYmopO1xuXHRcdH1cblx0fSxcblxuXHRyZWFkeUJpbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgYmluZGluZ3MgPSBbXTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmluZDogZnVuY3Rpb24oY2IpIHtcblx0XHRcdFx0YmluZGluZ3MucHVzaChjYik7XG5cdFx0XHR9LFxuXHRcdFx0cmVhZHk6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGJpbmRpbmdzW2ldKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdC8vXHRHZXQgcGFyYW1ldGVycyBmb3IgYW4gYWN0aW9uXG5cdGdldFBhcmFtOiBmdW5jdGlvbihrZXksIHBhcmFtcywgZGVmKXtcblx0XHRyZXR1cm4gdHlwZW9mIG0ucm91dGUucGFyYW0oa2V5KSAhPT0gXCJ1bmRlZmluZWRcIj8gbS5yb3V0ZS5wYXJhbShrZXkpOiBkZWY7XG5cdH0sXG5cblx0Ly9cdEdldCBpbmZvIGZvciBhbiBhY3Rpb24gZnJvbSB0aGUgcGFyYW1zXG5cdHJvdXRlSW5mbzogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHQvKlxuXG5cdFx0XHRwYXRoOiByZXEucGF0aCxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblxuXHRcdCovXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdGg6IG0ucm91dGUoKSxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblx0XHR9XG5cdH1cbn07IiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHQvL1x0R3JhYiB0aGUgZ2VuZXJhdGVkIGNsaWVudCB2ZXJzaW9uLi4uXG5cdGRvY3MgPSByZXF1aXJlKCcuLi9wdWJsaWMvbWlzby5kb2N1bWVudGF0aW9uLmpzJyk7XG5cbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHQvL1x0T3VyIG1vZGVsXG5cdFx0ZG9jczogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLmRvY3MgPSBkYXRhLmRvY3M7XG5cdFx0XHR0aGlzLmlkID0gZGF0YS5pZDtcblx0XHRcdHRoaXMubmljZU5hbWUgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRcdFx0cmV0dXJuIG5hbWUuc3Vic3RyKDAsbmFtZS5sYXN0SW5kZXhPZihcIi5tZFwiKSkuc3BsaXQoXCItXCIpLmpvaW4oXCIgXCIpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmRvY3Moe1xuXHRcdFx0ZG9jczogZG9jcygpXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdERJVihcIkJlbG93IGlzIGEgbGlzdCBvZiBkb2N1bWVudGF0aW9uIGZvciBtaXNvOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdG1pc28uZWFjaChtb2RlbC5kb2NzLCBmdW5jdGlvbihkb2MsIGtleSl7XG5cdFx0XHRcdFx0XHQvL1x0U2tpcCBob21lIHBhZ2UuLi5cblx0XHRcdFx0XHRcdGlmKGtleSAhPT0gXCJIb21lLm1kXCIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIExJKFxuXHRcdFx0XHRcdFx0XHRcdEEoe2hyZWY6IFwiL2RvYy9cIiArIGtleSwgY29uZmlnOiBtLnJvdXRlfSwgbW9kZWwubmljZU5hbWUoa2V5KSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihcIkV4YW1wbGVzOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdExJKEEoe2hyZWY6IFwiL3RvZG9zXCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiVG9kb3MgZXhhbXBsZVwiKSksXG5cdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvdXNlcnNcIiwgY29uZmlnOiBtLnJvdXRlfSwgXCJVc2VycyBleGFtcGxlXCIpKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Ly9cdFVzZSBtYW51YWwgcHJpc20sIHNvIHRoYXQgaXQgd29ya3MgaW4gU1BBIG1vZGVcblx0XHRcdFx0U0NSSVBUKHtzcmM6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmpzXCIsIFwiZGF0YS1tYW51YWxcIjogXCJcIn0pXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGRvY19pZCA9IG1pc28uZ2V0UGFyYW0oJ2RvY19pZCcsIHBhcmFtcyk7XG5cdFx0dGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuZG9jcyh7XG5cdFx0XHRkb2NzOiBkb2NzKCksXG5cdFx0XHRpZDogZG9jX2lkXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdExJTksoe2hyZWY6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmNzc1wiLCByZWw6IFwic3R5bGVzaGVldFwifSksXG5cdFx0XHRcdEgxKG1vZGVsLm5pY2VOYW1lKG1vZGVsLmlkKSksXG5cdFx0XHRcdEFSVElDTEUobS50cnVzdChtb2RlbC5kb2NzW21vZGVsLmlkXSkpLFxuXHRcdFx0XHQvL1x0VXNlIG1hbnVhbCBwcmlzbSwgc28gdGhhdCBpdCB3b3JrcyBpbiBTUEEgbW9kZVxuXHRcdFx0XHRTQ1JJUFQoe3NyYzogXCIvZXh0ZXJuYWwvcHJpc20vcHJpc20uanNcIiwgXCJkYXRhLW1hbnVhbFwiOiBcIlwifSksXG5cdFx0XHRcdFNDUklQVChcIlByaXNtLmhpZ2hsaWdodEFsbCgpO1wiKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKTtcblxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xuXHRtb2RlbHM6IHtcblx0XHRoZWxsbzogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgnaGVsbG9faWQnLCBwYXJhbXMpO1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVihcIkcnZGF5IFwiICsgY3RybC5tb2RlbC53aG8oKSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRzbW9vdGhTY3JvbGwgPSByZXF1aXJlKCcuLi9wdWJsaWMvanMvbWl0aHJpbC5zbW9vdGhzY3JvbGwuanMnKTtcblxuLy9cdEhvbWUgcGFnZVxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0aW50cm86IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50ZXh0ID0gbS5wKFwiQ3JlYXRlIGFwcHMgaW4gYSBzbmFwIVwiKTtcblx0XHRcdHRoaXMuYW5pID0gbS5wKDApO1xuXHRcdFx0dGhpcy5kZW1vSW1nU3JjID0gbS5wKFwiaW1nL21pc29kZW1vLmdpZlwiKTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC5yZXBsYXkgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRtcFNyYyA9IGN0cmwubW9kZWwuZGVtb0ltZ1NyYygpO1xuXHRcdFx0Y3RybC5tb2RlbC5kZW1vSW1nU3JjKFwiXCIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRjdHJsLm1vZGVsLmRlbW9JbWdTcmModG1wU3JjKTtcblx0XHRcdH0sMCk7XG5cdFx0fTtcblxuXHRcdGN0cmwubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaW50cm8oKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKXtcblx0XHR2YXIgbyA9IGN0cmwubW9kZWw7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoW1xuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbnRyb1wifSwgW1xuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImludHJvVGV4dFwifSwgby50ZXh0KCkpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImRlbW9JbWdcIn0sIFtcblx0XHRcdFx0XHRcdElNRyh7aWQ6IFwiZGVtb0ltZ1wiLCBzcmM6IG8uZGVtb0ltZ1NyYygpfSksXG5cdFx0XHRcdFx0XHRTUEFOKHtcImNsYXNzXCI6IFwicmVwbGF5QnV0dG9uXCIsIG9uY2xpY2s6IGN0cmwucmVwbGF5fSwgXCJSZXBsYXlcIilcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiaW5zdGFsbEJ1dHRvblwiLCBjb25maWc6IHNtb290aFNjcm9sbChjdHJsKSwgaHJlZjogXCIjaW5zdGFsbGF0aW9uXCJ9LCBcIkluc3RhbGwgbWlzbyBub3dcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcIndoYXRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJXaGF0IGlzIG1pc28/XCIpICksXG5cdFx0XHRcdFx0UChcIk1pc28gaXMgYW4gb3BlbiBzb3VyY2UgaXNvbW9ycGhpYyBqYXZhc2NyaXB0IGZyYW1ld29yayB0aGF0IGFsbG93cyB5b3UgdG8gd3JpdGUgY29tcGxldGUgYXBwcyB3aXRoIG11Y2ggbGVzcyBlZmZvcnQgdGhhbiBvdGhlciBmcmFtZXdvcmtzLiBNaXNvIGZlYXR1cmVzOlwiLFtcblx0XHRcdFx0XHRcdFVMKHtcImNsYXNzXCI6IFwiZG90TGlzdFwifSwgW1xuXHRcdFx0XHRcdFx0XHRMSShcIlNpbmdsZSBwYWdlIGFwcHMgd2l0aCBzZXJ2ZXJzaWRlIHJlbmRlcmVkIEhUTUwgZm9yIHRoZSBmaXJzdCBwYWdlIC0gd29ya3MgcGVyZmVjdGx5IHdpdGggU0VPIGFuZCBvbGRlciBicm93c2Vyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJCZWF1dGlmdWwgVVJMcyAtIHdpdGggYSBmbGV4aWJsZSByb3V0aW5nIHN5c3RlbTogYXV0b21hdGUgc29tZSByb3V0ZXMsIHRha2UgZnVsbCBjb250cm9sIG9mIG90aGVyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJUaW55IGNsaWVudHNpZGUgZm9vdHByaW50IC0gbGVzcyB0aGFuIDI1a2IgKGd6aXBwZWQgYW5kIG1pbmlmaWVkKVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJGYXN0IGxpdmUtY29kZSByZWxvYWQgLSBzbWFydGVyIHJlbG9hZCB0byBoZWxwIHlvdSB3b3JrIGZhc3RlclwiKSxcblx0XHRcdFx0XHRcdFx0TEkoW1wiSGlnaCBwZXJmb3JtYW5jZSAtIHZpcnR1YWwgZG9tIGVuZ2luZSwgdGlueSBmb290cHJpbnQsIGZhc3RlciB0aGFuIHRoZSByZXN0XCIsIEEoe2hyZWY6IFwiaHR0cDovL2xob3JpZS5naXRodWIuaW8vbWl0aHJpbC9iZW5jaG1hcmtzLmh0bWxcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCIqXCIpXSksXG5cdFx0XHRcdFx0XHRcdExJKFwiTXVjaCBsZXNzIGNvZGUgLSBjcmVhdGUgYSBkZXBsb3lhYmxlIGFwcCBpbiBsZXNzIHRoYW4gMzAgbGluZXMgb2YgY29kZVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJPcGVuIHNvdXJjZSAtIE1JVCBsaWNlbnNlZFwiKVxuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRQKFwiTWlzbyB1dGlsaXNlcyBleGNlbGxlbnQgb3BlbiBzb3VyY2UgbGlicmFyaWVzIGFuZCBmcmFtZXdvcmtzIHRvIGNyZWF0ZSBhbiBleHRyZW1lbHkgZWZmaWNpZW50IGZ1bGwgd2ViIHN0YWNrLiBUaGVzZSBmcmFtZXdvcmtzIGluY2x1ZGU6XCIpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZyYW1ld29ya3NcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZ3Y29udGFpbmVyIGNmXCJ9LFtcblx0XHRcdFx0XHRcdFx0QSh7XCJjbGFzc1wiOiBcImZ3TGlua1wiLCBocmVmOiBcImh0dHA6Ly9saG9yaWUuZ2l0aHViLmlvL21pdGhyaWwvXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sXG5cdFx0XHRcdFx0XHRcdFNQQU4oe1wiY2xhc3NcIjogXCJmdyBtaXRocmlsXCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vZXhwcmVzc2pzLmNvbS9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgZXhwcmVzc1wifSkpLFxuXHRcdFx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiZndMaW5rXCIsIGhyZWY6IFwiaHR0cDovL2Jyb3dzZXJpZnkub3JnL1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LFNQQU4oe1wiY2xhc3NcIjogXCJmdyBicm93c2VyaWZ5XCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vbm9kZW1vbi5pby9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgbm9kZW1vblwifSkpXG5cdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImN3XCJ9LCBbXG5cdFx0XHRcdFx0SDIoe2lkOiBcImluc3RhbGxhdGlvblwifSwgQSh7bmFtZTogXCJpbnN0YWxsYXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJJbnN0YWxsYXRpb25cIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gaW5zdGFsbCBtaXNvLCB1c2UgbnBtOlwiKSxcblx0XHRcdFx0XHRQUkUoe1wiY2xhc3NcIjogXCJqYXZhc2NyaXB0XCJ9LFtcblx0XHRcdFx0XHRcdENPREUoXCJucG0gaW5zdGFsbCBtaXNvanMgLWdcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJjd1wifSwgW1xuXHRcdFx0XHRcdEgyKEEoe25hbWU6IFwiZ2V0dGluZ3N0YXJ0ZWRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJHZXR0aW5nIHN0YXJ0ZWRcIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gY3JlYXRlIGFuZCBydW4gYSBtaXNvIGFwcCBpbiBhIG5ldyBkaXJlY3Rvcnk6XCIpLFxuXHRcdFx0XHRcdFBSRSh7XCJjbGFzc1wiOiBcImphdmFzY3JpcHRcIn0sW1xuXHRcdFx0XHRcdFx0Q09ERShcIm1pc28gLW4gbXlBcHBcXG5jZCBteUFwcFxcbm1pc28gcnVuXCIpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0UChcIkNvbmdyYXR1bGF0aW9ucywgeW91IGFyZSBub3cgcnVubmluZyB5b3VyIHZlcnkgb3duIG1pc28gYXBwIGluIHRoZSAnbXlBcHAnIGRpcmVjdG9yeSFcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcImV4YW1wbGVzXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiRXhhbXBsZXNcIikpLFxuXHRcdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRcdExJKEEoeyBocmVmOiAnL3RvZG9zJywgY29uZmlnOiBtLnJvdXRlfSwgXCJUb2RvcyBleGFtcGxlIChzaW5nbGUgdXJsIFNQQSlcIikpLFxuXHRcdFx0XHRcdFx0TEkoQSh7IGhyZWY6ICcvdXNlcnMnLCBjb25maWc6IG0ucm91dGV9LCBcIlVzZXJzIGV4YW1wbGUgKG11bHRpcGxlIHVybCBTUEEpXCIpKVxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdEgyKHtuYW1lOiBcImRvY3VtZW50YXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sIFwiRG9jdW1lbnRhdGlvblwiKSxcblx0XHRcdFx0XHRBKHtocmVmOlwiL2RvY3NcIn0sIFwiRG9jdW1lbnRhdGlvbiBjYW4gYmUgZm91bmQgaGVyZVwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuIiwiLypcdE1pc28gY3VzdG9tIGxheW91dCBwYWdlXG5cdEV4YW1wbGUgY3VzdG9tIGxheW91dCBwYWdlIC0gaXQgcmVtb3ZlcyBtb3N0IGNvbXBvbmVudHNcbiovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YXV0aGVudGljYXRpb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG4vL1x0VGhlIGZ1bGwgbGF5b3V0IC0gYWx3YXlzIG9ubHkgcmVuZGVyZWQgc2VydmVyIHNpZGVcbm1vZHVsZS5leHBvcnRzLnZpZXcgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0bS50cnVzdChcIjwhZG9jdHlwZSBodG1sPlwiKSxcblx0XHRcdEhUTUwoW1xuXHRcdFx0XHRIRUFEKFtcblx0XHRcdFx0XHRUSVRMRShcIk1pc28gYXBwXCIpLFxuXHRcdFx0XHRcdExJTksoe2hyZWY6ICcvY3NzL3N0eWxlLmNzcycsIHJlbDonc3R5bGVzaGVldCd9KVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Qk9EWShbXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IGN0cmwubWlzb0F0dGFjaG1lbnROb2RlfSwgY3RybC5jb250ZW50KSxcblx0XHRcdFx0XHRTQ1JJUFQoe3NyYzogJy9taXNvLmpzJ30pLFxuXHRcdFx0XHRcdChjdHJsLnJlbG9hZD8gU0NSSVBUKHtzcmM6ICcvcmVsb2FkLmpzJ30pOiBcIlwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSlcblx0XHRdO1xuXHR9XG59OyIsIi8qIEV4YW1wbGUgbG9naW4gbXZjICovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bWlzbyA9IHJlcXVpcmUoXCIuLi9tb2R1bGVzL21pc28udXRpbC5jbGllbnQuanNcIiksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGF1dGhlbnRpY2F0aW9uID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qc1wiKShtKSxcblx0c2Vzc2lvbiA9IHJlcXVpcmUoXCIuLi9zeXN0ZW0vYXBpL3Nlc3Npb24vYXBpLmNsaWVudC5qc1wiKShtKTtcblxudmFyIGluZGV4ID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XG5cdG1vZGVsczoge1xuXHRcdGxvZ2luOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdHRoaXMudXJsID0gZGF0YS51cmw7XG5cdFx0XHR0aGlzLmlzTG9nZ2VkSW4gPSBtLnByb3AoZmFsc2UpO1xuXHRcdFx0dGhpcy51c2VybmFtZSA9IG0ucHJvcChkYXRhLnVzZXJuYW1lfHxcIlwiKTtcblx0XHRcdHRoaXMucGFzc3dvcmQgPSBtLnByb3AoXCJcIik7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXMsXG5cdFx0XHR1cmwgPSBtaXNvLmdldFBhcmFtKCd1cmwnLCBwYXJhbXMpLFxuXHRcdFx0bG9nb3V0ID0gbWlzby5nZXRQYXJhbSgnbG9nb3V0JywgcGFyYW1zKTtcblxuXHRcdGN0cmwubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmxvZ2luKHt1cmw6IHVybH0pO1xuXG5cdFx0Ly9cdE5vdGU6IHRoaXMgZG9lcyBub3QgZXhlY3V0ZSBvbiB0aGUgc2VydmVyIGFzIGl0IFxuXHRcdC8vXHRpcyBhIERPTSBldmVudC5cblx0XHRjdHJsLmxvZ2luID0gZnVuY3Rpb24oZSl7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHQvL1x0Q2FsbCB0aGUgc2VydmVyIG1ldGhvZCB0byBzZWUgaWYgd2UncmUgbG9nZ2VkIGluXG5cdFx0XHRhdXRoZW50aWNhdGlvbi5sb2dpbih7dHlwZTogJ2xvZ2luLmluZGV4LmxvZ2luJywgbW9kZWw6IGN0cmwubW9kZWx9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRpZihkYXRhLnJlc3VsdC5pc0xvZ2dlZEluID09IHRydWUpIHtcblx0XHRcdFx0XHQvL1x0V29vdCwgd2UncmUgaW4hXG5cdFx0XHRcdFx0bWlzb0dsb2JhbC5pc0xvZ2dlZEluID0gdHJ1ZTtcblx0XHRcdFx0XHRtaXNvR2xvYmFsLnVzZXJOYW1lID0gZGF0YS5yZXN1bHQudXNlck5hbWU7XG5cdFx0XHRcdFx0Y3RybC5tb2RlbC5pc0xvZ2dlZEluKHRydWUpO1xuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJXZWxjb21lIFwiICsgbWlzb0dsb2JhbC51c2VyTmFtZSArIFwiLCB5b3UndmUgYmVlbiBsb2dnZWQgaW5cIik7XG5cblx0XHRcdFx0XHQvL1x0V2lsbCBzaG93IHRoZSB1c2VybmFtZSB3aGVuIGxvZ2dlZCBpblxuXHRcdFx0XHRcdG1pc29HbG9iYWwucmVuZGVySGVhZGVyKCk7XG5cblx0XHRcdFx0XHRpZih1cmwpe1xuXHRcdFx0XHRcdFx0bS5yb3V0ZSh1cmwpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvL1x0R28gdG8gZGVmYXVsdCBVUkw/XG5cdFx0XHRcdFx0XHRtLnJvdXRlKFwiL1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cblx0XHRpZihsb2dvdXQpIHtcblx0XHRcdGF1dGhlbnRpY2F0aW9uLmxvZ291dCh7fSkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJZb3UndmUgYmVlbiBsb2dnZWQgb3V0XCIpO1xuXHRcdFx0XHQvL1x0V29vdCwgd2UncmUgb3V0IVxuXHRcdFx0XHRjdHJsLm1vZGVsLmlzTG9nZ2VkSW4oZmFsc2UpO1xuXHRcdFx0XHQvLyBtaXNvR2xvYmFsLmlzTG9nZ2VkSW4gPSBmYWxzZTtcblx0XHRcdFx0Ly8gZGVsZXRlIG1pc29HbG9iYWwudXNlck5hbWU7XG5cdFx0XHRcdC8vXHRXaWxsIHJlbW92ZSB0aGUgdXNlcm5hbWUgd2hlbiBsb2dnZWQgb3V0XG5cdFx0XHRcdG1pc29HbG9iYWwucmVuZGVySGVhZGVyKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY3RybDtcblx0fSxcblx0dmlldzogZnVuY3Rpb24oY3RybCkge1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiY3cgY2ZcIn0sIFxuXHRcdFx0XHRjdHJsLm1vZGVsLmlzTG9nZ2VkSW4oKT8gXCJZb3UndmUgYmVlbiBsb2dnZWQgaW5cIjogW1xuXHRcdFx0XHRESVYoY3RybC5tb2RlbC51cmw/IFwiUGxlYXNlIGxvZyBpbiB0byBnbyB0byBcIiArIGN0cmwubW9kZWwudXJsOiBcIlBsZWFzZSBsb2cgaW5cIiksXG5cdFx0XHRcdEZPUk0oeyBvbnN1Ym1pdDogY3RybC5sb2dpbiB9LCBbXG5cdFx0XHRcdFx0SU5QVVQoeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGN0cmwubW9kZWwudXNlcm5hbWUsIHBsYWNlaG9sZGVyOiBcIlVzZXJuYW1lXCJ9KSxcblx0XHRcdFx0XHRJTlBVVCh7IHR5cGU6IFwicGFzc3dvcmRcIiwgdmFsdWU6IGN0cmwubW9kZWwucGFzc3dvcmR9KSxcblx0XHRcdFx0XHRCVVRUT04oeyB0eXBlOiBcInN1Ym1pdFwifSwgXCJMb2dpblwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9LFxuXHRhdXRoZW50aWNhdGU6IGZhbHNlXG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRkYiA9IHJlcXVpcmUoXCIuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLmNsaWVudC5qc1wiKShtKTtcblxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0dG9kbzogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLnRleHQgPSBkYXRhLnRleHQ7XG5cdFx0XHR0aGlzLmRvbmUgPSBtLnByb3AoZGF0YS5kb25lID09IFwiZmFsc2VcIj8gZmFsc2U6IGRhdGEuZG9uZSk7XG5cdFx0XHR0aGlzLl9pZCA9IGRhdGEuX2lkO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC5saXN0ID0gW107XG5cblx0XHRkYi5maW5kKHt0eXBlOiAndG9kby5pbmRleC50b2RvJ30sIHtiYWNrZ3JvdW5kOiB0cnVlLCBpbml0aWFsVmFsdWU6IFtdfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8oZGF0YS5yZXN1bHRba2V5XSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0dmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xuXHRcdFx0aWYodmFsdWUpIHtcblx0XHRcdFx0dmFyIG5ld1RvZG8gPSBuZXcgc2VsZi5tb2RlbHMudG9kbyh7XG5cdFx0XHRcdFx0dGV4dDogY3RybC52bS5pbnB1dCgpLFxuXHRcdFx0XHRcdGRvbmU6IGZhbHNlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcblx0XHRcdFx0Y3RybC52bS5pbnB1dChcIlwiKTtcblx0XHRcdFx0ZGIuc2F2ZSh7IHR5cGU6ICd0b2RvLmluZGV4LnRvZG8nLCBtb2RlbDogbmV3VG9kbyB9ICkudGhlbihmdW5jdGlvbihyZXMpe1xuXHRcdFx0XHRcdG5ld1RvZG8uX2lkID0gcmVzLnJlc3VsdDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblxuXHRcdGN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgbGlzdCA9IFtdO1xuXHRcdFx0Y3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XG5cdFx0XHRcdGlmKCF0b2RvLmRvbmUoKSkge1xuXHRcdFx0XHRcdGxpc3QucHVzaCh0b2RvKTsgXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZGIucmVtb3ZlKHsgdHlwZTogJ3RvZG8uaW5kZXgudG9kbycsIF9pZDogdG9kby5faWQgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5yZXN1bHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGN0cmwubGlzdCA9IGxpc3Q7XG5cdFx0fTtcblxuXHRcdGN0cmwudm0gPSB7XG5cdFx0XHRsZWZ0OiBmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgY291bnQgPSAwO1xuXHRcdFx0XHRjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcblx0XHRcdFx0XHRjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIGNvdW50O1xuXHRcdFx0fSxcblx0XHRcdGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dG9kby5kb25lKCF0b2RvLmRvbmUoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRpbnB1dDogbS5wcm9wKFwiXCIpXG5cdFx0fTtcblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoe1wiY2xhc3NcIjogXCJjdyBjZlwifSwgW1xuXHRcdFx0XHRTVFlMRShcIi5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO31cIiksXG5cdFx0XHRcdEgxKFwiVG9kb3MgLSBcIiArIGN0cmwudm0ubGVmdCgpICsgXCIgb2YgXCIgKyBjdHJsLmxpc3QubGVuZ3RoICsgXCIgcmVtYWluaW5nXCIpLFxuXHRcdFx0XHRCVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgXCJBcmNoaXZlXCIpLFxuXHRcdFx0XHRVTChbXG5cdFx0XHRcdFx0Y3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcblx0XHRcdFx0XHRcdHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gXCJkb25lXCI6IFwiXCIsIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRGT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXG5cdFx0XHRcdFx0SU5QVVQoeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiBcIkFkZCB0b2RvXCJ9KSxcblx0XHRcdFx0XHRCVVRUT04oeyB0eXBlOiBcInN1Ym1pdFwifSwgXCJBZGRcIilcblx0XHRcdFx0XSlcblx0XHRcdF0pO1xuXHRcdH1cblx0fVxuXHQvL1x0VGVzdCBhdXRoZW50aWNhdGVcblx0Ly8sYXV0aGVudGljYXRlOiB0cnVlXG59OyIsIi8qXG5cdFRoaXMgaXMgYSBzYW1wbGUgdXNlciBtYW5hZ2VtZW50IGFwcCB0aGF0IHVzZXMgdGhlXG5cdG11bHRpcGxlIHVybCBtaXNvIHBhdHRlcm4uXG4qL1xudmFyIG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHR2YWxpZGF0ZSA9IHJlcXVpcmUoJ3ZhbGlkYXRvci5tb2RlbGJpbmRlcicpLFxuXHRtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRiaW5kaW5ncyA9IHJlcXVpcmUoJ21pdGhyaWwuYmluZGluZ3MnKShtKSxcblx0YXBpID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qc1wiKShtKSxcblx0c2VsZiA9IG1vZHVsZS5leHBvcnRzO1xuXG4vL1x0U2hhcmVkIHZpZXdcbnZhciBlZGl0VmlldyA9IGZ1bmN0aW9uKGN0cmwpe1xuXHR3aXRoKHN1Z2FydGFncykge1xuXHRcdHJldHVybiBESVYoeyBjbGFzczogXCJjd1wiIH0sIFtcblx0XHRcdEgyKHtcImNsYXNzXCI6IFwicGFnZUhlYWRlclwifSwgY3RybC5oZWFkZXIpLFxuXHRcdFx0Y3RybC51c2VyID8gW1xuXHRcdFx0XHRESVYoW1xuXHRcdFx0XHRcdExBQkVMKFwiTmFtZVwiKSwgSU5QVVQoe3ZhbHVlOiBjdHJsLnVzZXIubmFtZX0pLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiAoY3RybC51c2VyLmlzVmFsaWQoJ25hbWUnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwidmFsaWRcIjogXCJpbnZhbGlkXCIpICsgXCIgaW5kZW50ZWRcIn0sIFtcblx0XHRcdFx0XHRcdGN0cmwudXNlci5pc1ZhbGlkKCduYW1lJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcIlwiOiBjdHJsLnVzZXIuaXNWYWxpZCgnbmFtZScpLmpvaW4oXCIsIFwiKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoW1xuXHRcdFx0XHRcdExBQkVMKFwiRW1haWxcIiksIElOUFVUKHt2YWx1ZTogY3RybC51c2VyLmVtYWlsfSksXG5cdFx0XHRcdFx0RElWKHtcImNsYXNzXCI6IChjdHJsLnVzZXIuaXNWYWxpZCgnZW1haWwnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwidmFsaWRcIjogXCJpbnZhbGlkXCIpICsgXCIgaW5kZW50ZWRcIiB9LCBbXG5cdFx0XHRcdFx0XHRjdHJsLnVzZXIuaXNWYWxpZCgnZW1haWwnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwiXCI6IGN0cmwudXNlci5pc1ZhbGlkKCdlbWFpbCcpLmpvaW4oXCIsIFwiKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoW1xuXHRcdFx0XHRcdExBQkVMKFwiUGFzc3dvcmRcIiksIElOUFVUKHt2YWx1ZTogY3RybC51c2VyLnBhc3N3b3JkLCB0eXBlOiAncGFzc3dvcmQnfSksXG5cdFx0XHRcdFx0RElWKHtcImNsYXNzXCI6IChjdHJsLnVzZXIuaXNWYWxpZCgncGFzc3dvcmQnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwidmFsaWRcIjogXCJpbnZhbGlkXCIpICsgXCIgaW5kZW50ZWRcIiB9LCBbXG5cdFx0XHRcdFx0XHRjdHJsLnVzZXIuaXNWYWxpZCgncGFzc3dvcmQnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwiXCI6IGN0cmwudXNlci5pc1ZhbGlkKCdwYXNzd29yZCcpLmpvaW4oXCIsIFwiKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbmRlbnRlZFwifSxbXG5cdFx0XHRcdFx0QlVUVE9OKHtvbmNsaWNrOiBjdHJsLnNhdmUsIGNsYXNzOiBcInBvc2l0aXZlXCJ9LCBcIlNhdmUgdXNlclwiKSxcblx0XHRcdFx0XHRCVVRUT04oe29uY2xpY2s6IGN0cmwucmVtb3ZlLCBjbGFzczogXCJuZWdhdGl2ZVwifSwgXCJEZWxldGUgdXNlclwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XTogRElWKFwiVXNlciBub3QgZm91bmRcIilcblx0XHRdKTtcblx0fVxufTtcblxuXG4vL1x0VXNlciBsaXN0XG5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC52bSA9IHtcblx0XHRcdHVzZXJMaXN0OiBmdW5jdGlvbih1c2Vycyl7XG5cdFx0XHRcdHRoaXMudXNlcnMgPSBtLnAodXNlcnMpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRhcGkuZmluZFVzZXJzKHt0eXBlOiAndXNlci5lZGl0LnVzZXInfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRpZihkYXRhLmVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgXCIgKyBkYXRhLmVycm9yKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoZGF0YS5yZXN1bHQpIHtcblx0XHRcdFx0dmFyIGxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiBuZXcgc2VsZi5lZGl0Lm1vZGVscy51c2VyKGRhdGEucmVzdWx0W2tleV0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjdHJsLnVzZXJzID0gbmV3IGN0cmwudm0udXNlckxpc3QobGlzdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdHJsLnVzZXJzID0gbmV3IGN0cmwudm0udXNlckxpc3QoW10pO1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3InLCBhcmd1bWVudHMpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuXHRcdHZhciBjID0gY3RybCxcblx0XHRcdHUgPSBjLnVzZXJzO1xuXG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoeyBjbGFzczogXCJjd1wiIH0sIFtcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdHUudXNlcnMoKS5tYXAoZnVuY3Rpb24odXNlciwgaWR4KXtcblx0XHRcdFx0XHRcdHJldHVybiBMSShBKHsgaHJlZjogJy91c2VyLycgKyB1c2VyLmlkKCksIGNvbmZpZzogbS5yb3V0ZX0sIHVzZXIubmFtZSgpICsgXCIgLSBcIiArIHVzZXIuZW1haWwoKSkpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRBKHtcImNsYXNzXCI6XCJidXR0b24gcG9zaXRpdmUgbXRvcFwiLCBocmVmOlwiL3VzZXJzL25ld1wiLCBjb25maWc6IG0ucm91dGV9LCBcIkFkZCBuZXcgdXNlclwiKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuXG5cbi8vXHROZXcgdXNlclxubW9kdWxlLmV4cG9ydHMubmV3ID0ge1xuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXM7XG5cdFx0Y3RybC51c2VyID0gbmV3IHNlbGYuZWRpdC5tb2RlbHMudXNlcih7bmFtZTogXCJcIiwgZW1haWw6IFwiXCJ9KTtcblx0XHRjdHJsLmhlYWRlciA9IFwiTmV3IHVzZXJcIjtcblx0XHRjdHJsLnNob3dFcnJvcnMgPSBmYWxzZTtcblxuXHRcdGN0cmwuc2F2ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjdHJsLnVzZXIuaXNWYWxpZCgpICE9PSB0cnVlKSB7XG5cdFx0XHRcdGN0cmwuc2hvd0Vycm9ycyA9IHRydWU7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdVc2VyIGlzIG5vdCB2YWxpZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXBpLnNhdmVVc2VyKHsgdHlwZTogJ3VzZXIuZWRpdC51c2VyJywgbW9kZWw6IGN0cmwudXNlciB9ICkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiQWRkZWQgdXNlclwiLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdG0ucm91dGUoXCIvdXNlcnNcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gY3RybDtcblx0fSxcblx0dmlldzogZWRpdFZpZXdcbn07XG5cblxuLy9cdEVkaXQgdXNlclxubW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0dXNlcjogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLm5hbWUgPSBtLnAoZGF0YS5uYW1lfHxcIlwiKTtcblx0XHRcdHRoaXMuZW1haWwgPSBtLnAoZGF0YS5lbWFpbHx8XCJcIik7XG5cdFx0XHQvL1x0UGFzc3dvcmQgaXMgYWx3YXlzIGVtcHR5IGZpcnN0XG5cdFx0XHR0aGlzLnBhc3N3b3JkID0gbS5wKGRhdGEucGFzc3dvcmR8fFwiXCIpO1xuXHRcdFx0dGhpcy5pZCA9IG0ucChkYXRhLl9pZHx8XCJcIik7XG5cblx0XHRcdC8vXHRWYWxpZGF0ZSB0aGUgbW9kZWxcblx0XHRcdHRoaXMuaXNWYWxpZCA9IHZhbGlkYXRlLmJpbmQodGhpcywge1xuXHRcdFx0XHRuYW1lOiB7XG5cdFx0XHRcdFx0aXNSZXF1aXJlZDogXCJZb3UgbXVzdCBlbnRlciBhIG5hbWVcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXNzd29yZDoge1xuXHRcdFx0XHRcdGlzUmVxdWlyZWQ6IFwiWW91IG11c3QgZW50ZXIgYSBwYXNzd29yZFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0aXNSZXF1aXJlZDogXCJZb3UgbXVzdCBlbnRlciBhbiBlbWFpbCBhZGRyZXNzXCIsXG5cdFx0XHRcdFx0aXNFbWFpbDogXCJNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcyxcblx0XHRcdHVzZXJJZCA9IG1pc28uZ2V0UGFyYW0oJ3VzZXJfaWQnLCBwYXJhbXMpO1xuXG5cdFx0Y3RybC5oZWFkZXIgPSBcIkVkaXQgdXNlciBcIiArIHVzZXJJZDtcblxuXHRcdC8vXHRMb2FkIG91ciB1c2VyXG5cdFx0YXBpLmZpbmRVc2Vycyh7dHlwZTogJ3VzZXIuZWRpdC51c2VyJywgcXVlcnk6IHtfaWQ6IHVzZXJJZH19KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZhciB1c2VyID0gZGF0YS5yZXN1bHQ7XG5cdFx0XHRpZih1c2VyICYmIHVzZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjdHJsLnVzZXIgPSBuZXcgc2VsZi5lZGl0Lm1vZGVscy51c2VyKHVzZXJbMF0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgbm90IGZvdW5kJywgdXNlcklkKTtcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yJywgYXJndW1lbnRzKTtcblx0XHR9KTtcblxuXHRcdGN0cmwuc2F2ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjdHJsLnVzZXIuaXNWYWxpZCgpICE9PSB0cnVlKSB7XG5cdFx0XHRcdGN0cmwuc2hvd0Vycm9ycyA9IHRydWU7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdVc2VyIGlzIG5vdCB2YWxpZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXBpLnNhdmVVc2VyKHsgdHlwZTogJ3VzZXIuZWRpdC51c2VyJywgbW9kZWw6IGN0cmwudXNlciB9ICkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiU2F2ZWQgdXNlclwiLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdG0ucm91dGUoXCIvdXNlcnNcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRjdHJsLnJlbW92ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjb25maXJtKFwiRGVsZXRlIHVzZXI/XCIpKSB7XG5cdFx0XHRcdGFwaS5yZW1vdmUoeyB0eXBlOiAndXNlci5lZGl0LnVzZXInLCBfaWQ6IHVzZXJJZCB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEucmVzdWx0KTtcblx0XHRcdFx0XHRtLnJvdXRlKFwiL3VzZXJzXCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGVkaXRWaWV3XG5cdC8vXHRBbnkgYXV0aGVudGljYXRpb24gaW5mb1xuXHQvLywgYXV0aGVudGljYXRlOiB0cnVlXG59O1xuIiwiLy9cdE1pdGhyaWwgYmluZGluZ3MuXG4vL1x0Q29weXJpZ2h0IChDKSAyMDE0IGpzZ3V5IChNaWtrZWwgQmVyZ21hbm4pXG4vL1x0TUlUIGxpY2Vuc2VkXG4oZnVuY3Rpb24oKXtcbnZhciBtaXRocmlsQmluZGluZ3MgPSBmdW5jdGlvbihtKXtcblx0bS5iaW5kaW5ncyA9IG0uYmluZGluZ3MgfHwge307XG5cblx0Ly9cdFB1Yi9TdWIgYmFzZWQgZXh0ZW5kZWQgcHJvcGVydGllc1xuXHRtLnAgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdHN1YnMgPSBbXSxcblx0XHRcdHByZXZWYWx1ZSxcblx0XHRcdGRlbGF5ID0gZmFsc2UsXG5cdFx0XHQvLyAgU2VuZCBub3RpZmljYXRpb25zIHRvIHN1YnNjcmliZXJzXG5cdFx0XHRub3RpZnkgPSBmdW5jdGlvbiAodmFsdWUsIHByZXZWYWx1ZSkge1xuXHRcdFx0XHR2YXIgaTtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IHN1YnMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRzdWJzW2ldLmZ1bmMuYXBwbHkoc3Vic1tpXS5jb250ZXh0LCBbdmFsdWUsIHByZXZWYWx1ZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cHJvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHZhbHVlID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0XHRcdGlmIChwcmV2VmFsdWUgIT09IHZhbHVlKSB7XG5cdFx0XHRcdFx0XHR2YXIgdG1wUHJldiA9IHByZXZWYWx1ZTtcblx0XHRcdFx0XHRcdHByZXZWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0bm90aWZ5KHZhbHVlLCB0bXBQcmV2KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fTtcblxuXHRcdC8vXHRBbGxvdyBwdXNoIG9uIGFycmF5c1xuXHRcdHByb3AucHVzaCA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0aWYodmFsdWUucHVzaCAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHZhbHVlLnB1c2godmFsKTtcblx0XHRcdH1cblx0XHRcdHByb3AodmFsdWUpO1xuXHRcdH07XG5cblx0XHQvL1x0U3Vic2NyaWJlIGZvciB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzXG5cdFx0cHJvcC5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoZnVuYywgY29udGV4dCkge1xuXHRcdFx0c3Vicy5wdXNoKHsgZnVuYzogZnVuYywgY29udGV4dDogY29udGV4dCB8fCBzZWxmIH0pO1xuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fTtcblxuXHRcdC8vXHRBbGxvdyBwcm9wZXJ0eSB0byBub3QgYXV0b21hdGljYWxseSByZW5kZXJcblx0XHRwcm9wLmRlbGF5ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdGRlbGF5ID0gISF2YWx1ZTtcblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH07XG5cblx0XHQvL1x0QXV0b21hdGljYWxseSB1cGRhdGUgcmVuZGVyaW5nIHdoZW4gYSB2YWx1ZSBjaGFuZ2VzXG5cdFx0Ly9cdEFzIG1pdGhyaWwgd2FpdHMgZm9yIGEgcmVxdWVzdCBhbmltYXRpb24gZnJhbWUsIHRoaXMgc2hvdWxkIGJlIG9rLlxuXHRcdC8vXHRZb3UgY2FuIHVzZSAuZGVsYXkodHJ1ZSkgdG8gYmUgYWJsZSB0byBtYW51YWxseSBoYW5kbGUgdXBkYXRlc1xuXHRcdHByb3Auc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbCl7XG5cdFx0XHRpZighZGVsYXkpIHtcblx0XHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XG5cdFx0XHRcdG0uZW5kQ29tcHV0YXRpb24oKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHByb3A7XG5cdH07XG5cblx0Ly9cdEVsZW1lbnQgZnVuY3Rpb24gdGhhdCBhcHBsaWVzIG91ciBleHRlbmRlZCBiaW5kaW5nc1xuXHQvL1x0Tm90ZTogXG5cdC8vXHRcdC4gU29tZSBhdHRyaWJ1dGVzIGNhbiBiZSByZW1vdmVkIHdoZW4gYXBwbGllZCwgZWc6IGN1c3RvbSBhdHRyaWJ1dGVzXG5cdC8vXHRcblx0bS5lID0gZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMsIGNoaWxkcmVuKSB7XG5cdFx0Zm9yICh2YXIgbmFtZSBpbiBhdHRycykge1xuXHRcdFx0aWYgKG0uYmluZGluZ3NbbmFtZV0pIHtcblx0XHRcdFx0bS5iaW5kaW5nc1tuYW1lXS5mdW5jLmFwcGx5KGF0dHJzLCBbYXR0cnNbbmFtZV1dKTtcblx0XHRcdFx0aWYobS5iaW5kaW5nc1tuYW1lXS5yZW1vdmVhYmxlKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIGF0dHJzW25hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBtKGVsZW1lbnQsIGF0dHJzLCBjaGlsZHJlbik7XG5cdH07XG5cblx0Ly9cdEFkZCBiaW5kaW5ncyBtZXRob2Rcblx0Ly9cdE5vbi1zdGFuZGFyZCBhdHRyaWJ1dGVzIGRvIG5vdCBuZWVkIHRvIGJlIHJlbmRlcmVkLCBlZzogdmFsdWVJbnB1dFxuXHQvL1x0c28gdGhleSBhcmUgc2V0IGFzIHJlbW92YWJsZVxuXHRtLmFkZEJpbmRpbmcgPSBmdW5jdGlvbihuYW1lLCBmdW5jLCByZW1vdmVhYmxlKXtcblx0XHRtLmJpbmRpbmdzW25hbWVdID0ge1xuXHRcdFx0ZnVuYzogZnVuYyxcblx0XHRcdHJlbW92ZWFibGU6IHJlbW92ZWFibGVcblx0XHR9O1xuXHR9O1xuXG5cdC8vXHRHZXQgdGhlIHVuZGVybHlpbmcgdmFsdWUgb2YgYSBwcm9wZXJ0eVxuXHRtLnVud3JhcCA9IGZ1bmN0aW9uKHByb3ApIHtcblx0XHRyZXR1cm4gKHR5cGVvZiBwcm9wID09IFwiZnVuY3Rpb25cIik/IHByb3AoKTogcHJvcDtcblx0fTtcblxuXHQvL1x0QmktZGlyZWN0aW9uYWwgYmluZGluZyBvZiB2YWx1ZVxuXHRtLmFkZEJpbmRpbmcoXCJ2YWx1ZVwiLCBmdW5jdGlvbihwcm9wKSB7XG5cdFx0aWYgKHR5cGVvZiBwcm9wID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0dGhpcy52YWx1ZSA9IHByb3AoKTtcblx0XHRcdHRoaXMub25jaGFuZ2UgPSBtLndpdGhBdHRyKFwidmFsdWVcIiwgcHJvcCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudmFsdWUgPSBwcm9wO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9cdEJpLWRpcmVjdGlvbmFsIGJpbmRpbmcgb2YgY2hlY2tlZCBwcm9wZXJ0eVxuXHRtLmFkZEJpbmRpbmcoXCJjaGVja2VkXCIsIGZ1bmN0aW9uKHByb3ApIHtcblx0XHRpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aGlzLmNoZWNrZWQgPSBwcm9wKCk7XG5cdFx0XHR0aGlzLm9uY2hhbmdlID0gbS53aXRoQXR0cihcImNoZWNrZWRcIiwgcHJvcCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2hlY2tlZCA9IHByb3A7XG5cdFx0fVxuXHR9KTtcblxuXHQvL1x0SGlkZSBub2RlXG5cdG0uYWRkQmluZGluZyhcImhpZGVcIiwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5zdHlsZSA9IHtcblx0XHRcdGRpc3BsYXk6IG0udW53cmFwKHByb3ApPyBcIm5vbmVcIiA6IFwiXCJcblx0XHR9O1xuXHR9LCB0cnVlKTtcblxuXHQvL1x0VG9nZ2xlIHZhbHVlKHMpIG9uIGNsaWNrXG5cdG0uYWRkQmluZGluZygndG9nZ2xlJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbmNsaWNrID0gZnVuY3Rpb24oKXtcblx0XHRcdC8vXHRUb2dnbGUgYWxsb3dzIGFuIGVudW0gbGlzdCB0byBiZSB0b2dnbGVkLCBlZzogW3Byb3AsIHZhbHVlMiwgdmFsdWUyXVxuXHRcdFx0dmFyIGlzRnVuYyA9IHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nLCB0bXAsIGksIHZhbHMgPSBbXSwgdmFsLCB0VmFsO1xuXG5cdFx0XHQvL1x0VG9nZ2xlIGJvb2xlYW5cblx0XHRcdGlmKGlzRnVuYykge1xuXHRcdFx0XHR2YWx1ZSA9IHByb3AoKTtcblx0XHRcdFx0cHJvcCghdmFsdWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9cdFRvZ2dsZSBlbnVtZXJhdGlvblxuXHRcdFx0XHR0bXAgPSBwcm9wWzBdO1xuXHRcdFx0XHR2YWwgPSB0bXAoKTtcblx0XHRcdFx0dmFscyA9IHByb3Auc2xpY2UoMSk7XG5cdFx0XHRcdHRWYWwgPSB2YWxzWzBdO1xuXG5cdFx0XHRcdGZvcihpID0gMDsgaSA8IHZhbHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRpZih2YWwgPT0gdmFsc1tpXSkge1xuXHRcdFx0XHRcdFx0aWYodHlwZW9mIHZhbHNbaSsxXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdFx0dFZhbCA9IHZhbHNbaSsxXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0bXAodFZhbCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFNldCBob3ZlciBzdGF0ZXMsIGEnbGEgalF1ZXJ5IHBhdHRlcm5cblx0bS5hZGRCaW5kaW5nKCdob3ZlcicsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMub25tb3VzZW92ZXIgPSBwcm9wWzBdO1xuXHRcdGlmKHByb3BbMV0pIHtcblx0XHRcdHRoaXMub25tb3VzZW91dCA9IHByb3BbMV07XG5cdFx0fVxuXHR9LCB0cnVlICk7XG5cblx0Ly9cdEFkZCB2YWx1ZSBiaW5kaW5ncyBmb3IgdmFyaW91cyBldmVudCB0eXBlcyBcblx0dmFyIGV2ZW50cyA9IFtcIklucHV0XCIsIFwiS2V5dXBcIiwgXCJLZXlwcmVzc1wiXSxcblx0XHRjcmVhdGVCaW5kaW5nID0gZnVuY3Rpb24obmFtZSwgZXZlKXtcblx0XHRcdC8vXHRCaS1kaXJlY3Rpb25hbCBiaW5kaW5nIG9mIHZhbHVlXG5cdFx0XHRtLmFkZEJpbmRpbmcobmFtZSwgZnVuY3Rpb24ocHJvcCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IHByb3AoKTtcblx0XHRcdFx0XHR0aGlzW2V2ZV0gPSBtLndpdGhBdHRyKFwidmFsdWVcIiwgcHJvcCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IHByb3A7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRydWUpO1xuXHRcdH07XG5cblx0Zm9yKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdHZhciBldmUgPSBldmVudHNbaV07XG5cdFx0Y3JlYXRlQmluZGluZyhcInZhbHVlXCIgKyBldmUsIFwib25cIiArIGV2ZS50b0xvd2VyQ2FzZSgpKTtcblx0fVxuXG5cblx0Ly9cdFNldCBhIHZhbHVlIG9uIGEgcHJvcGVydHlcblx0bS5zZXQgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZSl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0cHJvcCh2YWx1ZSk7XG5cdFx0fTtcblx0fTtcblxuXHQvKlx0UmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgY2FuIHRyaWdnZXIgYSBiaW5kaW5nIFxuXHRcdFVzYWdlOiBvbmNsaWNrOiBtLnRyaWdnZXIoJ2JpbmRpbmcnLCBwcm9wKVxuXHQqL1xuXHRtLnRyaWdnZXIgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBuYW1lID0gYXJnc1swXSxcblx0XHRcdFx0YXJnTGlzdCA9IGFyZ3Muc2xpY2UoMSk7XG5cdFx0XHRpZiAobS5iaW5kaW5nc1tuYW1lXSkge1xuXHRcdFx0XHRtLmJpbmRpbmdzW25hbWVdLmZ1bmMuYXBwbHkodGhpcywgYXJnTGlzdCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4gbS5iaW5kaW5ncztcbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gbWl0aHJpbEJpbmRpbmdzO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1pdGhyaWxCaW5kaW5ncztcblx0fSk7XG59IGVsc2Uge1xuXHRtaXRocmlsQmluZGluZ3ModHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3cubSB8fCB7fToge30pO1xufVxuXG59KCkpOyIsIi8vXHRNaXRocmlsIHN1Z2FyIHRhZ3MuXG4vL1x0Q29weXJpZ2h0IChDKSAyMDE1IGpzZ3V5IChNaWtrZWwgQmVyZ21hbm4pXG4vL1x0TUlUIGxpY2Vuc2VkXG4oZnVuY3Rpb24oKXtcbnZhciBtaXRocmlsU3VnYXJ0YWdzID0gZnVuY3Rpb24obSwgc2NvcGUpe1xuXHRtLnN1Z2FyVGFncyA9IG0uc3VnYXJUYWdzIHx8IHt9O1xuXHRzY29wZSA9IHNjb3BlIHx8IG07XG5cblx0dmFyIGFyZyA9IGZ1bmN0aW9uKGwxLCBsMil7XG5cdFx0XHR2YXIgaTtcblx0XHRcdGZvciAoaSBpbiBsMikge2lmKGwyLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdGwxLnB1c2gobDJbaV0pO1xuXHRcdFx0fX1cblx0XHRcdHJldHVybiBsMTtcblx0XHR9LCBcblx0XHRnZXRDbGFzc0xpc3QgPSBmdW5jdGlvbihhcmdzKXtcblx0XHRcdHZhciBpLCByZXN1bHQ7XG5cdFx0XHRmb3IoaSBpbiBhcmdzKSB7XG5cdFx0XHRcdGlmKGFyZ3NbaV0gJiYgYXJnc1tpXS5jbGFzcykge1xuXHRcdFx0XHRcdHJldHVybiB0eXBlb2YgKGFyZ3NbaV0uY2xhc3MgPT0gXCJzdHJpbmdcIik/IFxuXHRcdFx0XHRcdFx0YXJnc1tpXS5jbGFzcy5zcGxpdChcIiBcIik6XG5cdFx0XHRcdFx0XHRmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bWFrZVN1Z2FyVGFnID0gZnVuY3Rpb24odGFnKSB7XG5cdFx0XHR2YXIgYywgZWw7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHRcdFx0Ly9cdGlmIGNsYXNzIGlzIHN0cmluZywgYWxsb3cgdXNlIG9mIGNhY2hlXG5cdFx0XHRcdGlmKGMgPSBnZXRDbGFzc0xpc3QoYXJncykpIHtcblx0XHRcdFx0XHRlbCA9IFt0YWcgKyBcIi5cIiArIGMuam9pbihcIi5cIildO1xuXHRcdFx0XHRcdC8vXHRSZW1vdmUgY2xhc3MgdGFnLCBzbyB3ZSBkb24ndCBkdXBsaWNhdGVcblx0XHRcdFx0XHRmb3IodmFyIGkgaW4gYXJncykge1xuXHRcdFx0XHRcdFx0aWYoYXJnc1tpXSAmJiBhcmdzW2ldLmNsYXNzKSB7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBhcmdzW2ldLmNsYXNzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbCA9IFt0YWddO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAobS5lPyBtLmU6IG0pLmFwcGx5KHRoaXMsIGFyZyhlbCwgYXJncykpO1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRhZ0xpc3QgPSBbXCJBXCIsXCJBQkJSXCIsXCJBQ1JPTllNXCIsXCJBRERSRVNTXCIsXCJBUkVBXCIsXCJBUlRJQ0xFXCIsXCJBU0lERVwiLFwiQVVESU9cIixcIkJcIixcIkJESVwiLFwiQkRPXCIsXCJCSUdcIixcIkJMT0NLUVVPVEVcIixcIkJPRFlcIixcIkJSXCIsXCJCVVRUT05cIixcIkNBTlZBU1wiLFwiQ0FQVElPTlwiLFwiQ0lURVwiLFwiQ09ERVwiLFwiQ09MXCIsXCJDT0xHUk9VUFwiLFwiQ09NTUFORFwiLFwiREFUQUxJU1RcIixcIkREXCIsXCJERUxcIixcIkRFVEFJTFNcIixcIkRGTlwiLFwiRElWXCIsXCJETFwiLFwiRFRcIixcIkVNXCIsXCJFTUJFRFwiLFwiRklFTERTRVRcIixcIkZJR0NBUFRJT05cIixcIkZJR1VSRVwiLFwiRk9PVEVSXCIsXCJGT1JNXCIsXCJGUkFNRVwiLFwiRlJBTUVTRVRcIixcIkgxXCIsXCJIMlwiLFwiSDNcIixcIkg0XCIsXCJINVwiLFwiSDZcIixcIkhFQURcIixcIkhFQURFUlwiLFwiSEdST1VQXCIsXCJIUlwiLFwiSFRNTFwiLFwiSVwiLFwiSUZSQU1FXCIsXCJJTUdcIixcIklOUFVUXCIsXCJJTlNcIixcIktCRFwiLFwiS0VZR0VOXCIsXCJMQUJFTFwiLFwiTEVHRU5EXCIsXCJMSVwiLFwiTElOS1wiLFwiTUFQXCIsXCJNQVJLXCIsXCJNRVRBXCIsXCJNRVRFUlwiLFwiTkFWXCIsXCJOT1NDUklQVFwiLFwiT0JKRUNUXCIsXCJPTFwiLFwiT1BUR1JPVVBcIixcIk9QVElPTlwiLFwiT1VUUFVUXCIsXCJQXCIsXCJQQVJBTVwiLFwiUFJFXCIsXCJQUk9HUkVTU1wiLFwiUVwiLFwiUlBcIixcIlJUXCIsXCJSVUJZXCIsXCJTQU1QXCIsXCJTQ1JJUFRcIixcIlNFQ1RJT05cIixcIlNFTEVDVFwiLFwiU01BTExcIixcIlNPVVJDRVwiLFwiU1BBTlwiLFwiU1BMSVRcIixcIlNUUk9OR1wiLFwiU1RZTEVcIixcIlNVQlwiLFwiU1VNTUFSWVwiLFwiU1VQXCIsXCJUQUJMRVwiLFwiVEJPRFlcIixcIlREXCIsXCJURVhUQVJFQVwiLFwiVEZPT1RcIixcIlRIXCIsXCJUSEVBRFwiLFwiVElNRVwiLFwiVElUTEVcIixcIlRSXCIsXCJUUkFDS1wiLFwiVFRcIixcIlVMXCIsXCJWQVJcIixcIlZJREVPXCIsXCJXQlJcIl0sXG5cdFx0bG93ZXJUYWdDYWNoZSA9IHt9LFxuXHRcdGk7XG5cblx0Ly9cdENyZWF0ZSBzdWdhcidkIGZ1bmN0aW9ucyBpbiB0aGUgcmVxdWlyZWQgc2NvcGVzXG5cdGZvciAoaSBpbiB0YWdMaXN0KSB7aWYodGFnTGlzdC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdChmdW5jdGlvbih0YWcpe1xuXHRcdFx0dmFyIGxvd2VyVGFnID0gdGFnLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRzY29wZVt0YWddID0gbG93ZXJUYWdDYWNoZVtsb3dlclRhZ10gPSBtYWtlU3VnYXJUYWcobG93ZXJUYWcpO1xuXHRcdH0odGFnTGlzdFtpXSkpO1xuXHR9fVxuXG5cdC8vXHRMb3dlcmNhc2VkIHN1Z2FyIHRhZ3Ncblx0bS5zdWdhclRhZ3MubG93ZXIgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBsb3dlclRhZ0NhY2hlO1xuXHR9O1xuXG5cdHJldHVybiBzY29wZTtcbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gbWl0aHJpbFN1Z2FydGFncztcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtaXRocmlsU3VnYXJ0YWdzO1xuXHR9KTtcbn0gZWxzZSB7XG5cdG1pdGhyaWxTdWdhcnRhZ3MoXG5cdFx0dHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3cubSB8fCB7fToge30sXG5cdFx0dHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3c6IHt9XG5cdCk7XG59XG5cbn0oKSk7IiwidmFyIG0gPSAoZnVuY3Rpb24gYXBwKHdpbmRvdywgdW5kZWZpbmVkKSB7XHJcblx0dmFyIE9CSkVDVCA9IFwiW29iamVjdCBPYmplY3RdXCIsIEFSUkFZID0gXCJbb2JqZWN0IEFycmF5XVwiLCBTVFJJTkcgPSBcIltvYmplY3QgU3RyaW5nXVwiLCBGVU5DVElPTiA9IFwiZnVuY3Rpb25cIjtcclxuXHR2YXIgdHlwZSA9IHt9LnRvU3RyaW5nO1xyXG5cdHZhciBwYXJzZXIgPSAvKD86KF58I3xcXC4pKFteI1xcLlxcW1xcXV0rKSl8KFxcWy4rP1xcXSkvZywgYXR0clBhcnNlciA9IC9cXFsoLis/KSg/Oj0oXCJ8J3wpKC4qPylcXDIpP1xcXS87XHJcblx0dmFyIHZvaWRFbGVtZW50cyA9IC9eKEFSRUF8QkFTRXxCUnxDT0x8Q09NTUFORHxFTUJFRHxIUnxJTUd8SU5QVVR8S0VZR0VOfExJTkt8TUVUQXxQQVJBTXxTT1VSQ0V8VFJBQ0t8V0JSKSQvO1xyXG5cclxuXHQvLyBjYWNoaW5nIGNvbW1vbmx5IHVzZWQgdmFyaWFibGVzXHJcblx0dmFyICRkb2N1bWVudCwgJGxvY2F0aW9uLCAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCAkY2FuY2VsQW5pbWF0aW9uRnJhbWU7XHJcblxyXG5cdC8vIHNlbGYgaW52b2tpbmcgZnVuY3Rpb24gbmVlZGVkIGJlY2F1c2Ugb2YgdGhlIHdheSBtb2NrcyB3b3JrXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSh3aW5kb3cpe1xyXG5cdFx0JGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xyXG5cdFx0JGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xyXG5cdFx0JGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5jbGVhclRpbWVvdXQ7XHJcblx0XHQkcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuc2V0VGltZW91dDtcclxuXHR9XHJcblxyXG5cdGluaXRpYWxpemUod2luZG93KTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEB0eXBlZGVmIHtTdHJpbmd9IFRhZ1xyXG5cdCAqIEEgc3RyaW5nIHRoYXQgbG9va3MgbGlrZSAtPiBkaXYuY2xhc3NuYW1lI2lkW3BhcmFtPW9uZV1bcGFyYW0yPXR3b11cclxuXHQgKiBXaGljaCBkZXNjcmliZXMgYSBET00gbm9kZVxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7VGFnfSBUaGUgRE9NIG5vZGUgdGFnXHJcblx0ICogQHBhcmFtIHtPYmplY3Q9W119IG9wdGlvbmFsIGtleS12YWx1ZSBwYWlycyB0byBiZSBtYXBwZWQgdG8gRE9NIGF0dHJzXHJcblx0ICogQHBhcmFtIHsuLi5tTm9kZT1bXX0gWmVybyBvciBtb3JlIE1pdGhyaWwgY2hpbGQgbm9kZXMuIENhbiBiZSBhbiBhcnJheSwgb3Igc3BsYXQgKG9wdGlvbmFsKVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbSgpIHtcclxuXHRcdHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG5cdFx0dmFyIGhhc0F0dHJzID0gYXJnc1sxXSAhPSBudWxsICYmIHR5cGUuY2FsbChhcmdzWzFdKSA9PT0gT0JKRUNUICYmICEoXCJ0YWdcIiBpbiBhcmdzWzFdKSAmJiAhKFwic3VidHJlZVwiIGluIGFyZ3NbMV0pO1xyXG5cdFx0dmFyIGF0dHJzID0gaGFzQXR0cnMgPyBhcmdzWzFdIDoge307XHJcblx0XHR2YXIgY2xhc3NBdHRyTmFtZSA9IFwiY2xhc3NcIiBpbiBhdHRycyA/IFwiY2xhc3NcIiA6IFwiY2xhc3NOYW1lXCI7XHJcblx0XHR2YXIgY2VsbCA9IHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7fX07XHJcblx0XHR2YXIgbWF0Y2gsIGNsYXNzZXMgPSBbXTtcclxuXHRcdGlmICh0eXBlLmNhbGwoYXJnc1swXSkgIT0gU1RSSU5HKSB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RvciBpbiBtKHNlbGVjdG9yLCBhdHRycywgY2hpbGRyZW4pIHNob3VsZCBiZSBhIHN0cmluZ1wiKVxyXG5cdFx0d2hpbGUgKG1hdGNoID0gcGFyc2VyLmV4ZWMoYXJnc1swXSkpIHtcclxuXHRcdFx0aWYgKG1hdGNoWzFdID09PSBcIlwiICYmIG1hdGNoWzJdKSBjZWxsLnRhZyA9IG1hdGNoWzJdO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCIjXCIpIGNlbGwuYXR0cnMuaWQgPSBtYXRjaFsyXTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbMV0gPT09IFwiLlwiKSBjbGFzc2VzLnB1c2gobWF0Y2hbMl0pO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFszXVswXSA9PT0gXCJbXCIpIHtcclxuXHRcdFx0XHR2YXIgcGFpciA9IGF0dHJQYXJzZXIuZXhlYyhtYXRjaFszXSk7XHJcblx0XHRcdFx0Y2VsbC5hdHRyc1twYWlyWzFdXSA9IHBhaXJbM10gfHwgKHBhaXJbMl0gPyBcIlwiIDp0cnVlKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBjZWxsLmF0dHJzW2NsYXNzQXR0ck5hbWVdID0gY2xhc3Nlcy5qb2luKFwiIFwiKTtcclxuXHJcblxyXG5cdFx0dmFyIGNoaWxkcmVuID0gaGFzQXR0cnMgPyBhcmdzWzJdIDogYXJnc1sxXTtcclxuXHRcdGlmICh0eXBlLmNhbGwoY2hpbGRyZW4pID09PSBBUlJBWSkge1xyXG5cdFx0XHRjZWxsLmNoaWxkcmVuID0gY2hpbGRyZW5cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjZWxsLmNoaWxkcmVuID0gaGFzQXR0cnMgPyBhcmdzLnNsaWNlKDIpIDogYXJncy5zbGljZSgxKVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGF0dHJzKSB7XHJcblx0XHRcdGlmIChhdHRyTmFtZSA9PT0gY2xhc3NBdHRyTmFtZSkge1xyXG5cdFx0XHRcdGlmIChhdHRyc1thdHRyTmFtZV0gIT09IFwiXCIpIGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gKGNlbGwuYXR0cnNbYXR0ck5hbWVdIHx8IFwiXCIpICsgXCIgXCIgKyBhdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBjZWxsLmF0dHJzW2F0dHJOYW1lXSA9IGF0dHJzW2F0dHJOYW1lXVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNlbGxcclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBwYXJlbnRDYWNoZSwgcGFyZW50SW5kZXgsIGRhdGEsIGNhY2hlZCwgc2hvdWxkUmVhdHRhY2gsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHQvL2BidWlsZGAgaXMgYSByZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCBtYW5hZ2VzIGNyZWF0aW9uL2RpZmZpbmcvcmVtb3ZhbCBvZiBET00gZWxlbWVudHMgYmFzZWQgb24gY29tcGFyaXNvbiBiZXR3ZWVuIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vdGhlIGRpZmYgYWxnb3JpdGhtIGNhbiBiZSBzdW1tYXJpemVkIGFzIHRoaXM6XHJcblx0XHQvLzEgLSBjb21wYXJlIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vMiAtIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgY29weSBgZGF0YWAgdG8gYGNhY2hlZGAgYW5kIHVwZGF0ZSB0aGUgRE9NIGJhc2VkIG9uIHdoYXQgdGhlIGRpZmZlcmVuY2UgaXNcclxuXHRcdC8vMyAtIHJlY3Vyc2l2ZWx5IGFwcGx5IHRoaXMgYWxnb3JpdGhtIGZvciBldmVyeSBhcnJheSBhbmQgZm9yIHRoZSBjaGlsZHJlbiBvZiBldmVyeSB2aXJ0dWFsIGVsZW1lbnRcclxuXHJcblx0XHQvL3RoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXMgcmVkcmF3J3MgYGRhdGFgIGRhdGEgc3RydWN0dXJlLCB3aXRoIGEgZmV3IGFkZGl0aW9uczpcclxuXHRcdC8vLSBgY2FjaGVkYCBhbHdheXMgaGFzIGEgcHJvcGVydHkgY2FsbGVkIGBub2Rlc2AsIHdoaWNoIGlzIGEgbGlzdCBvZiBET00gZWxlbWVudHMgdGhhdCBjb3JyZXNwb25kIHRvIHRoZSBkYXRhIHJlcHJlc2VudGVkIGJ5IHRoZSByZXNwZWN0aXZlIHZpcnR1YWwgZWxlbWVudFxyXG5cdFx0Ly8tIGluIG9yZGVyIHRvIHN1cHBvcnQgYXR0YWNoaW5nIGBub2Rlc2AgYXMgYSBwcm9wZXJ0eSBvZiBgY2FjaGVkYCwgYGNhY2hlZGAgaXMgKmFsd2F5cyogYSBub24tcHJpbWl0aXZlIG9iamVjdCwgaS5lLiBpZiB0aGUgZGF0YSB3YXMgYSBzdHJpbmcsIHRoZW4gY2FjaGVkIGlzIGEgU3RyaW5nIGluc3RhbmNlLiBJZiBkYXRhIHdhcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAsIGNhY2hlZCBpcyBgbmV3IFN0cmluZyhcIlwiKWBcclxuXHRcdC8vLSBgY2FjaGVkIGFsc28gaGFzIGEgYGNvbmZpZ0NvbnRleHRgIHByb3BlcnR5LCB3aGljaCBpcyB0aGUgc3RhdGUgc3RvcmFnZSBvYmplY3QgZXhwb3NlZCBieSBjb25maWcoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dClcclxuXHRcdC8vLSB3aGVuIGBjYWNoZWRgIGlzIGFuIE9iamVjdCwgaXQgcmVwcmVzZW50cyBhIHZpcnR1YWwgZWxlbWVudDsgd2hlbiBpdCdzIGFuIEFycmF5LCBpdCByZXByZXNlbnRzIGEgbGlzdCBvZiBlbGVtZW50czsgd2hlbiBpdCdzIGEgU3RyaW5nLCBOdW1iZXIgb3IgQm9vbGVhbiwgaXQgcmVwcmVzZW50cyBhIHRleHQgbm9kZVxyXG5cclxuXHRcdC8vYHBhcmVudEVsZW1lbnRgIGlzIGEgRE9NIGVsZW1lbnQgdXNlZCBmb3IgVzNDIERPTSBBUEkgY2FsbHNcclxuXHRcdC8vYHBhcmVudFRhZ2AgaXMgb25seSB1c2VkIGZvciBoYW5kbGluZyBhIGNvcm5lciBjYXNlIGZvciB0ZXh0YXJlYSB2YWx1ZXNcclxuXHRcdC8vYHBhcmVudENhY2hlYCBpcyB1c2VkIHRvIHJlbW92ZSBub2RlcyBpbiBzb21lIG11bHRpLW5vZGUgY2FzZXNcclxuXHRcdC8vYHBhcmVudEluZGV4YCBhbmQgYGluZGV4YCBhcmUgdXNlZCB0byBmaWd1cmUgb3V0IHRoZSBvZmZzZXQgb2Ygbm9kZXMuIFRoZXkncmUgYXJ0aWZhY3RzIGZyb20gYmVmb3JlIGFycmF5cyBzdGFydGVkIGJlaW5nIGZsYXR0ZW5lZCBhbmQgYXJlIGxpa2VseSByZWZhY3RvcmFibGVcclxuXHRcdC8vYGRhdGFgIGFuZCBgY2FjaGVkYCBhcmUsIHJlc3BlY3RpdmVseSwgdGhlIG5ldyBhbmQgb2xkIG5vZGVzIGJlaW5nIGRpZmZlZFxyXG5cdFx0Ly9gc2hvdWxkUmVhdHRhY2hgIGlzIGEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBwYXJlbnQgbm9kZSB3YXMgcmVjcmVhdGVkIChpZiBzbywgYW5kIGlmIHRoaXMgbm9kZSBpcyByZXVzZWQsIHRoZW4gdGhpcyBub2RlIG11c3QgcmVhdHRhY2ggaXRzZWxmIHRvIHRoZSBuZXcgcGFyZW50KVxyXG5cdFx0Ly9gZWRpdGFibGVgIGlzIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFuIGFuY2VzdG9yIGlzIGNvbnRlbnRlZGl0YWJsZVxyXG5cdFx0Ly9gbmFtZXNwYWNlYCBpbmRpY2F0ZXMgdGhlIGNsb3Nlc3QgSFRNTCBuYW1lc3BhY2UgYXMgaXQgY2FzY2FkZXMgZG93biBmcm9tIGFuIGFuY2VzdG9yXHJcblx0XHQvL2Bjb25maWdzYCBpcyBhIGxpc3Qgb2YgY29uZmlnIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIHRvcG1vc3QgYGJ1aWxkYCBjYWxsIGZpbmlzaGVzIHJ1bm5pbmdcclxuXHJcblx0XHQvL3RoZXJlJ3MgbG9naWMgdGhhdCByZWxpZXMgb24gdGhlIGFzc3VtcHRpb24gdGhhdCBudWxsIGFuZCB1bmRlZmluZWQgZGF0YSBhcmUgZXF1aXZhbGVudCB0byBlbXB0eSBzdHJpbmdzXHJcblx0XHQvLy0gdGhpcyBwcmV2ZW50cyBsaWZlY3ljbGUgc3VycHJpc2VzIGZyb20gcHJvY2VkdXJhbCBoZWxwZXJzIHRoYXQgbWl4IGltcGxpY2l0IGFuZCBleHBsaWNpdCByZXR1cm4gc3RhdGVtZW50cyAoZS5nLiBmdW5jdGlvbiBmb28oKSB7aWYgKGNvbmQpIHJldHVybiBtKFwiZGl2XCIpfVxyXG5cdFx0Ly8tIGl0IHNpbXBsaWZpZXMgZGlmZmluZyBjb2RlXHJcblx0XHQvL2RhdGEudG9TdHJpbmcoKSBpcyBudWxsIGlmIGRhdGEgaXMgdGhlIHJldHVybiB2YWx1ZSBvZiBDb25zb2xlLmxvZyBpbiBGaXJlZm94XHJcblx0XHRpZiAoZGF0YSA9PSBudWxsIHx8IGRhdGEudG9TdHJpbmcoKSA9PSBudWxsKSBkYXRhID0gXCJcIjtcclxuXHRcdGlmIChkYXRhLnN1YnRyZWUgPT09IFwicmV0YWluXCIpIHJldHVybiBjYWNoZWQ7XHJcblx0XHR2YXIgY2FjaGVkVHlwZSA9IHR5cGUuY2FsbChjYWNoZWQpLCBkYXRhVHlwZSA9IHR5cGUuY2FsbChkYXRhKTtcclxuXHRcdGlmIChjYWNoZWQgPT0gbnVsbCB8fCBjYWNoZWRUeXBlICE9PSBkYXRhVHlwZSkge1xyXG5cdFx0XHRpZiAoY2FjaGVkICE9IG51bGwpIHtcclxuXHRcdFx0XHRpZiAocGFyZW50Q2FjaGUgJiYgcGFyZW50Q2FjaGUubm9kZXMpIHtcclxuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBpbmRleCAtIHBhcmVudEluZGV4O1xyXG5cdFx0XHRcdFx0dmFyIGVuZCA9IG9mZnNldCArIChkYXRhVHlwZSA9PT0gQVJSQVkgPyBkYXRhIDogY2FjaGVkLm5vZGVzKS5sZW5ndGg7XHJcblx0XHRcdFx0XHRjbGVhcihwYXJlbnRDYWNoZS5ub2Rlcy5zbGljZShvZmZzZXQsIGVuZCksIHBhcmVudENhY2hlLnNsaWNlKG9mZnNldCwgZW5kKSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZiAoY2FjaGVkLm5vZGVzKSBjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZClcclxuXHRcdFx0fVxyXG5cdFx0XHRjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcjtcclxuXHRcdFx0aWYgKGNhY2hlZC50YWcpIGNhY2hlZCA9IHt9OyAvL2lmIGNvbnN0cnVjdG9yIGNyZWF0ZXMgYSB2aXJ0dWFsIGRvbSBlbGVtZW50LCB1c2UgYSBibGFuayBvYmplY3QgYXMgdGhlIGJhc2UgY2FjaGVkIG5vZGUgaW5zdGVhZCBvZiBjb3B5aW5nIHRoZSB2aXJ0dWFsIGVsICgjMjc3KVxyXG5cdFx0XHRjYWNoZWQubm9kZXMgPSBbXVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChkYXRhVHlwZSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0Ly9yZWN1cnNpdmVseSBmbGF0dGVuIGFycmF5XHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHR5cGUuY2FsbChkYXRhW2ldKSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0XHRcdGRhdGEgPSBkYXRhLmNvbmNhdC5hcHBseShbXSwgZGF0YSk7XHJcblx0XHRcdFx0XHRpLS0gLy9jaGVjayBjdXJyZW50IGluZGV4IGFnYWluIGFuZCBmbGF0dGVuIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5lc3RlZCBhcnJheXMgYXQgdGhhdCBpbmRleFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG5vZGVzID0gW10sIGludGFjdCA9IGNhY2hlZC5sZW5ndGggPT09IGRhdGEubGVuZ3RoLCBzdWJBcnJheUNvdW50ID0gMDtcclxuXHJcblx0XHRcdC8va2V5cyBhbGdvcml0aG06IHNvcnQgZWxlbWVudHMgd2l0aG91dCByZWNyZWF0aW5nIHRoZW0gaWYga2V5cyBhcmUgcHJlc2VudFxyXG5cdFx0XHQvLzEpIGNyZWF0ZSBhIG1hcCBvZiBhbGwgZXhpc3Rpbmcga2V5cywgYW5kIG1hcmsgYWxsIGZvciBkZWxldGlvblxyXG5cdFx0XHQvLzIpIGFkZCBuZXcga2V5cyB0byBtYXAgYW5kIG1hcmsgdGhlbSBmb3IgYWRkaXRpb25cclxuXHRcdFx0Ly8zKSBpZiBrZXkgZXhpc3RzIGluIG5ldyBsaXN0LCBjaGFuZ2UgYWN0aW9uIGZyb20gZGVsZXRpb24gdG8gYSBtb3ZlXHJcblx0XHRcdC8vNCkgZm9yIGVhY2gga2V5LCBoYW5kbGUgaXRzIGNvcnJlc3BvbmRpbmcgYWN0aW9uIGFzIG1hcmtlZCBpbiBwcmV2aW91cyBzdGVwc1xyXG5cdFx0XHQvLzUpIGNvcHkgdW5rZXllZCBpdGVtcyBpbnRvIHRoZWlyIHJlc3BlY3RpdmUgZ2Fwc1xyXG5cdFx0XHR2YXIgREVMRVRJT04gPSAxLCBJTlNFUlRJT04gPSAyICwgTU9WRSA9IDM7XHJcblx0XHRcdHZhciBleGlzdGluZyA9IHt9LCB1bmtleWVkID0gW10sIHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IGZhbHNlO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNhY2hlZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmIChjYWNoZWRbaV0gJiYgY2FjaGVkW2ldLmF0dHJzICYmIGNhY2hlZFtpXS5hdHRycy5rZXkgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0c2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gdHJ1ZTtcclxuXHRcdFx0XHRcdGV4aXN0aW5nW2NhY2hlZFtpXS5hdHRycy5rZXldID0ge2FjdGlvbjogREVMRVRJT04sIGluZGV4OiBpfVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzKSB7XHJcblx0XHRcdFx0aWYgKGRhdGEuaW5kZXhPZihudWxsKSA+IC0xKSBkYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24oeCkge3JldHVybiB4ICE9IG51bGx9KVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciBrZXlzRGlmZmVyID0gZmFsc2VcclxuXHRcdFx0XHRpZiAoZGF0YS5sZW5ndGggIT0gY2FjaGVkLmxlbmd0aCkga2V5c0RpZmZlciA9IHRydWVcclxuXHRcdFx0XHRlbHNlIGZvciAodmFyIGkgPSAwLCBjYWNoZWRDZWxsLCBkYXRhQ2VsbDsgY2FjaGVkQ2VsbCA9IGNhY2hlZFtpXSwgZGF0YUNlbGwgPSBkYXRhW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmIChjYWNoZWRDZWxsLmF0dHJzICYmIGRhdGFDZWxsLmF0dHJzICYmIGNhY2hlZENlbGwuYXR0cnMua2V5ICE9IGRhdGFDZWxsLmF0dHJzLmtleSkge1xyXG5cdFx0XHRcdFx0XHRrZXlzRGlmZmVyID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoa2V5c0RpZmZlcikge1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKGRhdGFbaV0gJiYgZGF0YVtpXS5hdHRycykge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChkYXRhW2ldLmF0dHJzLmtleSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIga2V5ID0gZGF0YVtpXS5hdHRycy5rZXk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoIWV4aXN0aW5nW2tleV0pIGV4aXN0aW5nW2tleV0gPSB7YWN0aW9uOiBJTlNFUlRJT04sIGluZGV4OiBpfTtcclxuXHRcdFx0XHRcdFx0XHRcdGVsc2UgZXhpc3Rpbmdba2V5XSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiBNT1ZFLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpbmRleDogaSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZnJvbTogZXhpc3Rpbmdba2V5XS5pbmRleCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudDogY2FjaGVkLm5vZGVzW2V4aXN0aW5nW2tleV0uaW5kZXhdIHx8ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGVsc2UgdW5rZXllZC5wdXNoKHtpbmRleDogaSwgZWxlbWVudDogcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2ldIHx8ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpfSlcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIGFjdGlvbnMgPSBbXVxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBleGlzdGluZykgYWN0aW9ucy5wdXNoKGV4aXN0aW5nW3Byb3BdKVxyXG5cdFx0XHRcdFx0dmFyIGNoYW5nZXMgPSBhY3Rpb25zLnNvcnQoc29ydENoYW5nZXMpO1xyXG5cdFx0XHRcdFx0dmFyIG5ld0NhY2hlZCA9IG5ldyBBcnJheShjYWNoZWQubGVuZ3RoKVxyXG5cclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjaGFuZ2U7IGNoYW5nZSA9IGNoYW5nZXNbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gREVMRVRJT04pIHtcclxuXHRcdFx0XHRcdFx0XHRjbGVhcihjYWNoZWRbY2hhbmdlLmluZGV4XS5ub2RlcywgY2FjaGVkW2NoYW5nZS5pbmRleF0pO1xyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlLmluZGV4LCAxKVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBJTlNFUlRJT04pIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgZHVtbXkgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdFx0XHRcdFx0XHRkdW1teS5rZXkgPSBkYXRhW2NoYW5nZS5pbmRleF0uYXR0cnMua2V5O1xyXG5cdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGR1bW15LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSB8fCBudWxsKTtcclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWQuc3BsaWNlKGNoYW5nZS5pbmRleCwgMCwge2F0dHJzOiB7a2V5OiBkYXRhW2NoYW5nZS5pbmRleF0uYXR0cnMua2V5fSwgbm9kZXM6IFtkdW1teV19KVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gTU9WRSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSAhPT0gY2hhbmdlLmVsZW1lbnQgJiYgY2hhbmdlLmVsZW1lbnQgIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNoYW5nZS5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSB8fCBudWxsKVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWRbY2hhbmdlLmluZGV4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHVua2V5ZWQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0dmFyIGNoYW5nZSA9IHVua2V5ZWRbaV07XHJcblx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNoYW5nZS5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSB8fCBudWxsKTtcclxuXHRcdFx0XHRcdFx0bmV3Q2FjaGVkW2NoYW5nZS5pbmRleF0gPSBjYWNoZWRbY2hhbmdlLmluZGV4XVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Y2FjaGVkID0gbmV3Q2FjaGVkO1xyXG5cdFx0XHRcdFx0Y2FjaGVkLm5vZGVzID0gbmV3IEFycmF5KHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGgpO1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNoaWxkOyBjaGlsZCA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpXTsgaSsrKSBjYWNoZWQubm9kZXNbaV0gPSBjaGlsZFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvL2VuZCBrZXkgYWxnb3JpdGhtXHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgY2FjaGVDb3VudCA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHQvL2RpZmYgZWFjaCBpdGVtIGluIHRoZSBhcnJheVxyXG5cdFx0XHRcdHZhciBpdGVtID0gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBjYWNoZWQsIGluZGV4LCBkYXRhW2ldLCBjYWNoZWRbY2FjaGVDb3VudF0sIHNob3VsZFJlYXR0YWNoLCBpbmRleCArIHN1YkFycmF5Q291bnQgfHwgc3ViQXJyYXlDb3VudCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XHJcblx0XHRcdFx0aWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkgY29udGludWU7XHJcblx0XHRcdFx0aWYgKCFpdGVtLm5vZGVzLmludGFjdCkgaW50YWN0ID0gZmFsc2U7XHJcblx0XHRcdFx0aWYgKGl0ZW0uJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdC8vZml4IG9mZnNldCBvZiBuZXh0IGVsZW1lbnQgaWYgaXRlbSB3YXMgYSB0cnVzdGVkIHN0cmluZyB3LyBtb3JlIHRoYW4gb25lIGh0bWwgZWxlbWVudFxyXG5cdFx0XHRcdFx0Ly90aGUgZmlyc3QgY2xhdXNlIGluIHRoZSByZWdleHAgbWF0Y2hlcyBlbGVtZW50c1xyXG5cdFx0XHRcdFx0Ly90aGUgc2Vjb25kIGNsYXVzZSAoYWZ0ZXIgdGhlIHBpcGUpIG1hdGNoZXMgdGV4dCBub2Rlc1xyXG5cdFx0XHRcdFx0c3ViQXJyYXlDb3VudCArPSAoaXRlbS5tYXRjaCgvPFteXFwvXXxcXD5cXHMqW148XS9nKSB8fCBbXSkubGVuZ3RoXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Ugc3ViQXJyYXlDb3VudCArPSB0eXBlLmNhbGwoaXRlbSkgPT09IEFSUkFZID8gaXRlbS5sZW5ndGggOiAxO1xyXG5cdFx0XHRcdGNhY2hlZFtjYWNoZUNvdW50KytdID0gaXRlbVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghaW50YWN0KSB7XHJcblx0XHRcdFx0Ly9kaWZmIHRoZSBhcnJheSBpdHNlbGZcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvL3VwZGF0ZSB0aGUgbGlzdCBvZiBET00gbm9kZXMgYnkgY29sbGVjdGluZyB0aGUgbm9kZXMgZnJvbSBlYWNoIGl0ZW1cclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKGNhY2hlZFtpXSAhPSBudWxsKSBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCBjYWNoZWRbaV0ubm9kZXMpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkgaWYgdGhlIG5ldyBhcnJheSBpcyBzaG9ydGVyIHRoYW4gdGhlIG9sZCBvbmVcclxuXHRcdFx0XHQvL2lmIGVycm9ycyBldmVyIGhhcHBlbiBoZXJlLCB0aGUgaXNzdWUgaXMgbW9zdCBsaWtlbHkgYSBidWcgaW4gdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgc29tZXdoZXJlIGVhcmxpZXIgaW4gdGhlIHByb2dyYW1cclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbm9kZTsgbm9kZSA9IGNhY2hlZC5ub2Rlc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAobm9kZS5wYXJlbnROb2RlICE9IG51bGwgJiYgbm9kZXMuaW5kZXhPZihub2RlKSA8IDApIGNsZWFyKFtub2RlXSwgW2NhY2hlZFtpXV0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCA8IGNhY2hlZC5sZW5ndGgpIGNhY2hlZC5sZW5ndGggPSBkYXRhLmxlbmd0aDtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChkYXRhICE9IG51bGwgJiYgZGF0YVR5cGUgPT09IE9CSkVDVCkge1xyXG5cdFx0XHRpZiAoIWRhdGEuYXR0cnMpIGRhdGEuYXR0cnMgPSB7fTtcclxuXHRcdFx0aWYgKCFjYWNoZWQuYXR0cnMpIGNhY2hlZC5hdHRycyA9IHt9O1xyXG5cclxuXHRcdFx0dmFyIGRhdGFBdHRyS2V5cyA9IE9iamVjdC5rZXlzKGRhdGEuYXR0cnMpXHJcblx0XHRcdHZhciBoYXNLZXlzID0gZGF0YUF0dHJLZXlzLmxlbmd0aCA+IChcImtleVwiIGluIGRhdGEuYXR0cnMgPyAxIDogMClcclxuXHRcdFx0Ly9pZiBhbiBlbGVtZW50IGlzIGRpZmZlcmVudCBlbm91Z2ggZnJvbSB0aGUgb25lIGluIGNhY2hlLCByZWNyZWF0ZSBpdFxyXG5cdFx0XHRpZiAoZGF0YS50YWcgIT0gY2FjaGVkLnRhZyB8fCBkYXRhQXR0cktleXMuam9pbigpICE9IE9iamVjdC5rZXlzKGNhY2hlZC5hdHRycykuam9pbigpIHx8IGRhdGEuYXR0cnMuaWQgIT0gY2FjaGVkLmF0dHJzLmlkKSB7XHJcblx0XHRcdFx0aWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGgpIGNsZWFyKGNhY2hlZC5ub2Rlcyk7XHJcblx0XHRcdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIHR5cGVvZiBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKClcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodHlwZS5jYWxsKGRhdGEudGFnKSAhPSBTVFJJTkcpIHJldHVybjtcclxuXHJcblx0XHRcdHZhciBub2RlLCBpc05ldyA9IGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDA7XHJcblx0XHRcdGlmIChkYXRhLmF0dHJzLnhtbG5zKSBuYW1lc3BhY2UgPSBkYXRhLmF0dHJzLnhtbG5zO1xyXG5cdFx0XHRlbHNlIGlmIChkYXRhLnRhZyA9PT0gXCJzdmdcIikgbmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xyXG5cdFx0XHRlbHNlIGlmIChkYXRhLnRhZyA9PT0gXCJtYXRoXCIpIG5hbWVzcGFjZSA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTFwiO1xyXG5cdFx0XHRpZiAoaXNOZXcpIHtcclxuXHRcdFx0XHRpZiAoZGF0YS5hdHRycy5pcykgbm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKTtcclxuXHRcdFx0XHRlbHNlIG5vZGUgPSBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZyk7XHJcblx0XHRcdFx0Y2FjaGVkID0ge1xyXG5cdFx0XHRcdFx0dGFnOiBkYXRhLnRhZyxcclxuXHRcdFx0XHRcdC8vc2V0IGF0dHJpYnV0ZXMgZmlyc3QsIHRoZW4gY3JlYXRlIGNoaWxkcmVuXHJcblx0XHRcdFx0XHRhdHRyczogaGFzS2V5cyA/IHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIHt9LCBuYW1lc3BhY2UpIDogZGF0YS5hdHRycyxcclxuXHRcdFx0XHRcdGNoaWxkcmVuOiBkYXRhLmNoaWxkcmVuICE9IG51bGwgJiYgZGF0YS5jaGlsZHJlbi5sZW5ndGggPiAwID9cclxuXHRcdFx0XHRcdFx0YnVpbGQobm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIHRydWUsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIDpcclxuXHRcdFx0XHRcdFx0ZGF0YS5jaGlsZHJlbixcclxuXHRcdFx0XHRcdG5vZGVzOiBbbm9kZV1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdGlmIChjYWNoZWQuY2hpbGRyZW4gJiYgIWNhY2hlZC5jaGlsZHJlbi5ub2RlcykgY2FjaGVkLmNoaWxkcmVuLm5vZGVzID0gW107XHJcblx0XHRcdFx0Ly9lZGdlIGNhc2U6IHNldHRpbmcgdmFsdWUgb24gPHNlbGVjdD4gZG9lc24ndCB3b3JrIGJlZm9yZSBjaGlsZHJlbiBleGlzdCwgc28gc2V0IGl0IGFnYWluIGFmdGVyIGNoaWxkcmVuIGhhdmUgYmVlbiBjcmVhdGVkXHJcblx0XHRcdFx0aWYgKGRhdGEudGFnID09PSBcInNlbGVjdFwiICYmIGRhdGEuYXR0cnMudmFsdWUpIHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIHt2YWx1ZTogZGF0YS5hdHRycy52YWx1ZX0sIHt9LCBuYW1lc3BhY2UpO1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRub2RlID0gY2FjaGVkLm5vZGVzWzBdO1xyXG5cdFx0XHRcdGlmIChoYXNLZXlzKSBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCBjYWNoZWQuYXR0cnMsIG5hbWVzcGFjZSk7XHJcblx0XHRcdFx0Y2FjaGVkLmNoaWxkcmVuID0gYnVpbGQobm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIGZhbHNlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IG5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZTtcclxuXHRcdFx0XHRpZiAoc2hvdWxkUmVhdHRhY2ggPT09IHRydWUgJiYgbm9kZSAhPSBudWxsKSBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2RlLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdH1cclxuXHRcdFx0Ly9zY2hlZHVsZSBjb25maWdzIHRvIGJlIGNhbGxlZC4gVGhleSBhcmUgY2FsbGVkIGFmdGVyIGBidWlsZGAgZmluaXNoZXMgcnVubmluZ1xyXG5cdFx0XHRpZiAodHlwZW9mIGRhdGEuYXR0cnNbXCJjb25maWdcIl0gPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0dmFyIGNvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0IHx8IHt9O1xyXG5cclxuXHRcdFx0XHQvLyBiaW5kXHJcblx0XHRcdFx0dmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oZGF0YSwgYXJncykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YS5hdHRyc1tcImNvbmZpZ1wiXS5hcHBseShkYXRhLCBhcmdzKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0Y29uZmlncy5wdXNoKGNhbGxiYWNrKGRhdGEsIFtub2RlLCAhaXNOZXcsIGNvbnRleHQsIGNhY2hlZF0pKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmICh0eXBlb2YgZGF0YVR5cGUgIT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0Ly9oYW5kbGUgdGV4dCBub2Rlc1xyXG5cdFx0XHR2YXIgbm9kZXM7XHJcblx0XHRcdGlmIChjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRub2RlcyA9IFskZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSldO1xyXG5cdFx0XHRcdFx0aWYgKCFwYXJlbnRFbGVtZW50Lm5vZGVOYW1lLm1hdGNoKHZvaWRFbGVtZW50cykpIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGVzWzBdLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhY2hlZCA9IFwic3RyaW5nIG51bWJlciBib29sZWFuXCIuaW5kZXhPZih0eXBlb2YgZGF0YSkgPiAtMSA/IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpIDogZGF0YTtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC52YWx1ZU9mKCkgIT09IGRhdGEudmFsdWVPZigpIHx8IHNob3VsZFJlYXR0YWNoID09PSB0cnVlKSB7XHJcblx0XHRcdFx0bm9kZXMgPSBjYWNoZWQubm9kZXM7XHJcblx0XHRcdFx0aWYgKCFlZGl0YWJsZSB8fCBlZGl0YWJsZSAhPT0gJGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcclxuXHRcdFx0XHRcdGlmIChkYXRhLiR0cnVzdGVkKSB7XHJcblx0XHRcdFx0XHRcdGNsZWFyKG5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHRcdFx0XHRub2RlcyA9IGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly9jb3JuZXIgY2FzZTogcmVwbGFjaW5nIHRoZSBub2RlVmFsdWUgb2YgYSB0ZXh0IG5vZGUgdGhhdCBpcyBhIGNoaWxkIG9mIGEgdGV4dGFyZWEvY29udGVudGVkaXRhYmxlIGRvZXNuJ3Qgd29ya1xyXG5cdFx0XHRcdFx0XHQvL3dlIG5lZWQgdG8gdXBkYXRlIHRoZSB2YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgcGFyZW50IHRleHRhcmVhIG9yIHRoZSBpbm5lckhUTUwgb2YgdGhlIGNvbnRlbnRlZGl0YWJsZSBlbGVtZW50IGluc3RlYWRcclxuXHRcdFx0XHRcdFx0aWYgKHBhcmVudFRhZyA9PT0gXCJ0ZXh0YXJlYVwiKSBwYXJlbnRFbGVtZW50LnZhbHVlID0gZGF0YTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoZWRpdGFibGUpIGVkaXRhYmxlLmlubmVySFRNTCA9IGRhdGE7XHJcblx0XHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChub2Rlc1swXS5ub2RlVHlwZSA9PT0gMSB8fCBub2Rlcy5sZW5ndGggPiAxKSB7IC8vd2FzIGEgdHJ1c3RlZCBzdHJpbmdcclxuXHRcdFx0XHRcdFx0XHRcdGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcclxuXHRcdFx0XHRcdFx0XHRcdG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0bm9kZXNbMF0ubm9kZVZhbHVlID0gZGF0YVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjYWNoZWRcclxuXHR9XHJcblx0ZnVuY3Rpb24gc29ydENoYW5nZXMoYSwgYikge3JldHVybiBhLmFjdGlvbiAtIGIuYWN0aW9uIHx8IGEuaW5kZXggLSBiLmluZGV4fVxyXG5cdGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMobm9kZSwgdGFnLCBkYXRhQXR0cnMsIGNhY2hlZEF0dHJzLCBuYW1lc3BhY2UpIHtcclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGRhdGFBdHRycykge1xyXG5cdFx0XHR2YXIgZGF0YUF0dHIgPSBkYXRhQXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHR2YXIgY2FjaGVkQXR0ciA9IGNhY2hlZEF0dHJzW2F0dHJOYW1lXTtcclxuXHRcdFx0aWYgKCEoYXR0ck5hbWUgaW4gY2FjaGVkQXR0cnMpIHx8IChjYWNoZWRBdHRyICE9PSBkYXRhQXR0cikpIHtcclxuXHRcdFx0XHRjYWNoZWRBdHRyc1thdHRyTmFtZV0gPSBkYXRhQXR0cjtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Ly9gY29uZmlnYCBpc24ndCBhIHJlYWwgYXR0cmlidXRlcywgc28gaWdub3JlIGl0XHJcblx0XHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IFwiY29uZmlnXCIgfHwgYXR0ck5hbWUgPT0gXCJrZXlcIikgY29udGludWU7XHJcblx0XHRcdFx0XHQvL2hvb2sgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGF1dG8tcmVkcmF3aW5nIHN5c3RlbVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAodHlwZW9mIGRhdGFBdHRyID09PSBGVU5DVElPTiAmJiBhdHRyTmFtZS5pbmRleE9mKFwib25cIikgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0bm9kZVthdHRyTmFtZV0gPSBhdXRvcmVkcmF3KGRhdGFBdHRyLCBub2RlKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly9oYW5kbGUgYHN0eWxlOiB7Li4ufWBcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInN0eWxlXCIgJiYgZGF0YUF0dHIgIT0gbnVsbCAmJiB0eXBlLmNhbGwoZGF0YUF0dHIpID09PSBPQkpFQ1QpIHtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgcnVsZSBpbiBkYXRhQXR0cikge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChjYWNoZWRBdHRyID09IG51bGwgfHwgY2FjaGVkQXR0cltydWxlXSAhPT0gZGF0YUF0dHJbcnVsZV0pIG5vZGUuc3R5bGVbcnVsZV0gPSBkYXRhQXR0cltydWxlXVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gY2FjaGVkQXR0cikge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghKHJ1bGUgaW4gZGF0YUF0dHIpKSBub2RlLnN0eWxlW3J1bGVdID0gXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2hhbmRsZSBTVkdcclxuXHRcdFx0XHRcdGVsc2UgaWYgKG5hbWVzcGFjZSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJocmVmXCIpIG5vZGUuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwiaHJlZlwiLCBkYXRhQXR0cik7XHJcblx0XHRcdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcImNsYXNzTmFtZVwiKSBub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGRhdGFBdHRyKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2hhbmRsZSBjYXNlcyB0aGF0IGFyZSBwcm9wZXJ0aWVzIChidXQgaWdub3JlIGNhc2VzIHdoZXJlIHdlIHNob3VsZCB1c2Ugc2V0QXR0cmlidXRlIGluc3RlYWQpXHJcblx0XHRcdFx0XHQvLy0gbGlzdCBhbmQgZm9ybSBhcmUgdHlwaWNhbGx5IHVzZWQgYXMgc3RyaW5ncywgYnV0IGFyZSBET00gZWxlbWVudCByZWZlcmVuY2VzIGluIGpzXHJcblx0XHRcdFx0XHQvLy0gd2hlbiB1c2luZyBDU1Mgc2VsZWN0b3JzIChlLmcuIGBtKFwiW3N0eWxlPScnXVwiKWApLCBzdHlsZSBpcyB1c2VkIGFzIGEgc3RyaW5nLCBidXQgaXQncyBhbiBvYmplY3QgaW4ganNcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lIGluIG5vZGUgJiYgIShhdHRyTmFtZSA9PT0gXCJsaXN0XCIgfHwgYXR0ck5hbWUgPT09IFwic3R5bGVcIiB8fCBhdHRyTmFtZSA9PT0gXCJmb3JtXCIgfHwgYXR0ck5hbWUgPT09IFwidHlwZVwiKSkge1xyXG5cdFx0XHRcdFx0XHQvLyMzNDggZG9uJ3Qgc2V0IHRoZSB2YWx1ZSBpZiBub3QgbmVlZGVkIG90aGVyd2lzZSBjdXJzb3IgcGxhY2VtZW50IGJyZWFrcyBpbiBDaHJvbWVcclxuXHRcdFx0XHRcdFx0aWYgKHRhZyAhPT0gXCJpbnB1dFwiIHx8IG5vZGVbYXR0ck5hbWVdICE9PSBkYXRhQXR0cikgbm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0clxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHQvL3N3YWxsb3cgSUUncyBpbnZhbGlkIGFyZ3VtZW50IGVycm9ycyB0byBtaW1pYyBIVE1MJ3MgZmFsbGJhY2stdG8tZG9pbmctbm90aGluZy1vbi1pbnZhbGlkLWF0dHJpYnV0ZXMgYmVoYXZpb3JcclxuXHRcdFx0XHRcdGlmIChlLm1lc3NhZ2UuaW5kZXhPZihcIkludmFsaWQgYXJndW1lbnRcIikgPCAwKSB0aHJvdyBlXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIzM0OCBkYXRhQXR0ciBtYXkgbm90IGJlIGEgc3RyaW5nLCBzbyB1c2UgbG9vc2UgY29tcGFyaXNvbiAoZG91YmxlIGVxdWFsKSBpbnN0ZWFkIG9mIHN0cmljdCAodHJpcGxlIGVxdWFsKVxyXG5cdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJ2YWx1ZVwiICYmIHRhZyA9PT0gXCJpbnB1dFwiICYmIG5vZGUudmFsdWUgIT0gZGF0YUF0dHIpIHtcclxuXHRcdFx0XHRub2RlLnZhbHVlID0gZGF0YUF0dHJcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNhY2hlZEF0dHJzXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGNsZWFyKG5vZGVzLCBjYWNoZWQpIHtcclxuXHRcdGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG5cdFx0XHRpZiAobm9kZXNbaV0gJiYgbm9kZXNbaV0ucGFyZW50Tm9kZSkge1xyXG5cdFx0XHRcdHRyeSB7bm9kZXNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2Rlc1tpXSl9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHt9IC8vaWdub3JlIGlmIHRoaXMgZmFpbHMgZHVlIHRvIG9yZGVyIG9mIGV2ZW50cyAoc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE5MjYwODMvZmFpbGVkLXRvLWV4ZWN1dGUtcmVtb3ZlY2hpbGQtb24tbm9kZSlcclxuXHRcdFx0XHRjYWNoZWQgPSBbXS5jb25jYXQoY2FjaGVkKTtcclxuXHRcdFx0XHRpZiAoY2FjaGVkW2ldKSB1bmxvYWQoY2FjaGVkW2ldKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAobm9kZXMubGVuZ3RoICE9IDApIG5vZGVzLmxlbmd0aCA9IDBcclxuXHR9XHJcblx0ZnVuY3Rpb24gdW5sb2FkKGNhY2hlZCkge1xyXG5cdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIHR5cGVvZiBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKCk7XHJcblx0XHRpZiAoY2FjaGVkLmNoaWxkcmVuKSB7XHJcblx0XHRcdGlmICh0eXBlLmNhbGwoY2FjaGVkLmNoaWxkcmVuKSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY2hpbGQ7IGNoaWxkID0gY2FjaGVkLmNoaWxkcmVuW2ldOyBpKyspIHVubG9hZChjaGlsZClcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChjYWNoZWQuY2hpbGRyZW4udGFnKSB1bmxvYWQoY2FjaGVkLmNoaWxkcmVuKVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKSB7XHJcblx0XHR2YXIgbmV4dFNpYmxpbmcgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdO1xyXG5cdFx0aWYgKG5leHRTaWJsaW5nKSB7XHJcblx0XHRcdHZhciBpc0VsZW1lbnQgPSBuZXh0U2libGluZy5ub2RlVHlwZSAhPSAxO1xyXG5cdFx0XHR2YXIgcGxhY2Vob2xkZXIgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcblx0XHRcdGlmIChpc0VsZW1lbnQpIHtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgbmV4dFNpYmxpbmcgfHwgbnVsbCk7XHJcblx0XHRcdFx0cGxhY2Vob2xkZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZGF0YSk7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwbGFjZWhvbGRlcilcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIG5leHRTaWJsaW5nLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGRhdGEpXHJcblx0XHR9XHJcblx0XHRlbHNlIHBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGRhdGEpO1xyXG5cdFx0dmFyIG5vZGVzID0gW107XHJcblx0XHR3aGlsZSAocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSAhPT0gbmV4dFNpYmxpbmcpIHtcclxuXHRcdFx0bm9kZXMucHVzaChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdFx0aW5kZXgrK1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG5vZGVzXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGF1dG9yZWRyYXcoY2FsbGJhY2ssIG9iamVjdCkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKTtcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHRyeSB7cmV0dXJuIGNhbGxiYWNrLmNhbGwob2JqZWN0LCBlKX1cclxuXHRcdFx0ZmluYWxseSB7XHJcblx0XHRcdFx0ZW5kRmlyc3RDb21wdXRhdGlvbigpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBodG1sO1xyXG5cdHZhciBkb2N1bWVudE5vZGUgPSB7XHJcblx0XHRhcHBlbmRDaGlsZDogZnVuY3Rpb24obm9kZSkge1xyXG5cdFx0XHRpZiAoaHRtbCA9PT0gdW5kZWZpbmVkKSBodG1sID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJodG1sXCIpO1xyXG5cdFx0XHRpZiAoJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICE9PSBub2RlKSB7XHJcblx0XHRcdFx0JGRvY3VtZW50LnJlcGxhY2VDaGlsZChub2RlLCAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgJGRvY3VtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG5cdFx0XHR0aGlzLmNoaWxkTm9kZXMgPSAkZG9jdW1lbnQuY2hpbGROb2Rlc1xyXG5cdFx0fSxcclxuXHRcdGluc2VydEJlZm9yZTogZnVuY3Rpb24obm9kZSkge1xyXG5cdFx0XHR0aGlzLmFwcGVuZENoaWxkKG5vZGUpXHJcblx0XHR9LFxyXG5cdFx0Y2hpbGROb2RlczogW11cclxuXHR9O1xyXG5cdHZhciBub2RlQ2FjaGUgPSBbXSwgY2VsbENhY2hlID0ge307XHJcblx0bS5yZW5kZXIgPSBmdW5jdGlvbihyb290LCBjZWxsLCBmb3JjZVJlY3JlYXRpb24pIHtcclxuXHRcdHZhciBjb25maWdzID0gW107XHJcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBlbnN1cmUgdGhlIERPTSBlbGVtZW50IGV4aXN0cyBiZWZvcmUgcmVuZGVyaW5nIGEgdGVtcGxhdGUgaW50byBpdC5cIik7XHJcblx0XHR2YXIgaWQgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdCk7XHJcblx0XHR2YXIgaXNEb2N1bWVudFJvb3QgPSByb290ID09PSAkZG9jdW1lbnQ7XHJcblx0XHR2YXIgbm9kZSA9IGlzRG9jdW1lbnRSb290IHx8IHJvb3QgPT09ICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyBkb2N1bWVudE5vZGUgOiByb290O1xyXG5cdFx0aWYgKGlzRG9jdW1lbnRSb290ICYmIGNlbGwudGFnICE9IFwiaHRtbFwiKSBjZWxsID0ge3RhZzogXCJodG1sXCIsIGF0dHJzOiB7fSwgY2hpbGRyZW46IGNlbGx9O1xyXG5cdFx0aWYgKGNlbGxDYWNoZVtpZF0gPT09IHVuZGVmaW5lZCkgY2xlYXIobm9kZS5jaGlsZE5vZGVzKTtcclxuXHRcdGlmIChmb3JjZVJlY3JlYXRpb24gPT09IHRydWUpIHJlc2V0KHJvb3QpO1xyXG5cdFx0Y2VsbENhY2hlW2lkXSA9IGJ1aWxkKG5vZGUsIG51bGwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjZWxsLCBjZWxsQ2FjaGVbaWRdLCBmYWxzZSwgMCwgbnVsbCwgdW5kZWZpbmVkLCBjb25maWdzKTtcclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBjb25maWdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSBjb25maWdzW2ldKClcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGdldENlbGxDYWNoZUtleShlbGVtZW50KSB7XHJcblx0XHR2YXIgaW5kZXggPSBub2RlQ2FjaGUuaW5kZXhPZihlbGVtZW50KTtcclxuXHRcdHJldHVybiBpbmRleCA8IDAgPyBub2RlQ2FjaGUucHVzaChlbGVtZW50KSAtIDEgOiBpbmRleFxyXG5cdH1cclxuXHJcblx0bS50cnVzdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHR2YWx1ZSA9IG5ldyBTdHJpbmcodmFsdWUpO1xyXG5cdFx0dmFsdWUuJHRydXN0ZWQgPSB0cnVlO1xyXG5cdFx0cmV0dXJuIHZhbHVlXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gZ2V0dGVyc2V0dGVyKHN0b3JlKSB7XHJcblx0XHR2YXIgcHJvcCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCkgc3RvcmUgPSBhcmd1bWVudHNbMF07XHJcblx0XHRcdHJldHVybiBzdG9yZVxyXG5cdFx0fTtcclxuXHJcblx0XHRwcm9wLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gc3RvcmVcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIHByb3BcclxuXHR9XHJcblxyXG5cdG0ucHJvcCA9IGZ1bmN0aW9uIChzdG9yZSkge1xyXG5cdFx0Ly9ub3RlOiB1c2luZyBub24tc3RyaWN0IGVxdWFsaXR5IGNoZWNrIGhlcmUgYmVjYXVzZSB3ZSdyZSBjaGVja2luZyBpZiBzdG9yZSBpcyBudWxsIE9SIHVuZGVmaW5lZFxyXG5cdFx0aWYgKCgoc3RvcmUgIT0gbnVsbCAmJiB0eXBlLmNhbGwoc3RvcmUpID09PSBPQkpFQ1QpIHx8IHR5cGVvZiBzdG9yZSA9PT0gRlVOQ1RJT04pICYmIHR5cGVvZiBzdG9yZS50aGVuID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGlmeShzdG9yZSlcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZ2V0dGVyc2V0dGVyKHN0b3JlKVxyXG5cdH07XHJcblxyXG5cdHZhciByb290cyA9IFtdLCBtb2R1bGVzID0gW10sIGNvbnRyb2xsZXJzID0gW10sIGxhc3RSZWRyYXdJZCA9IG51bGwsIGxhc3RSZWRyYXdDYWxsVGltZSA9IDAsIGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGwsIHByZXZlbnRlZCA9IGZhbHNlLCB0b3BNb2R1bGU7XHJcblx0dmFyIEZSQU1FX0JVREdFVCA9IDE2OyAvLzYwIGZyYW1lcyBwZXIgc2Vjb25kID0gMSBjYWxsIHBlciAxNiBtc1xyXG5cdG0ubW9kdWxlID0gZnVuY3Rpb24ocm9vdCwgbW9kdWxlKSB7XHJcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBlbnN1cmUgdGhlIERPTSBlbGVtZW50IGV4aXN0cyBiZWZvcmUgcmVuZGVyaW5nIGEgdGVtcGxhdGUgaW50byBpdC5cIik7XHJcblx0XHR2YXIgaW5kZXggPSByb290cy5pbmRleE9mKHJvb3QpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgaW5kZXggPSByb290cy5sZW5ndGg7XHJcblx0XHR2YXIgaXNQcmV2ZW50ZWQgPSBmYWxzZTtcclxuXHRcdGlmIChjb250cm9sbGVyc1tpbmRleF0gJiYgdHlwZW9mIGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0dmFyIGV2ZW50ID0ge1xyXG5cdFx0XHRcdHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpIHtpc1ByZXZlbnRlZCA9IHRydWV9XHJcblx0XHRcdH07XHJcblx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZChldmVudClcclxuXHRcdH1cclxuXHRcdGlmICghaXNQcmV2ZW50ZWQpIHtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJhbGxcIik7XHJcblx0XHRcdG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0XHRyb290c1tpbmRleF0gPSByb290O1xyXG5cdFx0XHR2YXIgY3VycmVudE1vZHVsZSA9IHRvcE1vZHVsZSA9IG1vZHVsZSA9IG1vZHVsZSB8fCB7fTtcclxuXHRcdFx0dmFyIGNvbnRyb2xsZXIgPSBuZXcgKG1vZHVsZS5jb250cm9sbGVyIHx8IGZ1bmN0aW9uKCkge30pO1xyXG5cdFx0XHQvL2NvbnRyb2xsZXJzIG1heSBjYWxsIG0ubW9kdWxlIHJlY3Vyc2l2ZWx5ICh2aWEgbS5yb3V0ZSByZWRpcmVjdHMsIGZvciBleGFtcGxlKVxyXG5cdFx0XHQvL3RoaXMgY29uZGl0aW9uYWwgZW5zdXJlcyBvbmx5IHRoZSBsYXN0IHJlY3Vyc2l2ZSBtLm1vZHVsZSBjYWxsIGlzIGFwcGxpZWRcclxuXHRcdFx0aWYgKGN1cnJlbnRNb2R1bGUgPT09IHRvcE1vZHVsZSkge1xyXG5cdFx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XSA9IGNvbnRyb2xsZXI7XHJcblx0XHRcdFx0bW9kdWxlc1tpbmRleF0gPSBtb2R1bGVcclxuXHRcdFx0fVxyXG5cdFx0XHRlbmRGaXJzdENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHJldHVybiBjb250cm9sbGVyc1tpbmRleF1cclxuXHRcdH1cclxuXHR9O1xyXG5cdG0ucmVkcmF3ID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuXHRcdC8vbGFzdFJlZHJhd0lkIGlzIGEgcG9zaXRpdmUgbnVtYmVyIGlmIGEgc2Vjb25kIHJlZHJhdyBpcyByZXF1ZXN0ZWQgYmVmb3JlIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZVxyXG5cdFx0Ly9sYXN0UmVkcmF3SUQgaXMgbnVsbCBpZiBpdCdzIHRoZSBmaXJzdCByZWRyYXcgYW5kIG5vdCBhbiBldmVudCBoYW5kbGVyXHJcblx0XHRpZiAobGFzdFJlZHJhd0lkICYmIGZvcmNlICE9PSB0cnVlKSB7XHJcblx0XHRcdC8vd2hlbiBzZXRUaW1lb3V0OiBvbmx5IHJlc2NoZWR1bGUgcmVkcmF3IGlmIHRpbWUgYmV0d2VlbiBub3cgYW5kIHByZXZpb3VzIHJlZHJhdyBpcyBiaWdnZXIgdGhhbiBhIGZyYW1lLCBvdGhlcndpc2Uga2VlcCBjdXJyZW50bHkgc2NoZWR1bGVkIHRpbWVvdXRcclxuXHRcdFx0Ly93aGVuIHJBRjogYWx3YXlzIHJlc2NoZWR1bGUgcmVkcmF3XHJcblx0XHRcdGlmIChuZXcgRGF0ZSAtIGxhc3RSZWRyYXdDYWxsVGltZSA+IEZSQU1FX0JVREdFVCB8fCAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XHJcblx0XHRcdFx0aWYgKGxhc3RSZWRyYXdJZCA+IDApICRjYW5jZWxBbmltYXRpb25GcmFtZShsYXN0UmVkcmF3SWQpO1xyXG5cdFx0XHRcdGxhc3RSZWRyYXdJZCA9ICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVkcmF3LCBGUkFNRV9CVURHRVQpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRyZWRyYXcoKTtcclxuXHRcdFx0bGFzdFJlZHJhd0lkID0gJHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtsYXN0UmVkcmF3SWQgPSBudWxsfSwgRlJBTUVfQlVER0VUKVxyXG5cdFx0fVxyXG5cdH07XHJcblx0bS5yZWRyYXcuc3RyYXRlZ3kgPSBtLnByb3AoKTtcclxuXHR2YXIgYmxhbmsgPSBmdW5jdGlvbigpIHtyZXR1cm4gXCJcIn1cclxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XHJcblx0XHR2YXIgZm9yY2VSZWRyYXcgPSBtLnJlZHJhdy5zdHJhdGVneSgpID09PSBcImFsbFwiO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIHJvb3Q7IHJvb3QgPSByb290c1tpXTsgaSsrKSB7XHJcblx0XHRcdGlmIChjb250cm9sbGVyc1tpXSkge1xyXG5cdFx0XHRcdG0ucmVuZGVyKHJvb3QsIG1vZHVsZXNbaV0udmlldyA/IG1vZHVsZXNbaV0udmlldyhjb250cm9sbGVyc1tpXSkgOiBibGFuaygpLCBmb3JjZVJlZHJhdylcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9hZnRlciByZW5kZXJpbmcgd2l0aGluIGEgcm91dGVkIGNvbnRleHQsIHdlIG5lZWQgdG8gc2Nyb2xsIGJhY2sgdG8gdGhlIHRvcCwgYW5kIGZldGNoIHRoZSBkb2N1bWVudCB0aXRsZSBmb3IgaGlzdG9yeS5wdXNoU3RhdGVcclxuXHRcdGlmIChjb21wdXRlUG9zdFJlZHJhd0hvb2spIHtcclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rKCk7XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGxcclxuXHRcdH1cclxuXHRcdGxhc3RSZWRyYXdJZCA9IG51bGw7XHJcblx0XHRsYXN0UmVkcmF3Q2FsbFRpbWUgPSBuZXcgRGF0ZTtcclxuXHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKVxyXG5cdH1cclxuXHJcblx0dmFyIHBlbmRpbmdSZXF1ZXN0cyA9IDA7XHJcblx0bS5zdGFydENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7cGVuZGluZ1JlcXVlc3RzKyt9O1xyXG5cdG0uZW5kQ29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdHBlbmRpbmdSZXF1ZXN0cyA9IE1hdGgubWF4KHBlbmRpbmdSZXF1ZXN0cyAtIDEsIDApO1xyXG5cdFx0aWYgKHBlbmRpbmdSZXF1ZXN0cyA9PT0gMCkgbS5yZWRyYXcoKVxyXG5cdH07XHJcblx0dmFyIGVuZEZpcnN0Q29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmIChtLnJlZHJhdy5zdHJhdGVneSgpID09IFwibm9uZVwiKSB7XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cy0tXHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBtLmVuZENvbXB1dGF0aW9uKCk7XHJcblx0fVxyXG5cclxuXHRtLndpdGhBdHRyID0gZnVuY3Rpb24ocHJvcCwgd2l0aEF0dHJDYWxsYmFjaykge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdHZhciBjdXJyZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IHRoaXM7XHJcblx0XHRcdHdpdGhBdHRyQ2FsbGJhY2socHJvcCBpbiBjdXJyZW50VGFyZ2V0ID8gY3VycmVudFRhcmdldFtwcm9wXSA6IGN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApKVxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vcm91dGluZ1xyXG5cdHZhciBtb2RlcyA9IHtwYXRobmFtZTogXCJcIiwgaGFzaDogXCIjXCIsIHNlYXJjaDogXCI/XCJ9O1xyXG5cdHZhciByZWRpcmVjdCA9IGZ1bmN0aW9uKCkge30sIHJvdXRlUGFyYW1zLCBjdXJyZW50Um91dGU7XHJcblx0bS5yb3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly9tLnJvdXRlKClcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFJvdXRlO1xyXG5cdFx0Ly9tLnJvdXRlKGVsLCBkZWZhdWx0Um91dGUsIHJvdXRlcylcclxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgdHlwZS5jYWxsKGFyZ3VtZW50c1sxXSkgPT09IFNUUklORykge1xyXG5cdFx0XHR2YXIgcm9vdCA9IGFyZ3VtZW50c1swXSwgZGVmYXVsdFJvdXRlID0gYXJndW1lbnRzWzFdLCByb3V0ZXIgPSBhcmd1bWVudHNbMl07XHJcblx0XHRcdHJlZGlyZWN0ID0gZnVuY3Rpb24oc291cmNlKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSBjdXJyZW50Um91dGUgPSBub3JtYWxpemVSb3V0ZShzb3VyY2UpO1xyXG5cdFx0XHRcdGlmICghcm91dGVCeVZhbHVlKHJvb3QsIHJvdXRlciwgcGF0aCkpIHtcclxuXHRcdFx0XHRcdG0ucm91dGUoZGVmYXVsdFJvdXRlLCB0cnVlKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0dmFyIGxpc3RlbmVyID0gbS5yb3V0ZS5tb2RlID09PSBcImhhc2hcIiA/IFwib25oYXNoY2hhbmdlXCIgOiBcIm9ucG9wc3RhdGVcIjtcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBwYXRoID0gJGxvY2F0aW9uW20ucm91dGUubW9kZV1cclxuXHRcdFx0XHRpZiAobS5yb3V0ZS5tb2RlID09PSBcInBhdGhuYW1lXCIpIHBhdGggKz0gJGxvY2F0aW9uLnNlYXJjaFxyXG5cdFx0XHRcdGlmIChjdXJyZW50Um91dGUgIT0gbm9ybWFsaXplUm91dGUocGF0aCkpIHtcclxuXHRcdFx0XHRcdHJlZGlyZWN0KHBhdGgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBzZXRTY3JvbGw7XHJcblx0XHRcdHdpbmRvd1tsaXN0ZW5lcl0oKVxyXG5cdFx0fVxyXG5cdFx0Ly9jb25maWc6IG0ucm91dGVcclxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50c1swXS5hZGRFdmVudExpc3RlbmVyKSB7XHJcblx0XHRcdHZhciBlbGVtZW50ID0gYXJndW1lbnRzWzBdO1xyXG5cdFx0XHR2YXIgaXNJbml0aWFsaXplZCA9IGFyZ3VtZW50c1sxXTtcclxuXHRcdFx0dmFyIGNvbnRleHQgPSBhcmd1bWVudHNbMl07XHJcblx0XHRcdGVsZW1lbnQuaHJlZiA9IChtLnJvdXRlLm1vZGUgIT09ICdwYXRobmFtZScgPyAkbG9jYXRpb24ucGF0aG5hbWUgOiAnJykgKyBtb2Rlc1ttLnJvdXRlLm1vZGVdICsgdGhpcy5hdHRycy5ocmVmO1xyXG5cdFx0XHRlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSlcclxuXHRcdH1cclxuXHRcdC8vbS5yb3V0ZShyb3V0ZSwgcGFyYW1zKVxyXG5cdFx0ZWxzZSBpZiAodHlwZS5jYWxsKGFyZ3VtZW50c1swXSkgPT09IFNUUklORykge1xyXG5cdFx0XHR2YXIgb2xkUm91dGUgPSBjdXJyZW50Um91dGU7XHJcblx0XHRcdGN1cnJlbnRSb3V0ZSA9IGFyZ3VtZW50c1swXTtcclxuXHRcdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHNbMV0gfHwge31cclxuXHRcdFx0dmFyIHF1ZXJ5SW5kZXggPSBjdXJyZW50Um91dGUuaW5kZXhPZihcIj9cIilcclxuXHRcdFx0dmFyIHBhcmFtcyA9IHF1ZXJ5SW5kZXggPiAtMSA/IHBhcnNlUXVlcnlTdHJpbmcoY3VycmVudFJvdXRlLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKSkgOiB7fVxyXG5cdFx0XHRmb3IgKHZhciBpIGluIGFyZ3MpIHBhcmFtc1tpXSA9IGFyZ3NbaV1cclxuXHRcdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhwYXJhbXMpXHJcblx0XHRcdHZhciBjdXJyZW50UGF0aCA9IHF1ZXJ5SW5kZXggPiAtMSA/IGN1cnJlbnRSb3V0ZS5zbGljZSgwLCBxdWVyeUluZGV4KSA6IGN1cnJlbnRSb3V0ZVxyXG5cdFx0XHRpZiAocXVlcnlzdHJpbmcpIGN1cnJlbnRSb3V0ZSA9IGN1cnJlbnRQYXRoICsgKGN1cnJlbnRQYXRoLmluZGV4T2YoXCI/XCIpID09PSAtMSA/IFwiP1wiIDogXCImXCIpICsgcXVlcnlzdHJpbmc7XHJcblxyXG5cdFx0XHR2YXIgc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA9IChhcmd1bWVudHMubGVuZ3RoID09PSAzID8gYXJndW1lbnRzWzJdIDogYXJndW1lbnRzWzFdKSA9PT0gdHJ1ZSB8fCBvbGRSb3V0ZSA9PT0gYXJndW1lbnRzWzBdO1xyXG5cclxuXHRcdFx0aWYgKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSkge1xyXG5cdFx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0d2luZG93Lmhpc3Rvcnlbc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA/IFwicmVwbGFjZVN0YXRlXCIgOiBcInB1c2hTdGF0ZVwiXShudWxsLCAkZG9jdW1lbnQudGl0bGUsIG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpO1xyXG5cdFx0XHRcdFx0c2V0U2Nyb2xsKClcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHJlZGlyZWN0KG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSAkbG9jYXRpb25bbS5yb3V0ZS5tb2RlXSA9IGN1cnJlbnRSb3V0ZVxyXG5cdFx0fVxyXG5cdH07XHJcblx0bS5yb3V0ZS5wYXJhbSA9IGZ1bmN0aW9uKGtleSkge1xyXG5cdFx0aWYgKCFyb3V0ZVBhcmFtcykgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgY2FsbCBtLnJvdXRlKGVsZW1lbnQsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKSBiZWZvcmUgY2FsbGluZyBtLnJvdXRlLnBhcmFtKClcIilcclxuXHRcdHJldHVybiByb3V0ZVBhcmFtc1trZXldXHJcblx0fTtcclxuXHRtLnJvdXRlLm1vZGUgPSBcInNlYXJjaFwiO1xyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlKHJvdXRlKSB7XHJcblx0XHRyZXR1cm4gcm91dGUuc2xpY2UobW9kZXNbbS5yb3V0ZS5tb2RlXS5sZW5ndGgpXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJvdXRlQnlWYWx1ZShyb290LCByb3V0ZXIsIHBhdGgpIHtcclxuXHRcdHJvdXRlUGFyYW1zID0ge307XHJcblxyXG5cdFx0dmFyIHF1ZXJ5U3RhcnQgPSBwYXRoLmluZGV4T2YoXCI/XCIpO1xyXG5cdFx0aWYgKHF1ZXJ5U3RhcnQgIT09IC0xKSB7XHJcblx0XHRcdHJvdXRlUGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhwYXRoLnN1YnN0cihxdWVyeVN0YXJ0ICsgMSwgcGF0aC5sZW5ndGgpKTtcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyKDAsIHF1ZXJ5U3RhcnQpXHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yICh2YXIgcm91dGUgaW4gcm91dGVyKSB7XHJcblx0XHRcdGlmIChyb3V0ZSA9PT0gcGF0aCkge1xyXG5cdFx0XHRcdG0ubW9kdWxlKHJvb3QsIHJvdXRlcltyb3V0ZV0pO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcIl5cIiArIHJvdXRlLnJlcGxhY2UoLzpbXlxcL10rP1xcLnszfS9nLCBcIiguKj8pXCIpLnJlcGxhY2UoLzpbXlxcL10rL2csIFwiKFteXFxcXC9dKylcIikgKyBcIlxcLz8kXCIpO1xyXG5cclxuXHRcdFx0aWYgKG1hdGNoZXIudGVzdChwYXRoKSkge1xyXG5cdFx0XHRcdHBhdGgucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBrZXlzID0gcm91dGUubWF0Y2goLzpbXlxcL10rL2cpIHx8IFtdO1xyXG5cdFx0XHRcdFx0dmFyIHZhbHVlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAtMik7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykgcm91dGVQYXJhbXNba2V5c1tpXS5yZXBsYWNlKC86fFxcLi9nLCBcIlwiKV0gPSBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2ldKVxyXG5cdFx0XHRcdFx0bS5tb2R1bGUocm9vdCwgcm91dGVyW3JvdXRlXSlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJvdXRlVW5vYnRydXNpdmUoZSkge1xyXG5cdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLndoaWNoID09PSAyKSByZXR1cm47XHJcblx0XHRpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZWxzZSBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHR2YXIgY3VycmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCB0aGlzO1xyXG5cdFx0dmFyIGFyZ3MgPSBtLnJvdXRlLm1vZGUgPT09IFwicGF0aG5hbWVcIiAmJiBjdXJyZW50VGFyZ2V0LnNlYXJjaCA/IHBhcnNlUXVlcnlTdHJpbmcoY3VycmVudFRhcmdldC5zZWFyY2guc2xpY2UoMSkpIDoge307XHJcblx0XHRtLnJvdXRlKGN1cnJlbnRUYXJnZXRbbS5yb3V0ZS5tb2RlXS5zbGljZShtb2Rlc1ttLnJvdXRlLm1vZGVdLmxlbmd0aCksIGFyZ3MpXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNldFNjcm9sbCgpIHtcclxuXHRcdGlmIChtLnJvdXRlLm1vZGUgIT0gXCJoYXNoXCIgJiYgJGxvY2F0aW9uLmhhc2gpICRsb2NhdGlvbi5oYXNoID0gJGxvY2F0aW9uLmhhc2g7XHJcblx0XHRlbHNlIHdpbmRvdy5zY3JvbGxUbygwLCAwKVxyXG5cdH1cclxuXHRmdW5jdGlvbiBidWlsZFF1ZXJ5U3RyaW5nKG9iamVjdCwgcHJlZml4KSB7XHJcblx0XHR2YXIgc3RyID0gW107XHJcblx0XHRmb3IodmFyIHByb3AgaW4gb2JqZWN0KSB7XHJcblx0XHRcdHZhciBrZXkgPSBwcmVmaXggPyBwcmVmaXggKyBcIltcIiArIHByb3AgKyBcIl1cIiA6IHByb3AsIHZhbHVlID0gb2JqZWN0W3Byb3BdO1xyXG5cdFx0XHR2YXIgdmFsdWVUeXBlID0gdHlwZS5jYWxsKHZhbHVlKVxyXG5cdFx0XHR2YXIgcGFpciA9IHZhbHVlICE9IG51bGwgJiYgKHZhbHVlVHlwZSA9PT0gT0JKRUNUKSA/XHJcblx0XHRcdFx0YnVpbGRRdWVyeVN0cmluZyh2YWx1ZSwga2V5KSA6XHJcblx0XHRcdFx0dmFsdWVUeXBlID09PSBBUlJBWSA/XHJcblx0XHRcdFx0XHR2YWx1ZS5tYXAoZnVuY3Rpb24oaXRlbSkge3JldHVybiBlbmNvZGVVUklDb21wb25lbnQoa2V5ICsgXCJbXVwiKSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0pfSkuam9pbihcIiZcIikgOlxyXG5cdFx0XHRcdFx0ZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcclxuXHRcdFx0c3RyLnB1c2gocGFpcilcclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHIuam9pbihcIiZcIilcclxuXHR9XHJcblx0XHJcblx0ZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHIpIHtcclxuXHRcdHZhciBwYWlycyA9IHN0ci5zcGxpdChcIiZcIiksIHBhcmFtcyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHZhciBwYWlyID0gcGFpcnNbaV0uc3BsaXQoXCI9XCIpO1xyXG5cdFx0XHRwYXJhbXNbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMF0pXSA9IHBhaXJbMV0gPyBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSkgOiBcIlwiXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcGFyYW1zXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJlc2V0KHJvb3QpIHtcclxuXHRcdHZhciBjYWNoZUtleSA9IGdldENlbGxDYWNoZUtleShyb290KTtcclxuXHRcdGNsZWFyKHJvb3QuY2hpbGROb2RlcywgY2VsbENhY2hlW2NhY2hlS2V5XSk7XHJcblx0XHRjZWxsQ2FjaGVbY2FjaGVLZXldID0gdW5kZWZpbmVkXHJcblx0fVxyXG5cclxuXHRtLmRlZmVycmVkID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XHJcblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcHJvcGlmeShkZWZlcnJlZC5wcm9taXNlKTtcclxuXHRcdHJldHVybiBkZWZlcnJlZFxyXG5cdH07XHJcblx0ZnVuY3Rpb24gcHJvcGlmeShwcm9taXNlKSB7XHJcblx0XHR2YXIgcHJvcCA9IG0ucHJvcCgpO1xyXG5cdFx0cHJvbWlzZS50aGVuKHByb3ApO1xyXG5cdFx0cHJvcC50aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHJldHVybiBwcm9waWZ5KHByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpKVxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBwcm9wXHJcblx0fVxyXG5cdC8vUHJvbWl6Lm1pdGhyaWwuanMgfCBab2xtZWlzdGVyIHwgTUlUXHJcblx0Ly9hIG1vZGlmaWVkIHZlcnNpb24gb2YgUHJvbWl6LmpzLCB3aGljaCBkb2VzIG5vdCBjb25mb3JtIHRvIFByb21pc2VzL0ErIGZvciB0d28gcmVhc29uczpcclxuXHQvLzEpIGB0aGVuYCBjYWxsYmFja3MgYXJlIGNhbGxlZCBzeW5jaHJvbm91c2x5IChiZWNhdXNlIHNldFRpbWVvdXQgaXMgdG9vIHNsb3csIGFuZCB0aGUgc2V0SW1tZWRpYXRlIHBvbHlmaWxsIGlzIHRvbyBiaWdcclxuXHQvLzIpIHRocm93aW5nIHN1YmNsYXNzZXMgb2YgRXJyb3IgY2F1c2UgdGhlIGVycm9yIHRvIGJlIGJ1YmJsZWQgdXAgaW5zdGVhZCBvZiB0cmlnZ2VyaW5nIHJlamVjdGlvbiAoYmVjYXVzZSB0aGUgc3BlYyBkb2VzIG5vdCBhY2NvdW50IGZvciB0aGUgaW1wb3J0YW50IHVzZSBjYXNlIG9mIGRlZmF1bHQgYnJvd3NlciBlcnJvciBoYW5kbGluZywgaS5lLiBtZXNzYWdlIHcvIGxpbmUgbnVtYmVyKVxyXG5cdGZ1bmN0aW9uIERlZmVycmVkKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XHJcblx0XHR2YXIgUkVTT0xWSU5HID0gMSwgUkVKRUNUSU5HID0gMiwgUkVTT0xWRUQgPSAzLCBSRUpFQ1RFRCA9IDQ7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXMsIHN0YXRlID0gMCwgcHJvbWlzZVZhbHVlID0gMCwgbmV4dCA9IFtdO1xyXG5cclxuXHRcdHNlbGZbXCJwcm9taXNlXCJdID0ge307XHJcblxyXG5cdFx0c2VsZltcInJlc29sdmVcIl0gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblxyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9O1xyXG5cclxuXHRcdHNlbGZbXCJyZWplY3RcIl0gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblxyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9O1xyXG5cclxuXHRcdHNlbGYucHJvbWlzZVtcInRoZW5cIl0gPSBmdW5jdGlvbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xyXG5cdFx0XHRpZiAoc3RhdGUgPT09IFJFU09MVkVEKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlVmFsdWUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT09IFJFSkVDVEVEKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KHByb21pc2VWYWx1ZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRuZXh0LnB1c2goZGVmZXJyZWQpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmluaXNoKHR5cGUpIHtcclxuXHRcdFx0c3RhdGUgPSB0eXBlIHx8IFJFSkVDVEVEO1xyXG5cdFx0XHRuZXh0Lm1hcChmdW5jdGlvbihkZWZlcnJlZCkge1xyXG5cdFx0XHRcdHN0YXRlID09PSBSRVNPTFZFRCAmJiBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VWYWx1ZSkgfHwgZGVmZXJyZWQucmVqZWN0KHByb21pc2VWYWx1ZSlcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0aGVubmFibGUodGhlbiwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2ssIG5vdFRoZW5uYWJsZUNhbGxiYWNrKSB7XHJcblx0XHRcdGlmICgoKHByb21pc2VWYWx1ZSAhPSBudWxsICYmIHR5cGUuY2FsbChwcm9taXNlVmFsdWUpID09PSBPQkpFQ1QpIHx8IHR5cGVvZiBwcm9taXNlVmFsdWUgPT09IEZVTkNUSU9OKSAmJiB0eXBlb2YgdGhlbiA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Ly8gY291bnQgcHJvdGVjdHMgYWdhaW5zdCBhYnVzZSBjYWxscyBmcm9tIHNwZWMgY2hlY2tlclxyXG5cdFx0XHRcdFx0dmFyIGNvdW50ID0gMDtcclxuXHRcdFx0XHRcdHRoZW4uY2FsbChwcm9taXNlVmFsdWUsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb3VudCsrKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKVxyXG5cdFx0XHRcdFx0fSwgZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb3VudCsrKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRmYWlsdXJlQ2FsbGJhY2soKVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0XHRmYWlsdXJlQ2FsbGJhY2soKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRub3RUaGVubmFibGVDYWxsYmFjaygpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXJlKCkge1xyXG5cdFx0XHQvLyBjaGVjayBpZiBpdCdzIGEgdGhlbmFibGVcclxuXHRcdFx0dmFyIHRoZW47XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dGhlbiA9IHByb21pc2VWYWx1ZSAmJiBwcm9taXNlVmFsdWUudGhlblxyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblx0XHRcdFx0cmV0dXJuIGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHRoZW5uYWJsZSh0aGVuLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFU09MVklORztcclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRpZiAoc3RhdGUgPT09IFJFU09MVklORyAmJiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBzdWNjZXNzQ2FsbGJhY2socHJvbWlzZVZhbHVlKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT09IFJFSkVDVElORyAmJiB0eXBlb2YgZmFpbHVyZUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZmFpbHVyZUNhbGxiYWNrKHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZpbmlzaCgpXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAocHJvbWlzZVZhbHVlID09PSBzZWxmKSB7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBUeXBlRXJyb3IoKTtcclxuXHRcdFx0XHRcdGZpbmlzaCgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhlbm5hYmxlKHRoZW4sIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKFJFU09MVkVEKVxyXG5cdFx0XHRcdFx0fSwgZmluaXNoLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGZpbmlzaChzdGF0ZSA9PT0gUkVTT0xWSU5HICYmIFJFU09MVkVEKVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fVxyXG5cdG0uZGVmZXJyZWQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdGlmICh0eXBlLmNhbGwoZSkgPT09IFwiW29iamVjdCBFcnJvcl1cIiAmJiAhZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC8gRXJyb3IvKSkgdGhyb3cgZVxyXG5cdH07XHJcblxyXG5cdG0uc3luYyA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuXHRcdHZhciBtZXRob2QgPSBcInJlc29sdmVcIjtcclxuXHRcdGZ1bmN0aW9uIHN5bmNocm9uaXplcihwb3MsIHJlc29sdmVkKSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdHJlc3VsdHNbcG9zXSA9IHZhbHVlO1xyXG5cdFx0XHRcdGlmICghcmVzb2x2ZWQpIG1ldGhvZCA9IFwicmVqZWN0XCI7XHJcblx0XHRcdFx0aWYgKC0tb3V0c3RhbmRpbmcgPT09IDApIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnByb21pc2UocmVzdWx0cyk7XHJcblx0XHRcdFx0XHRkZWZlcnJlZFttZXRob2RdKHJlc3VsdHMpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xyXG5cdFx0dmFyIG91dHN0YW5kaW5nID0gYXJncy5sZW5ndGg7XHJcblx0XHR2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShvdXRzdGFuZGluZyk7XHJcblx0XHRpZiAoYXJncy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGFyZ3NbaV0udGhlbihzeW5jaHJvbml6ZXIoaSwgdHJ1ZSksIHN5bmNocm9uaXplcihpLCBmYWxzZSkpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgZGVmZXJyZWQucmVzb2x2ZShbXSk7XHJcblxyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7cmV0dXJuIHZhbHVlfVxyXG5cclxuXHRmdW5jdGlvbiBhamF4KG9wdGlvbnMpIHtcclxuXHRcdGlmIChvcHRpb25zLmRhdGFUeXBlICYmIG9wdGlvbnMuZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29ucFwiKSB7XHJcblx0XHRcdHZhciBjYWxsYmFja0tleSA9IFwibWl0aHJpbF9jYWxsYmFja19cIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgXCJfXCIgKyAoTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikpLnRvU3RyaW5nKDM2KTtcclxuXHRcdFx0dmFyIHNjcmlwdCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xyXG5cclxuXHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IGZ1bmN0aW9uKHJlc3ApIHtcclxuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG5cdFx0XHRcdG9wdGlvbnMub25sb2FkKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwibG9hZFwiLFxyXG5cdFx0XHRcdFx0dGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlVGV4dDogcmVzcFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSB1bmRlZmluZWRcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcblxyXG5cdFx0XHRcdG9wdGlvbnMub25lcnJvcih7XHJcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXHJcblx0XHRcdFx0XHR0YXJnZXQ6IHtcclxuXHRcdFx0XHRcdFx0c3RhdHVzOiA1MDAsXHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlVGV4dDogSlNPTi5zdHJpbmdpZnkoe2Vycm9yOiBcIkVycm9yIG1ha2luZyBqc29ucCByZXF1ZXN0XCJ9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5zcmMgPSBvcHRpb25zLnVybFxyXG5cdFx0XHRcdCsgKG9wdGlvbnMudXJsLmluZGV4T2YoXCI/XCIpID4gMCA/IFwiJlwiIDogXCI/XCIpXHJcblx0XHRcdFx0KyAob3B0aW9ucy5jYWxsYmFja0tleSA/IG9wdGlvbnMuY2FsbGJhY2tLZXkgOiBcImNhbGxiYWNrXCIpXHJcblx0XHRcdFx0KyBcIj1cIiArIGNhbGxiYWNrS2V5XHJcblx0XHRcdFx0KyBcIiZcIiArIGJ1aWxkUXVlcnlTdHJpbmcob3B0aW9ucy5kYXRhIHx8IHt9KTtcclxuXHRcdFx0JGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0O1xyXG5cdFx0XHR4aHIub3BlbihvcHRpb25zLm1ldGhvZCwgb3B0aW9ucy51cmwsIHRydWUsIG9wdGlvbnMudXNlciwgb3B0aW9ucy5wYXNzd29yZCk7XHJcblx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuXHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSBvcHRpb25zLm9ubG9hZCh7dHlwZTogXCJsb2FkXCIsIHRhcmdldDogeGhyfSk7XHJcblx0XHRcdFx0XHRlbHNlIG9wdGlvbnMub25lcnJvcih7dHlwZTogXCJlcnJvclwiLCB0YXJnZXQ6IHhocn0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiAob3B0aW9ucy5zZXJpYWxpemUgPT09IEpTT04uc3RyaW5naWZ5ICYmIG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLm1ldGhvZCAhPT0gXCJHRVRcIikge1xyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChvcHRpb25zLmRlc2VyaWFsaXplID09PSBKU09OLnBhcnNlKSB7XHJcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0LypcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNvbmZpZyA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHR2YXIgbWF5YmVYaHIgPSBvcHRpb25zLmNvbmZpZyh4aHIsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdGlmIChtYXliZVhociAhPSBudWxsKSB4aHIgPSBtYXliZVhoclxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgZGF0YSA9IG9wdGlvbnMubWV0aG9kID09PSBcIkdFVFwiIHx8ICFvcHRpb25zLmRhdGEgPyBcIlwiIDogb3B0aW9ucy5kYXRhXHJcblx0XHRcdGlmIChkYXRhICYmICh0eXBlLmNhbGwoZGF0YSkgIT0gU1RSSU5HICYmIGRhdGEuY29uc3RydWN0b3IgIT0gd2luZG93LkZvcm1EYXRhKSkge1xyXG5cdFx0XHRcdHRocm93IFwiUmVxdWVzdCBkYXRhIHNob3VsZCBiZSBlaXRoZXIgYmUgYSBzdHJpbmcgb3IgRm9ybURhdGEuIENoZWNrIHRoZSBgc2VyaWFsaXplYCBvcHRpb24gaW4gYG0ucmVxdWVzdGBcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHR4aHIuc2VuZChkYXRhKTtcclxuXHRcdFx0cmV0dXJuIHhoclxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBiaW5kRGF0YSh4aHJPcHRpb25zLCBkYXRhLCBzZXJpYWxpemUpIHtcclxuXHRcdGlmICh4aHJPcHRpb25zLm1ldGhvZCA9PT0gXCJHRVRcIiAmJiB4aHJPcHRpb25zLmRhdGFUeXBlICE9IFwianNvbnBcIikge1xyXG5cdFx0XHR2YXIgcHJlZml4ID0geGhyT3B0aW9ucy51cmwuaW5kZXhPZihcIj9cIikgPCAwID8gXCI/XCIgOiBcIiZcIjtcclxuXHRcdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKTtcclxuXHRcdFx0eGhyT3B0aW9ucy51cmwgPSB4aHJPcHRpb25zLnVybCArIChxdWVyeXN0cmluZyA/IHByZWZpeCArIHF1ZXJ5c3RyaW5nIDogXCJcIilcclxuXHRcdH1cclxuXHRcdGVsc2UgeGhyT3B0aW9ucy5kYXRhID0gc2VyaWFsaXplKGRhdGEpO1xyXG5cdFx0cmV0dXJuIHhock9wdGlvbnNcclxuXHR9XHJcblx0ZnVuY3Rpb24gcGFyYW1ldGVyaXplVXJsKHVybCwgZGF0YSkge1xyXG5cdFx0dmFyIHRva2VucyA9IHVybC5tYXRjaCgvOlthLXpdXFx3Ky9naSk7XHJcblx0XHRpZiAodG9rZW5zICYmIGRhdGEpIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR2YXIga2V5ID0gdG9rZW5zW2ldLnNsaWNlKDEpO1xyXG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2Vuc1tpXSwgZGF0YVtrZXldKTtcclxuXHRcdFx0XHRkZWxldGUgZGF0YVtrZXldXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB1cmxcclxuXHR9XHJcblxyXG5cdG0ucmVxdWVzdCA9IGZ1bmN0aW9uKHhock9wdGlvbnMpIHtcclxuXHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0dmFyIGRlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xyXG5cdFx0dmFyIGlzSlNPTlAgPSB4aHJPcHRpb25zLmRhdGFUeXBlICYmIHhock9wdGlvbnMuZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29ucFwiO1xyXG5cdFx0dmFyIHNlcmlhbGl6ZSA9IHhock9wdGlvbnMuc2VyaWFsaXplID0gaXNKU09OUCA/IGlkZW50aXR5IDogeGhyT3B0aW9ucy5zZXJpYWxpemUgfHwgSlNPTi5zdHJpbmdpZnk7XHJcblx0XHR2YXIgZGVzZXJpYWxpemUgPSB4aHJPcHRpb25zLmRlc2VyaWFsaXplID0gaXNKU09OUCA/IGlkZW50aXR5IDogeGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSB8fCBKU09OLnBhcnNlO1xyXG5cdFx0dmFyIGV4dHJhY3QgPSB4aHJPcHRpb25zLmV4dHJhY3QgfHwgZnVuY3Rpb24oeGhyKSB7XHJcblx0XHRcdHJldHVybiB4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aCA9PT0gMCAmJiBkZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSA/IG51bGwgOiB4aHIucmVzcG9uc2VUZXh0XHJcblx0XHR9O1xyXG5cdFx0eGhyT3B0aW9ucy51cmwgPSBwYXJhbWV0ZXJpemVVcmwoeGhyT3B0aW9ucy51cmwsIHhock9wdGlvbnMuZGF0YSk7XHJcblx0XHR4aHJPcHRpb25zID0gYmluZERhdGEoeGhyT3B0aW9ucywgeGhyT3B0aW9ucy5kYXRhLCBzZXJpYWxpemUpO1xyXG5cdFx0eGhyT3B0aW9ucy5vbmxvYWQgPSB4aHJPcHRpb25zLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdFx0dmFyIHVud3JhcCA9IChlLnR5cGUgPT09IFwibG9hZFwiID8geGhyT3B0aW9ucy51bndyYXBTdWNjZXNzIDogeGhyT3B0aW9ucy51bndyYXBFcnJvcikgfHwgaWRlbnRpdHk7XHJcblx0XHRcdFx0dmFyIHJlc3BvbnNlID0gdW53cmFwKGRlc2VyaWFsaXplKGV4dHJhY3QoZS50YXJnZXQsIHhock9wdGlvbnMpKSk7XHJcblx0XHRcdFx0aWYgKGUudHlwZSA9PT0gXCJsb2FkXCIpIHtcclxuXHRcdFx0XHRcdGlmICh0eXBlLmNhbGwocmVzcG9uc2UpID09PSBBUlJBWSAmJiB4aHJPcHRpb25zLnR5cGUpIHtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykgcmVzcG9uc2VbaV0gPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlc3BvbnNlW2ldKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoeGhyT3B0aW9ucy50eXBlKSByZXNwb25zZSA9IG5ldyB4aHJPcHRpb25zLnR5cGUocmVzcG9uc2UpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRlZmVycmVkW2UudHlwZSA9PT0gXCJsb2FkXCIgPyBcInJlc29sdmVcIiA6IFwicmVqZWN0XCJdKHJlc3BvbnNlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uZW5kQ29tcHV0YXRpb24oKVxyXG5cdFx0fTtcclxuXHRcdGFqYXgoeGhyT3B0aW9ucyk7XHJcblx0XHRkZWZlcnJlZC5wcm9taXNlKHhock9wdGlvbnMuaW5pdGlhbFZhbHVlKTtcclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0fTtcclxuXHJcblx0Ly90ZXN0aW5nIEFQSVxyXG5cdG0uZGVwcyA9IGZ1bmN0aW9uKG1vY2spIHtcclxuXHRcdGluaXRpYWxpemUod2luZG93ID0gbW9jayB8fCB3aW5kb3cpO1xyXG5cdFx0cmV0dXJuIHdpbmRvdztcclxuXHR9O1xyXG5cdC8vZm9yIGludGVybmFsIHRlc3Rpbmcgb25seSwgZG8gbm90IHVzZSBgbS5kZXBzLmZhY3RvcnlgXHJcblx0bS5kZXBzLmZhY3RvcnkgPSBhcHA7XHJcblxyXG5cdHJldHVybiBtXHJcbn0pKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IG07XHJcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIG19KTtcclxuIiwidmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJ3ZhbGlkYXRvcicpO1xuXG4vKiBcdFRoaXMgYmluZGVyIGFsbG93cyB5b3UgdG8gY3JlYXRlIGEgdmFsaWRhdGlvbiBtZXRob2Qgb24gYSBtb2RlbCwgKHBsYWluIFxuXHRqYXZhc2NyaXB0IGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBzb21lIHByb3BlcnRpZXMpLCB0aGF0IGNhbiByZXR1cm4gYSBzZXQgXG5cdG9mIGVycm9yIG1lc3NhZ2VzIGZvciBpbnZhbGlkIHZhbHVlcy5cblx0XG5cdFRoZSB2YWxpZGF0aW9ucyBhcmUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY2hyaXNvL3ZhbGlkYXRvci5qc1x0XG5cblx0IyMgRXhhbXBsZVxuXG5cdFNheSB5b3UgaGF2ZSBhbiBvYmplY3QgbGlrZSBzbzpcblxuXHRcdHZhciBVc2VyID0gZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMubmFtZSA9IFwiYm9iXCI7XG5cdFx0XHR0aGlzLmVtYWlsID0gXCJib2JfYXRfZW1haWwuY29tXCI7XG5cdFx0fSwgdXNlciA9IG5ldyBVc2VyKCk7XG5cblx0Tm93IGlmIHlvdSB3YW50ZWQgdG8gY3JlYXRlIGFuIGlzVmFsaWQgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBlbnN1cmUgXG5cdHlvdSBkb24ndCBoYXZlIGFuIGludmFsaWQgZW1haWwgYWRkcmVzcywgeW91IHNpbXBseSBhZGQ6XG5cblxuXHRUbyB5b3VyIG1vZGVsLCBzbyB5b3UgZ2V0OlxuXG5cdFx0dmFyIFVzZXIgPSBmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5uYW1lID0gXCJib2JcIjtcblx0XHRcdHRoaXMuZW1haWwgPSBcImJvYl9hdF9lbWFpbC5jb21cIjtcblx0XHRcdHRoaXMuaXNWYWxpZCA9IG1vZGVsYmluZGVyLmJpbmQodGhpcywge1xuXHRcdFx0XHRlbWFpbDoge1xuXHRcdFx0XHRcdCdpc0VtYWlsJzogXCJNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sIHVzZXIgPSBuZXcgVXNlcigpO1xuXG5cdFRoZW4ganVzdCBjYWxsIHRoZSBgaXNWYWxpZGAgbWV0aG9kIHRvIHNlZSBpZiBpdCBpcyB2YWxpZCAtIGlmIGl0IGlzXG5cdGludmFsaWQsIChhcyBpdCB3aWxsIGJlIGluIHRoaXMgY2FzZSksIHlvdSB3aWxsIGdldCBhbiBvYmplY3QgbGlrZSBzbzpcblxuXHRcdHVzZXIuaXNWYWxpZCgpXG5cdFx0Ly9cdFJldHVybnM6IHsgZW1haWw6IFtcIk11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCJdIH1cblxuXHRZb3UgY2FuIGFsc28gY2hlY2sgaWYgYSBwYXJ0aWN1bGFyIGZpZWxkIGlzIHZhbGlkIGxpa2Ugc286XG5cblx0XHR1c2VyLmlzVmFsaWQoJ2VtYWlsJyk7XG5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGJpbmQ6IGZ1bmN0aW9uKHNlbGYsIHZPYmope1xuXHRcdHJldHVybiBmdW5jdGlvbihuYW1lKXtcblx0XHRcdHZhciByZXN1bHQgPSB7fSxcblx0XHRcdFx0dG1wLFxuXHRcdFx0XHRoYXNJbnZhbGlkRmllbGQgPSBmYWxzZSxcblx0XHRcdFx0Ly9cdEZvciBzb21lIHJlYXNvbiBub2RlLXZhbGlkYXRvciBkb2Vzbid0IGhhdmUgdGhpcy4uLlxuXHRcdFx0XHRpc05vdEVtcHR5ID0gZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IFwiXCIgJiYgdmFsdWUgIT09IG51bGw7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vXHRHZXQgdmFsdWUgb2YgcHJvcGVydHkgZnJvbSAnc2VsZicsIHdoaWNoIGNhbiBiZSBhIGZ1bmN0aW9uLlxuXHRcdFx0XHRnZXRWYWx1ZSA9IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0XHRcdHJldHVybiB0eXBlb2Ygc2VsZltuYW1lXSA9PSBcImZ1bmN0aW9uXCI/IHNlbGZbbmFtZV0oKTogc2VsZltuYW1lXTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly9cdFZhbGlkYXRlcyBhIHZhbHVlIGFnYWluc3QgYSBzZXQgb2YgdmFsaWRhdGlvbnNcblx0XHRcdFx0Ly9cdFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdmFsaWQsIG9yIGFuIG9iamVjdCBcblx0XHRcdFx0dmFsaWRhdGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgdmFsaWRhdGlvbnMpIHtcblx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbixcblx0XHRcdFx0XHRcdHRtcCxcblx0XHRcdFx0XHRcdHJlc3VsdCA9IFtdO1xuXHRcdFx0XHRcdGZvcih2YWxpZGF0aW9uIGluIHZhbGlkYXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZih2YWxpZGF0aW9uID09IFwiaXNSZXF1aXJlZFwiKSB7XG5cdFx0XHRcdFx0XHRcdC8vXHR1c2Ugb3VyIFwiaXNSZXF1aXJlZFwiIGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdHRtcCA9IGlzTm90RW1wdHkodmFsdWUpPyB0cnVlOiB2YWxpZGF0aW9uc1t2YWxpZGF0aW9uXTsgXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvL1x0VXNlIHZhbGlkYXRvciBtZXRob2Rcblx0XHRcdFx0XHRcdFx0dG1wID0gdmFsaWRhdG9yW3ZhbGlkYXRpb25dKHZhbHVlKT8gdHJ1ZTogdmFsaWRhdGlvbnNbdmFsaWRhdGlvbl07IFxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL1x0SGFuZGxlIG11bHRpcGxlIG1lc3NhZ2VzXG5cdFx0XHRcdFx0XHRpZih0bXAgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gKHJlc3VsdCA9PT0gdHJ1ZSB8fCByZXN1bHQgPT0gXCJ1bmRlZmluZWRcIik/IFtdOiByZXN1bHQ7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKHRtcCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRpZihuYW1lKSB7XG5cdFx0XHRcdHJlc3VsdCA9IHZhbGlkYXRlKG5hbWUsIGdldFZhbHVlKG5hbWUpLCB2T2JqW25hbWVdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vXHRWYWxpZGF0ZSB0aGUgd2hvbGUgbW9kZWxcblx0XHRcdFx0Zm9yKG5hbWUgaW4gdk9iaikge1xuXHRcdFx0XHRcdHRtcCA9IHZhbGlkYXRlKG5hbWUsIGdldFZhbHVlKG5hbWUpLCB2T2JqW25hbWVdKTtcblx0XHRcdFx0XHRpZih0bXAgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdGhhc0ludmFsaWRGaWVsZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IHRtcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZighaGFzSW52YWxpZEZpZWxkKSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxufTsiLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNCBDaHJpcyBPJ0hhcmEgPGNvaGFyYTg3QGdtYWlsLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuICogTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuICogT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG4oZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24pIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKCk7XG4gICAgfVxufSkoJ3ZhbGlkYXRvcicsIGZ1bmN0aW9uICh2YWxpZGF0b3IpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhbGlkYXRvciA9IHsgdmVyc2lvbjogJzMuMzIuMCcgfTtcblxuICAgIHZhciBlbWFpbEFkZHJlc3MgPSAvKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpQCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKS87XG4gICAgdmFyIGRpc3BsYXlOYW1lID0gLyhbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XFwuXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5cXC5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdfFxccykqLztcblxuICAgIHZhciBlbWFpbCA9IG5ldyBSZWdFeHAoJ14nICsgZW1haWxBZGRyZXNzLnNvdXJjZSArICckJywgJ2knKTtcbiAgICB2YXIgZW1haWxXaXRoRGlzcGxheU5hbWUgPSBuZXcgUmVnRXhwKCdeJyArIGRpc3BsYXlOYW1lLnNvdXJjZSArICc8JyArIGVtYWlsQWRkcmVzcy5zb3VyY2UgKyAnPiQnLCAnaScpO1xuXG4gICAgdmFyIGNyZWRpdENhcmQgPSAvXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XVswLTldKVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18KD86MjEzMXwxODAwfDM1XFxkezN9KVxcZHsxMX0pJC87XG5cbiAgICB2YXIgaXNibjEwTWF5YmUgPSAvXig/OlswLTldezl9WHxbMC05XXsxMH0pJC9cbiAgICAgICwgaXNibjEzTWF5YmUgPSAvXig/OlswLTldezEzfSkkLztcblxuICAgIHZhciBpcHY0TWF5YmUgPSAvXihcXGQ/XFxkP1xcZClcXC4oXFxkP1xcZD9cXGQpXFwuKFxcZD9cXGQ/XFxkKVxcLihcXGQ/XFxkP1xcZCkkL1xuICAgICAgLCBpcHY2ID0gL146OnxeOjoxfF4oW2EtZkEtRjAtOV17MSw0fTo6Pyl7MSw3fShbYS1mQS1GMC05XXsxLDR9KSQvO1xuXG4gICAgdmFyIHV1aWQgPSB7XG4gICAgICAgICczJzogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS0zWzAtOUEtRl17M30tWzAtOUEtRl17NH0tWzAtOUEtRl17MTJ9JC9pXG4gICAgICAsICc0JzogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS00WzAtOUEtRl17M30tWzg5QUJdWzAtOUEtRl17M30tWzAtOUEtRl17MTJ9JC9pXG4gICAgICAsICc1JzogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS01WzAtOUEtRl17M30tWzg5QUJdWzAtOUEtRl17M30tWzAtOUEtRl17MTJ9JC9pXG4gICAgICAsIGFsbDogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS1bMC05QS1GXXs0fS1bMC05QS1GXXs0fS1bMC05QS1GXXsxMn0kL2lcbiAgICB9O1xuXG4gICAgdmFyIGFscGhhID0gL15bYS16QS1aXSskL1xuICAgICAgLCBhbHBoYW51bWVyaWMgPSAvXlthLXpBLVowLTldKyQvXG4gICAgICAsIG51bWVyaWMgPSAvXlstK10/WzAtOV0rJC9cbiAgICAgICwgaW50ID0gL14oPzpbLStdPyg/OjB8WzEtOV1bMC05XSopKSQvXG4gICAgICAsIGZsb2F0ID0gL14oPzpbLStdPyg/OlswLTldKykpPyg/OlxcLlswLTldKik/KD86W2VFXVtcXCtcXC1dPyg/OlswLTldKykpPyQvXG4gICAgICAsIGhleGFkZWNpbWFsID0gL15bMC05YS1mQS1GXSskL1xuICAgICAgLCBoZXhjb2xvciA9IC9eIz8oWzAtOWEtZkEtRl17M318WzAtOWEtZkEtRl17Nn0pJC87XG5cbiAgICB2YXIgYXNjaWkgPSAvXltcXHgwMC1cXHg3Rl0rJC9cbiAgICAgICwgbXVsdGlieXRlID0gL1teXFx4MDAtXFx4N0ZdL1xuICAgICAgLCBmdWxsV2lkdGggPSAvW15cXHUwMDIwLVxcdTAwN0VcXHVGRjYxLVxcdUZGOUZcXHVGRkEwLVxcdUZGRENcXHVGRkU4LVxcdUZGRUUwLTlhLXpBLVpdL1xuICAgICAgLCBoYWxmV2lkdGggPSAvW1xcdTAwMjAtXFx1MDA3RVxcdUZGNjEtXFx1RkY5RlxcdUZGQTAtXFx1RkZEQ1xcdUZGRTgtXFx1RkZFRTAtOWEtekEtWl0vO1xuXG4gICAgdmFyIHN1cnJvZ2F0ZVBhaXIgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS87XG5cbiAgICB2YXIgYmFzZTY0ID0gL14oPzpbQS1aYS16MC05K1xcL117NH0pKig/OltBLVphLXowLTkrXFwvXXsyfT09fFtBLVphLXowLTkrXFwvXXszfT18W0EtWmEtejAtOStcXC9dezR9KSQvO1xuXG4gICAgdmFyIHBob25lcyA9IHtcbiAgICAgICd6aC1DTic6IC9eKFxcKz8wPzg2XFwtPyk/MVszNDU3ODldXFxkezl9JC8sXG4gICAgICAnZW4tWkEnOiAvXihcXCs/Mjd8MClcXGR7OX0kLyxcbiAgICAgICdlbi1BVSc6IC9eKFxcKz82MXwwKTRcXGR7OH0kLyxcbiAgICAgICdlbi1ISyc6IC9eKFxcKz84NTJcXC0/KT9bNTY5XVxcZHszfVxcLT9cXGR7NH0kLyxcbiAgICAgICdmci1GUic6IC9eKFxcKz8zM3wwKVs2N11cXGR7OH0kLyxcbiAgICAgICdwdC1QVCc6IC9eKFxcKzM1MSk/OVsxMjM2XVxcZHs3fSQvLFxuICAgICAgJ2VsLUdSJyA6IC9eKFxcKzMwKT8oKDJcXGR7OX0pfCg2OVxcZHs4fSkpJC9cbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmV4dGVuZCA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgICAgICB2YWxpZGF0b3JbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBhcmdzWzBdID0gdmFsaWRhdG9yLnRvU3RyaW5nKGFyZ3NbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHZhbGlkYXRvciwgYXJncyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8vUmlnaHQgYmVmb3JlIGV4cG9ydGluZyB0aGUgdmFsaWRhdG9yIG9iamVjdCwgcGFzcyBlYWNoIG9mIHRoZSBidWlsdGluc1xuICAgIC8vdGhyb3VnaCBleHRlbmQoKSBzbyB0aGF0IHRoZWlyIGZpcnN0IGFyZ3VtZW50IGlzIGNvZXJjZWQgdG8gYSBzdHJpbmdcbiAgICB2YWxpZGF0b3IuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWxpZGF0b3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yW25hbWVdICE9PSAnZnVuY3Rpb24nIHx8IG5hbWUgPT09ICd0b1N0cmluZycgfHxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gJ3RvRGF0ZScgfHwgbmFtZSA9PT0gJ2V4dGVuZCcgfHwgbmFtZSA9PT0gJ2luaXQnKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0b3IuZXh0ZW5kKG5hbWUsIHZhbGlkYXRvcltuYW1lXSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvU3RyaW5nID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIGlucHV0ICE9PSBudWxsICYmIGlucHV0LnRvU3RyaW5nKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGlucHV0LnRvU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQgPT09IG51bGwgfHwgdHlwZW9mIGlucHV0ID09PSAndW5kZWZpbmVkJyB8fCAoaXNOYU4oaW5wdXQpICYmICFpbnB1dC5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpbnB1dCA9ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlucHV0ICs9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZSkgPT09ICdbb2JqZWN0IERhdGVdJykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgICAgIH1cbiAgICAgICAgZGF0ZSA9IERhdGUucGFyc2UoZGF0ZSk7XG4gICAgICAgIHJldHVybiAhaXNOYU4oZGF0ZSkgPyBuZXcgRGF0ZShkYXRlKSA6IG51bGw7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0Zsb2F0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9JbnQgPSBmdW5jdGlvbiAoc3RyLCByYWRpeCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyLCByYWRpeCB8fCAxMCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0Jvb2xlYW4gPSBmdW5jdGlvbiAoc3RyLCBzdHJpY3QpIHtcbiAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJzEnIHx8IHN0ciA9PT0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHIgIT09ICcwJyAmJiBzdHIgIT09ICdmYWxzZScgJiYgc3RyICE9PSAnJztcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmVxdWFscyA9IGZ1bmN0aW9uIChzdHIsIGNvbXBhcmlzb24pIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gdmFsaWRhdG9yLnRvU3RyaW5nKGNvbXBhcmlzb24pO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuY29udGFpbnMgPSBmdW5jdGlvbiAoc3RyLCBlbGVtKSB7XG4gICAgICAgIHJldHVybiBzdHIuaW5kZXhPZih2YWxpZGF0b3IudG9TdHJpbmcoZWxlbSkpID49IDA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5tYXRjaGVzID0gZnVuY3Rpb24gKHN0ciwgcGF0dGVybiwgbW9kaWZpZXJzKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGF0dGVybikgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBtb2RpZmllcnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfZW1haWxfb3B0aW9ucyA9IHtcbiAgICAgICAgYWxsb3dfZGlzcGxheV9uYW1lOiBmYWxzZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNFbWFpbCA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfZW1haWxfb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIGVtYWlsLnRlc3Qoc3RyKSB8fCAob3B0aW9ucy5hbGxvd19kaXNwbGF5X25hbWUgPT09IHRydWUgJiYgZW1haWxXaXRoRGlzcGxheU5hbWUudGVzdChzdHIpKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfdXJsX29wdGlvbnMgPSB7XG4gICAgICAgIHByb3RvY29sczogWyAnaHR0cCcsICdodHRwcycsICdmdHAnIF1cbiAgICAgICwgcmVxdWlyZV90bGQ6IHRydWVcbiAgICAgICwgcmVxdWlyZV9wcm90b2NvbDogZmFsc2VcbiAgICAgICwgYWxsb3dfdW5kZXJzY29yZXM6IGZhbHNlXG4gICAgICAsIGFsbG93X3RyYWlsaW5nX2RvdDogZmFsc2VcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVVJMID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIXVybCB8fCB1cmwubGVuZ3RoID49IDIwODMpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsLmluZGV4T2YoJ21haWx0bzonKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X3VybF9vcHRpb25zKTtcbiAgICAgICAgdmFyIHByb3RvY29sLCB1c2VyLCBwYXNzLCBhdXRoLCBob3N0LCBob3N0bmFtZSwgcG9ydCxcbiAgICAgICAgICAgIHBvcnRfc3RyLCBwYXRoLCBxdWVyeSwgaGFzaCwgc3BsaXQ7XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCc6Ly8nKTtcbiAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHByb3RvY29sID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnByb3RvY29scy5pbmRleE9mKHByb3RvY29sKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5yZXF1aXJlX3Byb3RvY29sKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gc3BsaXQuam9pbignOi8vJyk7XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCcjJyk7XG4gICAgICAgIHVybCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgIGhhc2ggPSBzcGxpdC5qb2luKCcjJyk7XG4gICAgICAgIGlmIChoYXNoICYmIC9cXHMvLnRlc3QoaGFzaCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnPycpO1xuICAgICAgICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuICAgICAgICBxdWVyeSA9IHNwbGl0LmpvaW4oJz8nKTtcbiAgICAgICAgaWYgKHF1ZXJ5ICYmIC9cXHMvLnRlc3QocXVlcnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJy8nKTtcbiAgICAgICAgdXJsID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgcGF0aCA9IHNwbGl0LmpvaW4oJy8nKTtcbiAgICAgICAgaWYgKHBhdGggJiYgL1xccy8udGVzdChwYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCdAJyk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBhdXRoID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChhdXRoLmluZGV4T2YoJzonKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgYXV0aCA9IGF1dGguc3BsaXQoJzonKTtcbiAgICAgICAgICAgICAgICB1c2VyID0gYXV0aC5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGlmICghL15cXFMrJC8udGVzdCh1c2VyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhc3MgPSBhdXRoLmpvaW4oJzonKTtcbiAgICAgICAgICAgICAgICBpZiAoIS9eXFxTKiQvLnRlc3QodXNlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBob3N0bmFtZSA9IHNwbGl0LmpvaW4oJ0AnKTtcbiAgICAgICAgc3BsaXQgPSBob3N0bmFtZS5zcGxpdCgnOicpO1xuICAgICAgICBob3N0ID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcG9ydF9zdHIgPSBzcGxpdC5qb2luKCc6Jyk7XG4gICAgICAgICAgICBwb3J0ID0gcGFyc2VJbnQocG9ydF9zdHIsIDEwKTtcbiAgICAgICAgICAgIGlmICghL15bMC05XSskLy50ZXN0KHBvcnRfc3RyKSB8fCBwb3J0IDw9IDAgfHwgcG9ydCA+IDY1NTM1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdG9yLmlzSVAoaG9zdCkgJiYgIXZhbGlkYXRvci5pc0ZRRE4oaG9zdCwgb3B0aW9ucykgJiZcbiAgICAgICAgICAgICAgICBob3N0ICE9PSAnbG9jYWxob3N0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmhvc3Rfd2hpdGVsaXN0ICYmXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ob3N0X3doaXRlbGlzdC5pbmRleE9mKGhvc3QpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmhvc3RfYmxhY2tsaXN0ICYmXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ob3N0X2JsYWNrbGlzdC5pbmRleE9mKGhvc3QpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJUCA9IGZ1bmN0aW9uIChzdHIsIHZlcnNpb24pIHtcbiAgICAgICAgdmVyc2lvbiA9IHZhbGlkYXRvci50b1N0cmluZyh2ZXJzaW9uKTtcbiAgICAgICAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzSVAoc3RyLCA0KSB8fCB2YWxpZGF0b3IuaXNJUChzdHIsIDYpO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnNpb24gPT09ICc0Jykge1xuICAgICAgICAgICAgaWYgKCFpcHY0TWF5YmUudGVzdChzdHIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KCcuJykuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRzWzNdIDw9IDI1NTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVyc2lvbiA9PT0gJzYnICYmIGlwdjYudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF9mcWRuX29wdGlvbnMgPSB7XG4gICAgICAgIHJlcXVpcmVfdGxkOiB0cnVlXG4gICAgICAsIGFsbG93X3VuZGVyc2NvcmVzOiBmYWxzZVxuICAgICAgLCBhbGxvd190cmFpbGluZ19kb3Q6IGZhbHNlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0ZRRE4gPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X2ZxZG5fb3B0aW9ucyk7XG5cbiAgICAgICAgLyogUmVtb3ZlIHRoZSBvcHRpb25hbCB0cmFpbGluZyBkb3QgYmVmb3JlIGNoZWNraW5nIHZhbGlkaXR5ICovXG4gICAgICAgIGlmIChvcHRpb25zLmFsbG93X3RyYWlsaW5nX2RvdCAmJiBzdHJbc3RyLmxlbmd0aCAtIDFdID09PSAnLicpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnLicpO1xuICAgICAgICBpZiAob3B0aW9ucy5yZXF1aXJlX3RsZCkge1xuICAgICAgICAgICAgdmFyIHRsZCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJ0cy5sZW5ndGggfHwgIS9eKFthLXpcXHUwMGExLVxcdWZmZmZdezIsfXx4blthLXowLTktXXsyLH0pJC9pLnRlc3QodGxkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBwYXJ0LCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hbGxvd191bmRlcnNjb3Jlcykge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0LmluZGV4T2YoJ19fJykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcnQgPSBwYXJ0LnJlcGxhY2UoL18vZywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEvXlthLXpcXHUwMGExLVxcdWZmZmYwLTktXSskL2kudGVzdChwYXJ0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJ0WzBdID09PSAnLScgfHwgcGFydFtwYXJ0Lmxlbmd0aCAtIDFdID09PSAnLScgfHxcbiAgICAgICAgICAgICAgICAgICAgcGFydC5pbmRleE9mKCctLS0nKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBbHBoYSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGFscGhhLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQWxwaGFudW1lcmljID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gYWxwaGFudW1lcmljLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTnVtZXJpYyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIG51bWVyaWMudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNIZXhhZGVjaW1hbCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGhleGFkZWNpbWFsLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSGV4Q29sb3IgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBoZXhjb2xvci50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0xvd2VyY2FzZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1VwcGVyY2FzZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gc3RyLnRvVXBwZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0ludCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGludC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0Zsb2F0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyICE9PSAnJyAmJiBmbG9hdC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0RpdmlzaWJsZUJ5ID0gZnVuY3Rpb24gKHN0ciwgbnVtKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0b3IudG9GbG9hdChzdHIpICUgdmFsaWRhdG9yLnRvSW50KG51bSkgPT09IDA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc051bGwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIubGVuZ3RoID09PSAwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBtaW4sIG1heCkge1xuICAgICAgICB2YXIgc3Vycm9nYXRlUGFpcnMgPSBzdHIubWF0Y2goL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZykgfHwgW107XG4gICAgICAgIHZhciBsZW4gPSBzdHIubGVuZ3RoIC0gc3Vycm9nYXRlUGFpcnMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gbGVuID49IG1pbiAmJiAodHlwZW9mIG1heCA9PT0gJ3VuZGVmaW5lZCcgfHwgbGVuIDw9IG1heCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0J5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBtaW4sIG1heCkge1xuICAgICAgICByZXR1cm4gc3RyLmxlbmd0aCA+PSBtaW4gJiYgKHR5cGVvZiBtYXggPT09ICd1bmRlZmluZWQnIHx8IHN0ci5sZW5ndGggPD0gbWF4KTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVVVJRCA9IGZ1bmN0aW9uIChzdHIsIHZlcnNpb24pIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSB1dWlkW3ZlcnNpb24gPyB2ZXJzaW9uIDogJ2FsbCddO1xuICAgICAgICByZXR1cm4gcGF0dGVybiAmJiBwYXR0ZXJuLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRGF0ZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuICFpc05hTihEYXRlLnBhcnNlKHN0cikpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBZnRlciA9IGZ1bmN0aW9uIChzdHIsIGRhdGUpIHtcbiAgICAgICAgdmFyIGNvbXBhcmlzb24gPSB2YWxpZGF0b3IudG9EYXRlKGRhdGUgfHwgbmV3IERhdGUoKSlcbiAgICAgICAgICAsIG9yaWdpbmFsID0gdmFsaWRhdG9yLnRvRGF0ZShzdHIpO1xuICAgICAgICByZXR1cm4gISEob3JpZ2luYWwgJiYgY29tcGFyaXNvbiAmJiBvcmlnaW5hbCA+IGNvbXBhcmlzb24pO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCZWZvcmUgPSBmdW5jdGlvbiAoc3RyLCBkYXRlKSB7XG4gICAgICAgIHZhciBjb21wYXJpc29uID0gdmFsaWRhdG9yLnRvRGF0ZShkYXRlIHx8IG5ldyBEYXRlKCkpXG4gICAgICAgICAgLCBvcmlnaW5hbCA9IHZhbGlkYXRvci50b0RhdGUoc3RyKTtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsICYmIGNvbXBhcmlzb24gJiYgb3JpZ2luYWwgPCBjb21wYXJpc29uO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJbiA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob3B0aW9ucykgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yIChpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHZhbGlkYXRvci50b1N0cmluZyhvcHRpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcnJheS5pbmRleE9mKHN0cikgPj0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmhhc093blByb3BlcnR5KHN0cik7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbmRleE9mKHN0cikgPj0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0NyZWRpdENhcmQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBzYW5pdGl6ZWQgPSBzdHIucmVwbGFjZSgvW14wLTldKy9nLCAnJyk7XG4gICAgICAgIGlmICghY3JlZGl0Q2FyZC50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3VtID0gMCwgZGlnaXQsIHRtcE51bSwgc2hvdWxkRG91YmxlO1xuICAgICAgICBmb3IgKHZhciBpID0gc2FuaXRpemVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBkaWdpdCA9IHNhbml0aXplZC5zdWJzdHJpbmcoaSwgKGkgKyAxKSk7XG4gICAgICAgICAgICB0bXBOdW0gPSBwYXJzZUludChkaWdpdCwgMTApO1xuICAgICAgICAgICAgaWYgKHNob3VsZERvdWJsZSkge1xuICAgICAgICAgICAgICAgIHRtcE51bSAqPSAyO1xuICAgICAgICAgICAgICAgIGlmICh0bXBOdW0gPj0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9ICgodG1wTnVtICUgMTApICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IHRtcE51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG91bGREb3VibGUgPSAhc2hvdWxkRG91YmxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhISgoc3VtICUgMTApID09PSAwID8gc2FuaXRpemVkIDogZmFsc2UpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJU0JOID0gZnVuY3Rpb24gKHN0ciwgdmVyc2lvbikge1xuICAgICAgICB2ZXJzaW9uID0gdmFsaWRhdG9yLnRvU3RyaW5nKHZlcnNpb24pO1xuICAgICAgICBpZiAoIXZlcnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3IuaXNJU0JOKHN0ciwgMTApIHx8IHZhbGlkYXRvci5pc0lTQk4oc3RyLCAxMyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNhbml0aXplZCA9IHN0ci5yZXBsYWNlKC9bXFxzLV0rL2csICcnKVxuICAgICAgICAgICwgY2hlY2tzdW0gPSAwLCBpO1xuICAgICAgICBpZiAodmVyc2lvbiA9PT0gJzEwJykge1xuICAgICAgICAgICAgaWYgKCFpc2JuMTBNYXliZS50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gKGkgKyAxKSAqIHNhbml0aXplZC5jaGFyQXQoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2FuaXRpemVkLmNoYXJBdCg5KSA9PT0gJ1gnKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gMTAgKiAxMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gMTAgKiBzYW5pdGl6ZWQuY2hhckF0KDkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChjaGVja3N1bSAlIDExKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIXNhbml0aXplZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlICBpZiAodmVyc2lvbiA9PT0gJzEzJykge1xuICAgICAgICAgICAgaWYgKCFpc2JuMTNNYXliZS50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZmFjdG9yID0gWyAxLCAzIF07XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IGZhY3RvcltpICUgMl0gKiBzYW5pdGl6ZWQuY2hhckF0KGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNhbml0aXplZC5jaGFyQXQoMTIpIC0gKCgxMCAtIChjaGVja3N1bSAlIDEwKSkgJSAxMCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFzYW5pdGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNNb2JpbGVQaG9uZSA9IGZ1bmN0aW9uKHN0ciwgbG9jYWxlKSB7XG4gICAgICAgIGlmIChsb2NhbGUgaW4gcGhvbmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcGhvbmVzW2xvY2FsZV0udGVzdChzdHIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSlNPTiA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIEpTT04ucGFyc2Uoc3RyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNNdWx0aWJ5dGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBtdWx0aWJ5dGUudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBc2NpaSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGFzY2lpLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRnVsbFdpZHRoID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gZnVsbFdpZHRoLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSGFsZldpZHRoID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gaGFsZldpZHRoLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVmFyaWFibGVXaWR0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGxXaWR0aC50ZXN0KHN0cikgJiYgaGFsZldpZHRoLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzU3Vycm9nYXRlUGFpciA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN1cnJvZ2F0ZVBhaXIudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCYXNlNjQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBiYXNlNjQudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNNb25nb0lkID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzSGV4YWRlY2ltYWwoc3RyKSAmJiBzdHIubGVuZ3RoID09PSAyNDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmx0cmltID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoJ15bJyArIGNoYXJzICsgJ10rJywgJ2cnKSA6IC9eXFxzKy9nO1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IucnRyaW0gPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICB2YXIgcGF0dGVybiA9IGNoYXJzID8gbmV3IFJlZ0V4cCgnWycgKyBjaGFycyArICddKyQnLCAnZycpIDogL1xccyskL2c7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShwYXR0ZXJuLCAnJyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50cmltID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoJ15bJyArIGNoYXJzICsgJ10rfFsnICsgY2hhcnMgKyAnXSskJywgJ2cnKSA6IC9eXFxzK3xcXHMrJC9nO1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuZXNjYXBlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gKHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnJiN4Mjc7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC8vZywgJyYjeDJGOycpKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnN0cmlwTG93ID0gZnVuY3Rpb24gKHN0ciwga2VlcF9uZXdfbGluZXMpIHtcbiAgICAgICAgdmFyIGNoYXJzID0ga2VlcF9uZXdfbGluZXMgPyAnXFxcXHgwMC1cXFxceDA5XFxcXHgwQlxcXFx4MENcXFxceDBFLVxcXFx4MUZcXFxceDdGJyA6ICdcXFxceDAwLVxcXFx4MUZcXFxceDdGJztcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5ibGFja2xpc3Qoc3RyLCBjaGFycyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci53aGl0ZWxpc3QgPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnW14nICsgY2hhcnMgKyAnXSsnLCAnZycpLCAnJyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5ibGFja2xpc3QgPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnWycgKyBjaGFycyArICddKycsICdnJyksICcnKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfbm9ybWFsaXplX2VtYWlsX29wdGlvbnMgPSB7XG4gICAgICAgIGxvd2VyY2FzZTogdHJ1ZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3Iubm9ybWFsaXplRW1haWwgPSBmdW5jdGlvbiAoZW1haWwsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfbm9ybWFsaXplX2VtYWlsX29wdGlvbnMpO1xuICAgICAgICBpZiAoIXZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJ0cyA9IGVtYWlsLnNwbGl0KCdAJywgMik7XG4gICAgICAgIHBhcnRzWzFdID0gcGFydHNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHBhcnRzWzFdID09PSAnZ21haWwuY29tJyB8fCBwYXJ0c1sxXSA9PT0gJ2dvb2dsZW1haWwuY29tJykge1xuICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xcLi9nLCAnJyk7XG4gICAgICAgICAgICBpZiAocGFydHNbMF1bMF0gPT09ICcrJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0uc3BsaXQoJysnKVswXTtcbiAgICAgICAgICAgIHBhcnRzWzFdID0gJ2dtYWlsLmNvbSc7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5sb3dlcmNhc2UpIHtcbiAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFydHMuam9pbignQCcpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtZXJnZShvYmosIGRlZmF1bHRzKSB7XG4gICAgICAgIG9iaiA9IG9iaiB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIG9ialtrZXldID0gZGVmYXVsdHNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIHZhbGlkYXRvci5pbml0KCk7XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yO1xuXG59KTtcbiIsIi8qXG5cdG1pdGhyaWwuYW5pbWF0ZSAtIENvcHlyaWdodCAyMDE0IGpzZ3V5XG5cdE1JVCBMaWNlbnNlZC5cbiovXG4oZnVuY3Rpb24oKXtcbnZhciBtaXRocmlsQW5pbWF0ZSA9IGZ1bmN0aW9uIChtKSB7XG5cdC8vXHRLbm93biBwcmVmaWV4XG5cdHZhciBwcmVmaXhlcyA9IFsnTW96JywgJ1dlYmtpdCcsICdLaHRtbCcsICdPJywgJ21zJ10sXG5cdHRyYW5zaXRpb25Qcm9wcyA9IFsnVHJhbnNpdGlvblByb3BlcnR5JywgJ1RyYW5zaXRpb25UaW1pbmdGdW5jdGlvbicsICdUcmFuc2l0aW9uRGVsYXknLCAnVHJhbnNpdGlvbkR1cmF0aW9uJywgJ1RyYW5zaXRpb25FbmQnXSxcblx0dHJhbnNmb3JtUHJvcHMgPSBbJ3JvdGF0ZScsICdyb3RhdGV4JywgJ3JvdGF0ZXknLCAnc2NhbGUnLCAnc2tldycsICd0cmFuc2xhdGUnLCAndHJhbnNsYXRleCcsICd0cmFuc2xhdGV5JywgJ21hdHJpeCddLFxuXG5cdGRlZmF1bHREdXJhdGlvbiA9IDQwMCxcblxuXHRlcnIgPSBmdW5jdGlvbihtc2cpe1xuXHRcdCh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIpICYmIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUuZXJyb3IgJiYgY29uc29sZS5lcnJvcihtc2cpO1xuXHR9LFxuXHRcblx0Ly9cdENhcGl0YWxpc2VcdFx0XG5cdGNhcCA9IGZ1bmN0aW9uKHN0cil7XG5cdFx0cmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zdWJzdHIoMSk7XG5cdH0sXG5cblx0Ly9cdEZvciBjaGVja2luZyB3aGF0IHZlbmRvciBwcmVmaXhlcyBhcmUgbmF0aXZlXG5cdGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuXG5cdC8vXHR2ZW5kb3IgcHJlZml4LCBpZTogdHJhbnNpdGlvbkR1cmF0aW9uIGJlY29tZXMgTW96VHJhbnNpdGlvbkR1cmF0aW9uXG5cdHZwID0gZnVuY3Rpb24gKHByb3ApIHtcblx0XHR2YXIgcGY7XG5cdFx0Ly9cdEhhbmRsZSB1bnByZWZpeGVkXG5cdFx0aWYgKHByb3AgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9XG5cblx0XHQvL1x0SGFuZGxlIGtleWZyYW1lc1xuXHRcdGlmKHByb3AgPT0gXCJAa2V5ZnJhbWVzXCIpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0Ly9cdFRlc3RpbmcgdXNpbmcgdHJhbnNpdGlvblxuXHRcdFx0XHRwZiA9IHByZWZpeGVzW2ldICsgXCJUcmFuc2l0aW9uXCI7XG5cdFx0XHRcdGlmIChwZiBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJALVwiICsgcHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArIFwiLWtleWZyYW1lc1wiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRwZiA9IHByZWZpeGVzW2ldICsgY2FwKHByb3ApO1xuXHRcdFx0aWYgKHBmIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0XHRyZXR1cm4gcGY7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vXHRDYW4ndCBmaW5kIGl0IC0gcmV0dXJuIG9yaWdpbmFsIHByb3BlcnR5LlxuXHRcdHJldHVybiBwcm9wO1xuXHR9LFxuXG5cdC8vXHRTZWUgaWYgd2UgY2FuIHVzZSBuYXRpdmUgdHJhbnNpdGlvbnNcblx0c3VwcG9ydHNUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBiID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0XHRzID0gYi5zdHlsZSxcblx0XHRcdHAgPSAndHJhbnNpdGlvbic7XG5cblx0XHRpZiAodHlwZW9mIHNbcF0gPT0gJ3N0cmluZycpIHsgcmV0dXJuIHRydWU7IH1cblxuXHRcdC8vIFRlc3RzIGZvciB2ZW5kb3Igc3BlY2lmaWMgcHJvcFxuXHRcdHAgPSBwLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcC5zdWJzdHIoMSk7XG5cblx0XHRmb3IgKHZhciBpPTA7IGk8cHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0eXBlb2Ygc1twcmVmaXhlc1tpXSArIHBdID09ICdzdHJpbmcnKSB7IHJldHVybiB0cnVlOyB9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8vXHRDb252ZXJ0cyBDU1MgdHJhbnNpdGlvbiB0aW1lcyB0byBNU1xuXHRnZXRUaW1laW5NUyA9IGZ1bmN0aW9uKHN0cikge1xuXHRcdHZhciByZXN1bHQgPSAwLCB0bXA7XG5cdFx0c3RyICs9IFwiXCI7XG5cdFx0c3RyID0gc3RyLnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYoc3RyLmluZGV4T2YoXCJtc1wiKSAhPT0gLTEpIHtcblx0XHRcdHRtcCA9IHN0ci5zcGxpdChcIm1zXCIpO1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHRtcFswXSk7XG5cdFx0fSBlbHNlIGlmKHN0ci5pbmRleE9mKFwic1wiKSAhPT0gLTEpIHtcblx0XHRcdC8vXHRzXG5cdFx0XHR0bXAgPSBzdHIuc3BsaXQoXCJzXCIpO1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHRtcFswXSkgKiAxMDAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIoc3RyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gTWF0aC5yb3VuZChyZXN1bHQpO1xuXHR9LFxuXG5cdC8vXHRTZXQgc3R5bGUgcHJvcGVydGllc1xuXHRzZXRTdHlsZVByb3BzID0gZnVuY3Rpb24ob2JqLCBwcm9wcyl7XG5cdFx0Zm9yKHZhciBpIGluIHByb3BzKSB7aWYocHJvcHMuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdG9iai5zdHlsZVt2cChpKV0gPSBwcm9wc1tpXTtcblx0XHR9fVxuXHR9LFxuXG5cdC8vXHRTZXQgcHJvcHMgZm9yIHRyYW5zaXRpb25zIGFuZCB0cmFuc2Zvcm1zIHdpdGggYmFzaWMgZGVmYXVsdHNcblx0c2V0VHJhbnNpdGlvblByb3BzID0gZnVuY3Rpb24oYXJncyl7XG5cdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0XHQvL1x0ZWFzZSwgbGluZWFyLCBlYXNlLWluLCBlYXNlLW91dCwgZWFzZS1pbi1vdXQsIGN1YmljLWJlemllcihuLG4sbixuKSBpbml0aWFsLCBpbmhlcml0XG5cdFx0XHRcdFRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogXCJlYXNlXCIsXG5cdFx0XHRcdFRyYW5zaXRpb25EdXJhdGlvbjogZGVmYXVsdER1cmF0aW9uICsgXCJtc1wiLFxuXHRcdFx0XHRUcmFuc2l0aW9uUHJvcGVydHk6IFwiYWxsXCJcblx0XHRcdH0sXG5cdFx0XHRwLCBpLCB0bXAsIHRtcDIsIGZvdW5kO1xuXG5cdFx0Ly9cdFNldCBhbnkgYWxsb3dlZCBwcm9wZXJ0aWVzIFxuXHRcdGZvcihwIGluIGFyZ3MpIHsgaWYoYXJncy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuXHRcdFx0dG1wID0gJ1RyYW5zaXRpb24nICsgY2FwKHApO1xuXHRcdFx0dG1wMiA9IHAudG9Mb3dlckNhc2UoKTtcblx0XHRcdGZvdW5kID0gZmFsc2U7XG5cblx0XHRcdC8vXHRMb29rIGF0IHRyYW5zaXRpb24gcHJvcHNcblx0XHRcdGZvcihpID0gMDsgaSA8IHRyYW5zaXRpb25Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRpZih0bXAgPT0gdHJhbnNpdGlvblByb3BzW2ldKSB7XG5cdFx0XHRcdFx0cHJvcHNbdHJhbnNpdGlvblByb3BzW2ldXSA9IGFyZ3NbcF07XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vXHRMb29rIGF0IHRyYW5zZm9ybSBwcm9wc1xuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNmb3JtUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0aWYodG1wMiA9PSB0cmFuc2Zvcm1Qcm9wc1tpXSkge1xuXHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSA9IHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSB8fCBcIlwiO1xuXHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSArPSBcIiBcIiArcCArIFwiKFwiICsgYXJnc1twXSArIFwiKVwiO1xuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZm91bmQpIHtcblx0XHRcdFx0cHJvcHNbcF0gPSBhcmdzW3BdO1xuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHByb3BzO1xuXHR9LFxuXG5cdC8vXHRGaXggYW5pbWF0aXVvbiBwcm9wZXJ0aWVzXG5cdC8vXHROb3JtYWxpc2VzIHRyYW5zZm9ybXMsIGVnOiByb3RhdGUsIHNjYWxlLCBldGMuLi5cblx0bm9ybWFsaXNlVHJhbnNmb3JtUHJvcHMgPSBmdW5jdGlvbihhcmdzKXtcblx0XHR2YXIgcHJvcHMgPSB7fSxcblx0XHRcdHRtcFByb3AsXG5cdFx0XHRwLCBpLCBmb3VuZCxcblx0XHRcdG5vcm1hbCA9IGZ1bmN0aW9uKHByb3BzLCBwLCB2YWx1ZSl7XG5cdFx0XHRcdHZhciB0bXAgPSBwLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdFx0Zm91bmQgPSBmYWxzZSwgaTtcblxuXHRcdFx0XHQvL1x0TG9vayBhdCB0cmFuc2Zvcm0gcHJvcHNcblx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNmb3JtUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRpZih0bXAgPT0gdHJhbnNmb3JtUHJvcHNbaV0pIHtcblx0XHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSA9IHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSB8fCBcIlwiO1xuXHRcdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildICs9IFwiIFwiICtwICsgXCIoXCIgKyB2YWx1ZSArIFwiKVwiO1xuXHRcdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIWZvdW5kKSB7XG5cdFx0XHRcdFx0cHJvcHNbcF0gPSB2YWx1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL1x0UmVtb3ZlIHRyYW5zZm9ybSBwcm9wZXJ0eVxuXHRcdFx0XHRcdGRlbGV0ZSBwcm9wc1twXTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdC8vXHRTZXQgYW55IGFsbG93ZWQgcHJvcGVydGllcyBcblx0XHRmb3IocCBpbiBhcmdzKSB7IGlmKGFyZ3MuaGFzT3duUHJvcGVydHkocCkpIHtcblx0XHRcdC8vXHRJZiB3ZSBoYXZlIGEgcGVyY2VudGFnZSwgd2UgaGF2ZSBhIGtleSBmcmFtZVxuXHRcdFx0aWYocC5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcblx0XHRcdFx0Zm9yKGkgaW4gYXJnc1twXSkgeyBpZihhcmdzW3BdLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdFx0bm9ybWFsKGFyZ3NbcF0sIGksIGFyZ3NbcF1baV0pO1xuXHRcdFx0XHR9fVxuXHRcdFx0XHRwcm9wc1twXSA9IGFyZ3NbcF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRub3JtYWwocHJvcHMsIHAsIGFyZ3NbcF0pO1xuXHRcdFx0fVxuXHRcdH19XG5cblx0XHRyZXR1cm4gcHJvcHM7XG5cdH0sXG5cblxuXHQvL1x0SWYgYW4gb2JqZWN0IGlzIGVtcHR5XG5cdGlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcblx0XHRmb3IodmFyIGkgaW4gb2JqKSB7aWYob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fX1cblx0XHRyZXR1cm4gdHJ1ZTsgXG5cdH0sXG5cdC8vXHRDcmVhdGVzIGEgaGFzaGVkIG5hbWUgZm9yIHRoZSBhbmltYXRpb25cblx0Ly9cdFVzZSB0byBjcmVhdGUgYSB1bmlxdWUga2V5ZnJhbWUgYW5pbWF0aW9uIHN0eWxlIHJ1bGVcblx0YW5pTmFtZSA9IGZ1bmN0aW9uKHByb3BzKXtcblx0XHRyZXR1cm4gXCJhbmlcIiArIEpTT04uc3RyaW5naWZ5KHByb3BzKS5zcGxpdCgvW3t9LCVcIjpdLykuam9pbihcIlwiKTtcblx0fSxcblx0YW5pbWF0aW9ucyA9IHt9LFxuXG5cdC8vXHRTZWUgaWYgd2UgY2FuIHVzZSB0cmFuc2l0aW9uc1xuXHRjYW5UcmFucyA9IHN1cHBvcnRzVHJhbnNpdGlvbnMoKTtcblxuXHQvL1x0SUUxMCsgaHR0cDovL2Nhbml1c2UuY29tLyNzZWFyY2g9Y3NzLWFuaW1hdGlvbnNcblx0bS5hbmltYXRlUHJvcGVydGllcyA9IGZ1bmN0aW9uKGVsLCBhcmdzLCBjYil7XG5cdFx0ZWwuc3R5bGUgPSBlbC5zdHlsZSB8fCB7fTtcblx0XHR2YXIgcHJvcHMgPSBzZXRUcmFuc2l0aW9uUHJvcHMoYXJncyksIHRpbWU7XG5cblx0XHRpZih0eXBlb2YgcHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uID0gZ2V0VGltZWluTVMocHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uKSArIFwibXNcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uID0gZGVmYXVsdER1cmF0aW9uICsgXCJtc1wiO1xuXHRcdH1cblxuXHRcdHRpbWUgPSBnZXRUaW1laW5NUyhwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24pIHx8IDA7XG5cblx0XHQvL1x0U2VlIGlmIHdlIHN1cHBvcnQgdHJhbnNpdGlvbnNcblx0XHRpZihjYW5UcmFucykge1xuXHRcdFx0c2V0U3R5bGVQcm9wcyhlbCwgcHJvcHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL1x0VHJ5IGFuZCBmYWxsIGJhY2sgdG8galF1ZXJ5XG5cdFx0XHQvL1x0VE9ETzogU3dpdGNoIHRvIHVzZSB2ZWxvY2l0eSwgaXQgaXMgYmV0dGVyIHN1aXRlZC5cblx0XHRcdGlmKHR5cGVvZiAkICE9PSAndW5kZWZpbmVkJyAmJiAkLmZuICYmICQuZm4uYW5pbWF0ZSkge1xuXHRcdFx0XHQkKGVsKS5hbmltYXRlKHByb3BzLCB0aW1lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihjYil7XG5cdFx0XHRzZXRUaW1lb3V0KGNiLCB0aW1lKzEpO1xuXHRcdH1cblx0fTtcblxuXHQvL1x0VHJpZ2dlciBhIHRyYW5zaXRpb24gYW5pbWF0aW9uXG5cdG0udHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvcHRpb25zLCBjYil7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV07XG5cdFx0aWYoIWFuaSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmdW5jdGlvbihlKXtcblx0XHRcdHZhciBhcmdzID0gYW5pLmZuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJz8gdmFsdWUoKTogdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9cdEFsbG93IG92ZXJyaWRlIHZpYSBvcHRpb25zXG5cdFx0XHRmb3IoaSBpbiBvcHRpb25zKSBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0XHRhcmdzW2ldID0gb3B0aW9uc1tpXTtcblx0XHRcdH19XG5cblx0XHRcdG0uYW5pbWF0ZVByb3BlcnRpZXMoZS50YXJnZXQsIGFyZ3MsIGNiKTtcblx0XHR9O1xuXHR9O1xuXG5cdC8vXHRBZGRzIGFuIGFuaW1hdGlvbiBmb3IgYmluZGluZ3MgYW5kIHNvIG9uLlxuXHRtLmFkZEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGZuLCBvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmKGFuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgYWxyZWFkeSBkZWZpbmVkLlwiKTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgaXMgYmVpbmcgYWRkZWQgYXMgYSB0cmFuc2l0aW9uIGJhc2VkIGFuaW1hdGlvbiwgYW5kIG11c3QgdXNlIGEgZnVuY3Rpb24uXCIpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMuZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIHx8IGRlZmF1bHREdXJhdGlvbjtcblxuXHRcdGFuaW1hdGlvbnNbbmFtZV0gPSB7XG5cdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0Zm46IGZuXG5cdFx0fTtcblxuXHRcdC8vXHRBZGQgYSBkZWZhdWx0IGJpbmRpbmcgZm9yIHRoZSBuYW1lXG5cdFx0bS5hZGRCaW5kaW5nKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0bS5iaW5kQW5pbWF0aW9uKG5hbWUsIHRoaXMsIGZuLCBwcm9wKTtcblx0XHR9LCB0cnVlKTtcblx0fTtcblxuXHRtLmFkZEtGQW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSwgYXJnLCBvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmKGFuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgYWxyZWFkeSBkZWZpbmVkLlwiKTtcblx0XHR9XG5cblx0XHR2YXIgaW5pdCA9IGZ1bmN0aW9uKHByb3BzKSB7XG5cdFx0XHR2YXIgYW5pSWQgPSBhbmlOYW1lKHByb3BzKSxcblx0XHRcdFx0aGFzQW5pID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pSWQpLFxuXHRcdFx0XHRrZjtcblxuXHRcdFx0Ly9cdE9ubHkgaW5zZXJ0IG9uY2Vcblx0XHRcdGlmKCFoYXNBbmkpIHtcblx0XHRcdFx0YW5pbWF0aW9uc1tuYW1lXS5pZCA9IGFuaUlkO1xuXG5cdFx0XHRcdHByb3BzID0gbm9ybWFsaXNlVHJhbnNmb3JtUHJvcHMocHJvcHMpO1xuXHRcdFx0XHQvLyAgQ3JlYXRlIGtleWZyYW1lc1xuXHRcdFx0XHRrZiA9IHZwKFwiQGtleWZyYW1lc1wiKSArIFwiIFwiICsgYW5pSWQgKyBcIiBcIiArIEpTT04uc3RyaW5naWZ5KHByb3BzKVxuXHRcdFx0XHRcdC5zcGxpdChcIlxcXCJcIikuam9pbihcIlwiKVxuXHRcdFx0XHRcdC5zcGxpdChcIn0sXCIpLmpvaW4oXCJ9XFxuXCIpXG5cdFx0XHRcdFx0LnNwbGl0KFwiLFwiKS5qb2luKFwiO1wiKVxuXHRcdFx0XHRcdC5zcGxpdChcIiU6XCIpLmpvaW4oXCIlIFwiKTtcblxuXHRcdFx0XHR2YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdFx0XHRcdHMuc2V0QXR0cmlidXRlKCdpZCcsIGFuaUlkKTtcblx0XHRcdFx0cy5pZCA9IGFuaUlkO1xuXHRcdFx0XHRzLnRleHRDb250ZW50ID0ga2Y7XG5cdFx0XHRcdC8vICBNaWdodCBub3QgaGF2ZSBoZWFkP1xuXHRcdFx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpO1xuXHRcdFx0fVxuXG5cdFx0XHRhbmltYXRpb25zW25hbWVdLmlzSW5pdGlhbGlzZWQgPSB0cnVlO1xuXHRcdFx0YW5pbWF0aW9uc1tuYW1lXS5vcHRpb25zLmFuaW1hdGVJbW1lZGlhdGVseSA9IHRydWU7XG5cdFx0fTtcblxuXHRcdG9wdGlvbnMuZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIHx8IGRlZmF1bHREdXJhdGlvbjtcblx0XHRvcHRpb25zLmFuaW1hdGVJbW1lZGlhdGVseSA9IG9wdGlvbnMuYW5pbWF0ZUltbWVkaWF0ZWx5IHx8IGZhbHNlO1xuXG5cdFx0YW5pbWF0aW9uc1tuYW1lXSA9IHtcblx0XHRcdGluaXQ6IGluaXQsXG5cdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0YXJnOiBhcmdcblx0XHR9O1xuXG5cdFx0Ly9cdEFkZCBhIGRlZmF1bHQgYmluZGluZyBmb3IgdGhlIG5hbWVcblx0XHRtLmFkZEJpbmRpbmcobmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRtLmJpbmRBbmltYXRpb24obmFtZSwgdGhpcywgYXJnLCBwcm9wKTtcblx0XHR9LCB0cnVlKTtcblx0fTtcblxuXG5cdC8qXHRPcHRpb25zIC0gZGVmYXVsdHMgLSB3aGF0IGl0IGRvZXM6XG5cblx0XHREZWxheSAtIHVuZWRlZmluZWQgLSBkZWxheXMgdGhlIGFuaW1hdGlvblxuXHRcdERpcmVjdGlvbiAtIFxuXHRcdER1cmF0aW9uXG5cdFx0RmlsbE1vZGUgLSBcImZvcndhcmRcIiBtYWtlcyBzdXJlIGl0IHN0aWNrczogaHR0cDovL3d3dy53M3NjaG9vbHMuY29tL2Nzc3JlZi9jc3MzX3ByX2FuaW1hdGlvbi1maWxsLW1vZGUuYXNwXG5cdFx0SXRlcmF0aW9uQ291bnQsIFxuXHRcdE5hbWUsIFBsYXlTdGF0ZSwgVGltaW5nRnVuY3Rpb25cblx0XG5cdCovXG5cblx0Ly9cdFVzZWZ1bCB0byBrbm93LCAndG8nIGFuZCAnZnJvbSc6IGh0dHA6Ly9sZWEudmVyb3UubWUvMjAxMi8xMi9hbmltYXRpb25zLXdpdGgtb25lLWtleWZyYW1lL1xuXHRtLmFuaW1hdGVLRiA9IGZ1bmN0aW9uKG5hbWUsIGVsLCBvcHRpb25zLCBjYil7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV0sIGksIHByb3BzID0ge307XG5cdFx0aWYoIWFuaSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdC8vXHRBbGxvdyBvdmVycmlkZSB2aWEgb3B0aW9uc1xuXHRcdGFuaS5vcHRpb25zID0gYW5pLm9wdGlvbnMgfHwge307XG5cdFx0Zm9yKGkgaW4gb3B0aW9ucykgaWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdGFuaS5vcHRpb25zW2ldID0gb3B0aW9uc1tpXTtcblx0XHR9fVxuXG5cdFx0aWYoIWFuaS5pc0luaXRpYWxpc2VkICYmIGFuaS5pbml0KSB7XG5cdFx0XHRhbmkuaW5pdChhbmkuYXJnKTtcblx0XHR9XG5cblx0XHQvL1x0QWxsb3cgYW5pbWF0ZSBvdmVycmlkZXNcblx0XHRmb3IoaSBpbiBhbmkub3B0aW9ucykgaWYoYW5pLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRwcm9wc1t2cChcImFuaW1hdGlvblwiICsgY2FwKGkpKV0gPSBhbmkub3B0aW9uc1tpXTtcblx0XHR9fVxuXG5cdFx0Ly9cdFNldCByZXF1aXJlZCBpdGVtcyBhbmQgZGVmYXVsdCB2YWx1ZXMgZm9yIHByb3BzXG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25OYW1lXCIpXSA9IGFuaS5pZDtcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXSA9IChwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXT8gcHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV06IGRlZmF1bHREdXJhdGlvbikgKyBcIm1zXCI7XG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25EZWxheVwiKV0gPSBwcm9wc1t2cChcImFuaW1hdGlvbkRlbGF5XCIpXT8gcHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV0gKyBcIm1zXCI6IHVuZGVmaW5lZDtcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbkZpbGxNb2RlXCIpXSA9IHByb3BzW3ZwKFwiYW5pbWF0aW9uRmlsbE1vZGVcIildIHx8IFwiZm9yd2FyZHNcIjtcblxuXHRcdGVsLnN0eWxlID0gZWwuc3R5bGUgfHwge307XG5cblx0XHQvL1x0VXNlIGZvciBjYWxsYmFja1xuXHRcdHZhciBlbmRBbmkgPSBmdW5jdGlvbigpe1xuXHRcdFx0Ly9cdFJlbW92ZSBsaXN0ZW5lclxuXHRcdFx0ZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFuaW1hdGlvbmVuZFwiLCBlbmRBbmksIGZhbHNlKTtcblx0XHRcdGlmKGNiKXtcblx0XHRcdFx0Y2IoZWwpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL1x0UmVtb3ZlIGFuaW1hdGlvbiBpZiBhbnlcblx0XHRlbC5zdHlsZVt2cChcImFuaW1hdGlvblwiKV0gPSBcIlwiO1xuXHRcdGVsLnN0eWxlW3ZwKFwiYW5pbWF0aW9uTmFtZVwiKV0gPSBcIlwiO1xuXG5cdFx0Ly9cdE11c3QgdXNlIHR3byByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSBjYWxscywgZm9yIEZGIHRvXG5cdFx0Ly9cdHdvcmsgcHJvcGVybHksIGRvZXMgbm90IHNlZW0gdG8gaGF2ZSBhbnkgYWR2ZXJzZSBlZmZlY3RzXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtcblx0XHRcdFx0Ly9cdEFwcGx5IHByb3BzXG5cdFx0XHRcdGZvcihpIGluIHByb3BzKSBpZihwcm9wcy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdFx0XHRlbC5zdHlsZVtpXSA9IHByb3BzW2ldO1xuXHRcdFx0XHR9fVxuXG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgZW5kQW5pLCBmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fTtcblxuXHRtLnRyaWdnZXJLRiA9IGZ1bmN0aW9uKG5hbWUsIG9wdGlvbnMpe1xuXHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0bS5hbmltYXRlS0YobmFtZSwgdGhpcywgb3B0aW9ucyk7XG5cdFx0fTtcblx0fTtcblxuXHRtLmJpbmRBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lLCBlbCwgb3B0aW9ucywgcHJvcCkge1xuXHRcdHZhciBhbmkgPSBhbmltYXRpb25zW25hbWVdO1xuXG5cdFx0aWYoIWFuaSAmJiAhYW5pLm5hbWUpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgbm90IGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHRpZihhbmkuZm4pIHtcblx0XHRcdG0uYW5pbWF0ZVByb3BlcnRpZXMoZWwsIGFuaS5mbihwcm9wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBvbGRDb25maWcgPSBlbC5jb25maWc7XG5cdFx0XHRlbC5jb25maWcgPSBmdW5jdGlvbihlbCwgaXNJbml0KXtcblx0XHRcdFx0aWYoIWFuaS5pc0luaXRpYWxpc2VkICYmIGFuaS5pbml0KSB7XG5cdFx0XHRcdFx0YW5pLmluaXQob3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocHJvcCgpICYmIGlzSW5pdCkge1xuXHRcdFx0XHRcdG0uYW5pbWF0ZUtGKG5hbWUsIGVsLCBvcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihvbGRDb25maWcpIHtcblx0XHRcdFx0XHRvbGRDb25maWcuYXBwbHkoZWwsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG5cblxuXHQvKiBEZWZhdWx0IHRyYW5zZm9ybTJkIGJpbmRpbmdzICovXG5cdHZhciBiYXNpY0JpbmRpbmdzID0gWydzY2FsZScsICdzY2FsZXgnLCAnc2NhbGV5JywgJ3RyYW5zbGF0ZScsICd0cmFuc2xhdGV4JywgJ3RyYW5zbGF0ZXknLCBcblx0XHQnbWF0cml4JywgJ2JhY2tncm91bmRDb2xvcicsICdiYWNrZ3JvdW5kUG9zaXRpb24nLCAnYm9yZGVyQm90dG9tQ29sb3InLCBcblx0XHQnYm9yZGVyQm90dG9tV2lkdGgnLCAnYm9yZGVyTGVmdENvbG9yJywgJ2JvcmRlckxlZnRXaWR0aCcsICdib3JkZXJSaWdodENvbG9yJywgXG5cdFx0J2JvcmRlclJpZ2h0V2lkdGgnLCAnYm9yZGVyU3BhY2luZycsICdib3JkZXJUb3BDb2xvcicsICdib3JkZXJUb3BXaWR0aCcsICdib3R0b20nLCBcblx0XHQnY2xpcCcsICdjb2xvcicsICdmb250U2l6ZScsICdmb250V2VpZ2h0JywgJ2hlaWdodCcsICdsZWZ0JywgJ2xldHRlclNwYWNpbmcnLCBcblx0XHQnbGluZUhlaWdodCcsICdtYXJnaW5Cb3R0b20nLCAnbWFyZ2luTGVmdCcsICdtYXJnaW5SaWdodCcsICdtYXJnaW5Ub3AnLCAnbWF4SGVpZ2h0JywgXG5cdFx0J21heFdpZHRoJywgJ21pbkhlaWdodCcsICdtaW5XaWR0aCcsICdvcGFjaXR5JywgJ291dGxpbmVDb2xvcicsICdvdXRsaW5lV2lkdGgnLCBcblx0XHQncGFkZGluZ0JvdHRvbScsICdwYWRkaW5nTGVmdCcsICdwYWRkaW5nUmlnaHQnLCAncGFkZGluZ1RvcCcsICdyaWdodCcsICd0ZXh0SW5kZW50JywgXG5cdFx0J3RleHRTaGFkb3cnLCAndG9wJywgJ3ZlcnRpY2FsQWxpZ24nLCAndmlzaWJpbGl0eScsICd3aWR0aCcsICd3b3JkU3BhY2luZycsICd6SW5kZXgnXSxcblx0XHRkZWdCaW5kaW5ncyA9IFsncm90YXRlJywgJ3JvdGF0ZXgnLCAncm90YXRleScsICdza2V3eCcsICdza2V3eSddLCBpO1xuXG5cdC8vXHRCYXNpYyBiaW5kaW5ncyB3aGVyZSB3ZSBwYXNzIHRoZSBwcm9wIHN0cmFpZ2h0IHRocm91Z2hcblx0Zm9yKGkgPSAwOyBpIDwgYmFzaWNCaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdChmdW5jdGlvbihuYW1lKXtcblx0XHRcdG0uYWRkQW5pbWF0aW9uKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IHt9O1xuXHRcdFx0XHRvcHRpb25zW25hbWVdID0gcHJvcCgpO1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH0pO1xuXHRcdH0oYmFzaWNCaW5kaW5nc1tpXSkpO1xuXHR9XG5cblx0Ly9cdERlZ3JlZSBiYXNlZCBiaW5kaW5ncyAtIGNvbmRpdGlvbmFsbHkgcG9zdGZpeCB3aXRoIFwiZGVnXCJcblx0Zm9yKGkgPSAwOyBpIDwgZGVnQmluZGluZ3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHQoZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRtLmFkZEFuaW1hdGlvbihuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdFx0dmFyIG9wdGlvbnMgPSB7fSwgdmFsdWUgPSBwcm9wKCk7XG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSBpc05hTih2YWx1ZSk/IHZhbHVlOiB2YWx1ZSArIFwiZGVnXCI7XG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fSk7XG5cdFx0fShkZWdCaW5kaW5nc1tpXSkpO1xuXHR9XG5cblx0Ly9cdEF0dHJpYnV0ZXMgdGhhdCByZXF1aXJlIG1vcmUgdGhhbiBvbmUgcHJvcFxuXHRtLmFkZEFuaW1hdGlvbihcInNrZXdcIiwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dmFyIHZhbHVlID0gcHJvcCgpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRza2V3OiBbXG5cdFx0XHRcdHZhbHVlWzBdICsgKGlzTmFOKHZhbHVlWzBdKT8gXCJcIjpcImRlZ1wiKSwgXG5cdFx0XHRcdHZhbHVlWzFdICsgKGlzTmFOKHZhbHVlWzFdKT8gXCJcIjpcImRlZ1wiKVxuXHRcdFx0XVxuXHRcdH07XG5cdH0pO1xuXG5cblxuXHQvL1x0QSBmZXcgbW9yZSBiaW5kaW5nc1xuXHRtID0gbSB8fCB7fTtcblx0Ly9cdEhpZGUgbm9kZVxuXHRtLmFkZEJpbmRpbmcoXCJoaWRlXCIsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMuc3R5bGUgPSB7XG5cdFx0XHRkaXNwbGF5OiBtLnVud3JhcChwcm9wKT8gXCJub25lXCIgOiBcIlwiXG5cdFx0fTtcblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFRvZ2dsZSBib29sZWFuIHZhbHVlIG9uIGNsaWNrXG5cdG0uYWRkQmluZGluZygndG9nZ2xlJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbmNsaWNrID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciB2YWx1ZSA9IHByb3AoKTtcblx0XHRcdHByb3AoIXZhbHVlKTtcblx0XHR9XG5cdH0sIHRydWUpO1xuXG5cdC8vXHRTZXQgaG92ZXIgc3RhdGVzLCBhJ2xhIGpRdWVyeSBwYXR0ZXJuXG5cdG0uYWRkQmluZGluZygnaG92ZXInLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9ubW91c2VvdmVyID0gcHJvcFswXTtcblx0XHRpZihwcm9wWzFdKSB7XG5cdFx0XHR0aGlzLm9ubW91c2VvdXQgPSBwcm9wWzFdO1xuXHRcdH1cblx0fSwgdHJ1ZSApO1xuXG5cbn07XG5cblxuXG5cblxuXG5cbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gbWl0aHJpbEFuaW1hdGU7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbWl0aHJpbEFuaW1hdGU7XG5cdH0pO1xufSBlbHNlIHtcblx0bWl0aHJpbEFuaW1hdGUodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3cubSB8fCB7fToge30pO1xufVxuXG59KCkpOyIsIi8vICBTbW9vdGggc2Nyb2xsaW5nIGZvciBsaW5rc1xuLy8gIFVzYWdlOiAgICAgIEEoe2NvbmZpZzogc21vb3RoU2Nyb2xsKGN0cmwpLCBocmVmOiBcIiN0b3BcIn0sIFwiQmFjayB0byB0b3BcIilcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3RybCl7XG5cdC8vdmFyIHJvb3QgPSAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyk/IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50OiB0aGlzLFxuXHR2YXIgcm9vdCA9ICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyk/IC9maXJlZm94fHRyaWRlbnQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogZG9jdW1lbnQuYm9keTogbnVsbCxcblx0XHRlYXNlSW5PdXRTaW5lID0gZnVuY3Rpb24gKHQsIGIsIGMsIGQpIHtcblx0XHRcdC8vICBodHRwOi8vZ2l6bWEuY29tL2Vhc2luZy9cblx0XHRcdHJldHVybiAtYy8yICogKE1hdGguY29zKE1hdGguUEkqdC9kKSAtIDEpICsgYjtcblx0XHR9O1xuXG5cdHJldHVybiBmdW5jdGlvbihlbGVtZW50LCBpc0luaXRpYWxpemVkKSB7XG5cdFx0aWYoIWlzSW5pdGlhbGl6ZWQpIHtcblx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0dmFyIHN0YXJ0VGltZSxcblx0XHRcdFx0XHRzdGFydFBvcyA9IHJvb3Quc2Nyb2xsVG9wLFxuXHRcdFx0XHRcdGVuZFBvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKC9bXiNdKyQvLmV4ZWModGhpcy5ocmVmKVswXSkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wLFxuXHRcdFx0XHRcdGhhc2ggPSB0aGlzLmhyZWYuc3Vic3RyKHRoaXMuaHJlZi5sYXN0SW5kZXhPZihcIiNcIikpLFxuXHRcdFx0XHRcdG1heFNjcm9sbCA9IHJvb3Quc2Nyb2xsSGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0LFxuXHRcdFx0XHRcdHNjcm9sbEVuZFZhbHVlID0gKHN0YXJ0UG9zICsgZW5kUG9zIDwgbWF4U2Nyb2xsKT8gZW5kUG9zOiBtYXhTY3JvbGwgLSBzdGFydFBvcyxcblx0XHRcdFx0XHRkdXJhdGlvbiA9IHR5cGVvZiBjdHJsLmR1cmF0aW9uICE9PSAndW5kZWZpbmVkJz8gY3RybC5kdXJhdGlvbjogMTUwMCxcblx0XHRcdFx0XHRzY3JvbGxGdW5jID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG5cdFx0XHRcdFx0XHRzdGFydFRpbWUgPSBzdGFydFRpbWUgfHwgdGltZXN0YW1wO1xuXHRcdFx0XHRcdFx0dmFyIGVsYXBzZWQgPSB0aW1lc3RhbXAgLSBzdGFydFRpbWUsXG5cdFx0XHRcdFx0XHRcdHByb2dyZXNzID0gZWFzZUluT3V0U2luZShlbGFwc2VkLCBzdGFydFBvcywgc2Nyb2xsRW5kVmFsdWUsIGR1cmF0aW9uKTtcblx0XHRcdFx0XHRcdHJvb3Quc2Nyb2xsVG9wID0gcHJvZ3Jlc3M7XG5cdFx0XHRcdFx0XHRpZihlbGFwc2VkIDwgZHVyYXRpb24pIHtcblx0XHRcdFx0XHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEZ1bmMpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYoaGlzdG9yeS5wdXNoU3RhdGUpIHtcblx0XHRcdFx0XHRcdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBoYXNoKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRsb2NhdGlvbi5oYXNoID0gaGFzaDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsRnVuYylcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7IHJldHVybiB7XCJBcGkubWRcIjpcIjxwPlRoZSBkYXRhIGFwaXMgaW4gbWlzbyBhcmUgYSB3YXkgdG8gY3JlYXRlIGEgUkVTVGZ1bCBlbmRwb2ludCB0aGF0IHlvdSBjYW4gaW50ZXJhY3Qgd2l0aCB2aWEgYW4gZWFzeSB0byB1c2UgQVBJLjwvcD5cXG48YmxvY2txdW90ZT5cXG5Ob3RlOiB5b3UgbXVzdCBlbmFibGUgeW91ciBhcGkgYnkgYWRkaW5nIGl0IHRvIHRoZSAmcXVvdDthcGkmcXVvdDsgYXR0cmlidXRlIGluIHRoZSA8Y29kZT4vY2ZnL3NlcnZlci5kZXZlbG9wbWVudC5qc29uPC9jb2RlPiBmaWxlLCBvciB3aGF0ZXZlciBlbnZpcm9ubWVudCB5b3UgYXJlIHVzaW5nLlxcbjwvYmxvY2txdW90ZT5cXG5cXG48aDI+PGEgbmFtZT1cXFwiaG93LWRvZXMtYW4tYXBpLXdvcmstXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaG93LWRvZXMtYW4tYXBpLXdvcmstXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkhvdyBkb2VzIGFuIGFwaSB3b3JrPzwvc3Bhbj48L2E+PC9oMj48cD5UaGUgYXBpcyBpbiBtaXNvIGRvIGEgbnVtYmVyIG9mIHRoaW5nczo8L3A+XFxuPHVsPlxcbjxsaT5BbGxvdyBkYXRhYmFzZSBhY2Nlc3MgdmlhIGEgdGhpbiB3cmFwcGVyLCBmb3IgZXhhbXBsZSB0byBhY2Nlc3MgbW9uZ29kYiwgd2Ugd3JhcCB0aGUgcG9wdWxhciA8YSBocmVmPVxcXCIvZG9jL21vbmdvb3NlLm1kXFxcIj5tb25nb29zZSBucG08L2E+IE9ETSBwYWNrYWdlPC9saT5cXG48bGk+V2FpdHMgdGlsbCBtaXRocmlsIGlzIHJlYWR5IC0gbWl0aHJpbCBoYXMgYSB1bmlxdWUgZmVhdHVyZSBlbnN1cmVzIHRoZSB2aWV3IGRvZXNuJiMzOTt0IHJlbmRlciB0aWxsIGRhdGEgaGFzIGJlZW4gcmV0cmlldmVkIC0gdGhlIGFwaSBtYWtlcyBzdXJlIHdlIGFkaGVyZSB0byB0aGlzPC9saT5cXG48bGk+QXBpcyBjYW4gd29yayBhcyBhIHByb3h5LCBzbyBpZiB5b3Ugd2FudCB0byBhY2Nlc3MgYSAzcmQgcGFydHkgc2VydmljZSwgYW4gYXBpIGlzIGEgZ29vZCB3YXkgdG8gZG8gdGhhdCAtIHlvdSBjYW4gdGhlbiBhbHNvIGJ1aWxkIGluIGNhY2hpbmcsIG9yIGFueSBvdGhlciBmZWF0dXJlcyB5b3UgbWF5IHdpc2ggdG8gYWRkLjwvbGk+XFxuPGxpPkFwaXMgY2FuIGJlIHJlc3RyaWN0ZWQgYnkgcGVybWlzc2lvbnMgKGNvbWluZyBzb29uKSA8L2xpPlxcbjwvdWw+XFxuPGgyPjxhIG5hbWU9XFxcImhvdy1zaG91bGQteW91LXVzZS1hcGlzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaG93LXNob3VsZC15b3UtdXNlLWFwaXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SG93IHNob3VsZCB5b3UgdXNlIGFwaXM8L3NwYW4+PC9hPjwvaDI+PHA+VGhlcmUgYXJlIG51bWVyb3VzIHNjZW5hcmlvcyB3aGVyZSB5b3UgbWlnaHQgd2FudCB0byB1c2UgYW4gYXBpOjwvcD5cXG48dWw+XFxuPGxpPkZvciBkYXRhYmFzZSBhY2Nlc3MgKG1pc28gY29tZXMgd2l0aCBhIGJ1bmNoIG9mIGRhdGFiYXNlIGFwaXMpPC9saT5cXG48bGk+Rm9yIGNhbGxpbmcgM3JkIHBhcnR5IGVuZC1wb2ludHMgLSB1c2luZyBhbiBhcGkgd2lsbCBhbGxvdyB5b3UgdG8gY3JlYXRlIGNhY2hpbmcgYW5kIHNldHVwIHBlcm1pc3Npb25zIG9uIHRoZSBlbmQtcG9pbnQ8L2xpPlxcbjwvdWw+XFxuPGgyPjxhIG5hbWU9XFxcImV4dGVuZGluZy1hbi1leGlzdGluZy1hcGlcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNleHRlbmRpbmctYW4tZXhpc3RpbmctYXBpXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkV4dGVuZGluZyBhbiBleGlzdGluZyBhcGk8L3NwYW4+PC9hPjwvaDI+PHA+SWYgeW91IHdhbnQgdG8gYWRkIHlvdXIgb3duIG1ldGhvZHMgdG8gYW4gYXBpLCB5b3UgY2FuIHNpbXBseSBleHRlbmQgb25lIG9mIHRoZSBleGlzdGluZyBhcGlzLCBmb3IgZXhhbXBsZSwgdG8gZXh0ZW5kIHRoZSA8Y29kZT5mbGF0ZmlsZWRiPC9jb2RlPiBBUEksIGNyZWF0ZSBhIG5ldyBkaXJlY3RvcnkgYW5kIGZpbGUgaW4gPGNvZGU+L21vZHVsZXMvYXBpL2FkYXB0L2FkYXB0LmFwaS5qczwvY29kZT46PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIGRiID0gcmVxdWlyZSgmIzM5Oy4uLy4uLy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9mbGF0ZmlsZWRiLmFwaS5qcyYjMzk7KTtcXG5cXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG0pe1xcbiAgICB2YXIgYWQgPSBkYihtKTtcXG4gICAgYWQuaGVsbG8gPSBmdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpe1xcbiAgICAgICAgY2IoJnF1b3Q7d29ybGQmcXVvdDspO1xcbiAgICB9O1xcbiAgICByZXR1cm4gYWQ7XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlbiBhZGQgdGhlIGFwaSB0byB0aGUgPGNvZGU+L2NmZy9zZXJ2ZXIuZGV2ZWxvcG1lbnQuanNvbjwvY29kZT4gZmlsZSBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPiZxdW90O2FwaSZxdW90OzogJnF1b3Q7YWRhcHQmcXVvdDtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlbiByZXF1aXJlIHRoZSBuZXcgYXBpIGZpbGUgaW4geW91ciBtdmMgZmlsZSBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiID0gcmVxdWlyZSgmIzM5Oy4uL21vZHVsZXMvYXBpL2FkYXB0L2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPllvdSBjYW4gbm93IGFkZCBhbiBhcGkgY2FsbCBpbiB0aGUgY29udHJvbGxlciBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiLmhlbGxvKHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbi8vIGRvIHNvbWV0aGluZyB3aXRoIGRhdGEucmVzdWx0XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZSBhcmd1bWVudHMgdG8gZWFjaCBhcGkgZW5kcG9pbnQgbXVzdCBiZSB0aGUgc2FtZSwgaWU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZnVuY3Rpb24oY2IsIGVyciwgYXJncywgcmVxKVxcbjwvY29kZT48L3ByZT5cXG48cD5XaGVyZTo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkFyZ3VtZW50PC90aD5cXG48dGg+UHVycG9zZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPmNiPC90ZD5cXG48dGQ+QSBjYWxsYmFjayB5b3UgbXVzdCBjYWxsIHdoZW4geW91IGFyZSBkb25lIC0gYW55IGRhdGEgeW91IHJldHVybiB3aWxsIGJlIGF2YWlsYWJsZSBvbiA8Y29kZT5kYXRhLnJlc3VsdDwvY29kZT4gaW4gdGhlIHJlc3BvbnNlPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+ZXJyPC90ZD5cXG48dGQ+QSBjYWxsYmFjayB5b3UgbXVzdCBjYWxsIGlmIGFuIHVucmVjb3ZlcmFibGUgZXJyb3Igb2NjdXJyZWQsIGVnOiAmcXVvdDtkYXRhYmFzZSBjb25uZWN0aW9uIHRpbWVvdXQmcXVvdDsuIERvIG5vdCB1c2UgZm9yIHRoaW5ncyBsaWtlICZxdW90O25vIGRhdGEgZm91bmQmcXVvdDs8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5hcmdzPC90ZD5cXG48dGQ+QSBzZXQgb2YgYXJndW1lbnRzIHBhc3NlZCBpbiB0byB0aGUgYXBpIG1ldGhvZDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPnJlcTwvdGQ+XFxuPHRkPlRoZSByZXF1ZXN0IG9iamVjdCBmcm9tIHRoZSByZXF1ZXN0PC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5UaGUgY29tcGxldGUgbXZjIGV4YW1wbGUgbG9va3MgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgZGIgPSByZXF1aXJlKCYjMzk7Li4vbW9kdWxlcy9hcGkvYWRhcHQvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICAgICAgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2FkYXB0X2lkJiMzOTssIHBhcmFtcyk7XFxuXFxuICAgICAgICBkYi5oZWxsbyh7fSkudGhlbihmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICBjdHJsLm1vZGVsLndobyhkYXRhLnJlc3VsdCk7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIGN0cmwubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gRElWKCZxdW90O0cmIzM5O2RheSAmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxoMj48YSBuYW1lPVxcXCJjcmVhdGluZy1jdXN0b20tYXBpc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NyZWF0aW5nLWN1c3RvbS1hcGlzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNyZWF0aW5nIGN1c3RvbSBhcGlzPC9zcGFuPjwvYT48L2gyPjxwPllvdSBjYW4gYWRkIHlvdXIgb3duIGN1c3RvbSBhcGlzIGluIHRoZSA8Y29kZT4vbW9kdWxlcy9hcGlzPC9jb2RlPiBkaXJlY3RvcnksIHRoZXkgaGF2ZSB0aGUgc2FtZSBmb3JtYXQgYXMgdGhlIGluY2x1ZGVkIGFwaXMsIGhlcmUgaXMgYW4gZXhhbXBsZSBhcGkgdGhhdCBjYWxscyB0aGUgZmxpY2tyIEFQSTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4vLyAgICBlbmRwb2ludCBhcGkgdG8gbWFrZSBodHRwIHJlcXVlc3RzIHZpYSBmbGlja3JcXG52YXIgcmVxdWVzdCA9IHJlcXVpcmUoJiMzOTtyZXF1ZXN0JiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uLy4uLy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIC8vICAgIFBhcnNlIG91dCB0aGUgdW53YW50ZWQgcGFydHMgb2YgdGhlIGpzb25cXG4gICAgLy8gICAgdHlwaWNhbGx5IHRoaXMgd291bGQgYmUgcnVuIG9uIHRoZSBjbGllbnRcXG4gICAgLy8gICAgd2UgcnVuIHRoaXMgdXNpbmcgJnF1b3Q7cmVxdWVzdCZxdW90OyBvbiAgdGhlIHNlcnZlciwgc29cXG4gICAgLy8gICAgbm8gbmVlZCBmb3IgdGhlIGpzb25wIGNhbGxiYWNrXFxuICAgIGpzb25QYXJzZXIgPSBmdW5jdGlvbihqc29ucERhdGEpe1xcbiAgICAgICAgdmFyIGpzb24sIHN0YXJ0UG9zLCBlbmRQb3M7XFxuICAgICAgICB0cnkge1xcbiAgICAgICAgICAgIHN0YXJ0UG9zID0ganNvbnBEYXRhLmluZGV4T2YoJiMzOTsoeyYjMzk7KTtcXG4gICAgICAgICAgICBlbmRQb3MgPSBqc29ucERhdGEubGFzdEluZGV4T2YoJiMzOTt9KSYjMzk7KTtcXG4gICAgICAgICAgICBqc29uID0ganNvbnBEYXRhXFxuICAgICAgICAgICAgICAgIC5zdWJzdHJpbmcoc3RhcnRQb3MrMSwgZW5kUG9zKzEpXFxuICAgICAgICAgICAgICAgIC5zcGxpdCgmcXVvdDtcXFxcbiZxdW90Oykuam9pbigmcXVvdDsmcXVvdDspXFxuICAgICAgICAgICAgICAgIC5zcGxpdCgmcXVvdDtcXFxcXFxcXCYjMzk7JnF1b3Q7KS5qb2luKCZxdW90OyYjMzk7JnF1b3Q7KTtcXG5cXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uKTtcXG4gICAgICAgIH0gY2F0Y2goZXgpIHtcXG4gICAgICAgICAgICBjb25zb2xlLmxvZygmcXVvdDtFUlJPUiZxdW90OywgZXgpO1xcbiAgICAgICAgICAgIHJldHVybiAmcXVvdDt7fSZxdW90OztcXG4gICAgICAgIH1cXG4gICAgfTtcXG5cXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHV0aWxzKXtcXG4gICAgcmV0dXJuIHtcXG4gICAgICAgIHBob3RvczogZnVuY3Rpb24oY2IsIGVyciwgYXJncywgcmVxKXtcXG4gICAgICAgICAgICBhcmdzID0gYXJncyB8fCB7fTtcXG4gICAgICAgICAgICB2YXIgdXJsID0gJnF1b3Q7aHR0cDovL2FwaS5mbGlja3IuY29tL3NlcnZpY2VzL2ZlZWRzL3Bob3Rvc19wdWJsaWMuZ25lP2Zvcm1hdD1qc29uJnF1b3Q7O1xcbiAgICAgICAgICAgIC8vICAgIEFkZCBwYXJhbWV0ZXJzXFxuICAgICAgICAgICAgdXJsICs9IG1pc28uZWFjaChhcmdzLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuICZxdW90OyZhbXA7JnF1b3Q7ICsga2V5ICsgJnF1b3Q7PSZxdW90OyArIHZhbHVlO1xcbiAgICAgICAgICAgIH0pO1xcblxcbiAgICAgICAgICAgIHJlcXVlc3QodXJsLCBmdW5jdGlvbiAoZXJyb3IsIHJlc3BvbnNlLCBib2R5KSB7XFxuICAgICAgICAgICAgICAgIGlmICghZXJyb3IgJmFtcDsmYW1wOyByZXNwb25zZS5zdGF0dXNDb2RlID09IDIwMCkge1xcbiAgICAgICAgICAgICAgICAgICAgY2IoanNvblBhcnNlcihib2R5KSk7XFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XFxuICAgICAgICAgICAgICAgICAgICBlcnIoZXJyb3IpO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9XFxuICAgIH07XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VG8gdXNlIGl0IGluIHlvdXIgbXZjIGZpbGUsIHNpbXBseTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mbGlja3IgPSByZXF1aXJlKCYjMzk7Li4vbW9kdWxlcy9hcGkvZmxpY2tyL2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFuZCB0aGVuIGNhbGwgaXQgbGlrZSBzbyBpbiB5b3VyIGNvbnRyb2xsZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZmxpY2tyLnBob3Rvcyh7dGFnczogJnF1b3Q7U3lkbmV5IG9wZXJhIGhvdXNlJnF1b3Q7LCB0YWdtb2RlOiAmcXVvdDthbnkmcXVvdDt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbiAgICBjdHJsLm1vZGVsLmZsaWNrckRhdGEoZGF0YS5yZXN1bHQuaXRlbXMpO1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG5cIixcIkF1dGhlbnRpY2F0aW9uLm1kXCI6XCI8aDI+PGEgbmFtZT1cXFwiYXV0aGVudGljYXRpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNhdXRoZW50aWNhdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5BdXRoZW50aWNhdGlvbjwvc3Bhbj48L2E+PC9oMj48cD5BdXRoZW50aWNhdGlvbiBpcyB0aGUgcHJvY2VzcyBvZiBtYWtpbmcgc3VyZSBhIHVzZXIgaXMgd2hvIHRoZXkgc2F5IHRoZXkgYXJlIC0gdXN1YWxseSB0aGlzIGlzIGRvbmUgYnkgdXNpbmcgYSB1c2VybmFtZSBhbmQgcGFzc3dvcmQsIGJ1dCBpdCBjYW4gYWxzbyBiZSBkb25lIHZpYSBhbiBhY2Nlc3MgdG9rZW4sIDNyZC1wYXJ0eSBzZXJ2aWNlcyBzdWNoIGFzIE9BdXRoLCBvciBzb21ldGhpbmcgbGlrZSBPcGVuSUQsIG9yIGluZGVlZCBHb29nbGUsIEZhY2Vib29rLCBHaXRIVWIsIGV0Yy4uLjwvcD5cXG48cD5JbiBtaXNvLCB0aGUgYXV0aGVudGljYXRpb24gZmVhdHVyZSBoYXM6PC9wPlxcbjx1bD5cXG48bGk+VGhlIGFiaWxpdHkgdG8gc2VlIGlmIHRoZSB1c2VyIGhhcyBsb2dnZWQgaW4gKHZpYSBhIHNlY3JldCB2YWx1ZSBvbiB0aGUgc2VydmVyLXNpZGUgc2Vzc2lvbik8L2xpPlxcbjxsaT5UaGUgYWJpbGl0eSB0byByZWRpcmVjdCB0byBhIGxvZ2luIHBhZ2UgaWYgdGhleSBoYXZlbiYjMzk7dCBsb2dnZWQgaW48L2xpPlxcbjwvdWw+XFxuPHA+WW91IGNhbiBjb25maWd1cmUgdGhlIGF1dGhlbnRpY2F0aW9uIGluIDxjb2RlPi9jZmcvc2VydmVyLmpzb248L2NvZGU+LCBhbmQgc2V0IHRoZSBhdXRoZW50aWNhdGlvbiBhdHRyaWJ1dGUgb24gdGhlIGFjdGlvbiB0aGF0IHJlcXVpcmVzIGl0LjwvcD5cXG48cD5Gb3IgZXhhbXBsZSwgaW4gPGNvZGU+L2NmZy9zZXJ2ZXIuanNvbjwvY29kZT4sIHlvdSBjYW4gc2V0OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPiZxdW90O2F1dGhlbnRpY2F0aW9uJnF1b3Q7OiB7XFxuICAgICZxdW90O2VuYWJsZWQmcXVvdDs6IHRydWUsXFxuICAgICZxdW90O2FsbCZxdW90OzogZmFsc2UsXFxuICAgICZxdW90O3NlY3JldCZxdW90OzogJnF1b3Q7aW0tc28tbWlzbyZxdW90OyxcXG4gICAgJnF1b3Q7c3RyYXRlZ3kmcXVvdDs6ICZxdW90O2RlZmF1bHQmcXVvdDssXFxuICAgICZxdW90O2xvZ2luVXJsUGF0dGVybiZxdW90OzogJnF1b3Q7L2xvZ2luP3VybD1bT1JJR0lOQUxVUkxdJnF1b3Q7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5XaGVyZTo8L3A+XFxuPHVsPlxcbjxsaT48c3Ryb25nPmVuYWJsZWQ8L3N0cm9uZz4gd2lsbCBlbmFibGUgb3VyIGF1dGhlbnRpY2F0aW9uIGJlaGF2aW91cjwvbGk+XFxuPGxpPjxzdHJvbmc+YWxsPC9zdHJvbmc+IHdpbGwgc2V0IHRoZSBkZWZhdWx0IGJlaGF2aW91ciBvZiBhdXRoZW50aWNhdGlvbiBmb3IgYWxsIGFjdGlvbnMsIGRlZmF1bHQgaXMgJnF1b3Q7ZmFsc2UmcXVvdDssIGllOiBubyBhdXRoZW50aWNhdGlvbiByZXF1aXJlZDwvbGk+XFxuPGxpPjxzdHJvbmc+c2VjcmV0PC9zdHJvbmc+IGlzIHRoZSBzZWNyZXQgdmFsdWUgdGhhdCBpcyBzZXQgb24gdGhlIHNlc3Npb248L2xpPlxcbjxsaT48c3Ryb25nPmxvZ2luVXJsUGF0dGVybjwvc3Ryb25nPiBpcyBhIFVSTCBwYXR0ZXJuIHdoZXJlIHdlIHdpbGwgc3Vic3RpdHV0ZSAmcXVvdDtbT1JJR0lOQUxVUkxdJnF1b3Q7IGZvciB0aGUgb3JpZ2luYWxseSByZXF1ZXN0ZWQgVVJMLjwvbGk+XFxuPGxpPjxzdHJvbmc+bWlkZGxld2FyZTwvc3Ryb25nPiBpcyB0aGUgYXV0aGVudGljYXRpb24gbWlkZGxld2FyZSB0byB1c2UsIGRlZmF1bHQgaXMgJnF1b3Q7Li4vc3lzdGVtL2F1dGhfbWlkZGxlJnF1b3Q7PC9saT5cXG48L3VsPlxcbjxwPk5vdywgaWYgeW91IHdhbnQgYSBwYXJ0aWN1bGFyIGFjdGlvbiB0byBiZSBhdXRoZW50aWNhdGVkLCB5b3UgY2FuIG92ZXJyaWRlIHRoZSBkZWZhdWx0IChhbGwpIHZhbHVlIGluIGVhY2ggb2YgeW91ciBhY3Rpb25zLCBmb3IgZXhhbXBsZSB0byBuZWVkIGF1dGhlbnRpY2F0aW9uIG9uIHRoZSA8Y29kZT5pbmRleDwvY29kZT4gYWN0aW9uIG9mIHlvdXIgdG9kb3MgYXBwLCBzZXQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIC4uLixcXG4gICAgYXV0aGVudGljYXRlOiB0cnVlXFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSAmcXVvdDthbGwmcXVvdDsgYXR0cmlidXRlIGZvcm0gdGhlIHNlcnZlciBjb25maWcgYXV0aGVudGljYXRpb24gYW5kIG1ha2UgYXV0aGVudGljYXRpb24gcmVxdWlyZWQgb24gdGhpcyBhY3Rpb24uXFxuSWYgeW91ciBhcHAgaXMgbWFpbmx5IGEgc2VjdXJlIGFwcCwgeW91JiMzOTtsbCB3YW50IHRvIHNldCAmcXVvdDthbGwmcXVvdDsgYXR0cmlidXRlIHRvIHRydWUgYW5kIG92ZXJyaWRlIHRoZSAmcXVvdDtsb2dpbiZxdW90OyBhbmQsIChpZiB5b3UgaGF2ZSBvbmUpLCB0aGUgJnF1b3Q7Zm9yZ290IHBhc3N3b3JkJnF1b3Q7IHBhZ2VzLCBhbmQgc28gYXMgdG8gbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb24sIGllOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICAuLi4sXFxuICAgIGF1dGhlbnRpY2F0ZTogZmFsc2VcXG59O1xcbjwvY29kZT48L3ByZT5cXG48aDM+PGEgbmFtZT1cXFwic2FtcGxlLWltcGxlbWVudGF0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjc2FtcGxlLWltcGxlbWVudGF0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlNhbXBsZSBpbXBsZW1lbnRhdGlvbjwvc3Bhbj48L2E+PC9oMz48cD5JbiBNaXNvLCB3ZSBoYXZlIGEgc2FtcGxlIGltcGxlbWVudGF0aW9uIG9mIGF1dGhlbnRpY2F0aW9uIHRoYXQgdXNlcyB0aGUgZmxhdGZpbGVkYiBhcGkuIFRoZXJlIGFyZSA0IG1haW4gY29tcG9uZW50cyBpbiB0aGUgc2FtcGxlIGF1dGhlbnRpY2F0aW9uIHByb2Nlc3M6PC9wPlxcbjx1bD5cXG48bGk+PHA+VGhlIGF1dGhlbnRpY2F0ZSBhcGkgPGNvZGU+L3N5c3RlbS9hcGkvYXV0aGVudGljYXRlPC9jb2RlPiAtIGhhbmRsZXMgc2F2aW5nIGFuZCBsb2FkaW5nIG9mIHVzZXJzLCBwbHVzIGNoZWNraW5nIGlmIHRoZSBwYXNzd29yZCBtYXRjaGVzLjwvcD5cXG48L2xpPlxcbjxsaT48cD5UaGUgbG9naW4gbWVjaGFuaXNtIDxjb2RlPi9tdmMvbG9naW4uanM8L2NvZGU+IC0gc2ltcGx5IGFsbG93cyB5b3UgdG8gZW50ZXIgYSB1c2VybmFtZSBhbmQgcGFzc3dvcmQgYW5kIHVzZXMgdGhlIGF1dGhlbnRpY2F0aW9uIGFwaSB0byBsb2cgeW91IGluPC9wPlxcbjwvbGk+XFxuPGxpPjxwPlVzZXIgbWFuYWdlbWVudCA8Y29kZT4vbXZjL3VzZXJzLmpzPC9jb2RlPiAtIFVzZXMgdGhlIGF1dGhlbnRpY2F0aW9uIGFwaSB0byBhZGQgYSB1c2VyIHdpdGggYW4gZW5jcnlwdGVkIHBhc3N3b3JkPC9wPlxcbjwvbGk+XFxuPGxpPjxwPkF1dGhlbnRpY2F0aW9uIG1pZGRsZXdhcmUgPGNvZGU+L3N5c3RlbS9hdXRoX21pZGRsZS5qczwvY29kZT4gLSBhcHBsaWVzIGF1dGhlbnRpY2F0aW9uIG9uIHRoZSBzZXJ2ZXIgZm9yIGFjdGlvbnMgLSB0aGlzIGlzIGEgY29yZSBmZWF0dXJlIG9mIGhvdyBtaXNvIGRvZXMgdGhlIGF1dGhlbnRpY2F0aW9uIC0gaXQgc2ltcGx5IGNoZWNrcyBpZiB0aGUgc2VjcmV0IGlzIHNldCBvbiB0aGUgc2Vzc2lvbiwgYW5kIHJlZGlyZWN0cyB0byB0aGUgY29uZmlndXJlZCAmcXVvdDtsb2dpblVybFBhdHRlcm4mcXVvdDsgVVJMIGlmIGl0IGRvZXNuJiMzOTt0IG1hdGNoIHRoZSBzZWNyZXQuPC9wPlxcbjwvbGk+XFxuPC91bD5cXG48cD5JZGVhbGx5IHlvdSB3aWxsIG5vdCBuZWVkIHRvIGNoYW5nZSB0aGUgYXV0aGVudGljYXRpb24gbWlkZGxld2FyZSwgYXMgdGhlIGltcGxlbWVudGF0aW9uIHNpbXBseSByZXF1aXJlcyB5b3UgdG8gc2V0IHRoZSAmcXVvdDthdXRoZW50aWNhdGlvblNlY3JldCZxdW90OyBvbiB0aGUgcmVxdWVzdCBvYmplY3Qgc2Vzc2lvbiAtIHlvdSBjYW4gc2VlIGhvdyB0aGlzIHdvcmtzIGluIDxjb2RlPi9zeXN0ZW0vYXBpL2F1dGhlbnRpY2F0ZS9hdXRoZW50aWNhdGUuYXBpLmpzPC9jb2RlPi48L3A+XFxuPGgzPjxhIG5hbWU9XFxcImhvdy10aGUtc2FtcGxlLWltcGxlbWVudGF0aW9uLXdvcmtzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaG93LXRoZS1zYW1wbGUtaW1wbGVtZW50YXRpb24td29ya3NcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SG93IHRoZSBzYW1wbGUgaW1wbGVtZW50YXRpb24gd29ya3M8L3NwYW4+PC9hPjwvaDM+PHVsPlxcbjxsaT5XaGVuIGF1dGhlbnRpY2F0aW9uIGlzIHJlcXVpcmVkIGZvciBhY2Nlc3MgdG8gYW4gYWN0aW9uLCBhbmQgeW91IGhhdmVuJiMzOTt0IGF1dGhlbnRpY2F0ZWQsIHlvdSBhcmUgcmVkaXJlY3RlZCB0byB0aGUgPGNvZGU+L2xvZ2luPC9jb2RlPiBhY3Rpb248L2xpPlxcbjxsaT5BdCA8Y29kZT4vbG9naW48L2NvZGU+IHlvdSBjYW4gYXV0aGVudGljYXRlIHdpdGggYSB1c2VybmFtZSBhbmQgcGFzc3dvcmQgKHdoaWNoIGNhbiBiZSBjcmVhdGVkIGF0IDxjb2RlPi91c2VyczwvY29kZT4pPC9saT5cXG48bGk+V2hlbiBhdXRoZW50aWNhdGVkLCBhIHNlY3JldCBrZXkgaXMgc2V0IG9uIHRoZSBzZXNzaW9uLCB0aGlzIGlzIHVzZWQgdG8gY2hlY2sgaWYgYSB1c2VyIGlzIGxvZ2dlZCBpbiBldmVyeSB0aW1lIHRoZXkgYWNjZXNzIGFuIGFjdGlvbiB0aGF0IHJlcXVpcmVzIGF1dGhlbnRpY2F0aW9uLjwvbGk+XFxuPC91bD5cXG48cD5Ob3RlOiB0aGUgYXV0aGVudGljYXRpb24gc2VjcmV0IGlzIG9ubHkgZXZlciBrZXB0IG9uIHRoZSBzZXJ2ZXIsIHNvIHRoZSBjbGllbnQgY29kZSBzaW1wbHkgaGFzIGEgYm9vbGVhbiB0byBzYXkgaWYgaXQgaXMgbG9nZ2VkIGluIC0gdGhpcyBtZWFucyBpdCB3aWxsIHRyeSB0byBhY2Nlc3MgYXV0aGVudGljYXRlZCB1cmxzIGlmIDxjb2RlPm1pc29HbG9iYWwuaXNMb2dnZWRJbjwvY29kZT4gaXMgc2V0IHRvICZxdW90O3RydWUmcXVvdDsuIE9mIGNvdXJzZSB0aGUgc2VydmVyIHdpbGwgZGVueSBhY2Nlc3MgdG8gYW55IGRhdGEgYXBpIGVuZCBwb2ludHMsIHNvIHlvdXIgZGF0YSBpcyBzYWZlLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwic2Vzc2lvbnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzZXNzaW9uc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5TZXNzaW9uczwvc3Bhbj48L2E+PC9oMj48cD5XaGVuIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQsIHRoZXkgYXJlIHByb3ZpZGVkIHdpdGggYSBzZXNzaW9uIC0gdGhpcyBjYW4gYmUgdXNlZCB0byBzdG9yZSB0ZW1wb3JhcnkgZGF0YSBhbmQgaXMgYWNjZXNzaWJsZSB2aWEgPGNvZGU+L3N5c3RlbS9hcGkvc2Vzc2lvbi9hcGkuc2VydmVyLmpzPC9jb2RlPi4gWW91IGNhbiB1c2UgaXQgbGlrZSBzbyBpbiB5b3VyIDxjb2RlPm12YzwvY29kZT4gZmlsZXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIHNlc3Npb24gPSByZXF1aXJlKCYjMzk7Li4vc3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuXFxuc2Vzc2lvbi5nZXQoe2tleTogJiMzOTt1c2VyTmFtZSYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKXtcXG4gICAgY29uc29sZS5sb2coZGF0YS5yZXN1bHQpO1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVzZSBhcmUgdGhlIG1ldGhvZHMgYXZhaWxhYmxlIG9uIHRoZSBzZXNzaW9uIGFwaTo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPk1ldGhvZDwvdGg+XFxuPHRoPlB1cnBvc2U8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5nZXQoe2tleToga2V5fSk8L3RkPlxcbjx0ZD5SZXRyaWV2ZXMgYSB2YWx1ZSBmcm9tIHRoZSBzZXNzaW9uIGZvciB0aGUgZ2l2ZW4ga2V5PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+c2V0KHtrZXk6IGtleSwgdmFsdWU6IHZhbHVlfSk8L3RkPlxcbjx0ZD5TZXRzIGEgdmFsdWUgaW4gdGhlIHNlc3Npb24gZm9yIHRoZSBnaXZlbiBrZXk8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPk5vdGU6IEVhY2ggdXNlciBvZiB5b3VyIGFwcCBoYXMgYSBzZXNzaW9uIHRoYXQgaXMgc3RvcmVkIG9uIHRoZSBzZXJ2ZXIsIHNvIGVhY2ggdGltZSB5b3UgYWNjZXNzIGl0LCBpdCB3aWxsIG1ha2UgYSBYSFIgcmVxdWVzdC4gVXNlIGl0IHNwYXJpbmdseSE8L3A+XFxuXCIsXCJDb250cmlidXRpbmcubWRcIjpcIjxwPkluIG9yZGVyIHRvIGNvbnRyaWJ1dGUgdG8gbWlzb2pzLCBwbGVhc2Uga2VlcCB0aGUgZm9sbG93aW5nIGluIG1pbmQ6PC9wPlxcbjxoMj48YSBuYW1lPVxcXCJ3aGVuLWFkZGluZy1hLXB1bGwtcmVxdWVzdFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3doZW4tYWRkaW5nLWEtcHVsbC1yZXF1ZXN0XFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPldoZW4gYWRkaW5nIGEgcHVsbCByZXF1ZXN0PC9zcGFuPjwvYT48L2gyPjx1bD5cXG48bGk+QmUgc3VyZSB0byBvbmx5IG1ha2Ugc21hbGwgY2hhbmdlcywgYW55dGhpbmcgbW9yZSB0aGFuIDQgZmlsZXMgd2lsbCBuZWVkIHRvIGJlIHJldmlld2VkPC9saT5cXG48bGk+TWFrZSBzdXJlIHlvdSBleHBsYWluIDxlbT53aHk8L2VtPiB5b3UmIzM5O3JlIG1ha2luZyB0aGUgY2hhbmdlLCBzbyB3ZSB1bmRlcnN0YW5kIHdoYXQgdGhlIGNoYW5nZSBpcyBmb3I8L2xpPlxcbjxsaT5BZGQgYSB1bml0IHRlc3QgaWYgYXBwcm9wcmlhdGU8L2xpPlxcbjxsaT5EbyBub3QgYmUgb2ZmZW5kZWQgaWYgd2UgYXNrIHlvdSB0byBhZGQgYSB1bml0IHRlc3QgYmVmb3JlIGFjY2VwdGluZyBhIHB1bGwgcmVxdWVzdDwvbGk+XFxuPGxpPlVzZSB0YWJzIG5vdCBzcGFjZXMgKHdlIGFyZSBub3QgZmxleGlibGUgb24gdGhpcyAtIGl0IGlzIGEgbW9vdCBkaXNjdXNzaW9uIC0gSSByZWFsbHkgZG9uJiMzOTt0IGNhcmUsIHdlIGp1c3QgbmVlZGVkIHRvIHBpY2sgb25lLCBhbmQgdGFicyBpdCBpcyk8L2xpPlxcbjwvdWw+XFxuXCIsXCJDcmVhdGluZy1hLXRvZG8tYXBwLXBhcnQtMi1wZXJzaXN0ZW5jZS5tZFwiOlwiPHA+SW4gdGhpcyBhcnRpY2xlIHdlIHdpbGwgYWRkIGRhdGEgcGVyc2lzdGVuY2UgZnVuY3Rpb25hbGl0eSB0byBvdXIgdG9kbyBhcHAgZnJvbSB0aGUgPGEgaHJlZj1cXFwiL2RvYy9DcmVhdGluZy1hLXRvZG8tYXBwLm1kXFxcIj5DcmVhdGluZyBhIHRvZG8gYXBwPC9hPiBhcnRpY2xlLiBXZSByZWNvbW1lbmQgeW91IGZpcnN0IHJlYWQgdGhhdCBhcyB3ZSBhcmUgZ29pbmcgdG8gdXNlIHRoZSBhcHAgeW91IG1hZGUgaW4gdGhpcyBhcnRpY2xlLCBzbyBpZiB5b3UgZG9uJiMzOTt0IGFscmVhZHkgaGF2ZSBvbmUsIGdyYWIgYSBjb3B5IG9mIGl0IDxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcCNjb21wbGV0ZWQtdG9kby1hcHAubWRcXFwiPmZyb20gaGVyZTwvYT4sIGFuZCBzYXZlIGl0IGluIDxjb2RlPi9tdmMvdG9kby5qczwvY29kZT4uPC9wPlxcbjxwPkZpcnN0IGFkZCB0aGUgPGNvZGU+ZmxhdGZpbGVkYjwvY29kZT4gYXBpIHRvIHRoZSA8Y29kZT5jZmcvc2VydmVyLmRldmVsb3BtZW50Lmpzb248L2NvZGU+IGZpbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+JnF1b3Q7YXBpJnF1b3Q7OiAmcXVvdDtmbGF0ZmlsZWRiJnF1b3Q7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgbWFrZXMgbWlzbyBsb2FkIHRoZSBhcGkgYW5kIGV4cG9zZSBpdCBhdCB0aGUgY29uZmlndXJlZCBBUEkgdXJsLCBkZWZhdWx0IGlzICZxdW90Oy9hcGkmcXVvdDsgKyBhcGkgbmFtZSwgc28gZm9yIHRoZSBmbGF0ZmlsZWRiIGl0IHdpbGwgYmUgPGNvZGU+L2FwaS9mbGF0ZmlsZWRiPC9jb2RlPi4gVGhpcyBpcyBhbGwgYWJzdHJhY3RlZCBhd2F5LCBzbyB5b3UgZG8gbm90IG5lZWQgdG8gd29ycnkgYWJvdXQgd2hhdCB0aGUgVVJMIGlzIHdoZW4gdXNpbmcgdGhlIGFwaSAtIHlvdSBzaW1wbHkgY2FsbCB0aGUgbWV0aG9kIHlvdSB3YW50LCBhbmQgdGhlIG1pc28gYXBpIHRha2VzIGNhcmUgb2YgdGhlIHJlc3QuPC9wPlxcbjxwPk5vdyByZXF1aXJlIHRoZSBkYiBhcGkgYXQgdGhlIHRoZSB0b3Agb2YgdGhlIHRvZG8uanMgZmlsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5kYiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+TmV4dCBhZGQgdGhlIGZvbGxvd2luZyBpbiB0aGUgPGNvZGU+Y3RybC5hZGRUb2RvPC9jb2RlPiBmdW5jdGlvbiB1bmRlcm5lYXRoIHRoZSBsaW5lIHRoYXQgcmVhZHMgPGNvZGU+Y3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspOzwvY29kZT46PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIuc2F2ZSh7IHR5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTssIG1vZGVsOiBuZXdUb2RvIH0gKS50aGVuKGZ1bmN0aW9uKHJlcyl7XFxuICAgIG5ld1RvZG8uX2lkID0gcmVzLnJlc3VsdDtcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIHNhdmUgdGhlIHRvZG8gdG8gdGhlIGRhdGFiYXNlIHdoZW4geW91IGNsaWNrIHRoZSAmcXVvdDtBZGQmcXVvdDsgYnV0dG9uLjwvcD5cXG48cD5MZXQgdXMgdGFrZSBhIHF1aWNrIGxvb2sgYXQgaG93IHRoZSBhcGkgd29ya3MgLSB0aGUgd2F5IHRoYXQgeW91IG1ha2UgcmVxdWVzdHMgdG8gdGhlIGFwaSBkZXBlbmRzIGVudGlyZWx5IG9uIHdoaWNoIGFwaSB5b3UgYXJlIHVzaW5nLCBmb3IgZXhhbXBsZSBmb3IgdGhlIGZsYXRmaWxlZGIsIHdlIGhhdmU6PC9wPlxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5NZXRob2Q8L3RoPlxcbjx0aD5BY3Rpb248L3RoPlxcbjx0aD5QYXJhbWV0ZXJzPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+c2F2ZTwvdGQ+XFxuPHRkPlNhdmUgb3IgdXBkYXRlcyBhIG1vZGVsPC90ZD5cXG48dGQ+eyB0eXBlOiBUWVBFLCBtb2RlbDogTU9ERUwgfTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmZpbmQ8L3RkPlxcbjx0ZD5GaW5kcyBvbmUgb3IgbW9yZSBtb2RlbHMgb2YgdGhlIGdpdmUgdHlwZTwvdGQ+XFxuPHRkPnsgdHlwZTogVFlQRSwgcXVlcnk6IFFVRVJZIH08L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5yZW1vdmU8L3RkPlxcbjx0ZD5SZW1vdmVzIGFuIGluc3RhbmNlIG9mIGEgbW9kZWw8L3RkPlxcbjx0ZD57IHR5cGU6IFRZUEUsIGlkOiBJRCB9PC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5XaGVyZSB0aGUgYXR0cmlidXRlcyBhcmU6PC9wPlxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5BdHRyaWJ1dGU8L3RoPlxcbjx0aD5Vc2U8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5UWVBFPC90ZD5cXG48dGQ+VGhlIG5hbWVzcGFjZSBvZiB0aGUgbW9kZWwsIHNheSB5b3UgaGF2ZSB0b2RvLmpzLCBhbmQgdGhlIG1vZGVsIGlzIG9uIDxjb2RlPm1vZHVsZS5leHBvcnRzLmluZGV4Lm1vZHVsZXMudG9kbzwvY29kZT4sIHRoZSB0eXBlIHdvdWxkIGJlICZxdW90O3RvZG8uaW5kZXgudG9kbyZxdW90OzwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPk1PREVMPC90ZD5cXG48dGQ+VGhpcyBpcyBhbiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCAtIGVnOiBhIHN0YW5kYXJkIG1pdGhyaWwgbW9kZWw8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5RVUVSWTwvdGQ+XFxuPHRkPkFuIG9iamVjdCB3aXRoIGF0dHJpYnV0ZXMgdG8gZmlsdGVyIHRoZSBxdWVyeSByZXN1bHRzPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+SUQ8L3RkPlxcbjx0ZD5BIHVuaXF1ZSBJRCBmb3IgYSByZWNvcmQ8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPkV2ZXJ5IG1ldGhvZCByZXR1cm5zIGEgPGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLmRlZmVycmVkLmh0bWwjZGlmZmVyZW5jZXMtZnJvbS1wcm9taXNlcy1hLS5tZFxcXCI+bWl0aHJpbCBzdHlsZSBwcm9taXNlPC9hPiwgd2hpY2ggbWVhbnMgeW91IG11c3QgYXR0YWNoIGEgPGNvZGU+LnRoZW48L2NvZGU+IGNhbGxiYWNrIGZ1bmN0aW9uLlxcbkJlIHN1cmUgdG8gY2hlY2sgdGhlIG1ldGhvZHMgZm9yIGVhY2ggYXBpLCBhcyBlYWNoIHdpbGwgdmFyeSwgZGVwZW5kaW5nIG9uIHRoZSBmdW5jdGlvbmFsaXR5LjwvcD5cXG48cD5Ob3csIGxldCB1cyBhZGQgdGhlIGNhcGFiaWxpdHkgdG8gbG9hZCBvdXIgdG9kb3MsIGFkZCB0aGUgZm9sbG93aW5nIHRvIHRoZSBzdGFydCBvZiB0aGUgY29udHJvbGxlciwganVzdCBhZnRlciB0aGUgPGNvZGU+dmFyIGN0cmwgPSB0aGlzPC9jb2RlPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5kYi5maW5kKHt0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XFxuICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8oZGF0YS5yZXN1bHRba2V5XSk7XFxuICAgIH0pO1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbG9hZCB5b3VyIHRvZG9zIHdoZW4gdGhlIGFwcCBsb2FkcyB1cC4gQmUgc3VyZSB0byByZW1vdmUgdGhlIG9sZCBzdGF0aWMgbGlzdCwgaWU6IHJlbW92ZSB0aGVzZSBsaW5lczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5teVRvZG9zID0gW3t0ZXh0OiAmcXVvdDtMZWFybiBtaXNvJnF1b3Q7fSwge3RleHQ6ICZxdW90O0J1aWxkIG1pc28gYXBwJnF1b3Q7fV07XFxuXFxuY3RybC5saXN0ID0gT2JqZWN0LmtleXMobXlUb2RvcykubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+Tm93IHlvdSBjYW4gdHJ5IGFkZGluZyBhIHRvZG8sIGFuZCBpdCB3aWxsIHNhdmUgYW5kIGxvYWQhPC9wPlxcbjxwPk5leHQgbGV0IHVzIGFkZCB0aGUgYWJpbGl0eSB0byByZW1vdmUgeW91ciBjb21wbGV0ZWQgdG9kb3MgaW4gdGhlIGFyY2hpdmUgbWV0aG9kIC0gZXh0ZW5kIHRoZSA8Y29kZT5pZjwvY29kZT4gc3RhdGVtZW50IGJ5IGFkZGluZyBhbiA8Y29kZT5lbHNlPC9jb2RlPiBsaWtlIHNvOiA8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj59IGVsc2Uge1xcbiAgICBhcGkucmVtb3ZlKHsgdHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5OywgX2lkOiB0b2RvLl9pZCB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcXG4gICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlc3VsdCk7XFxuICAgIH0pO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIHJlbW92ZSB0aGUgdG9kbyBmcm9tIHRoZSBkYXRhIHN0b3JlLjwvcD5cXG48cD5Zb3Ugbm93IGhhdmUgYSBjb21wbGV0ZSB0b2RvIGFwcCwgeW91ciBhcHAgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgZGIgPSByZXF1aXJlKCYjMzk7Li4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuXFxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICB0b2RvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XFxuICAgICAgICAgICAgdGhpcy5kb25lID0gbS5wcm9wKGRhdGEuZG9uZSA9PSAmcXVvdDtmYWxzZSZxdW90Oz8gZmFsc2U6IGRhdGEuZG9uZSk7XFxuICAgICAgICAgICAgdGhpcy5faWQgPSBkYXRhLl9pZDtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXM7XFxuXFxuICAgICAgICBkYi5maW5kKHt0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XFxuICAgICAgICAgICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKGRhdGEucmVzdWx0W2tleV0pO1xcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgfSk7XFxuXFxuICAgICAgICBjdHJsLmFkZFRvZG8gPSBmdW5jdGlvbihlKXtcXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBjdHJsLnZtLmlucHV0KCk7XFxuICAgICAgICAgICAgaWYodmFsdWUpIHtcXG4gICAgICAgICAgICAgICAgdmFyIG5ld1RvZG8gPSBuZXcgc2VsZi5tb2RlbHMudG9kbyh7XFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjdHJsLnZtLmlucHV0KCksXFxuICAgICAgICAgICAgICAgICAgICBkb25lOiBmYWxzZVxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0LnB1c2gobmV3VG9kbyk7XFxuICAgICAgICAgICAgICAgIGN0cmwudm0uaW5wdXQoJnF1b3Q7JnF1b3Q7KTtcXG4gICAgICAgICAgICAgICAgZGIuc2F2ZSh7IHR5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTssIG1vZGVsOiBuZXdUb2RvIH0gKS50aGVuKGZ1bmN0aW9uKHJlcyl7XFxuICAgICAgICAgICAgICAgICAgICBuZXdUb2RvLl9pZCA9IHJlcy5yZXN1bHQ7XFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIGN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbXTtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgICAgICAgICAgaWYoIXRvZG8uZG9uZSgpKSB7XFxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godG9kbyk7IFxcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xcbiAgICAgICAgICAgICAgICAgICAgZGIucmVtb3ZlKHsgdHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5OywgX2lkOiB0b2RvLl9pZCB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5yZXN1bHQpO1xcbiAgICAgICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICBjdHJsLmxpc3QgPSBsaXN0O1xcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIGN0cmwudm0gPSB7XFxuICAgICAgICAgICAgbGVmdDogZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICAgICAgICAgICAgICBjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50O1xcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgZG9uZTogZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcXG4gICAgICAgICAgICAgICAgICAgIHRvZG8uZG9uZSghdG9kby5kb25lKCkpO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgICAgICBpbnB1dDogbS5wcm9wKCZxdW90OyZxdW90OylcXG4gICAgICAgIH07XFxuXFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBTVFlMRSgmcXVvdDsuZG9uZXt0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDt9JnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgSDEoJnF1b3Q7VG9kb3MgLSAmcXVvdDsgKyBjdHJsLnZtLmxlZnQoKSArICZxdW90OyBvZiAmcXVvdDsgKyBjdHJsLmxpc3QubGVuZ3RoICsgJnF1b3Q7IHJlbWFpbmluZyZxdW90OyksXFxuICAgICAgICAgICAgICAgIEJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCAmcXVvdDtBcmNoaXZlJnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgVUwoW1xcbiAgICAgICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTEkoeyBjbGFzczogdG9kby5kb25lKCk/ICZxdW90O2RvbmUmcXVvdDs6ICZxdW90OyZxdW90Oywgb25jbGljazogY3RybC52bS5kb25lKHRvZG8pIH0sIHRvZG8udGV4dCk7XFxuICAgICAgICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgICAgICBdKSxcXG4gICAgICAgICAgICAgICAgRk9STSh7IG9uc3VibWl0OiBjdHJsLmFkZFRvZG8gfSwgW1xcbiAgICAgICAgICAgICAgICAgICAgSU5QVVQoeyB0eXBlOiAmcXVvdDt0ZXh0JnF1b3Q7LCB2YWx1ZTogY3RybC52bS5pbnB1dCwgcGxhY2Vob2xkZXI6ICZxdW90O0FkZCB0b2RvJnF1b3Q7fSksXFxuICAgICAgICAgICAgICAgICAgICBCVVRUT04oeyB0eXBlOiAmcXVvdDtzdWJtaXQmcXVvdDt9LCAmcXVvdDtBZGQmcXVvdDspXFxuICAgICAgICAgICAgICAgIF0pXFxuICAgICAgICAgICAgXVxcbiAgICAgICAgfTtcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcblwiLFwiQ3JlYXRpbmctYS10b2RvLWFwcC5tZFwiOlwiPHA+SW4gdGhpcyBhcnRpY2xlIHdlIHdpbGwgY3JlYXRlIGEgZnVuY3Rpb25hbCB0b2RvIGFwcCAtIHdlIHJlY29tbWVuZCB5b3UgZmlyc3QgcmVhZCB0aGUgPGEgaHJlZj1cXFwiL2RvYy9HZXR0aW5nLXN0YXJ0ZWQubWRcXFwiPkdldHRpbmcgc3RhcnRlZDwvYT4gYXJ0aWNsZSwgYW5kIHVuZGVyc3RhbmQgdGhlIG1pc28gZnVuZGFtZW50YWxzIHN1Y2ggYXMgd2hlcmUgdG8gcGxhY2UgbW9kZWxzIGFuZCBob3cgdG8gY3JlYXRlIGEgbWlzbyBjb250cm9sbGVyLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwidG9kby1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN0b2RvLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ub2RvIGFwcDwvc3Bhbj48L2E+PC9oMj48cD5XZSB3aWxsIG5vdyBjcmVhdGUgYSBuZXcgYXBwIHVzaW5nIHRoZSA8YSBocmVmPVxcXCIvZG9jL1BhdHRlcm5zI3NpbmdsZS11cmwtbXZjLm1kXFxcIj5zaW5nbGUgdXJsIHBhdHRlcm48L2E+LCB3aGljaCBtZWFucyBpdCBoYW5kbGVzIGFsbCBhY3Rpb25zIGF1dG9ub21vdXNseSwgcGx1cyBsb29rcyBhIGxvdCBsaWtlIGEgbm9ybWFsIG1pdGhyaWwgYXBwLjwvcD5cXG48cD5JbiA8Y29kZT4vbXZjPC9jb2RlPiBzYXZlIGEgbmV3IGZpbGUgYXMgPGNvZGU+dG9kby5qczwvY29kZT4gd2l0aCB0aGUgZm9sbG93aW5nIGNvbnRlbnQ6IDwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5Oyk7XFxuXFxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7fSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXM7XFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgcmV0dXJuICZxdW90O1RPRE8mcXVvdDs7XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5Ob3cgb3BlbjogPGEgaHJlZj1cXFwiL2RvYy90b2Rvcy5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdDo2NDc2L3RvZG9zPC9hPiBhbmQgeW91JiMzOTtsbCBzZWUgdGhlIHdvcmQgJnF1b3Q7VE9ETyZxdW90Oy4gWW91JiMzOTtsbCBub3RpY2UgdGhhdCB0aGUgdXJsIGlzICZxdW90Oy90b2RvcyZxdW90OyB3aXRoIGFuICYjMzk7cyYjMzk7IG9uIHRoZSBlbmQgLSBhcyB3ZSBhcmUgdXNpbmcgPGEgaHJlZj1cXFwiL2RvYy9Ib3ctbWlzby13b3JrcyNyb3V0ZS1ieS1jb252ZW50aW9uLm1kXFxcIj5yb3V0ZSBieSBjb252ZW50aW9uPC9hPiB0byBtYXAgb3VyIHJvdXRlLjwvcD5cXG48cD5OZXh0IGxldCYjMzk7cyBjcmVhdGUgdGhlIG1vZGVsIGZvciBvdXIgdG9kb3MgLSBjaGFuZ2UgdGhlIDxjb2RlPm1vZGVsczwvY29kZT4gYXR0cmlidXRlIHRvIHRoZSBmb2xsb3dpbmc6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kZWxzOiB7XFxuICAgIHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgdGhpcy5kb25lID0gbS5wKGRhdGEuZG9uZSA9PSAmcXVvdDtmYWxzZSZxdW90Oz8gZmFsc2U6IGRhdGEuZG9uZSk7XFxuICAgICAgICB0aGlzLl9pZCA9IGRhdGEuX2lkO1xcbiAgICB9XFxufSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+RWFjaCBsaW5lIGluIHRoZSBtb2RlbCBkb2VzIHRoZSBmb2xsb3dpbmc6PC9wPlxcbjx1bD5cXG48bGk+PGNvZGU+dGhpcy50ZXh0PC9jb2RlPiAtIFRoZSB0ZXh0IHRoYXQgaXMgc2hvd24gb24gdGhlIHRvZG88L2xpPlxcbjxsaT48Y29kZT50aGlzLmRvbmU8L2NvZGU+IC0gVGhpcyByZXByZXNlbnRzIGlmIHRoZSB0b2RvIGhhcyBiZWVuIGNvbXBsZXRlZCAtIHdlIGVuc3VyZSB0aGF0IHdlIGhhbmRsZSB0aGUgJnF1b3Q7ZmFsc2UmcXVvdDsgdmFsdWVzIGNvcnJlY3RseSwgYXMgYWpheCByZXNwb25zZXMgYXJlIGFsd2F5cyBzdHJpbmdzLjwvbGk+XFxuPGxpPjxjb2RlPnRoaXMuX2lkPC9jb2RlPiAtIFRoZSBrZXkgZm9yIHRoZSB0b2RvPC9saT5cXG48L3VsPlxcbjxwPlRoZSBtb2RlbCBjYW4gbm93IGJlIHVzZWQgdG8gc3RvcmUgYW5kIHJldHJlaXZlIHRvZG9zIC0gbWlzbyBhdXRvbWF0aWNhbGx5IHBpY2tzIHVwIGFueSBvYmplY3RzIG9uIHRoZSA8Y29kZT5tb2RlbHM8L2NvZGU+IGF0dHJpYnV0ZSBvZiB5b3VyIG12YyBmaWxlLCBhbmQgbWFwcyBpdCBpbiB0aGUgQVBJLiBXZSB3aWxsIHNvb24gc2VlIGhvdyB0aGF0IHdvcmtzLiBOZXh0IGFkZCB0aGUgZm9sbG93aW5nIGNvZGUgYXMgdGhlIGNvbnRyb2xsZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgIG15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG4gICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMobXlUb2RvcykubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKG15VG9kb3Nba2V5XSk7XFxuICAgIH0pO1xcbiAgICByZXR1cm4gY3RybDtcXG59LFxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIGRvZXMgdGhlIGZvbGxvd2luZzo8L3A+XFxuPHVsPlxcbjxsaT5DcmVhdGVzIDxjb2RlPm15VG9kb3M8L2NvZGU+IHdoaWNoIGlzIGEgbGlzdCBvZiBvYmplY3RzIHRoYXQgcmVwcmVzZW50cyB0b2RvczwvbGk+XFxuPGxpPjxjb2RlPnRoaXMubGlzdDwvY29kZT4gLSBjcmVhdGVzIGEgbGlzdCBvZiB0b2RvIG1vZGVsIG9iamVjdHMgYnkgdXNpbmcgPGNvZGU+bmV3IHNlbGYubW9kZWxzLnRvZG8oLi4uPC9jb2RlPiBvbiBlYWNoIG15VG9kb3Mgb2JqZWN0LjwvbGk+XFxuPGxpPjxjb2RlPnJldHVybiB0aGlzPC9jb2RlPiBtdXN0IGJlIGRvbmUgaW4gYWxsIGNvbnRyb2xsZXJzLCBpdCBtYWtlcyBzdXJlIHRoYXQgbWlzbyBjYW4gY29ycmVjdGx5IGdldCBhY2Nlc3MgdG8gdGhlIGNvbnRyb2xsZXIgb2JqZWN0LjwvbGk+XFxuPC91bD5cXG48cD5Ob3RlOiB3ZSBhbHdheXMgY3JlYXRlIGEgbG9jYWwgdmFyaWFibGUgPGNvZGU+Y3RybDwvY29kZT4gdGhhdCBwb2ludHMgdG8gdGhlIGNvbnRyb2xsZXIsIGFzIGl0IGNhbiBiZSB1c2VkIHRvIGFjY2VzcyB2YXJpYWJsZXMgaW4gdGhlIGNvbnRyb2xsZXIgZnJvbSBuZXN0ZWQgZnVuY3Rpb25zLiBZb3Ugd2lsbCBzZWUgdGhpcyB1c2FnZSBsYXRlciBvbiBpbiB0aGlzIGFydGljbGUuPC9wPlxcbjxwPk5vdyB1cGRhdGUgdGhlIHZpZXcgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHJldHVybiBtKCZxdW90O1VMJnF1b3Q7LCBbXFxuICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgIHJldHVybiBtKCZxdW90O0xJJnF1b3Q7LCB0b2RvLnRleHQpXFxuICAgICAgICB9KVxcbiAgICBdKTtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBpdGVyYXRlIG9uIHlvdXIgbmV3bHkgY3JlYXRlZCBsaXN0IG9mIHRvZG8gbW9kZWwgb2JqZWN0cyBhbmQgZGlzcGxheSB0aGUgb24gc2NyZWVuLiBZb3VyIHRvZG8gYXBwIHNob3VsZCBub3cgbG9vayBsaWtlIHRoaXM6PC9wPlxcbjxoMz48YSBuYW1lPVxcXCJoYWxmLXdheS1wb2ludFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2hhbGYtd2F5LXBvaW50XFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkhhbGYtd2F5IHBvaW50PC9zcGFuPjwvYT48L2gzPjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgICAgICB0aGlzLmRvbmUgPSBtLnAoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgICAgICB0aGlzLl9pZCA9IGRhdGEuX2lkO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICBteVRvZG9zID0gW3t0ZXh0OiAmcXVvdDtMZWFybiBtaXNvJnF1b3Q7fSwge3RleHQ6ICZxdW90O0J1aWxkIG1pc28gYXBwJnF1b3Q7fV07XFxuICAgICAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKG15VG9kb3Nba2V5XSk7XFxuICAgICAgICB9KTtcXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICByZXR1cm4gbSgmcXVvdDtVTCZxdW90OywgW1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgIHJldHVybiBtKCZxdW90O0xJJnF1b3Q7LCB0b2RvLnRleHQpXFxuICAgICAgICAgICAgfSlcXG4gICAgICAgIF0pO1xcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPGJsb2NrcXVvdGU+XFxuU28gZmFyIHdlIGhhdmUgb25seSB1c2VkIHB1cmUgbWl0aHJpbCB0byBjcmVhdGUgb3VyIGFwcCAtIG1pc28gZGlkIGRvIHNvbWUgb2YgdGhlIGdydW50LXdvcmsgYmVoaW5kIHRoZSBzY2VuZXMsIGJ1dCB3ZSBjYW4gZG8gbXVjaCBtb3JlLlxcbjwvYmxvY2txdW90ZT5cXG5cXG5cXG48cD5MZXQgdXMgYWRkIHNvbWUgdXNlZnVsIGxpYnJhcmllcywgY2hhbmdlIHRoZSB0b3Agc2VjdGlvbiB0bzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGJpbmRpbmdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLmJpbmRpbmdzLm5vZGUuanMmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBpbmNsdWRlIHRoZSBmb2xsb3dpbmcgbGlicmFyaWVzOjwvcD5cXG48dWw+XFxuPGxpPjxhIGhyZWY9XFxcIi9kb2MvbWl0aHJpbC5zdWdhcnRhZ3MubWRcXFwiPm1pdGhyaWwuc3VnYXJ0YWdzPC9hPiAtIGFsbG93cyByZW5kZXJpbmcgSFRNTCB1c2luZyB0YWdzIHRoYXQgbG9vayBhIGxpdHRsZSBtb3JlIGxpa2UgSFRNTCB0aGFuIHN0YW5kYXJkIG1pdGhyaWw8L2xpPlxcbjxsaT48YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuYmluZGluZ3MubWRcXFwiPm1pdGhyaWwuYmluZGluZ3M8L2E+IEJpLWRpcmVjdGlvbmFsIGRhdGEgYmluZGluZ3MgZm9yIHJpY2hlciBtb2RlbHM8L2xpPlxcbjwvdWw+XFxuPHA+TGV0IHVzIHN0YXJ0IHdpdGggdGhlIHN1Z2FyIHRhZ3MsIHVwZGF0ZSB0aGUgdmlldyB0byByZWFkOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgIHJldHVybiBVTChbXFxuICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIExJKHRvZG8udGV4dClcXG4gICAgICAgICAgICB9KVxcbiAgICAgICAgXSlcXG4gICAgfTtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNvIHVzaW5nIHN1Z2FydGFncyBhbGxvd3MgdXMgdG8gd3JpdGUgbW9yZSBjb25jaXNlIHZpZXdzLCB0aGF0IGxvb2sgbW9yZSBsaWtlIG5hdHVyYWwgSFRNTC48L3A+XFxuPHA+TmV4dCBsZXQgdXMgYWRkIGEgPGEgaHJlZj1cXFwiL2RvYy93aGF0LWlzLWEtdmlldy1tb2RlbC5odG1sLm1kXFxcIj52aWV3IG1vZGVsPC9hPiB0byB0aGUgY29udHJvbGxlci4gQSB2aWV3IG1vZGVsIGlzIHNpbXBseSBhIG1vZGVsIHRoYXQgY29udGFpbnMgZGF0YSBhYm91dCB0aGUgdmlldywgYW5kIGF1eGlsbGFyeSBmdW5jdGlvbmFsaXR5LCBpZTogZGF0YSBhbmQgb3RoZXIgdGhpbmdzIHRoYXQgd2UgZG9uJiMzOTt0IHdhbnQgdG8gcGVyc2lzdC4gQWRkIHRoaXMgdG8gdGhlIGNvbnRyb2xsZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y3RybC52bSA9IHtcXG4gICAgZG9uZTogZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XFxuICAgICAgICAgICAgdG9kby5kb25lKCF0b2RvLmRvbmUoKSk7XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIG1ldGhvZCB3aWxsIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgdG9nZ2xlcyB0aGUgPGNvZGU+ZG9uZTwvY29kZT4gYXR0cmlidXRlIG9uIHRoZSBwYXNzZWQgaW4gdG9kby4gPC9wPlxcbjxibG9ja3F1b3RlPlxcbllvdSBtaWdodCBiZSB0ZW1wdGVkIHRvIHB1dCB0aGlzIGZ1bmN0aW9uYWxpdHkgaW50byB0aGUgbW9kZWwsIGJ1dCBpbiBtaXNvLCB3ZSBuZWVkIHRvIHN0cmljdGx5IGtlZXAgZGF0YSBpbiB0aGUgZGF0YSBtb2RlbCwgYXMgd2UgYXJlIGFibGUgdG8gcGVyc2lzdCBpdC5cXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHA+TmV4dCB1cGRhdGUgdGhlIHZpZXcgdG86PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICBTVFlMRSgmcXVvdDsuZG9uZXt0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDt9JnF1b3Q7KSxcXG4gICAgICAgICAgICBVTChbXFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTEkoeyBjbGFzczogdG9kby5kb25lKCk/ICZxdW90O2RvbmUmcXVvdDs6ICZxdW90OyZxdW90Oywgb25jbGljazogY3RybC52bS5kb25lKHRvZG8pIH0sIHRvZG8udGV4dCk7XFxuICAgICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgXSlcXG4gICAgICAgIF1cXG4gICAgfTtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBtYWtlIHRoZSBsaXN0IG9mIHRvZG9zIGNsaWNrYWJsZSwgYW5kIHB1dCBhIHN0cmlrZS10aHJvdWdoIHRoZSB0b2RvIHdoZW4gaXQgaXMgc2V0IHRvICZxdW90O2RvbmUmcXVvdDssIG5lYXQhPC9wPlxcbjxwPk5vdyBsZXQgdXMgYWRkIGEgY291bnRlciwgdG8gc2hvdyBob3cgbWFueSB0b2RvcyBhcmUgbGVmdCwgcHV0IHRoaXMgaW50byB0aGUgdmlldyBtb2RlbCB5b3UgY3JlYXRlZCBpbiB0aGUgcHJldmlvdXMgc3RlcDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5sZWZ0OiBmdW5jdGlvbigpe1xcbiAgICB2YXIgY291bnQgPSAwO1xcbiAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgIGNvdW50ICs9IHRvZG8uZG9uZSgpID8gMCA6IDE7XFxuICAgIH0pO1xcbiAgICByZXR1cm4gY291bnQ7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5BbmQgaW4gdGhlIHZpZXcsIGFkZCB0aGUgZm9sbG93aW5nIGFib3ZlIHRoZSBVTDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5IMSgmcXVvdDtUb2RvcyAtICZxdW90OyArIGN0cmwudm0ubGVmdCgpICsgJnF1b3Q7IG9mICZxdW90OyArIGN0cmwubGlzdC5sZW5ndGggKyAmcXVvdDsgcmVtYWluaW5nJnF1b3Q7KSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIG5vdyBkaXNwbGF5IGEgbmljZSBoZWFkZXIgc2hvd2luZyBob3cgbWFueSB0b2RvcyBhcmUgbGVmdC48L3A+XFxuPHA+TmV4dCBsZXQgdXMgYWRkIGFuIGlucHV0IGZpZWxkLCBzbyB5b3UgY2FuIGFkZCBuZXcgdG9kb3MsIGluIHRoZSB2aWV3IG1vZGVsLCAodGhlIDxjb2RlPmN0cmwudm08L2NvZGU+IG9iamVjdCksIGFkZCB0aGUgZm9sbG93aW5nIGxpbmU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+aW5wdXQ6IG0ucCgmcXVvdDsmcXVvdDspXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkluIHRoZSBjb250cm9sbGVyLCBhZGQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XFxuICAgIHZhciB2YWx1ZSA9IGN0cmwudm0uaW5wdXQoKTtcXG4gICAgaWYodmFsdWUpIHtcXG4gICAgICAgIHZhciBuZXdUb2RvID0gbmV3IHNlbGYubW9kZWxzLnRvZG8oe1xcbiAgICAgICAgICAgIHRleHQ6IGN0cmwudm0uaW5wdXQoKSxcXG4gICAgICAgICAgICBkb25lOiBmYWxzZVxcbiAgICAgICAgfSk7XFxuICAgICAgICBjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcXG4gICAgICAgIGN0cmwudm0uaW5wdXQoJnF1b3Q7JnF1b3Q7KTtcXG4gICAgfVxcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XFxuICAgIHJldHVybiBmYWxzZTtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIGZ1bmN0aW9uIGNyZWF0ZXMgYSBuZXcgdG9kbyBiYXNlZCBvbiB0aGUgaW5wdXQgdGV4dCwgYW5kIGFkZHMgaXQgdG8gdGhlIGxpc3Qgb2YgdG9kb3MuPC9wPlxcbjxwPkFuZCBpbiB0aGUgdmlldyBqdXN0IGJlbG93IHRoZSBVTCwgYWRkOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcXG4gICAgSU5QVVQoeyB0eXBlOiAmcXVvdDt0ZXh0JnF1b3Q7LCB2YWx1ZTogY3RybC52bS5pbnB1dCwgcGxhY2Vob2xkZXI6ICZxdW90O0FkZCB0b2RvJnF1b3Q7fSksXFxuICAgIEJVVFRPTih7IHR5cGU6ICZxdW90O3N1Ym1pdCZxdW90O30sICZxdW90O0FkZCZxdW90OylcXG5dKVxcbjwvY29kZT48L3ByZT5cXG48cD5BcyB5b3UgY2FuIHNlZSwgd2UgYXNzaWduIHRoZSA8Y29kZT5hZGRUb2RvPC9jb2RlPiBtZXRob2Qgb2YgdGhlIGNvbnRyb2xsZXIgdG8gdGhlIG9uc3VibWl0IGZ1bmN0aW9uIG9mIHRoZSBmb3JtLCBzbyB0aGF0IGl0IHdpbGwgY29ycmVjdGx5IGFkZCB0aGUgdG9kbyB3aGVuIHlvdSBjbGljayB0aGUgJnF1b3Q7QWRkJnF1b3Q7IGJ1dHRvbi48L3A+XFxuPHA+TmV4dCwgbGV0IHVzIGFkZCB0aGUgYWJpbGl0eSB0byBhcmNoaXZlIG9sZCB0b2RvcywgYWRkIHRoZSBmb2xsb3dpbmcgaW50byB0aGUgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jdHJsLmFyY2hpdmUgPSBmdW5jdGlvbigpe1xcbiAgICB2YXIgbGlzdCA9IFtdO1xcbiAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgIGlmKCF0b2RvLmRvbmUoKSkge1xcbiAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTsgXFxuICAgICAgICB9XFxuICAgIH0pO1xcbiAgICBjdHJsLmxpc3QgPSBsaXN0O1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFuZCB0aGlzIGJ1dHRvbiBiZWxvdyB0aGUgSDE6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+QlVUVE9OKHsgb25jbGljazogY3RybC5hcmNoaXZlIH0sICZxdW90O0FyY2hpdmUmcXVvdDspLFxcbjwvY29kZT48L3ByZT5cXG48aDM+PGEgbmFtZT1cXFwiY29tcGxldGVkLXRvZG8tYXBwXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY29tcGxldGVkLXRvZG8tYXBwXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNvbXBsZXRlZCB0b2RvIGFwcDwvc3Bhbj48L2E+PC9oMz48cD5BbmQgeW91IGNhbiBub3cgYXJjaGl2ZSB5b3VyIHRvZG9zLiBUaGlzIGNvbXBsZXRlcyB0aGUgdG9kbyBhcHAgZnVuY3Rpb25hbGx5LCB5b3VyIGNvbXBsZXRlIHRvZG8gYXBwIHNob3VsZCBsb29rIGxpa2UgdGhpczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGJpbmRpbmdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLmJpbmRpbmdzLm5vZGUuanMmIzM5OykobSk7XFxuXFxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICB0b2RvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XFxuICAgICAgICAgICAgdGhpcy5kb25lID0gbS5wcm9wKGRhdGEuZG9uZSA9PSAmcXVvdDtmYWxzZSZxdW90Oz8gZmFsc2U6IGRhdGEuZG9uZSk7XFxuICAgICAgICAgICAgdGhpcy5faWQgPSBkYXRhLl9pZDtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICAgICAgbXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcblxcbiAgICAgICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMobXlUb2RvcykubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbiAgICAgICAgfSk7XFxuXFxuICAgICAgICBjdHJsLmFkZFRvZG8gPSBmdW5jdGlvbihlKXtcXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBjdHJsLnZtLmlucHV0KCk7XFxuICAgICAgICAgICAgaWYodmFsdWUpIHtcXG4gICAgICAgICAgICAgICAgdmFyIG5ld1RvZG8gPSBuZXcgc2VsZi5tb2RlbHMudG9kbyh7XFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjdHJsLnZtLmlucHV0KCksXFxuICAgICAgICAgICAgICAgICAgICBkb25lOiBmYWxzZVxcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0LnB1c2gobmV3VG9kbyk7XFxuICAgICAgICAgICAgICAgIGN0cmwudm0uaW5wdXQoJnF1b3Q7JnF1b3Q7KTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLmFyY2hpdmUgPSBmdW5jdGlvbigpe1xcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW107XFxuICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICAgICAgICAgIGlmKCF0b2RvLmRvbmUoKSkge1xcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHRvZG8pOyBcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgIGN0cmwubGlzdCA9IGxpc3Q7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC52bSA9IHtcXG4gICAgICAgICAgICBsZWZ0OiBmdW5jdGlvbigpe1xcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ICs9IHRvZG8uZG9uZSgpID8gMCA6IDE7XFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnQ7XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgICAgICBkb25lOiBmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xcbiAgICAgICAgICAgICAgICAgICAgdG9kby5kb25lKCF0b2RvLmRvbmUoKSk7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGlucHV0OiBtLnAoJnF1b3Q7JnF1b3Q7KVxcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIFNUWUxFKCZxdW90Oy5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO30mcXVvdDspLFxcbiAgICAgICAgICAgICAgICBIMSgmcXVvdDtUb2RvcyAtICZxdW90OyArIGN0cmwudm0ubGVmdCgpICsgJnF1b3Q7IG9mICZxdW90OyArIGN0cmwubGlzdC5sZW5ndGggKyAmcXVvdDsgcmVtYWluaW5nJnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgQlVUVE9OKHsgb25jbGljazogY3RybC5hcmNoaXZlIH0sICZxdW90O0FyY2hpdmUmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBVTChbXFxuICAgICAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gJnF1b3Q7ZG9uZSZxdW90OzogJnF1b3Q7JnF1b3Q7LCBvbmNsaWNrOiBjdHJsLnZtLmRvbmUodG9kbykgfSwgdG9kby50ZXh0KTtcXG4gICAgICAgICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgICAgIF0pLFxcbiAgICAgICAgICAgICAgICBGT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXFxuICAgICAgICAgICAgICAgICAgICBJTlBVVCh7IHR5cGU6ICZxdW90O3RleHQmcXVvdDssIHZhbHVlOiBjdHJsLnZtLmlucHV0LCBwbGFjZWhvbGRlcjogJnF1b3Q7QWRkIHRvZG8mcXVvdDt9KSxcXG4gICAgICAgICAgICAgICAgICAgIEJVVFRPTih7IHR5cGU6ICZxdW90O3N1Ym1pdCZxdW90O30sICZxdW90O0FkZCZxdW90OylcXG4gICAgICAgICAgICAgICAgXSlcXG4gICAgICAgICAgICBdXFxuICAgICAgICB9O1xcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+TmV4dCB3ZSByZWNvbW1lbmQgeW91IHJlYWQ8L3A+XFxuPHA+PGEgaHJlZj1cXFwiL2RvYy9DcmVhdGluZy1hLXRvZG8tYXBwLXBhcnQtMi1wZXJzaXN0ZW5jZS5tZFxcXCI+Q3JlYXRpbmcgYSB0b2RvIGFwcCBwYXJ0IDIgLSBwZXJzaXN0ZW5jZTwvYT4sIHdoZXJlIHdlIHdpbGwgZ28gdGhyb3VnaCBhZGRpbmcgZGF0YSBwZXJzaXN0ZW5jZSBmdW5jdGlvbmFsaXR5LjwvcD5cXG5cIixcIkRlYnVnZ2luZy5tZFwiOlwiPGgxPjxhIG5hbWU9XFxcImRlYnVnZ2luZy1hLW1pc28tYXBwXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZGVidWdnaW5nLWEtbWlzby1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RGVidWdnaW5nIGEgbWlzbyBhcHA8L3NwYW4+PC9hPjwvaDE+PHA+SW4gb3JkZXIgdG8gZGVidWcgYSBtaXNvIGFwcCwgKG9yIGFueSBpc29tb3JwaGljIEphdmFTY3JpcHQgYXBwIGZvciB0aGF0IG1hdHRlciksIHlvdSYjMzk7bGwgbmVlZCB0byBiZSBhYmxlIHRvIGRlYnVnIG9uIGJvdGggdGhlIGNsaWVudCBhbmQgdGhlIHNlcnZlci4gSGVyZSB3ZSB3aWxsIGRlbW9uc3RyYXRlIGRlYnVnZ2luZyB0aGUgY2xpZW50LXNpZGUgY29kZSB1c2luZyBDaHJvbWUsIGFuZCB0aGUgc2VydmVyIGNvZGUgdXNpbmcgSmV0QnJhaW5zIFdlYlN0b3JtIDkuIE1pc28gY2FuIGFjdHVhbGx5IGJlIGRlYnVnZ2VkIHVzaW5nIGFueSBzdGFuZGFyZCBub2RlIGFuZCBjbGllbnQtc2lkZSBkZWJ1Z2dpbmcgdG9vbHMgdGhhdCBzdXBwb3J0IHNvdXJjZSBtYXBzLjwvcD5cXG48cD5JbiB0aGlzIGV4YW1wbGUgd2UmIzM5O3JlIGdvaW5nIHRvIGRlYnVnIHRoZSBleGFtcGxlIDxjb2RlPnRvZG9zPC9jb2RlPiBhcHAsIHNvIGJlIHN1cmUgeW91IGtub3cgaG93IGl0IHdvcmtzLCBhbmQgeW91IGtub3cgaG93IHRvIGluc3RhbGwgaXQgLSBpZiB5b3UgZG9uJiMzOTt0IGtub3cgaG93LCBwbGVhc2UgcmVhZCB0aGUgPGEgaHJlZj1cXFwiL2RvYy9DcmVhdGluZy1hLXRvZG8tYXBwLm1kXFxcIj50b2RvcyBhcHAgdHV0b3JpYWw8L2E+IGZpcnN0LjwvcD5cXG48YmxvY2txdW90ZT5cXG5PbmUgdGhpbmcgdG8ga2VlcCBpbiBtaW5kIGlzIGhvdyBtaXNvIHdvcmtzOiBpdCBpcyBpc29tb3JwaGljIHdoaWNoIG1lYW5zIHRoYXQgdGhlIGNvZGUgd2UgaGF2ZSBpcyBhYmxlIHRvIHJ1biBib3RoIHNlcnZlciBhbmQgY2xpZW50IHNpZGUuIE9mIGNvdXJzZSBpdCBkb2VzbiYjMzk7dCBhbHdheXMgcnVuIG9uIGJvdGggc2lkZXMsIHNvIGhlcmUgaXMgYSBoYW5keSBsaXR0bGUgdGFibGUgdG8gZXhwbGFpbiB3aGF0IHR5cGljYWxseSBydW5zIHdoZXJlIGFuZCB3aGVuLCBmb3IgdGhlIHRvZG9zIGV4YW1wbGU6XFxuPC9ibG9ja3F1b3RlPlxcblxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5GaWxlPC90aD5cXG48dGg+YWN0aW9uPC90aD5cXG48dGg+U2VydmVyPC90aD5cXG48dGg+Q2xpZW50PC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+L212Yy90b2RvLmpzPC90ZD5cXG48dGQ+aW5kZXg8L3RkPlxcbjx0ZD5SdW5zIHdoZW4gYSBicm93c2VyIGxvYWRzIHVwIDxjb2RlPi90b2RvczwvY29kZT48L3RkPlxcbjx0ZD5SdW5zIHdoZW4geW91IGludGVyYWN0IHdpdGggYW55dGhpbmc8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiLmFwaS5qczwvdGQ+XFxuPHRkPmZpbmQ8L3RkPlxcbjx0ZD5SdW5zIHdoZW4gaW5kZXggaXMgcnVuIGVpdGhlciBzZXJ2ZXIgKGRpcmVjdGx5KSBvciBjbGllbnQgc2lkZSAodGhyb3VnaCB0aGUgYXBpKTwvdGQ+XFxuPHRkPk5ldmVyIHJ1bnMgb24gdGhlIGNsaWVudCAtIGFuIGFqYXggcmVxdWVzdCBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBieSBtaXNvPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5UaG9zZSBhcmUgdGhlIG9ubHkgZmlsZXMgdGhhdCBhcmUgdXNlZCBpbiB0aGUgdG9kb3MgZXhhbXBsZS48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImNsaWVudC1zaWRlLW1pc28tZGVidWdnaW5nXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY2xpZW50LXNpZGUtbWlzby1kZWJ1Z2dpbmdcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q2xpZW50LXNpZGUgbWlzbyBkZWJ1Z2dpbmc8L3NwYW4+PC9hPjwvaDI+PHA+Rmlyc3RseSBsZXQgdXMgbWFrZSBzdXJlIHRoYXQgd2UmIzM5O3ZlIGNvbmZpZ3VyZWQgQ2hyb21lIGNvcnJlY3RseTo8L3A+XFxuPHVsPlxcbjxsaT5PcGVuIHRoZSBkZXYgdG9vbHMgKENNRCArIEFMVCArIEogb24gTWFjLCBGMTIgb24gUEMpPC9saT5cXG48bGk+Q2xpY2sgdGhlIHNldHRpbmcgY29nIDwvbGk+XFxuPC91bD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfY29nLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgY29nXFxcIj48L3A+XFxuPHVsPlxcbjxsaT5TY3JvbGwgZG93biB0byB0aGUgJnF1b3Q7U291cmNlcyZxdW90OyBzZWN0aW9uPC9saT5cXG48bGk+TWFrZSBzdXJlIHRoYXQgJnF1b3Q7RW5hYmxlIEphdmFTY3JpcHQgc291cmNlIG1hcHMmcXVvdDsgaXMgdGlja2VkIGFuZCBjbG9zZSB0aGUgc2V0dGluZ3MuPC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL2Nocm9tZV9zZXR0aW5ncy5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPk5vdyBDaHJvbWUgaXMgcmVhZHkgdG8gaW50ZXJhY3Qgd2l0aCBtaXNvLiBOZXh0IHJ1biB0aGUgbWlzbyB0b2RvIGFwcCBpbiBkZXZlbG9wbWVudCBtb2RlIC0gaS5lLiBpbiB0aGUgZGlyZWN0b3J5IHlvdSBzZXR1cCBtaXNvLCBydW4gdGhlIGZvbGxvd2luZzo8L3A+XFxuPHByZT48Y29kZT5taXNvIHJ1blxcbjwvY29kZT48L3ByZT48cD5XaGVuIHlvdSYjMzk7cmUgdXAgYW5kIHJ1bm5pbmcsIGdvIHRvIHRoZSB0b2RvcyBVUkwsIGlmIGV2ZXJ5dGhpbmcgaXMgc2V0dXAgd2l0aCBkZWZhdWx0cywgaXQgd2lsbCBiZTo8L3A+XFxuPHA+PGEgaHJlZj1cXFwiL2RvYy90b2Rvcy5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdDo2NDc2L3RvZG9zPC9hPjwvcD5cXG48cD5OZXh0IG9wZW4gdGhlIGRldiB0b29scyBpbiBDaHJvbWUgYW5kOjwvcD5cXG48dWw+XFxuPGxpPkNsaWNrIHRoZSAmcXVvdDtTb3VyY2VzJnF1b3Q7IHRhYjwvbGk+XFxuPGxpPk9wZW4gdGhlICZxdW90O212YyZxdW90OyBmb2xkZXI8L2xpPlxcbjxsaT5DbGljayBvbiB0aGUgJnF1b3Q7dG9kby5qcyZxdW90OyBmaWxlPC9saT5cXG48L3VsPlxcbjxwPllvdSBzaG91bGQgbm93IHNlZSBhIHRvZG8uanMgZmlsZSBpbiB0aGUgcmlnaHQtaGFuZCBwYW5lPC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL2Nocm9tZV9zb3VyY2VfdG9kb3MuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48dWw+XFxuPGxpPlNjcm9sbCBkb3duIHRvIHRoZSBsYXN0IGxpbmUgaW5zaWRlIHRoZSA8Y29kZT5hZGRUb2RvPC9jb2RlPiBtZXRob2Q8L2xpPlxcbjxsaT5DbGljayBvbiB0aGUgbGluZS1udW1iZXIgbmV4dCB0byB0aGUgcmV0dXJuIHN0YXRlbWVudCB0byBzZXQgYSBicmVha3BvaW50PC9saT5cXG48L3VsPlxcbjxwPllvdSBzaG91bGQgbm93IHNlZSBhIG1hcmsgbmV4dCB0byB0aGUgbGluZSwgYW5kIGEgYnJlYWtwb2ludCBpbiB0aGUgbGlzdCBvZiBicmVha3BvaW50cy48L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX2JyZWFrcG9pbnQuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5Ob3cgd2Ugd2FudCB0byB0cnkgYW5kIHRyaWdnZXIgdGhhdCBicmVha3BvaW50OjwvcD5cXG48dWw+XFxuPGxpPkVudGVyIGEgdmFsdWUgaW4gdGhlICZxdW90O0FkZCB0b2RvJnF1b3Q7IGJveDwvbGk+XFxuPGxpPkNsaWNrIHRoZSAmcXVvdDtBZGQmcXVvdDsgYnV0dG9uPC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL21pc29fdG9kb3NfYWRkLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+WW91IHNob3VsZCBub3cgc2VlIHRoZSBicmVha3BvaW50IGluIGFjdGlvbiwgY29tcGxldGUgd2l0aCB5b3VyIHZhbHVlIGluIHRoZSBsb2NhbCBzY29wZS48L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX2JyZWFrcG9pbnRfYWN0aXZlLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+QW5kIHRoYXQmIzM5O3MgaXQgZm9yIGNsaWVudC1zaWRlIGRlYnVnZ2luZyAtIHlvdSBjYW4gbm93IHVzZSB0aGUgQ2hyb21lIGRlYnVnZ2VyIHRvIGluc3BlY3QgYW5kIG1hbmlwdWxhdGUgdmFsdWVzLCBldGMuLi48L3A+XFxuPGgyPjxhIG5hbWU9XFxcInNlcnZlci1zaWRlLW1pc28tZGVidWdnaW5nXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjc2VydmVyLXNpZGUtbWlzby1kZWJ1Z2dpbmdcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+U2VydmVyLXNpZGUgbWlzbyBkZWJ1Z2dpbmc8L3NwYW4+PC9hPjwvaDI+PGJsb2NrcXVvdGU+XFxuTm90ZTogUGxlYXNlIGNsZWFyIGFueSBicmVha3BvaW50IHlvdSBtaWdodCBoYXZlIHNldCBpbiBDaHJvbWUsIHNvIGl0IHdvbiYjMzk7dCBpbnRlcmZlcmUgd2l0aCBvdXIgc2VydmVyLXNpZGUgZGVidWdnaW5nIHNlc3Npb24gLSBvZiBjb3Vyc2UgeW91IGNhbiB1c2UgYm90aCB0b2dldGhlciwgYnV0IGZvciBub3cgbGV0IHVzIGNsZWFyIHRoZW0sIGFuZCBhbHNvIHN0b3AgdGhlIG1pc28gc2VydmVyLCBpZiBpdCBpcyBzdGlsbCBydW5uaW5nLCBhcyB3ZSB3aWxsIGdldCBXZWJTdG9ybSB0byBoYW5kbGUgaXQgZm9yIHVzLlxcbjwvYmxvY2txdW90ZT5cXG5cXG48cD5JbiB0aGlzIGV4YW1wbGUgd2UmIzM5O3JlIGdvaW5nIHRvIHVzZSA8YSBocmVmPVxcXCIvZG9jLy5tZFxcXCI+V2ViU3Rvcm08L2E+IC0geW91IGNhbiB1c2UgYW55IElERSB0aGF0IHN1cHBvcnRzIG5vZGUgZGVidWdnaW5nLCBvciBmcmVlIHRvb2xzIHN1Y2ggYXMgPGEgaHJlZj1cXFwiL2RvYy9ub2RlLWluc3BlY3Rvci5tZFxcXCI+bm9kZS1pbnNwZWN0b3I8L2E+LCBzbyB0aGlzIGlzIHNpbXBseSBmb3IgaWxsdXN0cmF0aXZlIHB1cnBvc2VzLjwvcD5cXG48cD5GaXJzdCB3ZSBuZWVkIHRvIHNldHVwIG91ciBwcm9qZWN0LCBzbyBpbiBXZWJzdG9ybTo8L3A+XFxuPHVsPlxcbjxsaT5DcmVhdGUgYSBuZXcgcHJvamVjdCwgc2V0dGluZyB5b3VyIG1pc28gZGlyZWN0b3J5IGFzIHRoZSByb290LjwvbGk+XFxuPGxpPkFkZCBhIG5ldyBub2RlIHByb2plY3QgY29uZmlndXJhdGlvbiwgd2l0aCB0aGUgZm9sbG93aW5nIHNldHRpbmdzOjwvbGk+XFxuPC91bD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy93ZWJzdG9ybV9jb25maWd1cmVfcHJvamVjdC5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjx1bD5cXG48bGk+Tm93IGhpdCB0aGUgZGVidWcgYnV0dG9uPC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2RlYnVnX2J1dHRvbi5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPllvdSBzaG91bGQgc2VlIG1pc28gcnVubmluZyBpbiB0aGUgV2ViU3Rvcm0gY29uc29sZSBsaWtlIHNvOjwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy93ZWJzdG9ybV9jb25zb2xlLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHVsPlxcbjxsaT5Ob3cgb3BlbiA8Y29kZT4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2ZsYXRmaWxlZGIuYXBpLmpzPC9jb2RlPiwgYW5kIHB1dCBhIGJyZWFrcG9pbnQgb24gdGhlIGxhc3QgbGluZSBvZiB0aGUgPGNvZGU+ZmluZDwvY29kZT4gbWV0aG9kLjwvbGk+XFxuPC91bD5cXG48cD5Ob3cgaWYgeW91IGdvIGJhY2sgdG8geW91ciBicm93c2VyIHRvZG9zIGFwcDo8L3A+XFxuPHA+PGEgaHJlZj1cXFwiL2RvYy90b2Rvcy5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdDo2NDc2L3RvZG9zPC9hPjwvcD5cXG48cD5SZWxvYWQgdGhlIHBhZ2UsIGFuZCB5b3Ugd2lsbCBzZWUgdGhlIGJyZWFrcG9pbnQgYmVpbmcgYWN0aXZhdGVkIGluIFdlYlN0b3JtOjwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy93ZWJzdG9ybV9icmVha3BvaW50X2FjdGl2ZS5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPk5vdyBjbGljayB0aGUgJnF1b3Q7cmVzdW1lIHByb2dyYW0gYnV0dG9uJnF1b3Q7LCBhbmQgeW91JiMzOTtsbCBzZWUgdGhhdCB0aGUgYnJlYWtwb2ludCBpdCBpcyBpbW1lZGlhdGVseSBpbnZva2VkIGFnYWluISA8L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvd2Vic3Rvcm1fYnJlYWtwb2ludF9kYXRhLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+VGhpcyBpcyBzaW1wbHkgYmVjYXVzZSBtaXNvIHJlbmRlcnMgdGhlIGZpcnN0IHBhZ2Ugb24gdGhlIHNlcnZlciAtIHNvIGRlcGVuZGluZyBvbiBob3cgeW91IHN0cnVjdHVyZSB5b3VyIHF1ZXJpZXMsIGl0IHdpbGwgdXNlIHRoZSBBUEkgdHdpY2UgLSBvbmNlIGZyb20gdGhlIHNlcnZlciBzaWRlIHJlbmRlcmluZywgYW5kIG9uY2UgZnJvbSB0aGUgY2xpZW50LXNpZGUuIERvbiYjMzk7dCB3b3JyeSAtIHRoaXMgb25seSBoYXBwZW5zIG9uIGluaXRpYWwgcGFnZSBsb2FkIGluIG9yZGVyIHRvIHJlbmRlciB0aGUgZmlyc3QgcGFnZSBib3RoIHNlcnZlciBzaWRlIGFuZCBjbGllbnQgc2lkZSwgeW91IGNhbiByZWFkIG1vcmUgYWJvdXQgaG93IHRoYXQgd29ya3MgaGVyZTo8L3A+XFxuPHA+PGEgaHJlZj1cXFwiL2RvYy9Ib3ctbWlzby13b3JrcyNmaXJzdC1wYWdlLWxvYWQubWRcXFwiPkhvdyBtaXNvIHdvcmtzOiBGaXJzdCBwYWdlIGxvYWQ8L2E+PC9wPlxcbjxwPlNvLCB5b3UgYXJlIG5vdyBhYmxlIHRvIGluc3BlY3QgdGhlIHZhbHVlcywgYW5kIGRvIGFueSBraW5kIG9mIHNlcnZlciBzaWRlIGRlYnVnZ2luZyB5b3UgbGlrZS48L3A+XFxuXCIsXCJHZXR0aW5nLXN0YXJ0ZWQubWRcIjpcIjxwPlRoaXMgZ3VpZGUgd2lsbCB0YWtlIHlvdSB0aHJvdWdoIG1ha2luZyB5b3VyIGZpcnN0IG1pc28gYXBwLCBpdCBpcyBhc3N1bWVkIHRoYXQgeW91IGtub3cgdGhlIGJhc2ljcyBvZiBob3cgdG8gdXNlIG5vZGVqcyBhbmQgbWl0aHJpbC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImluc3RhbGxhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2luc3RhbGxhdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5JbnN0YWxsYXRpb248L3NwYW4+PC9hPjwvaDI+PHA+VG8gaW5zdGFsbCBtaXNvLCB1c2UgbnBtOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm5wbSBpbnN0YWxsIG1pc29qcyAtZ1xcbjwvY29kZT48L3ByZT5cXG48cD5UbyBjcmVhdGUgYW5kIHJ1biBhIG1pc28gYXBwIGluIGEgbmV3IGRpcmVjdG9yeTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5taXNvIC1uIG15YXBwXFxuY2QgbXlhcHBcXG5taXNvIHJ1blxcbjwvY29kZT48L3ByZT5cXG48cD5Zb3Ugc2hvdWxkIG5vdyBzZWUgc29tZXRoaW5nIGxpa2U6PC9wPlxcbjxwcmU+PGNvZGU+TWlzbyBpcyBsaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDo2NDc2IGluIGRldmVsb3BtZW50IG1vZGVcXG48L2NvZGU+PC9wcmU+PHA+T3BlbiB5b3VyIGJyb3dzZXIgYXQgPGNvZGU+aHR0cDovL2xvY2FsaG9zdDo2NDc2PC9jb2RlPiBhbmQgeW91IHdpbGwgc2VlIHRoZSBkZWZhdWx0IG1pc28gc2NyZWVuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJoZWxsby13b3JsZC1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNoZWxsby13b3JsZC1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SGVsbG8gd29ybGQgYXBwPC9zcGFuPjwvYT48L2gyPjxwPkNyZWF0ZSBhIG5ldyBmaWxlIDxjb2RlPmhlbGxvLmpzPC9jb2RlPiBpbiA8Y29kZT5teWFwcC9tdmM8L2NvZGU+IGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSk7XFxuXFxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTtoZWxsb19pZCYjMzk7LCBwYXJhbXMpO1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSk7XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIG9wZW4gPGEgaHJlZj1cXFwiL2RvYy9ZT1VSTkFNRS5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdDo2NDc2L2hlbGxvL1lPVVJOQU1FPC9hPiBhbmQgeW91IHNob3VsZCBzZWUgJnF1b3Q7SGVsbG8gWU9VUk5BTUUmcXVvdDsuIENoYW5nZSB0aGUgdXJsIHRvIGhhdmUgeW91ciBhY3R1YWwgbmFtZSBpbnN0ZWFkIG9mIFlPVVJOQU1FLCB5b3Ugbm93IGtub3cgbWlzbyA6KTwvcD5cXG48cD5MZXQgdXMgdGFrZSBhIGxvb2sgYXQgd2hhdCBlYWNoIHBpZWNlIG9mIHRoZSBjb2RlIGlzIGFjdHVhbGx5IGRvaW5nOjwvcD5cXG48aDM+PGEgbmFtZT1cXFwiaW5jbHVkZXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNpbmNsdWRlc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5JbmNsdWRlczwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBNaXRocmlsIGlzIHRoZSBvbmx5IHJlcXVpcmVkIGxpYnJhcnkgd2hlbiBhcHBzLCBidXQgdXNpbmcgb3RoZXIgaW5jbHVkZWQgbGlicmFyaWVzIGlzIHZlcnkgdXNlZnVsXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkhlcmUgd2UgZ3JhYiBtaXRocmlsLCB0aGVuIG1pc28gdXRpbGl0aWVzIGFuZCBzdWdhciB0YWdzIC0gdGVjaG5pY2FsbHkgc3BlYWtpbmcsIHdlIHJlYWxseSBvbmx5IG5lZWQgbWl0aHJpbCwgYnV0IHRoZSBvdGhlciBsaWJyYXJpZXMgYXJlIHZlcnkgdXNlZnVsIGFzIHdlbGwgYXMgd2Ugd2lsbCBzZWUuPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJtb2RlbHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtb2RlbHNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TW9kZWxzPC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IFVzZSB0aGUgYXV0b21hdGljIHJvdXRpbmcgd2hlbiB5b3UgY2FuLCBhbHdheXMgcHV0IG1vZGVscyBvbiB0aGUgJiMzOTttb2RlbHMmIzM5OyBhdHRyaWJ1dGUgb2YgeW91ciBtdmMgZmlsZVxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbjwvY29kZT48L3ByZT5cXG48cD5IZXJlIGEgZmV3IGltcG9ydGFudCB0aGluZ3MgYXJlIGdvaW5nIG9uOjwvcD5cXG48dWw+XFxuPGxpPjxwPkJ5IHBsYWNpbmcgb3VyIDxjb2RlPm12YzwvY29kZT4gb2JqZWN0IG9uIDxjb2RlPm1vZHVsZS5leHBvcnRzLmVkaXQ8L2NvZGU+LCBhdXRvbWF0aWMgcm91dGluZyBpcyBhcHBsaWVkIGJ5IG1pc28gLSB5b3UgY2FuIHJlYWQgbW9yZSBhYm91dCA8YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzI3JvdXRlLWJ5LWNvbnZlbnRpb24ubWRcXFwiPmhvdyB0aGUgYXV0b21hdGljIHJvdXRpbmcgd29ya3MgaGVyZTwvYT4uIDwvcD5cXG48L2xpPlxcbjxsaT48cD5QbGFjaW5nIG91ciA8Y29kZT5oZWxsbzwvY29kZT4gbW9kZWwgb24gdGhlIDxjb2RlPm1vZGVsczwvY29kZT4gYXR0cmlidXRlIG9mIHRoZSBvYmplY3QgZW5zdXJlcyB0aGF0IG1pc28gY2FuIGZpZ3VyZSBvdXQgd2hhdCB5b3VyIG1vZGVscyBhcmUsIGFuZCB3aWxsIGNyZWF0ZSBhIHBlcnNpc3RlbmNlIEFQSSBhdXRvbWF0aWNhbGx5IGZvciB5b3Ugd2hlbiB0aGUgc2VydmVyIHN0YXJ0cyB1cCwgc28gdGhhdCB5b3UgY2FuIHNhdmUgeW91ciBtb2RlbHMgaW50byB0aGUgZGF0YWJhc2UuPC9wPlxcbjwvbGk+XFxuPC91bD5cXG48aDM+PGEgbmFtZT1cXFwiY29udHJvbGxlclxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NvbnRyb2xsZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q29udHJvbGxlcjwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBETyBOT1QgZm9yZ2V0IHRvICYjMzk7cmV0dXJuIHRoaXM7JiMzOTsgaW4gdGhlIGNvbnRyb2xsZXIsIGl0IGlzIHZpdGFsIVxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICB2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuICAgIHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XFxuICAgIHJldHVybiB0aGlzO1xcbn0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZSBjb250cm9sbGVyIHVzZXMgPGNvZGU+bWlzby5nZXRQYXJhbTwvY29kZT4gdG8gcmV0cmVpdmUgdGhlIHBhcmFtZXRlciAtIHRoaXMgaXMgc28gdGhhdCBpdCBjYW4gd29yayBzZWFtbGVzc2x5IG9uIGJvdGggdGhlIHNlcnZlciBhbmQgY2xpZW50IHNpZGUuIFdlIGNyZWF0ZSBhIG5ldyBtb2RlbCwgYW5kIHZlcnkgaW1wb3J0YW50bHkgPGNvZGU+cmV0dXJuIHRoaXM8L2NvZGU+IGVuc3VyZXMgdGhhdCBtaXNvIGNhbiBnZXQgYWNjZXNzIHRvIHRoZSBjb250cm9sbGVyIGNvcnJlY3RseS48L3A+XFxuPGgzPjxhIG5hbWU9XFxcInZpZXdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN2aWV3XFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlZpZXc8L3NwYW4+PC9hPjwvaDM+PGJsb2NrcXVvdGU+XFxuU3VtbWFyeTogVXNlIHN1Z2FydGFncyB0byBtYWtlIHRoZSB2aWV3IGxvb2sgbW9yZSBsaWtlIEhUTUxcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICByZXR1cm4gRElWKCZxdW90O0hlbGxvICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpO1xcbiAgICB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGUgdmlldyBpcyBzaW1wbHkgYSBqYXZhc2NyaXB0IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN0cnVjdHVyZS4gSGVyZSB3ZSB1c2UgdGhlIDxjb2RlPnN1Z2FydGFnczwvY29kZT4gbGlicmFyeSB0byByZW5kZXIgdGhlIERJViB0YWcgLSB0aGlzIGlzIHN0cmljdGx5IG5vdCByZXF1aXJlZCwgYnV0IEkgZmluZCB0aGF0IHBlb3BsZSB0ZW5kIHRvIHVuZGVyc3RhbmQgdGhlIHN1Z2FydGFncyBzeW50YXggYmV0dGVyIHRoYW4gcHVyZSBtaXRocmlsLCBhcyBpdCBsb29rcyBhIGxpdHRsZSBtb3JlIGxpa2UgSFRNTCwgdGhvdWdoIG9mIGNvdXJzZSB5b3UgY291bGQgdXNlIHN0YW5kYXJkIG1pdGhyaWwgc3ludGF4IGlmIHlvdSBwcmVmZXIuPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJuZXh0XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbmV4dFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5OZXh0PC9zcGFuPjwvYT48L2gzPjxwPllvdSBub3cgaGF2ZSBhIGNvbXBsZXRlIGhlbGxvIHdvcmxkIGFwcCwgYW5kIHVuZGVyc3RhbmQgdGhlIGZ1bmRhbWVudGFscyBvZiB0aGUgc3RydWN0dXJlIG9mIGEgbWlzbyBtdmMgYXBwbGljYXRpb24uPC9wPlxcbjxwPldlIGhhdmUgb25seSBqdXN0IHNjcmFwZWQgdGhlIHN1cmZhY2Ugb2Ygd2hhdCBtaXNvIGlzIGNhcGFibGUgb2YsIHNvIG5leHQgd2UgcmVjb21tZW5kIHlvdSByZWFkOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAubWRcXFwiPkNyZWF0aW5nIGEgdG9kbyBhcHA8L2E+PC9wPlxcblwiLFwiR29hbHMubWRcIjpcIjxoMT48YSBuYW1lPVxcXCJwcmltYXJ5LWdvYWxzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcHJpbWFyeS1nb2Fsc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5QcmltYXJ5IGdvYWxzPC9zcGFuPjwvYT48L2gxPjx1bD5cXG48bGk+RWFzeSBzZXR1cCBvZiA8YSBocmVmPVxcXCIvZG9jLy5tZFxcXCI+aXNvbW9ycGhpYzwvYT4gYXBwbGljYXRpb24gYmFzZWQgb24gPGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLmpzLm1kXFxcIj5taXRocmlsPC9hPjwvbGk+XFxuPGxpPlNrZWxldG9uIC8gc2NhZmZvbGQgLyBCb2lsZXJwbGF0ZSB0byBhbGxvdyB1c2VycyB0byB2ZXJ5IHF1aWNrbHkgZ2V0IHVwIGFuZCBydW5uaW5nLjwvbGk+XFxuPGxpPm1pbmltYWwgY29yZTwvbGk+XFxuPGxpPmVhc3kgZXh0ZW5kaWJsZTwvbGk+XFxuPGxpPkRCIGFnbm9zdGljIChlLiBHLiBwbHVnaW5zIGZvciBkaWZmZXJlbnQgT1JNL09ETSk8L2xpPlxcbjwvdWw+XFxuPGgxPjxhIG5hbWU9XFxcImNvbXBvbmVudHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjb21wb25lbnRzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNvbXBvbmVudHM8L3NwYW4+PC9hPjwvaDE+PHVsPlxcbjxsaT5Sb3V0aW5nPC9saT5cXG48bGk+VmlldyByZW5kZXJpbmc8L2xpPlxcbjxsaT5pMThuL2wxMG48L2xpPlxcbjxsaT5SZXN0LUFQSSAoY291bGQgdXNlIHJlc3RpZnk6IDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5odHRwOi8vbWNhdmFnZS5tZS9ub2RlLXJlc3RpZnkvPC9hPik8L2xpPlxcbjxsaT5vcHRpb25hbCBXZWJzb2NrZXRzIChjb3VsZCB1c2UgcmVzdGlmeTogPGEgaHJlZj1cXFwiL2RvYy8ubWRcXFwiPmh0dHA6Ly9tY2F2YWdlLm1lL25vZGUtcmVzdGlmeS88L2E+KTwvbGk+XFxuPGxpPmVhc3kgdGVzdGluZyAoaGVhZGxlc3MgYW5kIEJyb3dzZXItVGVzdHMpPC9saT5cXG48bGk+bG9naW4vc2Vzc2lvbiBoYW5kbGluZzwvbGk+XFxuPGxpPm1vZGVscyB3aXRoIHZhbGlkYXRpb248L2xpPlxcbjwvdWw+XFxuPGgxPjxhIG5hbWU9XFxcInVzZWZ1bC1saWJzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjdXNlZnVsLWxpYnNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+VXNlZnVsIGxpYnM8L3NwYW4+PC9hPjwvaDE+PHA+SGVyZSBhcmUgc29tZSBsaWJyYXJpZXMgd2UgYXJlIGNvbnNpZGVyaW5nIHVzaW5nLCAoaW4gbm8gcGFydGljdWxhciBvcmRlcik6PC9wPlxcbjx1bD5cXG48bGk+bGV2ZWxkYjwvbGk+XFxuPGxpPm1pdGhyaWwtcXVlcnk8L2xpPlxcbjxsaT50cmFuc2xhdGUuanM8L2xpPlxcbjxsaT5pMThuZXh0PC9saT5cXG48L3VsPlxcbjxwPkFuZCBzb21lIHRoYXQgd2UmIzM5O3JlIGFscmVhZHkgdXNpbmc6PC9wPlxcbjx1bD5cXG48bGk+ZXhwcmVzczwvbGk+XFxuPGxpPmJyb3dzZXJpZnk8L2xpPlxcbjxsaT5tb2NoYS9leHBlY3Q8L2xpPlxcbjxsaT5taXRocmlsLW5vZGUtcmVuZGVyPC9saT5cXG48bGk+bWl0aHJpbC1zdWdhcnRhZ3M8L2xpPlxcbjxsaT5taXRocmlsLWJpbmRpbmdzPC9saT5cXG48bGk+bWl0aHJpbC1hbmltYXRlPC9saT5cXG48bGk+bG9kYXNoPC9saT5cXG48bGk+dmFsaWRhdG9yPC9saT5cXG48L3VsPlxcblwiLFwiSG9tZS5tZFwiOlwiPHA+V2VsY29tZSB0byB0aGUgbWlzb2pzIHdpa2khPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJnZXR0aW5nLXN0YXJ0ZWRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNnZXR0aW5nLXN0YXJ0ZWRcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+R2V0dGluZyBzdGFydGVkPC9zcGFuPjwvYT48L2gyPjxwPlJlYWQgdGhlIDxhIGhyZWY9XFxcIi9kb2MvR2V0dGluZy1zdGFydGVkLm1kXFxcIj5HZXR0aW5nIHN0YXJ0ZWQ8L2E+IGd1aWRlITwvcD5cXG48aDI+PGEgbmFtZT1cXFwibW9yZS1pbmZvXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbW9yZS1pbmZvXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk1vcmUgaW5mbzwvc3Bhbj48L2E+PC9oMj48cD5TZWUgdGhlIDxhIGhyZWY9XFxcIi9kb2MvbWlzb2pzI2luc3RhbGwubWRcXFwiPmluc3RhbGwgZ3VpZGU8L2E+LlxcblJlYWQgPGEgaHJlZj1cXFwiL2RvYy9Ib3ctbWlzby13b3Jrcy5tZFxcXCI+aG93IG1pc28gd29ya3M8L2E+LCBhbmQgY2hlY2sgb3V0IDxhIGhyZWY9XFxcIi9kb2MvUGF0dGVybnMubWRcXFwiPnRoZSBwYXR0ZXJuczwvYT4sIHRoZW4gY3JlYXRlIHNvbWV0aGluZyBjb29sITwvcD5cXG5cIixcIkhvdy1taXNvLXdvcmtzLm1kXCI6XCI8aDI+PGEgbmFtZT1cXFwibW9kZWxzLXZpZXdzLWNvbnRyb2xsZXJzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbW9kZWxzLXZpZXdzLWNvbnRyb2xsZXJzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk1vZGVscywgdmlld3MsIGNvbnRyb2xsZXJzPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gY3JlYXRpbmcgYSByb3V0ZSwgeW91IG11c3QgYXNzaWduIGEgY29udHJvbGxlciBhbmQgYSB2aWV3IHRvIGl0IC0gdGhpcyBpcyBhY2hpZXZlZCBieSBjcmVhdGluZyBhIGZpbGUgaW4gdGhlIDxjb2RlPi9tdmM8L2NvZGU+IGRpcmVjdG9yeSAtIGJ5IGNvbnZlbnRpb24sIHlvdSBzaG91bGQgbmFtZSBpdCBhcyBwZXIgdGhlIHBhdGggeW91IHdhbnQsIChzZWUgdGhlIDxhIGhyZWY9XFxcIi9kb2MvI3JvdXRpbmcubWRcXFwiPnJvdXRpbmcgc2VjdGlvbjwvYT4gZm9yIGRldGFpbHMpLjwvcD5cXG48cD5IZXJlIGlzIGEgbWluaW1hbCBleGFtcGxlIHVzaW5nIHRoZSBzdWdhcnRhZ3MsIGFuZCBnZXR0aW5nIGEgcGFyYW1ldGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLnN1Z2FydGFncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbm1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHRoaXMud2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O3dobyYjMzk7LCBwYXJhbXMsICYjMzk7d29ybGQmIzM5Oyk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJiMzOTtIZWxsbyAmIzM5OyArIGN0cmwud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNhdmUgdGhpcyBpbnRvIGEgZmlsZSA8Y29kZT4vbXZjL2hlbGxvLmpzPC9jb2RlPiwgYW5kIG9wZW4gPGEgaHJlZj1cXFwiL2RvYy9oZWxsb3MubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3QvaGVsbG9zPC9hPiwgdGhpcyB3aWxsIHNob3cgJnF1b3Q7SGVsbG8gd29ybGQmcXVvdDsuIE5vdGUgdGhlICYjMzk7cyYjMzk7IG9uIHRoZSBlbmQgLSB0aGlzIGlzIGR1ZSB0byBob3cgdGhlIDxhIGhyZWY9XFxcIi9kb2MvI3JvdXRlLWJ5LWNvbnZlbnRpb24ubWRcXFwiPnJvdXRlIGJ5IGNvbnZlbnRpb248L2E+IHdvcmtzLjwvcD5cXG48cD5Ob3cgb3BlbiA8Y29kZT4vY2ZnL3JvdXRlcy5qc29uPC9jb2RlPiwgYW5kIGFkZCB0aGUgZm9sbG93aW5nIHJvdXRlczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4gICAgJnF1b3Q7L2hlbGxvJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtoZWxsbyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9LFxcbiAgICAmcXVvdDsvaGVsbG8vOndobyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7aGVsbG8mcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfVxcbjwvY29kZT48L3ByZT5cXG48cD5TYXZlIHRoZSBmaWxlLCBhbmQgZ28gYmFjayB0byB0aGUgYnJvd3NlciwgYW5kIHlvdSYjMzk7bGwgc2VlIGFuIGVycm9yISBUaGlzIGlzIGJlY2F1c2Ugd2UgaGF2ZSBub3cgb3ZlcnJpZGRlbiB0aGUgYXV0b21hdGljIHJvdXRlLiBPcGVuIDxhIGhyZWY9XFxcIi9kb2MvaGVsbG8ubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3QvaGVsbG88L2E+LCBhbmQgeW91JiMzOTtsbCBzZWUgb3VyIGFjdGlvbi4gTm93IG9wZW4gPGEgaHJlZj1cXFwiL2RvYy9ZT1VSTkFNRS5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdC9oZWxsby9ZT1VSTkFNRTwvYT4sIGFuZCB5b3UmIzM5O2xsIHNlZSBpdCBnZXR0aW5nIHRoZSBmaXJzdCBwYXJhbWV0ZXIsIGFuZCBncmVldGluZyB5b3UhPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJyb3V0aW5nXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGluZ1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0aW5nPC9zcGFuPjwvYT48L2gyPjxwPlRoZSByb3V0aW5nIGNhbiBiZSBkZWZpbmVkIGluIG9uZSBvZiB0d28gd2F5czwvcD5cXG48aDM+PGEgbmFtZT1cXFwicm91dGUtYnktY29udmVudGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JvdXRlLWJ5LWNvbnZlbnRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Um91dGUgYnkgY29udmVudGlvbjwvc3Bhbj48L2E+PC9oMz48cD5Zb3UgY2FuIHVzZSBhIG5hbWluZyBjb252ZW50aW9uIGFzIGZvbGxvd3M6PC9wPlxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5BY3Rpb248L3RoPlxcbjx0aD5NZXRob2Q8L3RoPlxcbjx0aD5VUkw8L3RoPlxcbjx0aD5EZXNjcmlwdGlvbjwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPmluZGV4PC90ZD5cXG48dGQ+R0VUPC90ZD5cXG48dGQ+W2NvbnRyb2xsZXJdICsgJiMzOTtzJiMzOTs8L3RkPlxcbjx0ZD5MaXN0IHRoZSBpdGVtczwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmVkaXQ8L3RkPlxcbjx0ZD5HRVQ8L3RkPlxcbjx0ZD5bY29udHJvbGxlcl0vW2lkXTwvdGQ+XFxuPHRkPkRpc3BsYXkgYSBmb3JtIHRvIGVkaXQgdGhlIGl0ZW08L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5uZXc8L3RkPlxcbjx0ZD5HRVQ8L3RkPlxcbjx0ZD5bY29udHJvbGxlcl0gKyAmIzM5O3MmIzM5OyArICYjMzk7L25ldyYjMzk7PC90ZD5cXG48dGQ+RGlzcGxheSBhIGZvcm0gdG8gYWRkIGEgbmV3IGl0ZW08L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlNheSB5b3UgaGF2ZSBhIG12YyBmaWxlIG5hbWVkICZxdW90O3VzZXIuanMmcXVvdDssIGFuZCB5b3UgZGVmaW5lIGFuIGFjdGlvbiBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmluZGV4ID0gey4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5NaXNvIHdpbGwgYXV0b21hdGljYWxseSBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gJnF1b3Q7L3VzZXJzJnF1b3Q7Ljxicj5Ob3cgc2F5IHlvdSBoYXZlIGEgbXZjIGZpbGUgbmFtZWQgJnF1b3Q7dXNlci5qcyZxdW90OywgYW5kIHlvdSBkZWZpbmUgYW4gYWN0aW9uIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuZWRpdCA9IHsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+TWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvICZxdW90Oy91c2VyLzp1c2VyX2lkJnF1b3Q7LCBzbyB0aGF0IHVzZXJzIGNhbiBhY2Nlc3MgdmlhIGEgcm91dGUgc3VjaCBhcyAmcXVvdDsvdXNlci8yNyZxdW90OyBmb3IgdXNlIHdpdGggSUQgb2YgMjcuIDxlbT5Ob3RlOjwvZW0+IFlvdSBjYW4gZ2V0IHRoZSB1c2VyX2lkIHVzaW5nIGEgbWlzbyB1dGlsaXR5OiA8Y29kZT52YXIgdXNlcklkID0gbWlzby5nZXRQYXJhbSgmIzM5O3VzZXJfaWQmIzM5OywgcGFyYW1zKTs8L2NvZGU+LjwvcD5cXG48aDM+PGEgbmFtZT1cXFwicm91dGUtYnktY29uZmlndXJhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JvdXRlLWJ5LWNvbmZpZ3VyYXRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Um91dGUgYnkgY29uZmlndXJhdGlvbjwvc3Bhbj48L2E+PC9oMz48cD5CeSB1c2luZyA8Y29kZT4vY2ZnL3JvdXRlcy5qc29uPC9jb2RlPiBjb25maWcgZmlsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj57XFxuICAgICZxdW90O1tQYXR0ZXJuXSZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O1tNZXRob2RdJnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtbUm91dGUgbmFtZV0mcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7W0FjdGlvbl0mcXVvdDsgfVxcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+V2hlcmU6PC9wPlxcbjx1bD5cXG48bGk+PHN0cm9uZz5QYXR0ZXJuPC9zdHJvbmc+IC0gdGhlIDxhIGhyZWY9XFxcIi9kb2MvI3JvdXRpbmctcGF0dGVybnMubWRcXFwiPnJvdXRlIHBhdHRlcm48L2E+IHdlIHdhbnQsIGluY2x1ZGluZyBhbnkgcGFyYW1ldGVyczwvbGk+XFxuPGxpPjxzdHJvbmc+TWV0aG9kPC9zdHJvbmc+IC0gb25lIG9mICYjMzk7R0VUJiMzOTssICYjMzk7UE9TVCYjMzk7LCAmIzM5O1BVVCYjMzk7LCAmIzM5O0RFTEVURSYjMzk7PC9saT5cXG48bGk+PHN0cm9uZz5Sb3V0ZTwvc3Ryb25nPiBuYW1lIC0gbmFtZSBvZiB5b3VyIHJvdXRlIGZpbGUgZnJvbSAvbXZjPC9saT5cXG48bGk+PHN0cm9uZz5BY3Rpb248L3N0cm9uZz4gLSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gY2FsbCBvbiB5b3VyIHJvdXRlIGZpbGUgZnJvbSAvbXZjPC9saT5cXG48L3VsPlxcbjxwPjxzdHJvbmc+RXhhbXBsZTwvc3Ryb25nPjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPntcXG4gICAgJnF1b3Q7LyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7aG9tZSZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvIHRoZSByb290IG9mIHRoZSBVUkwgZm9yIHRoZSA8Y29kZT5pbmRleDwvY29kZT4gYWN0aW9uIGluIDxjb2RlPmhvbWUuanM8L2NvZGU+PC9wPlxcbjxwPjxzdHJvbmc+Tm90ZTo8L3N0cm9uZz4gVGhlIHJvdXRpbmcgY29uZmlnIHdpbGwgb3ZlcnJpZGUgYW55IGF1dG9tYXRpY2FsbHkgZGVmaW5lZCByb3V0ZXMsIHNvIGlmIHlvdSBuZWVkIG11bHRpcGxlIHJvdXRlcyB0byBwb2ludCB0byB0aGUgc2FtZSBhY3Rpb24sIHlvdSBtdXN0IG1hbnVhbGx5IGRlZmluZSB0aGVtLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYSBtdmMgZmlsZSBuYW1lZCAmcXVvdDt0ZXJtLmpzJnF1b3Q7LCBhbmQgeW91IGRlZmluZSBhbiBhY3Rpb24gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+TWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvICZxdW90Oy90ZXJtcyZxdW90Oy4gTm93LCBpZiB5b3Ugd2FudCB0byBtYXAgaXQgYWxzbyB0byAmcXVvdDsvQUdCJnF1b3Q7LCB5b3Ugd2lsbCBuZWVkIHRvIGFkZCB0d28gZW50cmllcyBpbiB0aGUgcm91dGVzIGNvbmZpZzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj57XFxuICAgICZxdW90Oy90ZXJtcyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7dGVybXMmcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfSxcXG4gICAgJnF1b3Q7L0FHQiZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7dGVybXMmcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfVxcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBpcyBiZWNhdXNlIE1pc28gYXNzdW1lcyB0aGF0IGlmIHlvdSBvdmVycmlkZSB0aGUgZGVmYXVsdGVkIHJvdXRlcywgeW91IGFjdHVhbGx5IHdhbnQgdG8gcmVwbGFjZSB0aGVtLCBub3QganVzdCBvdmVycmlkZSB0aGVtLiA8ZW0+Tm90ZTo8L2VtPiB0aGlzIGlzIGNvcnJlY3QgYmVoYXZpb3VyLCBhcyBpdCBtaW5vcml0eSBjYXNlIGlzIHdoZW4geW91IHdhbnQgbW9yZSB0aGFuIG9uZSByb3V0ZSBwb2ludGluZyB0byB0aGUgc2FtZSBhY3Rpb24uPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJyb3V0aW5nLXBhdHRlcm5zXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGluZy1wYXR0ZXJuc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0aW5nIHBhdHRlcm5zPC9zcGFuPjwvYT48L2gzPjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5UeXBlPC90aD5cXG48dGg+RXhhbXBsZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPlBhdGg8L3RkPlxcbjx0ZD4mcXVvdDsvYWJjZCZxdW90OyAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2Q8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYWJjP2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkIGFuZCAvYWJkPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2FiK2NkJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCwgL2FiYmNkLCAvYWJiYmJiY2QgYW5kIHNvIG9uPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2FiKmNkJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCwgL2FieGNkLCAvYWJGT09jZCwgL2FiYkFyY2QgYW5kIHNvIG9uPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2EoYmMpP2QmcXVvdDsgLSB3aWxsIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FkIGFuZCAvYWJjZDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlJlZ3VsYXIgRXhwcmVzc2lvbjwvdGQ+XFxuPHRkPi9cXFxcL2FiYyYjMTI0O1xcXFwveHl6LyAtIHdpbGwgbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjIGFuZCAveHl6PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+QXJyYXk8L3RkPlxcbjx0ZD5bJnF1b3Q7L2FiY2QmcXVvdDssICZxdW90Oy94eXphJnF1b3Q7LCAvXFxcXC9sbW4mIzEyNDtcXFxcL3Bxci9dIC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCwgL3h5emEsIC9sbW4sIGFuZCAvcHFyPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48aDM+PGEgbmFtZT1cXFwibGlua3NcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNsaW5rc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5MaW5rczwvc3Bhbj48L2E+PC9oMz48cD5XaGVuIHlvdSBjcmVhdGUgbGlua3MsIGluIG9yZGVyIHRvIGdldCB0aGUgYXBwIHRvIHdvcmsgYXMgYW4gU1BBLCB5b3UgbXVzdCBwYXNzIGluIG0ucm91dGUgYXMgYSBjb25maWcsIHNvIHRoYXQgdGhlIGhpc3Rvcnkgd2lsbCBiZSB1cGRhdGVkIGNvcnJlY3RseSwgZm9yIGV4YW1wbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+QSh7aHJlZjomcXVvdDsvdXNlcnMvbmV3JnF1b3Q7LCBjb25maWc6IG0ucm91dGV9LCAmcXVvdDtBZGQgbmV3IHVzZXImcXVvdDspXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBjb3JyZWN0bHkgd29yayBhcyBhIFNQQS4gSWYgeW91IGxlYXZlIG91dCA8Y29kZT5jb25maWc6IG0ucm91dGU8L2NvZGU+LCB0aGUgYXBwIHdpbGwgc3RpbGwgd29yaywgYnV0IHRoZSBwYWdlIHdpbGwgcmVsb2FkIGV2ZXJ5IHRpbWUgdGhlIGxpbmsgaXMgZm9sbG93ZWQuPC9wPlxcbjxwPk5vdGU6IGlmIHlvdSBhcmUgcGxhbm5pbmcgdG8gbWFudWFsbHkgcm91dGUsIGllOiB1c2UgPGNvZGU+bS5yb3V0ZTwvY29kZT4sIGJlIHN1cmUgdG8gdXNlIHRoZSBuYW1lIG9mIHRoZSByb3V0ZSwgbm90IGEgVVJMLiBJZTogaWYgeW91IGhhdmUgYSByb3V0ZSAmcXVvdDsvYWNjb3VudCZxdW90OywgdXNpbmcgPGNvZGU+bS5yb3V0ZSgmcXVvdDtodHRwOi8vcDEuaW8vYWNjb3VudCZxdW90Oyk8L2NvZGU+IHdvbiYjMzk7dCBtYXRjaCwgbWl0aHJpbCBpcyBleHBlY3RpbmcgPGNvZGU+bS5yb3V0ZSgmcXVvdDsvYWNjb3VudCZxdW90Oyk8L2NvZGU+IGluc3RlYWQgb2YgdGhlIGZ1bGwgVVJMLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiZGF0YS1tb2RlbHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNkYXRhLW1vZGVsc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5EYXRhIG1vZGVsczwvc3Bhbj48L2E+PC9oMj48cD5EYXRhIG1vZGVscyBhcmUgcHJvZ3Jlc3NpdmVseSBlbmhhbmNlZCBtaXRocmlsIG1vZGVscyAtIHlvdSBzaW1wbHkgY3JlYXRlIHlvdXIgbW9kZWwgYXMgdXN1YWwsIHRoZW4gYWRkIHZhbGlkYXRpb24gYW5kIHR5cGUgaW5mb3JtYXRpb24gYXMgaXQgYmVjb21lcyBwZXJ0aW5lbnQuXFxuRm9yIGV4YW1wbGUsIHNheSB5b3UgaGF2ZSBhIG1vZGVsIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIHVzZXJNb2RlbCA9IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICB0aGlzLm5hbWUgPSBtLnAoZGF0YS5uYW1lfHwmcXVvdDsmcXVvdDspO1xcbiAgICB0aGlzLmVtYWlsID0gbS5wKGRhdGEuZW1haWx8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuaWQgPSBtLnAoZGF0YS5faWR8fCZxdW90OyZxdW90Oyk7XFxuICAgIHJldHVybiB0aGlzO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+SW4gb3JkZXIgdG8gbWFrZSBpdCB2YWxpZGF0YWJsZSwgYWRkIHRoZSB2YWxpZGF0b3IgbW9kdWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJiMzOTt2YWxpZGF0b3IubW9kZWxiaW5kZXImIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZW4gYWRkIGEgPGNvZGU+aXNWYWxpZDwvY29kZT4gdmFsaWRhdGlvbiBtZXRob2QgdG8geW91ciBtb2RlbCwgd2l0aCBhbnkgZGVjbGFyYXRpb25zIGJhc2VkIG9uIDxhIGhyZWY9XFxcIi9kb2MvdmFsaWRhdG9yLmpzI3ZhbGlkYXRvcnMubWRcXFwiPm5vZGUgdmFsaWRhdG9yPC9hPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgdXNlck1vZGVsID0gZnVuY3Rpb24oZGF0YSl7XFxuICAgIHRoaXMubmFtZSA9IG0ucChkYXRhLm5hbWV8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuZW1haWwgPSBtLnAoZGF0YS5lbWFpbHx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5pZCA9IG0ucChkYXRhLl9pZHx8JnF1b3Q7JnF1b3Q7KTtcXG5cXG4gICAgLy8gICAgVmFsaWRhdGUgdGhlIG1vZGVsICAgICAgICBcXG4gICAgdGhpcy5pc1ZhbGlkID0gdmFsaWRhdGUuYmluZCh0aGlzLCB7XFxuICAgICAgICBuYW1lOiB7XFxuICAgICAgICAgICAgaXNSZXF1aXJlZDogJnF1b3Q7WW91IG11c3QgZW50ZXIgYSBuYW1lJnF1b3Q7XFxuICAgICAgICB9LFxcbiAgICAgICAgZW1haWw6IHtcXG4gICAgICAgICAgICBpc1JlcXVpcmVkOiAmcXVvdDtZb3UgbXVzdCBlbnRlciBhbiBlbWFpbCBhZGRyZXNzJnF1b3Q7LFxcbiAgICAgICAgICAgIGlzRW1haWw6ICZxdW90O011c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJnF1b3Q7XFxuICAgICAgICB9XFxuICAgIH0pO1xcblxcbiAgICByZXR1cm4gdGhpcztcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIGNyZWF0ZXMgYSBtZXRob2QgdGhhdCB0aGUgbWlzbyBkYXRhYmFzZSBhcGkgY2FuIHVzZSB0byB2YWxpZGF0ZSB5b3VyIG1vZGVsLlxcbllvdSBnZXQgZnVsbCBhY2Nlc3MgdG8gdGhlIHZhbGlkYXRpb24gaW5mbyBhcyB3ZWxsLCBzbyB5b3UgY2FuIHNob3cgYW4gZXJyb3IgbWVzc2FnZSBuZWFyIHlvdXIgZmllbGQsIGZvciBleGFtcGxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspXFxuPC9jb2RlPjwvcHJlPlxcbjxwPldpbGwgcmV0dXJuIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSA8Y29kZT5lbWFpbDwvY29kZT4gcHJvcGVydHkgb2YgeW91ciB1c2VyIG1vZGVsIGlzIHZhbGlkLCBvciBhIGxpc3Qgb2YgZXJyb3JzIG1lc3NhZ2VzIGlmIGl0IGlzIGludmFsaWQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+WyZxdW90O1lvdSBtdXN0IGVudGVyIGFuIGVtYWlsIGFkZHJlc3MmcXVvdDssICZxdW90O011c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJnF1b3Q7XVxcbjwvY29kZT48L3ByZT5cXG48cD5TbyB5b3UgY2FuIGZvciBleGFtcGxlIGFkZCBhIGNsYXNzIG5hbWUgdG8gYSBkaXYgc3Vycm91bmRpbmcgeW91ciBmaWVsZCBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkRJVih7Y2xhc3M6IChjdHJsLnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspID09IHRydWU/ICZxdW90O3ZhbGlkJnF1b3Q7OiAmcXVvdDtpbnZhbGlkJnF1b3Q7KX0sIFsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHNob3cgdGhlIGVycm9yIG1lc3NhZ2VzIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+U1BBTihjdHJsLnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspID09IHRydWU/ICZxdW90OyZxdW90OzogY3RybC51c2VyLmlzVmFsaWQoJiMzOTtlbWFpbCYjMzk7KS5qb2luKCZxdW90OywgJnF1b3Q7KSlcXG48L2NvZGU+PC9wcmU+XFxuPGgyPjxhIG5hbWU9XFxcImRhdGFiYXNlLWFwaS1hbmQtbW9kZWwtaW50ZXJhY3Rpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNkYXRhYmFzZS1hcGktYW5kLW1vZGVsLWludGVyYWN0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkRhdGFiYXNlIGFwaSBhbmQgbW9kZWwgaW50ZXJhY3Rpb248L3NwYW4+PC9hPjwvaDI+PHA+TWlzbyB1c2VzIHRoZSBtb2RlbCBkZWZpbml0aW9ucyB0aGF0IHlvdSBkZWNsYXJlIGluIHlvdXIgPGNvZGU+bXZjPC9jb2RlPiBmaWxlIHRvIGJ1aWxkIHVwIGEgc2V0IG9mIG1vZGVscyB0aGF0IHRoZSBBUEkgY2FuIHVzZSwgdGhlIG1vZGVsIGRlZmluaXRpb25zIHdvcmsgbGlrZSB0aGlzOjwvcD5cXG48dWw+XFxuPGxpPk9uIHRoZSBtb2RlbHMgYXR0cmlidXRlIG9mIHRoZSBtdmMsIHdlICBkZWZpbmUgYSBzdGFuZGFyZCBtaXRocmlsIGRhdGEgbW9kZWwsIChpZTogYSBqYXZhc2NyaXB0IG9iamVjdCB3aGVyZSBwcm9wZXJ0aWVzIGNhbiBiZSBlaXRoZXIgc3RhbmRhcmQgamF2YXNjcmlwdCBkYXRhIHR5cGVzLCBvciBhIGZ1bmN0aW9uIHRoYXQgd29ya3MgYXMgYSBnZXR0ZXIvc2V0dGVyLCBlZzogPGNvZGU+bS5wcm9wPC9jb2RlPik8L2xpPlxcbjxsaT5PbiBzZXJ2ZXIgc3RhcnR1cCwgbWlzbyByZWFkcyB0aGlzIGFuZCBjcmVhdGVzIGEgY2FjaGUgb2YgdGhlIG1vZGVsIG9iamVjdHMsIGluY2x1ZGluZyB0aGUgbmFtZSBzcGFjZSBvZiB0aGUgbW9kZWwsIGVnOiAmcXVvdDtoZWxsby5lZGl0LmhlbGxvJnF1b3Q7PC9saT5cXG48bGk+TW9kZWxzIGNhbiBvcHRpb25hbGx5IGluY2x1ZGUgZGF0YSB2YWxpZGF0aW9uIGluZm9ybWF0aW9uLCBhbmQgdGhlIGRhdGFiYXNlIGFwaSB3aWxsIGdldCBhY2Nlc3MgdG8gdGhpcy48L2xpPlxcbjwvdWw+XFxuPHA+QXNzdW1pbmcgd2UgaGF2ZSBhIG1vZGVsIGluIHRoZSBoZWxsby5tb2RlbHMgb2JqZWN0IGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+aGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgIHRoaXMuaXNWYWxpZCA9IHZhbGlkYXRlLmJpbmQodGhpcywge1xcbiAgICAgICAgd2hvOiB7XFxuICAgICAgICAgICAgaXNSZXF1aXJlZDogJnF1b3Q7WW91IG11c3Qga25vdyB3aG8geW91IGFyZSB0YWxraW5nIHRvJnF1b3Q7XFxuICAgICAgICB9XFxuICAgIH0pO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIEFQSSB3b3JrcyBsaWtlIHRoaXM6PC9wPlxcbjx1bD5cXG48bGk+V2UgY3JlYXRlIGFuIGVuZHBvaW50IGF0IDxjb2RlPi9hcGk8L2NvZGU+IHdoZXJlIGVhY2ggd2UgbG9hZCB3aGF0ZXZlciBhcGkgaXMgY29uZmlndXJlZCBpbiA8Y29kZT4vY2ZnL3NlcnZlci5qc29uPC9jb2RlPiwgYW5kIGV4cG9zZSBlYWNoIG1ldGhvZC4gRm9yIGV4YW1wbGUgPGNvZGU+L2FwaS9zYXZlPC9jb2RlPiBpcyBhdmFpbGFibGUgZm9yIHRoZSBkZWZhdWx0IDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IGFwaS48L2xpPlxcbjxsaT5OZXh0IHdlIGNyZWF0ZSBhIHNldCBvZiBBUEkgZmlsZXMgLSBvbmUgZm9yIGNsaWVudCwgKC9zeXN0ZW0vYXBpLmNsaWVudC5qcyksIGFuZCBvbmUgZm9yIHNlcnZlciAoL3N5c3RlbS9hcGkuc2VydmVyLmpzKSAtIGVhY2ggaGF2ZSB0aGUgc2FtZSBtZXRob2RzLCBidXQgZG8gdmFzdGx5IGRpZmZlcmVudCB0aGluZ3M6PHVsPlxcbjxsaT5hcGkuY2xpZW50LmpzIGlzIGEgdGhpbiB3cmFwcGVyIHRoYXQgdXNlcyBtaXRocmlsJiMzOTtzIG0ucmVxdWVzdCB0byBjcmVhdGUgYW4gYWpheCByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgQVBJLCBpdCBzaW1wbHkgcGFzc2VzIG1lc3NhZ2VzIGJhY2sgYW5kIGZvcnRoIChpbiBKU09OIFJQQyAyLjAgZm9ybWF0KS48L2xpPlxcbjxsaT5hcGkuc2VydmVyLmpzIGNhbGxzIHRoZSBkYXRhYmFzZSBhcGkgbWV0aG9kcywgd2hpY2ggaW4gdHVybiBoYW5kbGVzIG1vZGVscyBhbmQgdmFsaWRhdGlvbiBzbyBmb3IgZXhhbXBsZSB3aGVuIGEgcmVxdWVzdCBpcyBtYWRlIGFuZCBhIDxjb2RlPnR5cGU8L2NvZGU+IGFuZCA8Y29kZT5tb2RlbDwvY29kZT4gaXMgaW5jbHVkZWQsIHdlIGNhbiByZS1jb25zdHJ1Y3QgdGhlIGRhdGEgbW9kZWwgYmFzZWQgb24gdGhpcyBpbmZvLCBmb3IgZXhhbXBsZSB5b3UgbWlnaHQgc2VuZDoge3R5cGU6ICYjMzk7aGVsbG8uZWRpdC5oZWxsbyYjMzk7LCBtb2RlbDoge3dobzogJiMzOTtEYXZlJiMzOTt9fSwgdGhpcyBjYW4gdGhlbiBiZSBjYXN0IGJhY2sgaW50byBhIG1vZGVsIHRoYXQgd2UgY2FuIGNhbGwgdGhlIDxjb2RlPmlzVmFsaWQ8L2NvZGU+IG1ldGhvZCBvbi48L2xpPlxcbjwvdWw+XFxuPC9saT5cXG48L3VsPlxcbjxwPjxzdHJvbmc+Tm93LCB0aGUgaW1wb3J0YW50IGJpdDo8L3N0cm9uZz4gVGhlIHJlYXNvbiBmb3IgYWxsIHRoaXMgZnVuY3Rpb25hbGl0eSBpcyB0aGF0IG1pdGhyaWwgaW50ZXJuYWxseSBkZWxheXMgcmVuZGVyaW5nIHRvIHRoZSBET00gd2hpbHN0IGEgcmVxdWVzdCBpcyBnb2luZyBvbiwgc28gd2UgbmVlZCB0byBoYW5kbGUgdGhpcyB3aXRoaW4gbWlzbyAtIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gcmVuZGVyIHRoaW5ncyBvbiB0aGUgc2VydmVyIC0gc28gd2UgaGF2ZSBhIGJpbmRpbmcgc3lzdGVtIHRoYXQgZGVsYXlzIHJlbmRlcmluZyB3aGlsc3QgYW4gYXN5bmMgcmVxdWVzdCBpcyBzdGlsbCBiZWluZyBleGVjdXRlZC4gVGhhdCBtZWFucyBtaXRocmlsLWxpa2UgY29kZSBsaWtlIHRoaXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y29udHJvbGxlcjogZnVuY3Rpb24oKXtcXG4gICAgdmFyIGN0cmwgPSB0aGlzO1xcbiAgICBhcGkuZmluZCh7dHlwZTogJiMzOTtoZWxsby5pbmRleC5oZWxsbyYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XFxuICAgICAgICB2YXIgbGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgdmFyIG15SGVsbG8gPSBkYXRhLnJlc3VsdFtrZXldO1xcbiAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMuaGVsbG8obXlIZWxsbyk7XFxuICAgICAgICB9KTtcXG4gICAgICAgIGN0cmwubW9kZWwgPSBuZXcgY3RybC52bS50b2RvTGlzdChsaXN0KTtcXG4gICAgfSk7XFxuICAgIHJldHVybiBjdHJsO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+V2lsbCBzdGlsbCB3b3JrLiBOb3RlOiB0aGUgbWFnaWMgaGVyZSBpcyB0aGF0IHRoZXJlIGlzIGFic29sdXRlbHkgbm90aGluZyBpbiB0aGUgY29kZSBhYm92ZSB0aGF0IHJ1bnMgYSBjYWxsYmFjayB0byBsZXQgbWl0aHJpbCBrbm93IHRoZSBkYXRhIGlzIHJlYWR5IC0gdGhpcyBpcyBhIGRlc2lnbiBmZWF0dXJlIG9mIG1pdGhyaWwgdG8gZGVsYXkgcmVuZGVyaW5nIGF1dG9tYXRpY2FsbHkgd2hpbHN0IGFuIDxjb2RlPm0ucmVxdWVzdDwvY29kZT4gaXMgaW4gcHJvZ3Jlc3MsIHNvIHdlIGNhdGVyIGZvciB0aGlzIHRvIGhhdmUgdGhlIGFiaWxpdHkgdG8gcmVuZGVyIHRoZSBwYWdlIHNlcnZlci1zaWRlIGZpcnN0LCBzbyB0aGF0IFNFTyB3b3JrcyBvdXQgb2YgdGhlIGJveC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImNsaWVudC12cy1zZXJ2ZXItY29kZVxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NsaWVudC12cy1zZXJ2ZXItY29kZVxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5DbGllbnQgdnMgc2VydmVyIGNvZGU8L3NwYW4+PC9hPjwvaDI+PHA+SW4gbWlzbywgeW91IGluY2x1ZGUgZmlsZXMgdXNpbmcgdGhlIHN0YW5kYXJkIG5vZGVqcyA8Y29kZT5yZXF1aXJlPC9jb2RlPiBmdW5jdGlvbi4gV2hlbiB5b3UgbmVlZCB0byBkbyBzb21ldGhpbmcgdGhhdCB3b3JrcyBkaWZmZXJlbnRseSBpbiB0aGUgY2xpZW50IHRoYW4gdGhlIHNlcnZlciwgdGhlcmUgYXJlIGEgZmV3IHdheXMgeW91IGNhbiBhY2hpZXZlIGl0OjwvcD5cXG48dWw+XFxuPGxpPlRoZSByZWNvbW1lbmRlZCB3YXkgaXMgdG8gY3JlYXRlIGFuZCByZXF1aXJlIGEgZmlsZSBpbiB0aGUgPGNvZGU+bW9kdWxlcy88L2NvZGU+IGRpcmVjdG9yeSwgYW5kIHRoZW4gY3JlYXRlIHRoZSBzYW1lIGZpbGUgd2l0aCBhICZxdW90Oy5jbGllbnQmcXVvdDsgYmVmb3JlIHRoZSBleHRlbnNpb24sIGFuZCBtaXNvIHdpbGwgYXV0b21hdGljYWxseSBsb2FkIHRoYXQgZmlsZSBmb3IgeW91IG9uIHRoZSBjbGllbnQgc2lkZSBpbnN0ZWFkLiBGb3IgZXhhbXBsZSBpZiB5b3UgaGF2ZSA8Y29kZT4vbW9kdWxlcy9zb21ldGhpbmcuanM8L2NvZGU+LCBpZiB5b3UgY3JlYXRlIDxjb2RlPi9tb2R1bGVzL3NvbWV0aGluZy5jbGllbnQuanM8L2NvZGU+LCBtaXNvIHdpbGwgYXV0b21hdGljYWxseSB1c2UgdGhhdCBvbiB0aGUgY2xpZW50LjwvbGk+XFxuPGxpPkFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSA8Y29kZT5taXNvLnV0aWw8L2NvZGU+IC0geW91IGNhbiB1c2UgPGNvZGU+bWlzby51dGlsLmlzU2VydmVyKCk8L2NvZGU+IHRvIHRlc3QgaWYgeW91JiMzOTtyZSBvbiB0aGUgc2VydmVyIG9yIG5vdCwgdGhvdWdoIGl0IGlzIGJldHRlciBwcmFjdGljZSB0byB1c2UgdGhlICZxdW90Oy5jbGllbnQmcXVvdDsgbWV0aG9kIG1lbnRpb25lZCBhYm92ZSAtIG9ubHkgdXNlIDxjb2RlPmlzU2VydmVyPC9jb2RlPiBpZiB5b3UgYWJzb2x1dGVseSBoYXZlIG5vIG90aGVyIG9wdGlvbi48L2xpPlxcbjwvdWw+XFxuPGgyPjxhIG5hbWU9XFxcImZpcnN0LXBhZ2UtbG9hZFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2ZpcnN0LXBhZ2UtbG9hZFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5GaXJzdCBwYWdlIGxvYWQ8L3NwYW4+PC9hPjwvaDI+PHA+V2hlbiBhIG5ldyB1c2VyIGVudGVycyB5b3VyIHNpdGUgdmlhIGEgVVJMLCBhbmQgbWlzbyBsb2FkcyB0aGUgZmlyc3QgcGFnZSwgYSBudW1iZXIgb2YgdGhpbmdzIGhhcHBlbjo8L3A+XFxuPHVsPlxcbjxsaT5UaGUgc2VydmVyIGdlbmVyYXRlcyB0aGUgcGFnZSwgaW5jbHVkaW5nIGFueSBkYXRhIHRoZSB1c2VyIG1pZ2h0IGhhdmUgYWNjZXNzIHRvLiBUaGlzIGlzIG1haW5seSBmb3IgU0VPIHB1cnBvc2VzLCBidXQgYWxzbyB0byBtYWtlIHRoZSBwZXJjZXB0aWJsZSBsb2FkaW5nIHRpbWUgbGVzcywgcGx1cyBwcm92aWRlIGJlYXV0aWZ1bCB1cmxzIG91dCBvZiB0aGUgYm94LiA8L2xpPlxcbjxsaT5PbmNlIHRoZSBwYWdlIGhhcyBsb2FkZWQsIG1pdGhyaWwga2lja3MgaW4gYW5kIGNyZWF0ZXMgYSBYSFIgKGFqYXgpIHJlcXVlc3QgdG8gcmV0cmVpdmUgdGhlIGRhdGEsIGFuZCBzZXR1cCBhbnkgZXZlbnRzIGFuZCB0aGUgdmlydHVhbCBET00sIGV0Yy48L2xpPlxcbjwvdWw+XFxuPHA+Tm93IHlvdSBtaWdodCBiZSB0aGlua2luZzogd2UgZG9uJiMzOTt0IHJlYWxseSBuZWVkIHRoYXQgMm5kIHJlcXVlc3QgZm9yIGRhdGEgLSBpdCYjMzk7cyBhbHJlYWR5IGluIHRoZSBwYWdlLCByaWdodD8gV2VsbCwgc29ydCBvZiAtIHlvdSBzZWUgbWlzbyBkb2VzIG5vdCBtYWtlIGFueSBhc3N1bXB0aW9ucyBhYm91dCB0aGUgc3RydWN0dXJlIG9mIHlvdXIgZGF0YSwgb3IgaG93IHlvdSB3YW50IHRvIHVzZSBpdCBpbiB5b3VyIG1vZGVscywgc28gdGhlcmUgaXMgbm8gd2F5IGZvciB1cyB0byByZS11c2UgdGhhdCBkYXRhLCBhcyBpdCBjb3VsZCBiZSBhbnkgc3RydWN0dXJlLlxcbkFub3RoZXIga2V5IGZlYXR1cmUgb2YgbWlzbyBpcyB0aGUgZmFjdCB0aGF0IGFsbCBhY3Rpb25zIGNhbiBiZSBib29rbWFya2FibGUgLSBmb3IgZXhhbXBsZSB0aGUgPGEgaHJlZj1cXFwiL2RvYy91c2Vycy5tZFxcXCI+L3VzZXJzPC9hPiBhcHAgLSBjbGljayBvbiBhIHVzZXIsIGFuZCBzZWUgdGhlIHVybCBjaGFuZ2UgLSB3ZSBkaWRuJiMzOTt0IGRvIGFub3RoZXIgc2VydmVyIHJvdW5kLXRyaXAsIGJ1dCByYXRoZXIganVzdCBhIFhIUiByZXF1ZXN0IHRoYXQgcmV0dXJuZWQgdGhlIGRhdGEgd2UgcmVxdWlyZWQgLSB0aGUgVUkgd2FzIGNvbXBsZXRlbHkgcmVuZGVyZWQgY2xpZW50IHNpZGUgLSBzbyBpdCYjMzk7cyByZWFsbHkgb24gdGhhdCBmaXJzdCB0aW1lIHdlIGxvYWQgdGhlIHBhZ2UgdGhhdCB5b3UgZW5kIHVwIGxvYWRpbmcgdGhlIGRhdGEgdHdpY2UuPC9wPlxcbjxwPlNvIHRoYXQgaXMgdGhlIHJlYXNvbiB0aGUgYXJjaGl0ZWN0dXJlIHdvcmtzIHRoZSB3YXkgaXQgZG9lcywgYW5kIGhhcyB0aGF0IHNlZW1pbmdseSByZWR1bmRhbnQgMm5kIHJlcXVlc3QgZm9yIHRoZSBkYXRhIC0gaXQgaXMgYSBzbWFsbCBwcmljZSB0byBwYXkgZm9yIFNFTywgYW5kIHBlcmNlcHRpYmx5IHF1aWNrIGxvYWRpbmcgcGFnZXMgYW5kIGFzIG1lbnRpb25lZCwgaXQgb25seSBldmVyIGhhcHBlbnMgb24gdGhlIGZpcnN0IHBhZ2UgbG9hZC48L3A+XFxuPHA+T2YgY291cnNlIHlvdSBjb3VsZCBpbXBsZW1lbnQgY2FjaGluZyBvZiB0aGUgZGF0YSB5b3Vyc2VsZiwgaWYgdGhlIDJuZCByZXF1ZXN0IGlzIGFuIGlzc3VlIC0gYWZ0ZXIgYWxsIHlvdSBtaWdodCBiZSBsb2FkaW5nIHF1aXRlIGEgYml0IG9mIGRhdGEuIE9uZSB3YXkgdG8gZG8gdGhpcyB3b3VsZCBiZSBsaWtlIHNvICh3YXJuaW5nOiByYXRoZXIgY29udHJpdmVkIGV4YW1wbGUgZm9sbG93cyk6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICAgICAgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuXFxuICAgICAgICAvLyAgICBDaGVjayBpZiBvdXIgZGF0YSBpcyBhdmFpbGFibGUsIGlmIHNvOiB1c2UgaXQuXFxuICAgICAgICBpZih0eXBlb2YgbXlQZXJzb24gIT09ICZxdW90O3VuZGVmaW5lZCZxdW90Oykge1xcbiAgICAgICAgICAgIGN0cmwubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogbXlQZXJzb259KTtcXG4gICAgICAgIH0gZWxzZSB7XFxuICAgICAgICAvLyAgICBJZiBub3QsIGxvYWQgaXQgZmlyc3QuXFxuICAgICAgICAgICAgZGIuZmluZCh7dHlwZTogJiMzOTt1c2VyLmVkaXQudXNlciYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XFxuICAgICAgICAgICAgICAgIGN0cmwubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogZGF0YS5yZXN1bHRbMF0ubmFtZX0pO1xcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgLy8gICAgQWRkIGEgY2xpZW50IHNpZGUgZ2xvYmFsIHZhcmlhYmxlIHdpdGggb3VyIGRhdGFcXG4gICAgICAgICAgICAgICAgU0NSSVBUKCZxdW90O3ZhciBteVBlcnNvbiA9ICYjMzk7JnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSArICZxdW90OyYjMzk7JnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0cmIzM5O2RheSAmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpKVxcbiAgICAgICAgICAgIF1cXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNvIHRoaXMgd2lsbCBvbmx5IGxvYWQgdGhlIGRhdGEgb24gdGhlIHNlcnZlciBzaWRlIC0gYXMgeW91IGNhbiBzZWUsIHdlIG5lZWQgdG8ga25vdyB0aGUgc2hhcGUgb2YgdGhlIGRhdGEgdG8gdXNlIGl0LCBhbmQgd2UgYXJlIHVzaW5nIGEgZ2xvYmFsIHZhcmlhYmxlIGhlcmUgdG8gc3RvcmUgdGhlIGRhdGEgY2xpZW50IHNpZGUgLSBJIGRvbiYjMzk7dCByZWFsbHkgcmVjb21tZW5kIHRoaXMgYXBwcm9hY2gsIGFzIGl0IHNlZW1zIGxpa2UgYSBsb3Qgb2Ygd29yayB0byBzYXZlIGEgc2luZ2xlIFhIUiByZXF1ZXN0LiBIb3dldmVyIEkgdW5kZXJzdGFuZCB5b3UgbWlnaHQgaGF2ZSB1bmlxdWUgY2lyY3Vtc3RhbmNlcyB3aGVyZSB0aGUgZmlyc3QgZGF0YSBsb2FkIGNvdWxkIGJlIGEgcHJvYmxlbSwgc28gYXQgbGVhc3QgdGhpcyBpcyBhbiBvcHRpb24geW91IGNhbiB1c2UgdG8gY2FjaGUgdGhlIGRhdGEgb24gZmlyc3QgcGFnZSBsb2FkLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwicmVxdWlyaW5nLWZpbGVzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcmVxdWlyaW5nLWZpbGVzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJlcXVpcmluZyBmaWxlczwvc3Bhbj48L2E+PC9oMj48cD5XaGVuIHJlcXVpcmluZyBmaWxlcywgYmUgc3VyZSB0byBkbyBzbyBpbiBhIHN0YXRpYyBtYW5uZXIgc28gdGhhdCBicm93c2VyaWZ5IGlzIGFibGUgdG8gY29tcGlsZSB0aGUgY2xpZW50IHNpZGUgc2NyaXB0LiBBbHdheXMgdXNlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5FVkVSIERPIEFOWSBPRiBUSEVTRTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4vLyAgRE9OJiMzOTtUIERPIFRISVMhXFxudmFyIG1pc28gPSBuZXcgcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBjcmVhdGUgYW4gb2JqZWN0LCB3aGljaCBtZWFucyA8YSBocmVmPVxcXCIvZG9jLzgyNC5tZFxcXCI+YnJvd3NlcmlmeSBjYW5ub3QgcmVzb2x2ZSBpdCBzdGF0aWNhbGx5PC9hPiwgYW5kIHdpbGwgaWdub3JlIGl0LjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICBET04mIzM5O1QgRE8gVEhJUyFcXG52YXIgdGhpbmcgPSAmIzM5O21pc28mIzM5OztcXG52YXIgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvJiMzOTsrdGhpbmcrJiMzOTsudXRpbC5qcyYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGNyZWF0ZSBhbiBleHByZXNzaW9uLCB3aGljaCBtZWFucyA8YSBocmVmPVxcXCIvZG9jLzgyNC5tZFxcXCI+YnJvd3NlcmlmeSBjYW5ub3QgcmVzb2x2ZSBpdCBzdGF0aWNhbGx5PC9hPiwgYW5kIHdpbGwgaWdub3JlIGl0LjwvcD5cXG5cIixcIlBhdHRlcm5zLm1kXCI6XCI8cD5UaGVyZSBhcmUgc2V2ZXJhbCB3YXlzIHlvdSBjYW4gd3JpdGUgeW91ciBhcHAgYW5kIG1pc28gaXMgbm90IG9waW5pb25hdGVkIGFib3V0IGhvdyB5b3UgZ28gYWJvdXQgdGhpcyBzbyBpdCBpcyBpbXBvcnRhbnQgdGhhdCB5b3UgY2hvb3NlIGEgcGF0dGVybiB0aGF0IHN1aXRzIHlvdXIgbmVlZHMuIEJlbG93IGFyZSBhIGZldyBzdWdnZXN0ZWQgcGF0dGVybnMgdG8gZm9sbG93IHdoZW4gZGV2ZWxvcGluZyBhcHBzLjwvcD5cXG48cD48c3Ryb25nPk5vdGU6PC9zdHJvbmc+IG1pc28gaXMgYSBzaW5nbGUgcGFnZSBhcHAgdGhhdCBsb2FkcyBzZXJ2ZXIgcmVuZGVyZWQgSFRNTCBmcm9tIGFueSBVUkwsIHNvIHRoYXQgU0VPIHdvcmtzIG91dCBvZiB0aGUgYm94LjwvcD5cXG48aDI+PGEgbmFtZT1cXFwic2luZ2xlLXVybC1tdmNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzaW5nbGUtdXJsLW12Y1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5TaW5nbGUgdXJsIG12Yzwvc3Bhbj48L2E+PC9oMj48cD5JbiB0aGlzIHBhdHRlcm4gZXZlcnl0aGluZyB0aGF0IHlvdXIgbXZjIG5lZWRzIHRvIGRvIGlzIGRvbmUgb24gYSBzaW5nbGUgdXJsIGZvciBhbGwgdGhlIGFzc29jaWF0ZWQgYWN0aW9ucy4gVGhlIGFkdmFudGFnZSBmb3IgdGhpcyBzdHlsZSBvZiBkZXZlbG9wbWVudCBpcyB0aGF0IHlvdSBoYXZlIGV2ZXJ5dGhpbmcgaW4gb25lIG12YyBjb250YWluZXIsIGFuZCB5b3UgZG9uJiMzOTt0IG5lZWQgdG8gbWFwIGFueSByb3V0ZXMgLSBvZiBjb3Vyc2UgdGhlIGRvd25zaWRlIGJlaW5nIHRoYXQgdGhlcmUgYXJlIG5vIHJvdXRlcyBmb3IgdGhlIHVzZXIgdG8gYm9va21hcmsuIFRoaXMgaXMgcGF0dGVybiB3b3JrcyB3ZWxsIGZvciBzbWFsbGVyIGVudGl0aWVzIHdoZXJlIHRoZXJlIGFyZSBub3QgdG9vIG1hbnkgaW50ZXJhY3Rpb25zIHRoYXQgdGhlIHVzZXIgY2FuIGRvIC0gdGhpcyBpcyBlc3NlbnRpYWxseSBob3cgbW9zdCBtaXRocmlsIGFwcHMgYXJlIHdyaXR0ZW4gLSBzZWxmLWNvbnRhaW5lZCwgYW5kIGF0IGEgc2luZ2xlIHVybC48L3A+XFxuPHA+SGVyZSBpcyBhICZxdW90O2hlbGxvIHdvcmxkJnF1b3Q7IGV4YW1wbGUgdXNpbmcgdGhlIHNpbmdsZSB1cmwgcGF0dGVybjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5zdWdhcnRhZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIC8vICAgIE91ciBtb2RlbFxcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IHNlbGYubW9kZWxzLmhlbGxvKHt3aG86ICZxdW90O3dvcmxkJnF1b3Q7fSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgdmFyIG1vZGVsID0gY3RybC5tb2RlbDtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0hlbGxvICZxdW90OyArIG1vZGVsLndobygpKVxcbiAgICAgICAgICAgIF07XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdvdWxkIGV4cG9zZSBhIHVybCAvaGVsbG9zIChub3RlOiB0aGUgJiMzOTtzJiMzOTspLCBhbmQgd291bGQgZGlzcGxheSAmcXVvdDtIZWxsbyB3b3JsZCZxdW90Oy4gKFlvdSBjYW4gY2hhbmdlIHRoZSByb3V0ZSB1c2luZyBjdXN0b20gcm91dGluZyk8L3A+XFxuPGgyPjxhIG5hbWU9XFxcIm11bHRpLXVybC1tdmNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtdWx0aS11cmwtbXZjXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk11bHRpIHVybCBtdmM8L3NwYW4+PC9hPjwvaDI+PHA+SW4gdGhpcyBwYXR0ZXJuIHdlIGV4cG9zZSBtdWx0aXBsZSBtdmMgcm91dGVzIHRoYXQgaW4gdHVybiB0cmFuc2xhdGUgdG8gbXVsdGlwbGUgVVJMcy4gVGhpcyBpcyB1c2VmdWwgZm9yIHNwbGl0dGluZyB1cCB5b3VyIGFwcCwgYW5kIGVuc3VyaW5nIGVhY2ggbXZjIGhhcyBpdHMgb3duIHNldHMgb2YgY29uY2VybnMuPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuc3VnYXJ0YWdzLm5vZGUuanMmIzM5OykobSk7XFxuXFxudmFyIGluZGV4ID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgLy8gICAgT3VyIG1vZGVsXFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnAoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmhlbGxvKHt3aG86ICZxdW90O3dvcmxkJnF1b3Q7fSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgdmFyIG1vZGVsID0gY3RybC5tb2RlbDtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0hlbGxvICZxdW90OyArIG1vZGVsLndobygpKSxcXG4gICAgICAgICAgICAgICAgQSh7aHJlZjogJnF1b3Q7L2hlbGxvL0xlbyZxdW90OywgY29uZmlnOiBtLnJvdXRlfSwgJnF1b3Q7Q2xpY2sgbWUgZm9yIHRoZSBlZGl0IGFjdGlvbiZxdW90OylcXG4gICAgICAgICAgICBdO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTtoZWxsb19pZCYjMzk7LCBwYXJhbXMpO1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgdmFyIG1vZGVsID0gY3RybC5tb2RlbDtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0hlbGxvICZxdW90OyArIG1vZGVsLndobygpKVxcbiAgICAgICAgICAgIF07XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5IZXJlIHdlIGFsc28gZXhwb3NlIGEgJnF1b3Q7L2hlbGxvL1tOQU1FXSZxdW90OyB1cmwsIHRoYXQgd2lsbCBzaG93IHlvdXIgbmFtZSB3aGVuIHlvdSB2aXNpdCAvaGVsbG8vW1lPVVIgTkFNRV0sIHNvIHRoZXJlIGFyZSBub3cgbXVsdGlwbGUgdXJscyBmb3Igb3VyIFNQQTo8L3A+XFxuPHVsPlxcbjxsaT48c3Ryb25nPi9oZWxsb3M8L3N0cm9uZz4gLSB0aGlzIGlzIGludGVuZGVkIHRvIGJlIGFuIGluZGV4IHBhZ2UgdGhhdCBsaXN0cyBhbGwgeW91ciAmcXVvdDtoZWxsb3MmcXVvdDs8L2xpPlxcbjxsaT48c3Ryb25nPi9oZWxsby9bTkFNRV08L3N0cm9uZz4gLSB0aGlzIGlzIGludGVuZGVkIHRvIGJlIGFuIGVkaXQgcGFnZSB3aGVyZSB5b3UgY2FuIGVkaXQgeW91ciAmcXVvdDtoZWxsb3MmcXVvdDs8L2xpPlxcbjwvdWw+XFxuPHA+Tm90ZSB0aGF0IHRoZSBhbmNob3IgdGFnIGhhcyA8Y29kZT5jb25maWc6IG0ucm91dGU8L2NvZGU+IGluIGl0JiMzOTtzIG9wdGlvbnMgLSB0aGlzIGlzIHNvIHRoYXQgd2UgY2FuIHJvdXRlIGF1dG9tYXRpY2FsbHkgdGhvdWdoIG1pdGhyaWw8L3A+XFxuXCJ9OyB9OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XG5cdHZhciBnZXRNb2RlbERhdGEgPSBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIGksIHJlc3VsdCA9IHt9O1xuXHRcdGZvcihpIGluIG1vZGVsKSB7aWYobW9kZWwuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdGlmKGkgIT09ICdpc1ZhbGlkJykge1xuXHRcdFx0XHRpZihpID09ICdpZCcpIHtcblx0XHRcdFx0XHRyZXN1bHRbJ19pZCddID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHJldHVybiB7XG4nZmluZCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2ZpbmQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NhdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9zYXZlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidyZW1vdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9yZW1vdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2F1dGhlbnRpY2F0ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2F1dGhlbnRpY2F0ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nbG9naW4nOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9sb2dpbicsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nbG9nb3V0JzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vbG9nb3V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidmaW5kVXNlcnMnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9maW5kVXNlcnMnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NhdmVVc2VyJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vc2F2ZVVzZXInLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59XG5cdH07XG59OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XG5cdHZhciBnZXRNb2RlbERhdGEgPSBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIGksIHJlc3VsdCA9IHt9O1xuXHRcdGZvcihpIGluIG1vZGVsKSB7aWYobW9kZWwuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdGlmKGkgIT09ICdpc1ZhbGlkJykge1xuXHRcdFx0XHRpZihpID09ICdpZCcpIHtcblx0XHRcdFx0XHRyZXN1bHRbJ19pZCddID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHJldHVybiB7XG4nZmluZCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvZmluZCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nc2F2ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvc2F2ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4ncmVtb3ZlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvZmxhdGZpbGVkYi9yZW1vdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2F1dGhlbnRpY2F0ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvYXV0aGVudGljYXRlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufVxuXHR9O1xufTsiLCIvKiBOT1RFOiBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUsIHBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LCB5b3VyIGNoYW5nZXMgd2lsbCBiZSBsb3N0ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG0pe1xuXHR2YXIgZ2V0TW9kZWxEYXRhID0gZnVuY3Rpb24obW9kZWwpe1xuXHRcdHZhciBpLCByZXN1bHQgPSB7fTtcblx0XHRmb3IoaSBpbiBtb2RlbCkge2lmKG1vZGVsLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRpZihpICE9PSAnaXNWYWxpZCcpIHtcblx0XHRcdFx0aWYoaSA9PSAnaWQnKSB7XG5cdFx0XHRcdFx0cmVzdWx0WydfaWQnXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdFtpXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fX1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHRyZXR1cm4ge1xuJ2dldCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL3Nlc3Npb24vZ2V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzZXQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9zZXNzaW9uL3NldCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn1cblx0fTtcbn07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL3ZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO3ZhciBzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pO3ZhciBiaW5kaW5ncyA9IHJlcXVpcmUoJ21pdGhyaWwuYmluZGluZ3MnKShtKTt2YXIgYW5pbWF0ZSA9IHJlcXVpcmUoJy4uL3B1YmxpYy9qcy9taXRocmlsLmFuaW1hdGUuanMnKShtKTt2YXIgcGVybWlzc2lvbnMgPSByZXF1aXJlKCcuLi9zeXN0ZW0vbWlzby5wZXJtaXNzaW9ucy5qcycpO3ZhciBsYXlvdXQgPSByZXF1aXJlKCcuLi9tdmMvbGF5b3V0X3BsYWluLmpzJyk7dmFyIHJlc3RyaWN0ID0gZnVuY3Rpb24ocm91dGUsIGFjdGlvbk5hbWUpe1x0cmV0dXJuIHJvdXRlO30scGVybWlzc2lvbk9iaiA9IHt9O3ZhciBtaXNvR2xvYmFsID0gbWlzb0dsb2JhbCB8fCB7fTt2YXIgdXNlciA9IHJlcXVpcmUoJy4uL212Yy91c2VyLmpzJyk7XG52YXIgaG9tZSA9IHJlcXVpcmUoJy4uL212Yy9ob21lLmpzJyk7XG52YXIgZG9jID0gcmVxdWlyZSgnLi4vbXZjL2RvYy5qcycpO1xuXG52YXIgaGVsbG8gPSByZXF1aXJlKCcuLi9tdmMvaGVsbG8uanMnKTtcbnZhciBsb2dpbiA9IHJlcXVpcmUoJy4uL212Yy9sb2dpbi5qcycpO1xudmFyIHRvZG8gPSByZXF1aXJlKCcuLi9tdmMvdG9kby5qcycpO1xuXG5pZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1x0d2luZG93Lm0gPSBtO31cdG0ucm91dGUubW9kZSA9ICdwYXRobmFtZSc7bS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzb0F0dGFjaG1lbnROb2RlJyksICcvJywgeycvdXNlcnMvbmV3JzogcmVzdHJpY3QodXNlci5uZXcsICd1c2VyLm5ldycpLFxuJy8nOiByZXN0cmljdChob21lLmluZGV4LCAnaG9tZS5pbmRleCcpLFxuJy9kb2MvOmRvY19pZCc6IHJlc3RyaWN0KGRvYy5lZGl0LCAnZG9jLmVkaXQnKSxcbicvZG9jcyc6IHJlc3RyaWN0KGRvYy5pbmRleCwgJ2RvYy5pbmRleCcpLFxuJy9oZWxsby86aGVsbG9faWQnOiByZXN0cmljdChoZWxsby5lZGl0LCAnaGVsbG8uZWRpdCcpLFxuJy9sb2dpbic6IHJlc3RyaWN0KGxvZ2luLmluZGV4LCAnbG9naW4uaW5kZXgnKSxcbicvdG9kb3MnOiByZXN0cmljdCh0b2RvLmluZGV4LCAndG9kby5pbmRleCcpLFxuJy91c2VyLzp1c2VyX2lkJzogcmVzdHJpY3QodXNlci5lZGl0LCAndXNlci5lZGl0JyksXG4nL3VzZXJzJzogcmVzdHJpY3QodXNlci5pbmRleCwgJ3VzZXIuaW5kZXgnKX0pO21pc29HbG9iYWwucmVuZGVySGVhZGVyID0gZnVuY3Rpb24ob2JqKXtcdHZhciBoZWFkZXJOb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc29IZWFkZXJOb2RlJyk7XHRpZihoZWFkZXJOb2RlKXtcdFx0bS5yZW5kZXIoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc29IZWFkZXJOb2RlJyksIGxheW91dC5oZWFkZXJDb250ZW50PyBsYXlvdXQuaGVhZGVyQ29udGVudCh7bWlzb0dsb2JhbDogb2JqIHx8IG1pc29HbG9iYWx9KTogJycpO1x0fX07bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIoKTsiLCIvKlx0bWlzbyBwZXJtaXNzaW9uc1xuXHRQZXJtaXQgdXNlcnMgYWNjZXNzIHRvIGNvbnRyb2xsZXIgYWN0aW9ucyBiYXNlZCBvbiByb2xlcyBcbiovXG52YXIgbWlzbyA9IHJlcXVpcmUoXCIuLi9tb2R1bGVzL21pc28udXRpbC5jbGllbnQuanNcIiksXG5cdGhhc1JvbGUgPSBmdW5jdGlvbih1c2VyUm9sZXMsIHJvbGVzKXtcblx0XHR2YXIgaGFzUm9sZSA9IGZhbHNlO1xuXHRcdC8vXHRBbGwgcm9sZXNcblx0XHRpZih1c2VyUm9sZXMgPT0gXCIqXCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHQvL1x0U2VhcmNoIGVhY2ggdXNlciByb2xlXG5cdFx0bWlzby5lYWNoKHVzZXJSb2xlcywgZnVuY3Rpb24odXNlclJvbGUpe1xuXHRcdFx0dXNlclJvbGUgPSAodHlwZW9mIHVzZXJSb2xlICE9PSBcInN0cmluZ1wiKT8gdXNlclJvbGU6IFt1c2VyUm9sZV07XG5cdFx0XHQvL1x0U2VhcmNoIGVhY2ggcm9sZVxuXHRcdFx0bWlzby5lYWNoKHJvbGVzLCBmdW5jdGlvbihyb2xlKXtcblx0XHRcdFx0aWYodXNlclJvbGUgPT0gcm9sZSkge1xuXHRcdFx0XHRcdGhhc1JvbGUgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGhhc1JvbGU7XG5cdH07XG5cbi8vXHREZXRlcm1pbmUgaWYgdGhlIHVzZXIgaGFzIGFjY2VzcyB0byBhbiBBUFAgYWN0aW9uXG4vL1x0VE9ETzogXG5tb2R1bGUuZXhwb3J0cy5hcHAgPSBmdW5jdGlvbihwZXJtaXNzaW9ucywgYWN0aW9uTmFtZSwgdXNlclJvbGVzKXtcblx0Ly9cdFRPRE86IFByb2JhYmx5IG5lZWQgdG8gdXNlIHBhc3M9ZmFsc2UgYnkgZGVmYXVsdCwgYnV0IGZpcnN0OlxuXHQvL1xuXHQvL1x0KiBBZGQgZ2xvYmFsIGNvbmZpZyBmb3IgcGFzcyBkZWZhdWx0IGluIHNlcnZlci5qc29uXG5cdC8vXHQqIFxuXHQvL1xuXHR2YXIgcGFzcyA9IHRydWU7XG5cblx0Ly9cdEFwcGx5IGRlbnkgZmlyc3QsIHRoZW4gYWxsb3cuXG5cdGlmKHBlcm1pc3Npb25zICYmIHVzZXJSb2xlcyl7XG5cdFx0aWYocGVybWlzc2lvbnMuZGVueSkge1xuXHRcdFx0cGFzcyA9ICEgaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5kZW55KTtcblx0XHR9XG5cdFx0aWYocGVybWlzc2lvbnMuYWxsb3cpIHtcblx0XHRcdHBhc3MgPSBoYXNSb2xlKHVzZXIucm9sZXMsIHBlcm1pc3Npb25zLmFsbG93KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcGFzcztcbn07XG5cblxuLy9cdERldGVybWluZSBpZiB0aGUgdXNlciBoYXMgYWNjZXNzIHRvIGFuIEFQSSBhY3Rpb25cbi8vXHRUT0RPOiBcbm1vZHVsZS5leHBvcnRzLmFwaSA9IGZ1bmN0aW9uKHBlcm1pc3Npb25zLCBhY3Rpb25OYW1lLCB1c2VyUm9sZXMpe1xuXHQvL1x0VE9ETzogUHJvYmFibHkgbmVlZCB0byB1c2UgcGFzcz1mYWxzZSBieSBkZWZhdWx0LCBidXQgZmlyc3Q6XG5cdC8vXG5cdC8vXHQqIEFkZCBnbG9iYWwgY29uZmlnIGZvciBwYXNzIGRlZmF1bHQgaW4gc2VydmVyLmpzb25cblx0Ly9cdCogXG5cdC8vXG5cdHZhciBwYXNzID0gdHJ1ZTtcblxuXHQvL1x0QXBwbHkgZGVueSBmaXJzdCwgdGhlbiBhbGxvdy5cblx0aWYocGVybWlzc2lvbnMgJiYgdXNlclJvbGVzKXtcblx0XHRpZihwZXJtaXNzaW9ucy5kZW55KSB7XG5cdFx0XHRwYXNzID0gISBoYXNSb2xlKHVzZXIucm9sZXMsIHBlcm1pc3Npb25zLmRlbnkpO1xuXHRcdH1cblx0XHRpZihwZXJtaXNzaW9ucy5hbGxvdykge1xuXHRcdFx0cGFzcyA9IGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuYWxsb3cpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBwYXNzO1xufTsiXX0=
