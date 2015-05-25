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
/*	Miso layout page

	This layout determines the HTML surround for each of your mvc routes.
	Feel free to modify as you see fit - as long as the attachemnt node is 
	present, it should work.

	Note: this is the only mvc that does not require a controller.
*/
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	authentication = require("../system/api/authentication/api.client.js")(m);

//	The header - this can also be rendered client side
module.exports.headerContent = function(ctrl){
	with(sugartags) {
		return DIV({"class": 'cw cf'}, [
			DIV({"class": 'logo'},
				A({alt: 'MISO', href:'/', config: m.route}, [
					IMG({src: '/img/miso_logo.png'})
				])
			),
			NAV({"class": "left"}, UL([
				LI(A({href: "http://misojs.com/docs", target: "_blank"}, "Documentation"))
			])),
			NAV({"class": "right"}, UL([
				LI(A({href: "https://github.com/jsguy/misojs", target: "_blank"}, "Github")),
				//	This link could go to an account 
				//	page or something like that

				(ctrl.misoGlobal.authenticationEnabled?
					(ctrl.misoGlobal.isLoggedIn && ctrl.misoGlobal.userName? 
						LI(A({onclick: function(e){
								console.log('logging out, please wait...');
								authentication.logout({}).then(function(data){
									console.log("You've been logged out");
									m.route("/login");
								});

								e.preventDefault();
								return false;
							}, href: "#", id: "misoUserName"},
							"Logout " + ctrl.misoGlobal.userName)
						):
						LI(A({href: "/login"}, "Login"))
					): 
					""
				)

			]))
		]);
	}
};

//	The full layout - always only rendered server side
module.exports.view = function(ctrl){
	with(sugartags) {
		return [
			m.trust("<!doctype html>"),
			HTML([
				HEAD([
					LINK({href: '/css/style.css', rel:'stylesheet'}),
					//	Add in the misoGlobal object...
					SCRIPT("var misoGlobal = "+(ctrl.misoGlobal? JSON.stringify(ctrl.misoGlobal): {})+";")
				]),
				BODY({"class": 'fixed-header' }, [
					HEADER({id: "misoHeaderNode"}, ctrl.headerContent(ctrl)),
					SECTION({id: ctrl.misoAttachmentNode}, ctrl.content),
					SECTION({id: "loader"}, [
						DIV({"class": "loader"})
					]),
					SECTION({id: "footer"}, [
						DIV({"class": 'cw cf'}, m.trust("Copyright &copy; 2015 jsguy"))
					]),
					//SCRIPT({src: '/miso.js' + (ctrl.reload? "?cacheKey=" + (new Date()).getTime(): "")}),
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
	var noop = function() {}

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
		var hasAttrs = args[1] != null && type.call(args[1]) === OBJECT && !("tag" in args[1] || "view" in args[1]) && !("subtree" in args[1]);
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

		var children = hasAttrs ? args.slice(2) : args.slice(1);
		if (children.length === 1 && type.call(children[0]) === ARRAY) {
			cell.children = children[0]
		}
		else {
			cell.children = children
		}
		
		for (var attrName in attrs) {
			if (attrs.hasOwnProperty(attrName)) {
				if (attrName === classAttrName && attrs[attrName] != null && attrs[attrName] !== "") {
					classes.push(attrs[attrName])
					cell.attrs[attrName] = "" //create key in correct iteration order
				}
				else cell.attrs[attrName] = attrs[attrName]
			}
		}
		if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ");
		
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
		//data.toString() might throw or return null if data is the return value of Console.log in Firefox (behavior depends on version)
		try {if (data == null || data.toString() == null) data = "";} catch (e) {data = ""}
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
					len = data.length
				}
			}
			
			var nodes = [], intact = cached.length === data.length, subArrayCount = 0;

			//keys algorithm: sort elements without recreating them if keys are present
			//1) create a map of all existing keys, and mark all for deletion
			//2) add new keys to map and mark them for addition
			//3) if key exists in new list, change action from deletion to a move
			//4) for each key, handle its corresponding action as marked in previous steps
			var DELETION = 1, INSERTION = 2 , MOVE = 3;
			var existing = {}, shouldMaintainIdentities = false;
			for (var i = 0; i < cached.length; i++) {
				if (cached[i] && cached[i].attrs && cached[i].attrs.key != null) {
					shouldMaintainIdentities = true;
					existing[cached[i].attrs.key] = {action: DELETION, index: i}
				}
			}
			
			var guid = 0
			for (var i = 0, len = data.length; i < len; i++) {
				if (data[i] && data[i].attrs && data[i].attrs.key != null) {
					for (var j = 0, len = data.length; j < len; j++) {
						if (data[j] && data[j].attrs && data[j].attrs.key == null) data[j].attrs.key = "__mithril__" + guid++
					}
					break
				}
			}
			
			if (shouldMaintainIdentities) {
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
						}
					}
					var actions = []
					for (var prop in existing) actions.push(existing[prop])
					var changes = actions.sort(sortChanges);
					var newCached = new Array(cached.length)
					newCached.nodes = cached.nodes.slice()

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
							newCached.nodes[change.index] = dummy
						}

						if (change.action === MOVE) {
							if (parentElement.childNodes[change.index] !== change.element && change.element !== null) {
								parentElement.insertBefore(change.element, parentElement.childNodes[change.index] || null)
							}
							newCached[change.index] = cached[change.from]
							newCached.nodes[change.index] = change.element
						}
					}
					cached = newCached;
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
					subArrayCount += (item.match(/<[^\/]|\>\s*[^<]/g) || [0]).length
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
			var views = [], controllers = []
			while (data.view) {
				var view = data.view.$original || data.view
				var controllerIndex = m.redraw.strategy() == "diff" && cached.views ? cached.views.indexOf(view) : -1
				var controller = controllerIndex > -1 ? cached.controllers[controllerIndex] : new (data.controller || noop)
				var key = data && data.attrs && data.attrs.key
				data = pendingRequests == 0 || (cached && cached.controllers && cached.controllers.indexOf(controller) > -1) ? data.view(controller) : {tag: "placeholder"}
				if (data.subtree === "retain") return cached;
				if (key) {
					if (!data.attrs) data.attrs = {}
					data.attrs.key = key
				}
				if (controller.onunload) unloaders.push({controller: controller, handler: controller.onunload})
				views.push(view)
				controllers.push(controller)
			}
			if (!data.tag && controllers.length) throw new Error("Component template must return a virtual element, not an array, string, etc.")
			if (!data.attrs) data.attrs = {};
			if (!cached.attrs) cached.attrs = {};

			var dataAttrKeys = Object.keys(data.attrs)
			var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0)
			//if an element is different enough from the one in cache, recreate it
			if (data.tag != cached.tag || dataAttrKeys.sort().join() != Object.keys(cached.attrs).sort().join() || data.attrs.id != cached.attrs.id || data.attrs.key != cached.attrs.key || (m.redraw.strategy() == "all" && (!cached.configContext || cached.configContext.retain !== true)) || (m.redraw.strategy() == "diff" && cached.configContext && cached.configContext.retain === false)) {
				if (cached.nodes.length) clear(cached.nodes);
				if (cached.configContext && typeof cached.configContext.onunload === FUNCTION) cached.configContext.onunload()
				if (cached.controllers) {
					for (var i = 0, controller; controller = cached.controllers[i]; i++) {
						if (typeof controller.onunload === FUNCTION) controller.onunload({preventDefault: noop})
					}
				}
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
				if (controllers.length) {
					cached.views = views
					cached.controllers = controllers
					for (var i = 0, controller; controller = controllers[i]; i++) {
						if (controller.onunload && controller.onunload.$old) controller.onunload = controller.onunload.$old
						if (pendingRequests && controller.onunload) {
							var onunload = controller.onunload
							controller.onunload = noop
							controller.onunload.$old = onunload
						}
					}
				}
				
				if (cached.children && !cached.children.nodes) cached.children.nodes = [];
				//edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
				if (data.tag === "select" && "value" in data.attrs) setAttributes(node, data.tag, {value: data.attrs.value}, {}, namespace);
				parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			else {
				node = cached.nodes[0];
				if (hasKeys) setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
				cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs);
				cached.nodes.intact = true;
				if (controllers.length) {
					cached.views = views
					cached.controllers = controllers
				}
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
		else if (typeof data != FUNCTION) {
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
					else if (attrName in node && !(attrName === "list" || attrName === "style" || attrName === "form" || attrName === "type" || attrName === "width" || attrName === "height")) {
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
		if (cached.configContext && typeof cached.configContext.onunload === FUNCTION) {
			cached.configContext.onunload();
			cached.configContext.onunload = null
		}
		if (cached.controllers) {
			for (var i = 0, controller; controller = cached.controllers[i]; i++) {
				if (typeof controller.onunload === FUNCTION) controller.onunload({preventDefault: noop});
			}
		}
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
		if (!root) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.");
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

	var roots = [], components = [], controllers = [], lastRedrawId = null, lastRedrawCallTime = 0, computePreRedrawHook = null, computePostRedrawHook = null, prevented = false, topComponent, unloaders = [];
	var FRAME_BUDGET = 16; //60 frames per second = 1 call per 16 ms
	function parameterize(component, args) {
		var controller = function() {
			return (component.controller || noop).apply(this, args) || this
		}
		var view = function(ctrl) {
			if (arguments.length > 1) args = args.concat([].slice.call(arguments, 1))
			return component.view.apply(component, args ? [ctrl].concat(args) : [ctrl])
		}
		view.$original = component.view
		var output = {controller: controller, view: view}
		if (args[0] && args[0].key != null) output.attrs = {key: args[0].key}
		return output
	}
	m.component = function(component) {
		return parameterize(component, [].slice.call(arguments, 1))
	}
	m.mount = m.module = function(root, component) {
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
		var index = roots.indexOf(root);
		if (index < 0) index = roots.length;
		
		var isPrevented = false;
		var event = {preventDefault: function() {
			isPrevented = true;
			computePreRedrawHook = computePostRedrawHook = null;
		}};
		for (var i = 0, unloader; unloader = unloaders[i]; i++) {
			unloader.handler.call(unloader.controller, event)
			unloader.controller.onunload = null
		}
		if (isPrevented) {
			for (var i = 0, unloader; unloader = unloaders[i]; i++) unloader.controller.onunload = unloader.handler
		}
		else unloaders = []
		
		if (controllers[index] && typeof controllers[index].onunload === FUNCTION) {
			controllers[index].onunload(event)
		}
		
		if (!isPrevented) {
			m.redraw.strategy("all");
			m.startComputation();
			roots[index] = root;
			if (arguments.length > 2) component = subcomponent(component, [].slice.call(arguments, 2))
			var currentComponent = topComponent = component = component || {controller: function() {}};
			var constructor = component.controller || noop
			var controller = new constructor;
			//controllers may call m.mount recursively (via m.route redirects, for example)
			//this conditional ensures only the last recursive m.mount call is applied
			if (currentComponent === topComponent) {
				controllers[index] = controller;
				components[index] = component
			}
			endFirstComputation();
			return controllers[index]
		}
	};
	var redrawing = false
	m.redraw = function(force) {
		if (redrawing) return
		redrawing = true
		//lastRedrawId is a positive number if a second redraw is requested before the next animation frame
		//lastRedrawID is null if it's the first redraw and not an event handler
		if (lastRedrawId && force !== true) {
			//when setTimeout: only reschedule redraw if time between now and previous redraw is bigger than a frame, otherwise keep currently scheduled timeout
			//when rAF: always reschedule redraw
			if ($requestAnimationFrame === window.requestAnimationFrame || new Date - lastRedrawCallTime > FRAME_BUDGET) {
				if (lastRedrawId > 0) $cancelAnimationFrame(lastRedrawId);
				lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET)
			}
		}
		else {
			redraw();
			lastRedrawId = $requestAnimationFrame(function() {lastRedrawId = null}, FRAME_BUDGET)
		}
		redrawing = false
	};
	m.redraw.strategy = m.prop();
	function redraw() {
		if (computePreRedrawHook) {
			computePreRedrawHook()
			computePreRedrawHook = null
		}
		for (var i = 0, root; root = roots[i]; i++) {
			if (controllers[i]) {
				var args = components[i].controller && components[i].controller.$$args ? [controllers[i]].concat(components[i].controller.$$args) : [controllers[i]]
				m.render(root, components[i].view ? components[i].view(controllers[i], args) : "")
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
	var redirect = noop, routeParams, currentRoute, isDefaultRoute = false;
	m.route = function() {
		//m.route()
		if (arguments.length === 0) return currentRoute;
		//m.route(el, defaultRoute, routes)
		else if (arguments.length === 3 && type.call(arguments[1]) === STRING) {
			var root = arguments[0], defaultRoute = arguments[1], router = arguments[2];
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source);
				if (!routeByValue(root, router, path)) {
					if (isDefaultRoute) throw new Error("Ensure the default route matches one of the routes defined in m.route")
					isDefaultRoute = true
					m.route(defaultRoute, true)
					isDefaultRoute = false
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
			computePreRedrawHook = setScroll;
			window[listener]()
		}
		//config: m.route
		else if (arguments[0].addEventListener || arguments[0].attachEvent) {
			var element = arguments[0];
			var isInitialized = arguments[1];
			var context = arguments[2];
			var vdom = arguments[3];
			element.href = (m.route.mode !== 'pathname' ? $location.pathname : '') + modes[m.route.mode] + vdom.attrs.href;
			if (element.addEventListener) {
				element.removeEventListener("click", routeUnobtrusive);
				element.addEventListener("click", routeUnobtrusive)
			}
			else {
				element.detachEvent("onclick", routeUnobtrusive);
				element.attachEvent("onclick", routeUnobtrusive)
			}
		}
		//m.route(route, params, shouldReplaceHistoryEntry)
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
				computePreRedrawHook = setScroll
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, $document.title, modes[m.route.mode] + currentRoute);
				};
				redirect(modes[m.route.mode] + currentRoute)
			}
			else {
				$location[m.route.mode] = currentRoute
				redirect(modes[m.route.mode] + currentRoute)
			}
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

		// Get all routes and check if there's
		// an exact match for the current path
		var keys = Object.keys(router);
		var index = keys.indexOf(path);
		if(index !== -1){
			m.mount(root, router[keys [index]]);
			return true;
		}

		for (var route in router) {
			if (route === path) {
				m.mount(root, router[route]);
				return true
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

			if (matcher.test(path)) {
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || [];
					var values = [].slice.call(arguments, 1, -2);
					for (var i = 0, len = keys.length; i < len; i++) routeParams[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
					m.mount(root, router[route])
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
		var currentTarget = e.currentTarget || e.srcElement;
		var args = m.route.mode === "pathname" && currentTarget.search ? parseQueryString(currentTarget.search.slice(1)) : {};
		while (currentTarget && currentTarget.nodeName.toUpperCase() != "A") currentTarget = currentTarget.parentNode
		m.route(currentTarget[m.route.mode].slice(modes[m.route.mode].length), args)
	}
	function setScroll() {
		if (m.route.mode != "hash" && $location.hash) $location.hash = $location.hash;
		else window.scrollTo(0, 0)
	}
	function buildQueryString(object, prefix) {
		var duplicates = {}
		var str = []
		for (var prop in object) {
			var key = prefix ? prefix + "[" + prop + "]" : prop
			var value = object[prop]
			var valueType = type.call(value)
			var pair = (value === null) ? encodeURIComponent(key) :
				valueType === OBJECT ? buildQueryString(value, key) :
				valueType === ARRAY ? value.reduce(function(memo, item) {
					if (!duplicates[key]) duplicates[key] = {}
					if (!duplicates[key][item]) {
						duplicates[key][item] = true
						return memo.concat(encodeURIComponent(key) + "=" + encodeURIComponent(item))
					}
					return memo
				}, []).join("&") :
				encodeURIComponent(key) + "=" + encodeURIComponent(value)
			if (value !== undefined) str.push(pair)
		}
		return str.join("&")
	}
	function parseQueryString(str) {
		if (str.charAt(0) === "?") str = str.substring(1);
		
		var pairs = str.split("&"), params = {};
		for (var i = 0, len = pairs.length; i < len; i++) {
			var pair = pairs[i].split("=");
			var key = decodeURIComponent(pair[0])
			var value = pair.length == 2 ? decodeURIComponent(pair[1]) : null
			if (params[key] != null) {
				if (type.call(params[key]) !== ARRAY) params[key] = [params[key]]
				params[key].push(value)
			}
			else params[key] = value
		}
		return params
	}
	m.route.buildQueryString = buildQueryString
	m.route.parseQueryString = parseQueryString
	
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
	function propify(promise, initialValue) {
		var prop = m.prop(initialValue);
		promise.then(prop);
		prop.then = function(resolve, reject) {
			return propify(promise.then(resolve, reject), initialValue)
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
		var deferred = new Deferred();
		var isJSONP = xhrOptions.dataType && xhrOptions.dataType.toLowerCase() === "jsonp";
		var serialize = xhrOptions.serialize = isJSONP ? identity : xhrOptions.serialize || JSON.stringify;
		var deserialize = xhrOptions.deserialize = isJSONP ? identity : xhrOptions.deserialize || JSON.parse;
		var extract = isJSONP ? function(jsonp) {return jsonp.responseText} : xhrOptions.extract || function(xhr) {
			return xhr.responseText.length === 0 && deserialize === JSON.parse ? null : xhr.responseText
		};
		xhrOptions.method = (xhrOptions.method || 'GET').toUpperCase();
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data);
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize);
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event;
				var unwrap = (e.type === "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity;
				var response = unwrap(deserialize(extract(e.target, xhrOptions)), e.target);
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
		deferred.promise = propify(deferred.promise, xhrOptions.initialValue);
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
 * Copyright (c) 2015 Chris O'Hara <cohara87@gmail.com>
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

    validator = { version: '3.40.0' };

    var emailUser = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e])|(\\[\x01-\x09\x0b\x0c\x0d-\x7f])))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))$/i;

    var emailUserUtf8 = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))$/i;

    var displayName = /^(?:[a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~\.]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(?:[a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~\.]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\s)*<(.+)>$/i;

    var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;

    var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;

    var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/
      , isbn13Maybe = /^(?:[0-9]{13})$/;

    var ipv4Maybe = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
      , ipv6Block = /^[0-9A-F]{1,4}$/i;

    var uuid = {
        '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i
      , '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      , '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      , all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    };

    var alpha = /^[A-Z]+$/i
      , alphanumeric = /^[0-9A-Z]+$/i
      , numeric = /^[-+]?[0-9]+$/
      , int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/
      , float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/
      , hexadecimal = /^[0-9A-F]+$/i
      , hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;

    var ascii = /^[\x00-\x7F]+$/
      , multibyte = /[^\x00-\x7F]/
      , fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/
      , halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

    var base64 = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;

    var phones = {
      'zh-CN': /^(\+?0?86\-?)?1[345789]\d{9}$/,
      'en-ZA': /^(\+?27|0)\d{9}$/,
      'en-AU': /^(\+?61|0)4\d{8}$/,
      'en-HK': /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
      'fr-FR': /^(\+?33|0)[67]\d{8}$/,
      'pt-PT': /^(\+351)?9[1236]\d{7}$/,
      'el-GR': /^(\+30)?((2\d{9})|(69\d{8}))$/,
      'en-GB': /^(\+?44|0)7\d{9}$/,
      'en-US': /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
      'en-ZM': /^(\+26)?09[567]\d{7}$/
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
        allow_display_name: false,
        allow_utf8_local_part: true,
        require_tld: true
    };

    validator.isEmail = function (str, options) {
        options = merge(options, default_email_options);

        if (options.allow_display_name) {
            var display_email = str.match(displayName);
            if (display_email) {
                str = display_email[1];
            }
        } else if (/\s/.test(str)) {
            return false;
        }

        var parts = str.split('@')
          , domain = parts.pop()
          , user = parts.join('@');

        if (!validator.isFQDN(domain, {require_tld: options.require_tld})) {
            return false;
        }

        return options.allow_utf8_local_part ?
            emailUserUtf8.test(user) :
            emailUser.test(user);
    };

    var default_url_options = {
        protocols: [ 'http', 'https', 'ftp' ]
      , require_tld: true
      , require_protocol: false
      , allow_underscores: false
      , allow_trailing_dot: false
      , allow_protocol_relative_urls: false
    };

    validator.isURL = function (url, options) {
        if (!url || url.length >= 2083 || /\s/.test(url)) {
            return false;
        }
        if (url.indexOf('mailto:') === 0) {
            return false;
        }
        options = merge(options, default_url_options);
        var protocol, auth, host, hostname, port,
            port_str, split;
        split = url.split('://');
        if (split.length > 1) {
            protocol = split.shift();
            if (options.protocols.indexOf(protocol) === -1) {
                return false;
            }
        } else if (options.require_protocol) {
            return false;
        }  else if (options.allow_protocol_relative_urls && url.substr(0, 2) === '//') {
            split[0] = url.substr(2);
        }
        url = split.join('://');
        split = url.split('#');
        url = split.shift();

        split = url.split('?');
        url = split.shift();

        split = url.split('/');
        url = split.shift();
        split = url.split('@');
        if (split.length > 1) {
            auth = split.shift();
            if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
                return false;
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
        } else if (version === '6') {
            var blocks = str.split(':');
            var foundOmissionBlock = false; // marker to indicate ::

            if (blocks.length > 8)
                return false;

            // initial or final ::
            if (str === '::') {
                return true;
            } else if (str.substr(0, 2) === '::') {
                blocks.shift();
                blocks.shift();
                foundOmissionBlock = true;
            } else if (str.substr(str.length - 2) === '::') {
                blocks.pop();
                blocks.pop();
                foundOmissionBlock = true;
            }

            for (var i = 0; i < blocks.length; ++i) {
                // test for a :: which can not be at the string start/end
                // since those cases have been handled above
                if (blocks[i] === '' && i > 0 && i < blocks.length -1) {
                    if (foundOmissionBlock)
                        return false; // multiple :: in address
                    foundOmissionBlock = true;
                } else if (!ipv6Block.test(blocks[i])) {
                    return false;
                }
            }

            if (foundOmissionBlock) {
                return blocks.length >= 1;
            } else {
                return blocks.length === 8;
            }
        }
        return false;
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

    validator.isBoolean = function(str) {
        return (['true', 'false', '1', '0'].indexOf(str) >= 0);
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

    validator.isInt = function (str, options) {
        options = options || {};
        return int.test(str) && (!options.hasOwnProperty('min') || str >= options.min) && (!options.hasOwnProperty('max') || str <= options.max);
    };

    validator.isFloat = function (str, options) {
        options = options || {};
        return str !== '' && float.test(str) && (!options.hasOwnProperty('min') || str >= options.min) && (!options.hasOwnProperty('max') || str <= options.max);
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

    validator.isISIN = function (str) {
        if (!isin.test(str)) {
            return false;
        }

        var checksumStr = str.replace(/[A-Z]/g, function(character) {
            return parseInt(character, 36);
        });

        var sum = 0, digit, tmpNum, shouldDouble = true;
        for (var i = checksumStr.length - 2; i >= 0; i--) {
            digit = checksumStr.substring(i, (i + 1));
            tmpNum = parseInt(digit, 10);
            if (shouldDouble) {
                tmpNum *= 2;
                if (tmpNum >= 10) {
                    sum += tmpNum + 1;
                } else {
                    sum += tmpNum;
                }
            } else {
                sum += tmpNum;
            }
            shouldDouble = !shouldDouble;
        }

        return parseInt(str.substr(str.length - 1), 10) === (10000 - sum) % 10;
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

    var default_currency_options = {
        symbol: '$'
      , require_symbol: false
      , allow_space_after_symbol: false
      , symbol_after_digits: false
      , allow_negatives: true
      , parens_for_negatives: false
      , negative_sign_before_digits: false
      , negative_sign_after_digits: false
      , allow_negative_sign_placeholder: false
      , thousands_separator: ','
      , decimal_separator: '.'
      , allow_space_after_digits: false
    };

    validator.isCurrency = function (str, options) {
        options = merge(options, default_currency_options);

        return currencyRegex(options).test(str);
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
            .replace(/\//g, '&#x2F;')
            .replace(/\`/g, '&#96;'));
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

    function currencyRegex(options) {
        var symbol = '(\\' + options.symbol.replace(/\./g, '\\.') + ')' + (options.require_symbol ? '' : '?')
            , negative = '-?'
            , whole_dollar_amount_without_sep = '[1-9]\\d*'
            , whole_dollar_amount_with_sep = '[1-9]\\d{0,2}(\\' + options.thousands_separator + '\\d{3})*'
            , valid_whole_dollar_amounts = ['0', whole_dollar_amount_without_sep, whole_dollar_amount_with_sep]
            , whole_dollar_amount = '(' + valid_whole_dollar_amounts.join('|') + ')?'
            , decimal_amount = '(\\' + options.decimal_separator + '\\d{2})?';
        var pattern = whole_dollar_amount + decimal_amount;
        // default is negative sign before symbol, but there are two other options (besides parens)
        if (options.allow_negatives && !options.parens_for_negatives) {
            if (options.negative_sign_after_digits) {
                pattern += negative;
            }
            else if (options.negative_sign_before_digits) {
                pattern = negative + pattern;
            }
        }
        // South African Rand, for example, uses R 123 (space) and R-123 (no space)
        if (options.allow_negative_sign_placeholder) {
            pattern = '( (?!\\-))?' + pattern;
        }
        else if (options.allow_space_after_symbol) {
            pattern = ' ?' + pattern;
        }
        else if (options.allow_space_after_digits) {
            pattern += '( (?!$))?';
        }
        if (options.symbol_after_digits) {
            pattern += symbol;
        } else {
            pattern = symbol + pattern;
        }
        if (options.allow_negatives) {
            if (options.parens_for_negatives) {
                pattern = '(\\(' + pattern + '\\)|' + pattern + ')';
            }
            else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
                pattern = negative + pattern;
            }
        }
        return new RegExp(
            '^' +
            // ensure there's a dollar and/or decimal amount, and that it doesn't start with a space or a negative sign followed by a space
            '(?!-? )(?=.*\\d)' +
            pattern +
            '$'
        );
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
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */var m = require('mithril');var sugartags = require('mithril.sugartags')(m);var bindings = require('mithril.bindings')(m);var animate = require('../public/js/mithril.animate.js')(m);var permissions = require('../system/miso.permissions.js');var layout = require('../mvc/layout.js');var restrict = function(route, actionName){	return route;};var permissionObj = {};var user = require('../mvc/user.js');
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
'/users': restrict(user.index, 'user.index')});misoGlobal.renderHeader = function(obj){	m.render(document.getElementById('misoHeaderNode'), layout.headerContent({misoGlobal: obj || misoGlobal}));};misoGlobal.renderHeader();
},{"../mvc/doc.js":2,"../mvc/hello.js":3,"../mvc/home.js":4,"../mvc/layout.js":5,"../mvc/login.js":6,"../mvc/todo.js":7,"../mvc/user.js":8,"../public/js/mithril.animate.js":14,"../system/miso.permissions.js":21,"mithril":11,"mithril.bindings":9,"mithril.sugartags":10}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL21pc28udXRpbC5jbGllbnQuanMiLCJtdmMvZG9jLmpzIiwibXZjL2hlbGxvLmpzIiwibXZjL2hvbWUuanMiLCJtdmMvbGF5b3V0LmpzIiwibXZjL2xvZ2luLmpzIiwibXZjL3RvZG8uanMiLCJtdmMvdXNlci5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsLmJpbmRpbmdzL2Rpc3QvbWl0aHJpbC5iaW5kaW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsLnN1Z2FydGFncy9taXRocmlsLnN1Z2FydGFncy5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCJub2RlX21vZHVsZXMvdmFsaWRhdG9yLm1vZGVsYmluZGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3ZhbGlkYXRvci92YWxpZGF0b3IuanMiLCJwdWJsaWMvanMvbWl0aHJpbC5hbmltYXRlLmpzIiwicHVibGljL2pzL21pdGhyaWwuc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL21pc28uZG9jdW1lbnRhdGlvbi5qcyIsInN5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qcyIsInN5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuY2xpZW50LmpzIiwic3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5jbGllbnQuanMiLCJzeXN0ZW0vbWFpbi5qcyIsInN5c3RlbS9taXNvLnBlcm1pc3Npb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNodUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cdFZhcmlvdXMgdXRpbGl0aWVzIHRoYXQgbm9ybWFsaXNlIHVzYWdlIGJldHdlZW4gY2xpZW50IGFuZCBzZXJ2ZXJcbi8vXHRUaGlzIGlzIHRoZSBjbGllbnQgdmVyc2lvbiAtIHNlZSBtaXNvLnV0aWwuanMgZm9yIHNlcnZlciB2ZXJzaW9uXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdC8vXHRBcmUgd2Ugb24gdGhlIHNlcnZlcj9cblx0aXNTZXJ2ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0XG5cdC8vXHRFYWNoIGFic3RyYWN0aW9uXG5cdC8vXHRcblx0Ly9cdG1pc28uZWFjaChbJ2hlbGxvJywgJ3dvcmxkJ10sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuXHQvL1x0XHRjb25zb2xlLmxvZyh2YWx1ZSwga2V5KTtcblx0Ly9cdH0pO1xuXHQvL1x0Ly9cdGhlbGxvIDBcXG5oZWxsbyAxXG5cdC8vXG5cdC8vIFx0bWlzby5lYWNoKHsnaGVsbG8nOiAnd29ybGQnfSwgZnVuY3Rpb24odmFsdWUsIGtleSl7XG5cdC8vXHRcdGNvbnNvbGUubG9nKHZhbHVlLCBrZXkpO1xuXHQvL1x0fSk7XG5cdC8vXHQvL1x0d29ybGQgaGVsbG9cblx0Ly9cblx0ZWFjaDogZnVuY3Rpb24ob2JqLCBmbikge1xuXHRcdGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nICkge1xuXHRcdFx0cmV0dXJuIG9iai5tYXAoZm4pO1xuXHRcdH0gZWxzZSBpZih0eXBlb2Ygb2JqID09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXtcblx0XHRcdFx0cmV0dXJuIGZuKG9ialtrZXldLCBrZXkpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmbihvYmopO1xuXHRcdH1cblx0fSxcblxuXHRyZWFkeUJpbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgYmluZGluZ3MgPSBbXTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmluZDogZnVuY3Rpb24oY2IpIHtcblx0XHRcdFx0YmluZGluZ3MucHVzaChjYik7XG5cdFx0XHR9LFxuXHRcdFx0cmVhZHk6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGJpbmRpbmdzW2ldKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdC8vXHRHZXQgcGFyYW1ldGVycyBmb3IgYW4gYWN0aW9uXG5cdGdldFBhcmFtOiBmdW5jdGlvbihrZXksIHBhcmFtcywgZGVmKXtcblx0XHRyZXR1cm4gdHlwZW9mIG0ucm91dGUucGFyYW0oa2V5KSAhPT0gXCJ1bmRlZmluZWRcIj8gbS5yb3V0ZS5wYXJhbShrZXkpOiBkZWY7XG5cdH0sXG5cblx0Ly9cdEdldCBpbmZvIGZvciBhbiBhY3Rpb24gZnJvbSB0aGUgcGFyYW1zXG5cdHJvdXRlSW5mbzogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHQvKlxuXG5cdFx0XHRwYXRoOiByZXEucGF0aCxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblxuXHRcdCovXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdGg6IG0ucm91dGUoKSxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblx0XHR9XG5cdH1cbn07IiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHQvL1x0R3JhYiB0aGUgZ2VuZXJhdGVkIGNsaWVudCB2ZXJzaW9uLi4uXG5cdGRvY3MgPSByZXF1aXJlKCcuLi9wdWJsaWMvbWlzby5kb2N1bWVudGF0aW9uLmpzJyk7XG5cbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHQvL1x0T3VyIG1vZGVsXG5cdFx0ZG9jczogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLmRvY3MgPSBkYXRhLmRvY3M7XG5cdFx0XHR0aGlzLmlkID0gZGF0YS5pZDtcblx0XHRcdHRoaXMubmljZU5hbWUgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRcdFx0cmV0dXJuIG5hbWUuc3Vic3RyKDAsbmFtZS5sYXN0SW5kZXhPZihcIi5tZFwiKSkuc3BsaXQoXCItXCIpLmpvaW4oXCIgXCIpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmRvY3Moe1xuXHRcdFx0ZG9jczogZG9jcygpXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdERJVihcIkJlbG93IGlzIGEgbGlzdCBvZiBkb2N1bWVudGF0aW9uIGZvciBtaXNvOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdG1pc28uZWFjaChtb2RlbC5kb2NzLCBmdW5jdGlvbihkb2MsIGtleSl7XG5cdFx0XHRcdFx0XHQvL1x0U2tpcCBob21lIHBhZ2UuLi5cblx0XHRcdFx0XHRcdGlmKGtleSAhPT0gXCJIb21lLm1kXCIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIExJKFxuXHRcdFx0XHRcdFx0XHRcdEEoe2hyZWY6IFwiL2RvYy9cIiArIGtleSwgY29uZmlnOiBtLnJvdXRlfSwgbW9kZWwubmljZU5hbWUoa2V5KSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihcIkV4YW1wbGVzOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdExJKEEoe2hyZWY6IFwiL3RvZG9zXCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiVG9kb3MgZXhhbXBsZVwiKSksXG5cdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvdXNlcnNcIiwgY29uZmlnOiBtLnJvdXRlfSwgXCJVc2VycyBleGFtcGxlXCIpKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Ly9cdFVzZSBtYW51YWwgcHJpc20sIHNvIHRoYXQgaXQgd29ya3MgaW4gU1BBIG1vZGVcblx0XHRcdFx0U0NSSVBUKHtzcmM6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmpzXCIsIFwiZGF0YS1tYW51YWxcIjogXCJcIn0pXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGRvY19pZCA9IG1pc28uZ2V0UGFyYW0oJ2RvY19pZCcsIHBhcmFtcyk7XG5cdFx0dGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuZG9jcyh7XG5cdFx0XHRkb2NzOiBkb2NzKCksXG5cdFx0XHRpZDogZG9jX2lkXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdExJTksoe2hyZWY6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmNzc1wiLCByZWw6IFwic3R5bGVzaGVldFwifSksXG5cdFx0XHRcdEgxKG1vZGVsLm5pY2VOYW1lKG1vZGVsLmlkKSksXG5cdFx0XHRcdEFSVElDTEUobS50cnVzdChtb2RlbC5kb2NzW21vZGVsLmlkXSkpLFxuXHRcdFx0XHQvL1x0VXNlIG1hbnVhbCBwcmlzbSwgc28gdGhhdCBpdCB3b3JrcyBpbiBTUEEgbW9kZVxuXHRcdFx0XHRTQ1JJUFQoe3NyYzogXCIvZXh0ZXJuYWwvcHJpc20vcHJpc20uanNcIiwgXCJkYXRhLW1hbnVhbFwiOiBcIlwifSksXG5cdFx0XHRcdFNDUklQVChcIlByaXNtLmhpZ2hsaWdodEFsbCgpO1wiKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKTtcblxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xuXHRtb2RlbHM6IHtcblx0XHRoZWxsbzogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgnaGVsbG9faWQnLCBwYXJhbXMpO1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVihcIkcnZGF5IFwiICsgY3RybC5tb2RlbC53aG8oKSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRzbW9vdGhTY3JvbGwgPSByZXF1aXJlKCcuLi9wdWJsaWMvanMvbWl0aHJpbC5zbW9vdGhzY3JvbGwuanMnKTtcblxuLy9cdEhvbWUgcGFnZVxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0aW50cm86IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50ZXh0ID0gbS5wKFwiQ3JlYXRlIGFwcHMgaW4gYSBzbmFwIVwiKTtcblx0XHRcdHRoaXMuYW5pID0gbS5wKDApO1xuXHRcdFx0dGhpcy5kZW1vSW1nU3JjID0gbS5wKFwiaW1nL21pc29kZW1vLmdpZlwiKTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC5yZXBsYXkgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRtcFNyYyA9IGN0cmwubW9kZWwuZGVtb0ltZ1NyYygpO1xuXHRcdFx0Y3RybC5tb2RlbC5kZW1vSW1nU3JjKFwiXCIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRjdHJsLm1vZGVsLmRlbW9JbWdTcmModG1wU3JjKTtcblx0XHRcdH0sMCk7XG5cdFx0fTtcblxuXHRcdGN0cmwubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaW50cm8oKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKXtcblx0XHR2YXIgbyA9IGN0cmwubW9kZWw7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoW1xuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbnRyb1wifSwgW1xuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImludHJvVGV4dFwifSwgby50ZXh0KCkpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImRlbW9JbWdcIn0sIFtcblx0XHRcdFx0XHRcdElNRyh7aWQ6IFwiZGVtb0ltZ1wiLCBzcmM6IG8uZGVtb0ltZ1NyYygpfSksXG5cdFx0XHRcdFx0XHRTUEFOKHtcImNsYXNzXCI6IFwicmVwbGF5QnV0dG9uXCIsIG9uY2xpY2s6IGN0cmwucmVwbGF5fSwgXCJSZXBsYXlcIilcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiaW5zdGFsbEJ1dHRvblwiLCBjb25maWc6IHNtb290aFNjcm9sbChjdHJsKSwgaHJlZjogXCIjaW5zdGFsbGF0aW9uXCJ9LCBcIkluc3RhbGwgbWlzbyBub3dcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcIndoYXRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJXaGF0IGlzIG1pc28/XCIpICksXG5cdFx0XHRcdFx0UChcIk1pc28gaXMgYW4gb3BlbiBzb3VyY2UgaXNvbW9ycGhpYyBqYXZhc2NyaXB0IGZyYW1ld29yayB0aGF0IGFsbG93cyB5b3UgdG8gd3JpdGUgY29tcGxldGUgYXBwcyB3aXRoIG11Y2ggbGVzcyBlZmZvcnQgdGhhbiBvdGhlciBmcmFtZXdvcmtzLiBNaXNvIGZlYXR1cmVzOlwiLFtcblx0XHRcdFx0XHRcdFVMKHtcImNsYXNzXCI6IFwiZG90TGlzdFwifSwgW1xuXHRcdFx0XHRcdFx0XHRMSShcIlNpbmdsZSBwYWdlIGFwcHMgd2l0aCBzZXJ2ZXJzaWRlIHJlbmRlcmVkIEhUTUwgZm9yIHRoZSBmaXJzdCBwYWdlIC0gd29ya3MgcGVyZmVjdGx5IHdpdGggU0VPIGFuZCBvbGRlciBicm93c2Vyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJCZWF1dGlmdWwgVVJMcyAtIHdpdGggYSBmbGV4aWJsZSByb3V0aW5nIHN5c3RlbTogYXV0b21hdGUgc29tZSByb3V0ZXMsIHRha2UgZnVsbCBjb250cm9sIG9mIG90aGVyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJUaW55IGNsaWVudHNpZGUgZm9vdHByaW50IC0gbGVzcyB0aGFuIDI1a2IgKGd6aXBwZWQgYW5kIG1pbmlmaWVkKVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJGYXN0IGxpdmUtY29kZSByZWxvYWQgLSBzbWFydGVyIHJlbG9hZCB0byBoZWxwIHlvdSB3b3JrIGZhc3RlclwiKSxcblx0XHRcdFx0XHRcdFx0TEkoW1wiSGlnaCBwZXJmb3JtYW5jZSAtIHZpcnR1YWwgZG9tIGVuZ2luZSwgdGlueSBmb290cHJpbnQsIGZhc3RlciB0aGFuIHRoZSByZXN0XCIsIEEoe2hyZWY6IFwiaHR0cDovL2xob3JpZS5naXRodWIuaW8vbWl0aHJpbC9iZW5jaG1hcmtzLmh0bWxcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCIqXCIpXSksXG5cdFx0XHRcdFx0XHRcdExJKFwiTXVjaCBsZXNzIGNvZGUgLSBjcmVhdGUgYSBkZXBsb3lhYmxlIGFwcCBpbiBsZXNzIHRoYW4gMzAgbGluZXMgb2YgY29kZVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJPcGVuIHNvdXJjZSAtIE1JVCBsaWNlbnNlZFwiKVxuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRQKFwiTWlzbyB1dGlsaXNlcyBleGNlbGxlbnQgb3BlbiBzb3VyY2UgbGlicmFyaWVzIGFuZCBmcmFtZXdvcmtzIHRvIGNyZWF0ZSBhbiBleHRyZW1lbHkgZWZmaWNpZW50IGZ1bGwgd2ViIHN0YWNrLiBUaGVzZSBmcmFtZXdvcmtzIGluY2x1ZGU6XCIpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZyYW1ld29ya3NcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZ3Y29udGFpbmVyIGNmXCJ9LFtcblx0XHRcdFx0XHRcdFx0QSh7XCJjbGFzc1wiOiBcImZ3TGlua1wiLCBocmVmOiBcImh0dHA6Ly9saG9yaWUuZ2l0aHViLmlvL21pdGhyaWwvXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sXG5cdFx0XHRcdFx0XHRcdFNQQU4oe1wiY2xhc3NcIjogXCJmdyBtaXRocmlsXCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vZXhwcmVzc2pzLmNvbS9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgZXhwcmVzc1wifSkpLFxuXHRcdFx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiZndMaW5rXCIsIGhyZWY6IFwiaHR0cDovL2Jyb3dzZXJpZnkub3JnL1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LFNQQU4oe1wiY2xhc3NcIjogXCJmdyBicm93c2VyaWZ5XCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vbm9kZW1vbi5pby9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgbm9kZW1vblwifSkpXG5cdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImN3XCJ9LCBbXG5cdFx0XHRcdFx0SDIoe2lkOiBcImluc3RhbGxhdGlvblwifSwgQSh7bmFtZTogXCJpbnN0YWxsYXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJJbnN0YWxsYXRpb25cIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gaW5zdGFsbCBtaXNvLCB1c2UgbnBtOlwiKSxcblx0XHRcdFx0XHRQUkUoe1wiY2xhc3NcIjogXCJqYXZhc2NyaXB0XCJ9LFtcblx0XHRcdFx0XHRcdENPREUoXCJucG0gaW5zdGFsbCBtaXNvanMgLWdcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJjd1wifSwgW1xuXHRcdFx0XHRcdEgyKEEoe25hbWU6IFwiZ2V0dGluZ3N0YXJ0ZWRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJHZXR0aW5nIHN0YXJ0ZWRcIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gY3JlYXRlIGFuZCBydW4gYSBtaXNvIGFwcCBpbiBhIG5ldyBkaXJlY3Rvcnk6XCIpLFxuXHRcdFx0XHRcdFBSRSh7XCJjbGFzc1wiOiBcImphdmFzY3JpcHRcIn0sW1xuXHRcdFx0XHRcdFx0Q09ERShcIm1pc28gLW4gbXlBcHBcXG5jZCBteUFwcFxcbm1pc28gcnVuXCIpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0UChcIkNvbmdyYXR1bGF0aW9ucywgeW91IGFyZSBub3cgcnVubmluZyB5b3VyIHZlcnkgb3duIG1pc28gYXBwIGluIHRoZSAnbXlBcHAnIGRpcmVjdG9yeSFcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcImV4YW1wbGVzXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiRXhhbXBsZXNcIikpLFxuXHRcdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRcdExJKEEoeyBocmVmOiAnL3RvZG9zJywgY29uZmlnOiBtLnJvdXRlfSwgXCJUb2RvcyBleGFtcGxlIChzaW5nbGUgdXJsIFNQQSlcIikpLFxuXHRcdFx0XHRcdFx0TEkoQSh7IGhyZWY6ICcvdXNlcnMnLCBjb25maWc6IG0ucm91dGV9LCBcIlVzZXJzIGV4YW1wbGUgKG11bHRpcGxlIHVybCBTUEEpXCIpKVxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdEgyKHtuYW1lOiBcImRvY3VtZW50YXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sIFwiRG9jdW1lbnRhdGlvblwiKSxcblx0XHRcdFx0XHRBKHtocmVmOlwiL2RvY3NcIn0sIFwiRG9jdW1lbnRhdGlvbiBjYW4gYmUgZm91bmQgaGVyZVwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuIiwiLypcdE1pc28gbGF5b3V0IHBhZ2VcblxuXHRUaGlzIGxheW91dCBkZXRlcm1pbmVzIHRoZSBIVE1MIHN1cnJvdW5kIGZvciBlYWNoIG9mIHlvdXIgbXZjIHJvdXRlcy5cblx0RmVlbCBmcmVlIHRvIG1vZGlmeSBhcyB5b3Ugc2VlIGZpdCAtIGFzIGxvbmcgYXMgdGhlIGF0dGFjaGVtbnQgbm9kZSBpcyBcblx0cHJlc2VudCwgaXQgc2hvdWxkIHdvcmsuXG5cblx0Tm90ZTogdGhpcyBpcyB0aGUgb25seSBtdmMgdGhhdCBkb2VzIG5vdCByZXF1aXJlIGEgY29udHJvbGxlci5cbiovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YXV0aGVudGljYXRpb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG4vL1x0VGhlIGhlYWRlciAtIHRoaXMgY2FuIGFsc28gYmUgcmVuZGVyZWQgY2xpZW50IHNpZGVcbm1vZHVsZS5leHBvcnRzLmhlYWRlckNvbnRlbnQgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6ICdjdyBjZid9LCBbXG5cdFx0XHRESVYoe1wiY2xhc3NcIjogJ2xvZ28nfSxcblx0XHRcdFx0QSh7YWx0OiAnTUlTTycsIGhyZWY6Jy8nLCBjb25maWc6IG0ucm91dGV9LCBbXG5cdFx0XHRcdFx0SU1HKHtzcmM6ICcvaW1nL21pc29fbG9nby5wbmcnfSlcblx0XHRcdFx0XSlcblx0XHRcdCksXG5cdFx0XHROQVYoe1wiY2xhc3NcIjogXCJsZWZ0XCJ9LCBVTChbXG5cdFx0XHRcdExJKEEoe2hyZWY6IFwiaHR0cDovL21pc29qcy5jb20vZG9jc1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LCBcIkRvY3VtZW50YXRpb25cIikpXG5cdFx0XHRdKSksXG5cdFx0XHROQVYoe1wiY2xhc3NcIjogXCJyaWdodFwifSwgVUwoW1xuXHRcdFx0XHRMSShBKHtocmVmOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9qc2d1eS9taXNvanNcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCJHaXRodWJcIikpLFxuXHRcdFx0XHQvL1x0VGhpcyBsaW5rIGNvdWxkIGdvIHRvIGFuIGFjY291bnQgXG5cdFx0XHRcdC8vXHRwYWdlIG9yIHNvbWV0aGluZyBsaWtlIHRoYXRcblxuXHRcdFx0XHQoY3RybC5taXNvR2xvYmFsLmF1dGhlbnRpY2F0aW9uRW5hYmxlZD9cblx0XHRcdFx0XHQoY3RybC5taXNvR2xvYmFsLmlzTG9nZ2VkSW4gJiYgY3RybC5taXNvR2xvYmFsLnVzZXJOYW1lPyBcblx0XHRcdFx0XHRcdExJKEEoe29uY2xpY2s6IGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdsb2dnaW5nIG91dCwgcGxlYXNlIHdhaXQuLi4nKTtcblx0XHRcdFx0XHRcdFx0XHRhdXRoZW50aWNhdGlvbi5sb2dvdXQoe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIllvdSd2ZSBiZWVuIGxvZ2dlZCBvdXRcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRtLnJvdXRlKFwiL2xvZ2luXCIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fSwgaHJlZjogXCIjXCIsIGlkOiBcIm1pc29Vc2VyTmFtZVwifSxcblx0XHRcdFx0XHRcdFx0XCJMb2dvdXQgXCIgKyBjdHJsLm1pc29HbG9iYWwudXNlck5hbWUpXG5cdFx0XHRcdFx0XHQpOlxuXHRcdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvbG9naW5cIn0sIFwiTG9naW5cIikpXG5cdFx0XHRcdFx0KTogXG5cdFx0XHRcdFx0XCJcIlxuXHRcdFx0XHQpXG5cblx0XHRcdF0pKVxuXHRcdF0pO1xuXHR9XG59O1xuXG4vL1x0VGhlIGZ1bGwgbGF5b3V0IC0gYWx3YXlzIG9ubHkgcmVuZGVyZWQgc2VydmVyIHNpZGVcbm1vZHVsZS5leHBvcnRzLnZpZXcgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0bS50cnVzdChcIjwhZG9jdHlwZSBodG1sPlwiKSxcblx0XHRcdEhUTUwoW1xuXHRcdFx0XHRIRUFEKFtcblx0XHRcdFx0XHRMSU5LKHtocmVmOiAnL2Nzcy9zdHlsZS5jc3MnLCByZWw6J3N0eWxlc2hlZXQnfSksXG5cdFx0XHRcdFx0Ly9cdEFkZCBpbiB0aGUgbWlzb0dsb2JhbCBvYmplY3QuLi5cblx0XHRcdFx0XHRTQ1JJUFQoXCJ2YXIgbWlzb0dsb2JhbCA9IFwiKyhjdHJsLm1pc29HbG9iYWw/IEpTT04uc3RyaW5naWZ5KGN0cmwubWlzb0dsb2JhbCk6IHt9KStcIjtcIilcblx0XHRcdFx0XSksXG5cdFx0XHRcdEJPRFkoe1wiY2xhc3NcIjogJ2ZpeGVkLWhlYWRlcicgfSwgW1xuXHRcdFx0XHRcdEhFQURFUih7aWQ6IFwibWlzb0hlYWRlck5vZGVcIn0sIGN0cmwuaGVhZGVyQ29udGVudChjdHJsKSksXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IGN0cmwubWlzb0F0dGFjaG1lbnROb2RlfSwgY3RybC5jb250ZW50KSxcblx0XHRcdFx0XHRTRUNUSU9OKHtpZDogXCJsb2FkZXJcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImxvYWRlclwifSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRTRUNUSU9OKHtpZDogXCJmb290ZXJcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiAnY3cgY2YnfSwgbS50cnVzdChcIkNvcHlyaWdodCAmY29weTsgMjAxNSBqc2d1eVwiKSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHQvL1NDUklQVCh7c3JjOiAnL21pc28uanMnICsgKGN0cmwucmVsb2FkPyBcIj9jYWNoZUtleT1cIiArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk6IFwiXCIpfSksXG5cdFx0XHRcdFx0U0NSSVBUKHtzcmM6ICcvbWlzby5qcyd9KSxcblx0XHRcdFx0XHQoY3RybC5yZWxvYWQ/IFNDUklQVCh7c3JjOiAnL3JlbG9hZC5qcyd9KTogXCJcIilcblx0XHRcdFx0XSlcblx0XHRcdF0pXG5cdFx0XTtcblx0fVxufTsiLCIvKiBFeGFtcGxlIGxvZ2luIG12YyAqL1xudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRhdXRoZW50aWNhdGlvbiA9IHJlcXVpcmUoXCIuLi9zeXN0ZW0vYXBpL2F1dGhlbnRpY2F0aW9uL2FwaS5jbGllbnQuanNcIikobSksXG5cdHNlc3Npb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5jbGllbnQuanNcIikobSk7XG5cbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHRsb2dpbjogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLnVybCA9IGRhdGEudXJsO1xuXHRcdFx0dGhpcy5pc0xvZ2dlZEluID0gbS5wcm9wKGZhbHNlKTtcblx0XHRcdHRoaXMudXNlcm5hbWUgPSBtLnByb3AoZGF0YS51c2VybmFtZXx8XCJcIik7XG5cdFx0XHR0aGlzLnBhc3N3b3JkID0gbS5wcm9wKFwiXCIpO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzLFxuXHRcdFx0dXJsID0gbWlzby5nZXRQYXJhbSgndXJsJywgcGFyYW1zKSxcblx0XHRcdGxvZ291dCA9IG1pc28uZ2V0UGFyYW0oJ2xvZ291dCcsIHBhcmFtcyk7XG5cblx0XHRjdHJsLm1vZGVsID0gbmV3IGluZGV4Lm1vZGVscy5sb2dpbih7dXJsOiB1cmx9KTtcblxuXHRcdC8vXHROb3RlOiB0aGlzIGRvZXMgbm90IGV4ZWN1dGUgb24gdGhlIHNlcnZlciBhcyBpdCBcblx0XHQvL1x0aXMgYSBET00gZXZlbnQuXG5cdFx0Y3RybC5sb2dpbiA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Ly9cdENhbGwgdGhlIHNlcnZlciBtZXRob2QgdG8gc2VlIGlmIHdlJ3JlIGxvZ2dlZCBpblxuXHRcdFx0YXV0aGVudGljYXRpb24ubG9naW4oe3R5cGU6ICdsb2dpbi5pbmRleC5sb2dpbicsIG1vZGVsOiBjdHJsLm1vZGVsfSkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0aWYoZGF0YS5yZXN1bHQuaXNMb2dnZWRJbiA9PSB0cnVlKSB7XG5cdFx0XHRcdFx0Ly9cdFdvb3QsIHdlJ3JlIGluIVxuXHRcdFx0XHRcdG1pc29HbG9iYWwuaXNMb2dnZWRJbiA9IHRydWU7XG5cdFx0XHRcdFx0bWlzb0dsb2JhbC51c2VyTmFtZSA9IGRhdGEucmVzdWx0LnVzZXJOYW1lO1xuXHRcdFx0XHRcdGN0cmwubW9kZWwuaXNMb2dnZWRJbih0cnVlKTtcblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiV2VsY29tZSBcIiArIG1pc29HbG9iYWwudXNlck5hbWUgKyBcIiwgeW91J3ZlIGJlZW4gbG9nZ2VkIGluXCIpO1xuXG5cdFx0XHRcdFx0Ly9cdFdpbGwgc2hvdyB0aGUgdXNlcm5hbWUgd2hlbiBsb2dnZWQgaW5cblx0XHRcdFx0XHRtaXNvR2xvYmFsLnJlbmRlckhlYWRlcigpO1xuXG5cdFx0XHRcdFx0aWYodXJsKXtcblx0XHRcdFx0XHRcdG0ucm91dGUodXJsKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly9cdEdvIHRvIGRlZmF1bHQgVVJMP1xuXHRcdFx0XHRcdFx0bS5yb3V0ZShcIi9cIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXG5cdFx0aWYobG9nb3V0KSB7XG5cdFx0XHRhdXRoZW50aWNhdGlvbi5sb2dvdXQoe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiWW91J3ZlIGJlZW4gbG9nZ2VkIG91dFwiKTtcblx0XHRcdFx0Ly9cdFdvb3QsIHdlJ3JlIG91dCFcblx0XHRcdFx0Y3RybC5tb2RlbC5pc0xvZ2dlZEluKGZhbHNlKTtcblx0XHRcdFx0Ly8gbWlzb0dsb2JhbC5pc0xvZ2dlZEluID0gZmFsc2U7XG5cdFx0XHRcdC8vIGRlbGV0ZSBtaXNvR2xvYmFsLnVzZXJOYW1lO1xuXHRcdFx0XHQvL1x0V2lsbCByZW1vdmUgdGhlIHVzZXJuYW1lIHdoZW4gbG9nZ2VkIG91dFxuXHRcdFx0XHRtaXNvR2xvYmFsLnJlbmRlckhlYWRlcigpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiBcImN3IGNmXCJ9LCBcblx0XHRcdFx0Y3RybC5tb2RlbC5pc0xvZ2dlZEluKCk/IFwiWW91J3ZlIGJlZW4gbG9nZ2VkIGluXCI6IFtcblx0XHRcdFx0RElWKGN0cmwubW9kZWwudXJsPyBcIlBsZWFzZSBsb2cgaW4gdG8gZ28gdG8gXCIgKyBjdHJsLm1vZGVsLnVybDogXCJQbGVhc2UgbG9nIGluXCIpLFxuXHRcdFx0XHRGT1JNKHsgb25zdWJtaXQ6IGN0cmwubG9naW4gfSwgW1xuXHRcdFx0XHRcdElOUFVUKHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBjdHJsLm1vZGVsLnVzZXJuYW1lLCBwbGFjZWhvbGRlcjogXCJVc2VybmFtZVwifSksXG5cdFx0XHRcdFx0SU5QVVQoeyB0eXBlOiBcInBhc3N3b3JkXCIsIHZhbHVlOiBjdHJsLm1vZGVsLnBhc3N3b3JkfSksXG5cdFx0XHRcdFx0QlVUVE9OKHsgdHlwZTogXCJzdWJtaXRcIn0sIFwiTG9naW5cIilcblx0XHRcdFx0XSlcblx0XHRcdF0pO1xuXHRcdH1cblx0fSxcblx0YXV0aGVudGljYXRlOiBmYWxzZVxufTsiLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0ZGIgPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2FwaS5jbGllbnQuanNcIikobSk7XG5cbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XG5cdG1vZGVsczoge1xuXHRcdHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xuXHRcdFx0dGhpcy5kb25lID0gbS5wcm9wKGRhdGEuZG9uZSA9PSBcImZhbHNlXCI/IGZhbHNlOiBkYXRhLmRvbmUpO1xuXHRcdFx0dGhpcy5faWQgPSBkYXRhLl9pZDtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcztcblxuXHRcdGN0cmwubGlzdCA9IFtdO1xuXG5cdFx0ZGIuZmluZCh7dHlwZTogJ3RvZG8uaW5kZXgudG9kbyd9LCB7YmFja2dyb3VuZDogdHJ1ZSwgaW5pdGlhbFZhbHVlOiBbXX0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0Y3RybC5saXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKGRhdGEucmVzdWx0W2tleV0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRjdHJsLmFkZFRvZG8gPSBmdW5jdGlvbihlKXtcblx0XHRcdHZhciB2YWx1ZSA9IGN0cmwudm0uaW5wdXQoKTtcblx0XHRcdGlmKHZhbHVlKSB7XG5cdFx0XHRcdHZhciBuZXdUb2RvID0gbmV3IHNlbGYubW9kZWxzLnRvZG8oe1xuXHRcdFx0XHRcdHRleHQ6IGN0cmwudm0uaW5wdXQoKSxcblx0XHRcdFx0XHRkb25lOiBmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y3RybC5saXN0LnB1c2gobmV3VG9kbyk7XG5cdFx0XHRcdGN0cmwudm0uaW5wdXQoXCJcIik7XG5cdFx0XHRcdGRiLnNhdmUoeyB0eXBlOiAndG9kby5pbmRleC50b2RvJywgbW9kZWw6IG5ld1RvZG8gfSApLnRoZW4oZnVuY3Rpb24ocmVzKXtcblx0XHRcdFx0XHRuZXdUb2RvLl9pZCA9IHJlcy5yZXN1bHQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cblx0XHRjdHJsLmFyY2hpdmUgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIGxpc3QgPSBbXTtcblx0XHRcdGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xuXHRcdFx0XHRpZighdG9kby5kb25lKCkpIHtcblx0XHRcdFx0XHRsaXN0LnB1c2godG9kbyk7IFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRiLnJlbW92ZSh7IHR5cGU6ICd0b2RvLmluZGV4LnRvZG8nLCBfaWQ6IHRvZG8uX2lkIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UucmVzdWx0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRjdHJsLmxpc3QgPSBsaXN0O1xuXHRcdH07XG5cblx0XHRjdHJsLnZtID0ge1xuXHRcdFx0bGVmdDogZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIGNvdW50ID0gMDtcblx0XHRcdFx0Y3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XG5cdFx0XHRcdFx0Y291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBjb3VudDtcblx0XHRcdH0sXG5cdFx0XHRkb25lOiBmdW5jdGlvbih0b2RvKXtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRvZG8uZG9uZSghdG9kby5kb25lKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0aW5wdXQ6IG0ucHJvcChcIlwiKVxuXHRcdH07XG5cblx0XHRyZXR1cm4gY3RybDtcblx0fSxcblx0dmlldzogZnVuY3Rpb24oY3RybCkge1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiY3cgY2ZcIn0sIFtcblx0XHRcdFx0U1RZTEUoXCIuZG9uZXt0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDt9XCIpLFxuXHRcdFx0XHRIMShcIlRvZG9zIC0gXCIgKyBjdHJsLnZtLmxlZnQoKSArIFwiIG9mIFwiICsgY3RybC5saXN0Lmxlbmd0aCArIFwiIHJlbWFpbmluZ1wiKSxcblx0XHRcdFx0QlVUVE9OKHsgb25jbGljazogY3RybC5hcmNoaXZlIH0sIFwiQXJjaGl2ZVwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XG5cdFx0XHRcdFx0XHRyZXR1cm4gTEkoeyBjbGFzczogdG9kby5kb25lKCk/IFwiZG9uZVwiOiBcIlwiLCBvbmNsaWNrOiBjdHJsLnZtLmRvbmUodG9kbykgfSwgdG9kby50ZXh0KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Rk9STSh7IG9uc3VibWl0OiBjdHJsLmFkZFRvZG8gfSwgW1xuXHRcdFx0XHRcdElOUFVUKHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBjdHJsLnZtLmlucHV0LCBwbGFjZWhvbGRlcjogXCJBZGQgdG9kb1wifSksXG5cdFx0XHRcdFx0QlVUVE9OKHsgdHlwZTogXCJzdWJtaXRcIn0sIFwiQWRkXCIpXG5cdFx0XHRcdF0pXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cblx0Ly9cdFRlc3QgYXV0aGVudGljYXRlXG5cdC8vLGF1dGhlbnRpY2F0ZTogdHJ1ZVxufTsiLCIvKlxuXHRUaGlzIGlzIGEgc2FtcGxlIHVzZXIgbWFuYWdlbWVudCBhcHAgdGhhdCB1c2VzIHRoZVxuXHRtdWx0aXBsZSB1cmwgbWlzbyBwYXR0ZXJuLlxuKi9cbnZhciBtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0dmFsaWRhdGUgPSByZXF1aXJlKCd2YWxpZGF0b3IubW9kZWxiaW5kZXInKSxcblx0bSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YmluZGluZ3MgPSByZXF1aXJlKCdtaXRocmlsLmJpbmRpbmdzJykobSksXG5cdGFwaSA9IHJlcXVpcmUoXCIuLi9zeXN0ZW0vYXBpL2F1dGhlbnRpY2F0aW9uL2FwaS5jbGllbnQuanNcIikobSksXG5cdHNlbGYgPSBtb2R1bGUuZXhwb3J0cztcblxuLy9cdFNoYXJlZCB2aWV3XG52YXIgZWRpdFZpZXcgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gRElWKHsgY2xhc3M6IFwiY3dcIiB9LCBbXG5cdFx0XHRIMih7XCJjbGFzc1wiOiBcInBhZ2VIZWFkZXJcIn0sIGN0cmwuaGVhZGVyKSxcblx0XHRcdGN0cmwudXNlciA/IFtcblx0XHRcdFx0RElWKFtcblx0XHRcdFx0XHRMQUJFTChcIk5hbWVcIiksIElOUFVUKHt2YWx1ZTogY3RybC51c2VyLm5hbWV9KSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogKGN0cmwudXNlci5pc1ZhbGlkKCduYW1lJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcInZhbGlkXCI6IFwiaW52YWxpZFwiKSArIFwiIGluZGVudGVkXCJ9LCBbXG5cdFx0XHRcdFx0XHRjdHJsLnVzZXIuaXNWYWxpZCgnbmFtZScpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJcIjogY3RybC51c2VyLmlzVmFsaWQoJ25hbWUnKS5qb2luKFwiLCBcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0RElWKFtcblx0XHRcdFx0XHRMQUJFTChcIkVtYWlsXCIpLCBJTlBVVCh7dmFsdWU6IGN0cmwudXNlci5lbWFpbH0pLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiAoY3RybC51c2VyLmlzVmFsaWQoJ2VtYWlsJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcInZhbGlkXCI6IFwiaW52YWxpZFwiKSArIFwiIGluZGVudGVkXCIgfSwgW1xuXHRcdFx0XHRcdFx0Y3RybC51c2VyLmlzVmFsaWQoJ2VtYWlsJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcIlwiOiBjdHJsLnVzZXIuaXNWYWxpZCgnZW1haWwnKS5qb2luKFwiLCBcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0RElWKFtcblx0XHRcdFx0XHRMQUJFTChcIlBhc3N3b3JkXCIpLCBJTlBVVCh7dmFsdWU6IGN0cmwudXNlci5wYXNzd29yZCwgdHlwZTogJ3Bhc3N3b3JkJ30pLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiAoY3RybC51c2VyLmlzVmFsaWQoJ3Bhc3N3b3JkJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcInZhbGlkXCI6IFwiaW52YWxpZFwiKSArIFwiIGluZGVudGVkXCIgfSwgW1xuXHRcdFx0XHRcdFx0Y3RybC51c2VyLmlzVmFsaWQoJ3Bhc3N3b3JkJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcIlwiOiBjdHJsLnVzZXIuaXNWYWxpZCgncGFzc3dvcmQnKS5qb2luKFwiLCBcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiaW5kZW50ZWRcIn0sW1xuXHRcdFx0XHRcdEJVVFRPTih7b25jbGljazogY3RybC5zYXZlLCBjbGFzczogXCJwb3NpdGl2ZVwifSwgXCJTYXZlIHVzZXJcIiksXG5cdFx0XHRcdFx0QlVUVE9OKHtvbmNsaWNrOiBjdHJsLnJlbW92ZSwgY2xhc3M6IFwibmVnYXRpdmVcIn0sIFwiRGVsZXRlIHVzZXJcIilcblx0XHRcdFx0XSlcblx0XHRcdF06IERJVihcIlVzZXIgbm90IGZvdW5kXCIpXG5cdFx0XSk7XG5cdH1cbn07XG5cblxuLy9cdFVzZXIgbGlzdFxubW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcztcblxuXHRcdGN0cmwudm0gPSB7XG5cdFx0XHR1c2VyTGlzdDogZnVuY3Rpb24odXNlcnMpe1xuXHRcdFx0XHR0aGlzLnVzZXJzID0gbS5wKHVzZXJzKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0YXBpLmZpbmRVc2Vycyh7dHlwZTogJ3VzZXIuZWRpdC51c2VyJ30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0aWYoZGF0YS5lcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkVycm9yIFwiICsgZGF0YS5lcnJvcik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmKGRhdGEucmVzdWx0KSB7XG5cdFx0XHRcdHZhciBsaXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IHNlbGYuZWRpdC5tb2RlbHMudXNlcihkYXRhLnJlc3VsdFtrZXldKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Y3RybC51c2VycyA9IG5ldyBjdHJsLnZtLnVzZXJMaXN0KGxpc3QpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3RybC51c2VycyA9IG5ldyBjdHJsLnZtLnVzZXJMaXN0KFtdKTtcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yJywgYXJndW1lbnRzKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKXtcblx0XHR2YXIgYyA9IGN0cmwsXG5cdFx0XHR1ID0gYy51c2VycztcblxuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHsgY2xhc3M6IFwiY3dcIiB9LCBbXG5cdFx0XHRcdFVMKFtcblx0XHRcdFx0XHR1LnVzZXJzKCkubWFwKGZ1bmN0aW9uKHVzZXIsIGlkeCl7XG5cdFx0XHRcdFx0XHRyZXR1cm4gTEkoQSh7IGhyZWY6ICcvdXNlci8nICsgdXNlci5pZCgpLCBjb25maWc6IG0ucm91dGV9LCB1c2VyLm5hbWUoKSArIFwiIC0gXCIgKyB1c2VyLmVtYWlsKCkpKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0QSh7XCJjbGFzc1wiOlwiYnV0dG9uIHBvc2l0aXZlIG10b3BcIiwgaHJlZjpcIi91c2Vycy9uZXdcIiwgY29uZmlnOiBtLnJvdXRlfSwgXCJBZGQgbmV3IHVzZXJcIilcblx0XHRcdF0pO1xuXHRcdH1cblx0fVxufTtcblxuXG4vL1x0TmV3IHVzZXJcbm1vZHVsZS5leHBvcnRzLm5ldyA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXHRcdGN0cmwudXNlciA9IG5ldyBzZWxmLmVkaXQubW9kZWxzLnVzZXIoe25hbWU6IFwiXCIsIGVtYWlsOiBcIlwifSk7XG5cdFx0Y3RybC5oZWFkZXIgPSBcIk5ldyB1c2VyXCI7XG5cdFx0Y3RybC5zaG93RXJyb3JzID0gZmFsc2U7XG5cblx0XHRjdHJsLnNhdmUgPSBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY3RybC51c2VyLmlzVmFsaWQoKSAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRjdHJsLnNob3dFcnJvcnMgPSB0cnVlO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnVXNlciBpcyBub3QgdmFsaWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFwaS5zYXZlVXNlcih7IHR5cGU6ICd1c2VyLmVkaXQudXNlcicsIG1vZGVsOiBjdHJsLnVzZXIgfSApLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIkFkZGVkIHVzZXJcIiwgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRtLnJvdXRlKFwiL3VzZXJzXCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGVkaXRWaWV3XG59O1xuXG5cbi8vXHRFZGl0IHVzZXJcbm1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XG5cdG1vZGVsczoge1xuXHRcdHVzZXI6IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhpcy5uYW1lID0gbS5wKGRhdGEubmFtZXx8XCJcIik7XG5cdFx0XHR0aGlzLmVtYWlsID0gbS5wKGRhdGEuZW1haWx8fFwiXCIpO1xuXHRcdFx0Ly9cdFBhc3N3b3JkIGlzIGFsd2F5cyBlbXB0eSBmaXJzdFxuXHRcdFx0dGhpcy5wYXNzd29yZCA9IG0ucChkYXRhLnBhc3N3b3JkfHxcIlwiKTtcblx0XHRcdHRoaXMuaWQgPSBtLnAoZGF0YS5faWR8fFwiXCIpO1xuXG5cdFx0XHQvL1x0VmFsaWRhdGUgdGhlIG1vZGVsXG5cdFx0XHR0aGlzLmlzVmFsaWQgPSB2YWxpZGF0ZS5iaW5kKHRoaXMsIHtcblx0XHRcdFx0bmFtZToge1xuXHRcdFx0XHRcdGlzUmVxdWlyZWQ6IFwiWW91IG11c3QgZW50ZXIgYSBuYW1lXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0cGFzc3dvcmQ6IHtcblx0XHRcdFx0XHRpc1JlcXVpcmVkOiBcIllvdSBtdXN0IGVudGVyIGEgcGFzc3dvcmRcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlbWFpbDoge1xuXHRcdFx0XHRcdGlzUmVxdWlyZWQ6IFwiWW91IG11c3QgZW50ZXIgYW4gZW1haWwgYWRkcmVzc1wiLFxuXHRcdFx0XHRcdGlzRW1haWw6IFwiTXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIlxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXMsXG5cdFx0XHR1c2VySWQgPSBtaXNvLmdldFBhcmFtKCd1c2VyX2lkJywgcGFyYW1zKTtcblxuXHRcdGN0cmwuaGVhZGVyID0gXCJFZGl0IHVzZXIgXCIgKyB1c2VySWQ7XG5cblx0XHQvL1x0TG9hZCBvdXIgdXNlclxuXHRcdGFwaS5maW5kVXNlcnMoe3R5cGU6ICd1c2VyLmVkaXQudXNlcicsIHF1ZXJ5OiB7X2lkOiB1c2VySWR9fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHR2YXIgdXNlciA9IGRhdGEucmVzdWx0O1xuXHRcdFx0aWYodXNlciAmJiB1c2VyLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y3RybC51c2VyID0gbmV3IHNlbGYuZWRpdC5tb2RlbHMudXNlcih1c2VyWzBdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdVc2VyIG5vdCBmb3VuZCcsIHVzZXJJZCk7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oKXtcblx0XHRcdGNvbnNvbGUubG9nKCdFcnJvcicsIGFyZ3VtZW50cyk7XG5cdFx0fSk7XG5cblx0XHRjdHJsLnNhdmUgPSBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY3RybC51c2VyLmlzVmFsaWQoKSAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRjdHJsLnNob3dFcnJvcnMgPSB0cnVlO1xuXHRcdFx0XHRjb25zb2xlLmxvZygnVXNlciBpcyBub3QgdmFsaWQnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFwaS5zYXZlVXNlcih7IHR5cGU6ICd1c2VyLmVkaXQudXNlcicsIG1vZGVsOiBjdHJsLnVzZXIgfSApLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIlNhdmVkIHVzZXJcIiwgYXJndW1lbnRzKTtcblx0XHRcdFx0XHRtLnJvdXRlKFwiL3VzZXJzXCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y3RybC5yZW1vdmUgPSBmdW5jdGlvbigpe1xuXHRcdFx0aWYoY29uZmlybShcIkRlbGV0ZSB1c2VyP1wiKSkge1xuXHRcdFx0XHRhcGkucmVtb3ZlKHsgdHlwZTogJ3VzZXIuZWRpdC51c2VyJywgX2lkOiB1c2VySWQgfSkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhLnJlc3VsdCk7XG5cdFx0XHRcdFx0bS5yb3V0ZShcIi91c2Vyc1wiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBlZGl0Vmlld1xuXHQvL1x0QW55IGF1dGhlbnRpY2F0aW9uIGluZm9cblx0Ly8sIGF1dGhlbnRpY2F0ZTogdHJ1ZVxufTtcbiIsIi8vXHRNaXRocmlsIGJpbmRpbmdzLlxuLy9cdENvcHlyaWdodCAoQykgMjAxNCBqc2d1eSAoTWlra2VsIEJlcmdtYW5uKVxuLy9cdE1JVCBsaWNlbnNlZFxuKGZ1bmN0aW9uKCl7XG52YXIgbWl0aHJpbEJpbmRpbmdzID0gZnVuY3Rpb24obSl7XG5cdG0uYmluZGluZ3MgPSBtLmJpbmRpbmdzIHx8IHt9O1xuXG5cdC8vXHRQdWIvU3ViIGJhc2VkIGV4dGVuZGVkIHByb3BlcnRpZXNcblx0bS5wID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRzdWJzID0gW10sXG5cdFx0XHRwcmV2VmFsdWUsXG5cdFx0XHRkZWxheSA9IGZhbHNlLFxuXHRcdFx0Ly8gIFNlbmQgbm90aWZpY2F0aW9ucyB0byBzdWJzY3JpYmVyc1xuXHRcdFx0bm90aWZ5ID0gZnVuY3Rpb24gKHZhbHVlLCBwcmV2VmFsdWUpIHtcblx0XHRcdFx0dmFyIGk7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBzdWJzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdFx0c3Vic1tpXS5mdW5jLmFwcGx5KHN1YnNbaV0uY29udGV4dCwgW3ZhbHVlLCBwcmV2VmFsdWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHByb3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdFx0XHRpZiAocHJldlZhbHVlICE9PSB2YWx1ZSkge1xuXHRcdFx0XHRcdFx0dmFyIHRtcFByZXYgPSBwcmV2VmFsdWU7XG5cdFx0XHRcdFx0XHRwcmV2VmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdG5vdGlmeSh2YWx1ZSwgdG1wUHJldik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH07XG5cblx0XHQvL1x0QWxsb3cgcHVzaCBvbiBhcnJheXNcblx0XHRwcm9wLnB1c2ggPSBmdW5jdGlvbih2YWwpIHtcblx0XHRcdGlmKHZhbHVlLnB1c2ggJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHR2YWx1ZS5wdXNoKHZhbCk7XG5cdFx0XHR9XG5cdFx0XHRwcm9wKHZhbHVlKTtcblx0XHR9O1xuXG5cdFx0Ly9cdFN1YnNjcmliZSBmb3Igd2hlbiB0aGUgdmFsdWUgY2hhbmdlc1xuXHRcdHByb3Auc3Vic2NyaWJlID0gZnVuY3Rpb24gKGZ1bmMsIGNvbnRleHQpIHtcblx0XHRcdHN1YnMucHVzaCh7IGZ1bmM6IGZ1bmMsIGNvbnRleHQ6IGNvbnRleHQgfHwgc2VsZiB9KTtcblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH07XG5cblx0XHQvL1x0QWxsb3cgcHJvcGVydHkgdG8gbm90IGF1dG9tYXRpY2FsbHkgcmVuZGVyXG5cdFx0cHJvcC5kZWxheSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRkZWxheSA9ICEhdmFsdWU7XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9O1xuXG5cdFx0Ly9cdEF1dG9tYXRpY2FsbHkgdXBkYXRlIHJlbmRlcmluZyB3aGVuIGEgdmFsdWUgY2hhbmdlc1xuXHRcdC8vXHRBcyBtaXRocmlsIHdhaXRzIGZvciBhIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lLCB0aGlzIHNob3VsZCBiZSBvay5cblx0XHQvL1x0WW91IGNhbiB1c2UgLmRlbGF5KHRydWUpIHRvIGJlIGFibGUgdG8gbWFudWFsbHkgaGFuZGxlIHVwZGF0ZXNcblx0XHRwcm9wLnN1YnNjcmliZShmdW5jdGlvbih2YWwpe1xuXHRcdFx0aWYoIWRlbGF5KSB7XG5cdFx0XHRcdG0uc3RhcnRDb21wdXRhdGlvbigpO1xuXHRcdFx0XHRtLmVuZENvbXB1dGF0aW9uKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9KTtcblxuXHRcdHJldHVybiBwcm9wO1xuXHR9O1xuXG5cdC8vXHRFbGVtZW50IGZ1bmN0aW9uIHRoYXQgYXBwbGllcyBvdXIgZXh0ZW5kZWQgYmluZGluZ3Ncblx0Ly9cdE5vdGU6IFxuXHQvL1x0XHQuIFNvbWUgYXR0cmlidXRlcyBjYW4gYmUgcmVtb3ZlZCB3aGVuIGFwcGxpZWQsIGVnOiBjdXN0b20gYXR0cmlidXRlc1xuXHQvL1x0XG5cdG0uZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGF0dHJzLCBjaGlsZHJlbikge1xuXHRcdGZvciAodmFyIG5hbWUgaW4gYXR0cnMpIHtcblx0XHRcdGlmIChtLmJpbmRpbmdzW25hbWVdKSB7XG5cdFx0XHRcdG0uYmluZGluZ3NbbmFtZV0uZnVuYy5hcHBseShhdHRycywgW2F0dHJzW25hbWVdXSk7XG5cdFx0XHRcdGlmKG0uYmluZGluZ3NbbmFtZV0ucmVtb3ZlYWJsZSkge1xuXHRcdFx0XHRcdGRlbGV0ZSBhdHRyc1tuYW1lXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbShlbGVtZW50LCBhdHRycywgY2hpbGRyZW4pO1xuXHR9O1xuXG5cdC8vXHRBZGQgYmluZGluZ3MgbWV0aG9kXG5cdC8vXHROb24tc3RhbmRhcmQgYXR0cmlidXRlcyBkbyBub3QgbmVlZCB0byBiZSByZW5kZXJlZCwgZWc6IHZhbHVlSW5wdXRcblx0Ly9cdHNvIHRoZXkgYXJlIHNldCBhcyByZW1vdmFibGVcblx0bS5hZGRCaW5kaW5nID0gZnVuY3Rpb24obmFtZSwgZnVuYywgcmVtb3ZlYWJsZSl7XG5cdFx0bS5iaW5kaW5nc1tuYW1lXSA9IHtcblx0XHRcdGZ1bmM6IGZ1bmMsXG5cdFx0XHRyZW1vdmVhYmxlOiByZW1vdmVhYmxlXG5cdFx0fTtcblx0fTtcblxuXHQvL1x0R2V0IHRoZSB1bmRlcmx5aW5nIHZhbHVlIG9mIGEgcHJvcGVydHlcblx0bS51bndyYXAgPSBmdW5jdGlvbihwcm9wKSB7XG5cdFx0cmV0dXJuICh0eXBlb2YgcHJvcCA9PSBcImZ1bmN0aW9uXCIpPyBwcm9wKCk6IHByb3A7XG5cdH07XG5cblx0Ly9cdEJpLWRpcmVjdGlvbmFsIGJpbmRpbmcgb2YgdmFsdWVcblx0bS5hZGRCaW5kaW5nKFwidmFsdWVcIiwgZnVuY3Rpb24ocHJvcCkge1xuXHRcdGlmICh0eXBlb2YgcHJvcCA9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHRoaXMudmFsdWUgPSBwcm9wKCk7XG5cdFx0XHR0aGlzLm9uY2hhbmdlID0gbS53aXRoQXR0cihcInZhbHVlXCIsIHByb3ApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZhbHVlID0gcHJvcDtcblx0XHR9XG5cdH0pO1xuXG5cdC8vXHRCaS1kaXJlY3Rpb25hbCBiaW5kaW5nIG9mIGNoZWNrZWQgcHJvcGVydHlcblx0bS5hZGRCaW5kaW5nKFwiY2hlY2tlZFwiLCBmdW5jdGlvbihwcm9wKSB7XG5cdFx0aWYgKHR5cGVvZiBwcm9wID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0dGhpcy5jaGVja2VkID0gcHJvcCgpO1xuXHRcdFx0dGhpcy5vbmNoYW5nZSA9IG0ud2l0aEF0dHIoXCJjaGVja2VkXCIsIHByb3ApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNoZWNrZWQgPSBwcm9wO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9cdEhpZGUgbm9kZVxuXHRtLmFkZEJpbmRpbmcoXCJoaWRlXCIsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMuc3R5bGUgPSB7XG5cdFx0XHRkaXNwbGF5OiBtLnVud3JhcChwcm9wKT8gXCJub25lXCIgOiBcIlwiXG5cdFx0fTtcblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFRvZ2dsZSB2YWx1ZShzKSBvbiBjbGlja1xuXHRtLmFkZEJpbmRpbmcoJ3RvZ2dsZScsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMub25jbGljayA9IGZ1bmN0aW9uKCl7XG5cdFx0XHQvL1x0VG9nZ2xlIGFsbG93cyBhbiBlbnVtIGxpc3QgdG8gYmUgdG9nZ2xlZCwgZWc6IFtwcm9wLCB2YWx1ZTIsIHZhbHVlMl1cblx0XHRcdHZhciBpc0Z1bmMgPSB0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJywgdG1wLCBpLCB2YWxzID0gW10sIHZhbCwgdFZhbDtcblxuXHRcdFx0Ly9cdFRvZ2dsZSBib29sZWFuXG5cdFx0XHRpZihpc0Z1bmMpIHtcblx0XHRcdFx0dmFsdWUgPSBwcm9wKCk7XG5cdFx0XHRcdHByb3AoIXZhbHVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vXHRUb2dnbGUgZW51bWVyYXRpb25cblx0XHRcdFx0dG1wID0gcHJvcFswXTtcblx0XHRcdFx0dmFsID0gdG1wKCk7XG5cdFx0XHRcdHZhbHMgPSBwcm9wLnNsaWNlKDEpO1xuXHRcdFx0XHR0VmFsID0gdmFsc1swXTtcblxuXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCB2YWxzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdFx0aWYodmFsID09IHZhbHNbaV0pIHtcblx0XHRcdFx0XHRcdGlmKHR5cGVvZiB2YWxzW2krMV0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRcdHRWYWwgPSB2YWxzW2krMV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dG1wKHRWYWwpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0sIHRydWUpO1xuXG5cdC8vXHRTZXQgaG92ZXIgc3RhdGVzLCBhJ2xhIGpRdWVyeSBwYXR0ZXJuXG5cdG0uYWRkQmluZGluZygnaG92ZXInLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9ubW91c2VvdmVyID0gcHJvcFswXTtcblx0XHRpZihwcm9wWzFdKSB7XG5cdFx0XHR0aGlzLm9ubW91c2VvdXQgPSBwcm9wWzFdO1xuXHRcdH1cblx0fSwgdHJ1ZSApO1xuXG5cdC8vXHRBZGQgdmFsdWUgYmluZGluZ3MgZm9yIHZhcmlvdXMgZXZlbnQgdHlwZXMgXG5cdHZhciBldmVudHMgPSBbXCJJbnB1dFwiLCBcIktleXVwXCIsIFwiS2V5cHJlc3NcIl0sXG5cdFx0Y3JlYXRlQmluZGluZyA9IGZ1bmN0aW9uKG5hbWUsIGV2ZSl7XG5cdFx0XHQvL1x0QmktZGlyZWN0aW9uYWwgYmluZGluZyBvZiB2YWx1ZVxuXHRcdFx0bS5hZGRCaW5kaW5nKG5hbWUsIGZ1bmN0aW9uKHByb3ApIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBwcm9wID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRoaXMudmFsdWUgPSBwcm9wKCk7XG5cdFx0XHRcdFx0dGhpc1tldmVdID0gbS53aXRoQXR0cihcInZhbHVlXCIsIHByb3ApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudmFsdWUgPSBwcm9wO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0cnVlKTtcblx0XHR9O1xuXG5cdGZvcih2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHR2YXIgZXZlID0gZXZlbnRzW2ldO1xuXHRcdGNyZWF0ZUJpbmRpbmcoXCJ2YWx1ZVwiICsgZXZlLCBcIm9uXCIgKyBldmUudG9Mb3dlckNhc2UoKSk7XG5cdH1cblxuXG5cdC8vXHRTZXQgYSB2YWx1ZSBvbiBhIHByb3BlcnR5XG5cdG0uc2V0ID0gZnVuY3Rpb24ocHJvcCwgdmFsdWUpe1xuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdHByb3AodmFsdWUpO1xuXHRcdH07XG5cdH07XG5cblx0LypcdFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbiB0cmlnZ2VyIGEgYmluZGluZyBcblx0XHRVc2FnZTogb25jbGljazogbS50cmlnZ2VyKCdiaW5kaW5nJywgcHJvcClcblx0Ki9cblx0bS50cmlnZ2VyID0gZnVuY3Rpb24oKXtcblx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgbmFtZSA9IGFyZ3NbMF0sXG5cdFx0XHRcdGFyZ0xpc3QgPSBhcmdzLnNsaWNlKDEpO1xuXHRcdFx0aWYgKG0uYmluZGluZ3NbbmFtZV0pIHtcblx0XHRcdFx0bS5iaW5kaW5nc1tuYW1lXS5mdW5jLmFwcGx5KHRoaXMsIGFyZ0xpc3QpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH07XG5cblx0cmV0dXJuIG0uYmluZGluZ3M7XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IG1pdGhyaWxCaW5kaW5ncztcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtaXRocmlsQmluZGluZ3M7XG5cdH0pO1xufSBlbHNlIHtcblx0bWl0aHJpbEJpbmRpbmdzKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIj8gd2luZG93Lm0gfHwge306IHt9KTtcbn1cblxufSgpKTsiLCIvL1x0TWl0aHJpbCBzdWdhciB0YWdzLlxuLy9cdENvcHlyaWdodCAoQykgMjAxNSBqc2d1eSAoTWlra2VsIEJlcmdtYW5uKVxuLy9cdE1JVCBsaWNlbnNlZFxuKGZ1bmN0aW9uKCl7XG52YXIgbWl0aHJpbFN1Z2FydGFncyA9IGZ1bmN0aW9uKG0sIHNjb3BlKXtcblx0bS5zdWdhclRhZ3MgPSBtLnN1Z2FyVGFncyB8fCB7fTtcblx0c2NvcGUgPSBzY29wZSB8fCBtO1xuXG5cdHZhciBhcmcgPSBmdW5jdGlvbihsMSwgbDIpe1xuXHRcdFx0dmFyIGk7XG5cdFx0XHRmb3IgKGkgaW4gbDIpIHtpZihsMi5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0XHRsMS5wdXNoKGwyW2ldKTtcblx0XHRcdH19XG5cdFx0XHRyZXR1cm4gbDE7XG5cdFx0fSwgXG5cdFx0Z2V0Q2xhc3NMaXN0ID0gZnVuY3Rpb24oYXJncyl7XG5cdFx0XHR2YXIgaSwgcmVzdWx0O1xuXHRcdFx0Zm9yKGkgaW4gYXJncykge1xuXHRcdFx0XHRpZihhcmdzW2ldICYmIGFyZ3NbaV0uY2xhc3MpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIChhcmdzW2ldLmNsYXNzID09IFwic3RyaW5nXCIpPyBcblx0XHRcdFx0XHRcdGFyZ3NbaV0uY2xhc3Muc3BsaXQoXCIgXCIpOlxuXHRcdFx0XHRcdFx0ZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdG1ha2VTdWdhclRhZyA9IGZ1bmN0aW9uKHRhZykge1xuXHRcdFx0dmFyIGMsIGVsO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdFx0XHRcdC8vXHRpZiBjbGFzcyBpcyBzdHJpbmcsIGFsbG93IHVzZSBvZiBjYWNoZVxuXHRcdFx0XHRpZihjID0gZ2V0Q2xhc3NMaXN0KGFyZ3MpKSB7XG5cdFx0XHRcdFx0ZWwgPSBbdGFnICsgXCIuXCIgKyBjLmpvaW4oXCIuXCIpXTtcblx0XHRcdFx0XHQvL1x0UmVtb3ZlIGNsYXNzIHRhZywgc28gd2UgZG9uJ3QgZHVwbGljYXRlXG5cdFx0XHRcdFx0Zm9yKHZhciBpIGluIGFyZ3MpIHtcblx0XHRcdFx0XHRcdGlmKGFyZ3NbaV0gJiYgYXJnc1tpXS5jbGFzcykge1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgYXJnc1tpXS5jbGFzcztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZWwgPSBbdGFnXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKG0uZT8gbS5lOiBtKS5hcHBseSh0aGlzLCBhcmcoZWwsIGFyZ3MpKTtcblx0XHRcdH07XG5cdFx0fSxcblx0XHR0YWdMaXN0ID0gW1wiQVwiLFwiQUJCUlwiLFwiQUNST05ZTVwiLFwiQUREUkVTU1wiLFwiQVJFQVwiLFwiQVJUSUNMRVwiLFwiQVNJREVcIixcIkFVRElPXCIsXCJCXCIsXCJCRElcIixcIkJET1wiLFwiQklHXCIsXCJCTE9DS1FVT1RFXCIsXCJCT0RZXCIsXCJCUlwiLFwiQlVUVE9OXCIsXCJDQU5WQVNcIixcIkNBUFRJT05cIixcIkNJVEVcIixcIkNPREVcIixcIkNPTFwiLFwiQ09MR1JPVVBcIixcIkNPTU1BTkRcIixcIkRBVEFMSVNUXCIsXCJERFwiLFwiREVMXCIsXCJERVRBSUxTXCIsXCJERk5cIixcIkRJVlwiLFwiRExcIixcIkRUXCIsXCJFTVwiLFwiRU1CRURcIixcIkZJRUxEU0VUXCIsXCJGSUdDQVBUSU9OXCIsXCJGSUdVUkVcIixcIkZPT1RFUlwiLFwiRk9STVwiLFwiRlJBTUVcIixcIkZSQU1FU0VUXCIsXCJIMVwiLFwiSDJcIixcIkgzXCIsXCJINFwiLFwiSDVcIixcIkg2XCIsXCJIRUFEXCIsXCJIRUFERVJcIixcIkhHUk9VUFwiLFwiSFJcIixcIkhUTUxcIixcIklcIixcIklGUkFNRVwiLFwiSU1HXCIsXCJJTlBVVFwiLFwiSU5TXCIsXCJLQkRcIixcIktFWUdFTlwiLFwiTEFCRUxcIixcIkxFR0VORFwiLFwiTElcIixcIkxJTktcIixcIk1BUFwiLFwiTUFSS1wiLFwiTUVUQVwiLFwiTUVURVJcIixcIk5BVlwiLFwiTk9TQ1JJUFRcIixcIk9CSkVDVFwiLFwiT0xcIixcIk9QVEdST1VQXCIsXCJPUFRJT05cIixcIk9VVFBVVFwiLFwiUFwiLFwiUEFSQU1cIixcIlBSRVwiLFwiUFJPR1JFU1NcIixcIlFcIixcIlJQXCIsXCJSVFwiLFwiUlVCWVwiLFwiU0FNUFwiLFwiU0NSSVBUXCIsXCJTRUNUSU9OXCIsXCJTRUxFQ1RcIixcIlNNQUxMXCIsXCJTT1VSQ0VcIixcIlNQQU5cIixcIlNQTElUXCIsXCJTVFJPTkdcIixcIlNUWUxFXCIsXCJTVUJcIixcIlNVTU1BUllcIixcIlNVUFwiLFwiVEFCTEVcIixcIlRCT0RZXCIsXCJURFwiLFwiVEVYVEFSRUFcIixcIlRGT09UXCIsXCJUSFwiLFwiVEhFQURcIixcIlRJTUVcIixcIlRJVExFXCIsXCJUUlwiLFwiVFJBQ0tcIixcIlRUXCIsXCJVTFwiLFwiVkFSXCIsXCJWSURFT1wiLFwiV0JSXCJdLFxuXHRcdGxvd2VyVGFnQ2FjaGUgPSB7fSxcblx0XHRpO1xuXG5cdC8vXHRDcmVhdGUgc3VnYXInZCBmdW5jdGlvbnMgaW4gdGhlIHJlcXVpcmVkIHNjb3Blc1xuXHRmb3IgKGkgaW4gdGFnTGlzdCkge2lmKHRhZ0xpc3QuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHQoZnVuY3Rpb24odGFnKXtcblx0XHRcdHZhciBsb3dlclRhZyA9IHRhZy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0c2NvcGVbdGFnXSA9IGxvd2VyVGFnQ2FjaGVbbG93ZXJUYWddID0gbWFrZVN1Z2FyVGFnKGxvd2VyVGFnKTtcblx0XHR9KHRhZ0xpc3RbaV0pKTtcblx0fX1cblxuXHQvL1x0TG93ZXJjYXNlZCBzdWdhciB0YWdzXG5cdG0uc3VnYXJUYWdzLmxvd2VyID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gbG93ZXJUYWdDYWNoZTtcblx0fTtcblxuXHRyZXR1cm4gc2NvcGU7XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IG1pdGhyaWxTdWdhcnRhZ3M7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbWl0aHJpbFN1Z2FydGFncztcblx0fSk7XG59IGVsc2Uge1xuXHRtaXRocmlsU3VnYXJ0YWdzKFxuXHRcdHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIj8gd2luZG93Lm0gfHwge306IHt9LFxuXHRcdHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIj8gd2luZG93OiB7fVxuXHQpO1xufVxuXG59KCkpOyIsInZhciBtID0gKGZ1bmN0aW9uIGFwcCh3aW5kb3csIHVuZGVmaW5lZCkge1xyXG5cdHZhciBPQkpFQ1QgPSBcIltvYmplY3QgT2JqZWN0XVwiLCBBUlJBWSA9IFwiW29iamVjdCBBcnJheV1cIiwgU1RSSU5HID0gXCJbb2JqZWN0IFN0cmluZ11cIiwgRlVOQ1RJT04gPSBcImZ1bmN0aW9uXCI7XHJcblx0dmFyIHR5cGUgPSB7fS50b1N0cmluZztcclxuXHR2YXIgcGFyc2VyID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsuKz9cXF0pL2csIGF0dHJQYXJzZXIgPSAvXFxbKC4rPykoPzo9KFwifCd8KSguKj8pXFwyKT9cXF0vO1xyXG5cdHZhciB2b2lkRWxlbWVudHMgPSAvXihBUkVBfEJBU0V8QlJ8Q09MfENPTU1BTkR8RU1CRUR8SFJ8SU1HfElOUFVUfEtFWUdFTnxMSU5LfE1FVEF8UEFSQU18U09VUkNFfFRSQUNLfFdCUikkLztcclxuXHR2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge31cclxuXHJcblx0Ly8gY2FjaGluZyBjb21tb25seSB1c2VkIHZhcmlhYmxlc1xyXG5cdHZhciAkZG9jdW1lbnQsICRsb2NhdGlvbiwgJHJlcXVlc3RBbmltYXRpb25GcmFtZSwgJGNhbmNlbEFuaW1hdGlvbkZyYW1lO1xyXG5cclxuXHQvLyBzZWxmIGludm9raW5nIGZ1bmN0aW9uIG5lZWRlZCBiZWNhdXNlIG9mIHRoZSB3YXkgbW9ja3Mgd29ya1xyXG5cdGZ1bmN0aW9uIGluaXRpYWxpemUod2luZG93KXtcclxuXHRcdCRkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcclxuXHRcdCRsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcclxuXHRcdCRjYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuY2xlYXJUaW1lb3V0O1xyXG5cdFx0JHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LnNldFRpbWVvdXQ7XHJcblx0fVxyXG5cclxuXHRpbml0aWFsaXplKHdpbmRvdyk7XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBAdHlwZWRlZiB7U3RyaW5nfSBUYWdcclxuXHQgKiBBIHN0cmluZyB0aGF0IGxvb2tzIGxpa2UgLT4gZGl2LmNsYXNzbmFtZSNpZFtwYXJhbT1vbmVdW3BhcmFtMj10d29dXHJcblx0ICogV2hpY2ggZGVzY3JpYmVzIGEgRE9NIG5vZGVcclxuXHQgKi9cclxuXHJcblx0LyoqXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge1RhZ30gVGhlIERPTSBub2RlIHRhZ1xyXG5cdCAqIEBwYXJhbSB7T2JqZWN0PVtdfSBvcHRpb25hbCBrZXktdmFsdWUgcGFpcnMgdG8gYmUgbWFwcGVkIHRvIERPTSBhdHRyc1xyXG5cdCAqIEBwYXJhbSB7Li4ubU5vZGU9W119IFplcm8gb3IgbW9yZSBNaXRocmlsIGNoaWxkIG5vZGVzLiBDYW4gYmUgYW4gYXJyYXksIG9yIHNwbGF0IChvcHRpb25hbClcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG0oKSB7XHJcblx0XHR2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuXHRcdHZhciBoYXNBdHRycyA9IGFyZ3NbMV0gIT0gbnVsbCAmJiB0eXBlLmNhbGwoYXJnc1sxXSkgPT09IE9CSkVDVCAmJiAhKFwidGFnXCIgaW4gYXJnc1sxXSB8fCBcInZpZXdcIiBpbiBhcmdzWzFdKSAmJiAhKFwic3VidHJlZVwiIGluIGFyZ3NbMV0pO1xyXG5cdFx0dmFyIGF0dHJzID0gaGFzQXR0cnMgPyBhcmdzWzFdIDoge307XHJcblx0XHR2YXIgY2xhc3NBdHRyTmFtZSA9IFwiY2xhc3NcIiBpbiBhdHRycyA/IFwiY2xhc3NcIiA6IFwiY2xhc3NOYW1lXCI7XHJcblx0XHR2YXIgY2VsbCA9IHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7fX07XHJcblx0XHR2YXIgbWF0Y2gsIGNsYXNzZXMgPSBbXTtcclxuXHRcdGlmICh0eXBlLmNhbGwoYXJnc1swXSkgIT0gU1RSSU5HKSB0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RvciBpbiBtKHNlbGVjdG9yLCBhdHRycywgY2hpbGRyZW4pIHNob3VsZCBiZSBhIHN0cmluZ1wiKVxyXG5cdFx0d2hpbGUgKG1hdGNoID0gcGFyc2VyLmV4ZWMoYXJnc1swXSkpIHtcclxuXHRcdFx0aWYgKG1hdGNoWzFdID09PSBcIlwiICYmIG1hdGNoWzJdKSBjZWxsLnRhZyA9IG1hdGNoWzJdO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCIjXCIpIGNlbGwuYXR0cnMuaWQgPSBtYXRjaFsyXTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbMV0gPT09IFwiLlwiKSBjbGFzc2VzLnB1c2gobWF0Y2hbMl0pO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFszXVswXSA9PT0gXCJbXCIpIHtcclxuXHRcdFx0XHR2YXIgcGFpciA9IGF0dHJQYXJzZXIuZXhlYyhtYXRjaFszXSk7XHJcblx0XHRcdFx0Y2VsbC5hdHRyc1twYWlyWzFdXSA9IHBhaXJbM10gfHwgKHBhaXJbMl0gPyBcIlwiIDp0cnVlKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNoaWxkcmVuID0gaGFzQXR0cnMgPyBhcmdzLnNsaWNlKDIpIDogYXJncy5zbGljZSgxKTtcclxuXHRcdGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgdHlwZS5jYWxsKGNoaWxkcmVuWzBdKSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0Y2VsbC5jaGlsZHJlbiA9IGNoaWxkcmVuWzBdXHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y2VsbC5jaGlsZHJlbiA9IGNoaWxkcmVuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGF0dHJzKSB7XHJcblx0XHRcdGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShhdHRyTmFtZSkpIHtcclxuXHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IGNsYXNzQXR0ck5hbWUgJiYgYXR0cnNbYXR0ck5hbWVdICE9IG51bGwgJiYgYXR0cnNbYXR0ck5hbWVdICE9PSBcIlwiKSB7XHJcblx0XHRcdFx0XHRjbGFzc2VzLnB1c2goYXR0cnNbYXR0ck5hbWVdKVxyXG5cdFx0XHRcdFx0Y2VsbC5hdHRyc1thdHRyTmFtZV0gPSBcIlwiIC8vY3JlYXRlIGtleSBpbiBjb3JyZWN0IGl0ZXJhdGlvbiBvcmRlclxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gYXR0cnNbYXR0ck5hbWVdXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChjbGFzc2VzLmxlbmd0aCA+IDApIGNlbGwuYXR0cnNbY2xhc3NBdHRyTmFtZV0gPSBjbGFzc2VzLmpvaW4oXCIgXCIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gY2VsbFxyXG5cdH1cclxuXHRmdW5jdGlvbiBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIHBhcmVudENhY2hlLCBwYXJlbnRJbmRleCwgZGF0YSwgY2FjaGVkLCBzaG91bGRSZWF0dGFjaCwgaW5kZXgsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcclxuXHRcdC8vYGJ1aWxkYCBpcyBhIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IG1hbmFnZXMgY3JlYXRpb24vZGlmZmluZy9yZW1vdmFsIG9mIERPTSBlbGVtZW50cyBiYXNlZCBvbiBjb21wYXJpc29uIGJldHdlZW4gYGRhdGFgIGFuZCBgY2FjaGVkYFxyXG5cdFx0Ly90aGUgZGlmZiBhbGdvcml0aG0gY2FuIGJlIHN1bW1hcml6ZWQgYXMgdGhpczpcclxuXHRcdC8vMSAtIGNvbXBhcmUgYGRhdGFgIGFuZCBgY2FjaGVkYFxyXG5cdFx0Ly8yIC0gaWYgdGhleSBhcmUgZGlmZmVyZW50LCBjb3B5IGBkYXRhYCB0byBgY2FjaGVkYCBhbmQgdXBkYXRlIHRoZSBET00gYmFzZWQgb24gd2hhdCB0aGUgZGlmZmVyZW5jZSBpc1xyXG5cdFx0Ly8zIC0gcmVjdXJzaXZlbHkgYXBwbHkgdGhpcyBhbGdvcml0aG0gZm9yIGV2ZXJ5IGFycmF5IGFuZCBmb3IgdGhlIGNoaWxkcmVuIG9mIGV2ZXJ5IHZpcnR1YWwgZWxlbWVudFxyXG5cclxuXHRcdC8vdGhlIGBjYWNoZWRgIGRhdGEgc3RydWN0dXJlIGlzIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyByZWRyYXcncyBgZGF0YWAgZGF0YSBzdHJ1Y3R1cmUsIHdpdGggYSBmZXcgYWRkaXRpb25zOlxyXG5cdFx0Ly8tIGBjYWNoZWRgIGFsd2F5cyBoYXMgYSBwcm9wZXJ0eSBjYWxsZWQgYG5vZGVzYCwgd2hpY2ggaXMgYSBsaXN0IG9mIERPTSBlbGVtZW50cyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGRhdGEgcmVwcmVzZW50ZWQgYnkgdGhlIHJlc3BlY3RpdmUgdmlydHVhbCBlbGVtZW50XHJcblx0XHQvLy0gaW4gb3JkZXIgdG8gc3VwcG9ydCBhdHRhY2hpbmcgYG5vZGVzYCBhcyBhIHByb3BlcnR5IG9mIGBjYWNoZWRgLCBgY2FjaGVkYCBpcyAqYWx3YXlzKiBhIG5vbi1wcmltaXRpdmUgb2JqZWN0LCBpLmUuIGlmIHRoZSBkYXRhIHdhcyBhIHN0cmluZywgdGhlbiBjYWNoZWQgaXMgYSBTdHJpbmcgaW5zdGFuY2UuIElmIGRhdGEgd2FzIGBudWxsYCBvciBgdW5kZWZpbmVkYCwgY2FjaGVkIGlzIGBuZXcgU3RyaW5nKFwiXCIpYFxyXG5cdFx0Ly8tIGBjYWNoZWQgYWxzbyBoYXMgYSBgY29uZmlnQ29udGV4dGAgcHJvcGVydHksIHdoaWNoIGlzIHRoZSBzdGF0ZSBzdG9yYWdlIG9iamVjdCBleHBvc2VkIGJ5IGNvbmZpZyhlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KVxyXG5cdFx0Ly8tIHdoZW4gYGNhY2hlZGAgaXMgYW4gT2JqZWN0LCBpdCByZXByZXNlbnRzIGEgdmlydHVhbCBlbGVtZW50OyB3aGVuIGl0J3MgYW4gQXJyYXksIGl0IHJlcHJlc2VudHMgYSBsaXN0IG9mIGVsZW1lbnRzOyB3aGVuIGl0J3MgYSBTdHJpbmcsIE51bWJlciBvciBCb29sZWFuLCBpdCByZXByZXNlbnRzIGEgdGV4dCBub2RlXHJcblxyXG5cdFx0Ly9gcGFyZW50RWxlbWVudGAgaXMgYSBET00gZWxlbWVudCB1c2VkIGZvciBXM0MgRE9NIEFQSSBjYWxsc1xyXG5cdFx0Ly9gcGFyZW50VGFnYCBpcyBvbmx5IHVzZWQgZm9yIGhhbmRsaW5nIGEgY29ybmVyIGNhc2UgZm9yIHRleHRhcmVhIHZhbHVlc1xyXG5cdFx0Ly9gcGFyZW50Q2FjaGVgIGlzIHVzZWQgdG8gcmVtb3ZlIG5vZGVzIGluIHNvbWUgbXVsdGktbm9kZSBjYXNlc1xyXG5cdFx0Ly9gcGFyZW50SW5kZXhgIGFuZCBgaW5kZXhgIGFyZSB1c2VkIHRvIGZpZ3VyZSBvdXQgdGhlIG9mZnNldCBvZiBub2Rlcy4gVGhleSdyZSBhcnRpZmFjdHMgZnJvbSBiZWZvcmUgYXJyYXlzIHN0YXJ0ZWQgYmVpbmcgZmxhdHRlbmVkIGFuZCBhcmUgbGlrZWx5IHJlZmFjdG9yYWJsZVxyXG5cdFx0Ly9gZGF0YWAgYW5kIGBjYWNoZWRgIGFyZSwgcmVzcGVjdGl2ZWx5LCB0aGUgbmV3IGFuZCBvbGQgbm9kZXMgYmVpbmcgZGlmZmVkXHJcblx0XHQvL2BzaG91bGRSZWF0dGFjaGAgaXMgYSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBhIHBhcmVudCBub2RlIHdhcyByZWNyZWF0ZWQgKGlmIHNvLCBhbmQgaWYgdGhpcyBub2RlIGlzIHJldXNlZCwgdGhlbiB0aGlzIG5vZGUgbXVzdCByZWF0dGFjaCBpdHNlbGYgdG8gdGhlIG5ldyBwYXJlbnQpXHJcblx0XHQvL2BlZGl0YWJsZWAgaXMgYSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgYW4gYW5jZXN0b3IgaXMgY29udGVudGVkaXRhYmxlXHJcblx0XHQvL2BuYW1lc3BhY2VgIGluZGljYXRlcyB0aGUgY2xvc2VzdCBIVE1MIG5hbWVzcGFjZSBhcyBpdCBjYXNjYWRlcyBkb3duIGZyb20gYW4gYW5jZXN0b3JcclxuXHRcdC8vYGNvbmZpZ3NgIGlzIGEgbGlzdCBvZiBjb25maWcgZnVuY3Rpb25zIHRvIHJ1biBhZnRlciB0aGUgdG9wbW9zdCBgYnVpbGRgIGNhbGwgZmluaXNoZXMgcnVubmluZ1xyXG5cclxuXHRcdC8vdGhlcmUncyBsb2dpYyB0aGF0IHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IG51bGwgYW5kIHVuZGVmaW5lZCBkYXRhIGFyZSBlcXVpdmFsZW50IHRvIGVtcHR5IHN0cmluZ3NcclxuXHRcdC8vLSB0aGlzIHByZXZlbnRzIGxpZmVjeWNsZSBzdXJwcmlzZXMgZnJvbSBwcm9jZWR1cmFsIGhlbHBlcnMgdGhhdCBtaXggaW1wbGljaXQgYW5kIGV4cGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzIChlLmcuIGZ1bmN0aW9uIGZvbygpIHtpZiAoY29uZCkgcmV0dXJuIG0oXCJkaXZcIil9XHJcblx0XHQvLy0gaXQgc2ltcGxpZmllcyBkaWZmaW5nIGNvZGVcclxuXHRcdC8vZGF0YS50b1N0cmluZygpIG1pZ2h0IHRocm93IG9yIHJldHVybiBudWxsIGlmIGRhdGEgaXMgdGhlIHJldHVybiB2YWx1ZSBvZiBDb25zb2xlLmxvZyBpbiBGaXJlZm94IChiZWhhdmlvciBkZXBlbmRzIG9uIHZlcnNpb24pXHJcblx0XHR0cnkge2lmIChkYXRhID09IG51bGwgfHwgZGF0YS50b1N0cmluZygpID09IG51bGwpIGRhdGEgPSBcIlwiO30gY2F0Y2ggKGUpIHtkYXRhID0gXCJcIn1cclxuXHRcdGlmIChkYXRhLnN1YnRyZWUgPT09IFwicmV0YWluXCIpIHJldHVybiBjYWNoZWQ7XHJcblx0XHR2YXIgY2FjaGVkVHlwZSA9IHR5cGUuY2FsbChjYWNoZWQpLCBkYXRhVHlwZSA9IHR5cGUuY2FsbChkYXRhKTtcclxuXHRcdGlmIChjYWNoZWQgPT0gbnVsbCB8fCBjYWNoZWRUeXBlICE9PSBkYXRhVHlwZSkge1xyXG5cdFx0XHRpZiAoY2FjaGVkICE9IG51bGwpIHtcclxuXHRcdFx0XHRpZiAocGFyZW50Q2FjaGUgJiYgcGFyZW50Q2FjaGUubm9kZXMpIHtcclxuXHRcdFx0XHRcdHZhciBvZmZzZXQgPSBpbmRleCAtIHBhcmVudEluZGV4O1xyXG5cdFx0XHRcdFx0dmFyIGVuZCA9IG9mZnNldCArIChkYXRhVHlwZSA9PT0gQVJSQVkgPyBkYXRhIDogY2FjaGVkLm5vZGVzKS5sZW5ndGg7XHJcblx0XHRcdFx0XHRjbGVhcihwYXJlbnRDYWNoZS5ub2Rlcy5zbGljZShvZmZzZXQsIGVuZCksIHBhcmVudENhY2hlLnNsaWNlKG9mZnNldCwgZW5kKSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZiAoY2FjaGVkLm5vZGVzKSBjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZClcclxuXHRcdFx0fVxyXG5cdFx0XHRjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcjtcclxuXHRcdFx0aWYgKGNhY2hlZC50YWcpIGNhY2hlZCA9IHt9OyAvL2lmIGNvbnN0cnVjdG9yIGNyZWF0ZXMgYSB2aXJ0dWFsIGRvbSBlbGVtZW50LCB1c2UgYSBibGFuayBvYmplY3QgYXMgdGhlIGJhc2UgY2FjaGVkIG5vZGUgaW5zdGVhZCBvZiBjb3B5aW5nIHRoZSB2aXJ0dWFsIGVsICgjMjc3KVxyXG5cdFx0XHRjYWNoZWQubm9kZXMgPSBbXVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChkYXRhVHlwZSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0Ly9yZWN1cnNpdmVseSBmbGF0dGVuIGFycmF5XHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHR5cGUuY2FsbChkYXRhW2ldKSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0XHRcdGRhdGEgPSBkYXRhLmNvbmNhdC5hcHBseShbXSwgZGF0YSk7XHJcblx0XHRcdFx0XHRpLS0gLy9jaGVjayBjdXJyZW50IGluZGV4IGFnYWluIGFuZCBmbGF0dGVuIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5lc3RlZCBhcnJheXMgYXQgdGhhdCBpbmRleFxyXG5cdFx0XHRcdFx0bGVuID0gZGF0YS5sZW5ndGhcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBub2RlcyA9IFtdLCBpbnRhY3QgPSBjYWNoZWQubGVuZ3RoID09PSBkYXRhLmxlbmd0aCwgc3ViQXJyYXlDb3VudCA9IDA7XHJcblxyXG5cdFx0XHQvL2tleXMgYWxnb3JpdGhtOiBzb3J0IGVsZW1lbnRzIHdpdGhvdXQgcmVjcmVhdGluZyB0aGVtIGlmIGtleXMgYXJlIHByZXNlbnRcclxuXHRcdFx0Ly8xKSBjcmVhdGUgYSBtYXAgb2YgYWxsIGV4aXN0aW5nIGtleXMsIGFuZCBtYXJrIGFsbCBmb3IgZGVsZXRpb25cclxuXHRcdFx0Ly8yKSBhZGQgbmV3IGtleXMgdG8gbWFwIGFuZCBtYXJrIHRoZW0gZm9yIGFkZGl0aW9uXHJcblx0XHRcdC8vMykgaWYga2V5IGV4aXN0cyBpbiBuZXcgbGlzdCwgY2hhbmdlIGFjdGlvbiBmcm9tIGRlbGV0aW9uIHRvIGEgbW92ZVxyXG5cdFx0XHQvLzQpIGZvciBlYWNoIGtleSwgaGFuZGxlIGl0cyBjb3JyZXNwb25kaW5nIGFjdGlvbiBhcyBtYXJrZWQgaW4gcHJldmlvdXMgc3RlcHNcclxuXHRcdFx0dmFyIERFTEVUSU9OID0gMSwgSU5TRVJUSU9OID0gMiAsIE1PVkUgPSAzO1xyXG5cdFx0XHR2YXIgZXhpc3RpbmcgPSB7fSwgc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gZmFsc2U7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FjaGVkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKGNhY2hlZFtpXSAmJiBjYWNoZWRbaV0uYXR0cnMgJiYgY2FjaGVkW2ldLmF0dHJzLmtleSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSB0cnVlO1xyXG5cdFx0XHRcdFx0ZXhpc3RpbmdbY2FjaGVkW2ldLmF0dHJzLmtleV0gPSB7YWN0aW9uOiBERUxFVElPTiwgaW5kZXg6IGl9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZ3VpZCA9IDBcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoZGF0YVtpXSAmJiBkYXRhW2ldLmF0dHJzICYmIGRhdGFbaV0uYXR0cnMua2V5ICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGogPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XHJcblx0XHRcdFx0XHRcdGlmIChkYXRhW2pdICYmIGRhdGFbal0uYXR0cnMgJiYgZGF0YVtqXS5hdHRycy5rZXkgPT0gbnVsbCkgZGF0YVtqXS5hdHRycy5rZXkgPSBcIl9fbWl0aHJpbF9fXCIgKyBndWlkKytcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzKSB7XHJcblx0XHRcdFx0dmFyIGtleXNEaWZmZXIgPSBmYWxzZVxyXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCAhPSBjYWNoZWQubGVuZ3RoKSBrZXlzRGlmZmVyID0gdHJ1ZVxyXG5cdFx0XHRcdGVsc2UgZm9yICh2YXIgaSA9IDAsIGNhY2hlZENlbGwsIGRhdGFDZWxsOyBjYWNoZWRDZWxsID0gY2FjaGVkW2ldLCBkYXRhQ2VsbCA9IGRhdGFbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKGNhY2hlZENlbGwuYXR0cnMgJiYgZGF0YUNlbGwuYXR0cnMgJiYgY2FjaGVkQ2VsbC5hdHRycy5rZXkgIT0gZGF0YUNlbGwuYXR0cnMua2V5KSB7XHJcblx0XHRcdFx0XHRcdGtleXNEaWZmZXIgPSB0cnVlXHJcblx0XHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChrZXlzRGlmZmVyKSB7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtpXSAmJiBkYXRhW2ldLmF0dHJzKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGRhdGFbaV0uYXR0cnMua2V5ICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBrZXkgPSBkYXRhW2ldLmF0dHJzLmtleTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICghZXhpc3Rpbmdba2V5XSkgZXhpc3Rpbmdba2V5XSA9IHthY3Rpb246IElOU0VSVElPTiwgaW5kZXg6IGl9O1xyXG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBleGlzdGluZ1trZXldID0ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb246IE1PVkUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGluZGV4OiBpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmcm9tOiBleGlzdGluZ1trZXldLmluZGV4LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRlbGVtZW50OiBjYWNoZWQubm9kZXNbZXhpc3Rpbmdba2V5XS5pbmRleF0gfHwgJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBhY3Rpb25zID0gW11cclxuXHRcdFx0XHRcdGZvciAodmFyIHByb3AgaW4gZXhpc3RpbmcpIGFjdGlvbnMucHVzaChleGlzdGluZ1twcm9wXSlcclxuXHRcdFx0XHRcdHZhciBjaGFuZ2VzID0gYWN0aW9ucy5zb3J0KHNvcnRDaGFuZ2VzKTtcclxuXHRcdFx0XHRcdHZhciBuZXdDYWNoZWQgPSBuZXcgQXJyYXkoY2FjaGVkLmxlbmd0aClcclxuXHRcdFx0XHRcdG5ld0NhY2hlZC5ub2RlcyA9IGNhY2hlZC5ub2Rlcy5zbGljZSgpXHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNoYW5nZTsgY2hhbmdlID0gY2hhbmdlc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBERUxFVElPTikge1xyXG5cdFx0XHRcdFx0XHRcdGNsZWFyKGNhY2hlZFtjaGFuZ2UuaW5kZXhdLm5vZGVzLCBjYWNoZWRbY2hhbmdlLmluZGV4XSk7XHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FjaGVkLnNwbGljZShjaGFuZ2UuaW5kZXgsIDEpXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IElOU0VSVElPTikge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBkdW1teSA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0XHRcdFx0XHRcdGR1bW15LmtleSA9IGRhdGFbY2hhbmdlLmluZGV4XS5hdHRycy5rZXk7XHJcblx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoZHVtbXksIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdIHx8IG51bGwpO1xyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlLmluZGV4LCAwLCB7YXR0cnM6IHtrZXk6IGRhdGFbY2hhbmdlLmluZGV4XS5hdHRycy5rZXl9LCBub2RlczogW2R1bW15XX0pXHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FjaGVkLm5vZGVzW2NoYW5nZS5pbmRleF0gPSBkdW1teVxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gTU9WRSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSAhPT0gY2hhbmdlLmVsZW1lbnQgJiYgY2hhbmdlLmVsZW1lbnQgIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGNoYW5nZS5lbGVtZW50LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSB8fCBudWxsKVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWRbY2hhbmdlLmluZGV4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV1cclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWQubm9kZXNbY2hhbmdlLmluZGV4XSA9IGNoYW5nZS5lbGVtZW50XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGNhY2hlZCA9IG5ld0NhY2hlZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly9lbmQga2V5IGFsZ29yaXRobVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNhY2hlQ291bnQgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0Ly9kaWZmIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXlcclxuXHRcdFx0XHR2YXIgaXRlbSA9IGJ1aWxkKHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgY2FjaGVkLCBpbmRleCwgZGF0YVtpXSwgY2FjaGVkW2NhY2hlQ291bnRdLCBzaG91bGRSZWF0dGFjaCwgaW5kZXggKyBzdWJBcnJheUNvdW50IHx8IHN1YkFycmF5Q291bnQsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xyXG5cdFx0XHRcdGlmIChpdGVtID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xyXG5cdFx0XHRcdGlmICghaXRlbS5ub2Rlcy5pbnRhY3QpIGludGFjdCA9IGZhbHNlO1xyXG5cdFx0XHRcdGlmIChpdGVtLiR0cnVzdGVkKSB7XHJcblx0XHRcdFx0XHQvL2ZpeCBvZmZzZXQgb2YgbmV4dCBlbGVtZW50IGlmIGl0ZW0gd2FzIGEgdHJ1c3RlZCBzdHJpbmcgdy8gbW9yZSB0aGFuIG9uZSBodG1sIGVsZW1lbnRcclxuXHRcdFx0XHRcdC8vdGhlIGZpcnN0IGNsYXVzZSBpbiB0aGUgcmVnZXhwIG1hdGNoZXMgZWxlbWVudHNcclxuXHRcdFx0XHRcdC8vdGhlIHNlY29uZCBjbGF1c2UgKGFmdGVyIHRoZSBwaXBlKSBtYXRjaGVzIHRleHQgbm9kZXNcclxuXHRcdFx0XHRcdHN1YkFycmF5Q291bnQgKz0gKGl0ZW0ubWF0Y2goLzxbXlxcL118XFw+XFxzKltePF0vZykgfHwgWzBdKS5sZW5ndGhcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBzdWJBcnJheUNvdW50ICs9IHR5cGUuY2FsbChpdGVtKSA9PT0gQVJSQVkgPyBpdGVtLmxlbmd0aCA6IDE7XHJcblx0XHRcdFx0Y2FjaGVkW2NhY2hlQ291bnQrK10gPSBpdGVtXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFpbnRhY3QpIHtcclxuXHRcdFx0XHQvL2RpZmYgdGhlIGFycmF5IGl0c2VsZlxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vdXBkYXRlIHRoZSBsaXN0IG9mIERPTSBub2RlcyBieSBjb2xsZWN0aW5nIHRoZSBub2RlcyBmcm9tIGVhY2ggaXRlbVxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAoY2FjaGVkW2ldICE9IG51bGwpIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIGNhY2hlZFtpXS5ub2RlcylcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9yZW1vdmUgaXRlbXMgZnJvbSB0aGUgZW5kIG9mIHRoZSBhcnJheSBpZiB0aGUgbmV3IGFycmF5IGlzIHNob3J0ZXIgdGhhbiB0aGUgb2xkIG9uZVxyXG5cdFx0XHRcdC8vaWYgZXJyb3JzIGV2ZXIgaGFwcGVuIGhlcmUsIHRoZSBpc3N1ZSBpcyBtb3N0IGxpa2VseSBhIGJ1ZyBpbiB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBzb21ld2hlcmUgZWFybGllciBpbiB0aGUgcHJvZ3JhbVxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBub2RlOyBub2RlID0gY2FjaGVkLm5vZGVzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUgIT0gbnVsbCAmJiBub2Rlcy5pbmRleE9mKG5vZGUpIDwgMCkgY2xlYXIoW25vZGVdLCBbY2FjaGVkW2ldXSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoIDwgY2FjaGVkLmxlbmd0aCkgY2FjaGVkLmxlbmd0aCA9IGRhdGEubGVuZ3RoO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKGRhdGEgIT0gbnVsbCAmJiBkYXRhVHlwZSA9PT0gT0JKRUNUKSB7XHJcblx0XHRcdHZhciB2aWV3cyA9IFtdLCBjb250cm9sbGVycyA9IFtdXHJcblx0XHRcdHdoaWxlIChkYXRhLnZpZXcpIHtcclxuXHRcdFx0XHR2YXIgdmlldyA9IGRhdGEudmlldy4kb3JpZ2luYWwgfHwgZGF0YS52aWV3XHJcblx0XHRcdFx0dmFyIGNvbnRyb2xsZXJJbmRleCA9IG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT0gXCJkaWZmXCIgJiYgY2FjaGVkLnZpZXdzID8gY2FjaGVkLnZpZXdzLmluZGV4T2YodmlldykgOiAtMVxyXG5cdFx0XHRcdHZhciBjb250cm9sbGVyID0gY29udHJvbGxlckluZGV4ID4gLTEgPyBjYWNoZWQuY29udHJvbGxlcnNbY29udHJvbGxlckluZGV4XSA6IG5ldyAoZGF0YS5jb250cm9sbGVyIHx8IG5vb3ApXHJcblx0XHRcdFx0dmFyIGtleSA9IGRhdGEgJiYgZGF0YS5hdHRycyAmJiBkYXRhLmF0dHJzLmtleVxyXG5cdFx0XHRcdGRhdGEgPSBwZW5kaW5nUmVxdWVzdHMgPT0gMCB8fCAoY2FjaGVkICYmIGNhY2hlZC5jb250cm9sbGVycyAmJiBjYWNoZWQuY29udHJvbGxlcnMuaW5kZXhPZihjb250cm9sbGVyKSA+IC0xKSA/IGRhdGEudmlldyhjb250cm9sbGVyKSA6IHt0YWc6IFwicGxhY2Vob2xkZXJcIn1cclxuXHRcdFx0XHRpZiAoZGF0YS5zdWJ0cmVlID09PSBcInJldGFpblwiKSByZXR1cm4gY2FjaGVkO1xyXG5cdFx0XHRcdGlmIChrZXkpIHtcclxuXHRcdFx0XHRcdGlmICghZGF0YS5hdHRycykgZGF0YS5hdHRycyA9IHt9XHJcblx0XHRcdFx0XHRkYXRhLmF0dHJzLmtleSA9IGtleVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoY29udHJvbGxlci5vbnVubG9hZCkgdW5sb2FkZXJzLnB1c2goe2NvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIGhhbmRsZXI6IGNvbnRyb2xsZXIub251bmxvYWR9KVxyXG5cdFx0XHRcdHZpZXdzLnB1c2godmlldylcclxuXHRcdFx0XHRjb250cm9sbGVycy5wdXNoKGNvbnRyb2xsZXIpXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFkYXRhLnRhZyAmJiBjb250cm9sbGVycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudCB0ZW1wbGF0ZSBtdXN0IHJldHVybiBhIHZpcnR1YWwgZWxlbWVudCwgbm90IGFuIGFycmF5LCBzdHJpbmcsIGV0Yy5cIilcclxuXHRcdFx0aWYgKCFkYXRhLmF0dHJzKSBkYXRhLmF0dHJzID0ge307XHJcblx0XHRcdGlmICghY2FjaGVkLmF0dHJzKSBjYWNoZWQuYXR0cnMgPSB7fTtcclxuXHJcblx0XHRcdHZhciBkYXRhQXR0cktleXMgPSBPYmplY3Qua2V5cyhkYXRhLmF0dHJzKVxyXG5cdFx0XHR2YXIgaGFzS2V5cyA9IGRhdGFBdHRyS2V5cy5sZW5ndGggPiAoXCJrZXlcIiBpbiBkYXRhLmF0dHJzID8gMSA6IDApXHJcblx0XHRcdC8vaWYgYW4gZWxlbWVudCBpcyBkaWZmZXJlbnQgZW5vdWdoIGZyb20gdGhlIG9uZSBpbiBjYWNoZSwgcmVjcmVhdGUgaXRcclxuXHRcdFx0aWYgKGRhdGEudGFnICE9IGNhY2hlZC50YWcgfHwgZGF0YUF0dHJLZXlzLnNvcnQoKS5qb2luKCkgIT0gT2JqZWN0LmtleXMoY2FjaGVkLmF0dHJzKS5zb3J0KCkuam9pbigpIHx8IGRhdGEuYXR0cnMuaWQgIT0gY2FjaGVkLmF0dHJzLmlkIHx8IGRhdGEuYXR0cnMua2V5ICE9IGNhY2hlZC5hdHRycy5rZXkgfHwgKG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT0gXCJhbGxcIiAmJiAoIWNhY2hlZC5jb25maWdDb250ZXh0IHx8IGNhY2hlZC5jb25maWdDb250ZXh0LnJldGFpbiAhPT0gdHJ1ZSkpIHx8IChtLnJlZHJhdy5zdHJhdGVneSgpID09IFwiZGlmZlwiICYmIGNhY2hlZC5jb25maWdDb250ZXh0ICYmIGNhY2hlZC5jb25maWdDb250ZXh0LnJldGFpbiA9PT0gZmFsc2UpKSB7XHJcblx0XHRcdFx0aWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGgpIGNsZWFyKGNhY2hlZC5ub2Rlcyk7XHJcblx0XHRcdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIHR5cGVvZiBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKClcclxuXHRcdFx0XHRpZiAoY2FjaGVkLmNvbnRyb2xsZXJzKSB7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29udHJvbGxlcjsgY29udHJvbGxlciA9IGNhY2hlZC5jb250cm9sbGVyc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgY29udHJvbGxlci5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIGNvbnRyb2xsZXIub251bmxvYWQoe3ByZXZlbnREZWZhdWx0OiBub29wfSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHR5cGUuY2FsbChkYXRhLnRhZykgIT0gU1RSSU5HKSByZXR1cm47XHJcblxyXG5cdFx0XHR2YXIgbm9kZSwgaXNOZXcgPSBjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwO1xyXG5cdFx0XHRpZiAoZGF0YS5hdHRycy54bWxucykgbmFtZXNwYWNlID0gZGF0YS5hdHRycy54bWxucztcclxuXHRcdFx0ZWxzZSBpZiAoZGF0YS50YWcgPT09IFwic3ZnXCIpIG5hbWVzcGFjZSA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcclxuXHRcdFx0ZWxzZSBpZiAoZGF0YS50YWcgPT09IFwibWF0aFwiKSBuYW1lc3BhY2UgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUxcIjtcclxuXHRcdFx0XHJcblx0XHRcdGlmIChpc05ldykge1xyXG5cdFx0XHRcdGlmIChkYXRhLmF0dHJzLmlzKSBub2RlID0gbmFtZXNwYWNlID09PSB1bmRlZmluZWQgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZywgZGF0YS5hdHRycy5pcykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpO1xyXG5cdFx0XHRcdGVsc2Ugbm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnKTtcclxuXHRcdFx0XHRjYWNoZWQgPSB7XHJcblx0XHRcdFx0XHR0YWc6IGRhdGEudGFnLFxyXG5cdFx0XHRcdFx0Ly9zZXQgYXR0cmlidXRlcyBmaXJzdCwgdGhlbiBjcmVhdGUgY2hpbGRyZW5cclxuXHRcdFx0XHRcdGF0dHJzOiBoYXNLZXlzID8gc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywge30sIG5hbWVzcGFjZSkgOiBkYXRhLmF0dHJzLFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IGRhdGEuY2hpbGRyZW4gIT0gbnVsbCAmJiBkYXRhLmNoaWxkcmVuLmxlbmd0aCA+IDAgP1xyXG5cdFx0XHRcdFx0XHRidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgdHJ1ZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBub2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykgOlxyXG5cdFx0XHRcdFx0XHRkYXRhLmNoaWxkcmVuLFxyXG5cdFx0XHRcdFx0bm9kZXM6IFtub2RlXVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0aWYgKGNvbnRyb2xsZXJzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0Y2FjaGVkLnZpZXdzID0gdmlld3NcclxuXHRcdFx0XHRcdGNhY2hlZC5jb250cm9sbGVycyA9IGNvbnRyb2xsZXJzXHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY29udHJvbGxlcjsgY29udHJvbGxlciA9IGNvbnRyb2xsZXJzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvbnRyb2xsZXIub251bmxvYWQgJiYgY29udHJvbGxlci5vbnVubG9hZC4kb2xkKSBjb250cm9sbGVyLm9udW5sb2FkID0gY29udHJvbGxlci5vbnVubG9hZC4kb2xkXHJcblx0XHRcdFx0XHRcdGlmIChwZW5kaW5nUmVxdWVzdHMgJiYgY29udHJvbGxlci5vbnVubG9hZCkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBvbnVubG9hZCA9IGNvbnRyb2xsZXIub251bmxvYWRcclxuXHRcdFx0XHRcdFx0XHRjb250cm9sbGVyLm9udW5sb2FkID0gbm9vcFxyXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIub251bmxvYWQuJG9sZCA9IG9udW5sb2FkXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGNhY2hlZC5jaGlsZHJlbiAmJiAhY2FjaGVkLmNoaWxkcmVuLm5vZGVzKSBjYWNoZWQuY2hpbGRyZW4ubm9kZXMgPSBbXTtcclxuXHRcdFx0XHQvL2VkZ2UgY2FzZTogc2V0dGluZyB2YWx1ZSBvbiA8c2VsZWN0PiBkb2Vzbid0IHdvcmsgYmVmb3JlIGNoaWxkcmVuIGV4aXN0LCBzbyBzZXQgaXQgYWdhaW4gYWZ0ZXIgY2hpbGRyZW4gaGF2ZSBiZWVuIGNyZWF0ZWRcclxuXHRcdFx0XHRpZiAoZGF0YS50YWcgPT09IFwic2VsZWN0XCIgJiYgXCJ2YWx1ZVwiIGluIGRhdGEuYXR0cnMpIHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIHt2YWx1ZTogZGF0YS5hdHRycy52YWx1ZX0sIHt9LCBuYW1lc3BhY2UpO1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRub2RlID0gY2FjaGVkLm5vZGVzWzBdO1xyXG5cdFx0XHRcdGlmIChoYXNLZXlzKSBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCBjYWNoZWQuYXR0cnMsIG5hbWVzcGFjZSk7XHJcblx0XHRcdFx0Y2FjaGVkLmNoaWxkcmVuID0gYnVpbGQobm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIGZhbHNlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IG5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZTtcclxuXHRcdFx0XHRpZiAoY29udHJvbGxlcnMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRjYWNoZWQudmlld3MgPSB2aWV3c1xyXG5cdFx0XHRcdFx0Y2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnNcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNob3VsZFJlYXR0YWNoID09PSB0cnVlICYmIG5vZGUgIT0gbnVsbCkgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vc2NoZWR1bGUgY29uZmlncyB0byBiZSBjYWxsZWQuIFRoZXkgYXJlIGNhbGxlZCBhZnRlciBgYnVpbGRgIGZpbmlzaGVzIHJ1bm5pbmdcclxuXHRcdFx0aWYgKHR5cGVvZiBkYXRhLmF0dHJzW1wiY29uZmlnXCJdID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRcdHZhciBjb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCB8fCB7fTtcclxuXHJcblx0XHRcdFx0Ly8gYmluZFxyXG5cdFx0XHRcdHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKGRhdGEsIGFyZ3MpIHtcclxuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGRhdGEuYXR0cnNbXCJjb25maWdcIl0uYXBwbHkoZGF0YSwgYXJncylcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdGNvbmZpZ3MucHVzaChjYWxsYmFjayhkYXRhLCBbbm9kZSwgIWlzTmV3LCBjb250ZXh0LCBjYWNoZWRdKSlcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAodHlwZW9mIGRhdGEgIT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0Ly9oYW5kbGUgdGV4dCBub2Rlc1xyXG5cdFx0XHR2YXIgbm9kZXM7XHJcblx0XHRcdGlmIChjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRub2RlcyA9IFskZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSldO1xyXG5cdFx0XHRcdFx0aWYgKCFwYXJlbnRFbGVtZW50Lm5vZGVOYW1lLm1hdGNoKHZvaWRFbGVtZW50cykpIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGVzWzBdLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhY2hlZCA9IFwic3RyaW5nIG51bWJlciBib29sZWFuXCIuaW5kZXhPZih0eXBlb2YgZGF0YSkgPiAtMSA/IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpIDogZGF0YTtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC52YWx1ZU9mKCkgIT09IGRhdGEudmFsdWVPZigpIHx8IHNob3VsZFJlYXR0YWNoID09PSB0cnVlKSB7XHJcblx0XHRcdFx0bm9kZXMgPSBjYWNoZWQubm9kZXM7XHJcblx0XHRcdFx0aWYgKCFlZGl0YWJsZSB8fCBlZGl0YWJsZSAhPT0gJGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcclxuXHRcdFx0XHRcdGlmIChkYXRhLiR0cnVzdGVkKSB7XHJcblx0XHRcdFx0XHRcdGNsZWFyKG5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHRcdFx0XHRub2RlcyA9IGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly9jb3JuZXIgY2FzZTogcmVwbGFjaW5nIHRoZSBub2RlVmFsdWUgb2YgYSB0ZXh0IG5vZGUgdGhhdCBpcyBhIGNoaWxkIG9mIGEgdGV4dGFyZWEvY29udGVudGVkaXRhYmxlIGRvZXNuJ3Qgd29ya1xyXG5cdFx0XHRcdFx0XHQvL3dlIG5lZWQgdG8gdXBkYXRlIHRoZSB2YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgcGFyZW50IHRleHRhcmVhIG9yIHRoZSBpbm5lckhUTUwgb2YgdGhlIGNvbnRlbnRlZGl0YWJsZSBlbGVtZW50IGluc3RlYWRcclxuXHRcdFx0XHRcdFx0aWYgKHBhcmVudFRhZyA9PT0gXCJ0ZXh0YXJlYVwiKSBwYXJlbnRFbGVtZW50LnZhbHVlID0gZGF0YTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoZWRpdGFibGUpIGVkaXRhYmxlLmlubmVySFRNTCA9IGRhdGE7XHJcblx0XHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChub2Rlc1swXS5ub2RlVHlwZSA9PT0gMSB8fCBub2Rlcy5sZW5ndGggPiAxKSB7IC8vd2FzIGEgdHJ1c3RlZCBzdHJpbmdcclxuXHRcdFx0XHRcdFx0XHRcdGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcclxuXHRcdFx0XHRcdFx0XHRcdG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0bm9kZXNbMF0ubm9kZVZhbHVlID0gZGF0YVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjYWNoZWRcclxuXHR9XHJcblx0ZnVuY3Rpb24gc29ydENoYW5nZXMoYSwgYikge3JldHVybiBhLmFjdGlvbiAtIGIuYWN0aW9uIHx8IGEuaW5kZXggLSBiLmluZGV4fVxyXG5cdGZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMobm9kZSwgdGFnLCBkYXRhQXR0cnMsIGNhY2hlZEF0dHJzLCBuYW1lc3BhY2UpIHtcclxuXHRcdGZvciAodmFyIGF0dHJOYW1lIGluIGRhdGFBdHRycykge1xyXG5cdFx0XHR2YXIgZGF0YUF0dHIgPSBkYXRhQXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHR2YXIgY2FjaGVkQXR0ciA9IGNhY2hlZEF0dHJzW2F0dHJOYW1lXTtcclxuXHRcdFx0aWYgKCEoYXR0ck5hbWUgaW4gY2FjaGVkQXR0cnMpIHx8IChjYWNoZWRBdHRyICE9PSBkYXRhQXR0cikpIHtcclxuXHRcdFx0XHRjYWNoZWRBdHRyc1thdHRyTmFtZV0gPSBkYXRhQXR0cjtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Ly9gY29uZmlnYCBpc24ndCBhIHJlYWwgYXR0cmlidXRlcywgc28gaWdub3JlIGl0XHJcblx0XHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IFwiY29uZmlnXCIgfHwgYXR0ck5hbWUgPT0gXCJrZXlcIikgY29udGludWU7XHJcblx0XHRcdFx0XHQvL2hvb2sgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGF1dG8tcmVkcmF3aW5nIHN5c3RlbVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAodHlwZW9mIGRhdGFBdHRyID09PSBGVU5DVElPTiAmJiBhdHRyTmFtZS5pbmRleE9mKFwib25cIikgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0bm9kZVthdHRyTmFtZV0gPSBhdXRvcmVkcmF3KGRhdGFBdHRyLCBub2RlKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly9oYW5kbGUgYHN0eWxlOiB7Li4ufWBcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInN0eWxlXCIgJiYgZGF0YUF0dHIgIT0gbnVsbCAmJiB0eXBlLmNhbGwoZGF0YUF0dHIpID09PSBPQkpFQ1QpIHtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgcnVsZSBpbiBkYXRhQXR0cikge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChjYWNoZWRBdHRyID09IG51bGwgfHwgY2FjaGVkQXR0cltydWxlXSAhPT0gZGF0YUF0dHJbcnVsZV0pIG5vZGUuc3R5bGVbcnVsZV0gPSBkYXRhQXR0cltydWxlXVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gY2FjaGVkQXR0cikge1xyXG5cdFx0XHRcdFx0XHRcdGlmICghKHJ1bGUgaW4gZGF0YUF0dHIpKSBub2RlLnN0eWxlW3J1bGVdID0gXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2hhbmRsZSBTVkdcclxuXHRcdFx0XHRcdGVsc2UgaWYgKG5hbWVzcGFjZSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJocmVmXCIpIG5vZGUuc2V0QXR0cmlidXRlTlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsIFwiaHJlZlwiLCBkYXRhQXR0cik7XHJcblx0XHRcdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcImNsYXNzTmFtZVwiKSBub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGRhdGFBdHRyKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2hhbmRsZSBjYXNlcyB0aGF0IGFyZSBwcm9wZXJ0aWVzIChidXQgaWdub3JlIGNhc2VzIHdoZXJlIHdlIHNob3VsZCB1c2Ugc2V0QXR0cmlidXRlIGluc3RlYWQpXHJcblx0XHRcdFx0XHQvLy0gbGlzdCBhbmQgZm9ybSBhcmUgdHlwaWNhbGx5IHVzZWQgYXMgc3RyaW5ncywgYnV0IGFyZSBET00gZWxlbWVudCByZWZlcmVuY2VzIGluIGpzXHJcblx0XHRcdFx0XHQvLy0gd2hlbiB1c2luZyBDU1Mgc2VsZWN0b3JzIChlLmcuIGBtKFwiW3N0eWxlPScnXVwiKWApLCBzdHlsZSBpcyB1c2VkIGFzIGEgc3RyaW5nLCBidXQgaXQncyBhbiBvYmplY3QgaW4ganNcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lIGluIG5vZGUgJiYgIShhdHRyTmFtZSA9PT0gXCJsaXN0XCIgfHwgYXR0ck5hbWUgPT09IFwic3R5bGVcIiB8fCBhdHRyTmFtZSA9PT0gXCJmb3JtXCIgfHwgYXR0ck5hbWUgPT09IFwidHlwZVwiIHx8IGF0dHJOYW1lID09PSBcIndpZHRoXCIgfHwgYXR0ck5hbWUgPT09IFwiaGVpZ2h0XCIpKSB7XHJcblx0XHRcdFx0XHRcdC8vIzM0OCBkb24ndCBzZXQgdGhlIHZhbHVlIGlmIG5vdCBuZWVkZWQgb3RoZXJ3aXNlIGN1cnNvciBwbGFjZW1lbnQgYnJlYWtzIGluIENocm9tZVxyXG5cdFx0XHRcdFx0XHRpZiAodGFnICE9PSBcImlucHV0XCIgfHwgbm9kZVthdHRyTmFtZV0gIT09IGRhdGFBdHRyKSBub2RlW2F0dHJOYW1lXSA9IGRhdGFBdHRyXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhQXR0cilcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdC8vc3dhbGxvdyBJRSdzIGludmFsaWQgYXJndW1lbnQgZXJyb3JzIHRvIG1pbWljIEhUTUwncyBmYWxsYmFjay10by1kb2luZy1ub3RoaW5nLW9uLWludmFsaWQtYXR0cmlidXRlcyBiZWhhdmlvclxyXG5cdFx0XHRcdFx0aWYgKGUubWVzc2FnZS5pbmRleE9mKFwiSW52YWxpZCBhcmd1bWVudFwiKSA8IDApIHRocm93IGVcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8jMzQ4IGRhdGFBdHRyIG1heSBub3QgYmUgYSBzdHJpbmcsIHNvIHVzZSBsb29zZSBjb21wYXJpc29uIChkb3VibGUgZXF1YWwpIGluc3RlYWQgb2Ygc3RyaWN0ICh0cmlwbGUgZXF1YWwpXHJcblx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInZhbHVlXCIgJiYgdGFnID09PSBcImlucHV0XCIgJiYgbm9kZS52YWx1ZSAhPSBkYXRhQXR0cikge1xyXG5cdFx0XHRcdG5vZGUudmFsdWUgPSBkYXRhQXR0clxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY2FjaGVkQXR0cnNcclxuXHR9XHJcblx0ZnVuY3Rpb24gY2xlYXIobm9kZXMsIGNhY2hlZCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcblx0XHRcdGlmIChub2Rlc1tpXSAmJiBub2Rlc1tpXS5wYXJlbnROb2RlKSB7XHJcblx0XHRcdFx0dHJ5IHtub2Rlc1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGVzW2ldKX1cclxuXHRcdFx0XHRjYXRjaCAoZSkge30gLy9pZ25vcmUgaWYgdGhpcyBmYWlscyBkdWUgdG8gb3JkZXIgb2YgZXZlbnRzIChzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMTkyNjA4My9mYWlsZWQtdG8tZXhlY3V0ZS1yZW1vdmVjaGlsZC1vbi1ub2RlKVxyXG5cdFx0XHRcdGNhY2hlZCA9IFtdLmNvbmNhdChjYWNoZWQpO1xyXG5cdFx0XHRcdGlmIChjYWNoZWRbaV0pIHVubG9hZChjYWNoZWRbaV0pXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChub2Rlcy5sZW5ndGggIT0gMCkgbm9kZXMubGVuZ3RoID0gMFxyXG5cdH1cclxuXHRmdW5jdGlvbiB1bmxvYWQoY2FjaGVkKSB7XHJcblx0XHRpZiAoY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgdHlwZW9mIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCgpO1xyXG5cdFx0XHRjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9IG51bGxcclxuXHRcdH1cclxuXHRcdGlmIChjYWNoZWQuY29udHJvbGxlcnMpIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvbnRyb2xsZXI7IGNvbnRyb2xsZXIgPSBjYWNoZWQuY29udHJvbGxlcnNbaV07IGkrKykge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgY29udHJvbGxlci5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIGNvbnRyb2xsZXIub251bmxvYWQoe3ByZXZlbnREZWZhdWx0OiBub29wfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChjYWNoZWQuY2hpbGRyZW4pIHtcclxuXHRcdFx0aWYgKHR5cGUuY2FsbChjYWNoZWQuY2hpbGRyZW4pID09PSBBUlJBWSkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjaGlsZDsgY2hpbGQgPSBjYWNoZWQuY2hpbGRyZW5baV07IGkrKykgdW5sb2FkKGNoaWxkKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC5jaGlsZHJlbi50YWcpIHVubG9hZChjYWNoZWQuY2hpbGRyZW4pXHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpIHtcclxuXHRcdHZhciBuZXh0U2libGluZyA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF07XHJcblx0XHRpZiAobmV4dFNpYmxpbmcpIHtcclxuXHRcdFx0dmFyIGlzRWxlbWVudCA9IG5leHRTaWJsaW5nLm5vZGVUeXBlICE9IDE7XHJcblx0XHRcdHZhciBwbGFjZWhvbGRlciA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuXHRcdFx0aWYgKGlzRWxlbWVudCkge1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBuZXh0U2libGluZyB8fCBudWxsKTtcclxuXHRcdFx0XHRwbGFjZWhvbGRlci5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKTtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHBsYWNlaG9sZGVyKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgbmV4dFNpYmxpbmcuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZGF0YSlcclxuXHRcdH1cclxuXHRcdGVsc2UgcGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgZGF0YSk7XHJcblx0XHR2YXIgbm9kZXMgPSBbXTtcclxuXHRcdHdoaWxlIChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdICE9PSBuZXh0U2libGluZykge1xyXG5cdFx0XHRub2Rlcy5wdXNoKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0pO1xyXG5cdFx0XHRpbmRleCsrXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbm9kZXNcclxuXHR9XHJcblx0ZnVuY3Rpb24gYXV0b3JlZHJhdyhjYWxsYmFjaywgb2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpO1xyXG5cdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0dHJ5IHtyZXR1cm4gY2FsbGJhY2suY2FsbChvYmplY3QsIGUpfVxyXG5cdFx0XHRmaW5hbGx5IHtcclxuXHRcdFx0XHRlbmRGaXJzdENvbXB1dGF0aW9uKClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGh0bWw7XHJcblx0dmFyIGRvY3VtZW50Tm9kZSA9IHtcclxuXHRcdGFwcGVuZENoaWxkOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdGlmIChodG1sID09PSB1bmRlZmluZWQpIGh0bWwgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImh0bWxcIik7XHJcblx0XHRcdGlmICgkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgIT09IG5vZGUpIHtcclxuXHRcdFx0XHQkZG9jdW1lbnQucmVwbGFjZUNoaWxkKG5vZGUsICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSAkZG9jdW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcblx0XHRcdHRoaXMuY2hpbGROb2RlcyA9ICRkb2N1bWVudC5jaGlsZE5vZGVzXHJcblx0XHR9LFxyXG5cdFx0aW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdHRoaXMuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHRcdH0sXHJcblx0XHRjaGlsZE5vZGVzOiBbXVxyXG5cdH07XHJcblx0dmFyIG5vZGVDYWNoZSA9IFtdLCBjZWxsQ2FjaGUgPSB7fTtcclxuXHRtLnJlbmRlciA9IGZ1bmN0aW9uKHJvb3QsIGNlbGwsIGZvcmNlUmVjcmVhdGlvbikge1xyXG5cdFx0dmFyIGNvbmZpZ3MgPSBbXTtcclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBET00gZWxlbWVudCBiZWluZyBwYXNzZWQgdG8gbS5yb3V0ZS9tLm1vdW50L20ucmVuZGVyIGlzIG5vdCB1bmRlZmluZWQuXCIpO1xyXG5cdFx0dmFyIGlkID0gZ2V0Q2VsbENhY2hlS2V5KHJvb3QpO1xyXG5cdFx0dmFyIGlzRG9jdW1lbnRSb290ID0gcm9vdCA9PT0gJGRvY3VtZW50O1xyXG5cdFx0dmFyIG5vZGUgPSBpc0RvY3VtZW50Um9vdCB8fCByb290ID09PSAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID8gZG9jdW1lbnROb2RlIDogcm9vdDtcclxuXHRcdGlmIChpc0RvY3VtZW50Um9vdCAmJiBjZWxsLnRhZyAhPSBcImh0bWxcIikgY2VsbCA9IHt0YWc6IFwiaHRtbFwiLCBhdHRyczoge30sIGNoaWxkcmVuOiBjZWxsfTtcclxuXHRcdGlmIChjZWxsQ2FjaGVbaWRdID09PSB1bmRlZmluZWQpIGNsZWFyKG5vZGUuY2hpbGROb2Rlcyk7XHJcblx0XHRpZiAoZm9yY2VSZWNyZWF0aW9uID09PSB0cnVlKSByZXNldChyb290KTtcclxuXHRcdGNlbGxDYWNoZVtpZF0gPSBidWlsZChub2RlLCBudWxsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2VsbCwgY2VsbENhY2hlW2lkXSwgZmFsc2UsIDAsIG51bGwsIHVuZGVmaW5lZCwgY29uZmlncyk7XHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gY29uZmlncy5sZW5ndGg7IGkgPCBsZW47IGkrKykgY29uZmlnc1tpXSgpXHJcblx0fTtcclxuXHRmdW5jdGlvbiBnZXRDZWxsQ2FjaGVLZXkoZWxlbWVudCkge1xyXG5cdFx0dmFyIGluZGV4ID0gbm9kZUNhY2hlLmluZGV4T2YoZWxlbWVudCk7XHJcblx0XHRyZXR1cm4gaW5kZXggPCAwID8gbm9kZUNhY2hlLnB1c2goZWxlbWVudCkgLSAxIDogaW5kZXhcclxuXHR9XHJcblxyXG5cdG0udHJ1c3QgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0dmFsdWUgPSBuZXcgU3RyaW5nKHZhbHVlKTtcclxuXHRcdHZhbHVlLiR0cnVzdGVkID0gdHJ1ZTtcclxuXHRcdHJldHVybiB2YWx1ZVxyXG5cdH07XHJcblxyXG5cdGZ1bmN0aW9uIGdldHRlcnNldHRlcihzdG9yZSkge1xyXG5cdFx0dmFyIHByb3AgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHN0b3JlID0gYXJndW1lbnRzWzBdO1xyXG5cdFx0XHRyZXR1cm4gc3RvcmVcclxuXHRcdH07XHJcblxyXG5cdFx0cHJvcC50b0pTT04gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHN0b3JlXHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiBwcm9wXHJcblx0fVxyXG5cclxuXHRtLnByb3AgPSBmdW5jdGlvbiAoc3RvcmUpIHtcclxuXHRcdC8vbm90ZTogdXNpbmcgbm9uLXN0cmljdCBlcXVhbGl0eSBjaGVjayBoZXJlIGJlY2F1c2Ugd2UncmUgY2hlY2tpbmcgaWYgc3RvcmUgaXMgbnVsbCBPUiB1bmRlZmluZWRcclxuXHRcdGlmICgoKHN0b3JlICE9IG51bGwgJiYgdHlwZS5jYWxsKHN0b3JlKSA9PT0gT0JKRUNUKSB8fCB0eXBlb2Ygc3RvcmUgPT09IEZVTkNUSU9OKSAmJiB0eXBlb2Ygc3RvcmUudGhlbiA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0cmV0dXJuIHByb3BpZnkoc3RvcmUpXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGdldHRlcnNldHRlcihzdG9yZSlcclxuXHR9O1xyXG5cclxuXHR2YXIgcm9vdHMgPSBbXSwgY29tcG9uZW50cyA9IFtdLCBjb250cm9sbGVycyA9IFtdLCBsYXN0UmVkcmF3SWQgPSBudWxsLCBsYXN0UmVkcmF3Q2FsbFRpbWUgPSAwLCBjb21wdXRlUHJlUmVkcmF3SG9vayA9IG51bGwsIGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGwsIHByZXZlbnRlZCA9IGZhbHNlLCB0b3BDb21wb25lbnQsIHVubG9hZGVycyA9IFtdO1xyXG5cdHZhciBGUkFNRV9CVURHRVQgPSAxNjsgLy82MCBmcmFtZXMgcGVyIHNlY29uZCA9IDEgY2FsbCBwZXIgMTYgbXNcclxuXHRmdW5jdGlvbiBwYXJhbWV0ZXJpemUoY29tcG9uZW50LCBhcmdzKSB7XHJcblx0XHR2YXIgY29udHJvbGxlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gKGNvbXBvbmVudC5jb250cm9sbGVyIHx8IG5vb3ApLmFwcGx5KHRoaXMsIGFyZ3MpIHx8IHRoaXNcclxuXHRcdH1cclxuXHRcdHZhciB2aWV3ID0gZnVuY3Rpb24oY3RybCkge1xyXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIGFyZ3MgPSBhcmdzLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpXHJcblx0XHRcdHJldHVybiBjb21wb25lbnQudmlldy5hcHBseShjb21wb25lbnQsIGFyZ3MgPyBbY3RybF0uY29uY2F0KGFyZ3MpIDogW2N0cmxdKVxyXG5cdFx0fVxyXG5cdFx0dmlldy4kb3JpZ2luYWwgPSBjb21wb25lbnQudmlld1xyXG5cdFx0dmFyIG91dHB1dCA9IHtjb250cm9sbGVyOiBjb250cm9sbGVyLCB2aWV3OiB2aWV3fVxyXG5cdFx0aWYgKGFyZ3NbMF0gJiYgYXJnc1swXS5rZXkgIT0gbnVsbCkgb3V0cHV0LmF0dHJzID0ge2tleTogYXJnc1swXS5rZXl9XHJcblx0XHRyZXR1cm4gb3V0cHV0XHJcblx0fVxyXG5cdG0uY29tcG9uZW50ID0gZnVuY3Rpb24oY29tcG9uZW50KSB7XHJcblx0XHRyZXR1cm4gcGFyYW1ldGVyaXplKGNvbXBvbmVudCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxyXG5cdH1cclxuXHRtLm1vdW50ID0gbS5tb2R1bGUgPSBmdW5jdGlvbihyb290LCBjb21wb25lbnQpIHtcclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LlwiKTtcclxuXHRcdHZhciBpbmRleCA9IHJvb3RzLmluZGV4T2Yocm9vdCk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSBpbmRleCA9IHJvb3RzLmxlbmd0aDtcclxuXHRcdFxyXG5cdFx0dmFyIGlzUHJldmVudGVkID0gZmFsc2U7XHJcblx0XHR2YXIgZXZlbnQgPSB7cHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpc1ByZXZlbnRlZCA9IHRydWU7XHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbDtcclxuXHRcdH19O1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIHVubG9hZGVyOyB1bmxvYWRlciA9IHVubG9hZGVyc1tpXTsgaSsrKSB7XHJcblx0XHRcdHVubG9hZGVyLmhhbmRsZXIuY2FsbCh1bmxvYWRlci5jb250cm9sbGVyLCBldmVudClcclxuXHRcdFx0dW5sb2FkZXIuY29udHJvbGxlci5vbnVubG9hZCA9IG51bGxcclxuXHRcdH1cclxuXHRcdGlmIChpc1ByZXZlbnRlZCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgdW5sb2FkZXI7IHVubG9hZGVyID0gdW5sb2FkZXJzW2ldOyBpKyspIHVubG9hZGVyLmNvbnRyb2xsZXIub251bmxvYWQgPSB1bmxvYWRlci5oYW5kbGVyXHJcblx0XHR9XHJcblx0XHRlbHNlIHVubG9hZGVycyA9IFtdXHJcblx0XHRcclxuXHRcdGlmIChjb250cm9sbGVyc1tpbmRleF0gJiYgdHlwZW9mIGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0Y29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkKGV2ZW50KVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZiAoIWlzUHJldmVudGVkKSB7XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiYWxsXCIpO1xyXG5cdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0cm9vdHNbaW5kZXhdID0gcm9vdDtcclxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSBjb21wb25lbnQgPSBzdWJjb21wb25lbnQoY29tcG9uZW50LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpXHJcblx0XHRcdHZhciBjdXJyZW50Q29tcG9uZW50ID0gdG9wQ29tcG9uZW50ID0gY29tcG9uZW50ID0gY29tcG9uZW50IHx8IHtjb250cm9sbGVyOiBmdW5jdGlvbigpIHt9fTtcclxuXHRcdFx0dmFyIGNvbnN0cnVjdG9yID0gY29tcG9uZW50LmNvbnRyb2xsZXIgfHwgbm9vcFxyXG5cdFx0XHR2YXIgY29udHJvbGxlciA9IG5ldyBjb25zdHJ1Y3RvcjtcclxuXHRcdFx0Ly9jb250cm9sbGVycyBtYXkgY2FsbCBtLm1vdW50IHJlY3Vyc2l2ZWx5ICh2aWEgbS5yb3V0ZSByZWRpcmVjdHMsIGZvciBleGFtcGxlKVxyXG5cdFx0XHQvL3RoaXMgY29uZGl0aW9uYWwgZW5zdXJlcyBvbmx5IHRoZSBsYXN0IHJlY3Vyc2l2ZSBtLm1vdW50IGNhbGwgaXMgYXBwbGllZFxyXG5cdFx0XHRpZiAoY3VycmVudENvbXBvbmVudCA9PT0gdG9wQ29tcG9uZW50KSB7XHJcblx0XHRcdFx0Y29udHJvbGxlcnNbaW5kZXhdID0gY29udHJvbGxlcjtcclxuXHRcdFx0XHRjb21wb25lbnRzW2luZGV4XSA9IGNvbXBvbmVudFxyXG5cdFx0XHR9XHJcblx0XHRcdGVuZEZpcnN0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0cmV0dXJuIGNvbnRyb2xsZXJzW2luZGV4XVxyXG5cdFx0fVxyXG5cdH07XHJcblx0dmFyIHJlZHJhd2luZyA9IGZhbHNlXHJcblx0bS5yZWRyYXcgPSBmdW5jdGlvbihmb3JjZSkge1xyXG5cdFx0aWYgKHJlZHJhd2luZykgcmV0dXJuXHJcblx0XHRyZWRyYXdpbmcgPSB0cnVlXHJcblx0XHQvL2xhc3RSZWRyYXdJZCBpcyBhIHBvc2l0aXZlIG51bWJlciBpZiBhIHNlY29uZCByZWRyYXcgaXMgcmVxdWVzdGVkIGJlZm9yZSB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWVcclxuXHRcdC8vbGFzdFJlZHJhd0lEIGlzIG51bGwgaWYgaXQncyB0aGUgZmlyc3QgcmVkcmF3IGFuZCBub3QgYW4gZXZlbnQgaGFuZGxlclxyXG5cdFx0aWYgKGxhc3RSZWRyYXdJZCAmJiBmb3JjZSAhPT0gdHJ1ZSkge1xyXG5cdFx0XHQvL3doZW4gc2V0VGltZW91dDogb25seSByZXNjaGVkdWxlIHJlZHJhdyBpZiB0aW1lIGJldHdlZW4gbm93IGFuZCBwcmV2aW91cyByZWRyYXcgaXMgYmlnZ2VyIHRoYW4gYSBmcmFtZSwgb3RoZXJ3aXNlIGtlZXAgY3VycmVudGx5IHNjaGVkdWxlZCB0aW1lb3V0XHJcblx0XHRcdC8vd2hlbiByQUY6IGFsd2F5cyByZXNjaGVkdWxlIHJlZHJhd1xyXG5cdFx0XHRpZiAoJHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBuZXcgRGF0ZSAtIGxhc3RSZWRyYXdDYWxsVGltZSA+IEZSQU1FX0JVREdFVCkge1xyXG5cdFx0XHRcdGlmIChsYXN0UmVkcmF3SWQgPiAwKSAkY2FuY2VsQW5pbWF0aW9uRnJhbWUobGFzdFJlZHJhd0lkKTtcclxuXHRcdFx0XHRsYXN0UmVkcmF3SWQgPSAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhdywgRlJBTUVfQlVER0VUKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0cmVkcmF3KCk7XHJcblx0XHRcdGxhc3RSZWRyYXdJZCA9ICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7bGFzdFJlZHJhd0lkID0gbnVsbH0sIEZSQU1FX0JVREdFVClcclxuXHRcdH1cclxuXHRcdHJlZHJhd2luZyA9IGZhbHNlXHJcblx0fTtcclxuXHRtLnJlZHJhdy5zdHJhdGVneSA9IG0ucHJvcCgpO1xyXG5cdGZ1bmN0aW9uIHJlZHJhdygpIHtcclxuXHRcdGlmIChjb21wdXRlUHJlUmVkcmF3SG9vaykge1xyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vaygpXHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gbnVsbFxyXG5cdFx0fVxyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIHJvb3Q7IHJvb3QgPSByb290c1tpXTsgaSsrKSB7XHJcblx0XHRcdGlmIChjb250cm9sbGVyc1tpXSkge1xyXG5cdFx0XHRcdHZhciBhcmdzID0gY29tcG9uZW50c1tpXS5jb250cm9sbGVyICYmIGNvbXBvbmVudHNbaV0uY29udHJvbGxlci4kJGFyZ3MgPyBbY29udHJvbGxlcnNbaV1dLmNvbmNhdChjb21wb25lbnRzW2ldLmNvbnRyb2xsZXIuJCRhcmdzKSA6IFtjb250cm9sbGVyc1tpXV1cclxuXHRcdFx0XHRtLnJlbmRlcihyb290LCBjb21wb25lbnRzW2ldLnZpZXcgPyBjb21wb25lbnRzW2ldLnZpZXcoY29udHJvbGxlcnNbaV0sIGFyZ3MpIDogXCJcIilcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9hZnRlciByZW5kZXJpbmcgd2l0aGluIGEgcm91dGVkIGNvbnRleHQsIHdlIG5lZWQgdG8gc2Nyb2xsIGJhY2sgdG8gdGhlIHRvcCwgYW5kIGZldGNoIHRoZSBkb2N1bWVudCB0aXRsZSBmb3IgaGlzdG9yeS5wdXNoU3RhdGVcclxuXHRcdGlmIChjb21wdXRlUG9zdFJlZHJhd0hvb2spIHtcclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rKCk7XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGxcclxuXHRcdH1cclxuXHRcdGxhc3RSZWRyYXdJZCA9IG51bGw7XHJcblx0XHRsYXN0UmVkcmF3Q2FsbFRpbWUgPSBuZXcgRGF0ZTtcclxuXHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKVxyXG5cdH1cclxuXHJcblx0dmFyIHBlbmRpbmdSZXF1ZXN0cyA9IDA7XHJcblx0bS5zdGFydENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7cGVuZGluZ1JlcXVlc3RzKyt9O1xyXG5cdG0uZW5kQ29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdHBlbmRpbmdSZXF1ZXN0cyA9IE1hdGgubWF4KHBlbmRpbmdSZXF1ZXN0cyAtIDEsIDApO1xyXG5cdFx0aWYgKHBlbmRpbmdSZXF1ZXN0cyA9PT0gMCkgbS5yZWRyYXcoKVxyXG5cdH07XHJcblx0dmFyIGVuZEZpcnN0Q29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmIChtLnJlZHJhdy5zdHJhdGVneSgpID09IFwibm9uZVwiKSB7XHJcblx0XHRcdHBlbmRpbmdSZXF1ZXN0cy0tXHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBtLmVuZENvbXB1dGF0aW9uKCk7XHJcblx0fVxyXG5cclxuXHRtLndpdGhBdHRyID0gZnVuY3Rpb24ocHJvcCwgd2l0aEF0dHJDYWxsYmFjaykge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdHZhciBjdXJyZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IHRoaXM7XHJcblx0XHRcdHdpdGhBdHRyQ2FsbGJhY2socHJvcCBpbiBjdXJyZW50VGFyZ2V0ID8gY3VycmVudFRhcmdldFtwcm9wXSA6IGN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKHByb3ApKVxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vcm91dGluZ1xyXG5cdHZhciBtb2RlcyA9IHtwYXRobmFtZTogXCJcIiwgaGFzaDogXCIjXCIsIHNlYXJjaDogXCI/XCJ9O1xyXG5cdHZhciByZWRpcmVjdCA9IG5vb3AsIHJvdXRlUGFyYW1zLCBjdXJyZW50Um91dGUsIGlzRGVmYXVsdFJvdXRlID0gZmFsc2U7XHJcblx0bS5yb3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly9tLnJvdXRlKClcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFJvdXRlO1xyXG5cdFx0Ly9tLnJvdXRlKGVsLCBkZWZhdWx0Um91dGUsIHJvdXRlcylcclxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgdHlwZS5jYWxsKGFyZ3VtZW50c1sxXSkgPT09IFNUUklORykge1xyXG5cdFx0XHR2YXIgcm9vdCA9IGFyZ3VtZW50c1swXSwgZGVmYXVsdFJvdXRlID0gYXJndW1lbnRzWzFdLCByb3V0ZXIgPSBhcmd1bWVudHNbMl07XHJcblx0XHRcdHJlZGlyZWN0ID0gZnVuY3Rpb24oc291cmNlKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSBjdXJyZW50Um91dGUgPSBub3JtYWxpemVSb3V0ZShzb3VyY2UpO1xyXG5cdFx0XHRcdGlmICghcm91dGVCeVZhbHVlKHJvb3QsIHJvdXRlciwgcGF0aCkpIHtcclxuXHRcdFx0XHRcdGlmIChpc0RlZmF1bHRSb3V0ZSkgdGhyb3cgbmV3IEVycm9yKFwiRW5zdXJlIHRoZSBkZWZhdWx0IHJvdXRlIG1hdGNoZXMgb25lIG9mIHRoZSByb3V0ZXMgZGVmaW5lZCBpbiBtLnJvdXRlXCIpXHJcblx0XHRcdFx0XHRpc0RlZmF1bHRSb3V0ZSA9IHRydWVcclxuXHRcdFx0XHRcdG0ucm91dGUoZGVmYXVsdFJvdXRlLCB0cnVlKVxyXG5cdFx0XHRcdFx0aXNEZWZhdWx0Um91dGUgPSBmYWxzZVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0dmFyIGxpc3RlbmVyID0gbS5yb3V0ZS5tb2RlID09PSBcImhhc2hcIiA/IFwib25oYXNoY2hhbmdlXCIgOiBcIm9ucG9wc3RhdGVcIjtcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBwYXRoID0gJGxvY2F0aW9uW20ucm91dGUubW9kZV1cclxuXHRcdFx0XHRpZiAobS5yb3V0ZS5tb2RlID09PSBcInBhdGhuYW1lXCIpIHBhdGggKz0gJGxvY2F0aW9uLnNlYXJjaFxyXG5cdFx0XHRcdGlmIChjdXJyZW50Um91dGUgIT0gbm9ybWFsaXplUm91dGUocGF0aCkpIHtcclxuXHRcdFx0XHRcdHJlZGlyZWN0KHBhdGgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IHNldFNjcm9sbDtcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSgpXHJcblx0XHR9XHJcblx0XHQvL2NvbmZpZzogbS5yb3V0ZVxyXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzWzBdLmFkZEV2ZW50TGlzdGVuZXIgfHwgYXJndW1lbnRzWzBdLmF0dGFjaEV2ZW50KSB7XHJcblx0XHRcdHZhciBlbGVtZW50ID0gYXJndW1lbnRzWzBdO1xyXG5cdFx0XHR2YXIgaXNJbml0aWFsaXplZCA9IGFyZ3VtZW50c1sxXTtcclxuXHRcdFx0dmFyIGNvbnRleHQgPSBhcmd1bWVudHNbMl07XHJcblx0XHRcdHZhciB2ZG9tID0gYXJndW1lbnRzWzNdO1xyXG5cdFx0XHRlbGVtZW50LmhyZWYgPSAobS5yb3V0ZS5tb2RlICE9PSAncGF0aG5hbWUnID8gJGxvY2F0aW9uLnBhdGhuYW1lIDogJycpICsgbW9kZXNbbS5yb3V0ZS5tb2RlXSArIHZkb20uYXR0cnMuaHJlZjtcclxuXHRcdFx0aWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cdFx0XHRcdGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHRcdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0ZWxlbWVudC5kZXRhY2hFdmVudChcIm9uY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSk7XHJcblx0XHRcdFx0ZWxlbWVudC5hdHRhY2hFdmVudChcIm9uY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSlcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly9tLnJvdXRlKHJvdXRlLCBwYXJhbXMsIHNob3VsZFJlcGxhY2VIaXN0b3J5RW50cnkpXHJcblx0XHRlbHNlIGlmICh0eXBlLmNhbGwoYXJndW1lbnRzWzBdKSA9PT0gU1RSSU5HKSB7XHJcblx0XHRcdHZhciBvbGRSb3V0ZSA9IGN1cnJlbnRSb3V0ZTtcclxuXHRcdFx0Y3VycmVudFJvdXRlID0gYXJndW1lbnRzWzBdO1xyXG5cdFx0XHR2YXIgYXJncyA9IGFyZ3VtZW50c1sxXSB8fCB7fVxyXG5cdFx0XHR2YXIgcXVlcnlJbmRleCA9IGN1cnJlbnRSb3V0ZS5pbmRleE9mKFwiP1wiKVxyXG5cdFx0XHR2YXIgcGFyYW1zID0gcXVlcnlJbmRleCA+IC0xID8gcGFyc2VRdWVyeVN0cmluZyhjdXJyZW50Um91dGUuc2xpY2UocXVlcnlJbmRleCArIDEpKSA6IHt9XHJcblx0XHRcdGZvciAodmFyIGkgaW4gYXJncykgcGFyYW1zW2ldID0gYXJnc1tpXVxyXG5cdFx0XHR2YXIgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKHBhcmFtcylcclxuXHRcdFx0dmFyIGN1cnJlbnRQYXRoID0gcXVlcnlJbmRleCA+IC0xID8gY3VycmVudFJvdXRlLnNsaWNlKDAsIHF1ZXJ5SW5kZXgpIDogY3VycmVudFJvdXRlXHJcblx0XHRcdGlmIChxdWVyeXN0cmluZykgY3VycmVudFJvdXRlID0gY3VycmVudFBhdGggKyAoY3VycmVudFBhdGguaW5kZXhPZihcIj9cIikgPT09IC0xID8gXCI/XCIgOiBcIiZcIikgKyBxdWVyeXN0cmluZztcclxuXHJcblx0XHRcdHZhciBzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID0gKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgPyBhcmd1bWVudHNbMl0gOiBhcmd1bWVudHNbMV0pID09PSB0cnVlIHx8IG9sZFJvdXRlID09PSBhcmd1bWVudHNbMF07XHJcblxyXG5cdFx0XHRpZiAod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XHJcblx0XHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBzZXRTY3JvbGxcclxuXHRcdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHdpbmRvdy5oaXN0b3J5W3Nob3VsZFJlcGxhY2VIaXN0b3J5RW50cnkgPyBcInJlcGxhY2VTdGF0ZVwiIDogXCJwdXNoU3RhdGVcIl0obnVsbCwgJGRvY3VtZW50LnRpdGxlLCBtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHJlZGlyZWN0KG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0JGxvY2F0aW9uW20ucm91dGUubW9kZV0gPSBjdXJyZW50Um91dGVcclxuXHRcdFx0XHRyZWRpcmVjdChtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHRtLnJvdXRlLnBhcmFtID0gZnVuY3Rpb24oa2V5KSB7XHJcblx0XHRpZiAoIXJvdXRlUGFyYW1zKSB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBjYWxsIG0ucm91dGUoZWxlbWVudCwgZGVmYXVsdFJvdXRlLCByb3V0ZXMpIGJlZm9yZSBjYWxsaW5nIG0ucm91dGUucGFyYW0oKVwiKVxyXG5cdFx0cmV0dXJuIHJvdXRlUGFyYW1zW2tleV1cclxuXHR9O1xyXG5cdG0ucm91dGUubW9kZSA9IFwic2VhcmNoXCI7XHJcblx0ZnVuY3Rpb24gbm9ybWFsaXplUm91dGUocm91dGUpIHtcclxuXHRcdHJldHVybiByb3V0ZS5zbGljZShtb2Rlc1ttLnJvdXRlLm1vZGVdLmxlbmd0aClcclxuXHR9XHJcblx0ZnVuY3Rpb24gcm91dGVCeVZhbHVlKHJvb3QsIHJvdXRlciwgcGF0aCkge1xyXG5cdFx0cm91dGVQYXJhbXMgPSB7fTtcclxuXHJcblx0XHR2YXIgcXVlcnlTdGFydCA9IHBhdGguaW5kZXhPZihcIj9cIik7XHJcblx0XHRpZiAocXVlcnlTdGFydCAhPT0gLTEpIHtcclxuXHRcdFx0cm91dGVQYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKHBhdGguc3Vic3RyKHF1ZXJ5U3RhcnQgKyAxLCBwYXRoLmxlbmd0aCkpO1xyXG5cdFx0XHRwYXRoID0gcGF0aC5zdWJzdHIoMCwgcXVlcnlTdGFydClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBHZXQgYWxsIHJvdXRlcyBhbmQgY2hlY2sgaWYgdGhlcmUnc1xyXG5cdFx0Ly8gYW4gZXhhY3QgbWF0Y2ggZm9yIHRoZSBjdXJyZW50IHBhdGhcclxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMocm91dGVyKTtcclxuXHRcdHZhciBpbmRleCA9IGtleXMuaW5kZXhPZihwYXRoKTtcclxuXHRcdGlmKGluZGV4ICE9PSAtMSl7XHJcblx0XHRcdG0ubW91bnQocm9vdCwgcm91dGVyW2tleXMgW2luZGV4XV0pO1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKHZhciByb3V0ZSBpbiByb3V0ZXIpIHtcclxuXHRcdFx0aWYgKHJvdXRlID09PSBwYXRoKSB7XHJcblx0XHRcdFx0bS5tb3VudChyb290LCByb3V0ZXJbcm91dGVdKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoXCJeXCIgKyByb3V0ZS5yZXBsYWNlKC86W15cXC9dKz9cXC57M30vZywgXCIoLio/KVwiKS5yZXBsYWNlKC86W15cXC9dKy9nLCBcIihbXlxcXFwvXSspXCIpICsgXCJcXC8/JFwiKTtcclxuXHJcblx0XHRcdGlmIChtYXRjaGVyLnRlc3QocGF0aCkpIHtcclxuXHRcdFx0XHRwYXRoLnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIga2V5cyA9IHJvdXRlLm1hdGNoKC86W15cXC9dKy9nKSB8fCBbXTtcclxuXHRcdFx0XHRcdHZhciB2YWx1ZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgLTIpO1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHJvdXRlUGFyYW1zW2tleXNbaV0ucmVwbGFjZSgvOnxcXC4vZywgXCJcIildID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tpXSlcclxuXHRcdFx0XHRcdG0ubW91bnQocm9vdCwgcm91dGVyW3JvdXRlXSlcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJvdXRlVW5vYnRydXNpdmUoZSkge1xyXG5cdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRpZiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLndoaWNoID09PSAyKSByZXR1cm47XHJcblx0XHRpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZWxzZSBlLnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHR2YXIgY3VycmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XHJcblx0XHR2YXIgYXJncyA9IG0ucm91dGUubW9kZSA9PT0gXCJwYXRobmFtZVwiICYmIGN1cnJlbnRUYXJnZXQuc2VhcmNoID8gcGFyc2VRdWVyeVN0cmluZyhjdXJyZW50VGFyZ2V0LnNlYXJjaC5zbGljZSgxKSkgOiB7fTtcclxuXHRcdHdoaWxlIChjdXJyZW50VGFyZ2V0ICYmIGN1cnJlbnRUYXJnZXQubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPSBcIkFcIikgY3VycmVudFRhcmdldCA9IGN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZVxyXG5cdFx0bS5yb3V0ZShjdXJyZW50VGFyZ2V0W20ucm91dGUubW9kZV0uc2xpY2UobW9kZXNbbS5yb3V0ZS5tb2RlXS5sZW5ndGgpLCBhcmdzKVxyXG5cdH1cclxuXHRmdW5jdGlvbiBzZXRTY3JvbGwoKSB7XHJcblx0XHRpZiAobS5yb3V0ZS5tb2RlICE9IFwiaGFzaFwiICYmICRsb2NhdGlvbi5oYXNoKSAkbG9jYXRpb24uaGFzaCA9ICRsb2NhdGlvbi5oYXNoO1xyXG5cdFx0ZWxzZSB3aW5kb3cuc2Nyb2xsVG8oMCwgMClcclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGRRdWVyeVN0cmluZyhvYmplY3QsIHByZWZpeCkge1xyXG5cdFx0dmFyIGR1cGxpY2F0ZXMgPSB7fVxyXG5cdFx0dmFyIHN0ciA9IFtdXHJcblx0XHRmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xyXG5cdFx0XHR2YXIga2V5ID0gcHJlZml4ID8gcHJlZml4ICsgXCJbXCIgKyBwcm9wICsgXCJdXCIgOiBwcm9wXHJcblx0XHRcdHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wXVxyXG5cdFx0XHR2YXIgdmFsdWVUeXBlID0gdHlwZS5jYWxsKHZhbHVlKVxyXG5cdFx0XHR2YXIgcGFpciA9ICh2YWx1ZSA9PT0gbnVsbCkgPyBlbmNvZGVVUklDb21wb25lbnQoa2V5KSA6XHJcblx0XHRcdFx0dmFsdWVUeXBlID09PSBPQkpFQ1QgPyBidWlsZFF1ZXJ5U3RyaW5nKHZhbHVlLCBrZXkpIDpcclxuXHRcdFx0XHR2YWx1ZVR5cGUgPT09IEFSUkFZID8gdmFsdWUucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcclxuXHRcdFx0XHRcdGlmICghZHVwbGljYXRlc1trZXldKSBkdXBsaWNhdGVzW2tleV0gPSB7fVxyXG5cdFx0XHRcdFx0aWYgKCFkdXBsaWNhdGVzW2tleV1baXRlbV0pIHtcclxuXHRcdFx0XHRcdFx0ZHVwbGljYXRlc1trZXldW2l0ZW1dID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRyZXR1cm4gbWVtby5jb25jYXQoZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtKSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiBtZW1vXHJcblx0XHRcdFx0fSwgW10pLmpvaW4oXCImXCIpIDpcclxuXHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKVxyXG5cdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgc3RyLnB1c2gocGFpcilcclxuXHRcdH1cclxuXHRcdHJldHVybiBzdHIuam9pbihcIiZcIilcclxuXHR9XHJcblx0ZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhzdHIpIHtcclxuXHRcdGlmIChzdHIuY2hhckF0KDApID09PSBcIj9cIikgc3RyID0gc3RyLnN1YnN0cmluZygxKTtcclxuXHRcdFxyXG5cdFx0dmFyIHBhaXJzID0gc3RyLnNwbGl0KFwiJlwiKSwgcGFyYW1zID0ge307XHJcblx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0dmFyIHBhaXIgPSBwYWlyc1tpXS5zcGxpdChcIj1cIik7XHJcblx0XHRcdHZhciBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQocGFpclswXSlcclxuXHRcdFx0dmFyIHZhbHVlID0gcGFpci5sZW5ndGggPT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKSA6IG51bGxcclxuXHRcdFx0aWYgKHBhcmFtc1trZXldICE9IG51bGwpIHtcclxuXHRcdFx0XHRpZiAodHlwZS5jYWxsKHBhcmFtc1trZXldKSAhPT0gQVJSQVkpIHBhcmFtc1trZXldID0gW3BhcmFtc1trZXldXVxyXG5cdFx0XHRcdHBhcmFtc1trZXldLnB1c2godmFsdWUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBwYXJhbXNba2V5XSA9IHZhbHVlXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcGFyYW1zXHJcblx0fVxyXG5cdG0ucm91dGUuYnVpbGRRdWVyeVN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmdcclxuXHRtLnJvdXRlLnBhcnNlUXVlcnlTdHJpbmcgPSBwYXJzZVF1ZXJ5U3RyaW5nXHJcblx0XHJcblx0ZnVuY3Rpb24gcmVzZXQocm9vdCkge1xyXG5cdFx0dmFyIGNhY2hlS2V5ID0gZ2V0Q2VsbENhY2hlS2V5KHJvb3QpO1xyXG5cdFx0Y2xlYXIocm9vdC5jaGlsZE5vZGVzLCBjZWxsQ2FjaGVbY2FjaGVLZXldKTtcclxuXHRcdGNlbGxDYWNoZVtjYWNoZUtleV0gPSB1bmRlZmluZWRcclxuXHR9XHJcblxyXG5cdG0uZGVmZXJyZWQgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcclxuXHRcdGRlZmVycmVkLnByb21pc2UgPSBwcm9waWZ5KGRlZmVycmVkLnByb21pc2UpO1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkXHJcblx0fTtcclxuXHRmdW5jdGlvbiBwcm9waWZ5KHByb21pc2UsIGluaXRpYWxWYWx1ZSkge1xyXG5cdFx0dmFyIHByb3AgPSBtLnByb3AoaW5pdGlhbFZhbHVlKTtcclxuXHRcdHByb21pc2UudGhlbihwcm9wKTtcclxuXHRcdHByb3AudGhlbiA9IGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGlmeShwcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KSwgaW5pdGlhbFZhbHVlKVxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBwcm9wXHJcblx0fVxyXG5cdC8vUHJvbWl6Lm1pdGhyaWwuanMgfCBab2xtZWlzdGVyIHwgTUlUXHJcblx0Ly9hIG1vZGlmaWVkIHZlcnNpb24gb2YgUHJvbWl6LmpzLCB3aGljaCBkb2VzIG5vdCBjb25mb3JtIHRvIFByb21pc2VzL0ErIGZvciB0d28gcmVhc29uczpcclxuXHQvLzEpIGB0aGVuYCBjYWxsYmFja3MgYXJlIGNhbGxlZCBzeW5jaHJvbm91c2x5IChiZWNhdXNlIHNldFRpbWVvdXQgaXMgdG9vIHNsb3csIGFuZCB0aGUgc2V0SW1tZWRpYXRlIHBvbHlmaWxsIGlzIHRvbyBiaWdcclxuXHQvLzIpIHRocm93aW5nIHN1YmNsYXNzZXMgb2YgRXJyb3IgY2F1c2UgdGhlIGVycm9yIHRvIGJlIGJ1YmJsZWQgdXAgaW5zdGVhZCBvZiB0cmlnZ2VyaW5nIHJlamVjdGlvbiAoYmVjYXVzZSB0aGUgc3BlYyBkb2VzIG5vdCBhY2NvdW50IGZvciB0aGUgaW1wb3J0YW50IHVzZSBjYXNlIG9mIGRlZmF1bHQgYnJvd3NlciBlcnJvciBoYW5kbGluZywgaS5lLiBtZXNzYWdlIHcvIGxpbmUgbnVtYmVyKVxyXG5cdGZ1bmN0aW9uIERlZmVycmVkKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XHJcblx0XHR2YXIgUkVTT0xWSU5HID0gMSwgUkVKRUNUSU5HID0gMiwgUkVTT0xWRUQgPSAzLCBSRUpFQ1RFRCA9IDQ7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXMsIHN0YXRlID0gMCwgcHJvbWlzZVZhbHVlID0gMCwgbmV4dCA9IFtdO1xyXG5cclxuXHRcdHNlbGZbXCJwcm9taXNlXCJdID0ge307XHJcblxyXG5cdFx0c2VsZltcInJlc29sdmVcIl0gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblxyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9O1xyXG5cclxuXHRcdHNlbGZbXCJyZWplY3RcIl0gPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIXN0YXRlKSB7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblxyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB0aGlzXHJcblx0XHR9O1xyXG5cclxuXHRcdHNlbGYucHJvbWlzZVtcInRoZW5cIl0gPSBmdW5jdGlvbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG5cdFx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xyXG5cdFx0XHRpZiAoc3RhdGUgPT09IFJFU09MVkVEKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlVmFsdWUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT09IFJFSkVDVEVEKSB7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KHByb21pc2VWYWx1ZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRuZXh0LnB1c2goZGVmZXJyZWQpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHRcdH07XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmluaXNoKHR5cGUpIHtcclxuXHRcdFx0c3RhdGUgPSB0eXBlIHx8IFJFSkVDVEVEO1xyXG5cdFx0XHRuZXh0Lm1hcChmdW5jdGlvbihkZWZlcnJlZCkge1xyXG5cdFx0XHRcdHN0YXRlID09PSBSRVNPTFZFRCAmJiBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VWYWx1ZSkgfHwgZGVmZXJyZWQucmVqZWN0KHByb21pc2VWYWx1ZSlcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiB0aGVubmFibGUodGhlbiwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2ssIG5vdFRoZW5uYWJsZUNhbGxiYWNrKSB7XHJcblx0XHRcdGlmICgoKHByb21pc2VWYWx1ZSAhPSBudWxsICYmIHR5cGUuY2FsbChwcm9taXNlVmFsdWUpID09PSBPQkpFQ1QpIHx8IHR5cGVvZiBwcm9taXNlVmFsdWUgPT09IEZVTkNUSU9OKSAmJiB0eXBlb2YgdGhlbiA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Ly8gY291bnQgcHJvdGVjdHMgYWdhaW5zdCBhYnVzZSBjYWxscyBmcm9tIHNwZWMgY2hlY2tlclxyXG5cdFx0XHRcdFx0dmFyIGNvdW50ID0gMDtcclxuXHRcdFx0XHRcdHRoZW4uY2FsbChwcm9taXNlVmFsdWUsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb3VudCsrKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRzdWNjZXNzQ2FsbGJhY2soKVxyXG5cdFx0XHRcdFx0fSwgZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb3VudCsrKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRmYWlsdXJlQ2FsbGJhY2soKVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0XHRmYWlsdXJlQ2FsbGJhY2soKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRub3RUaGVubmFibGVDYWxsYmFjaygpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmdW5jdGlvbiBmaXJlKCkge1xyXG5cdFx0XHQvLyBjaGVjayBpZiBpdCdzIGEgdGhlbmFibGVcclxuXHRcdFx0dmFyIHRoZW47XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dGhlbiA9IHByb21pc2VWYWx1ZSAmJiBwcm9taXNlVmFsdWUudGhlblxyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblx0XHRcdFx0cmV0dXJuIGZpcmUoKVxyXG5cdFx0XHR9XHJcblx0XHRcdHRoZW5uYWJsZSh0aGVuLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFU09MVklORztcclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c3RhdGUgPSBSRUpFQ1RJTkc7XHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRpZiAoc3RhdGUgPT09IFJFU09MVklORyAmJiB0eXBlb2Ygc3VjY2Vzc0NhbGxiYWNrID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBzdWNjZXNzQ2FsbGJhY2socHJvbWlzZVZhbHVlKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoc3RhdGUgPT09IFJFSkVDVElORyAmJiB0eXBlb2YgZmFpbHVyZUNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZmFpbHVyZUNhbGxiYWNrKHByb21pc2VWYWx1ZSk7XHJcblx0XHRcdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZpbmlzaCgpXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAocHJvbWlzZVZhbHVlID09PSBzZWxmKSB7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBUeXBlRXJyb3IoKTtcclxuXHRcdFx0XHRcdGZpbmlzaCgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhlbm5hYmxlKHRoZW4sIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKFJFU09MVkVEKVxyXG5cdFx0XHRcdFx0fSwgZmluaXNoLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGZpbmlzaChzdGF0ZSA9PT0gUkVTT0xWSU5HICYmIFJFU09MVkVEKVxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fVxyXG5cdG0uZGVmZXJyZWQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdGlmICh0eXBlLmNhbGwoZSkgPT09IFwiW29iamVjdCBFcnJvcl1cIiAmJiAhZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC8gRXJyb3IvKSkgdGhyb3cgZVxyXG5cdH07XHJcblxyXG5cdG0uc3luYyA9IGZ1bmN0aW9uKGFyZ3MpIHtcclxuXHRcdHZhciBtZXRob2QgPSBcInJlc29sdmVcIjtcclxuXHRcdGZ1bmN0aW9uIHN5bmNocm9uaXplcihwb3MsIHJlc29sdmVkKSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdHJlc3VsdHNbcG9zXSA9IHZhbHVlO1xyXG5cdFx0XHRcdGlmICghcmVzb2x2ZWQpIG1ldGhvZCA9IFwicmVqZWN0XCI7XHJcblx0XHRcdFx0aWYgKC0tb3V0c3RhbmRpbmcgPT09IDApIHtcclxuXHRcdFx0XHRcdGRlZmVycmVkLnByb21pc2UocmVzdWx0cyk7XHJcblx0XHRcdFx0XHRkZWZlcnJlZFttZXRob2RdKHJlc3VsdHMpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB2YWx1ZVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGRlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xyXG5cdFx0dmFyIG91dHN0YW5kaW5nID0gYXJncy5sZW5ndGg7XHJcblx0XHR2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShvdXRzdGFuZGluZyk7XHJcblx0XHRpZiAoYXJncy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGFyZ3NbaV0udGhlbihzeW5jaHJvbml6ZXIoaSwgdHJ1ZSksIHN5bmNocm9uaXplcihpLCBmYWxzZSkpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgZGVmZXJyZWQucmVzb2x2ZShbXSk7XHJcblxyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7cmV0dXJuIHZhbHVlfVxyXG5cclxuXHRmdW5jdGlvbiBhamF4KG9wdGlvbnMpIHtcclxuXHRcdGlmIChvcHRpb25zLmRhdGFUeXBlICYmIG9wdGlvbnMuZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29ucFwiKSB7XHJcblx0XHRcdHZhciBjYWxsYmFja0tleSA9IFwibWl0aHJpbF9jYWxsYmFja19cIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgXCJfXCIgKyAoTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMWUxNikpLnRvU3RyaW5nKDM2KTtcclxuXHRcdFx0dmFyIHNjcmlwdCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xyXG5cclxuXHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IGZ1bmN0aW9uKHJlc3ApIHtcclxuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG5cdFx0XHRcdG9wdGlvbnMub25sb2FkKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwibG9hZFwiLFxyXG5cdFx0XHRcdFx0dGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlVGV4dDogcmVzcFxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSB1bmRlZmluZWRcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcblxyXG5cdFx0XHRcdG9wdGlvbnMub25lcnJvcih7XHJcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXHJcblx0XHRcdFx0XHR0YXJnZXQ6IHtcclxuXHRcdFx0XHRcdFx0c3RhdHVzOiA1MDAsXHJcblx0XHRcdFx0XHRcdHJlc3BvbnNlVGV4dDogSlNPTi5zdHJpbmdpZnkoe2Vycm9yOiBcIkVycm9yIG1ha2luZyBqc29ucCByZXF1ZXN0XCJ9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5zcmMgPSBvcHRpb25zLnVybFxyXG5cdFx0XHRcdCsgKG9wdGlvbnMudXJsLmluZGV4T2YoXCI/XCIpID4gMCA/IFwiJlwiIDogXCI/XCIpXHJcblx0XHRcdFx0KyAob3B0aW9ucy5jYWxsYmFja0tleSA/IG9wdGlvbnMuY2FsbGJhY2tLZXkgOiBcImNhbGxiYWNrXCIpXHJcblx0XHRcdFx0KyBcIj1cIiArIGNhbGxiYWNrS2V5XHJcblx0XHRcdFx0KyBcIiZcIiArIGJ1aWxkUXVlcnlTdHJpbmcob3B0aW9ucy5kYXRhIHx8IHt9KTtcclxuXHRcdFx0JGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHZhciB4aHIgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0O1xyXG5cdFx0XHR4aHIub3BlbihvcHRpb25zLm1ldGhvZCwgb3B0aW9ucy51cmwsIHRydWUsIG9wdGlvbnMudXNlciwgb3B0aW9ucy5wYXNzd29yZCk7XHJcblx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuXHRcdFx0XHRcdGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSBvcHRpb25zLm9ubG9hZCh7dHlwZTogXCJsb2FkXCIsIHRhcmdldDogeGhyfSk7XHJcblx0XHRcdFx0XHRlbHNlIG9wdGlvbnMub25lcnJvcih7dHlwZTogXCJlcnJvclwiLCB0YXJnZXQ6IHhocn0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRpZiAob3B0aW9ucy5zZXJpYWxpemUgPT09IEpTT04uc3RyaW5naWZ5ICYmIG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLm1ldGhvZCAhPT0gXCJHRVRcIikge1xyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOFwiKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChvcHRpb25zLmRlc2VyaWFsaXplID09PSBKU09OLnBhcnNlKSB7XHJcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0LypcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLmNvbmZpZyA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHR2YXIgbWF5YmVYaHIgPSBvcHRpb25zLmNvbmZpZyh4aHIsIG9wdGlvbnMpO1xyXG5cdFx0XHRcdGlmIChtYXliZVhociAhPSBudWxsKSB4aHIgPSBtYXliZVhoclxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgZGF0YSA9IG9wdGlvbnMubWV0aG9kID09PSBcIkdFVFwiIHx8ICFvcHRpb25zLmRhdGEgPyBcIlwiIDogb3B0aW9ucy5kYXRhXHJcblx0XHRcdGlmIChkYXRhICYmICh0eXBlLmNhbGwoZGF0YSkgIT0gU1RSSU5HICYmIGRhdGEuY29uc3RydWN0b3IgIT0gd2luZG93LkZvcm1EYXRhKSkge1xyXG5cdFx0XHRcdHRocm93IFwiUmVxdWVzdCBkYXRhIHNob3VsZCBiZSBlaXRoZXIgYmUgYSBzdHJpbmcgb3IgRm9ybURhdGEuIENoZWNrIHRoZSBgc2VyaWFsaXplYCBvcHRpb24gaW4gYG0ucmVxdWVzdGBcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHR4aHIuc2VuZChkYXRhKTtcclxuXHRcdFx0cmV0dXJuIHhoclxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBiaW5kRGF0YSh4aHJPcHRpb25zLCBkYXRhLCBzZXJpYWxpemUpIHtcclxuXHRcdGlmICh4aHJPcHRpb25zLm1ldGhvZCA9PT0gXCJHRVRcIiAmJiB4aHJPcHRpb25zLmRhdGFUeXBlICE9IFwianNvbnBcIikge1xyXG5cdFx0XHR2YXIgcHJlZml4ID0geGhyT3B0aW9ucy51cmwuaW5kZXhPZihcIj9cIikgPCAwID8gXCI/XCIgOiBcIiZcIjtcclxuXHRcdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhkYXRhKTtcclxuXHRcdFx0eGhyT3B0aW9ucy51cmwgPSB4aHJPcHRpb25zLnVybCArIChxdWVyeXN0cmluZyA/IHByZWZpeCArIHF1ZXJ5c3RyaW5nIDogXCJcIilcclxuXHRcdH1cclxuXHRcdGVsc2UgeGhyT3B0aW9ucy5kYXRhID0gc2VyaWFsaXplKGRhdGEpO1xyXG5cdFx0cmV0dXJuIHhock9wdGlvbnNcclxuXHR9XHJcblx0ZnVuY3Rpb24gcGFyYW1ldGVyaXplVXJsKHVybCwgZGF0YSkge1xyXG5cdFx0dmFyIHRva2VucyA9IHVybC5tYXRjaCgvOlthLXpdXFx3Ky9naSk7XHJcblx0XHRpZiAodG9rZW5zICYmIGRhdGEpIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR2YXIga2V5ID0gdG9rZW5zW2ldLnNsaWNlKDEpO1xyXG5cdFx0XHRcdHVybCA9IHVybC5yZXBsYWNlKHRva2Vuc1tpXSwgZGF0YVtrZXldKTtcclxuXHRcdFx0XHRkZWxldGUgZGF0YVtrZXldXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB1cmxcclxuXHR9XHJcblxyXG5cdG0ucmVxdWVzdCA9IGZ1bmN0aW9uKHhock9wdGlvbnMpIHtcclxuXHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XHJcblx0XHR2YXIgaXNKU09OUCA9IHhock9wdGlvbnMuZGF0YVR5cGUgJiYgeGhyT3B0aW9ucy5kYXRhVHlwZS50b0xvd2VyQ2FzZSgpID09PSBcImpzb25wXCI7XHJcblx0XHR2YXIgc2VyaWFsaXplID0geGhyT3B0aW9ucy5zZXJpYWxpemUgPSBpc0pTT05QID8gaWRlbnRpdHkgOiB4aHJPcHRpb25zLnNlcmlhbGl6ZSB8fCBKU09OLnN0cmluZ2lmeTtcclxuXHRcdHZhciBkZXNlcmlhbGl6ZSA9IHhock9wdGlvbnMuZGVzZXJpYWxpemUgPSBpc0pTT05QID8gaWRlbnRpdHkgOiB4aHJPcHRpb25zLmRlc2VyaWFsaXplIHx8IEpTT04ucGFyc2U7XHJcblx0XHR2YXIgZXh0cmFjdCA9IGlzSlNPTlAgPyBmdW5jdGlvbihqc29ucCkge3JldHVybiBqc29ucC5yZXNwb25zZVRleHR9IDogeGhyT3B0aW9ucy5leHRyYWN0IHx8IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRyZXR1cm4geGhyLnJlc3BvbnNlVGV4dC5sZW5ndGggPT09IDAgJiYgZGVzZXJpYWxpemUgPT09IEpTT04ucGFyc2UgPyBudWxsIDogeGhyLnJlc3BvbnNlVGV4dFxyXG5cdFx0fTtcclxuXHRcdHhock9wdGlvbnMubWV0aG9kID0gKHhock9wdGlvbnMubWV0aG9kIHx8ICdHRVQnKS50b1VwcGVyQ2FzZSgpO1xyXG5cdFx0eGhyT3B0aW9ucy51cmwgPSBwYXJhbWV0ZXJpemVVcmwoeGhyT3B0aW9ucy51cmwsIHhock9wdGlvbnMuZGF0YSk7XHJcblx0XHR4aHJPcHRpb25zID0gYmluZERhdGEoeGhyT3B0aW9ucywgeGhyT3B0aW9ucy5kYXRhLCBzZXJpYWxpemUpO1xyXG5cdFx0eGhyT3B0aW9ucy5vbmxvYWQgPSB4aHJPcHRpb25zLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdFx0dmFyIHVud3JhcCA9IChlLnR5cGUgPT09IFwibG9hZFwiID8geGhyT3B0aW9ucy51bndyYXBTdWNjZXNzIDogeGhyT3B0aW9ucy51bndyYXBFcnJvcikgfHwgaWRlbnRpdHk7XHJcblx0XHRcdFx0dmFyIHJlc3BvbnNlID0gdW53cmFwKGRlc2VyaWFsaXplKGV4dHJhY3QoZS50YXJnZXQsIHhock9wdGlvbnMpKSwgZS50YXJnZXQpO1xyXG5cdFx0XHRcdGlmIChlLnR5cGUgPT09IFwibG9hZFwiKSB7XHJcblx0XHRcdFx0XHRpZiAodHlwZS5jYWxsKHJlc3BvbnNlKSA9PT0gQVJSQVkgJiYgeGhyT3B0aW9ucy50eXBlKSB7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHJlc3BvbnNlW2ldID0gbmV3IHhock9wdGlvbnMudHlwZShyZXNwb25zZVtpXSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHhock9wdGlvbnMudHlwZSkgcmVzcG9uc2UgPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlc3BvbnNlKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRkZWZlcnJlZFtlLnR5cGUgPT09IFwibG9hZFwiID8gXCJyZXNvbHZlXCIgOiBcInJlamVjdFwiXShyZXNwb25zZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLmVuZENvbXB1dGF0aW9uKClcclxuXHRcdH07XHJcblx0XHRhamF4KHhock9wdGlvbnMpO1xyXG5cdFx0ZGVmZXJyZWQucHJvbWlzZSA9IHByb3BpZnkoZGVmZXJyZWQucHJvbWlzZSwgeGhyT3B0aW9ucy5pbml0aWFsVmFsdWUpO1xyXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2VcclxuXHR9O1xyXG5cclxuXHQvL3Rlc3RpbmcgQVBJXHJcblx0bS5kZXBzID0gZnVuY3Rpb24obW9jaykge1xyXG5cdFx0aW5pdGlhbGl6ZSh3aW5kb3cgPSBtb2NrIHx8IHdpbmRvdyk7XHJcblx0XHRyZXR1cm4gd2luZG93O1xyXG5cdH07XHJcblx0Ly9mb3IgaW50ZXJuYWwgdGVzdGluZyBvbmx5LCBkbyBub3QgdXNlIGBtLmRlcHMuZmFjdG9yeWBcclxuXHRtLmRlcHMuZmFjdG9yeSA9IGFwcDtcclxuXHJcblx0cmV0dXJuIG1cclxufSkodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pO1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gbTtcclxuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIGRlZmluZShmdW5jdGlvbigpIHtyZXR1cm4gbX0pO1xyXG4iLCJ2YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgndmFsaWRhdG9yJyk7XG5cbi8qIFx0VGhpcyBiaW5kZXIgYWxsb3dzIHlvdSB0byBjcmVhdGUgYSB2YWxpZGF0aW9uIG1ldGhvZCBvbiBhIG1vZGVsLCAocGxhaW4gXG5cdGphdmFzY3JpcHQgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIHNvbWUgcHJvcGVydGllcyksIHRoYXQgY2FuIHJldHVybiBhIHNldCBcblx0b2YgZXJyb3IgbWVzc2FnZXMgZm9yIGludmFsaWQgdmFsdWVzLlxuXHRcblx0VGhlIHZhbGlkYXRpb25zIGFyZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jaHJpc28vdmFsaWRhdG9yLmpzXHRcblxuXHQjIyBFeGFtcGxlXG5cblx0U2F5IHlvdSBoYXZlIGFuIG9iamVjdCBsaWtlIHNvOlxuXG5cdFx0dmFyIFVzZXIgPSBmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5uYW1lID0gXCJib2JcIjtcblx0XHRcdHRoaXMuZW1haWwgPSBcImJvYl9hdF9lbWFpbC5jb21cIjtcblx0XHR9LCB1c2VyID0gbmV3IFVzZXIoKTtcblxuXHROb3cgaWYgeW91IHdhbnRlZCB0byBjcmVhdGUgYW4gaXNWYWxpZCBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGVuc3VyZSBcblx0eW91IGRvbid0IGhhdmUgYW4gaW52YWxpZCBlbWFpbCBhZGRyZXNzLCB5b3Ugc2ltcGx5IGFkZDpcblxuXG5cdFRvIHlvdXIgbW9kZWwsIHNvIHlvdSBnZXQ6XG5cblx0XHR2YXIgVXNlciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLm5hbWUgPSBcImJvYlwiO1xuXHRcdFx0dGhpcy5lbWFpbCA9IFwiYm9iX2F0X2VtYWlsLmNvbVwiO1xuXHRcdFx0dGhpcy5pc1ZhbGlkID0gbW9kZWxiaW5kZXIuYmluZCh0aGlzLCB7XG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0J2lzRW1haWwnOiBcIk11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCJcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSwgdXNlciA9IG5ldyBVc2VyKCk7XG5cblx0VGhlbiBqdXN0IGNhbGwgdGhlIGBpc1ZhbGlkYCBtZXRob2QgdG8gc2VlIGlmIGl0IGlzIHZhbGlkIC0gaWYgaXQgaXNcblx0aW52YWxpZCwgKGFzIGl0IHdpbGwgYmUgaW4gdGhpcyBjYXNlKSwgeW91IHdpbGwgZ2V0IGFuIG9iamVjdCBsaWtlIHNvOlxuXG5cdFx0dXNlci5pc1ZhbGlkKClcblx0XHQvL1x0UmV0dXJuczogeyBlbWFpbDogW1wiTXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIl0gfVxuXG5cdFlvdSBjYW4gYWxzbyBjaGVjayBpZiBhIHBhcnRpY3VsYXIgZmllbGQgaXMgdmFsaWQgbGlrZSBzbzpcblxuXHRcdHVzZXIuaXNWYWxpZCgnZW1haWwnKTtcblxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0YmluZDogZnVuY3Rpb24oc2VsZiwgdk9iail7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0dmFyIHJlc3VsdCA9IHt9LFxuXHRcdFx0XHR0bXAsXG5cdFx0XHRcdGhhc0ludmFsaWRGaWVsZCA9IGZhbHNlLFxuXHRcdFx0XHQvL1x0Rm9yIHNvbWUgcmVhc29uIG5vZGUtdmFsaWRhdG9yIGRvZXNuJ3QgaGF2ZSB0aGlzLi4uXG5cdFx0XHRcdGlzTm90RW1wdHkgPSBmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB2YWx1ZSAhPT0gXCJcIiAmJiB2YWx1ZSAhPT0gbnVsbDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly9cdEdldCB2YWx1ZSBvZiBwcm9wZXJ0eSBmcm9tICdzZWxmJywgd2hpY2ggY2FuIGJlIGEgZnVuY3Rpb24uXG5cdFx0XHRcdGdldFZhbHVlID0gZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiBzZWxmW25hbWVdID09IFwiZnVuY3Rpb25cIj8gc2VsZltuYW1lXSgpOiBzZWxmW25hbWVdO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQvL1x0VmFsaWRhdGVzIGEgdmFsdWUgYWdhaW5zdCBhIHNldCBvZiB2YWxpZGF0aW9uc1xuXHRcdFx0XHQvL1x0UmV0dXJucyB0cnVlIGlmIHRoZSB2YWx1ZSBpcyB2YWxpZCwgb3IgYW4gb2JqZWN0IFxuXHRcdFx0XHR2YWxpZGF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCB2YWxpZGF0aW9ucykge1xuXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uLFxuXHRcdFx0XHRcdFx0dG1wLFxuXHRcdFx0XHRcdFx0cmVzdWx0ID0gW107XG5cdFx0XHRcdFx0Zm9yKHZhbGlkYXRpb24gaW4gdmFsaWRhdGlvbnMpIHtcblx0XHRcdFx0XHRcdGlmKHZhbGlkYXRpb24gPT0gXCJpc1JlcXVpcmVkXCIpIHtcblx0XHRcdFx0XHRcdFx0Ly9cdHVzZSBvdXIgXCJpc1JlcXVpcmVkXCIgZnVuY3Rpb25cblx0XHRcdFx0XHRcdFx0dG1wID0gaXNOb3RFbXB0eSh2YWx1ZSk/IHRydWU6IHZhbGlkYXRpb25zW3ZhbGlkYXRpb25dOyBcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vXHRVc2UgdmFsaWRhdG9yIG1ldGhvZFxuXHRcdFx0XHRcdFx0XHR0bXAgPSB2YWxpZGF0b3JbdmFsaWRhdGlvbl0odmFsdWUpPyB0cnVlOiB2YWxpZGF0aW9uc1t2YWxpZGF0aW9uXTsgXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vXHRIYW5kbGUgbXVsdGlwbGUgbWVzc2FnZXNcblx0XHRcdFx0XHRcdGlmKHRtcCAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSAocmVzdWx0ID09PSB0cnVlIHx8IHJlc3VsdCA9PSBcInVuZGVmaW5lZFwiKT8gW106IHJlc3VsdDtcblx0XHRcdFx0XHRcdFx0cmVzdWx0LnB1c2godG1wKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH07XG5cblx0XHRcdGlmKG5hbWUpIHtcblx0XHRcdFx0cmVzdWx0ID0gdmFsaWRhdGUobmFtZSwgZ2V0VmFsdWUobmFtZSksIHZPYmpbbmFtZV0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9cdFZhbGlkYXRlIHRoZSB3aG9sZSBtb2RlbFxuXHRcdFx0XHRmb3IobmFtZSBpbiB2T2JqKSB7XG5cdFx0XHRcdFx0dG1wID0gdmFsaWRhdGUobmFtZSwgZ2V0VmFsdWUobmFtZSksIHZPYmpbbmFtZV0pO1xuXHRcdFx0XHRcdGlmKHRtcCAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0aGFzSW52YWxpZEZpZWxkID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gdG1wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFoYXNJbnZhbGlkRmllbGQpIHtcblx0XHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHR9XG59OyIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE1IENocmlzIE8nSGFyYSA8Y29oYXJhODdAZ21haWwuY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4gKiBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG4gKiBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG4gKiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbiAqIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbihmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbikge1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0Jykge1xuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc1tuYW1lXSA9IGRlZmluaXRpb24oKTtcbiAgICB9XG59KSgndmFsaWRhdG9yJywgZnVuY3Rpb24gKHZhbGlkYXRvcikge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFsaWRhdG9yID0geyB2ZXJzaW9uOiAnMy40MC4wJyB9O1xuXG4gICAgdmFyIGVtYWlsVXNlciA9IC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdKXwoXFxcXFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl0pKSkqKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPyhcXHgyMikpKSQvaTtcblxuICAgIHZhciBlbWFpbFVzZXJVdGY4ID0gL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSkkL2k7XG5cbiAgICB2YXIgZGlzcGxheU5hbWUgPSAvXig/OlthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5cXC5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSsoPzpbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XFwuXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXXxcXHMpKjwoLispPiQvaTtcblxuICAgIHZhciBjcmVkaXRDYXJkID0gL14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV1bMC05XSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fCg/OjIxMzF8MTgwMHwzNVxcZHszfSlcXGR7MTF9KSQvO1xuXG4gICAgdmFyIGlzaW4gPSAvXltBLVpdezJ9WzAtOUEtWl17OX1bMC05XSQvO1xuXG4gICAgdmFyIGlzYm4xME1heWJlID0gL14oPzpbMC05XXs5fVh8WzAtOV17MTB9KSQvXG4gICAgICAsIGlzYm4xM01heWJlID0gL14oPzpbMC05XXsxM30pJC87XG5cbiAgICB2YXIgaXB2NE1heWJlID0gL14oXFxkKylcXC4oXFxkKylcXC4oXFxkKylcXC4oXFxkKykkL1xuICAgICAgLCBpcHY2QmxvY2sgPSAvXlswLTlBLUZdezEsNH0kL2k7XG5cbiAgICB2YXIgdXVpZCA9IHtcbiAgICAgICAgJzMnOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTNbMC05QS1GXXszfS1bMC05QS1GXXs0fS1bMC05QS1GXXsxMn0kL2lcbiAgICAgICwgJzQnOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTRbMC05QS1GXXszfS1bODlBQl1bMC05QS1GXXszfS1bMC05QS1GXXsxMn0kL2lcbiAgICAgICwgJzUnOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTVbMC05QS1GXXszfS1bODlBQl1bMC05QS1GXXszfS1bMC05QS1GXXsxMn0kL2lcbiAgICAgICwgYWxsOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LVswLTlBLUZdezR9LVswLTlBLUZdezR9LVswLTlBLUZdezEyfSQvaVxuICAgIH07XG5cbiAgICB2YXIgYWxwaGEgPSAvXltBLVpdKyQvaVxuICAgICAgLCBhbHBoYW51bWVyaWMgPSAvXlswLTlBLVpdKyQvaVxuICAgICAgLCBudW1lcmljID0gL15bLStdP1swLTldKyQvXG4gICAgICAsIGludCA9IC9eKD86Wy0rXT8oPzowfFsxLTldWzAtOV0qKSkkL1xuICAgICAgLCBmbG9hdCA9IC9eKD86Wy0rXT8oPzpbMC05XSspKT8oPzpcXC5bMC05XSopPyg/OltlRV1bXFwrXFwtXT8oPzpbMC05XSspKT8kL1xuICAgICAgLCBoZXhhZGVjaW1hbCA9IC9eWzAtOUEtRl0rJC9pXG4gICAgICAsIGhleGNvbG9yID0gL14jPyhbMC05QS1GXXszfXxbMC05QS1GXXs2fSkkL2k7XG5cbiAgICB2YXIgYXNjaWkgPSAvXltcXHgwMC1cXHg3Rl0rJC9cbiAgICAgICwgbXVsdGlieXRlID0gL1teXFx4MDAtXFx4N0ZdL1xuICAgICAgLCBmdWxsV2lkdGggPSAvW15cXHUwMDIwLVxcdTAwN0VcXHVGRjYxLVxcdUZGOUZcXHVGRkEwLVxcdUZGRENcXHVGRkU4LVxcdUZGRUUwLTlhLXpBLVpdL1xuICAgICAgLCBoYWxmV2lkdGggPSAvW1xcdTAwMjAtXFx1MDA3RVxcdUZGNjEtXFx1RkY5RlxcdUZGQTAtXFx1RkZEQ1xcdUZGRTgtXFx1RkZFRTAtOWEtekEtWl0vO1xuXG4gICAgdmFyIHN1cnJvZ2F0ZVBhaXIgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS87XG5cbiAgICB2YXIgYmFzZTY0ID0gL14oPzpbQS1aMC05K1xcL117NH0pKig/OltBLVowLTkrXFwvXXsyfT09fFtBLVowLTkrXFwvXXszfT18W0EtWjAtOStcXC9dezR9KSQvaTtcblxuICAgIHZhciBwaG9uZXMgPSB7XG4gICAgICAnemgtQ04nOiAvXihcXCs/MD84NlxcLT8pPzFbMzQ1Nzg5XVxcZHs5fSQvLFxuICAgICAgJ2VuLVpBJzogL14oXFwrPzI3fDApXFxkezl9JC8sXG4gICAgICAnZW4tQVUnOiAvXihcXCs/NjF8MCk0XFxkezh9JC8sXG4gICAgICAnZW4tSEsnOiAvXihcXCs/ODUyXFwtPyk/WzU2OV1cXGR7M31cXC0/XFxkezR9JC8sXG4gICAgICAnZnItRlInOiAvXihcXCs/MzN8MClbNjddXFxkezh9JC8sXG4gICAgICAncHQtUFQnOiAvXihcXCszNTEpPzlbMTIzNl1cXGR7N30kLyxcbiAgICAgICdlbC1HUic6IC9eKFxcKzMwKT8oKDJcXGR7OX0pfCg2OVxcZHs4fSkpJC8sXG4gICAgICAnZW4tR0InOiAvXihcXCs/NDR8MCk3XFxkezl9JC8sXG4gICAgICAnZW4tVVMnOiAvXihcXCs/MSk/WzItOV1cXGR7Mn1bMi05XSg/ITExKVxcZHs2fSQvLFxuICAgICAgJ2VuLVpNJzogL14oXFwrMjYpPzA5WzU2N11cXGR7N30kL1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuZXh0ZW5kID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgICAgIHZhbGlkYXRvcltuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGFyZ3NbMF0gPSB2YWxpZGF0b3IudG9TdHJpbmcoYXJnc1swXSk7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodmFsaWRhdG9yLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgLy9SaWdodCBiZWZvcmUgZXhwb3J0aW5nIHRoZSB2YWxpZGF0b3Igb2JqZWN0LCBwYXNzIGVhY2ggb2YgdGhlIGJ1aWx0aW5zXG4gICAgLy90aHJvdWdoIGV4dGVuZCgpIHNvIHRoYXQgdGhlaXIgZmlyc3QgYXJndW1lbnQgaXMgY29lcmNlZCB0byBhIHN0cmluZ1xuICAgIHZhbGlkYXRvci5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHZhbGlkYXRvcikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWxpZGF0b3JbbmFtZV0gIT09ICdmdW5jdGlvbicgfHwgbmFtZSA9PT0gJ3RvU3RyaW5nJyB8fFxuICAgICAgICAgICAgICAgICAgICBuYW1lID09PSAndG9EYXRlJyB8fCBuYW1lID09PSAnZXh0ZW5kJyB8fCBuYW1lID09PSAnaW5pdCcpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbGlkYXRvci5leHRlbmQobmFtZSwgdmFsaWRhdG9yW25hbWVdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9TdHJpbmcgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiYgaW5wdXQgIT09IG51bGwgJiYgaW5wdXQudG9TdHJpbmcpIHtcbiAgICAgICAgICAgIGlucHV0ID0gaW5wdXQudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dCA9PT0gbnVsbCB8fCB0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnIHx8IChpc05hTihpbnB1dCkgJiYgIWlucHV0Lmxlbmd0aCkpIHtcbiAgICAgICAgICAgIGlucHV0ID0gJyc7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaW5wdXQgKz0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9EYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChkYXRlKSA9PT0gJ1tvYmplY3QgRGF0ZV0nKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICAgICAgfVxuICAgICAgICBkYXRlID0gRGF0ZS5wYXJzZShkYXRlKTtcbiAgICAgICAgcmV0dXJuICFpc05hTihkYXRlKSA/IG5ldyBEYXRlKGRhdGUpIDogbnVsbDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvRmxvYXQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0ludCA9IGZ1bmN0aW9uIChzdHIsIHJhZGl4KSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChzdHIsIHJhZGl4IHx8IDEwKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvQm9vbGVhbiA9IGZ1bmN0aW9uIChzdHIsIHN0cmljdCkge1xuICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyID09PSAnMScgfHwgc3RyID09PSAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0ciAhPT0gJzAnICYmIHN0ciAhPT0gJ2ZhbHNlJyAmJiBzdHIgIT09ICcnO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuZXF1YWxzID0gZnVuY3Rpb24gKHN0ciwgY29tcGFyaXNvbikge1xuICAgICAgICByZXR1cm4gc3RyID09PSB2YWxpZGF0b3IudG9TdHJpbmcoY29tcGFyaXNvbik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5jb250YWlucyA9IGZ1bmN0aW9uIChzdHIsIGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIHN0ci5pbmRleE9mKHZhbGlkYXRvci50b1N0cmluZyhlbGVtKSkgPj0gMDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLm1hdGNoZXMgPSBmdW5jdGlvbiAoc3RyLCBwYXR0ZXJuLCBtb2RpZmllcnMpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwYXR0ZXJuKSAhPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICAgICAgICAgIHBhdHRlcm4gPSBuZXcgUmVnRXhwKHBhdHRlcm4sIG1vZGlmaWVycyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdHRlcm4udGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF9lbWFpbF9vcHRpb25zID0ge1xuICAgICAgICBhbGxvd19kaXNwbGF5X25hbWU6IGZhbHNlLFxuICAgICAgICBhbGxvd191dGY4X2xvY2FsX3BhcnQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVfdGxkOiB0cnVlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0VtYWlsID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF9lbWFpbF9vcHRpb25zKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5hbGxvd19kaXNwbGF5X25hbWUpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5X2VtYWlsID0gc3RyLm1hdGNoKGRpc3BsYXlOYW1lKTtcbiAgICAgICAgICAgIGlmIChkaXNwbGF5X2VtYWlsKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gZGlzcGxheV9lbWFpbFsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgvXFxzLy50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnQCcpXG4gICAgICAgICAgLCBkb21haW4gPSBwYXJ0cy5wb3AoKVxuICAgICAgICAgICwgdXNlciA9IHBhcnRzLmpvaW4oJ0AnKTtcblxuICAgICAgICBpZiAoIXZhbGlkYXRvci5pc0ZRRE4oZG9tYWluLCB7cmVxdWlyZV90bGQ6IG9wdGlvbnMucmVxdWlyZV90bGR9KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuYWxsb3dfdXRmOF9sb2NhbF9wYXJ0ID9cbiAgICAgICAgICAgIGVtYWlsVXNlclV0ZjgudGVzdCh1c2VyKSA6XG4gICAgICAgICAgICBlbWFpbFVzZXIudGVzdCh1c2VyKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfdXJsX29wdGlvbnMgPSB7XG4gICAgICAgIHByb3RvY29sczogWyAnaHR0cCcsICdodHRwcycsICdmdHAnIF1cbiAgICAgICwgcmVxdWlyZV90bGQ6IHRydWVcbiAgICAgICwgcmVxdWlyZV9wcm90b2NvbDogZmFsc2VcbiAgICAgICwgYWxsb3dfdW5kZXJzY29yZXM6IGZhbHNlXG4gICAgICAsIGFsbG93X3RyYWlsaW5nX2RvdDogZmFsc2VcbiAgICAgICwgYWxsb3dfcHJvdG9jb2xfcmVsYXRpdmVfdXJsczogZmFsc2VcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVVJMID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIXVybCB8fCB1cmwubGVuZ3RoID49IDIwODMgfHwgL1xccy8udGVzdCh1cmwpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybC5pbmRleE9mKCdtYWlsdG86JykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF91cmxfb3B0aW9ucyk7XG4gICAgICAgIHZhciBwcm90b2NvbCwgYXV0aCwgaG9zdCwgaG9zdG5hbWUsIHBvcnQsXG4gICAgICAgICAgICBwb3J0X3N0ciwgc3BsaXQ7XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCc6Ly8nKTtcbiAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHByb3RvY29sID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnByb3RvY29scy5pbmRleE9mKHByb3RvY29sKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5yZXF1aXJlX3Byb3RvY29sKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gIGVsc2UgaWYgKG9wdGlvbnMuYWxsb3dfcHJvdG9jb2xfcmVsYXRpdmVfdXJscyAmJiB1cmwuc3Vic3RyKDAsIDIpID09PSAnLy8nKSB7XG4gICAgICAgICAgICBzcGxpdFswXSA9IHVybC5zdWJzdHIoMik7XG4gICAgICAgIH1cbiAgICAgICAgdXJsID0gc3BsaXQuam9pbignOi8vJyk7XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCcjJyk7XG4gICAgICAgIHVybCA9IHNwbGl0LnNoaWZ0KCk7XG5cbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICAgICAgdXJsID0gc3BsaXQuc2hpZnQoKTtcblxuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnLycpO1xuICAgICAgICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnQCcpO1xuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgYXV0aCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAoYXV0aC5pbmRleE9mKCc6JykgPj0gMCAmJiBhdXRoLnNwbGl0KCc6JykubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBob3N0bmFtZSA9IHNwbGl0LmpvaW4oJ0AnKTtcbiAgICAgICAgc3BsaXQgPSBob3N0bmFtZS5zcGxpdCgnOicpO1xuICAgICAgICBob3N0ID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcG9ydF9zdHIgPSBzcGxpdC5qb2luKCc6Jyk7XG4gICAgICAgICAgICBwb3J0ID0gcGFyc2VJbnQocG9ydF9zdHIsIDEwKTtcbiAgICAgICAgICAgIGlmICghL15bMC05XSskLy50ZXN0KHBvcnRfc3RyKSB8fCBwb3J0IDw9IDAgfHwgcG9ydCA+IDY1NTM1KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRhdG9yLmlzSVAoaG9zdCkgJiYgIXZhbGlkYXRvci5pc0ZRRE4oaG9zdCwgb3B0aW9ucykgJiZcbiAgICAgICAgICAgICAgICBob3N0ICE9PSAnbG9jYWxob3N0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmhvc3Rfd2hpdGVsaXN0ICYmXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ob3N0X3doaXRlbGlzdC5pbmRleE9mKGhvc3QpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmhvc3RfYmxhY2tsaXN0ICYmXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ob3N0X2JsYWNrbGlzdC5pbmRleE9mKGhvc3QpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJUCA9IGZ1bmN0aW9uIChzdHIsIHZlcnNpb24pIHtcbiAgICAgICAgdmVyc2lvbiA9IHZhbGlkYXRvci50b1N0cmluZyh2ZXJzaW9uKTtcbiAgICAgICAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzSVAoc3RyLCA0KSB8fCB2YWxpZGF0b3IuaXNJUChzdHIsIDYpO1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnNpb24gPT09ICc0Jykge1xuICAgICAgICAgICAgaWYgKCFpcHY0TWF5YmUudGVzdChzdHIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KCcuJykuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhcnRzWzNdIDw9IDI1NTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uID09PSAnNicpIHtcbiAgICAgICAgICAgIHZhciBibG9ja3MgPSBzdHIuc3BsaXQoJzonKTtcbiAgICAgICAgICAgIHZhciBmb3VuZE9taXNzaW9uQmxvY2sgPSBmYWxzZTsgLy8gbWFya2VyIHRvIGluZGljYXRlIDo6XG5cbiAgICAgICAgICAgIGlmIChibG9ja3MubGVuZ3RoID4gOClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIGluaXRpYWwgb3IgZmluYWwgOjpcbiAgICAgICAgICAgIGlmIChzdHIgPT09ICc6OicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyLnN1YnN0cigwLCAyKSA9PT0gJzo6Jykge1xuICAgICAgICAgICAgICAgIGJsb2Nrcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGJsb2Nrcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGZvdW5kT21pc3Npb25CbG9jayA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0ci5zdWJzdHIoc3RyLmxlbmd0aCAtIDIpID09PSAnOjonKSB7XG4gICAgICAgICAgICAgICAgYmxvY2tzLnBvcCgpO1xuICAgICAgICAgICAgICAgIGJsb2Nrcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBmb3VuZE9taXNzaW9uQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIC8vIHRlc3QgZm9yIGEgOjogd2hpY2ggY2FuIG5vdCBiZSBhdCB0aGUgc3RyaW5nIHN0YXJ0L2VuZFxuICAgICAgICAgICAgICAgIC8vIHNpbmNlIHRob3NlIGNhc2VzIGhhdmUgYmVlbiBoYW5kbGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgaWYgKGJsb2Nrc1tpXSA9PT0gJycgJiYgaSA+IDAgJiYgaSA8IGJsb2Nrcy5sZW5ndGggLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kT21pc3Npb25CbG9jaylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gbXVsdGlwbGUgOjogaW4gYWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICBmb3VuZE9taXNzaW9uQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlwdjZCbG9jay50ZXN0KGJsb2Nrc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZvdW5kT21pc3Npb25CbG9jaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBibG9ja3MubGVuZ3RoID49IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBibG9ja3MubGVuZ3RoID09PSA4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfZnFkbl9vcHRpb25zID0ge1xuICAgICAgICByZXF1aXJlX3RsZDogdHJ1ZVxuICAgICAgLCBhbGxvd191bmRlcnNjb3JlczogZmFsc2VcbiAgICAgICwgYWxsb3dfdHJhaWxpbmdfZG90OiBmYWxzZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNGUUROID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF9mcWRuX29wdGlvbnMpO1xuXG4gICAgICAgIC8qIFJlbW92ZSB0aGUgb3B0aW9uYWwgdHJhaWxpbmcgZG90IGJlZm9yZSBjaGVja2luZyB2YWxpZGl0eSAqL1xuICAgICAgICBpZiAob3B0aW9ucy5hbGxvd190cmFpbGluZ19kb3QgJiYgc3RyW3N0ci5sZW5ndGggLSAxXSA9PT0gJy4nKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKG9wdGlvbnMucmVxdWlyZV90bGQpIHtcbiAgICAgICAgICAgIHZhciB0bGQgPSBwYXJ0cy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghcGFydHMubGVuZ3RoIHx8ICEvXihbYS16XFx1MDBhMS1cXHVmZmZmXXsyLH18eG5bYS16MC05LV17Mix9KSQvaS50ZXN0KHRsZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgcGFydCwgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfdW5kZXJzY29yZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFydC5pbmRleE9mKCdfXycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJ0ID0gcGFydC5yZXBsYWNlKC9fL2csICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghL15bYS16XFx1MDBhMS1cXHVmZmZmMC05LV0rJC9pLnRlc3QocGFydCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydFswXSA9PT0gJy0nIHx8IHBhcnRbcGFydC5sZW5ndGggLSAxXSA9PT0gJy0nIHx8XG4gICAgICAgICAgICAgICAgICAgIHBhcnQuaW5kZXhPZignLS0tJykgPj0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKHN0cikge1xuICAgICAgICByZXR1cm4gKFsndHJ1ZScsICdmYWxzZScsICcxJywgJzAnXS5pbmRleE9mKHN0cikgPj0gMCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0FscGhhID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gYWxwaGEudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBbHBoYW51bWVyaWMgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBhbHBoYW51bWVyaWMudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNOdW1lcmljID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gbnVtZXJpYy50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0hleGFkZWNpbWFsID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gaGV4YWRlY2ltYWwudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNIZXhDb2xvciA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGhleGNvbG9yLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTG93ZXJjYXNlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyID09PSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVXBwZXJjYXNlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyID09PSBzdHIudG9VcHBlckNhc2UoKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSW50ID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgcmV0dXJuIGludC50ZXN0KHN0cikgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdtaW4nKSB8fCBzdHIgPj0gb3B0aW9ucy5taW4pICYmICghb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbWF4JykgfHwgc3RyIDw9IG9wdGlvbnMubWF4KTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRmxvYXQgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICByZXR1cm4gc3RyICE9PSAnJyAmJiBmbG9hdC50ZXN0KHN0cikgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdtaW4nKSB8fCBzdHIgPj0gb3B0aW9ucy5taW4pICYmICghb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbWF4JykgfHwgc3RyIDw9IG9wdGlvbnMubWF4KTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRGl2aXNpYmxlQnkgPSBmdW5jdGlvbiAoc3RyLCBudW0pIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRvci50b0Zsb2F0KHN0cikgJSB2YWxpZGF0b3IudG9JbnQobnVtKSA9PT0gMDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTnVsbCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5sZW5ndGggPT09IDA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0xlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIG1pbiwgbWF4KSB7XG4gICAgICAgIHZhciBzdXJyb2dhdGVQYWlycyA9IHN0ci5tYXRjaCgvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nKSB8fCBbXTtcbiAgICAgICAgdmFyIGxlbiA9IHN0ci5sZW5ndGggLSBzdXJyb2dhdGVQYWlycy5sZW5ndGg7XG4gICAgICAgIHJldHVybiBsZW4gPj0gbWluICYmICh0eXBlb2YgbWF4ID09PSAndW5kZWZpbmVkJyB8fCBsZW4gPD0gbWF4KTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBzdHIubGVuZ3RoID49IG1pbiAmJiAodHlwZW9mIG1heCA9PT0gJ3VuZGVmaW5lZCcgfHwgc3RyLmxlbmd0aCA8PSBtYXgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNVVUlEID0gZnVuY3Rpb24gKHN0ciwgdmVyc2lvbikge1xuICAgICAgICB2YXIgcGF0dGVybiA9IHV1aWRbdmVyc2lvbiA/IHZlcnNpb24gOiAnYWxsJ107XG4gICAgICAgIHJldHVybiBwYXR0ZXJuICYmIHBhdHRlcm4udGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNEYXRlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gIWlzTmFOKERhdGUucGFyc2Uoc3RyKSk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0FmdGVyID0gZnVuY3Rpb24gKHN0ciwgZGF0ZSkge1xuICAgICAgICB2YXIgY29tcGFyaXNvbiA9IHZhbGlkYXRvci50b0RhdGUoZGF0ZSB8fCBuZXcgRGF0ZSgpKVxuICAgICAgICAgICwgb3JpZ2luYWwgPSB2YWxpZGF0b3IudG9EYXRlKHN0cik7XG4gICAgICAgIHJldHVybiAhIShvcmlnaW5hbCAmJiBjb21wYXJpc29uICYmIG9yaWdpbmFsID4gY29tcGFyaXNvbik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0JlZm9yZSA9IGZ1bmN0aW9uIChzdHIsIGRhdGUpIHtcbiAgICAgICAgdmFyIGNvbXBhcmlzb24gPSB2YWxpZGF0b3IudG9EYXRlKGRhdGUgfHwgbmV3IERhdGUoKSlcbiAgICAgICAgICAsIG9yaWdpbmFsID0gdmFsaWRhdG9yLnRvRGF0ZShzdHIpO1xuICAgICAgICByZXR1cm4gb3JpZ2luYWwgJiYgY29tcGFyaXNvbiAmJiBvcmlnaW5hbCA8IGNvbXBhcmlzb247XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0luID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvcHRpb25zKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICBmb3IgKGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gdmFsaWRhdG9yLnRvU3RyaW5nKG9wdGlvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2Yoc3RyKSA+PSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoc3RyKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmluZGV4T2Yoc3RyKSA+PSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQ3JlZGl0Q2FyZCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdmFyIHNhbml0aXplZCA9IHN0ci5yZXBsYWNlKC9bXjAtOV0rL2csICcnKTtcbiAgICAgICAgaWYgKCFjcmVkaXRDYXJkLnRlc3Qoc2FuaXRpemVkKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdW0gPSAwLCBkaWdpdCwgdG1wTnVtLCBzaG91bGREb3VibGU7XG4gICAgICAgIGZvciAodmFyIGkgPSBzYW5pdGl6ZWQubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGRpZ2l0ID0gc2FuaXRpemVkLnN1YnN0cmluZyhpLCAoaSArIDEpKTtcbiAgICAgICAgICAgIHRtcE51bSA9IHBhcnNlSW50KGRpZ2l0LCAxMCk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkRG91YmxlKSB7XG4gICAgICAgICAgICAgICAgdG1wTnVtICo9IDI7XG4gICAgICAgICAgICAgICAgaWYgKHRtcE51bSA+PSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gKCh0bXBOdW0gJSAxMCkgKyAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gdG1wTnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IHRtcE51bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNob3VsZERvdWJsZSA9ICFzaG91bGREb3VibGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEhKChzdW0gJSAxMCkgPT09IDAgPyBzYW5pdGl6ZWQgOiBmYWxzZSk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0lTSU4gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGlmICghaXNpbi50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjaGVja3N1bVN0ciA9IHN0ci5yZXBsYWNlKC9bQS1aXS9nLCBmdW5jdGlvbihjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChjaGFyYWN0ZXIsIDM2KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHN1bSA9IDAsIGRpZ2l0LCB0bXBOdW0sIHNob3VsZERvdWJsZSA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGkgPSBjaGVja3N1bVN0ci5sZW5ndGggLSAyOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgZGlnaXQgPSBjaGVja3N1bVN0ci5zdWJzdHJpbmcoaSwgKGkgKyAxKSk7XG4gICAgICAgICAgICB0bXBOdW0gPSBwYXJzZUludChkaWdpdCwgMTApO1xuICAgICAgICAgICAgaWYgKHNob3VsZERvdWJsZSkge1xuICAgICAgICAgICAgICAgIHRtcE51bSAqPSAyO1xuICAgICAgICAgICAgICAgIGlmICh0bXBOdW0gPj0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IHRtcE51bSArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IHRtcE51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG91bGREb3VibGUgPSAhc2hvdWxkRG91YmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0ci5zdWJzdHIoc3RyLmxlbmd0aCAtIDEpLCAxMCkgPT09ICgxMDAwMCAtIHN1bSkgJSAxMDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSVNCTiA9IGZ1bmN0aW9uIChzdHIsIHZlcnNpb24pIHtcbiAgICAgICAgdmVyc2lvbiA9IHZhbGlkYXRvci50b1N0cmluZyh2ZXJzaW9uKTtcbiAgICAgICAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzSVNCTihzdHIsIDEwKSB8fCB2YWxpZGF0b3IuaXNJU0JOKHN0ciwgMTMpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzYW5pdGl6ZWQgPSBzdHIucmVwbGFjZSgvW1xccy1dKy9nLCAnJylcbiAgICAgICAgICAsIGNoZWNrc3VtID0gMCwgaTtcbiAgICAgICAgaWYgKHZlcnNpb24gPT09ICcxMCcpIHtcbiAgICAgICAgICAgIGlmICghaXNibjEwTWF5YmUudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IChpICsgMSkgKiBzYW5pdGl6ZWQuY2hhckF0KGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNhbml0aXplZC5jaGFyQXQoOSkgPT09ICdYJykge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IDEwICogMTA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IDEwICogc2FuaXRpemVkLmNoYXJBdCg5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoY2hlY2tzdW0gJSAxMSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFzYW5pdGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSAgaWYgKHZlcnNpb24gPT09ICcxMycpIHtcbiAgICAgICAgICAgIGlmICghaXNibjEzTWF5YmUudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZhY3RvciA9IFsgMSwgMyBdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjaGVja3N1bSArPSBmYWN0b3JbaSAlIDJdICogc2FuaXRpemVkLmNoYXJBdChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzYW5pdGl6ZWQuY2hhckF0KDEyKSAtICgoMTAgLSAoY2hlY2tzdW0gJSAxMCkpICUgMTApID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhc2FuaXRpemVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTW9iaWxlUGhvbmUgPSBmdW5jdGlvbihzdHIsIGxvY2FsZSkge1xuICAgICAgICBpZiAobG9jYWxlIGluIHBob25lcykge1xuICAgICAgICAgICAgcmV0dXJuIHBob25lc1tsb2NhbGVdLnRlc3Qoc3RyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0X2N1cnJlbmN5X29wdGlvbnMgPSB7XG4gICAgICAgIHN5bWJvbDogJyQnXG4gICAgICAsIHJlcXVpcmVfc3ltYm9sOiBmYWxzZVxuICAgICAgLCBhbGxvd19zcGFjZV9hZnRlcl9zeW1ib2w6IGZhbHNlXG4gICAgICAsIHN5bWJvbF9hZnRlcl9kaWdpdHM6IGZhbHNlXG4gICAgICAsIGFsbG93X25lZ2F0aXZlczogdHJ1ZVxuICAgICAgLCBwYXJlbnNfZm9yX25lZ2F0aXZlczogZmFsc2VcbiAgICAgICwgbmVnYXRpdmVfc2lnbl9iZWZvcmVfZGlnaXRzOiBmYWxzZVxuICAgICAgLCBuZWdhdGl2ZV9zaWduX2FmdGVyX2RpZ2l0czogZmFsc2VcbiAgICAgICwgYWxsb3dfbmVnYXRpdmVfc2lnbl9wbGFjZWhvbGRlcjogZmFsc2VcbiAgICAgICwgdGhvdXNhbmRzX3NlcGFyYXRvcjogJywnXG4gICAgICAsIGRlY2ltYWxfc2VwYXJhdG9yOiAnLidcbiAgICAgICwgYWxsb3dfc3BhY2VfYWZ0ZXJfZGlnaXRzOiBmYWxzZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNDdXJyZW5jeSA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfY3VycmVuY3lfb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbmN5UmVnZXgob3B0aW9ucykudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNKU09OID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgSlNPTi5wYXJzZShzdHIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc011bHRpYnl0ZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpYnl0ZS50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0FzY2lpID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gYXNjaWkudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNGdWxsV2lkdGggPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBmdWxsV2lkdGgudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNIYWxmV2lkdGggPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBoYWxmV2lkdGgudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNWYXJpYWJsZVdpZHRoID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gZnVsbFdpZHRoLnRlc3Qoc3RyKSAmJiBoYWxmV2lkdGgudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNTdXJyb2dhdGVQYWlyID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3Vycm9nYXRlUGFpci50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0Jhc2U2NCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGJhc2U2NC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc01vbmdvSWQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0b3IuaXNIZXhhZGVjaW1hbChzdHIpICYmIHN0ci5sZW5ndGggPT09IDI0O1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IubHRyaW0gPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICB2YXIgcGF0dGVybiA9IGNoYXJzID8gbmV3IFJlZ0V4cCgnXlsnICsgY2hhcnMgKyAnXSsnLCAnZycpIDogL15cXHMrL2c7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShwYXR0ZXJuLCAnJyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5ydHJpbSA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gY2hhcnMgPyBuZXcgUmVnRXhwKCdbJyArIGNoYXJzICsgJ10rJCcsICdnJykgOiAvXFxzKyQvZztcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRyaW0gPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICB2YXIgcGF0dGVybiA9IGNoYXJzID8gbmV3IFJlZ0V4cCgnXlsnICsgY2hhcnMgKyAnXSt8WycgKyBjaGFycyArICddKyQnLCAnZycpIDogL15cXHMrfFxccyskL2c7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShwYXR0ZXJuLCAnJyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5lc2NhcGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiAoc3RyLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csICcmI3gyNzsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnJiN4MkY7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXGAvZywgJyYjOTY7JykpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3Iuc3RyaXBMb3cgPSBmdW5jdGlvbiAoc3RyLCBrZWVwX25ld19saW5lcykge1xuICAgICAgICB2YXIgY2hhcnMgPSBrZWVwX25ld19saW5lcyA/ICdcXFxceDAwLVxcXFx4MDlcXFxceDBCXFxcXHgwQ1xcXFx4MEUtXFxcXHgxRlxcXFx4N0YnIDogJ1xcXFx4MDAtXFxcXHgxRlxcXFx4N0YnO1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmJsYWNrbGlzdChzdHIsIGNoYXJzKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLndoaXRlbGlzdCA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdbXicgKyBjaGFycyArICddKycsICdnJyksICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmJsYWNrbGlzdCA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdbJyArIGNoYXJzICsgJ10rJywgJ2cnKSwgJycpO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF9ub3JtYWxpemVfZW1haWxfb3B0aW9ucyA9IHtcbiAgICAgICAgbG93ZXJjYXNlOiB0cnVlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5ub3JtYWxpemVFbWFpbCA9IGZ1bmN0aW9uIChlbWFpbCwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF9ub3JtYWxpemVfZW1haWxfb3B0aW9ucyk7XG4gICAgICAgIGlmICghdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcnRzID0gZW1haWwuc3BsaXQoJ0AnLCAyKTtcbiAgICAgICAgcGFydHNbMV0gPSBwYXJ0c1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAocGFydHNbMV0gPT09ICdnbWFpbC5jb20nIHx8IHBhcnRzWzFdID09PSAnZ29vZ2xlbWFpbC5jb20nKSB7XG4gICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFwuL2csICcnKTtcbiAgICAgICAgICAgIGlmIChwYXJ0c1swXVswXSA9PT0gJysnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5zcGxpdCgnKycpWzBdO1xuICAgICAgICAgICAgcGFydHNbMV0gPSAnZ21haWwuY29tJztcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmxvd2VyY2FzZSkge1xuICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKCdAJyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1lcmdlKG9iaiwgZGVmYXVsdHMpIHtcbiAgICAgICAgb2JqID0gb2JqIHx8IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSBkZWZhdWx0c1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VycmVuY3lSZWdleChvcHRpb25zKSB7XG4gICAgICAgIHZhciBzeW1ib2wgPSAnKFxcXFwnICsgb3B0aW9ucy5zeW1ib2wucmVwbGFjZSgvXFwuL2csICdcXFxcLicpICsgJyknICsgKG9wdGlvbnMucmVxdWlyZV9zeW1ib2wgPyAnJyA6ICc/JylcbiAgICAgICAgICAgICwgbmVnYXRpdmUgPSAnLT8nXG4gICAgICAgICAgICAsIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aG91dF9zZXAgPSAnWzEtOV1cXFxcZConXG4gICAgICAgICAgICAsIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aF9zZXAgPSAnWzEtOV1cXFxcZHswLDJ9KFxcXFwnICsgb3B0aW9ucy50aG91c2FuZHNfc2VwYXJhdG9yICsgJ1xcXFxkezN9KSonXG4gICAgICAgICAgICAsIHZhbGlkX3dob2xlX2RvbGxhcl9hbW91bnRzID0gWycwJywgd2hvbGVfZG9sbGFyX2Ftb3VudF93aXRob3V0X3NlcCwgd2hvbGVfZG9sbGFyX2Ftb3VudF93aXRoX3NlcF1cbiAgICAgICAgICAgICwgd2hvbGVfZG9sbGFyX2Ftb3VudCA9ICcoJyArIHZhbGlkX3dob2xlX2RvbGxhcl9hbW91bnRzLmpvaW4oJ3wnKSArICcpPydcbiAgICAgICAgICAgICwgZGVjaW1hbF9hbW91bnQgPSAnKFxcXFwnICsgb3B0aW9ucy5kZWNpbWFsX3NlcGFyYXRvciArICdcXFxcZHsyfSk/JztcbiAgICAgICAgdmFyIHBhdHRlcm4gPSB3aG9sZV9kb2xsYXJfYW1vdW50ICsgZGVjaW1hbF9hbW91bnQ7XG4gICAgICAgIC8vIGRlZmF1bHQgaXMgbmVnYXRpdmUgc2lnbiBiZWZvcmUgc3ltYm9sLCBidXQgdGhlcmUgYXJlIHR3byBvdGhlciBvcHRpb25zIChiZXNpZGVzIHBhcmVucylcbiAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfbmVnYXRpdmVzICYmICFvcHRpb25zLnBhcmVuc19mb3JfbmVnYXRpdmVzKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5uZWdhdGl2ZV9zaWduX2FmdGVyX2RpZ2l0cykge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gKz0gbmVnYXRpdmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLm5lZ2F0aXZlX3NpZ25fYmVmb3JlX2RpZ2l0cykge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBuZWdhdGl2ZSArIHBhdHRlcm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gU291dGggQWZyaWNhbiBSYW5kLCBmb3IgZXhhbXBsZSwgdXNlcyBSIDEyMyAoc3BhY2UpIGFuZCBSLTEyMyAobm8gc3BhY2UpXG4gICAgICAgIGlmIChvcHRpb25zLmFsbG93X25lZ2F0aXZlX3NpZ25fcGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHBhdHRlcm4gPSAnKCAoPyFcXFxcLSkpPycgKyBwYXR0ZXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuYWxsb3dfc3BhY2VfYWZ0ZXJfc3ltYm9sKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gJyA/JyArIHBhdHRlcm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5hbGxvd19zcGFjZV9hZnRlcl9kaWdpdHMpIHtcbiAgICAgICAgICAgIHBhdHRlcm4gKz0gJyggKD8hJCkpPyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuc3ltYm9sX2FmdGVyX2RpZ2l0cykge1xuICAgICAgICAgICAgcGF0dGVybiArPSBzeW1ib2w7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gc3ltYm9sICsgcGF0dGVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5hbGxvd19uZWdhdGl2ZXMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnBhcmVuc19mb3JfbmVnYXRpdmVzKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9ICcoXFxcXCgnICsgcGF0dGVybiArICdcXFxcKXwnICsgcGF0dGVybiArICcpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCEob3B0aW9ucy5uZWdhdGl2ZV9zaWduX2JlZm9yZV9kaWdpdHMgfHwgb3B0aW9ucy5uZWdhdGl2ZV9zaWduX2FmdGVyX2RpZ2l0cykpIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmVnYXRpdmUgKyBwYXR0ZXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgJ14nICtcbiAgICAgICAgICAgIC8vIGVuc3VyZSB0aGVyZSdzIGEgZG9sbGFyIGFuZC9vciBkZWNpbWFsIGFtb3VudCwgYW5kIHRoYXQgaXQgZG9lc24ndCBzdGFydCB3aXRoIGEgc3BhY2Ugb3IgYSBuZWdhdGl2ZSBzaWduIGZvbGxvd2VkIGJ5IGEgc3BhY2VcbiAgICAgICAgICAgICcoPyEtPyApKD89LipcXFxcZCknICtcbiAgICAgICAgICAgIHBhdHRlcm4gK1xuICAgICAgICAgICAgJyQnXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdmFsaWRhdG9yLmluaXQoKTtcblxuICAgIHJldHVybiB2YWxpZGF0b3I7XG5cbn0pO1xuIiwiLypcblx0bWl0aHJpbC5hbmltYXRlIC0gQ29weXJpZ2h0IDIwMTQganNndXlcblx0TUlUIExpY2Vuc2VkLlxuKi9cbihmdW5jdGlvbigpe1xudmFyIG1pdGhyaWxBbmltYXRlID0gZnVuY3Rpb24gKG0pIHtcblx0Ly9cdEtub3duIHByZWZpZXhcblx0dmFyIHByZWZpeGVzID0gWydNb3onLCAnV2Via2l0JywgJ0todG1sJywgJ08nLCAnbXMnXSxcblx0dHJhbnNpdGlvblByb3BzID0gWydUcmFuc2l0aW9uUHJvcGVydHknLCAnVHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uJywgJ1RyYW5zaXRpb25EZWxheScsICdUcmFuc2l0aW9uRHVyYXRpb24nLCAnVHJhbnNpdGlvbkVuZCddLFxuXHR0cmFuc2Zvcm1Qcm9wcyA9IFsncm90YXRlJywgJ3JvdGF0ZXgnLCAncm90YXRleScsICdzY2FsZScsICdza2V3JywgJ3RyYW5zbGF0ZScsICd0cmFuc2xhdGV4JywgJ3RyYW5zbGF0ZXknLCAnbWF0cml4J10sXG5cblx0ZGVmYXVsdER1cmF0aW9uID0gNDAwLFxuXG5cdGVyciA9IGZ1bmN0aW9uKG1zZyl7XG5cdFx0KHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIikgJiYgd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5lcnJvciAmJiBjb25zb2xlLmVycm9yKG1zZyk7XG5cdH0sXG5cdFxuXHQvL1x0Q2FwaXRhbGlzZVx0XHRcblx0Y2FwID0gZnVuY3Rpb24oc3RyKXtcblx0XHRyZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnN1YnN0cigxKTtcblx0fSxcblxuXHQvL1x0Rm9yIGNoZWNraW5nIHdoYXQgdmVuZG9yIHByZWZpeGVzIGFyZSBuYXRpdmVcblx0ZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cblx0Ly9cdHZlbmRvciBwcmVmaXgsIGllOiB0cmFuc2l0aW9uRHVyYXRpb24gYmVjb21lcyBNb3pUcmFuc2l0aW9uRHVyYXRpb25cblx0dnAgPSBmdW5jdGlvbiAocHJvcCkge1xuXHRcdHZhciBwZjtcblx0XHQvL1x0SGFuZGxlIHVucHJlZml4ZWRcblx0XHRpZiAocHJvcCBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH1cblxuXHRcdC8vXHRIYW5kbGUga2V5ZnJhbWVzXG5cdFx0aWYocHJvcCA9PSBcIkBrZXlmcmFtZXNcIikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHQvL1x0VGVzdGluZyB1c2luZyB0cmFuc2l0aW9uXG5cdFx0XHRcdHBmID0gcHJlZml4ZXNbaV0gKyBcIlRyYW5zaXRpb25cIjtcblx0XHRcdFx0aWYgKHBmIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0XHRcdHJldHVybiBcIkAtXCIgKyBwcmVmaXhlc1tpXS50b0xvd2VyQ2FzZSgpICsgXCIta2V5ZnJhbWVzXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdHBmID0gcHJlZml4ZXNbaV0gKyBjYXAocHJvcCk7XG5cdFx0XHRpZiAocGYgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRcdHJldHVybiBwZjtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly9cdENhbid0IGZpbmQgaXQgLSByZXR1cm4gb3JpZ2luYWwgcHJvcGVydHkuXG5cdFx0cmV0dXJuIHByb3A7XG5cdH0sXG5cblx0Ly9cdFNlZSBpZiB3ZSBjYW4gdXNlIG5hdGl2ZSB0cmFuc2l0aW9uc1xuXHRzdXBwb3J0c1RyYW5zaXRpb25zID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGIgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblx0XHRcdHMgPSBiLnN0eWxlLFxuXHRcdFx0cCA9ICd0cmFuc2l0aW9uJztcblxuXHRcdGlmICh0eXBlb2Ygc1twXSA9PSAnc3RyaW5nJykgeyByZXR1cm4gdHJ1ZTsgfVxuXG5cdFx0Ly8gVGVzdHMgZm9yIHZlbmRvciBzcGVjaWZpYyBwcm9wXG5cdFx0cCA9IHAuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwLnN1YnN0cigxKTtcblxuXHRcdGZvciAodmFyIGk9MDsgaTxwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHR5cGVvZiBzW3ByZWZpeGVzW2ldICsgcF0gPT0gJ3N0cmluZycpIHsgcmV0dXJuIHRydWU7IH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0Ly9cdENvbnZlcnRzIENTUyB0cmFuc2l0aW9uIHRpbWVzIHRvIE1TXG5cdGdldFRpbWVpbk1TID0gZnVuY3Rpb24oc3RyKSB7XG5cdFx0dmFyIHJlc3VsdCA9IDAsIHRtcDtcblx0XHRzdHIgKz0gXCJcIjtcblx0XHRzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcblx0XHRpZihzdHIuaW5kZXhPZihcIm1zXCIpICE9PSAtMSkge1xuXHRcdFx0dG1wID0gc3RyLnNwbGl0KFwibXNcIik7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIodG1wWzBdKTtcblx0XHR9IGVsc2UgaWYoc3RyLmluZGV4T2YoXCJzXCIpICE9PSAtMSkge1xuXHRcdFx0Ly9cdHNcblx0XHRcdHRtcCA9IHN0ci5zcGxpdChcInNcIik7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIodG1wWzBdKSAqIDEwMDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdCA9IE51bWJlcihzdHIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBNYXRoLnJvdW5kKHJlc3VsdCk7XG5cdH0sXG5cblx0Ly9cdFNldCBzdHlsZSBwcm9wZXJ0aWVzXG5cdHNldFN0eWxlUHJvcHMgPSBmdW5jdGlvbihvYmosIHByb3BzKXtcblx0XHRmb3IodmFyIGkgaW4gcHJvcHMpIHtpZihwcm9wcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0b2JqLnN0eWxlW3ZwKGkpXSA9IHByb3BzW2ldO1xuXHRcdH19XG5cdH0sXG5cblx0Ly9cdFNldCBwcm9wcyBmb3IgdHJhbnNpdGlvbnMgYW5kIHRyYW5zZm9ybXMgd2l0aCBiYXNpYyBkZWZhdWx0c1xuXHRzZXRUcmFuc2l0aW9uUHJvcHMgPSBmdW5jdGlvbihhcmdzKXtcblx0XHR2YXIgcHJvcHMgPSB7XG5cdFx0XHRcdC8vXHRlYXNlLCBsaW5lYXIsIGVhc2UtaW4sIGVhc2Utb3V0LCBlYXNlLWluLW91dCwgY3ViaWMtYmV6aWVyKG4sbixuLG4pIGluaXRpYWwsIGluaGVyaXRcblx0XHRcdFx0VHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBcImVhc2VcIixcblx0XHRcdFx0VHJhbnNpdGlvbkR1cmF0aW9uOiBkZWZhdWx0RHVyYXRpb24gKyBcIm1zXCIsXG5cdFx0XHRcdFRyYW5zaXRpb25Qcm9wZXJ0eTogXCJhbGxcIlxuXHRcdFx0fSxcblx0XHRcdHAsIGksIHRtcCwgdG1wMiwgZm91bmQ7XG5cblx0XHQvL1x0U2V0IGFueSBhbGxvd2VkIHByb3BlcnRpZXMgXG5cdFx0Zm9yKHAgaW4gYXJncykgeyBpZihhcmdzLmhhc093blByb3BlcnR5KHApKSB7XG5cdFx0XHR0bXAgPSAnVHJhbnNpdGlvbicgKyBjYXAocCk7XG5cdFx0XHR0bXAyID0gcC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0Zm91bmQgPSBmYWxzZTtcblxuXHRcdFx0Ly9cdExvb2sgYXQgdHJhbnNpdGlvbiBwcm9wc1xuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNpdGlvblByb3BzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdGlmKHRtcCA9PSB0cmFuc2l0aW9uUHJvcHNbaV0pIHtcblx0XHRcdFx0XHRwcm9wc1t0cmFuc2l0aW9uUHJvcHNbaV1dID0gYXJnc1twXTtcblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9cdExvb2sgYXQgdHJhbnNmb3JtIHByb3BzXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCB0cmFuc2Zvcm1Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRpZih0bXAyID09IHRyYW5zZm9ybVByb3BzW2ldKSB7XG5cdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildID0gcHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildIHx8IFwiXCI7XG5cdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildICs9IFwiIFwiICtwICsgXCIoXCIgKyBhcmdzW3BdICsgXCIpXCI7XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKCFmb3VuZCkge1xuXHRcdFx0XHRwcm9wc1twXSA9IGFyZ3NbcF07XG5cdFx0XHR9XG5cdFx0fX1cblx0XHRyZXR1cm4gcHJvcHM7XG5cdH0sXG5cblx0Ly9cdEZpeCBhbmltYXRpdW9uIHByb3BlcnRpZXNcblx0Ly9cdE5vcm1hbGlzZXMgdHJhbnNmb3JtcywgZWc6IHJvdGF0ZSwgc2NhbGUsIGV0Yy4uLlxuXHRub3JtYWxpc2VUcmFuc2Zvcm1Qcm9wcyA9IGZ1bmN0aW9uKGFyZ3Mpe1xuXHRcdHZhciBwcm9wcyA9IHt9LFxuXHRcdFx0dG1wUHJvcCxcblx0XHRcdHAsIGksIGZvdW5kLFxuXHRcdFx0bm9ybWFsID0gZnVuY3Rpb24ocHJvcHMsIHAsIHZhbHVlKXtcblx0XHRcdFx0dmFyIHRtcCA9IHAudG9Mb3dlckNhc2UoKSxcblx0XHRcdFx0XHRmb3VuZCA9IGZhbHNlLCBpO1xuXG5cdFx0XHRcdC8vXHRMb29rIGF0IHRyYW5zZm9ybSBwcm9wc1xuXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCB0cmFuc2Zvcm1Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGlmKHRtcCA9PSB0cmFuc2Zvcm1Qcm9wc1tpXSkge1xuXHRcdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildID0gcHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildIHx8IFwiXCI7XG5cdFx0XHRcdFx0XHRwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gKz0gXCIgXCIgK3AgKyBcIihcIiArIHZhbHVlICsgXCIpXCI7XG5cdFx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighZm91bmQpIHtcblx0XHRcdFx0XHRwcm9wc1twXSA9IHZhbHVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vXHRSZW1vdmUgdHJhbnNmb3JtIHByb3BlcnR5XG5cdFx0XHRcdFx0ZGVsZXRlIHByb3BzW3BdO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0Ly9cdFNldCBhbnkgYWxsb3dlZCBwcm9wZXJ0aWVzIFxuXHRcdGZvcihwIGluIGFyZ3MpIHsgaWYoYXJncy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuXHRcdFx0Ly9cdElmIHdlIGhhdmUgYSBwZXJjZW50YWdlLCB3ZSBoYXZlIGEga2V5IGZyYW1lXG5cdFx0XHRpZihwLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuXHRcdFx0XHRmb3IoaSBpbiBhcmdzW3BdKSB7IGlmKGFyZ3NbcF0uaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdFx0XHRub3JtYWwoYXJnc1twXSwgaSwgYXJnc1twXVtpXSk7XG5cdFx0XHRcdH19XG5cdFx0XHRcdHByb3BzW3BdID0gYXJnc1twXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5vcm1hbChwcm9wcywgcCwgYXJnc1twXSk7XG5cdFx0XHR9XG5cdFx0fX1cblxuXHRcdHJldHVybiBwcm9wcztcblx0fSxcblxuXG5cdC8vXHRJZiBhbiBvYmplY3QgaXMgZW1wdHlcblx0aXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuXHRcdGZvcih2YXIgaSBpbiBvYmopIHtpZihvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9fVxuXHRcdHJldHVybiB0cnVlOyBcblx0fSxcblx0Ly9cdENyZWF0ZXMgYSBoYXNoZWQgbmFtZSBmb3IgdGhlIGFuaW1hdGlvblxuXHQvL1x0VXNlIHRvIGNyZWF0ZSBhIHVuaXF1ZSBrZXlmcmFtZSBhbmltYXRpb24gc3R5bGUgcnVsZVxuXHRhbmlOYW1lID0gZnVuY3Rpb24ocHJvcHMpe1xuXHRcdHJldHVybiBcImFuaVwiICsgSlNPTi5zdHJpbmdpZnkocHJvcHMpLnNwbGl0KC9be30sJVwiOl0vKS5qb2luKFwiXCIpO1xuXHR9LFxuXHRhbmltYXRpb25zID0ge30sXG5cblx0Ly9cdFNlZSBpZiB3ZSBjYW4gdXNlIHRyYW5zaXRpb25zXG5cdGNhblRyYW5zID0gc3VwcG9ydHNUcmFuc2l0aW9ucygpO1xuXG5cdC8vXHRJRTEwKyBodHRwOi8vY2FuaXVzZS5jb20vI3NlYXJjaD1jc3MtYW5pbWF0aW9uc1xuXHRtLmFuaW1hdGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24oZWwsIGFyZ3MsIGNiKXtcblx0XHRlbC5zdHlsZSA9IGVsLnN0eWxlIHx8IHt9O1xuXHRcdHZhciBwcm9wcyA9IHNldFRyYW5zaXRpb25Qcm9wcyhhcmdzKSwgdGltZTtcblxuXHRcdGlmKHR5cGVvZiBwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24gPSBnZXRUaW1laW5NUyhwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24pICsgXCJtc1wiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24gPSBkZWZhdWx0RHVyYXRpb24gKyBcIm1zXCI7XG5cdFx0fVxuXG5cdFx0dGltZSA9IGdldFRpbWVpbk1TKHByb3BzLlRyYW5zaXRpb25EdXJhdGlvbikgfHwgMDtcblxuXHRcdC8vXHRTZWUgaWYgd2Ugc3VwcG9ydCB0cmFuc2l0aW9uc1xuXHRcdGlmKGNhblRyYW5zKSB7XG5cdFx0XHRzZXRTdHlsZVByb3BzKGVsLCBwcm9wcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vXHRUcnkgYW5kIGZhbGwgYmFjayB0byBqUXVlcnlcblx0XHRcdC8vXHRUT0RPOiBTd2l0Y2ggdG8gdXNlIHZlbG9jaXR5LCBpdCBpcyBiZXR0ZXIgc3VpdGVkLlxuXHRcdFx0aWYodHlwZW9mICQgIT09ICd1bmRlZmluZWQnICYmICQuZm4gJiYgJC5mbi5hbmltYXRlKSB7XG5cdFx0XHRcdCQoZWwpLmFuaW1hdGUocHJvcHMsIHRpbWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKGNiKXtcblx0XHRcdHNldFRpbWVvdXQoY2IsIHRpbWUrMSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vXHRUcmlnZ2VyIGEgdHJhbnNpdGlvbiBhbmltYXRpb25cblx0bS50cmlnZ2VyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9wdGlvbnMsIGNiKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR2YXIgYW5pID0gYW5pbWF0aW9uc1tuYW1lXTtcblx0XHRpZighYW5pKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpe1xuXHRcdFx0dmFyIGFyZ3MgPSBhbmkuZm4oZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nPyB2YWx1ZSgpOiB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL1x0QWxsb3cgb3ZlcnJpZGUgdmlhIG9wdGlvbnNcblx0XHRcdGZvcihpIGluIG9wdGlvbnMpIGlmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRcdGFyZ3NbaV0gPSBvcHRpb25zW2ldO1xuXHRcdFx0fX1cblxuXHRcdFx0bS5hbmltYXRlUHJvcGVydGllcyhlLnRhcmdldCwgYXJncywgY2IpO1xuXHRcdH07XG5cdH07XG5cblx0Ly9cdEFkZHMgYW4gYW5pbWF0aW9uIGZvciBiaW5kaW5ncyBhbmQgc28gb24uXG5cdG0uYWRkQW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSwgZm4sIG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYoYW5pbWF0aW9uc1tuYW1lXSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBhbHJlYWR5IGRlZmluZWQuXCIpO1xuXHRcdH0gZWxzZSBpZih0eXBlb2YgZm4gIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBpcyBiZWluZyBhZGRlZCBhcyBhIHRyYW5zaXRpb24gYmFzZWQgYW5pbWF0aW9uLCBhbmQgbXVzdCB1c2UgYSBmdW5jdGlvbi5cIik7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gfHwgZGVmYXVsdER1cmF0aW9uO1xuXG5cdFx0YW5pbWF0aW9uc1tuYW1lXSA9IHtcblx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRmbjogZm5cblx0XHR9O1xuXG5cdFx0Ly9cdEFkZCBhIGRlZmF1bHQgYmluZGluZyBmb3IgdGhlIG5hbWVcblx0XHRtLmFkZEJpbmRpbmcobmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRtLmJpbmRBbmltYXRpb24obmFtZSwgdGhpcywgZm4sIHByb3ApO1xuXHRcdH0sIHRydWUpO1xuXHR9O1xuXG5cdG0uYWRkS0ZBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lLCBhcmcsIG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYoYW5pbWF0aW9uc1tuYW1lXSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBhbHJlYWR5IGRlZmluZWQuXCIpO1xuXHRcdH1cblxuXHRcdHZhciBpbml0ID0gZnVuY3Rpb24ocHJvcHMpIHtcblx0XHRcdHZhciBhbmlJZCA9IGFuaU5hbWUocHJvcHMpLFxuXHRcdFx0XHRoYXNBbmkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmlJZCksXG5cdFx0XHRcdGtmO1xuXG5cdFx0XHQvL1x0T25seSBpbnNlcnQgb25jZVxuXHRcdFx0aWYoIWhhc0FuaSkge1xuXHRcdFx0XHRhbmltYXRpb25zW25hbWVdLmlkID0gYW5pSWQ7XG5cblx0XHRcdFx0cHJvcHMgPSBub3JtYWxpc2VUcmFuc2Zvcm1Qcm9wcyhwcm9wcyk7XG5cdFx0XHRcdC8vICBDcmVhdGUga2V5ZnJhbWVzXG5cdFx0XHRcdGtmID0gdnAoXCJAa2V5ZnJhbWVzXCIpICsgXCIgXCIgKyBhbmlJZCArIFwiIFwiICsgSlNPTi5zdHJpbmdpZnkocHJvcHMpXG5cdFx0XHRcdFx0LnNwbGl0KFwiXFxcIlwiKS5qb2luKFwiXCIpXG5cdFx0XHRcdFx0LnNwbGl0KFwifSxcIikuam9pbihcIn1cXG5cIilcblx0XHRcdFx0XHQuc3BsaXQoXCIsXCIpLmpvaW4oXCI7XCIpXG5cdFx0XHRcdFx0LnNwbGl0KFwiJTpcIikuam9pbihcIiUgXCIpO1xuXG5cdFx0XHRcdHZhciBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblx0XHRcdFx0cy5zZXRBdHRyaWJ1dGUoJ2lkJywgYW5pSWQpO1xuXHRcdFx0XHRzLmlkID0gYW5pSWQ7XG5cdFx0XHRcdHMudGV4dENvbnRlbnQgPSBrZjtcblx0XHRcdFx0Ly8gIE1pZ2h0IG5vdCBoYXZlIGhlYWQ/XG5cdFx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocyk7XG5cdFx0XHR9XG5cblx0XHRcdGFuaW1hdGlvbnNbbmFtZV0uaXNJbml0aWFsaXNlZCA9IHRydWU7XG5cdFx0XHRhbmltYXRpb25zW25hbWVdLm9wdGlvbnMuYW5pbWF0ZUltbWVkaWF0ZWx5ID0gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0b3B0aW9ucy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gfHwgZGVmYXVsdER1cmF0aW9uO1xuXHRcdG9wdGlvbnMuYW5pbWF0ZUltbWVkaWF0ZWx5ID0gb3B0aW9ucy5hbmltYXRlSW1tZWRpYXRlbHkgfHwgZmFsc2U7XG5cblx0XHRhbmltYXRpb25zW25hbWVdID0ge1xuXHRcdFx0aW5pdDogaW5pdCxcblx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRhcmc6IGFyZ1xuXHRcdH07XG5cblx0XHQvL1x0QWRkIGEgZGVmYXVsdCBiaW5kaW5nIGZvciB0aGUgbmFtZVxuXHRcdG0uYWRkQmluZGluZyhuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdG0uYmluZEFuaW1hdGlvbihuYW1lLCB0aGlzLCBhcmcsIHByb3ApO1xuXHRcdH0sIHRydWUpO1xuXHR9O1xuXG5cblx0LypcdE9wdGlvbnMgLSBkZWZhdWx0cyAtIHdoYXQgaXQgZG9lczpcblxuXHRcdERlbGF5IC0gdW5lZGVmaW5lZCAtIGRlbGF5cyB0aGUgYW5pbWF0aW9uXG5cdFx0RGlyZWN0aW9uIC0gXG5cdFx0RHVyYXRpb25cblx0XHRGaWxsTW9kZSAtIFwiZm9yd2FyZFwiIG1ha2VzIHN1cmUgaXQgc3RpY2tzOiBodHRwOi8vd3d3Lnczc2Nob29scy5jb20vY3NzcmVmL2NzczNfcHJfYW5pbWF0aW9uLWZpbGwtbW9kZS5hc3Bcblx0XHRJdGVyYXRpb25Db3VudCwgXG5cdFx0TmFtZSwgUGxheVN0YXRlLCBUaW1pbmdGdW5jdGlvblxuXHRcblx0Ki9cblxuXHQvL1x0VXNlZnVsIHRvIGtub3csICd0bycgYW5kICdmcm9tJzogaHR0cDovL2xlYS52ZXJvdS5tZS8yMDEyLzEyL2FuaW1hdGlvbnMtd2l0aC1vbmUta2V5ZnJhbWUvXG5cdG0uYW5pbWF0ZUtGID0gZnVuY3Rpb24obmFtZSwgZWwsIG9wdGlvbnMsIGNiKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR2YXIgYW5pID0gYW5pbWF0aW9uc1tuYW1lXSwgaSwgcHJvcHMgPSB7fTtcblx0XHRpZighYW5pKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0Ly9cdEFsbG93IG92ZXJyaWRlIHZpYSBvcHRpb25zXG5cdFx0YW5pLm9wdGlvbnMgPSBhbmkub3B0aW9ucyB8fCB7fTtcblx0XHRmb3IoaSBpbiBvcHRpb25zKSBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0YW5pLm9wdGlvbnNbaV0gPSBvcHRpb25zW2ldO1xuXHRcdH19XG5cblx0XHRpZighYW5pLmlzSW5pdGlhbGlzZWQgJiYgYW5pLmluaXQpIHtcblx0XHRcdGFuaS5pbml0KGFuaS5hcmcpO1xuXHRcdH1cblxuXHRcdC8vXHRBbGxvdyBhbmltYXRlIG92ZXJyaWRlc1xuXHRcdGZvcihpIGluIGFuaS5vcHRpb25zKSBpZihhbmkub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uXCIgKyBjYXAoaSkpXSA9IGFuaS5vcHRpb25zW2ldO1xuXHRcdH19XG5cblx0XHQvL1x0U2V0IHJlcXVpcmVkIGl0ZW1zIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3IgcHJvcHNcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbk5hbWVcIildID0gYW5pLmlkO1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildID0gKHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildPyBwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXTogZGVmYXVsdER1cmF0aW9uKSArIFwibXNcIjtcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbkRlbGF5XCIpXSA9IHByb3BzW3ZwKFwiYW5pbWF0aW9uRGVsYXlcIildPyBwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXSArIFwibXNcIjogdW5kZWZpbmVkO1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uRmlsbE1vZGVcIildID0gcHJvcHNbdnAoXCJhbmltYXRpb25GaWxsTW9kZVwiKV0gfHwgXCJmb3J3YXJkc1wiO1xuXG5cdFx0ZWwuc3R5bGUgPSBlbC5zdHlsZSB8fCB7fTtcblxuXHRcdC8vXHRVc2UgZm9yIGNhbGxiYWNrXG5cdFx0dmFyIGVuZEFuaSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHQvL1x0UmVtb3ZlIGxpc3RlbmVyXG5cdFx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYW5pbWF0aW9uZW5kXCIsIGVuZEFuaSwgZmFsc2UpO1xuXHRcdFx0aWYoY2Ipe1xuXHRcdFx0XHRjYihlbCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vXHRSZW1vdmUgYW5pbWF0aW9uIGlmIGFueVxuXHRcdGVsLnN0eWxlW3ZwKFwiYW5pbWF0aW9uXCIpXSA9IFwiXCI7XG5cdFx0ZWwuc3R5bGVbdnAoXCJhbmltYXRpb25OYW1lXCIpXSA9IFwiXCI7XG5cblx0XHQvL1x0TXVzdCB1c2UgdHdvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGNhbGxzLCBmb3IgRkYgdG9cblx0XHQvL1x0d29yayBwcm9wZXJseSwgZG9lcyBub3Qgc2VlbSB0byBoYXZlIGFueSBhZHZlcnNlIGVmZmVjdHNcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuXHRcdFx0XHQvL1x0QXBwbHkgcHJvcHNcblx0XHRcdFx0Zm9yKGkgaW4gcHJvcHMpIGlmKHByb3BzLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0XHRcdGVsLnN0eWxlW2ldID0gcHJvcHNbaV07XG5cdFx0XHRcdH19XG5cblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcImFuaW1hdGlvbmVuZFwiLCBlbmRBbmksIGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdG0udHJpZ2dlcktGID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucyl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0XHRtLmFuaW1hdGVLRihuYW1lLCB0aGlzLCBvcHRpb25zKTtcblx0XHR9O1xuXHR9O1xuXG5cdG0uYmluZEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGVsLCBvcHRpb25zLCBwcm9wKSB7XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV07XG5cblx0XHRpZighYW5pICYmICFhbmkubmFtZSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdGlmKGFuaS5mbikge1xuXHRcdFx0bS5hbmltYXRlUHJvcGVydGllcyhlbCwgYW5pLmZuKHByb3ApKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIG9sZENvbmZpZyA9IGVsLmNvbmZpZztcblx0XHRcdGVsLmNvbmZpZyA9IGZ1bmN0aW9uKGVsLCBpc0luaXQpe1xuXHRcdFx0XHRpZighYW5pLmlzSW5pdGlhbGlzZWQgJiYgYW5pLmluaXQpIHtcblx0XHRcdFx0XHRhbmkuaW5pdChvcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihwcm9wKCkgJiYgaXNJbml0KSB7XG5cdFx0XHRcdFx0bS5hbmltYXRlS0YobmFtZSwgZWwsIG9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKG9sZENvbmZpZykge1xuXHRcdFx0XHRcdG9sZENvbmZpZy5hcHBseShlbCwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cblxuXG5cdC8qIERlZmF1bHQgdHJhbnNmb3JtMmQgYmluZGluZ3MgKi9cblx0dmFyIGJhc2ljQmluZGluZ3MgPSBbJ3NjYWxlJywgJ3NjYWxleCcsICdzY2FsZXknLCAndHJhbnNsYXRlJywgJ3RyYW5zbGF0ZXgnLCAndHJhbnNsYXRleScsIFxuXHRcdCdtYXRyaXgnLCAnYmFja2dyb3VuZENvbG9yJywgJ2JhY2tncm91bmRQb3NpdGlvbicsICdib3JkZXJCb3R0b21Db2xvcicsIFxuXHRcdCdib3JkZXJCb3R0b21XaWR0aCcsICdib3JkZXJMZWZ0Q29sb3InLCAnYm9yZGVyTGVmdFdpZHRoJywgJ2JvcmRlclJpZ2h0Q29sb3InLCBcblx0XHQnYm9yZGVyUmlnaHRXaWR0aCcsICdib3JkZXJTcGFjaW5nJywgJ2JvcmRlclRvcENvbG9yJywgJ2JvcmRlclRvcFdpZHRoJywgJ2JvdHRvbScsIFxuXHRcdCdjbGlwJywgJ2NvbG9yJywgJ2ZvbnRTaXplJywgJ2ZvbnRXZWlnaHQnLCAnaGVpZ2h0JywgJ2xlZnQnLCAnbGV0dGVyU3BhY2luZycsIFxuXHRcdCdsaW5lSGVpZ2h0JywgJ21hcmdpbkJvdHRvbScsICdtYXJnaW5MZWZ0JywgJ21hcmdpblJpZ2h0JywgJ21hcmdpblRvcCcsICdtYXhIZWlnaHQnLCBcblx0XHQnbWF4V2lkdGgnLCAnbWluSGVpZ2h0JywgJ21pbldpZHRoJywgJ29wYWNpdHknLCAnb3V0bGluZUNvbG9yJywgJ291dGxpbmVXaWR0aCcsIFxuXHRcdCdwYWRkaW5nQm90dG9tJywgJ3BhZGRpbmdMZWZ0JywgJ3BhZGRpbmdSaWdodCcsICdwYWRkaW5nVG9wJywgJ3JpZ2h0JywgJ3RleHRJbmRlbnQnLCBcblx0XHQndGV4dFNoYWRvdycsICd0b3AnLCAndmVydGljYWxBbGlnbicsICd2aXNpYmlsaXR5JywgJ3dpZHRoJywgJ3dvcmRTcGFjaW5nJywgJ3pJbmRleCddLFxuXHRcdGRlZ0JpbmRpbmdzID0gWydyb3RhdGUnLCAncm90YXRleCcsICdyb3RhdGV5JywgJ3NrZXd4JywgJ3NrZXd5J10sIGk7XG5cblx0Ly9cdEJhc2ljIGJpbmRpbmdzIHdoZXJlIHdlIHBhc3MgdGhlIHByb3Agc3RyYWlnaHQgdGhyb3VnaFxuXHRmb3IoaSA9IDA7IGkgPCBiYXNpY0JpbmRpbmdzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0KGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0bS5hZGRBbmltYXRpb24obmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRcdHZhciBvcHRpb25zID0ge307XG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSBwcm9wKCk7XG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fSk7XG5cdFx0fShiYXNpY0JpbmRpbmdzW2ldKSk7XG5cdH1cblxuXHQvL1x0RGVncmVlIGJhc2VkIGJpbmRpbmdzIC0gY29uZGl0aW9uYWxseSBwb3N0Zml4IHdpdGggXCJkZWdcIlxuXHRmb3IoaSA9IDA7IGkgPCBkZWdCaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdChmdW5jdGlvbihuYW1lKXtcblx0XHRcdG0uYWRkQW5pbWF0aW9uKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IHt9LCB2YWx1ZSA9IHByb3AoKTtcblx0XHRcdFx0b3B0aW9uc1tuYW1lXSA9IGlzTmFOKHZhbHVlKT8gdmFsdWU6IHZhbHVlICsgXCJkZWdcIjtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0XHR9KTtcblx0XHR9KGRlZ0JpbmRpbmdzW2ldKSk7XG5cdH1cblxuXHQvL1x0QXR0cmlidXRlcyB0aGF0IHJlcXVpcmUgbW9yZSB0aGFuIG9uZSBwcm9wXG5cdG0uYWRkQW5pbWF0aW9uKFwic2tld1wiLCBmdW5jdGlvbihwcm9wKXtcblx0XHR2YXIgdmFsdWUgPSBwcm9wKCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNrZXc6IFtcblx0XHRcdFx0dmFsdWVbMF0gKyAoaXNOYU4odmFsdWVbMF0pPyBcIlwiOlwiZGVnXCIpLCBcblx0XHRcdFx0dmFsdWVbMV0gKyAoaXNOYU4odmFsdWVbMV0pPyBcIlwiOlwiZGVnXCIpXG5cdFx0XHRdXG5cdFx0fTtcblx0fSk7XG5cblxuXG5cdC8vXHRBIGZldyBtb3JlIGJpbmRpbmdzXG5cdG0gPSBtIHx8IHt9O1xuXHQvL1x0SGlkZSBub2RlXG5cdG0uYWRkQmluZGluZyhcImhpZGVcIiwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5zdHlsZSA9IHtcblx0XHRcdGRpc3BsYXk6IG0udW53cmFwKHByb3ApPyBcIm5vbmVcIiA6IFwiXCJcblx0XHR9O1xuXHR9LCB0cnVlKTtcblxuXHQvL1x0VG9nZ2xlIGJvb2xlYW4gdmFsdWUgb24gY2xpY2tcblx0bS5hZGRCaW5kaW5nKCd0b2dnbGUnLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9uY2xpY2sgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHZhbHVlID0gcHJvcCgpO1xuXHRcdFx0cHJvcCghdmFsdWUpO1xuXHRcdH1cblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFNldCBob3ZlciBzdGF0ZXMsIGEnbGEgalF1ZXJ5IHBhdHRlcm5cblx0bS5hZGRCaW5kaW5nKCdob3ZlcicsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMub25tb3VzZW92ZXIgPSBwcm9wWzBdO1xuXHRcdGlmKHByb3BbMV0pIHtcblx0XHRcdHRoaXMub25tb3VzZW91dCA9IHByb3BbMV07XG5cdFx0fVxuXHR9LCB0cnVlICk7XG5cblxufTtcblxuXG5cblxuXG5cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsQW5pbWF0ZTtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtaXRocmlsQW5pbWF0ZTtcblx0fSk7XG59IGVsc2Uge1xuXHRtaXRocmlsQW5pbWF0ZSh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSk7XG59XG5cbn0oKSk7IiwiLy8gIFNtb290aCBzY3JvbGxpbmcgZm9yIGxpbmtzXG4vLyAgVXNhZ2U6ICAgICAgQSh7Y29uZmlnOiBzbW9vdGhTY3JvbGwoY3RybCksIGhyZWY6IFwiI3RvcFwifSwgXCJCYWNrIHRvIHRvcFwiKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKXtcblx0Ly92YXIgcm9vdCA9ICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKT8gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ6IHRoaXMsXG5cdHZhciByb290ID0gKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKT8gL2ZpcmVmb3h8dHJpZGVudC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5OiBudWxsLFxuXHRcdGVhc2VJbk91dFNpbmUgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdFx0Ly8gIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuXHRcdFx0cmV0dXJuIC1jLzIgKiAoTWF0aC5jb3MoTWF0aC5QSSp0L2QpIC0gMSkgKyBiO1xuXHRcdH07XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcblx0XHRpZighaXNJbml0aWFsaXplZCkge1xuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHR2YXIgc3RhcnRUaW1lLFxuXHRcdFx0XHRcdHN0YXJ0UG9zID0gcm9vdC5zY3JvbGxUb3AsXG5cdFx0XHRcdFx0ZW5kUG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoL1teI10rJC8uZXhlYyh0aGlzLmhyZWYpWzBdKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AsXG5cdFx0XHRcdFx0aGFzaCA9IHRoaXMuaHJlZi5zdWJzdHIodGhpcy5ocmVmLmxhc3RJbmRleE9mKFwiI1wiKSksXG5cdFx0XHRcdFx0bWF4U2Nyb2xsID0gcm9vdC5zY3JvbGxIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQsXG5cdFx0XHRcdFx0c2Nyb2xsRW5kVmFsdWUgPSAoc3RhcnRQb3MgKyBlbmRQb3MgPCBtYXhTY3JvbGwpPyBlbmRQb3M6IG1heFNjcm9sbCAtIHN0YXJ0UG9zLFxuXHRcdFx0XHRcdGR1cmF0aW9uID0gdHlwZW9mIGN0cmwuZHVyYXRpb24gIT09ICd1bmRlZmluZWQnPyBjdHJsLmR1cmF0aW9uOiAxNTAwLFxuXHRcdFx0XHRcdHNjcm9sbEZ1bmMgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcblx0XHRcdFx0XHRcdHN0YXJ0VGltZSA9IHN0YXJ0VGltZSB8fCB0aW1lc3RhbXA7XG5cdFx0XHRcdFx0XHR2YXIgZWxhcHNlZCA9IHRpbWVzdGFtcCAtIHN0YXJ0VGltZSxcblx0XHRcdFx0XHRcdFx0cHJvZ3Jlc3MgPSBlYXNlSW5PdXRTaW5lKGVsYXBzZWQsIHN0YXJ0UG9zLCBzY3JvbGxFbmRWYWx1ZSwgZHVyYXRpb24pO1xuXHRcdFx0XHRcdFx0cm9vdC5zY3JvbGxUb3AgPSBwcm9ncmVzcztcblx0XHRcdFx0XHRcdGlmKGVsYXBzZWQgPCBkdXJhdGlvbikge1xuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsRnVuYyk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZihoaXN0b3J5LnB1c2hTdGF0ZSkge1xuXHRcdFx0XHRcdFx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxGdW5jKVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHtcIkFwaS5tZFwiOlwiPHA+VGhlIGRhdGEgYXBpcyBpbiBtaXNvIGFyZSBhIHdheSB0byBjcmVhdGUgYSBSRVNUZnVsIGVuZHBvaW50IHRoYXQgeW91IGNhbiBpbnRlcmFjdCB3aXRoIHZpYSBhbiBlYXN5IHRvIHVzZSBBUEkuPC9wPlxcbjxibG9ja3F1b3RlPlxcbk5vdGU6IHlvdSBtdXN0IGVuYWJsZSB5b3VyIGFwaSBieSBhZGRpbmcgaXQgdG8gdGhlICZxdW90O2FwaSZxdW90OyBhdHRyaWJ1dGUgaW4gdGhlIDxjb2RlPi9jZmcvc2VydmVyLmRldmVsb3BtZW50Lmpzb248L2NvZGU+IGZpbGUsIG9yIHdoYXRldmVyIGVudmlyb25tZW50IHlvdSBhcmUgdXNpbmcuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxoMj48YSBuYW1lPVxcXCJob3ctZG9lcy1hbi1hcGktd29yay1cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctZG9lcy1hbi1hcGktd29yay1cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SG93IGRvZXMgYW4gYXBpIHdvcms/PC9zcGFuPjwvYT48L2gyPjxwPlRoZSBhcGlzIGluIG1pc28gZG8gYSBudW1iZXIgb2YgdGhpbmdzOjwvcD5cXG48dWw+XFxuPGxpPkFsbG93IGRhdGFiYXNlIGFjY2VzcyB2aWEgYSB0aGluIHdyYXBwZXIsIGZvciBleGFtcGxlIHRvIGFjY2VzcyBtb25nb2RiLCB3ZSB3cmFwIHRoZSBwb3B1bGFyIDxhIGhyZWY9XFxcIi9kb2MvbW9uZ29vc2UubWRcXFwiPm1vbmdvb3NlIG5wbTwvYT4gT0RNIHBhY2thZ2U8L2xpPlxcbjxsaT5XYWl0cyB0aWxsIG1pdGhyaWwgaXMgcmVhZHkgLSBtaXRocmlsIGhhcyBhIHVuaXF1ZSBmZWF0dXJlIGVuc3VyZXMgdGhlIHZpZXcgZG9lc24mIzM5O3QgcmVuZGVyIHRpbGwgZGF0YSBoYXMgYmVlbiByZXRyaWV2ZWQgLSB0aGUgYXBpIG1ha2VzIHN1cmUgd2UgYWRoZXJlIHRvIHRoaXM8L2xpPlxcbjxsaT5BcGlzIGNhbiB3b3JrIGFzIGEgcHJveHksIHNvIGlmIHlvdSB3YW50IHRvIGFjY2VzcyBhIDNyZCBwYXJ0eSBzZXJ2aWNlLCBhbiBhcGkgaXMgYSBnb29kIHdheSB0byBkbyB0aGF0IC0geW91IGNhbiB0aGVuIGFsc28gYnVpbGQgaW4gY2FjaGluZywgb3IgYW55IG90aGVyIGZlYXR1cmVzIHlvdSBtYXkgd2lzaCB0byBhZGQuPC9saT5cXG48bGk+QXBpcyBjYW4gYmUgcmVzdHJpY3RlZCBieSBwZXJtaXNzaW9ucyAoY29taW5nIHNvb24pIDwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiaG93LXNob3VsZC15b3UtdXNlLWFwaXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctc2hvdWxkLXlvdS11c2UtYXBpc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ib3cgc2hvdWxkIHlvdSB1c2UgYXBpczwvc3Bhbj48L2E+PC9oMj48cD5UaGVyZSBhcmUgbnVtZXJvdXMgc2NlbmFyaW9zIHdoZXJlIHlvdSBtaWdodCB3YW50IHRvIHVzZSBhbiBhcGk6PC9wPlxcbjx1bD5cXG48bGk+Rm9yIGRhdGFiYXNlIGFjY2VzcyAobWlzbyBjb21lcyB3aXRoIGEgYnVuY2ggb2YgZGF0YWJhc2UgYXBpcyk8L2xpPlxcbjxsaT5Gb3IgY2FsbGluZyAzcmQgcGFydHkgZW5kLXBvaW50cyAtIHVzaW5nIGFuIGFwaSB3aWxsIGFsbG93IHlvdSB0byBjcmVhdGUgY2FjaGluZyBhbmQgc2V0dXAgcGVybWlzc2lvbnMgb24gdGhlIGVuZC1wb2ludDwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiZXh0ZW5kaW5nLWFuLWV4aXN0aW5nLWFwaVxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2V4dGVuZGluZy1hbi1leGlzdGluZy1hcGlcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RXh0ZW5kaW5nIGFuIGV4aXN0aW5nIGFwaTwvc3Bhbj48L2E+PC9oMj48cD5JZiB5b3Ugd2FudCB0byBhZGQgeW91ciBvd24gbWV0aG9kcyB0byBhbiBhcGksIHlvdSBjYW4gc2ltcGx5IGV4dGVuZCBvbmUgb2YgdGhlIGV4aXN0aW5nIGFwaXMsIGZvciBleGFtcGxlLCB0byBleHRlbmQgdGhlIDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IEFQSSwgY3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBhbmQgZmlsZSBpbiA8Y29kZT4vbW9kdWxlcy9hcGkvYWRhcHQvYWRhcHQuYXBpLmpzPC9jb2RlPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgZGIgPSByZXF1aXJlKCYjMzk7Li4vLi4vLi4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2ZsYXRmaWxlZGIuYXBpLmpzJiMzOTspO1xcblxcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XFxuICAgIHZhciBhZCA9IGRiKG0pO1xcbiAgICBhZC5oZWxsbyA9IGZ1bmN0aW9uKGNiLCBlcnIsIGFyZ3MsIHJlcSl7XFxuICAgICAgICBjYigmcXVvdDt3b3JsZCZxdW90Oyk7XFxuICAgIH07XFxuICAgIHJldHVybiBhZDtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIGFkZCB0aGUgYXBpIHRvIHRoZSA8Y29kZT4vY2ZnL3NlcnZlci5kZXZlbG9wbWVudC5qc29uPC9jb2RlPiBmaWxlIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+JnF1b3Q7YXBpJnF1b3Q7OiAmcXVvdDthZGFwdCZxdW90O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIHJlcXVpcmUgdGhlIG5ldyBhcGkgZmlsZSBpbiB5b3VyIG12YyBmaWxlIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIgPSByZXF1aXJlKCYjMzk7Li4vbW9kdWxlcy9hcGkvYWRhcHQvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+WW91IGNhbiBub3cgYWRkIGFuIGFwaSBjYWxsIGluIHRoZSBjb250cm9sbGVyIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIuaGVsbG8oe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuLy8gZG8gc29tZXRoaW5nIHdpdGggZGF0YS5yZXN1bHRcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIGFyZ3VtZW50cyB0byBlYWNoIGFwaSBlbmRwb2ludCBtdXN0IGJlIHRoZSBzYW1lLCBpZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpXFxuPC9jb2RlPjwvcHJlPlxcbjxwPldoZXJlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+QXJndW1lbnQ8L3RoPlxcbjx0aD5QdXJwb3NlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+Y2I8L3RkPlxcbjx0ZD5BIGNhbGxiYWNrIHlvdSBtdXN0IGNhbGwgd2hlbiB5b3UgYXJlIGRvbmUgLSBhbnkgZGF0YSB5b3UgcmV0dXJuIHdpbGwgYmUgYXZhaWxhYmxlIG9uIDxjb2RlPmRhdGEucmVzdWx0PC9jb2RlPiBpbiB0aGUgcmVzcG9uc2U8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5lcnI8L3RkPlxcbjx0ZD5BIGNhbGxiYWNrIHlvdSBtdXN0IGNhbGwgaWYgYW4gdW5yZWNvdmVyYWJsZSBlcnJvciBvY2N1cnJlZCwgZWc6ICZxdW90O2RhdGFiYXNlIGNvbm5lY3Rpb24gdGltZW91dCZxdW90Oy4gRG8gbm90IHVzZSBmb3IgdGhpbmdzIGxpa2UgJnF1b3Q7bm8gZGF0YSBmb3VuZCZxdW90OzwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmFyZ3M8L3RkPlxcbjx0ZD5BIHNldCBvZiBhcmd1bWVudHMgcGFzc2VkIGluIHRvIHRoZSBhcGkgbWV0aG9kPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+cmVxPC90ZD5cXG48dGQ+VGhlIHJlcXVlc3Qgb2JqZWN0IGZyb20gdGhlIHJlcXVlc3Q8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlRoZSBjb21wbGV0ZSBtdmMgZXhhbXBsZSBsb29rcyBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9hZGFwdC9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7YWRhcHRfaWQmIzM5OywgcGFyYW1zKTtcXG5cXG4gICAgICAgIGRiLmhlbGxvKHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIGN0cmwubW9kZWwud2hvKGRhdGEucmVzdWx0KTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJnF1b3Q7RyYjMzk7ZGF5ICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPGgyPjxhIG5hbWU9XFxcImNyZWF0aW5nLWN1c3RvbS1hcGlzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY3JlYXRpbmctY3VzdG9tLWFwaXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q3JlYXRpbmcgY3VzdG9tIGFwaXM8L3NwYW4+PC9hPjwvaDI+PHA+WW91IGNhbiBhZGQgeW91ciBvd24gY3VzdG9tIGFwaXMgaW4gdGhlIDxjb2RlPi9tb2R1bGVzL2FwaXM8L2NvZGU+IGRpcmVjdG9yeSwgdGhleSBoYXZlIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgaW5jbHVkZWQgYXBpcywgaGVyZSBpcyBhbiBleGFtcGxlIGFwaSB0aGF0IGNhbGxzIHRoZSBmbGlja3IgQVBJOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICAgIGVuZHBvaW50IGFwaSB0byBtYWtlIGh0dHAgcmVxdWVzdHMgdmlhIGZsaWNrclxcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgmIzM5O3JlcXVlc3QmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vLi4vLi4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgLy8gICAgUGFyc2Ugb3V0IHRoZSB1bndhbnRlZCBwYXJ0cyBvZiB0aGUganNvblxcbiAgICAvLyAgICB0eXBpY2FsbHkgdGhpcyB3b3VsZCBiZSBydW4gb24gdGhlIGNsaWVudFxcbiAgICAvLyAgICB3ZSBydW4gdGhpcyB1c2luZyAmcXVvdDtyZXF1ZXN0JnF1b3Q7IG9uICB0aGUgc2VydmVyLCBzb1xcbiAgICAvLyAgICBubyBuZWVkIGZvciB0aGUganNvbnAgY2FsbGJhY2tcXG4gICAganNvblBhcnNlciA9IGZ1bmN0aW9uKGpzb25wRGF0YSl7XFxuICAgICAgICB2YXIganNvbiwgc3RhcnRQb3MsIGVuZFBvcztcXG4gICAgICAgIHRyeSB7XFxuICAgICAgICAgICAgc3RhcnRQb3MgPSBqc29ucERhdGEuaW5kZXhPZigmIzM5Oyh7JiMzOTspO1xcbiAgICAgICAgICAgIGVuZFBvcyA9IGpzb25wRGF0YS5sYXN0SW5kZXhPZigmIzM5O30pJiMzOTspO1xcbiAgICAgICAgICAgIGpzb24gPSBqc29ucERhdGFcXG4gICAgICAgICAgICAgICAgLnN1YnN0cmluZyhzdGFydFBvcysxLCBlbmRQb3MrMSlcXG4gICAgICAgICAgICAgICAgLnNwbGl0KCZxdW90O1xcXFxuJnF1b3Q7KS5qb2luKCZxdW90OyZxdW90OylcXG4gICAgICAgICAgICAgICAgLnNwbGl0KCZxdW90O1xcXFxcXFxcJiMzOTsmcXVvdDspLmpvaW4oJnF1b3Q7JiMzOTsmcXVvdDspO1xcblxcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pO1xcbiAgICAgICAgfSBjYXRjaChleCkge1xcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCZxdW90O0VSUk9SJnF1b3Q7LCBleCk7XFxuICAgICAgICAgICAgcmV0dXJuICZxdW90O3t9JnF1b3Q7O1xcbiAgICAgICAgfVxcbiAgICB9O1xcblxcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXRpbHMpe1xcbiAgICByZXR1cm4ge1xcbiAgICAgICAgcGhvdG9zOiBmdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpe1xcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzIHx8IHt9O1xcbiAgICAgICAgICAgIHZhciB1cmwgPSAmcXVvdDtodHRwOi8vYXBpLmZsaWNrci5jb20vc2VydmljZXMvZmVlZHMvcGhvdG9zX3B1YmxpYy5nbmU/Zm9ybWF0PWpzb24mcXVvdDs7XFxuICAgICAgICAgICAgLy8gICAgQWRkIHBhcmFtZXRlcnNcXG4gICAgICAgICAgICB1cmwgKz0gbWlzby5lYWNoKGFyZ3MsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gJnF1b3Q7JmFtcDsmcXVvdDsgKyBrZXkgKyAmcXVvdDs9JnF1b3Q7ICsgdmFsdWU7XFxuICAgICAgICAgICAgfSk7XFxuXFxuICAgICAgICAgICAgcmVxdWVzdCh1cmwsIGZ1bmN0aW9uIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmYW1wOyZhbXA7IHJlc3BvbnNlLnN0YXR1c0NvZGUgPT0gMjAwKSB7XFxuICAgICAgICAgICAgICAgICAgICBjYihqc29uUGFyc2VyKGJvZHkpKTtcXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgIGVycihlcnJvcik7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH1cXG4gICAgfTtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UbyB1c2UgaXQgaW4geW91ciBtdmMgZmlsZSwgc2ltcGx5OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmZsaWNrciA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9mbGlja3IvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHRoZW4gY2FsbCBpdCBsaWtlIHNvIGluIHlvdXIgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mbGlja3IucGhvdG9zKHt0YWdzOiAmcXVvdDtTeWRuZXkgb3BlcmEgaG91c2UmcXVvdDssIHRhZ21vZGU6ICZxdW90O2FueSZxdW90O30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuICAgIGN0cmwubW9kZWwuZmxpY2tyRGF0YShkYXRhLnJlc3VsdC5pdGVtcyk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcblwiLFwiQXV0aGVudGljYXRpb24ubWRcIjpcIjxoMj48YSBuYW1lPVxcXCJhdXRoZW50aWNhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2F1dGhlbnRpY2F0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkF1dGhlbnRpY2F0aW9uPC9zcGFuPjwvYT48L2gyPjxwPkF1dGhlbnRpY2F0aW9uIGlzIHRoZSBwcm9jZXNzIG9mIG1ha2luZyBzdXJlIGEgdXNlciBpcyB3aG8gdGhleSBzYXkgdGhleSBhcmUgLSB1c3VhbGx5IHRoaXMgaXMgZG9uZSBieSB1c2luZyBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCwgYnV0IGl0IGNhbiBhbHNvIGJlIGRvbmUgdmlhIGFuIGFjY2VzcyB0b2tlbiwgM3JkLXBhcnR5IHNlcnZpY2VzIHN1Y2ggYXMgT0F1dGgsIG9yIHNvbWV0aGluZyBsaWtlIE9wZW5JRCwgb3IgaW5kZWVkIEdvb2dsZSwgRmFjZWJvb2ssIEdpdEhVYiwgZXRjLi4uPC9wPlxcbjxwPkluIG1pc28sIHRoZSBhdXRoZW50aWNhdGlvbiBmZWF0dXJlIGhhczo8L3A+XFxuPHVsPlxcbjxsaT5UaGUgYWJpbGl0eSB0byBzZWUgaWYgdGhlIHVzZXIgaGFzIGxvZ2dlZCBpbiAodmlhIGEgc2VjcmV0IHZhbHVlIG9uIHRoZSBzZXJ2ZXItc2lkZSBzZXNzaW9uKTwvbGk+XFxuPGxpPlRoZSBhYmlsaXR5IHRvIHJlZGlyZWN0IHRvIGEgbG9naW4gcGFnZSBpZiB0aGV5IGhhdmVuJiMzOTt0IGxvZ2dlZCBpbjwvbGk+XFxuPC91bD5cXG48cD5Zb3UgY2FuIGNvbmZpZ3VyZSB0aGUgYXV0aGVudGljYXRpb24gaW4gPGNvZGU+L2NmZy9zZXJ2ZXIuanNvbjwvY29kZT4sIGFuZCBzZXQgdGhlIGF1dGhlbnRpY2F0aW9uIGF0dHJpYnV0ZSBvbiB0aGUgYWN0aW9uIHRoYXQgcmVxdWlyZXMgaXQuPC9wPlxcbjxwPkZvciBleGFtcGxlLCBpbiA8Y29kZT4vY2ZnL3NlcnZlci5qc29uPC9jb2RlPiwgeW91IGNhbiBzZXQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+JnF1b3Q7YXV0aGVudGljYXRpb24mcXVvdDs6IHtcXG4gICAgJnF1b3Q7ZW5hYmxlZCZxdW90OzogdHJ1ZSxcXG4gICAgJnF1b3Q7YWxsJnF1b3Q7OiBmYWxzZSxcXG4gICAgJnF1b3Q7c2VjcmV0JnF1b3Q7OiAmcXVvdDtpbS1zby1taXNvJnF1b3Q7LFxcbiAgICAmcXVvdDtzdHJhdGVneSZxdW90OzogJnF1b3Q7ZGVmYXVsdCZxdW90OyxcXG4gICAgJnF1b3Q7bG9naW5VcmxQYXR0ZXJuJnF1b3Q7OiAmcXVvdDsvbG9naW4/dXJsPVtPUklHSU5BTFVSTF0mcXVvdDtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPldoZXJlOjwvcD5cXG48dWw+XFxuPGxpPjxzdHJvbmc+ZW5hYmxlZDwvc3Ryb25nPiB3aWxsIGVuYWJsZSBvdXIgYXV0aGVudGljYXRpb24gYmVoYXZpb3VyPC9saT5cXG48bGk+PHN0cm9uZz5hbGw8L3N0cm9uZz4gd2lsbCBzZXQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIGF1dGhlbnRpY2F0aW9uIGZvciBhbGwgYWN0aW9ucywgZGVmYXVsdCBpcyAmcXVvdDtmYWxzZSZxdW90OywgaWU6IG5vIGF1dGhlbnRpY2F0aW9uIHJlcXVpcmVkPC9saT5cXG48bGk+PHN0cm9uZz5zZWNyZXQ8L3N0cm9uZz4gaXMgdGhlIHNlY3JldCB2YWx1ZSB0aGF0IGlzIHNldCBvbiB0aGUgc2Vzc2lvbjwvbGk+XFxuPGxpPjxzdHJvbmc+bG9naW5VcmxQYXR0ZXJuPC9zdHJvbmc+IGlzIGEgVVJMIHBhdHRlcm4gd2hlcmUgd2Ugd2lsbCBzdWJzdGl0dXRlICZxdW90O1tPUklHSU5BTFVSTF0mcXVvdDsgZm9yIHRoZSBvcmlnaW5hbGx5IHJlcXVlc3RlZCBVUkwuPC9saT5cXG48bGk+PHN0cm9uZz5taWRkbGV3YXJlPC9zdHJvbmc+IGlzIHRoZSBhdXRoZW50aWNhdGlvbiBtaWRkbGV3YXJlIHRvIHVzZSwgZGVmYXVsdCBpcyAmcXVvdDsuLi9zeXN0ZW0vYXV0aF9taWRkbGUmcXVvdDs8L2xpPlxcbjwvdWw+XFxuPHA+Tm93LCBpZiB5b3Ugd2FudCBhIHBhcnRpY3VsYXIgYWN0aW9uIHRvIGJlIGF1dGhlbnRpY2F0ZWQsIHlvdSBjYW4gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgKGFsbCkgdmFsdWUgaW4gZWFjaCBvZiB5b3VyIGFjdGlvbnMsIGZvciBleGFtcGxlIHRvIG5lZWQgYXV0aGVudGljYXRpb24gb24gdGhlIDxjb2RlPmluZGV4PC9jb2RlPiBhY3Rpb24gb2YgeW91ciB0b2RvcyBhcHAsIHNldDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgLi4uLFxcbiAgICBhdXRoZW50aWNhdGU6IHRydWVcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlICZxdW90O2FsbCZxdW90OyBhdHRyaWJ1dGUgZm9ybSB0aGUgc2VydmVyIGNvbmZpZyBhdXRoZW50aWNhdGlvbiBhbmQgbWFrZSBhdXRoZW50aWNhdGlvbiByZXF1aXJlZCBvbiB0aGlzIGFjdGlvbi5cXG5JZiB5b3VyIGFwcCBpcyBtYWlubHkgYSBzZWN1cmUgYXBwLCB5b3UmIzM5O2xsIHdhbnQgdG8gc2V0ICZxdW90O2FsbCZxdW90OyBhdHRyaWJ1dGUgdG8gdHJ1ZSBhbmQgb3ZlcnJpZGUgdGhlICZxdW90O2xvZ2luJnF1b3Q7IGFuZCwgKGlmIHlvdSBoYXZlIG9uZSksIHRoZSAmcXVvdDtmb3Jnb3QgcGFzc3dvcmQmcXVvdDsgcGFnZXMsIGFuZCBzbyBhcyB0byBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvbiwgaWU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIC4uLixcXG4gICAgYXV0aGVudGljYXRlOiBmYWxzZVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxoMz48YSBuYW1lPVxcXCJzYW1wbGUtaW1wbGVtZW50YXRpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzYW1wbGUtaW1wbGVtZW50YXRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+U2FtcGxlIGltcGxlbWVudGF0aW9uPC9zcGFuPjwvYT48L2gzPjxwPkluIE1pc28sIHdlIGhhdmUgYSBzYW1wbGUgaW1wbGVtZW50YXRpb24gb2YgYXV0aGVudGljYXRpb24gdGhhdCB1c2VzIHRoZSBmbGF0ZmlsZWRiIGFwaS4gVGhlcmUgYXJlIDQgbWFpbiBjb21wb25lbnRzIGluIHRoZSBzYW1wbGUgYXV0aGVudGljYXRpb24gcHJvY2Vzczo8L3A+XFxuPHVsPlxcbjxsaT48cD5UaGUgYXV0aGVudGljYXRlIGFwaSA8Y29kZT4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGU8L2NvZGU+IC0gaGFuZGxlcyBzYXZpbmcgYW5kIGxvYWRpbmcgb2YgdXNlcnMsIHBsdXMgY2hlY2tpbmcgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXMuPC9wPlxcbjwvbGk+XFxuPGxpPjxwPlRoZSBsb2dpbiBtZWNoYW5pc20gPGNvZGU+L212Yy9sb2dpbi5qczwvY29kZT4gLSBzaW1wbHkgYWxsb3dzIHlvdSB0byBlbnRlciBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBhbmQgdXNlcyB0aGUgYXV0aGVudGljYXRpb24gYXBpIHRvIGxvZyB5b3UgaW48L3A+XFxuPC9saT5cXG48bGk+PHA+VXNlciBtYW5hZ2VtZW50IDxjb2RlPi9tdmMvdXNlcnMuanM8L2NvZGU+IC0gVXNlcyB0aGUgYXV0aGVudGljYXRpb24gYXBpIHRvIGFkZCBhIHVzZXIgd2l0aCBhbiBlbmNyeXB0ZWQgcGFzc3dvcmQ8L3A+XFxuPC9saT5cXG48bGk+PHA+QXV0aGVudGljYXRpb24gbWlkZGxld2FyZSA8Y29kZT4vc3lzdGVtL2F1dGhfbWlkZGxlLmpzPC9jb2RlPiAtIGFwcGxpZXMgYXV0aGVudGljYXRpb24gb24gdGhlIHNlcnZlciBmb3IgYWN0aW9ucyAtIHRoaXMgaXMgYSBjb3JlIGZlYXR1cmUgb2YgaG93IG1pc28gZG9lcyB0aGUgYXV0aGVudGljYXRpb24gLSBpdCBzaW1wbHkgY2hlY2tzIGlmIHRoZSBzZWNyZXQgaXMgc2V0IG9uIHRoZSBzZXNzaW9uLCBhbmQgcmVkaXJlY3RzIHRvIHRoZSBjb25maWd1cmVkICZxdW90O2xvZ2luVXJsUGF0dGVybiZxdW90OyBVUkwgaWYgaXQgZG9lc24mIzM5O3QgbWF0Y2ggdGhlIHNlY3JldC48L3A+XFxuPC9saT5cXG48L3VsPlxcbjxwPklkZWFsbHkgeW91IHdpbGwgbm90IG5lZWQgdG8gY2hhbmdlIHRoZSBhdXRoZW50aWNhdGlvbiBtaWRkbGV3YXJlLCBhcyB0aGUgaW1wbGVtZW50YXRpb24gc2ltcGx5IHJlcXVpcmVzIHlvdSB0byBzZXQgdGhlICZxdW90O2F1dGhlbnRpY2F0aW9uU2VjcmV0JnF1b3Q7IG9uIHRoZSByZXF1ZXN0IG9iamVjdCBzZXNzaW9uIC0geW91IGNhbiBzZWUgaG93IHRoaXMgd29ya3MgaW4gPGNvZGU+L3N5c3RlbS9hcGkvYXV0aGVudGljYXRlL2F1dGhlbnRpY2F0ZS5hcGkuanM8L2NvZGU+LjwvcD5cXG48aDM+PGEgbmFtZT1cXFwiaG93LXRoZS1zYW1wbGUtaW1wbGVtZW50YXRpb24td29ya3NcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctdGhlLXNhbXBsZS1pbXBsZW1lbnRhdGlvbi13b3Jrc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ib3cgdGhlIHNhbXBsZSBpbXBsZW1lbnRhdGlvbiB3b3Jrczwvc3Bhbj48L2E+PC9oMz48dWw+XFxuPGxpPldoZW4gYXV0aGVudGljYXRpb24gaXMgcmVxdWlyZWQgZm9yIGFjY2VzcyB0byBhbiBhY3Rpb24sIGFuZCB5b3UgaGF2ZW4mIzM5O3QgYXV0aGVudGljYXRlZCwgeW91IGFyZSByZWRpcmVjdGVkIHRvIHRoZSA8Y29kZT4vbG9naW48L2NvZGU+IGFjdGlvbjwvbGk+XFxuPGxpPkF0IDxjb2RlPi9sb2dpbjwvY29kZT4geW91IGNhbiBhdXRoZW50aWNhdGUgd2l0aCBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCAod2hpY2ggY2FuIGJlIGNyZWF0ZWQgYXQgPGNvZGU+L3VzZXJzPC9jb2RlPik8L2xpPlxcbjxsaT5XaGVuIGF1dGhlbnRpY2F0ZWQsIGEgc2VjcmV0IGtleSBpcyBzZXQgb24gdGhlIHNlc3Npb24sIHRoaXMgaXMgdXNlZCB0byBjaGVjayBpZiBhIHVzZXIgaXMgbG9nZ2VkIGluIGV2ZXJ5IHRpbWUgdGhleSBhY2Nlc3MgYW4gYWN0aW9uIHRoYXQgcmVxdWlyZXMgYXV0aGVudGljYXRpb24uPC9saT5cXG48L3VsPlxcbjxwPk5vdGU6IHRoZSBhdXRoZW50aWNhdGlvbiBzZWNyZXQgaXMgb25seSBldmVyIGtlcHQgb24gdGhlIHNlcnZlciwgc28gdGhlIGNsaWVudCBjb2RlIHNpbXBseSBoYXMgYSBib29sZWFuIHRvIHNheSBpZiBpdCBpcyBsb2dnZWQgaW4gLSB0aGlzIG1lYW5zIGl0IHdpbGwgdHJ5IHRvIGFjY2VzcyBhdXRoZW50aWNhdGVkIHVybHMgaWYgPGNvZGU+bWlzb0dsb2JhbC5pc0xvZ2dlZEluPC9jb2RlPiBpcyBzZXQgdG8gJnF1b3Q7dHJ1ZSZxdW90Oy4gT2YgY291cnNlIHRoZSBzZXJ2ZXIgd2lsbCBkZW55IGFjY2VzcyB0byBhbnkgZGF0YSBhcGkgZW5kIHBvaW50cywgc28geW91ciBkYXRhIGlzIHNhZmUuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJzZXNzaW9uc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3Nlc3Npb25zXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlNlc3Npb25zPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gdGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgdGhleSBhcmUgcHJvdmlkZWQgd2l0aCBhIHNlc3Npb24gLSB0aGlzIGNhbiBiZSB1c2VkIHRvIHN0b3JlIHRlbXBvcmFyeSBkYXRhIGFuZCBpcyBhY2Nlc3NpYmxlIHZpYSA8Y29kZT4vc3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5zZXJ2ZXIuanM8L2NvZGU+LiBZb3UgY2FuIHVzZSBpdCBsaWtlIHNvIGluIHlvdXIgPGNvZGU+bXZjPC9jb2RlPiBmaWxlczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgc2Vzc2lvbiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL3Nlc3Npb24vYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG5zZXNzaW9uLmdldCh7a2V5OiAmIzM5O3VzZXJOYW1lJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbiAgICBjb25zb2xlLmxvZyhkYXRhLnJlc3VsdCk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZXNlIGFyZSB0aGUgbWV0aG9kcyBhdmFpbGFibGUgb24gdGhlIHNlc3Npb24gYXBpOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+TWV0aG9kPC90aD5cXG48dGg+UHVycG9zZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPmdldCh7a2V5OiBrZXl9KTwvdGQ+XFxuPHRkPlJldHJpZXZlcyBhIHZhbHVlIGZyb20gdGhlIHNlc3Npb24gZm9yIHRoZSBnaXZlbiBrZXk8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5zZXQoe2tleToga2V5LCB2YWx1ZTogdmFsdWV9KTwvdGQ+XFxuPHRkPlNldHMgYSB2YWx1ZSBpbiB0aGUgc2Vzc2lvbiBmb3IgdGhlIGdpdmVuIGtleTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+Tm90ZTogRWFjaCB1c2VyIG9mIHlvdXIgYXBwIGhhcyBhIHNlc3Npb24gdGhhdCBpcyBzdG9yZWQgb24gdGhlIHNlcnZlciwgc28gZWFjaCB0aW1lIHlvdSBhY2Nlc3MgaXQsIGl0IHdpbGwgbWFrZSBhIFhIUiByZXF1ZXN0LiBVc2UgaXQgc3BhcmluZ2x5ITwvcD5cXG5cIixcIkNvbnRyaWJ1dGluZy5tZFwiOlwiPHA+SW4gb3JkZXIgdG8gY29udHJpYnV0ZSB0byBtaXNvanMsIHBsZWFzZSBrZWVwIHRoZSBmb2xsb3dpbmcgaW4gbWluZDo8L3A+XFxuPGgyPjxhIG5hbWU9XFxcIndoZW4tYWRkaW5nLWEtcHVsbC1yZXF1ZXN0XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjd2hlbi1hZGRpbmctYS1wdWxsLXJlcXVlc3RcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+V2hlbiBhZGRpbmcgYSBwdWxsIHJlcXVlc3Q8L3NwYW4+PC9hPjwvaDI+PHVsPlxcbjxsaT5CZSBzdXJlIHRvIG9ubHkgbWFrZSBzbWFsbCBjaGFuZ2VzLCBhbnl0aGluZyBtb3JlIHRoYW4gNCBmaWxlcyB3aWxsIG5lZWQgdG8gYmUgcmV2aWV3ZWQ8L2xpPlxcbjxsaT5NYWtlIHN1cmUgeW91IGV4cGxhaW4gPGVtPndoeTwvZW0+IHlvdSYjMzk7cmUgbWFraW5nIHRoZSBjaGFuZ2UsIHNvIHdlIHVuZGVyc3RhbmQgd2hhdCB0aGUgY2hhbmdlIGlzIGZvcjwvbGk+XFxuPGxpPkFkZCBhIHVuaXQgdGVzdCBpZiBhcHByb3ByaWF0ZTwvbGk+XFxuPGxpPkRvIG5vdCBiZSBvZmZlbmRlZCBpZiB3ZSBhc2sgeW91IHRvIGFkZCBhIHVuaXQgdGVzdCBiZWZvcmUgYWNjZXB0aW5nIGEgcHVsbCByZXF1ZXN0PC9saT5cXG48bGk+VXNlIHRhYnMgbm90IHNwYWNlcyAod2UgYXJlIG5vdCBmbGV4aWJsZSBvbiB0aGlzIC0gaXQgaXMgYSBtb290IGRpc2N1c3Npb24gLSBJIHJlYWxseSBkb24mIzM5O3QgY2FyZSwgd2UganVzdCBuZWVkZWQgdG8gcGljayBvbmUsIGFuZCB0YWJzIGl0IGlzKTwvbGk+XFxuPC91bD5cXG5cIixcIkNyZWF0aW5nLWEtdG9kby1hcHAtcGFydC0yLXBlcnNpc3RlbmNlLm1kXCI6XCI8cD5JbiB0aGlzIGFydGljbGUgd2Ugd2lsbCBhZGQgZGF0YSBwZXJzaXN0ZW5jZSBmdW5jdGlvbmFsaXR5IHRvIG91ciB0b2RvIGFwcCBmcm9tIHRoZSA8YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAubWRcXFwiPkNyZWF0aW5nIGEgdG9kbyBhcHA8L2E+IGFydGljbGUuIFdlIHJlY29tbWVuZCB5b3UgZmlyc3QgcmVhZCB0aGF0IGFzIHdlIGFyZSBnb2luZyB0byB1c2UgdGhlIGFwcCB5b3UgbWFkZSBpbiB0aGlzIGFydGljbGUsIHNvIGlmIHlvdSBkb24mIzM5O3QgYWxyZWFkeSBoYXZlIG9uZSwgZ3JhYiBhIGNvcHkgb2YgaXQgPGEgaHJlZj1cXFwiL2RvYy9DcmVhdGluZy1hLXRvZG8tYXBwI2NvbXBsZXRlZC10b2RvLWFwcC5tZFxcXCI+ZnJvbSBoZXJlPC9hPiwgYW5kIHNhdmUgaXQgaW4gPGNvZGU+L212Yy90b2RvLmpzPC9jb2RlPi48L3A+XFxuPHA+Rmlyc3QgYWRkIHRoZSA8Y29kZT5mbGF0ZmlsZWRiPC9jb2RlPiBhcGkgdG8gdGhlIDxjb2RlPmNmZy9zZXJ2ZXIuZGV2ZWxvcG1lbnQuanNvbjwvY29kZT4gZmlsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4mcXVvdDthcGkmcXVvdDs6ICZxdW90O2ZsYXRmaWxlZGImcXVvdDtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBtYWtlcyBtaXNvIGxvYWQgdGhlIGFwaSBhbmQgZXhwb3NlIGl0IGF0IHRoZSBjb25maWd1cmVkIEFQSSB1cmwsIGRlZmF1bHQgaXMgJnF1b3Q7L2FwaSZxdW90OyArIGFwaSBuYW1lLCBzbyBmb3IgdGhlIGZsYXRmaWxlZGIgaXQgd2lsbCBiZSA8Y29kZT4vYXBpL2ZsYXRmaWxlZGI8L2NvZGU+LiBUaGlzIGlzIGFsbCBhYnN0cmFjdGVkIGF3YXksIHNvIHlvdSBkbyBub3QgbmVlZCB0byB3b3JyeSBhYm91dCB3aGF0IHRoZSBVUkwgaXMgd2hlbiB1c2luZyB0aGUgYXBpIC0geW91IHNpbXBseSBjYWxsIHRoZSBtZXRob2QgeW91IHdhbnQsIGFuZCB0aGUgbWlzbyBhcGkgdGFrZXMgY2FyZSBvZiB0aGUgcmVzdC48L3A+XFxuPHA+Tm93IHJlcXVpcmUgdGhlIGRiIGFwaSBhdCB0aGUgdGhlIHRvcCBvZiB0aGUgdG9kby5qcyBmaWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5OZXh0IGFkZCB0aGUgZm9sbG93aW5nIGluIHRoZSA8Y29kZT5jdHJsLmFkZFRvZG88L2NvZGU+IGZ1bmN0aW9uIHVuZGVybmVhdGggdGhlIGxpbmUgdGhhdCByZWFkcyA8Y29kZT5jdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7PC9jb2RlPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5kYi5zYXZlKHsgdHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5OywgbW9kZWw6IG5ld1RvZG8gfSApLnRoZW4oZnVuY3Rpb24ocmVzKXtcXG4gICAgbmV3VG9kby5faWQgPSByZXMucmVzdWx0O1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgc2F2ZSB0aGUgdG9kbyB0byB0aGUgZGF0YWJhc2Ugd2hlbiB5b3UgY2xpY2sgdGhlICZxdW90O0FkZCZxdW90OyBidXR0b24uPC9wPlxcbjxwPkxldCB1cyB0YWtlIGEgcXVpY2sgbG9vayBhdCBob3cgdGhlIGFwaSB3b3JrcyAtIHRoZSB3YXkgdGhhdCB5b3UgbWFrZSByZXF1ZXN0cyB0byB0aGUgYXBpIGRlcGVuZHMgZW50aXJlbHkgb24gd2hpY2ggYXBpIHlvdSBhcmUgdXNpbmcsIGZvciBleGFtcGxlIGZvciB0aGUgZmxhdGZpbGVkYiwgd2UgaGF2ZTo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPk1ldGhvZDwvdGg+XFxuPHRoPkFjdGlvbjwvdGg+XFxuPHRoPlBhcmFtZXRlcnM8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5zYXZlPC90ZD5cXG48dGQ+U2F2ZSBvciB1cGRhdGVzIGEgbW9kZWw8L3RkPlxcbjx0ZD57IHR5cGU6IFRZUEUsIG1vZGVsOiBNT0RFTCB9PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+ZmluZDwvdGQ+XFxuPHRkPkZpbmRzIG9uZSBvciBtb3JlIG1vZGVscyBvZiB0aGUgZ2l2ZSB0eXBlPC90ZD5cXG48dGQ+eyB0eXBlOiBUWVBFLCBxdWVyeTogUVVFUlkgfTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPnJlbW92ZTwvdGQ+XFxuPHRkPlJlbW92ZXMgYW4gaW5zdGFuY2Ugb2YgYSBtb2RlbDwvdGQ+XFxuPHRkPnsgdHlwZTogVFlQRSwgaWQ6IElEIH08L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPldoZXJlIHRoZSBhdHRyaWJ1dGVzIGFyZTo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkF0dHJpYnV0ZTwvdGg+XFxuPHRoPlVzZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPlRZUEU8L3RkPlxcbjx0ZD5UaGUgbmFtZXNwYWNlIG9mIHRoZSBtb2RlbCwgc2F5IHlvdSBoYXZlIHRvZG8uanMsIGFuZCB0aGUgbW9kZWwgaXMgb24gPGNvZGU+bW9kdWxlLmV4cG9ydHMuaW5kZXgubW9kdWxlcy50b2RvPC9jb2RlPiwgdGhlIHR5cGUgd291bGQgYmUgJnF1b3Q7dG9kby5pbmRleC50b2RvJnF1b3Q7PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+TU9ERUw8L3RkPlxcbjx0ZD5UaGlzIGlzIGFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG1vZGVsIC0gZWc6IGEgc3RhbmRhcmQgbWl0aHJpbCBtb2RlbDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlFVRVJZPC90ZD5cXG48dGQ+QW4gb2JqZWN0IHdpdGggYXR0cmlidXRlcyB0byBmaWx0ZXIgdGhlIHF1ZXJ5IHJlc3VsdHM8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5JRDwvdGQ+XFxuPHRkPkEgdW5pcXVlIElEIGZvciBhIHJlY29yZDwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+RXZlcnkgbWV0aG9kIHJldHVybnMgYSA8YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuZGVmZXJyZWQuaHRtbCNkaWZmZXJlbmNlcy1mcm9tLXByb21pc2VzLWEtLm1kXFxcIj5taXRocmlsIHN0eWxlIHByb21pc2U8L2E+LCB3aGljaCBtZWFucyB5b3UgbXVzdCBhdHRhY2ggYSA8Y29kZT4udGhlbjwvY29kZT4gY2FsbGJhY2sgZnVuY3Rpb24uXFxuQmUgc3VyZSB0byBjaGVjayB0aGUgbWV0aG9kcyBmb3IgZWFjaCBhcGksIGFzIGVhY2ggd2lsbCB2YXJ5LCBkZXBlbmRpbmcgb24gdGhlIGZ1bmN0aW9uYWxpdHkuPC9wPlxcbjxwPk5vdywgbGV0IHVzIGFkZCB0aGUgY2FwYWJpbGl0eSB0byBsb2FkIG91ciB0b2RvcywgYWRkIHRoZSBmb2xsb3dpbmcgdG8gdGhlIHN0YXJ0IG9mIHRoZSBjb250cm9sbGVyLCBqdXN0IGFmdGVyIHRoZSA8Y29kZT52YXIgY3RybCA9IHRoaXM8L2NvZGU+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiLmZpbmQoe3R5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhkYXRhLnJlc3VsdFtrZXldKTtcXG4gICAgfSk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBsb2FkIHlvdXIgdG9kb3Mgd2hlbiB0aGUgYXBwIGxvYWRzIHVwLiBCZSBzdXJlIHRvIHJlbW92ZSB0aGUgb2xkIHN0YXRpYyBsaXN0LCBpZTogcmVtb3ZlIHRoZXNlIGxpbmVzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG5cXG5jdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5Ob3cgeW91IGNhbiB0cnkgYWRkaW5nIGEgdG9kbywgYW5kIGl0IHdpbGwgc2F2ZSBhbmQgbG9hZCE8L3A+XFxuPHA+TmV4dCBsZXQgdXMgYWRkIHRoZSBhYmlsaXR5IHRvIHJlbW92ZSB5b3VyIGNvbXBsZXRlZCB0b2RvcyBpbiB0aGUgYXJjaGl2ZSBtZXRob2QgLSBleHRlbmQgdGhlIDxjb2RlPmlmPC9jb2RlPiBzdGF0ZW1lbnQgYnkgYWRkaW5nIGFuIDxjb2RlPmVsc2U8L2NvZGU+IGxpa2Ugc286IDwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPn0gZWxzZSB7XFxuICAgIGFwaS5yZW1vdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBfaWQ6IHRvZG8uX2lkIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzdWx0KTtcXG4gICAgfSk7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgcmVtb3ZlIHRoZSB0b2RvIGZyb20gdGhlIGRhdGEgc3RvcmUuPC9wPlxcbjxwPllvdSBub3cgaGF2ZSBhIGNvbXBsZXRlIHRvZG8gYXBwLCB5b3VyIGFwcCBzaG91bGQgbG9vayBsaWtlIHRoaXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgICAgICB0aGlzLmRvbmUgPSBtLnByb3AoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgICAgICB0aGlzLl9pZCA9IGRhdGEuX2lkO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcztcXG5cXG4gICAgICAgIGRiLmZpbmQoe3R5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgICAgICAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8oZGF0YS5yZXN1bHRba2V5XSk7XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIGN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN0cmwudm0uaW5wdXQoKTtcXG4gICAgICAgICAgICBpZih2YWx1ZSkge1xcbiAgICAgICAgICAgICAgICB2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGN0cmwudm0uaW5wdXQoKSxcXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlXFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcXG4gICAgICAgICAgICAgICAgY3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspO1xcbiAgICAgICAgICAgICAgICBkYi5zYXZlKHsgdHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5OywgbW9kZWw6IG5ld1RvZG8gfSApLnRoZW4oZnVuY3Rpb24ocmVzKXtcXG4gICAgICAgICAgICAgICAgICAgIG5ld1RvZG8uX2lkID0gcmVzLnJlc3VsdDtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICBpZighdG9kby5kb25lKCkpIHtcXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTsgXFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XFxuICAgICAgICAgICAgICAgICAgICBkYi5yZW1vdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBfaWQ6IHRvZG8uX2lkIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlc3VsdCk7XFxuICAgICAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgIGN0cmwubGlzdCA9IGxpc3Q7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC52bSA9IHtcXG4gICAgICAgICAgICBsZWZ0OiBmdW5jdGlvbigpe1xcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ICs9IHRvZG8uZG9uZSgpID8gMCA6IDE7XFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnQ7XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgICAgICBkb25lOiBmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xcbiAgICAgICAgICAgICAgICAgICAgdG9kby5kb25lKCF0b2RvLmRvbmUoKSk7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGlucHV0OiBtLnByb3AoJnF1b3Q7JnF1b3Q7KVxcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIFNUWUxFKCZxdW90Oy5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO30mcXVvdDspLFxcbiAgICAgICAgICAgICAgICBIMSgmcXVvdDtUb2RvcyAtICZxdW90OyArIGN0cmwudm0ubGVmdCgpICsgJnF1b3Q7IG9mICZxdW90OyArIGN0cmwubGlzdC5sZW5ndGggKyAmcXVvdDsgcmVtYWluaW5nJnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgQlVUVE9OKHsgb25jbGljazogY3RybC5hcmNoaXZlIH0sICZxdW90O0FyY2hpdmUmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBVTChbXFxuICAgICAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gJnF1b3Q7ZG9uZSZxdW90OzogJnF1b3Q7JnF1b3Q7LCBvbmNsaWNrOiBjdHJsLnZtLmRvbmUodG9kbykgfSwgdG9kby50ZXh0KTtcXG4gICAgICAgICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgICAgIF0pLFxcbiAgICAgICAgICAgICAgICBGT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXFxuICAgICAgICAgICAgICAgICAgICBJTlBVVCh7IHR5cGU6ICZxdW90O3RleHQmcXVvdDssIHZhbHVlOiBjdHJsLnZtLmlucHV0LCBwbGFjZWhvbGRlcjogJnF1b3Q7QWRkIHRvZG8mcXVvdDt9KSxcXG4gICAgICAgICAgICAgICAgICAgIEJVVFRPTih7IHR5cGU6ICZxdW90O3N1Ym1pdCZxdW90O30sICZxdW90O0FkZCZxdW90OylcXG4gICAgICAgICAgICAgICAgXSlcXG4gICAgICAgICAgICBdXFxuICAgICAgICB9O1xcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuXCIsXCJDcmVhdGluZy1hLXRvZG8tYXBwLm1kXCI6XCI8cD5JbiB0aGlzIGFydGljbGUgd2Ugd2lsbCBjcmVhdGUgYSBmdW5jdGlvbmFsIHRvZG8gYXBwIC0gd2UgcmVjb21tZW5kIHlvdSBmaXJzdCByZWFkIHRoZSA8YSBocmVmPVxcXCIvZG9jL0dldHRpbmctc3RhcnRlZC5tZFxcXCI+R2V0dGluZyBzdGFydGVkPC9hPiBhcnRpY2xlLCBhbmQgdW5kZXJzdGFuZCB0aGUgbWlzbyBmdW5kYW1lbnRhbHMgc3VjaCBhcyB3aGVyZSB0byBwbGFjZSBtb2RlbHMgYW5kIGhvdyB0byBjcmVhdGUgYSBtaXNvIGNvbnRyb2xsZXIuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJ0b2RvLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3RvZG8tYXBwXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlRvZG8gYXBwPC9zcGFuPjwvYT48L2gyPjxwPldlIHdpbGwgbm93IGNyZWF0ZSBhIG5ldyBhcHAgdXNpbmcgdGhlIDxhIGhyZWY9XFxcIi9kb2MvUGF0dGVybnMjc2luZ2xlLXVybC1tdmMubWRcXFwiPnNpbmdsZSB1cmwgcGF0dGVybjwvYT4sIHdoaWNoIG1lYW5zIGl0IGhhbmRsZXMgYWxsIGFjdGlvbnMgYXV0b25vbW91c2x5LCBwbHVzIGxvb2tzIGEgbG90IGxpa2UgYSBub3JtYWwgbWl0aHJpbCBhcHAuPC9wPlxcbjxwPkluIDxjb2RlPi9tdmM8L2NvZGU+IHNhdmUgYSBuZXcgZmlsZSBhcyA8Y29kZT50b2RvLmpzPC9jb2RlPiB3aXRoIHRoZSBmb2xsb3dpbmcgY29udGVudDogPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHt9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcztcXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICByZXR1cm4gJnF1b3Q7VE9ETyZxdW90OztcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5vdyBvcGVuOiA8YSBocmVmPVxcXCIvZG9jL3RvZG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvdG9kb3M8L2E+IGFuZCB5b3UmIzM5O2xsIHNlZSB0aGUgd29yZCAmcXVvdDtUT0RPJnF1b3Q7LiBZb3UmIzM5O2xsIG5vdGljZSB0aGF0IHRoZSB1cmwgaXMgJnF1b3Q7L3RvZG9zJnF1b3Q7IHdpdGggYW4gJiMzOTtzJiMzOTsgb24gdGhlIGVuZCAtIGFzIHdlIGFyZSB1c2luZyA8YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzI3JvdXRlLWJ5LWNvbnZlbnRpb24ubWRcXFwiPnJvdXRlIGJ5IGNvbnZlbnRpb248L2E+IHRvIG1hcCBvdXIgcm91dGUuPC9wPlxcbjxwPk5leHQgbGV0JiMzOTtzIGNyZWF0ZSB0aGUgbW9kZWwgZm9yIG91ciB0b2RvcyAtIGNoYW5nZSB0aGUgPGNvZGU+bW9kZWxzPC9jb2RlPiBhdHRyaWJ1dGUgdG8gdGhlIGZvbGxvd2luZzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2RlbHM6IHtcXG4gICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XFxuICAgICAgICB0aGlzLmRvbmUgPSBtLnAoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgIH1cXG59LFxcbjwvY29kZT48L3ByZT5cXG48cD5FYWNoIGxpbmUgaW4gdGhlIG1vZGVsIGRvZXMgdGhlIGZvbGxvd2luZzo8L3A+XFxuPHVsPlxcbjxsaT48Y29kZT50aGlzLnRleHQ8L2NvZGU+IC0gVGhlIHRleHQgdGhhdCBpcyBzaG93biBvbiB0aGUgdG9kbzwvbGk+XFxuPGxpPjxjb2RlPnRoaXMuZG9uZTwvY29kZT4gLSBUaGlzIHJlcHJlc2VudHMgaWYgdGhlIHRvZG8gaGFzIGJlZW4gY29tcGxldGVkIC0gd2UgZW5zdXJlIHRoYXQgd2UgaGFuZGxlIHRoZSAmcXVvdDtmYWxzZSZxdW90OyB2YWx1ZXMgY29ycmVjdGx5LCBhcyBhamF4IHJlc3BvbnNlcyBhcmUgYWx3YXlzIHN0cmluZ3MuPC9saT5cXG48bGk+PGNvZGU+dGhpcy5faWQ8L2NvZGU+IC0gVGhlIGtleSBmb3IgdGhlIHRvZG88L2xpPlxcbjwvdWw+XFxuPHA+VGhlIG1vZGVsIGNhbiBub3cgYmUgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmVpdmUgdG9kb3MgLSBtaXNvIGF1dG9tYXRpY2FsbHkgcGlja3MgdXAgYW55IG9iamVjdHMgb24gdGhlIDxjb2RlPm1vZGVsczwvY29kZT4gYXR0cmlidXRlIG9mIHlvdXIgbXZjIGZpbGUsIGFuZCBtYXBzIGl0IGluIHRoZSBBUEkuIFdlIHdpbGwgc29vbiBzZWUgaG93IHRoYXQgd29ya3MuIE5leHQgYWRkIHRoZSBmb2xsb3dpbmcgY29kZSBhcyB0aGUgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgbXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcbiAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG4gICAgfSk7XFxuICAgIHJldHVybiBjdHJsO1xcbn0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgZG9lcyB0aGUgZm9sbG93aW5nOjwvcD5cXG48dWw+XFxuPGxpPkNyZWF0ZXMgPGNvZGU+bXlUb2RvczwvY29kZT4gd2hpY2ggaXMgYSBsaXN0IG9mIG9iamVjdHMgdGhhdCByZXByZXNlbnRzIHRvZG9zPC9saT5cXG48bGk+PGNvZGU+dGhpcy5saXN0PC9jb2RlPiAtIGNyZWF0ZXMgYSBsaXN0IG9mIHRvZG8gbW9kZWwgb2JqZWN0cyBieSB1c2luZyA8Y29kZT5uZXcgc2VsZi5tb2RlbHMudG9kbyguLi48L2NvZGU+IG9uIGVhY2ggbXlUb2RvcyBvYmplY3QuPC9saT5cXG48bGk+PGNvZGU+cmV0dXJuIHRoaXM8L2NvZGU+IG11c3QgYmUgZG9uZSBpbiBhbGwgY29udHJvbGxlcnMsIGl0IG1ha2VzIHN1cmUgdGhhdCBtaXNvIGNhbiBjb3JyZWN0bHkgZ2V0IGFjY2VzcyB0byB0aGUgY29udHJvbGxlciBvYmplY3QuPC9saT5cXG48L3VsPlxcbjxwPk5vdGU6IHdlIGFsd2F5cyBjcmVhdGUgYSBsb2NhbCB2YXJpYWJsZSA8Y29kZT5jdHJsPC9jb2RlPiB0aGF0IHBvaW50cyB0byB0aGUgY29udHJvbGxlciwgYXMgaXQgY2FuIGJlIHVzZWQgdG8gYWNjZXNzIHZhcmlhYmxlcyBpbiB0aGUgY29udHJvbGxlciBmcm9tIG5lc3RlZCBmdW5jdGlvbnMuIFlvdSB3aWxsIHNlZSB0aGlzIHVzYWdlIGxhdGVyIG9uIGluIHRoaXMgYXJ0aWNsZS48L3A+XFxuPHA+Tm93IHVwZGF0ZSB0aGUgdmlldyBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgcmV0dXJuIG0oJnF1b3Q7VUwmcXVvdDssIFtcXG4gICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgcmV0dXJuIG0oJnF1b3Q7TEkmcXVvdDssIHRvZG8udGV4dClcXG4gICAgICAgIH0pXFxuICAgIF0pO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGl0ZXJhdGUgb24geW91ciBuZXdseSBjcmVhdGVkIGxpc3Qgb2YgdG9kbyBtb2RlbCBvYmplY3RzIGFuZCBkaXNwbGF5IHRoZSBvbiBzY3JlZW4uIFlvdXIgdG9kbyBhcHAgc2hvdWxkIG5vdyBsb29rIGxpa2UgdGhpczo8L3A+XFxuPGgzPjxhIG5hbWU9XFxcImhhbGYtd2F5LXBvaW50XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaGFsZi13YXktcG9pbnRcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SGFsZi13YXkgcG9pbnQ8L3NwYW4+PC9hPjwvaDM+PHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IG0ucChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgICAgIG15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG4gICAgICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG4gICAgICAgIH0pO1xcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHJldHVybiBtKCZxdW90O1VMJnF1b3Q7LCBbXFxuICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJnF1b3Q7TEkmcXVvdDssIHRvZG8udGV4dClcXG4gICAgICAgICAgICB9KVxcbiAgICAgICAgXSk7XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48YmxvY2txdW90ZT5cXG5TbyBmYXIgd2UgaGF2ZSBvbmx5IHVzZWQgcHVyZSBtaXRocmlsIHRvIGNyZWF0ZSBvdXIgYXBwIC0gbWlzbyBkaWQgZG8gc29tZSBvZiB0aGUgZ3J1bnQtd29yayBiZWhpbmQgdGhlIHNjZW5lcywgYnV0IHdlIGNhbiBkbyBtdWNoIG1vcmUuXFxuPC9ibG9ja3F1b3RlPlxcblxcblxcbjxwPkxldCB1cyBhZGQgc29tZSB1c2VmdWwgbGlicmFyaWVzLCBjaGFuZ2UgdGhlIHRvcCBzZWN0aW9uIHRvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgYmluZGluZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuYmluZGluZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGluY2x1ZGUgdGhlIGZvbGxvd2luZyBsaWJyYXJpZXM6PC9wPlxcbjx1bD5cXG48bGk+PGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLnN1Z2FydGFncy5tZFxcXCI+bWl0aHJpbC5zdWdhcnRhZ3M8L2E+IC0gYWxsb3dzIHJlbmRlcmluZyBIVE1MIHVzaW5nIHRhZ3MgdGhhdCBsb29rIGEgbGl0dGxlIG1vcmUgbGlrZSBIVE1MIHRoYW4gc3RhbmRhcmQgbWl0aHJpbDwvbGk+XFxuPGxpPjxhIGhyZWY9XFxcIi9kb2MvbWl0aHJpbC5iaW5kaW5ncy5tZFxcXCI+bWl0aHJpbC5iaW5kaW5nczwvYT4gQmktZGlyZWN0aW9uYWwgZGF0YSBiaW5kaW5ncyBmb3IgcmljaGVyIG1vZGVsczwvbGk+XFxuPC91bD5cXG48cD5MZXQgdXMgc3RhcnQgd2l0aCB0aGUgc3VnYXIgdGFncywgdXBkYXRlIHRoZSB2aWV3IHRvIHJlYWQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgcmV0dXJuIFVMKFtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gTEkodG9kby50ZXh0KVxcbiAgICAgICAgICAgIH0pXFxuICAgICAgICBdKVxcbiAgICB9O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+U28gdXNpbmcgc3VnYXJ0YWdzIGFsbG93cyB1cyB0byB3cml0ZSBtb3JlIGNvbmNpc2Ugdmlld3MsIHRoYXQgbG9vayBtb3JlIGxpa2UgbmF0dXJhbCBIVE1MLjwvcD5cXG48cD5OZXh0IGxldCB1cyBhZGQgYSA8YSBocmVmPVxcXCIvZG9jL3doYXQtaXMtYS12aWV3LW1vZGVsLmh0bWwubWRcXFwiPnZpZXcgbW9kZWw8L2E+IHRvIHRoZSBjb250cm9sbGVyLiBBIHZpZXcgbW9kZWwgaXMgc2ltcGx5IGEgbW9kZWwgdGhhdCBjb250YWlucyBkYXRhIGFib3V0IHRoZSB2aWV3LCBhbmQgYXV4aWxsYXJ5IGZ1bmN0aW9uYWxpdHksIGllOiBkYXRhIGFuZCBvdGhlciB0aGluZ3MgdGhhdCB3ZSBkb24mIzM5O3Qgd2FudCB0byBwZXJzaXN0LiBBZGQgdGhpcyB0byB0aGUgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jdHJsLnZtID0ge1xcbiAgICBkb25lOiBmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcXG4gICAgICAgICAgICB0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCB0b2dnbGVzIHRoZSA8Y29kZT5kb25lPC9jb2RlPiBhdHRyaWJ1dGUgb24gdGhlIHBhc3NlZCBpbiB0b2RvLiA8L3A+XFxuPGJsb2NrcXVvdGU+XFxuWW91IG1pZ2h0IGJlIHRlbXB0ZWQgdG8gcHV0IHRoaXMgZnVuY3Rpb25hbGl0eSBpbnRvIHRoZSBtb2RlbCwgYnV0IGluIG1pc28sIHdlIG5lZWQgdG8gc3RyaWN0bHkga2VlcCBkYXRhIGluIHRoZSBkYXRhIG1vZGVsLCBhcyB3ZSBhcmUgYWJsZSB0byBwZXJzaXN0IGl0LlxcbjwvYmxvY2txdW90ZT5cXG5cXG48cD5OZXh0IHVwZGF0ZSB0aGUgdmlldyB0bzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgIFNUWUxFKCZxdW90Oy5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO30mcXVvdDspLFxcbiAgICAgICAgICAgIFVMKFtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gJnF1b3Q7ZG9uZSZxdW90OzogJnF1b3Q7JnF1b3Q7LCBvbmNsaWNrOiBjdHJsLnZtLmRvbmUodG9kbykgfSwgdG9kby50ZXh0KTtcXG4gICAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICBdKVxcbiAgICAgICAgXVxcbiAgICB9O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIG1ha2UgdGhlIGxpc3Qgb2YgdG9kb3MgY2xpY2thYmxlLCBhbmQgcHV0IGEgc3RyaWtlLXRocm91Z2ggdGhlIHRvZG8gd2hlbiBpdCBpcyBzZXQgdG8gJnF1b3Q7ZG9uZSZxdW90OywgbmVhdCE8L3A+XFxuPHA+Tm93IGxldCB1cyBhZGQgYSBjb3VudGVyLCB0byBzaG93IGhvdyBtYW55IHRvZG9zIGFyZSBsZWZ0LCBwdXQgdGhpcyBpbnRvIHRoZSB2aWV3IG1vZGVsIHlvdSBjcmVhdGVkIGluIHRoZSBwcmV2aW91cyBzdGVwOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmxlZnQ6IGZ1bmN0aW9uKCl7XFxuICAgIHZhciBjb3VudCA9IDA7XFxuICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgY291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcXG4gICAgfSk7XFxuICAgIHJldHVybiBjb3VudDtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFuZCBpbiB0aGUgdmlldywgYWRkIHRoZSBmb2xsb3dpbmcgYWJvdmUgdGhlIFVMOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkgxKCZxdW90O1RvZG9zIC0gJnF1b3Q7ICsgY3RybC52bS5sZWZ0KCkgKyAmcXVvdDsgb2YgJnF1b3Q7ICsgY3RybC5saXN0Lmxlbmd0aCArICZxdW90OyByZW1haW5pbmcmcXVvdDspLFxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbm93IGRpc3BsYXkgYSBuaWNlIGhlYWRlciBzaG93aW5nIGhvdyBtYW55IHRvZG9zIGFyZSBsZWZ0LjwvcD5cXG48cD5OZXh0IGxldCB1cyBhZGQgYW4gaW5wdXQgZmllbGQsIHNvIHlvdSBjYW4gYWRkIG5ldyB0b2RvcywgaW4gdGhlIHZpZXcgbW9kZWwsICh0aGUgPGNvZGU+Y3RybC52bTwvY29kZT4gb2JqZWN0KSwgYWRkIHRoZSBmb2xsb3dpbmcgbGluZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5pbnB1dDogbS5wKCZxdW90OyZxdW90OylcXG48L2NvZGU+PC9wcmU+XFxuPHA+SW4gdGhlIGNvbnRyb2xsZXIsIGFkZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jdHJsLmFkZFRvZG8gPSBmdW5jdGlvbihlKXtcXG4gICAgdmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xcbiAgICBpZih2YWx1ZSkge1xcbiAgICAgICAgdmFyIG5ld1RvZG8gPSBuZXcgc2VsZi5tb2RlbHMudG9kbyh7XFxuICAgICAgICAgICAgdGV4dDogY3RybC52bS5pbnB1dCgpLFxcbiAgICAgICAgICAgIGRvbmU6IGZhbHNlXFxuICAgICAgICB9KTtcXG4gICAgICAgIGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xcbiAgICAgICAgY3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspO1xcbiAgICB9XFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgcmV0dXJuIGZhbHNlO1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgZnVuY3Rpb24gY3JlYXRlcyBhIG5ldyB0b2RvIGJhc2VkIG9uIHRoZSBpbnB1dCB0ZXh0LCBhbmQgYWRkcyBpdCB0byB0aGUgbGlzdCBvZiB0b2Rvcy48L3A+XFxuPHA+QW5kIGluIHRoZSB2aWV3IGp1c3QgYmVsb3cgdGhlIFVMLCBhZGQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Rk9STSh7IG9uc3VibWl0OiBjdHJsLmFkZFRvZG8gfSwgW1xcbiAgICBJTlBVVCh7IHR5cGU6ICZxdW90O3RleHQmcXVvdDssIHZhbHVlOiBjdHJsLnZtLmlucHV0LCBwbGFjZWhvbGRlcjogJnF1b3Q7QWRkIHRvZG8mcXVvdDt9KSxcXG4gICAgQlVUVE9OKHsgdHlwZTogJnF1b3Q7c3VibWl0JnF1b3Q7fSwgJnF1b3Q7QWRkJnF1b3Q7KVxcbl0pXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFzIHlvdSBjYW4gc2VlLCB3ZSBhc3NpZ24gdGhlIDxjb2RlPmFkZFRvZG88L2NvZGU+IG1ldGhvZCBvZiB0aGUgY29udHJvbGxlciB0byB0aGUgb25zdWJtaXQgZnVuY3Rpb24gb2YgdGhlIGZvcm0sIHNvIHRoYXQgaXQgd2lsbCBjb3JyZWN0bHkgYWRkIHRoZSB0b2RvIHdoZW4geW91IGNsaWNrIHRoZSAmcXVvdDtBZGQmcXVvdDsgYnV0dG9uLjwvcD5cXG48cD5OZXh0LCBsZXQgdXMgYWRkIHRoZSBhYmlsaXR5IHRvIGFyY2hpdmUgb2xkIHRvZG9zLCBhZGQgdGhlIGZvbGxvd2luZyBpbnRvIHRoZSBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XFxuICAgIHZhciBsaXN0ID0gW107XFxuICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgaWYoIXRvZG8uZG9uZSgpKSB7XFxuICAgICAgICAgICAgbGlzdC5wdXNoKHRvZG8pOyBcXG4gICAgICAgIH1cXG4gICAgfSk7XFxuICAgIGN0cmwubGlzdCA9IGxpc3Q7XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHRoaXMgYnV0dG9uIGJlbG93IHRoZSBIMTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5CVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgJnF1b3Q7QXJjaGl2ZSZxdW90OyksXFxuPC9jb2RlPjwvcHJlPlxcbjxoMz48YSBuYW1lPVxcXCJjb21wbGV0ZWQtdG9kby1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjb21wbGV0ZWQtdG9kby1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q29tcGxldGVkIHRvZG8gYXBwPC9zcGFuPjwvYT48L2gzPjxwPkFuZCB5b3UgY2FuIG5vdyBhcmNoaXZlIHlvdXIgdG9kb3MuIFRoaXMgY29tcGxldGVzIHRoZSB0b2RvIGFwcCBmdW5jdGlvbmFsbHksIHlvdXIgY29tcGxldGUgdG9kbyBhcHAgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgYmluZGluZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuYmluZGluZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgICAgICB0aGlzLmRvbmUgPSBtLnByb3AoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgICAgICB0aGlzLl9pZCA9IGRhdGEuX2lkO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICBteVRvZG9zID0gW3t0ZXh0OiAmcXVvdDtMZWFybiBtaXNvJnF1b3Q7fSwge3RleHQ6ICZxdW90O0J1aWxkIG1pc28gYXBwJnF1b3Q7fV07XFxuXFxuICAgICAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKG15VG9kb3Nba2V5XSk7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIGN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN0cmwudm0uaW5wdXQoKTtcXG4gICAgICAgICAgICBpZih2YWx1ZSkge1xcbiAgICAgICAgICAgICAgICB2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGN0cmwudm0uaW5wdXQoKSxcXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlXFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcXG4gICAgICAgICAgICAgICAgY3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIGN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbXTtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgICAgICAgICAgaWYoIXRvZG8uZG9uZSgpKSB7XFxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godG9kbyk7IFxcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgY3RybC5saXN0ID0gbGlzdDtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLnZtID0ge1xcbiAgICAgICAgICAgIGxlZnQ6IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICAgICAgY291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudDtcXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XFxuICAgICAgICAgICAgICAgICAgICB0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgaW5wdXQ6IG0ucCgmcXVvdDsmcXVvdDspXFxuICAgICAgICB9O1xcblxcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgU1RZTEUoJnF1b3Q7LmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fSZxdW90OyksXFxuICAgICAgICAgICAgICAgIEgxKCZxdW90O1RvZG9zIC0gJnF1b3Q7ICsgY3RybC52bS5sZWZ0KCkgKyAmcXVvdDsgb2YgJnF1b3Q7ICsgY3RybC5saXN0Lmxlbmd0aCArICZxdW90OyByZW1haW5pbmcmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBCVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgJnF1b3Q7QXJjaGl2ZSZxdW90OyksXFxuICAgICAgICAgICAgICAgIFVMKFtcXG4gICAgICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyAmcXVvdDtkb25lJnF1b3Q7OiAmcXVvdDsmcXVvdDssIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xcbiAgICAgICAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICAgICAgXSksXFxuICAgICAgICAgICAgICAgIEZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcXG4gICAgICAgICAgICAgICAgICAgIElOUFVUKHsgdHlwZTogJnF1b3Q7dGV4dCZxdW90OywgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiAmcXVvdDtBZGQgdG9kbyZxdW90O30pLFxcbiAgICAgICAgICAgICAgICAgICAgQlVUVE9OKHsgdHlwZTogJnF1b3Q7c3VibWl0JnF1b3Q7fSwgJnF1b3Q7QWRkJnF1b3Q7KVxcbiAgICAgICAgICAgICAgICBdKVxcbiAgICAgICAgICAgIF1cXG4gICAgICAgIH07XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5OZXh0IHdlIHJlY29tbWVuZCB5b3UgcmVhZDwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAtcGFydC0yLXBlcnNpc3RlbmNlLm1kXFxcIj5DcmVhdGluZyBhIHRvZG8gYXBwIHBhcnQgMiAtIHBlcnNpc3RlbmNlPC9hPiwgd2hlcmUgd2Ugd2lsbCBnbyB0aHJvdWdoIGFkZGluZyBkYXRhIHBlcnNpc3RlbmNlIGZ1bmN0aW9uYWxpdHkuPC9wPlxcblwiLFwiRGVidWdnaW5nLm1kXCI6XCI8aDE+PGEgbmFtZT1cXFwiZGVidWdnaW5nLWEtbWlzby1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNkZWJ1Z2dpbmctYS1taXNvLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5EZWJ1Z2dpbmcgYSBtaXNvIGFwcDwvc3Bhbj48L2E+PC9oMT48cD5JbiBvcmRlciB0byBkZWJ1ZyBhIG1pc28gYXBwLCAob3IgYW55IGlzb21vcnBoaWMgSmF2YVNjcmlwdCBhcHAgZm9yIHRoYXQgbWF0dGVyKSwgeW91JiMzOTtsbCBuZWVkIHRvIGJlIGFibGUgdG8gZGVidWcgb24gYm90aCB0aGUgY2xpZW50IGFuZCB0aGUgc2VydmVyLiBIZXJlIHdlIHdpbGwgZGVtb25zdHJhdGUgZGVidWdnaW5nIHRoZSBjbGllbnQtc2lkZSBjb2RlIHVzaW5nIENocm9tZSwgYW5kIHRoZSBzZXJ2ZXIgY29kZSB1c2luZyBKZXRCcmFpbnMgV2ViU3Rvcm0gOS4gTWlzbyBjYW4gYWN0dWFsbHkgYmUgZGVidWdnZWQgdXNpbmcgYW55IHN0YW5kYXJkIG5vZGUgYW5kIGNsaWVudC1zaWRlIGRlYnVnZ2luZyB0b29scyB0aGF0IHN1cHBvcnQgc291cmNlIG1hcHMuPC9wPlxcbjxwPkluIHRoaXMgZXhhbXBsZSB3ZSYjMzk7cmUgZ29pbmcgdG8gZGVidWcgdGhlIGV4YW1wbGUgPGNvZGU+dG9kb3M8L2NvZGU+IGFwcCwgc28gYmUgc3VyZSB5b3Uga25vdyBob3cgaXQgd29ya3MsIGFuZCB5b3Uga25vdyBob3cgdG8gaW5zdGFsbCBpdCAtIGlmIHlvdSBkb24mIzM5O3Qga25vdyBob3csIHBsZWFzZSByZWFkIHRoZSA8YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAubWRcXFwiPnRvZG9zIGFwcCB0dXRvcmlhbDwvYT4gZmlyc3QuPC9wPlxcbjxibG9ja3F1b3RlPlxcbk9uZSB0aGluZyB0byBrZWVwIGluIG1pbmQgaXMgaG93IG1pc28gd29ya3M6IGl0IGlzIGlzb21vcnBoaWMgd2hpY2ggbWVhbnMgdGhhdCB0aGUgY29kZSB3ZSBoYXZlIGlzIGFibGUgdG8gcnVuIGJvdGggc2VydmVyIGFuZCBjbGllbnQgc2lkZS4gT2YgY291cnNlIGl0IGRvZXNuJiMzOTt0IGFsd2F5cyBydW4gb24gYm90aCBzaWRlcywgc28gaGVyZSBpcyBhIGhhbmR5IGxpdHRsZSB0YWJsZSB0byBleHBsYWluIHdoYXQgdHlwaWNhbGx5IHJ1bnMgd2hlcmUgYW5kIHdoZW4sIGZvciB0aGUgdG9kb3MgZXhhbXBsZTpcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkZpbGU8L3RoPlxcbjx0aD5hY3Rpb248L3RoPlxcbjx0aD5TZXJ2ZXI8L3RoPlxcbjx0aD5DbGllbnQ8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD4vbXZjL3RvZG8uanM8L3RkPlxcbjx0ZD5pbmRleDwvdGQ+XFxuPHRkPlJ1bnMgd2hlbiBhIGJyb3dzZXIgbG9hZHMgdXAgPGNvZGU+L3RvZG9zPC9jb2RlPjwvdGQ+XFxuPHRkPlJ1bnMgd2hlbiB5b3UgaW50ZXJhY3Qgd2l0aCBhbnl0aGluZzwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIuYXBpLmpzPC90ZD5cXG48dGQ+ZmluZDwvdGQ+XFxuPHRkPlJ1bnMgd2hlbiBpbmRleCBpcyBydW4gZWl0aGVyIHNlcnZlciAoZGlyZWN0bHkpIG9yIGNsaWVudCBzaWRlICh0aHJvdWdoIHRoZSBhcGkpPC90ZD5cXG48dGQ+TmV2ZXIgcnVucyBvbiB0aGUgY2xpZW50IC0gYW4gYWpheCByZXF1ZXN0IGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGJ5IG1pc288L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlRob3NlIGFyZSB0aGUgb25seSBmaWxlcyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0b2RvcyBleGFtcGxlLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiY2xpZW50LXNpZGUtbWlzby1kZWJ1Z2dpbmdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjbGllbnQtc2lkZS1taXNvLWRlYnVnZ2luZ1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5DbGllbnQtc2lkZSBtaXNvIGRlYnVnZ2luZzwvc3Bhbj48L2E+PC9oMj48cD5GaXJzdGx5IGxldCB1cyBtYWtlIHN1cmUgdGhhdCB3ZSYjMzk7dmUgY29uZmlndXJlZCBDaHJvbWUgY29ycmVjdGx5OjwvcD5cXG48dWw+XFxuPGxpPk9wZW4gdGhlIGRldiB0b29scyAoQ01EICsgQUxUICsgSiBvbiBNYWMsIEYxMiBvbiBQQyk8L2xpPlxcbjxsaT5DbGljayB0aGUgc2V0dGluZyBjb2cgPC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL2Nocm9tZV9jb2cuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSBjb2dcXFwiPjwvcD5cXG48dWw+XFxuPGxpPlNjcm9sbCBkb3duIHRvIHRoZSAmcXVvdDtTb3VyY2VzJnF1b3Q7IHNlY3Rpb248L2xpPlxcbjxsaT5NYWtlIHN1cmUgdGhhdCAmcXVvdDtFbmFibGUgSmF2YVNjcmlwdCBzb3VyY2UgbWFwcyZxdW90OyBpcyB0aWNrZWQgYW5kIGNsb3NlIHRoZSBzZXR0aW5ncy48L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX3NldHRpbmdzLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+Tm93IENocm9tZSBpcyByZWFkeSB0byBpbnRlcmFjdCB3aXRoIG1pc28uIE5leHQgcnVuIHRoZSBtaXNvIHRvZG8gYXBwIGluIGRldmVsb3BtZW50IG1vZGUgLSBpLmUuIGluIHRoZSBkaXJlY3RvcnkgeW91IHNldHVwIG1pc28sIHJ1biB0aGUgZm9sbG93aW5nOjwvcD5cXG48cHJlPjxjb2RlPm1pc28gcnVuXFxuPC9jb2RlPjwvcHJlPjxwPldoZW4geW91JiMzOTtyZSB1cCBhbmQgcnVubmluZywgZ28gdG8gdGhlIHRvZG9zIFVSTCwgaWYgZXZlcnl0aGluZyBpcyBzZXR1cCB3aXRoIGRlZmF1bHRzLCBpdCB3aWxsIGJlOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL3RvZG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvdG9kb3M8L2E+PC9wPlxcbjxwPk5leHQgb3BlbiB0aGUgZGV2IHRvb2xzIGluIENocm9tZSBhbmQ6PC9wPlxcbjx1bD5cXG48bGk+Q2xpY2sgdGhlICZxdW90O1NvdXJjZXMmcXVvdDsgdGFiPC9saT5cXG48bGk+T3BlbiB0aGUgJnF1b3Q7bXZjJnF1b3Q7IGZvbGRlcjwvbGk+XFxuPGxpPkNsaWNrIG9uIHRoZSAmcXVvdDt0b2RvLmpzJnF1b3Q7IGZpbGU8L2xpPlxcbjwvdWw+XFxuPHA+WW91IHNob3VsZCBub3cgc2VlIGEgdG9kby5qcyBmaWxlIGluIHRoZSByaWdodC1oYW5kIHBhbmU8L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX3NvdXJjZV90b2Rvcy5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjx1bD5cXG48bGk+U2Nyb2xsIGRvd24gdG8gdGhlIGxhc3QgbGluZSBpbnNpZGUgdGhlIDxjb2RlPmFkZFRvZG88L2NvZGU+IG1ldGhvZDwvbGk+XFxuPGxpPkNsaWNrIG9uIHRoZSBsaW5lLW51bWJlciBuZXh0IHRvIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIHNldCBhIGJyZWFrcG9pbnQ8L2xpPlxcbjwvdWw+XFxuPHA+WW91IHNob3VsZCBub3cgc2VlIGEgbWFyayBuZXh0IHRvIHRoZSBsaW5lLCBhbmQgYSBicmVha3BvaW50IGluIHRoZSBsaXN0IG9mIGJyZWFrcG9pbnRzLjwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfYnJlYWtwb2ludC5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPk5vdyB3ZSB3YW50IHRvIHRyeSBhbmQgdHJpZ2dlciB0aGF0IGJyZWFrcG9pbnQ6PC9wPlxcbjx1bD5cXG48bGk+RW50ZXIgYSB2YWx1ZSBpbiB0aGUgJnF1b3Q7QWRkIHRvZG8mcXVvdDsgYm94PC9saT5cXG48bGk+Q2xpY2sgdGhlICZxdW90O0FkZCZxdW90OyBidXR0b248L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvbWlzb190b2Rvc19hZGQuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5Zb3Ugc2hvdWxkIG5vdyBzZWUgdGhlIGJyZWFrcG9pbnQgaW4gYWN0aW9uLCBjb21wbGV0ZSB3aXRoIHlvdXIgdmFsdWUgaW4gdGhlIGxvY2FsIHNjb3BlLjwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfYnJlYWtwb2ludF9hY3RpdmUuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5BbmQgdGhhdCYjMzk7cyBpdCBmb3IgY2xpZW50LXNpZGUgZGVidWdnaW5nIC0geW91IGNhbiBub3cgdXNlIHRoZSBDaHJvbWUgZGVidWdnZXIgdG8gaW5zcGVjdCBhbmQgbWFuaXB1bGF0ZSB2YWx1ZXMsIGV0Yy4uLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwic2VydmVyLXNpZGUtbWlzby1kZWJ1Z2dpbmdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzZXJ2ZXItc2lkZS1taXNvLWRlYnVnZ2luZ1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5TZXJ2ZXItc2lkZSBtaXNvIGRlYnVnZ2luZzwvc3Bhbj48L2E+PC9oMj48YmxvY2txdW90ZT5cXG5Ob3RlOiBQbGVhc2UgY2xlYXIgYW55IGJyZWFrcG9pbnQgeW91IG1pZ2h0IGhhdmUgc2V0IGluIENocm9tZSwgc28gaXQgd29uJiMzOTt0IGludGVyZmVyZSB3aXRoIG91ciBzZXJ2ZXItc2lkZSBkZWJ1Z2dpbmcgc2Vzc2lvbiAtIG9mIGNvdXJzZSB5b3UgY2FuIHVzZSBib3RoIHRvZ2V0aGVyLCBidXQgZm9yIG5vdyBsZXQgdXMgY2xlYXIgdGhlbSwgYW5kIGFsc28gc3RvcCB0aGUgbWlzbyBzZXJ2ZXIsIGlmIGl0IGlzIHN0aWxsIHJ1bm5pbmcsIGFzIHdlIHdpbGwgZ2V0IFdlYlN0b3JtIHRvIGhhbmRsZSBpdCBmb3IgdXMuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwPkluIHRoaXMgZXhhbXBsZSB3ZSYjMzk7cmUgZ29pbmcgdG8gdXNlIDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5XZWJTdG9ybTwvYT4gLSB5b3UgY2FuIHVzZSBhbnkgSURFIHRoYXQgc3VwcG9ydHMgbm9kZSBkZWJ1Z2dpbmcsIG9yIGZyZWUgdG9vbHMgc3VjaCBhcyA8YSBocmVmPVxcXCIvZG9jL25vZGUtaW5zcGVjdG9yLm1kXFxcIj5ub2RlLWluc3BlY3RvcjwvYT4sIHNvIHRoaXMgaXMgc2ltcGx5IGZvciBpbGx1c3RyYXRpdmUgcHVycG9zZXMuPC9wPlxcbjxwPkZpcnN0IHdlIG5lZWQgdG8gc2V0dXAgb3VyIHByb2plY3QsIHNvIGluIFdlYnN0b3JtOjwvcD5cXG48dWw+XFxuPGxpPkNyZWF0ZSBhIG5ldyBwcm9qZWN0LCBzZXR0aW5nIHlvdXIgbWlzbyBkaXJlY3RvcnkgYXMgdGhlIHJvb3QuPC9saT5cXG48bGk+QWRkIGEgbmV3IG5vZGUgcHJvamVjdCBjb25maWd1cmF0aW9uLCB3aXRoIHRoZSBmb2xsb3dpbmcgc2V0dGluZ3M6PC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2NvbmZpZ3VyZV9wcm9qZWN0LmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHVsPlxcbjxsaT5Ob3cgaGl0IHRoZSBkZWJ1ZyBidXR0b248L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvd2Vic3Rvcm1fZGVidWdfYnV0dG9uLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+WW91IHNob3VsZCBzZWUgbWlzbyBydW5uaW5nIGluIHRoZSBXZWJTdG9ybSBjb25zb2xlIGxpa2Ugc286PC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2NvbnNvbGUuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48dWw+XFxuPGxpPk5vdyBvcGVuIDxjb2RlPi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvZmxhdGZpbGVkYi5hcGkuanM8L2NvZGU+LCBhbmQgcHV0IGEgYnJlYWtwb2ludCBvbiB0aGUgbGFzdCBsaW5lIG9mIHRoZSA8Y29kZT5maW5kPC9jb2RlPiBtZXRob2QuPC9saT5cXG48L3VsPlxcbjxwPk5vdyBpZiB5b3UgZ28gYmFjayB0byB5b3VyIGJyb3dzZXIgdG9kb3MgYXBwOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL3RvZG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvdG9kb3M8L2E+PC9wPlxcbjxwPlJlbG9hZCB0aGUgcGFnZSwgYW5kIHlvdSB3aWxsIHNlZSB0aGUgYnJlYWtwb2ludCBiZWluZyBhY3RpdmF0ZWQgaW4gV2ViU3Rvcm06PC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2JyZWFrcG9pbnRfYWN0aXZlLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+Tm93IGNsaWNrIHRoZSAmcXVvdDtyZXN1bWUgcHJvZ3JhbSBidXR0b24mcXVvdDssIGFuZCB5b3UmIzM5O2xsIHNlZSB0aGF0IHRoZSBicmVha3BvaW50IGl0IGlzIGltbWVkaWF0ZWx5IGludm9rZWQgYWdhaW4hIDwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy93ZWJzdG9ybV9icmVha3BvaW50X2RhdGEuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5UaGlzIGlzIHNpbXBseSBiZWNhdXNlIG1pc28gcmVuZGVycyB0aGUgZmlyc3QgcGFnZSBvbiB0aGUgc2VydmVyIC0gc28gZGVwZW5kaW5nIG9uIGhvdyB5b3Ugc3RydWN0dXJlIHlvdXIgcXVlcmllcywgaXQgd2lsbCB1c2UgdGhlIEFQSSB0d2ljZSAtIG9uY2UgZnJvbSB0aGUgc2VydmVyIHNpZGUgcmVuZGVyaW5nLCBhbmQgb25jZSBmcm9tIHRoZSBjbGllbnQtc2lkZS4gRG9uJiMzOTt0IHdvcnJ5IC0gdGhpcyBvbmx5IGhhcHBlbnMgb24gaW5pdGlhbCBwYWdlIGxvYWQgaW4gb3JkZXIgdG8gcmVuZGVyIHRoZSBmaXJzdCBwYWdlIGJvdGggc2VydmVyIHNpZGUgYW5kIGNsaWVudCBzaWRlLCB5b3UgY2FuIHJlYWQgbW9yZSBhYm91dCBob3cgdGhhdCB3b3JrcyBoZXJlOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzI2ZpcnN0LXBhZ2UtbG9hZC5tZFxcXCI+SG93IG1pc28gd29ya3M6IEZpcnN0IHBhZ2UgbG9hZDwvYT48L3A+XFxuPHA+U28sIHlvdSBhcmUgbm93IGFibGUgdG8gaW5zcGVjdCB0aGUgdmFsdWVzLCBhbmQgZG8gYW55IGtpbmQgb2Ygc2VydmVyIHNpZGUgZGVidWdnaW5nIHlvdSBsaWtlLjwvcD5cXG5cIixcIkdldHRpbmctc3RhcnRlZC5tZFwiOlwiPHA+VGhpcyBndWlkZSB3aWxsIHRha2UgeW91IHRocm91Z2ggbWFraW5nIHlvdXIgZmlyc3QgbWlzbyBhcHAsIGl0IGlzIGFzc3VtZWQgdGhhdCB5b3Uga25vdyB0aGUgYmFzaWNzIG9mIGhvdyB0byB1c2Ugbm9kZWpzIGFuZCBtaXRocmlsLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiaW5zdGFsbGF0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaW5zdGFsbGF0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkluc3RhbGxhdGlvbjwvc3Bhbj48L2E+PC9oMj48cD5UbyBpbnN0YWxsIG1pc28sIHVzZSBucG06PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bnBtIGluc3RhbGwgbWlzb2pzIC1nXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRvIGNyZWF0ZSBhbmQgcnVuIGEgbWlzbyBhcHAgaW4gYSBuZXcgZGlyZWN0b3J5OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1pc28gLW4gbXlhcHBcXG5jZCBteWFwcFxcbm1pc28gcnVuXFxuPC9jb2RlPjwvcHJlPlxcbjxwPllvdSBzaG91bGQgbm93IHNlZSBzb21ldGhpbmcgbGlrZTo8L3A+XFxuPHByZT48Y29kZT5NaXNvIGlzIGxpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OjY0NzYgaW4gZGV2ZWxvcG1lbnQgbW9kZVxcbjwvY29kZT48L3ByZT48cD5PcGVuIHlvdXIgYnJvd3NlciBhdCA8Y29kZT5odHRwOi8vbG9jYWxob3N0OjY0NzY8L2NvZGU+IGFuZCB5b3Ugd2lsbCBzZWUgdGhlIGRlZmF1bHQgbWlzbyBzY3JlZW48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImhlbGxvLXdvcmxkLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2hlbGxvLXdvcmxkLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5IZWxsbyB3b3JsZCBhcHA8L3NwYW4+PC9hPjwvaDI+PHA+Q3JlYXRlIGEgbmV3IGZpbGUgPGNvZGU+aGVsbG8uanM8L2NvZGU+IGluIDxjb2RlPm15YXBwL212YzwvY29kZT4gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IHdob30pO1xcbiAgICAgICAgcmV0dXJuIHRoaXM7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIERJVigmcXVvdDtIZWxsbyAmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZW4gb3BlbiA8YSBocmVmPVxcXCIvZG9jL1lPVVJOQU1FLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvaGVsbG8vWU9VUk5BTUU8L2E+IGFuZCB5b3Ugc2hvdWxkIHNlZSAmcXVvdDtIZWxsbyBZT1VSTkFNRSZxdW90Oy4gQ2hhbmdlIHRoZSB1cmwgdG8gaGF2ZSB5b3VyIGFjdHVhbCBuYW1lIGluc3RlYWQgb2YgWU9VUk5BTUUsIHlvdSBub3cga25vdyBtaXNvIDopPC9wPlxcbjxwPkxldCB1cyB0YWtlIGEgbG9vayBhdCB3aGF0IGVhY2ggcGllY2Ugb2YgdGhlIGNvZGUgaXMgYWN0dWFsbHkgZG9pbmc6PC9wPlxcbjxoMz48YSBuYW1lPVxcXCJpbmNsdWRlc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2luY2x1ZGVzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkluY2x1ZGVzPC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IE1pdGhyaWwgaXMgdGhlIG9ubHkgcmVxdWlyZWQgbGlicmFyeSB3aGVuIGFwcHMsIGJ1dCB1c2luZyBvdGhlciBpbmNsdWRlZCBsaWJyYXJpZXMgaXMgdmVyeSB1c2VmdWxcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+SGVyZSB3ZSBncmFiIG1pdGhyaWwsIHRoZW4gbWlzbyB1dGlsaXRpZXMgYW5kIHN1Z2FyIHRhZ3MgLSB0ZWNobmljYWxseSBzcGVha2luZywgd2UgcmVhbGx5IG9ubHkgbmVlZCBtaXRocmlsLCBidXQgdGhlIG90aGVyIGxpYnJhcmllcyBhcmUgdmVyeSB1c2VmdWwgYXMgd2VsbCBhcyB3ZSB3aWxsIHNlZS48L3A+XFxuPGgzPjxhIG5hbWU9XFxcIm1vZGVsc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI21vZGVsc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Nb2RlbHM8L3NwYW4+PC9hPjwvaDM+PGJsb2NrcXVvdGU+XFxuU3VtbWFyeTogVXNlIHRoZSBhdXRvbWF0aWMgcm91dGluZyB3aGVuIHlvdSBjYW4sIGFsd2F5cyBwdXQgbW9kZWxzIG9uIHRoZSAmIzM5O21vZGVscyYjMzk7IGF0dHJpYnV0ZSBvZiB5b3VyIG12YyBmaWxlXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkhlcmUgYSBmZXcgaW1wb3J0YW50IHRoaW5ncyBhcmUgZ29pbmcgb246PC9wPlxcbjx1bD5cXG48bGk+PHA+QnkgcGxhY2luZyBvdXIgPGNvZGU+bXZjPC9jb2RlPiBvYmplY3Qgb24gPGNvZGU+bW9kdWxlLmV4cG9ydHMuZWRpdDwvY29kZT4sIGF1dG9tYXRpYyByb3V0aW5nIGlzIGFwcGxpZWQgYnkgbWlzbyAtIHlvdSBjYW4gcmVhZCBtb3JlIGFib3V0IDxhIGhyZWY9XFxcIi9kb2MvSG93LW1pc28td29ya3Mjcm91dGUtYnktY29udmVudGlvbi5tZFxcXCI+aG93IHRoZSBhdXRvbWF0aWMgcm91dGluZyB3b3JrcyBoZXJlPC9hPi4gPC9wPlxcbjwvbGk+XFxuPGxpPjxwPlBsYWNpbmcgb3VyIDxjb2RlPmhlbGxvPC9jb2RlPiBtb2RlbCBvbiB0aGUgPGNvZGU+bW9kZWxzPC9jb2RlPiBhdHRyaWJ1dGUgb2YgdGhlIG9iamVjdCBlbnN1cmVzIHRoYXQgbWlzbyBjYW4gZmlndXJlIG91dCB3aGF0IHlvdXIgbW9kZWxzIGFyZSwgYW5kIHdpbGwgY3JlYXRlIGEgcGVyc2lzdGVuY2UgQVBJIGF1dG9tYXRpY2FsbHkgZm9yIHlvdSB3aGVuIHRoZSBzZXJ2ZXIgc3RhcnRzIHVwLCBzbyB0aGF0IHlvdSBjYW4gc2F2ZSB5b3VyIG1vZGVscyBpbnRvIHRoZSBkYXRhYmFzZS48L3A+XFxuPC9saT5cXG48L3VsPlxcbjxoMz48YSBuYW1lPVxcXCJjb250cm9sbGVyXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY29udHJvbGxlclxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Db250cm9sbGVyPC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IERPIE5PVCBmb3JnZXQgdG8gJiMzOTtyZXR1cm4gdGhpczsmIzM5OyBpbiB0aGUgY29udHJvbGxlciwgaXQgaXMgdml0YWwhXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgIHZhciB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7aGVsbG9faWQmIzM5OywgcGFyYW1zKTtcXG4gICAgdGhpcy5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgcmV0dXJuIHRoaXM7XFxufSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIGNvbnRyb2xsZXIgdXNlcyA8Y29kZT5taXNvLmdldFBhcmFtPC9jb2RlPiB0byByZXRyZWl2ZSB0aGUgcGFyYW1ldGVyIC0gdGhpcyBpcyBzbyB0aGF0IGl0IGNhbiB3b3JrIHNlYW1sZXNzbHkgb24gYm90aCB0aGUgc2VydmVyIGFuZCBjbGllbnQgc2lkZS4gV2UgY3JlYXRlIGEgbmV3IG1vZGVsLCBhbmQgdmVyeSBpbXBvcnRhbnRseSA8Y29kZT5yZXR1cm4gdGhpczwvY29kZT4gZW5zdXJlcyB0aGF0IG1pc28gY2FuIGdldCBhY2Nlc3MgdG8gdGhlIGNvbnRyb2xsZXIgY29ycmVjdGx5LjwvcD5cXG48aDM+PGEgbmFtZT1cXFwidmlld1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3ZpZXdcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Vmlldzwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBVc2Ugc3VnYXJ0YWdzIHRvIG1ha2UgdGhlIHZpZXcgbG9vayBtb3JlIGxpa2UgSFRNTFxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgIHJldHVybiBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSk7XFxuICAgIH1cXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZSB2aWV3IGlzIHNpbXBseSBhIGphdmFzY3JpcHQgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RydWN0dXJlLiBIZXJlIHdlIHVzZSB0aGUgPGNvZGU+c3VnYXJ0YWdzPC9jb2RlPiBsaWJyYXJ5IHRvIHJlbmRlciB0aGUgRElWIHRhZyAtIHRoaXMgaXMgc3RyaWN0bHkgbm90IHJlcXVpcmVkLCBidXQgSSBmaW5kIHRoYXQgcGVvcGxlIHRlbmQgdG8gdW5kZXJzdGFuZCB0aGUgc3VnYXJ0YWdzIHN5bnRheCBiZXR0ZXIgdGhhbiBwdXJlIG1pdGhyaWwsIGFzIGl0IGxvb2tzIGEgbGl0dGxlIG1vcmUgbGlrZSBIVE1MLCB0aG91Z2ggb2YgY291cnNlIHlvdSBjb3VsZCB1c2Ugc3RhbmRhcmQgbWl0aHJpbCBzeW50YXggaWYgeW91IHByZWZlci48L3A+XFxuPGgzPjxhIG5hbWU9XFxcIm5leHRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNuZXh0XFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk5leHQ8L3NwYW4+PC9hPjwvaDM+PHA+WW91IG5vdyBoYXZlIGEgY29tcGxldGUgaGVsbG8gd29ybGQgYXBwLCBhbmQgdW5kZXJzdGFuZCB0aGUgZnVuZGFtZW50YWxzIG9mIHRoZSBzdHJ1Y3R1cmUgb2YgYSBtaXNvIG12YyBhcHBsaWNhdGlvbi48L3A+XFxuPHA+V2UgaGF2ZSBvbmx5IGp1c3Qgc2NyYXBlZCB0aGUgc3VyZmFjZSBvZiB3aGF0IG1pc28gaXMgY2FwYWJsZSBvZiwgc28gbmV4dCB3ZSByZWNvbW1lbmQgeW91IHJlYWQ6PC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC5tZFxcXCI+Q3JlYXRpbmcgYSB0b2RvIGFwcDwvYT48L3A+XFxuXCIsXCJHb2Fscy5tZFwiOlwiPGgxPjxhIG5hbWU9XFxcInByaW1hcnktZ29hbHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNwcmltYXJ5LWdvYWxzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlByaW1hcnkgZ29hbHM8L3NwYW4+PC9hPjwvaDE+PHVsPlxcbjxsaT5FYXN5IHNldHVwIG9mIDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5pc29tb3JwaGljPC9hPiBhcHBsaWNhdGlvbiBiYXNlZCBvbiA8YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuanMubWRcXFwiPm1pdGhyaWw8L2E+PC9saT5cXG48bGk+U2tlbGV0b24gLyBzY2FmZm9sZCAvIEJvaWxlcnBsYXRlIHRvIGFsbG93IHVzZXJzIHRvIHZlcnkgcXVpY2tseSBnZXQgdXAgYW5kIHJ1bm5pbmcuPC9saT5cXG48bGk+bWluaW1hbCBjb3JlPC9saT5cXG48bGk+ZWFzeSBleHRlbmRpYmxlPC9saT5cXG48bGk+REIgYWdub3N0aWMgKGUuIEcuIHBsdWdpbnMgZm9yIGRpZmZlcmVudCBPUk0vT0RNKTwvbGk+XFxuPC91bD5cXG48aDE+PGEgbmFtZT1cXFwiY29tcG9uZW50c1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NvbXBvbmVudHNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q29tcG9uZW50czwvc3Bhbj48L2E+PC9oMT48dWw+XFxuPGxpPlJvdXRpbmc8L2xpPlxcbjxsaT5WaWV3IHJlbmRlcmluZzwvbGk+XFxuPGxpPmkxOG4vbDEwbjwvbGk+XFxuPGxpPlJlc3QtQVBJIChjb3VsZCB1c2UgcmVzdGlmeTogPGEgaHJlZj1cXFwiL2RvYy8ubWRcXFwiPmh0dHA6Ly9tY2F2YWdlLm1lL25vZGUtcmVzdGlmeS88L2E+KTwvbGk+XFxuPGxpPm9wdGlvbmFsIFdlYnNvY2tldHMgKGNvdWxkIHVzZSByZXN0aWZ5OiA8YSBocmVmPVxcXCIvZG9jLy5tZFxcXCI+aHR0cDovL21jYXZhZ2UubWUvbm9kZS1yZXN0aWZ5LzwvYT4pPC9saT5cXG48bGk+ZWFzeSB0ZXN0aW5nIChoZWFkbGVzcyBhbmQgQnJvd3Nlci1UZXN0cyk8L2xpPlxcbjxsaT5sb2dpbi9zZXNzaW9uIGhhbmRsaW5nPC9saT5cXG48bGk+bW9kZWxzIHdpdGggdmFsaWRhdGlvbjwvbGk+XFxuPC91bD5cXG48aDE+PGEgbmFtZT1cXFwidXNlZnVsLWxpYnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN1c2VmdWwtbGlic1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Vc2VmdWwgbGliczwvc3Bhbj48L2E+PC9oMT48cD5IZXJlIGFyZSBzb21lIGxpYnJhcmllcyB3ZSBhcmUgY29uc2lkZXJpbmcgdXNpbmcsIChpbiBubyBwYXJ0aWN1bGFyIG9yZGVyKTo8L3A+XFxuPHVsPlxcbjxsaT5sZXZlbGRiPC9saT5cXG48bGk+bWl0aHJpbC1xdWVyeTwvbGk+XFxuPGxpPnRyYW5zbGF0ZS5qczwvbGk+XFxuPGxpPmkxOG5leHQ8L2xpPlxcbjwvdWw+XFxuPHA+QW5kIHNvbWUgdGhhdCB3ZSYjMzk7cmUgYWxyZWFkeSB1c2luZzo8L3A+XFxuPHVsPlxcbjxsaT5leHByZXNzPC9saT5cXG48bGk+YnJvd3NlcmlmeTwvbGk+XFxuPGxpPm1vY2hhL2V4cGVjdDwvbGk+XFxuPGxpPm1pdGhyaWwtbm9kZS1yZW5kZXI8L2xpPlxcbjxsaT5taXRocmlsLXN1Z2FydGFnczwvbGk+XFxuPGxpPm1pdGhyaWwtYmluZGluZ3M8L2xpPlxcbjxsaT5taXRocmlsLWFuaW1hdGU8L2xpPlxcbjxsaT5sb2Rhc2g8L2xpPlxcbjxsaT52YWxpZGF0b3I8L2xpPlxcbjwvdWw+XFxuXCIsXCJIb21lLm1kXCI6XCI8cD5XZWxjb21lIHRvIHRoZSBtaXNvanMgd2lraSE8L3A+XFxuPGgyPjxhIG5hbWU9XFxcImdldHRpbmctc3RhcnRlZFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2dldHRpbmctc3RhcnRlZFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5HZXR0aW5nIHN0YXJ0ZWQ8L3NwYW4+PC9hPjwvaDI+PHA+UmVhZCB0aGUgPGEgaHJlZj1cXFwiL2RvYy9HZXR0aW5nLXN0YXJ0ZWQubWRcXFwiPkdldHRpbmcgc3RhcnRlZDwvYT4gZ3VpZGUhPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJtb3JlLWluZm9cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtb3JlLWluZm9cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TW9yZSBpbmZvPC9zcGFuPjwvYT48L2gyPjxwPlNlZSB0aGUgPGEgaHJlZj1cXFwiL2RvYy9taXNvanMjaW5zdGFsbC5tZFxcXCI+aW5zdGFsbCBndWlkZTwvYT4uXFxuUmVhZCA8YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzLm1kXFxcIj5ob3cgbWlzbyB3b3JrczwvYT4sIGFuZCBjaGVjayBvdXQgPGEgaHJlZj1cXFwiL2RvYy9QYXR0ZXJucy5tZFxcXCI+dGhlIHBhdHRlcm5zPC9hPiwgdGhlbiBjcmVhdGUgc29tZXRoaW5nIGNvb2whPC9wPlxcblwiLFwiSG93LW1pc28td29ya3MubWRcIjpcIjxoMj48YSBuYW1lPVxcXCJtb2RlbHMtdmlld3MtY29udHJvbGxlcnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtb2RlbHMtdmlld3MtY29udHJvbGxlcnNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TW9kZWxzLCB2aWV3cywgY29udHJvbGxlcnM8L3NwYW4+PC9hPjwvaDI+PHA+V2hlbiBjcmVhdGluZyBhIHJvdXRlLCB5b3UgbXVzdCBhc3NpZ24gYSBjb250cm9sbGVyIGFuZCBhIHZpZXcgdG8gaXQgLSB0aGlzIGlzIGFjaGlldmVkIGJ5IGNyZWF0aW5nIGEgZmlsZSBpbiB0aGUgPGNvZGU+L212YzwvY29kZT4gZGlyZWN0b3J5IC0gYnkgY29udmVudGlvbiwgeW91IHNob3VsZCBuYW1lIGl0IGFzIHBlciB0aGUgcGF0aCB5b3Ugd2FudCwgKHNlZSB0aGUgPGEgaHJlZj1cXFwiL2RvYy8jcm91dGluZy5tZFxcXCI+cm91dGluZyBzZWN0aW9uPC9hPiBmb3IgZGV0YWlscykuPC9wPlxcbjxwPkhlcmUgaXMgYSBtaW5pbWFsIGV4YW1wbGUgdXNpbmcgdGhlIHN1Z2FydGFncywgYW5kIGdldHRpbmcgYSBwYXJhbWV0ZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuc3VnYXJ0YWdzLm5vZGUuanMmIzM5OykobSk7XFxuXFxubW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdGhpcy53aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7d2hvJiMzOTssIHBhcmFtcywgJiMzOTt3b3JsZCYjMzk7KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIERJVigmIzM5O0hlbGxvICYjMzk7ICsgY3RybC53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+U2F2ZSB0aGlzIGludG8gYSBmaWxlIDxjb2RlPi9tdmMvaGVsbG8uanM8L2NvZGU+LCBhbmQgb3BlbiA8YSBocmVmPVxcXCIvZG9jL2hlbGxvcy5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdC9oZWxsb3M8L2E+LCB0aGlzIHdpbGwgc2hvdyAmcXVvdDtIZWxsbyB3b3JsZCZxdW90Oy4gTm90ZSB0aGUgJiMzOTtzJiMzOTsgb24gdGhlIGVuZCAtIHRoaXMgaXMgZHVlIHRvIGhvdyB0aGUgPGEgaHJlZj1cXFwiL2RvYy8jcm91dGUtYnktY29udmVudGlvbi5tZFxcXCI+cm91dGUgYnkgY29udmVudGlvbjwvYT4gd29ya3MuPC9wPlxcbjxwPk5vdyBvcGVuIDxjb2RlPi9jZmcvcm91dGVzLmpzb248L2NvZGU+LCBhbmQgYWRkIHRoZSBmb2xsb3dpbmcgcm91dGVzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPiAgICAmcXVvdDsvaGVsbG8mcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtnZXQmcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O2hlbGxvJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH0sXFxuICAgICZxdW90Oy9oZWxsby86d2hvJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtoZWxsbyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNhdmUgdGhlIGZpbGUsIGFuZCBnbyBiYWNrIHRvIHRoZSBicm93c2VyLCBhbmQgeW91JiMzOTtsbCBzZWUgYW4gZXJyb3IhIFRoaXMgaXMgYmVjYXVzZSB3ZSBoYXZlIG5vdyBvdmVycmlkZGVuIHRoZSBhdXRvbWF0aWMgcm91dGUuIE9wZW4gPGEgaHJlZj1cXFwiL2RvYy9oZWxsby5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdC9oZWxsbzwvYT4sIGFuZCB5b3UmIzM5O2xsIHNlZSBvdXIgYWN0aW9uLiBOb3cgb3BlbiA8YSBocmVmPVxcXCIvZG9jL1lPVVJOQU1FLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0L2hlbGxvL1lPVVJOQU1FPC9hPiwgYW5kIHlvdSYjMzk7bGwgc2VlIGl0IGdldHRpbmcgdGhlIGZpcnN0IHBhcmFtZXRlciwgYW5kIGdyZWV0aW5nIHlvdSE8L3A+XFxuPGgyPjxhIG5hbWU9XFxcInJvdXRpbmdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyb3V0aW5nXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJvdXRpbmc8L3NwYW4+PC9hPjwvaDI+PHA+VGhlIHJvdXRpbmcgY2FuIGJlIGRlZmluZWQgaW4gb25lIG9mIHR3byB3YXlzPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJyb3V0ZS1ieS1jb252ZW50aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGUtYnktY29udmVudGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0ZSBieSBjb252ZW50aW9uPC9zcGFuPjwvYT48L2gzPjxwPllvdSBjYW4gdXNlIGEgbmFtaW5nIGNvbnZlbnRpb24gYXMgZm9sbG93czo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkFjdGlvbjwvdGg+XFxuPHRoPk1ldGhvZDwvdGg+XFxuPHRoPlVSTDwvdGg+XFxuPHRoPkRlc2NyaXB0aW9uPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+aW5kZXg8L3RkPlxcbjx0ZD5HRVQ8L3RkPlxcbjx0ZD5bY29udHJvbGxlcl0gKyAmIzM5O3MmIzM5OzwvdGQ+XFxuPHRkPkxpc3QgdGhlIGl0ZW1zPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+ZWRpdDwvdGQ+XFxuPHRkPkdFVDwvdGQ+XFxuPHRkPltjb250cm9sbGVyXS9baWRdPC90ZD5cXG48dGQ+RGlzcGxheSBhIGZvcm0gdG8gZWRpdCB0aGUgaXRlbTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPm5ldzwvdGQ+XFxuPHRkPkdFVDwvdGQ+XFxuPHRkPltjb250cm9sbGVyXSArICYjMzk7cyYjMzk7ICsgJiMzOTsvbmV3JiMzOTs8L3RkPlxcbjx0ZD5EaXNwbGF5IGEgZm9ybSB0byBhZGQgYSBuZXcgaXRlbTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+U2F5IHlvdSBoYXZlIGEgbXZjIGZpbGUgbmFtZWQgJnF1b3Q7dXNlci5qcyZxdW90OywgYW5kIHlvdSBkZWZpbmUgYW4gYWN0aW9uIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7Li4uXFxuPC9jb2RlPjwvcHJlPlxcbjxwPk1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IG1hcCBhICZxdW90O0dFVCZxdW90OyB0byAmcXVvdDsvdXNlcnMmcXVvdDsuPGJyPk5vdyBzYXkgeW91IGhhdmUgYSBtdmMgZmlsZSBuYW1lZCAmcXVvdDt1c2VyLmpzJnF1b3Q7LCBhbmQgeW91IGRlZmluZSBhbiBhY3Rpb24gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5lZGl0ID0gey4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5NaXNvIHdpbGwgYXV0b21hdGljYWxseSBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gJnF1b3Q7L3VzZXIvOnVzZXJfaWQmcXVvdDssIHNvIHRoYXQgdXNlcnMgY2FuIGFjY2VzcyB2aWEgYSByb3V0ZSBzdWNoIGFzICZxdW90Oy91c2VyLzI3JnF1b3Q7IGZvciB1c2Ugd2l0aCBJRCBvZiAyNy4gPGVtPk5vdGU6PC9lbT4gWW91IGNhbiBnZXQgdGhlIHVzZXJfaWQgdXNpbmcgYSBtaXNvIHV0aWxpdHk6IDxjb2RlPnZhciB1c2VySWQgPSBtaXNvLmdldFBhcmFtKCYjMzk7dXNlcl9pZCYjMzk7LCBwYXJhbXMpOzwvY29kZT4uPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJyb3V0ZS1ieS1jb25maWd1cmF0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGUtYnktY29uZmlndXJhdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0ZSBieSBjb25maWd1cmF0aW9uPC9zcGFuPjwvYT48L2gzPjxwPkJ5IHVzaW5nIDxjb2RlPi9jZmcvcm91dGVzLmpzb248L2NvZGU+IGNvbmZpZyBmaWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPntcXG4gICAgJnF1b3Q7W1BhdHRlcm5dJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7W01ldGhvZF0mcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O1tSb3V0ZSBuYW1lXSZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtbQWN0aW9uXSZxdW90OyB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5XaGVyZTo8L3A+XFxuPHVsPlxcbjxsaT48c3Ryb25nPlBhdHRlcm48L3N0cm9uZz4gLSB0aGUgPGEgaHJlZj1cXFwiL2RvYy8jcm91dGluZy1wYXR0ZXJucy5tZFxcXCI+cm91dGUgcGF0dGVybjwvYT4gd2Ugd2FudCwgaW5jbHVkaW5nIGFueSBwYXJhbWV0ZXJzPC9saT5cXG48bGk+PHN0cm9uZz5NZXRob2Q8L3N0cm9uZz4gLSBvbmUgb2YgJiMzOTtHRVQmIzM5OywgJiMzOTtQT1NUJiMzOTssICYjMzk7UFVUJiMzOTssICYjMzk7REVMRVRFJiMzOTs8L2xpPlxcbjxsaT48c3Ryb25nPlJvdXRlPC9zdHJvbmc+IG5hbWUgLSBuYW1lIG9mIHlvdXIgcm91dGUgZmlsZSBmcm9tIC9tdmM8L2xpPlxcbjxsaT48c3Ryb25nPkFjdGlvbjwvc3Ryb25nPiAtIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBjYWxsIG9uIHlvdXIgcm91dGUgZmlsZSBmcm9tIC9tdmM8L2xpPlxcbjwvdWw+XFxuPHA+PHN0cm9uZz5FeGFtcGxlPC9zdHJvbmc+PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+e1xcbiAgICAmcXVvdDsvJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtob21lJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH1cXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gdGhlIHJvb3Qgb2YgdGhlIFVSTCBmb3IgdGhlIDxjb2RlPmluZGV4PC9jb2RlPiBhY3Rpb24gaW4gPGNvZGU+aG9tZS5qczwvY29kZT48L3A+XFxuPHA+PHN0cm9uZz5Ob3RlOjwvc3Ryb25nPiBUaGUgcm91dGluZyBjb25maWcgd2lsbCBvdmVycmlkZSBhbnkgYXV0b21hdGljYWxseSBkZWZpbmVkIHJvdXRlcywgc28gaWYgeW91IG5lZWQgbXVsdGlwbGUgcm91dGVzIHRvIHBvaW50IHRvIHRoZSBzYW1lIGFjdGlvbiwgeW91IG11c3QgbWFudWFsbHkgZGVmaW5lIHRoZW0uIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhIG12YyBmaWxlIG5hbWVkICZxdW90O3Rlcm0uanMmcXVvdDssIGFuZCB5b3UgZGVmaW5lIGFuIGFjdGlvbiBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmluZGV4ID0gey4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5NaXNvIHdpbGwgYXV0b21hdGljYWxseSBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gJnF1b3Q7L3Rlcm1zJnF1b3Q7LiBOb3csIGlmIHlvdSB3YW50IHRvIG1hcCBpdCBhbHNvIHRvICZxdW90Oy9BR0ImcXVvdDssIHlvdSB3aWxsIG5lZWQgdG8gYWRkIHR3byBlbnRyaWVzIGluIHRoZSByb3V0ZXMgY29uZmlnOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPntcXG4gICAgJnF1b3Q7L3Rlcm1zJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDt0ZXJtcyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9LFxcbiAgICAmcXVvdDsvQUdCJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDt0ZXJtcyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIGlzIGJlY2F1c2UgTWlzbyBhc3N1bWVzIHRoYXQgaWYgeW91IG92ZXJyaWRlIHRoZSBkZWZhdWx0ZWQgcm91dGVzLCB5b3UgYWN0dWFsbHkgd2FudCB0byByZXBsYWNlIHRoZW0sIG5vdCBqdXN0IG92ZXJyaWRlIHRoZW0uIDxlbT5Ob3RlOjwvZW0+IHRoaXMgaXMgY29ycmVjdCBiZWhhdmlvdXIsIGFzIGl0IG1pbm9yaXR5IGNhc2UgaXMgd2hlbiB5b3Ugd2FudCBtb3JlIHRoYW4gb25lIHJvdXRlIHBvaW50aW5nIHRvIHRoZSBzYW1lIGFjdGlvbi48L3A+XFxuPGgzPjxhIG5hbWU9XFxcInJvdXRpbmctcGF0dGVybnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyb3V0aW5nLXBhdHRlcm5zXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJvdXRpbmcgcGF0dGVybnM8L3NwYW4+PC9hPjwvaDM+PHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPlR5cGU8L3RoPlxcbjx0aD5FeGFtcGxlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+UGF0aDwvdGQ+XFxuPHRkPiZxdW90Oy9hYmNkJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlBhdGggUGF0dGVybjwvdGQ+XFxuPHRkPiZxdW90Oy9hYmM/ZCZxdW90OyAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2QgYW5kIC9hYmQ8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYWIrY2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkLCAvYWJiY2QsIC9hYmJiYmJjZCBhbmQgc28gb248L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYWIqY2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkLCAvYWJ4Y2QsIC9hYkZPT2NkLCAvYWJiQXJjZCBhbmQgc28gb248L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYShiYyk/ZCZxdW90OyAtIHdpbGwgbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWQgYW5kIC9hYmNkPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UmVndWxhciBFeHByZXNzaW9uPC90ZD5cXG48dGQ+L1xcXFwvYWJjJiMxMjQ7XFxcXC94eXovIC0gd2lsbCBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmMgYW5kIC94eXo8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5BcnJheTwvdGQ+XFxuPHRkPlsmcXVvdDsvYWJjZCZxdW90OywgJnF1b3Q7L3h5emEmcXVvdDssIC9cXFxcL2xtbiYjMTI0O1xcXFwvcHFyL10gLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkLCAveHl6YSwgL2xtbiwgYW5kIC9wcXI8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxoMz48YSBuYW1lPVxcXCJsaW5rc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2xpbmtzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkxpbmtzPC9zcGFuPjwvYT48L2gzPjxwPldoZW4geW91IGNyZWF0ZSBsaW5rcywgaW4gb3JkZXIgdG8gZ2V0IHRoZSBhcHAgdG8gd29yayBhcyBhbiBTUEEsIHlvdSBtdXN0IHBhc3MgaW4gbS5yb3V0ZSBhcyBhIGNvbmZpZywgc28gdGhhdCB0aGUgaGlzdG9yeSB3aWxsIGJlIHVwZGF0ZWQgY29ycmVjdGx5LCBmb3IgZXhhbXBsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5BKHtocmVmOiZxdW90Oy91c2Vycy9uZXcmcXVvdDssIGNvbmZpZzogbS5yb3V0ZX0sICZxdW90O0FkZCBuZXcgdXNlciZxdW90OylcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGNvcnJlY3RseSB3b3JrIGFzIGEgU1BBLiBJZiB5b3UgbGVhdmUgb3V0IDxjb2RlPmNvbmZpZzogbS5yb3V0ZTwvY29kZT4sIHRoZSBhcHAgd2lsbCBzdGlsbCB3b3JrLCBidXQgdGhlIHBhZ2Ugd2lsbCByZWxvYWQgZXZlcnkgdGltZSB0aGUgbGluayBpcyBmb2xsb3dlZC48L3A+XFxuPHA+Tm90ZTogaWYgeW91IGFyZSBwbGFubmluZyB0byBtYW51YWxseSByb3V0ZSwgaWU6IHVzZSA8Y29kZT5tLnJvdXRlPC9jb2RlPiwgYmUgc3VyZSB0byB1c2UgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLCBub3QgYSBVUkwuIEllOiBpZiB5b3UgaGF2ZSBhIHJvdXRlICZxdW90Oy9hY2NvdW50JnF1b3Q7LCB1c2luZyA8Y29kZT5tLnJvdXRlKCZxdW90O2h0dHA6Ly9wMS5pby9hY2NvdW50JnF1b3Q7KTwvY29kZT4gd29uJiMzOTt0IG1hdGNoLCBtaXRocmlsIGlzIGV4cGVjdGluZyA8Y29kZT5tLnJvdXRlKCZxdW90Oy9hY2NvdW50JnF1b3Q7KTwvY29kZT4gaW5zdGVhZCBvZiB0aGUgZnVsbCBVUkwuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJkYXRhLW1vZGVsc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2RhdGEtbW9kZWxzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkRhdGEgbW9kZWxzPC9zcGFuPjwvYT48L2gyPjxwPkRhdGEgbW9kZWxzIGFyZSBwcm9ncmVzc2l2ZWx5IGVuaGFuY2VkIG1pdGhyaWwgbW9kZWxzIC0geW91IHNpbXBseSBjcmVhdGUgeW91ciBtb2RlbCBhcyB1c3VhbCwgdGhlbiBhZGQgdmFsaWRhdGlvbiBhbmQgdHlwZSBpbmZvcm1hdGlvbiBhcyBpdCBiZWNvbWVzIHBlcnRpbmVudC5cXG5Gb3IgZXhhbXBsZSwgc2F5IHlvdSBoYXZlIGEgbW9kZWwgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgdXNlck1vZGVsID0gZnVuY3Rpb24oZGF0YSl7XFxuICAgIHRoaXMubmFtZSA9IG0ucChkYXRhLm5hbWV8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuZW1haWwgPSBtLnAoZGF0YS5lbWFpbHx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5pZCA9IG0ucChkYXRhLl9pZHx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgcmV0dXJuIHRoaXM7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5JbiBvcmRlciB0byBtYWtlIGl0IHZhbGlkYXRhYmxlLCBhZGQgdGhlIHZhbGlkYXRvciBtb2R1bGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIHZhbGlkYXRlID0gcmVxdWlyZSgmIzM5O3ZhbGlkYXRvci5tb2RlbGJpbmRlciYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlbiBhZGQgYSA8Y29kZT5pc1ZhbGlkPC9jb2RlPiB2YWxpZGF0aW9uIG1ldGhvZCB0byB5b3VyIG1vZGVsLCB3aXRoIGFueSBkZWNsYXJhdGlvbnMgYmFzZWQgb24gPGEgaHJlZj1cXFwiL2RvYy92YWxpZGF0b3IuanMjdmFsaWRhdG9ycy5tZFxcXCI+bm9kZSB2YWxpZGF0b3I8L2E+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciB1c2VyTW9kZWwgPSBmdW5jdGlvbihkYXRhKXtcXG4gICAgdGhpcy5uYW1lID0gbS5wKGRhdGEubmFtZXx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5lbWFpbCA9IG0ucChkYXRhLmVtYWlsfHwmcXVvdDsmcXVvdDspO1xcbiAgICB0aGlzLmlkID0gbS5wKGRhdGEuX2lkfHwmcXVvdDsmcXVvdDspO1xcblxcbiAgICAvLyAgICBWYWxpZGF0ZSB0aGUgbW9kZWwgICAgICAgIFxcbiAgICB0aGlzLmlzVmFsaWQgPSB2YWxpZGF0ZS5iaW5kKHRoaXMsIHtcXG4gICAgICAgIG5hbWU6IHtcXG4gICAgICAgICAgICBpc1JlcXVpcmVkOiAmcXVvdDtZb3UgbXVzdCBlbnRlciBhIG5hbWUmcXVvdDtcXG4gICAgICAgIH0sXFxuICAgICAgICBlbWFpbDoge1xcbiAgICAgICAgICAgIGlzUmVxdWlyZWQ6ICZxdW90O1lvdSBtdXN0IGVudGVyIGFuIGVtYWlsIGFkZHJlc3MmcXVvdDssXFxuICAgICAgICAgICAgaXNFbWFpbDogJnF1b3Q7TXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3MmcXVvdDtcXG4gICAgICAgIH1cXG4gICAgfSk7XFxuXFxuICAgIHJldHVybiB0aGlzO1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgY3JlYXRlcyBhIG1ldGhvZCB0aGF0IHRoZSBtaXNvIGRhdGFiYXNlIGFwaSBjYW4gdXNlIHRvIHZhbGlkYXRlIHlvdXIgbW9kZWwuXFxuWW91IGdldCBmdWxsIGFjY2VzcyB0byB0aGUgdmFsaWRhdGlvbiBpbmZvIGFzIHdlbGwsIHNvIHlvdSBjYW4gc2hvdyBhbiBlcnJvciBtZXNzYWdlIG5lYXIgeW91ciBmaWVsZCwgZm9yIGV4YW1wbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5OylcXG48L2NvZGU+PC9wcmU+XFxuPHA+V2lsbCByZXR1cm4gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIDxjb2RlPmVtYWlsPC9jb2RlPiBwcm9wZXJ0eSBvZiB5b3VyIHVzZXIgbW9kZWwgaXMgdmFsaWQsIG9yIGEgbGlzdCBvZiBlcnJvcnMgbWVzc2FnZXMgaWYgaXQgaXMgaW52YWxpZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5bJnF1b3Q7WW91IG11c3QgZW50ZXIgYW4gZW1haWwgYWRkcmVzcyZxdW90OywgJnF1b3Q7TXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3MmcXVvdDtdXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNvIHlvdSBjYW4gZm9yIGV4YW1wbGUgYWRkIGEgY2xhc3MgbmFtZSB0byBhIGRpdiBzdXJyb3VuZGluZyB5b3VyIGZpZWxkIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+RElWKHtjbGFzczogKGN0cmwudXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5OykgPT0gdHJ1ZT8gJnF1b3Q7dmFsaWQmcXVvdDs6ICZxdW90O2ludmFsaWQmcXVvdDspfSwgWy4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5BbmQgc2hvdyB0aGUgZXJyb3IgbWVzc2FnZXMgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5TUEFOKGN0cmwudXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5OykgPT0gdHJ1ZT8gJnF1b3Q7JnF1b3Q7OiBjdHJsLnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspLmpvaW4oJnF1b3Q7LCAmcXVvdDspKVxcbjwvY29kZT48L3ByZT5cXG48aDI+PGEgbmFtZT1cXFwiZGF0YWJhc2UtYXBpLWFuZC1tb2RlbC1pbnRlcmFjdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2RhdGFiYXNlLWFwaS1hbmQtbW9kZWwtaW50ZXJhY3Rpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RGF0YWJhc2UgYXBpIGFuZCBtb2RlbCBpbnRlcmFjdGlvbjwvc3Bhbj48L2E+PC9oMj48cD5NaXNvIHVzZXMgdGhlIG1vZGVsIGRlZmluaXRpb25zIHRoYXQgeW91IGRlY2xhcmUgaW4geW91ciA8Y29kZT5tdmM8L2NvZGU+IGZpbGUgdG8gYnVpbGQgdXAgYSBzZXQgb2YgbW9kZWxzIHRoYXQgdGhlIEFQSSBjYW4gdXNlLCB0aGUgbW9kZWwgZGVmaW5pdGlvbnMgd29yayBsaWtlIHRoaXM6PC9wPlxcbjx1bD5cXG48bGk+T24gdGhlIG1vZGVscyBhdHRyaWJ1dGUgb2YgdGhlIG12Yywgd2UgIGRlZmluZSBhIHN0YW5kYXJkIG1pdGhyaWwgZGF0YSBtb2RlbCwgKGllOiBhIGphdmFzY3JpcHQgb2JqZWN0IHdoZXJlIHByb3BlcnRpZXMgY2FuIGJlIGVpdGhlciBzdGFuZGFyZCBqYXZhc2NyaXB0IGRhdGEgdHlwZXMsIG9yIGEgZnVuY3Rpb24gdGhhdCB3b3JrcyBhcyBhIGdldHRlci9zZXR0ZXIsIGVnOiA8Y29kZT5tLnByb3A8L2NvZGU+KTwvbGk+XFxuPGxpPk9uIHNlcnZlciBzdGFydHVwLCBtaXNvIHJlYWRzIHRoaXMgYW5kIGNyZWF0ZXMgYSBjYWNoZSBvZiB0aGUgbW9kZWwgb2JqZWN0cywgaW5jbHVkaW5nIHRoZSBuYW1lIHNwYWNlIG9mIHRoZSBtb2RlbCwgZWc6ICZxdW90O2hlbGxvLmVkaXQuaGVsbG8mcXVvdDs8L2xpPlxcbjxsaT5Nb2RlbHMgY2FuIG9wdGlvbmFsbHkgaW5jbHVkZSBkYXRhIHZhbGlkYXRpb24gaW5mb3JtYXRpb24sIGFuZCB0aGUgZGF0YWJhc2UgYXBpIHdpbGwgZ2V0IGFjY2VzcyB0byB0aGlzLjwvbGk+XFxuPC91bD5cXG48cD5Bc3N1bWluZyB3ZSBoYXZlIGEgbW9kZWwgaW4gdGhlIGhlbGxvLm1vZGVscyBvYmplY3QgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5oZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgdGhpcy5pc1ZhbGlkID0gdmFsaWRhdGUuYmluZCh0aGlzLCB7XFxuICAgICAgICB3aG86IHtcXG4gICAgICAgICAgICBpc1JlcXVpcmVkOiAmcXVvdDtZb3UgbXVzdCBrbm93IHdobyB5b3UgYXJlIHRhbGtpbmcgdG8mcXVvdDtcXG4gICAgICAgIH1cXG4gICAgfSk7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGUgQVBJIHdvcmtzIGxpa2UgdGhpczo8L3A+XFxuPHVsPlxcbjxsaT5XZSBjcmVhdGUgYW4gZW5kcG9pbnQgYXQgPGNvZGU+L2FwaTwvY29kZT4gd2hlcmUgZWFjaCB3ZSBsb2FkIHdoYXRldmVyIGFwaSBpcyBjb25maWd1cmVkIGluIDxjb2RlPi9jZmcvc2VydmVyLmpzb248L2NvZGU+LCBhbmQgZXhwb3NlIGVhY2ggbWV0aG9kLiBGb3IgZXhhbXBsZSA8Y29kZT4vYXBpL3NhdmU8L2NvZGU+IGlzIGF2YWlsYWJsZSBmb3IgdGhlIGRlZmF1bHQgPGNvZGU+ZmxhdGZpbGVkYjwvY29kZT4gYXBpLjwvbGk+XFxuPGxpPk5leHQgd2UgY3JlYXRlIGEgc2V0IG9mIEFQSSBmaWxlcyAtIG9uZSBmb3IgY2xpZW50LCAoL3N5c3RlbS9hcGkuY2xpZW50LmpzKSwgYW5kIG9uZSBmb3Igc2VydmVyICgvc3lzdGVtL2FwaS5zZXJ2ZXIuanMpIC0gZWFjaCBoYXZlIHRoZSBzYW1lIG1ldGhvZHMsIGJ1dCBkbyB2YXN0bHkgZGlmZmVyZW50IHRoaW5nczo8dWw+XFxuPGxpPmFwaS5jbGllbnQuanMgaXMgYSB0aGluIHdyYXBwZXIgdGhhdCB1c2VzIG1pdGhyaWwmIzM5O3MgbS5yZXF1ZXN0IHRvIGNyZWF0ZSBhbiBhamF4IHJlcXVlc3QgdG8gdGhlIHNlcnZlciBBUEksIGl0IHNpbXBseSBwYXNzZXMgbWVzc2FnZXMgYmFjayBhbmQgZm9ydGggKGluIEpTT04gUlBDIDIuMCBmb3JtYXQpLjwvbGk+XFxuPGxpPmFwaS5zZXJ2ZXIuanMgY2FsbHMgdGhlIGRhdGFiYXNlIGFwaSBtZXRob2RzLCB3aGljaCBpbiB0dXJuIGhhbmRsZXMgbW9kZWxzIGFuZCB2YWxpZGF0aW9uIHNvIGZvciBleGFtcGxlIHdoZW4gYSByZXF1ZXN0IGlzIG1hZGUgYW5kIGEgPGNvZGU+dHlwZTwvY29kZT4gYW5kIDxjb2RlPm1vZGVsPC9jb2RlPiBpcyBpbmNsdWRlZCwgd2UgY2FuIHJlLWNvbnN0cnVjdCB0aGUgZGF0YSBtb2RlbCBiYXNlZCBvbiB0aGlzIGluZm8sIGZvciBleGFtcGxlIHlvdSBtaWdodCBzZW5kOiB7dHlwZTogJiMzOTtoZWxsby5lZGl0LmhlbGxvJiMzOTssIG1vZGVsOiB7d2hvOiAmIzM5O0RhdmUmIzM5O319LCB0aGlzIGNhbiB0aGVuIGJlIGNhc3QgYmFjayBpbnRvIGEgbW9kZWwgdGhhdCB3ZSBjYW4gY2FsbCB0aGUgPGNvZGU+aXNWYWxpZDwvY29kZT4gbWV0aG9kIG9uLjwvbGk+XFxuPC91bD5cXG48L2xpPlxcbjwvdWw+XFxuPHA+PHN0cm9uZz5Ob3csIHRoZSBpbXBvcnRhbnQgYml0Ojwvc3Ryb25nPiBUaGUgcmVhc29uIGZvciBhbGwgdGhpcyBmdW5jdGlvbmFsaXR5IGlzIHRoYXQgbWl0aHJpbCBpbnRlcm5hbGx5IGRlbGF5cyByZW5kZXJpbmcgdG8gdGhlIERPTSB3aGlsc3QgYSByZXF1ZXN0IGlzIGdvaW5nIG9uLCBzbyB3ZSBuZWVkIHRvIGhhbmRsZSB0aGlzIHdpdGhpbiBtaXNvIC0gaW4gb3JkZXIgdG8gYmUgYWJsZSB0byByZW5kZXIgdGhpbmdzIG9uIHRoZSBzZXJ2ZXIgLSBzbyB3ZSBoYXZlIGEgYmluZGluZyBzeXN0ZW0gdGhhdCBkZWxheXMgcmVuZGVyaW5nIHdoaWxzdCBhbiBhc3luYyByZXF1ZXN0IGlzIHN0aWxsIGJlaW5nIGV4ZWN1dGVkLiBUaGF0IG1lYW5zIG1pdGhyaWwtbGlrZSBjb2RlIGxpa2UgdGhpczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jb250cm9sbGVyOiBmdW5jdGlvbigpe1xcbiAgICB2YXIgY3RybCA9IHRoaXM7XFxuICAgIGFwaS5maW5kKHt0eXBlOiAmIzM5O2hlbGxvLmluZGV4LmhlbGxvJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgICAgIHZhciBsaXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICB2YXIgbXlIZWxsbyA9IGRhdGEucmVzdWx0W2tleV07XFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy5oZWxsbyhteUhlbGxvKTtcXG4gICAgICAgIH0pO1xcbiAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBjdHJsLnZtLnRvZG9MaXN0KGxpc3QpO1xcbiAgICB9KTtcXG4gICAgcmV0dXJuIGN0cmw7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5XaWxsIHN0aWxsIHdvcmsuIE5vdGU6IHRoZSBtYWdpYyBoZXJlIGlzIHRoYXQgdGhlcmUgaXMgYWJzb2x1dGVseSBub3RoaW5nIGluIHRoZSBjb2RlIGFib3ZlIHRoYXQgcnVucyBhIGNhbGxiYWNrIHRvIGxldCBtaXRocmlsIGtub3cgdGhlIGRhdGEgaXMgcmVhZHkgLSB0aGlzIGlzIGEgZGVzaWduIGZlYXR1cmUgb2YgbWl0aHJpbCB0byBkZWxheSByZW5kZXJpbmcgYXV0b21hdGljYWxseSB3aGlsc3QgYW4gPGNvZGU+bS5yZXF1ZXN0PC9jb2RlPiBpcyBpbiBwcm9ncmVzcywgc28gd2UgY2F0ZXIgZm9yIHRoaXMgdG8gaGF2ZSB0aGUgYWJpbGl0eSB0byByZW5kZXIgdGhlIHBhZ2Ugc2VydmVyLXNpZGUgZmlyc3QsIHNvIHRoYXQgU0VPIHdvcmtzIG91dCBvZiB0aGUgYm94LjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiY2xpZW50LXZzLXNlcnZlci1jb2RlXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY2xpZW50LXZzLXNlcnZlci1jb2RlXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNsaWVudCB2cyBzZXJ2ZXIgY29kZTwvc3Bhbj48L2E+PC9oMj48cD5JbiBtaXNvLCB5b3UgaW5jbHVkZSBmaWxlcyB1c2luZyB0aGUgc3RhbmRhcmQgbm9kZWpzIDxjb2RlPnJlcXVpcmU8L2NvZGU+IGZ1bmN0aW9uLiBXaGVuIHlvdSBuZWVkIHRvIGRvIHNvbWV0aGluZyB0aGF0IHdvcmtzIGRpZmZlcmVudGx5IGluIHRoZSBjbGllbnQgdGhhbiB0aGUgc2VydmVyLCB0aGVyZSBhcmUgYSBmZXcgd2F5cyB5b3UgY2FuIGFjaGlldmUgaXQ6PC9wPlxcbjx1bD5cXG48bGk+VGhlIHJlY29tbWVuZGVkIHdheSBpcyB0byBjcmVhdGUgYW5kIHJlcXVpcmUgYSBmaWxlIGluIHRoZSA8Y29kZT5tb2R1bGVzLzwvY29kZT4gZGlyZWN0b3J5LCBhbmQgdGhlbiBjcmVhdGUgdGhlIHNhbWUgZmlsZSB3aXRoIGEgJnF1b3Q7LmNsaWVudCZxdW90OyBiZWZvcmUgdGhlIGV4dGVuc2lvbiwgYW5kIG1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IGxvYWQgdGhhdCBmaWxlIGZvciB5b3Ugb24gdGhlIGNsaWVudCBzaWRlIGluc3RlYWQuIEZvciBleGFtcGxlIGlmIHlvdSBoYXZlIDxjb2RlPi9tb2R1bGVzL3NvbWV0aGluZy5qczwvY29kZT4sIGlmIHlvdSBjcmVhdGUgPGNvZGU+L21vZHVsZXMvc29tZXRoaW5nLmNsaWVudC5qczwvY29kZT4sIG1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IHVzZSB0aGF0IG9uIHRoZSBjbGllbnQuPC9saT5cXG48bGk+QW5vdGhlciBvcHRpb24gaXMgdG8gdXNlIDxjb2RlPm1pc28udXRpbDwvY29kZT4gLSB5b3UgY2FuIHVzZSA8Y29kZT5taXNvLnV0aWwuaXNTZXJ2ZXIoKTwvY29kZT4gdG8gdGVzdCBpZiB5b3UmIzM5O3JlIG9uIHRoZSBzZXJ2ZXIgb3Igbm90LCB0aG91Z2ggaXQgaXMgYmV0dGVyIHByYWN0aWNlIHRvIHVzZSB0aGUgJnF1b3Q7LmNsaWVudCZxdW90OyBtZXRob2QgbWVudGlvbmVkIGFib3ZlIC0gb25seSB1c2UgPGNvZGU+aXNTZXJ2ZXI8L2NvZGU+IGlmIHlvdSBhYnNvbHV0ZWx5IGhhdmUgbm8gb3RoZXIgb3B0aW9uLjwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiZmlyc3QtcGFnZS1sb2FkXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZmlyc3QtcGFnZS1sb2FkXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkZpcnN0IHBhZ2UgbG9hZDwvc3Bhbj48L2E+PC9oMj48cD5XaGVuIGEgbmV3IHVzZXIgZW50ZXJzIHlvdXIgc2l0ZSB2aWEgYSBVUkwsIGFuZCBtaXNvIGxvYWRzIHRoZSBmaXJzdCBwYWdlLCBhIG51bWJlciBvZiB0aGluZ3MgaGFwcGVuOjwvcD5cXG48dWw+XFxuPGxpPlRoZSBzZXJ2ZXIgZ2VuZXJhdGVzIHRoZSBwYWdlLCBpbmNsdWRpbmcgYW55IGRhdGEgdGhlIHVzZXIgbWlnaHQgaGF2ZSBhY2Nlc3MgdG8uIFRoaXMgaXMgbWFpbmx5IGZvciBTRU8gcHVycG9zZXMsIGJ1dCBhbHNvIHRvIG1ha2UgdGhlIHBlcmNlcHRpYmxlIGxvYWRpbmcgdGltZSBsZXNzLCBwbHVzIHByb3ZpZGUgYmVhdXRpZnVsIHVybHMgb3V0IG9mIHRoZSBib3guIDwvbGk+XFxuPGxpPk9uY2UgdGhlIHBhZ2UgaGFzIGxvYWRlZCwgbWl0aHJpbCBraWNrcyBpbiBhbmQgY3JlYXRlcyBhIFhIUiAoYWpheCkgcmVxdWVzdCB0byByZXRyZWl2ZSB0aGUgZGF0YSwgYW5kIHNldHVwIGFueSBldmVudHMgYW5kIHRoZSB2aXJ0dWFsIERPTSwgZXRjLjwvbGk+XFxuPC91bD5cXG48cD5Ob3cgeW91IG1pZ2h0IGJlIHRoaW5raW5nOiB3ZSBkb24mIzM5O3QgcmVhbGx5IG5lZWQgdGhhdCAybmQgcmVxdWVzdCBmb3IgZGF0YSAtIGl0JiMzOTtzIGFscmVhZHkgaW4gdGhlIHBhZ2UsIHJpZ2h0PyBXZWxsLCBzb3J0IG9mIC0geW91IHNlZSBtaXNvIGRvZXMgbm90IG1ha2UgYW55IGFzc3VtcHRpb25zIGFib3V0IHRoZSBzdHJ1Y3R1cmUgb2YgeW91ciBkYXRhLCBvciBob3cgeW91IHdhbnQgdG8gdXNlIGl0IGluIHlvdXIgbW9kZWxzLCBzbyB0aGVyZSBpcyBubyB3YXkgZm9yIHVzIHRvIHJlLXVzZSB0aGF0IGRhdGEsIGFzIGl0IGNvdWxkIGJlIGFueSBzdHJ1Y3R1cmUuXFxuQW5vdGhlciBrZXkgZmVhdHVyZSBvZiBtaXNvIGlzIHRoZSBmYWN0IHRoYXQgYWxsIGFjdGlvbnMgY2FuIGJlIGJvb2ttYXJrYWJsZSAtIGZvciBleGFtcGxlIHRoZSA8YSBocmVmPVxcXCIvZG9jL3VzZXJzLm1kXFxcIj4vdXNlcnM8L2E+IGFwcCAtIGNsaWNrIG9uIGEgdXNlciwgYW5kIHNlZSB0aGUgdXJsIGNoYW5nZSAtIHdlIGRpZG4mIzM5O3QgZG8gYW5vdGhlciBzZXJ2ZXIgcm91bmQtdHJpcCwgYnV0IHJhdGhlciBqdXN0IGEgWEhSIHJlcXVlc3QgdGhhdCByZXR1cm5lZCB0aGUgZGF0YSB3ZSByZXF1aXJlZCAtIHRoZSBVSSB3YXMgY29tcGxldGVseSByZW5kZXJlZCBjbGllbnQgc2lkZSAtIHNvIGl0JiMzOTtzIHJlYWxseSBvbiB0aGF0IGZpcnN0IHRpbWUgd2UgbG9hZCB0aGUgcGFnZSB0aGF0IHlvdSBlbmQgdXAgbG9hZGluZyB0aGUgZGF0YSB0d2ljZS48L3A+XFxuPHA+U28gdGhhdCBpcyB0aGUgcmVhc29uIHRoZSBhcmNoaXRlY3R1cmUgd29ya3MgdGhlIHdheSBpdCBkb2VzLCBhbmQgaGFzIHRoYXQgc2VlbWluZ2x5IHJlZHVuZGFudCAybmQgcmVxdWVzdCBmb3IgdGhlIGRhdGEgLSBpdCBpcyBhIHNtYWxsIHByaWNlIHRvIHBheSBmb3IgU0VPLCBhbmQgcGVyY2VwdGlibHkgcXVpY2sgbG9hZGluZyBwYWdlcyBhbmQgYXMgbWVudGlvbmVkLCBpdCBvbmx5IGV2ZXIgaGFwcGVucyBvbiB0aGUgZmlyc3QgcGFnZSBsb2FkLjwvcD5cXG48cD5PZiBjb3Vyc2UgeW91IGNvdWxkIGltcGxlbWVudCBjYWNoaW5nIG9mIHRoZSBkYXRhIHlvdXJzZWxmLCBpZiB0aGUgMm5kIHJlcXVlc3QgaXMgYW4gaXNzdWUgLSBhZnRlciBhbGwgeW91IG1pZ2h0IGJlIGxvYWRpbmcgcXVpdGUgYSBiaXQgb2YgZGF0YS4gT25lIHdheSB0byBkbyB0aGlzIHdvdWxkIGJlIGxpa2Ugc28gKHdhcm5pbmc6IHJhdGhlciBjb250cml2ZWQgZXhhbXBsZSBmb2xsb3dzKTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL21vZHVsZXMvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGRiID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7aGVsbG9faWQmIzM5OywgcGFyYW1zKTtcXG5cXG4gICAgICAgIC8vICAgIENoZWNrIGlmIG91ciBkYXRhIGlzIGF2YWlsYWJsZSwgaWYgc286IHVzZSBpdC5cXG4gICAgICAgIGlmKHR5cGVvZiBteVBlcnNvbiAhPT0gJnF1b3Q7dW5kZWZpbmVkJnF1b3Q7KSB7XFxuICAgICAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiBteVBlcnNvbn0pO1xcbiAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgIC8vICAgIElmIG5vdCwgbG9hZCBpdCBmaXJzdC5cXG4gICAgICAgICAgICBkYi5maW5kKHt0eXBlOiAmIzM5O3VzZXIuZWRpdC51c2VyJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgICAgICAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiBkYXRhLnJlc3VsdFswXS5uYW1lfSk7XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9XFxuXFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICAvLyAgICBBZGQgYSBjbGllbnQgc2lkZSBnbG9iYWwgdmFyaWFibGUgd2l0aCBvdXIgZGF0YVxcbiAgICAgICAgICAgICAgICBTQ1JJUFQoJnF1b3Q7dmFyIG15UGVyc29uID0gJiMzOTsmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpICsgJnF1b3Q7JiMzOTsmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7RyYjMzk7ZGF5ICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpXFxuICAgICAgICAgICAgXVxcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+U28gdGhpcyB3aWxsIG9ubHkgbG9hZCB0aGUgZGF0YSBvbiB0aGUgc2VydmVyIHNpZGUgLSBhcyB5b3UgY2FuIHNlZSwgd2UgbmVlZCB0byBrbm93IHRoZSBzaGFwZSBvZiB0aGUgZGF0YSB0byB1c2UgaXQsIGFuZCB3ZSBhcmUgdXNpbmcgYSBnbG9iYWwgdmFyaWFibGUgaGVyZSB0byBzdG9yZSB0aGUgZGF0YSBjbGllbnQgc2lkZSAtIEkgZG9uJiMzOTt0IHJlYWxseSByZWNvbW1lbmQgdGhpcyBhcHByb2FjaCwgYXMgaXQgc2VlbXMgbGlrZSBhIGxvdCBvZiB3b3JrIHRvIHNhdmUgYSBzaW5nbGUgWEhSIHJlcXVlc3QuIEhvd2V2ZXIgSSB1bmRlcnN0YW5kIHlvdSBtaWdodCBoYXZlIHVuaXF1ZSBjaXJjdW1zdGFuY2VzIHdoZXJlIHRoZSBmaXJzdCBkYXRhIGxvYWQgY291bGQgYmUgYSBwcm9ibGVtLCBzbyBhdCBsZWFzdCB0aGlzIGlzIGFuIG9wdGlvbiB5b3UgY2FuIHVzZSB0byBjYWNoZSB0aGUgZGF0YSBvbiBmaXJzdCBwYWdlIGxvYWQuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJyZXF1aXJpbmctZmlsZXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyZXF1aXJpbmctZmlsZXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+UmVxdWlyaW5nIGZpbGVzPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gcmVxdWlyaW5nIGZpbGVzLCBiZSBzdXJlIHRvIGRvIHNvIGluIGEgc3RhdGljIG1hbm5lciBzbyB0aGF0IGJyb3dzZXJpZnkgaXMgYWJsZSB0byBjb21waWxlIHRoZSBjbGllbnQgc2lkZSBzY3JpcHQuIEFsd2F5cyB1c2U6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+TkVWRVIgRE8gQU5ZIE9GIFRIRVNFOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICBET04mIzM5O1QgRE8gVEhJUyFcXG52YXIgbWlzbyA9IG5ldyByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGNyZWF0ZSBhbiBvYmplY3QsIHdoaWNoIG1lYW5zIDxhIGhyZWY9XFxcIi9kb2MvODI0Lm1kXFxcIj5icm93c2VyaWZ5IGNhbm5vdCByZXNvbHZlIGl0IHN0YXRpY2FsbHk8L2E+LCBhbmQgd2lsbCBpZ25vcmUgaXQuPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Ly8gIERPTiYjMzk7VCBETyBUSElTIVxcbnZhciB0aGluZyA9ICYjMzk7bWlzbyYjMzk7O1xcbnZhciBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci8mIzM5Oyt0aGluZysmIzM5Oy51dGlsLmpzJiMzOTspO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgY3JlYXRlIGFuIGV4cHJlc3Npb24sIHdoaWNoIG1lYW5zIDxhIGhyZWY9XFxcIi9kb2MvODI0Lm1kXFxcIj5icm93c2VyaWZ5IGNhbm5vdCByZXNvbHZlIGl0IHN0YXRpY2FsbHk8L2E+LCBhbmQgd2lsbCBpZ25vcmUgaXQuPC9wPlxcblwiLFwiUGF0dGVybnMubWRcIjpcIjxwPlRoZXJlIGFyZSBzZXZlcmFsIHdheXMgeW91IGNhbiB3cml0ZSB5b3VyIGFwcCBhbmQgbWlzbyBpcyBub3Qgb3BpbmlvbmF0ZWQgYWJvdXQgaG93IHlvdSBnbyBhYm91dCB0aGlzIHNvIGl0IGlzIGltcG9ydGFudCB0aGF0IHlvdSBjaG9vc2UgYSBwYXR0ZXJuIHRoYXQgc3VpdHMgeW91ciBuZWVkcy4gQmVsb3cgYXJlIGEgZmV3IHN1Z2dlc3RlZCBwYXR0ZXJucyB0byBmb2xsb3cgd2hlbiBkZXZlbG9waW5nIGFwcHMuPC9wPlxcbjxwPjxzdHJvbmc+Tm90ZTo8L3N0cm9uZz4gbWlzbyBpcyBhIHNpbmdsZSBwYWdlIGFwcCB0aGF0IGxvYWRzIHNlcnZlciByZW5kZXJlZCBIVE1MIGZyb20gYW55IFVSTCwgc28gdGhhdCBTRU8gd29ya3Mgb3V0IG9mIHRoZSBib3guPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJzaW5nbGUtdXJsLW12Y1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3NpbmdsZS11cmwtbXZjXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlNpbmdsZSB1cmwgbXZjPC9zcGFuPjwvYT48L2gyPjxwPkluIHRoaXMgcGF0dGVybiBldmVyeXRoaW5nIHRoYXQgeW91ciBtdmMgbmVlZHMgdG8gZG8gaXMgZG9uZSBvbiBhIHNpbmdsZSB1cmwgZm9yIGFsbCB0aGUgYXNzb2NpYXRlZCBhY3Rpb25zLiBUaGUgYWR2YW50YWdlIGZvciB0aGlzIHN0eWxlIG9mIGRldmVsb3BtZW50IGlzIHRoYXQgeW91IGhhdmUgZXZlcnl0aGluZyBpbiBvbmUgbXZjIGNvbnRhaW5lciwgYW5kIHlvdSBkb24mIzM5O3QgbmVlZCB0byBtYXAgYW55IHJvdXRlcyAtIG9mIGNvdXJzZSB0aGUgZG93bnNpZGUgYmVpbmcgdGhhdCB0aGVyZSBhcmUgbm8gcm91dGVzIGZvciB0aGUgdXNlciB0byBib29rbWFyay4gVGhpcyBpcyBwYXR0ZXJuIHdvcmtzIHdlbGwgZm9yIHNtYWxsZXIgZW50aXRpZXMgd2hlcmUgdGhlcmUgYXJlIG5vdCB0b28gbWFueSBpbnRlcmFjdGlvbnMgdGhhdCB0aGUgdXNlciBjYW4gZG8gLSB0aGlzIGlzIGVzc2VudGlhbGx5IGhvdyBtb3N0IG1pdGhyaWwgYXBwcyBhcmUgd3JpdHRlbiAtIHNlbGYtY29udGFpbmVkLCBhbmQgYXQgYSBzaW5nbGUgdXJsLjwvcD5cXG48cD5IZXJlIGlzIGEgJnF1b3Q7aGVsbG8gd29ybGQmcXVvdDsgZXhhbXBsZSB1c2luZyB0aGUgc2luZ2xlIHVybCBwYXR0ZXJuPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLnN1Z2FydGFncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgLy8gICAgT3VyIG1vZGVsXFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnAoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaGVsbG8oe3dobzogJnF1b3Q7d29ybGQmcXVvdDt9KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgbW9kZWwud2hvKCkpXFxuICAgICAgICAgICAgXTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd291bGQgZXhwb3NlIGEgdXJsIC9oZWxsb3MgKG5vdGU6IHRoZSAmIzM5O3MmIzM5OyksIGFuZCB3b3VsZCBkaXNwbGF5ICZxdW90O0hlbGxvIHdvcmxkJnF1b3Q7LiAoWW91IGNhbiBjaGFuZ2UgdGhlIHJvdXRlIHVzaW5nIGN1c3RvbSByb3V0aW5nKTwvcD5cXG48aDI+PGEgbmFtZT1cXFwibXVsdGktdXJsLW12Y1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI211bHRpLXVybC1tdmNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TXVsdGkgdXJsIG12Yzwvc3Bhbj48L2E+PC9oMj48cD5JbiB0aGlzIHBhdHRlcm4gd2UgZXhwb3NlIG11bHRpcGxlIG12YyByb3V0ZXMgdGhhdCBpbiB0dXJuIHRyYW5zbGF0ZSB0byBtdWx0aXBsZSBVUkxzLiBUaGlzIGlzIHVzZWZ1bCBmb3Igc3BsaXR0aW5nIHVwIHlvdXIgYXBwLCBhbmQgZW5zdXJpbmcgZWFjaCBtdmMgaGFzIGl0cyBvd24gc2V0cyBvZiBjb25jZXJucy48L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5zdWdhcnRhZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG52YXIgaW5kZXggPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICAvLyAgICBPdXIgbW9kZWxcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuaGVsbG8oe3dobzogJnF1b3Q7d29ybGQmcXVvdDt9KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgbW9kZWwud2hvKCkpLFxcbiAgICAgICAgICAgICAgICBBKHtocmVmOiAmcXVvdDsvaGVsbG8vTGVvJnF1b3Q7LCBjb25maWc6IG0ucm91dGV9LCAmcXVvdDtDbGljayBtZSBmb3IgdGhlIGVkaXQgYWN0aW9uJnF1b3Q7KVxcbiAgICAgICAgICAgIF07XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IGluZGV4Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgbW9kZWwud2hvKCkpXFxuICAgICAgICAgICAgXTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkhlcmUgd2UgYWxzbyBleHBvc2UgYSAmcXVvdDsvaGVsbG8vW05BTUVdJnF1b3Q7IHVybCwgdGhhdCB3aWxsIHNob3cgeW91ciBuYW1lIHdoZW4geW91IHZpc2l0IC9oZWxsby9bWU9VUiBOQU1FXSwgc28gdGhlcmUgYXJlIG5vdyBtdWx0aXBsZSB1cmxzIGZvciBvdXIgU1BBOjwvcD5cXG48dWw+XFxuPGxpPjxzdHJvbmc+L2hlbGxvczwvc3Ryb25nPiAtIHRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgYW4gaW5kZXggcGFnZSB0aGF0IGxpc3RzIGFsbCB5b3VyICZxdW90O2hlbGxvcyZxdW90OzwvbGk+XFxuPGxpPjxzdHJvbmc+L2hlbGxvL1tOQU1FXTwvc3Ryb25nPiAtIHRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgYW4gZWRpdCBwYWdlIHdoZXJlIHlvdSBjYW4gZWRpdCB5b3VyICZxdW90O2hlbGxvcyZxdW90OzwvbGk+XFxuPC91bD5cXG48cD5Ob3RlIHRoYXQgdGhlIGFuY2hvciB0YWcgaGFzIDxjb2RlPmNvbmZpZzogbS5yb3V0ZTwvY29kZT4gaW4gaXQmIzM5O3Mgb3B0aW9ucyAtIHRoaXMgaXMgc28gdGhhdCB3ZSBjYW4gcm91dGUgYXV0b21hdGljYWxseSB0aG91Z2ggbWl0aHJpbDwvcD5cXG5cIn07IH07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcblx0dmFyIGdldE1vZGVsRGF0YSA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgaSwgcmVzdWx0ID0ge307XG5cdFx0Zm9yKGkgaW4gbW9kZWwpIHtpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0aWYoaSAhPT0gJ2lzVmFsaWQnKSB7XG5cdFx0XHRcdGlmKGkgPT0gJ2lkJykge1xuXHRcdFx0XHRcdHJlc3VsdFsnX2lkJ10gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0cmV0dXJuIHtcbidmaW5kJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vZmluZCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nc2F2ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL3NhdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3JlbW92ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL3JlbW92ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nYXV0aGVudGljYXRlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vYXV0aGVudGljYXRlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidsb2dpbic6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2xvZ2luJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidsb2dvdXQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9sb2dvdXQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2ZpbmRVc2Vycyc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2ZpbmRVc2VycycsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nc2F2ZVVzZXInOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9zYXZlVXNlcicsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn1cblx0fTtcbn07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcblx0dmFyIGdldE1vZGVsRGF0YSA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgaSwgcmVzdWx0ID0ge307XG5cdFx0Zm9yKGkgaW4gbW9kZWwpIHtpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0aWYoaSAhPT0gJ2lzVmFsaWQnKSB7XG5cdFx0XHRcdGlmKGkgPT0gJ2lkJykge1xuXHRcdFx0XHRcdHJlc3VsdFsnX2lkJ10gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0cmV0dXJuIHtcbidmaW5kJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvZmxhdGZpbGVkYi9maW5kJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzYXZlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvZmxhdGZpbGVkYi9zYXZlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidyZW1vdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9mbGF0ZmlsZWRiL3JlbW92ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nYXV0aGVudGljYXRlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvZmxhdGZpbGVkYi9hdXRoZW50aWNhdGUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59XG5cdH07XG59OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XG5cdHZhciBnZXRNb2RlbERhdGEgPSBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIGksIHJlc3VsdCA9IHt9O1xuXHRcdGZvcihpIGluIG1vZGVsKSB7aWYobW9kZWwuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdGlmKGkgIT09ICdpc1ZhbGlkJykge1xuXHRcdFx0XHRpZihpID09ICdpZCcpIHtcblx0XHRcdFx0XHRyZXN1bHRbJ19pZCddID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHJldHVybiB7XG4nZ2V0JzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvc2Vzc2lvbi9nZXQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NldCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL3Nlc3Npb24vc2V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufVxuXHR9O1xufTsiLCIvKiBOT1RFOiBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUsIHBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LCB5b3VyIGNoYW5nZXMgd2lsbCBiZSBsb3N0ICovdmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7dmFyIHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSk7dmFyIGJpbmRpbmdzID0gcmVxdWlyZSgnbWl0aHJpbC5iaW5kaW5ncycpKG0pO3ZhciBhbmltYXRlID0gcmVxdWlyZSgnLi4vcHVibGljL2pzL21pdGhyaWwuYW5pbWF0ZS5qcycpKG0pO3ZhciBwZXJtaXNzaW9ucyA9IHJlcXVpcmUoJy4uL3N5c3RlbS9taXNvLnBlcm1pc3Npb25zLmpzJyk7dmFyIGxheW91dCA9IHJlcXVpcmUoJy4uL212Yy9sYXlvdXQuanMnKTt2YXIgcmVzdHJpY3QgPSBmdW5jdGlvbihyb3V0ZSwgYWN0aW9uTmFtZSl7XHRyZXR1cm4gcm91dGU7fTt2YXIgcGVybWlzc2lvbk9iaiA9IHt9O3ZhciB1c2VyID0gcmVxdWlyZSgnLi4vbXZjL3VzZXIuanMnKTtcbnZhciBob21lID0gcmVxdWlyZSgnLi4vbXZjL2hvbWUuanMnKTtcbnZhciBkb2MgPSByZXF1aXJlKCcuLi9tdmMvZG9jLmpzJyk7XG5cbnZhciBoZWxsbyA9IHJlcXVpcmUoJy4uL212Yy9oZWxsby5qcycpO1xudmFyIGxvZ2luID0gcmVxdWlyZSgnLi4vbXZjL2xvZ2luLmpzJyk7XG52YXIgdG9kbyA9IHJlcXVpcmUoJy4uL212Yy90b2RvLmpzJyk7XG5cbmlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHR3aW5kb3cubSA9IG07fVx0bS5yb3V0ZS5tb2RlID0gJ3BhdGhuYW1lJzttLnJvdXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNvQXR0YWNobWVudE5vZGUnKSwgJy8nLCB7Jy91c2Vycy9uZXcnOiByZXN0cmljdCh1c2VyLm5ldywgJ3VzZXIubmV3JyksXG4nLyc6IHJlc3RyaWN0KGhvbWUuaW5kZXgsICdob21lLmluZGV4JyksXG4nL2RvYy86ZG9jX2lkJzogcmVzdHJpY3QoZG9jLmVkaXQsICdkb2MuZWRpdCcpLFxuJy9kb2NzJzogcmVzdHJpY3QoZG9jLmluZGV4LCAnZG9jLmluZGV4JyksXG4nL2hlbGxvLzpoZWxsb19pZCc6IHJlc3RyaWN0KGhlbGxvLmVkaXQsICdoZWxsby5lZGl0JyksXG4nL2xvZ2luJzogcmVzdHJpY3QobG9naW4uaW5kZXgsICdsb2dpbi5pbmRleCcpLFxuJy90b2Rvcyc6IHJlc3RyaWN0KHRvZG8uaW5kZXgsICd0b2RvLmluZGV4JyksXG4nL3VzZXIvOnVzZXJfaWQnOiByZXN0cmljdCh1c2VyLmVkaXQsICd1c2VyLmVkaXQnKSxcbicvdXNlcnMnOiByZXN0cmljdCh1c2VyLmluZGV4LCAndXNlci5pbmRleCcpfSk7bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIgPSBmdW5jdGlvbihvYmope1x0bS5yZW5kZXIoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc29IZWFkZXJOb2RlJyksIGxheW91dC5oZWFkZXJDb250ZW50KHttaXNvR2xvYmFsOiBvYmogfHwgbWlzb0dsb2JhbH0pKTt9O21pc29HbG9iYWwucmVuZGVySGVhZGVyKCk7IiwiLypcdG1pc28gcGVybWlzc2lvbnNcblx0UGVybWl0IHVzZXJzIGFjY2VzcyB0byBjb250cm9sbGVyIGFjdGlvbnMgYmFzZWQgb24gcm9sZXMgXG4qL1xudmFyIG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRoYXNSb2xlID0gZnVuY3Rpb24odXNlclJvbGVzLCByb2xlcyl7XG5cdFx0dmFyIGhhc1JvbGUgPSBmYWxzZTtcblx0XHQvL1x0QWxsIHJvbGVzXG5cdFx0aWYodXNlclJvbGVzID09IFwiKlwiKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0Ly9cdFNlYXJjaCBlYWNoIHVzZXIgcm9sZVxuXHRcdG1pc28uZWFjaCh1c2VyUm9sZXMsIGZ1bmN0aW9uKHVzZXJSb2xlKXtcblx0XHRcdHVzZXJSb2xlID0gKHR5cGVvZiB1c2VyUm9sZSAhPT0gXCJzdHJpbmdcIik/IHVzZXJSb2xlOiBbdXNlclJvbGVdO1xuXHRcdFx0Ly9cdFNlYXJjaCBlYWNoIHJvbGVcblx0XHRcdG1pc28uZWFjaChyb2xlcywgZnVuY3Rpb24ocm9sZSl7XG5cdFx0XHRcdGlmKHVzZXJSb2xlID09IHJvbGUpIHtcblx0XHRcdFx0XHRoYXNSb2xlID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiBoYXNSb2xlO1xuXHR9O1xuXG4vL1x0RGV0ZXJtaW5lIGlmIHRoZSB1c2VyIGhhcyBhY2Nlc3MgdG8gYW4gQVBQIGFjdGlvblxuLy9cdFRPRE86IFxubW9kdWxlLmV4cG9ydHMuYXBwID0gZnVuY3Rpb24ocGVybWlzc2lvbnMsIGFjdGlvbk5hbWUsIHVzZXJSb2xlcyl7XG5cdC8vXHRUT0RPOiBQcm9iYWJseSBuZWVkIHRvIHVzZSBwYXNzPWZhbHNlIGJ5IGRlZmF1bHQsIGJ1dCBmaXJzdDpcblx0Ly9cblx0Ly9cdCogQWRkIGdsb2JhbCBjb25maWcgZm9yIHBhc3MgZGVmYXVsdCBpbiBzZXJ2ZXIuanNvblxuXHQvL1x0KiBcblx0Ly9cblx0dmFyIHBhc3MgPSB0cnVlO1xuXG5cdC8vXHRBcHBseSBkZW55IGZpcnN0LCB0aGVuIGFsbG93LlxuXHRpZihwZXJtaXNzaW9ucyAmJiB1c2VyUm9sZXMpe1xuXHRcdGlmKHBlcm1pc3Npb25zLmRlbnkpIHtcblx0XHRcdHBhc3MgPSAhIGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuZGVueSk7XG5cdFx0fVxuXHRcdGlmKHBlcm1pc3Npb25zLmFsbG93KSB7XG5cdFx0XHRwYXNzID0gaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5hbGxvdyk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHBhc3M7XG59O1xuXG5cbi8vXHREZXRlcm1pbmUgaWYgdGhlIHVzZXIgaGFzIGFjY2VzcyB0byBhbiBBUEkgYWN0aW9uXG4vL1x0VE9ETzogXG5tb2R1bGUuZXhwb3J0cy5hcGkgPSBmdW5jdGlvbihwZXJtaXNzaW9ucywgYWN0aW9uTmFtZSwgdXNlclJvbGVzKXtcblx0Ly9cdFRPRE86IFByb2JhYmx5IG5lZWQgdG8gdXNlIHBhc3M9ZmFsc2UgYnkgZGVmYXVsdCwgYnV0IGZpcnN0OlxuXHQvL1xuXHQvL1x0KiBBZGQgZ2xvYmFsIGNvbmZpZyBmb3IgcGFzcyBkZWZhdWx0IGluIHNlcnZlci5qc29uXG5cdC8vXHQqIFxuXHQvL1xuXHR2YXIgcGFzcyA9IHRydWU7XG5cblx0Ly9cdEFwcGx5IGRlbnkgZmlyc3QsIHRoZW4gYWxsb3cuXG5cdGlmKHBlcm1pc3Npb25zICYmIHVzZXJSb2xlcyl7XG5cdFx0aWYocGVybWlzc2lvbnMuZGVueSkge1xuXHRcdFx0cGFzcyA9ICEgaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5kZW55KTtcblx0XHR9XG5cdFx0aWYocGVybWlzc2lvbnMuYWxsb3cpIHtcblx0XHRcdHBhc3MgPSBoYXNSb2xlKHVzZXIucm9sZXMsIHBlcm1pc3Npb25zLmFsbG93KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcGFzcztcbn07Il19
