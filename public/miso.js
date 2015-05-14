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
				var myRedir = modes[m.route.mode] + currentRoute;
				redirect(myRedir)
			}
			else {
				$location[m.route.mode] = currentRoute;
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
module.exports = function(){ return {"Api.md":"<p>The data apis in miso are a way to create a RESTful endpoint that you can interact with via an easy to use API.</p>\n<blockquote>\nNote: you must enable your api by adding it to the &quot;api&quot; attribute in the <code>/cfg/server.development.json</code> file, or whatever environment you are using.\n</blockquote>\n\n<h2><a name=\"how-does-an-api-work-\" class=\"anchor\" href=\"#how-does-an-api-work-\"><span class=\"header-link\">How does an api work?</span></a></h2><p>The apis in miso do a number of things:</p>\n<ul>\n<li>Allow database access via a thin wrapper, for example to access mongodb, we wrap the popular <a href=\"/doc/mongoose.md\">mongoose npm</a> ODM package</li>\n<li>Waits till mithril is ready - mithril has a unique feature ensures the view doesn&#39;t render till data has been retrieved - the api makes sure we adhere to this</li>\n<li>Apis can work as a proxy, so if you want to access a 3rd party service, an api is a good way to do that - you can then also build in caching, or any other features you may wish to add.</li>\n<li>Apis can be restricted by permissions (coming soon) </li>\n</ul>\n<h2><a name=\"how-should-you-use-apis\" class=\"anchor\" href=\"#how-should-you-use-apis\"><span class=\"header-link\">How should you use apis</span></a></h2><p>There are numerous scenarios where you might want to use an api:</p>\n<ul>\n<li>For database access (miso comes with a bunch of database apis)</li>\n<li>For calling 3rd party end-points - using an api will allow you to create caching and setup permissions on the end-point</li>\n</ul>\n<h2><a name=\"extending-an-existing-api\" class=\"anchor\" href=\"#extending-an-existing-api\"><span class=\"header-link\">Extending an existing api</span></a></h2><p>If you want to add your own methods to an api, you can simply extend one of the existing apis, for example, to extend the <code>flatfiledb</code> API, create a new directory and file in <code>/modules/api/adapt/adapt.api.js</code>:</p>\n<pre><code class=\"lang-javascript\">var db = require(&#39;../../../system/api/flatfiledb/flatfiledb.api.js&#39;);\n\nmodule.exports = function(m){\n    var ad = db(m);\n    ad.hello = function(cb, err, args, req){\n        cb(&quot;world&quot;);\n    };\n    return ad;\n};\n</code></pre>\n<p>Then add the api to the <code>/cfg/server.development.json</code> file like so:</p>\n<pre><code class=\"lang-javascript\">&quot;api&quot;: &quot;adapt&quot;\n</code></pre>\n<p>Then require the new api file in your mvc file like so:</p>\n<pre><code class=\"lang-javascript\">db = require(&#39;../modules/api/adapt/api.server.js&#39;)(m);\n</code></pre>\n<p>You can now add an api call in the controller like so:</p>\n<pre><code class=\"lang-javascript\">db.hello({}).then(function(data){\n// do something with data.result\n});\n</code></pre>\n<p>The arguments to each api endpoint must be the same, ie:</p>\n<pre><code class=\"lang-javascript\">function(cb, err, args, req)\n</code></pre>\n<p>Where:</p>\n<table>\n<thead>\n<tr>\n<th>Argument</th>\n<th>Purpose</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>cb</td>\n<td>A callback you must call when you are done - any data you return will be available on <code>data.result</code> in the response</td>\n</tr>\n<tr>\n<td>err</td>\n<td>A callback you must call if an unrecoverable error occurred, eg: &quot;database connection timeout&quot;. Do not use for things like &quot;no data found&quot;</td>\n</tr>\n<tr>\n<td>args</td>\n<td>A set of arguments passed in to the api method</td>\n</tr>\n<tr>\n<td>req</td>\n<td>The request object from the request</td>\n</tr>\n</tbody>\n</table>\n<p>The complete mvc example looks like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../modules/api/adapt/api.server.js&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            who = miso.getParam(&#39;adapt_id&#39;, params);\n\n        db.hello({}).then(function(data){\n            ctrl.model.who(data.result);\n        });\n\n        ctrl.model = new edit.models.hello({who: who});\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;G&#39;day &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<h2><a name=\"creating-custom-apis\" class=\"anchor\" href=\"#creating-custom-apis\"><span class=\"header-link\">Creating custom apis</span></a></h2><p>You can add your own custom apis in the <code>/modules/apis</code> directory, they have the same format as the included apis, here is an example api that calls the flickr API:</p>\n<pre><code class=\"lang-javascript\">//    endpoint api to make http requests via flickr\nvar request = require(&#39;request&#39;),\n    miso = require(&#39;../../../server/miso.util.js&#39;),\n    //    Parse out the unwanted parts of the json\n    //    typically this would be run on the client\n    //    we run this using &quot;request&quot; on  the server, so\n    //    no need for the jsonp callback\n    jsonParser = function(jsonpData){\n        var json, startPos, endPos;\n        try {\n            startPos = jsonpData.indexOf(&#39;({&#39;);\n            endPos = jsonpData.lastIndexOf(&#39;})&#39;);\n            json = jsonpData\n                .substring(startPos+1, endPos+1)\n                .split(&quot;\\n&quot;).join(&quot;&quot;)\n                .split(&quot;\\\\&#39;&quot;).join(&quot;&#39;&quot;);\n\n            return JSON.parse(json);\n        } catch(ex) {\n            console.log(&quot;ERROR&quot;, ex);\n            return &quot;{}&quot;;\n        }\n    };\n\nmodule.exports = function(utils){\n    return {\n        photos: function(cb, err, args, req){\n            args = args || {};\n            var url = &quot;http://api.flickr.com/services/feeds/photos_public.gne?format=json&quot;;\n            //    Add parameters\n            url += miso.each(args, function(value, key){\n                return &quot;&amp;&quot; + key + &quot;=&quot; + value;\n            });\n\n            request(url, function (error, response, body) {\n                if (!error &amp;&amp; response.statusCode == 200) {\n                    cb(jsonParser(body));\n                } else {\n                    err(error);\n                }\n            });\n        }\n    };\n};\n</code></pre>\n<p>To use it in your mvc file, simply:</p>\n<pre><code class=\"lang-javascript\">flickr = require(&#39;../modules/api/flickr/api.server.js&#39;)(m);\n</code></pre>\n<p>And then call it like so in your controller:</p>\n<pre><code class=\"lang-javascript\">flickr.photos({tags: &quot;Sydney opera house&quot;, tagmode: &quot;any&quot;}).then(function(data){\n    ctrl.model.flickrData(data.result.items);\n});\n</code></pre>\n","Contributing.md":"<p>In order to contribute to misojs, please keep the following in mind:</p>\n<h2><a name=\"when-adding-a-pull-request\" class=\"anchor\" href=\"#when-adding-a-pull-request\"><span class=\"header-link\">When adding a pull request</span></a></h2><ul>\n<li>Be sure to only make small changes, anything more than 4 files will need to be reviewed</li>\n<li>Make sure you explain <em>why</em> you&#39;re making the change, so we understand what the change is for</li>\n<li>Add a unit test if appropriate</li>\n<li>Do not be offended if we ask you to add a unit test before accepting a pull request</li>\n<li>Use tabs not spaces (we are not flexible on this - it is a moot discussion - I really don&#39;t care, we just needed to pick one, and tabs it is)</li>\n</ul>\n","Creating-a-todo-app-part-2-persistence.md":"<p>In this article we will add data persistence functionality to our todo app from the <a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a> article. We recommend you first read that as we are going to use the app you made in this article, so if you don&#39;t already have one, grab a copy of it <a href=\"/doc/Creating-a-todo-app#completed-todo-app.md\">from here</a>, and save it in <code>/mvc/todo.js</code>.</p>\n<p>First add the <code>flatfiledb</code> api to the <code>cfg/server.development.json</code> file:</p>\n<pre><code class=\"lang-javascript\">&quot;api&quot;: &quot;flatfiledb&quot;\n</code></pre>\n<p>This makes miso load the api and expose it at the configured API url, default is &quot;/api&quot; + api name, so for the flatfiledb it will be <code>/api/flatfiledb</code>. This is all abstracted away, so you do not need to worry about what the URL is when using the api - you simply call the method you want, and the miso api takes care of the rest.</p>\n<p>Now require the db api at the the top of the todo.js file:</p>\n<pre><code class=\"lang-javascript\">db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n</code></pre>\n<p>Next add the following in the <code>ctrl.addTodo</code> function underneath the line that reads <code>ctrl.vm.input(&quot;&quot;);</code>:</p>\n<pre><code class=\"lang-javascript\">db.save({ type: &#39;todo.index.todo&#39;, model: newTodo } ).then(function(res){\n    newTodo._id = res.result;\n});\n</code></pre>\n<p>This will save the todo to the database when you click the &quot;Add&quot; button.</p>\n<p>Let us take a quick look at how the api works - the way that you make requests to the api depends entirely on which api you are using, for example for the flatfiledb, we have:</p>\n<table>\n<thead>\n<tr>\n<th>Method</th>\n<th>Action</th>\n<th>Parameters</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>save</td>\n<td>Save or updates a model</td>\n<td>{ type: TYPE, model: MODEL }</td>\n</tr>\n<tr>\n<td>find</td>\n<td>Finds one or more models of the give type</td>\n<td>{ type: TYPE, query: QUERY }</td>\n</tr>\n<tr>\n<td>remove</td>\n<td>Removes an instance of a model</td>\n<td>{ type: TYPE, id: ID }</td>\n</tr>\n</tbody>\n</table>\n<p>Where the attributes are:</p>\n<table>\n<thead>\n<tr>\n<th>Attribute</th>\n<th>Use</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>TYPE</td>\n<td>The namespace of the model, say you have todo.js, and the model is on <code>module.exports.index.modules.todo</code>, the type would be &quot;todo.index.todo&quot;</td>\n</tr>\n<tr>\n<td>MODEL</td>\n<td>This is an object representing the model - eg: a standard mithril model</td>\n</tr>\n<tr>\n<td>QUERY</td>\n<td>An object with attributes to filter the query results</td>\n</tr>\n<tr>\n<td>ID</td>\n<td>A unique ID for a record</td>\n</tr>\n</tbody>\n</table>\n<p>Every method returns a <a href=\"/doc/mithril.deferred.html#differences-from-promises-a-.md\">mithril style promise</a>, which means you must attach a <code>.then</code> callback function.\nBe sure to check the methods for each api, as each will vary, depending on the functionality.</p>\n<p>Now, let us add the capability to load our todos, add the following to the start of the controller, just after the <code>var ctrl = this</code>:</p>\n<pre><code class=\"lang-javascript\">db.find({type: &#39;todo.index.todo&#39;}).then(function(data) {\n    ctrl.list = Object.keys(data.result).map(function(key) {\n        return new self.models.todo(data.result[key]);\n    });\n});\n</code></pre>\n<p>This will load your todos when the app loads up. Be sure to remove the old static list, ie: remove these lines:</p>\n<pre><code class=\"lang-javascript\">myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n\nctrl.list = Object.keys(myTodos).map(function(key) {\n    return new self.models.todo(myTodos[key]);\n});\n</code></pre>\n<p>Now you can try adding a todo, and it will save and load!</p>\n<p>Next let us add the ability to remove your completed todos in the archive method - extend the <code>if</code> statement by adding an <code>else</code> like so: </p>\n<pre><code class=\"lang-javascript\">} else {\n    api.remove({ type: &#39;todo.index.todo&#39;, _id: todo._id }).then(function(response){\n        console.log(response.result);\n    });\n}\n</code></pre>\n<p>This will remove the todo from the data store.</p>\n<p>You now have a complete todo app, your app should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.prop(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this;\n\n        db.find({type: &#39;todo.index.todo&#39;}).then(function(data) {\n            ctrl.list = Object.keys(data.result).map(function(key) {\n                return new self.models.todo(data.result[key]);\n            });\n        });\n\n        ctrl.addTodo = function(e){\n            var value = ctrl.vm.input();\n            if(value) {\n                var newTodo = new self.models.todo({\n                    text: ctrl.vm.input(),\n                    done: false\n                });\n                ctrl.list.push(newTodo);\n                ctrl.vm.input(&quot;&quot;);\n                db.save({ type: &#39;todo.index.todo&#39;, model: newTodo } ).then(function(res){\n                    newTodo._id = res.result;\n                });\n            }\n            e.preventDefault();\n            return false;\n        };\n\n        ctrl.archive = function(){\n            var list = [];\n            ctrl.list.map(function(todo) {\n                if(!todo.done()) {\n                    list.push(todo); \n                } else {\n                    db.remove({ type: &#39;todo.index.todo&#39;, _id: todo._id }).then(function(response){\n                        console.log(response.result);\n                    });\n                }\n            });\n            ctrl.list = list;\n        };\n\n        ctrl.vm = {\n            left: function(){\n                var count = 0;\n                ctrl.list.map(function(todo) {\n                    count += todo.done() ? 0 : 1;\n                });\n                return count;\n            },\n            done: function(todo){\n                return function() {\n                    todo.done(!todo.done());\n                }\n            },\n            input: m.prop(&quot;&quot;)\n        };\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n                H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n                BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n                UL([\n                    ctrl.list.map(function(todo){\n                        return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                    })\n                ]),\n                FORM({ onsubmit: ctrl.addTodo }, [\n                    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n                    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n                ])\n            ]\n        };\n    }\n};\n</code></pre>\n","Creating-a-todo-app.md":"<p>In this article we will create a functional todo app - we recommend you first read the <a href=\"/doc/Getting-started.md\">Getting started</a> article, and understand the miso fundamentals such as where to place models and how to create a miso controller.</p>\n<h2><a name=\"todo-app\" class=\"anchor\" href=\"#todo-app\"><span class=\"header-link\">Todo app</span></a></h2><p>We will now create a new app using the <a href=\"/doc/Patterns#single-url-mvc.md\">single url pattern</a>, which means it handles all actions autonomously, plus looks a lot like a normal mithril app.</p>\n<p>In <code>/mvc</code> save a new file as <code>todo.js</code> with the following content: </p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {},\n    controller: function(params) {\n        var ctrl = this;\n        return ctrl;\n    },\n    view: function(ctrl) {\n        return &quot;TODO&quot;;\n    }\n};\n</code></pre>\n<p>Now open: <a href=\"/doc/todos.md\">http://localhost:6476/todos</a> and you&#39;ll see the word &quot;TODO&quot;. You&#39;ll notice that the url is &quot;/todos&quot; with an &#39;s&#39; on the end - as we are using <a href=\"/doc/How-miso-works#route-by-convention.md\">route by convention</a> to map our route.</p>\n<p>Next let&#39;s create the model for our todos - change the <code>models</code> attribute to the following:</p>\n<pre><code class=\"lang-javascript\">models: {\n    todo: function(data){\n        this.text = data.text;\n        this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n        this._id = data._id;\n    }\n},\n</code></pre>\n<p>Each line in the model does the following:</p>\n<ul>\n<li><code>this.text</code> - The text that is shown on the todo</li>\n<li><code>this.done</code> - This represents if the todo has been completed - we ensure that we handle the &quot;false&quot; values correctly, as ajax responses are always strings.</li>\n<li><code>this._id</code> - The key for the todo</li>\n</ul>\n<p>The model can now be used to store and retreive todos - miso automatically picks up any objects on the <code>models</code> attribute of your mvc file, and maps it in the API. We will soon see how that works. Next add the following code as the controller:</p>\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var ctrl = this,\n        myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n    ctrl.list = Object.keys(myTodos).map(function(key) {\n        return new self.models.todo(myTodos[key]);\n    });\n    return ctrl;\n},\n</code></pre>\n<p>This does the following:</p>\n<ul>\n<li>Creates <code>myTodos</code> which is a list of objects that represents todos</li>\n<li><code>this.list</code> - creates a list of todo model objects by using <code>new self.models.todo(...</code> on each myTodos object.</li>\n<li><code>return this</code> must be done in all controllers, it makes sure that miso can correctly get access to the controller object.</li>\n</ul>\n<p>Note: we always create a local variable <code>ctrl</code> that points to the controller, as it can be used to access variables in the controller from nested functions. You will see this usage later on in this article.</p>\n<p>Now update the view like so:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    return m(&quot;UL&quot;, [\n        ctrl.list.map(function(todo){\n            return m(&quot;LI&quot;, todo.text)\n        })\n    ]);\n}\n</code></pre>\n<p>This will iterate on your newly created list of todo model objects and display the on screen. Your todo app should now look like this:</p>\n<h3><a name=\"half-way-point\" class=\"anchor\" href=\"#half-way-point\"><span class=\"header-link\">Half-way point</span></a></h3><pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n        ctrl.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n        return ctrl;\n    },\n    view: function(ctrl) {\n        return m(&quot;UL&quot;, [\n            ctrl.list.map(function(todo){\n                return m(&quot;LI&quot;, todo.text)\n            })\n        ]);\n    }\n};\n</code></pre>\n<blockquote>\nSo far we have only used pure mithril to create our app - miso did do some of the grunt-work behind the scenes, but we can do much more.\n</blockquote>\n\n\n<p>Let us add some useful libraries, change the top section to:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m);\n</code></pre>\n<p>This will include the following libraries:</p>\n<ul>\n<li><a href=\"/doc/mithril.sugartags.md\">mithril.sugartags</a> - allows rendering HTML using tags that look a little more like HTML than standard mithril</li>\n<li><a href=\"/doc/mithril.bindings.md\">mithril.bindings</a> Bi-directional data bindings for richer models</li>\n</ul>\n<p>Let us start with the sugar tags, update the view to read:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return UL([\n            ctrl.list.map(function(todo){\n                return LI(todo.text)\n            })\n        ])\n    };\n}\n</code></pre>\n<p>So using sugartags allows us to write more concise views, that look more like natural HTML.</p>\n<p>Next let us add a <a href=\"/doc/what-is-a-view-model.html.md\">view model</a> to the controller. A view model is simply a model that contains data about the view, and auxillary functionality, ie: data and other things that we don&#39;t want to persist. Add this to the controller:</p>\n<pre><code class=\"lang-javascript\">ctrl.vm = {\n    done: function(todo){\n        return function() {\n            todo.done(!todo.done());\n        }\n    }\n};\n</code></pre>\n<p>This method will return a function that toggles the <code>done</code> attribute on the passed in todo. </p>\n<blockquote>\nYou might be tempted to put this functionality into the model, but in miso, we need to strictly keep data in the data model, as we are able to persist it.\n</blockquote>\n\n<p>Next update the view to:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return [\n            STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n            UL([\n                ctrl.list.map(function(todo){\n                    return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                })\n            ])\n        ]\n    };\n}\n</code></pre>\n<p>This will make the list of todos clickable, and put a strike-through the todo when it is set to &quot;done&quot;, neat!</p>\n<p>Now let us add a counter, to show how many todos are left, put this into the view model you created in the previous step:</p>\n<pre><code class=\"lang-javascript\">left: function(){\n    var count = 0;\n    ctrl.list.map(function(todo) {\n        count += todo.done() ? 0 : 1;\n    });\n    return count;\n}\n</code></pre>\n<p>And in the view, add the following above the UL:</p>\n<pre><code class=\"lang-javascript\">H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n</code></pre>\n<p>This will now display a nice header showing how many todos are left.</p>\n<p>Next let us add an input field, so you can add new todos, in the view model, (the <code>ctrl.vm</code> object), add the following line:</p>\n<pre><code class=\"lang-javascript\">input: m.p(&quot;&quot;)\n</code></pre>\n<p>In the controller, add:</p>\n<pre><code class=\"lang-javascript\">ctrl.addTodo = function(e){\n    var value = ctrl.vm.input();\n    if(value) {\n        var newTodo = new self.models.todo({\n            text: ctrl.vm.input(),\n            done: false\n        });\n        ctrl.list.push(newTodo);\n        ctrl.vm.input(&quot;&quot;);\n    }\n    e.preventDefault();\n    return false;\n};\n</code></pre>\n<p>This function creates a new todo based on the input text, and adds it to the list of todos.</p>\n<p>And in the view just below the UL, add:</p>\n<pre><code class=\"lang-javascript\">FORM({ onsubmit: ctrl.addTodo }, [\n    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n])\n</code></pre>\n<p>As you can see, we assign the <code>addTodo</code> method of the controller to the onsubmit function of the form, so that it will correctly add the todo when you click the &quot;Add&quot; button.</p>\n<p>Next, let us add the ability to archive old todos, add the following into the controller:</p>\n<pre><code class=\"lang-javascript\">ctrl.archive = function(){\n    var list = [];\n    ctrl.list.map(function(todo) {\n        if(!todo.done()) {\n            list.push(todo); \n        }\n    });\n    ctrl.list = list;\n};\n</code></pre>\n<p>And this button below the H1:</p>\n<pre><code class=\"lang-javascript\">BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n</code></pre>\n<h3><a name=\"completed-todo-app\" class=\"anchor\" href=\"#completed-todo-app\"><span class=\"header-link\">Completed todo app</span></a></h3><p>And you can now archive your todos. This completes the todo app functionally, your complete todo app should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.prop(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n\n        ctrl.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n\n        ctrl.addTodo = function(e){\n            var value = ctrl.vm.input();\n            if(value) {\n                var newTodo = new self.models.todo({\n                    text: ctrl.vm.input(),\n                    done: false\n                });\n                ctrl.list.push(newTodo);\n                ctrl.vm.input(&quot;&quot;);\n            }\n            e.preventDefault();\n            return false;\n        };\n\n        ctrl.archive = function(){\n            var list = [];\n            ctrl.list.map(function(todo) {\n                if(!todo.done()) {\n                    list.push(todo); \n                }\n            });\n            ctrl.list = list;\n        };\n\n        ctrl.vm = {\n            left: function(){\n                var count = 0;\n                ctrl.list.map(function(todo) {\n                    count += todo.done() ? 0 : 1;\n                });\n                return count;\n            },\n            done: function(todo){\n                return function() {\n                    todo.done(!todo.done());\n                }\n            },\n            input: m.p(&quot;&quot;)\n        };\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n                H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n                BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n                UL([\n                    ctrl.list.map(function(todo){\n                        return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                    })\n                ]),\n                FORM({ onsubmit: ctrl.addTodo }, [\n                    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n                    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n                ])\n            ]\n        };\n    }\n};\n</code></pre>\n<p>Next we recommend you read</p>\n<p><a href=\"/doc/Creating-a-todo-app-part-2-persistence.md\">Creating a todo app part 2 - persistence</a>, where we will go through adding data persistence functionality.</p>\n","Getting-started.md":"<p>This guide will take you through making your first miso app, it is assumed that you know the basics of how to use nodejs and mithril.</p>\n<h2><a name=\"installation\" class=\"anchor\" href=\"#installation\"><span class=\"header-link\">Installation</span></a></h2><p>To install miso, use npm:</p>\n<pre><code class=\"lang-javascript\">npm install misojs -g\n</code></pre>\n<p>To create and run a miso app in a new directory:</p>\n<pre><code class=\"lang-javascript\">miso -n myapp\ncd myapp\nmiso run\n</code></pre>\n<p>You should now see something like:</p>\n<pre><code>Miso is listening at http://localhost:6476 in development mode\n</code></pre><p>Open your browser at <code>http://localhost:6476</code> and you will see the default miso screen</p>\n<h2><a name=\"hello-world-app\" class=\"anchor\" href=\"#hello-world-app\"><span class=\"header-link\">Hello world app</span></a></h2><p>Create a new file <code>hello.js</code> in <code>myapp/mvc</code> like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new edit.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;Hello &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<p>Then open <a href=\"/doc/YOURNAME.md\">http://localhost:6476/hello/YOURNAME</a> and you should see &quot;Hello YOURNAME&quot;. Change the url to have your actual name instead of YOURNAME, you now know miso :)</p>\n<p>Let us take a look at what each piece of the code is actually doing:</p>\n<h3><a name=\"includes\" class=\"anchor\" href=\"#includes\"><span class=\"header-link\">Includes</span></a></h3><blockquote>\nSummary: Mithril is the only required library when apps, but using other included libraries is very useful\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n</code></pre>\n<p>Here we grab mithril, then miso utilities and sugar tags - technically speaking, we really only need mithril, but the other libraries are very useful as well as we will see.</p>\n<h3><a name=\"models\" class=\"anchor\" href=\"#models\"><span class=\"header-link\">Models</span></a></h3><blockquote>\nSummary: Use the automatic routing when you can, always put models on the &#39;models&#39; attribute of your mvc file\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n</code></pre>\n<p>Here a few important things are going on:</p>\n<ul>\n<li><p>By placing our <code>mvc</code> object on <code>module.exports.edit</code>, automatic routing is applied by miso - you can read more about <a href=\"/doc/How-miso-works#route-by-convention.md\">how the automatic routing works here</a>. </p>\n</li>\n<li><p>Placing our <code>hello</code> model on the <code>models</code> attribute of the object ensures that miso can figure out what your models are, and will create a persistence API automatically for you when the server starts up, so that you can save your models into the database.</p>\n</li>\n</ul>\n<h3><a name=\"controller\" class=\"anchor\" href=\"#controller\"><span class=\"header-link\">Controller</span></a></h3><blockquote>\nSummary: DO NOT forget to &#39;return this;&#39; in the controller, it is vital!\n</blockquote>\n\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var who = miso.getParam(&#39;hello_id&#39;, params);\n    this.model = new edit.models.hello({who: who});\n    return this;\n},\n</code></pre>\n<p>The controller uses <code>miso.getParam</code> to retreive the parameter - this is so that it can work seamlessly on both the server and client side. We create a new model, and very importantly <code>return this</code> ensures that miso can get access to the controller correctly.</p>\n<h3><a name=\"view\" class=\"anchor\" href=\"#view\"><span class=\"header-link\">View</span></a></h3><blockquote>\nSummary: Use sugartags to make the view look more like HTML\n</blockquote>\n\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return DIV(&quot;Hello &quot; + ctrl.model.who());\n    }\n}\n</code></pre>\n<p>The view is simply a javascript function that returns a structure. Here we use the <code>sugartags</code> library to render the DIV tag - this is strictly not required, but I find that people tend to understand the sugartags syntax better than pure mithril, as it looks a little more like HTML, though of course you could use standard mithril syntax if you prefer.</p>\n<h3><a name=\"next\" class=\"anchor\" href=\"#next\"><span class=\"header-link\">Next</span></a></h3><p>You now have a complete hello world app, and understand the fundamentals of the structure of a miso mvc application.</p>\n<p>We have only just scraped the surface of what miso is capable of, so next we recommend you read:</p>\n<p><a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a></p>\n","Goals.md":"<h1><a name=\"primary-goals\" class=\"anchor\" href=\"#primary-goals\"><span class=\"header-link\">Primary goals</span></a></h1><ul>\n<li>Easy setup of <a href=\"/doc/.md\">isomorphic</a> application based on <a href=\"/doc/mithril.js.md\">mithril</a></li>\n<li>Skeleton / scaffold / Boilerplate to allow users to very quickly get up and running.</li>\n<li>minimal core</li>\n<li>easy extendible</li>\n<li>DB agnostic (e. G. plugins for different ORM/ODM)</li>\n</ul>\n<h1><a name=\"components\" class=\"anchor\" href=\"#components\"><span class=\"header-link\">Components</span></a></h1><ul>\n<li>Routing</li>\n<li>View rendering</li>\n<li>i18n/l10n</li>\n<li>Rest-API (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>optional Websockets (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>easy testing (headless and Browser-Tests)</li>\n<li>login/session handling</li>\n<li>models with validation</li>\n</ul>\n<h1><a name=\"useful-libs\" class=\"anchor\" href=\"#useful-libs\"><span class=\"header-link\">Useful libs</span></a></h1><p>Here are some libraries we are considering using, (in no particular order):</p>\n<ul>\n<li>leveldb</li>\n<li>mithril-query</li>\n<li>translate.js</li>\n<li>i18next</li>\n</ul>\n<p>And some that we&#39;re already using:</p>\n<ul>\n<li>express</li>\n<li>browserify</li>\n<li>mocha/expect</li>\n<li>mithril-node-render</li>\n<li>mithril-sugartags</li>\n<li>mithril-bindings</li>\n<li>mithril-animate</li>\n<li>lodash</li>\n<li>validator</li>\n</ul>\n","Home.md":"<p>Welcome to the misojs wiki!</p>\n<h2><a name=\"getting-started\" class=\"anchor\" href=\"#getting-started\"><span class=\"header-link\">Getting started</span></a></h2><p>Read the <a href=\"/doc/Getting-started.md\">Getting started</a> guide!</p>\n<h2><a name=\"more-info\" class=\"anchor\" href=\"#more-info\"><span class=\"header-link\">More info</span></a></h2><p>See the <a href=\"/doc/misojs#install.md\">install guide</a>.\nRead <a href=\"/doc/How-miso-works.md\">how miso works</a>, and check out <a href=\"/doc/Patterns.md\">the patterns</a>, then create something cool!</p>\n","How-miso-works.md":"<h2><a name=\"models-views-controllers\" class=\"anchor\" href=\"#models-views-controllers\"><span class=\"header-link\">Models, views, controllers</span></a></h2><p>When creating a route, you must assign a controller and a view to it - this is achieved by creating a file in the <code>/mvc</code> directory - by convention, you should name it as per the path you want, (see the <a href=\"/doc/#routing.md\">routing section</a> for details).</p>\n<p>Here is a minimal example using the sugartags, and getting a parameter:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nmodule.exports.index = {\n    controller: function(params) {\n        this.who = miso.getParam(&#39;who&#39;, params, &#39;world&#39;);\n        return this;\n    },\n    view: function(ctrl){\n        with(sugartags) {\n            return DIV(&#39;Hello &#39; + ctrl.who);\n        }\n    }\n};\n</code></pre>\n<p>Save this into a file <code>/mvc/hello.js</code>, and open <a href=\"/doc/hellos.md\">http://localhost/hellos</a>, this will show &quot;Hello world&quot;. Note the &#39;s&#39; on the end - this is due to how the <a href=\"/doc/#route-by-convention.md\">route by convention</a> works.</p>\n<p>Now open <code>/cfg/routes.json</code>, and add the following routes:</p>\n<pre><code class=\"lang-javascript\">    &quot;/hello&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/hello/:who&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; }\n</code></pre>\n<p>Save the file, and go back to the browser, and you&#39;ll see an error! This is because we have now overridden the automatic route. Open <a href=\"/doc/hello.md\">http://localhost/hello</a>, and you&#39;ll see our action. Now open <a href=\"/doc/YOURNAME.md\">http://localhost/hello/YOURNAME</a>, and you&#39;ll see it getting the first parameter, and greeting you!</p>\n<h2><a name=\"routing\" class=\"anchor\" href=\"#routing\"><span class=\"header-link\">Routing</span></a></h2><p>The routing can be defined in one of two ways</p>\n<h3><a name=\"route-by-convention\" class=\"anchor\" href=\"#route-by-convention\"><span class=\"header-link\">Route by convention</span></a></h3><p>You can use a naming convention as follows:</p>\n<table>\n<thead>\n<tr>\n<th>Action</th>\n<th>Method</th>\n<th>URL</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>index</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39;</td>\n<td>List the items</td>\n</tr>\n<tr>\n<td>edit</td>\n<td>GET</td>\n<td>[controller]/[id]</td>\n<td>Display a form to edit the item</td>\n</tr>\n<tr>\n<td>new</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39; + &#39;/new&#39;</td>\n<td>Display a form to add a new item</td>\n</tr>\n</tbody>\n</table>\n<p>Say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/users&quot;.<br>Now say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.edit = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/user/:user_id&quot;, so that users can access via a route such as &quot;/user/27&quot; for use with ID of 27. <em>Note:</em> You can get the user_id using a miso utility: <code>var userId = miso.getParam(&#39;user_id&#39;, params);</code>.</p>\n<h3><a name=\"route-by-configuration\" class=\"anchor\" href=\"#route-by-configuration\"><span class=\"header-link\">Route by configuration</span></a></h3><p>By using <code>/cfg/routes.json</code> config file:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;[Pattern]&quot;: { &quot;method&quot;: &quot;[Method]&quot;, &quot;name&quot;: &quot;[Route name]&quot;, &quot;action&quot;: &quot;[Action]&quot; }\n}\n</code></pre>\n<p>Where:</p>\n<ul>\n<li><strong>Pattern</strong> - the <a href=\"/doc/#routing-patterns.md\">route pattern</a> we want, including any parameters</li>\n<li><strong>Method</strong> - one of &#39;GET&#39;, &#39;POST&#39;, &#39;PUT&#39;, &#39;DELETE&#39;</li>\n<li><strong>Route</strong> name - name of your route file from /mvc</li>\n<li><strong>Action</strong> - name of the action to call on your route file from /mvc</li>\n</ul>\n<p><strong>Example</strong></p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;home&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This will map a &quot;GET&quot; to the root of the URL for the <code>index</code> action in <code>home.js</code></p>\n<p><strong>Note:</strong> The routing config will override any automatically defined routes, so if you need multiple routes to point to the same action, you must manually define them. For example, if you have a mvc file named &quot;term.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/terms&quot;. Now, if you want to map it also to &quot;/AGB&quot;, you will need to add two entries in the routes config:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/terms&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/AGB&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This is because Miso assumes that if you override the defaulted routes, you actually want to replace them, not just override them. <em>Note:</em> this is correct behaviour, as it minority case is when you want more than one route pointing to the same action.</p>\n<h3><a name=\"routing-patterns\" class=\"anchor\" href=\"#routing-patterns\"><span class=\"header-link\">Routing patterns</span></a></h3><table>\n<thead>\n<tr>\n<th>Type</th>\n<th>Example</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Path</td>\n<td>&quot;/abcd&quot; - match paths starting with /abcd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/abc?d&quot; - match paths starting with /abcd and /abd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab+cd&quot; - match paths starting with /abcd, /abbcd, /abbbbbcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab*cd&quot; - match paths starting with /abcd, /abxcd, /abFOOcd, /abbArcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/a(bc)?d&quot; - will match paths starting with /ad and /abcd</td>\n</tr>\n<tr>\n<td>Regular Expression</td>\n<td>/\\/abc&#124;\\/xyz/ - will match paths starting with /abc and /xyz</td>\n</tr>\n<tr>\n<td>Array</td>\n<td>[&quot;/abcd&quot;, &quot;/xyza&quot;, /\\/lmn&#124;\\/pqr/] - match paths starting with /abcd, /xyza, /lmn, and /pqr</td>\n</tr>\n</tbody>\n</table>\n<h3><a name=\"links\" class=\"anchor\" href=\"#links\"><span class=\"header-link\">Links</span></a></h3><p>When you create links, in order to get the app to work as an SPA, you must pass in m.route as a config, so that the history will be updated correctly, for example:</p>\n<pre><code class=\"lang-javascript\">A({href:&quot;/users/new&quot;, config: m.route}, &quot;Add new user&quot;)\n</code></pre>\n<p>This will correctly work as a SPA. If you leave out <code>config: m.route</code>, the app will still work, but the page will reload every time the link is followed.</p>\n<p>Note: if you are planning to manually route, ie: use <code>m.route</code>, be sure to use the name of the route, not a URL. Ie: if you have a route &quot;/account&quot;, using <code>m.route(&quot;http://p1.io/account&quot;)</code> won&#39;t match, mithril is expecting <code>m.route(&quot;/account&quot;)</code> instead of the full URL.</p>\n<h2><a name=\"data-models\" class=\"anchor\" href=\"#data-models\"><span class=\"header-link\">Data models</span></a></h2><p>Data models are progressively enhanced mithril models - you simply create your model as usual, then add validation and type information as it becomes pertinent.\nFor example, say you have a model like so:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n    return this;\n}\n</code></pre>\n<p>In order to make it validatable, add the validator module:</p>\n<pre><code class=\"lang-javascript\">var validate = require(&#39;validator.modelbinder&#39;);\n</code></pre>\n<p>Then add a <code>isValid</code> validation method to your model, with any declarations based on <a href=\"/doc/validator.js#validators.md\">node validator</a>:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n\n    //    Validate the model        \n    this.isValid = validate.bind(this, {\n        name: {\n            isRequired: &quot;You must enter a name&quot;\n        },\n        email: {\n            isRequired: &quot;You must enter an email address&quot;,\n            isEmail: &quot;Must be a valid email address&quot;\n        }\n    });\n\n    return this;\n};\n</code></pre>\n<p>This creates a method that the miso database api can use to validate your model.\nYou get full access to the validation info as well, so you can show an error message near your field, for example:</p>\n<pre><code class=\"lang-javascript\">user.isValid(&#39;email&#39;)\n</code></pre>\n<p>Will return <code>true</code> if the <code>email</code> property of your user model is valid, or a list of errors messages if it is invalid:</p>\n<pre><code class=\"lang-javascript\">[&quot;You must enter an email address&quot;, &quot;Must be a valid email address&quot;]\n</code></pre>\n<p>So you can for example add a class name to a div surrounding your field like so:</p>\n<pre><code class=\"lang-javascript\">DIV({class: (ctrl.user.isValid(&#39;email&#39;) == true? &quot;valid&quot;: &quot;invalid&quot;)}, [...\n</code></pre>\n<p>And show the error messages like so:</p>\n<pre><code class=\"lang-javascript\">SPAN(ctrl.user.isValid(&#39;email&#39;) == true? &quot;&quot;: ctrl.user.isValid(&#39;email&#39;).join(&quot;, &quot;))\n</code></pre>\n<h2><a name=\"database-api-and-model-interaction\" class=\"anchor\" href=\"#database-api-and-model-interaction\"><span class=\"header-link\">Database api and model interaction</span></a></h2><p>Miso uses the model definitions that you declare in your <code>mvc</code> file to build up a set of models that the API can use, the model definitions work like this:</p>\n<ul>\n<li>On the models attribute of the mvc, we  define a standard mithril data model, (ie: a javascript object where properties can be either standard javascript data types, or a function that works as a getter/setter, eg: <code>m.prop</code>)</li>\n<li>On server startup, miso reads this and creates a cache of the model objects, including the name space of the model, eg: &quot;hello.edit.hello&quot;</li>\n<li>Models can optionally include data validation information, and the database api will get access to this.</li>\n</ul>\n<p>Assuming we have a model in the hello.models object like so:</p>\n<pre><code class=\"lang-javascript\">hello: function(data){\n    this.who = m.prop(data.who);\n    this.isValid = validate.bind(this, {\n        who: {\n            isRequired: &quot;You must know who you are talking to&quot;\n        }\n    });\n}\n</code></pre>\n<p>The API works like this:</p>\n<ul>\n<li>We create an endpoint at <code>/api</code> where each we load whatever api is configured in <code>/cfg/server.json</code>, and expose each method. For example <code>/api/save</code> is available for the default <code>flatfiledb</code> api.</li>\n<li>Next we create a set of API files - one for client, (/system/api.client.js), and one for server (/system/api.server.js) - each have the same methods, but do vastly different things:<ul>\n<li>api.client.js is a thin wrapper that uses mithril&#39;s m.request to create an ajax request to the server API, it simply passes messages back and forth (in JSON RPC 2.0 format).</li>\n<li>api.server.js calls the database api methods, which in turn handles models and validation so for example when a request is made and a <code>type</code> and <code>model</code> is included, we can re-construct the data model based on this info, for example you might send: {type: &#39;hello.edit.hello&#39;, model: {who: &#39;Dave&#39;}}, this can then be cast back into a model that we can call the <code>isValid</code> method on.</li>\n</ul>\n</li>\n</ul>\n<p><strong>Now, the important bit:</strong> The reason for all this functionality is that mithril internally delays rendering to the DOM whilst a request is going on, so we need to handle this within miso - in order to be able to render things on the server - so we have a binding system that delays rendering whilst an async request is still being executed. That means mithril-like code like this:</p>\n<pre><code class=\"lang-javascript\">controller: function(){\n    var ctrl = this;\n    api.find({type: &#39;hello.index.hello&#39;}).then(function(data) {\n        var list = Object.keys(data.result).map(function(key) {\n            var myHello = data.result[key];\n            return new self.models.hello(myHello);\n        });\n        ctrl.model = new ctrl.vm.todoList(list);\n    });\n    return ctrl;\n}\n</code></pre>\n<p>Will still work. Note: the magic here is that there is absolutely nothing in the code above that runs a callback to let mithril know the data is ready - this is a design feature of mithril to delay rendering automatically whilst an <code>m.request</code> is in progress, so we cater for this to have the ability to render the page server-side first, so that SEO works out of the box.</p>\n<h2><a name=\"client-vs-server-code\" class=\"anchor\" href=\"#client-vs-server-code\"><span class=\"header-link\">Client vs server code</span></a></h2><p>In miso, you include files using the standard nodejs <code>require</code> function. When you need to do something that works differently in the client than the server, there are a few ways you can achieve it:</p>\n<ul>\n<li>The recommended way is to create and require a file in the <code>modules/</code> directory, and then create the same file with a &quot;.client&quot; before the extension, and miso will automatically load that file for you on the client side instead. For example if you have <code>/modules/something.js</code>, if you create <code>/modules/something.client.js</code>, miso will automatically use that on the client.</li>\n<li>Another option is to use <code>miso.util</code> - you can use <code>miso.util.isServer()</code> to test if you&#39;re on the server or not, though it is better practice to use the &quot;.client&quot; method mentioned above - only use <code>isServer</code> if you absolutely have no other option.</li>\n</ul>\n<h2><a name=\"first-page-load\" class=\"anchor\" href=\"#first-page-load\"><span class=\"header-link\">First page load</span></a></h2><p>When a new user enters your site via a URL, and miso loads the first page, a number of things happen:</p>\n<ul>\n<li>The server generates the page, including any data the user might have access to. This is mainly for SEO purposes, but also to make the perceptible loading time less, plus provide beautiful urls out of the box. </li>\n<li>Once the page has loaded, mithril kicks in and creates a XHR (ajax) request to retreive the data, and setup any events and the virtual DOM, etc.</li>\n</ul>\n<p>Now you might be thinking: we don&#39;t really need that 2nd request for data - it&#39;s already in the page, right? Well, sort of - you see miso does not make any assumptions about the structure of your data, or how you want to use it in your models, so there is no way for us to re-use that data, as it could be any structure.\nAnother key feature of miso is the fact that all actions can be bookmarkable - for example the <a href=\"/doc/users.md\">/users</a> app - click on a user, and see the url change - we didn&#39;t do another server round-trip, but rather just a XHR request that returned the data we required - the UI was completely rendered client side - so it&#39;s really on that first time we load the page that you end up loading the data twice.</p>\n<p>So that is the reason the architecture works the way it does, and has that seemingly redundant 2nd request for the data - it is a small price to pay for SEO, and perceptibly quick loading pages and as mentioned, it only ever happens on the first page load.</p>\n<p>Of course you could implement caching of the data yourself, if the 2nd request is an issue - after all you might be loading quite a bit of data. One way to do this would be like so (warning: rather contrived example follows):</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../modules/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            who = miso.getParam(&#39;hello_id&#39;, params);\n\n        //    Check if our data is available, if so: use it.\n        if(typeof myPerson !== &quot;undefined&quot;) {\n            ctrl.model = new edit.models.hello({who: myPerson});\n        } else {\n        //    If not, load it first.\n            db.find({type: &#39;user.edit.user&#39;}).then(function(data) {\n                ctrl.model = new edit.models.hello({who: data.result[0].name});\n            });\n        }\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                //    Add a client side global variable with our data\n                SCRIPT(&quot;var myPerson = &#39;&quot; + ctrl.model.who() + &quot;&#39;&quot;),\n                DIV(&quot;G&#39;day &quot; + ctrl.model.who())\n            ]\n        }\n    }\n};\n</code></pre>\n<p>So this will only load the data on the server side - as you can see, we need to know the shape of the data to use it, and we are using a global variable here to store the data client side - I don&#39;t really recommend this approach, as it seems like a lot of work to save a single XHR request. However I understand you might have unique circumstances where the first data load could be a problem, so at least this is an option you can use to cache the data on first page load.</p>\n<h2><a name=\"requiring-files\" class=\"anchor\" href=\"#requiring-files\"><span class=\"header-link\">Requiring files</span></a></h2><p>When requiring files, be sure to do so in a static manner so that browserify is able to compile the client side script. Always use:</p>\n<pre><code class=\"lang-javascript\">var miso = require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>NEVER DO ANY OF THESE:</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar miso = new require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>This will create an object, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar thing = &#39;miso&#39;;\nvar miso = require(&#39;../server/&#39;+thing+&#39;.util.js&#39;);\n</code></pre>\n<p>This will create an expression, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n","Patterns.md":"<p>There are several ways you can write your app and miso is not opinionated about how you go about this so it is important that you choose a pattern that suits your needs. Below are a few suggested patterns to follow when developing apps.</p>\n<p><strong>Note:</strong> miso is a single page app that loads server rendered HTML from any URL, so that SEO works out of the box.</p>\n<h2><a name=\"single-url-mvc\" class=\"anchor\" href=\"#single-url-mvc\"><span class=\"header-link\">Single url mvc</span></a></h2><p>In this pattern everything that your mvc needs to do is done on a single url for all the associated actions. The advantage for this style of development is that you have everything in one mvc container, and you don&#39;t need to map any routes - of course the downside being that there are no routes for the user to bookmark. This is pattern works well for smaller entities where there are not too many interactions that the user can do - this is essentially how most mithril apps are written - self-contained, and at a single url.</p>\n<p>Here is a &quot;hello world&quot; example using the single url pattern</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new self.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>This would expose a url /hellos (note: the &#39;s&#39;), and would display &quot;Hello world&quot;. (You can change the route using custom routing)</p>\n<h2><a name=\"multi-url-mvc\" class=\"anchor\" href=\"#multi-url-mvc\"><span class=\"header-link\">Multi url mvc</span></a></h2><p>In this pattern we expose multiple mvc routes that in turn translate to multiple URLs. This is useful for splitting up your app, and ensuring each mvc has its own sets of concerns.</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar index = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new index.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who()),\n                A({href: &quot;/hello/Leo&quot;, config: m.route}, &quot;Click me for the edit action&quot;)\n            ];\n        }\n    }\n};\n\nvar edit = module.exports.edit = {\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new index.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>Here we also expose a &quot;/hello/[NAME]&quot; url, that will show your name when you visit /hello/[YOUR NAME], so there are now multiple urls for our SPA:</p>\n<ul>\n<li><strong>/hellos</strong> - this is intended to be an index page that lists all your &quot;hellos&quot;</li>\n<li><strong>/hello/[NAME]</strong> - this is intended to be an edit page where you can edit your &quot;hellos&quot;</li>\n</ul>\n<p>Note that the anchor tag has <code>config: m.route</code> in it&#39;s options - this is so that we can route automatically though mithril</p>\n"}; };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL21pc28udXRpbC5jbGllbnQuanMiLCJtdmMvZG9jLmpzIiwibXZjL2hlbGxvLmpzIiwibXZjL2hvbWUuanMiLCJtdmMvbGF5b3V0LmpzIiwibXZjL2xvZ2luLmpzIiwibXZjL3RvZG8uanMiLCJtdmMvdXNlci5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsLmJpbmRpbmdzL2Rpc3QvbWl0aHJpbC5iaW5kaW5ncy5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsLnN1Z2FydGFncy9taXRocmlsLnN1Z2FydGFncy5qcyIsIm5vZGVfbW9kdWxlcy9taXRocmlsL21pdGhyaWwuanMiLCJub2RlX21vZHVsZXMvdmFsaWRhdG9yLm1vZGVsYmluZGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3ZhbGlkYXRvci92YWxpZGF0b3IuanMiLCJwdWJsaWMvanMvbWl0aHJpbC5hbmltYXRlLmpzIiwicHVibGljL2pzL21pdGhyaWwuc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL21pc28uZG9jdW1lbnRhdGlvbi5qcyIsInN5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qcyIsInN5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuY2xpZW50LmpzIiwic3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5jbGllbnQuanMiLCJzeXN0ZW0vbWFpbi5qcyIsInN5c3RlbS9taXNvLnBlcm1pc3Npb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25nQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vXHRWYXJpb3VzIHV0aWxpdGllcyB0aGF0IG5vcm1hbGlzZSB1c2FnZSBiZXR3ZWVuIGNsaWVudCBhbmQgc2VydmVyXG4vL1x0VGhpcyBpcyB0aGUgY2xpZW50IHZlcnNpb24gLSBzZWUgbWlzby51dGlsLmpzIGZvciBzZXJ2ZXIgdmVyc2lvblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHQvL1x0QXJlIHdlIG9uIHRoZSBzZXJ2ZXI/XG5cdGlzU2VydmVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdFxuXHQvL1x0RWFjaCBhYnN0cmFjdGlvblxuXHQvL1x0XG5cdC8vXHRtaXNvLmVhY2goWydoZWxsbycsICd3b3JsZCddLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcblx0Ly9cdFx0Y29uc29sZS5sb2codmFsdWUsIGtleSk7XG5cdC8vXHR9KTtcblx0Ly9cdC8vXHRoZWxsbyAwXFxuaGVsbG8gMVxuXHQvL1xuXHQvLyBcdG1pc28uZWFjaCh7J2hlbGxvJzogJ3dvcmxkJ30sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuXHQvL1x0XHRjb25zb2xlLmxvZyh2YWx1ZSwga2V5KTtcblx0Ly9cdH0pO1xuXHQvL1x0Ly9cdHdvcmxkIGhlbGxvXG5cdC8vXG5cdGVhY2g6IGZ1bmN0aW9uKG9iaiwgZm4pIHtcblx0XHRpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJyApIHtcblx0XHRcdHJldHVybiBvYmoubWFwKGZuKTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIG9iaiA9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uKGtleSl7XG5cdFx0XHRcdHJldHVybiBmbihvYmpba2V5XSwga2V5KTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZm4ob2JqKTtcblx0XHR9XG5cdH0sXG5cblx0cmVhZHlCaW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGJpbmRpbmdzID0gW107XG5cdFx0cmV0dXJuIHtcblx0XHRcdGJpbmQ6IGZ1bmN0aW9uKGNiKSB7XG5cdFx0XHRcdGJpbmRpbmdzLnB1c2goY2IpO1xuXHRcdFx0fSxcblx0XHRcdHJlYWR5OiBmdW5jdGlvbigpe1xuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgYmluZGluZ3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRiaW5kaW5nc1tpXSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fSxcblxuXHQvL1x0R2V0IHBhcmFtZXRlcnMgZm9yIGFuIGFjdGlvblxuXHRnZXRQYXJhbTogZnVuY3Rpb24oa2V5LCBwYXJhbXMsIGRlZil7XG5cdFx0cmV0dXJuIHR5cGVvZiBtLnJvdXRlLnBhcmFtKGtleSkgIT09IFwidW5kZWZpbmVkXCI/IG0ucm91dGUucGFyYW0oa2V5KTogZGVmO1xuXHR9LFxuXG5cdC8vXHRHZXQgaW5mbyBmb3IgYW4gYWN0aW9uIGZyb20gdGhlIHBhcmFtc1xuXHRyb3V0ZUluZm86IGZ1bmN0aW9uKHBhcmFtcyl7XG5cdFx0LypcblxuXHRcdFx0cGF0aDogcmVxLnBhdGgsXG5cdFx0XHRwYXJhbXM6IHJlcS5wYXJhbXMsIFxuXHRcdFx0cXVlcnk6IHJlcS5xdWVyeSwgXG5cdFx0XHRzZXNzaW9uOiBzZXNzaW9uXG5cblx0XHQqL1xuXHRcdHJldHVybiB7XG5cdFx0XHRwYXRoOiBtLnJvdXRlKCksXG5cdFx0XHRwYXJhbXM6IHJlcS5wYXJhbXMsIFxuXHRcdFx0cXVlcnk6IHJlcS5xdWVyeSwgXG5cdFx0XHRzZXNzaW9uOiBzZXNzaW9uXG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0Ly9cdEdyYWIgdGhlIGdlbmVyYXRlZCBjbGllbnQgdmVyc2lvbi4uLlxuXHRkb2NzID0gcmVxdWlyZSgnLi4vcHVibGljL21pc28uZG9jdW1lbnRhdGlvbi5qcycpO1xuXG52YXIgaW5kZXggPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0Ly9cdE91ciBtb2RlbFxuXHRcdGRvY3M6IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhpcy5kb2NzID0gZGF0YS5kb2NzO1xuXHRcdFx0dGhpcy5pZCA9IGRhdGEuaWQ7XG5cdFx0XHR0aGlzLm5pY2VOYW1lID0gZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRcdHJldHVybiBuYW1lLnN1YnN0cigwLG5hbWUubGFzdEluZGV4T2YoXCIubWRcIikpLnNwbGl0KFwiLVwiKS5qb2luKFwiIFwiKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR0aGlzLm1vZGVsID0gbmV3IGluZGV4Lm1vZGVscy5kb2NzKHtcblx0XHRcdGRvY3M6IGRvY3MoKVxuXHRcdH0pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0dmFyIG1vZGVsID0gY3RybC5tb2RlbDtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiBcImRvYyBjd1wifSwgW1xuXHRcdFx0XHRESVYoXCJCZWxvdyBpcyBhIGxpc3Qgb2YgZG9jdW1lbnRhdGlvbiBmb3IgbWlzbzpcIiksXG5cdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRtaXNvLmVhY2gobW9kZWwuZG9jcywgZnVuY3Rpb24oZG9jLCBrZXkpe1xuXHRcdFx0XHRcdFx0Ly9cdFNraXAgaG9tZSBwYWdlLi4uXG5cdFx0XHRcdFx0XHRpZihrZXkgIT09IFwiSG9tZS5tZFwiKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBMSShcblx0XHRcdFx0XHRcdFx0XHRBKHtocmVmOiBcIi9kb2MvXCIgKyBrZXksIGNvbmZpZzogbS5yb3V0ZX0sIG1vZGVsLm5pY2VOYW1lKGtleSkpXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoXCJFeGFtcGxlczpcIiksXG5cdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRMSShBKHtocmVmOiBcIi90b2Rvc1wiLCBjb25maWc6IG0ucm91dGV9LCBcIlRvZG9zIGV4YW1wbGVcIikpLFxuXHRcdFx0XHRcdExJKEEoe2hyZWY6IFwiL3VzZXJzXCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiVXNlcnMgZXhhbXBsZVwiKSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdC8vXHRVc2UgbWFudWFsIHByaXNtLCBzbyB0aGF0IGl0IHdvcmtzIGluIFNQQSBtb2RlXG5cdFx0XHRcdFNDUklQVCh7c3JjOiBcIi9leHRlcm5hbC9wcmlzbS9wcmlzbS5qc1wiLCBcImRhdGEtbWFudWFsXCI6IFwiXCJ9KVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBkb2NfaWQgPSBtaXNvLmdldFBhcmFtKCdkb2NfaWQnLCBwYXJhbXMpO1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmRvY3Moe1xuXHRcdFx0ZG9jczogZG9jcygpLFxuXHRcdFx0aWQ6IGRvY19pZFxuXHRcdH0pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0dmFyIG1vZGVsID0gY3RybC5tb2RlbDtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiBcImRvYyBjd1wifSwgW1xuXHRcdFx0XHRMSU5LKHtocmVmOiBcIi9leHRlcm5hbC9wcmlzbS9wcmlzbS5jc3NcIiwgcmVsOiBcInN0eWxlc2hlZXRcIn0pLFxuXHRcdFx0XHRIMShtb2RlbC5uaWNlTmFtZShtb2RlbC5pZCkpLFxuXHRcdFx0XHRBUlRJQ0xFKG0udHJ1c3QobW9kZWwuZG9jc1ttb2RlbC5pZF0pKSxcblx0XHRcdFx0Ly9cdFVzZSBtYW51YWwgcHJpc20sIHNvIHRoYXQgaXQgd29ya3MgaW4gU1BBIG1vZGVcblx0XHRcdFx0U0NSSVBUKHtzcmM6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmpzXCIsIFwiZGF0YS1tYW51YWxcIjogXCJcIn0pLFxuXHRcdFx0XHRTQ1JJUFQoXCJQcmlzbS5oaWdobGlnaHRBbGwoKTtcIilcblx0XHRcdF0pO1xuXHRcdH1cblx0fVxufTsiLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bWlzbyA9IHJlcXVpcmUoXCIuLi9tb2R1bGVzL21pc28udXRpbC5jbGllbnQuanNcIiksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSk7XG5cbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0aGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIHdobyA9IG1pc28uZ2V0UGFyYW0oJ2hlbGxvX2lkJywgcGFyYW1zKTtcblx0XHR0aGlzLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IHdob30pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoXCJHJ2RheSBcIiArIGN0cmwubW9kZWwud2hvKCkpO1xuXHRcdH1cblx0fVxufTsiLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0c21vb3RoU2Nyb2xsID0gcmVxdWlyZSgnLi4vcHVibGljL2pzL21pdGhyaWwuc21vb3Roc2Nyb2xsLmpzJyk7XG5cbi8vXHRIb21lIHBhZ2VcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XG5cdG1vZGVsczoge1xuXHRcdGludHJvOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMudGV4dCA9IG0ucChcIkNyZWF0ZSBhcHBzIGluIGEgc25hcCFcIik7XG5cdFx0XHR0aGlzLmFuaSA9IG0ucCgwKTtcblx0XHRcdHRoaXMuZGVtb0ltZ1NyYyA9IG0ucChcImltZy9taXNvZGVtby5naWZcIik7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBjdHJsID0gdGhpcztcblxuXHRcdGN0cmwucmVwbGF5ID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciB0bXBTcmMgPSBjdHJsLm1vZGVsLmRlbW9JbWdTcmMoKTtcblx0XHRcdGN0cmwubW9kZWwuZGVtb0ltZ1NyYyhcIlwiKTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0Y3RybC5tb2RlbC5kZW1vSW1nU3JjKHRtcFNyYyk7XG5cdFx0XHR9LDApO1xuXHRcdH07XG5cblx0XHRjdHJsLm1vZGVsID0gbmV3IHNlbGYubW9kZWxzLmludHJvKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dmlldzogZnVuY3Rpb24oY3RybCl7XG5cdFx0dmFyIG8gPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKFtcblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiaW50cm9cIn0sIFtcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbnRyb1RleHRcIn0sIG8udGV4dCgpKSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJkZW1vSW1nXCJ9LCBbXG5cdFx0XHRcdFx0XHRJTUcoe2lkOiBcImRlbW9JbWdcIiwgc3JjOiBvLmRlbW9JbWdTcmMoKX0pLFxuXHRcdFx0XHRcdFx0U1BBTih7XCJjbGFzc1wiOiBcInJlcGxheUJ1dHRvblwiLCBvbmNsaWNrOiBjdHJsLnJlcGxheX0sIFwiUmVwbGF5XCIpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0QSh7XCJjbGFzc1wiOiBcImluc3RhbGxCdXR0b25cIiwgY29uZmlnOiBzbW9vdGhTY3JvbGwoY3RybCksIGhyZWY6IFwiI2luc3RhbGxhdGlvblwifSwgXCJJbnN0YWxsIG1pc28gbm93XCIpXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImN3XCJ9LCBbXG5cdFx0XHRcdFx0SDIoQSh7bmFtZTogXCJ3aGF0XCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiV2hhdCBpcyBtaXNvP1wiKSApLFxuXHRcdFx0XHRcdFAoXCJNaXNvIGlzIGFuIG9wZW4gc291cmNlIGlzb21vcnBoaWMgamF2YXNjcmlwdCBmcmFtZXdvcmsgdGhhdCBhbGxvd3MgeW91IHRvIHdyaXRlIGNvbXBsZXRlIGFwcHMgd2l0aCBtdWNoIGxlc3MgZWZmb3J0IHRoYW4gb3RoZXIgZnJhbWV3b3Jrcy4gTWlzbyBmZWF0dXJlczpcIixbXG5cdFx0XHRcdFx0XHRVTCh7XCJjbGFzc1wiOiBcImRvdExpc3RcIn0sIFtcblx0XHRcdFx0XHRcdFx0TEkoXCJTaW5nbGUgcGFnZSBhcHBzIHdpdGggc2VydmVyc2lkZSByZW5kZXJlZCBIVE1MIGZvciB0aGUgZmlyc3QgcGFnZSAtIHdvcmtzIHBlcmZlY3RseSB3aXRoIFNFTyBhbmQgb2xkZXIgYnJvd3NlcnNcIiksXG5cdFx0XHRcdFx0XHRcdExJKFwiQmVhdXRpZnVsIFVSTHMgLSB3aXRoIGEgZmxleGlibGUgcm91dGluZyBzeXN0ZW06IGF1dG9tYXRlIHNvbWUgcm91dGVzLCB0YWtlIGZ1bGwgY29udHJvbCBvZiBvdGhlcnNcIiksXG5cdFx0XHRcdFx0XHRcdExJKFwiVGlueSBjbGllbnRzaWRlIGZvb3RwcmludCAtIGxlc3MgdGhhbiAyNWtiIChnemlwcGVkIGFuZCBtaW5pZmllZClcIiksXG5cdFx0XHRcdFx0XHRcdExJKFwiRmFzdCBsaXZlLWNvZGUgcmVsb2FkIC0gc21hcnRlciByZWxvYWQgdG8gaGVscCB5b3Ugd29yayBmYXN0ZXJcIiksXG5cdFx0XHRcdFx0XHRcdExJKFtcIkhpZ2ggcGVyZm9ybWFuY2UgLSB2aXJ0dWFsIGRvbSBlbmdpbmUsIHRpbnkgZm9vdHByaW50LCBmYXN0ZXIgdGhhbiB0aGUgcmVzdFwiLCBBKHtocmVmOiBcImh0dHA6Ly9saG9yaWUuZ2l0aHViLmlvL21pdGhyaWwvYmVuY2htYXJrcy5odG1sXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sIFwiKlwiKV0pLFxuXHRcdFx0XHRcdFx0XHRMSShcIk11Y2ggbGVzcyBjb2RlIC0gY3JlYXRlIGEgZGVwbG95YWJsZSBhcHAgaW4gbGVzcyB0aGFuIDMwIGxpbmVzIG9mIGNvZGVcIiksXG5cdFx0XHRcdFx0XHRcdExJKFwiT3BlbiBzb3VyY2UgLSBNSVQgbGljZW5zZWRcIilcblx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0UChcIk1pc28gdXRpbGlzZXMgZXhjZWxsZW50IG9wZW4gc291cmNlIGxpYnJhcmllcyBhbmQgZnJhbWV3b3JrcyB0byBjcmVhdGUgYW4gZXh0cmVtZWx5IGVmZmljaWVudCBmdWxsIHdlYiBzdGFjay4gVGhlc2UgZnJhbWV3b3JrcyBpbmNsdWRlOlwiKSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJmcmFtZXdvcmtzXCJ9LCBbXG5cdFx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJmd2NvbnRhaW5lciBjZlwifSxbXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vbGhvcmllLmdpdGh1Yi5pby9taXRocmlsL1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LFxuXHRcdFx0XHRcdFx0XHRTUEFOKHtcImNsYXNzXCI6IFwiZncgbWl0aHJpbFwifSkpLFxuXHRcdFx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiZndMaW5rXCIsIGhyZWY6IFwiaHR0cDovL2V4cHJlc3Nqcy5jb20vXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sU1BBTih7XCJjbGFzc1wiOiBcImZ3IGV4cHJlc3NcIn0pKSxcblx0XHRcdFx0XHRcdFx0QSh7XCJjbGFzc1wiOiBcImZ3TGlua1wiLCBocmVmOiBcImh0dHA6Ly9icm93c2VyaWZ5Lm9yZy9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgYnJvd3NlcmlmeVwifSkpLFxuXHRcdFx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiZndMaW5rXCIsIGhyZWY6IFwiaHR0cDovL25vZGVtb24uaW8vXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sU1BBTih7XCJjbGFzc1wiOiBcImZ3IG5vZGVtb25cIn0pKVxuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJjd1wifSwgW1xuXHRcdFx0XHRcdEgyKHtpZDogXCJpbnN0YWxsYXRpb25cIn0sIEEoe25hbWU6IFwiaW5zdGFsbGF0aW9uXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiSW5zdGFsbGF0aW9uXCIpICksXG5cdFx0XHRcdFx0UChcIlRvIGluc3RhbGwgbWlzbywgdXNlIG5wbTpcIiksXG5cdFx0XHRcdFx0UFJFKHtcImNsYXNzXCI6IFwiamF2YXNjcmlwdFwifSxbXG5cdFx0XHRcdFx0XHRDT0RFKFwibnBtIGluc3RhbGwgbWlzb2pzIC1nXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcImdldHRpbmdzdGFydGVkXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiR2V0dGluZyBzdGFydGVkXCIpICksXG5cdFx0XHRcdFx0UChcIlRvIGNyZWF0ZSBhbmQgcnVuIGEgbWlzbyBhcHAgaW4gYSBuZXcgZGlyZWN0b3J5OlwiKSxcblx0XHRcdFx0XHRQUkUoe1wiY2xhc3NcIjogXCJqYXZhc2NyaXB0XCJ9LFtcblx0XHRcdFx0XHRcdENPREUoXCJtaXNvIC1uIG15QXBwXFxuY2QgbXlBcHBcXG5taXNvIHJ1blwiKVxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdFAoXCJDb25ncmF0dWxhdGlvbnMsIHlvdSBhcmUgbm93IHJ1bm5pbmcgeW91ciB2ZXJ5IG93biBtaXNvIGFwcCBpbiB0aGUgJ215QXBwJyBkaXJlY3RvcnkhXCIpXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImN3XCJ9LCBbXG5cdFx0XHRcdFx0SDIoQSh7bmFtZTogXCJleGFtcGxlc1wiLCBcImNsYXNzXCI6IFwiaGVhZGluZ1wifSxcIkV4YW1wbGVzXCIpKSxcblx0XHRcdFx0XHRVTChbXG5cdFx0XHRcdFx0XHRMSShBKHsgaHJlZjogJy90b2RvcycsIGNvbmZpZzogbS5yb3V0ZX0sIFwiVG9kb3MgZXhhbXBsZSAoc2luZ2xlIHVybCBTUEEpXCIpKSxcblx0XHRcdFx0XHRcdExJKEEoeyBocmVmOiAnL3VzZXJzJywgY29uZmlnOiBtLnJvdXRlfSwgXCJVc2VycyBleGFtcGxlIChtdWx0aXBsZSB1cmwgU1BBKVwiKSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRIMih7bmFtZTogXCJkb2N1bWVudGF0aW9uXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LCBcIkRvY3VtZW50YXRpb25cIiksXG5cdFx0XHRcdFx0QSh7aHJlZjpcIi9kb2NzXCJ9LCBcIkRvY3VtZW50YXRpb24gY2FuIGJlIGZvdW5kIGhlcmVcIilcblx0XHRcdFx0XSlcblx0XHRcdF0pO1xuXHRcdH1cblx0fVxufTtcbiIsIi8qXHRNaXNvIGxheW91dCBwYWdlXG5cblx0VGhpcyBsYXlvdXQgZGV0ZXJtaW5lcyB0aGUgSFRNTCBzdXJyb3VuZCBmb3IgZWFjaCBvZiB5b3VyIG12YyByb3V0ZXMuXG5cdEZlZWwgZnJlZSB0byBtb2RpZnkgYXMgeW91IHNlZSBmaXQgLSBhcyBsb25nIGFzIHRoZSBhdHRhY2hlbW50IG5vZGUgaXMgXG5cdHByZXNlbnQsIGl0IHNob3VsZCB3b3JrLlxuXG5cdE5vdGU6IHRoaXMgaXMgdGhlIG9ubHkgbXZjIHRoYXQgZG9lcyBub3QgcmVxdWlyZSBhIGNvbnRyb2xsZXIuXG4qL1xudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGF1dGhlbnRpY2F0aW9uID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qc1wiKShtKTtcblxuLy9cdFRoZSBoZWFkZXIgLSB0aGlzIGNhbiBhbHNvIGJlIHJlbmRlcmVkIGNsaWVudCBzaWRlXG5tb2R1bGUuZXhwb3J0cy5oZWFkZXJDb250ZW50ID0gZnVuY3Rpb24oY3RybCl7XG5cdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiAnY3cgY2YnfSwgW1xuXHRcdFx0RElWKHtcImNsYXNzXCI6ICdsb2dvJ30sXG5cdFx0XHRcdEEoe2FsdDogJ01JU08nLCBocmVmOicvJywgY29uZmlnOiBtLnJvdXRlfSwgW1xuXHRcdFx0XHRcdElNRyh7c3JjOiAnL2ltZy9taXNvX2xvZ28ucG5nJ30pXG5cdFx0XHRcdF0pXG5cdFx0XHQpLFxuXHRcdFx0TkFWKHtcImNsYXNzXCI6IFwibGVmdFwifSwgVUwoW1xuXHRcdFx0XHRMSShBKHtocmVmOiBcImh0dHA6Ly9taXNvanMuY29tL2RvY3NcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCJEb2N1bWVudGF0aW9uXCIpKVxuXHRcdFx0XSkpLFxuXHRcdFx0TkFWKHtcImNsYXNzXCI6IFwicmlnaHRcIn0sIFVMKFtcblx0XHRcdFx0TEkoQSh7aHJlZjogXCJodHRwczovL2dpdGh1Yi5jb20vanNndXkvbWlzb2pzXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sIFwiR2l0aHViXCIpKSxcblx0XHRcdFx0Ly9cdFRoaXMgbGluayBjb3VsZCBnbyB0byBhbiBhY2NvdW50IFxuXHRcdFx0XHQvL1x0cGFnZSBvciBzb21ldGhpbmcgbGlrZSB0aGF0XG5cblx0XHRcdFx0KGN0cmwubWlzb0dsb2JhbC5hdXRoZW50aWNhdGlvbkVuYWJsZWQ/XG5cdFx0XHRcdFx0KGN0cmwubWlzb0dsb2JhbC5pc0xvZ2dlZEluICYmIGN0cmwubWlzb0dsb2JhbC51c2VyTmFtZT8gXG5cdFx0XHRcdFx0XHRMSShBKHtvbmNsaWNrOiBmdW5jdGlvbihlKXtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnbG9nZ2luZyBvdXQsIHBsZWFzZSB3YWl0Li4uJyk7XG5cdFx0XHRcdFx0XHRcdFx0YXV0aGVudGljYXRpb24ubG9nb3V0KHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJZb3UndmUgYmVlbiBsb2dnZWQgb3V0XCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0bS5yb3V0ZShcIi9sb2dpblwiKTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH0sIGhyZWY6IFwiI1wiLCBpZDogXCJtaXNvVXNlck5hbWVcIn0sXG5cdFx0XHRcdFx0XHRcdFwiTG9nb3V0IFwiICsgY3RybC5taXNvR2xvYmFsLnVzZXJOYW1lKVxuXHRcdFx0XHRcdFx0KTpcblx0XHRcdFx0XHRcdExJKEEoe2hyZWY6IFwiL2xvZ2luXCJ9LCBcIkxvZ2luXCIpKVxuXHRcdFx0XHRcdCk6IFxuXHRcdFx0XHRcdFwiXCJcblx0XHRcdFx0KVxuXG5cdFx0XHRdKSlcblx0XHRdKTtcblx0fVxufTtcblxuLy9cdFRoZSBmdWxsIGxheW91dCAtIGFsd2F5cyBvbmx5IHJlbmRlcmVkIHNlcnZlciBzaWRlXG5tb2R1bGUuZXhwb3J0cy52aWV3ID0gZnVuY3Rpb24oY3RybCl7XG5cdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0cmV0dXJuIFtcblx0XHRcdG0udHJ1c3QoXCI8IWRvY3R5cGUgaHRtbD5cIiksXG5cdFx0XHRIVE1MKFtcblx0XHRcdFx0SEVBRChbXG5cdFx0XHRcdFx0TElOSyh7aHJlZjogJy9jc3Mvc3R5bGUuY3NzJywgcmVsOidzdHlsZXNoZWV0J30pLFxuXHRcdFx0XHRcdC8vXHRBZGQgaW4gdGhlIG1pc29HbG9iYWwgb2JqZWN0Li4uXG5cdFx0XHRcdFx0U0NSSVBUKFwidmFyIG1pc29HbG9iYWwgPSBcIisoY3RybC5taXNvR2xvYmFsPyBKU09OLnN0cmluZ2lmeShjdHJsLm1pc29HbG9iYWwpOiB7fSkrXCI7XCIpXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRCT0RZKHtcImNsYXNzXCI6ICdmaXhlZC1oZWFkZXInIH0sIFtcblx0XHRcdFx0XHRIRUFERVIoe2lkOiBcIm1pc29IZWFkZXJOb2RlXCJ9LCBjdHJsLmhlYWRlckNvbnRlbnQoY3RybCkpLFxuXHRcdFx0XHRcdFNFQ1RJT04oe2lkOiBjdHJsLm1pc29BdHRhY2htZW50Tm9kZX0sIGN0cmwuY29udGVudCksXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IFwibG9hZGVyXCJ9LCBbXG5cdFx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJsb2FkZXJcIn0pXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IFwiZm9vdGVyXCJ9LCBbXG5cdFx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogJ2N3IGNmJ30sIG0udHJ1c3QoXCJDb3B5cmlnaHQgJmNvcHk7IDIwMTUganNndXlcIikpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0Ly9TQ1JJUFQoe3NyYzogJy9taXNvLmpzJyArIChjdHJsLnJlbG9hZD8gXCI/Y2FjaGVLZXk9XCIgKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpOiBcIlwiKX0pLFxuXHRcdFx0XHRcdFNDUklQVCh7c3JjOiAnL21pc28uanMnfSksXG5cdFx0XHRcdFx0KGN0cmwucmVsb2FkPyBTQ1JJUFQoe3NyYzogJy9yZWxvYWQuanMnfSk6IFwiXCIpXG5cdFx0XHRcdF0pXG5cdFx0XHRdKVxuXHRcdF07XG5cdH1cbn07IiwiLyogRXhhbXBsZSBsb2dpbiBtdmMgKi9cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YXV0aGVudGljYXRpb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pLFxuXHRzZXNzaW9uID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvc2Vzc2lvbi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG52YXIgaW5kZXggPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0bG9naW46IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhpcy51cmwgPSBkYXRhLnVybDtcblx0XHRcdHRoaXMuaXNMb2dnZWRJbiA9IG0ucHJvcChmYWxzZSk7XG5cdFx0XHR0aGlzLnVzZXJuYW1lID0gbS5wcm9wKGRhdGEudXNlcm5hbWV8fFwiXCIpO1xuXHRcdFx0dGhpcy5wYXNzd29yZCA9IG0ucHJvcChcIlwiKTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcyxcblx0XHRcdHVybCA9IG1pc28uZ2V0UGFyYW0oJ3VybCcsIHBhcmFtcyksXG5cdFx0XHRsb2dvdXQgPSBtaXNvLmdldFBhcmFtKCdsb2dvdXQnLCBwYXJhbXMpO1xuXG5cdFx0Y3RybC5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMubG9naW4oe3VybDogdXJsfSk7XG5cblx0XHQvL1x0Tm90ZTogdGhpcyBkb2VzIG5vdCBleGVjdXRlIG9uIHRoZSBzZXJ2ZXIgYXMgaXQgXG5cdFx0Ly9cdGlzIGEgRE9NIGV2ZW50LlxuXHRcdGN0cmwubG9naW4gPSBmdW5jdGlvbihlKXtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdC8vXHRDYWxsIHRoZSBzZXJ2ZXIgbWV0aG9kIHRvIHNlZSBpZiB3ZSdyZSBsb2dnZWQgaW5cblx0XHRcdGF1dGhlbnRpY2F0aW9uLmxvZ2luKHt0eXBlOiAnbG9naW4uaW5kZXgubG9naW4nLCBtb2RlbDogY3RybC5tb2RlbH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGlmKGRhdGEucmVzdWx0LmlzTG9nZ2VkSW4gPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdC8vXHRXb290LCB3ZSdyZSBpbiFcblx0XHRcdFx0XHRtaXNvR2xvYmFsLmlzTG9nZ2VkSW4gPSB0cnVlO1xuXHRcdFx0XHRcdG1pc29HbG9iYWwudXNlck5hbWUgPSBkYXRhLnJlc3VsdC51c2VyTmFtZTtcblx0XHRcdFx0XHRjdHJsLm1vZGVsLmlzTG9nZ2VkSW4odHJ1ZSk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIldlbGNvbWUgXCIgKyBtaXNvR2xvYmFsLnVzZXJOYW1lICsgXCIsIHlvdSd2ZSBiZWVuIGxvZ2dlZCBpblwiKTtcblxuXHRcdFx0XHRcdC8vXHRXaWxsIHNob3cgdGhlIHVzZXJuYW1lIHdoZW4gbG9nZ2VkIGluXG5cdFx0XHRcdFx0bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIoKTtcblxuXHRcdFx0XHRcdGlmKHVybCl7XG5cdFx0XHRcdFx0XHRtLnJvdXRlKHVybCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vXHRHbyB0byBkZWZhdWx0IFVSTD9cblx0XHRcdFx0XHRcdG0ucm91dGUoXCIvXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblxuXHRcdGlmKGxvZ291dCkge1xuXHRcdFx0YXV0aGVudGljYXRpb24ubG9nb3V0KHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIllvdSd2ZSBiZWVuIGxvZ2dlZCBvdXRcIik7XG5cdFx0XHRcdC8vXHRXb290LCB3ZSdyZSBvdXQhXG5cdFx0XHRcdGN0cmwubW9kZWwuaXNMb2dnZWRJbihmYWxzZSk7XG5cdFx0XHRcdC8vIG1pc29HbG9iYWwuaXNMb2dnZWRJbiA9IGZhbHNlO1xuXHRcdFx0XHQvLyBkZWxldGUgbWlzb0dsb2JhbC51c2VyTmFtZTtcblx0XHRcdFx0Ly9cdFdpbGwgcmVtb3ZlIHRoZSB1c2VybmFtZSB3aGVuIGxvZ2dlZCBvdXRcblx0XHRcdFx0bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIoKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoe1wiY2xhc3NcIjogXCJjdyBjZlwifSwgXG5cdFx0XHRcdGN0cmwubW9kZWwuaXNMb2dnZWRJbigpPyBcIllvdSd2ZSBiZWVuIGxvZ2dlZCBpblwiOiBbXG5cdFx0XHRcdERJVihjdHJsLm1vZGVsLnVybD8gXCJQbGVhc2UgbG9nIGluIHRvIGdvIHRvIFwiICsgY3RybC5tb2RlbC51cmw6IFwiUGxlYXNlIGxvZyBpblwiKSxcblx0XHRcdFx0Rk9STSh7IG9uc3VibWl0OiBjdHJsLmxvZ2luIH0sIFtcblx0XHRcdFx0XHRJTlBVVCh7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogY3RybC5tb2RlbC51c2VybmFtZSwgcGxhY2Vob2xkZXI6IFwiVXNlcm5hbWVcIn0pLFxuXHRcdFx0XHRcdElOUFVUKHsgdHlwZTogXCJwYXNzd29yZFwiLCB2YWx1ZTogY3RybC5tb2RlbC5wYXNzd29yZH0pLFxuXHRcdFx0XHRcdEJVVFRPTih7IHR5cGU6IFwic3VibWl0XCJ9LCBcIkxvZ2luXCIpXG5cdFx0XHRcdF0pXG5cdFx0XHRdKTtcblx0XHR9XG5cdH0sXG5cdGF1dGhlbnRpY2F0ZTogZmFsc2Vcbn07IiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGRiID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHR0b2RvOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdHRoaXMudGV4dCA9IGRhdGEudGV4dDtcblx0XHRcdHRoaXMuZG9uZSA9IG0ucHJvcChkYXRhLmRvbmUgPT0gXCJmYWxzZVwiPyBmYWxzZTogZGF0YS5kb25lKTtcblx0XHRcdHRoaXMuX2lkID0gZGF0YS5faWQ7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXM7XG5cblx0XHRjdHJsLmxpc3QgPSBbXTtcblxuXHRcdGRiLmZpbmQoe3R5cGU6ICd0b2RvLmluZGV4LnRvZG8nfSwge2JhY2tncm91bmQ6IHRydWUsIGluaXRpYWxWYWx1ZTogW119KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRcdHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhkYXRhLnJlc3VsdFtrZXldKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Y3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XG5cdFx0XHR2YXIgdmFsdWUgPSBjdHJsLnZtLmlucHV0KCk7XG5cdFx0XHRpZih2YWx1ZSkge1xuXHRcdFx0XHR2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcblx0XHRcdFx0XHR0ZXh0OiBjdHJsLnZtLmlucHV0KCksXG5cdFx0XHRcdFx0ZG9uZTogZmFsc2Vcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xuXHRcdFx0XHRjdHJsLnZtLmlucHV0KFwiXCIpO1xuXHRcdFx0XHRkYi5zYXZlKHsgdHlwZTogJ3RvZG8uaW5kZXgudG9kbycsIG1vZGVsOiBuZXdUb2RvIH0gKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRcdFx0bmV3VG9kby5faWQgPSByZXMucmVzdWx0O1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXG5cdFx0Y3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBsaXN0ID0gW107XG5cdFx0XHRjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcblx0XHRcdFx0aWYoIXRvZG8uZG9uZSgpKSB7XG5cdFx0XHRcdFx0bGlzdC5wdXNoKHRvZG8pOyBcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRkYi5yZW1vdmUoeyB0eXBlOiAndG9kby5pbmRleC50b2RvJywgX2lkOiB0b2RvLl9pZCB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlc3VsdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Y3RybC5saXN0ID0gbGlzdDtcblx0XHR9O1xuXG5cdFx0Y3RybC52bSA9IHtcblx0XHRcdGxlZnQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBjb3VudCA9IDA7XG5cdFx0XHRcdGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xuXHRcdFx0XHRcdGNvdW50ICs9IHRvZG8uZG9uZSgpID8gMCA6IDE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gY291bnQ7XG5cdFx0XHR9LFxuXHRcdFx0ZG9uZTogZnVuY3Rpb24odG9kbyl7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGlucHV0OiBtLnByb3AoXCJcIilcblx0XHR9O1xuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiBcImN3IGNmXCJ9LCBbXG5cdFx0XHRcdFNUWUxFKFwiLmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fVwiKSxcblx0XHRcdFx0SDEoXCJUb2RvcyAtIFwiICsgY3RybC52bS5sZWZ0KCkgKyBcIiBvZiBcIiArIGN0cmwubGlzdC5sZW5ndGggKyBcIiByZW1haW5pbmdcIiksXG5cdFx0XHRcdEJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCBcIkFyY2hpdmVcIiksXG5cdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xuXHRcdFx0XHRcdFx0cmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyBcImRvbmVcIjogXCJcIiwgb25jbGljazogY3RybC52bS5kb25lKHRvZG8pIH0sIHRvZG8udGV4dCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdEZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcblx0XHRcdFx0XHRJTlBVVCh7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogY3RybC52bS5pbnB1dCwgcGxhY2Vob2xkZXI6IFwiQWRkIHRvZG9cIn0pLFxuXHRcdFx0XHRcdEJVVFRPTih7IHR5cGU6IFwic3VibWl0XCJ9LCBcIkFkZFwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG5cdC8vXHRUZXN0IGF1dGhlbnRpY2F0ZVxuXHQvLyxhdXRoZW50aWNhdGU6IHRydWVcbn07IiwiLypcblx0VGhpcyBpcyBhIHNhbXBsZSB1c2VyIG1hbmFnZW1lbnQgYXBwIHRoYXQgdXNlcyB0aGVcblx0bXVsdGlwbGUgdXJsIG1pc28gcGF0dGVybi5cbiovXG52YXIgbWlzbyA9IHJlcXVpcmUoXCIuLi9tb2R1bGVzL21pc28udXRpbC5jbGllbnQuanNcIiksXG5cdHZhbGlkYXRlID0gcmVxdWlyZSgndmFsaWRhdG9yLm1vZGVsYmluZGVyJyksXG5cdG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGJpbmRpbmdzID0gcmVxdWlyZSgnbWl0aHJpbC5iaW5kaW5ncycpKG0pLFxuXHRhcGkgPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pLFxuXHRzZWxmID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8vXHRTaGFyZWQgdmlld1xudmFyIGVkaXRWaWV3ID0gZnVuY3Rpb24oY3RybCl7XG5cdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0cmV0dXJuIERJVih7IGNsYXNzOiBcImN3XCIgfSwgW1xuXHRcdFx0SDIoe1wiY2xhc3NcIjogXCJwYWdlSGVhZGVyXCJ9LCBjdHJsLmhlYWRlciksXG5cdFx0XHRjdHJsLnVzZXIgPyBbXG5cdFx0XHRcdERJVihbXG5cdFx0XHRcdFx0TEFCRUwoXCJOYW1lXCIpLCBJTlBVVCh7dmFsdWU6IGN0cmwudXNlci5uYW1lfSksXG5cdFx0XHRcdFx0RElWKHtcImNsYXNzXCI6IChjdHJsLnVzZXIuaXNWYWxpZCgnbmFtZScpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJ2YWxpZFwiOiBcImludmFsaWRcIikgKyBcIiBpbmRlbnRlZFwifSwgW1xuXHRcdFx0XHRcdFx0Y3RybC51c2VyLmlzVmFsaWQoJ25hbWUnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwiXCI6IGN0cmwudXNlci5pc1ZhbGlkKCduYW1lJykuam9pbihcIiwgXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihbXG5cdFx0XHRcdFx0TEFCRUwoXCJFbWFpbFwiKSwgSU5QVVQoe3ZhbHVlOiBjdHJsLnVzZXIuZW1haWx9KSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogKGN0cmwudXNlci5pc1ZhbGlkKCdlbWFpbCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJ2YWxpZFwiOiBcImludmFsaWRcIikgKyBcIiBpbmRlbnRlZFwiIH0sIFtcblx0XHRcdFx0XHRcdGN0cmwudXNlci5pc1ZhbGlkKCdlbWFpbCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJcIjogY3RybC51c2VyLmlzVmFsaWQoJ2VtYWlsJykuam9pbihcIiwgXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihbXG5cdFx0XHRcdFx0TEFCRUwoXCJQYXNzd29yZFwiKSwgSU5QVVQoe3ZhbHVlOiBjdHJsLnVzZXIucGFzc3dvcmQsIHR5cGU6ICdwYXNzd29yZCd9KSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogKGN0cmwudXNlci5pc1ZhbGlkKCdwYXNzd29yZCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJ2YWxpZFwiOiBcImludmFsaWRcIikgKyBcIiBpbmRlbnRlZFwiIH0sIFtcblx0XHRcdFx0XHRcdGN0cmwudXNlci5pc1ZhbGlkKCdwYXNzd29yZCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJcIjogY3RybC51c2VyLmlzVmFsaWQoJ3Bhc3N3b3JkJykuam9pbihcIiwgXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImluZGVudGVkXCJ9LFtcblx0XHRcdFx0XHRCVVRUT04oe29uY2xpY2s6IGN0cmwuc2F2ZSwgY2xhc3M6IFwicG9zaXRpdmVcIn0sIFwiU2F2ZSB1c2VyXCIpLFxuXHRcdFx0XHRcdEJVVFRPTih7b25jbGljazogY3RybC5yZW1vdmUsIGNsYXNzOiBcIm5lZ2F0aXZlXCJ9LCBcIkRlbGV0ZSB1c2VyXCIpXG5cdFx0XHRcdF0pXG5cdFx0XHRdOiBESVYoXCJVc2VyIG5vdCBmb3VuZFwiKVxuXHRcdF0pO1xuXHR9XG59O1xuXG5cbi8vXHRVc2VyIGxpc3Rcbm1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXM7XG5cblx0XHRjdHJsLnZtID0ge1xuXHRcdFx0dXNlckxpc3Q6IGZ1bmN0aW9uKHVzZXJzKXtcblx0XHRcdFx0dGhpcy51c2VycyA9IG0ucCh1c2Vycyk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGFwaS5maW5kVXNlcnMoe3R5cGU6ICd1c2VyLmVkaXQudXNlcid9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGlmKGRhdGEuZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJFcnJvciBcIiArIGRhdGEuZXJyb3IpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihkYXRhLnJlc3VsdCkge1xuXHRcdFx0XHR2YXIgbGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBzZWxmLmVkaXQubW9kZWxzLnVzZXIoZGF0YS5yZXN1bHRba2V5XSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGN0cmwudXNlcnMgPSBuZXcgY3RybC52bS51c2VyTGlzdChsaXN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN0cmwudXNlcnMgPSBuZXcgY3RybC52bS51c2VyTGlzdChbXSk7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oKXtcblx0XHRcdGNvbnNvbGUubG9nKCdFcnJvcicsIGFyZ3VtZW50cyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0dmlldzogZnVuY3Rpb24oY3RybCl7XG5cdFx0dmFyIGMgPSBjdHJsLFxuXHRcdFx0dSA9IGMudXNlcnM7XG5cblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7IGNsYXNzOiBcImN3XCIgfSwgW1xuXHRcdFx0XHRVTChbXG5cdFx0XHRcdFx0dS51c2VycygpLm1hcChmdW5jdGlvbih1c2VyLCBpZHgpe1xuXHRcdFx0XHRcdFx0cmV0dXJuIExJKEEoeyBocmVmOiAnL3VzZXIvJyArIHVzZXIuaWQoKSwgY29uZmlnOiBtLnJvdXRlfSwgdXNlci5uYW1lKCkgKyBcIiAtIFwiICsgdXNlci5lbWFpbCgpKSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdEEoe1wiY2xhc3NcIjpcImJ1dHRvbiBwb3NpdGl2ZSBtdG9wXCIsIGhyZWY6XCIvdXNlcnMvbmV3XCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiQWRkIG5ldyB1c2VyXCIpXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cbn07XG5cblxuLy9cdE5ldyB1c2VyXG5tb2R1bGUuZXhwb3J0cy5uZXcgPSB7XG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcztcblx0XHRjdHJsLnVzZXIgPSBuZXcgc2VsZi5lZGl0Lm1vZGVscy51c2VyKHtuYW1lOiBcIlwiLCBlbWFpbDogXCJcIn0pO1xuXHRcdGN0cmwuaGVhZGVyID0gXCJOZXcgdXNlclwiO1xuXHRcdGN0cmwuc2hvd0Vycm9ycyA9IGZhbHNlO1xuXG5cdFx0Y3RybC5zYXZlID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGN0cmwudXNlci5pc1ZhbGlkKCkgIT09IHRydWUpIHtcblx0XHRcdFx0Y3RybC5zaG93RXJyb3JzID0gdHJ1ZTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgaXMgbm90IHZhbGlkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcGkuc2F2ZVVzZXIoeyB0eXBlOiAndXNlci5lZGl0LnVzZXInLCBtb2RlbDogY3RybC51c2VyIH0gKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJBZGRlZCB1c2VyXCIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0bS5yb3V0ZShcIi91c2Vyc1wiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBlZGl0Vmlld1xufTtcblxuXG4vL1x0RWRpdCB1c2VyXG5tb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xuXHRtb2RlbHM6IHtcblx0XHR1c2VyOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdHRoaXMubmFtZSA9IG0ucChkYXRhLm5hbWV8fFwiXCIpO1xuXHRcdFx0dGhpcy5lbWFpbCA9IG0ucChkYXRhLmVtYWlsfHxcIlwiKTtcblx0XHRcdC8vXHRQYXNzd29yZCBpcyBhbHdheXMgZW1wdHkgZmlyc3Rcblx0XHRcdHRoaXMucGFzc3dvcmQgPSBtLnAoZGF0YS5wYXNzd29yZHx8XCJcIik7XG5cdFx0XHR0aGlzLmlkID0gbS5wKGRhdGEuX2lkfHxcIlwiKTtcblxuXHRcdFx0Ly9cdFZhbGlkYXRlIHRoZSBtb2RlbFxuXHRcdFx0dGhpcy5pc1ZhbGlkID0gdmFsaWRhdGUuYmluZCh0aGlzLCB7XG5cdFx0XHRcdG5hbWU6IHtcblx0XHRcdFx0XHRpc1JlcXVpcmVkOiBcIllvdSBtdXN0IGVudGVyIGEgbmFtZVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhc3N3b3JkOiB7XG5cdFx0XHRcdFx0aXNSZXF1aXJlZDogXCJZb3UgbXVzdCBlbnRlciBhIHBhc3N3b3JkXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW1haWw6IHtcblx0XHRcdFx0XHRpc1JlcXVpcmVkOiBcIllvdSBtdXN0IGVudGVyIGFuIGVtYWlsIGFkZHJlc3NcIixcblx0XHRcdFx0XHRpc0VtYWlsOiBcIk11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCJcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzLFxuXHRcdFx0dXNlcklkID0gbWlzby5nZXRQYXJhbSgndXNlcl9pZCcsIHBhcmFtcyk7XG5cblx0XHRjdHJsLmhlYWRlciA9IFwiRWRpdCB1c2VyIFwiICsgdXNlcklkO1xuXG5cdFx0Ly9cdExvYWQgb3VyIHVzZXJcblx0XHRhcGkuZmluZFVzZXJzKHt0eXBlOiAndXNlci5lZGl0LnVzZXInLCBxdWVyeToge19pZDogdXNlcklkfX0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0dmFyIHVzZXIgPSBkYXRhLnJlc3VsdDtcblx0XHRcdGlmKHVzZXIgJiYgdXNlci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGN0cmwudXNlciA9IG5ldyBzZWxmLmVkaXQubW9kZWxzLnVzZXIodXNlclswXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnVXNlciBub3QgZm91bmQnLCB1c2VySWQpO1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3InLCBhcmd1bWVudHMpO1xuXHRcdH0pO1xuXG5cdFx0Y3RybC5zYXZlID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGN0cmwudXNlci5pc1ZhbGlkKCkgIT09IHRydWUpIHtcblx0XHRcdFx0Y3RybC5zaG93RXJyb3JzID0gdHJ1ZTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgaXMgbm90IHZhbGlkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcGkuc2F2ZVVzZXIoeyB0eXBlOiAndXNlci5lZGl0LnVzZXInLCBtb2RlbDogY3RybC51c2VyIH0gKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJTYXZlZCB1c2VyXCIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0bS5yb3V0ZShcIi91c2Vyc1wiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGN0cmwucmVtb3ZlID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNvbmZpcm0oXCJEZWxldGUgdXNlcj9cIikpIHtcblx0XHRcdFx0YXBpLnJlbW92ZSh7IHR5cGU6ICd1c2VyLmVkaXQudXNlcicsIF9pZDogdXNlcklkIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5yZXN1bHQpO1xuXHRcdFx0XHRcdG0ucm91dGUoXCIvdXNlcnNcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gY3RybDtcblx0fSxcblx0dmlldzogZWRpdFZpZXdcblx0Ly9cdEFueSBhdXRoZW50aWNhdGlvbiBpbmZvXG5cdC8vLCBhdXRoZW50aWNhdGU6IHRydWVcbn07XG4iLCIvL1x0TWl0aHJpbCBiaW5kaW5ncy5cbi8vXHRDb3B5cmlnaHQgKEMpIDIwMTQganNndXkgKE1pa2tlbCBCZXJnbWFubilcbi8vXHRNSVQgbGljZW5zZWRcbihmdW5jdGlvbigpe1xudmFyIG1pdGhyaWxCaW5kaW5ncyA9IGZ1bmN0aW9uKG0pe1xuXHRtLmJpbmRpbmdzID0gbS5iaW5kaW5ncyB8fCB7fTtcblxuXHQvL1x0UHViL1N1YiBiYXNlZCBleHRlbmRlZCBwcm9wZXJ0aWVzXG5cdG0ucCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0c3VicyA9IFtdLFxuXHRcdFx0cHJldlZhbHVlLFxuXHRcdFx0ZGVsYXkgPSBmYWxzZSxcblx0XHRcdC8vICBTZW5kIG5vdGlmaWNhdGlvbnMgdG8gc3Vic2NyaWJlcnNcblx0XHRcdG5vdGlmeSA9IGZ1bmN0aW9uICh2YWx1ZSwgcHJldlZhbHVlKSB7XG5cdFx0XHRcdHZhciBpO1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgc3Vicy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdHN1YnNbaV0uZnVuYy5hcHBseShzdWJzW2ldLmNvbnRleHQsIFt2YWx1ZSwgcHJldlZhbHVlXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRwcm9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBhcmd1bWVudHNbMF07XG5cdFx0XHRcdFx0aWYgKHByZXZWYWx1ZSAhPT0gdmFsdWUpIHtcblx0XHRcdFx0XHRcdHZhciB0bXBQcmV2ID0gcHJldlZhbHVlO1xuXHRcdFx0XHRcdFx0cHJldlZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRub3RpZnkodmFsdWUsIHRtcFByZXYpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9O1xuXG5cdFx0Ly9cdEFsbG93IHB1c2ggb24gYXJyYXlzXG5cdFx0cHJvcC5wdXNoID0gZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRpZih2YWx1ZS5wdXNoICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0dmFsdWUucHVzaCh2YWwpO1xuXHRcdFx0fVxuXHRcdFx0cHJvcCh2YWx1ZSk7XG5cdFx0fTtcblxuXHRcdC8vXHRTdWJzY3JpYmUgZm9yIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXNcblx0XHRwcm9wLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChmdW5jLCBjb250ZXh0KSB7XG5cdFx0XHRzdWJzLnB1c2goeyBmdW5jOiBmdW5jLCBjb250ZXh0OiBjb250ZXh0IHx8IHNlbGYgfSk7XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9O1xuXG5cdFx0Ly9cdEFsbG93IHByb3BlcnR5IHRvIG5vdCBhdXRvbWF0aWNhbGx5IHJlbmRlclxuXHRcdHByb3AuZGVsYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0ZGVsYXkgPSAhIXZhbHVlO1xuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fTtcblxuXHRcdC8vXHRBdXRvbWF0aWNhbGx5IHVwZGF0ZSByZW5kZXJpbmcgd2hlbiBhIHZhbHVlIGNoYW5nZXNcblx0XHQvL1x0QXMgbWl0aHJpbCB3YWl0cyBmb3IgYSByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSwgdGhpcyBzaG91bGQgYmUgb2suXG5cdFx0Ly9cdFlvdSBjYW4gdXNlIC5kZWxheSh0cnVlKSB0byBiZSBhYmxlIHRvIG1hbnVhbGx5IGhhbmRsZSB1cGRhdGVzXG5cdFx0cHJvcC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsKXtcblx0XHRcdGlmKCFkZWxheSkge1xuXHRcdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcblx0XHRcdFx0bS5lbmRDb21wdXRhdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gcHJvcDtcblx0fTtcblxuXHQvL1x0RWxlbWVudCBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgb3VyIGV4dGVuZGVkIGJpbmRpbmdzXG5cdC8vXHROb3RlOiBcblx0Ly9cdFx0LiBTb21lIGF0dHJpYnV0ZXMgY2FuIGJlIHJlbW92ZWQgd2hlbiBhcHBsaWVkLCBlZzogY3VzdG9tIGF0dHJpYnV0ZXNcblx0Ly9cdFxuXHRtLmUgPSBmdW5jdGlvbihlbGVtZW50LCBhdHRycywgY2hpbGRyZW4pIHtcblx0XHRmb3IgKHZhciBuYW1lIGluIGF0dHJzKSB7XG5cdFx0XHRpZiAobS5iaW5kaW5nc1tuYW1lXSkge1xuXHRcdFx0XHRtLmJpbmRpbmdzW25hbWVdLmZ1bmMuYXBwbHkoYXR0cnMsIFthdHRyc1tuYW1lXV0pO1xuXHRcdFx0XHRpZihtLmJpbmRpbmdzW25hbWVdLnJlbW92ZWFibGUpIHtcblx0XHRcdFx0XHRkZWxldGUgYXR0cnNbbmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG0oZWxlbWVudCwgYXR0cnMsIGNoaWxkcmVuKTtcblx0fTtcblxuXHQvL1x0QWRkIGJpbmRpbmdzIG1ldGhvZFxuXHQvL1x0Tm9uLXN0YW5kYXJkIGF0dHJpYnV0ZXMgZG8gbm90IG5lZWQgdG8gYmUgcmVuZGVyZWQsIGVnOiB2YWx1ZUlucHV0XG5cdC8vXHRzbyB0aGV5IGFyZSBzZXQgYXMgcmVtb3ZhYmxlXG5cdG0uYWRkQmluZGluZyA9IGZ1bmN0aW9uKG5hbWUsIGZ1bmMsIHJlbW92ZWFibGUpe1xuXHRcdG0uYmluZGluZ3NbbmFtZV0gPSB7XG5cdFx0XHRmdW5jOiBmdW5jLFxuXHRcdFx0cmVtb3ZlYWJsZTogcmVtb3ZlYWJsZVxuXHRcdH07XG5cdH07XG5cblx0Ly9cdEdldCB0aGUgdW5kZXJseWluZyB2YWx1ZSBvZiBhIHByb3BlcnR5XG5cdG0udW53cmFwID0gZnVuY3Rpb24ocHJvcCkge1xuXHRcdHJldHVybiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKT8gcHJvcCgpOiBwcm9wO1xuXHR9O1xuXG5cdC8vXHRCaS1kaXJlY3Rpb25hbCBiaW5kaW5nIG9mIHZhbHVlXG5cdG0uYWRkQmluZGluZyhcInZhbHVlXCIsIGZ1bmN0aW9uKHByb3ApIHtcblx0XHRpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aGlzLnZhbHVlID0gcHJvcCgpO1xuXHRcdFx0dGhpcy5vbmNoYW5nZSA9IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBwcm9wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy52YWx1ZSA9IHByb3A7XG5cdFx0fVxuXHR9KTtcblxuXHQvL1x0QmktZGlyZWN0aW9uYWwgYmluZGluZyBvZiBjaGVja2VkIHByb3BlcnR5XG5cdG0uYWRkQmluZGluZyhcImNoZWNrZWRcIiwgZnVuY3Rpb24ocHJvcCkge1xuXHRcdGlmICh0eXBlb2YgcHJvcCA9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHRoaXMuY2hlY2tlZCA9IHByb3AoKTtcblx0XHRcdHRoaXMub25jaGFuZ2UgPSBtLndpdGhBdHRyKFwiY2hlY2tlZFwiLCBwcm9wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jaGVja2VkID0gcHJvcDtcblx0XHR9XG5cdH0pO1xuXG5cdC8vXHRIaWRlIG5vZGVcblx0bS5hZGRCaW5kaW5nKFwiaGlkZVwiLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLnN0eWxlID0ge1xuXHRcdFx0ZGlzcGxheTogbS51bndyYXAocHJvcCk/IFwibm9uZVwiIDogXCJcIlxuXHRcdH07XG5cdH0sIHRydWUpO1xuXG5cdC8vXHRUb2dnbGUgdmFsdWUocykgb24gY2xpY2tcblx0bS5hZGRCaW5kaW5nKCd0b2dnbGUnLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9uY2xpY2sgPSBmdW5jdGlvbigpe1xuXHRcdFx0Ly9cdFRvZ2dsZSBhbGxvd3MgYW4gZW51bSBsaXN0IHRvIGJlIHRvZ2dsZWQsIGVnOiBbcHJvcCwgdmFsdWUyLCB2YWx1ZTJdXG5cdFx0XHR2YXIgaXNGdW5jID0gdHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicsIHRtcCwgaSwgdmFscyA9IFtdLCB2YWwsIHRWYWw7XG5cblx0XHRcdC8vXHRUb2dnbGUgYm9vbGVhblxuXHRcdFx0aWYoaXNGdW5jKSB7XG5cdFx0XHRcdHZhbHVlID0gcHJvcCgpO1xuXHRcdFx0XHRwcm9wKCF2YWx1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL1x0VG9nZ2xlIGVudW1lcmF0aW9uXG5cdFx0XHRcdHRtcCA9IHByb3BbMF07XG5cdFx0XHRcdHZhbCA9IHRtcCgpO1xuXHRcdFx0XHR2YWxzID0gcHJvcC5zbGljZSgxKTtcblx0XHRcdFx0dFZhbCA9IHZhbHNbMF07XG5cblx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGlmKHZhbCA9PSB2YWxzW2ldKSB7XG5cdFx0XHRcdFx0XHRpZih0eXBlb2YgdmFsc1tpKzFdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0XHR0VmFsID0gdmFsc1tpKzFdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRtcCh0VmFsKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9LCB0cnVlKTtcblxuXHQvL1x0U2V0IGhvdmVyIHN0YXRlcywgYSdsYSBqUXVlcnkgcGF0dGVyblxuXHRtLmFkZEJpbmRpbmcoJ2hvdmVyJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbm1vdXNlb3ZlciA9IHByb3BbMF07XG5cdFx0aWYocHJvcFsxXSkge1xuXHRcdFx0dGhpcy5vbm1vdXNlb3V0ID0gcHJvcFsxXTtcblx0XHR9XG5cdH0sIHRydWUgKTtcblxuXHQvL1x0QWRkIHZhbHVlIGJpbmRpbmdzIGZvciB2YXJpb3VzIGV2ZW50IHR5cGVzIFxuXHR2YXIgZXZlbnRzID0gW1wiSW5wdXRcIiwgXCJLZXl1cFwiLCBcIktleXByZXNzXCJdLFxuXHRcdGNyZWF0ZUJpbmRpbmcgPSBmdW5jdGlvbihuYW1lLCBldmUpe1xuXHRcdFx0Ly9cdEJpLWRpcmVjdGlvbmFsIGJpbmRpbmcgb2YgdmFsdWVcblx0XHRcdG0uYWRkQmluZGluZyhuYW1lLCBmdW5jdGlvbihwcm9wKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0aGlzLnZhbHVlID0gcHJvcCgpO1xuXHRcdFx0XHRcdHRoaXNbZXZlXSA9IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBwcm9wKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZhbHVlID0gcHJvcDtcblx0XHRcdFx0fVxuXHRcdFx0fSwgdHJ1ZSk7XG5cdFx0fTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0dmFyIGV2ZSA9IGV2ZW50c1tpXTtcblx0XHRjcmVhdGVCaW5kaW5nKFwidmFsdWVcIiArIGV2ZSwgXCJvblwiICsgZXZlLnRvTG93ZXJDYXNlKCkpO1xuXHR9XG5cblxuXHQvL1x0U2V0IGEgdmFsdWUgb24gYSBwcm9wZXJ0eVxuXHRtLnNldCA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRwcm9wKHZhbHVlKTtcblx0XHR9O1xuXHR9O1xuXG5cdC8qXHRSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjYW4gdHJpZ2dlciBhIGJpbmRpbmcgXG5cdFx0VXNhZ2U6IG9uY2xpY2s6IG0udHJpZ2dlcignYmluZGluZycsIHByb3ApXG5cdCovXG5cdG0udHJpZ2dlciA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIG5hbWUgPSBhcmdzWzBdLFxuXHRcdFx0XHRhcmdMaXN0ID0gYXJncy5zbGljZSgxKTtcblx0XHRcdGlmIChtLmJpbmRpbmdzW25hbWVdKSB7XG5cdFx0XHRcdG0uYmluZGluZ3NbbmFtZV0uZnVuYy5hcHBseSh0aGlzLCBhcmdMaXN0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiBtLmJpbmRpbmdzO1xufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsQmluZGluZ3M7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbWl0aHJpbEJpbmRpbmdzO1xuXHR9KTtcbn0gZWxzZSB7XG5cdG1pdGhyaWxCaW5kaW5ncyh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSk7XG59XG5cbn0oKSk7IiwiLy9cdE1pdGhyaWwgc3VnYXIgdGFncy5cbi8vXHRDb3B5cmlnaHQgKEMpIDIwMTUganNndXkgKE1pa2tlbCBCZXJnbWFubilcbi8vXHRNSVQgbGljZW5zZWRcbihmdW5jdGlvbigpe1xudmFyIG1pdGhyaWxTdWdhcnRhZ3MgPSBmdW5jdGlvbihtLCBzY29wZSl7XG5cdG0uc3VnYXJUYWdzID0gbS5zdWdhclRhZ3MgfHwge307XG5cdHNjb3BlID0gc2NvcGUgfHwgbTtcblxuXHR2YXIgYXJnID0gZnVuY3Rpb24obDEsIGwyKXtcblx0XHRcdHZhciBpO1xuXHRcdFx0Zm9yIChpIGluIGwyKSB7aWYobDIuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdFx0bDEucHVzaChsMltpXSk7XG5cdFx0XHR9fVxuXHRcdFx0cmV0dXJuIGwxO1xuXHRcdH0sIFxuXHRcdGdldENsYXNzTGlzdCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuXHRcdFx0dmFyIGksIHJlc3VsdDtcblx0XHRcdGZvcihpIGluIGFyZ3MpIHtcblx0XHRcdFx0aWYoYXJnc1tpXSAmJiBhcmdzW2ldLmNsYXNzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiAoYXJnc1tpXS5jbGFzcyA9PSBcInN0cmluZ1wiKT8gXG5cdFx0XHRcdFx0XHRhcmdzW2ldLmNsYXNzLnNwbGl0KFwiIFwiKTpcblx0XHRcdFx0XHRcdGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRtYWtlU3VnYXJUYWcgPSBmdW5jdGlvbih0YWcpIHtcblx0XHRcdHZhciBjLCBlbDtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdFx0XHQvL1x0aWYgY2xhc3MgaXMgc3RyaW5nLCBhbGxvdyB1c2Ugb2YgY2FjaGVcblx0XHRcdFx0aWYoYyA9IGdldENsYXNzTGlzdChhcmdzKSkge1xuXHRcdFx0XHRcdGVsID0gW3RhZyArIFwiLlwiICsgYy5qb2luKFwiLlwiKV07XG5cdFx0XHRcdFx0Ly9cdFJlbW92ZSBjbGFzcyB0YWcsIHNvIHdlIGRvbid0IGR1cGxpY2F0ZVxuXHRcdFx0XHRcdGZvcih2YXIgaSBpbiBhcmdzKSB7XG5cdFx0XHRcdFx0XHRpZihhcmdzW2ldICYmIGFyZ3NbaV0uY2xhc3MpIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIGFyZ3NbaV0uY2xhc3M7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVsID0gW3RhZ107XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIChtLmU/IG0uZTogbSkuYXBwbHkodGhpcywgYXJnKGVsLCBhcmdzKSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0dGFnTGlzdCA9IFtcIkFcIixcIkFCQlJcIixcIkFDUk9OWU1cIixcIkFERFJFU1NcIixcIkFSRUFcIixcIkFSVElDTEVcIixcIkFTSURFXCIsXCJBVURJT1wiLFwiQlwiLFwiQkRJXCIsXCJCRE9cIixcIkJJR1wiLFwiQkxPQ0tRVU9URVwiLFwiQk9EWVwiLFwiQlJcIixcIkJVVFRPTlwiLFwiQ0FOVkFTXCIsXCJDQVBUSU9OXCIsXCJDSVRFXCIsXCJDT0RFXCIsXCJDT0xcIixcIkNPTEdST1VQXCIsXCJDT01NQU5EXCIsXCJEQVRBTElTVFwiLFwiRERcIixcIkRFTFwiLFwiREVUQUlMU1wiLFwiREZOXCIsXCJESVZcIixcIkRMXCIsXCJEVFwiLFwiRU1cIixcIkVNQkVEXCIsXCJGSUVMRFNFVFwiLFwiRklHQ0FQVElPTlwiLFwiRklHVVJFXCIsXCJGT09URVJcIixcIkZPUk1cIixcIkZSQU1FXCIsXCJGUkFNRVNFVFwiLFwiSDFcIixcIkgyXCIsXCJIM1wiLFwiSDRcIixcIkg1XCIsXCJINlwiLFwiSEVBRFwiLFwiSEVBREVSXCIsXCJIR1JPVVBcIixcIkhSXCIsXCJIVE1MXCIsXCJJXCIsXCJJRlJBTUVcIixcIklNR1wiLFwiSU5QVVRcIixcIklOU1wiLFwiS0JEXCIsXCJLRVlHRU5cIixcIkxBQkVMXCIsXCJMRUdFTkRcIixcIkxJXCIsXCJMSU5LXCIsXCJNQVBcIixcIk1BUktcIixcIk1FVEFcIixcIk1FVEVSXCIsXCJOQVZcIixcIk5PU0NSSVBUXCIsXCJPQkpFQ1RcIixcIk9MXCIsXCJPUFRHUk9VUFwiLFwiT1BUSU9OXCIsXCJPVVRQVVRcIixcIlBcIixcIlBBUkFNXCIsXCJQUkVcIixcIlBST0dSRVNTXCIsXCJRXCIsXCJSUFwiLFwiUlRcIixcIlJVQllcIixcIlNBTVBcIixcIlNDUklQVFwiLFwiU0VDVElPTlwiLFwiU0VMRUNUXCIsXCJTTUFMTFwiLFwiU09VUkNFXCIsXCJTUEFOXCIsXCJTUExJVFwiLFwiU1RST05HXCIsXCJTVFlMRVwiLFwiU1VCXCIsXCJTVU1NQVJZXCIsXCJTVVBcIixcIlRBQkxFXCIsXCJUQk9EWVwiLFwiVERcIixcIlRFWFRBUkVBXCIsXCJURk9PVFwiLFwiVEhcIixcIlRIRUFEXCIsXCJUSU1FXCIsXCJUSVRMRVwiLFwiVFJcIixcIlRSQUNLXCIsXCJUVFwiLFwiVUxcIixcIlZBUlwiLFwiVklERU9cIixcIldCUlwiXSxcblx0XHRsb3dlclRhZ0NhY2hlID0ge30sXG5cdFx0aTtcblxuXHQvL1x0Q3JlYXRlIHN1Z2FyJ2QgZnVuY3Rpb25zIGluIHRoZSByZXF1aXJlZCBzY29wZXNcblx0Zm9yIChpIGluIHRhZ0xpc3QpIHtpZih0YWdMaXN0Lmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0KGZ1bmN0aW9uKHRhZyl7XG5cdFx0XHR2YXIgbG93ZXJUYWcgPSB0YWcudG9Mb3dlckNhc2UoKTtcblx0XHRcdHNjb3BlW3RhZ10gPSBsb3dlclRhZ0NhY2hlW2xvd2VyVGFnXSA9IG1ha2VTdWdhclRhZyhsb3dlclRhZyk7XG5cdFx0fSh0YWdMaXN0W2ldKSk7XG5cdH19XG5cblx0Ly9cdExvd2VyY2FzZWQgc3VnYXIgdGFnc1xuXHRtLnN1Z2FyVGFncy5sb3dlciA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGxvd2VyVGFnQ2FjaGU7XG5cdH07XG5cblx0cmV0dXJuIHNjb3BlO1xufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsU3VnYXJ0YWdzO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1pdGhyaWxTdWdhcnRhZ3M7XG5cdH0pO1xufSBlbHNlIHtcblx0bWl0aHJpbFN1Z2FydGFncyhcblx0XHR0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSxcblx0XHR0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdzoge31cblx0KTtcbn1cblxufSgpKTsiLCJ2YXIgbSA9IChmdW5jdGlvbiBhcHAod2luZG93LCB1bmRlZmluZWQpIHtcclxuXHR2YXIgT0JKRUNUID0gXCJbb2JqZWN0IE9iamVjdF1cIiwgQVJSQVkgPSBcIltvYmplY3QgQXJyYXldXCIsIFNUUklORyA9IFwiW29iamVjdCBTdHJpbmddXCIsIEZVTkNUSU9OID0gXCJmdW5jdGlvblwiO1xyXG5cdHZhciB0eXBlID0ge30udG9TdHJpbmc7XHJcblx0dmFyIHBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbLis/XFxdKS9nLCBhdHRyUGFyc2VyID0gL1xcWyguKz8pKD86PShcInwnfCkoLio/KVxcMik/XFxdLztcclxuXHR2YXIgdm9pZEVsZW1lbnRzID0gL14oQVJFQXxCQVNFfEJSfENPTHxDT01NQU5EfEVNQkVEfEhSfElNR3xJTlBVVHxLRVlHRU58TElOS3xNRVRBfFBBUkFNfFNPVVJDRXxUUkFDS3xXQlIpJC87XHJcblxyXG5cdC8vIGNhY2hpbmcgY29tbW9ubHkgdXNlZCB2YXJpYWJsZXNcclxuXHR2YXIgJGRvY3VtZW50LCAkbG9jYXRpb24sICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUsICRjYW5jZWxBbmltYXRpb25GcmFtZTtcclxuXHJcblx0Ly8gc2VsZiBpbnZva2luZyBmdW5jdGlvbiBuZWVkZWQgYmVjYXVzZSBvZiB0aGUgd2F5IG1vY2tzIHdvcmtcclxuXHRmdW5jdGlvbiBpbml0aWFsaXplKHdpbmRvdyl7XHJcblx0XHQkZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XHJcblx0XHQkbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb247XHJcblx0XHQkY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNsZWFyVGltZW91dDtcclxuXHRcdCRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5zZXRUaW1lb3V0O1xyXG5cdH1cclxuXHJcblx0aW5pdGlhbGl6ZSh3aW5kb3cpO1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQHR5cGVkZWYge1N0cmluZ30gVGFnXHJcblx0ICogQSBzdHJpbmcgdGhhdCBsb29rcyBsaWtlIC0+IGRpdi5jbGFzc25hbWUjaWRbcGFyYW09b25lXVtwYXJhbTI9dHdvXVxyXG5cdCAqIFdoaWNoIGRlc2NyaWJlcyBhIERPTSBub2RlXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtUYWd9IFRoZSBET00gbm9kZSB0YWdcclxuXHQgKiBAcGFyYW0ge09iamVjdD1bXX0gb3B0aW9uYWwga2V5LXZhbHVlIHBhaXJzIHRvIGJlIG1hcHBlZCB0byBET00gYXR0cnNcclxuXHQgKiBAcGFyYW0gey4uLm1Ob2RlPVtdfSBaZXJvIG9yIG1vcmUgTWl0aHJpbCBjaGlsZCBub2Rlcy4gQ2FuIGJlIGFuIGFycmF5LCBvciBzcGxhdCAob3B0aW9uYWwpXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtKCkge1xyXG5cdFx0dmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcblx0XHR2YXIgaGFzQXR0cnMgPSBhcmdzWzFdICE9IG51bGwgJiYgdHlwZS5jYWxsKGFyZ3NbMV0pID09PSBPQkpFQ1QgJiYgIShcInRhZ1wiIGluIGFyZ3NbMV0pICYmICEoXCJzdWJ0cmVlXCIgaW4gYXJnc1sxXSk7XHJcblx0XHR2YXIgYXR0cnMgPSBoYXNBdHRycyA/IGFyZ3NbMV0gOiB7fTtcclxuXHRcdHZhciBjbGFzc0F0dHJOYW1lID0gXCJjbGFzc1wiIGluIGF0dHJzID8gXCJjbGFzc1wiIDogXCJjbGFzc05hbWVcIjtcclxuXHRcdHZhciBjZWxsID0ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9fTtcclxuXHRcdHZhciBtYXRjaCwgY2xhc3NlcyA9IFtdO1xyXG5cdFx0aWYgKHR5cGUuY2FsbChhcmdzWzBdKSAhPSBTVFJJTkcpIHRocm93IG5ldyBFcnJvcihcInNlbGVjdG9yIGluIG0oc2VsZWN0b3IsIGF0dHJzLCBjaGlsZHJlbikgc2hvdWxkIGJlIGEgc3RyaW5nXCIpXHJcblx0XHR3aGlsZSAobWF0Y2ggPSBwYXJzZXIuZXhlYyhhcmdzWzBdKSkge1xyXG5cdFx0XHRpZiAobWF0Y2hbMV0gPT09IFwiXCIgJiYgbWF0Y2hbMl0pIGNlbGwudGFnID0gbWF0Y2hbMl07XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09PSBcIiNcIikgY2VsbC5hdHRycy5pZCA9IG1hdGNoWzJdO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCIuXCIpIGNsYXNzZXMucHVzaChtYXRjaFsyXSk7XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzNdWzBdID09PSBcIltcIikge1xyXG5cdFx0XHRcdHZhciBwYWlyID0gYXR0clBhcnNlci5leGVjKG1hdGNoWzNdKTtcclxuXHRcdFx0XHRjZWxsLmF0dHJzW3BhaXJbMV1dID0gcGFpclszXSB8fCAocGFpclsyXSA/IFwiXCIgOnRydWUpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChjbGFzc2VzLmxlbmd0aCA+IDApIGNlbGwuYXR0cnNbY2xhc3NBdHRyTmFtZV0gPSBjbGFzc2VzLmpvaW4oXCIgXCIpO1xyXG5cclxuXHJcblx0XHR2YXIgY2hpbGRyZW4gPSBoYXNBdHRycyA/IGFyZ3NbMl0gOiBhcmdzWzFdO1xyXG5cdFx0aWYgKHR5cGUuY2FsbChjaGlsZHJlbikgPT09IEFSUkFZKSB7XHJcblx0XHRcdGNlbGwuY2hpbGRyZW4gPSBjaGlsZHJlblxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNlbGwuY2hpbGRyZW4gPSBoYXNBdHRycyA/IGFyZ3Muc2xpY2UoMikgOiBhcmdzLnNsaWNlKDEpXHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gYXR0cnMpIHtcclxuXHRcdFx0aWYgKGF0dHJOYW1lID09PSBjbGFzc0F0dHJOYW1lKSB7XHJcblx0XHRcdFx0aWYgKGF0dHJzW2F0dHJOYW1lXSAhPT0gXCJcIikgY2VsbC5hdHRyc1thdHRyTmFtZV0gPSAoY2VsbC5hdHRyc1thdHRyTmFtZV0gfHwgXCJcIikgKyBcIiBcIiArIGF0dHJzW2F0dHJOYW1lXTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gYXR0cnNbYXR0ck5hbWVdXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY2VsbFxyXG5cdH1cclxuXHRmdW5jdGlvbiBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIHBhcmVudENhY2hlLCBwYXJlbnRJbmRleCwgZGF0YSwgY2FjaGVkLCBzaG91bGRSZWF0dGFjaCwgaW5kZXgsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcclxuXHRcdC8vYGJ1aWxkYCBpcyBhIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IG1hbmFnZXMgY3JlYXRpb24vZGlmZmluZy9yZW1vdmFsIG9mIERPTSBlbGVtZW50cyBiYXNlZCBvbiBjb21wYXJpc29uIGJldHdlZW4gYGRhdGFgIGFuZCBgY2FjaGVkYFxyXG5cdFx0Ly90aGUgZGlmZiBhbGdvcml0aG0gY2FuIGJlIHN1bW1hcml6ZWQgYXMgdGhpczpcclxuXHRcdC8vMSAtIGNvbXBhcmUgYGRhdGFgIGFuZCBgY2FjaGVkYFxyXG5cdFx0Ly8yIC0gaWYgdGhleSBhcmUgZGlmZmVyZW50LCBjb3B5IGBkYXRhYCB0byBgY2FjaGVkYCBhbmQgdXBkYXRlIHRoZSBET00gYmFzZWQgb24gd2hhdCB0aGUgZGlmZmVyZW5jZSBpc1xyXG5cdFx0Ly8zIC0gcmVjdXJzaXZlbHkgYXBwbHkgdGhpcyBhbGdvcml0aG0gZm9yIGV2ZXJ5IGFycmF5IGFuZCBmb3IgdGhlIGNoaWxkcmVuIG9mIGV2ZXJ5IHZpcnR1YWwgZWxlbWVudFxyXG5cclxuXHRcdC8vdGhlIGBjYWNoZWRgIGRhdGEgc3RydWN0dXJlIGlzIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyByZWRyYXcncyBgZGF0YWAgZGF0YSBzdHJ1Y3R1cmUsIHdpdGggYSBmZXcgYWRkaXRpb25zOlxyXG5cdFx0Ly8tIGBjYWNoZWRgIGFsd2F5cyBoYXMgYSBwcm9wZXJ0eSBjYWxsZWQgYG5vZGVzYCwgd2hpY2ggaXMgYSBsaXN0IG9mIERPTSBlbGVtZW50cyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGRhdGEgcmVwcmVzZW50ZWQgYnkgdGhlIHJlc3BlY3RpdmUgdmlydHVhbCBlbGVtZW50XHJcblx0XHQvLy0gaW4gb3JkZXIgdG8gc3VwcG9ydCBhdHRhY2hpbmcgYG5vZGVzYCBhcyBhIHByb3BlcnR5IG9mIGBjYWNoZWRgLCBgY2FjaGVkYCBpcyAqYWx3YXlzKiBhIG5vbi1wcmltaXRpdmUgb2JqZWN0LCBpLmUuIGlmIHRoZSBkYXRhIHdhcyBhIHN0cmluZywgdGhlbiBjYWNoZWQgaXMgYSBTdHJpbmcgaW5zdGFuY2UuIElmIGRhdGEgd2FzIGBudWxsYCBvciBgdW5kZWZpbmVkYCwgY2FjaGVkIGlzIGBuZXcgU3RyaW5nKFwiXCIpYFxyXG5cdFx0Ly8tIGBjYWNoZWQgYWxzbyBoYXMgYSBgY29uZmlnQ29udGV4dGAgcHJvcGVydHksIHdoaWNoIGlzIHRoZSBzdGF0ZSBzdG9yYWdlIG9iamVjdCBleHBvc2VkIGJ5IGNvbmZpZyhlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KVxyXG5cdFx0Ly8tIHdoZW4gYGNhY2hlZGAgaXMgYW4gT2JqZWN0LCBpdCByZXByZXNlbnRzIGEgdmlydHVhbCBlbGVtZW50OyB3aGVuIGl0J3MgYW4gQXJyYXksIGl0IHJlcHJlc2VudHMgYSBsaXN0IG9mIGVsZW1lbnRzOyB3aGVuIGl0J3MgYSBTdHJpbmcsIE51bWJlciBvciBCb29sZWFuLCBpdCByZXByZXNlbnRzIGEgdGV4dCBub2RlXHJcblxyXG5cdFx0Ly9gcGFyZW50RWxlbWVudGAgaXMgYSBET00gZWxlbWVudCB1c2VkIGZvciBXM0MgRE9NIEFQSSBjYWxsc1xyXG5cdFx0Ly9gcGFyZW50VGFnYCBpcyBvbmx5IHVzZWQgZm9yIGhhbmRsaW5nIGEgY29ybmVyIGNhc2UgZm9yIHRleHRhcmVhIHZhbHVlc1xyXG5cdFx0Ly9gcGFyZW50Q2FjaGVgIGlzIHVzZWQgdG8gcmVtb3ZlIG5vZGVzIGluIHNvbWUgbXVsdGktbm9kZSBjYXNlc1xyXG5cdFx0Ly9gcGFyZW50SW5kZXhgIGFuZCBgaW5kZXhgIGFyZSB1c2VkIHRvIGZpZ3VyZSBvdXQgdGhlIG9mZnNldCBvZiBub2Rlcy4gVGhleSdyZSBhcnRpZmFjdHMgZnJvbSBiZWZvcmUgYXJyYXlzIHN0YXJ0ZWQgYmVpbmcgZmxhdHRlbmVkIGFuZCBhcmUgbGlrZWx5IHJlZmFjdG9yYWJsZVxyXG5cdFx0Ly9gZGF0YWAgYW5kIGBjYWNoZWRgIGFyZSwgcmVzcGVjdGl2ZWx5LCB0aGUgbmV3IGFuZCBvbGQgbm9kZXMgYmVpbmcgZGlmZmVkXHJcblx0XHQvL2BzaG91bGRSZWF0dGFjaGAgaXMgYSBmbGFnIGluZGljYXRpbmcgd2hldGhlciBhIHBhcmVudCBub2RlIHdhcyByZWNyZWF0ZWQgKGlmIHNvLCBhbmQgaWYgdGhpcyBub2RlIGlzIHJldXNlZCwgdGhlbiB0aGlzIG5vZGUgbXVzdCByZWF0dGFjaCBpdHNlbGYgdG8gdGhlIG5ldyBwYXJlbnQpXHJcblx0XHQvL2BlZGl0YWJsZWAgaXMgYSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgYW4gYW5jZXN0b3IgaXMgY29udGVudGVkaXRhYmxlXHJcblx0XHQvL2BuYW1lc3BhY2VgIGluZGljYXRlcyB0aGUgY2xvc2VzdCBIVE1MIG5hbWVzcGFjZSBhcyBpdCBjYXNjYWRlcyBkb3duIGZyb20gYW4gYW5jZXN0b3JcclxuXHRcdC8vYGNvbmZpZ3NgIGlzIGEgbGlzdCBvZiBjb25maWcgZnVuY3Rpb25zIHRvIHJ1biBhZnRlciB0aGUgdG9wbW9zdCBgYnVpbGRgIGNhbGwgZmluaXNoZXMgcnVubmluZ1xyXG5cclxuXHRcdC8vdGhlcmUncyBsb2dpYyB0aGF0IHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IG51bGwgYW5kIHVuZGVmaW5lZCBkYXRhIGFyZSBlcXVpdmFsZW50IHRvIGVtcHR5IHN0cmluZ3NcclxuXHRcdC8vLSB0aGlzIHByZXZlbnRzIGxpZmVjeWNsZSBzdXJwcmlzZXMgZnJvbSBwcm9jZWR1cmFsIGhlbHBlcnMgdGhhdCBtaXggaW1wbGljaXQgYW5kIGV4cGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzIChlLmcuIGZ1bmN0aW9uIGZvbygpIHtpZiAoY29uZCkgcmV0dXJuIG0oXCJkaXZcIil9XHJcblx0XHQvLy0gaXQgc2ltcGxpZmllcyBkaWZmaW5nIGNvZGVcclxuXHRcdC8vZGF0YS50b1N0cmluZygpIGlzIG51bGwgaWYgZGF0YSBpcyB0aGUgcmV0dXJuIHZhbHVlIG9mIENvbnNvbGUubG9nIGluIEZpcmVmb3hcclxuXHRcdGlmIChkYXRhID09IG51bGwgfHwgZGF0YS50b1N0cmluZygpID09IG51bGwpIGRhdGEgPSBcIlwiO1xyXG5cdFx0aWYgKGRhdGEuc3VidHJlZSA9PT0gXCJyZXRhaW5cIikgcmV0dXJuIGNhY2hlZDtcclxuXHRcdHZhciBjYWNoZWRUeXBlID0gdHlwZS5jYWxsKGNhY2hlZCksIGRhdGFUeXBlID0gdHlwZS5jYWxsKGRhdGEpO1xyXG5cdFx0aWYgKGNhY2hlZCA9PSBudWxsIHx8IGNhY2hlZFR5cGUgIT09IGRhdGFUeXBlKSB7XHJcblx0XHRcdGlmIChjYWNoZWQgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmIChwYXJlbnRDYWNoZSAmJiBwYXJlbnRDYWNoZS5ub2Rlcykge1xyXG5cdFx0XHRcdFx0dmFyIG9mZnNldCA9IGluZGV4IC0gcGFyZW50SW5kZXg7XHJcblx0XHRcdFx0XHR2YXIgZW5kID0gb2Zmc2V0ICsgKGRhdGFUeXBlID09PSBBUlJBWSA/IGRhdGEgOiBjYWNoZWQubm9kZXMpLmxlbmd0aDtcclxuXHRcdFx0XHRcdGNsZWFyKHBhcmVudENhY2hlLm5vZGVzLnNsaWNlKG9mZnNldCwgZW5kKSwgcGFyZW50Q2FjaGUuc2xpY2Uob2Zmc2V0LCBlbmQpKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChjYWNoZWQubm9kZXMpIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKVxyXG5cdFx0XHR9XHJcblx0XHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yO1xyXG5cdFx0XHRpZiAoY2FjaGVkLnRhZykgY2FjaGVkID0ge307IC8vaWYgY29uc3RydWN0b3IgY3JlYXRlcyBhIHZpcnR1YWwgZG9tIGVsZW1lbnQsIHVzZSBhIGJsYW5rIG9iamVjdCBhcyB0aGUgYmFzZSBjYWNoZWQgbm9kZSBpbnN0ZWFkIG9mIGNvcHlpbmcgdGhlIHZpcnR1YWwgZWwgKCMyNzcpXHJcblx0XHRcdGNhY2hlZC5ub2RlcyA9IFtdXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRhdGFUeXBlID09PSBBUlJBWSkge1xyXG5cdFx0XHQvL3JlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodHlwZS5jYWxsKGRhdGFbaV0pID09PSBBUlJBWSkge1xyXG5cdFx0XHRcdFx0ZGF0YSA9IGRhdGEuY29uY2F0LmFwcGx5KFtdLCBkYXRhKTtcclxuXHRcdFx0XHRcdGktLSAvL2NoZWNrIGN1cnJlbnQgaW5kZXggYWdhaW4gYW5kIGZsYXR0ZW4gdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbmVzdGVkIGFycmF5cyBhdCB0aGF0IGluZGV4XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbm9kZXMgPSBbXSwgaW50YWN0ID0gY2FjaGVkLmxlbmd0aCA9PT0gZGF0YS5sZW5ndGgsIHN1YkFycmF5Q291bnQgPSAwO1xyXG5cclxuXHRcdFx0Ly9rZXlzIGFsZ29yaXRobTogc29ydCBlbGVtZW50cyB3aXRob3V0IHJlY3JlYXRpbmcgdGhlbSBpZiBrZXlzIGFyZSBwcmVzZW50XHJcblx0XHRcdC8vMSkgY3JlYXRlIGEgbWFwIG9mIGFsbCBleGlzdGluZyBrZXlzLCBhbmQgbWFyayBhbGwgZm9yIGRlbGV0aW9uXHJcblx0XHRcdC8vMikgYWRkIG5ldyBrZXlzIHRvIG1hcCBhbmQgbWFyayB0aGVtIGZvciBhZGRpdGlvblxyXG5cdFx0XHQvLzMpIGlmIGtleSBleGlzdHMgaW4gbmV3IGxpc3QsIGNoYW5nZSBhY3Rpb24gZnJvbSBkZWxldGlvbiB0byBhIG1vdmVcclxuXHRcdFx0Ly80KSBmb3IgZWFjaCBrZXksIGhhbmRsZSBpdHMgY29ycmVzcG9uZGluZyBhY3Rpb24gYXMgbWFya2VkIGluIHByZXZpb3VzIHN0ZXBzXHJcblx0XHRcdC8vNSkgY29weSB1bmtleWVkIGl0ZW1zIGludG8gdGhlaXIgcmVzcGVjdGl2ZSBnYXBzXHJcblx0XHRcdHZhciBERUxFVElPTiA9IDEsIElOU0VSVElPTiA9IDIgLCBNT1ZFID0gMztcclxuXHRcdFx0dmFyIGV4aXN0aW5nID0ge30sIHVua2V5ZWQgPSBbXSwgc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gZmFsc2U7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FjaGVkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKGNhY2hlZFtpXSAmJiBjYWNoZWRbaV0uYXR0cnMgJiYgY2FjaGVkW2ldLmF0dHJzLmtleSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSB0cnVlO1xyXG5cdFx0XHRcdFx0ZXhpc3RpbmdbY2FjaGVkW2ldLmF0dHJzLmtleV0gPSB7YWN0aW9uOiBERUxFVElPTiwgaW5kZXg6IGl9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChzaG91bGRNYWludGFpbklkZW50aXRpZXMpIHtcclxuXHRcdFx0XHRpZiAoZGF0YS5pbmRleE9mKG51bGwpID4gLTEpIGRhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbih4KSB7cmV0dXJuIHggIT0gbnVsbH0pXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIGtleXNEaWZmZXIgPSBmYWxzZVxyXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCAhPSBjYWNoZWQubGVuZ3RoKSBrZXlzRGlmZmVyID0gdHJ1ZVxyXG5cdFx0XHRcdGVsc2UgZm9yICh2YXIgaSA9IDAsIGNhY2hlZENlbGwsIGRhdGFDZWxsOyBjYWNoZWRDZWxsID0gY2FjaGVkW2ldLCBkYXRhQ2VsbCA9IGRhdGFbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKGNhY2hlZENlbGwuYXR0cnMgJiYgZGF0YUNlbGwuYXR0cnMgJiYgY2FjaGVkQ2VsbC5hdHRycy5rZXkgIT0gZGF0YUNlbGwuYXR0cnMua2V5KSB7XHJcblx0XHRcdFx0XHRcdGtleXNEaWZmZXIgPSB0cnVlXHJcblx0XHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChrZXlzRGlmZmVyKSB7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtpXSAmJiBkYXRhW2ldLmF0dHJzKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGRhdGFbaV0uYXR0cnMua2V5ICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBrZXkgPSBkYXRhW2ldLmF0dHJzLmtleTtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICghZXhpc3Rpbmdba2V5XSkgZXhpc3Rpbmdba2V5XSA9IHthY3Rpb246IElOU0VSVElPTiwgaW5kZXg6IGl9O1xyXG5cdFx0XHRcdFx0XHRcdFx0ZWxzZSBleGlzdGluZ1trZXldID0ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb246IE1PVkUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGluZGV4OiBpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmcm9tOiBleGlzdGluZ1trZXldLmluZGV4LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRlbGVtZW50OiBjYWNoZWQubm9kZXNbZXhpc3Rpbmdba2V5XS5pbmRleF0gfHwgJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0ZWxzZSB1bmtleWVkLnB1c2goe2luZGV4OiBpLCBlbGVtZW50OiBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaV0gfHwgJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIil9KVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgYWN0aW9ucyA9IFtdXHJcblx0XHRcdFx0XHRmb3IgKHZhciBwcm9wIGluIGV4aXN0aW5nKSBhY3Rpb25zLnB1c2goZXhpc3RpbmdbcHJvcF0pXHJcblx0XHRcdFx0XHR2YXIgY2hhbmdlcyA9IGFjdGlvbnMuc29ydChzb3J0Q2hhbmdlcyk7XHJcblx0XHRcdFx0XHR2YXIgbmV3Q2FjaGVkID0gbmV3IEFycmF5KGNhY2hlZC5sZW5ndGgpXHJcblxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNoYW5nZTsgY2hhbmdlID0gY2hhbmdlc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBERUxFVElPTikge1xyXG5cdFx0XHRcdFx0XHRcdGNsZWFyKGNhY2hlZFtjaGFuZ2UuaW5kZXhdLm5vZGVzLCBjYWNoZWRbY2hhbmdlLmluZGV4XSk7XHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FjaGVkLnNwbGljZShjaGFuZ2UuaW5kZXgsIDEpXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IElOU0VSVElPTikge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBkdW1teSA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdFx0XHRcdFx0XHRcdGR1bW15LmtleSA9IGRhdGFbY2hhbmdlLmluZGV4XS5hdHRycy5rZXk7XHJcblx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoZHVtbXksIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdIHx8IG51bGwpO1xyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlLmluZGV4LCAwLCB7YXR0cnM6IHtrZXk6IGRhdGFbY2hhbmdlLmluZGV4XS5hdHRycy5rZXl9LCBub2RlczogW2R1bW15XX0pXHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBNT1ZFKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdICE9PSBjaGFuZ2UuZWxlbWVudCAmJiBjaGFuZ2UuZWxlbWVudCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2hhbmdlLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZFtjaGFuZ2UuaW5kZXhdID0gY2FjaGVkW2NoYW5nZS5mcm9tXVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gdW5rZXllZC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0XHR2YXIgY2hhbmdlID0gdW5rZXllZFtpXTtcclxuXHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2hhbmdlLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdIHx8IG51bGwpO1xyXG5cdFx0XHRcdFx0XHRuZXdDYWNoZWRbY2hhbmdlLmluZGV4XSA9IGNhY2hlZFtjaGFuZ2UuaW5kZXhdXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjYWNoZWQgPSBuZXdDYWNoZWQ7XHJcblx0XHRcdFx0XHRjYWNoZWQubm9kZXMgPSBuZXcgQXJyYXkocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCk7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY2hpbGQ7IGNoaWxkID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2ldOyBpKyspIGNhY2hlZC5ub2Rlc1tpXSA9IGNoaWxkXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vZW5kIGtleSBhbGdvcml0aG1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBjYWNoZUNvdW50ID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdC8vZGlmZiBlYWNoIGl0ZW0gaW4gdGhlIGFycmF5XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGNhY2hlZCwgaW5kZXgsIGRhdGFbaV0sIGNhY2hlZFtjYWNoZUNvdW50XSwgc2hvdWxkUmVhdHRhY2gsIGluZGV4ICsgc3ViQXJyYXlDb3VudCB8fCBzdWJBcnJheUNvdW50LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHRcdFx0XHRpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcclxuXHRcdFx0XHRpZiAoIWl0ZW0ubm9kZXMuaW50YWN0KSBpbnRhY3QgPSBmYWxzZTtcclxuXHRcdFx0XHRpZiAoaXRlbS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdFx0Ly9maXggb2Zmc2V0IG9mIG5leHQgZWxlbWVudCBpZiBpdGVtIHdhcyBhIHRydXN0ZWQgc3RyaW5nIHcvIG1vcmUgdGhhbiBvbmUgaHRtbCBlbGVtZW50XHJcblx0XHRcdFx0XHQvL3RoZSBmaXJzdCBjbGF1c2UgaW4gdGhlIHJlZ2V4cCBtYXRjaGVzIGVsZW1lbnRzXHJcblx0XHRcdFx0XHQvL3RoZSBzZWNvbmQgY2xhdXNlIChhZnRlciB0aGUgcGlwZSkgbWF0Y2hlcyB0ZXh0IG5vZGVzXHJcblx0XHRcdFx0XHRzdWJBcnJheUNvdW50ICs9IChpdGVtLm1hdGNoKC88W15cXC9dfFxcPlxccypbXjxdL2cpIHx8IFtdKS5sZW5ndGhcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBzdWJBcnJheUNvdW50ICs9IHR5cGUuY2FsbChpdGVtKSA9PT0gQVJSQVkgPyBpdGVtLmxlbmd0aCA6IDE7XHJcblx0XHRcdFx0Y2FjaGVkW2NhY2hlQ291bnQrK10gPSBpdGVtXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKCFpbnRhY3QpIHtcclxuXHRcdFx0XHQvL2RpZmYgdGhlIGFycmF5IGl0c2VsZlxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vdXBkYXRlIHRoZSBsaXN0IG9mIERPTSBub2RlcyBieSBjb2xsZWN0aW5nIHRoZSBub2RlcyBmcm9tIGVhY2ggaXRlbVxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAoY2FjaGVkW2ldICE9IG51bGwpIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIGNhY2hlZFtpXS5ub2RlcylcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly9yZW1vdmUgaXRlbXMgZnJvbSB0aGUgZW5kIG9mIHRoZSBhcnJheSBpZiB0aGUgbmV3IGFycmF5IGlzIHNob3J0ZXIgdGhhbiB0aGUgb2xkIG9uZVxyXG5cdFx0XHRcdC8vaWYgZXJyb3JzIGV2ZXIgaGFwcGVuIGhlcmUsIHRoZSBpc3N1ZSBpcyBtb3N0IGxpa2VseSBhIGJ1ZyBpbiB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBzb21ld2hlcmUgZWFybGllciBpbiB0aGUgcHJvZ3JhbVxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBub2RlOyBub2RlID0gY2FjaGVkLm5vZGVzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmIChub2RlLnBhcmVudE5vZGUgIT0gbnVsbCAmJiBub2Rlcy5pbmRleE9mKG5vZGUpIDwgMCkgY2xlYXIoW25vZGVdLCBbY2FjaGVkW2ldXSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoIDwgY2FjaGVkLmxlbmd0aCkgY2FjaGVkLmxlbmd0aCA9IGRhdGEubGVuZ3RoO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKGRhdGEgIT0gbnVsbCAmJiBkYXRhVHlwZSA9PT0gT0JKRUNUKSB7XHJcblx0XHRcdGlmICghZGF0YS5hdHRycykgZGF0YS5hdHRycyA9IHt9O1xyXG5cdFx0XHRpZiAoIWNhY2hlZC5hdHRycykgY2FjaGVkLmF0dHJzID0ge307XHJcblxyXG5cdFx0XHR2YXIgZGF0YUF0dHJLZXlzID0gT2JqZWN0LmtleXMoZGF0YS5hdHRycylcclxuXHRcdFx0dmFyIGhhc0tleXMgPSBkYXRhQXR0cktleXMubGVuZ3RoID4gKFwia2V5XCIgaW4gZGF0YS5hdHRycyA/IDEgOiAwKVxyXG5cdFx0XHQvL2lmIGFuIGVsZW1lbnQgaXMgZGlmZmVyZW50IGVub3VnaCBmcm9tIHRoZSBvbmUgaW4gY2FjaGUsIHJlY3JlYXRlIGl0XHJcblx0XHRcdGlmIChkYXRhLnRhZyAhPSBjYWNoZWQudGFnIHx8IGRhdGFBdHRyS2V5cy5qb2luKCkgIT0gT2JqZWN0LmtleXMoY2FjaGVkLmF0dHJzKS5qb2luKCkgfHwgZGF0YS5hdHRycy5pZCAhPSBjYWNoZWQuYXR0cnMuaWQpIHtcclxuXHRcdFx0XHRpZiAoY2FjaGVkLm5vZGVzLmxlbmd0aCkgY2xlYXIoY2FjaGVkLm5vZGVzKTtcclxuXHRcdFx0XHRpZiAoY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgdHlwZW9mIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkID09PSBGVU5DVElPTikgY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh0eXBlLmNhbGwoZGF0YS50YWcpICE9IFNUUklORykgcmV0dXJuO1xyXG5cclxuXHRcdFx0dmFyIG5vZGUsIGlzTmV3ID0gY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMDtcclxuXHRcdFx0aWYgKGRhdGEuYXR0cnMueG1sbnMpIG5hbWVzcGFjZSA9IGRhdGEuYXR0cnMueG1sbnM7XHJcblx0XHRcdGVsc2UgaWYgKGRhdGEudGFnID09PSBcInN2Z1wiKSBuYW1lc3BhY2UgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XHJcblx0XHRcdGVsc2UgaWYgKGRhdGEudGFnID09PSBcIm1hdGhcIikgbmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCI7XHJcblx0XHRcdGlmIChpc05ldykge1xyXG5cdFx0XHRcdGlmIChkYXRhLmF0dHJzLmlzKSBub2RlID0gbmFtZXNwYWNlID09PSB1bmRlZmluZWQgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZywgZGF0YS5hdHRycy5pcykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpO1xyXG5cdFx0XHRcdGVsc2Ugbm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnKTtcclxuXHRcdFx0XHRjYWNoZWQgPSB7XHJcblx0XHRcdFx0XHR0YWc6IGRhdGEudGFnLFxyXG5cdFx0XHRcdFx0Ly9zZXQgYXR0cmlidXRlcyBmaXJzdCwgdGhlbiBjcmVhdGUgY2hpbGRyZW5cclxuXHRcdFx0XHRcdGF0dHJzOiBoYXNLZXlzID8gc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywge30sIG5hbWVzcGFjZSkgOiBkYXRhLmF0dHJzLFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IGRhdGEuY2hpbGRyZW4gIT0gbnVsbCAmJiBkYXRhLmNoaWxkcmVuLmxlbmd0aCA+IDAgP1xyXG5cdFx0XHRcdFx0XHRidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgdHJ1ZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBub2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykgOlxyXG5cdFx0XHRcdFx0XHRkYXRhLmNoaWxkcmVuLFxyXG5cdFx0XHRcdFx0bm9kZXM6IFtub2RlXVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0aWYgKGNhY2hlZC5jaGlsZHJlbiAmJiAhY2FjaGVkLmNoaWxkcmVuLm5vZGVzKSBjYWNoZWQuY2hpbGRyZW4ubm9kZXMgPSBbXTtcclxuXHRcdFx0XHQvL2VkZ2UgY2FzZTogc2V0dGluZyB2YWx1ZSBvbiA8c2VsZWN0PiBkb2Vzbid0IHdvcmsgYmVmb3JlIGNoaWxkcmVuIGV4aXN0LCBzbyBzZXQgaXQgYWdhaW4gYWZ0ZXIgY2hpbGRyZW4gaGF2ZSBiZWVuIGNyZWF0ZWRcclxuXHRcdFx0XHRpZiAoZGF0YS50YWcgPT09IFwic2VsZWN0XCIgJiYgZGF0YS5hdHRycy52YWx1ZSkgc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywge3ZhbHVlOiBkYXRhLmF0dHJzLnZhbHVlfSwge30sIG5hbWVzcGFjZSk7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG5vZGUgPSBjYWNoZWQubm9kZXNbMF07XHJcblx0XHRcdFx0aWYgKGhhc0tleXMpIHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIGNhY2hlZC5hdHRycywgbmFtZXNwYWNlKTtcclxuXHRcdFx0XHRjYWNoZWQuY2hpbGRyZW4gPSBidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgZmFsc2UsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xyXG5cdFx0XHRcdGlmIChzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSAmJiBub2RlICE9IG51bGwpIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0fVxyXG5cdFx0XHQvL3NjaGVkdWxlIGNvbmZpZ3MgdG8gYmUgY2FsbGVkLiBUaGV5IGFyZSBjYWxsZWQgYWZ0ZXIgYGJ1aWxkYCBmaW5pc2hlcyBydW5uaW5nXHJcblx0XHRcdGlmICh0eXBlb2YgZGF0YS5hdHRyc1tcImNvbmZpZ1wiXSA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHR2YXIgY29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgfHwge307XHJcblxyXG5cdFx0XHRcdC8vIGJpbmRcclxuXHRcdFx0XHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihkYXRhLCBhcmdzKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBkYXRhLmF0dHJzW1wiY29uZmlnXCJdLmFwcGx5KGRhdGEsIGFyZ3MpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRjb25maWdzLnB1c2goY2FsbGJhY2soZGF0YSwgW25vZGUsICFpc05ldywgY29udGV4dCwgY2FjaGVkXSkpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKHR5cGVvZiBkYXRhVHlwZSAhPSBGVU5DVElPTikge1xyXG5cdFx0XHQvL2hhbmRsZSB0ZXh0IG5vZGVzXHJcblx0XHRcdHZhciBub2RlcztcclxuXHRcdFx0aWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRpZiAoZGF0YS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XHJcblx0XHRcdFx0XHRpZiAoIXBhcmVudEVsZW1lbnQubm9kZU5hbWUubWF0Y2godm9pZEVsZW1lbnRzKSkgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FjaGVkID0gXCJzdHJpbmcgbnVtYmVyIGJvb2xlYW5cIi5pbmRleE9mKHR5cGVvZiBkYXRhKSA+IC0xID8gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSkgOiBkYXRhO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoY2FjaGVkLnZhbHVlT2YoKSAhPT0gZGF0YS52YWx1ZU9mKCkgfHwgc2hvdWxkUmVhdHRhY2ggPT09IHRydWUpIHtcclxuXHRcdFx0XHRub2RlcyA9IGNhY2hlZC5ub2RlcztcclxuXHRcdFx0XHRpZiAoIWVkaXRhYmxlIHx8IGVkaXRhYmxlICE9PSAkZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xyXG5cdFx0XHRcdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0Y2xlYXIobm9kZXMsIGNhY2hlZCk7XHJcblx0XHRcdFx0XHRcdG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHQvL2Nvcm5lciBjYXNlOiByZXBsYWNpbmcgdGhlIG5vZGVWYWx1ZSBvZiBhIHRleHQgbm9kZSB0aGF0IGlzIGEgY2hpbGQgb2YgYSB0ZXh0YXJlYS9jb250ZW50ZWRpdGFibGUgZG9lc24ndCB3b3JrXHJcblx0XHRcdFx0XHRcdC8vd2UgbmVlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHByb3BlcnR5IG9mIHRoZSBwYXJlbnQgdGV4dGFyZWEgb3IgdGhlIGlubmVySFRNTCBvZiB0aGUgY29udGVudGVkaXRhYmxlIGVsZW1lbnQgaW5zdGVhZFxyXG5cdFx0XHRcdFx0XHRpZiAocGFyZW50VGFnID09PSBcInRleHRhcmVhXCIpIHBhcmVudEVsZW1lbnQudmFsdWUgPSBkYXRhO1xyXG5cdFx0XHRcdFx0XHRlbHNlIGlmIChlZGl0YWJsZSkgZWRpdGFibGUuaW5uZXJIVE1MID0gZGF0YTtcclxuXHRcdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG5vZGVzWzBdLm5vZGVUeXBlID09PSAxIHx8IG5vZGVzLmxlbmd0aCA+IDEpIHsgLy93YXMgYSB0cnVzdGVkIHN0cmluZ1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2Rlc1swXSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKTtcclxuXHRcdFx0XHRcdFx0XHRub2Rlc1swXS5ub2RlVmFsdWUgPSBkYXRhXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSk7XHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXNcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNhY2hlZFxyXG5cdH1cclxuXHRmdW5jdGlvbiBzb3J0Q2hhbmdlcyhhLCBiKSB7cmV0dXJuIGEuYWN0aW9uIC0gYi5hY3Rpb24gfHwgYS5pbmRleCAtIGIuaW5kZXh9XHJcblx0ZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhub2RlLCB0YWcsIGRhdGFBdHRycywgY2FjaGVkQXR0cnMsIG5hbWVzcGFjZSkge1xyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gZGF0YUF0dHJzKSB7XHJcblx0XHRcdHZhciBkYXRhQXR0ciA9IGRhdGFBdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdHZhciBjYWNoZWRBdHRyID0gY2FjaGVkQXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHRpZiAoIShhdHRyTmFtZSBpbiBjYWNoZWRBdHRycykgfHwgKGNhY2hlZEF0dHIgIT09IGRhdGFBdHRyKSkge1xyXG5cdFx0XHRcdGNhY2hlZEF0dHJzW2F0dHJOYW1lXSA9IGRhdGFBdHRyO1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHQvL2Bjb25maWdgIGlzbid0IGEgcmVhbCBhdHRyaWJ1dGVzLCBzbyBpZ25vcmUgaXRcclxuXHRcdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJjb25maWdcIiB8fCBhdHRyTmFtZSA9PSBcImtleVwiKSBjb250aW51ZTtcclxuXHRcdFx0XHRcdC8vaG9vayBldmVudCBoYW5kbGVycyB0byB0aGUgYXV0by1yZWRyYXdpbmcgc3lzdGVtXHJcblx0XHRcdFx0XHRlbHNlIGlmICh0eXBlb2YgZGF0YUF0dHIgPT09IEZVTkNUSU9OICYmIGF0dHJOYW1lLmluZGV4T2YoXCJvblwiKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRub2RlW2F0dHJOYW1lXSA9IGF1dG9yZWRyYXcoZGF0YUF0dHIsIG5vZGUpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2hhbmRsZSBgc3R5bGU6IHsuLi59YFxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwic3R5bGVcIiAmJiBkYXRhQXR0ciAhPSBudWxsICYmIHR5cGUuY2FsbChkYXRhQXR0cikgPT09IE9CSkVDVCkge1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBydWxlIGluIGRhdGFBdHRyKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGNhY2hlZEF0dHIgPT0gbnVsbCB8fCBjYWNoZWRBdHRyW3J1bGVdICE9PSBkYXRhQXR0cltydWxlXSkgbm9kZS5zdHlsZVtydWxlXSA9IGRhdGFBdHRyW3J1bGVdXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgcnVsZSBpbiBjYWNoZWRBdHRyKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCEocnVsZSBpbiBkYXRhQXR0cikpIG5vZGUuc3R5bGVbcnVsZV0gPSBcIlwiXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vaGFuZGxlIFNWR1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAobmFtZXNwYWNlICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBcImhyZWZcIikgbm9kZS5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwgXCJocmVmXCIsIGRhdGFBdHRyKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwiY2xhc3NOYW1lXCIpIG5vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgZGF0YUF0dHIpO1xyXG5cdFx0XHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhQXR0cilcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vaGFuZGxlIGNhc2VzIHRoYXQgYXJlIHByb3BlcnRpZXMgKGJ1dCBpZ25vcmUgY2FzZXMgd2hlcmUgd2Ugc2hvdWxkIHVzZSBzZXRBdHRyaWJ1dGUgaW5zdGVhZClcclxuXHRcdFx0XHRcdC8vLSBsaXN0IGFuZCBmb3JtIGFyZSB0eXBpY2FsbHkgdXNlZCBhcyBzdHJpbmdzLCBidXQgYXJlIERPTSBlbGVtZW50IHJlZmVyZW5jZXMgaW4ganNcclxuXHRcdFx0XHRcdC8vLSB3aGVuIHVzaW5nIENTUyBzZWxlY3RvcnMgKGUuZy4gYG0oXCJbc3R5bGU9JyddXCIpYCksIHN0eWxlIGlzIHVzZWQgYXMgYSBzdHJpbmcsIGJ1dCBpdCdzIGFuIG9iamVjdCBpbiBqc1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgaW4gbm9kZSAmJiAhKGF0dHJOYW1lID09PSBcImxpc3RcIiB8fCBhdHRyTmFtZSA9PT0gXCJzdHlsZVwiIHx8IGF0dHJOYW1lID09PSBcImZvcm1cIiB8fCBhdHRyTmFtZSA9PT0gXCJ0eXBlXCIpKSB7XHJcblx0XHRcdFx0XHRcdC8vIzM0OCBkb24ndCBzZXQgdGhlIHZhbHVlIGlmIG5vdCBuZWVkZWQgb3RoZXJ3aXNlIGN1cnNvciBwbGFjZW1lbnQgYnJlYWtzIGluIENocm9tZVxyXG5cdFx0XHRcdFx0XHRpZiAodGFnICE9PSBcImlucHV0XCIgfHwgbm9kZVthdHRyTmFtZV0gIT09IGRhdGFBdHRyKSBub2RlW2F0dHJOYW1lXSA9IGRhdGFBdHRyXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhQXR0cilcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdC8vc3dhbGxvdyBJRSdzIGludmFsaWQgYXJndW1lbnQgZXJyb3JzIHRvIG1pbWljIEhUTUwncyBmYWxsYmFjay10by1kb2luZy1ub3RoaW5nLW9uLWludmFsaWQtYXR0cmlidXRlcyBiZWhhdmlvclxyXG5cdFx0XHRcdFx0aWYgKGUubWVzc2FnZS5pbmRleE9mKFwiSW52YWxpZCBhcmd1bWVudFwiKSA8IDApIHRocm93IGVcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8jMzQ4IGRhdGFBdHRyIG1heSBub3QgYmUgYSBzdHJpbmcsIHNvIHVzZSBsb29zZSBjb21wYXJpc29uIChkb3VibGUgZXF1YWwpIGluc3RlYWQgb2Ygc3RyaWN0ICh0cmlwbGUgZXF1YWwpXHJcblx0XHRcdGVsc2UgaWYgKGF0dHJOYW1lID09PSBcInZhbHVlXCIgJiYgdGFnID09PSBcImlucHV0XCIgJiYgbm9kZS52YWx1ZSAhPSBkYXRhQXR0cikge1xyXG5cdFx0XHRcdG5vZGUudmFsdWUgPSBkYXRhQXR0clxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY2FjaGVkQXR0cnNcclxuXHR9XHJcblx0ZnVuY3Rpb24gY2xlYXIobm9kZXMsIGNhY2hlZCkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XHJcblx0XHRcdGlmIChub2Rlc1tpXSAmJiBub2Rlc1tpXS5wYXJlbnROb2RlKSB7XHJcblx0XHRcdFx0dHJ5IHtub2Rlc1tpXS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGVzW2ldKX1cclxuXHRcdFx0XHRjYXRjaCAoZSkge30gLy9pZ25vcmUgaWYgdGhpcyBmYWlscyBkdWUgdG8gb3JkZXIgb2YgZXZlbnRzIChzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMTkyNjA4My9mYWlsZWQtdG8tZXhlY3V0ZS1yZW1vdmVjaGlsZC1vbi1ub2RlKVxyXG5cdFx0XHRcdGNhY2hlZCA9IFtdLmNvbmNhdChjYWNoZWQpO1xyXG5cdFx0XHRcdGlmIChjYWNoZWRbaV0pIHVubG9hZChjYWNoZWRbaV0pXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmIChub2Rlcy5sZW5ndGggIT0gMCkgbm9kZXMubGVuZ3RoID0gMFxyXG5cdH1cclxuXHRmdW5jdGlvbiB1bmxvYWQoY2FjaGVkKSB7XHJcblx0XHRpZiAoY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgdHlwZW9mIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkID09PSBGVU5DVElPTikgY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKTtcclxuXHRcdGlmIChjYWNoZWQuY2hpbGRyZW4pIHtcclxuXHRcdFx0aWYgKHR5cGUuY2FsbChjYWNoZWQuY2hpbGRyZW4pID09PSBBUlJBWSkge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjaGlsZDsgY2hpbGQgPSBjYWNoZWQuY2hpbGRyZW5baV07IGkrKykgdW5sb2FkKGNoaWxkKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKGNhY2hlZC5jaGlsZHJlbi50YWcpIHVubG9hZChjYWNoZWQuY2hpbGRyZW4pXHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpIHtcclxuXHRcdHZhciBuZXh0U2libGluZyA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF07XHJcblx0XHRpZiAobmV4dFNpYmxpbmcpIHtcclxuXHRcdFx0dmFyIGlzRWxlbWVudCA9IG5leHRTaWJsaW5nLm5vZGVUeXBlICE9IDE7XHJcblx0XHRcdHZhciBwbGFjZWhvbGRlciA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcclxuXHRcdFx0aWYgKGlzRWxlbWVudCkge1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBuZXh0U2libGluZyB8fCBudWxsKTtcclxuXHRcdFx0XHRwbGFjZWhvbGRlci5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKTtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHBsYWNlaG9sZGVyKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgbmV4dFNpYmxpbmcuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZGF0YSlcclxuXHRcdH1cclxuXHRcdGVsc2UgcGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgZGF0YSk7XHJcblx0XHR2YXIgbm9kZXMgPSBbXTtcclxuXHRcdHdoaWxlIChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdICE9PSBuZXh0U2libGluZykge1xyXG5cdFx0XHRub2Rlcy5wdXNoKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0pO1xyXG5cdFx0XHRpbmRleCsrXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbm9kZXNcclxuXHR9XHJcblx0ZnVuY3Rpb24gYXV0b3JlZHJhdyhjYWxsYmFjaywgb2JqZWN0KSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpO1xyXG5cdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0dHJ5IHtyZXR1cm4gY2FsbGJhY2suY2FsbChvYmplY3QsIGUpfVxyXG5cdFx0XHRmaW5hbGx5IHtcclxuXHRcdFx0XHRlbmRGaXJzdENvbXB1dGF0aW9uKClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGh0bWw7XHJcblx0dmFyIGRvY3VtZW50Tm9kZSA9IHtcclxuXHRcdGFwcGVuZENoaWxkOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdGlmIChodG1sID09PSB1bmRlZmluZWQpIGh0bWwgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImh0bWxcIik7XHJcblx0XHRcdGlmICgkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgIT09IG5vZGUpIHtcclxuXHRcdFx0XHQkZG9jdW1lbnQucmVwbGFjZUNoaWxkKG5vZGUsICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSAkZG9jdW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XHJcblx0XHRcdHRoaXMuY2hpbGROb2RlcyA9ICRkb2N1bWVudC5jaGlsZE5vZGVzXHJcblx0XHR9LFxyXG5cdFx0aW5zZXJ0QmVmb3JlOiBmdW5jdGlvbihub2RlKSB7XHJcblx0XHRcdHRoaXMuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHRcdH0sXHJcblx0XHRjaGlsZE5vZGVzOiBbXVxyXG5cdH07XHJcblx0dmFyIG5vZGVDYWNoZSA9IFtdLCBjZWxsQ2FjaGUgPSB7fTtcclxuXHRtLnJlbmRlciA9IGZ1bmN0aW9uKHJvb3QsIGNlbGwsIGZvcmNlUmVjcmVhdGlvbikge1xyXG5cdFx0dmFyIGNvbmZpZ3MgPSBbXTtcclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LlwiKTtcclxuXHRcdHZhciBpZCA9IGdldENlbGxDYWNoZUtleShyb290KTtcclxuXHRcdHZhciBpc0RvY3VtZW50Um9vdCA9IHJvb3QgPT09ICRkb2N1bWVudDtcclxuXHRcdHZhciBub2RlID0gaXNEb2N1bWVudFJvb3QgfHwgcm9vdCA9PT0gJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/IGRvY3VtZW50Tm9kZSA6IHJvb3Q7XHJcblx0XHRpZiAoaXNEb2N1bWVudFJvb3QgJiYgY2VsbC50YWcgIT0gXCJodG1sXCIpIGNlbGwgPSB7dGFnOiBcImh0bWxcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogY2VsbH07XHJcblx0XHRpZiAoY2VsbENhY2hlW2lkXSA9PT0gdW5kZWZpbmVkKSBjbGVhcihub2RlLmNoaWxkTm9kZXMpO1xyXG5cdFx0aWYgKGZvcmNlUmVjcmVhdGlvbiA9PT0gdHJ1ZSkgcmVzZXQocm9vdCk7XHJcblx0XHRjZWxsQ2FjaGVbaWRdID0gYnVpbGQobm9kZSwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNlbGwsIGNlbGxDYWNoZVtpZF0sIGZhbHNlLCAwLCBudWxsLCB1bmRlZmluZWQsIGNvbmZpZ3MpO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvbmZpZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIGNvbmZpZ3NbaV0oKVxyXG5cdH07XHJcblx0ZnVuY3Rpb24gZ2V0Q2VsbENhY2hlS2V5KGVsZW1lbnQpIHtcclxuXHRcdHZhciBpbmRleCA9IG5vZGVDYWNoZS5pbmRleE9mKGVsZW1lbnQpO1xyXG5cdFx0cmV0dXJuIGluZGV4IDwgMCA/IG5vZGVDYWNoZS5wdXNoKGVsZW1lbnQpIC0gMSA6IGluZGV4XHJcblx0fVxyXG5cclxuXHRtLnRydXN0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdHZhbHVlID0gbmV3IFN0cmluZyh2YWx1ZSk7XHJcblx0XHR2YWx1ZS4kdHJ1c3RlZCA9IHRydWU7XHJcblx0XHRyZXR1cm4gdmFsdWVcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBnZXR0ZXJzZXR0ZXIoc3RvcmUpIHtcclxuXHRcdHZhciBwcm9wID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSBzdG9yZSA9IGFyZ3VtZW50c1swXTtcclxuXHRcdFx0cmV0dXJuIHN0b3JlXHJcblx0XHR9O1xyXG5cclxuXHRcdHByb3AudG9KU09OID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzdG9yZVxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gcHJvcFxyXG5cdH1cclxuXHJcblx0bS5wcm9wID0gZnVuY3Rpb24gKHN0b3JlKSB7XHJcblx0XHQvL25vdGU6IHVzaW5nIG5vbi1zdHJpY3QgZXF1YWxpdHkgY2hlY2sgaGVyZSBiZWNhdXNlIHdlJ3JlIGNoZWNraW5nIGlmIHN0b3JlIGlzIG51bGwgT1IgdW5kZWZpbmVkXHJcblx0XHRpZiAoKChzdG9yZSAhPSBudWxsICYmIHR5cGUuY2FsbChzdG9yZSkgPT09IE9CSkVDVCkgfHwgdHlwZW9mIHN0b3JlID09PSBGVU5DVElPTikgJiYgdHlwZW9mIHN0b3JlLnRoZW4gPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdHJldHVybiBwcm9waWZ5KHN0b3JlKVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBnZXR0ZXJzZXR0ZXIoc3RvcmUpXHJcblx0fTtcclxuXHJcblx0dmFyIHJvb3RzID0gW10sIG1vZHVsZXMgPSBbXSwgY29udHJvbGxlcnMgPSBbXSwgbGFzdFJlZHJhd0lkID0gbnVsbCwgbGFzdFJlZHJhd0NhbGxUaW1lID0gMCwgY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbCwgcHJldmVudGVkID0gZmFsc2UsIHRvcE1vZHVsZTtcclxuXHR2YXIgRlJBTUVfQlVER0VUID0gMTY7IC8vNjAgZnJhbWVzIHBlciBzZWNvbmQgPSAxIGNhbGwgcGVyIDE2IG1zXHJcblx0bS5tb2R1bGUgPSBmdW5jdGlvbihyb290LCBtb2R1bGUpIHtcclxuXHRcdGlmICghcm9vdCkgdGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LlwiKTtcclxuXHRcdHZhciBpbmRleCA9IHJvb3RzLmluZGV4T2Yocm9vdCk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSBpbmRleCA9IHJvb3RzLmxlbmd0aDtcclxuXHRcdHZhciBpc1ByZXZlbnRlZCA9IGZhbHNlO1xyXG5cdFx0aWYgKGNvbnRyb2xsZXJzW2luZGV4XSAmJiB0eXBlb2YgY29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkID09PSBGVU5DVElPTikge1xyXG5cdFx0XHR2YXIgZXZlbnQgPSB7XHJcblx0XHRcdFx0cHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge2lzUHJldmVudGVkID0gdHJ1ZX1cclxuXHRcdFx0fTtcclxuXHRcdFx0Y29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkKGV2ZW50KVxyXG5cdFx0fVxyXG5cdFx0aWYgKCFpc1ByZXZlbnRlZCkge1xyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImFsbFwiKTtcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHJvb3RzW2luZGV4XSA9IHJvb3Q7XHJcblx0XHRcdHZhciBjdXJyZW50TW9kdWxlID0gdG9wTW9kdWxlID0gbW9kdWxlID0gbW9kdWxlIHx8IHt9O1xyXG5cdFx0XHR2YXIgY29udHJvbGxlciA9IG5ldyAobW9kdWxlLmNvbnRyb2xsZXIgfHwgZnVuY3Rpb24oKSB7fSk7XHJcblx0XHRcdC8vY29udHJvbGxlcnMgbWF5IGNhbGwgbS5tb2R1bGUgcmVjdXJzaXZlbHkgKHZpYSBtLnJvdXRlIHJlZGlyZWN0cywgZm9yIGV4YW1wbGUpXHJcblx0XHRcdC8vdGhpcyBjb25kaXRpb25hbCBlbnN1cmVzIG9ubHkgdGhlIGxhc3QgcmVjdXJzaXZlIG0ubW9kdWxlIGNhbGwgaXMgYXBwbGllZFxyXG5cdFx0XHRpZiAoY3VycmVudE1vZHVsZSA9PT0gdG9wTW9kdWxlKSB7XHJcblx0XHRcdFx0Y29udHJvbGxlcnNbaW5kZXhdID0gY29udHJvbGxlcjtcclxuXHRcdFx0XHRtb2R1bGVzW2luZGV4XSA9IG1vZHVsZVxyXG5cdFx0XHR9XHJcblx0XHRcdGVuZEZpcnN0Q29tcHV0YXRpb24oKTtcclxuXHRcdFx0cmV0dXJuIGNvbnRyb2xsZXJzW2luZGV4XVxyXG5cdFx0fVxyXG5cdH07XHJcblx0bS5yZWRyYXcgPSBmdW5jdGlvbihmb3JjZSkge1xyXG5cdFx0Ly9sYXN0UmVkcmF3SWQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgaWYgYSBzZWNvbmQgcmVkcmF3IGlzIHJlcXVlc3RlZCBiZWZvcmUgdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lXHJcblx0XHQvL2xhc3RSZWRyYXdJRCBpcyBudWxsIGlmIGl0J3MgdGhlIGZpcnN0IHJlZHJhdyBhbmQgbm90IGFuIGV2ZW50IGhhbmRsZXJcclxuXHRcdGlmIChsYXN0UmVkcmF3SWQgJiYgZm9yY2UgIT09IHRydWUpIHtcclxuXHRcdFx0Ly93aGVuIHNldFRpbWVvdXQ6IG9ubHkgcmVzY2hlZHVsZSByZWRyYXcgaWYgdGltZSBiZXR3ZWVuIG5vdyBhbmQgcHJldmlvdXMgcmVkcmF3IGlzIGJpZ2dlciB0aGFuIGEgZnJhbWUsIG90aGVyd2lzZSBrZWVwIGN1cnJlbnRseSBzY2hlZHVsZWQgdGltZW91dFxyXG5cdFx0XHQvL3doZW4gckFGOiBhbHdheXMgcmVzY2hlZHVsZSByZWRyYXdcclxuXHRcdFx0aWYgKG5ldyBEYXRlIC0gbGFzdFJlZHJhd0NhbGxUaW1lID4gRlJBTUVfQlVER0VUIHx8ICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcclxuXHRcdFx0XHRpZiAobGFzdFJlZHJhd0lkID4gMCkgJGNhbmNlbEFuaW1hdGlvbkZyYW1lKGxhc3RSZWRyYXdJZCk7XHJcblx0XHRcdFx0bGFzdFJlZHJhd0lkID0gJHJlcXVlc3RBbmltYXRpb25GcmFtZShyZWRyYXcsIEZSQU1FX0JVREdFVClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJlZHJhdygpO1xyXG5cdFx0XHRsYXN0UmVkcmF3SWQgPSAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge2xhc3RSZWRyYXdJZCA9IG51bGx9LCBGUkFNRV9CVURHRVQpXHJcblx0XHR9XHJcblx0fTtcclxuXHRtLnJlZHJhdy5zdHJhdGVneSA9IG0ucHJvcCgpO1xyXG5cdHZhciBibGFuayA9IGZ1bmN0aW9uKCkge3JldHVybiBcIlwifVxyXG5cdGZ1bmN0aW9uIHJlZHJhdygpIHtcclxuXHRcdHZhciBmb3JjZVJlZHJhdyA9IG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT09IFwiYWxsXCI7XHJcblx0XHRmb3IgKHZhciBpID0gMCwgcm9vdDsgcm9vdCA9IHJvb3RzW2ldOyBpKyspIHtcclxuXHRcdFx0aWYgKGNvbnRyb2xsZXJzW2ldKSB7XHJcblx0XHRcdFx0bS5yZW5kZXIocm9vdCwgbW9kdWxlc1tpXS52aWV3ID8gbW9kdWxlc1tpXS52aWV3KGNvbnRyb2xsZXJzW2ldKSA6IGJsYW5rKCksIGZvcmNlUmVkcmF3KVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL2FmdGVyIHJlbmRlcmluZyB3aXRoaW4gYSByb3V0ZWQgY29udGV4dCwgd2UgbmVlZCB0byBzY3JvbGwgYmFjayB0byB0aGUgdG9wLCBhbmQgZmV0Y2ggdGhlIGRvY3VtZW50IHRpdGxlIGZvciBoaXN0b3J5LnB1c2hTdGF0ZVxyXG5cdFx0aWYgKGNvbXB1dGVQb3N0UmVkcmF3SG9vaykge1xyXG5cdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2soKTtcclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbFxyXG5cdFx0fVxyXG5cdFx0bGFzdFJlZHJhd0lkID0gbnVsbDtcclxuXHRcdGxhc3RSZWRyYXdDYWxsVGltZSA9IG5ldyBEYXRlO1xyXG5cdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpXHJcblx0fVxyXG5cclxuXHR2YXIgcGVuZGluZ1JlcXVlc3RzID0gMDtcclxuXHRtLnN0YXJ0Q29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtwZW5kaW5nUmVxdWVzdHMrK307XHJcblx0bS5lbmRDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cGVuZGluZ1JlcXVlc3RzID0gTWF0aC5tYXgocGVuZGluZ1JlcXVlc3RzIC0gMSwgMCk7XHJcblx0XHRpZiAocGVuZGluZ1JlcXVlc3RzID09PSAwKSBtLnJlZHJhdygpXHJcblx0fTtcclxuXHR2YXIgZW5kRmlyc3RDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT0gXCJub25lXCIpIHtcclxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzLS1cclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpXHJcblx0XHR9XHJcblx0XHRlbHNlIG0uZW5kQ29tcHV0YXRpb24oKTtcclxuXHR9XHJcblxyXG5cdG0ud2l0aEF0dHIgPSBmdW5jdGlvbihwcm9wLCB3aXRoQXR0ckNhbGxiYWNrKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgdGhpcztcclxuXHRcdFx0d2l0aEF0dHJDYWxsYmFjayhwcm9wIGluIGN1cnJlbnRUYXJnZXQgPyBjdXJyZW50VGFyZ2V0W3Byb3BdIDogY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUocHJvcCkpXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly9yb3V0aW5nXHJcblx0dmFyIG1vZGVzID0ge3BhdGhuYW1lOiBcIlwiLCBoYXNoOiBcIiNcIiwgc2VhcmNoOiBcIj9cIn07XHJcblx0dmFyIHJlZGlyZWN0ID0gZnVuY3Rpb24oKSB7fSwgcm91dGVQYXJhbXMsIGN1cnJlbnRSb3V0ZTtcclxuXHRtLnJvdXRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvL20ucm91dGUoKVxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50Um91dGU7XHJcblx0XHQvL20ucm91dGUoZWwsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKVxyXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJiB0eXBlLmNhbGwoYXJndW1lbnRzWzFdKSA9PT0gU1RSSU5HKSB7XHJcblx0XHRcdHZhciByb290ID0gYXJndW1lbnRzWzBdLCBkZWZhdWx0Um91dGUgPSBhcmd1bWVudHNbMV0sIHJvdXRlciA9IGFyZ3VtZW50c1syXTtcclxuXHRcdFx0cmVkaXJlY3QgPSBmdW5jdGlvbihzb3VyY2UpIHtcclxuXHRcdFx0XHR2YXIgcGF0aCA9IGN1cnJlbnRSb3V0ZSA9IG5vcm1hbGl6ZVJvdXRlKHNvdXJjZSk7XHJcblx0XHRcdFx0aWYgKCFyb3V0ZUJ5VmFsdWUocm9vdCwgcm91dGVyLCBwYXRoKSkge1xyXG5cdFx0XHRcdFx0bS5yb3V0ZShkZWZhdWx0Um91dGUsIHRydWUpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHR2YXIgbGlzdGVuZXIgPSBtLnJvdXRlLm1vZGUgPT09IFwiaGFzaFwiID8gXCJvbmhhc2hjaGFuZ2VcIiA6IFwib25wb3BzdGF0ZVwiO1xyXG5cdFx0XHR3aW5kb3dbbGlzdGVuZXJdID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSAkbG9jYXRpb25bbS5yb3V0ZS5tb2RlXVxyXG5cdFx0XHRcdGlmIChtLnJvdXRlLm1vZGUgPT09IFwicGF0aG5hbWVcIikgcGF0aCArPSAkbG9jYXRpb24uc2VhcmNoXHJcblx0XHRcdFx0aWYgKGN1cnJlbnRSb3V0ZSAhPSBub3JtYWxpemVSb3V0ZShwYXRoKSkge1xyXG5cdFx0XHRcdFx0cmVkaXJlY3QocGF0aClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IHNldFNjcm9sbDtcclxuXHRcdFx0d2luZG93W2xpc3RlbmVyXSgpXHJcblx0XHR9XHJcblx0XHQvL2NvbmZpZzogbS5yb3V0ZVxyXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzWzBdLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0dmFyIGVsZW1lbnQgPSBhcmd1bWVudHNbMF07XHJcblx0XHRcdHZhciBpc0luaXRpYWxpemVkID0gYXJndW1lbnRzWzFdO1xyXG5cdFx0XHR2YXIgY29udGV4dCA9IGFyZ3VtZW50c1syXTtcclxuXHRcdFx0ZWxlbWVudC5ocmVmID0gKG0ucm91dGUubW9kZSAhPT0gJ3BhdGhuYW1lJyA/ICRsb2NhdGlvbi5wYXRobmFtZSA6ICcnKSArIG1vZGVzW20ucm91dGUubW9kZV0gKyB0aGlzLmF0dHJzLmhyZWY7XHJcblx0XHRcdGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKVxyXG5cdFx0fVxyXG5cdFx0Ly9tLnJvdXRlKHJvdXRlLCBwYXJhbXMpXHJcblx0XHRlbHNlIGlmICh0eXBlLmNhbGwoYXJndW1lbnRzWzBdKSA9PT0gU1RSSU5HKSB7XHJcblx0XHRcdHZhciBvbGRSb3V0ZSA9IGN1cnJlbnRSb3V0ZTtcclxuXHRcdFx0Y3VycmVudFJvdXRlID0gYXJndW1lbnRzWzBdO1xyXG5cdFx0XHR2YXIgYXJncyA9IGFyZ3VtZW50c1sxXSB8fCB7fVxyXG5cdFx0XHR2YXIgcXVlcnlJbmRleCA9IGN1cnJlbnRSb3V0ZS5pbmRleE9mKFwiP1wiKVxyXG5cdFx0XHR2YXIgcGFyYW1zID0gcXVlcnlJbmRleCA+IC0xID8gcGFyc2VRdWVyeVN0cmluZyhjdXJyZW50Um91dGUuc2xpY2UocXVlcnlJbmRleCArIDEpKSA6IHt9XHJcblx0XHRcdGZvciAodmFyIGkgaW4gYXJncykgcGFyYW1zW2ldID0gYXJnc1tpXVxyXG5cdFx0XHR2YXIgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKHBhcmFtcylcclxuXHRcdFx0dmFyIGN1cnJlbnRQYXRoID0gcXVlcnlJbmRleCA+IC0xID8gY3VycmVudFJvdXRlLnNsaWNlKDAsIHF1ZXJ5SW5kZXgpIDogY3VycmVudFJvdXRlXHJcblx0XHRcdGlmIChxdWVyeXN0cmluZykgY3VycmVudFJvdXRlID0gY3VycmVudFBhdGggKyAoY3VycmVudFBhdGguaW5kZXhPZihcIj9cIikgPT09IC0xID8gXCI/XCIgOiBcIiZcIikgKyBxdWVyeXN0cmluZztcclxuXHJcblx0XHRcdHZhciBzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID0gKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgPyBhcmd1bWVudHNbMl0gOiBhcmd1bWVudHNbMV0pID09PSB0cnVlIHx8IG9sZFJvdXRlID09PSBhcmd1bWVudHNbMF07XHJcblxyXG5cdFx0XHRpZiAod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKSB7XHJcblx0XHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR3aW5kb3cuaGlzdG9yeVtzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID8gXCJyZXBsYWNlU3RhdGVcIiA6IFwicHVzaFN0YXRlXCJdKG51bGwsICRkb2N1bWVudC50aXRsZSwgbW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSk7XHJcblx0XHRcdFx0XHRzZXRTY3JvbGwoKVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0dmFyIG15UmVkaXIgPSBtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlO1xyXG5cdFx0XHRcdHJlZGlyZWN0KG15UmVkaXIpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0JGxvY2F0aW9uW20ucm91dGUubW9kZV0gPSBjdXJyZW50Um91dGU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cdG0ucm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXkpIHtcclxuXHRcdGlmICghcm91dGVQYXJhbXMpIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGNhbGwgbS5yb3V0ZShlbGVtZW50LCBkZWZhdWx0Um91dGUsIHJvdXRlcykgYmVmb3JlIGNhbGxpbmcgbS5yb3V0ZS5wYXJhbSgpXCIpXHJcblx0XHRyZXR1cm4gcm91dGVQYXJhbXNba2V5XVxyXG5cdH07XHJcblx0bS5yb3V0ZS5tb2RlID0gXCJzZWFyY2hcIjtcclxuXHRmdW5jdGlvbiBub3JtYWxpemVSb3V0ZShyb3V0ZSkge1xyXG5cdFx0cmV0dXJuIHJvdXRlLnNsaWNlKG1vZGVzW20ucm91dGUubW9kZV0ubGVuZ3RoKVxyXG5cdH1cclxuXHRmdW5jdGlvbiByb3V0ZUJ5VmFsdWUocm9vdCwgcm91dGVyLCBwYXRoKSB7XHJcblx0XHRyb3V0ZVBhcmFtcyA9IHt9O1xyXG5cclxuXHRcdHZhciBxdWVyeVN0YXJ0ID0gcGF0aC5pbmRleE9mKFwiP1wiKTtcclxuXHRcdGlmIChxdWVyeVN0YXJ0ICE9PSAtMSkge1xyXG5cdFx0XHRyb3V0ZVBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zdWJzdHIocXVlcnlTdGFydCArIDEsIHBhdGgubGVuZ3RoKSk7XHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cigwLCBxdWVyeVN0YXJ0KVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIHJvdXRlIGluIHJvdXRlcikge1xyXG5cdFx0XHRpZiAocm91dGUgPT09IHBhdGgpIHtcclxuXHRcdFx0XHRtLm1vZHVsZShyb290LCByb3V0ZXJbcm91dGVdKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoXCJeXCIgKyByb3V0ZS5yZXBsYWNlKC86W15cXC9dKz9cXC57M30vZywgXCIoLio/KVwiKS5yZXBsYWNlKC86W15cXC9dKy9nLCBcIihbXlxcXFwvXSspXCIpICsgXCJcXC8/JFwiKTtcclxuXHJcblx0XHRcdGlmIChtYXRjaGVyLnRlc3QocGF0aCkpIHtcclxuXHRcdFx0XHRwYXRoLnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR2YXIga2V5cyA9IHJvdXRlLm1hdGNoKC86W15cXC9dKy9nKSB8fCBbXTtcclxuXHRcdFx0XHRcdHZhciB2YWx1ZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgLTIpO1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHJvdXRlUGFyYW1zW2tleXNbaV0ucmVwbGFjZSgvOnxcXC4vZywgXCJcIildID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlc1tpXSlcclxuXHRcdFx0XHRcdG0ubW9kdWxlKHJvb3QsIHJvdXRlcltyb3V0ZV0pXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiByb3V0ZVVub2J0cnVzaXZlKGUpIHtcclxuXHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0aWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS53aGljaCA9PT0gMikgcmV0dXJuO1xyXG5cdFx0aWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGVsc2UgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgdGhpcztcclxuXHRcdHZhciBhcmdzID0gbS5yb3V0ZS5tb2RlID09PSBcInBhdGhuYW1lXCIgJiYgY3VycmVudFRhcmdldC5zZWFyY2ggPyBwYXJzZVF1ZXJ5U3RyaW5nKGN1cnJlbnRUYXJnZXQuc2VhcmNoLnNsaWNlKDEpKSA6IHt9O1xyXG5cdFx0bS5yb3V0ZShjdXJyZW50VGFyZ2V0W20ucm91dGUubW9kZV0uc2xpY2UobW9kZXNbbS5yb3V0ZS5tb2RlXS5sZW5ndGgpLCBhcmdzKVxyXG5cdH1cclxuXHRmdW5jdGlvbiBzZXRTY3JvbGwoKSB7XHJcblx0XHRpZiAobS5yb3V0ZS5tb2RlICE9IFwiaGFzaFwiICYmICRsb2NhdGlvbi5oYXNoKSAkbG9jYXRpb24uaGFzaCA9ICRsb2NhdGlvbi5oYXNoO1xyXG5cdFx0ZWxzZSB3aW5kb3cuc2Nyb2xsVG8oMCwgMClcclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGRRdWVyeVN0cmluZyhvYmplY3QsIHByZWZpeCkge1xyXG5cdFx0dmFyIHN0ciA9IFtdO1xyXG5cdFx0Zm9yKHZhciBwcm9wIGluIG9iamVjdCkge1xyXG5cdFx0XHR2YXIga2V5ID0gcHJlZml4ID8gcHJlZml4ICsgXCJbXCIgKyBwcm9wICsgXCJdXCIgOiBwcm9wLCB2YWx1ZSA9IG9iamVjdFtwcm9wXTtcclxuXHRcdFx0dmFyIHZhbHVlVHlwZSA9IHR5cGUuY2FsbCh2YWx1ZSlcclxuXHRcdFx0dmFyIHBhaXIgPSB2YWx1ZSAhPSBudWxsICYmICh2YWx1ZVR5cGUgPT09IE9CSkVDVCkgP1xyXG5cdFx0XHRcdGJ1aWxkUXVlcnlTdHJpbmcodmFsdWUsIGtleSkgOlxyXG5cdFx0XHRcdHZhbHVlVHlwZSA9PT0gQVJSQVkgP1xyXG5cdFx0XHRcdFx0dmFsdWUubWFwKGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGtleSArIFwiW11cIikgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtKX0pLmpvaW4oXCImXCIpIDpcclxuXHRcdFx0XHRcdGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXHJcblx0XHRcdHN0ci5wdXNoKHBhaXIpXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gc3RyLmpvaW4oXCImXCIpXHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcoc3RyKSB7XHJcblx0XHR2YXIgcGFpcnMgPSBzdHIuc3BsaXQoXCImXCIpLCBwYXJhbXMgPSB7fTtcclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR2YXIgcGFpciA9IHBhaXJzW2ldLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0cGFyYW1zW2RlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKV0gPSBwYWlyWzFdID8gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pIDogXCJcIlxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHBhcmFtc1xyXG5cdH1cclxuXHRmdW5jdGlvbiByZXNldChyb290KSB7XHJcblx0XHR2YXIgY2FjaGVLZXkgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdCk7XHJcblx0XHRjbGVhcihyb290LmNoaWxkTm9kZXMsIGNlbGxDYWNoZVtjYWNoZUtleV0pO1xyXG5cdFx0Y2VsbENhY2hlW2NhY2hlS2V5XSA9IHVuZGVmaW5lZFxyXG5cdH1cclxuXHJcblx0bS5kZWZlcnJlZCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xyXG5cdFx0ZGVmZXJyZWQucHJvbWlzZSA9IHByb3BpZnkoZGVmZXJyZWQucHJvbWlzZSk7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWRcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIHByb3BpZnkocHJvbWlzZSkge1xyXG5cdFx0dmFyIHByb3AgPSBtLnByb3AoKTtcclxuXHRcdHByb21pc2UudGhlbihwcm9wKTtcclxuXHRcdHByb3AudGhlbiA9IGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGlmeShwcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KSlcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gcHJvcFxyXG5cdH1cclxuXHQvL1Byb21pei5taXRocmlsLmpzIHwgWm9sbWVpc3RlciB8IE1JVFxyXG5cdC8vYSBtb2RpZmllZCB2ZXJzaW9uIG9mIFByb21pei5qcywgd2hpY2ggZG9lcyBub3QgY29uZm9ybSB0byBQcm9taXNlcy9BKyBmb3IgdHdvIHJlYXNvbnM6XHJcblx0Ly8xKSBgdGhlbmAgY2FsbGJhY2tzIGFyZSBjYWxsZWQgc3luY2hyb25vdXNseSAoYmVjYXVzZSBzZXRUaW1lb3V0IGlzIHRvbyBzbG93LCBhbmQgdGhlIHNldEltbWVkaWF0ZSBwb2x5ZmlsbCBpcyB0b28gYmlnXHJcblx0Ly8yKSB0aHJvd2luZyBzdWJjbGFzc2VzIG9mIEVycm9yIGNhdXNlIHRoZSBlcnJvciB0byBiZSBidWJibGVkIHVwIGluc3RlYWQgb2YgdHJpZ2dlcmluZyByZWplY3Rpb24gKGJlY2F1c2UgdGhlIHNwZWMgZG9lcyBub3QgYWNjb3VudCBmb3IgdGhlIGltcG9ydGFudCB1c2UgY2FzZSBvZiBkZWZhdWx0IGJyb3dzZXIgZXJyb3IgaGFuZGxpbmcsIGkuZS4gbWVzc2FnZSB3LyBsaW5lIG51bWJlcilcclxuXHRmdW5jdGlvbiBEZWZlcnJlZChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG5cdFx0dmFyIFJFU09MVklORyA9IDEsIFJFSkVDVElORyA9IDIsIFJFU09MVkVEID0gMywgUkVKRUNURUQgPSA0O1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBzdGF0ZSA9IDAsIHByb21pc2VWYWx1ZSA9IDAsIG5leHQgPSBbXTtcclxuXHJcblx0XHRzZWxmW1wicHJvbWlzZVwiXSA9IHt9O1xyXG5cclxuXHRcdHNlbGZbXCJyZXNvbHZlXCJdID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0aWYgKCFzdGF0ZSkge1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HO1xyXG5cclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRzZWxmW1wicmVqZWN0XCJdID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0aWYgKCFzdGF0ZSkge1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRzZWxmLnByb21pc2VbXCJ0aGVuXCJdID0gZnVuY3Rpb24oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcclxuXHRcdFx0aWYgKHN0YXRlID09PSBSRVNPTFZFRCkge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocHJvbWlzZVZhbHVlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RFRCkge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChwcm9taXNlVmFsdWUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0bmV4dC5wdXNoKGRlZmVycmVkKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGZpbmlzaCh0eXBlKSB7XHJcblx0XHRcdHN0YXRlID0gdHlwZSB8fCBSRUpFQ1RFRDtcclxuXHRcdFx0bmV4dC5tYXAoZnVuY3Rpb24oZGVmZXJyZWQpIHtcclxuXHRcdFx0XHRzdGF0ZSA9PT0gUkVTT0xWRUQgJiYgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlVmFsdWUpIHx8IGRlZmVycmVkLnJlamVjdChwcm9taXNlVmFsdWUpXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdGhlbm5hYmxlKHRoZW4sIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrLCBub3RUaGVubmFibGVDYWxsYmFjaykge1xyXG5cdFx0XHRpZiAoKChwcm9taXNlVmFsdWUgIT0gbnVsbCAmJiB0eXBlLmNhbGwocHJvbWlzZVZhbHVlKSA9PT0gT0JKRUNUKSB8fCB0eXBlb2YgcHJvbWlzZVZhbHVlID09PSBGVU5DVElPTikgJiYgdHlwZW9mIHRoZW4gPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vIGNvdW50IHByb3RlY3RzIGFnYWluc3QgYWJ1c2UgY2FsbHMgZnJvbSBzcGVjIGNoZWNrZXJcclxuXHRcdFx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdFx0XHR0aGVuLmNhbGwocHJvbWlzZVZhbHVlLCBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY291bnQrKykgcmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0c3VjY2Vzc0NhbGxiYWNrKClcclxuXHRcdFx0XHRcdH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY291bnQrKykgcmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0ZmFpbHVyZUNhbGxiYWNrKClcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdFx0ZmFpbHVyZUNhbGxiYWNrKClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bm90VGhlbm5hYmxlQ2FsbGJhY2soKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmlyZSgpIHtcclxuXHRcdFx0Ly8gY2hlY2sgaWYgaXQncyBhIHRoZW5hYmxlXHJcblx0XHRcdHZhciB0aGVuO1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdHRoZW4gPSBwcm9taXNlVmFsdWUgJiYgcHJvbWlzZVZhbHVlLnRoZW5cclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cdFx0XHRcdHJldHVybiBmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGVubmFibGUodGhlbiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKHN0YXRlID09PSBSRVNPTFZJTkcgJiYgdHlwZW9mIHN1Y2Nlc3NDYWxsYmFjayA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gc3VjY2Vzc0NhbGxiYWNrKHByb21pc2VWYWx1ZSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RJTkcgJiYgdHlwZW9mIGZhaWx1cmVDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGZhaWx1cmVDYWxsYmFjayhwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHRcdFx0XHRzdGF0ZSA9IFJFU09MVklOR1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRcdHJldHVybiBmaW5pc2goKVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKHByb21pc2VWYWx1ZSA9PT0gc2VsZikge1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gVHlwZUVycm9yKCk7XHJcblx0XHRcdFx0XHRmaW5pc2goKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdHRoZW5uYWJsZSh0aGVuLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGZpbmlzaChSRVNPTFZFRClcclxuXHRcdFx0XHRcdH0sIGZpbmlzaCwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRmaW5pc2goc3RhdGUgPT09IFJFU09MVklORyAmJiBSRVNPTFZFRClcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH1cclxuXHRtLmRlZmVycmVkLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRpZiAodHlwZS5jYWxsKGUpID09PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgIWUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvIEVycm9yLykpIHRocm93IGVcclxuXHR9O1xyXG5cclxuXHRtLnN5bmMgPSBmdW5jdGlvbihhcmdzKSB7XHJcblx0XHR2YXIgbWV0aG9kID0gXCJyZXNvbHZlXCI7XHJcblx0XHRmdW5jdGlvbiBzeW5jaHJvbml6ZXIocG9zLCByZXNvbHZlZCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRyZXN1bHRzW3Bvc10gPSB2YWx1ZTtcclxuXHRcdFx0XHRpZiAoIXJlc29sdmVkKSBtZXRob2QgPSBcInJlamVjdFwiO1xyXG5cdFx0XHRcdGlmICgtLW91dHN0YW5kaW5nID09PSAwKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5wcm9taXNlKHJlc3VsdHMpO1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWRbbWV0aG9kXShyZXN1bHRzKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gdmFsdWVcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcclxuXHRcdHZhciBvdXRzdGFuZGluZyA9IGFyZ3MubGVuZ3RoO1xyXG5cdFx0dmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkob3V0c3RhbmRpbmcpO1xyXG5cdFx0aWYgKGFyZ3MubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRhcmdzW2ldLnRoZW4oc3luY2hyb25pemVyKGksIHRydWUpLCBzeW5jaHJvbml6ZXIoaSwgZmFsc2UpKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoW10pO1xyXG5cclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0fTtcclxuXHRmdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge3JldHVybiB2YWx1ZX1cclxuXHJcblx0ZnVuY3Rpb24gYWpheChvcHRpb25zKSB7XHJcblx0XHRpZiAob3B0aW9ucy5kYXRhVHlwZSAmJiBvcHRpb25zLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwianNvbnBcIikge1xyXG5cdFx0XHR2YXIgY2FsbGJhY2tLZXkgPSBcIm1pdGhyaWxfY2FsbGJhY2tfXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIFwiX1wiICsgKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDFlMTYpKS50b1N0cmluZygzNik7XHJcblx0XHRcdHZhciBzY3JpcHQgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuXHJcblx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSBmdW5jdGlvbihyZXNwKSB7XHJcblx0XHRcdFx0c2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcclxuXHRcdFx0XHRvcHRpb25zLm9ubG9hZCh7XHJcblx0XHRcdFx0XHR0eXBlOiBcImxvYWRcIixcclxuXHRcdFx0XHRcdHRhcmdldDoge1xyXG5cdFx0XHRcdFx0XHRyZXNwb25zZVRleHQ6IHJlc3BcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gdW5kZWZpbmVkXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG5cclxuXHRcdFx0XHRvcHRpb25zLm9uZXJyb3Ioe1xyXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxyXG5cdFx0XHRcdFx0dGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRcdHN0YXR1czogNTAwLFxyXG5cdFx0XHRcdFx0XHRyZXNwb25zZVRleHQ6IEpTT04uc3RyaW5naWZ5KHtlcnJvcjogXCJFcnJvciBtYWtpbmcganNvbnAgcmVxdWVzdFwifSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQuc3JjID0gb3B0aW9ucy51cmxcclxuXHRcdFx0XHQrIChvcHRpb25zLnVybC5pbmRleE9mKFwiP1wiKSA+IDAgPyBcIiZcIiA6IFwiP1wiKVxyXG5cdFx0XHRcdCsgKG9wdGlvbnMuY2FsbGJhY2tLZXkgPyBvcHRpb25zLmNhbGxiYWNrS2V5IDogXCJjYWxsYmFja1wiKVxyXG5cdFx0XHRcdCsgXCI9XCIgKyBjYWxsYmFja0tleVxyXG5cdFx0XHRcdCsgXCImXCIgKyBidWlsZFF1ZXJ5U3RyaW5nKG9wdGlvbnMuZGF0YSB8fCB7fSk7XHJcblx0XHRcdCRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdClcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdDtcclxuXHRcdFx0eGhyLm9wZW4ob3B0aW9ucy5tZXRob2QsIG9wdGlvbnMudXJsLCB0cnVlLCBvcHRpb25zLnVzZXIsIG9wdGlvbnMucGFzc3dvcmQpO1xyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgb3B0aW9ucy5vbmxvYWQoe3R5cGU6IFwibG9hZFwiLCB0YXJnZXQ6IHhocn0pO1xyXG5cdFx0XHRcdFx0ZWxzZSBvcHRpb25zLm9uZXJyb3Ioe3R5cGU6IFwiZXJyb3JcIiwgdGFyZ2V0OiB4aHJ9KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKG9wdGlvbnMuc2VyaWFsaXplID09PSBKU09OLnN0cmluZ2lmeSAmJiBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5tZXRob2QgIT09IFwiR0VUXCIpIHtcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIilcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5kZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSkge1xyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb25maWcgPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0dmFyIG1heWJlWGhyID0gb3B0aW9ucy5jb25maWcoeGhyLCBvcHRpb25zKTtcclxuXHRcdFx0XHRpZiAobWF5YmVYaHIgIT0gbnVsbCkgeGhyID0gbWF5YmVYaHJcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGRhdGEgPSBvcHRpb25zLm1ldGhvZCA9PT0gXCJHRVRcIiB8fCAhb3B0aW9ucy5kYXRhID8gXCJcIiA6IG9wdGlvbnMuZGF0YVxyXG5cdFx0XHRpZiAoZGF0YSAmJiAodHlwZS5jYWxsKGRhdGEpICE9IFNUUklORyAmJiBkYXRhLmNvbnN0cnVjdG9yICE9IHdpbmRvdy5Gb3JtRGF0YSkpIHtcclxuXHRcdFx0XHR0aHJvdyBcIlJlcXVlc3QgZGF0YSBzaG91bGQgYmUgZWl0aGVyIGJlIGEgc3RyaW5nIG9yIEZvcm1EYXRhLiBDaGVjayB0aGUgYHNlcmlhbGl6ZWAgb3B0aW9uIGluIGBtLnJlcXVlc3RgXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0eGhyLnNlbmQoZGF0YSk7XHJcblx0XHRcdHJldHVybiB4aHJcclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gYmluZERhdGEoeGhyT3B0aW9ucywgZGF0YSwgc2VyaWFsaXplKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIgJiYgeGhyT3B0aW9ucy5kYXRhVHlwZSAhPSBcImpzb25wXCIpIHtcclxuXHRcdFx0dmFyIHByZWZpeCA9IHhock9wdGlvbnMudXJsLmluZGV4T2YoXCI/XCIpIDwgMCA/IFwiP1wiIDogXCImXCI7XHJcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcoZGF0YSk7XHJcblx0XHRcdHhock9wdGlvbnMudXJsID0geGhyT3B0aW9ucy51cmwgKyAocXVlcnlzdHJpbmcgPyBwcmVmaXggKyBxdWVyeXN0cmluZyA6IFwiXCIpXHJcblx0XHR9XHJcblx0XHRlbHNlIHhock9wdGlvbnMuZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcclxuXHRcdHJldHVybiB4aHJPcHRpb25zXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHBhcmFtZXRlcml6ZVVybCh1cmwsIGRhdGEpIHtcclxuXHRcdHZhciB0b2tlbnMgPSB1cmwubWF0Y2goLzpbYS16XVxcdysvZ2kpO1xyXG5cdFx0aWYgKHRva2VucyAmJiBkYXRhKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGtleSA9IHRva2Vuc1tpXS5zbGljZSgxKTtcclxuXHRcdFx0XHR1cmwgPSB1cmwucmVwbGFjZSh0b2tlbnNbaV0sIGRhdGFba2V5XSk7XHJcblx0XHRcdFx0ZGVsZXRlIGRhdGFba2V5XVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdXJsXHJcblx0fVxyXG5cclxuXHRtLnJlcXVlc3QgPSBmdW5jdGlvbih4aHJPcHRpb25zKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdHZhciBkZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcclxuXHRcdHZhciBpc0pTT05QID0geGhyT3B0aW9ucy5kYXRhVHlwZSAmJiB4aHJPcHRpb25zLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwianNvbnBcIjtcclxuXHRcdHZhciBzZXJpYWxpemUgPSB4aHJPcHRpb25zLnNlcmlhbGl6ZSA9IGlzSlNPTlAgPyBpZGVudGl0eSA6IHhock9wdGlvbnMuc2VyaWFsaXplIHx8IEpTT04uc3RyaW5naWZ5O1xyXG5cdFx0dmFyIGRlc2VyaWFsaXplID0geGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSA9IGlzSlNPTlAgPyBpZGVudGl0eSA6IHhock9wdGlvbnMuZGVzZXJpYWxpemUgfHwgSlNPTi5wYXJzZTtcclxuXHRcdHZhciBleHRyYWN0ID0geGhyT3B0aW9ucy5leHRyYWN0IHx8IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRyZXR1cm4geGhyLnJlc3BvbnNlVGV4dC5sZW5ndGggPT09IDAgJiYgZGVzZXJpYWxpemUgPT09IEpTT04ucGFyc2UgPyBudWxsIDogeGhyLnJlc3BvbnNlVGV4dFxyXG5cdFx0fTtcclxuXHRcdHhock9wdGlvbnMudXJsID0gcGFyYW1ldGVyaXplVXJsKHhock9wdGlvbnMudXJsLCB4aHJPcHRpb25zLmRhdGEpO1xyXG5cdFx0eGhyT3B0aW9ucyA9IGJpbmREYXRhKHhock9wdGlvbnMsIHhock9wdGlvbnMuZGF0YSwgc2VyaWFsaXplKTtcclxuXHRcdHhock9wdGlvbnMub25sb2FkID0geGhyT3B0aW9ucy5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHRcdHZhciB1bndyYXAgPSAoZS50eXBlID09PSBcImxvYWRcIiA/IHhock9wdGlvbnMudW53cmFwU3VjY2VzcyA6IHhock9wdGlvbnMudW53cmFwRXJyb3IpIHx8IGlkZW50aXR5O1xyXG5cdFx0XHRcdHZhciByZXNwb25zZSA9IHVud3JhcChkZXNlcmlhbGl6ZShleHRyYWN0KGUudGFyZ2V0LCB4aHJPcHRpb25zKSkpO1xyXG5cdFx0XHRcdGlmIChlLnR5cGUgPT09IFwibG9hZFwiKSB7XHJcblx0XHRcdFx0XHRpZiAodHlwZS5jYWxsKHJlc3BvbnNlKSA9PT0gQVJSQVkgJiYgeGhyT3B0aW9ucy50eXBlKSB7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UubGVuZ3RoOyBpKyspIHJlc3BvbnNlW2ldID0gbmV3IHhock9wdGlvbnMudHlwZShyZXNwb25zZVtpXSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHhock9wdGlvbnMudHlwZSkgcmVzcG9uc2UgPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlc3BvbnNlKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRkZWZlcnJlZFtlLnR5cGUgPT09IFwibG9hZFwiID8gXCJyZXNvbHZlXCIgOiBcInJlamVjdFwiXShyZXNwb25zZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLmVuZENvbXB1dGF0aW9uKClcclxuXHRcdH07XHJcblx0XHRhamF4KHhock9wdGlvbnMpO1xyXG5cdFx0ZGVmZXJyZWQucHJvbWlzZSh4aHJPcHRpb25zLmluaXRpYWxWYWx1ZSk7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZVxyXG5cdH07XHJcblxyXG5cdC8vdGVzdGluZyBBUElcclxuXHRtLmRlcHMgPSBmdW5jdGlvbihtb2NrKSB7XHJcblx0XHRpbml0aWFsaXplKHdpbmRvdyA9IG1vY2sgfHwgd2luZG93KTtcclxuXHRcdHJldHVybiB3aW5kb3c7XHJcblx0fTtcclxuXHQvL2ZvciBpbnRlcm5hbCB0ZXN0aW5nIG9ubHksIGRvIG5vdCB1c2UgYG0uZGVwcy5mYWN0b3J5YFxyXG5cdG0uZGVwcy5mYWN0b3J5ID0gYXBwO1xyXG5cclxuXHRyZXR1cm4gbVxyXG59KSh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSk7XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBtO1xyXG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiBtfSk7XHJcbiIsInZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCd2YWxpZGF0b3InKTtcblxuLyogXHRUaGlzIGJpbmRlciBhbGxvd3MgeW91IHRvIGNyZWF0ZSBhIHZhbGlkYXRpb24gbWV0aG9kIG9uIGEgbW9kZWwsIChwbGFpbiBcblx0amF2YXNjcmlwdCBmdW5jdGlvbiB0aGF0IGRlZmluZXMgc29tZSBwcm9wZXJ0aWVzKSwgdGhhdCBjYW4gcmV0dXJuIGEgc2V0IFxuXHRvZiBlcnJvciBtZXNzYWdlcyBmb3IgaW52YWxpZCB2YWx1ZXMuXG5cdFxuXHRUaGUgdmFsaWRhdGlvbnMgYXJlIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Nocmlzby92YWxpZGF0b3IuanNcdFxuXG5cdCMjIEV4YW1wbGVcblxuXHRTYXkgeW91IGhhdmUgYW4gb2JqZWN0IGxpa2Ugc286XG5cblx0XHR2YXIgVXNlciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLm5hbWUgPSBcImJvYlwiO1xuXHRcdFx0dGhpcy5lbWFpbCA9IFwiYm9iX2F0X2VtYWlsLmNvbVwiO1xuXHRcdH0sIHVzZXIgPSBuZXcgVXNlcigpO1xuXG5cdE5vdyBpZiB5b3Ugd2FudGVkIHRvIGNyZWF0ZSBhbiBpc1ZhbGlkIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZW5zdXJlIFxuXHR5b3UgZG9uJ3QgaGF2ZSBhbiBpbnZhbGlkIGVtYWlsIGFkZHJlc3MsIHlvdSBzaW1wbHkgYWRkOlxuXG5cblx0VG8geW91ciBtb2RlbCwgc28geW91IGdldDpcblxuXHRcdHZhciBVc2VyID0gZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMubmFtZSA9IFwiYm9iXCI7XG5cdFx0XHR0aGlzLmVtYWlsID0gXCJib2JfYXRfZW1haWwuY29tXCI7XG5cdFx0XHR0aGlzLmlzVmFsaWQgPSBtb2RlbGJpbmRlci5iaW5kKHRoaXMsIHtcblx0XHRcdFx0ZW1haWw6IHtcblx0XHRcdFx0XHQnaXNFbWFpbCc6IFwiTXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIlxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LCB1c2VyID0gbmV3IFVzZXIoKTtcblxuXHRUaGVuIGp1c3QgY2FsbCB0aGUgYGlzVmFsaWRgIG1ldGhvZCB0byBzZWUgaWYgaXQgaXMgdmFsaWQgLSBpZiBpdCBpc1xuXHRpbnZhbGlkLCAoYXMgaXQgd2lsbCBiZSBpbiB0aGlzIGNhc2UpLCB5b3Ugd2lsbCBnZXQgYW4gb2JqZWN0IGxpa2Ugc286XG5cblx0XHR1c2VyLmlzVmFsaWQoKVxuXHRcdC8vXHRSZXR1cm5zOiB7IGVtYWlsOiBbXCJNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiXSB9XG5cblx0WW91IGNhbiBhbHNvIGNoZWNrIGlmIGEgcGFydGljdWxhciBmaWVsZCBpcyB2YWxpZCBsaWtlIHNvOlxuXG5cdFx0dXNlci5pc1ZhbGlkKCdlbWFpbCcpO1xuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRiaW5kOiBmdW5jdGlvbihzZWxmLCB2T2JqKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24obmFtZSl7XG5cdFx0XHR2YXIgcmVzdWx0ID0ge30sXG5cdFx0XHRcdHRtcCxcblx0XHRcdFx0aGFzSW52YWxpZEZpZWxkID0gZmFsc2UsXG5cdFx0XHRcdC8vXHRGb3Igc29tZSByZWFzb24gbm9kZS12YWxpZGF0b3IgZG9lc24ndCBoYXZlIHRoaXMuLi5cblx0XHRcdFx0aXNOb3RFbXB0eSA9IGZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBcIlwiICYmIHZhbHVlICE9PSBudWxsO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQvL1x0R2V0IHZhbHVlIG9mIHByb3BlcnR5IGZyb20gJ3NlbGYnLCB3aGljaCBjYW4gYmUgYSBmdW5jdGlvbi5cblx0XHRcdFx0Z2V0VmFsdWUgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIHNlbGZbbmFtZV0gPT0gXCJmdW5jdGlvblwiPyBzZWxmW25hbWVdKCk6IHNlbGZbbmFtZV07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vXHRWYWxpZGF0ZXMgYSB2YWx1ZSBhZ2FpbnN0IGEgc2V0IG9mIHZhbGlkYXRpb25zXG5cdFx0XHRcdC8vXHRSZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIHZhbGlkLCBvciBhbiBvYmplY3QgXG5cdFx0XHRcdHZhbGlkYXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHZhbGlkYXRpb25zKSB7XG5cdFx0XHRcdFx0dmFyIHZhbGlkYXRpb24sXG5cdFx0XHRcdFx0XHR0bXAsXG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBbXTtcblx0XHRcdFx0XHRmb3IodmFsaWRhdGlvbiBpbiB2YWxpZGF0aW9ucykge1xuXHRcdFx0XHRcdFx0aWYodmFsaWRhdGlvbiA9PSBcImlzUmVxdWlyZWRcIikge1xuXHRcdFx0XHRcdFx0XHQvL1x0dXNlIG91ciBcImlzUmVxdWlyZWRcIiBmdW5jdGlvblxuXHRcdFx0XHRcdFx0XHR0bXAgPSBpc05vdEVtcHR5KHZhbHVlKT8gdHJ1ZTogdmFsaWRhdGlvbnNbdmFsaWRhdGlvbl07IFxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly9cdFVzZSB2YWxpZGF0b3IgbWV0aG9kXG5cdFx0XHRcdFx0XHRcdHRtcCA9IHZhbGlkYXRvclt2YWxpZGF0aW9uXSh2YWx1ZSk/IHRydWU6IHZhbGlkYXRpb25zW3ZhbGlkYXRpb25dOyBcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9cdEhhbmRsZSBtdWx0aXBsZSBtZXNzYWdlc1xuXHRcdFx0XHRcdFx0aWYodG1wICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IChyZXN1bHQgPT09IHRydWUgfHwgcmVzdWx0ID09IFwidW5kZWZpbmVkXCIpPyBbXTogcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQucHVzaCh0bXApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fTtcblxuXHRcdFx0aWYobmFtZSkge1xuXHRcdFx0XHRyZXN1bHQgPSB2YWxpZGF0ZShuYW1lLCBnZXRWYWx1ZShuYW1lKSwgdk9ialtuYW1lXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL1x0VmFsaWRhdGUgdGhlIHdob2xlIG1vZGVsXG5cdFx0XHRcdGZvcihuYW1lIGluIHZPYmopIHtcblx0XHRcdFx0XHR0bXAgPSB2YWxpZGF0ZShuYW1lLCBnZXRWYWx1ZShuYW1lKSwgdk9ialtuYW1lXSk7XG5cdFx0XHRcdFx0aWYodG1wICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRoYXNJbnZhbGlkRmllbGQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSB0bXA7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoIWhhc0ludmFsaWRGaWVsZCkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbn07IiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgQ2hyaXMgTydIYXJhIDxjb2hhcmE4N0BnbWFpbC5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbiAqIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuICogV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuKGZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGRlZmluZShkZWZpbml0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW25hbWVdID0gZGVmaW5pdGlvbigpO1xuICAgIH1cbn0pKCd2YWxpZGF0b3InLCBmdW5jdGlvbiAodmFsaWRhdG9yKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YWxpZGF0b3IgPSB7IHZlcnNpb246ICczLjI3LjAnIH07XG5cbiAgICB2YXIgZW1haWwgPSAvXigoKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSsoXFwuKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSspKil8KChcXHgyMikoKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPygoW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZdfFxceDIxfFtcXHgyMy1cXHg1Yl18W1xceDVkLVxceDdlXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KFxcXFwoW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBkLVxceDdmXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSkqKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPyhcXHgyMikpKUAoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkkL2k7XG5cbiAgICB2YXIgY3JlZGl0Q2FyZCA9IC9eKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldWzAtOV0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXwoPzoyMTMxfDE4MDB8MzVcXGR7M30pXFxkezExfSkkLztcblxuICAgIHZhciBpc2JuMTBNYXliZSA9IC9eKD86WzAtOV17OX1YfFswLTldezEwfSkkL1xuICAgICAgLCBpc2JuMTNNYXliZSA9IC9eKD86WzAtOV17MTN9KSQvO1xuXG4gICAgdmFyIGlwdjRNYXliZSA9IC9eKFxcZD9cXGQ/XFxkKVxcLihcXGQ/XFxkP1xcZClcXC4oXFxkP1xcZD9cXGQpXFwuKFxcZD9cXGQ/XFxkKSQvXG4gICAgICAsIGlwdjYgPSAvXjo6fF46OjF8XihbYS1mQS1GMC05XXsxLDR9Ojo/KXsxLDd9KFthLWZBLUYwLTldezEsNH0pJC87XG5cbiAgICB2YXIgdXVpZCA9IHtcbiAgICAgICAgJzMnOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTNbMC05QS1GXXszfS1bMC05QS1GXXs0fS1bMC05QS1GXXsxMn0kL2lcbiAgICAgICwgJzQnOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTRbMC05QS1GXXszfS1bODlBQl1bMC05QS1GXXszfS1bMC05QS1GXXsxMn0kL2lcbiAgICAgICwgJzUnOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LTVbMC05QS1GXXszfS1bODlBQl1bMC05QS1GXXszfS1bMC05QS1GXXsxMn0kL2lcbiAgICAgICwgYWxsOiAvXlswLTlBLUZdezh9LVswLTlBLUZdezR9LVswLTlBLUZdezR9LVswLTlBLUZdezR9LVswLTlBLUZdezEyfSQvaVxuICAgIH07XG5cbiAgICB2YXIgYWxwaGEgPSAvXlthLXpBLVpdKyQvXG4gICAgICAsIGFscGhhbnVtZXJpYyA9IC9eW2EtekEtWjAtOV0rJC9cbiAgICAgICwgbnVtZXJpYyA9IC9eLT9bMC05XSskL1xuICAgICAgLCBpbnQgPSAvXig/Oi0/KD86MHxbMS05XVswLTldKikpJC9cbiAgICAgICwgZmxvYXQgPSAvXig/Oi0/KD86WzAtOV0rKSk/KD86XFwuWzAtOV0qKT8oPzpbZUVdW1xcK1xcLV0/KD86WzAtOV0rKSk/JC9cbiAgICAgICwgaGV4YWRlY2ltYWwgPSAvXlswLTlhLWZBLUZdKyQvXG4gICAgICAsIGhleGNvbG9yID0gL14jPyhbMC05YS1mQS1GXXszfXxbMC05YS1mQS1GXXs2fSkkLztcblxuICAgIHZhciBhc2NpaSA9IC9eW1xceDAwLVxceDdGXSskL1xuICAgICAgLCBtdWx0aWJ5dGUgPSAvW15cXHgwMC1cXHg3Rl0vXG4gICAgICAsIGZ1bGxXaWR0aCA9IC9bXlxcdTAwMjAtXFx1MDA3RVxcdUZGNjEtXFx1RkY5RlxcdUZGQTAtXFx1RkZEQ1xcdUZGRTgtXFx1RkZFRTAtOWEtekEtWl0vXG4gICAgICAsIGhhbGZXaWR0aCA9IC9bXFx1MDAyMC1cXHUwMDdFXFx1RkY2MS1cXHVGRjlGXFx1RkZBMC1cXHVGRkRDXFx1RkZFOC1cXHVGRkVFMC05YS16QS1aXS87XG5cbiAgICB2YXIgc3Vycm9nYXRlUGFpciA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdLztcblxuICAgIHZhciBiYXNlNjQgPSAvXig/OltBLVphLXowLTkrXFwvXXs0fSkqKD86W0EtWmEtejAtOStcXC9dezJ9PT18W0EtWmEtejAtOStcXC9dezN9PXxbQS1aYS16MC05K1xcL117NH0pJC87XG5cbiAgICB2YXIgcGhvbmVzID0ge1xuICAgICAgJ3poLUNOJzogL14oXFwrPzA/ODZcXC0/KT8xWzM0NTc4OV1bMC05XXs5fSQvLFxuICAgICAgJ2VuLVpBJzogL14oXFwrPzI3fDApKFxcZHs5fSkkLyxcbiAgICAgICdlbi1BVSc6IC9eKFxcKz82MXwwKTQoXFxkezh9KS9cbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmV4dGVuZCA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgICAgICB2YWxpZGF0b3JbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBhcmdzWzBdID0gdmFsaWRhdG9yLnRvU3RyaW5nKGFyZ3NbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHZhbGlkYXRvciwgYXJncyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8vUmlnaHQgYmVmb3JlIGV4cG9ydGluZyB0aGUgdmFsaWRhdG9yIG9iamVjdCwgcGFzcyBlYWNoIG9mIHRoZSBidWlsdGluc1xuICAgIC8vdGhyb3VnaCBleHRlbmQoKSBzbyB0aGF0IHRoZWlyIGZpcnN0IGFyZ3VtZW50IGlzIGNvZXJjZWQgdG8gYSBzdHJpbmdcbiAgICB2YWxpZGF0b3IuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWxpZGF0b3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yW25hbWVdICE9PSAnZnVuY3Rpb24nIHx8IG5hbWUgPT09ICd0b1N0cmluZycgfHxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gJ3RvRGF0ZScgfHwgbmFtZSA9PT0gJ2V4dGVuZCcgfHwgbmFtZSA9PT0gJ2luaXQnKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0b3IuZXh0ZW5kKG5hbWUsIHZhbGlkYXRvcltuYW1lXSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvU3RyaW5nID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIGlucHV0ICE9PSBudWxsICYmIGlucHV0LnRvU3RyaW5nKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGlucHV0LnRvU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQgPT09IG51bGwgfHwgdHlwZW9mIGlucHV0ID09PSAndW5kZWZpbmVkJyB8fCAoaXNOYU4oaW5wdXQpICYmICFpbnB1dC5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpbnB1dCA9ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlucHV0ICs9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZSkgPT09ICdbb2JqZWN0IERhdGVdJykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgICAgIH1cbiAgICAgICAgZGF0ZSA9IERhdGUucGFyc2UoZGF0ZSk7XG4gICAgICAgIHJldHVybiAhaXNOYU4oZGF0ZSkgPyBuZXcgRGF0ZShkYXRlKSA6IG51bGw7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0Zsb2F0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9JbnQgPSBmdW5jdGlvbiAoc3RyLCByYWRpeCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyLCByYWRpeCB8fCAxMCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0Jvb2xlYW4gPSBmdW5jdGlvbiAoc3RyLCBzdHJpY3QpIHtcbiAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJzEnIHx8IHN0ciA9PT0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHIgIT09ICcwJyAmJiBzdHIgIT09ICdmYWxzZScgJiYgc3RyICE9PSAnJztcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmVxdWFscyA9IGZ1bmN0aW9uIChzdHIsIGNvbXBhcmlzb24pIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gdmFsaWRhdG9yLnRvU3RyaW5nKGNvbXBhcmlzb24pO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuY29udGFpbnMgPSBmdW5jdGlvbiAoc3RyLCBlbGVtKSB7XG4gICAgICAgIHJldHVybiBzdHIuaW5kZXhPZih2YWxpZGF0b3IudG9TdHJpbmcoZWxlbSkpID49IDA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5tYXRjaGVzID0gZnVuY3Rpb24gKHN0ciwgcGF0dGVybiwgbW9kaWZpZXJzKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGF0dGVybikgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBtb2RpZmllcnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRW1haWwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBlbWFpbC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0X3VybF9vcHRpb25zID0ge1xuICAgICAgICBwcm90b2NvbHM6IFsgJ2h0dHAnLCAnaHR0cHMnLCAnZnRwJyBdXG4gICAgICAsIHJlcXVpcmVfdGxkOiB0cnVlXG4gICAgICAsIHJlcXVpcmVfcHJvdG9jb2w6IGZhbHNlXG4gICAgICAsIGFsbG93X3VuZGVyc2NvcmVzOiBmYWxzZVxuICAgICAgLCBhbGxvd190cmFpbGluZ19kb3Q6IGZhbHNlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1VSTCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCF1cmwgfHwgdXJsLmxlbmd0aCA+PSAyMDgzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVybC5pbmRleE9mKCdtYWlsdG86JykgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF91cmxfb3B0aW9ucyk7XG4gICAgICAgIHZhciBwcm90b2NvbCwgdXNlciwgcGFzcywgYXV0aCwgaG9zdCwgaG9zdG5hbWUsIHBvcnQsXG4gICAgICAgICAgICBwb3J0X3N0ciwgcGF0aCwgcXVlcnksIGhhc2gsIHNwbGl0O1xuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnOi8vJyk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBwcm90b2NvbCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wcm90b2NvbHMuaW5kZXhPZihwcm90b2NvbCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucmVxdWlyZV9wcm90b2NvbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHNwbGl0LmpvaW4oJzovLycpO1xuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnIycpO1xuICAgICAgICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuICAgICAgICBoYXNoID0gc3BsaXQuam9pbignIycpO1xuICAgICAgICBpZiAoaGFzaCAmJiAvXFxzLy50ZXN0KGhhc2gpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICAgICAgdXJsID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgcXVlcnkgPSBzcGxpdC5qb2luKCc/Jyk7XG4gICAgICAgIGlmIChxdWVyeSAmJiAvXFxzLy50ZXN0KHF1ZXJ5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCcvJyk7XG4gICAgICAgIHVybCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgIHBhdGggPSBzcGxpdC5qb2luKCcvJyk7XG4gICAgICAgIGlmIChwYXRoICYmIC9cXHMvLnRlc3QocGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnQCcpO1xuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgYXV0aCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAoYXV0aC5pbmRleE9mKCc6JykgPj0gMCkge1xuICAgICAgICAgICAgICAgIGF1dGggPSBhdXRoLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgICAgdXNlciA9IGF1dGguc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoIS9eXFxTKyQvLnRlc3QodXNlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXNzID0gYXV0aC5qb2luKCc6Jyk7XG4gICAgICAgICAgICAgICAgaWYgKCEvXlxcUyokLy50ZXN0KHVzZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaG9zdG5hbWUgPSBzcGxpdC5qb2luKCdAJyk7XG4gICAgICAgIHNwbGl0ID0gaG9zdG5hbWUuc3BsaXQoJzonKTtcbiAgICAgICAgaG9zdCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBvcnRfc3RyID0gc3BsaXQuam9pbignOicpO1xuICAgICAgICAgICAgcG9ydCA9IHBhcnNlSW50KHBvcnRfc3RyLCAxMCk7XG4gICAgICAgICAgICBpZiAoIS9eWzAtOV0rJC8udGVzdChwb3J0X3N0cikgfHwgcG9ydCA8PSAwIHx8IHBvcnQgPiA2NTUzNSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRvci5pc0lQKGhvc3QpICYmICF2YWxpZGF0b3IuaXNGUUROKGhvc3QsIG9wdGlvbnMpICYmXG4gICAgICAgICAgICAgICAgaG9zdCAhPT0gJ2xvY2FsaG9zdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5ob3N0X3doaXRlbGlzdCAmJlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaG9zdF93aGl0ZWxpc3QuaW5kZXhPZihob3N0KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5ob3N0X2JsYWNrbGlzdCAmJlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaG9zdF9ibGFja2xpc3QuaW5kZXhPZihob3N0KSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSVAgPSBmdW5jdGlvbiAoc3RyLCB2ZXJzaW9uKSB7XG4gICAgICAgIHZlcnNpb24gPSB2YWxpZGF0b3IudG9TdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGlmICghdmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5pc0lQKHN0ciwgNCkgfHwgdmFsaWRhdG9yLmlzSVAoc3RyLCA2KTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uID09PSAnNCcpIHtcbiAgICAgICAgICAgIGlmICghaXB2NE1heWJlLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnLicpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1szXSA8PSAyNTU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gPT09ICc2JyAmJiBpcHY2LnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfZnFkbl9vcHRpb25zID0ge1xuICAgICAgICByZXF1aXJlX3RsZDogdHJ1ZVxuICAgICAgLCBhbGxvd191bmRlcnNjb3JlczogZmFsc2VcbiAgICAgICwgYWxsb3dfdHJhaWxpbmdfZG90OiBmYWxzZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNGUUROID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF9mcWRuX29wdGlvbnMpO1xuXG4gICAgICAgIC8qIFJlbW92ZSB0aGUgb3B0aW9uYWwgdHJhaWxpbmcgZG90IGJlZm9yZSBjaGVja2luZyB2YWxpZGl0eSAqL1xuICAgICAgICBpZiAob3B0aW9ucy5hbGxvd190cmFpbGluZ19kb3QgJiYgc3RyW3N0ci5sZW5ndGggLSAxXSA9PT0gJy4nKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKG9wdGlvbnMucmVxdWlyZV90bGQpIHtcbiAgICAgICAgICAgIHZhciB0bGQgPSBwYXJ0cy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghcGFydHMubGVuZ3RoIHx8ICEvXlthLXpdezIsfSQvaS50ZXN0KHRsZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgcGFydCwgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfdW5kZXJzY29yZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFydC5pbmRleE9mKCdfXycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYXJ0ID0gcGFydC5yZXBsYWNlKC9fL2csICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghL15bYS16XFx1MDBhMS1cXHVmZmZmMC05LV0rJC9pLnRlc3QocGFydCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFydFswXSA9PT0gJy0nIHx8IHBhcnRbcGFydC5sZW5ndGggLSAxXSA9PT0gJy0nIHx8XG4gICAgICAgICAgICAgICAgICAgIHBhcnQuaW5kZXhPZignLS0tJykgPj0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQWxwaGEgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBhbHBoYS50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0FscGhhbnVtZXJpYyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGFscGhhbnVtZXJpYy50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc051bWVyaWMgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBudW1lcmljLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSGV4YWRlY2ltYWwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBoZXhhZGVjaW1hbC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0hleENvbG9yID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gaGV4Y29sb3IudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNMb3dlcmNhc2UgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIgPT09IHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNVcHBlcmNhc2UgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIgPT09IHN0ci50b1VwcGVyQ2FzZSgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJbnQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBpbnQudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNGbG9hdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ciAhPT0gJycgJiYgZmxvYXQudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNEaXZpc2libGVCeSA9IGZ1bmN0aW9uIChzdHIsIG51bSkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLnRvRmxvYXQoc3RyKSAlIHZhbGlkYXRvci50b0ludChudW0pID09PSAwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNOdWxsID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLmxlbmd0aCA9PT0gMDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgbWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHN1cnJvZ2F0ZVBhaXJzID0gc3RyLm1hdGNoKC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdL2cpIHx8IFtdO1xuICAgICAgICB2YXIgbGVuID0gc3RyLmxlbmd0aCAtIHN1cnJvZ2F0ZVBhaXJzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGxlbiA+PSBtaW4gJiYgKHR5cGVvZiBtYXggPT09ICd1bmRlZmluZWQnIHx8IGxlbiA8PSBtYXgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCeXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgbWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5sZW5ndGggPj0gbWluICYmICh0eXBlb2YgbWF4ID09PSAndW5kZWZpbmVkJyB8fCBzdHIubGVuZ3RoIDw9IG1heCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1VVSUQgPSBmdW5jdGlvbiAoc3RyLCB2ZXJzaW9uKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gdXVpZFt2ZXJzaW9uID8gdmVyc2lvbiA6ICdhbGwnXTtcbiAgICAgICAgcmV0dXJuIHBhdHRlcm4gJiYgcGF0dGVybi50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0RhdGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiAhaXNOYU4oRGF0ZS5wYXJzZShzdHIpKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQWZ0ZXIgPSBmdW5jdGlvbiAoc3RyLCBkYXRlKSB7XG4gICAgICAgIHZhciBjb21wYXJpc29uID0gdmFsaWRhdG9yLnRvRGF0ZShkYXRlIHx8IG5ldyBEYXRlKCkpXG4gICAgICAgICAgLCBvcmlnaW5hbCA9IHZhbGlkYXRvci50b0RhdGUoc3RyKTtcbiAgICAgICAgcmV0dXJuICEhKG9yaWdpbmFsICYmIGNvbXBhcmlzb24gJiYgb3JpZ2luYWwgPiBjb21wYXJpc29uKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQmVmb3JlID0gZnVuY3Rpb24gKHN0ciwgZGF0ZSkge1xuICAgICAgICB2YXIgY29tcGFyaXNvbiA9IHZhbGlkYXRvci50b0RhdGUoZGF0ZSB8fCBuZXcgRGF0ZSgpKVxuICAgICAgICAgICwgb3JpZ2luYWwgPSB2YWxpZGF0b3IudG9EYXRlKHN0cik7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbCAmJiBjb21wYXJpc29uICYmIG9yaWdpbmFsIDwgY29tcGFyaXNvbjtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSW4gPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9wdGlvbnMpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSB2YWxpZGF0b3IudG9TdHJpbmcob3B0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihzdHIpID49IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShzdHIpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW5kZXhPZihzdHIpID49IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNDcmVkaXRDYXJkID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgc2FuaXRpemVkID0gc3RyLnJlcGxhY2UoL1teMC05XSsvZywgJycpO1xuICAgICAgICBpZiAoIWNyZWRpdENhcmQudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN1bSA9IDAsIGRpZ2l0LCB0bXBOdW0sIHNob3VsZERvdWJsZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHNhbml0aXplZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgZGlnaXQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKGksIChpICsgMSkpO1xuICAgICAgICAgICAgdG1wTnVtID0gcGFyc2VJbnQoZGlnaXQsIDEwKTtcbiAgICAgICAgICAgIGlmIChzaG91bGREb3VibGUpIHtcbiAgICAgICAgICAgICAgICB0bXBOdW0gKj0gMjtcbiAgICAgICAgICAgICAgICBpZiAodG1wTnVtID49IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSAoKHRtcE51bSAlIDEwKSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gdG1wTnVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvdWxkRG91YmxlID0gIXNob3VsZERvdWJsZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gISEoKHN1bSAlIDEwKSA9PT0gMCA/IHNhbml0aXplZCA6IGZhbHNlKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSVNCTiA9IGZ1bmN0aW9uIChzdHIsIHZlcnNpb24pIHtcbiAgICAgICAgdmVyc2lvbiA9IHZhbGlkYXRvci50b1N0cmluZyh2ZXJzaW9uKTtcbiAgICAgICAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzSVNCTihzdHIsIDEwKSB8fCB2YWxpZGF0b3IuaXNJU0JOKHN0ciwgMTMpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzYW5pdGl6ZWQgPSBzdHIucmVwbGFjZSgvW1xccy1dKy9nLCAnJylcbiAgICAgICAgICAsIGNoZWNrc3VtID0gMCwgaTtcbiAgICAgICAgaWYgKHZlcnNpb24gPT09ICcxMCcpIHtcbiAgICAgICAgICAgIGlmICghaXNibjEwTWF5YmUudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IChpICsgMSkgKiBzYW5pdGl6ZWQuY2hhckF0KGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNhbml0aXplZC5jaGFyQXQoOSkgPT09ICdYJykge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IDEwICogMTA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IDEwICogc2FuaXRpemVkLmNoYXJBdCg5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoY2hlY2tzdW0gJSAxMSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFzYW5pdGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSAgaWYgKHZlcnNpb24gPT09ICcxMycpIHtcbiAgICAgICAgICAgIGlmICghaXNibjEzTWF5YmUudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZhY3RvciA9IFsgMSwgMyBdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjaGVja3N1bSArPSBmYWN0b3JbaSAlIDJdICogc2FuaXRpemVkLmNoYXJBdChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzYW5pdGl6ZWQuY2hhckF0KDEyKSAtICgoMTAgLSAoY2hlY2tzdW0gJSAxMCkpICUgMTApID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhc2FuaXRpemVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTW9iaWxlUGhvbmUgPSBmdW5jdGlvbihzdHIsIGxvY2FsZSkge1xuICAgICAgICBpZiAobG9jYWxlIGluIHBob25lcykge1xuICAgICAgICAgICAgcmV0dXJuIHBob25lc1tsb2NhbGVdLnRlc3Qoc3RyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0pTT04gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBKU09OLnBhcnNlKHN0cik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTXVsdGlieXRlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gbXVsdGlieXRlLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQXNjaWkgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBhc2NpaS50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0Z1bGxXaWR0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGxXaWR0aC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0hhbGZXaWR0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGhhbGZXaWR0aC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1ZhcmlhYmxlV2lkdGggPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBmdWxsV2lkdGgudGVzdChzdHIpICYmIGhhbGZXaWR0aC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1N1cnJvZ2F0ZVBhaXIgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdXJyb2dhdGVQYWlyLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQmFzZTY0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gYmFzZTY0LnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTW9uZ29JZCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5pc0hleGFkZWNpbWFsKHN0cikgJiYgc3RyLmxlbmd0aCA9PT0gMjQ7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5sdHJpbSA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gY2hhcnMgPyBuZXcgUmVnRXhwKCdeWycgKyBjaGFycyArICddKycsICdnJykgOiAvXlxccysvZztcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnJ0cmltID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoJ1snICsgY2hhcnMgKyAnXSskJywgJ2cnKSA6IC9cXHMrJC9nO1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudHJpbSA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gY2hhcnMgPyBuZXcgUmVnRXhwKCdeWycgKyBjaGFycyArICddK3xbJyArIGNoYXJzICsgJ10rJCcsICdnJykgOiAvXlxccyt8XFxzKyQvZztcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmVzY2FwZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIChzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjeDI3OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvL2csICcmI3gyRjsnKSk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5zdHJpcExvdyA9IGZ1bmN0aW9uIChzdHIsIGtlZXBfbmV3X2xpbmVzKSB7XG4gICAgICAgIHZhciBjaGFycyA9IGtlZXBfbmV3X2xpbmVzID8gJ1xceDAwLVxceDA5XFx4MEJcXHgwQ1xceDBFLVxceDFGXFx4N0YnIDogJ1xceDAwLVxceDFGXFx4N0YnO1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmJsYWNrbGlzdChzdHIsIGNoYXJzKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLndoaXRlbGlzdCA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdbXicgKyBjaGFycyArICddKycsICdnJyksICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmJsYWNrbGlzdCA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdbJyArIGNoYXJzICsgJ10rJywgJ2cnKSwgJycpO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF9ub3JtYWxpemVfZW1haWxfb3B0aW9ucyA9IHtcbiAgICAgICAgbG93ZXJjYXNlOiB0cnVlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5ub3JtYWxpemVFbWFpbCA9IGZ1bmN0aW9uIChlbWFpbCwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF9ub3JtYWxpemVfZW1haWxfb3B0aW9ucyk7XG4gICAgICAgIGlmICghdmFsaWRhdG9yLmlzRW1haWwoZW1haWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcnRzID0gZW1haWwuc3BsaXQoJ0AnLCAyKTtcbiAgICAgICAgcGFydHNbMV0gPSBwYXJ0c1sxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAob3B0aW9ucy5sb3dlcmNhc2UpIHtcbiAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHNbMV0gPT09ICdnbWFpbC5jb20nIHx8IHBhcnRzWzFdID09PSAnZ29vZ2xlbWFpbC5jb20nKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubG93ZXJjYXNlKSB7XG4gICAgICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXC4vZywgJycpLnNwbGl0KCcrJylbMF07XG4gICAgICAgICAgICBwYXJ0c1sxXSA9ICdnbWFpbC5jb20nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKCdAJyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1lcmdlKG9iaiwgZGVmYXVsdHMpIHtcbiAgICAgICAgb2JqID0gb2JqIHx8IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGVmYXVsdHMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSBkZWZhdWx0c1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgdmFsaWRhdG9yLmluaXQoKTtcblxuICAgIHJldHVybiB2YWxpZGF0b3I7XG5cbn0pO1xuIiwiLypcblx0bWl0aHJpbC5hbmltYXRlIC0gQ29weXJpZ2h0IDIwMTQganNndXlcblx0TUlUIExpY2Vuc2VkLlxuKi9cbihmdW5jdGlvbigpe1xudmFyIG1pdGhyaWxBbmltYXRlID0gZnVuY3Rpb24gKG0pIHtcblx0Ly9cdEtub3duIHByZWZpZXhcblx0dmFyIHByZWZpeGVzID0gWydNb3onLCAnV2Via2l0JywgJ0todG1sJywgJ08nLCAnbXMnXSxcblx0dHJhbnNpdGlvblByb3BzID0gWydUcmFuc2l0aW9uUHJvcGVydHknLCAnVHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uJywgJ1RyYW5zaXRpb25EZWxheScsICdUcmFuc2l0aW9uRHVyYXRpb24nLCAnVHJhbnNpdGlvbkVuZCddLFxuXHR0cmFuc2Zvcm1Qcm9wcyA9IFsncm90YXRlJywgJ3JvdGF0ZXgnLCAncm90YXRleScsICdzY2FsZScsICdza2V3JywgJ3RyYW5zbGF0ZScsICd0cmFuc2xhdGV4JywgJ3RyYW5zbGF0ZXknLCAnbWF0cml4J10sXG5cblx0ZGVmYXVsdER1cmF0aW9uID0gNDAwLFxuXG5cdGVyciA9IGZ1bmN0aW9uKG1zZyl7XG5cdFx0KHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIikgJiYgd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5lcnJvciAmJiBjb25zb2xlLmVycm9yKG1zZyk7XG5cdH0sXG5cdFxuXHQvL1x0Q2FwaXRhbGlzZVx0XHRcblx0Y2FwID0gZnVuY3Rpb24oc3RyKXtcblx0XHRyZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnN1YnN0cigxKTtcblx0fSxcblxuXHQvL1x0Rm9yIGNoZWNraW5nIHdoYXQgdmVuZG9yIHByZWZpeGVzIGFyZSBuYXRpdmVcblx0ZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG5cblx0Ly9cdHZlbmRvciBwcmVmaXgsIGllOiB0cmFuc2l0aW9uRHVyYXRpb24gYmVjb21lcyBNb3pUcmFuc2l0aW9uRHVyYXRpb25cblx0dnAgPSBmdW5jdGlvbiAocHJvcCkge1xuXHRcdHZhciBwZjtcblx0XHQvL1x0SGFuZGxlIHVucHJlZml4ZWRcblx0XHRpZiAocHJvcCBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH1cblxuXHRcdC8vXHRIYW5kbGUga2V5ZnJhbWVzXG5cdFx0aWYocHJvcCA9PSBcIkBrZXlmcmFtZXNcIikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHQvL1x0VGVzdGluZyB1c2luZyB0cmFuc2l0aW9uXG5cdFx0XHRcdHBmID0gcHJlZml4ZXNbaV0gKyBcIlRyYW5zaXRpb25cIjtcblx0XHRcdFx0aWYgKHBmIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0XHRcdHJldHVybiBcIkAtXCIgKyBwcmVmaXhlc1tpXS50b0xvd2VyQ2FzZSgpICsgXCIta2V5ZnJhbWVzXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdHBmID0gcHJlZml4ZXNbaV0gKyBjYXAocHJvcCk7XG5cdFx0XHRpZiAocGYgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRcdHJldHVybiBwZjtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly9cdENhbid0IGZpbmQgaXQgLSByZXR1cm4gb3JpZ2luYWwgcHJvcGVydHkuXG5cdFx0cmV0dXJuIHByb3A7XG5cdH0sXG5cblx0Ly9cdFNlZSBpZiB3ZSBjYW4gdXNlIG5hdGl2ZSB0cmFuc2l0aW9uc1xuXHRzdXBwb3J0c1RyYW5zaXRpb25zID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGIgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblx0XHRcdHMgPSBiLnN0eWxlLFxuXHRcdFx0cCA9ICd0cmFuc2l0aW9uJztcblxuXHRcdGlmICh0eXBlb2Ygc1twXSA9PSAnc3RyaW5nJykgeyByZXR1cm4gdHJ1ZTsgfVxuXG5cdFx0Ly8gVGVzdHMgZm9yIHZlbmRvciBzcGVjaWZpYyBwcm9wXG5cdFx0cCA9IHAuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwLnN1YnN0cigxKTtcblxuXHRcdGZvciAodmFyIGk9MDsgaTxwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHR5cGVvZiBzW3ByZWZpeGVzW2ldICsgcF0gPT0gJ3N0cmluZycpIHsgcmV0dXJuIHRydWU7IH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0Ly9cdENvbnZlcnRzIENTUyB0cmFuc2l0aW9uIHRpbWVzIHRvIE1TXG5cdGdldFRpbWVpbk1TID0gZnVuY3Rpb24oc3RyKSB7XG5cdFx0dmFyIHJlc3VsdCA9IDAsIHRtcDtcblx0XHRzdHIgKz0gXCJcIjtcblx0XHRzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcblx0XHRpZihzdHIuaW5kZXhPZihcIm1zXCIpICE9PSAtMSkge1xuXHRcdFx0dG1wID0gc3RyLnNwbGl0KFwibXNcIik7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIodG1wWzBdKTtcblx0XHR9IGVsc2UgaWYoc3RyLmluZGV4T2YoXCJzXCIpICE9PSAtMSkge1xuXHRcdFx0Ly9cdHNcblx0XHRcdHRtcCA9IHN0ci5zcGxpdChcInNcIik7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIodG1wWzBdKSAqIDEwMDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdCA9IE51bWJlcihzdHIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBNYXRoLnJvdW5kKHJlc3VsdCk7XG5cdH0sXG5cblx0Ly9cdFNldCBzdHlsZSBwcm9wZXJ0aWVzXG5cdHNldFN0eWxlUHJvcHMgPSBmdW5jdGlvbihvYmosIHByb3BzKXtcblx0XHRmb3IodmFyIGkgaW4gcHJvcHMpIHtpZihwcm9wcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0b2JqLnN0eWxlW3ZwKGkpXSA9IHByb3BzW2ldO1xuXHRcdH19XG5cdH0sXG5cblx0Ly9cdFNldCBwcm9wcyBmb3IgdHJhbnNpdGlvbnMgYW5kIHRyYW5zZm9ybXMgd2l0aCBiYXNpYyBkZWZhdWx0c1xuXHRzZXRUcmFuc2l0aW9uUHJvcHMgPSBmdW5jdGlvbihhcmdzKXtcblx0XHR2YXIgcHJvcHMgPSB7XG5cdFx0XHRcdC8vXHRlYXNlLCBsaW5lYXIsIGVhc2UtaW4sIGVhc2Utb3V0LCBlYXNlLWluLW91dCwgY3ViaWMtYmV6aWVyKG4sbixuLG4pIGluaXRpYWwsIGluaGVyaXRcblx0XHRcdFx0VHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBcImVhc2VcIixcblx0XHRcdFx0VHJhbnNpdGlvbkR1cmF0aW9uOiBkZWZhdWx0RHVyYXRpb24gKyBcIm1zXCIsXG5cdFx0XHRcdFRyYW5zaXRpb25Qcm9wZXJ0eTogXCJhbGxcIlxuXHRcdFx0fSxcblx0XHRcdHAsIGksIHRtcCwgdG1wMiwgZm91bmQ7XG5cblx0XHQvL1x0U2V0IGFueSBhbGxvd2VkIHByb3BlcnRpZXMgXG5cdFx0Zm9yKHAgaW4gYXJncykgeyBpZihhcmdzLmhhc093blByb3BlcnR5KHApKSB7XG5cdFx0XHR0bXAgPSAnVHJhbnNpdGlvbicgKyBjYXAocCk7XG5cdFx0XHR0bXAyID0gcC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0Zm91bmQgPSBmYWxzZTtcblxuXHRcdFx0Ly9cdExvb2sgYXQgdHJhbnNpdGlvbiBwcm9wc1xuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNpdGlvblByb3BzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdGlmKHRtcCA9PSB0cmFuc2l0aW9uUHJvcHNbaV0pIHtcblx0XHRcdFx0XHRwcm9wc1t0cmFuc2l0aW9uUHJvcHNbaV1dID0gYXJnc1twXTtcblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9cdExvb2sgYXQgdHJhbnNmb3JtIHByb3BzXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCB0cmFuc2Zvcm1Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRpZih0bXAyID09IHRyYW5zZm9ybVByb3BzW2ldKSB7XG5cdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildID0gcHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildIHx8IFwiXCI7XG5cdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildICs9IFwiIFwiICtwICsgXCIoXCIgKyBhcmdzW3BdICsgXCIpXCI7XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKCFmb3VuZCkge1xuXHRcdFx0XHRwcm9wc1twXSA9IGFyZ3NbcF07XG5cdFx0XHR9XG5cdFx0fX1cblx0XHRyZXR1cm4gcHJvcHM7XG5cdH0sXG5cblx0Ly9cdEZpeCBhbmltYXRpdW9uIHByb3BlcnRpZXNcblx0Ly9cdE5vcm1hbGlzZXMgdHJhbnNmb3JtcywgZWc6IHJvdGF0ZSwgc2NhbGUsIGV0Yy4uLlxuXHRub3JtYWxpc2VUcmFuc2Zvcm1Qcm9wcyA9IGZ1bmN0aW9uKGFyZ3Mpe1xuXHRcdHZhciBwcm9wcyA9IHt9LFxuXHRcdFx0dG1wUHJvcCxcblx0XHRcdHAsIGksIGZvdW5kLFxuXHRcdFx0bm9ybWFsID0gZnVuY3Rpb24ocHJvcHMsIHAsIHZhbHVlKXtcblx0XHRcdFx0dmFyIHRtcCA9IHAudG9Mb3dlckNhc2UoKSxcblx0XHRcdFx0XHRmb3VuZCA9IGZhbHNlLCBpO1xuXG5cdFx0XHRcdC8vXHRMb29rIGF0IHRyYW5zZm9ybSBwcm9wc1xuXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCB0cmFuc2Zvcm1Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGlmKHRtcCA9PSB0cmFuc2Zvcm1Qcm9wc1tpXSkge1xuXHRcdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildID0gcHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildIHx8IFwiXCI7XG5cdFx0XHRcdFx0XHRwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gKz0gXCIgXCIgK3AgKyBcIihcIiArIHZhbHVlICsgXCIpXCI7XG5cdFx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighZm91bmQpIHtcblx0XHRcdFx0XHRwcm9wc1twXSA9IHZhbHVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vXHRSZW1vdmUgdHJhbnNmb3JtIHByb3BlcnR5XG5cdFx0XHRcdFx0ZGVsZXRlIHByb3BzW3BdO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0Ly9cdFNldCBhbnkgYWxsb3dlZCBwcm9wZXJ0aWVzIFxuXHRcdGZvcihwIGluIGFyZ3MpIHsgaWYoYXJncy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuXHRcdFx0Ly9cdElmIHdlIGhhdmUgYSBwZXJjZW50YWdlLCB3ZSBoYXZlIGEga2V5IGZyYW1lXG5cdFx0XHRpZihwLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuXHRcdFx0XHRmb3IoaSBpbiBhcmdzW3BdKSB7IGlmKGFyZ3NbcF0uaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdFx0XHRub3JtYWwoYXJnc1twXSwgaSwgYXJnc1twXVtpXSk7XG5cdFx0XHRcdH19XG5cdFx0XHRcdHByb3BzW3BdID0gYXJnc1twXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5vcm1hbChwcm9wcywgcCwgYXJnc1twXSk7XG5cdFx0XHR9XG5cdFx0fX1cblxuXHRcdHJldHVybiBwcm9wcztcblx0fSxcblxuXG5cdC8vXHRJZiBhbiBvYmplY3QgaXMgZW1wdHlcblx0aXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuXHRcdGZvcih2YXIgaSBpbiBvYmopIHtpZihvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9fVxuXHRcdHJldHVybiB0cnVlOyBcblx0fSxcblx0Ly9cdENyZWF0ZXMgYSBoYXNoZWQgbmFtZSBmb3IgdGhlIGFuaW1hdGlvblxuXHQvL1x0VXNlIHRvIGNyZWF0ZSBhIHVuaXF1ZSBrZXlmcmFtZSBhbmltYXRpb24gc3R5bGUgcnVsZVxuXHRhbmlOYW1lID0gZnVuY3Rpb24ocHJvcHMpe1xuXHRcdHJldHVybiBcImFuaVwiICsgSlNPTi5zdHJpbmdpZnkocHJvcHMpLnNwbGl0KC9be30sJVwiOl0vKS5qb2luKFwiXCIpO1xuXHR9LFxuXHRhbmltYXRpb25zID0ge30sXG5cblx0Ly9cdFNlZSBpZiB3ZSBjYW4gdXNlIHRyYW5zaXRpb25zXG5cdGNhblRyYW5zID0gc3VwcG9ydHNUcmFuc2l0aW9ucygpO1xuXG5cdC8vXHRJRTEwKyBodHRwOi8vY2FuaXVzZS5jb20vI3NlYXJjaD1jc3MtYW5pbWF0aW9uc1xuXHRtLmFuaW1hdGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24oZWwsIGFyZ3MsIGNiKXtcblx0XHRlbC5zdHlsZSA9IGVsLnN0eWxlIHx8IHt9O1xuXHRcdHZhciBwcm9wcyA9IHNldFRyYW5zaXRpb25Qcm9wcyhhcmdzKSwgdGltZTtcblxuXHRcdGlmKHR5cGVvZiBwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24gPSBnZXRUaW1laW5NUyhwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24pICsgXCJtc1wiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24gPSBkZWZhdWx0RHVyYXRpb24gKyBcIm1zXCI7XG5cdFx0fVxuXG5cdFx0dGltZSA9IGdldFRpbWVpbk1TKHByb3BzLlRyYW5zaXRpb25EdXJhdGlvbikgfHwgMDtcblxuXHRcdC8vXHRTZWUgaWYgd2Ugc3VwcG9ydCB0cmFuc2l0aW9uc1xuXHRcdGlmKGNhblRyYW5zKSB7XG5cdFx0XHRzZXRTdHlsZVByb3BzKGVsLCBwcm9wcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vXHRUcnkgYW5kIGZhbGwgYmFjayB0byBqUXVlcnlcblx0XHRcdC8vXHRUT0RPOiBTd2l0Y2ggdG8gdXNlIHZlbG9jaXR5LCBpdCBpcyBiZXR0ZXIgc3VpdGVkLlxuXHRcdFx0aWYodHlwZW9mICQgIT09ICd1bmRlZmluZWQnICYmICQuZm4gJiYgJC5mbi5hbmltYXRlKSB7XG5cdFx0XHRcdCQoZWwpLmFuaW1hdGUocHJvcHMsIHRpbWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKGNiKXtcblx0XHRcdHNldFRpbWVvdXQoY2IsIHRpbWUrMSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vXHRUcmlnZ2VyIGEgdHJhbnNpdGlvbiBhbmltYXRpb25cblx0bS50cmlnZ2VyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9wdGlvbnMsIGNiKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR2YXIgYW5pID0gYW5pbWF0aW9uc1tuYW1lXTtcblx0XHRpZighYW5pKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpe1xuXHRcdFx0dmFyIGFyZ3MgPSBhbmkuZm4oZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nPyB2YWx1ZSgpOiB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL1x0QWxsb3cgb3ZlcnJpZGUgdmlhIG9wdGlvbnNcblx0XHRcdGZvcihpIGluIG9wdGlvbnMpIGlmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRcdGFyZ3NbaV0gPSBvcHRpb25zW2ldO1xuXHRcdFx0fX1cblxuXHRcdFx0bS5hbmltYXRlUHJvcGVydGllcyhlLnRhcmdldCwgYXJncywgY2IpO1xuXHRcdH07XG5cdH07XG5cblx0Ly9cdEFkZHMgYW4gYW5pbWF0aW9uIGZvciBiaW5kaW5ncyBhbmQgc28gb24uXG5cdG0uYWRkQW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSwgZm4sIG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYoYW5pbWF0aW9uc1tuYW1lXSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBhbHJlYWR5IGRlZmluZWQuXCIpO1xuXHRcdH0gZWxzZSBpZih0eXBlb2YgZm4gIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBpcyBiZWluZyBhZGRlZCBhcyBhIHRyYW5zaXRpb24gYmFzZWQgYW5pbWF0aW9uLCBhbmQgbXVzdCB1c2UgYSBmdW5jdGlvbi5cIik7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gfHwgZGVmYXVsdER1cmF0aW9uO1xuXG5cdFx0YW5pbWF0aW9uc1tuYW1lXSA9IHtcblx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRmbjogZm5cblx0XHR9O1xuXG5cdFx0Ly9cdEFkZCBhIGRlZmF1bHQgYmluZGluZyBmb3IgdGhlIG5hbWVcblx0XHRtLmFkZEJpbmRpbmcobmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRtLmJpbmRBbmltYXRpb24obmFtZSwgdGhpcywgZm4sIHByb3ApO1xuXHRcdH0sIHRydWUpO1xuXHR9O1xuXG5cdG0uYWRkS0ZBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lLCBhcmcsIG9wdGlvbnMpe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0aWYoYW5pbWF0aW9uc1tuYW1lXSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBhbHJlYWR5IGRlZmluZWQuXCIpO1xuXHRcdH1cblxuXHRcdHZhciBpbml0ID0gZnVuY3Rpb24ocHJvcHMpIHtcblx0XHRcdHZhciBhbmlJZCA9IGFuaU5hbWUocHJvcHMpLFxuXHRcdFx0XHRoYXNBbmkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmlJZCksXG5cdFx0XHRcdGtmO1xuXG5cdFx0XHQvL1x0T25seSBpbnNlcnQgb25jZVxuXHRcdFx0aWYoIWhhc0FuaSkge1xuXHRcdFx0XHRhbmltYXRpb25zW25hbWVdLmlkID0gYW5pSWQ7XG5cblx0XHRcdFx0cHJvcHMgPSBub3JtYWxpc2VUcmFuc2Zvcm1Qcm9wcyhwcm9wcyk7XG5cdFx0XHRcdC8vICBDcmVhdGUga2V5ZnJhbWVzXG5cdFx0XHRcdGtmID0gdnAoXCJAa2V5ZnJhbWVzXCIpICsgXCIgXCIgKyBhbmlJZCArIFwiIFwiICsgSlNPTi5zdHJpbmdpZnkocHJvcHMpXG5cdFx0XHRcdFx0LnNwbGl0KFwiXFxcIlwiKS5qb2luKFwiXCIpXG5cdFx0XHRcdFx0LnNwbGl0KFwifSxcIikuam9pbihcIn1cXG5cIilcblx0XHRcdFx0XHQuc3BsaXQoXCIsXCIpLmpvaW4oXCI7XCIpXG5cdFx0XHRcdFx0LnNwbGl0KFwiJTpcIikuam9pbihcIiUgXCIpO1xuXG5cdFx0XHRcdHZhciBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblx0XHRcdFx0cy5zZXRBdHRyaWJ1dGUoJ2lkJywgYW5pSWQpO1xuXHRcdFx0XHRzLmlkID0gYW5pSWQ7XG5cdFx0XHRcdHMudGV4dENvbnRlbnQgPSBrZjtcblx0XHRcdFx0Ly8gIE1pZ2h0IG5vdCBoYXZlIGhlYWQ/XG5cdFx0XHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocyk7XG5cdFx0XHR9XG5cblx0XHRcdGFuaW1hdGlvbnNbbmFtZV0uaXNJbml0aWFsaXNlZCA9IHRydWU7XG5cdFx0XHRhbmltYXRpb25zW25hbWVdLm9wdGlvbnMuYW5pbWF0ZUltbWVkaWF0ZWx5ID0gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0b3B0aW9ucy5kdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gfHwgZGVmYXVsdER1cmF0aW9uO1xuXHRcdG9wdGlvbnMuYW5pbWF0ZUltbWVkaWF0ZWx5ID0gb3B0aW9ucy5hbmltYXRlSW1tZWRpYXRlbHkgfHwgZmFsc2U7XG5cblx0XHRhbmltYXRpb25zW25hbWVdID0ge1xuXHRcdFx0aW5pdDogaW5pdCxcblx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRhcmc6IGFyZ1xuXHRcdH07XG5cblx0XHQvL1x0QWRkIGEgZGVmYXVsdCBiaW5kaW5nIGZvciB0aGUgbmFtZVxuXHRcdG0uYWRkQmluZGluZyhuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdG0uYmluZEFuaW1hdGlvbihuYW1lLCB0aGlzLCBhcmcsIHByb3ApO1xuXHRcdH0sIHRydWUpO1xuXHR9O1xuXG5cblx0LypcdE9wdGlvbnMgLSBkZWZhdWx0cyAtIHdoYXQgaXQgZG9lczpcblxuXHRcdERlbGF5IC0gdW5lZGVmaW5lZCAtIGRlbGF5cyB0aGUgYW5pbWF0aW9uXG5cdFx0RGlyZWN0aW9uIC0gXG5cdFx0RHVyYXRpb25cblx0XHRGaWxsTW9kZSAtIFwiZm9yd2FyZFwiIG1ha2VzIHN1cmUgaXQgc3RpY2tzOiBodHRwOi8vd3d3Lnczc2Nob29scy5jb20vY3NzcmVmL2NzczNfcHJfYW5pbWF0aW9uLWZpbGwtbW9kZS5hc3Bcblx0XHRJdGVyYXRpb25Db3VudCwgXG5cdFx0TmFtZSwgUGxheVN0YXRlLCBUaW1pbmdGdW5jdGlvblxuXHRcblx0Ki9cblxuXHQvL1x0VXNlZnVsIHRvIGtub3csICd0bycgYW5kICdmcm9tJzogaHR0cDovL2xlYS52ZXJvdS5tZS8yMDEyLzEyL2FuaW1hdGlvbnMtd2l0aC1vbmUta2V5ZnJhbWUvXG5cdG0uYW5pbWF0ZUtGID0gZnVuY3Rpb24obmFtZSwgZWwsIG9wdGlvbnMsIGNiKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR2YXIgYW5pID0gYW5pbWF0aW9uc1tuYW1lXSwgaSwgcHJvcHMgPSB7fTtcblx0XHRpZighYW5pKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0Ly9cdEFsbG93IG92ZXJyaWRlIHZpYSBvcHRpb25zXG5cdFx0YW5pLm9wdGlvbnMgPSBhbmkub3B0aW9ucyB8fCB7fTtcblx0XHRmb3IoaSBpbiBvcHRpb25zKSBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0YW5pLm9wdGlvbnNbaV0gPSBvcHRpb25zW2ldO1xuXHRcdH19XG5cblx0XHRpZighYW5pLmlzSW5pdGlhbGlzZWQgJiYgYW5pLmluaXQpIHtcblx0XHRcdGFuaS5pbml0KGFuaS5hcmcpO1xuXHRcdH1cblxuXHRcdC8vXHRBbGxvdyBhbmltYXRlIG92ZXJyaWRlc1xuXHRcdGZvcihpIGluIGFuaS5vcHRpb25zKSBpZihhbmkub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uXCIgKyBjYXAoaSkpXSA9IGFuaS5vcHRpb25zW2ldO1xuXHRcdH19XG5cblx0XHQvL1x0U2V0IHJlcXVpcmVkIGl0ZW1zIGFuZCBkZWZhdWx0IHZhbHVlcyBmb3IgcHJvcHNcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbk5hbWVcIildID0gYW5pLmlkO1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildID0gKHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildPyBwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXTogZGVmYXVsdER1cmF0aW9uKSArIFwibXNcIjtcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbkRlbGF5XCIpXSA9IHByb3BzW3ZwKFwiYW5pbWF0aW9uRGVsYXlcIildPyBwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXSArIFwibXNcIjogdW5kZWZpbmVkO1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uRmlsbE1vZGVcIildID0gcHJvcHNbdnAoXCJhbmltYXRpb25GaWxsTW9kZVwiKV0gfHwgXCJmb3J3YXJkc1wiO1xuXG5cdFx0ZWwuc3R5bGUgPSBlbC5zdHlsZSB8fCB7fTtcblxuXHRcdC8vXHRVc2UgZm9yIGNhbGxiYWNrXG5cdFx0dmFyIGVuZEFuaSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHQvL1x0UmVtb3ZlIGxpc3RlbmVyXG5cdFx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYW5pbWF0aW9uZW5kXCIsIGVuZEFuaSwgZmFsc2UpO1xuXHRcdFx0aWYoY2Ipe1xuXHRcdFx0XHRjYihlbCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vXHRSZW1vdmUgYW5pbWF0aW9uIGlmIGFueVxuXHRcdGVsLnN0eWxlW3ZwKFwiYW5pbWF0aW9uXCIpXSA9IFwiXCI7XG5cdFx0ZWwuc3R5bGVbdnAoXCJhbmltYXRpb25OYW1lXCIpXSA9IFwiXCI7XG5cblx0XHQvL1x0TXVzdCB1c2UgdHdvIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGNhbGxzLCBmb3IgRkYgdG9cblx0XHQvL1x0d29yayBwcm9wZXJseSwgZG9lcyBub3Qgc2VlbSB0byBoYXZlIGFueSBhZHZlcnNlIGVmZmVjdHNcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuXHRcdFx0XHQvL1x0QXBwbHkgcHJvcHNcblx0XHRcdFx0Zm9yKGkgaW4gcHJvcHMpIGlmKHByb3BzLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0XHRcdGVsLnN0eWxlW2ldID0gcHJvcHNbaV07XG5cdFx0XHRcdH19XG5cblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcImFuaW1hdGlvbmVuZFwiLCBlbmRBbmksIGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdG0udHJpZ2dlcktGID0gZnVuY3Rpb24obmFtZSwgb3B0aW9ucyl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0XHRtLmFuaW1hdGVLRihuYW1lLCB0aGlzLCBvcHRpb25zKTtcblx0XHR9O1xuXHR9O1xuXG5cdG0uYmluZEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGVsLCBvcHRpb25zLCBwcm9wKSB7XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV07XG5cblx0XHRpZighYW5pICYmICFhbmkubmFtZSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdGlmKGFuaS5mbikge1xuXHRcdFx0bS5hbmltYXRlUHJvcGVydGllcyhlbCwgYW5pLmZuKHByb3ApKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIG9sZENvbmZpZyA9IGVsLmNvbmZpZztcblx0XHRcdGVsLmNvbmZpZyA9IGZ1bmN0aW9uKGVsLCBpc0luaXQpe1xuXHRcdFx0XHRpZighYW5pLmlzSW5pdGlhbGlzZWQgJiYgYW5pLmluaXQpIHtcblx0XHRcdFx0XHRhbmkuaW5pdChvcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihwcm9wKCkgJiYgaXNJbml0KSB7XG5cdFx0XHRcdFx0bS5hbmltYXRlS0YobmFtZSwgZWwsIG9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKG9sZENvbmZpZykge1xuXHRcdFx0XHRcdG9sZENvbmZpZy5hcHBseShlbCwgYXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cblxuXG5cdC8qIERlZmF1bHQgdHJhbnNmb3JtMmQgYmluZGluZ3MgKi9cblx0dmFyIGJhc2ljQmluZGluZ3MgPSBbJ3NjYWxlJywgJ3NjYWxleCcsICdzY2FsZXknLCAndHJhbnNsYXRlJywgJ3RyYW5zbGF0ZXgnLCAndHJhbnNsYXRleScsIFxuXHRcdCdtYXRyaXgnLCAnYmFja2dyb3VuZENvbG9yJywgJ2JhY2tncm91bmRQb3NpdGlvbicsICdib3JkZXJCb3R0b21Db2xvcicsIFxuXHRcdCdib3JkZXJCb3R0b21XaWR0aCcsICdib3JkZXJMZWZ0Q29sb3InLCAnYm9yZGVyTGVmdFdpZHRoJywgJ2JvcmRlclJpZ2h0Q29sb3InLCBcblx0XHQnYm9yZGVyUmlnaHRXaWR0aCcsICdib3JkZXJTcGFjaW5nJywgJ2JvcmRlclRvcENvbG9yJywgJ2JvcmRlclRvcFdpZHRoJywgJ2JvdHRvbScsIFxuXHRcdCdjbGlwJywgJ2NvbG9yJywgJ2ZvbnRTaXplJywgJ2ZvbnRXZWlnaHQnLCAnaGVpZ2h0JywgJ2xlZnQnLCAnbGV0dGVyU3BhY2luZycsIFxuXHRcdCdsaW5lSGVpZ2h0JywgJ21hcmdpbkJvdHRvbScsICdtYXJnaW5MZWZ0JywgJ21hcmdpblJpZ2h0JywgJ21hcmdpblRvcCcsICdtYXhIZWlnaHQnLCBcblx0XHQnbWF4V2lkdGgnLCAnbWluSGVpZ2h0JywgJ21pbldpZHRoJywgJ29wYWNpdHknLCAnb3V0bGluZUNvbG9yJywgJ291dGxpbmVXaWR0aCcsIFxuXHRcdCdwYWRkaW5nQm90dG9tJywgJ3BhZGRpbmdMZWZ0JywgJ3BhZGRpbmdSaWdodCcsICdwYWRkaW5nVG9wJywgJ3JpZ2h0JywgJ3RleHRJbmRlbnQnLCBcblx0XHQndGV4dFNoYWRvdycsICd0b3AnLCAndmVydGljYWxBbGlnbicsICd2aXNpYmlsaXR5JywgJ3dpZHRoJywgJ3dvcmRTcGFjaW5nJywgJ3pJbmRleCddLFxuXHRcdGRlZ0JpbmRpbmdzID0gWydyb3RhdGUnLCAncm90YXRleCcsICdyb3RhdGV5JywgJ3NrZXd4JywgJ3NrZXd5J10sIGk7XG5cblx0Ly9cdEJhc2ljIGJpbmRpbmdzIHdoZXJlIHdlIHBhc3MgdGhlIHByb3Agc3RyYWlnaHQgdGhyb3VnaFxuXHRmb3IoaSA9IDA7IGkgPCBiYXNpY0JpbmRpbmdzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0KGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0bS5hZGRBbmltYXRpb24obmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRcdHZhciBvcHRpb25zID0ge307XG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSBwcm9wKCk7XG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fSk7XG5cdFx0fShiYXNpY0JpbmRpbmdzW2ldKSk7XG5cdH1cblxuXHQvL1x0RGVncmVlIGJhc2VkIGJpbmRpbmdzIC0gY29uZGl0aW9uYWxseSBwb3N0Zml4IHdpdGggXCJkZWdcIlxuXHRmb3IoaSA9IDA7IGkgPCBkZWdCaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdChmdW5jdGlvbihuYW1lKXtcblx0XHRcdG0uYWRkQW5pbWF0aW9uKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IHt9LCB2YWx1ZSA9IHByb3AoKTtcblx0XHRcdFx0b3B0aW9uc1tuYW1lXSA9IGlzTmFOKHZhbHVlKT8gdmFsdWU6IHZhbHVlICsgXCJkZWdcIjtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0XHR9KTtcblx0XHR9KGRlZ0JpbmRpbmdzW2ldKSk7XG5cdH1cblxuXHQvL1x0QXR0cmlidXRlcyB0aGF0IHJlcXVpcmUgbW9yZSB0aGFuIG9uZSBwcm9wXG5cdG0uYWRkQW5pbWF0aW9uKFwic2tld1wiLCBmdW5jdGlvbihwcm9wKXtcblx0XHR2YXIgdmFsdWUgPSBwcm9wKCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNrZXc6IFtcblx0XHRcdFx0dmFsdWVbMF0gKyAoaXNOYU4odmFsdWVbMF0pPyBcIlwiOlwiZGVnXCIpLCBcblx0XHRcdFx0dmFsdWVbMV0gKyAoaXNOYU4odmFsdWVbMV0pPyBcIlwiOlwiZGVnXCIpXG5cdFx0XHRdXG5cdFx0fTtcblx0fSk7XG5cblxuXG5cdC8vXHRBIGZldyBtb3JlIGJpbmRpbmdzXG5cdG0gPSBtIHx8IHt9O1xuXHQvL1x0SGlkZSBub2RlXG5cdG0uYWRkQmluZGluZyhcImhpZGVcIiwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5zdHlsZSA9IHtcblx0XHRcdGRpc3BsYXk6IG0udW53cmFwKHByb3ApPyBcIm5vbmVcIiA6IFwiXCJcblx0XHR9O1xuXHR9LCB0cnVlKTtcblxuXHQvL1x0VG9nZ2xlIGJvb2xlYW4gdmFsdWUgb24gY2xpY2tcblx0bS5hZGRCaW5kaW5nKCd0b2dnbGUnLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9uY2xpY2sgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHZhbHVlID0gcHJvcCgpO1xuXHRcdFx0cHJvcCghdmFsdWUpO1xuXHRcdH1cblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFNldCBob3ZlciBzdGF0ZXMsIGEnbGEgalF1ZXJ5IHBhdHRlcm5cblx0bS5hZGRCaW5kaW5nKCdob3ZlcicsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMub25tb3VzZW92ZXIgPSBwcm9wWzBdO1xuXHRcdGlmKHByb3BbMV0pIHtcblx0XHRcdHRoaXMub25tb3VzZW91dCA9IHByb3BbMV07XG5cdFx0fVxuXHR9LCB0cnVlICk7XG5cblxufTtcblxuXG5cblxuXG5cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsQW5pbWF0ZTtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtaXRocmlsQW5pbWF0ZTtcblx0fSk7XG59IGVsc2Uge1xuXHRtaXRocmlsQW5pbWF0ZSh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSk7XG59XG5cbn0oKSk7IiwiLy8gIFNtb290aCBzY3JvbGxpbmcgZm9yIGxpbmtzXG4vLyAgVXNhZ2U6ICAgICAgQSh7Y29uZmlnOiBzbW9vdGhTY3JvbGwoY3RybCksIGhyZWY6IFwiI3RvcFwifSwgXCJCYWNrIHRvIHRvcFwiKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKXtcblx0Ly92YXIgcm9vdCA9ICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKT8gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ6IHRoaXMsXG5cdHZhciByb290ID0gKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKT8gL2ZpcmVmb3h8dHJpZGVudC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5OiBudWxsLFxuXHRcdGVhc2VJbk91dFNpbmUgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdFx0Ly8gIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuXHRcdFx0cmV0dXJuIC1jLzIgKiAoTWF0aC5jb3MoTWF0aC5QSSp0L2QpIC0gMSkgKyBiO1xuXHRcdH07XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcblx0XHRpZighaXNJbml0aWFsaXplZCkge1xuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHR2YXIgc3RhcnRUaW1lLFxuXHRcdFx0XHRcdHN0YXJ0UG9zID0gcm9vdC5zY3JvbGxUb3AsXG5cdFx0XHRcdFx0ZW5kUG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoL1teI10rJC8uZXhlYyh0aGlzLmhyZWYpWzBdKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AsXG5cdFx0XHRcdFx0aGFzaCA9IHRoaXMuaHJlZi5zdWJzdHIodGhpcy5ocmVmLmxhc3RJbmRleE9mKFwiI1wiKSksXG5cdFx0XHRcdFx0bWF4U2Nyb2xsID0gcm9vdC5zY3JvbGxIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQsXG5cdFx0XHRcdFx0c2Nyb2xsRW5kVmFsdWUgPSAoc3RhcnRQb3MgKyBlbmRQb3MgPCBtYXhTY3JvbGwpPyBlbmRQb3M6IG1heFNjcm9sbCAtIHN0YXJ0UG9zLFxuXHRcdFx0XHRcdGR1cmF0aW9uID0gdHlwZW9mIGN0cmwuZHVyYXRpb24gIT09ICd1bmRlZmluZWQnPyBjdHJsLmR1cmF0aW9uOiAxNTAwLFxuXHRcdFx0XHRcdHNjcm9sbEZ1bmMgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcblx0XHRcdFx0XHRcdHN0YXJ0VGltZSA9IHN0YXJ0VGltZSB8fCB0aW1lc3RhbXA7XG5cdFx0XHRcdFx0XHR2YXIgZWxhcHNlZCA9IHRpbWVzdGFtcCAtIHN0YXJ0VGltZSxcblx0XHRcdFx0XHRcdFx0cHJvZ3Jlc3MgPSBlYXNlSW5PdXRTaW5lKGVsYXBzZWQsIHN0YXJ0UG9zLCBzY3JvbGxFbmRWYWx1ZSwgZHVyYXRpb24pO1xuXHRcdFx0XHRcdFx0cm9vdC5zY3JvbGxUb3AgPSBwcm9ncmVzcztcblx0XHRcdFx0XHRcdGlmKGVsYXBzZWQgPCBkdXJhdGlvbikge1xuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsRnVuYyk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZihoaXN0b3J5LnB1c2hTdGF0ZSkge1xuXHRcdFx0XHRcdFx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxGdW5jKVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHtcIkFwaS5tZFwiOlwiPHA+VGhlIGRhdGEgYXBpcyBpbiBtaXNvIGFyZSBhIHdheSB0byBjcmVhdGUgYSBSRVNUZnVsIGVuZHBvaW50IHRoYXQgeW91IGNhbiBpbnRlcmFjdCB3aXRoIHZpYSBhbiBlYXN5IHRvIHVzZSBBUEkuPC9wPlxcbjxibG9ja3F1b3RlPlxcbk5vdGU6IHlvdSBtdXN0IGVuYWJsZSB5b3VyIGFwaSBieSBhZGRpbmcgaXQgdG8gdGhlICZxdW90O2FwaSZxdW90OyBhdHRyaWJ1dGUgaW4gdGhlIDxjb2RlPi9jZmcvc2VydmVyLmRldmVsb3BtZW50Lmpzb248L2NvZGU+IGZpbGUsIG9yIHdoYXRldmVyIGVudmlyb25tZW50IHlvdSBhcmUgdXNpbmcuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxoMj48YSBuYW1lPVxcXCJob3ctZG9lcy1hbi1hcGktd29yay1cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctZG9lcy1hbi1hcGktd29yay1cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SG93IGRvZXMgYW4gYXBpIHdvcms/PC9zcGFuPjwvYT48L2gyPjxwPlRoZSBhcGlzIGluIG1pc28gZG8gYSBudW1iZXIgb2YgdGhpbmdzOjwvcD5cXG48dWw+XFxuPGxpPkFsbG93IGRhdGFiYXNlIGFjY2VzcyB2aWEgYSB0aGluIHdyYXBwZXIsIGZvciBleGFtcGxlIHRvIGFjY2VzcyBtb25nb2RiLCB3ZSB3cmFwIHRoZSBwb3B1bGFyIDxhIGhyZWY9XFxcIi9kb2MvbW9uZ29vc2UubWRcXFwiPm1vbmdvb3NlIG5wbTwvYT4gT0RNIHBhY2thZ2U8L2xpPlxcbjxsaT5XYWl0cyB0aWxsIG1pdGhyaWwgaXMgcmVhZHkgLSBtaXRocmlsIGhhcyBhIHVuaXF1ZSBmZWF0dXJlIGVuc3VyZXMgdGhlIHZpZXcgZG9lc24mIzM5O3QgcmVuZGVyIHRpbGwgZGF0YSBoYXMgYmVlbiByZXRyaWV2ZWQgLSB0aGUgYXBpIG1ha2VzIHN1cmUgd2UgYWRoZXJlIHRvIHRoaXM8L2xpPlxcbjxsaT5BcGlzIGNhbiB3b3JrIGFzIGEgcHJveHksIHNvIGlmIHlvdSB3YW50IHRvIGFjY2VzcyBhIDNyZCBwYXJ0eSBzZXJ2aWNlLCBhbiBhcGkgaXMgYSBnb29kIHdheSB0byBkbyB0aGF0IC0geW91IGNhbiB0aGVuIGFsc28gYnVpbGQgaW4gY2FjaGluZywgb3IgYW55IG90aGVyIGZlYXR1cmVzIHlvdSBtYXkgd2lzaCB0byBhZGQuPC9saT5cXG48bGk+QXBpcyBjYW4gYmUgcmVzdHJpY3RlZCBieSBwZXJtaXNzaW9ucyAoY29taW5nIHNvb24pIDwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiaG93LXNob3VsZC15b3UtdXNlLWFwaXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctc2hvdWxkLXlvdS11c2UtYXBpc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ib3cgc2hvdWxkIHlvdSB1c2UgYXBpczwvc3Bhbj48L2E+PC9oMj48cD5UaGVyZSBhcmUgbnVtZXJvdXMgc2NlbmFyaW9zIHdoZXJlIHlvdSBtaWdodCB3YW50IHRvIHVzZSBhbiBhcGk6PC9wPlxcbjx1bD5cXG48bGk+Rm9yIGRhdGFiYXNlIGFjY2VzcyAobWlzbyBjb21lcyB3aXRoIGEgYnVuY2ggb2YgZGF0YWJhc2UgYXBpcyk8L2xpPlxcbjxsaT5Gb3IgY2FsbGluZyAzcmQgcGFydHkgZW5kLXBvaW50cyAtIHVzaW5nIGFuIGFwaSB3aWxsIGFsbG93IHlvdSB0byBjcmVhdGUgY2FjaGluZyBhbmQgc2V0dXAgcGVybWlzc2lvbnMgb24gdGhlIGVuZC1wb2ludDwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiZXh0ZW5kaW5nLWFuLWV4aXN0aW5nLWFwaVxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2V4dGVuZGluZy1hbi1leGlzdGluZy1hcGlcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RXh0ZW5kaW5nIGFuIGV4aXN0aW5nIGFwaTwvc3Bhbj48L2E+PC9oMj48cD5JZiB5b3Ugd2FudCB0byBhZGQgeW91ciBvd24gbWV0aG9kcyB0byBhbiBhcGksIHlvdSBjYW4gc2ltcGx5IGV4dGVuZCBvbmUgb2YgdGhlIGV4aXN0aW5nIGFwaXMsIGZvciBleGFtcGxlLCB0byBleHRlbmQgdGhlIDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IEFQSSwgY3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBhbmQgZmlsZSBpbiA8Y29kZT4vbW9kdWxlcy9hcGkvYWRhcHQvYWRhcHQuYXBpLmpzPC9jb2RlPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgZGIgPSByZXF1aXJlKCYjMzk7Li4vLi4vLi4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2ZsYXRmaWxlZGIuYXBpLmpzJiMzOTspO1xcblxcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XFxuICAgIHZhciBhZCA9IGRiKG0pO1xcbiAgICBhZC5oZWxsbyA9IGZ1bmN0aW9uKGNiLCBlcnIsIGFyZ3MsIHJlcSl7XFxuICAgICAgICBjYigmcXVvdDt3b3JsZCZxdW90Oyk7XFxuICAgIH07XFxuICAgIHJldHVybiBhZDtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIGFkZCB0aGUgYXBpIHRvIHRoZSA8Y29kZT4vY2ZnL3NlcnZlci5kZXZlbG9wbWVudC5qc29uPC9jb2RlPiBmaWxlIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+JnF1b3Q7YXBpJnF1b3Q7OiAmcXVvdDthZGFwdCZxdW90O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIHJlcXVpcmUgdGhlIG5ldyBhcGkgZmlsZSBpbiB5b3VyIG12YyBmaWxlIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIgPSByZXF1aXJlKCYjMzk7Li4vbW9kdWxlcy9hcGkvYWRhcHQvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+WW91IGNhbiBub3cgYWRkIGFuIGFwaSBjYWxsIGluIHRoZSBjb250cm9sbGVyIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIuaGVsbG8oe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuLy8gZG8gc29tZXRoaW5nIHdpdGggZGF0YS5yZXN1bHRcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIGFyZ3VtZW50cyB0byBlYWNoIGFwaSBlbmRwb2ludCBtdXN0IGJlIHRoZSBzYW1lLCBpZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpXFxuPC9jb2RlPjwvcHJlPlxcbjxwPldoZXJlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+QXJndW1lbnQ8L3RoPlxcbjx0aD5QdXJwb3NlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+Y2I8L3RkPlxcbjx0ZD5BIGNhbGxiYWNrIHlvdSBtdXN0IGNhbGwgd2hlbiB5b3UgYXJlIGRvbmUgLSBhbnkgZGF0YSB5b3UgcmV0dXJuIHdpbGwgYmUgYXZhaWxhYmxlIG9uIDxjb2RlPmRhdGEucmVzdWx0PC9jb2RlPiBpbiB0aGUgcmVzcG9uc2U8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5lcnI8L3RkPlxcbjx0ZD5BIGNhbGxiYWNrIHlvdSBtdXN0IGNhbGwgaWYgYW4gdW5yZWNvdmVyYWJsZSBlcnJvciBvY2N1cnJlZCwgZWc6ICZxdW90O2RhdGFiYXNlIGNvbm5lY3Rpb24gdGltZW91dCZxdW90Oy4gRG8gbm90IHVzZSBmb3IgdGhpbmdzIGxpa2UgJnF1b3Q7bm8gZGF0YSBmb3VuZCZxdW90OzwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmFyZ3M8L3RkPlxcbjx0ZD5BIHNldCBvZiBhcmd1bWVudHMgcGFzc2VkIGluIHRvIHRoZSBhcGkgbWV0aG9kPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+cmVxPC90ZD5cXG48dGQ+VGhlIHJlcXVlc3Qgb2JqZWN0IGZyb20gdGhlIHJlcXVlc3Q8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlRoZSBjb21wbGV0ZSBtdmMgZXhhbXBsZSBsb29rcyBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9hZGFwdC9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7YWRhcHRfaWQmIzM5OywgcGFyYW1zKTtcXG5cXG4gICAgICAgIGRiLmhlbGxvKHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIGN0cmwubW9kZWwud2hvKGRhdGEucmVzdWx0KTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJnF1b3Q7RyYjMzk7ZGF5ICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPGgyPjxhIG5hbWU9XFxcImNyZWF0aW5nLWN1c3RvbS1hcGlzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY3JlYXRpbmctY3VzdG9tLWFwaXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q3JlYXRpbmcgY3VzdG9tIGFwaXM8L3NwYW4+PC9hPjwvaDI+PHA+WW91IGNhbiBhZGQgeW91ciBvd24gY3VzdG9tIGFwaXMgaW4gdGhlIDxjb2RlPi9tb2R1bGVzL2FwaXM8L2NvZGU+IGRpcmVjdG9yeSwgdGhleSBoYXZlIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgaW5jbHVkZWQgYXBpcywgaGVyZSBpcyBhbiBleGFtcGxlIGFwaSB0aGF0IGNhbGxzIHRoZSBmbGlja3IgQVBJOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICAgIGVuZHBvaW50IGFwaSB0byBtYWtlIGh0dHAgcmVxdWVzdHMgdmlhIGZsaWNrclxcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgmIzM5O3JlcXVlc3QmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vLi4vLi4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgLy8gICAgUGFyc2Ugb3V0IHRoZSB1bndhbnRlZCBwYXJ0cyBvZiB0aGUganNvblxcbiAgICAvLyAgICB0eXBpY2FsbHkgdGhpcyB3b3VsZCBiZSBydW4gb24gdGhlIGNsaWVudFxcbiAgICAvLyAgICB3ZSBydW4gdGhpcyB1c2luZyAmcXVvdDtyZXF1ZXN0JnF1b3Q7IG9uICB0aGUgc2VydmVyLCBzb1xcbiAgICAvLyAgICBubyBuZWVkIGZvciB0aGUganNvbnAgY2FsbGJhY2tcXG4gICAganNvblBhcnNlciA9IGZ1bmN0aW9uKGpzb25wRGF0YSl7XFxuICAgICAgICB2YXIganNvbiwgc3RhcnRQb3MsIGVuZFBvcztcXG4gICAgICAgIHRyeSB7XFxuICAgICAgICAgICAgc3RhcnRQb3MgPSBqc29ucERhdGEuaW5kZXhPZigmIzM5Oyh7JiMzOTspO1xcbiAgICAgICAgICAgIGVuZFBvcyA9IGpzb25wRGF0YS5sYXN0SW5kZXhPZigmIzM5O30pJiMzOTspO1xcbiAgICAgICAgICAgIGpzb24gPSBqc29ucERhdGFcXG4gICAgICAgICAgICAgICAgLnN1YnN0cmluZyhzdGFydFBvcysxLCBlbmRQb3MrMSlcXG4gICAgICAgICAgICAgICAgLnNwbGl0KCZxdW90O1xcXFxuJnF1b3Q7KS5qb2luKCZxdW90OyZxdW90OylcXG4gICAgICAgICAgICAgICAgLnNwbGl0KCZxdW90O1xcXFxcXFxcJiMzOTsmcXVvdDspLmpvaW4oJnF1b3Q7JiMzOTsmcXVvdDspO1xcblxcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pO1xcbiAgICAgICAgfSBjYXRjaChleCkge1xcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCZxdW90O0VSUk9SJnF1b3Q7LCBleCk7XFxuICAgICAgICAgICAgcmV0dXJuICZxdW90O3t9JnF1b3Q7O1xcbiAgICAgICAgfVxcbiAgICB9O1xcblxcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXRpbHMpe1xcbiAgICByZXR1cm4ge1xcbiAgICAgICAgcGhvdG9zOiBmdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpe1xcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzIHx8IHt9O1xcbiAgICAgICAgICAgIHZhciB1cmwgPSAmcXVvdDtodHRwOi8vYXBpLmZsaWNrci5jb20vc2VydmljZXMvZmVlZHMvcGhvdG9zX3B1YmxpYy5nbmU/Zm9ybWF0PWpzb24mcXVvdDs7XFxuICAgICAgICAgICAgLy8gICAgQWRkIHBhcmFtZXRlcnNcXG4gICAgICAgICAgICB1cmwgKz0gbWlzby5lYWNoKGFyZ3MsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gJnF1b3Q7JmFtcDsmcXVvdDsgKyBrZXkgKyAmcXVvdDs9JnF1b3Q7ICsgdmFsdWU7XFxuICAgICAgICAgICAgfSk7XFxuXFxuICAgICAgICAgICAgcmVxdWVzdCh1cmwsIGZ1bmN0aW9uIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmYW1wOyZhbXA7IHJlc3BvbnNlLnN0YXR1c0NvZGUgPT0gMjAwKSB7XFxuICAgICAgICAgICAgICAgICAgICBjYihqc29uUGFyc2VyKGJvZHkpKTtcXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgIGVycihlcnJvcik7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH1cXG4gICAgfTtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UbyB1c2UgaXQgaW4geW91ciBtdmMgZmlsZSwgc2ltcGx5OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmZsaWNrciA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9mbGlja3IvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHRoZW4gY2FsbCBpdCBsaWtlIHNvIGluIHlvdXIgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mbGlja3IucGhvdG9zKHt0YWdzOiAmcXVvdDtTeWRuZXkgb3BlcmEgaG91c2UmcXVvdDssIHRhZ21vZGU6ICZxdW90O2FueSZxdW90O30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuICAgIGN0cmwubW9kZWwuZmxpY2tyRGF0YShkYXRhLnJlc3VsdC5pdGVtcyk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcblwiLFwiQ29udHJpYnV0aW5nLm1kXCI6XCI8cD5JbiBvcmRlciB0byBjb250cmlidXRlIHRvIG1pc29qcywgcGxlYXNlIGtlZXAgdGhlIGZvbGxvd2luZyBpbiBtaW5kOjwvcD5cXG48aDI+PGEgbmFtZT1cXFwid2hlbi1hZGRpbmctYS1wdWxsLXJlcXVlc3RcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN3aGVuLWFkZGluZy1hLXB1bGwtcmVxdWVzdFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5XaGVuIGFkZGluZyBhIHB1bGwgcmVxdWVzdDwvc3Bhbj48L2E+PC9oMj48dWw+XFxuPGxpPkJlIHN1cmUgdG8gb25seSBtYWtlIHNtYWxsIGNoYW5nZXMsIGFueXRoaW5nIG1vcmUgdGhhbiA0IGZpbGVzIHdpbGwgbmVlZCB0byBiZSByZXZpZXdlZDwvbGk+XFxuPGxpPk1ha2Ugc3VyZSB5b3UgZXhwbGFpbiA8ZW0+d2h5PC9lbT4geW91JiMzOTtyZSBtYWtpbmcgdGhlIGNoYW5nZSwgc28gd2UgdW5kZXJzdGFuZCB3aGF0IHRoZSBjaGFuZ2UgaXMgZm9yPC9saT5cXG48bGk+QWRkIGEgdW5pdCB0ZXN0IGlmIGFwcHJvcHJpYXRlPC9saT5cXG48bGk+RG8gbm90IGJlIG9mZmVuZGVkIGlmIHdlIGFzayB5b3UgdG8gYWRkIGEgdW5pdCB0ZXN0IGJlZm9yZSBhY2NlcHRpbmcgYSBwdWxsIHJlcXVlc3Q8L2xpPlxcbjxsaT5Vc2UgdGFicyBub3Qgc3BhY2VzICh3ZSBhcmUgbm90IGZsZXhpYmxlIG9uIHRoaXMgLSBpdCBpcyBhIG1vb3QgZGlzY3Vzc2lvbiAtIEkgcmVhbGx5IGRvbiYjMzk7dCBjYXJlLCB3ZSBqdXN0IG5lZWRlZCB0byBwaWNrIG9uZSwgYW5kIHRhYnMgaXQgaXMpPC9saT5cXG48L3VsPlxcblwiLFwiQ3JlYXRpbmctYS10b2RvLWFwcC1wYXJ0LTItcGVyc2lzdGVuY2UubWRcIjpcIjxwPkluIHRoaXMgYXJ0aWNsZSB3ZSB3aWxsIGFkZCBkYXRhIHBlcnNpc3RlbmNlIGZ1bmN0aW9uYWxpdHkgdG8gb3VyIHRvZG8gYXBwIGZyb20gdGhlIDxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC5tZFxcXCI+Q3JlYXRpbmcgYSB0b2RvIGFwcDwvYT4gYXJ0aWNsZS4gV2UgcmVjb21tZW5kIHlvdSBmaXJzdCByZWFkIHRoYXQgYXMgd2UgYXJlIGdvaW5nIHRvIHVzZSB0aGUgYXBwIHlvdSBtYWRlIGluIHRoaXMgYXJ0aWNsZSwgc28gaWYgeW91IGRvbiYjMzk7dCBhbHJlYWR5IGhhdmUgb25lLCBncmFiIGEgY29weSBvZiBpdCA8YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAjY29tcGxldGVkLXRvZG8tYXBwLm1kXFxcIj5mcm9tIGhlcmU8L2E+LCBhbmQgc2F2ZSBpdCBpbiA8Y29kZT4vbXZjL3RvZG8uanM8L2NvZGU+LjwvcD5cXG48cD5GaXJzdCBhZGQgdGhlIDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IGFwaSB0byB0aGUgPGNvZGU+Y2ZnL3NlcnZlci5kZXZlbG9wbWVudC5qc29uPC9jb2RlPiBmaWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPiZxdW90O2FwaSZxdW90OzogJnF1b3Q7ZmxhdGZpbGVkYiZxdW90O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIG1ha2VzIG1pc28gbG9hZCB0aGUgYXBpIGFuZCBleHBvc2UgaXQgYXQgdGhlIGNvbmZpZ3VyZWQgQVBJIHVybCwgZGVmYXVsdCBpcyAmcXVvdDsvYXBpJnF1b3Q7ICsgYXBpIG5hbWUsIHNvIGZvciB0aGUgZmxhdGZpbGVkYiBpdCB3aWxsIGJlIDxjb2RlPi9hcGkvZmxhdGZpbGVkYjwvY29kZT4uIFRoaXMgaXMgYWxsIGFic3RyYWN0ZWQgYXdheSwgc28geW91IGRvIG5vdCBuZWVkIHRvIHdvcnJ5IGFib3V0IHdoYXQgdGhlIFVSTCBpcyB3aGVuIHVzaW5nIHRoZSBhcGkgLSB5b3Ugc2ltcGx5IGNhbGwgdGhlIG1ldGhvZCB5b3Ugd2FudCwgYW5kIHRoZSBtaXNvIGFwaSB0YWtlcyBjYXJlIG9mIHRoZSByZXN0LjwvcD5cXG48cD5Ob3cgcmVxdWlyZSB0aGUgZGIgYXBpIGF0IHRoZSB0aGUgdG9wIG9mIHRoZSB0b2RvLmpzIGZpbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIgPSByZXF1aXJlKCYjMzk7Li4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5leHQgYWRkIHRoZSBmb2xsb3dpbmcgaW4gdGhlIDxjb2RlPmN0cmwuYWRkVG9kbzwvY29kZT4gZnVuY3Rpb24gdW5kZXJuZWF0aCB0aGUgbGluZSB0aGF0IHJlYWRzIDxjb2RlPmN0cmwudm0uaW5wdXQoJnF1b3Q7JnF1b3Q7KTs8L2NvZGU+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiLnNhdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBtb2RlbDogbmV3VG9kbyB9ICkudGhlbihmdW5jdGlvbihyZXMpe1xcbiAgICBuZXdUb2RvLl9pZCA9IHJlcy5yZXN1bHQ7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBzYXZlIHRoZSB0b2RvIHRvIHRoZSBkYXRhYmFzZSB3aGVuIHlvdSBjbGljayB0aGUgJnF1b3Q7QWRkJnF1b3Q7IGJ1dHRvbi48L3A+XFxuPHA+TGV0IHVzIHRha2UgYSBxdWljayBsb29rIGF0IGhvdyB0aGUgYXBpIHdvcmtzIC0gdGhlIHdheSB0aGF0IHlvdSBtYWtlIHJlcXVlc3RzIHRvIHRoZSBhcGkgZGVwZW5kcyBlbnRpcmVseSBvbiB3aGljaCBhcGkgeW91IGFyZSB1c2luZywgZm9yIGV4YW1wbGUgZm9yIHRoZSBmbGF0ZmlsZWRiLCB3ZSBoYXZlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+TWV0aG9kPC90aD5cXG48dGg+QWN0aW9uPC90aD5cXG48dGg+UGFyYW1ldGVyczwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPnNhdmU8L3RkPlxcbjx0ZD5TYXZlIG9yIHVwZGF0ZXMgYSBtb2RlbDwvdGQ+XFxuPHRkPnsgdHlwZTogVFlQRSwgbW9kZWw6IE1PREVMIH08L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5maW5kPC90ZD5cXG48dGQ+RmluZHMgb25lIG9yIG1vcmUgbW9kZWxzIG9mIHRoZSBnaXZlIHR5cGU8L3RkPlxcbjx0ZD57IHR5cGU6IFRZUEUsIHF1ZXJ5OiBRVUVSWSB9PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+cmVtb3ZlPC90ZD5cXG48dGQ+UmVtb3ZlcyBhbiBpbnN0YW5jZSBvZiBhIG1vZGVsPC90ZD5cXG48dGQ+eyB0eXBlOiBUWVBFLCBpZDogSUQgfTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+V2hlcmUgdGhlIGF0dHJpYnV0ZXMgYXJlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+QXR0cmlidXRlPC90aD5cXG48dGg+VXNlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+VFlQRTwvdGQ+XFxuPHRkPlRoZSBuYW1lc3BhY2Ugb2YgdGhlIG1vZGVsLCBzYXkgeW91IGhhdmUgdG9kby5qcywgYW5kIHRoZSBtb2RlbCBpcyBvbiA8Y29kZT5tb2R1bGUuZXhwb3J0cy5pbmRleC5tb2R1bGVzLnRvZG88L2NvZGU+LCB0aGUgdHlwZSB3b3VsZCBiZSAmcXVvdDt0b2RvLmluZGV4LnRvZG8mcXVvdDs8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5NT0RFTDwvdGQ+XFxuPHRkPlRoaXMgaXMgYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kZWwgLSBlZzogYSBzdGFuZGFyZCBtaXRocmlsIG1vZGVsPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UVVFUlk8L3RkPlxcbjx0ZD5BbiBvYmplY3Qgd2l0aCBhdHRyaWJ1dGVzIHRvIGZpbHRlciB0aGUgcXVlcnkgcmVzdWx0czwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPklEPC90ZD5cXG48dGQ+QSB1bmlxdWUgSUQgZm9yIGEgcmVjb3JkPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5FdmVyeSBtZXRob2QgcmV0dXJucyBhIDxhIGhyZWY9XFxcIi9kb2MvbWl0aHJpbC5kZWZlcnJlZC5odG1sI2RpZmZlcmVuY2VzLWZyb20tcHJvbWlzZXMtYS0ubWRcXFwiPm1pdGhyaWwgc3R5bGUgcHJvbWlzZTwvYT4sIHdoaWNoIG1lYW5zIHlvdSBtdXN0IGF0dGFjaCBhIDxjb2RlPi50aGVuPC9jb2RlPiBjYWxsYmFjayBmdW5jdGlvbi5cXG5CZSBzdXJlIHRvIGNoZWNrIHRoZSBtZXRob2RzIGZvciBlYWNoIGFwaSwgYXMgZWFjaCB3aWxsIHZhcnksIGRlcGVuZGluZyBvbiB0aGUgZnVuY3Rpb25hbGl0eS48L3A+XFxuPHA+Tm93LCBsZXQgdXMgYWRkIHRoZSBjYXBhYmlsaXR5IHRvIGxvYWQgb3VyIHRvZG9zLCBhZGQgdGhlIGZvbGxvd2luZyB0byB0aGUgc3RhcnQgb2YgdGhlIGNvbnRyb2xsZXIsIGp1c3QgYWZ0ZXIgdGhlIDxjb2RlPnZhciBjdHJsID0gdGhpczwvY29kZT46PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIuZmluZCh7dHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xcbiAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKGRhdGEucmVzdWx0W2tleV0pO1xcbiAgICB9KTtcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGxvYWQgeW91ciB0b2RvcyB3aGVuIHRoZSBhcHAgbG9hZHMgdXAuIEJlIHN1cmUgdG8gcmVtb3ZlIHRoZSBvbGQgc3RhdGljIGxpc3QsIGllOiByZW1vdmUgdGhlc2UgbGluZXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcblxcbmN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKG15VG9kb3Nba2V5XSk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5vdyB5b3UgY2FuIHRyeSBhZGRpbmcgYSB0b2RvLCBhbmQgaXQgd2lsbCBzYXZlIGFuZCBsb2FkITwvcD5cXG48cD5OZXh0IGxldCB1cyBhZGQgdGhlIGFiaWxpdHkgdG8gcmVtb3ZlIHlvdXIgY29tcGxldGVkIHRvZG9zIGluIHRoZSBhcmNoaXZlIG1ldGhvZCAtIGV4dGVuZCB0aGUgPGNvZGU+aWY8L2NvZGU+IHN0YXRlbWVudCBieSBhZGRpbmcgYW4gPGNvZGU+ZWxzZTwvY29kZT4gbGlrZSBzbzogPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+fSBlbHNlIHtcXG4gICAgYXBpLnJlbW92ZSh7IHR5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTssIF9pZDogdG9kby5faWQgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XFxuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5yZXN1bHQpO1xcbiAgICB9KTtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCByZW1vdmUgdGhlIHRvZG8gZnJvbSB0aGUgZGF0YSBzdG9yZS48L3A+XFxuPHA+WW91IG5vdyBoYXZlIGEgY29tcGxldGUgdG9kbyBhcHAsIHlvdXIgYXBwIHNob3VsZCBsb29rIGxpa2UgdGhpczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGRiID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IG0ucHJvcChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzO1xcblxcbiAgICAgICAgZGIuZmluZCh7dHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xcbiAgICAgICAgICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhkYXRhLnJlc3VsdFtrZXldKTtcXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xcbiAgICAgICAgICAgIGlmKHZhbHVlKSB7XFxuICAgICAgICAgICAgICAgIHZhciBuZXdUb2RvID0gbmV3IHNlbGYubW9kZWxzLnRvZG8oe1xcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogY3RybC52bS5pbnB1dCgpLFxcbiAgICAgICAgICAgICAgICAgICAgZG9uZTogZmFsc2VcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7XFxuICAgICAgICAgICAgICAgIGRiLnNhdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBtb2RlbDogbmV3VG9kbyB9ICkudGhlbihmdW5jdGlvbihyZXMpe1xcbiAgICAgICAgICAgICAgICAgICAgbmV3VG9kby5faWQgPSByZXMucmVzdWx0O1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLmFyY2hpdmUgPSBmdW5jdGlvbigpe1xcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW107XFxuICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICAgICAgICAgIGlmKCF0b2RvLmRvbmUoKSkge1xcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHRvZG8pOyBcXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgIGRiLnJlbW92ZSh7IHR5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTssIF9pZDogdG9kby5faWQgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzdWx0KTtcXG4gICAgICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgY3RybC5saXN0ID0gbGlzdDtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLnZtID0ge1xcbiAgICAgICAgICAgIGxlZnQ6IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICAgICAgY291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudDtcXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XFxuICAgICAgICAgICAgICAgICAgICB0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgaW5wdXQ6IG0ucHJvcCgmcXVvdDsmcXVvdDspXFxuICAgICAgICB9O1xcblxcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgU1RZTEUoJnF1b3Q7LmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fSZxdW90OyksXFxuICAgICAgICAgICAgICAgIEgxKCZxdW90O1RvZG9zIC0gJnF1b3Q7ICsgY3RybC52bS5sZWZ0KCkgKyAmcXVvdDsgb2YgJnF1b3Q7ICsgY3RybC5saXN0Lmxlbmd0aCArICZxdW90OyByZW1haW5pbmcmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBCVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgJnF1b3Q7QXJjaGl2ZSZxdW90OyksXFxuICAgICAgICAgICAgICAgIFVMKFtcXG4gICAgICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyAmcXVvdDtkb25lJnF1b3Q7OiAmcXVvdDsmcXVvdDssIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xcbiAgICAgICAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICAgICAgXSksXFxuICAgICAgICAgICAgICAgIEZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcXG4gICAgICAgICAgICAgICAgICAgIElOUFVUKHsgdHlwZTogJnF1b3Q7dGV4dCZxdW90OywgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiAmcXVvdDtBZGQgdG9kbyZxdW90O30pLFxcbiAgICAgICAgICAgICAgICAgICAgQlVUVE9OKHsgdHlwZTogJnF1b3Q7c3VibWl0JnF1b3Q7fSwgJnF1b3Q7QWRkJnF1b3Q7KVxcbiAgICAgICAgICAgICAgICBdKVxcbiAgICAgICAgICAgIF1cXG4gICAgICAgIH07XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG5cIixcIkNyZWF0aW5nLWEtdG9kby1hcHAubWRcIjpcIjxwPkluIHRoaXMgYXJ0aWNsZSB3ZSB3aWxsIGNyZWF0ZSBhIGZ1bmN0aW9uYWwgdG9kbyBhcHAgLSB3ZSByZWNvbW1lbmQgeW91IGZpcnN0IHJlYWQgdGhlIDxhIGhyZWY9XFxcIi9kb2MvR2V0dGluZy1zdGFydGVkLm1kXFxcIj5HZXR0aW5nIHN0YXJ0ZWQ8L2E+IGFydGljbGUsIGFuZCB1bmRlcnN0YW5kIHRoZSBtaXNvIGZ1bmRhbWVudGFscyBzdWNoIGFzIHdoZXJlIHRvIHBsYWNlIG1vZGVscyBhbmQgaG93IHRvIGNyZWF0ZSBhIG1pc28gY29udHJvbGxlci48L3A+XFxuPGgyPjxhIG5hbWU9XFxcInRvZG8tYXBwXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjdG9kby1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+VG9kbyBhcHA8L3NwYW4+PC9hPjwvaDI+PHA+V2Ugd2lsbCBub3cgY3JlYXRlIGEgbmV3IGFwcCB1c2luZyB0aGUgPGEgaHJlZj1cXFwiL2RvYy9QYXR0ZXJucyNzaW5nbGUtdXJsLW12Yy5tZFxcXCI+c2luZ2xlIHVybCBwYXR0ZXJuPC9hPiwgd2hpY2ggbWVhbnMgaXQgaGFuZGxlcyBhbGwgYWN0aW9ucyBhdXRvbm9tb3VzbHksIHBsdXMgbG9va3MgYSBsb3QgbGlrZSBhIG5vcm1hbCBtaXRocmlsIGFwcC48L3A+XFxuPHA+SW4gPGNvZGU+L212YzwvY29kZT4gc2F2ZSBhIG5ldyBmaWxlIGFzIDxjb2RlPnRvZG8uanM8L2NvZGU+IHdpdGggdGhlIGZvbGxvd2luZyBjb250ZW50OiA8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge30sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzO1xcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHJldHVybiAmcXVvdDtUT0RPJnF1b3Q7O1xcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+Tm93IG9wZW46IDxhIGhyZWY9XFxcIi9kb2MvdG9kb3MubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3Q6NjQ3Ni90b2RvczwvYT4gYW5kIHlvdSYjMzk7bGwgc2VlIHRoZSB3b3JkICZxdW90O1RPRE8mcXVvdDsuIFlvdSYjMzk7bGwgbm90aWNlIHRoYXQgdGhlIHVybCBpcyAmcXVvdDsvdG9kb3MmcXVvdDsgd2l0aCBhbiAmIzM5O3MmIzM5OyBvbiB0aGUgZW5kIC0gYXMgd2UgYXJlIHVzaW5nIDxhIGhyZWY9XFxcIi9kb2MvSG93LW1pc28td29ya3Mjcm91dGUtYnktY29udmVudGlvbi5tZFxcXCI+cm91dGUgYnkgY29udmVudGlvbjwvYT4gdG8gbWFwIG91ciByb3V0ZS48L3A+XFxuPHA+TmV4dCBsZXQmIzM5O3MgY3JlYXRlIHRoZSBtb2RlbCBmb3Igb3VyIHRvZG9zIC0gY2hhbmdlIHRoZSA8Y29kZT5tb2RlbHM8L2NvZGU+IGF0dHJpYnV0ZSB0byB0aGUgZm9sbG93aW5nOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZGVsczoge1xcbiAgICB0b2RvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgIHRoaXMuZG9uZSA9IG0ucChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgdGhpcy5faWQgPSBkYXRhLl9pZDtcXG4gICAgfVxcbn0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkVhY2ggbGluZSBpbiB0aGUgbW9kZWwgZG9lcyB0aGUgZm9sbG93aW5nOjwvcD5cXG48dWw+XFxuPGxpPjxjb2RlPnRoaXMudGV4dDwvY29kZT4gLSBUaGUgdGV4dCB0aGF0IGlzIHNob3duIG9uIHRoZSB0b2RvPC9saT5cXG48bGk+PGNvZGU+dGhpcy5kb25lPC9jb2RlPiAtIFRoaXMgcmVwcmVzZW50cyBpZiB0aGUgdG9kbyBoYXMgYmVlbiBjb21wbGV0ZWQgLSB3ZSBlbnN1cmUgdGhhdCB3ZSBoYW5kbGUgdGhlICZxdW90O2ZhbHNlJnF1b3Q7IHZhbHVlcyBjb3JyZWN0bHksIGFzIGFqYXggcmVzcG9uc2VzIGFyZSBhbHdheXMgc3RyaW5ncy48L2xpPlxcbjxsaT48Y29kZT50aGlzLl9pZDwvY29kZT4gLSBUaGUga2V5IGZvciB0aGUgdG9kbzwvbGk+XFxuPC91bD5cXG48cD5UaGUgbW9kZWwgY2FuIG5vdyBiZSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyZWl2ZSB0b2RvcyAtIG1pc28gYXV0b21hdGljYWxseSBwaWNrcyB1cCBhbnkgb2JqZWN0cyBvbiB0aGUgPGNvZGU+bW9kZWxzPC9jb2RlPiBhdHRyaWJ1dGUgb2YgeW91ciBtdmMgZmlsZSwgYW5kIG1hcHMgaXQgaW4gdGhlIEFQSS4gV2Ugd2lsbCBzb29uIHNlZSBob3cgdGhhdCB3b3Jrcy4gTmV4dCBhZGQgdGhlIGZvbGxvd2luZyBjb2RlIGFzIHRoZSBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICBteVRvZG9zID0gW3t0ZXh0OiAmcXVvdDtMZWFybiBtaXNvJnF1b3Q7fSwge3RleHQ6ICZxdW90O0J1aWxkIG1pc28gYXBwJnF1b3Q7fV07XFxuICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbiAgICB9KTtcXG4gICAgcmV0dXJuIGN0cmw7XFxufSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBkb2VzIHRoZSBmb2xsb3dpbmc6PC9wPlxcbjx1bD5cXG48bGk+Q3JlYXRlcyA8Y29kZT5teVRvZG9zPC9jb2RlPiB3aGljaCBpcyBhIGxpc3Qgb2Ygb2JqZWN0cyB0aGF0IHJlcHJlc2VudHMgdG9kb3M8L2xpPlxcbjxsaT48Y29kZT50aGlzLmxpc3Q8L2NvZGU+IC0gY3JlYXRlcyBhIGxpc3Qgb2YgdG9kbyBtb2RlbCBvYmplY3RzIGJ5IHVzaW5nIDxjb2RlPm5ldyBzZWxmLm1vZGVscy50b2RvKC4uLjwvY29kZT4gb24gZWFjaCBteVRvZG9zIG9iamVjdC48L2xpPlxcbjxsaT48Y29kZT5yZXR1cm4gdGhpczwvY29kZT4gbXVzdCBiZSBkb25lIGluIGFsbCBjb250cm9sbGVycywgaXQgbWFrZXMgc3VyZSB0aGF0IG1pc28gY2FuIGNvcnJlY3RseSBnZXQgYWNjZXNzIHRvIHRoZSBjb250cm9sbGVyIG9iamVjdC48L2xpPlxcbjwvdWw+XFxuPHA+Tm90ZTogd2UgYWx3YXlzIGNyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIDxjb2RlPmN0cmw8L2NvZGU+IHRoYXQgcG9pbnRzIHRvIHRoZSBjb250cm9sbGVyLCBhcyBpdCBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdmFyaWFibGVzIGluIHRoZSBjb250cm9sbGVyIGZyb20gbmVzdGVkIGZ1bmN0aW9ucy4gWW91IHdpbGwgc2VlIHRoaXMgdXNhZ2UgbGF0ZXIgb24gaW4gdGhpcyBhcnRpY2xlLjwvcD5cXG48cD5Ob3cgdXBkYXRlIHRoZSB2aWV3IGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICByZXR1cm4gbSgmcXVvdDtVTCZxdW90OywgW1xcbiAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICByZXR1cm4gbSgmcXVvdDtMSSZxdW90OywgdG9kby50ZXh0KVxcbiAgICAgICAgfSlcXG4gICAgXSk7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgaXRlcmF0ZSBvbiB5b3VyIG5ld2x5IGNyZWF0ZWQgbGlzdCBvZiB0b2RvIG1vZGVsIG9iamVjdHMgYW5kIGRpc3BsYXkgdGhlIG9uIHNjcmVlbi4gWW91ciB0b2RvIGFwcCBzaG91bGQgbm93IGxvb2sgbGlrZSB0aGlzOjwvcD5cXG48aDM+PGEgbmFtZT1cXFwiaGFsZi13YXktcG9pbnRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNoYWxmLXdheS1wb2ludFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5IYWxmLXdheSBwb2ludDwvc3Bhbj48L2E+PC9oMz48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5Oyk7XFxuXFxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICB0b2RvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XFxuICAgICAgICAgICAgdGhpcy5kb25lID0gbS5wKGRhdGEuZG9uZSA9PSAmcXVvdDtmYWxzZSZxdW90Oz8gZmFsc2U6IGRhdGEuZG9uZSk7XFxuICAgICAgICAgICAgdGhpcy5faWQgPSBkYXRhLl9pZDtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICAgICAgbXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcbiAgICAgICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMobXlUb2RvcykubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbiAgICAgICAgfSk7XFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgcmV0dXJuIG0oJnF1b3Q7VUwmcXVvdDssIFtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgmcXVvdDtMSSZxdW90OywgdG9kby50ZXh0KVxcbiAgICAgICAgICAgIH0pXFxuICAgICAgICBdKTtcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxibG9ja3F1b3RlPlxcblNvIGZhciB3ZSBoYXZlIG9ubHkgdXNlZCBwdXJlIG1pdGhyaWwgdG8gY3JlYXRlIG91ciBhcHAgLSBtaXNvIGRpZCBkbyBzb21lIG9mIHRoZSBncnVudC13b3JrIGJlaGluZCB0aGUgc2NlbmVzLCBidXQgd2UgY2FuIGRvIG11Y2ggbW9yZS5cXG48L2Jsb2NrcXVvdGU+XFxuXFxuXFxuPHA+TGV0IHVzIGFkZCBzb21lIHVzZWZ1bCBsaWJyYXJpZXMsIGNoYW5nZSB0aGUgdG9wIHNlY3Rpb24gdG86PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBiaW5kaW5ncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5iaW5kaW5ncy5ub2RlLmpzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgaW5jbHVkZSB0aGUgZm9sbG93aW5nIGxpYnJhcmllczo8L3A+XFxuPHVsPlxcbjxsaT48YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuc3VnYXJ0YWdzLm1kXFxcIj5taXRocmlsLnN1Z2FydGFnczwvYT4gLSBhbGxvd3MgcmVuZGVyaW5nIEhUTUwgdXNpbmcgdGFncyB0aGF0IGxvb2sgYSBsaXR0bGUgbW9yZSBsaWtlIEhUTUwgdGhhbiBzdGFuZGFyZCBtaXRocmlsPC9saT5cXG48bGk+PGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLmJpbmRpbmdzLm1kXFxcIj5taXRocmlsLmJpbmRpbmdzPC9hPiBCaS1kaXJlY3Rpb25hbCBkYXRhIGJpbmRpbmdzIGZvciByaWNoZXIgbW9kZWxzPC9saT5cXG48L3VsPlxcbjxwPkxldCB1cyBzdGFydCB3aXRoIHRoZSBzdWdhciB0YWdzLCB1cGRhdGUgdGhlIHZpZXcgdG8gcmVhZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICByZXR1cm4gVUwoW1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgIHJldHVybiBMSSh0b2RvLnRleHQpXFxuICAgICAgICAgICAgfSlcXG4gICAgICAgIF0pXFxuICAgIH07XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5TbyB1c2luZyBzdWdhcnRhZ3MgYWxsb3dzIHVzIHRvIHdyaXRlIG1vcmUgY29uY2lzZSB2aWV3cywgdGhhdCBsb29rIG1vcmUgbGlrZSBuYXR1cmFsIEhUTUwuPC9wPlxcbjxwPk5leHQgbGV0IHVzIGFkZCBhIDxhIGhyZWY9XFxcIi9kb2Mvd2hhdC1pcy1hLXZpZXctbW9kZWwuaHRtbC5tZFxcXCI+dmlldyBtb2RlbDwvYT4gdG8gdGhlIGNvbnRyb2xsZXIuIEEgdmlldyBtb2RlbCBpcyBzaW1wbHkgYSBtb2RlbCB0aGF0IGNvbnRhaW5zIGRhdGEgYWJvdXQgdGhlIHZpZXcsIGFuZCBhdXhpbGxhcnkgZnVuY3Rpb25hbGl0eSwgaWU6IGRhdGEgYW5kIG90aGVyIHRoaW5ncyB0aGF0IHdlIGRvbiYjMzk7dCB3YW50IHRvIHBlcnNpc3QuIEFkZCB0aGlzIHRvIHRoZSBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmN0cmwudm0gPSB7XFxuICAgIGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xcbiAgICAgICAgICAgIHRvZG8uZG9uZSghdG9kby5kb25lKCkpO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHRvZ2dsZXMgdGhlIDxjb2RlPmRvbmU8L2NvZGU+IGF0dHJpYnV0ZSBvbiB0aGUgcGFzc2VkIGluIHRvZG8uIDwvcD5cXG48YmxvY2txdW90ZT5cXG5Zb3UgbWlnaHQgYmUgdGVtcHRlZCB0byBwdXQgdGhpcyBmdW5jdGlvbmFsaXR5IGludG8gdGhlIG1vZGVsLCBidXQgaW4gbWlzbywgd2UgbmVlZCB0byBzdHJpY3RseSBrZWVwIGRhdGEgaW4gdGhlIGRhdGEgbW9kZWwsIGFzIHdlIGFyZSBhYmxlIHRvIHBlcnNpc3QgaXQuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwPk5leHQgdXBkYXRlIHRoZSB2aWV3IHRvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgU1RZTEUoJnF1b3Q7LmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fSZxdW90OyksXFxuICAgICAgICAgICAgVUwoW1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyAmcXVvdDtkb25lJnF1b3Q7OiAmcXVvdDsmcXVvdDssIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xcbiAgICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgIF0pXFxuICAgICAgICBdXFxuICAgIH07XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbWFrZSB0aGUgbGlzdCBvZiB0b2RvcyBjbGlja2FibGUsIGFuZCBwdXQgYSBzdHJpa2UtdGhyb3VnaCB0aGUgdG9kbyB3aGVuIGl0IGlzIHNldCB0byAmcXVvdDtkb25lJnF1b3Q7LCBuZWF0ITwvcD5cXG48cD5Ob3cgbGV0IHVzIGFkZCBhIGNvdW50ZXIsIHRvIHNob3cgaG93IG1hbnkgdG9kb3MgYXJlIGxlZnQsIHB1dCB0aGlzIGludG8gdGhlIHZpZXcgbW9kZWwgeW91IGNyZWF0ZWQgaW4gdGhlIHByZXZpb3VzIHN0ZXA6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bGVmdDogZnVuY3Rpb24oKXtcXG4gICAgdmFyIGNvdW50ID0gMDtcXG4gICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICBjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xcbiAgICB9KTtcXG4gICAgcmV0dXJuIGNvdW50O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIGluIHRoZSB2aWV3LCBhZGQgdGhlIGZvbGxvd2luZyBhYm92ZSB0aGUgVUw6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+SDEoJnF1b3Q7VG9kb3MgLSAmcXVvdDsgKyBjdHJsLnZtLmxlZnQoKSArICZxdW90OyBvZiAmcXVvdDsgKyBjdHJsLmxpc3QubGVuZ3RoICsgJnF1b3Q7IHJlbWFpbmluZyZxdW90OyksXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBub3cgZGlzcGxheSBhIG5pY2UgaGVhZGVyIHNob3dpbmcgaG93IG1hbnkgdG9kb3MgYXJlIGxlZnQuPC9wPlxcbjxwPk5leHQgbGV0IHVzIGFkZCBhbiBpbnB1dCBmaWVsZCwgc28geW91IGNhbiBhZGQgbmV3IHRvZG9zLCBpbiB0aGUgdmlldyBtb2RlbCwgKHRoZSA8Y29kZT5jdHJsLnZtPC9jb2RlPiBvYmplY3QpLCBhZGQgdGhlIGZvbGxvd2luZyBsaW5lOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmlucHV0OiBtLnAoJnF1b3Q7JnF1b3Q7KVxcbjwvY29kZT48L3ByZT5cXG48cD5JbiB0aGUgY29udHJvbGxlciwgYWRkOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xcbiAgICB2YXIgdmFsdWUgPSBjdHJsLnZtLmlucHV0KCk7XFxuICAgIGlmKHZhbHVlKSB7XFxuICAgICAgICB2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcXG4gICAgICAgICAgICB0ZXh0OiBjdHJsLnZtLmlucHV0KCksXFxuICAgICAgICAgICAgZG9uZTogZmFsc2VcXG4gICAgICAgIH0pO1xcbiAgICAgICAgY3RybC5saXN0LnB1c2gobmV3VG9kbyk7XFxuICAgICAgICBjdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7XFxuICAgIH1cXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xcbiAgICByZXR1cm4gZmFsc2U7XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3IHRvZG8gYmFzZWQgb24gdGhlIGlucHV0IHRleHQsIGFuZCBhZGRzIGl0IHRvIHRoZSBsaXN0IG9mIHRvZG9zLjwvcD5cXG48cD5BbmQgaW4gdGhlIHZpZXcganVzdCBiZWxvdyB0aGUgVUwsIGFkZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5GT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXFxuICAgIElOUFVUKHsgdHlwZTogJnF1b3Q7dGV4dCZxdW90OywgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiAmcXVvdDtBZGQgdG9kbyZxdW90O30pLFxcbiAgICBCVVRUT04oeyB0eXBlOiAmcXVvdDtzdWJtaXQmcXVvdDt9LCAmcXVvdDtBZGQmcXVvdDspXFxuXSlcXG48L2NvZGU+PC9wcmU+XFxuPHA+QXMgeW91IGNhbiBzZWUsIHdlIGFzc2lnbiB0aGUgPGNvZGU+YWRkVG9kbzwvY29kZT4gbWV0aG9kIG9mIHRoZSBjb250cm9sbGVyIHRvIHRoZSBvbnN1Ym1pdCBmdW5jdGlvbiBvZiB0aGUgZm9ybSwgc28gdGhhdCBpdCB3aWxsIGNvcnJlY3RseSBhZGQgdGhlIHRvZG8gd2hlbiB5b3UgY2xpY2sgdGhlICZxdW90O0FkZCZxdW90OyBidXR0b24uPC9wPlxcbjxwPk5leHQsIGxldCB1cyBhZGQgdGhlIGFiaWxpdHkgdG8gYXJjaGl2ZSBvbGQgdG9kb3MsIGFkZCB0aGUgZm9sbG93aW5nIGludG8gdGhlIGNvbnRyb2xsZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcXG4gICAgdmFyIGxpc3QgPSBbXTtcXG4gICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICBpZighdG9kby5kb25lKCkpIHtcXG4gICAgICAgICAgICBsaXN0LnB1c2godG9kbyk7IFxcbiAgICAgICAgfVxcbiAgICB9KTtcXG4gICAgY3RybC5saXN0ID0gbGlzdDtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5BbmQgdGhpcyBidXR0b24gYmVsb3cgdGhlIEgxOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCAmcXVvdDtBcmNoaXZlJnF1b3Q7KSxcXG48L2NvZGU+PC9wcmU+XFxuPGgzPjxhIG5hbWU9XFxcImNvbXBsZXRlZC10b2RvLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NvbXBsZXRlZC10b2RvLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Db21wbGV0ZWQgdG9kbyBhcHA8L3NwYW4+PC9hPjwvaDM+PHA+QW5kIHlvdSBjYW4gbm93IGFyY2hpdmUgeW91ciB0b2Rvcy4gVGhpcyBjb21wbGV0ZXMgdGhlIHRvZG8gYXBwIGZ1bmN0aW9uYWxseSwgeW91ciBjb21wbGV0ZSB0b2RvIGFwcCBzaG91bGQgbG9vayBsaWtlIHRoaXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBiaW5kaW5ncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5iaW5kaW5ncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IG0ucHJvcChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgICAgIG15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG5cXG4gICAgICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xcbiAgICAgICAgICAgIGlmKHZhbHVlKSB7XFxuICAgICAgICAgICAgICAgIHZhciBuZXdUb2RvID0gbmV3IHNlbGYubW9kZWxzLnRvZG8oe1xcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogY3RybC52bS5pbnB1dCgpLFxcbiAgICAgICAgICAgICAgICAgICAgZG9uZTogZmFsc2VcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICBpZighdG9kby5kb25lKCkpIHtcXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTsgXFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICBjdHJsLmxpc3QgPSBsaXN0O1xcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIGN0cmwudm0gPSB7XFxuICAgICAgICAgICAgbGVmdDogZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICAgICAgICAgICAgICBjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50O1xcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgZG9uZTogZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcXG4gICAgICAgICAgICAgICAgICAgIHRvZG8uZG9uZSghdG9kby5kb25lKCkpO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgICAgICBpbnB1dDogbS5wKCZxdW90OyZxdW90OylcXG4gICAgICAgIH07XFxuXFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBTVFlMRSgmcXVvdDsuZG9uZXt0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDt9JnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgSDEoJnF1b3Q7VG9kb3MgLSAmcXVvdDsgKyBjdHJsLnZtLmxlZnQoKSArICZxdW90OyBvZiAmcXVvdDsgKyBjdHJsLmxpc3QubGVuZ3RoICsgJnF1b3Q7IHJlbWFpbmluZyZxdW90OyksXFxuICAgICAgICAgICAgICAgIEJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCAmcXVvdDtBcmNoaXZlJnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgVUwoW1xcbiAgICAgICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTEkoeyBjbGFzczogdG9kby5kb25lKCk/ICZxdW90O2RvbmUmcXVvdDs6ICZxdW90OyZxdW90Oywgb25jbGljazogY3RybC52bS5kb25lKHRvZG8pIH0sIHRvZG8udGV4dCk7XFxuICAgICAgICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgICAgICBdKSxcXG4gICAgICAgICAgICAgICAgRk9STSh7IG9uc3VibWl0OiBjdHJsLmFkZFRvZG8gfSwgW1xcbiAgICAgICAgICAgICAgICAgICAgSU5QVVQoeyB0eXBlOiAmcXVvdDt0ZXh0JnF1b3Q7LCB2YWx1ZTogY3RybC52bS5pbnB1dCwgcGxhY2Vob2xkZXI6ICZxdW90O0FkZCB0b2RvJnF1b3Q7fSksXFxuICAgICAgICAgICAgICAgICAgICBCVVRUT04oeyB0eXBlOiAmcXVvdDtzdWJtaXQmcXVvdDt9LCAmcXVvdDtBZGQmcXVvdDspXFxuICAgICAgICAgICAgICAgIF0pXFxuICAgICAgICAgICAgXVxcbiAgICAgICAgfTtcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5leHQgd2UgcmVjb21tZW5kIHlvdSByZWFkPC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC1wYXJ0LTItcGVyc2lzdGVuY2UubWRcXFwiPkNyZWF0aW5nIGEgdG9kbyBhcHAgcGFydCAyIC0gcGVyc2lzdGVuY2U8L2E+LCB3aGVyZSB3ZSB3aWxsIGdvIHRocm91Z2ggYWRkaW5nIGRhdGEgcGVyc2lzdGVuY2UgZnVuY3Rpb25hbGl0eS48L3A+XFxuXCIsXCJHZXR0aW5nLXN0YXJ0ZWQubWRcIjpcIjxwPlRoaXMgZ3VpZGUgd2lsbCB0YWtlIHlvdSB0aHJvdWdoIG1ha2luZyB5b3VyIGZpcnN0IG1pc28gYXBwLCBpdCBpcyBhc3N1bWVkIHRoYXQgeW91IGtub3cgdGhlIGJhc2ljcyBvZiBob3cgdG8gdXNlIG5vZGVqcyBhbmQgbWl0aHJpbC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImluc3RhbGxhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2luc3RhbGxhdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5JbnN0YWxsYXRpb248L3NwYW4+PC9hPjwvaDI+PHA+VG8gaW5zdGFsbCBtaXNvLCB1c2UgbnBtOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm5wbSBpbnN0YWxsIG1pc29qcyAtZ1xcbjwvY29kZT48L3ByZT5cXG48cD5UbyBjcmVhdGUgYW5kIHJ1biBhIG1pc28gYXBwIGluIGEgbmV3IGRpcmVjdG9yeTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5taXNvIC1uIG15YXBwXFxuY2QgbXlhcHBcXG5taXNvIHJ1blxcbjwvY29kZT48L3ByZT5cXG48cD5Zb3Ugc2hvdWxkIG5vdyBzZWUgc29tZXRoaW5nIGxpa2U6PC9wPlxcbjxwcmU+PGNvZGU+TWlzbyBpcyBsaXN0ZW5pbmcgYXQgaHR0cDovL2xvY2FsaG9zdDo2NDc2IGluIGRldmVsb3BtZW50IG1vZGVcXG48L2NvZGU+PC9wcmU+PHA+T3BlbiB5b3VyIGJyb3dzZXIgYXQgPGNvZGU+aHR0cDovL2xvY2FsaG9zdDo2NDc2PC9jb2RlPiBhbmQgeW91IHdpbGwgc2VlIHRoZSBkZWZhdWx0IG1pc28gc2NyZWVuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJoZWxsby13b3JsZC1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNoZWxsby13b3JsZC1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SGVsbG8gd29ybGQgYXBwPC9zcGFuPjwvYT48L2gyPjxwPkNyZWF0ZSBhIG5ldyBmaWxlIDxjb2RlPmhlbGxvLmpzPC9jb2RlPiBpbiA8Y29kZT5teWFwcC9tdmM8L2NvZGU+IGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSk7XFxuXFxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTtoZWxsb19pZCYjMzk7LCBwYXJhbXMpO1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSk7XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIG9wZW4gPGEgaHJlZj1cXFwiL2RvYy9ZT1VSTkFNRS5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdDo2NDc2L2hlbGxvL1lPVVJOQU1FPC9hPiBhbmQgeW91IHNob3VsZCBzZWUgJnF1b3Q7SGVsbG8gWU9VUk5BTUUmcXVvdDsuIENoYW5nZSB0aGUgdXJsIHRvIGhhdmUgeW91ciBhY3R1YWwgbmFtZSBpbnN0ZWFkIG9mIFlPVVJOQU1FLCB5b3Ugbm93IGtub3cgbWlzbyA6KTwvcD5cXG48cD5MZXQgdXMgdGFrZSBhIGxvb2sgYXQgd2hhdCBlYWNoIHBpZWNlIG9mIHRoZSBjb2RlIGlzIGFjdHVhbGx5IGRvaW5nOjwvcD5cXG48aDM+PGEgbmFtZT1cXFwiaW5jbHVkZXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNpbmNsdWRlc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5JbmNsdWRlczwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBNaXRocmlsIGlzIHRoZSBvbmx5IHJlcXVpcmVkIGxpYnJhcnkgd2hlbiBhcHBzLCBidXQgdXNpbmcgb3RoZXIgaW5jbHVkZWQgbGlicmFyaWVzIGlzIHZlcnkgdXNlZnVsXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkhlcmUgd2UgZ3JhYiBtaXRocmlsLCB0aGVuIG1pc28gdXRpbGl0aWVzIGFuZCBzdWdhciB0YWdzIC0gdGVjaG5pY2FsbHkgc3BlYWtpbmcsIHdlIHJlYWxseSBvbmx5IG5lZWQgbWl0aHJpbCwgYnV0IHRoZSBvdGhlciBsaWJyYXJpZXMgYXJlIHZlcnkgdXNlZnVsIGFzIHdlbGwgYXMgd2Ugd2lsbCBzZWUuPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJtb2RlbHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtb2RlbHNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TW9kZWxzPC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IFVzZSB0aGUgYXV0b21hdGljIHJvdXRpbmcgd2hlbiB5b3UgY2FuLCBhbHdheXMgcHV0IG1vZGVscyBvbiB0aGUgJiMzOTttb2RlbHMmIzM5OyBhdHRyaWJ1dGUgb2YgeW91ciBtdmMgZmlsZVxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbjwvY29kZT48L3ByZT5cXG48cD5IZXJlIGEgZmV3IGltcG9ydGFudCB0aGluZ3MgYXJlIGdvaW5nIG9uOjwvcD5cXG48dWw+XFxuPGxpPjxwPkJ5IHBsYWNpbmcgb3VyIDxjb2RlPm12YzwvY29kZT4gb2JqZWN0IG9uIDxjb2RlPm1vZHVsZS5leHBvcnRzLmVkaXQ8L2NvZGU+LCBhdXRvbWF0aWMgcm91dGluZyBpcyBhcHBsaWVkIGJ5IG1pc28gLSB5b3UgY2FuIHJlYWQgbW9yZSBhYm91dCA8YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzI3JvdXRlLWJ5LWNvbnZlbnRpb24ubWRcXFwiPmhvdyB0aGUgYXV0b21hdGljIHJvdXRpbmcgd29ya3MgaGVyZTwvYT4uIDwvcD5cXG48L2xpPlxcbjxsaT48cD5QbGFjaW5nIG91ciA8Y29kZT5oZWxsbzwvY29kZT4gbW9kZWwgb24gdGhlIDxjb2RlPm1vZGVsczwvY29kZT4gYXR0cmlidXRlIG9mIHRoZSBvYmplY3QgZW5zdXJlcyB0aGF0IG1pc28gY2FuIGZpZ3VyZSBvdXQgd2hhdCB5b3VyIG1vZGVscyBhcmUsIGFuZCB3aWxsIGNyZWF0ZSBhIHBlcnNpc3RlbmNlIEFQSSBhdXRvbWF0aWNhbGx5IGZvciB5b3Ugd2hlbiB0aGUgc2VydmVyIHN0YXJ0cyB1cCwgc28gdGhhdCB5b3UgY2FuIHNhdmUgeW91ciBtb2RlbHMgaW50byB0aGUgZGF0YWJhc2UuPC9wPlxcbjwvbGk+XFxuPC91bD5cXG48aDM+PGEgbmFtZT1cXFwiY29udHJvbGxlclxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NvbnRyb2xsZXJcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q29udHJvbGxlcjwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBETyBOT1QgZm9yZ2V0IHRvICYjMzk7cmV0dXJuIHRoaXM7JiMzOTsgaW4gdGhlIGNvbnRyb2xsZXIsIGl0IGlzIHZpdGFsIVxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICB2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuICAgIHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XFxuICAgIHJldHVybiB0aGlzO1xcbn0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZSBjb250cm9sbGVyIHVzZXMgPGNvZGU+bWlzby5nZXRQYXJhbTwvY29kZT4gdG8gcmV0cmVpdmUgdGhlIHBhcmFtZXRlciAtIHRoaXMgaXMgc28gdGhhdCBpdCBjYW4gd29yayBzZWFtbGVzc2x5IG9uIGJvdGggdGhlIHNlcnZlciBhbmQgY2xpZW50IHNpZGUuIFdlIGNyZWF0ZSBhIG5ldyBtb2RlbCwgYW5kIHZlcnkgaW1wb3J0YW50bHkgPGNvZGU+cmV0dXJuIHRoaXM8L2NvZGU+IGVuc3VyZXMgdGhhdCBtaXNvIGNhbiBnZXQgYWNjZXNzIHRvIHRoZSBjb250cm9sbGVyIGNvcnJlY3RseS48L3A+XFxuPGgzPjxhIG5hbWU9XFxcInZpZXdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN2aWV3XFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlZpZXc8L3NwYW4+PC9hPjwvaDM+PGJsb2NrcXVvdGU+XFxuU3VtbWFyeTogVXNlIHN1Z2FydGFncyB0byBtYWtlIHRoZSB2aWV3IGxvb2sgbW9yZSBsaWtlIEhUTUxcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICByZXR1cm4gRElWKCZxdW90O0hlbGxvICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpO1xcbiAgICB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGUgdmlldyBpcyBzaW1wbHkgYSBqYXZhc2NyaXB0IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN0cnVjdHVyZS4gSGVyZSB3ZSB1c2UgdGhlIDxjb2RlPnN1Z2FydGFnczwvY29kZT4gbGlicmFyeSB0byByZW5kZXIgdGhlIERJViB0YWcgLSB0aGlzIGlzIHN0cmljdGx5IG5vdCByZXF1aXJlZCwgYnV0IEkgZmluZCB0aGF0IHBlb3BsZSB0ZW5kIHRvIHVuZGVyc3RhbmQgdGhlIHN1Z2FydGFncyBzeW50YXggYmV0dGVyIHRoYW4gcHVyZSBtaXRocmlsLCBhcyBpdCBsb29rcyBhIGxpdHRsZSBtb3JlIGxpa2UgSFRNTCwgdGhvdWdoIG9mIGNvdXJzZSB5b3UgY291bGQgdXNlIHN0YW5kYXJkIG1pdGhyaWwgc3ludGF4IGlmIHlvdSBwcmVmZXIuPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJuZXh0XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbmV4dFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5OZXh0PC9zcGFuPjwvYT48L2gzPjxwPllvdSBub3cgaGF2ZSBhIGNvbXBsZXRlIGhlbGxvIHdvcmxkIGFwcCwgYW5kIHVuZGVyc3RhbmQgdGhlIGZ1bmRhbWVudGFscyBvZiB0aGUgc3RydWN0dXJlIG9mIGEgbWlzbyBtdmMgYXBwbGljYXRpb24uPC9wPlxcbjxwPldlIGhhdmUgb25seSBqdXN0IHNjcmFwZWQgdGhlIHN1cmZhY2Ugb2Ygd2hhdCBtaXNvIGlzIGNhcGFibGUgb2YsIHNvIG5leHQgd2UgcmVjb21tZW5kIHlvdSByZWFkOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAubWRcXFwiPkNyZWF0aW5nIGEgdG9kbyBhcHA8L2E+PC9wPlxcblwiLFwiR29hbHMubWRcIjpcIjxoMT48YSBuYW1lPVxcXCJwcmltYXJ5LWdvYWxzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcHJpbWFyeS1nb2Fsc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5QcmltYXJ5IGdvYWxzPC9zcGFuPjwvYT48L2gxPjx1bD5cXG48bGk+RWFzeSBzZXR1cCBvZiA8YSBocmVmPVxcXCIvZG9jLy5tZFxcXCI+aXNvbW9ycGhpYzwvYT4gYXBwbGljYXRpb24gYmFzZWQgb24gPGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLmpzLm1kXFxcIj5taXRocmlsPC9hPjwvbGk+XFxuPGxpPlNrZWxldG9uIC8gc2NhZmZvbGQgLyBCb2lsZXJwbGF0ZSB0byBhbGxvdyB1c2VycyB0byB2ZXJ5IHF1aWNrbHkgZ2V0IHVwIGFuZCBydW5uaW5nLjwvbGk+XFxuPGxpPm1pbmltYWwgY29yZTwvbGk+XFxuPGxpPmVhc3kgZXh0ZW5kaWJsZTwvbGk+XFxuPGxpPkRCIGFnbm9zdGljIChlLiBHLiBwbHVnaW5zIGZvciBkaWZmZXJlbnQgT1JNL09ETSk8L2xpPlxcbjwvdWw+XFxuPGgxPjxhIG5hbWU9XFxcImNvbXBvbmVudHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjb21wb25lbnRzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNvbXBvbmVudHM8L3NwYW4+PC9hPjwvaDE+PHVsPlxcbjxsaT5Sb3V0aW5nPC9saT5cXG48bGk+VmlldyByZW5kZXJpbmc8L2xpPlxcbjxsaT5pMThuL2wxMG48L2xpPlxcbjxsaT5SZXN0LUFQSSAoY291bGQgdXNlIHJlc3RpZnk6IDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5odHRwOi8vbWNhdmFnZS5tZS9ub2RlLXJlc3RpZnkvPC9hPik8L2xpPlxcbjxsaT5vcHRpb25hbCBXZWJzb2NrZXRzIChjb3VsZCB1c2UgcmVzdGlmeTogPGEgaHJlZj1cXFwiL2RvYy8ubWRcXFwiPmh0dHA6Ly9tY2F2YWdlLm1lL25vZGUtcmVzdGlmeS88L2E+KTwvbGk+XFxuPGxpPmVhc3kgdGVzdGluZyAoaGVhZGxlc3MgYW5kIEJyb3dzZXItVGVzdHMpPC9saT5cXG48bGk+bG9naW4vc2Vzc2lvbiBoYW5kbGluZzwvbGk+XFxuPGxpPm1vZGVscyB3aXRoIHZhbGlkYXRpb248L2xpPlxcbjwvdWw+XFxuPGgxPjxhIG5hbWU9XFxcInVzZWZ1bC1saWJzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjdXNlZnVsLWxpYnNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+VXNlZnVsIGxpYnM8L3NwYW4+PC9hPjwvaDE+PHA+SGVyZSBhcmUgc29tZSBsaWJyYXJpZXMgd2UgYXJlIGNvbnNpZGVyaW5nIHVzaW5nLCAoaW4gbm8gcGFydGljdWxhciBvcmRlcik6PC9wPlxcbjx1bD5cXG48bGk+bGV2ZWxkYjwvbGk+XFxuPGxpPm1pdGhyaWwtcXVlcnk8L2xpPlxcbjxsaT50cmFuc2xhdGUuanM8L2xpPlxcbjxsaT5pMThuZXh0PC9saT5cXG48L3VsPlxcbjxwPkFuZCBzb21lIHRoYXQgd2UmIzM5O3JlIGFscmVhZHkgdXNpbmc6PC9wPlxcbjx1bD5cXG48bGk+ZXhwcmVzczwvbGk+XFxuPGxpPmJyb3dzZXJpZnk8L2xpPlxcbjxsaT5tb2NoYS9leHBlY3Q8L2xpPlxcbjxsaT5taXRocmlsLW5vZGUtcmVuZGVyPC9saT5cXG48bGk+bWl0aHJpbC1zdWdhcnRhZ3M8L2xpPlxcbjxsaT5taXRocmlsLWJpbmRpbmdzPC9saT5cXG48bGk+bWl0aHJpbC1hbmltYXRlPC9saT5cXG48bGk+bG9kYXNoPC9saT5cXG48bGk+dmFsaWRhdG9yPC9saT5cXG48L3VsPlxcblwiLFwiSG9tZS5tZFwiOlwiPHA+V2VsY29tZSB0byB0aGUgbWlzb2pzIHdpa2khPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJnZXR0aW5nLXN0YXJ0ZWRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNnZXR0aW5nLXN0YXJ0ZWRcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+R2V0dGluZyBzdGFydGVkPC9zcGFuPjwvYT48L2gyPjxwPlJlYWQgdGhlIDxhIGhyZWY9XFxcIi9kb2MvR2V0dGluZy1zdGFydGVkLm1kXFxcIj5HZXR0aW5nIHN0YXJ0ZWQ8L2E+IGd1aWRlITwvcD5cXG48aDI+PGEgbmFtZT1cXFwibW9yZS1pbmZvXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbW9yZS1pbmZvXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk1vcmUgaW5mbzwvc3Bhbj48L2E+PC9oMj48cD5TZWUgdGhlIDxhIGhyZWY9XFxcIi9kb2MvbWlzb2pzI2luc3RhbGwubWRcXFwiPmluc3RhbGwgZ3VpZGU8L2E+LlxcblJlYWQgPGEgaHJlZj1cXFwiL2RvYy9Ib3ctbWlzby13b3Jrcy5tZFxcXCI+aG93IG1pc28gd29ya3M8L2E+LCBhbmQgY2hlY2sgb3V0IDxhIGhyZWY9XFxcIi9kb2MvUGF0dGVybnMubWRcXFwiPnRoZSBwYXR0ZXJuczwvYT4sIHRoZW4gY3JlYXRlIHNvbWV0aGluZyBjb29sITwvcD5cXG5cIixcIkhvdy1taXNvLXdvcmtzLm1kXCI6XCI8aDI+PGEgbmFtZT1cXFwibW9kZWxzLXZpZXdzLWNvbnRyb2xsZXJzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbW9kZWxzLXZpZXdzLWNvbnRyb2xsZXJzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk1vZGVscywgdmlld3MsIGNvbnRyb2xsZXJzPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gY3JlYXRpbmcgYSByb3V0ZSwgeW91IG11c3QgYXNzaWduIGEgY29udHJvbGxlciBhbmQgYSB2aWV3IHRvIGl0IC0gdGhpcyBpcyBhY2hpZXZlZCBieSBjcmVhdGluZyBhIGZpbGUgaW4gdGhlIDxjb2RlPi9tdmM8L2NvZGU+IGRpcmVjdG9yeSAtIGJ5IGNvbnZlbnRpb24sIHlvdSBzaG91bGQgbmFtZSBpdCBhcyBwZXIgdGhlIHBhdGggeW91IHdhbnQsIChzZWUgdGhlIDxhIGhyZWY9XFxcIi9kb2MvI3JvdXRpbmcubWRcXFwiPnJvdXRpbmcgc2VjdGlvbjwvYT4gZm9yIGRldGFpbHMpLjwvcD5cXG48cD5IZXJlIGlzIGEgbWluaW1hbCBleGFtcGxlIHVzaW5nIHRoZSBzdWdhcnRhZ3MsIGFuZCBnZXR0aW5nIGEgcGFyYW1ldGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLnN1Z2FydGFncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbm1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHRoaXMud2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O3dobyYjMzk7LCBwYXJhbXMsICYjMzk7d29ybGQmIzM5Oyk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJiMzOTtIZWxsbyAmIzM5OyArIGN0cmwud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNhdmUgdGhpcyBpbnRvIGEgZmlsZSA8Y29kZT4vbXZjL2hlbGxvLmpzPC9jb2RlPiwgYW5kIG9wZW4gPGEgaHJlZj1cXFwiL2RvYy9oZWxsb3MubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3QvaGVsbG9zPC9hPiwgdGhpcyB3aWxsIHNob3cgJnF1b3Q7SGVsbG8gd29ybGQmcXVvdDsuIE5vdGUgdGhlICYjMzk7cyYjMzk7IG9uIHRoZSBlbmQgLSB0aGlzIGlzIGR1ZSB0byBob3cgdGhlIDxhIGhyZWY9XFxcIi9kb2MvI3JvdXRlLWJ5LWNvbnZlbnRpb24ubWRcXFwiPnJvdXRlIGJ5IGNvbnZlbnRpb248L2E+IHdvcmtzLjwvcD5cXG48cD5Ob3cgb3BlbiA8Y29kZT4vY2ZnL3JvdXRlcy5qc29uPC9jb2RlPiwgYW5kIGFkZCB0aGUgZm9sbG93aW5nIHJvdXRlczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4gICAgJnF1b3Q7L2hlbGxvJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtoZWxsbyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9LFxcbiAgICAmcXVvdDsvaGVsbG8vOndobyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7aGVsbG8mcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfVxcbjwvY29kZT48L3ByZT5cXG48cD5TYXZlIHRoZSBmaWxlLCBhbmQgZ28gYmFjayB0byB0aGUgYnJvd3NlciwgYW5kIHlvdSYjMzk7bGwgc2VlIGFuIGVycm9yISBUaGlzIGlzIGJlY2F1c2Ugd2UgaGF2ZSBub3cgb3ZlcnJpZGRlbiB0aGUgYXV0b21hdGljIHJvdXRlLiBPcGVuIDxhIGhyZWY9XFxcIi9kb2MvaGVsbG8ubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3QvaGVsbG88L2E+LCBhbmQgeW91JiMzOTtsbCBzZWUgb3VyIGFjdGlvbi4gTm93IG9wZW4gPGEgaHJlZj1cXFwiL2RvYy9ZT1VSTkFNRS5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdC9oZWxsby9ZT1VSTkFNRTwvYT4sIGFuZCB5b3UmIzM5O2xsIHNlZSBpdCBnZXR0aW5nIHRoZSBmaXJzdCBwYXJhbWV0ZXIsIGFuZCBncmVldGluZyB5b3UhPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJyb3V0aW5nXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGluZ1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0aW5nPC9zcGFuPjwvYT48L2gyPjxwPlRoZSByb3V0aW5nIGNhbiBiZSBkZWZpbmVkIGluIG9uZSBvZiB0d28gd2F5czwvcD5cXG48aDM+PGEgbmFtZT1cXFwicm91dGUtYnktY29udmVudGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JvdXRlLWJ5LWNvbnZlbnRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Um91dGUgYnkgY29udmVudGlvbjwvc3Bhbj48L2E+PC9oMz48cD5Zb3UgY2FuIHVzZSBhIG5hbWluZyBjb252ZW50aW9uIGFzIGZvbGxvd3M6PC9wPlxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5BY3Rpb248L3RoPlxcbjx0aD5NZXRob2Q8L3RoPlxcbjx0aD5VUkw8L3RoPlxcbjx0aD5EZXNjcmlwdGlvbjwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPmluZGV4PC90ZD5cXG48dGQ+R0VUPC90ZD5cXG48dGQ+W2NvbnRyb2xsZXJdICsgJiMzOTtzJiMzOTs8L3RkPlxcbjx0ZD5MaXN0IHRoZSBpdGVtczwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmVkaXQ8L3RkPlxcbjx0ZD5HRVQ8L3RkPlxcbjx0ZD5bY29udHJvbGxlcl0vW2lkXTwvdGQ+XFxuPHRkPkRpc3BsYXkgYSBmb3JtIHRvIGVkaXQgdGhlIGl0ZW08L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5uZXc8L3RkPlxcbjx0ZD5HRVQ8L3RkPlxcbjx0ZD5bY29udHJvbGxlcl0gKyAmIzM5O3MmIzM5OyArICYjMzk7L25ldyYjMzk7PC90ZD5cXG48dGQ+RGlzcGxheSBhIGZvcm0gdG8gYWRkIGEgbmV3IGl0ZW08L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlNheSB5b3UgaGF2ZSBhIG12YyBmaWxlIG5hbWVkICZxdW90O3VzZXIuanMmcXVvdDssIGFuZCB5b3UgZGVmaW5lIGFuIGFjdGlvbiBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmluZGV4ID0gey4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5NaXNvIHdpbGwgYXV0b21hdGljYWxseSBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gJnF1b3Q7L3VzZXJzJnF1b3Q7Ljxicj5Ob3cgc2F5IHlvdSBoYXZlIGEgbXZjIGZpbGUgbmFtZWQgJnF1b3Q7dXNlci5qcyZxdW90OywgYW5kIHlvdSBkZWZpbmUgYW4gYWN0aW9uIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuZWRpdCA9IHsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+TWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvICZxdW90Oy91c2VyLzp1c2VyX2lkJnF1b3Q7LCBzbyB0aGF0IHVzZXJzIGNhbiBhY2Nlc3MgdmlhIGEgcm91dGUgc3VjaCBhcyAmcXVvdDsvdXNlci8yNyZxdW90OyBmb3IgdXNlIHdpdGggSUQgb2YgMjcuIDxlbT5Ob3RlOjwvZW0+IFlvdSBjYW4gZ2V0IHRoZSB1c2VyX2lkIHVzaW5nIGEgbWlzbyB1dGlsaXR5OiA8Y29kZT52YXIgdXNlcklkID0gbWlzby5nZXRQYXJhbSgmIzM5O3VzZXJfaWQmIzM5OywgcGFyYW1zKTs8L2NvZGU+LjwvcD5cXG48aDM+PGEgbmFtZT1cXFwicm91dGUtYnktY29uZmlndXJhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JvdXRlLWJ5LWNvbmZpZ3VyYXRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Um91dGUgYnkgY29uZmlndXJhdGlvbjwvc3Bhbj48L2E+PC9oMz48cD5CeSB1c2luZyA8Y29kZT4vY2ZnL3JvdXRlcy5qc29uPC9jb2RlPiBjb25maWcgZmlsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj57XFxuICAgICZxdW90O1tQYXR0ZXJuXSZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O1tNZXRob2RdJnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtbUm91dGUgbmFtZV0mcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7W0FjdGlvbl0mcXVvdDsgfVxcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+V2hlcmU6PC9wPlxcbjx1bD5cXG48bGk+PHN0cm9uZz5QYXR0ZXJuPC9zdHJvbmc+IC0gdGhlIDxhIGhyZWY9XFxcIi9kb2MvI3JvdXRpbmctcGF0dGVybnMubWRcXFwiPnJvdXRlIHBhdHRlcm48L2E+IHdlIHdhbnQsIGluY2x1ZGluZyBhbnkgcGFyYW1ldGVyczwvbGk+XFxuPGxpPjxzdHJvbmc+TWV0aG9kPC9zdHJvbmc+IC0gb25lIG9mICYjMzk7R0VUJiMzOTssICYjMzk7UE9TVCYjMzk7LCAmIzM5O1BVVCYjMzk7LCAmIzM5O0RFTEVURSYjMzk7PC9saT5cXG48bGk+PHN0cm9uZz5Sb3V0ZTwvc3Ryb25nPiBuYW1lIC0gbmFtZSBvZiB5b3VyIHJvdXRlIGZpbGUgZnJvbSAvbXZjPC9saT5cXG48bGk+PHN0cm9uZz5BY3Rpb248L3N0cm9uZz4gLSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gY2FsbCBvbiB5b3VyIHJvdXRlIGZpbGUgZnJvbSAvbXZjPC9saT5cXG48L3VsPlxcbjxwPjxzdHJvbmc+RXhhbXBsZTwvc3Ryb25nPjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPntcXG4gICAgJnF1b3Q7LyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7aG9tZSZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvIHRoZSByb290IG9mIHRoZSBVUkwgZm9yIHRoZSA8Y29kZT5pbmRleDwvY29kZT4gYWN0aW9uIGluIDxjb2RlPmhvbWUuanM8L2NvZGU+PC9wPlxcbjxwPjxzdHJvbmc+Tm90ZTo8L3N0cm9uZz4gVGhlIHJvdXRpbmcgY29uZmlnIHdpbGwgb3ZlcnJpZGUgYW55IGF1dG9tYXRpY2FsbHkgZGVmaW5lZCByb3V0ZXMsIHNvIGlmIHlvdSBuZWVkIG11bHRpcGxlIHJvdXRlcyB0byBwb2ludCB0byB0aGUgc2FtZSBhY3Rpb24sIHlvdSBtdXN0IG1hbnVhbGx5IGRlZmluZSB0aGVtLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYSBtdmMgZmlsZSBuYW1lZCAmcXVvdDt0ZXJtLmpzJnF1b3Q7LCBhbmQgeW91IGRlZmluZSBhbiBhY3Rpb24gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+TWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvICZxdW90Oy90ZXJtcyZxdW90Oy4gTm93LCBpZiB5b3Ugd2FudCB0byBtYXAgaXQgYWxzbyB0byAmcXVvdDsvQUdCJnF1b3Q7LCB5b3Ugd2lsbCBuZWVkIHRvIGFkZCB0d28gZW50cmllcyBpbiB0aGUgcm91dGVzIGNvbmZpZzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj57XFxuICAgICZxdW90Oy90ZXJtcyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7dGVybXMmcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfSxcXG4gICAgJnF1b3Q7L0FHQiZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7dGVybXMmcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfVxcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBpcyBiZWNhdXNlIE1pc28gYXNzdW1lcyB0aGF0IGlmIHlvdSBvdmVycmlkZSB0aGUgZGVmYXVsdGVkIHJvdXRlcywgeW91IGFjdHVhbGx5IHdhbnQgdG8gcmVwbGFjZSB0aGVtLCBub3QganVzdCBvdmVycmlkZSB0aGVtLiA8ZW0+Tm90ZTo8L2VtPiB0aGlzIGlzIGNvcnJlY3QgYmVoYXZpb3VyLCBhcyBpdCBtaW5vcml0eSBjYXNlIGlzIHdoZW4geW91IHdhbnQgbW9yZSB0aGFuIG9uZSByb3V0ZSBwb2ludGluZyB0byB0aGUgc2FtZSBhY3Rpb24uPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJyb3V0aW5nLXBhdHRlcm5zXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGluZy1wYXR0ZXJuc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0aW5nIHBhdHRlcm5zPC9zcGFuPjwvYT48L2gzPjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5UeXBlPC90aD5cXG48dGg+RXhhbXBsZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPlBhdGg8L3RkPlxcbjx0ZD4mcXVvdDsvYWJjZCZxdW90OyAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2Q8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYWJjP2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkIGFuZCAvYWJkPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2FiK2NkJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCwgL2FiYmNkLCAvYWJiYmJiY2QgYW5kIHNvIG9uPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2FiKmNkJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCwgL2FieGNkLCAvYWJGT09jZCwgL2FiYkFyY2QgYW5kIHNvIG9uPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2EoYmMpP2QmcXVvdDsgLSB3aWxsIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FkIGFuZCAvYWJjZDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlJlZ3VsYXIgRXhwcmVzc2lvbjwvdGQ+XFxuPHRkPi9cXFxcL2FiYyYjMTI0O1xcXFwveHl6LyAtIHdpbGwgbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjIGFuZCAveHl6PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+QXJyYXk8L3RkPlxcbjx0ZD5bJnF1b3Q7L2FiY2QmcXVvdDssICZxdW90Oy94eXphJnF1b3Q7LCAvXFxcXC9sbW4mIzEyNDtcXFxcL3Bxci9dIC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCwgL3h5emEsIC9sbW4sIGFuZCAvcHFyPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48aDM+PGEgbmFtZT1cXFwibGlua3NcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNsaW5rc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5MaW5rczwvc3Bhbj48L2E+PC9oMz48cD5XaGVuIHlvdSBjcmVhdGUgbGlua3MsIGluIG9yZGVyIHRvIGdldCB0aGUgYXBwIHRvIHdvcmsgYXMgYW4gU1BBLCB5b3UgbXVzdCBwYXNzIGluIG0ucm91dGUgYXMgYSBjb25maWcsIHNvIHRoYXQgdGhlIGhpc3Rvcnkgd2lsbCBiZSB1cGRhdGVkIGNvcnJlY3RseSwgZm9yIGV4YW1wbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+QSh7aHJlZjomcXVvdDsvdXNlcnMvbmV3JnF1b3Q7LCBjb25maWc6IG0ucm91dGV9LCAmcXVvdDtBZGQgbmV3IHVzZXImcXVvdDspXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBjb3JyZWN0bHkgd29yayBhcyBhIFNQQS4gSWYgeW91IGxlYXZlIG91dCA8Y29kZT5jb25maWc6IG0ucm91dGU8L2NvZGU+LCB0aGUgYXBwIHdpbGwgc3RpbGwgd29yaywgYnV0IHRoZSBwYWdlIHdpbGwgcmVsb2FkIGV2ZXJ5IHRpbWUgdGhlIGxpbmsgaXMgZm9sbG93ZWQuPC9wPlxcbjxwPk5vdGU6IGlmIHlvdSBhcmUgcGxhbm5pbmcgdG8gbWFudWFsbHkgcm91dGUsIGllOiB1c2UgPGNvZGU+bS5yb3V0ZTwvY29kZT4sIGJlIHN1cmUgdG8gdXNlIHRoZSBuYW1lIG9mIHRoZSByb3V0ZSwgbm90IGEgVVJMLiBJZTogaWYgeW91IGhhdmUgYSByb3V0ZSAmcXVvdDsvYWNjb3VudCZxdW90OywgdXNpbmcgPGNvZGU+bS5yb3V0ZSgmcXVvdDtodHRwOi8vcDEuaW8vYWNjb3VudCZxdW90Oyk8L2NvZGU+IHdvbiYjMzk7dCBtYXRjaCwgbWl0aHJpbCBpcyBleHBlY3RpbmcgPGNvZGU+bS5yb3V0ZSgmcXVvdDsvYWNjb3VudCZxdW90Oyk8L2NvZGU+IGluc3RlYWQgb2YgdGhlIGZ1bGwgVVJMLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiZGF0YS1tb2RlbHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNkYXRhLW1vZGVsc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5EYXRhIG1vZGVsczwvc3Bhbj48L2E+PC9oMj48cD5EYXRhIG1vZGVscyBhcmUgcHJvZ3Jlc3NpdmVseSBlbmhhbmNlZCBtaXRocmlsIG1vZGVscyAtIHlvdSBzaW1wbHkgY3JlYXRlIHlvdXIgbW9kZWwgYXMgdXN1YWwsIHRoZW4gYWRkIHZhbGlkYXRpb24gYW5kIHR5cGUgaW5mb3JtYXRpb24gYXMgaXQgYmVjb21lcyBwZXJ0aW5lbnQuXFxuRm9yIGV4YW1wbGUsIHNheSB5b3UgaGF2ZSBhIG1vZGVsIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIHVzZXJNb2RlbCA9IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICB0aGlzLm5hbWUgPSBtLnAoZGF0YS5uYW1lfHwmcXVvdDsmcXVvdDspO1xcbiAgICB0aGlzLmVtYWlsID0gbS5wKGRhdGEuZW1haWx8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuaWQgPSBtLnAoZGF0YS5faWR8fCZxdW90OyZxdW90Oyk7XFxuICAgIHJldHVybiB0aGlzO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+SW4gb3JkZXIgdG8gbWFrZSBpdCB2YWxpZGF0YWJsZSwgYWRkIHRoZSB2YWxpZGF0b3IgbW9kdWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJiMzOTt2YWxpZGF0b3IubW9kZWxiaW5kZXImIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZW4gYWRkIGEgPGNvZGU+aXNWYWxpZDwvY29kZT4gdmFsaWRhdGlvbiBtZXRob2QgdG8geW91ciBtb2RlbCwgd2l0aCBhbnkgZGVjbGFyYXRpb25zIGJhc2VkIG9uIDxhIGhyZWY9XFxcIi9kb2MvdmFsaWRhdG9yLmpzI3ZhbGlkYXRvcnMubWRcXFwiPm5vZGUgdmFsaWRhdG9yPC9hPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgdXNlck1vZGVsID0gZnVuY3Rpb24oZGF0YSl7XFxuICAgIHRoaXMubmFtZSA9IG0ucChkYXRhLm5hbWV8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuZW1haWwgPSBtLnAoZGF0YS5lbWFpbHx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5pZCA9IG0ucChkYXRhLl9pZHx8JnF1b3Q7JnF1b3Q7KTtcXG5cXG4gICAgLy8gICAgVmFsaWRhdGUgdGhlIG1vZGVsICAgICAgICBcXG4gICAgdGhpcy5pc1ZhbGlkID0gdmFsaWRhdGUuYmluZCh0aGlzLCB7XFxuICAgICAgICBuYW1lOiB7XFxuICAgICAgICAgICAgaXNSZXF1aXJlZDogJnF1b3Q7WW91IG11c3QgZW50ZXIgYSBuYW1lJnF1b3Q7XFxuICAgICAgICB9LFxcbiAgICAgICAgZW1haWw6IHtcXG4gICAgICAgICAgICBpc1JlcXVpcmVkOiAmcXVvdDtZb3UgbXVzdCBlbnRlciBhbiBlbWFpbCBhZGRyZXNzJnF1b3Q7LFxcbiAgICAgICAgICAgIGlzRW1haWw6ICZxdW90O011c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJnF1b3Q7XFxuICAgICAgICB9XFxuICAgIH0pO1xcblxcbiAgICByZXR1cm4gdGhpcztcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIGNyZWF0ZXMgYSBtZXRob2QgdGhhdCB0aGUgbWlzbyBkYXRhYmFzZSBhcGkgY2FuIHVzZSB0byB2YWxpZGF0ZSB5b3VyIG1vZGVsLlxcbllvdSBnZXQgZnVsbCBhY2Nlc3MgdG8gdGhlIHZhbGlkYXRpb24gaW5mbyBhcyB3ZWxsLCBzbyB5b3UgY2FuIHNob3cgYW4gZXJyb3IgbWVzc2FnZSBuZWFyIHlvdXIgZmllbGQsIGZvciBleGFtcGxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspXFxuPC9jb2RlPjwvcHJlPlxcbjxwPldpbGwgcmV0dXJuIDxjb2RlPnRydWU8L2NvZGU+IGlmIHRoZSA8Y29kZT5lbWFpbDwvY29kZT4gcHJvcGVydHkgb2YgeW91ciB1c2VyIG1vZGVsIGlzIHZhbGlkLCBvciBhIGxpc3Qgb2YgZXJyb3JzIG1lc3NhZ2VzIGlmIGl0IGlzIGludmFsaWQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+WyZxdW90O1lvdSBtdXN0IGVudGVyIGFuIGVtYWlsIGFkZHJlc3MmcXVvdDssICZxdW90O011c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzJnF1b3Q7XVxcbjwvY29kZT48L3ByZT5cXG48cD5TbyB5b3UgY2FuIGZvciBleGFtcGxlIGFkZCBhIGNsYXNzIG5hbWUgdG8gYSBkaXYgc3Vycm91bmRpbmcgeW91ciBmaWVsZCBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkRJVih7Y2xhc3M6IChjdHJsLnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspID09IHRydWU/ICZxdW90O3ZhbGlkJnF1b3Q7OiAmcXVvdDtpbnZhbGlkJnF1b3Q7KX0sIFsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHNob3cgdGhlIGVycm9yIG1lc3NhZ2VzIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+U1BBTihjdHJsLnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspID09IHRydWU/ICZxdW90OyZxdW90OzogY3RybC51c2VyLmlzVmFsaWQoJiMzOTtlbWFpbCYjMzk7KS5qb2luKCZxdW90OywgJnF1b3Q7KSlcXG48L2NvZGU+PC9wcmU+XFxuPGgyPjxhIG5hbWU9XFxcImRhdGFiYXNlLWFwaS1hbmQtbW9kZWwtaW50ZXJhY3Rpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNkYXRhYmFzZS1hcGktYW5kLW1vZGVsLWludGVyYWN0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkRhdGFiYXNlIGFwaSBhbmQgbW9kZWwgaW50ZXJhY3Rpb248L3NwYW4+PC9hPjwvaDI+PHA+TWlzbyB1c2VzIHRoZSBtb2RlbCBkZWZpbml0aW9ucyB0aGF0IHlvdSBkZWNsYXJlIGluIHlvdXIgPGNvZGU+bXZjPC9jb2RlPiBmaWxlIHRvIGJ1aWxkIHVwIGEgc2V0IG9mIG1vZGVscyB0aGF0IHRoZSBBUEkgY2FuIHVzZSwgdGhlIG1vZGVsIGRlZmluaXRpb25zIHdvcmsgbGlrZSB0aGlzOjwvcD5cXG48dWw+XFxuPGxpPk9uIHRoZSBtb2RlbHMgYXR0cmlidXRlIG9mIHRoZSBtdmMsIHdlICBkZWZpbmUgYSBzdGFuZGFyZCBtaXRocmlsIGRhdGEgbW9kZWwsIChpZTogYSBqYXZhc2NyaXB0IG9iamVjdCB3aGVyZSBwcm9wZXJ0aWVzIGNhbiBiZSBlaXRoZXIgc3RhbmRhcmQgamF2YXNjcmlwdCBkYXRhIHR5cGVzLCBvciBhIGZ1bmN0aW9uIHRoYXQgd29ya3MgYXMgYSBnZXR0ZXIvc2V0dGVyLCBlZzogPGNvZGU+bS5wcm9wPC9jb2RlPik8L2xpPlxcbjxsaT5PbiBzZXJ2ZXIgc3RhcnR1cCwgbWlzbyByZWFkcyB0aGlzIGFuZCBjcmVhdGVzIGEgY2FjaGUgb2YgdGhlIG1vZGVsIG9iamVjdHMsIGluY2x1ZGluZyB0aGUgbmFtZSBzcGFjZSBvZiB0aGUgbW9kZWwsIGVnOiAmcXVvdDtoZWxsby5lZGl0LmhlbGxvJnF1b3Q7PC9saT5cXG48bGk+TW9kZWxzIGNhbiBvcHRpb25hbGx5IGluY2x1ZGUgZGF0YSB2YWxpZGF0aW9uIGluZm9ybWF0aW9uLCBhbmQgdGhlIGRhdGFiYXNlIGFwaSB3aWxsIGdldCBhY2Nlc3MgdG8gdGhpcy48L2xpPlxcbjwvdWw+XFxuPHA+QXNzdW1pbmcgd2UgaGF2ZSBhIG1vZGVsIGluIHRoZSBoZWxsby5tb2RlbHMgb2JqZWN0IGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+aGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgIHRoaXMuaXNWYWxpZCA9IHZhbGlkYXRlLmJpbmQodGhpcywge1xcbiAgICAgICAgd2hvOiB7XFxuICAgICAgICAgICAgaXNSZXF1aXJlZDogJnF1b3Q7WW91IG11c3Qga25vdyB3aG8geW91IGFyZSB0YWxraW5nIHRvJnF1b3Q7XFxuICAgICAgICB9XFxuICAgIH0pO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIEFQSSB3b3JrcyBsaWtlIHRoaXM6PC9wPlxcbjx1bD5cXG48bGk+V2UgY3JlYXRlIGFuIGVuZHBvaW50IGF0IDxjb2RlPi9hcGk8L2NvZGU+IHdoZXJlIGVhY2ggd2UgbG9hZCB3aGF0ZXZlciBhcGkgaXMgY29uZmlndXJlZCBpbiA8Y29kZT4vY2ZnL3NlcnZlci5qc29uPC9jb2RlPiwgYW5kIGV4cG9zZSBlYWNoIG1ldGhvZC4gRm9yIGV4YW1wbGUgPGNvZGU+L2FwaS9zYXZlPC9jb2RlPiBpcyBhdmFpbGFibGUgZm9yIHRoZSBkZWZhdWx0IDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IGFwaS48L2xpPlxcbjxsaT5OZXh0IHdlIGNyZWF0ZSBhIHNldCBvZiBBUEkgZmlsZXMgLSBvbmUgZm9yIGNsaWVudCwgKC9zeXN0ZW0vYXBpLmNsaWVudC5qcyksIGFuZCBvbmUgZm9yIHNlcnZlciAoL3N5c3RlbS9hcGkuc2VydmVyLmpzKSAtIGVhY2ggaGF2ZSB0aGUgc2FtZSBtZXRob2RzLCBidXQgZG8gdmFzdGx5IGRpZmZlcmVudCB0aGluZ3M6PHVsPlxcbjxsaT5hcGkuY2xpZW50LmpzIGlzIGEgdGhpbiB3cmFwcGVyIHRoYXQgdXNlcyBtaXRocmlsJiMzOTtzIG0ucmVxdWVzdCB0byBjcmVhdGUgYW4gYWpheCByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgQVBJLCBpdCBzaW1wbHkgcGFzc2VzIG1lc3NhZ2VzIGJhY2sgYW5kIGZvcnRoIChpbiBKU09OIFJQQyAyLjAgZm9ybWF0KS48L2xpPlxcbjxsaT5hcGkuc2VydmVyLmpzIGNhbGxzIHRoZSBkYXRhYmFzZSBhcGkgbWV0aG9kcywgd2hpY2ggaW4gdHVybiBoYW5kbGVzIG1vZGVscyBhbmQgdmFsaWRhdGlvbiBzbyBmb3IgZXhhbXBsZSB3aGVuIGEgcmVxdWVzdCBpcyBtYWRlIGFuZCBhIDxjb2RlPnR5cGU8L2NvZGU+IGFuZCA8Y29kZT5tb2RlbDwvY29kZT4gaXMgaW5jbHVkZWQsIHdlIGNhbiByZS1jb25zdHJ1Y3QgdGhlIGRhdGEgbW9kZWwgYmFzZWQgb24gdGhpcyBpbmZvLCBmb3IgZXhhbXBsZSB5b3UgbWlnaHQgc2VuZDoge3R5cGU6ICYjMzk7aGVsbG8uZWRpdC5oZWxsbyYjMzk7LCBtb2RlbDoge3dobzogJiMzOTtEYXZlJiMzOTt9fSwgdGhpcyBjYW4gdGhlbiBiZSBjYXN0IGJhY2sgaW50byBhIG1vZGVsIHRoYXQgd2UgY2FuIGNhbGwgdGhlIDxjb2RlPmlzVmFsaWQ8L2NvZGU+IG1ldGhvZCBvbi48L2xpPlxcbjwvdWw+XFxuPC9saT5cXG48L3VsPlxcbjxwPjxzdHJvbmc+Tm93LCB0aGUgaW1wb3J0YW50IGJpdDo8L3N0cm9uZz4gVGhlIHJlYXNvbiBmb3IgYWxsIHRoaXMgZnVuY3Rpb25hbGl0eSBpcyB0aGF0IG1pdGhyaWwgaW50ZXJuYWxseSBkZWxheXMgcmVuZGVyaW5nIHRvIHRoZSBET00gd2hpbHN0IGEgcmVxdWVzdCBpcyBnb2luZyBvbiwgc28gd2UgbmVlZCB0byBoYW5kbGUgdGhpcyB3aXRoaW4gbWlzbyAtIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gcmVuZGVyIHRoaW5ncyBvbiB0aGUgc2VydmVyIC0gc28gd2UgaGF2ZSBhIGJpbmRpbmcgc3lzdGVtIHRoYXQgZGVsYXlzIHJlbmRlcmluZyB3aGlsc3QgYW4gYXN5bmMgcmVxdWVzdCBpcyBzdGlsbCBiZWluZyBleGVjdXRlZC4gVGhhdCBtZWFucyBtaXRocmlsLWxpa2UgY29kZSBsaWtlIHRoaXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y29udHJvbGxlcjogZnVuY3Rpb24oKXtcXG4gICAgdmFyIGN0cmwgPSB0aGlzO1xcbiAgICBhcGkuZmluZCh7dHlwZTogJiMzOTtoZWxsby5pbmRleC5oZWxsbyYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XFxuICAgICAgICB2YXIgbGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgdmFyIG15SGVsbG8gPSBkYXRhLnJlc3VsdFtrZXldO1xcbiAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMuaGVsbG8obXlIZWxsbyk7XFxuICAgICAgICB9KTtcXG4gICAgICAgIGN0cmwubW9kZWwgPSBuZXcgY3RybC52bS50b2RvTGlzdChsaXN0KTtcXG4gICAgfSk7XFxuICAgIHJldHVybiBjdHJsO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+V2lsbCBzdGlsbCB3b3JrLiBOb3RlOiB0aGUgbWFnaWMgaGVyZSBpcyB0aGF0IHRoZXJlIGlzIGFic29sdXRlbHkgbm90aGluZyBpbiB0aGUgY29kZSBhYm92ZSB0aGF0IHJ1bnMgYSBjYWxsYmFjayB0byBsZXQgbWl0aHJpbCBrbm93IHRoZSBkYXRhIGlzIHJlYWR5IC0gdGhpcyBpcyBhIGRlc2lnbiBmZWF0dXJlIG9mIG1pdGhyaWwgdG8gZGVsYXkgcmVuZGVyaW5nIGF1dG9tYXRpY2FsbHkgd2hpbHN0IGFuIDxjb2RlPm0ucmVxdWVzdDwvY29kZT4gaXMgaW4gcHJvZ3Jlc3MsIHNvIHdlIGNhdGVyIGZvciB0aGlzIHRvIGhhdmUgdGhlIGFiaWxpdHkgdG8gcmVuZGVyIHRoZSBwYWdlIHNlcnZlci1zaWRlIGZpcnN0LCBzbyB0aGF0IFNFTyB3b3JrcyBvdXQgb2YgdGhlIGJveC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImNsaWVudC12cy1zZXJ2ZXItY29kZVxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NsaWVudC12cy1zZXJ2ZXItY29kZVxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5DbGllbnQgdnMgc2VydmVyIGNvZGU8L3NwYW4+PC9hPjwvaDI+PHA+SW4gbWlzbywgeW91IGluY2x1ZGUgZmlsZXMgdXNpbmcgdGhlIHN0YW5kYXJkIG5vZGVqcyA8Y29kZT5yZXF1aXJlPC9jb2RlPiBmdW5jdGlvbi4gV2hlbiB5b3UgbmVlZCB0byBkbyBzb21ldGhpbmcgdGhhdCB3b3JrcyBkaWZmZXJlbnRseSBpbiB0aGUgY2xpZW50IHRoYW4gdGhlIHNlcnZlciwgdGhlcmUgYXJlIGEgZmV3IHdheXMgeW91IGNhbiBhY2hpZXZlIGl0OjwvcD5cXG48dWw+XFxuPGxpPlRoZSByZWNvbW1lbmRlZCB3YXkgaXMgdG8gY3JlYXRlIGFuZCByZXF1aXJlIGEgZmlsZSBpbiB0aGUgPGNvZGU+bW9kdWxlcy88L2NvZGU+IGRpcmVjdG9yeSwgYW5kIHRoZW4gY3JlYXRlIHRoZSBzYW1lIGZpbGUgd2l0aCBhICZxdW90Oy5jbGllbnQmcXVvdDsgYmVmb3JlIHRoZSBleHRlbnNpb24sIGFuZCBtaXNvIHdpbGwgYXV0b21hdGljYWxseSBsb2FkIHRoYXQgZmlsZSBmb3IgeW91IG9uIHRoZSBjbGllbnQgc2lkZSBpbnN0ZWFkLiBGb3IgZXhhbXBsZSBpZiB5b3UgaGF2ZSA8Y29kZT4vbW9kdWxlcy9zb21ldGhpbmcuanM8L2NvZGU+LCBpZiB5b3UgY3JlYXRlIDxjb2RlPi9tb2R1bGVzL3NvbWV0aGluZy5jbGllbnQuanM8L2NvZGU+LCBtaXNvIHdpbGwgYXV0b21hdGljYWxseSB1c2UgdGhhdCBvbiB0aGUgY2xpZW50LjwvbGk+XFxuPGxpPkFub3RoZXIgb3B0aW9uIGlzIHRvIHVzZSA8Y29kZT5taXNvLnV0aWw8L2NvZGU+IC0geW91IGNhbiB1c2UgPGNvZGU+bWlzby51dGlsLmlzU2VydmVyKCk8L2NvZGU+IHRvIHRlc3QgaWYgeW91JiMzOTtyZSBvbiB0aGUgc2VydmVyIG9yIG5vdCwgdGhvdWdoIGl0IGlzIGJldHRlciBwcmFjdGljZSB0byB1c2UgdGhlICZxdW90Oy5jbGllbnQmcXVvdDsgbWV0aG9kIG1lbnRpb25lZCBhYm92ZSAtIG9ubHkgdXNlIDxjb2RlPmlzU2VydmVyPC9jb2RlPiBpZiB5b3UgYWJzb2x1dGVseSBoYXZlIG5vIG90aGVyIG9wdGlvbi48L2xpPlxcbjwvdWw+XFxuPGgyPjxhIG5hbWU9XFxcImZpcnN0LXBhZ2UtbG9hZFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2ZpcnN0LXBhZ2UtbG9hZFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5GaXJzdCBwYWdlIGxvYWQ8L3NwYW4+PC9hPjwvaDI+PHA+V2hlbiBhIG5ldyB1c2VyIGVudGVycyB5b3VyIHNpdGUgdmlhIGEgVVJMLCBhbmQgbWlzbyBsb2FkcyB0aGUgZmlyc3QgcGFnZSwgYSBudW1iZXIgb2YgdGhpbmdzIGhhcHBlbjo8L3A+XFxuPHVsPlxcbjxsaT5UaGUgc2VydmVyIGdlbmVyYXRlcyB0aGUgcGFnZSwgaW5jbHVkaW5nIGFueSBkYXRhIHRoZSB1c2VyIG1pZ2h0IGhhdmUgYWNjZXNzIHRvLiBUaGlzIGlzIG1haW5seSBmb3IgU0VPIHB1cnBvc2VzLCBidXQgYWxzbyB0byBtYWtlIHRoZSBwZXJjZXB0aWJsZSBsb2FkaW5nIHRpbWUgbGVzcywgcGx1cyBwcm92aWRlIGJlYXV0aWZ1bCB1cmxzIG91dCBvZiB0aGUgYm94LiA8L2xpPlxcbjxsaT5PbmNlIHRoZSBwYWdlIGhhcyBsb2FkZWQsIG1pdGhyaWwga2lja3MgaW4gYW5kIGNyZWF0ZXMgYSBYSFIgKGFqYXgpIHJlcXVlc3QgdG8gcmV0cmVpdmUgdGhlIGRhdGEsIGFuZCBzZXR1cCBhbnkgZXZlbnRzIGFuZCB0aGUgdmlydHVhbCBET00sIGV0Yy48L2xpPlxcbjwvdWw+XFxuPHA+Tm93IHlvdSBtaWdodCBiZSB0aGlua2luZzogd2UgZG9uJiMzOTt0IHJlYWxseSBuZWVkIHRoYXQgMm5kIHJlcXVlc3QgZm9yIGRhdGEgLSBpdCYjMzk7cyBhbHJlYWR5IGluIHRoZSBwYWdlLCByaWdodD8gV2VsbCwgc29ydCBvZiAtIHlvdSBzZWUgbWlzbyBkb2VzIG5vdCBtYWtlIGFueSBhc3N1bXB0aW9ucyBhYm91dCB0aGUgc3RydWN0dXJlIG9mIHlvdXIgZGF0YSwgb3IgaG93IHlvdSB3YW50IHRvIHVzZSBpdCBpbiB5b3VyIG1vZGVscywgc28gdGhlcmUgaXMgbm8gd2F5IGZvciB1cyB0byByZS11c2UgdGhhdCBkYXRhLCBhcyBpdCBjb3VsZCBiZSBhbnkgc3RydWN0dXJlLlxcbkFub3RoZXIga2V5IGZlYXR1cmUgb2YgbWlzbyBpcyB0aGUgZmFjdCB0aGF0IGFsbCBhY3Rpb25zIGNhbiBiZSBib29rbWFya2FibGUgLSBmb3IgZXhhbXBsZSB0aGUgPGEgaHJlZj1cXFwiL2RvYy91c2Vycy5tZFxcXCI+L3VzZXJzPC9hPiBhcHAgLSBjbGljayBvbiBhIHVzZXIsIGFuZCBzZWUgdGhlIHVybCBjaGFuZ2UgLSB3ZSBkaWRuJiMzOTt0IGRvIGFub3RoZXIgc2VydmVyIHJvdW5kLXRyaXAsIGJ1dCByYXRoZXIganVzdCBhIFhIUiByZXF1ZXN0IHRoYXQgcmV0dXJuZWQgdGhlIGRhdGEgd2UgcmVxdWlyZWQgLSB0aGUgVUkgd2FzIGNvbXBsZXRlbHkgcmVuZGVyZWQgY2xpZW50IHNpZGUgLSBzbyBpdCYjMzk7cyByZWFsbHkgb24gdGhhdCBmaXJzdCB0aW1lIHdlIGxvYWQgdGhlIHBhZ2UgdGhhdCB5b3UgZW5kIHVwIGxvYWRpbmcgdGhlIGRhdGEgdHdpY2UuPC9wPlxcbjxwPlNvIHRoYXQgaXMgdGhlIHJlYXNvbiB0aGUgYXJjaGl0ZWN0dXJlIHdvcmtzIHRoZSB3YXkgaXQgZG9lcywgYW5kIGhhcyB0aGF0IHNlZW1pbmdseSByZWR1bmRhbnQgMm5kIHJlcXVlc3QgZm9yIHRoZSBkYXRhIC0gaXQgaXMgYSBzbWFsbCBwcmljZSB0byBwYXkgZm9yIFNFTywgYW5kIHBlcmNlcHRpYmx5IHF1aWNrIGxvYWRpbmcgcGFnZXMgYW5kIGFzIG1lbnRpb25lZCwgaXQgb25seSBldmVyIGhhcHBlbnMgb24gdGhlIGZpcnN0IHBhZ2UgbG9hZC48L3A+XFxuPHA+T2YgY291cnNlIHlvdSBjb3VsZCBpbXBsZW1lbnQgY2FjaGluZyBvZiB0aGUgZGF0YSB5b3Vyc2VsZiwgaWYgdGhlIDJuZCByZXF1ZXN0IGlzIGFuIGlzc3VlIC0gYWZ0ZXIgYWxsIHlvdSBtaWdodCBiZSBsb2FkaW5nIHF1aXRlIGEgYml0IG9mIGRhdGEuIE9uZSB3YXkgdG8gZG8gdGhpcyB3b3VsZCBiZSBsaWtlIHNvICh3YXJuaW5nOiByYXRoZXIgY29udHJpdmVkIGV4YW1wbGUgZm9sbG93cyk6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICAgICAgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuXFxuICAgICAgICAvLyAgICBDaGVjayBpZiBvdXIgZGF0YSBpcyBhdmFpbGFibGUsIGlmIHNvOiB1c2UgaXQuXFxuICAgICAgICBpZih0eXBlb2YgbXlQZXJzb24gIT09ICZxdW90O3VuZGVmaW5lZCZxdW90Oykge1xcbiAgICAgICAgICAgIGN0cmwubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogbXlQZXJzb259KTtcXG4gICAgICAgIH0gZWxzZSB7XFxuICAgICAgICAvLyAgICBJZiBub3QsIGxvYWQgaXQgZmlyc3QuXFxuICAgICAgICAgICAgZGIuZmluZCh7dHlwZTogJiMzOTt1c2VyLmVkaXQudXNlciYjMzk7fSkudGhlbihmdW5jdGlvbihkYXRhKSB7XFxuICAgICAgICAgICAgICAgIGN0cmwubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogZGF0YS5yZXN1bHRbMF0ubmFtZX0pO1xcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgfVxcblxcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgLy8gICAgQWRkIGEgY2xpZW50IHNpZGUgZ2xvYmFsIHZhcmlhYmxlIHdpdGggb3VyIGRhdGFcXG4gICAgICAgICAgICAgICAgU0NSSVBUKCZxdW90O3ZhciBteVBlcnNvbiA9ICYjMzk7JnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSArICZxdW90OyYjMzk7JnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0cmIzM5O2RheSAmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpKVxcbiAgICAgICAgICAgIF1cXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNvIHRoaXMgd2lsbCBvbmx5IGxvYWQgdGhlIGRhdGEgb24gdGhlIHNlcnZlciBzaWRlIC0gYXMgeW91IGNhbiBzZWUsIHdlIG5lZWQgdG8ga25vdyB0aGUgc2hhcGUgb2YgdGhlIGRhdGEgdG8gdXNlIGl0LCBhbmQgd2UgYXJlIHVzaW5nIGEgZ2xvYmFsIHZhcmlhYmxlIGhlcmUgdG8gc3RvcmUgdGhlIGRhdGEgY2xpZW50IHNpZGUgLSBJIGRvbiYjMzk7dCByZWFsbHkgcmVjb21tZW5kIHRoaXMgYXBwcm9hY2gsIGFzIGl0IHNlZW1zIGxpa2UgYSBsb3Qgb2Ygd29yayB0byBzYXZlIGEgc2luZ2xlIFhIUiByZXF1ZXN0LiBIb3dldmVyIEkgdW5kZXJzdGFuZCB5b3UgbWlnaHQgaGF2ZSB1bmlxdWUgY2lyY3Vtc3RhbmNlcyB3aGVyZSB0aGUgZmlyc3QgZGF0YSBsb2FkIGNvdWxkIGJlIGEgcHJvYmxlbSwgc28gYXQgbGVhc3QgdGhpcyBpcyBhbiBvcHRpb24geW91IGNhbiB1c2UgdG8gY2FjaGUgdGhlIGRhdGEgb24gZmlyc3QgcGFnZSBsb2FkLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwicmVxdWlyaW5nLWZpbGVzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcmVxdWlyaW5nLWZpbGVzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJlcXVpcmluZyBmaWxlczwvc3Bhbj48L2E+PC9oMj48cD5XaGVuIHJlcXVpcmluZyBmaWxlcywgYmUgc3VyZSB0byBkbyBzbyBpbiBhIHN0YXRpYyBtYW5uZXIgc28gdGhhdCBicm93c2VyaWZ5IGlzIGFibGUgdG8gY29tcGlsZSB0aGUgY2xpZW50IHNpZGUgc2NyaXB0LiBBbHdheXMgdXNlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5FVkVSIERPIEFOWSBPRiBUSEVTRTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4vLyAgRE9OJiMzOTtUIERPIFRISVMhXFxudmFyIG1pc28gPSBuZXcgcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBjcmVhdGUgYW4gb2JqZWN0LCB3aGljaCBtZWFucyA8YSBocmVmPVxcXCIvZG9jLzgyNC5tZFxcXCI+YnJvd3NlcmlmeSBjYW5ub3QgcmVzb2x2ZSBpdCBzdGF0aWNhbGx5PC9hPiwgYW5kIHdpbGwgaWdub3JlIGl0LjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICBET04mIzM5O1QgRE8gVEhJUyFcXG52YXIgdGhpbmcgPSAmIzM5O21pc28mIzM5OztcXG52YXIgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvJiMzOTsrdGhpbmcrJiMzOTsudXRpbC5qcyYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGNyZWF0ZSBhbiBleHByZXNzaW9uLCB3aGljaCBtZWFucyA8YSBocmVmPVxcXCIvZG9jLzgyNC5tZFxcXCI+YnJvd3NlcmlmeSBjYW5ub3QgcmVzb2x2ZSBpdCBzdGF0aWNhbGx5PC9hPiwgYW5kIHdpbGwgaWdub3JlIGl0LjwvcD5cXG5cIixcIlBhdHRlcm5zLm1kXCI6XCI8cD5UaGVyZSBhcmUgc2V2ZXJhbCB3YXlzIHlvdSBjYW4gd3JpdGUgeW91ciBhcHAgYW5kIG1pc28gaXMgbm90IG9waW5pb25hdGVkIGFib3V0IGhvdyB5b3UgZ28gYWJvdXQgdGhpcyBzbyBpdCBpcyBpbXBvcnRhbnQgdGhhdCB5b3UgY2hvb3NlIGEgcGF0dGVybiB0aGF0IHN1aXRzIHlvdXIgbmVlZHMuIEJlbG93IGFyZSBhIGZldyBzdWdnZXN0ZWQgcGF0dGVybnMgdG8gZm9sbG93IHdoZW4gZGV2ZWxvcGluZyBhcHBzLjwvcD5cXG48cD48c3Ryb25nPk5vdGU6PC9zdHJvbmc+IG1pc28gaXMgYSBzaW5nbGUgcGFnZSBhcHAgdGhhdCBsb2FkcyBzZXJ2ZXIgcmVuZGVyZWQgSFRNTCBmcm9tIGFueSBVUkwsIHNvIHRoYXQgU0VPIHdvcmtzIG91dCBvZiB0aGUgYm94LjwvcD5cXG48aDI+PGEgbmFtZT1cXFwic2luZ2xlLXVybC1tdmNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzaW5nbGUtdXJsLW12Y1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5TaW5nbGUgdXJsIG12Yzwvc3Bhbj48L2E+PC9oMj48cD5JbiB0aGlzIHBhdHRlcm4gZXZlcnl0aGluZyB0aGF0IHlvdXIgbXZjIG5lZWRzIHRvIGRvIGlzIGRvbmUgb24gYSBzaW5nbGUgdXJsIGZvciBhbGwgdGhlIGFzc29jaWF0ZWQgYWN0aW9ucy4gVGhlIGFkdmFudGFnZSBmb3IgdGhpcyBzdHlsZSBvZiBkZXZlbG9wbWVudCBpcyB0aGF0IHlvdSBoYXZlIGV2ZXJ5dGhpbmcgaW4gb25lIG12YyBjb250YWluZXIsIGFuZCB5b3UgZG9uJiMzOTt0IG5lZWQgdG8gbWFwIGFueSByb3V0ZXMgLSBvZiBjb3Vyc2UgdGhlIGRvd25zaWRlIGJlaW5nIHRoYXQgdGhlcmUgYXJlIG5vIHJvdXRlcyBmb3IgdGhlIHVzZXIgdG8gYm9va21hcmsuIFRoaXMgaXMgcGF0dGVybiB3b3JrcyB3ZWxsIGZvciBzbWFsbGVyIGVudGl0aWVzIHdoZXJlIHRoZXJlIGFyZSBub3QgdG9vIG1hbnkgaW50ZXJhY3Rpb25zIHRoYXQgdGhlIHVzZXIgY2FuIGRvIC0gdGhpcyBpcyBlc3NlbnRpYWxseSBob3cgbW9zdCBtaXRocmlsIGFwcHMgYXJlIHdyaXR0ZW4gLSBzZWxmLWNvbnRhaW5lZCwgYW5kIGF0IGEgc2luZ2xlIHVybC48L3A+XFxuPHA+SGVyZSBpcyBhICZxdW90O2hlbGxvIHdvcmxkJnF1b3Q7IGV4YW1wbGUgdXNpbmcgdGhlIHNpbmdsZSB1cmwgcGF0dGVybjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5zdWdhcnRhZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIC8vICAgIE91ciBtb2RlbFxcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IHNlbGYubW9kZWxzLmhlbGxvKHt3aG86ICZxdW90O3dvcmxkJnF1b3Q7fSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgdmFyIG1vZGVsID0gY3RybC5tb2RlbDtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0hlbGxvICZxdW90OyArIG1vZGVsLndobygpKVxcbiAgICAgICAgICAgIF07XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdvdWxkIGV4cG9zZSBhIHVybCAvaGVsbG9zIChub3RlOiB0aGUgJiMzOTtzJiMzOTspLCBhbmQgd291bGQgZGlzcGxheSAmcXVvdDtIZWxsbyB3b3JsZCZxdW90Oy4gKFlvdSBjYW4gY2hhbmdlIHRoZSByb3V0ZSB1c2luZyBjdXN0b20gcm91dGluZyk8L3A+XFxuPGgyPjxhIG5hbWU9XFxcIm11bHRpLXVybC1tdmNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtdWx0aS11cmwtbXZjXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk11bHRpIHVybCBtdmM8L3NwYW4+PC9hPjwvaDI+PHA+SW4gdGhpcyBwYXR0ZXJuIHdlIGV4cG9zZSBtdWx0aXBsZSBtdmMgcm91dGVzIHRoYXQgaW4gdHVybiB0cmFuc2xhdGUgdG8gbXVsdGlwbGUgVVJMcy4gVGhpcyBpcyB1c2VmdWwgZm9yIHNwbGl0dGluZyB1cCB5b3VyIGFwcCwgYW5kIGVuc3VyaW5nIGVhY2ggbXZjIGhhcyBpdHMgb3duIHNldHMgb2YgY29uY2VybnMuPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuc3VnYXJ0YWdzLm5vZGUuanMmIzM5OykobSk7XFxuXFxudmFyIGluZGV4ID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgLy8gICAgT3VyIG1vZGVsXFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnAoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmhlbGxvKHt3aG86ICZxdW90O3dvcmxkJnF1b3Q7fSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgdmFyIG1vZGVsID0gY3RybC5tb2RlbDtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0hlbGxvICZxdW90OyArIG1vZGVsLndobygpKSxcXG4gICAgICAgICAgICAgICAgQSh7aHJlZjogJnF1b3Q7L2hlbGxvL0xlbyZxdW90OywgY29uZmlnOiBtLnJvdXRlfSwgJnF1b3Q7Q2xpY2sgbWUgZm9yIHRoZSBlZGl0IGFjdGlvbiZxdW90OylcXG4gICAgICAgICAgICBdO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTtoZWxsb19pZCYjMzk7LCBwYXJhbXMpO1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgdmFyIG1vZGVsID0gY3RybC5tb2RlbDtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgRElWKCZxdW90O0hlbGxvICZxdW90OyArIG1vZGVsLndobygpKVxcbiAgICAgICAgICAgIF07XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5IZXJlIHdlIGFsc28gZXhwb3NlIGEgJnF1b3Q7L2hlbGxvL1tOQU1FXSZxdW90OyB1cmwsIHRoYXQgd2lsbCBzaG93IHlvdXIgbmFtZSB3aGVuIHlvdSB2aXNpdCAvaGVsbG8vW1lPVVIgTkFNRV0sIHNvIHRoZXJlIGFyZSBub3cgbXVsdGlwbGUgdXJscyBmb3Igb3VyIFNQQTo8L3A+XFxuPHVsPlxcbjxsaT48c3Ryb25nPi9oZWxsb3M8L3N0cm9uZz4gLSB0aGlzIGlzIGludGVuZGVkIHRvIGJlIGFuIGluZGV4IHBhZ2UgdGhhdCBsaXN0cyBhbGwgeW91ciAmcXVvdDtoZWxsb3MmcXVvdDs8L2xpPlxcbjxsaT48c3Ryb25nPi9oZWxsby9bTkFNRV08L3N0cm9uZz4gLSB0aGlzIGlzIGludGVuZGVkIHRvIGJlIGFuIGVkaXQgcGFnZSB3aGVyZSB5b3UgY2FuIGVkaXQgeW91ciAmcXVvdDtoZWxsb3MmcXVvdDs8L2xpPlxcbjwvdWw+XFxuPHA+Tm90ZSB0aGF0IHRoZSBhbmNob3IgdGFnIGhhcyA8Y29kZT5jb25maWc6IG0ucm91dGU8L2NvZGU+IGluIGl0JiMzOTtzIG9wdGlvbnMgLSB0aGlzIGlzIHNvIHRoYXQgd2UgY2FuIHJvdXRlIGF1dG9tYXRpY2FsbHkgdGhvdWdoIG1pdGhyaWw8L3A+XFxuXCJ9OyB9OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XG5cdHZhciBnZXRNb2RlbERhdGEgPSBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIGksIHJlc3VsdCA9IHt9O1xuXHRcdGZvcihpIGluIG1vZGVsKSB7aWYobW9kZWwuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdGlmKGkgIT09ICdpc1ZhbGlkJykge1xuXHRcdFx0XHRpZihpID09ICdpZCcpIHtcblx0XHRcdFx0XHRyZXN1bHRbJ19pZCddID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHJldHVybiB7XG4nZmluZCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2ZpbmQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NhdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9zYXZlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidyZW1vdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9yZW1vdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2F1dGhlbnRpY2F0ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2F1dGhlbnRpY2F0ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nbG9naW4nOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9sb2dpbicsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nbG9nb3V0JzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vbG9nb3V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidmaW5kVXNlcnMnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9maW5kVXNlcnMnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NhdmVVc2VyJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vc2F2ZVVzZXInLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59XG5cdH07XG59OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XG5cdHZhciBnZXRNb2RlbERhdGEgPSBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIGksIHJlc3VsdCA9IHt9O1xuXHRcdGZvcihpIGluIG1vZGVsKSB7aWYobW9kZWwuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdGlmKGkgIT09ICdpc1ZhbGlkJykge1xuXHRcdFx0XHRpZihpID09ICdpZCcpIHtcblx0XHRcdFx0XHRyZXN1bHRbJ19pZCddID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cdHJldHVybiB7XG4nZmluZCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvZmluZCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nc2F2ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvc2F2ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4ncmVtb3ZlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvZmxhdGZpbGVkYi9yZW1vdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2F1dGhlbnRpY2F0ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvYXV0aGVudGljYXRlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufVxuXHR9O1xufTsiLCIvKiBOT1RFOiBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUsIHBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LCB5b3VyIGNoYW5nZXMgd2lsbCBiZSBsb3N0ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG0pe1xuXHR2YXIgZ2V0TW9kZWxEYXRhID0gZnVuY3Rpb24obW9kZWwpe1xuXHRcdHZhciBpLCByZXN1bHQgPSB7fTtcblx0XHRmb3IoaSBpbiBtb2RlbCkge2lmKG1vZGVsLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRpZihpICE9PSAnaXNWYWxpZCcpIHtcblx0XHRcdFx0aWYoaSA9PSAnaWQnKSB7XG5cdFx0XHRcdFx0cmVzdWx0WydfaWQnXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdFtpXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fX1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHRyZXR1cm4ge1xuJ2dldCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL3Nlc3Npb24vZ2V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzZXQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9zZXNzaW9uL3NldCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn1cblx0fTtcbn07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL3ZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpO3ZhciBzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pO3ZhciBiaW5kaW5ncyA9IHJlcXVpcmUoJ21pdGhyaWwuYmluZGluZ3MnKShtKTt2YXIgYW5pbWF0ZSA9IHJlcXVpcmUoJy4uL3B1YmxpYy9qcy9taXRocmlsLmFuaW1hdGUuanMnKShtKTt2YXIgcGVybWlzc2lvbnMgPSByZXF1aXJlKCcuLi9zeXN0ZW0vbWlzby5wZXJtaXNzaW9ucy5qcycpO3ZhciBsYXlvdXQgPSByZXF1aXJlKCcuLi9tdmMvbGF5b3V0LmpzJyk7dmFyIHJlc3RyaWN0ID0gZnVuY3Rpb24ocm91dGUsIGFjdGlvbk5hbWUpe1x0cmV0dXJuIHJvdXRlO307dmFyIHBlcm1pc3Npb25PYmogPSB7fTt2YXIgdXNlciA9IHJlcXVpcmUoJy4uL212Yy91c2VyLmpzJyk7XG52YXIgaG9tZSA9IHJlcXVpcmUoJy4uL212Yy9ob21lLmpzJyk7XG52YXIgZG9jID0gcmVxdWlyZSgnLi4vbXZjL2RvYy5qcycpO1xuXG52YXIgaGVsbG8gPSByZXF1aXJlKCcuLi9tdmMvaGVsbG8uanMnKTtcbnZhciBsb2dpbiA9IHJlcXVpcmUoJy4uL212Yy9sb2dpbi5qcycpO1xudmFyIHRvZG8gPSByZXF1aXJlKCcuLi9tdmMvdG9kby5qcycpO1xuXG5pZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1x0d2luZG93Lm0gPSBtO31cdG0ucm91dGUubW9kZSA9ICdwYXRobmFtZSc7bS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzb0F0dGFjaG1lbnROb2RlJyksICcvJywgeycvdXNlcnMvbmV3JzogcmVzdHJpY3QodXNlci5uZXcsICd1c2VyLm5ldycpLFxuJy8nOiByZXN0cmljdChob21lLmluZGV4LCAnaG9tZS5pbmRleCcpLFxuJy9kb2MvOmRvY19pZCc6IHJlc3RyaWN0KGRvYy5lZGl0LCAnZG9jLmVkaXQnKSxcbicvZG9jcyc6IHJlc3RyaWN0KGRvYy5pbmRleCwgJ2RvYy5pbmRleCcpLFxuJy9oZWxsby86aGVsbG9faWQnOiByZXN0cmljdChoZWxsby5lZGl0LCAnaGVsbG8uZWRpdCcpLFxuJy9sb2dpbic6IHJlc3RyaWN0KGxvZ2luLmluZGV4LCAnbG9naW4uaW5kZXgnKSxcbicvdG9kb3MnOiByZXN0cmljdCh0b2RvLmluZGV4LCAndG9kby5pbmRleCcpLFxuJy91c2VyLzp1c2VyX2lkJzogcmVzdHJpY3QodXNlci5lZGl0LCAndXNlci5lZGl0JyksXG4nL3VzZXJzJzogcmVzdHJpY3QodXNlci5pbmRleCwgJ3VzZXIuaW5kZXgnKX0pO21pc29HbG9iYWwucmVuZGVySGVhZGVyID0gZnVuY3Rpb24ob2JqKXtcdG0ucmVuZGVyKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNvSGVhZGVyTm9kZScpLCBsYXlvdXQuaGVhZGVyQ29udGVudCh7bWlzb0dsb2JhbDogb2JqIHx8IG1pc29HbG9iYWx9KSk7fTttaXNvR2xvYmFsLnJlbmRlckhlYWRlcigpOyIsIi8qXHRtaXNvIHBlcm1pc3Npb25zXG5cdFBlcm1pdCB1c2VycyBhY2Nlc3MgdG8gY29udHJvbGxlciBhY3Rpb25zIGJhc2VkIG9uIHJvbGVzIFxuKi9cbnZhciBtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0aGFzUm9sZSA9IGZ1bmN0aW9uKHVzZXJSb2xlcywgcm9sZXMpe1xuXHRcdHZhciBoYXNSb2xlID0gZmFsc2U7XG5cdFx0Ly9cdEFsbCByb2xlc1xuXHRcdGlmKHVzZXJSb2xlcyA9PSBcIipcIikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdC8vXHRTZWFyY2ggZWFjaCB1c2VyIHJvbGVcblx0XHRtaXNvLmVhY2godXNlclJvbGVzLCBmdW5jdGlvbih1c2VyUm9sZSl7XG5cdFx0XHR1c2VyUm9sZSA9ICh0eXBlb2YgdXNlclJvbGUgIT09IFwic3RyaW5nXCIpPyB1c2VyUm9sZTogW3VzZXJSb2xlXTtcblx0XHRcdC8vXHRTZWFyY2ggZWFjaCByb2xlXG5cdFx0XHRtaXNvLmVhY2gocm9sZXMsIGZ1bmN0aW9uKHJvbGUpe1xuXHRcdFx0XHRpZih1c2VyUm9sZSA9PSByb2xlKSB7XG5cdFx0XHRcdFx0aGFzUm9sZSA9IHRydWU7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRyZXR1cm4gaGFzUm9sZTtcblx0fTtcblxuLy9cdERldGVybWluZSBpZiB0aGUgdXNlciBoYXMgYWNjZXNzIHRvIGFuIEFQUCBhY3Rpb25cbi8vXHRUT0RPOiBcbm1vZHVsZS5leHBvcnRzLmFwcCA9IGZ1bmN0aW9uKHBlcm1pc3Npb25zLCBhY3Rpb25OYW1lLCB1c2VyUm9sZXMpe1xuXHQvL1x0VE9ETzogUHJvYmFibHkgbmVlZCB0byB1c2UgcGFzcz1mYWxzZSBieSBkZWZhdWx0LCBidXQgZmlyc3Q6XG5cdC8vXG5cdC8vXHQqIEFkZCBnbG9iYWwgY29uZmlnIGZvciBwYXNzIGRlZmF1bHQgaW4gc2VydmVyLmpzb25cblx0Ly9cdCogXG5cdC8vXG5cdHZhciBwYXNzID0gdHJ1ZTtcblxuXHQvL1x0QXBwbHkgZGVueSBmaXJzdCwgdGhlbiBhbGxvdy5cblx0aWYocGVybWlzc2lvbnMgJiYgdXNlclJvbGVzKXtcblx0XHRpZihwZXJtaXNzaW9ucy5kZW55KSB7XG5cdFx0XHRwYXNzID0gISBoYXNSb2xlKHVzZXIucm9sZXMsIHBlcm1pc3Npb25zLmRlbnkpO1xuXHRcdH1cblx0XHRpZihwZXJtaXNzaW9ucy5hbGxvdykge1xuXHRcdFx0cGFzcyA9IGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuYWxsb3cpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBwYXNzO1xufTtcblxuXG4vL1x0RGV0ZXJtaW5lIGlmIHRoZSB1c2VyIGhhcyBhY2Nlc3MgdG8gYW4gQVBJIGFjdGlvblxuLy9cdFRPRE86IFxubW9kdWxlLmV4cG9ydHMuYXBpID0gZnVuY3Rpb24ocGVybWlzc2lvbnMsIGFjdGlvbk5hbWUsIHVzZXJSb2xlcyl7XG5cdC8vXHRUT0RPOiBQcm9iYWJseSBuZWVkIHRvIHVzZSBwYXNzPWZhbHNlIGJ5IGRlZmF1bHQsIGJ1dCBmaXJzdDpcblx0Ly9cblx0Ly9cdCogQWRkIGdsb2JhbCBjb25maWcgZm9yIHBhc3MgZGVmYXVsdCBpbiBzZXJ2ZXIuanNvblxuXHQvL1x0KiBcblx0Ly9cblx0dmFyIHBhc3MgPSB0cnVlO1xuXG5cdC8vXHRBcHBseSBkZW55IGZpcnN0LCB0aGVuIGFsbG93LlxuXHRpZihwZXJtaXNzaW9ucyAmJiB1c2VyUm9sZXMpe1xuXHRcdGlmKHBlcm1pc3Npb25zLmRlbnkpIHtcblx0XHRcdHBhc3MgPSAhIGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuZGVueSk7XG5cdFx0fVxuXHRcdGlmKHBlcm1pc3Npb25zLmFsbG93KSB7XG5cdFx0XHRwYXNzID0gaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5hbGxvdyk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHBhc3M7XG59OyJdfQ==
