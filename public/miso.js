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
			//	TODO: Handle error
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
					DIV(
						INPUT({ type: "text", value: ctrl.model.username, placeholder: "Username"})
					),
					DIV(
						INPUT({ type: "password", value: ctrl.model.password})
					),
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
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */var m = require('mithril');var sugartags = require('mithril.sugartags')(m);var bindings = require('mithril.bindings')(m);var animate = require('../public/js/mithril.animate.js')(m);var permissions = require('../system/miso.permissions.js');var layout = require('../mvc/layout_miso.js');var restrict = function(route, actionName){	return route;},permissionObj = {};var user = require('../mvc/user.js');
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
},{"../mvc/doc.js":2,"../mvc/hello.js":3,"../mvc/home.js":4,"../mvc/layout_miso.js":5,"../mvc/login.js":6,"../mvc/todo.js":7,"../mvc/user.js":8,"../public/js/mithril.animate.js":14,"../system/miso.permissions.js":21,"mithril":11,"mithril.bindings":9,"mithril.sugartags":10}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL21pc28udXRpbC5jbGllbnQuanMiLCJtdmMvZG9jLmpzIiwibXZjL2hlbGxvLmpzIiwibXZjL2hvbWUuanMiLCJtdmMvbGF5b3V0X21pc28uanMiLCJtdmMvbG9naW4uanMiLCJtdmMvdG9kby5qcyIsIm12Yy91c2VyLmpzIiwibm9kZV9tb2R1bGVzL21pdGhyaWwuYmluZGluZ3MvZGlzdC9taXRocmlsLmJpbmRpbmdzLmpzIiwibm9kZV9tb2R1bGVzL21pdGhyaWwuc3VnYXJ0YWdzL21pdGhyaWwuc3VnYXJ0YWdzLmpzIiwibm9kZV9tb2R1bGVzL21pdGhyaWwvbWl0aHJpbC5qcyIsIm5vZGVfbW9kdWxlcy92YWxpZGF0b3IubW9kZWxiaW5kZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvdmFsaWRhdG9yL3ZhbGlkYXRvci5qcyIsInB1YmxpYy9qcy9taXRocmlsLmFuaW1hdGUuanMiLCJwdWJsaWMvanMvbWl0aHJpbC5zbW9vdGhzY3JvbGwuanMiLCJwdWJsaWMvbWlzby5kb2N1bWVudGF0aW9uLmpzIiwic3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzIiwic3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2FwaS5jbGllbnQuanMiLCJzeXN0ZW0vYXBpL3Nlc3Npb24vYXBpLmNsaWVudC5qcyIsInN5c3RlbS9tYWluLmpzIiwic3lzdGVtL21pc28ucGVybWlzc2lvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNodUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9cdFZhcmlvdXMgdXRpbGl0aWVzIHRoYXQgbm9ybWFsaXNlIHVzYWdlIGJldHdlZW4gY2xpZW50IGFuZCBzZXJ2ZXJcbi8vXHRUaGlzIGlzIHRoZSBjbGllbnQgdmVyc2lvbiAtIHNlZSBtaXNvLnV0aWwuanMgZm9yIHNlcnZlciB2ZXJzaW9uXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdC8vXHRBcmUgd2Ugb24gdGhlIHNlcnZlcj9cblx0aXNTZXJ2ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0XG5cdC8vXHRFYWNoIGFic3RyYWN0aW9uXG5cdC8vXHRcblx0Ly9cdG1pc28uZWFjaChbJ2hlbGxvJywgJ3dvcmxkJ10sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuXHQvL1x0XHRjb25zb2xlLmxvZyh2YWx1ZSwga2V5KTtcblx0Ly9cdH0pO1xuXHQvL1x0Ly9cdGhlbGxvIDBcXG5oZWxsbyAxXG5cdC8vXG5cdC8vIFx0bWlzby5lYWNoKHsnaGVsbG8nOiAnd29ybGQnfSwgZnVuY3Rpb24odmFsdWUsIGtleSl7XG5cdC8vXHRcdGNvbnNvbGUubG9nKHZhbHVlLCBrZXkpO1xuXHQvL1x0fSk7XG5cdC8vXHQvL1x0d29ybGQgaGVsbG9cblx0Ly9cblx0ZWFjaDogZnVuY3Rpb24ob2JqLCBmbikge1xuXHRcdGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nICkge1xuXHRcdFx0cmV0dXJuIG9iai5tYXAoZm4pO1xuXHRcdH0gZWxzZSBpZih0eXBlb2Ygb2JqID09ICdvYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXtcblx0XHRcdFx0cmV0dXJuIGZuKG9ialtrZXldLCBrZXkpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmbihvYmopO1xuXHRcdH1cblx0fSxcblxuXHRyZWFkeUJpbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgYmluZGluZ3MgPSBbXTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmluZDogZnVuY3Rpb24oY2IpIHtcblx0XHRcdFx0YmluZGluZ3MucHVzaChjYik7XG5cdFx0XHR9LFxuXHRcdFx0cmVhZHk6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGJpbmRpbmdzW2ldKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdC8vXHRHZXQgcGFyYW1ldGVycyBmb3IgYW4gYWN0aW9uXG5cdGdldFBhcmFtOiBmdW5jdGlvbihrZXksIHBhcmFtcywgZGVmKXtcblx0XHRyZXR1cm4gdHlwZW9mIG0ucm91dGUucGFyYW0oa2V5KSAhPT0gXCJ1bmRlZmluZWRcIj8gbS5yb3V0ZS5wYXJhbShrZXkpOiBkZWY7XG5cdH0sXG5cblx0Ly9cdEdldCBpbmZvIGZvciBhbiBhY3Rpb24gZnJvbSB0aGUgcGFyYW1zXG5cdHJvdXRlSW5mbzogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHQvKlxuXG5cdFx0XHRwYXRoOiByZXEucGF0aCxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblxuXHRcdCovXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdGg6IG0ucm91dGUoKSxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblx0XHR9XG5cdH1cbn07IiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHQvL1x0R3JhYiB0aGUgZ2VuZXJhdGVkIGNsaWVudCB2ZXJzaW9uLi4uXG5cdGRvY3MgPSByZXF1aXJlKCcuLi9wdWJsaWMvbWlzby5kb2N1bWVudGF0aW9uLmpzJyk7XG5cbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHQvL1x0T3VyIG1vZGVsXG5cdFx0ZG9jczogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLmRvY3MgPSBkYXRhLmRvY3M7XG5cdFx0XHR0aGlzLmlkID0gZGF0YS5pZDtcblx0XHRcdHRoaXMubmljZU5hbWUgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRcdFx0cmV0dXJuIG5hbWUuc3Vic3RyKDAsbmFtZS5sYXN0SW5kZXhPZihcIi5tZFwiKSkuc3BsaXQoXCItXCIpLmpvaW4oXCIgXCIpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmRvY3Moe1xuXHRcdFx0ZG9jczogZG9jcygpXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdERJVihcIkJlbG93IGlzIGEgbGlzdCBvZiBkb2N1bWVudGF0aW9uIGZvciBtaXNvOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdG1pc28uZWFjaChtb2RlbC5kb2NzLCBmdW5jdGlvbihkb2MsIGtleSl7XG5cdFx0XHRcdFx0XHQvL1x0U2tpcCBob21lIHBhZ2UuLi5cblx0XHRcdFx0XHRcdGlmKGtleSAhPT0gXCJIb21lLm1kXCIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIExJKFxuXHRcdFx0XHRcdFx0XHRcdEEoe2hyZWY6IFwiL2RvYy9cIiArIGtleSwgY29uZmlnOiBtLnJvdXRlfSwgbW9kZWwubmljZU5hbWUoa2V5KSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihcIkV4YW1wbGVzOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdExJKEEoe2hyZWY6IFwiL3RvZG9zXCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiVG9kb3MgZXhhbXBsZVwiKSksXG5cdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvdXNlcnNcIiwgY29uZmlnOiBtLnJvdXRlfSwgXCJVc2VycyBleGFtcGxlXCIpKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Ly9cdFVzZSBtYW51YWwgcHJpc20sIHNvIHRoYXQgaXQgd29ya3MgaW4gU1BBIG1vZGVcblx0XHRcdFx0U0NSSVBUKHtzcmM6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmpzXCIsIFwiZGF0YS1tYW51YWxcIjogXCJcIn0pXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGRvY19pZCA9IG1pc28uZ2V0UGFyYW0oJ2RvY19pZCcsIHBhcmFtcyk7XG5cdFx0dGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuZG9jcyh7XG5cdFx0XHRkb2NzOiBkb2NzKCksXG5cdFx0XHRpZDogZG9jX2lkXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdExJTksoe2hyZWY6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmNzc1wiLCByZWw6IFwic3R5bGVzaGVldFwifSksXG5cdFx0XHRcdEgxKG1vZGVsLm5pY2VOYW1lKG1vZGVsLmlkKSksXG5cdFx0XHRcdEFSVElDTEUobS50cnVzdChtb2RlbC5kb2NzW21vZGVsLmlkXSkpLFxuXHRcdFx0XHQvL1x0VXNlIG1hbnVhbCBwcmlzbSwgc28gdGhhdCBpdCB3b3JrcyBpbiBTUEEgbW9kZVxuXHRcdFx0XHRTQ1JJUFQoe3NyYzogXCIvZXh0ZXJuYWwvcHJpc20vcHJpc20uanNcIiwgXCJkYXRhLW1hbnVhbFwiOiBcIlwifSksXG5cdFx0XHRcdFNDUklQVChcIlByaXNtLmhpZ2hsaWdodEFsbCgpO1wiKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKTtcblxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xuXHRtb2RlbHM6IHtcblx0XHRoZWxsbzogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgnaGVsbG9faWQnLCBwYXJhbXMpO1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVihcIkcnZGF5IFwiICsgY3RybC5tb2RlbC53aG8oKSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRzbW9vdGhTY3JvbGwgPSByZXF1aXJlKCcuLi9wdWJsaWMvanMvbWl0aHJpbC5zbW9vdGhzY3JvbGwuanMnKTtcblxuLy9cdEhvbWUgcGFnZVxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0aW50cm86IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50ZXh0ID0gbS5wKFwiQ3JlYXRlIGFwcHMgaW4gYSBzbmFwIVwiKTtcblx0XHRcdHRoaXMuYW5pID0gbS5wKDApO1xuXHRcdFx0dGhpcy5kZW1vSW1nU3JjID0gbS5wKFwiaW1nL21pc29kZW1vLmdpZlwiKTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC5yZXBsYXkgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRtcFNyYyA9IGN0cmwubW9kZWwuZGVtb0ltZ1NyYygpO1xuXHRcdFx0Y3RybC5tb2RlbC5kZW1vSW1nU3JjKFwiXCIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRjdHJsLm1vZGVsLmRlbW9JbWdTcmModG1wU3JjKTtcblx0XHRcdH0sMCk7XG5cdFx0fTtcblxuXHRcdGN0cmwubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaW50cm8oKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKXtcblx0XHR2YXIgbyA9IGN0cmwubW9kZWw7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoW1xuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbnRyb1wifSwgW1xuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImludHJvVGV4dFwifSwgby50ZXh0KCkpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImRlbW9JbWdcIn0sIFtcblx0XHRcdFx0XHRcdElNRyh7aWQ6IFwiZGVtb0ltZ1wiLCBzcmM6IG8uZGVtb0ltZ1NyYygpfSksXG5cdFx0XHRcdFx0XHRTUEFOKHtcImNsYXNzXCI6IFwicmVwbGF5QnV0dG9uXCIsIG9uY2xpY2s6IGN0cmwucmVwbGF5fSwgXCJSZXBsYXlcIilcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiaW5zdGFsbEJ1dHRvblwiLCBjb25maWc6IHNtb290aFNjcm9sbChjdHJsKSwgaHJlZjogXCIjaW5zdGFsbGF0aW9uXCJ9LCBcIkluc3RhbGwgbWlzbyBub3dcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcIndoYXRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJXaGF0IGlzIG1pc28/XCIpICksXG5cdFx0XHRcdFx0UChcIk1pc28gaXMgYW4gb3BlbiBzb3VyY2UgaXNvbW9ycGhpYyBqYXZhc2NyaXB0IGZyYW1ld29yayB0aGF0IGFsbG93cyB5b3UgdG8gd3JpdGUgY29tcGxldGUgYXBwcyB3aXRoIG11Y2ggbGVzcyBlZmZvcnQgdGhhbiBvdGhlciBmcmFtZXdvcmtzLiBNaXNvIGZlYXR1cmVzOlwiLFtcblx0XHRcdFx0XHRcdFVMKHtcImNsYXNzXCI6IFwiZG90TGlzdFwifSwgW1xuXHRcdFx0XHRcdFx0XHRMSShcIlNpbmdsZSBwYWdlIGFwcHMgd2l0aCBzZXJ2ZXJzaWRlIHJlbmRlcmVkIEhUTUwgZm9yIHRoZSBmaXJzdCBwYWdlIC0gd29ya3MgcGVyZmVjdGx5IHdpdGggU0VPIGFuZCBvbGRlciBicm93c2Vyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJCZWF1dGlmdWwgVVJMcyAtIHdpdGggYSBmbGV4aWJsZSByb3V0aW5nIHN5c3RlbTogYXV0b21hdGUgc29tZSByb3V0ZXMsIHRha2UgZnVsbCBjb250cm9sIG9mIG90aGVyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJUaW55IGNsaWVudHNpZGUgZm9vdHByaW50IC0gbGVzcyB0aGFuIDI1a2IgKGd6aXBwZWQgYW5kIG1pbmlmaWVkKVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJGYXN0IGxpdmUtY29kZSByZWxvYWQgLSBzbWFydGVyIHJlbG9hZCB0byBoZWxwIHlvdSB3b3JrIGZhc3RlclwiKSxcblx0XHRcdFx0XHRcdFx0TEkoW1wiSGlnaCBwZXJmb3JtYW5jZSAtIHZpcnR1YWwgZG9tIGVuZ2luZSwgdGlueSBmb290cHJpbnQsIGZhc3RlciB0aGFuIHRoZSByZXN0XCIsIEEoe2hyZWY6IFwiaHR0cDovL2xob3JpZS5naXRodWIuaW8vbWl0aHJpbC9iZW5jaG1hcmtzLmh0bWxcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCIqXCIpXSksXG5cdFx0XHRcdFx0XHRcdExJKFwiTXVjaCBsZXNzIGNvZGUgLSBjcmVhdGUgYSBkZXBsb3lhYmxlIGFwcCBpbiBsZXNzIHRoYW4gMzAgbGluZXMgb2YgY29kZVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJPcGVuIHNvdXJjZSAtIE1JVCBsaWNlbnNlZFwiKVxuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRQKFwiTWlzbyB1dGlsaXNlcyBleGNlbGxlbnQgb3BlbiBzb3VyY2UgbGlicmFyaWVzIGFuZCBmcmFtZXdvcmtzIHRvIGNyZWF0ZSBhbiBleHRyZW1lbHkgZWZmaWNpZW50IGZ1bGwgd2ViIHN0YWNrLiBUaGVzZSBmcmFtZXdvcmtzIGluY2x1ZGU6XCIpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZyYW1ld29ya3NcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZ3Y29udGFpbmVyIGNmXCJ9LFtcblx0XHRcdFx0XHRcdFx0QSh7XCJjbGFzc1wiOiBcImZ3TGlua1wiLCBocmVmOiBcImh0dHA6Ly9saG9yaWUuZ2l0aHViLmlvL21pdGhyaWwvXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sXG5cdFx0XHRcdFx0XHRcdFNQQU4oe1wiY2xhc3NcIjogXCJmdyBtaXRocmlsXCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vZXhwcmVzc2pzLmNvbS9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgZXhwcmVzc1wifSkpLFxuXHRcdFx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiZndMaW5rXCIsIGhyZWY6IFwiaHR0cDovL2Jyb3dzZXJpZnkub3JnL1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LFNQQU4oe1wiY2xhc3NcIjogXCJmdyBicm93c2VyaWZ5XCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vbm9kZW1vbi5pby9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgbm9kZW1vblwifSkpXG5cdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImN3XCJ9LCBbXG5cdFx0XHRcdFx0SDIoe2lkOiBcImluc3RhbGxhdGlvblwifSwgQSh7bmFtZTogXCJpbnN0YWxsYXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJJbnN0YWxsYXRpb25cIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gaW5zdGFsbCBtaXNvLCB1c2UgbnBtOlwiKSxcblx0XHRcdFx0XHRQUkUoe1wiY2xhc3NcIjogXCJqYXZhc2NyaXB0XCJ9LFtcblx0XHRcdFx0XHRcdENPREUoXCJucG0gaW5zdGFsbCBtaXNvanMgLWdcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJjd1wifSwgW1xuXHRcdFx0XHRcdEgyKEEoe25hbWU6IFwiZ2V0dGluZ3N0YXJ0ZWRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJHZXR0aW5nIHN0YXJ0ZWRcIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gY3JlYXRlIGFuZCBydW4gYSBtaXNvIGFwcCBpbiBhIG5ldyBkaXJlY3Rvcnk6XCIpLFxuXHRcdFx0XHRcdFBSRSh7XCJjbGFzc1wiOiBcImphdmFzY3JpcHRcIn0sW1xuXHRcdFx0XHRcdFx0Q09ERShcIm1pc28gLW4gbXlBcHBcXG5jZCBteUFwcFxcbm1pc28gcnVuXCIpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0UChcIkNvbmdyYXR1bGF0aW9ucywgeW91IGFyZSBub3cgcnVubmluZyB5b3VyIHZlcnkgb3duIG1pc28gYXBwIGluIHRoZSAnbXlBcHAnIGRpcmVjdG9yeSFcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcImV4YW1wbGVzXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiRXhhbXBsZXNcIikpLFxuXHRcdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRcdExJKEEoeyBocmVmOiAnL3RvZG9zJywgY29uZmlnOiBtLnJvdXRlfSwgXCJUb2RvcyBleGFtcGxlIChzaW5nbGUgdXJsIFNQQSlcIikpLFxuXHRcdFx0XHRcdFx0TEkoQSh7IGhyZWY6ICcvdXNlcnMnLCBjb25maWc6IG0ucm91dGV9LCBcIlVzZXJzIGV4YW1wbGUgKG11bHRpcGxlIHVybCBTUEEpXCIpKVxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdEgyKHtuYW1lOiBcImRvY3VtZW50YXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sIFwiRG9jdW1lbnRhdGlvblwiKSxcblx0XHRcdFx0XHRBKHtocmVmOlwiL2RvY3NcIn0sIFwiRG9jdW1lbnRhdGlvbiBjYW4gYmUgZm91bmQgaGVyZVwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuIiwiLypcdE1pc28gbGF5b3V0IHBhZ2VcblxuXHRUaGlzIGxheW91dCBkZXRlcm1pbmVzIHRoZSBIVE1MIHN1cnJvdW5kIGZvciBlYWNoIG9mIHlvdXIgbXZjIHJvdXRlcy5cblx0RmVlbCBmcmVlIHRvIG1vZGlmeSBhcyB5b3Ugc2VlIGZpdCAtIGFzIGxvbmcgYXMgdGhlIGF0dGFjaGVtbnQgbm9kZSBpcyBcblx0cHJlc2VudCwgaXQgc2hvdWxkIHdvcmsuXG5cblx0Tm90ZTogdGhpcyBpcyB0aGUgb25seSBtdmMgdGhhdCBkb2VzIG5vdCByZXF1aXJlIGEgY29udHJvbGxlci5cbiovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YXV0aGVudGljYXRpb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG4vL1x0VGhlIGhlYWRlciAtIHRoaXMgY2FuIGFsc28gYmUgcmVuZGVyZWQgY2xpZW50IHNpZGVcbm1vZHVsZS5leHBvcnRzLmhlYWRlckNvbnRlbnQgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6ICdjdyBjZid9LCBbXG5cdFx0XHRESVYoe1wiY2xhc3NcIjogJ2xvZ28nfSxcblx0XHRcdFx0QSh7YWx0OiAnTUlTTycsIGhyZWY6Jy8nLCBjb25maWc6IG0ucm91dGV9LCBbXG5cdFx0XHRcdFx0SU1HKHtzcmM6ICcvaW1nL21pc29fbG9nby5wbmcnfSlcblx0XHRcdFx0XSlcblx0XHRcdCksXG5cdFx0XHROQVYoe1wiY2xhc3NcIjogXCJsZWZ0XCJ9LCBVTChbXG5cdFx0XHRcdExJKEEoe2hyZWY6IFwiaHR0cDovL21pc29qcy5jb20vZG9jc1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LCBcIkRvY3VtZW50YXRpb25cIikpXG5cdFx0XHRdKSksXG5cdFx0XHROQVYoe1wiY2xhc3NcIjogXCJyaWdodFwifSwgVUwoW1xuXHRcdFx0XHRMSShBKHtocmVmOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9qc2d1eS9taXNvanNcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCJHaXRodWJcIikpLFxuXHRcdFx0XHQvL1x0VGhpcyBsaW5rIGNvdWxkIGdvIHRvIGFuIGFjY291bnQgXG5cdFx0XHRcdC8vXHRwYWdlIG9yIHNvbWV0aGluZyBsaWtlIHRoYXRcblxuXHRcdFx0XHQoY3RybC5taXNvR2xvYmFsLmF1dGhlbnRpY2F0aW9uRW5hYmxlZD9cblx0XHRcdFx0XHQoY3RybC5taXNvR2xvYmFsLmlzTG9nZ2VkSW4gJiYgY3RybC5taXNvR2xvYmFsLnVzZXJOYW1lPyBcblx0XHRcdFx0XHRcdExJKEEoe29uY2xpY2s6IGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdsb2dnaW5nIG91dCwgcGxlYXNlIHdhaXQuLi4nKTtcblx0XHRcdFx0XHRcdFx0XHRhdXRoZW50aWNhdGlvbi5sb2dvdXQoe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIllvdSd2ZSBiZWVuIGxvZ2dlZCBvdXRcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRtLnJvdXRlKFwiL2xvZ2luXCIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fSwgaHJlZjogXCIjXCIsIGlkOiBcIm1pc29Vc2VyTmFtZVwifSxcblx0XHRcdFx0XHRcdFx0XCJMb2dvdXQgXCIgKyBjdHJsLm1pc29HbG9iYWwudXNlck5hbWUpXG5cdFx0XHRcdFx0XHQpOlxuXHRcdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvbG9naW5cIn0sIFwiTG9naW5cIikpXG5cdFx0XHRcdFx0KTogXG5cdFx0XHRcdFx0XCJcIlxuXHRcdFx0XHQpXG5cblx0XHRcdF0pKVxuXHRcdF0pO1xuXHR9XG59O1xuXG4vL1x0VGhlIGZ1bGwgbGF5b3V0IC0gYWx3YXlzIG9ubHkgcmVuZGVyZWQgc2VydmVyIHNpZGVcbm1vZHVsZS5leHBvcnRzLnZpZXcgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0bS50cnVzdChcIjwhZG9jdHlwZSBodG1sPlwiKSxcblx0XHRcdEhUTUwoW1xuXHRcdFx0XHRIRUFEKFtcblx0XHRcdFx0XHRMSU5LKHtocmVmOiAnL2Nzcy9zdHlsZS5jc3MnLCByZWw6J3N0eWxlc2hlZXQnfSksXG5cdFx0XHRcdFx0Ly9cdEFkZCBpbiB0aGUgbWlzb0dsb2JhbCBvYmplY3QuLi5cblx0XHRcdFx0XHRTQ1JJUFQoXCJ2YXIgbWlzb0dsb2JhbCA9IFwiKyhjdHJsLm1pc29HbG9iYWw/IEpTT04uc3RyaW5naWZ5KGN0cmwubWlzb0dsb2JhbCk6IHt9KStcIjtcIilcblx0XHRcdFx0XSksXG5cdFx0XHRcdEJPRFkoe1wiY2xhc3NcIjogJ2ZpeGVkLWhlYWRlcicgfSwgW1xuXHRcdFx0XHRcdEhFQURFUih7aWQ6IFwibWlzb0hlYWRlck5vZGVcIn0sIGN0cmwuaGVhZGVyQ29udGVudChjdHJsKSksXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IGN0cmwubWlzb0F0dGFjaG1lbnROb2RlfSwgY3RybC5jb250ZW50KSxcblx0XHRcdFx0XHRTRUNUSU9OKHtpZDogXCJsb2FkZXJcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImxvYWRlclwifSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRTRUNUSU9OKHtpZDogXCJmb290ZXJcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiAnY3cgY2YnfSwgbS50cnVzdChcIkNvcHlyaWdodCAmY29weTsgMjAxNSBqc2d1eVwiKSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHQvL1NDUklQVCh7c3JjOiAnL21pc28uanMnICsgKGN0cmwucmVsb2FkPyBcIj9jYWNoZUtleT1cIiArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk6IFwiXCIpfSksXG5cdFx0XHRcdFx0U0NSSVBUKHtzcmM6ICcvbWlzby5qcyd9KSxcblx0XHRcdFx0XHQoY3RybC5yZWxvYWQ/IFNDUklQVCh7c3JjOiAnL3JlbG9hZC5qcyd9KTogXCJcIilcblx0XHRcdFx0XSlcblx0XHRcdF0pXG5cdFx0XTtcblx0fVxufTsiLCIvKiBFeGFtcGxlIGxvZ2luIG12YyAqL1xudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRhdXRoZW50aWNhdGlvbiA9IHJlcXVpcmUoXCIuLi9zeXN0ZW0vYXBpL2F1dGhlbnRpY2F0aW9uL2FwaS5jbGllbnQuanNcIikobSksXG5cdHNlc3Npb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5jbGllbnQuanNcIikobSk7XG5cbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHRsb2dpbjogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLnVybCA9IGRhdGEudXJsO1xuXHRcdFx0dGhpcy5pc0xvZ2dlZEluID0gbS5wcm9wKGZhbHNlKTtcblx0XHRcdHRoaXMudXNlcm5hbWUgPSBtLnByb3AoZGF0YS51c2VybmFtZXx8XCJcIik7XG5cdFx0XHR0aGlzLnBhc3N3b3JkID0gbS5wcm9wKFwiXCIpO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzLFxuXHRcdFx0dXJsID0gbWlzby5nZXRQYXJhbSgndXJsJywgcGFyYW1zKSxcblx0XHRcdGxvZ291dCA9IG1pc28uZ2V0UGFyYW0oJ2xvZ291dCcsIHBhcmFtcyk7XG5cblx0XHRjdHJsLm1vZGVsID0gbmV3IGluZGV4Lm1vZGVscy5sb2dpbih7dXJsOiB1cmx9KTtcblxuXHRcdC8vXHROb3RlOiB0aGlzIGRvZXMgbm90IGV4ZWN1dGUgb24gdGhlIHNlcnZlciBhcyBpdCBcblx0XHQvL1x0aXMgYSBET00gZXZlbnQuXG5cdFx0Y3RybC5sb2dpbiA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Ly9cdENhbGwgdGhlIHNlcnZlciBtZXRob2QgdG8gc2VlIGlmIHdlJ3JlIGxvZ2dlZCBpblxuXHRcdFx0YXV0aGVudGljYXRpb24ubG9naW4oe3R5cGU6ICdsb2dpbi5pbmRleC5sb2dpbicsIG1vZGVsOiBjdHJsLm1vZGVsfSkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0aWYoZGF0YS5yZXN1bHQuaXNMb2dnZWRJbiA9PSB0cnVlKSB7XG5cdFx0XHRcdFx0Ly9cdFdvb3QsIHdlJ3JlIGluIVxuXHRcdFx0XHRcdG1pc29HbG9iYWwuaXNMb2dnZWRJbiA9IHRydWU7XG5cdFx0XHRcdFx0bWlzb0dsb2JhbC51c2VyTmFtZSA9IGRhdGEucmVzdWx0LnVzZXJOYW1lO1xuXHRcdFx0XHRcdGN0cmwubW9kZWwuaXNMb2dnZWRJbih0cnVlKTtcblxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiV2VsY29tZSBcIiArIG1pc29HbG9iYWwudXNlck5hbWUgKyBcIiwgeW91J3ZlIGJlZW4gbG9nZ2VkIGluXCIpO1xuXG5cdFx0XHRcdFx0Ly9cdFdpbGwgc2hvdyB0aGUgdXNlcm5hbWUgd2hlbiBsb2dnZWQgaW5cblx0XHRcdFx0XHRtaXNvR2xvYmFsLnJlbmRlckhlYWRlcigpO1xuXG5cdFx0XHRcdFx0aWYodXJsKXtcblx0XHRcdFx0XHRcdG0ucm91dGUodXJsKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly9cdEdvIHRvIGRlZmF1bHQgVVJMP1xuXHRcdFx0XHRcdFx0bS5yb3V0ZShcIi9cIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXG5cdFx0aWYobG9nb3V0KSB7XG5cdFx0XHQvL1x0VE9ETzogSGFuZGxlIGVycm9yXG5cdFx0XHRhdXRoZW50aWNhdGlvbi5sb2dvdXQoe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiWW91J3ZlIGJlZW4gbG9nZ2VkIG91dFwiKTtcblx0XHRcdFx0Ly9cdFdvb3QsIHdlJ3JlIG91dCFcblx0XHRcdFx0Y3RybC5tb2RlbC5pc0xvZ2dlZEluKGZhbHNlKTtcblx0XHRcdFx0Ly8gbWlzb0dsb2JhbC5pc0xvZ2dlZEluID0gZmFsc2U7XG5cdFx0XHRcdC8vIGRlbGV0ZSBtaXNvR2xvYmFsLnVzZXJOYW1lO1xuXHRcdFx0XHQvL1x0V2lsbCByZW1vdmUgdGhlIHVzZXJuYW1lIHdoZW4gbG9nZ2VkIG91dFxuXHRcdFx0XHRtaXNvR2xvYmFsLnJlbmRlckhlYWRlcigpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiBcImN3IGNmXCJ9LCBcblx0XHRcdFx0Y3RybC5tb2RlbC5pc0xvZ2dlZEluKCk/IFwiWW91J3ZlIGJlZW4gbG9nZ2VkIGluXCI6IFtcblx0XHRcdFx0RElWKGN0cmwubW9kZWwudXJsPyBcIlBsZWFzZSBsb2cgaW4gdG8gZ28gdG8gXCIgKyBjdHJsLm1vZGVsLnVybDogXCJQbGVhc2UgbG9nIGluXCIpLFxuXHRcdFx0XHRGT1JNKHsgb25zdWJtaXQ6IGN0cmwubG9naW4gfSwgW1xuXHRcdFx0XHRcdERJVihcblx0XHRcdFx0XHRcdElOUFVUKHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBjdHJsLm1vZGVsLnVzZXJuYW1lLCBwbGFjZWhvbGRlcjogXCJVc2VybmFtZVwifSlcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdERJVihcblx0XHRcdFx0XHRcdElOUFVUKHsgdHlwZTogXCJwYXNzd29yZFwiLCB2YWx1ZTogY3RybC5tb2RlbC5wYXNzd29yZH0pXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRCVVRUT04oeyB0eXBlOiBcInN1Ym1pdFwifSwgXCJMb2dpblwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9LFxuXHRhdXRoZW50aWNhdGU6IGZhbHNlXG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRkYiA9IHJlcXVpcmUoXCIuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLmNsaWVudC5qc1wiKShtKTtcblxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0dG9kbzogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLnRleHQgPSBkYXRhLnRleHQ7XG5cdFx0XHR0aGlzLmRvbmUgPSBtLnByb3AoZGF0YS5kb25lID09IFwiZmFsc2VcIj8gZmFsc2U6IGRhdGEuZG9uZSk7XG5cdFx0XHR0aGlzLl9pZCA9IGRhdGEuX2lkO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC5saXN0ID0gW107XG5cblx0XHRkYi5maW5kKHt0eXBlOiAndG9kby5pbmRleC50b2RvJ30sIHtiYWNrZ3JvdW5kOiB0cnVlLCBpbml0aWFsVmFsdWU6IFtdfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8oZGF0YS5yZXN1bHRba2V5XSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0dmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xuXHRcdFx0aWYodmFsdWUpIHtcblx0XHRcdFx0dmFyIG5ld1RvZG8gPSBuZXcgc2VsZi5tb2RlbHMudG9kbyh7XG5cdFx0XHRcdFx0dGV4dDogY3RybC52bS5pbnB1dCgpLFxuXHRcdFx0XHRcdGRvbmU6IGZhbHNlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcblx0XHRcdFx0Y3RybC52bS5pbnB1dChcIlwiKTtcblx0XHRcdFx0ZGIuc2F2ZSh7IHR5cGU6ICd0b2RvLmluZGV4LnRvZG8nLCBtb2RlbDogbmV3VG9kbyB9ICkudGhlbihmdW5jdGlvbihyZXMpe1xuXHRcdFx0XHRcdG5ld1RvZG8uX2lkID0gcmVzLnJlc3VsdDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblxuXHRcdGN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgbGlzdCA9IFtdO1xuXHRcdFx0Y3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XG5cdFx0XHRcdGlmKCF0b2RvLmRvbmUoKSkge1xuXHRcdFx0XHRcdGxpc3QucHVzaCh0b2RvKTsgXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZGIucmVtb3ZlKHsgdHlwZTogJ3RvZG8uaW5kZXgudG9kbycsIF9pZDogdG9kby5faWQgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5yZXN1bHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGN0cmwubGlzdCA9IGxpc3Q7XG5cdFx0fTtcblxuXHRcdGN0cmwudm0gPSB7XG5cdFx0XHRsZWZ0OiBmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgY291bnQgPSAwO1xuXHRcdFx0XHRjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcblx0XHRcdFx0XHRjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIGNvdW50O1xuXHRcdFx0fSxcblx0XHRcdGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dG9kby5kb25lKCF0b2RvLmRvbmUoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRpbnB1dDogbS5wcm9wKFwiXCIpXG5cdFx0fTtcblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoe1wiY2xhc3NcIjogXCJjdyBjZlwifSwgW1xuXHRcdFx0XHRTVFlMRShcIi5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO31cIiksXG5cdFx0XHRcdEgxKFwiVG9kb3MgLSBcIiArIGN0cmwudm0ubGVmdCgpICsgXCIgb2YgXCIgKyBjdHJsLmxpc3QubGVuZ3RoICsgXCIgcmVtYWluaW5nXCIpLFxuXHRcdFx0XHRCVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgXCJBcmNoaXZlXCIpLFxuXHRcdFx0XHRVTChbXG5cdFx0XHRcdFx0Y3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcblx0XHRcdFx0XHRcdHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gXCJkb25lXCI6IFwiXCIsIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRGT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXG5cdFx0XHRcdFx0SU5QVVQoeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiBcIkFkZCB0b2RvXCJ9KSxcblx0XHRcdFx0XHRCVVRUT04oeyB0eXBlOiBcInN1Ym1pdFwifSwgXCJBZGRcIilcblx0XHRcdFx0XSlcblx0XHRcdF0pO1xuXHRcdH1cblx0fVxuXHQvL1x0VGVzdCBhdXRoZW50aWNhdGVcblx0Ly8sYXV0aGVudGljYXRlOiB0cnVlXG59OyIsIi8qXG5cdFRoaXMgaXMgYSBzYW1wbGUgdXNlciBtYW5hZ2VtZW50IGFwcCB0aGF0IHVzZXMgdGhlXG5cdG11bHRpcGxlIHVybCBtaXNvIHBhdHRlcm4uXG4qL1xudmFyIG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHR2YWxpZGF0ZSA9IHJlcXVpcmUoJ3ZhbGlkYXRvci5tb2RlbGJpbmRlcicpLFxuXHRtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRiaW5kaW5ncyA9IHJlcXVpcmUoJ21pdGhyaWwuYmluZGluZ3MnKShtKSxcblx0YXBpID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qc1wiKShtKSxcblx0c2VsZiA9IG1vZHVsZS5leHBvcnRzO1xuXG4vL1x0U2hhcmVkIHZpZXdcbnZhciBlZGl0VmlldyA9IGZ1bmN0aW9uKGN0cmwpe1xuXHR3aXRoKHN1Z2FydGFncykge1xuXHRcdHJldHVybiBESVYoeyBjbGFzczogXCJjd1wiIH0sIFtcblx0XHRcdEgyKHtcImNsYXNzXCI6IFwicGFnZUhlYWRlclwifSwgY3RybC5oZWFkZXIpLFxuXHRcdFx0Y3RybC51c2VyID8gW1xuXHRcdFx0XHRESVYoW1xuXHRcdFx0XHRcdExBQkVMKFwiTmFtZVwiKSwgSU5QVVQoe3ZhbHVlOiBjdHJsLnVzZXIubmFtZX0pLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiAoY3RybC51c2VyLmlzVmFsaWQoJ25hbWUnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwidmFsaWRcIjogXCJpbnZhbGlkXCIpICsgXCIgaW5kZW50ZWRcIn0sIFtcblx0XHRcdFx0XHRcdGN0cmwudXNlci5pc1ZhbGlkKCduYW1lJykgPT0gdHJ1ZSB8fCAhY3RybC5zaG93RXJyb3JzPyBcIlwiOiBjdHJsLnVzZXIuaXNWYWxpZCgnbmFtZScpLmpvaW4oXCIsIFwiKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoW1xuXHRcdFx0XHRcdExBQkVMKFwiRW1haWxcIiksIElOUFVUKHt2YWx1ZTogY3RybC51c2VyLmVtYWlsfSksXG5cdFx0XHRcdFx0RElWKHtcImNsYXNzXCI6IChjdHJsLnVzZXIuaXNWYWxpZCgnZW1haWwnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwidmFsaWRcIjogXCJpbnZhbGlkXCIpICsgXCIgaW5kZW50ZWRcIiB9LCBbXG5cdFx0XHRcdFx0XHRjdHJsLnVzZXIuaXNWYWxpZCgnZW1haWwnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwiXCI6IGN0cmwudXNlci5pc1ZhbGlkKCdlbWFpbCcpLmpvaW4oXCIsIFwiKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoW1xuXHRcdFx0XHRcdExBQkVMKFwiUGFzc3dvcmRcIiksIElOUFVUKHt2YWx1ZTogY3RybC51c2VyLnBhc3N3b3JkLCB0eXBlOiAncGFzc3dvcmQnfSksXG5cdFx0XHRcdFx0RElWKHtcImNsYXNzXCI6IChjdHJsLnVzZXIuaXNWYWxpZCgncGFzc3dvcmQnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwidmFsaWRcIjogXCJpbnZhbGlkXCIpICsgXCIgaW5kZW50ZWRcIiB9LCBbXG5cdFx0XHRcdFx0XHRjdHJsLnVzZXIuaXNWYWxpZCgncGFzc3dvcmQnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwiXCI6IGN0cmwudXNlci5pc1ZhbGlkKCdwYXNzd29yZCcpLmpvaW4oXCIsIFwiKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbmRlbnRlZFwifSxbXG5cdFx0XHRcdFx0QlVUVE9OKHtvbmNsaWNrOiBjdHJsLnNhdmUsIGNsYXNzOiBcInBvc2l0aXZlXCJ9LCBcIlNhdmUgdXNlclwiKSxcblx0XHRcdFx0XHRCVVRUT04oe29uY2xpY2s6IGN0cmwucmVtb3ZlLCBjbGFzczogXCJuZWdhdGl2ZVwifSwgXCJEZWxldGUgdXNlclwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XTogRElWKFwiVXNlciBub3QgZm91bmRcIilcblx0XHRdKTtcblx0fVxufTtcblxuXG4vL1x0VXNlciBsaXN0XG5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC52bSA9IHtcblx0XHRcdHVzZXJMaXN0OiBmdW5jdGlvbih1c2Vycyl7XG5cdFx0XHRcdHRoaXMudXNlcnMgPSBtLnAodXNlcnMpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRhcGkuZmluZFVzZXJzKHt0eXBlOiAndXNlci5lZGl0LnVzZXInfSkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRpZihkYXRhLmVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgXCIgKyBkYXRhLmVycm9yKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoZGF0YS5yZXN1bHQpIHtcblx0XHRcdFx0dmFyIGxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiBuZXcgc2VsZi5lZGl0Lm1vZGVscy51c2VyKGRhdGEucmVzdWx0W2tleV0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjdHJsLnVzZXJzID0gbmV3IGN0cmwudm0udXNlckxpc3QobGlzdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdHJsLnVzZXJzID0gbmV3IGN0cmwudm0udXNlckxpc3QoW10pO1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3InLCBhcmd1bWVudHMpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuXHRcdHZhciBjID0gY3RybCxcblx0XHRcdHUgPSBjLnVzZXJzO1xuXG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoeyBjbGFzczogXCJjd1wiIH0sIFtcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdHUudXNlcnMoKS5tYXAoZnVuY3Rpb24odXNlciwgaWR4KXtcblx0XHRcdFx0XHRcdHJldHVybiBMSShBKHsgaHJlZjogJy91c2VyLycgKyB1c2VyLmlkKCksIGNvbmZpZzogbS5yb3V0ZX0sIHVzZXIubmFtZSgpICsgXCIgLSBcIiArIHVzZXIuZW1haWwoKSkpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRBKHtcImNsYXNzXCI6XCJidXR0b24gcG9zaXRpdmUgbXRvcFwiLCBocmVmOlwiL3VzZXJzL25ld1wiLCBjb25maWc6IG0ucm91dGV9LCBcIkFkZCBuZXcgdXNlclwiKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuXG5cbi8vXHROZXcgdXNlclxubW9kdWxlLmV4cG9ydHMubmV3ID0ge1xuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXM7XG5cdFx0Y3RybC51c2VyID0gbmV3IHNlbGYuZWRpdC5tb2RlbHMudXNlcih7bmFtZTogXCJcIiwgZW1haWw6IFwiXCJ9KTtcblx0XHRjdHJsLmhlYWRlciA9IFwiTmV3IHVzZXJcIjtcblx0XHRjdHJsLnNob3dFcnJvcnMgPSBmYWxzZTtcblxuXHRcdGN0cmwuc2F2ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjdHJsLnVzZXIuaXNWYWxpZCgpICE9PSB0cnVlKSB7XG5cdFx0XHRcdGN0cmwuc2hvd0Vycm9ycyA9IHRydWU7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdVc2VyIGlzIG5vdCB2YWxpZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXBpLnNhdmVVc2VyKHsgdHlwZTogJ3VzZXIuZWRpdC51c2VyJywgbW9kZWw6IGN0cmwudXNlciB9ICkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiQWRkZWQgdXNlclwiLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdG0ucm91dGUoXCIvdXNlcnNcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gY3RybDtcblx0fSxcblx0dmlldzogZWRpdFZpZXdcbn07XG5cblxuLy9cdEVkaXQgdXNlclxubW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0dXNlcjogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLm5hbWUgPSBtLnAoZGF0YS5uYW1lfHxcIlwiKTtcblx0XHRcdHRoaXMuZW1haWwgPSBtLnAoZGF0YS5lbWFpbHx8XCJcIik7XG5cdFx0XHQvL1x0UGFzc3dvcmQgaXMgYWx3YXlzIGVtcHR5IGZpcnN0XG5cdFx0XHR0aGlzLnBhc3N3b3JkID0gbS5wKGRhdGEucGFzc3dvcmR8fFwiXCIpO1xuXHRcdFx0dGhpcy5pZCA9IG0ucChkYXRhLl9pZHx8XCJcIik7XG5cblx0XHRcdC8vXHRWYWxpZGF0ZSB0aGUgbW9kZWxcblx0XHRcdHRoaXMuaXNWYWxpZCA9IHZhbGlkYXRlLmJpbmQodGhpcywge1xuXHRcdFx0XHRuYW1lOiB7XG5cdFx0XHRcdFx0aXNSZXF1aXJlZDogXCJZb3UgbXVzdCBlbnRlciBhIG5hbWVcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwYXNzd29yZDoge1xuXHRcdFx0XHRcdGlzUmVxdWlyZWQ6IFwiWW91IG11c3QgZW50ZXIgYSBwYXNzd29yZFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0aXNSZXF1aXJlZDogXCJZb3UgbXVzdCBlbnRlciBhbiBlbWFpbCBhZGRyZXNzXCIsXG5cdFx0XHRcdFx0aXNFbWFpbDogXCJNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcyxcblx0XHRcdHVzZXJJZCA9IG1pc28uZ2V0UGFyYW0oJ3VzZXJfaWQnLCBwYXJhbXMpO1xuXG5cdFx0Y3RybC5oZWFkZXIgPSBcIkVkaXQgdXNlciBcIiArIHVzZXJJZDtcblxuXHRcdC8vXHRMb2FkIG91ciB1c2VyXG5cdFx0YXBpLmZpbmRVc2Vycyh7dHlwZTogJ3VzZXIuZWRpdC51c2VyJywgcXVlcnk6IHtfaWQ6IHVzZXJJZH19KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZhciB1c2VyID0gZGF0YS5yZXN1bHQ7XG5cdFx0XHRpZih1c2VyICYmIHVzZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjdHJsLnVzZXIgPSBuZXcgc2VsZi5lZGl0Lm1vZGVscy51c2VyKHVzZXJbMF0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgbm90IGZvdW5kJywgdXNlcklkKTtcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbigpe1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yJywgYXJndW1lbnRzKTtcblx0XHR9KTtcblxuXHRcdGN0cmwuc2F2ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjdHJsLnVzZXIuaXNWYWxpZCgpICE9PSB0cnVlKSB7XG5cdFx0XHRcdGN0cmwuc2hvd0Vycm9ycyA9IHRydWU7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdVc2VyIGlzIG5vdCB2YWxpZCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXBpLnNhdmVVc2VyKHsgdHlwZTogJ3VzZXIuZWRpdC51c2VyJywgbW9kZWw6IGN0cmwudXNlciB9ICkudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiU2F2ZWQgdXNlclwiLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdG0ucm91dGUoXCIvdXNlcnNcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRjdHJsLnJlbW92ZSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRpZihjb25maXJtKFwiRGVsZXRlIHVzZXI/XCIpKSB7XG5cdFx0XHRcdGFwaS5yZW1vdmUoeyB0eXBlOiAndXNlci5lZGl0LnVzZXInLCBfaWQ6IHVzZXJJZCB9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEucmVzdWx0KTtcblx0XHRcdFx0XHRtLnJvdXRlKFwiL3VzZXJzXCIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGVkaXRWaWV3XG5cdC8vXHRBbnkgYXV0aGVudGljYXRpb24gaW5mb1xuXHQvLywgYXV0aGVudGljYXRlOiB0cnVlXG59O1xuIiwiLy9cdE1pdGhyaWwgYmluZGluZ3MuXG4vL1x0Q29weXJpZ2h0IChDKSAyMDE0IGpzZ3V5IChNaWtrZWwgQmVyZ21hbm4pXG4vL1x0TUlUIGxpY2Vuc2VkXG4oZnVuY3Rpb24oKXtcbnZhciBtaXRocmlsQmluZGluZ3MgPSBmdW5jdGlvbihtKXtcblx0bS5iaW5kaW5ncyA9IG0uYmluZGluZ3MgfHwge307XG5cblx0Ly9cdFB1Yi9TdWIgYmFzZWQgZXh0ZW5kZWQgcHJvcGVydGllc1xuXHRtLnAgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdHN1YnMgPSBbXSxcblx0XHRcdHByZXZWYWx1ZSxcblx0XHRcdGRlbGF5ID0gZmFsc2UsXG5cdFx0XHQvLyAgU2VuZCBub3RpZmljYXRpb25zIHRvIHN1YnNjcmliZXJzXG5cdFx0XHRub3RpZnkgPSBmdW5jdGlvbiAodmFsdWUsIHByZXZWYWx1ZSkge1xuXHRcdFx0XHR2YXIgaTtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IHN1YnMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRzdWJzW2ldLmZ1bmMuYXBwbHkoc3Vic1tpXS5jb250ZXh0LCBbdmFsdWUsIHByZXZWYWx1ZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cHJvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHZhbHVlID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0XHRcdGlmIChwcmV2VmFsdWUgIT09IHZhbHVlKSB7XG5cdFx0XHRcdFx0XHR2YXIgdG1wUHJldiA9IHByZXZWYWx1ZTtcblx0XHRcdFx0XHRcdHByZXZWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0bm90aWZ5KHZhbHVlLCB0bXBQcmV2KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fTtcblxuXHRcdC8vXHRBbGxvdyBwdXNoIG9uIGFycmF5c1xuXHRcdHByb3AucHVzaCA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0aWYodmFsdWUucHVzaCAmJiB0eXBlb2YgdmFsdWUubGVuZ3RoICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHZhbHVlLnB1c2godmFsKTtcblx0XHRcdH1cblx0XHRcdHByb3AodmFsdWUpO1xuXHRcdH07XG5cblx0XHQvL1x0U3Vic2NyaWJlIGZvciB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzXG5cdFx0cHJvcC5zdWJzY3JpYmUgPSBmdW5jdGlvbiAoZnVuYywgY29udGV4dCkge1xuXHRcdFx0c3Vicy5wdXNoKHsgZnVuYzogZnVuYywgY29udGV4dDogY29udGV4dCB8fCBzZWxmIH0pO1xuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fTtcblxuXHRcdC8vXHRBbGxvdyBwcm9wZXJ0eSB0byBub3QgYXV0b21hdGljYWxseSByZW5kZXJcblx0XHRwcm9wLmRlbGF5ID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdGRlbGF5ID0gISF2YWx1ZTtcblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH07XG5cblx0XHQvL1x0QXV0b21hdGljYWxseSB1cGRhdGUgcmVuZGVyaW5nIHdoZW4gYSB2YWx1ZSBjaGFuZ2VzXG5cdFx0Ly9cdEFzIG1pdGhyaWwgd2FpdHMgZm9yIGEgcmVxdWVzdCBhbmltYXRpb24gZnJhbWUsIHRoaXMgc2hvdWxkIGJlIG9rLlxuXHRcdC8vXHRZb3UgY2FuIHVzZSAuZGVsYXkodHJ1ZSkgdG8gYmUgYWJsZSB0byBtYW51YWxseSBoYW5kbGUgdXBkYXRlc1xuXHRcdHByb3Auc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbCl7XG5cdFx0XHRpZighZGVsYXkpIHtcblx0XHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XG5cdFx0XHRcdG0uZW5kQ29tcHV0YXRpb24oKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHByb3A7XG5cdH07XG5cblx0Ly9cdEVsZW1lbnQgZnVuY3Rpb24gdGhhdCBhcHBsaWVzIG91ciBleHRlbmRlZCBiaW5kaW5nc1xuXHQvL1x0Tm90ZTogXG5cdC8vXHRcdC4gU29tZSBhdHRyaWJ1dGVzIGNhbiBiZSByZW1vdmVkIHdoZW4gYXBwbGllZCwgZWc6IGN1c3RvbSBhdHRyaWJ1dGVzXG5cdC8vXHRcblx0bS5lID0gZnVuY3Rpb24oZWxlbWVudCwgYXR0cnMsIGNoaWxkcmVuKSB7XG5cdFx0Zm9yICh2YXIgbmFtZSBpbiBhdHRycykge1xuXHRcdFx0aWYgKG0uYmluZGluZ3NbbmFtZV0pIHtcblx0XHRcdFx0bS5iaW5kaW5nc1tuYW1lXS5mdW5jLmFwcGx5KGF0dHJzLCBbYXR0cnNbbmFtZV1dKTtcblx0XHRcdFx0aWYobS5iaW5kaW5nc1tuYW1lXS5yZW1vdmVhYmxlKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIGF0dHJzW25hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBtKGVsZW1lbnQsIGF0dHJzLCBjaGlsZHJlbik7XG5cdH07XG5cblx0Ly9cdEFkZCBiaW5kaW5ncyBtZXRob2Rcblx0Ly9cdE5vbi1zdGFuZGFyZCBhdHRyaWJ1dGVzIGRvIG5vdCBuZWVkIHRvIGJlIHJlbmRlcmVkLCBlZzogdmFsdWVJbnB1dFxuXHQvL1x0c28gdGhleSBhcmUgc2V0IGFzIHJlbW92YWJsZVxuXHRtLmFkZEJpbmRpbmcgPSBmdW5jdGlvbihuYW1lLCBmdW5jLCByZW1vdmVhYmxlKXtcblx0XHRtLmJpbmRpbmdzW25hbWVdID0ge1xuXHRcdFx0ZnVuYzogZnVuYyxcblx0XHRcdHJlbW92ZWFibGU6IHJlbW92ZWFibGVcblx0XHR9O1xuXHR9O1xuXG5cdC8vXHRHZXQgdGhlIHVuZGVybHlpbmcgdmFsdWUgb2YgYSBwcm9wZXJ0eVxuXHRtLnVud3JhcCA9IGZ1bmN0aW9uKHByb3ApIHtcblx0XHRyZXR1cm4gKHR5cGVvZiBwcm9wID09IFwiZnVuY3Rpb25cIik/IHByb3AoKTogcHJvcDtcblx0fTtcblxuXHQvL1x0QmktZGlyZWN0aW9uYWwgYmluZGluZyBvZiB2YWx1ZVxuXHRtLmFkZEJpbmRpbmcoXCJ2YWx1ZVwiLCBmdW5jdGlvbihwcm9wKSB7XG5cdFx0aWYgKHR5cGVvZiBwcm9wID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0dGhpcy52YWx1ZSA9IHByb3AoKTtcblx0XHRcdHRoaXMub25jaGFuZ2UgPSBtLndpdGhBdHRyKFwidmFsdWVcIiwgcHJvcCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudmFsdWUgPSBwcm9wO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9cdEJpLWRpcmVjdGlvbmFsIGJpbmRpbmcgb2YgY2hlY2tlZCBwcm9wZXJ0eVxuXHRtLmFkZEJpbmRpbmcoXCJjaGVja2VkXCIsIGZ1bmN0aW9uKHByb3ApIHtcblx0XHRpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aGlzLmNoZWNrZWQgPSBwcm9wKCk7XG5cdFx0XHR0aGlzLm9uY2hhbmdlID0gbS53aXRoQXR0cihcImNoZWNrZWRcIiwgcHJvcCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2hlY2tlZCA9IHByb3A7XG5cdFx0fVxuXHR9KTtcblxuXHQvL1x0SGlkZSBub2RlXG5cdG0uYWRkQmluZGluZyhcImhpZGVcIiwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5zdHlsZSA9IHtcblx0XHRcdGRpc3BsYXk6IG0udW53cmFwKHByb3ApPyBcIm5vbmVcIiA6IFwiXCJcblx0XHR9O1xuXHR9LCB0cnVlKTtcblxuXHQvL1x0VG9nZ2xlIHZhbHVlKHMpIG9uIGNsaWNrXG5cdG0uYWRkQmluZGluZygndG9nZ2xlJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbmNsaWNrID0gZnVuY3Rpb24oKXtcblx0XHRcdC8vXHRUb2dnbGUgYWxsb3dzIGFuIGVudW0gbGlzdCB0byBiZSB0b2dnbGVkLCBlZzogW3Byb3AsIHZhbHVlMiwgdmFsdWUyXVxuXHRcdFx0dmFyIGlzRnVuYyA9IHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nLCB0bXAsIGksIHZhbHMgPSBbXSwgdmFsLCB0VmFsO1xuXG5cdFx0XHQvL1x0VG9nZ2xlIGJvb2xlYW5cblx0XHRcdGlmKGlzRnVuYykge1xuXHRcdFx0XHR2YWx1ZSA9IHByb3AoKTtcblx0XHRcdFx0cHJvcCghdmFsdWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9cdFRvZ2dsZSBlbnVtZXJhdGlvblxuXHRcdFx0XHR0bXAgPSBwcm9wWzBdO1xuXHRcdFx0XHR2YWwgPSB0bXAoKTtcblx0XHRcdFx0dmFscyA9IHByb3Auc2xpY2UoMSk7XG5cdFx0XHRcdHRWYWwgPSB2YWxzWzBdO1xuXG5cdFx0XHRcdGZvcihpID0gMDsgaSA8IHZhbHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRpZih2YWwgPT0gdmFsc1tpXSkge1xuXHRcdFx0XHRcdFx0aWYodHlwZW9mIHZhbHNbaSsxXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdFx0dFZhbCA9IHZhbHNbaSsxXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0bXAodFZhbCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFNldCBob3ZlciBzdGF0ZXMsIGEnbGEgalF1ZXJ5IHBhdHRlcm5cblx0bS5hZGRCaW5kaW5nKCdob3ZlcicsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMub25tb3VzZW92ZXIgPSBwcm9wWzBdO1xuXHRcdGlmKHByb3BbMV0pIHtcblx0XHRcdHRoaXMub25tb3VzZW91dCA9IHByb3BbMV07XG5cdFx0fVxuXHR9LCB0cnVlICk7XG5cblx0Ly9cdEFkZCB2YWx1ZSBiaW5kaW5ncyBmb3IgdmFyaW91cyBldmVudCB0eXBlcyBcblx0dmFyIGV2ZW50cyA9IFtcIklucHV0XCIsIFwiS2V5dXBcIiwgXCJLZXlwcmVzc1wiXSxcblx0XHRjcmVhdGVCaW5kaW5nID0gZnVuY3Rpb24obmFtZSwgZXZlKXtcblx0XHRcdC8vXHRCaS1kaXJlY3Rpb25hbCBiaW5kaW5nIG9mIHZhbHVlXG5cdFx0XHRtLmFkZEJpbmRpbmcobmFtZSwgZnVuY3Rpb24ocHJvcCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IHByb3AoKTtcblx0XHRcdFx0XHR0aGlzW2V2ZV0gPSBtLndpdGhBdHRyKFwidmFsdWVcIiwgcHJvcCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IHByb3A7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRydWUpO1xuXHRcdH07XG5cblx0Zm9yKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdHZhciBldmUgPSBldmVudHNbaV07XG5cdFx0Y3JlYXRlQmluZGluZyhcInZhbHVlXCIgKyBldmUsIFwib25cIiArIGV2ZS50b0xvd2VyQ2FzZSgpKTtcblx0fVxuXG5cblx0Ly9cdFNldCBhIHZhbHVlIG9uIGEgcHJvcGVydHlcblx0bS5zZXQgPSBmdW5jdGlvbihwcm9wLCB2YWx1ZSl7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0cHJvcCh2YWx1ZSk7XG5cdFx0fTtcblx0fTtcblxuXHQvKlx0UmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgY2FuIHRyaWdnZXIgYSBiaW5kaW5nIFxuXHRcdFVzYWdlOiBvbmNsaWNrOiBtLnRyaWdnZXIoJ2JpbmRpbmcnLCBwcm9wKVxuXHQqL1xuXHRtLnRyaWdnZXIgPSBmdW5jdGlvbigpe1xuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBuYW1lID0gYXJnc1swXSxcblx0XHRcdFx0YXJnTGlzdCA9IGFyZ3Muc2xpY2UoMSk7XG5cdFx0XHRpZiAobS5iaW5kaW5nc1tuYW1lXSkge1xuXHRcdFx0XHRtLmJpbmRpbmdzW25hbWVdLmZ1bmMuYXBwbHkodGhpcywgYXJnTGlzdCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4gbS5iaW5kaW5ncztcbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gbWl0aHJpbEJpbmRpbmdzO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1pdGhyaWxCaW5kaW5ncztcblx0fSk7XG59IGVsc2Uge1xuXHRtaXRocmlsQmluZGluZ3ModHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3cubSB8fCB7fToge30pO1xufVxuXG59KCkpOyIsIi8vXHRNaXRocmlsIHN1Z2FyIHRhZ3MuXG4vL1x0Q29weXJpZ2h0IChDKSAyMDE1IGpzZ3V5IChNaWtrZWwgQmVyZ21hbm4pXG4vL1x0TUlUIGxpY2Vuc2VkXG4oZnVuY3Rpb24oKXtcbnZhciBtaXRocmlsU3VnYXJ0YWdzID0gZnVuY3Rpb24obSwgc2NvcGUpe1xuXHRtLnN1Z2FyVGFncyA9IG0uc3VnYXJUYWdzIHx8IHt9O1xuXHRzY29wZSA9IHNjb3BlIHx8IG07XG5cblx0dmFyIGFyZyA9IGZ1bmN0aW9uKGwxLCBsMil7XG5cdFx0XHR2YXIgaTtcblx0XHRcdGZvciAoaSBpbiBsMikge2lmKGwyLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdGwxLnB1c2gobDJbaV0pO1xuXHRcdFx0fX1cblx0XHRcdHJldHVybiBsMTtcblx0XHR9LCBcblx0XHRnZXRDbGFzc0xpc3QgPSBmdW5jdGlvbihhcmdzKXtcblx0XHRcdHZhciBpLCByZXN1bHQ7XG5cdFx0XHRmb3IoaSBpbiBhcmdzKSB7XG5cdFx0XHRcdGlmKGFyZ3NbaV0gJiYgYXJnc1tpXS5jbGFzcykge1xuXHRcdFx0XHRcdHJldHVybiB0eXBlb2YgKGFyZ3NbaV0uY2xhc3MgPT0gXCJzdHJpbmdcIik/IFxuXHRcdFx0XHRcdFx0YXJnc1tpXS5jbGFzcy5zcGxpdChcIiBcIik6XG5cdFx0XHRcdFx0XHRmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bWFrZVN1Z2FyVGFnID0gZnVuY3Rpb24odGFnKSB7XG5cdFx0XHR2YXIgYywgZWw7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHRcdFx0Ly9cdGlmIGNsYXNzIGlzIHN0cmluZywgYWxsb3cgdXNlIG9mIGNhY2hlXG5cdFx0XHRcdGlmKGMgPSBnZXRDbGFzc0xpc3QoYXJncykpIHtcblx0XHRcdFx0XHRlbCA9IFt0YWcgKyBcIi5cIiArIGMuam9pbihcIi5cIildO1xuXHRcdFx0XHRcdC8vXHRSZW1vdmUgY2xhc3MgdGFnLCBzbyB3ZSBkb24ndCBkdXBsaWNhdGVcblx0XHRcdFx0XHRmb3IodmFyIGkgaW4gYXJncykge1xuXHRcdFx0XHRcdFx0aWYoYXJnc1tpXSAmJiBhcmdzW2ldLmNsYXNzKSB7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBhcmdzW2ldLmNsYXNzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbCA9IFt0YWddO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAobS5lPyBtLmU6IG0pLmFwcGx5KHRoaXMsIGFyZyhlbCwgYXJncykpO1xuXHRcdFx0fTtcblx0XHR9LFxuXHRcdHRhZ0xpc3QgPSBbXCJBXCIsXCJBQkJSXCIsXCJBQ1JPTllNXCIsXCJBRERSRVNTXCIsXCJBUkVBXCIsXCJBUlRJQ0xFXCIsXCJBU0lERVwiLFwiQVVESU9cIixcIkJcIixcIkJESVwiLFwiQkRPXCIsXCJCSUdcIixcIkJMT0NLUVVPVEVcIixcIkJPRFlcIixcIkJSXCIsXCJCVVRUT05cIixcIkNBTlZBU1wiLFwiQ0FQVElPTlwiLFwiQ0lURVwiLFwiQ09ERVwiLFwiQ09MXCIsXCJDT0xHUk9VUFwiLFwiQ09NTUFORFwiLFwiREFUQUxJU1RcIixcIkREXCIsXCJERUxcIixcIkRFVEFJTFNcIixcIkRGTlwiLFwiRElWXCIsXCJETFwiLFwiRFRcIixcIkVNXCIsXCJFTUJFRFwiLFwiRklFTERTRVRcIixcIkZJR0NBUFRJT05cIixcIkZJR1VSRVwiLFwiRk9PVEVSXCIsXCJGT1JNXCIsXCJGUkFNRVwiLFwiRlJBTUVTRVRcIixcIkgxXCIsXCJIMlwiLFwiSDNcIixcIkg0XCIsXCJINVwiLFwiSDZcIixcIkhFQURcIixcIkhFQURFUlwiLFwiSEdST1VQXCIsXCJIUlwiLFwiSFRNTFwiLFwiSVwiLFwiSUZSQU1FXCIsXCJJTUdcIixcIklOUFVUXCIsXCJJTlNcIixcIktCRFwiLFwiS0VZR0VOXCIsXCJMQUJFTFwiLFwiTEVHRU5EXCIsXCJMSVwiLFwiTElOS1wiLFwiTUFQXCIsXCJNQVJLXCIsXCJNRVRBXCIsXCJNRVRFUlwiLFwiTkFWXCIsXCJOT1NDUklQVFwiLFwiT0JKRUNUXCIsXCJPTFwiLFwiT1BUR1JPVVBcIixcIk9QVElPTlwiLFwiT1VUUFVUXCIsXCJQXCIsXCJQQVJBTVwiLFwiUFJFXCIsXCJQUk9HUkVTU1wiLFwiUVwiLFwiUlBcIixcIlJUXCIsXCJSVUJZXCIsXCJTQU1QXCIsXCJTQ1JJUFRcIixcIlNFQ1RJT05cIixcIlNFTEVDVFwiLFwiU01BTExcIixcIlNPVVJDRVwiLFwiU1BBTlwiLFwiU1BMSVRcIixcIlNUUk9OR1wiLFwiU1RZTEVcIixcIlNVQlwiLFwiU1VNTUFSWVwiLFwiU1VQXCIsXCJUQUJMRVwiLFwiVEJPRFlcIixcIlREXCIsXCJURVhUQVJFQVwiLFwiVEZPT1RcIixcIlRIXCIsXCJUSEVBRFwiLFwiVElNRVwiLFwiVElUTEVcIixcIlRSXCIsXCJUUkFDS1wiLFwiVFRcIixcIlVMXCIsXCJWQVJcIixcIlZJREVPXCIsXCJXQlJcIl0sXG5cdFx0bG93ZXJUYWdDYWNoZSA9IHt9LFxuXHRcdGk7XG5cblx0Ly9cdENyZWF0ZSBzdWdhcidkIGZ1bmN0aW9ucyBpbiB0aGUgcmVxdWlyZWQgc2NvcGVzXG5cdGZvciAoaSBpbiB0YWdMaXN0KSB7aWYodGFnTGlzdC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdChmdW5jdGlvbih0YWcpe1xuXHRcdFx0dmFyIGxvd2VyVGFnID0gdGFnLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRzY29wZVt0YWddID0gbG93ZXJUYWdDYWNoZVtsb3dlclRhZ10gPSBtYWtlU3VnYXJUYWcobG93ZXJUYWcpO1xuXHRcdH0odGFnTGlzdFtpXSkpO1xuXHR9fVxuXG5cdC8vXHRMb3dlcmNhc2VkIHN1Z2FyIHRhZ3Ncblx0bS5zdWdhclRhZ3MubG93ZXIgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiBsb3dlclRhZ0NhY2hlO1xuXHR9O1xuXG5cdHJldHVybiBzY29wZTtcbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gbWl0aHJpbFN1Z2FydGFncztcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtaXRocmlsU3VnYXJ0YWdzO1xuXHR9KTtcbn0gZWxzZSB7XG5cdG1pdGhyaWxTdWdhcnRhZ3MoXG5cdFx0dHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3cubSB8fCB7fToge30sXG5cdFx0dHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3c6IHt9XG5cdCk7XG59XG5cbn0oKSk7IiwidmFyIG0gPSAoZnVuY3Rpb24gYXBwKHdpbmRvdywgdW5kZWZpbmVkKSB7XHJcblx0dmFyIE9CSkVDVCA9IFwiW29iamVjdCBPYmplY3RdXCIsIEFSUkFZID0gXCJbb2JqZWN0IEFycmF5XVwiLCBTVFJJTkcgPSBcIltvYmplY3QgU3RyaW5nXVwiLCBGVU5DVElPTiA9IFwiZnVuY3Rpb25cIjtcclxuXHR2YXIgdHlwZSA9IHt9LnRvU3RyaW5nO1xyXG5cdHZhciBwYXJzZXIgPSAvKD86KF58I3xcXC4pKFteI1xcLlxcW1xcXV0rKSl8KFxcWy4rP1xcXSkvZywgYXR0clBhcnNlciA9IC9cXFsoLis/KSg/Oj0oXCJ8J3wpKC4qPylcXDIpP1xcXS87XHJcblx0dmFyIHZvaWRFbGVtZW50cyA9IC9eKEFSRUF8QkFTRXxCUnxDT0x8Q09NTUFORHxFTUJFRHxIUnxJTUd8SU5QVVR8S0VZR0VOfExJTkt8TUVUQXxQQVJBTXxTT1VSQ0V8VFJBQ0t8V0JSKSQvO1xyXG5cdHZhciBub29wID0gZnVuY3Rpb24oKSB7fVxyXG5cclxuXHQvLyBjYWNoaW5nIGNvbW1vbmx5IHVzZWQgdmFyaWFibGVzXHJcblx0dmFyICRkb2N1bWVudCwgJGxvY2F0aW9uLCAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCAkY2FuY2VsQW5pbWF0aW9uRnJhbWU7XHJcblxyXG5cdC8vIHNlbGYgaW52b2tpbmcgZnVuY3Rpb24gbmVlZGVkIGJlY2F1c2Ugb2YgdGhlIHdheSBtb2NrcyB3b3JrXHJcblx0ZnVuY3Rpb24gaW5pdGlhbGl6ZSh3aW5kb3cpe1xyXG5cdFx0JGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50O1xyXG5cdFx0JGxvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xyXG5cdFx0JGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5jbGVhclRpbWVvdXQ7XHJcblx0XHQkcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cuc2V0VGltZW91dDtcclxuXHR9XHJcblxyXG5cdGluaXRpYWxpemUod2luZG93KTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEB0eXBlZGVmIHtTdHJpbmd9IFRhZ1xyXG5cdCAqIEEgc3RyaW5nIHRoYXQgbG9va3MgbGlrZSAtPiBkaXYuY2xhc3NuYW1lI2lkW3BhcmFtPW9uZV1bcGFyYW0yPXR3b11cclxuXHQgKiBXaGljaCBkZXNjcmliZXMgYSBET00gbm9kZVxyXG5cdCAqL1xyXG5cclxuXHQvKipcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7VGFnfSBUaGUgRE9NIG5vZGUgdGFnXHJcblx0ICogQHBhcmFtIHtPYmplY3Q9W119IG9wdGlvbmFsIGtleS12YWx1ZSBwYWlycyB0byBiZSBtYXBwZWQgdG8gRE9NIGF0dHJzXHJcblx0ICogQHBhcmFtIHsuLi5tTm9kZT1bXX0gWmVybyBvciBtb3JlIE1pdGhyaWwgY2hpbGQgbm9kZXMuIENhbiBiZSBhbiBhcnJheSwgb3Igc3BsYXQgKG9wdGlvbmFsKVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbSgpIHtcclxuXHRcdHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG5cdFx0dmFyIGhhc0F0dHJzID0gYXJnc1sxXSAhPSBudWxsICYmIHR5cGUuY2FsbChhcmdzWzFdKSA9PT0gT0JKRUNUICYmICEoXCJ0YWdcIiBpbiBhcmdzWzFdIHx8IFwidmlld1wiIGluIGFyZ3NbMV0pICYmICEoXCJzdWJ0cmVlXCIgaW4gYXJnc1sxXSk7XHJcblx0XHR2YXIgYXR0cnMgPSBoYXNBdHRycyA/IGFyZ3NbMV0gOiB7fTtcclxuXHRcdHZhciBjbGFzc0F0dHJOYW1lID0gXCJjbGFzc1wiIGluIGF0dHJzID8gXCJjbGFzc1wiIDogXCJjbGFzc05hbWVcIjtcclxuXHRcdHZhciBjZWxsID0ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9fTtcclxuXHRcdHZhciBtYXRjaCwgY2xhc3NlcyA9IFtdO1xyXG5cdFx0aWYgKHR5cGUuY2FsbChhcmdzWzBdKSAhPSBTVFJJTkcpIHRocm93IG5ldyBFcnJvcihcInNlbGVjdG9yIGluIG0oc2VsZWN0b3IsIGF0dHJzLCBjaGlsZHJlbikgc2hvdWxkIGJlIGEgc3RyaW5nXCIpXHJcblx0XHR3aGlsZSAobWF0Y2ggPSBwYXJzZXIuZXhlYyhhcmdzWzBdKSkge1xyXG5cdFx0XHRpZiAobWF0Y2hbMV0gPT09IFwiXCIgJiYgbWF0Y2hbMl0pIGNlbGwudGFnID0gbWF0Y2hbMl07XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09PSBcIiNcIikgY2VsbC5hdHRycy5pZCA9IG1hdGNoWzJdO1xyXG5cdFx0XHRlbHNlIGlmIChtYXRjaFsxXSA9PT0gXCIuXCIpIGNsYXNzZXMucHVzaChtYXRjaFsyXSk7XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzNdWzBdID09PSBcIltcIikge1xyXG5cdFx0XHRcdHZhciBwYWlyID0gYXR0clBhcnNlci5leGVjKG1hdGNoWzNdKTtcclxuXHRcdFx0XHRjZWxsLmF0dHJzW3BhaXJbMV1dID0gcGFpclszXSB8fCAocGFpclsyXSA/IFwiXCIgOnRydWUpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgY2hpbGRyZW4gPSBoYXNBdHRycyA/IGFyZ3Muc2xpY2UoMikgOiBhcmdzLnNsaWNlKDEpO1xyXG5cdFx0aWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiB0eXBlLmNhbGwoY2hpbGRyZW5bMF0pID09PSBBUlJBWSkge1xyXG5cdFx0XHRjZWxsLmNoaWxkcmVuID0gY2hpbGRyZW5bMF1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjZWxsLmNoaWxkcmVuID0gY2hpbGRyZW5cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gYXR0cnMpIHtcclxuXHRcdFx0aWYgKGF0dHJzLmhhc093blByb3BlcnR5KGF0dHJOYW1lKSkge1xyXG5cdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gY2xhc3NBdHRyTmFtZSAmJiBhdHRyc1thdHRyTmFtZV0gIT0gbnVsbCAmJiBhdHRyc1thdHRyTmFtZV0gIT09IFwiXCIpIHtcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaChhdHRyc1thdHRyTmFtZV0pXHJcblx0XHRcdFx0XHRjZWxsLmF0dHJzW2F0dHJOYW1lXSA9IFwiXCIgLy9jcmVhdGUga2V5IGluIGNvcnJlY3QgaXRlcmF0aW9uIG9yZGVyXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgY2VsbC5hdHRyc1thdHRyTmFtZV0gPSBhdHRyc1thdHRyTmFtZV1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKGNsYXNzZXMubGVuZ3RoID4gMCkgY2VsbC5hdHRyc1tjbGFzc0F0dHJOYW1lXSA9IGNsYXNzZXMuam9pbihcIiBcIik7XHJcblx0XHRcclxuXHRcdHJldHVybiBjZWxsXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJ1aWxkKHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgcGFyZW50Q2FjaGUsIHBhcmVudEluZGV4LCBkYXRhLCBjYWNoZWQsIHNob3VsZFJlYXR0YWNoLCBpbmRleCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xyXG5cdFx0Ly9gYnVpbGRgIGlzIGEgcmVjdXJzaXZlIGZ1bmN0aW9uIHRoYXQgbWFuYWdlcyBjcmVhdGlvbi9kaWZmaW5nL3JlbW92YWwgb2YgRE9NIGVsZW1lbnRzIGJhc2VkIG9uIGNvbXBhcmlzb24gYmV0d2VlbiBgZGF0YWAgYW5kIGBjYWNoZWRgXHJcblx0XHQvL3RoZSBkaWZmIGFsZ29yaXRobSBjYW4gYmUgc3VtbWFyaXplZCBhcyB0aGlzOlxyXG5cdFx0Ly8xIC0gY29tcGFyZSBgZGF0YWAgYW5kIGBjYWNoZWRgXHJcblx0XHQvLzIgLSBpZiB0aGV5IGFyZSBkaWZmZXJlbnQsIGNvcHkgYGRhdGFgIHRvIGBjYWNoZWRgIGFuZCB1cGRhdGUgdGhlIERPTSBiYXNlZCBvbiB3aGF0IHRoZSBkaWZmZXJlbmNlIGlzXHJcblx0XHQvLzMgLSByZWN1cnNpdmVseSBhcHBseSB0aGlzIGFsZ29yaXRobSBmb3IgZXZlcnkgYXJyYXkgYW5kIGZvciB0aGUgY2hpbGRyZW4gb2YgZXZlcnkgdmlydHVhbCBlbGVtZW50XHJcblxyXG5cdFx0Ly90aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIHJlZHJhdydzIGBkYXRhYCBkYXRhIHN0cnVjdHVyZSwgd2l0aCBhIGZldyBhZGRpdGlvbnM6XHJcblx0XHQvLy0gYGNhY2hlZGAgYWx3YXlzIGhhcyBhIHByb3BlcnR5IGNhbGxlZCBgbm9kZXNgLCB3aGljaCBpcyBhIGxpc3Qgb2YgRE9NIGVsZW1lbnRzIHRoYXQgY29ycmVzcG9uZCB0byB0aGUgZGF0YSByZXByZXNlbnRlZCBieSB0aGUgcmVzcGVjdGl2ZSB2aXJ0dWFsIGVsZW1lbnRcclxuXHRcdC8vLSBpbiBvcmRlciB0byBzdXBwb3J0IGF0dGFjaGluZyBgbm9kZXNgIGFzIGEgcHJvcGVydHkgb2YgYGNhY2hlZGAsIGBjYWNoZWRgIGlzICphbHdheXMqIGEgbm9uLXByaW1pdGl2ZSBvYmplY3QsIGkuZS4gaWYgdGhlIGRhdGEgd2FzIGEgc3RyaW5nLCB0aGVuIGNhY2hlZCBpcyBhIFN0cmluZyBpbnN0YW5jZS4gSWYgZGF0YSB3YXMgYG51bGxgIG9yIGB1bmRlZmluZWRgLCBjYWNoZWQgaXMgYG5ldyBTdHJpbmcoXCJcIilgXHJcblx0XHQvLy0gYGNhY2hlZCBhbHNvIGhhcyBhIGBjb25maWdDb250ZXh0YCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHN0YXRlIHN0b3JhZ2Ugb2JqZWN0IGV4cG9zZWQgYnkgY29uZmlnKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpXHJcblx0XHQvLy0gd2hlbiBgY2FjaGVkYCBpcyBhbiBPYmplY3QsIGl0IHJlcHJlc2VudHMgYSB2aXJ0dWFsIGVsZW1lbnQ7IHdoZW4gaXQncyBhbiBBcnJheSwgaXQgcmVwcmVzZW50cyBhIGxpc3Qgb2YgZWxlbWVudHM7IHdoZW4gaXQncyBhIFN0cmluZywgTnVtYmVyIG9yIEJvb2xlYW4sIGl0IHJlcHJlc2VudHMgYSB0ZXh0IG5vZGVcclxuXHJcblx0XHQvL2BwYXJlbnRFbGVtZW50YCBpcyBhIERPTSBlbGVtZW50IHVzZWQgZm9yIFczQyBET00gQVBJIGNhbGxzXHJcblx0XHQvL2BwYXJlbnRUYWdgIGlzIG9ubHkgdXNlZCBmb3IgaGFuZGxpbmcgYSBjb3JuZXIgY2FzZSBmb3IgdGV4dGFyZWEgdmFsdWVzXHJcblx0XHQvL2BwYXJlbnRDYWNoZWAgaXMgdXNlZCB0byByZW1vdmUgbm9kZXMgaW4gc29tZSBtdWx0aS1ub2RlIGNhc2VzXHJcblx0XHQvL2BwYXJlbnRJbmRleGAgYW5kIGBpbmRleGAgYXJlIHVzZWQgdG8gZmlndXJlIG91dCB0aGUgb2Zmc2V0IG9mIG5vZGVzLiBUaGV5J3JlIGFydGlmYWN0cyBmcm9tIGJlZm9yZSBhcnJheXMgc3RhcnRlZCBiZWluZyBmbGF0dGVuZWQgYW5kIGFyZSBsaWtlbHkgcmVmYWN0b3JhYmxlXHJcblx0XHQvL2BkYXRhYCBhbmQgYGNhY2hlZGAgYXJlLCByZXNwZWN0aXZlbHksIHRoZSBuZXcgYW5kIG9sZCBub2RlcyBiZWluZyBkaWZmZWRcclxuXHRcdC8vYHNob3VsZFJlYXR0YWNoYCBpcyBhIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIGEgcGFyZW50IG5vZGUgd2FzIHJlY3JlYXRlZCAoaWYgc28sIGFuZCBpZiB0aGlzIG5vZGUgaXMgcmV1c2VkLCB0aGVuIHRoaXMgbm9kZSBtdXN0IHJlYXR0YWNoIGl0c2VsZiB0byB0aGUgbmV3IHBhcmVudClcclxuXHRcdC8vYGVkaXRhYmxlYCBpcyBhIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBhbiBhbmNlc3RvciBpcyBjb250ZW50ZWRpdGFibGVcclxuXHRcdC8vYG5hbWVzcGFjZWAgaW5kaWNhdGVzIHRoZSBjbG9zZXN0IEhUTUwgbmFtZXNwYWNlIGFzIGl0IGNhc2NhZGVzIGRvd24gZnJvbSBhbiBhbmNlc3RvclxyXG5cdFx0Ly9gY29uZmlnc2AgaXMgYSBsaXN0IG9mIGNvbmZpZyBmdW5jdGlvbnMgdG8gcnVuIGFmdGVyIHRoZSB0b3Btb3N0IGBidWlsZGAgY2FsbCBmaW5pc2hlcyBydW5uaW5nXHJcblxyXG5cdFx0Ly90aGVyZSdzIGxvZ2ljIHRoYXQgcmVsaWVzIG9uIHRoZSBhc3N1bXB0aW9uIHRoYXQgbnVsbCBhbmQgdW5kZWZpbmVkIGRhdGEgYXJlIGVxdWl2YWxlbnQgdG8gZW1wdHkgc3RyaW5nc1xyXG5cdFx0Ly8tIHRoaXMgcHJldmVudHMgbGlmZWN5Y2xlIHN1cnByaXNlcyBmcm9tIHByb2NlZHVyYWwgaGVscGVycyB0aGF0IG1peCBpbXBsaWNpdCBhbmQgZXhwbGljaXQgcmV0dXJuIHN0YXRlbWVudHMgKGUuZy4gZnVuY3Rpb24gZm9vKCkge2lmIChjb25kKSByZXR1cm4gbShcImRpdlwiKX1cclxuXHRcdC8vLSBpdCBzaW1wbGlmaWVzIGRpZmZpbmcgY29kZVxyXG5cdFx0Ly9kYXRhLnRvU3RyaW5nKCkgbWlnaHQgdGhyb3cgb3IgcmV0dXJuIG51bGwgaWYgZGF0YSBpcyB0aGUgcmV0dXJuIHZhbHVlIG9mIENvbnNvbGUubG9nIGluIEZpcmVmb3ggKGJlaGF2aW9yIGRlcGVuZHMgb24gdmVyc2lvbilcclxuXHRcdHRyeSB7aWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhLnRvU3RyaW5nKCkgPT0gbnVsbCkgZGF0YSA9IFwiXCI7fSBjYXRjaCAoZSkge2RhdGEgPSBcIlwifVxyXG5cdFx0aWYgKGRhdGEuc3VidHJlZSA9PT0gXCJyZXRhaW5cIikgcmV0dXJuIGNhY2hlZDtcclxuXHRcdHZhciBjYWNoZWRUeXBlID0gdHlwZS5jYWxsKGNhY2hlZCksIGRhdGFUeXBlID0gdHlwZS5jYWxsKGRhdGEpO1xyXG5cdFx0aWYgKGNhY2hlZCA9PSBudWxsIHx8IGNhY2hlZFR5cGUgIT09IGRhdGFUeXBlKSB7XHJcblx0XHRcdGlmIChjYWNoZWQgIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmIChwYXJlbnRDYWNoZSAmJiBwYXJlbnRDYWNoZS5ub2Rlcykge1xyXG5cdFx0XHRcdFx0dmFyIG9mZnNldCA9IGluZGV4IC0gcGFyZW50SW5kZXg7XHJcblx0XHRcdFx0XHR2YXIgZW5kID0gb2Zmc2V0ICsgKGRhdGFUeXBlID09PSBBUlJBWSA/IGRhdGEgOiBjYWNoZWQubm9kZXMpLmxlbmd0aDtcclxuXHRcdFx0XHRcdGNsZWFyKHBhcmVudENhY2hlLm5vZGVzLnNsaWNlKG9mZnNldCwgZW5kKSwgcGFyZW50Q2FjaGUuc2xpY2Uob2Zmc2V0LCBlbmQpKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmIChjYWNoZWQubm9kZXMpIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKVxyXG5cdFx0XHR9XHJcblx0XHRcdGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yO1xyXG5cdFx0XHRpZiAoY2FjaGVkLnRhZykgY2FjaGVkID0ge307IC8vaWYgY29uc3RydWN0b3IgY3JlYXRlcyBhIHZpcnR1YWwgZG9tIGVsZW1lbnQsIHVzZSBhIGJsYW5rIG9iamVjdCBhcyB0aGUgYmFzZSBjYWNoZWQgbm9kZSBpbnN0ZWFkIG9mIGNvcHlpbmcgdGhlIHZpcnR1YWwgZWwgKCMyNzcpXHJcblx0XHRcdGNhY2hlZC5ub2RlcyA9IFtdXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRhdGFUeXBlID09PSBBUlJBWSkge1xyXG5cdFx0XHQvL3JlY3Vyc2l2ZWx5IGZsYXR0ZW4gYXJyYXlcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodHlwZS5jYWxsKGRhdGFbaV0pID09PSBBUlJBWSkge1xyXG5cdFx0XHRcdFx0ZGF0YSA9IGRhdGEuY29uY2F0LmFwcGx5KFtdLCBkYXRhKTtcclxuXHRcdFx0XHRcdGktLSAvL2NoZWNrIGN1cnJlbnQgaW5kZXggYWdhaW4gYW5kIGZsYXR0ZW4gdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbmVzdGVkIGFycmF5cyBhdCB0aGF0IGluZGV4XHJcblx0XHRcdFx0XHRsZW4gPSBkYXRhLmxlbmd0aFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG5vZGVzID0gW10sIGludGFjdCA9IGNhY2hlZC5sZW5ndGggPT09IGRhdGEubGVuZ3RoLCBzdWJBcnJheUNvdW50ID0gMDtcclxuXHJcblx0XHRcdC8va2V5cyBhbGdvcml0aG06IHNvcnQgZWxlbWVudHMgd2l0aG91dCByZWNyZWF0aW5nIHRoZW0gaWYga2V5cyBhcmUgcHJlc2VudFxyXG5cdFx0XHQvLzEpIGNyZWF0ZSBhIG1hcCBvZiBhbGwgZXhpc3Rpbmcga2V5cywgYW5kIG1hcmsgYWxsIGZvciBkZWxldGlvblxyXG5cdFx0XHQvLzIpIGFkZCBuZXcga2V5cyB0byBtYXAgYW5kIG1hcmsgdGhlbSBmb3IgYWRkaXRpb25cclxuXHRcdFx0Ly8zKSBpZiBrZXkgZXhpc3RzIGluIG5ldyBsaXN0LCBjaGFuZ2UgYWN0aW9uIGZyb20gZGVsZXRpb24gdG8gYSBtb3ZlXHJcblx0XHRcdC8vNCkgZm9yIGVhY2gga2V5LCBoYW5kbGUgaXRzIGNvcnJlc3BvbmRpbmcgYWN0aW9uIGFzIG1hcmtlZCBpbiBwcmV2aW91cyBzdGVwc1xyXG5cdFx0XHR2YXIgREVMRVRJT04gPSAxLCBJTlNFUlRJT04gPSAyICwgTU9WRSA9IDM7XHJcblx0XHRcdHZhciBleGlzdGluZyA9IHt9LCBzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSBmYWxzZTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWNoZWQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoY2FjaGVkW2ldICYmIGNhY2hlZFtpXS5hdHRycyAmJiBjYWNoZWRbaV0uYXR0cnMua2V5ICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IHRydWU7XHJcblx0XHRcdFx0XHRleGlzdGluZ1tjYWNoZWRbaV0uYXR0cnMua2V5XSA9IHthY3Rpb246IERFTEVUSU9OLCBpbmRleDogaX1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBndWlkID0gMFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGlmIChkYXRhW2ldICYmIGRhdGFbaV0uYXR0cnMgJiYgZGF0YVtpXS5hdHRycy5rZXkgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaiA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKGRhdGFbal0gJiYgZGF0YVtqXS5hdHRycyAmJiBkYXRhW2pdLmF0dHJzLmtleSA9PSBudWxsKSBkYXRhW2pdLmF0dHJzLmtleSA9IFwiX19taXRocmlsX19cIiArIGd1aWQrK1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmIChzaG91bGRNYWludGFpbklkZW50aXRpZXMpIHtcclxuXHRcdFx0XHR2YXIga2V5c0RpZmZlciA9IGZhbHNlXHJcblx0XHRcdFx0aWYgKGRhdGEubGVuZ3RoICE9IGNhY2hlZC5sZW5ndGgpIGtleXNEaWZmZXIgPSB0cnVlXHJcblx0XHRcdFx0ZWxzZSBmb3IgKHZhciBpID0gMCwgY2FjaGVkQ2VsbCwgZGF0YUNlbGw7IGNhY2hlZENlbGwgPSBjYWNoZWRbaV0sIGRhdGFDZWxsID0gZGF0YVtpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAoY2FjaGVkQ2VsbC5hdHRycyAmJiBkYXRhQ2VsbC5hdHRycyAmJiBjYWNoZWRDZWxsLmF0dHJzLmtleSAhPSBkYXRhQ2VsbC5hdHRycy5rZXkpIHtcclxuXHRcdFx0XHRcdFx0a2V5c0RpZmZlciA9IHRydWVcclxuXHRcdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGtleXNEaWZmZXIpIHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdGlmIChkYXRhW2ldICYmIGRhdGFbaV0uYXR0cnMpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZGF0YVtpXS5hdHRycy5rZXkgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGtleSA9IGRhdGFbaV0uYXR0cnMua2V5O1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFleGlzdGluZ1trZXldKSBleGlzdGluZ1trZXldID0ge2FjdGlvbjogSU5TRVJUSU9OLCBpbmRleDogaX07XHJcblx0XHRcdFx0XHRcdFx0XHRlbHNlIGV4aXN0aW5nW2tleV0gPSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFjdGlvbjogTU9WRSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0aW5kZXg6IGksXHJcblx0XHRcdFx0XHRcdFx0XHRcdGZyb206IGV4aXN0aW5nW2tleV0uaW5kZXgsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQ6IGNhY2hlZC5ub2Rlc1tleGlzdGluZ1trZXldLmluZGV4XSB8fCAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIGFjdGlvbnMgPSBbXVxyXG5cdFx0XHRcdFx0Zm9yICh2YXIgcHJvcCBpbiBleGlzdGluZykgYWN0aW9ucy5wdXNoKGV4aXN0aW5nW3Byb3BdKVxyXG5cdFx0XHRcdFx0dmFyIGNoYW5nZXMgPSBhY3Rpb25zLnNvcnQoc29ydENoYW5nZXMpO1xyXG5cdFx0XHRcdFx0dmFyIG5ld0NhY2hlZCA9IG5ldyBBcnJheShjYWNoZWQubGVuZ3RoKVxyXG5cdFx0XHRcdFx0bmV3Q2FjaGVkLm5vZGVzID0gY2FjaGVkLm5vZGVzLnNsaWNlKClcclxuXHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY2hhbmdlOyBjaGFuZ2UgPSBjaGFuZ2VzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IERFTEVUSU9OKSB7XHJcblx0XHRcdFx0XHRcdFx0Y2xlYXIoY2FjaGVkW2NoYW5nZS5pbmRleF0ubm9kZXMsIGNhY2hlZFtjaGFuZ2UuaW5kZXhdKTtcclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWQuc3BsaWNlKGNoYW5nZS5pbmRleCwgMSlcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gSU5TRVJUSU9OKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIGR1bW15ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHRcdFx0XHRcdFx0ZHVtbXkua2V5ID0gZGF0YVtjaGFuZ2UuaW5kZXhdLmF0dHJzLmtleTtcclxuXHRcdFx0XHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShkdW1teSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2NoYW5nZS5pbmRleF0gfHwgbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FjaGVkLnNwbGljZShjaGFuZ2UuaW5kZXgsIDAsIHthdHRyczoge2tleTogZGF0YVtjaGFuZ2UuaW5kZXhdLmF0dHJzLmtleX0sIG5vZGVzOiBbZHVtbXldfSlcclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWQubm9kZXNbY2hhbmdlLmluZGV4XSA9IGR1bW15XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBNT1ZFKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdICE9PSBjaGFuZ2UuZWxlbWVudCAmJiBjaGFuZ2UuZWxlbWVudCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoY2hhbmdlLmVsZW1lbnQsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2UuaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZFtjaGFuZ2UuaW5kZXhdID0gY2FjaGVkW2NoYW5nZS5mcm9tXVxyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZC5ub2Rlc1tjaGFuZ2UuaW5kZXhdID0gY2hhbmdlLmVsZW1lbnRcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Y2FjaGVkID0gbmV3Q2FjaGVkO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvL2VuZCBrZXkgYWxnb3JpdGhtXHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgY2FjaGVDb3VudCA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHQvL2RpZmYgZWFjaCBpdGVtIGluIHRoZSBhcnJheVxyXG5cdFx0XHRcdHZhciBpdGVtID0gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBjYWNoZWQsIGluZGV4LCBkYXRhW2ldLCBjYWNoZWRbY2FjaGVDb3VudF0sIHNob3VsZFJlYXR0YWNoLCBpbmRleCArIHN1YkFycmF5Q291bnQgfHwgc3ViQXJyYXlDb3VudCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XHJcblx0XHRcdFx0aWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkgY29udGludWU7XHJcblx0XHRcdFx0aWYgKCFpdGVtLm5vZGVzLmludGFjdCkgaW50YWN0ID0gZmFsc2U7XHJcblx0XHRcdFx0aWYgKGl0ZW0uJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdC8vZml4IG9mZnNldCBvZiBuZXh0IGVsZW1lbnQgaWYgaXRlbSB3YXMgYSB0cnVzdGVkIHN0cmluZyB3LyBtb3JlIHRoYW4gb25lIGh0bWwgZWxlbWVudFxyXG5cdFx0XHRcdFx0Ly90aGUgZmlyc3QgY2xhdXNlIGluIHRoZSByZWdleHAgbWF0Y2hlcyBlbGVtZW50c1xyXG5cdFx0XHRcdFx0Ly90aGUgc2Vjb25kIGNsYXVzZSAoYWZ0ZXIgdGhlIHBpcGUpIG1hdGNoZXMgdGV4dCBub2Rlc1xyXG5cdFx0XHRcdFx0c3ViQXJyYXlDb3VudCArPSAoaXRlbS5tYXRjaCgvPFteXFwvXXxcXD5cXHMqW148XS9nKSB8fCBbMF0pLmxlbmd0aFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHN1YkFycmF5Q291bnQgKz0gdHlwZS5jYWxsKGl0ZW0pID09PSBBUlJBWSA/IGl0ZW0ubGVuZ3RoIDogMTtcclxuXHRcdFx0XHRjYWNoZWRbY2FjaGVDb3VudCsrXSA9IGl0ZW1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIWludGFjdCkge1xyXG5cdFx0XHRcdC8vZGlmZiB0aGUgYXJyYXkgaXRzZWxmXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly91cGRhdGUgdGhlIGxpc3Qgb2YgRE9NIG5vZGVzIGJ5IGNvbGxlY3RpbmcgdGhlIG5vZGVzIGZyb20gZWFjaCBpdGVtXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmIChjYWNoZWRbaV0gIT0gbnVsbCkgbm9kZXMucHVzaC5hcHBseShub2RlcywgY2FjaGVkW2ldLm5vZGVzKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvL3JlbW92ZSBpdGVtcyBmcm9tIHRoZSBlbmQgb2YgdGhlIGFycmF5IGlmIHRoZSBuZXcgYXJyYXkgaXMgc2hvcnRlciB0aGFuIHRoZSBvbGQgb25lXHJcblx0XHRcdFx0Ly9pZiBlcnJvcnMgZXZlciBoYXBwZW4gaGVyZSwgdGhlIGlzc3VlIGlzIG1vc3QgbGlrZWx5IGEgYnVnIGluIHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIGBjYWNoZWRgIGRhdGEgc3RydWN0dXJlIHNvbWV3aGVyZSBlYXJsaWVyIGluIHRoZSBwcm9ncmFtXHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIG5vZGU7IG5vZGUgPSBjYWNoZWQubm9kZXNbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKG5vZGUucGFyZW50Tm9kZSAhPSBudWxsICYmIG5vZGVzLmluZGV4T2Yobm9kZSkgPCAwKSBjbGVhcihbbm9kZV0sIFtjYWNoZWRbaV1dKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0YS5sZW5ndGggPCBjYWNoZWQubGVuZ3RoKSBjYWNoZWQubGVuZ3RoID0gZGF0YS5sZW5ndGg7XHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXNcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAoZGF0YSAhPSBudWxsICYmIGRhdGFUeXBlID09PSBPQkpFQ1QpIHtcclxuXHRcdFx0dmFyIHZpZXdzID0gW10sIGNvbnRyb2xsZXJzID0gW11cclxuXHRcdFx0d2hpbGUgKGRhdGEudmlldykge1xyXG5cdFx0XHRcdHZhciB2aWV3ID0gZGF0YS52aWV3LiRvcmlnaW5hbCB8fCBkYXRhLnZpZXdcclxuXHRcdFx0XHR2YXIgY29udHJvbGxlckluZGV4ID0gbS5yZWRyYXcuc3RyYXRlZ3koKSA9PSBcImRpZmZcIiAmJiBjYWNoZWQudmlld3MgPyBjYWNoZWQudmlld3MuaW5kZXhPZih2aWV3KSA6IC0xXHJcblx0XHRcdFx0dmFyIGNvbnRyb2xsZXIgPSBjb250cm9sbGVySW5kZXggPiAtMSA/IGNhY2hlZC5jb250cm9sbGVyc1tjb250cm9sbGVySW5kZXhdIDogbmV3IChkYXRhLmNvbnRyb2xsZXIgfHwgbm9vcClcclxuXHRcdFx0XHR2YXIga2V5ID0gZGF0YSAmJiBkYXRhLmF0dHJzICYmIGRhdGEuYXR0cnMua2V5XHJcblx0XHRcdFx0ZGF0YSA9IHBlbmRpbmdSZXF1ZXN0cyA9PSAwIHx8IChjYWNoZWQgJiYgY2FjaGVkLmNvbnRyb2xsZXJzICYmIGNhY2hlZC5jb250cm9sbGVycy5pbmRleE9mKGNvbnRyb2xsZXIpID4gLTEpID8gZGF0YS52aWV3KGNvbnRyb2xsZXIpIDoge3RhZzogXCJwbGFjZWhvbGRlclwifVxyXG5cdFx0XHRcdGlmIChkYXRhLnN1YnRyZWUgPT09IFwicmV0YWluXCIpIHJldHVybiBjYWNoZWQ7XHJcblx0XHRcdFx0aWYgKGtleSkge1xyXG5cdFx0XHRcdFx0aWYgKCFkYXRhLmF0dHJzKSBkYXRhLmF0dHJzID0ge31cclxuXHRcdFx0XHRcdGRhdGEuYXR0cnMua2V5ID0ga2V5XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChjb250cm9sbGVyLm9udW5sb2FkKSB1bmxvYWRlcnMucHVzaCh7Y29udHJvbGxlcjogY29udHJvbGxlciwgaGFuZGxlcjogY29udHJvbGxlci5vbnVubG9hZH0pXHJcblx0XHRcdFx0dmlld3MucHVzaCh2aWV3KVxyXG5cdFx0XHRcdGNvbnRyb2xsZXJzLnB1c2goY29udHJvbGxlcilcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoIWRhdGEudGFnICYmIGNvbnRyb2xsZXJzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50IHRlbXBsYXRlIG11c3QgcmV0dXJuIGEgdmlydHVhbCBlbGVtZW50LCBub3QgYW4gYXJyYXksIHN0cmluZywgZXRjLlwiKVxyXG5cdFx0XHRpZiAoIWRhdGEuYXR0cnMpIGRhdGEuYXR0cnMgPSB7fTtcclxuXHRcdFx0aWYgKCFjYWNoZWQuYXR0cnMpIGNhY2hlZC5hdHRycyA9IHt9O1xyXG5cclxuXHRcdFx0dmFyIGRhdGFBdHRyS2V5cyA9IE9iamVjdC5rZXlzKGRhdGEuYXR0cnMpXHJcblx0XHRcdHZhciBoYXNLZXlzID0gZGF0YUF0dHJLZXlzLmxlbmd0aCA+IChcImtleVwiIGluIGRhdGEuYXR0cnMgPyAxIDogMClcclxuXHRcdFx0Ly9pZiBhbiBlbGVtZW50IGlzIGRpZmZlcmVudCBlbm91Z2ggZnJvbSB0aGUgb25lIGluIGNhY2hlLCByZWNyZWF0ZSBpdFxyXG5cdFx0XHRpZiAoZGF0YS50YWcgIT0gY2FjaGVkLnRhZyB8fCBkYXRhQXR0cktleXMuc29ydCgpLmpvaW4oKSAhPSBPYmplY3Qua2V5cyhjYWNoZWQuYXR0cnMpLnNvcnQoKS5qb2luKCkgfHwgZGF0YS5hdHRycy5pZCAhPSBjYWNoZWQuYXR0cnMuaWQgfHwgZGF0YS5hdHRycy5rZXkgIT0gY2FjaGVkLmF0dHJzLmtleSB8fCAobS5yZWRyYXcuc3RyYXRlZ3koKSA9PSBcImFsbFwiICYmICghY2FjaGVkLmNvbmZpZ0NvbnRleHQgfHwgY2FjaGVkLmNvbmZpZ0NvbnRleHQucmV0YWluICE9PSB0cnVlKSkgfHwgKG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT0gXCJkaWZmXCIgJiYgY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgY2FjaGVkLmNvbmZpZ0NvbnRleHQucmV0YWluID09PSBmYWxzZSkpIHtcclxuXHRcdFx0XHRpZiAoY2FjaGVkLm5vZGVzLmxlbmd0aCkgY2xlYXIoY2FjaGVkLm5vZGVzKTtcclxuXHRcdFx0XHRpZiAoY2FjaGVkLmNvbmZpZ0NvbnRleHQgJiYgdHlwZW9mIGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkID09PSBGVU5DVElPTikgY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKVxyXG5cdFx0XHRcdGlmIChjYWNoZWQuY29udHJvbGxlcnMpIHtcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjb250cm9sbGVyOyBjb250cm9sbGVyID0gY2FjaGVkLmNvbnRyb2xsZXJzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBjb250cm9sbGVyLm9udW5sb2FkID09PSBGVU5DVElPTikgY29udHJvbGxlci5vbnVubG9hZCh7cHJldmVudERlZmF1bHQ6IG5vb3B9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodHlwZS5jYWxsKGRhdGEudGFnKSAhPSBTVFJJTkcpIHJldHVybjtcclxuXHJcblx0XHRcdHZhciBub2RlLCBpc05ldyA9IGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDA7XHJcblx0XHRcdGlmIChkYXRhLmF0dHJzLnhtbG5zKSBuYW1lc3BhY2UgPSBkYXRhLmF0dHJzLnhtbG5zO1xyXG5cdFx0XHRlbHNlIGlmIChkYXRhLnRhZyA9PT0gXCJzdmdcIikgbmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xyXG5cdFx0XHRlbHNlIGlmIChkYXRhLnRhZyA9PT0gXCJtYXRoXCIpIG5hbWVzcGFjZSA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTFwiO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKGlzTmV3KSB7XHJcblx0XHRcdFx0aWYgKGRhdGEuYXR0cnMuaXMpIG5vZGUgPSBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZywgZGF0YS5hdHRycy5pcyk7XHJcblx0XHRcdFx0ZWxzZSBub2RlID0gbmFtZXNwYWNlID09PSB1bmRlZmluZWQgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcpO1xyXG5cdFx0XHRcdGNhY2hlZCA9IHtcclxuXHRcdFx0XHRcdHRhZzogZGF0YS50YWcsXHJcblx0XHRcdFx0XHQvL3NldCBhdHRyaWJ1dGVzIGZpcnN0LCB0aGVuIGNyZWF0ZSBjaGlsZHJlblxyXG5cdFx0XHRcdFx0YXR0cnM6IGhhc0tleXMgPyBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCB7fSwgbmFtZXNwYWNlKSA6IGRhdGEuYXR0cnMsXHJcblx0XHRcdFx0XHRjaGlsZHJlbjogZGF0YS5jaGlsZHJlbiAhPSBudWxsICYmIGRhdGEuY2hpbGRyZW4ubGVuZ3RoID4gMCA/XHJcblx0XHRcdFx0XHRcdGJ1aWxkKG5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCB0cnVlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IG5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSA6XHJcblx0XHRcdFx0XHRcdGRhdGEuY2hpbGRyZW4sXHJcblx0XHRcdFx0XHRub2RlczogW25vZGVdXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRpZiAoY29udHJvbGxlcnMubGVuZ3RoKSB7XHJcblx0XHRcdFx0XHRjYWNoZWQudmlld3MgPSB2aWV3c1xyXG5cdFx0XHRcdFx0Y2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnNcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjb250cm9sbGVyOyBjb250cm9sbGVyID0gY29udHJvbGxlcnNbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoY29udHJvbGxlci5vbnVubG9hZCAmJiBjb250cm9sbGVyLm9udW5sb2FkLiRvbGQpIGNvbnRyb2xsZXIub251bmxvYWQgPSBjb250cm9sbGVyLm9udW5sb2FkLiRvbGRcclxuXHRcdFx0XHRcdFx0aWYgKHBlbmRpbmdSZXF1ZXN0cyAmJiBjb250cm9sbGVyLm9udW5sb2FkKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIG9udW5sb2FkID0gY29udHJvbGxlci5vbnVubG9hZFxyXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIub251bmxvYWQgPSBub29wXHJcblx0XHRcdFx0XHRcdFx0Y29udHJvbGxlci5vbnVubG9hZC4kb2xkID0gb251bmxvYWRcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoY2FjaGVkLmNoaWxkcmVuICYmICFjYWNoZWQuY2hpbGRyZW4ubm9kZXMpIGNhY2hlZC5jaGlsZHJlbi5ub2RlcyA9IFtdO1xyXG5cdFx0XHRcdC8vZWRnZSBjYXNlOiBzZXR0aW5nIHZhbHVlIG9uIDxzZWxlY3Q+IGRvZXNuJ3Qgd29yayBiZWZvcmUgY2hpbGRyZW4gZXhpc3QsIHNvIHNldCBpdCBhZ2FpbiBhZnRlciBjaGlsZHJlbiBoYXZlIGJlZW4gY3JlYXRlZFxyXG5cdFx0XHRcdGlmIChkYXRhLnRhZyA9PT0gXCJzZWxlY3RcIiAmJiBcInZhbHVlXCIgaW4gZGF0YS5hdHRycykgc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywge3ZhbHVlOiBkYXRhLmF0dHJzLnZhbHVlfSwge30sIG5hbWVzcGFjZSk7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG5vZGUgPSBjYWNoZWQubm9kZXNbMF07XHJcblx0XHRcdFx0aWYgKGhhc0tleXMpIHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIGNhY2hlZC5hdHRycywgbmFtZXNwYWNlKTtcclxuXHRcdFx0XHRjYWNoZWQuY2hpbGRyZW4gPSBidWlsZChub2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgZmFsc2UsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xyXG5cdFx0XHRcdGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdGNhY2hlZC52aWV3cyA9IHZpZXdzXHJcblx0XHRcdFx0XHRjYWNoZWQuY29udHJvbGxlcnMgPSBjb250cm9sbGVyc1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc2hvdWxkUmVhdHRhY2ggPT09IHRydWUgJiYgbm9kZSAhPSBudWxsKSBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2RlLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdH1cclxuXHRcdFx0Ly9zY2hlZHVsZSBjb25maWdzIHRvIGJlIGNhbGxlZC4gVGhleSBhcmUgY2FsbGVkIGFmdGVyIGBidWlsZGAgZmluaXNoZXMgcnVubmluZ1xyXG5cdFx0XHRpZiAodHlwZW9mIGRhdGEuYXR0cnNbXCJjb25maWdcIl0gPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0dmFyIGNvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0IHx8IHt9O1xyXG5cclxuXHRcdFx0XHQvLyBiaW5kXHJcblx0XHRcdFx0dmFyIGNhbGxiYWNrID0gZnVuY3Rpb24oZGF0YSwgYXJncykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YS5hdHRyc1tcImNvbmZpZ1wiXS5hcHBseShkYXRhLCBhcmdzKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0Y29uZmlncy5wdXNoKGNhbGxiYWNrKGRhdGEsIFtub2RlLCAhaXNOZXcsIGNvbnRleHQsIGNhY2hlZF0pKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmICh0eXBlb2YgZGF0YSAhPSBGVU5DVElPTikge1xyXG5cdFx0XHQvL2hhbmRsZSB0ZXh0IG5vZGVzXHJcblx0XHRcdHZhciBub2RlcztcclxuXHRcdFx0aWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRpZiAoZGF0YS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XHJcblx0XHRcdFx0XHRpZiAoIXBhcmVudEVsZW1lbnQubm9kZU5hbWUubWF0Y2godm9pZEVsZW1lbnRzKSkgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FjaGVkID0gXCJzdHJpbmcgbnVtYmVyIGJvb2xlYW5cIi5pbmRleE9mKHR5cGVvZiBkYXRhKSA+IC0xID8gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSkgOiBkYXRhO1xyXG5cdFx0XHRcdGNhY2hlZC5ub2RlcyA9IG5vZGVzXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoY2FjaGVkLnZhbHVlT2YoKSAhPT0gZGF0YS52YWx1ZU9mKCkgfHwgc2hvdWxkUmVhdHRhY2ggPT09IHRydWUpIHtcclxuXHRcdFx0XHRub2RlcyA9IGNhY2hlZC5ub2RlcztcclxuXHRcdFx0XHRpZiAoIWVkaXRhYmxlIHx8IGVkaXRhYmxlICE9PSAkZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xyXG5cdFx0XHRcdFx0aWYgKGRhdGEuJHRydXN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0Y2xlYXIobm9kZXMsIGNhY2hlZCk7XHJcblx0XHRcdFx0XHRcdG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHQvL2Nvcm5lciBjYXNlOiByZXBsYWNpbmcgdGhlIG5vZGVWYWx1ZSBvZiBhIHRleHQgbm9kZSB0aGF0IGlzIGEgY2hpbGQgb2YgYSB0ZXh0YXJlYS9jb250ZW50ZWRpdGFibGUgZG9lc24ndCB3b3JrXHJcblx0XHRcdFx0XHRcdC8vd2UgbmVlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHByb3BlcnR5IG9mIHRoZSBwYXJlbnQgdGV4dGFyZWEgb3IgdGhlIGlubmVySFRNTCBvZiB0aGUgY29udGVudGVkaXRhYmxlIGVsZW1lbnQgaW5zdGVhZFxyXG5cdFx0XHRcdFx0XHRpZiAocGFyZW50VGFnID09PSBcInRleHRhcmVhXCIpIHBhcmVudEVsZW1lbnQudmFsdWUgPSBkYXRhO1xyXG5cdFx0XHRcdFx0XHRlbHNlIGlmIChlZGl0YWJsZSkgZWRpdGFibGUuaW5uZXJIVE1MID0gZGF0YTtcclxuXHRcdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKG5vZGVzWzBdLm5vZGVUeXBlID09PSAxIHx8IG5vZGVzLmxlbmd0aCA+IDEpIHsgLy93YXMgYSB0cnVzdGVkIHN0cmluZ1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2Rlc1swXSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKTtcclxuXHRcdFx0XHRcdFx0XHRub2Rlc1swXS5ub2RlVmFsdWUgPSBkYXRhXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSk7XHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXNcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGNhY2hlZFxyXG5cdH1cclxuXHRmdW5jdGlvbiBzb3J0Q2hhbmdlcyhhLCBiKSB7cmV0dXJuIGEuYWN0aW9uIC0gYi5hY3Rpb24gfHwgYS5pbmRleCAtIGIuaW5kZXh9XHJcblx0ZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhub2RlLCB0YWcsIGRhdGFBdHRycywgY2FjaGVkQXR0cnMsIG5hbWVzcGFjZSkge1xyXG5cdFx0Zm9yICh2YXIgYXR0ck5hbWUgaW4gZGF0YUF0dHJzKSB7XHJcblx0XHRcdHZhciBkYXRhQXR0ciA9IGRhdGFBdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdHZhciBjYWNoZWRBdHRyID0gY2FjaGVkQXR0cnNbYXR0ck5hbWVdO1xyXG5cdFx0XHRpZiAoIShhdHRyTmFtZSBpbiBjYWNoZWRBdHRycykgfHwgKGNhY2hlZEF0dHIgIT09IGRhdGFBdHRyKSkge1xyXG5cdFx0XHRcdGNhY2hlZEF0dHJzW2F0dHJOYW1lXSA9IGRhdGFBdHRyO1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHQvL2Bjb25maWdgIGlzbid0IGEgcmVhbCBhdHRyaWJ1dGVzLCBzbyBpZ25vcmUgaXRcclxuXHRcdFx0XHRcdGlmIChhdHRyTmFtZSA9PT0gXCJjb25maWdcIiB8fCBhdHRyTmFtZSA9PSBcImtleVwiKSBjb250aW51ZTtcclxuXHRcdFx0XHRcdC8vaG9vayBldmVudCBoYW5kbGVycyB0byB0aGUgYXV0by1yZWRyYXdpbmcgc3lzdGVtXHJcblx0XHRcdFx0XHRlbHNlIGlmICh0eXBlb2YgZGF0YUF0dHIgPT09IEZVTkNUSU9OICYmIGF0dHJOYW1lLmluZGV4T2YoXCJvblwiKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRub2RlW2F0dHJOYW1lXSA9IGF1dG9yZWRyYXcoZGF0YUF0dHIsIG5vZGUpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvL2hhbmRsZSBgc3R5bGU6IHsuLi59YFxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwic3R5bGVcIiAmJiBkYXRhQXR0ciAhPSBudWxsICYmIHR5cGUuY2FsbChkYXRhQXR0cikgPT09IE9CSkVDVCkge1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBydWxlIGluIGRhdGFBdHRyKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGNhY2hlZEF0dHIgPT0gbnVsbCB8fCBjYWNoZWRBdHRyW3J1bGVdICE9PSBkYXRhQXR0cltydWxlXSkgbm9kZS5zdHlsZVtydWxlXSA9IGRhdGFBdHRyW3J1bGVdXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgcnVsZSBpbiBjYWNoZWRBdHRyKSB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCEocnVsZSBpbiBkYXRhQXR0cikpIG5vZGUuc3R5bGVbcnVsZV0gPSBcIlwiXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vaGFuZGxlIFNWR1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAobmFtZXNwYWNlICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBcImhyZWZcIikgbm9kZS5zZXRBdHRyaWJ1dGVOUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiwgXCJocmVmXCIsIGRhdGFBdHRyKTtcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwiY2xhc3NOYW1lXCIpIG5vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgZGF0YUF0dHIpO1xyXG5cdFx0XHRcdFx0XHRlbHNlIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBkYXRhQXR0cilcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vaGFuZGxlIGNhc2VzIHRoYXQgYXJlIHByb3BlcnRpZXMgKGJ1dCBpZ25vcmUgY2FzZXMgd2hlcmUgd2Ugc2hvdWxkIHVzZSBzZXRBdHRyaWJ1dGUgaW5zdGVhZClcclxuXHRcdFx0XHRcdC8vLSBsaXN0IGFuZCBmb3JtIGFyZSB0eXBpY2FsbHkgdXNlZCBhcyBzdHJpbmdzLCBidXQgYXJlIERPTSBlbGVtZW50IHJlZmVyZW5jZXMgaW4ganNcclxuXHRcdFx0XHRcdC8vLSB3aGVuIHVzaW5nIENTUyBzZWxlY3RvcnMgKGUuZy4gYG0oXCJbc3R5bGU9JyddXCIpYCksIHN0eWxlIGlzIHVzZWQgYXMgYSBzdHJpbmcsIGJ1dCBpdCdzIGFuIG9iamVjdCBpbiBqc1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgaW4gbm9kZSAmJiAhKGF0dHJOYW1lID09PSBcImxpc3RcIiB8fCBhdHRyTmFtZSA9PT0gXCJzdHlsZVwiIHx8IGF0dHJOYW1lID09PSBcImZvcm1cIiB8fCBhdHRyTmFtZSA9PT0gXCJ0eXBlXCIgfHwgYXR0ck5hbWUgPT09IFwid2lkdGhcIiB8fCBhdHRyTmFtZSA9PT0gXCJoZWlnaHRcIikpIHtcclxuXHRcdFx0XHRcdFx0Ly8jMzQ4IGRvbid0IHNldCB0aGUgdmFsdWUgaWYgbm90IG5lZWRlZCBvdGhlcndpc2UgY3Vyc29yIHBsYWNlbWVudCBicmVha3MgaW4gQ2hyb21lXHJcblx0XHRcdFx0XHRcdGlmICh0YWcgIT09IFwiaW5wdXRcIiB8fCBub2RlW2F0dHJOYW1lXSAhPT0gZGF0YUF0dHIpIG5vZGVbYXR0ck5hbWVdID0gZGF0YUF0dHJcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0Ly9zd2FsbG93IElFJ3MgaW52YWxpZCBhcmd1bWVudCBlcnJvcnMgdG8gbWltaWMgSFRNTCdzIGZhbGxiYWNrLXRvLWRvaW5nLW5vdGhpbmctb24taW52YWxpZC1hdHRyaWJ1dGVzIGJlaGF2aW9yXHJcblx0XHRcdFx0XHRpZiAoZS5tZXNzYWdlLmluZGV4T2YoXCJJbnZhbGlkIGFyZ3VtZW50XCIpIDwgMCkgdGhyb3cgZVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvLyMzNDggZGF0YUF0dHIgbWF5IG5vdCBiZSBhIHN0cmluZywgc28gdXNlIGxvb3NlIGNvbXBhcmlzb24gKGRvdWJsZSBlcXVhbCkgaW5zdGVhZCBvZiBzdHJpY3QgKHRyaXBsZSBlcXVhbClcclxuXHRcdFx0ZWxzZSBpZiAoYXR0ck5hbWUgPT09IFwidmFsdWVcIiAmJiB0YWcgPT09IFwiaW5wdXRcIiAmJiBub2RlLnZhbHVlICE9IGRhdGFBdHRyKSB7XHJcblx0XHRcdFx0bm9kZS52YWx1ZSA9IGRhdGFBdHRyXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBjYWNoZWRBdHRyc1xyXG5cdH1cclxuXHRmdW5jdGlvbiBjbGVhcihub2RlcywgY2FjaGVkKSB7XHJcblx0XHRmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuXHRcdFx0aWYgKG5vZGVzW2ldICYmIG5vZGVzW2ldLnBhcmVudE5vZGUpIHtcclxuXHRcdFx0XHR0cnkge25vZGVzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZXNbaV0pfVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7fSAvL2lnbm9yZSBpZiB0aGlzIGZhaWxzIGR1ZSB0byBvcmRlciBvZiBldmVudHMgKHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIxOTI2MDgzL2ZhaWxlZC10by1leGVjdXRlLXJlbW92ZWNoaWxkLW9uLW5vZGUpXHJcblx0XHRcdFx0Y2FjaGVkID0gW10uY29uY2F0KGNhY2hlZCk7XHJcblx0XHRcdFx0aWYgKGNhY2hlZFtpXSkgdW5sb2FkKGNhY2hlZFtpXSlcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKG5vZGVzLmxlbmd0aCAhPSAwKSBub2Rlcy5sZW5ndGggPSAwXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHVubG9hZChjYWNoZWQpIHtcclxuXHRcdGlmIChjYWNoZWQuY29uZmlnQ29udGV4dCAmJiB0eXBlb2YgY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQgPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkKCk7XHJcblx0XHRcdGNhY2hlZC5jb25maWdDb250ZXh0Lm9udW5sb2FkID0gbnVsbFxyXG5cdFx0fVxyXG5cdFx0aWYgKGNhY2hlZC5jb250cm9sbGVycykge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgY29udHJvbGxlcjsgY29udHJvbGxlciA9IGNhY2hlZC5jb250cm9sbGVyc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBjb250cm9sbGVyLm9udW5sb2FkID09PSBGVU5DVElPTikgY29udHJvbGxlci5vbnVubG9hZCh7cHJldmVudERlZmF1bHQ6IG5vb3B9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYgKGNhY2hlZC5jaGlsZHJlbikge1xyXG5cdFx0XHRpZiAodHlwZS5jYWxsKGNhY2hlZC5jaGlsZHJlbikgPT09IEFSUkFZKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNoaWxkOyBjaGlsZCA9IGNhY2hlZC5jaGlsZHJlbltpXTsgaSsrKSB1bmxvYWQoY2hpbGQpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoY2FjaGVkLmNoaWxkcmVuLnRhZykgdW5sb2FkKGNhY2hlZC5jaGlsZHJlbilcclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSkge1xyXG5cdFx0dmFyIG5leHRTaWJsaW5nID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XTtcclxuXHRcdGlmIChuZXh0U2libGluZykge1xyXG5cdFx0XHR2YXIgaXNFbGVtZW50ID0gbmV4dFNpYmxpbmcubm9kZVR5cGUgIT0gMTtcclxuXHRcdFx0dmFyIHBsYWNlaG9sZGVyID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG5cdFx0XHRpZiAoaXNFbGVtZW50KSB7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIG5leHRTaWJsaW5nIHx8IG51bGwpO1xyXG5cdFx0XHRcdHBsYWNlaG9sZGVyLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGRhdGEpO1xyXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQocGxhY2Vob2xkZXIpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBuZXh0U2libGluZy5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmViZWdpblwiLCBkYXRhKVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBwYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBkYXRhKTtcclxuXHRcdHZhciBub2RlcyA9IFtdO1xyXG5cdFx0d2hpbGUgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gIT09IG5leHRTaWJsaW5nKSB7XHJcblx0XHRcdG5vZGVzLnB1c2gocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSk7XHJcblx0XHRcdGluZGV4KytcclxuXHRcdH1cclxuXHRcdHJldHVybiBub2Rlc1xyXG5cdH1cclxuXHRmdW5jdGlvbiBhdXRvcmVkcmF3KGNhbGxiYWNrLCBvYmplY3QpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImRpZmZcIik7XHJcblx0XHRcdG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0XHR0cnkge3JldHVybiBjYWxsYmFjay5jYWxsKG9iamVjdCwgZSl9XHJcblx0XHRcdGZpbmFsbHkge1xyXG5cdFx0XHRcdGVuZEZpcnN0Q29tcHV0YXRpb24oKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR2YXIgaHRtbDtcclxuXHR2YXIgZG9jdW1lbnROb2RlID0ge1xyXG5cdFx0YXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKG5vZGUpIHtcclxuXHRcdFx0aWYgKGh0bWwgPT09IHVuZGVmaW5lZCkgaHRtbCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaHRtbFwiKTtcclxuXHRcdFx0aWYgKCRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAhPT0gbm9kZSkge1xyXG5cdFx0XHRcdCRkb2N1bWVudC5yZXBsYWNlQ2hpbGQobm9kZSwgJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudClcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlICRkb2N1bWVudC5hcHBlbmRDaGlsZChub2RlKTtcclxuXHRcdFx0dGhpcy5jaGlsZE5vZGVzID0gJGRvY3VtZW50LmNoaWxkTm9kZXNcclxuXHRcdH0sXHJcblx0XHRpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKG5vZGUpIHtcclxuXHRcdFx0dGhpcy5hcHBlbmRDaGlsZChub2RlKVxyXG5cdFx0fSxcclxuXHRcdGNoaWxkTm9kZXM6IFtdXHJcblx0fTtcclxuXHR2YXIgbm9kZUNhY2hlID0gW10sIGNlbGxDYWNoZSA9IHt9O1xyXG5cdG0ucmVuZGVyID0gZnVuY3Rpb24ocm9vdCwgY2VsbCwgZm9yY2VSZWNyZWF0aW9uKSB7XHJcblx0XHR2YXIgY29uZmlncyA9IFtdO1xyXG5cdFx0aWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoXCJFbnN1cmUgdGhlIERPTSBlbGVtZW50IGJlaW5nIHBhc3NlZCB0byBtLnJvdXRlL20ubW91bnQvbS5yZW5kZXIgaXMgbm90IHVuZGVmaW5lZC5cIik7XHJcblx0XHR2YXIgaWQgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdCk7XHJcblx0XHR2YXIgaXNEb2N1bWVudFJvb3QgPSByb290ID09PSAkZG9jdW1lbnQ7XHJcblx0XHR2YXIgbm9kZSA9IGlzRG9jdW1lbnRSb290IHx8IHJvb3QgPT09ICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyBkb2N1bWVudE5vZGUgOiByb290O1xyXG5cdFx0aWYgKGlzRG9jdW1lbnRSb290ICYmIGNlbGwudGFnICE9IFwiaHRtbFwiKSBjZWxsID0ge3RhZzogXCJodG1sXCIsIGF0dHJzOiB7fSwgY2hpbGRyZW46IGNlbGx9O1xyXG5cdFx0aWYgKGNlbGxDYWNoZVtpZF0gPT09IHVuZGVmaW5lZCkgY2xlYXIobm9kZS5jaGlsZE5vZGVzKTtcclxuXHRcdGlmIChmb3JjZVJlY3JlYXRpb24gPT09IHRydWUpIHJlc2V0KHJvb3QpO1xyXG5cdFx0Y2VsbENhY2hlW2lkXSA9IGJ1aWxkKG5vZGUsIG51bGwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjZWxsLCBjZWxsQ2FjaGVbaWRdLCBmYWxzZSwgMCwgbnVsbCwgdW5kZWZpbmVkLCBjb25maWdzKTtcclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBjb25maWdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSBjb25maWdzW2ldKClcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIGdldENlbGxDYWNoZUtleShlbGVtZW50KSB7XHJcblx0XHR2YXIgaW5kZXggPSBub2RlQ2FjaGUuaW5kZXhPZihlbGVtZW50KTtcclxuXHRcdHJldHVybiBpbmRleCA8IDAgPyBub2RlQ2FjaGUucHVzaChlbGVtZW50KSAtIDEgOiBpbmRleFxyXG5cdH1cclxuXHJcblx0bS50cnVzdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHR2YWx1ZSA9IG5ldyBTdHJpbmcodmFsdWUpO1xyXG5cdFx0dmFsdWUuJHRydXN0ZWQgPSB0cnVlO1xyXG5cdFx0cmV0dXJuIHZhbHVlXHJcblx0fTtcclxuXHJcblx0ZnVuY3Rpb24gZ2V0dGVyc2V0dGVyKHN0b3JlKSB7XHJcblx0XHR2YXIgcHJvcCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCkgc3RvcmUgPSBhcmd1bWVudHNbMF07XHJcblx0XHRcdHJldHVybiBzdG9yZVxyXG5cdFx0fTtcclxuXHJcblx0XHRwcm9wLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gc3RvcmVcclxuXHRcdH07XHJcblxyXG5cdFx0cmV0dXJuIHByb3BcclxuXHR9XHJcblxyXG5cdG0ucHJvcCA9IGZ1bmN0aW9uIChzdG9yZSkge1xyXG5cdFx0Ly9ub3RlOiB1c2luZyBub24tc3RyaWN0IGVxdWFsaXR5IGNoZWNrIGhlcmUgYmVjYXVzZSB3ZSdyZSBjaGVja2luZyBpZiBzdG9yZSBpcyBudWxsIE9SIHVuZGVmaW5lZFxyXG5cdFx0aWYgKCgoc3RvcmUgIT0gbnVsbCAmJiB0eXBlLmNhbGwoc3RvcmUpID09PSBPQkpFQ1QpIHx8IHR5cGVvZiBzdG9yZSA9PT0gRlVOQ1RJT04pICYmIHR5cGVvZiBzdG9yZS50aGVuID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGlmeShzdG9yZSlcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZ2V0dGVyc2V0dGVyKHN0b3JlKVxyXG5cdH07XHJcblxyXG5cdHZhciByb290cyA9IFtdLCBjb21wb25lbnRzID0gW10sIGNvbnRyb2xsZXJzID0gW10sIGxhc3RSZWRyYXdJZCA9IG51bGwsIGxhc3RSZWRyYXdDYWxsVGltZSA9IDAsIGNvbXB1dGVQcmVSZWRyYXdIb29rID0gbnVsbCwgY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbCwgcHJldmVudGVkID0gZmFsc2UsIHRvcENvbXBvbmVudCwgdW5sb2FkZXJzID0gW107XHJcblx0dmFyIEZSQU1FX0JVREdFVCA9IDE2OyAvLzYwIGZyYW1lcyBwZXIgc2Vjb25kID0gMSBjYWxsIHBlciAxNiBtc1xyXG5cdGZ1bmN0aW9uIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIGFyZ3MpIHtcclxuXHRcdHZhciBjb250cm9sbGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAoY29tcG9uZW50LmNvbnRyb2xsZXIgfHwgbm9vcCkuYXBwbHkodGhpcywgYXJncykgfHwgdGhpc1xyXG5cdFx0fVxyXG5cdFx0dmFyIHZpZXcgPSBmdW5jdGlvbihjdHJsKSB7XHJcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJncyA9IGFyZ3MuY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcclxuXHRcdFx0cmV0dXJuIGNvbXBvbmVudC52aWV3LmFwcGx5KGNvbXBvbmVudCwgYXJncyA/IFtjdHJsXS5jb25jYXQoYXJncykgOiBbY3RybF0pXHJcblx0XHR9XHJcblx0XHR2aWV3LiRvcmlnaW5hbCA9IGNvbXBvbmVudC52aWV3XHJcblx0XHR2YXIgb3V0cHV0ID0ge2NvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIHZpZXc6IHZpZXd9XHJcblx0XHRpZiAoYXJnc1swXSAmJiBhcmdzWzBdLmtleSAhPSBudWxsKSBvdXRwdXQuYXR0cnMgPSB7a2V5OiBhcmdzWzBdLmtleX1cclxuXHRcdHJldHVybiBvdXRwdXRcclxuXHR9XHJcblx0bS5jb21wb25lbnQgPSBmdW5jdGlvbihjb21wb25lbnQpIHtcclxuXHRcdHJldHVybiBwYXJhbWV0ZXJpemUoY29tcG9uZW50LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpXHJcblx0fVxyXG5cdG0ubW91bnQgPSBtLm1vZHVsZSA9IGZ1bmN0aW9uKHJvb3QsIGNvbXBvbmVudCkge1xyXG5cdFx0aWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZW5zdXJlIHRoZSBET00gZWxlbWVudCBleGlzdHMgYmVmb3JlIHJlbmRlcmluZyBhIHRlbXBsYXRlIGludG8gaXQuXCIpO1xyXG5cdFx0dmFyIGluZGV4ID0gcm9vdHMuaW5kZXhPZihyb290KTtcclxuXHRcdGlmIChpbmRleCA8IDApIGluZGV4ID0gcm9vdHMubGVuZ3RoO1xyXG5cdFx0XHJcblx0XHR2YXIgaXNQcmV2ZW50ZWQgPSBmYWxzZTtcclxuXHRcdHZhciBldmVudCA9IHtwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlzUHJldmVudGVkID0gdHJ1ZTtcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsO1xyXG5cdFx0fX07XHJcblx0XHRmb3IgKHZhciBpID0gMCwgdW5sb2FkZXI7IHVubG9hZGVyID0gdW5sb2FkZXJzW2ldOyBpKyspIHtcclxuXHRcdFx0dW5sb2FkZXIuaGFuZGxlci5jYWxsKHVubG9hZGVyLmNvbnRyb2xsZXIsIGV2ZW50KVxyXG5cdFx0XHR1bmxvYWRlci5jb250cm9sbGVyLm9udW5sb2FkID0gbnVsbFxyXG5cdFx0fVxyXG5cdFx0aWYgKGlzUHJldmVudGVkKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCB1bmxvYWRlcjsgdW5sb2FkZXIgPSB1bmxvYWRlcnNbaV07IGkrKykgdW5sb2FkZXIuY29udHJvbGxlci5vbnVubG9hZCA9IHVubG9hZGVyLmhhbmRsZXJcclxuXHRcdH1cclxuXHRcdGVsc2UgdW5sb2FkZXJzID0gW11cclxuXHRcdFxyXG5cdFx0aWYgKGNvbnRyb2xsZXJzW2luZGV4XSAmJiB0eXBlb2YgY29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRjb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQoZXZlbnQpXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmICghaXNQcmV2ZW50ZWQpIHtcclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJhbGxcIik7XHJcblx0XHRcdG0uc3RhcnRDb21wdXRhdGlvbigpO1xyXG5cdFx0XHRyb290c1tpbmRleF0gPSByb290O1xyXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIGNvbXBvbmVudCA9IHN1YmNvbXBvbmVudChjb21wb25lbnQsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSlcclxuXHRcdFx0dmFyIGN1cnJlbnRDb21wb25lbnQgPSB0b3BDb21wb25lbnQgPSBjb21wb25lbnQgPSBjb21wb25lbnQgfHwge2NvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge319O1xyXG5cdFx0XHR2YXIgY29uc3RydWN0b3IgPSBjb21wb25lbnQuY29udHJvbGxlciB8fCBub29wXHJcblx0XHRcdHZhciBjb250cm9sbGVyID0gbmV3IGNvbnN0cnVjdG9yO1xyXG5cdFx0XHQvL2NvbnRyb2xsZXJzIG1heSBjYWxsIG0ubW91bnQgcmVjdXJzaXZlbHkgKHZpYSBtLnJvdXRlIHJlZGlyZWN0cywgZm9yIGV4YW1wbGUpXHJcblx0XHRcdC8vdGhpcyBjb25kaXRpb25hbCBlbnN1cmVzIG9ubHkgdGhlIGxhc3QgcmVjdXJzaXZlIG0ubW91bnQgY2FsbCBpcyBhcHBsaWVkXHJcblx0XHRcdGlmIChjdXJyZW50Q29tcG9uZW50ID09PSB0b3BDb21wb25lbnQpIHtcclxuXHRcdFx0XHRjb250cm9sbGVyc1tpbmRleF0gPSBjb250cm9sbGVyO1xyXG5cdFx0XHRcdGNvbXBvbmVudHNbaW5kZXhdID0gY29tcG9uZW50XHJcblx0XHRcdH1cclxuXHRcdFx0ZW5kRmlyc3RDb21wdXRhdGlvbigpO1xyXG5cdFx0XHRyZXR1cm4gY29udHJvbGxlcnNbaW5kZXhdXHJcblx0XHR9XHJcblx0fTtcclxuXHR2YXIgcmVkcmF3aW5nID0gZmFsc2VcclxuXHRtLnJlZHJhdyA9IGZ1bmN0aW9uKGZvcmNlKSB7XHJcblx0XHRpZiAocmVkcmF3aW5nKSByZXR1cm5cclxuXHRcdHJlZHJhd2luZyA9IHRydWVcclxuXHRcdC8vbGFzdFJlZHJhd0lkIGlzIGEgcG9zaXRpdmUgbnVtYmVyIGlmIGEgc2Vjb25kIHJlZHJhdyBpcyByZXF1ZXN0ZWQgYmVmb3JlIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZVxyXG5cdFx0Ly9sYXN0UmVkcmF3SUQgaXMgbnVsbCBpZiBpdCdzIHRoZSBmaXJzdCByZWRyYXcgYW5kIG5vdCBhbiBldmVudCBoYW5kbGVyXHJcblx0XHRpZiAobGFzdFJlZHJhd0lkICYmIGZvcmNlICE9PSB0cnVlKSB7XHJcblx0XHRcdC8vd2hlbiBzZXRUaW1lb3V0OiBvbmx5IHJlc2NoZWR1bGUgcmVkcmF3IGlmIHRpbWUgYmV0d2VlbiBub3cgYW5kIHByZXZpb3VzIHJlZHJhdyBpcyBiaWdnZXIgdGhhbiBhIGZyYW1lLCBvdGhlcndpc2Uga2VlcCBjdXJyZW50bHkgc2NoZWR1bGVkIHRpbWVvdXRcclxuXHRcdFx0Ly93aGVuIHJBRjogYWx3YXlzIHJlc2NoZWR1bGUgcmVkcmF3XHJcblx0XHRcdGlmICgkcmVxdWVzdEFuaW1hdGlvbkZyYW1lID09PSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IG5ldyBEYXRlIC0gbGFzdFJlZHJhd0NhbGxUaW1lID4gRlJBTUVfQlVER0VUKSB7XHJcblx0XHRcdFx0aWYgKGxhc3RSZWRyYXdJZCA+IDApICRjYW5jZWxBbmltYXRpb25GcmFtZShsYXN0UmVkcmF3SWQpO1xyXG5cdFx0XHRcdGxhc3RSZWRyYXdJZCA9ICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVkcmF3LCBGUkFNRV9CVURHRVQpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRyZWRyYXcoKTtcclxuXHRcdFx0bGFzdFJlZHJhd0lkID0gJHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtsYXN0UmVkcmF3SWQgPSBudWxsfSwgRlJBTUVfQlVER0VUKVxyXG5cdFx0fVxyXG5cdFx0cmVkcmF3aW5nID0gZmFsc2VcclxuXHR9O1xyXG5cdG0ucmVkcmF3LnN0cmF0ZWd5ID0gbS5wcm9wKCk7XHJcblx0ZnVuY3Rpb24gcmVkcmF3KCkge1xyXG5cdFx0aWYgKGNvbXB1dGVQcmVSZWRyYXdIb29rKSB7XHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rKClcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBudWxsXHJcblx0XHR9XHJcblx0XHRmb3IgKHZhciBpID0gMCwgcm9vdDsgcm9vdCA9IHJvb3RzW2ldOyBpKyspIHtcclxuXHRcdFx0aWYgKGNvbnRyb2xsZXJzW2ldKSB7XHJcblx0XHRcdFx0dmFyIGFyZ3MgPSBjb21wb25lbnRzW2ldLmNvbnRyb2xsZXIgJiYgY29tcG9uZW50c1tpXS5jb250cm9sbGVyLiQkYXJncyA/IFtjb250cm9sbGVyc1tpXV0uY29uY2F0KGNvbXBvbmVudHNbaV0uY29udHJvbGxlci4kJGFyZ3MpIDogW2NvbnRyb2xsZXJzW2ldXVxyXG5cdFx0XHRcdG0ucmVuZGVyKHJvb3QsIGNvbXBvbmVudHNbaV0udmlldyA/IGNvbXBvbmVudHNbaV0udmlldyhjb250cm9sbGVyc1tpXSwgYXJncykgOiBcIlwiKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL2FmdGVyIHJlbmRlcmluZyB3aXRoaW4gYSByb3V0ZWQgY29udGV4dCwgd2UgbmVlZCB0byBzY3JvbGwgYmFjayB0byB0aGUgdG9wLCBhbmQgZmV0Y2ggdGhlIGRvY3VtZW50IHRpdGxlIGZvciBoaXN0b3J5LnB1c2hTdGF0ZVxyXG5cdFx0aWYgKGNvbXB1dGVQb3N0UmVkcmF3SG9vaykge1xyXG5cdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2soKTtcclxuXHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbFxyXG5cdFx0fVxyXG5cdFx0bGFzdFJlZHJhd0lkID0gbnVsbDtcclxuXHRcdGxhc3RSZWRyYXdDYWxsVGltZSA9IG5ldyBEYXRlO1xyXG5cdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpXHJcblx0fVxyXG5cclxuXHR2YXIgcGVuZGluZ1JlcXVlc3RzID0gMDtcclxuXHRtLnN0YXJ0Q29tcHV0YXRpb24gPSBmdW5jdGlvbigpIHtwZW5kaW5nUmVxdWVzdHMrK307XHJcblx0bS5lbmRDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cGVuZGluZ1JlcXVlc3RzID0gTWF0aC5tYXgocGVuZGluZ1JlcXVlc3RzIC0gMSwgMCk7XHJcblx0XHRpZiAocGVuZGluZ1JlcXVlc3RzID09PSAwKSBtLnJlZHJhdygpXHJcblx0fTtcclxuXHR2YXIgZW5kRmlyc3RDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKG0ucmVkcmF3LnN0cmF0ZWd5KCkgPT0gXCJub25lXCIpIHtcclxuXHRcdFx0cGVuZGluZ1JlcXVlc3RzLS1cclxuXHRcdFx0bS5yZWRyYXcuc3RyYXRlZ3koXCJkaWZmXCIpXHJcblx0XHR9XHJcblx0XHRlbHNlIG0uZW5kQ29tcHV0YXRpb24oKTtcclxuXHR9XHJcblxyXG5cdG0ud2l0aEF0dHIgPSBmdW5jdGlvbihwcm9wLCB3aXRoQXR0ckNhbGxiYWNrKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgdGhpcztcclxuXHRcdFx0d2l0aEF0dHJDYWxsYmFjayhwcm9wIGluIGN1cnJlbnRUYXJnZXQgPyBjdXJyZW50VGFyZ2V0W3Byb3BdIDogY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUocHJvcCkpXHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly9yb3V0aW5nXHJcblx0dmFyIG1vZGVzID0ge3BhdGhuYW1lOiBcIlwiLCBoYXNoOiBcIiNcIiwgc2VhcmNoOiBcIj9cIn07XHJcblx0dmFyIHJlZGlyZWN0ID0gbm9vcCwgcm91dGVQYXJhbXMsIGN1cnJlbnRSb3V0ZSwgaXNEZWZhdWx0Um91dGUgPSBmYWxzZTtcclxuXHRtLnJvdXRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHQvL20ucm91dGUoKVxyXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50Um91dGU7XHJcblx0XHQvL20ucm91dGUoZWwsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKVxyXG5cdFx0ZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJiB0eXBlLmNhbGwoYXJndW1lbnRzWzFdKSA9PT0gU1RSSU5HKSB7XHJcblx0XHRcdHZhciByb290ID0gYXJndW1lbnRzWzBdLCBkZWZhdWx0Um91dGUgPSBhcmd1bWVudHNbMV0sIHJvdXRlciA9IGFyZ3VtZW50c1syXTtcclxuXHRcdFx0cmVkaXJlY3QgPSBmdW5jdGlvbihzb3VyY2UpIHtcclxuXHRcdFx0XHR2YXIgcGF0aCA9IGN1cnJlbnRSb3V0ZSA9IG5vcm1hbGl6ZVJvdXRlKHNvdXJjZSk7XHJcblx0XHRcdFx0aWYgKCFyb3V0ZUJ5VmFsdWUocm9vdCwgcm91dGVyLCBwYXRoKSkge1xyXG5cdFx0XHRcdFx0aWYgKGlzRGVmYXVsdFJvdXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnN1cmUgdGhlIGRlZmF1bHQgcm91dGUgbWF0Y2hlcyBvbmUgb2YgdGhlIHJvdXRlcyBkZWZpbmVkIGluIG0ucm91dGVcIilcclxuXHRcdFx0XHRcdGlzRGVmYXVsdFJvdXRlID0gdHJ1ZVxyXG5cdFx0XHRcdFx0bS5yb3V0ZShkZWZhdWx0Um91dGUsIHRydWUpXHJcblx0XHRcdFx0XHRpc0RlZmF1bHRSb3V0ZSA9IGZhbHNlXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0XHR2YXIgbGlzdGVuZXIgPSBtLnJvdXRlLm1vZGUgPT09IFwiaGFzaFwiID8gXCJvbmhhc2hjaGFuZ2VcIiA6IFwib25wb3BzdGF0ZVwiO1xyXG5cdFx0XHR3aW5kb3dbbGlzdGVuZXJdID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHBhdGggPSAkbG9jYXRpb25bbS5yb3V0ZS5tb2RlXVxyXG5cdFx0XHRcdGlmIChtLnJvdXRlLm1vZGUgPT09IFwicGF0aG5hbWVcIikgcGF0aCArPSAkbG9jYXRpb24uc2VhcmNoXHJcblx0XHRcdFx0aWYgKGN1cnJlbnRSb3V0ZSAhPSBub3JtYWxpemVSb3V0ZShwYXRoKSkge1xyXG5cdFx0XHRcdFx0cmVkaXJlY3QocGF0aClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gc2V0U2Nyb2xsO1xyXG5cdFx0XHR3aW5kb3dbbGlzdGVuZXJdKClcclxuXHRcdH1cclxuXHRcdC8vY29uZmlnOiBtLnJvdXRlXHJcblx0XHRlbHNlIGlmIChhcmd1bWVudHNbMF0uYWRkRXZlbnRMaXN0ZW5lciB8fCBhcmd1bWVudHNbMF0uYXR0YWNoRXZlbnQpIHtcclxuXHRcdFx0dmFyIGVsZW1lbnQgPSBhcmd1bWVudHNbMF07XHJcblx0XHRcdHZhciBpc0luaXRpYWxpemVkID0gYXJndW1lbnRzWzFdO1xyXG5cdFx0XHR2YXIgY29udGV4dCA9IGFyZ3VtZW50c1syXTtcclxuXHRcdFx0dmFyIHZkb20gPSBhcmd1bWVudHNbM107XHJcblx0XHRcdGVsZW1lbnQuaHJlZiA9IChtLnJvdXRlLm1vZGUgIT09ICdwYXRobmFtZScgPyAkbG9jYXRpb24ucGF0aG5hbWUgOiAnJykgKyBtb2Rlc1ttLnJvdXRlLm1vZGVdICsgdmRvbS5hdHRycy5ocmVmO1xyXG5cdFx0XHRpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XHJcblx0XHRcdFx0ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSk7XHJcblx0XHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcm91dGVVbm9idHJ1c2l2ZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRlbGVtZW50LmRldGFjaEV2ZW50KFwib25jbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0XHRlbGVtZW50LmF0dGFjaEV2ZW50KFwib25jbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvL20ucm91dGUocm91dGUsIHBhcmFtcywgc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSlcclxuXHRcdGVsc2UgaWYgKHR5cGUuY2FsbChhcmd1bWVudHNbMF0pID09PSBTVFJJTkcpIHtcclxuXHRcdFx0dmFyIG9sZFJvdXRlID0gY3VycmVudFJvdXRlO1xyXG5cdFx0XHRjdXJyZW50Um91dGUgPSBhcmd1bWVudHNbMF07XHJcblx0XHRcdHZhciBhcmdzID0gYXJndW1lbnRzWzFdIHx8IHt9XHJcblx0XHRcdHZhciBxdWVyeUluZGV4ID0gY3VycmVudFJvdXRlLmluZGV4T2YoXCI/XCIpXHJcblx0XHRcdHZhciBwYXJhbXMgPSBxdWVyeUluZGV4ID4gLTEgPyBwYXJzZVF1ZXJ5U3RyaW5nKGN1cnJlbnRSb3V0ZS5zbGljZShxdWVyeUluZGV4ICsgMSkpIDoge31cclxuXHRcdFx0Zm9yICh2YXIgaSBpbiBhcmdzKSBwYXJhbXNbaV0gPSBhcmdzW2ldXHJcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcocGFyYW1zKVxyXG5cdFx0XHR2YXIgY3VycmVudFBhdGggPSBxdWVyeUluZGV4ID4gLTEgPyBjdXJyZW50Um91dGUuc2xpY2UoMCwgcXVlcnlJbmRleCkgOiBjdXJyZW50Um91dGVcclxuXHRcdFx0aWYgKHF1ZXJ5c3RyaW5nKSBjdXJyZW50Um91dGUgPSBjdXJyZW50UGF0aCArIChjdXJyZW50UGF0aC5pbmRleE9mKFwiP1wiKSA9PT0gLTEgPyBcIj9cIiA6IFwiJlwiKSArIHF1ZXJ5c3RyaW5nO1xyXG5cclxuXHRcdFx0dmFyIHNob3VsZFJlcGxhY2VIaXN0b3J5RW50cnkgPSAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyA/IGFyZ3VtZW50c1syXSA6IGFyZ3VtZW50c1sxXSkgPT09IHRydWUgfHwgb2xkUm91dGUgPT09IGFyZ3VtZW50c1swXTtcclxuXHJcblx0XHRcdGlmICh3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcclxuXHRcdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IHNldFNjcm9sbFxyXG5cdFx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0d2luZG93Lmhpc3Rvcnlbc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA/IFwicmVwbGFjZVN0YXRlXCIgOiBcInB1c2hTdGF0ZVwiXShudWxsLCAkZG9jdW1lbnQudGl0bGUsIG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0cmVkaXJlY3QobW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHQkbG9jYXRpb25bbS5yb3V0ZS5tb2RlXSA9IGN1cnJlbnRSb3V0ZVxyXG5cdFx0XHRcdHJlZGlyZWN0KG1vZGVzW20ucm91dGUubW9kZV0gKyBjdXJyZW50Um91dGUpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cdG0ucm91dGUucGFyYW0gPSBmdW5jdGlvbihrZXkpIHtcclxuXHRcdGlmICghcm91dGVQYXJhbXMpIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGNhbGwgbS5yb3V0ZShlbGVtZW50LCBkZWZhdWx0Um91dGUsIHJvdXRlcykgYmVmb3JlIGNhbGxpbmcgbS5yb3V0ZS5wYXJhbSgpXCIpXHJcblx0XHRyZXR1cm4gcm91dGVQYXJhbXNba2V5XVxyXG5cdH07XHJcblx0bS5yb3V0ZS5tb2RlID0gXCJzZWFyY2hcIjtcclxuXHRmdW5jdGlvbiBub3JtYWxpemVSb3V0ZShyb3V0ZSkge1xyXG5cdFx0cmV0dXJuIHJvdXRlLnNsaWNlKG1vZGVzW20ucm91dGUubW9kZV0ubGVuZ3RoKVxyXG5cdH1cclxuXHRmdW5jdGlvbiByb3V0ZUJ5VmFsdWUocm9vdCwgcm91dGVyLCBwYXRoKSB7XHJcblx0XHRyb3V0ZVBhcmFtcyA9IHt9O1xyXG5cclxuXHRcdHZhciBxdWVyeVN0YXJ0ID0gcGF0aC5pbmRleE9mKFwiP1wiKTtcclxuXHRcdGlmIChxdWVyeVN0YXJ0ICE9PSAtMSkge1xyXG5cdFx0XHRyb3V0ZVBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcocGF0aC5zdWJzdHIocXVlcnlTdGFydCArIDEsIHBhdGgubGVuZ3RoKSk7XHJcblx0XHRcdHBhdGggPSBwYXRoLnN1YnN0cigwLCBxdWVyeVN0YXJ0KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCBhbGwgcm91dGVzIGFuZCBjaGVjayBpZiB0aGVyZSdzXHJcblx0XHQvLyBhbiBleGFjdCBtYXRjaCBmb3IgdGhlIGN1cnJlbnQgcGF0aFxyXG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb3V0ZXIpO1xyXG5cdFx0dmFyIGluZGV4ID0ga2V5cy5pbmRleE9mKHBhdGgpO1xyXG5cdFx0aWYoaW5kZXggIT09IC0xKXtcclxuXHRcdFx0bS5tb3VudChyb290LCByb3V0ZXJba2V5cyBbaW5kZXhdXSk7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIHJvdXRlIGluIHJvdXRlcikge1xyXG5cdFx0XHRpZiAocm91dGUgPT09IHBhdGgpIHtcclxuXHRcdFx0XHRtLm1vdW50KHJvb3QsIHJvdXRlcltyb3V0ZV0pO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBtYXRjaGVyID0gbmV3IFJlZ0V4cChcIl5cIiArIHJvdXRlLnJlcGxhY2UoLzpbXlxcL10rP1xcLnszfS9nLCBcIiguKj8pXCIpLnJlcGxhY2UoLzpbXlxcL10rL2csIFwiKFteXFxcXC9dKylcIikgKyBcIlxcLz8kXCIpO1xyXG5cclxuXHRcdFx0aWYgKG1hdGNoZXIudGVzdChwYXRoKSkge1xyXG5cdFx0XHRcdHBhdGgucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHZhciBrZXlzID0gcm91dGUubWF0Y2goLzpbXlxcL10rL2cpIHx8IFtdO1xyXG5cdFx0XHRcdFx0dmFyIHZhbHVlcyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAtMik7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykgcm91dGVQYXJhbXNba2V5c1tpXS5yZXBsYWNlKC86fFxcLi9nLCBcIlwiKV0gPSBkZWNvZGVVUklDb21wb25lbnQodmFsdWVzW2ldKVxyXG5cdFx0XHRcdFx0bS5tb3VudChyb290LCByb3V0ZXJbcm91dGVdKVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gcm91dGVVbm9idHJ1c2l2ZShlKSB7XHJcblx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdGlmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUud2hpY2ggPT09IDIpIHJldHVybjtcclxuXHRcdGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRlbHNlIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdHZhciBjdXJyZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcclxuXHRcdHZhciBhcmdzID0gbS5yb3V0ZS5tb2RlID09PSBcInBhdGhuYW1lXCIgJiYgY3VycmVudFRhcmdldC5zZWFyY2ggPyBwYXJzZVF1ZXJ5U3RyaW5nKGN1cnJlbnRUYXJnZXQuc2VhcmNoLnNsaWNlKDEpKSA6IHt9O1xyXG5cdFx0d2hpbGUgKGN1cnJlbnRUYXJnZXQgJiYgY3VycmVudFRhcmdldC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9IFwiQVwiKSBjdXJyZW50VGFyZ2V0ID0gY3VycmVudFRhcmdldC5wYXJlbnROb2RlXHJcblx0XHRtLnJvdXRlKGN1cnJlbnRUYXJnZXRbbS5yb3V0ZS5tb2RlXS5zbGljZShtb2Rlc1ttLnJvdXRlLm1vZGVdLmxlbmd0aCksIGFyZ3MpXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNldFNjcm9sbCgpIHtcclxuXHRcdGlmIChtLnJvdXRlLm1vZGUgIT0gXCJoYXNoXCIgJiYgJGxvY2F0aW9uLmhhc2gpICRsb2NhdGlvbi5oYXNoID0gJGxvY2F0aW9uLmhhc2g7XHJcblx0XHRlbHNlIHdpbmRvdy5zY3JvbGxUbygwLCAwKVxyXG5cdH1cclxuXHRmdW5jdGlvbiBidWlsZFF1ZXJ5U3RyaW5nKG9iamVjdCwgcHJlZml4KSB7XHJcblx0XHR2YXIgZHVwbGljYXRlcyA9IHt9XHJcblx0XHR2YXIgc3RyID0gW11cclxuXHRcdGZvciAodmFyIHByb3AgaW4gb2JqZWN0KSB7XHJcblx0XHRcdHZhciBrZXkgPSBwcmVmaXggPyBwcmVmaXggKyBcIltcIiArIHByb3AgKyBcIl1cIiA6IHByb3BcclxuXHRcdFx0dmFyIHZhbHVlID0gb2JqZWN0W3Byb3BdXHJcblx0XHRcdHZhciB2YWx1ZVR5cGUgPSB0eXBlLmNhbGwodmFsdWUpXHJcblx0XHRcdHZhciBwYWlyID0gKHZhbHVlID09PSBudWxsKSA/IGVuY29kZVVSSUNvbXBvbmVudChrZXkpIDpcclxuXHRcdFx0XHR2YWx1ZVR5cGUgPT09IE9CSkVDVCA/IGJ1aWxkUXVlcnlTdHJpbmcodmFsdWUsIGtleSkgOlxyXG5cdFx0XHRcdHZhbHVlVHlwZSA9PT0gQVJSQVkgPyB2YWx1ZS5yZWR1Y2UoZnVuY3Rpb24obWVtbywgaXRlbSkge1xyXG5cdFx0XHRcdFx0aWYgKCFkdXBsaWNhdGVzW2tleV0pIGR1cGxpY2F0ZXNba2V5XSA9IHt9XHJcblx0XHRcdFx0XHRpZiAoIWR1cGxpY2F0ZXNba2V5XVtpdGVtXSkge1xyXG5cdFx0XHRcdFx0XHRkdXBsaWNhdGVzW2tleV1baXRlbV0gPSB0cnVlXHJcblx0XHRcdFx0XHRcdHJldHVybiBtZW1vLmNvbmNhdChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0pKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIG1lbW9cclxuXHRcdFx0XHR9LCBbXSkuam9pbihcIiZcIikgOlxyXG5cdFx0XHRcdGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXHJcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSBzdHIucHVzaChwYWlyKVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHN0ci5qb2luKFwiJlwiKVxyXG5cdH1cclxuXHRmdW5jdGlvbiBwYXJzZVF1ZXJ5U3RyaW5nKHN0cikge1xyXG5cdFx0aWYgKHN0ci5jaGFyQXQoMCkgPT09IFwiP1wiKSBzdHIgPSBzdHIuc3Vic3RyaW5nKDEpO1xyXG5cdFx0XHJcblx0XHR2YXIgcGFpcnMgPSBzdHIuc3BsaXQoXCImXCIpLCBwYXJhbXMgPSB7fTtcclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHR2YXIgcGFpciA9IHBhaXJzW2ldLnNwbGl0KFwiPVwiKTtcclxuXHRcdFx0dmFyIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKVxyXG5cdFx0XHR2YXIgdmFsdWUgPSBwYWlyLmxlbmd0aCA9PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pIDogbnVsbFxyXG5cdFx0XHRpZiAocGFyYW1zW2tleV0gIT0gbnVsbCkge1xyXG5cdFx0XHRcdGlmICh0eXBlLmNhbGwocGFyYW1zW2tleV0pICE9PSBBUlJBWSkgcGFyYW1zW2tleV0gPSBbcGFyYW1zW2tleV1dXHJcblx0XHRcdFx0cGFyYW1zW2tleV0ucHVzaCh2YWx1ZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHBhcmFtc1trZXldID0gdmFsdWVcclxuXHRcdH1cclxuXHRcdHJldHVybiBwYXJhbXNcclxuXHR9XHJcblx0bS5yb3V0ZS5idWlsZFF1ZXJ5U3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZ1xyXG5cdG0ucm91dGUucGFyc2VRdWVyeVN0cmluZyA9IHBhcnNlUXVlcnlTdHJpbmdcclxuXHRcclxuXHRmdW5jdGlvbiByZXNldChyb290KSB7XHJcblx0XHR2YXIgY2FjaGVLZXkgPSBnZXRDZWxsQ2FjaGVLZXkocm9vdCk7XHJcblx0XHRjbGVhcihyb290LmNoaWxkTm9kZXMsIGNlbGxDYWNoZVtjYWNoZUtleV0pO1xyXG5cdFx0Y2VsbENhY2hlW2NhY2hlS2V5XSA9IHVuZGVmaW5lZFxyXG5cdH1cclxuXHJcblx0bS5kZWZlcnJlZCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xyXG5cdFx0ZGVmZXJyZWQucHJvbWlzZSA9IHByb3BpZnkoZGVmZXJyZWQucHJvbWlzZSk7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWRcclxuXHR9O1xyXG5cdGZ1bmN0aW9uIHByb3BpZnkocHJvbWlzZSwgaW5pdGlhbFZhbHVlKSB7XHJcblx0XHR2YXIgcHJvcCA9IG0ucHJvcChpbml0aWFsVmFsdWUpO1xyXG5cdFx0cHJvbWlzZS50aGVuKHByb3ApO1xyXG5cdFx0cHJvcC50aGVuID0gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHJldHVybiBwcm9waWZ5KHByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpLCBpbml0aWFsVmFsdWUpXHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIHByb3BcclxuXHR9XHJcblx0Ly9Qcm9taXoubWl0aHJpbC5qcyB8IFpvbG1laXN0ZXIgfCBNSVRcclxuXHQvL2EgbW9kaWZpZWQgdmVyc2lvbiBvZiBQcm9taXouanMsIHdoaWNoIGRvZXMgbm90IGNvbmZvcm0gdG8gUHJvbWlzZXMvQSsgZm9yIHR3byByZWFzb25zOlxyXG5cdC8vMSkgYHRoZW5gIGNhbGxiYWNrcyBhcmUgY2FsbGVkIHN5bmNocm9ub3VzbHkgKGJlY2F1c2Ugc2V0VGltZW91dCBpcyB0b28gc2xvdywgYW5kIHRoZSBzZXRJbW1lZGlhdGUgcG9seWZpbGwgaXMgdG9vIGJpZ1xyXG5cdC8vMikgdGhyb3dpbmcgc3ViY2xhc3NlcyBvZiBFcnJvciBjYXVzZSB0aGUgZXJyb3IgdG8gYmUgYnViYmxlZCB1cCBpbnN0ZWFkIG9mIHRyaWdnZXJpbmcgcmVqZWN0aW9uIChiZWNhdXNlIHRoZSBzcGVjIGRvZXMgbm90IGFjY291bnQgZm9yIHRoZSBpbXBvcnRhbnQgdXNlIGNhc2Ugb2YgZGVmYXVsdCBicm93c2VyIGVycm9yIGhhbmRsaW5nLCBpLmUuIG1lc3NhZ2Ugdy8gbGluZSBudW1iZXIpXHJcblx0ZnVuY3Rpb24gRGVmZXJyZWQoc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcclxuXHRcdHZhciBSRVNPTFZJTkcgPSAxLCBSRUpFQ1RJTkcgPSAyLCBSRVNPTFZFRCA9IDMsIFJFSkVDVEVEID0gNDtcclxuXHRcdHZhciBzZWxmID0gdGhpcywgc3RhdGUgPSAwLCBwcm9taXNlVmFsdWUgPSAwLCBuZXh0ID0gW107XHJcblxyXG5cdFx0c2VsZltcInByb21pc2VcIl0gPSB7fTtcclxuXHJcblx0XHRzZWxmW1wicmVzb2x2ZVwiXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdGlmICghc3RhdGUpIHtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFU09MVklORztcclxuXHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0c2VsZltcInJlamVjdFwiXSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdGlmICghc3RhdGUpIHtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFSkVDVElORztcclxuXHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHRoaXNcclxuXHRcdH07XHJcblxyXG5cdFx0c2VsZi5wcm9taXNlW1widGhlblwiXSA9IGZ1bmN0aW9uKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XHJcblx0XHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XHJcblx0XHRcdGlmIChzdGF0ZSA9PT0gUkVTT0xWRUQpIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VWYWx1ZSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChzdGF0ZSA9PT0gUkVKRUNURUQpIHtcclxuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QocHJvbWlzZVZhbHVlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdG5leHQucHVzaChkZWZlcnJlZClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZVxyXG5cdFx0fTtcclxuXHJcblx0XHRmdW5jdGlvbiBmaW5pc2godHlwZSkge1xyXG5cdFx0XHRzdGF0ZSA9IHR5cGUgfHwgUkVKRUNURUQ7XHJcblx0XHRcdG5leHQubWFwKGZ1bmN0aW9uKGRlZmVycmVkKSB7XHJcblx0XHRcdFx0c3RhdGUgPT09IFJFU09MVkVEICYmIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZVZhbHVlKSB8fCBkZWZlcnJlZC5yZWplY3QocHJvbWlzZVZhbHVlKVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRoZW5uYWJsZSh0aGVuLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaywgbm90VGhlbm5hYmxlQ2FsbGJhY2spIHtcclxuXHRcdFx0aWYgKCgocHJvbWlzZVZhbHVlICE9IG51bGwgJiYgdHlwZS5jYWxsKHByb21pc2VWYWx1ZSkgPT09IE9CSkVDVCkgfHwgdHlwZW9mIHByb21pc2VWYWx1ZSA9PT0gRlVOQ1RJT04pICYmIHR5cGVvZiB0aGVuID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHQvLyBjb3VudCBwcm90ZWN0cyBhZ2FpbnN0IGFidXNlIGNhbGxzIGZyb20gc3BlYyBjaGVja2VyXHJcblx0XHRcdFx0XHR2YXIgY291bnQgPSAwO1xyXG5cdFx0XHRcdFx0dGhlbi5jYWxsKHByb21pc2VWYWx1ZSwgZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvdW50KyspIHJldHVybjtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdHN1Y2Nlc3NDYWxsYmFjaygpXHJcblx0XHRcdFx0XHR9LCBmdW5jdGlvbiAodmFsdWUpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvdW50KyspIHJldHVybjtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gdmFsdWU7XHJcblx0XHRcdFx0XHRcdGZhaWx1cmVDYWxsYmFjaygpXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRcdGZhaWx1cmVDYWxsYmFjaygpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG5vdFRoZW5uYWJsZUNhbGxiYWNrKClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGZpcmUoKSB7XHJcblx0XHRcdC8vIGNoZWNrIGlmIGl0J3MgYSB0aGVuYWJsZVxyXG5cdFx0XHR2YXIgdGhlbjtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHR0aGVuID0gcHJvbWlzZVZhbHVlICYmIHByb21pc2VWYWx1ZS50aGVuXHJcblx0XHRcdH1cclxuXHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFSkVDVElORztcclxuXHRcdFx0XHRyZXR1cm4gZmlyZSgpXHJcblx0XHRcdH1cclxuXHRcdFx0dGhlbm5hYmxlKHRoZW4sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HO1xyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRzdGF0ZSA9IFJFSkVDVElORztcclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fSwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdGlmIChzdGF0ZSA9PT0gUkVTT0xWSU5HICYmIHR5cGVvZiBzdWNjZXNzQ2FsbGJhY2sgPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IHN1Y2Nlc3NDYWxsYmFjayhwcm9taXNlVmFsdWUpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIGlmIChzdGF0ZSA9PT0gUkVKRUNUSU5HICYmIHR5cGVvZiBmYWlsdXJlQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBmYWlsdXJlQ2FsbGJhY2socHJvbWlzZVZhbHVlKTtcclxuXHRcdFx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkdcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGU7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmluaXNoKClcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChwcm9taXNlVmFsdWUgPT09IHNlbGYpIHtcclxuXHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IFR5cGVFcnJvcigpO1xyXG5cdFx0XHRcdFx0ZmluaXNoKClcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHR0aGVubmFibGUodGhlbiwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRmaW5pc2goUkVTT0xWRUQpXHJcblx0XHRcdFx0XHR9LCBmaW5pc2gsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0ZmluaXNoKHN0YXRlID09PSBSRVNPTFZJTkcgJiYgUkVTT0xWRUQpXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9XHJcblx0bS5kZWZlcnJlZC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0aWYgKHR5cGUuY2FsbChlKSA9PT0gXCJbb2JqZWN0IEVycm9yXVwiICYmICFlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goLyBFcnJvci8pKSB0aHJvdyBlXHJcblx0fTtcclxuXHJcblx0bS5zeW5jID0gZnVuY3Rpb24oYXJncykge1xyXG5cdFx0dmFyIG1ldGhvZCA9IFwicmVzb2x2ZVwiO1xyXG5cdFx0ZnVuY3Rpb24gc3luY2hyb25pemVyKHBvcywgcmVzb2x2ZWQpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdFx0cmVzdWx0c1twb3NdID0gdmFsdWU7XHJcblx0XHRcdFx0aWYgKCFyZXNvbHZlZCkgbWV0aG9kID0gXCJyZWplY3RcIjtcclxuXHRcdFx0XHRpZiAoLS1vdXRzdGFuZGluZyA9PT0gMCkge1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWQucHJvbWlzZShyZXN1bHRzKTtcclxuXHRcdFx0XHRcdGRlZmVycmVkW21ldGhvZF0ocmVzdWx0cylcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIHZhbHVlXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgZGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XHJcblx0XHR2YXIgb3V0c3RhbmRpbmcgPSBhcmdzLmxlbmd0aDtcclxuXHRcdHZhciByZXN1bHRzID0gbmV3IEFycmF5KG91dHN0YW5kaW5nKTtcclxuXHRcdGlmIChhcmdzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0YXJnc1tpXS50aGVuKHN5bmNocm9uaXplcihpLCB0cnVlKSwgc3luY2hyb25pemVyKGksIGZhbHNlKSlcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBkZWZlcnJlZC5yZXNvbHZlKFtdKTtcclxuXHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZVxyXG5cdH07XHJcblx0ZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtyZXR1cm4gdmFsdWV9XHJcblxyXG5cdGZ1bmN0aW9uIGFqYXgob3B0aW9ucykge1xyXG5cdFx0aWYgKG9wdGlvbnMuZGF0YVR5cGUgJiYgb3B0aW9ucy5kYXRhVHlwZS50b0xvd2VyQ2FzZSgpID09PSBcImpzb25wXCIpIHtcclxuXHRcdFx0dmFyIGNhbGxiYWNrS2V5ID0gXCJtaXRocmlsX2NhbGxiYWNrX1wiICsgbmV3IERhdGUoKS5nZXRUaW1lKCkgKyBcIl9cIiArIChNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxZTE2KSkudG9TdHJpbmcoMzYpO1xyXG5cdFx0XHR2YXIgc2NyaXB0ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XHJcblxyXG5cdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gZnVuY3Rpb24ocmVzcCkge1xyXG5cdFx0XHRcdHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XHJcblx0XHRcdFx0b3B0aW9ucy5vbmxvYWQoe1xyXG5cdFx0XHRcdFx0dHlwZTogXCJsb2FkXCIsXHJcblx0XHRcdFx0XHR0YXJnZXQ6IHtcclxuXHRcdFx0XHRcdFx0cmVzcG9uc2VUZXh0OiByZXNwXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IHVuZGVmaW5lZFxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0c2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0c2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcclxuXHJcblx0XHRcdFx0b3B0aW9ucy5vbmVycm9yKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcclxuXHRcdFx0XHRcdHRhcmdldDoge1xyXG5cdFx0XHRcdFx0XHRzdGF0dXM6IDUwMCxcclxuXHRcdFx0XHRcdFx0cmVzcG9uc2VUZXh0OiBKU09OLnN0cmluZ2lmeSh7ZXJyb3I6IFwiRXJyb3IgbWFraW5nIGpzb25wIHJlcXVlc3RcIn0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0d2luZG93W2NhbGxiYWNrS2V5XSA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0c2NyaXB0LnNyYyA9IG9wdGlvbnMudXJsXHJcblx0XHRcdFx0KyAob3B0aW9ucy51cmwuaW5kZXhPZihcIj9cIikgPiAwID8gXCImXCIgOiBcIj9cIilcclxuXHRcdFx0XHQrIChvcHRpb25zLmNhbGxiYWNrS2V5ID8gb3B0aW9ucy5jYWxsYmFja0tleSA6IFwiY2FsbGJhY2tcIilcclxuXHRcdFx0XHQrIFwiPVwiICsgY2FsbGJhY2tLZXlcclxuXHRcdFx0XHQrIFwiJlwiICsgYnVpbGRRdWVyeVN0cmluZyhvcHRpb25zLmRhdGEgfHwge30pO1xyXG5cdFx0XHQkZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpXHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0dmFyIHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3Q7XHJcblx0XHRcdHhoci5vcGVuKG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVybCwgdHJ1ZSwgb3B0aW9ucy51c2VyLCBvcHRpb25zLnBhc3N3b3JkKTtcclxuXHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xyXG5cdFx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIG9wdGlvbnMub25sb2FkKHt0eXBlOiBcImxvYWRcIiwgdGFyZ2V0OiB4aHJ9KTtcclxuXHRcdFx0XHRcdGVsc2Ugb3B0aW9ucy5vbmVycm9yKHt0eXBlOiBcImVycm9yXCIsIHRhcmdldDogeGhyfSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdGlmIChvcHRpb25zLnNlcmlhbGl6ZSA9PT0gSlNPTi5zdHJpbmdpZnkgJiYgb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMubWV0aG9kICE9PSBcIkdFVFwiKSB7XHJcblx0XHRcdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIpXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKG9wdGlvbnMuZGVzZXJpYWxpemUgPT09IEpTT04ucGFyc2UpIHtcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkFjY2VwdFwiLCBcImFwcGxpY2F0aW9uL2pzb24sIHRleHQvKlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY29uZmlnID09PSBGVU5DVElPTikge1xyXG5cdFx0XHRcdHZhciBtYXliZVhociA9IG9wdGlvbnMuY29uZmlnKHhociwgb3B0aW9ucyk7XHJcblx0XHRcdFx0aWYgKG1heWJlWGhyICE9IG51bGwpIHhociA9IG1heWJlWGhyXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBkYXRhID0gb3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIgfHwgIW9wdGlvbnMuZGF0YSA/IFwiXCIgOiBvcHRpb25zLmRhdGFcclxuXHRcdFx0aWYgKGRhdGEgJiYgKHR5cGUuY2FsbChkYXRhKSAhPSBTVFJJTkcgJiYgZGF0YS5jb25zdHJ1Y3RvciAhPSB3aW5kb3cuRm9ybURhdGEpKSB7XHJcblx0XHRcdFx0dGhyb3cgXCJSZXF1ZXN0IGRhdGEgc2hvdWxkIGJlIGVpdGhlciBiZSBhIHN0cmluZyBvciBGb3JtRGF0YS4gQ2hlY2sgdGhlIGBzZXJpYWxpemVgIG9wdGlvbiBpbiBgbS5yZXF1ZXN0YFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHhoci5zZW5kKGRhdGEpO1xyXG5cdFx0XHRyZXR1cm4geGhyXHJcblx0XHR9XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJpbmREYXRhKHhock9wdGlvbnMsIGRhdGEsIHNlcmlhbGl6ZSkge1xyXG5cdFx0aWYgKHhock9wdGlvbnMubWV0aG9kID09PSBcIkdFVFwiICYmIHhock9wdGlvbnMuZGF0YVR5cGUgIT0gXCJqc29ucFwiKSB7XHJcblx0XHRcdHZhciBwcmVmaXggPSB4aHJPcHRpb25zLnVybC5pbmRleE9mKFwiP1wiKSA8IDAgPyBcIj9cIiA6IFwiJlwiO1xyXG5cdFx0XHR2YXIgcXVlcnlzdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nKGRhdGEpO1xyXG5cdFx0XHR4aHJPcHRpb25zLnVybCA9IHhock9wdGlvbnMudXJsICsgKHF1ZXJ5c3RyaW5nID8gcHJlZml4ICsgcXVlcnlzdHJpbmcgOiBcIlwiKVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB4aHJPcHRpb25zLmRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XHJcblx0XHRyZXR1cm4geGhyT3B0aW9uc1xyXG5cdH1cclxuXHRmdW5jdGlvbiBwYXJhbWV0ZXJpemVVcmwodXJsLCBkYXRhKSB7XHJcblx0XHR2YXIgdG9rZW5zID0gdXJsLm1hdGNoKC86W2Etel1cXHcrL2dpKTtcclxuXHRcdGlmICh0b2tlbnMgJiYgZGF0YSkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHZhciBrZXkgPSB0b2tlbnNbaV0uc2xpY2UoMSk7XHJcblx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UodG9rZW5zW2ldLCBkYXRhW2tleV0pO1xyXG5cdFx0XHRcdGRlbGV0ZSBkYXRhW2tleV1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHVybFxyXG5cdH1cclxuXHJcblx0bS5yZXF1ZXN0ID0gZnVuY3Rpb24oeGhyT3B0aW9ucykge1xyXG5cdFx0aWYgKHhock9wdGlvbnMuYmFja2dyb3VuZCAhPT0gdHJ1ZSkgbS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcclxuXHRcdHZhciBpc0pTT05QID0geGhyT3B0aW9ucy5kYXRhVHlwZSAmJiB4aHJPcHRpb25zLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwianNvbnBcIjtcclxuXHRcdHZhciBzZXJpYWxpemUgPSB4aHJPcHRpb25zLnNlcmlhbGl6ZSA9IGlzSlNPTlAgPyBpZGVudGl0eSA6IHhock9wdGlvbnMuc2VyaWFsaXplIHx8IEpTT04uc3RyaW5naWZ5O1xyXG5cdFx0dmFyIGRlc2VyaWFsaXplID0geGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSA9IGlzSlNPTlAgPyBpZGVudGl0eSA6IHhock9wdGlvbnMuZGVzZXJpYWxpemUgfHwgSlNPTi5wYXJzZTtcclxuXHRcdHZhciBleHRyYWN0ID0gaXNKU09OUCA/IGZ1bmN0aW9uKGpzb25wKSB7cmV0dXJuIGpzb25wLnJlc3BvbnNlVGV4dH0gOiB4aHJPcHRpb25zLmV4dHJhY3QgfHwgZnVuY3Rpb24oeGhyKSB7XHJcblx0XHRcdHJldHVybiB4aHIucmVzcG9uc2VUZXh0Lmxlbmd0aCA9PT0gMCAmJiBkZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSA/IG51bGwgOiB4aHIucmVzcG9uc2VUZXh0XHJcblx0XHR9O1xyXG5cdFx0eGhyT3B0aW9ucy5tZXRob2QgPSAoeGhyT3B0aW9ucy5tZXRob2QgfHwgJ0dFVCcpLnRvVXBwZXJDYXNlKCk7XHJcblx0XHR4aHJPcHRpb25zLnVybCA9IHBhcmFtZXRlcml6ZVVybCh4aHJPcHRpb25zLnVybCwgeGhyT3B0aW9ucy5kYXRhKTtcclxuXHRcdHhock9wdGlvbnMgPSBiaW5kRGF0YSh4aHJPcHRpb25zLCB4aHJPcHRpb25zLmRhdGEsIHNlcmlhbGl6ZSk7XHJcblx0XHR4aHJPcHRpb25zLm9ubG9hZCA9IHhock9wdGlvbnMub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRlID0gZSB8fCBldmVudDtcclxuXHRcdFx0XHR2YXIgdW53cmFwID0gKGUudHlwZSA9PT0gXCJsb2FkXCIgPyB4aHJPcHRpb25zLnVud3JhcFN1Y2Nlc3MgOiB4aHJPcHRpb25zLnVud3JhcEVycm9yKSB8fCBpZGVudGl0eTtcclxuXHRcdFx0XHR2YXIgcmVzcG9uc2UgPSB1bndyYXAoZGVzZXJpYWxpemUoZXh0cmFjdChlLnRhcmdldCwgeGhyT3B0aW9ucykpLCBlLnRhcmdldCk7XHJcblx0XHRcdFx0aWYgKGUudHlwZSA9PT0gXCJsb2FkXCIpIHtcclxuXHRcdFx0XHRcdGlmICh0eXBlLmNhbGwocmVzcG9uc2UpID09PSBBUlJBWSAmJiB4aHJPcHRpb25zLnR5cGUpIHtcclxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKykgcmVzcG9uc2VbaV0gPSBuZXcgeGhyT3B0aW9ucy50eXBlKHJlc3BvbnNlW2ldKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoeGhyT3B0aW9ucy50eXBlKSByZXNwb25zZSA9IG5ldyB4aHJPcHRpb25zLnR5cGUocmVzcG9uc2UpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRlZmVycmVkW2UudHlwZSA9PT0gXCJsb2FkXCIgPyBcInJlc29sdmVcIiA6IFwicmVqZWN0XCJdKHJlc3BvbnNlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh4aHJPcHRpb25zLmJhY2tncm91bmQgIT09IHRydWUpIG0uZW5kQ29tcHV0YXRpb24oKVxyXG5cdFx0fTtcclxuXHRcdGFqYXgoeGhyT3B0aW9ucyk7XHJcblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcHJvcGlmeShkZWZlcnJlZC5wcm9taXNlLCB4aHJPcHRpb25zLmluaXRpYWxWYWx1ZSk7XHJcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZVxyXG5cdH07XHJcblxyXG5cdC8vdGVzdGluZyBBUElcclxuXHRtLmRlcHMgPSBmdW5jdGlvbihtb2NrKSB7XHJcblx0XHRpbml0aWFsaXplKHdpbmRvdyA9IG1vY2sgfHwgd2luZG93KTtcclxuXHRcdHJldHVybiB3aW5kb3c7XHJcblx0fTtcclxuXHQvL2ZvciBpbnRlcm5hbCB0ZXN0aW5nIG9ubHksIGRvIG5vdCB1c2UgYG0uZGVwcy5mYWN0b3J5YFxyXG5cdG0uZGVwcy5mYWN0b3J5ID0gYXBwO1xyXG5cclxuXHRyZXR1cm4gbVxyXG59KSh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSk7XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBtO1xyXG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGZ1bmN0aW9uKCkge3JldHVybiBtfSk7XHJcbiIsInZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCd2YWxpZGF0b3InKTtcblxuLyogXHRUaGlzIGJpbmRlciBhbGxvd3MgeW91IHRvIGNyZWF0ZSBhIHZhbGlkYXRpb24gbWV0aG9kIG9uIGEgbW9kZWwsIChwbGFpbiBcblx0amF2YXNjcmlwdCBmdW5jdGlvbiB0aGF0IGRlZmluZXMgc29tZSBwcm9wZXJ0aWVzKSwgdGhhdCBjYW4gcmV0dXJuIGEgc2V0IFxuXHRvZiBlcnJvciBtZXNzYWdlcyBmb3IgaW52YWxpZCB2YWx1ZXMuXG5cdFxuXHRUaGUgdmFsaWRhdGlvbnMgYXJlIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Nocmlzby92YWxpZGF0b3IuanNcdFxuXG5cdCMjIEV4YW1wbGVcblxuXHRTYXkgeW91IGhhdmUgYW4gb2JqZWN0IGxpa2Ugc286XG5cblx0XHR2YXIgVXNlciA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR0aGlzLm5hbWUgPSBcImJvYlwiO1xuXHRcdFx0dGhpcy5lbWFpbCA9IFwiYm9iX2F0X2VtYWlsLmNvbVwiO1xuXHRcdH0sIHVzZXIgPSBuZXcgVXNlcigpO1xuXG5cdE5vdyBpZiB5b3Ugd2FudGVkIHRvIGNyZWF0ZSBhbiBpc1ZhbGlkIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZW5zdXJlIFxuXHR5b3UgZG9uJ3QgaGF2ZSBhbiBpbnZhbGlkIGVtYWlsIGFkZHJlc3MsIHlvdSBzaW1wbHkgYWRkOlxuXG5cblx0VG8geW91ciBtb2RlbCwgc28geW91IGdldDpcblxuXHRcdHZhciBVc2VyID0gZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMubmFtZSA9IFwiYm9iXCI7XG5cdFx0XHR0aGlzLmVtYWlsID0gXCJib2JfYXRfZW1haWwuY29tXCI7XG5cdFx0XHR0aGlzLmlzVmFsaWQgPSBtb2RlbGJpbmRlci5iaW5kKHRoaXMsIHtcblx0XHRcdFx0ZW1haWw6IHtcblx0XHRcdFx0XHQnaXNFbWFpbCc6IFwiTXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIlxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LCB1c2VyID0gbmV3IFVzZXIoKTtcblxuXHRUaGVuIGp1c3QgY2FsbCB0aGUgYGlzVmFsaWRgIG1ldGhvZCB0byBzZWUgaWYgaXQgaXMgdmFsaWQgLSBpZiBpdCBpc1xuXHRpbnZhbGlkLCAoYXMgaXQgd2lsbCBiZSBpbiB0aGlzIGNhc2UpLCB5b3Ugd2lsbCBnZXQgYW4gb2JqZWN0IGxpa2Ugc286XG5cblx0XHR1c2VyLmlzVmFsaWQoKVxuXHRcdC8vXHRSZXR1cm5zOiB7IGVtYWlsOiBbXCJNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiXSB9XG5cblx0WW91IGNhbiBhbHNvIGNoZWNrIGlmIGEgcGFydGljdWxhciBmaWVsZCBpcyB2YWxpZCBsaWtlIHNvOlxuXG5cdFx0dXNlci5pc1ZhbGlkKCdlbWFpbCcpO1xuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRiaW5kOiBmdW5jdGlvbihzZWxmLCB2T2JqKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24obmFtZSl7XG5cdFx0XHR2YXIgcmVzdWx0ID0ge30sXG5cdFx0XHRcdHRtcCxcblx0XHRcdFx0aGFzSW52YWxpZEZpZWxkID0gZmFsc2UsXG5cdFx0XHRcdC8vXHRGb3Igc29tZSByZWFzb24gbm9kZS12YWxpZGF0b3IgZG9lc24ndCBoYXZlIHRoaXMuLi5cblx0XHRcdFx0aXNOb3RFbXB0eSA9IGZ1bmN0aW9uKHZhbHVlKXtcblx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBcIlwiICYmIHZhbHVlICE9PSBudWxsO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHQvL1x0R2V0IHZhbHVlIG9mIHByb3BlcnR5IGZyb20gJ3NlbGYnLCB3aGljaCBjYW4gYmUgYSBmdW5jdGlvbi5cblx0XHRcdFx0Z2V0VmFsdWUgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIHNlbGZbbmFtZV0gPT0gXCJmdW5jdGlvblwiPyBzZWxmW25hbWVdKCk6IHNlbGZbbmFtZV07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vXHRWYWxpZGF0ZXMgYSB2YWx1ZSBhZ2FpbnN0IGEgc2V0IG9mIHZhbGlkYXRpb25zXG5cdFx0XHRcdC8vXHRSZXR1cm5zIHRydWUgaWYgdGhlIHZhbHVlIGlzIHZhbGlkLCBvciBhbiBvYmplY3QgXG5cdFx0XHRcdHZhbGlkYXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHZhbGlkYXRpb25zKSB7XG5cdFx0XHRcdFx0dmFyIHZhbGlkYXRpb24sXG5cdFx0XHRcdFx0XHR0bXAsXG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBbXTtcblx0XHRcdFx0XHRmb3IodmFsaWRhdGlvbiBpbiB2YWxpZGF0aW9ucykge1xuXHRcdFx0XHRcdFx0aWYodmFsaWRhdGlvbiA9PSBcImlzUmVxdWlyZWRcIikge1xuXHRcdFx0XHRcdFx0XHQvL1x0dXNlIG91ciBcImlzUmVxdWlyZWRcIiBmdW5jdGlvblxuXHRcdFx0XHRcdFx0XHR0bXAgPSBpc05vdEVtcHR5KHZhbHVlKT8gdHJ1ZTogdmFsaWRhdGlvbnNbdmFsaWRhdGlvbl07IFxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly9cdFVzZSB2YWxpZGF0b3IgbWV0aG9kXG5cdFx0XHRcdFx0XHRcdHRtcCA9IHZhbGlkYXRvclt2YWxpZGF0aW9uXSh2YWx1ZSk/IHRydWU6IHZhbGlkYXRpb25zW3ZhbGlkYXRpb25dOyBcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9cdEhhbmRsZSBtdWx0aXBsZSBtZXNzYWdlc1xuXHRcdFx0XHRcdFx0aWYodG1wICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IChyZXN1bHQgPT09IHRydWUgfHwgcmVzdWx0ID09IFwidW5kZWZpbmVkXCIpPyBbXTogcmVzdWx0O1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQucHVzaCh0bXApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fTtcblxuXHRcdFx0aWYobmFtZSkge1xuXHRcdFx0XHRyZXN1bHQgPSB2YWxpZGF0ZShuYW1lLCBnZXRWYWx1ZShuYW1lKSwgdk9ialtuYW1lXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL1x0VmFsaWRhdGUgdGhlIHdob2xlIG1vZGVsXG5cdFx0XHRcdGZvcihuYW1lIGluIHZPYmopIHtcblx0XHRcdFx0XHR0bXAgPSB2YWxpZGF0ZShuYW1lLCBnZXRWYWx1ZShuYW1lKSwgdk9ialtuYW1lXSk7XG5cdFx0XHRcdFx0aWYodG1wICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRoYXNJbnZhbGlkRmllbGQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSB0bXA7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoIWhhc0ludmFsaWRGaWVsZCkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdH1cbn07IiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgQ2hyaXMgTydIYXJhIDxjb2hhcmE4N0BnbWFpbC5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcbiAqIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuICogV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuKGZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7XG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGRlZmluZShkZWZpbml0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzW25hbWVdID0gZGVmaW5pdGlvbigpO1xuICAgIH1cbn0pKCd2YWxpZGF0b3InLCBmdW5jdGlvbiAodmFsaWRhdG9yKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YWxpZGF0b3IgPSB7IHZlcnNpb246ICczLjQwLjAnIH07XG5cbiAgICB2YXIgZW1haWxVc2VyID0gL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV0pfChcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBkLVxceDdmXSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpJC9pO1xuXG4gICAgdmFyIGVtYWlsVXNlclV0ZjggPSAvXigoKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSsoXFwuKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSspKil8KChcXHgyMikoKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPygoW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZdfFxceDIxfFtcXHgyMy1cXHg1Yl18W1xceDVkLVxceDdlXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KFxcXFwoW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBkLVxceDdmXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSkqKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPyhcXHgyMikpKSQvaTtcblxuICAgIHZhciBkaXNwbGF5TmFtZSA9IC9eKD86W2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9flxcLl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyg/OlthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5cXC5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdfFxccykqPCguKyk+JC9pO1xuXG4gICAgdmFyIGNyZWRpdENhcmQgPSAvXig/OjRbMC05XXsxMn0oPzpbMC05XXszfSk/fDVbMS01XVswLTldezE0fXw2KD86MDExfDVbMC05XVswLTldKVswLTldezEyfXwzWzQ3XVswLTldezEzfXwzKD86MFswLTVdfFs2OF1bMC05XSlbMC05XXsxMX18KD86MjEzMXwxODAwfDM1XFxkezN9KVxcZHsxMX0pJC87XG5cbiAgICB2YXIgaXNpbiA9IC9eW0EtWl17Mn1bMC05QS1aXXs5fVswLTldJC87XG5cbiAgICB2YXIgaXNibjEwTWF5YmUgPSAvXig/OlswLTldezl9WHxbMC05XXsxMH0pJC9cbiAgICAgICwgaXNibjEzTWF5YmUgPSAvXig/OlswLTldezEzfSkkLztcblxuICAgIHZhciBpcHY0TWF5YmUgPSAvXihcXGQrKVxcLihcXGQrKVxcLihcXGQrKVxcLihcXGQrKSQvXG4gICAgICAsIGlwdjZCbG9jayA9IC9eWzAtOUEtRl17MSw0fSQvaTtcblxuICAgIHZhciB1dWlkID0ge1xuICAgICAgICAnMyc6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tM1swLTlBLUZdezN9LVswLTlBLUZdezR9LVswLTlBLUZdezEyfSQvaVxuICAgICAgLCAnNCc6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tNFswLTlBLUZdezN9LVs4OUFCXVswLTlBLUZdezN9LVswLTlBLUZdezEyfSQvaVxuICAgICAgLCAnNSc6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tNVswLTlBLUZdezN9LVs4OUFCXVswLTlBLUZdezN9LVswLTlBLUZdezEyfSQvaVxuICAgICAgLCBhbGw6IC9eWzAtOUEtRl17OH0tWzAtOUEtRl17NH0tWzAtOUEtRl17NH0tWzAtOUEtRl17NH0tWzAtOUEtRl17MTJ9JC9pXG4gICAgfTtcblxuICAgIHZhciBhbHBoYSA9IC9eW0EtWl0rJC9pXG4gICAgICAsIGFscGhhbnVtZXJpYyA9IC9eWzAtOUEtWl0rJC9pXG4gICAgICAsIG51bWVyaWMgPSAvXlstK10/WzAtOV0rJC9cbiAgICAgICwgaW50ID0gL14oPzpbLStdPyg/OjB8WzEtOV1bMC05XSopKSQvXG4gICAgICAsIGZsb2F0ID0gL14oPzpbLStdPyg/OlswLTldKykpPyg/OlxcLlswLTldKik/KD86W2VFXVtcXCtcXC1dPyg/OlswLTldKykpPyQvXG4gICAgICAsIGhleGFkZWNpbWFsID0gL15bMC05QS1GXSskL2lcbiAgICAgICwgaGV4Y29sb3IgPSAvXiM/KFswLTlBLUZdezN9fFswLTlBLUZdezZ9KSQvaTtcblxuICAgIHZhciBhc2NpaSA9IC9eW1xceDAwLVxceDdGXSskL1xuICAgICAgLCBtdWx0aWJ5dGUgPSAvW15cXHgwMC1cXHg3Rl0vXG4gICAgICAsIGZ1bGxXaWR0aCA9IC9bXlxcdTAwMjAtXFx1MDA3RVxcdUZGNjEtXFx1RkY5RlxcdUZGQTAtXFx1RkZEQ1xcdUZGRTgtXFx1RkZFRTAtOWEtekEtWl0vXG4gICAgICAsIGhhbGZXaWR0aCA9IC9bXFx1MDAyMC1cXHUwMDdFXFx1RkY2MS1cXHVGRjlGXFx1RkZBMC1cXHVGRkRDXFx1RkZFOC1cXHVGRkVFMC05YS16QS1aXS87XG5cbiAgICB2YXIgc3Vycm9nYXRlUGFpciA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdLztcblxuICAgIHZhciBiYXNlNjQgPSAvXig/OltBLVowLTkrXFwvXXs0fSkqKD86W0EtWjAtOStcXC9dezJ9PT18W0EtWjAtOStcXC9dezN9PXxbQS1aMC05K1xcL117NH0pJC9pO1xuXG4gICAgdmFyIHBob25lcyA9IHtcbiAgICAgICd6aC1DTic6IC9eKFxcKz8wPzg2XFwtPyk/MVszNDU3ODldXFxkezl9JC8sXG4gICAgICAnZW4tWkEnOiAvXihcXCs/Mjd8MClcXGR7OX0kLyxcbiAgICAgICdlbi1BVSc6IC9eKFxcKz82MXwwKTRcXGR7OH0kLyxcbiAgICAgICdlbi1ISyc6IC9eKFxcKz84NTJcXC0/KT9bNTY5XVxcZHszfVxcLT9cXGR7NH0kLyxcbiAgICAgICdmci1GUic6IC9eKFxcKz8zM3wwKVs2N11cXGR7OH0kLyxcbiAgICAgICdwdC1QVCc6IC9eKFxcKzM1MSk/OVsxMjM2XVxcZHs3fSQvLFxuICAgICAgJ2VsLUdSJzogL14oXFwrMzApPygoMlxcZHs5fSl8KDY5XFxkezh9KSkkLyxcbiAgICAgICdlbi1HQic6IC9eKFxcKz80NHwwKTdcXGR7OX0kLyxcbiAgICAgICdlbi1VUyc6IC9eKFxcKz8xKT9bMi05XVxcZHsyfVsyLTldKD8hMTEpXFxkezZ9JC8sXG4gICAgICAnZW4tWk0nOiAvXihcXCsyNik/MDlbNTY3XVxcZHs3fSQvXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5leHRlbmQgPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcbiAgICAgICAgdmFsaWRhdG9yW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgYXJnc1swXSA9IHZhbGlkYXRvci50b1N0cmluZyhhcmdzWzBdKTtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh2YWxpZGF0b3IsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvL1JpZ2h0IGJlZm9yZSBleHBvcnRpbmcgdGhlIHZhbGlkYXRvciBvYmplY3QsIHBhc3MgZWFjaCBvZiB0aGUgYnVpbHRpbnNcbiAgICAvL3Rocm91Z2ggZXh0ZW5kKCkgc28gdGhhdCB0aGVpciBmaXJzdCBhcmd1bWVudCBpcyBjb2VyY2VkIHRvIGEgc3RyaW5nXG4gICAgdmFsaWRhdG9yLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsaWRhdG9yKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvcltuYW1lXSAhPT0gJ2Z1bmN0aW9uJyB8fCBuYW1lID09PSAndG9TdHJpbmcnIHx8XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPT09ICd0b0RhdGUnIHx8IG5hbWUgPT09ICdleHRlbmQnIHx8IG5hbWUgPT09ICdpbml0Jykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsaWRhdG9yLmV4dGVuZChuYW1lLCB2YWxpZGF0b3JbbmFtZV0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b1N0cmluZyA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyAmJiBpbnB1dCAhPT0gbnVsbCAmJiBpbnB1dC50b1N0cmluZykge1xuICAgICAgICAgICAgaW5wdXQgPSBpbnB1dC50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKGlucHV0ID09PSBudWxsIHx8IHR5cGVvZiBpbnB1dCA9PT0gJ3VuZGVmaW5lZCcgfHwgKGlzTmFOKGlucHV0KSAmJiAhaW5wdXQubGVuZ3RoKSkge1xuICAgICAgICAgICAgaW5wdXQgPSAnJztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpbnB1dCArPSAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0RhdGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpID09PSAnW29iamVjdCBEYXRlXScpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICB9XG4gICAgICAgIGRhdGUgPSBEYXRlLnBhcnNlKGRhdGUpO1xuICAgICAgICByZXR1cm4gIWlzTmFOKGRhdGUpID8gbmV3IERhdGUoZGF0ZSkgOiBudWxsO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9GbG9hdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvSW50ID0gZnVuY3Rpb24gKHN0ciwgcmFkaXgpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0ciwgcmFkaXggfHwgMTApO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9Cb29sZWFuID0gZnVuY3Rpb24gKHN0ciwgc3RyaWN0KSB7XG4gICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHIgPT09ICcxJyB8fCBzdHIgPT09ICd0cnVlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyICE9PSAnMCcgJiYgc3RyICE9PSAnZmFsc2UnICYmIHN0ciAhPT0gJyc7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5lcXVhbHMgPSBmdW5jdGlvbiAoc3RyLCBjb21wYXJpc29uKSB7XG4gICAgICAgIHJldHVybiBzdHIgPT09IHZhbGlkYXRvci50b1N0cmluZyhjb21wYXJpc29uKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmNvbnRhaW5zID0gZnVuY3Rpb24gKHN0ciwgZWxlbSkge1xuICAgICAgICByZXR1cm4gc3RyLmluZGV4T2YodmFsaWRhdG9yLnRvU3RyaW5nKGVsZW0pKSA+PSAwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IubWF0Y2hlcyA9IGZ1bmN0aW9uIChzdHIsIHBhdHRlcm4sIG1vZGlmaWVycykge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHBhdHRlcm4pICE9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgICAgICAgcGF0dGVybiA9IG5ldyBSZWdFeHAocGF0dGVybiwgbW9kaWZpZXJzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0dGVybi50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0X2VtYWlsX29wdGlvbnMgPSB7XG4gICAgICAgIGFsbG93X2Rpc3BsYXlfbmFtZTogZmFsc2UsXG4gICAgICAgIGFsbG93X3V0ZjhfbG9jYWxfcGFydDogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZV90bGQ6IHRydWVcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRW1haWwgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X2VtYWlsX29wdGlvbnMpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmFsbG93X2Rpc3BsYXlfbmFtZSkge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlfZW1haWwgPSBzdHIubWF0Y2goZGlzcGxheU5hbWUpO1xuICAgICAgICAgICAgaWYgKGRpc3BsYXlfZW1haWwpIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBkaXNwbGF5X2VtYWlsWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKC9cXHMvLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KCdAJylcbiAgICAgICAgICAsIGRvbWFpbiA9IHBhcnRzLnBvcCgpXG4gICAgICAgICAgLCB1c2VyID0gcGFydHMuam9pbignQCcpO1xuXG4gICAgICAgIGlmICghdmFsaWRhdG9yLmlzRlFETihkb21haW4sIHtyZXF1aXJlX3RsZDogb3B0aW9ucy5yZXF1aXJlX3RsZH0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3B0aW9ucy5hbGxvd191dGY4X2xvY2FsX3BhcnQgP1xuICAgICAgICAgICAgZW1haWxVc2VyVXRmOC50ZXN0KHVzZXIpIDpcbiAgICAgICAgICAgIGVtYWlsVXNlci50ZXN0KHVzZXIpO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF91cmxfb3B0aW9ucyA9IHtcbiAgICAgICAgcHJvdG9jb2xzOiBbICdodHRwJywgJ2h0dHBzJywgJ2Z0cCcgXVxuICAgICAgLCByZXF1aXJlX3RsZDogdHJ1ZVxuICAgICAgLCByZXF1aXJlX3Byb3RvY29sOiBmYWxzZVxuICAgICAgLCBhbGxvd191bmRlcnNjb3JlczogZmFsc2VcbiAgICAgICwgYWxsb3dfdHJhaWxpbmdfZG90OiBmYWxzZVxuICAgICAgLCBhbGxvd19wcm90b2NvbF9yZWxhdGl2ZV91cmxzOiBmYWxzZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNVUkwgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICghdXJsIHx8IHVybC5sZW5ndGggPj0gMjA4MyB8fCAvXFxzLy50ZXN0KHVybCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXJsLmluZGV4T2YoJ21haWx0bzonKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X3VybF9vcHRpb25zKTtcbiAgICAgICAgdmFyIHByb3RvY29sLCBhdXRoLCBob3N0LCBob3N0bmFtZSwgcG9ydCxcbiAgICAgICAgICAgIHBvcnRfc3RyLCBzcGxpdDtcbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJzovLycpO1xuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcHJvdG9jb2wgPSBzcGxpdC5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJvdG9jb2xzLmluZGV4T2YocHJvdG9jb2wpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLnJlcXVpcmVfcHJvdG9jb2wpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSAgZWxzZSBpZiAob3B0aW9ucy5hbGxvd19wcm90b2NvbF9yZWxhdGl2ZV91cmxzICYmIHVybC5zdWJzdHIoMCwgMikgPT09ICcvLycpIHtcbiAgICAgICAgICAgIHNwbGl0WzBdID0gdXJsLnN1YnN0cigyKTtcbiAgICAgICAgfVxuICAgICAgICB1cmwgPSBzcGxpdC5qb2luKCc6Ly8nKTtcbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJyMnKTtcbiAgICAgICAgdXJsID0gc3BsaXQuc2hpZnQoKTtcblxuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnPycpO1xuICAgICAgICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuXG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCcvJyk7XG4gICAgICAgIHVybCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCdAJyk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBhdXRoID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChhdXRoLmluZGV4T2YoJzonKSA+PSAwICYmIGF1dGguc3BsaXQoJzonKS5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGhvc3RuYW1lID0gc3BsaXQuam9pbignQCcpO1xuICAgICAgICBzcGxpdCA9IGhvc3RuYW1lLnNwbGl0KCc6Jyk7XG4gICAgICAgIGhvc3QgPSBzcGxpdC5zaGlmdCgpO1xuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoKSB7XG4gICAgICAgICAgICBwb3J0X3N0ciA9IHNwbGl0LmpvaW4oJzonKTtcbiAgICAgICAgICAgIHBvcnQgPSBwYXJzZUludChwb3J0X3N0ciwgMTApO1xuICAgICAgICAgICAgaWYgKCEvXlswLTldKyQvLnRlc3QocG9ydF9zdHIpIHx8IHBvcnQgPD0gMCB8fCBwb3J0ID4gNjU1MzUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxpZGF0b3IuaXNJUChob3N0KSAmJiAhdmFsaWRhdG9yLmlzRlFETihob3N0LCBvcHRpb25zKSAmJlxuICAgICAgICAgICAgICAgIGhvc3QgIT09ICdsb2NhbGhvc3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaG9zdF93aGl0ZWxpc3QgJiZcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhvc3Rfd2hpdGVsaXN0LmluZGV4T2YoaG9zdCkgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaG9zdF9ibGFja2xpc3QgJiZcbiAgICAgICAgICAgICAgICBvcHRpb25zLmhvc3RfYmxhY2tsaXN0LmluZGV4T2YoaG9zdCkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0lQID0gZnVuY3Rpb24gKHN0ciwgdmVyc2lvbikge1xuICAgICAgICB2ZXJzaW9uID0gdmFsaWRhdG9yLnRvU3RyaW5nKHZlcnNpb24pO1xuICAgICAgICBpZiAoIXZlcnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3IuaXNJUChzdHIsIDQpIHx8IHZhbGlkYXRvci5pc0lQKHN0ciwgNik7XG4gICAgICAgIH0gZWxzZSBpZiAodmVyc2lvbiA9PT0gJzQnKSB7XG4gICAgICAgICAgICBpZiAoIWlwdjRNYXliZS50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy4nKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gcGFydHNbM10gPD0gMjU1O1xuICAgICAgICB9IGVsc2UgaWYgKHZlcnNpb24gPT09ICc2Jykge1xuICAgICAgICAgICAgdmFyIGJsb2NrcyA9IHN0ci5zcGxpdCgnOicpO1xuICAgICAgICAgICAgdmFyIGZvdW5kT21pc3Npb25CbG9jayA9IGZhbHNlOyAvLyBtYXJrZXIgdG8gaW5kaWNhdGUgOjpcblxuICAgICAgICAgICAgaWYgKGJsb2Nrcy5sZW5ndGggPiA4KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgLy8gaW5pdGlhbCBvciBmaW5hbCA6OlxuICAgICAgICAgICAgaWYgKHN0ciA9PT0gJzo6Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdHIuc3Vic3RyKDAsIDIpID09PSAnOjonKSB7XG4gICAgICAgICAgICAgICAgYmxvY2tzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgYmxvY2tzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgZm91bmRPbWlzc2lvbkJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyLnN1YnN0cihzdHIubGVuZ3RoIC0gMikgPT09ICc6OicpIHtcbiAgICAgICAgICAgICAgICBibG9ja3MucG9wKCk7XG4gICAgICAgICAgICAgICAgYmxvY2tzLnBvcCgpO1xuICAgICAgICAgICAgICAgIGZvdW5kT21pc3Npb25CbG9jayA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgLy8gdGVzdCBmb3IgYSA6OiB3aGljaCBjYW4gbm90IGJlIGF0IHRoZSBzdHJpbmcgc3RhcnQvZW5kXG4gICAgICAgICAgICAgICAgLy8gc2luY2UgdGhvc2UgY2FzZXMgaGF2ZSBiZWVuIGhhbmRsZWQgYWJvdmVcbiAgICAgICAgICAgICAgICBpZiAoYmxvY2tzW2ldID09PSAnJyAmJiBpID4gMCAmJiBpIDwgYmxvY2tzLmxlbmd0aCAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm91bmRPbWlzc2lvbkJsb2NrKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBtdWx0aXBsZSA6OiBpbiBhZGRyZXNzXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kT21pc3Npb25CbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghaXB2NkJsb2NrLnRlc3QoYmxvY2tzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZm91bmRPbWlzc2lvbkJsb2NrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5sZW5ndGggPj0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5sZW5ndGggPT09IDg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF9mcWRuX29wdGlvbnMgPSB7XG4gICAgICAgIHJlcXVpcmVfdGxkOiB0cnVlXG4gICAgICAsIGFsbG93X3VuZGVyc2NvcmVzOiBmYWxzZVxuICAgICAgLCBhbGxvd190cmFpbGluZ19kb3Q6IGZhbHNlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0ZRRE4gPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X2ZxZG5fb3B0aW9ucyk7XG5cbiAgICAgICAgLyogUmVtb3ZlIHRoZSBvcHRpb25hbCB0cmFpbGluZyBkb3QgYmVmb3JlIGNoZWNraW5nIHZhbGlkaXR5ICovXG4gICAgICAgIGlmIChvcHRpb25zLmFsbG93X3RyYWlsaW5nX2RvdCAmJiBzdHJbc3RyLmxlbmd0aCAtIDFdID09PSAnLicpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnLicpO1xuICAgICAgICBpZiAob3B0aW9ucy5yZXF1aXJlX3RsZCkge1xuICAgICAgICAgICAgdmFyIHRsZCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCFwYXJ0cy5sZW5ndGggfHwgIS9eKFthLXpcXHUwMGExLVxcdWZmZmZdezIsfXx4blthLXowLTktXXsyLH0pJC9pLnRlc3QodGxkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBwYXJ0LCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hbGxvd191bmRlcnNjb3Jlcykge1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0LmluZGV4T2YoJ19fJykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhcnQgPSBwYXJ0LnJlcGxhY2UoL18vZywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEvXlthLXpcXHUwMGExLVxcdWZmZmYwLTktXSskL2kudGVzdChwYXJ0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJ0WzBdID09PSAnLScgfHwgcGFydFtwYXJ0Lmxlbmd0aCAtIDFdID09PSAnLScgfHxcbiAgICAgICAgICAgICAgICAgICAgcGFydC5pbmRleE9mKCctLS0nKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCb29sZWFuID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHJldHVybiAoWyd0cnVlJywgJ2ZhbHNlJywgJzEnLCAnMCddLmluZGV4T2Yoc3RyKSA+PSAwKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQWxwaGEgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBhbHBoYS50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0FscGhhbnVtZXJpYyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGFscGhhbnVtZXJpYy50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc051bWVyaWMgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBudW1lcmljLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSGV4YWRlY2ltYWwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBoZXhhZGVjaW1hbC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0hleENvbG9yID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gaGV4Y29sb3IudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNMb3dlcmNhc2UgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIgPT09IHN0ci50b0xvd2VyQ2FzZSgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNVcHBlcmNhc2UgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIgPT09IHN0ci50b1VwcGVyQ2FzZSgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJbnQgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICByZXR1cm4gaW50LnRlc3Qoc3RyKSAmJiAoIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ21pbicpIHx8IHN0ciA+PSBvcHRpb25zLm1pbikgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdtYXgnKSB8fCBzdHIgPD0gb3B0aW9ucy5tYXgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNGbG9hdCA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHJldHVybiBzdHIgIT09ICcnICYmIGZsb2F0LnRlc3Qoc3RyKSAmJiAoIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ21pbicpIHx8IHN0ciA+PSBvcHRpb25zLm1pbikgJiYgKCFvcHRpb25zLmhhc093blByb3BlcnR5KCdtYXgnKSB8fCBzdHIgPD0gb3B0aW9ucy5tYXgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNEaXZpc2libGVCeSA9IGZ1bmN0aW9uIChzdHIsIG51bSkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLnRvRmxvYXQoc3RyKSAlIHZhbGlkYXRvci50b0ludChudW0pID09PSAwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNOdWxsID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLmxlbmd0aCA9PT0gMDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgbWluLCBtYXgpIHtcbiAgICAgICAgdmFyIHN1cnJvZ2F0ZVBhaXJzID0gc3RyLm1hdGNoKC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdL2cpIHx8IFtdO1xuICAgICAgICB2YXIgbGVuID0gc3RyLmxlbmd0aCAtIHN1cnJvZ2F0ZVBhaXJzLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGxlbiA+PSBtaW4gJiYgKHR5cGVvZiBtYXggPT09ICd1bmRlZmluZWQnIHx8IGxlbiA8PSBtYXgpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCeXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgbWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5sZW5ndGggPj0gbWluICYmICh0eXBlb2YgbWF4ID09PSAndW5kZWZpbmVkJyB8fCBzdHIubGVuZ3RoIDw9IG1heCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1VVSUQgPSBmdW5jdGlvbiAoc3RyLCB2ZXJzaW9uKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gdXVpZFt2ZXJzaW9uID8gdmVyc2lvbiA6ICdhbGwnXTtcbiAgICAgICAgcmV0dXJuIHBhdHRlcm4gJiYgcGF0dGVybi50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0RhdGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiAhaXNOYU4oRGF0ZS5wYXJzZShzdHIpKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQWZ0ZXIgPSBmdW5jdGlvbiAoc3RyLCBkYXRlKSB7XG4gICAgICAgIHZhciBjb21wYXJpc29uID0gdmFsaWRhdG9yLnRvRGF0ZShkYXRlIHx8IG5ldyBEYXRlKCkpXG4gICAgICAgICAgLCBvcmlnaW5hbCA9IHZhbGlkYXRvci50b0RhdGUoc3RyKTtcbiAgICAgICAgcmV0dXJuICEhKG9yaWdpbmFsICYmIGNvbXBhcmlzb24gJiYgb3JpZ2luYWwgPiBjb21wYXJpc29uKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQmVmb3JlID0gZnVuY3Rpb24gKHN0ciwgZGF0ZSkge1xuICAgICAgICB2YXIgY29tcGFyaXNvbiA9IHZhbGlkYXRvci50b0RhdGUoZGF0ZSB8fCBuZXcgRGF0ZSgpKVxuICAgICAgICAgICwgb3JpZ2luYWwgPSB2YWxpZGF0b3IudG9EYXRlKHN0cik7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbCAmJiBjb21wYXJpc29uICYmIG9yaWdpbmFsIDwgY29tcGFyaXNvbjtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSW4gPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9wdGlvbnMpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSB2YWxpZGF0b3IudG9TdHJpbmcob3B0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihzdHIpID49IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShzdHIpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaW5kZXhPZihzdHIpID49IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNDcmVkaXRDYXJkID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgc2FuaXRpemVkID0gc3RyLnJlcGxhY2UoL1teMC05XSsvZywgJycpO1xuICAgICAgICBpZiAoIWNyZWRpdENhcmQudGVzdChzYW5pdGl6ZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN1bSA9IDAsIGRpZ2l0LCB0bXBOdW0sIHNob3VsZERvdWJsZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHNhbml0aXplZC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgZGlnaXQgPSBzYW5pdGl6ZWQuc3Vic3RyaW5nKGksIChpICsgMSkpO1xuICAgICAgICAgICAgdG1wTnVtID0gcGFyc2VJbnQoZGlnaXQsIDEwKTtcbiAgICAgICAgICAgIGlmIChzaG91bGREb3VibGUpIHtcbiAgICAgICAgICAgICAgICB0bXBOdW0gKj0gMjtcbiAgICAgICAgICAgICAgICBpZiAodG1wTnVtID49IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSAoKHRtcE51bSAlIDEwKSArIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gdG1wTnVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvdWxkRG91YmxlID0gIXNob3VsZERvdWJsZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gISEoKHN1bSAlIDEwKSA9PT0gMCA/IHNhbml0aXplZCA6IGZhbHNlKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSVNJTiA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgaWYgKCFpc2luLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoZWNrc3VtU3RyID0gc3RyLnJlcGxhY2UoL1tBLVpdL2csIGZ1bmN0aW9uKGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KGNoYXJhY3RlciwgMzYpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgc3VtID0gMCwgZGlnaXQsIHRtcE51bSwgc2hvdWxkRG91YmxlID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IGNoZWNrc3VtU3RyLmxlbmd0aCAtIDI7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBkaWdpdCA9IGNoZWNrc3VtU3RyLnN1YnN0cmluZyhpLCAoaSArIDEpKTtcbiAgICAgICAgICAgIHRtcE51bSA9IHBhcnNlSW50KGRpZ2l0LCAxMCk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkRG91YmxlKSB7XG4gICAgICAgICAgICAgICAgdG1wTnVtICo9IDI7XG4gICAgICAgICAgICAgICAgaWYgKHRtcE51bSA+PSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gdG1wTnVtICsgMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gdG1wTnVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IHRtcE51bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNob3VsZERvdWJsZSA9ICFzaG91bGREb3VibGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyLnN1YnN0cihzdHIubGVuZ3RoIC0gMSksIDEwKSA9PT0gKDEwMDAwIC0gc3VtKSAlIDEwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJU0JOID0gZnVuY3Rpb24gKHN0ciwgdmVyc2lvbikge1xuICAgICAgICB2ZXJzaW9uID0gdmFsaWRhdG9yLnRvU3RyaW5nKHZlcnNpb24pO1xuICAgICAgICBpZiAoIXZlcnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3IuaXNJU0JOKHN0ciwgMTApIHx8IHZhbGlkYXRvci5pc0lTQk4oc3RyLCAxMyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNhbml0aXplZCA9IHN0ci5yZXBsYWNlKC9bXFxzLV0rL2csICcnKVxuICAgICAgICAgICwgY2hlY2tzdW0gPSAwLCBpO1xuICAgICAgICBpZiAodmVyc2lvbiA9PT0gJzEwJykge1xuICAgICAgICAgICAgaWYgKCFpc2JuMTBNYXliZS50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gKGkgKyAxKSAqIHNhbml0aXplZC5jaGFyQXQoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2FuaXRpemVkLmNoYXJBdCg5KSA9PT0gJ1gnKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gMTAgKiAxMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gMTAgKiBzYW5pdGl6ZWQuY2hhckF0KDkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChjaGVja3N1bSAlIDExKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIXNhbml0aXplZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlICBpZiAodmVyc2lvbiA9PT0gJzEzJykge1xuICAgICAgICAgICAgaWYgKCFpc2JuMTNNYXliZS50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZmFjdG9yID0gWyAxLCAzIF07XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgICAgIGNoZWNrc3VtICs9IGZhY3RvcltpICUgMl0gKiBzYW5pdGl6ZWQuY2hhckF0KGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNhbml0aXplZC5jaGFyQXQoMTIpIC0gKCgxMCAtIChjaGVja3N1bSAlIDEwKSkgJSAxMCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFzYW5pdGl6ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNNb2JpbGVQaG9uZSA9IGZ1bmN0aW9uKHN0ciwgbG9jYWxlKSB7XG4gICAgICAgIGlmIChsb2NhbGUgaW4gcGhvbmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcGhvbmVzW2xvY2FsZV0udGVzdChzdHIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfY3VycmVuY3lfb3B0aW9ucyA9IHtcbiAgICAgICAgc3ltYm9sOiAnJCdcbiAgICAgICwgcmVxdWlyZV9zeW1ib2w6IGZhbHNlXG4gICAgICAsIGFsbG93X3NwYWNlX2FmdGVyX3N5bWJvbDogZmFsc2VcbiAgICAgICwgc3ltYm9sX2FmdGVyX2RpZ2l0czogZmFsc2VcbiAgICAgICwgYWxsb3dfbmVnYXRpdmVzOiB0cnVlXG4gICAgICAsIHBhcmVuc19mb3JfbmVnYXRpdmVzOiBmYWxzZVxuICAgICAgLCBuZWdhdGl2ZV9zaWduX2JlZm9yZV9kaWdpdHM6IGZhbHNlXG4gICAgICAsIG5lZ2F0aXZlX3NpZ25fYWZ0ZXJfZGlnaXRzOiBmYWxzZVxuICAgICAgLCBhbGxvd19uZWdhdGl2ZV9zaWduX3BsYWNlaG9sZGVyOiBmYWxzZVxuICAgICAgLCB0aG91c2FuZHNfc2VwYXJhdG9yOiAnLCdcbiAgICAgICwgZGVjaW1hbF9zZXBhcmF0b3I6ICcuJ1xuICAgICAgLCBhbGxvd19zcGFjZV9hZnRlcl9kaWdpdHM6IGZhbHNlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0N1cnJlbmN5ID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVmYXVsdF9jdXJyZW5jeV9vcHRpb25zKTtcblxuICAgICAgICByZXR1cm4gY3VycmVuY3lSZWdleChvcHRpb25zKS50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0pTT04gPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBKU09OLnBhcnNlKHN0cik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTXVsdGlieXRlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gbXVsdGlieXRlLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQXNjaWkgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBhc2NpaS50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0Z1bGxXaWR0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGxXaWR0aC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0hhbGZXaWR0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGhhbGZXaWR0aC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1ZhcmlhYmxlV2lkdGggPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBmdWxsV2lkdGgudGVzdChzdHIpICYmIGhhbGZXaWR0aC50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1N1cnJvZ2F0ZVBhaXIgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdXJyb2dhdGVQYWlyLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQmFzZTY0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gYmFzZTY0LnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTW9uZ29JZCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5pc0hleGFkZWNpbWFsKHN0cikgJiYgc3RyLmxlbmd0aCA9PT0gMjQ7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5sdHJpbSA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gY2hhcnMgPyBuZXcgUmVnRXhwKCdeWycgKyBjaGFycyArICddKycsICdnJykgOiAvXlxccysvZztcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnJ0cmltID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoJ1snICsgY2hhcnMgKyAnXSskJywgJ2cnKSA6IC9cXHMrJC9nO1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudHJpbSA9IGZ1bmN0aW9uIChzdHIsIGNoYXJzKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gY2hhcnMgPyBuZXcgUmVnRXhwKCdeWycgKyBjaGFycyArICddK3xbJyArIGNoYXJzICsgJ10rJCcsICdnJykgOiAvXlxccyt8XFxzKyQvZztcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmVzY2FwZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIChzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgJyYjeDI3OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFwvL2csICcmI3gyRjsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcYC9nLCAnJiM5NjsnKSk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5zdHJpcExvdyA9IGZ1bmN0aW9uIChzdHIsIGtlZXBfbmV3X2xpbmVzKSB7XG4gICAgICAgIHZhciBjaGFycyA9IGtlZXBfbmV3X2xpbmVzID8gJ1xcXFx4MDAtXFxcXHgwOVxcXFx4MEJcXFxceDBDXFxcXHgwRS1cXFxceDFGXFxcXHg3RicgOiAnXFxcXHgwMC1cXFxceDFGXFxcXHg3Ric7XG4gICAgICAgIHJldHVybiB2YWxpZGF0b3IuYmxhY2tsaXN0KHN0ciwgY2hhcnMpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3Iud2hpdGVsaXN0ID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJ1teJyArIGNoYXJzICsgJ10rJywgJ2cnKSwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuYmxhY2tsaXN0ID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJ1snICsgY2hhcnMgKyAnXSsnLCAnZycpLCAnJyk7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0X25vcm1hbGl6ZV9lbWFpbF9vcHRpb25zID0ge1xuICAgICAgICBsb3dlcmNhc2U6IHRydWVcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLm5vcm1hbGl6ZUVtYWlsID0gZnVuY3Rpb24gKGVtYWlsLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X25vcm1hbGl6ZV9lbWFpbF9vcHRpb25zKTtcbiAgICAgICAgaWYgKCF2YWxpZGF0b3IuaXNFbWFpbChlbWFpbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFydHMgPSBlbWFpbC5zcGxpdCgnQCcsIDIpO1xuICAgICAgICBwYXJ0c1sxXSA9IHBhcnRzWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChwYXJ0c1sxXSA9PT0gJ2dtYWlsLmNvbScgfHwgcGFydHNbMV0gPT09ICdnb29nbGVtYWlsLmNvbScpIHtcbiAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXC4vZywgJycpO1xuICAgICAgICAgICAgaWYgKHBhcnRzWzBdWzBdID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnNwbGl0KCcrJylbMF07XG4gICAgICAgICAgICBwYXJ0c1sxXSA9ICdnbWFpbC5jb20nO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubG93ZXJjYXNlKSB7XG4gICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJ0AnKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWVyZ2Uob2JqLCBkZWZhdWx0cykge1xuICAgICAgICBvYmogPSBvYmogfHwge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0cykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBvYmpba2V5XSA9IGRlZmF1bHRzW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXJyZW5jeVJlZ2V4KG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHN5bWJvbCA9ICcoXFxcXCcgKyBvcHRpb25zLnN5bWJvbC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykgKyAnKScgKyAob3B0aW9ucy5yZXF1aXJlX3N5bWJvbCA/ICcnIDogJz8nKVxuICAgICAgICAgICAgLCBuZWdhdGl2ZSA9ICctPydcbiAgICAgICAgICAgICwgd2hvbGVfZG9sbGFyX2Ftb3VudF93aXRob3V0X3NlcCA9ICdbMS05XVxcXFxkKidcbiAgICAgICAgICAgICwgd2hvbGVfZG9sbGFyX2Ftb3VudF93aXRoX3NlcCA9ICdbMS05XVxcXFxkezAsMn0oXFxcXCcgKyBvcHRpb25zLnRob3VzYW5kc19zZXBhcmF0b3IgKyAnXFxcXGR7M30pKidcbiAgICAgICAgICAgICwgdmFsaWRfd2hvbGVfZG9sbGFyX2Ftb3VudHMgPSBbJzAnLCB3aG9sZV9kb2xsYXJfYW1vdW50X3dpdGhvdXRfc2VwLCB3aG9sZV9kb2xsYXJfYW1vdW50X3dpdGhfc2VwXVxuICAgICAgICAgICAgLCB3aG9sZV9kb2xsYXJfYW1vdW50ID0gJygnICsgdmFsaWRfd2hvbGVfZG9sbGFyX2Ftb3VudHMuam9pbignfCcpICsgJyk/J1xuICAgICAgICAgICAgLCBkZWNpbWFsX2Ftb3VudCA9ICcoXFxcXCcgKyBvcHRpb25zLmRlY2ltYWxfc2VwYXJhdG9yICsgJ1xcXFxkezJ9KT8nO1xuICAgICAgICB2YXIgcGF0dGVybiA9IHdob2xlX2RvbGxhcl9hbW91bnQgKyBkZWNpbWFsX2Ftb3VudDtcbiAgICAgICAgLy8gZGVmYXVsdCBpcyBuZWdhdGl2ZSBzaWduIGJlZm9yZSBzeW1ib2wsIGJ1dCB0aGVyZSBhcmUgdHdvIG90aGVyIG9wdGlvbnMgKGJlc2lkZXMgcGFyZW5zKVxuICAgICAgICBpZiAob3B0aW9ucy5hbGxvd19uZWdhdGl2ZXMgJiYgIW9wdGlvbnMucGFyZW5zX2Zvcl9uZWdhdGl2ZXMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm5lZ2F0aXZlX3NpZ25fYWZ0ZXJfZGlnaXRzKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiArPSBuZWdhdGl2ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMubmVnYXRpdmVfc2lnbl9iZWZvcmVfZGlnaXRzKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IG5lZ2F0aXZlICsgcGF0dGVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTb3V0aCBBZnJpY2FuIFJhbmQsIGZvciBleGFtcGxlLCB1c2VzIFIgMTIzIChzcGFjZSkgYW5kIFItMTIzIChubyBzcGFjZSlcbiAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfbmVnYXRpdmVfc2lnbl9wbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgcGF0dGVybiA9ICcoICg/IVxcXFwtKSk/JyArIHBhdHRlcm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5hbGxvd19zcGFjZV9hZnRlcl9zeW1ib2wpIHtcbiAgICAgICAgICAgIHBhdHRlcm4gPSAnID8nICsgcGF0dGVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmFsbG93X3NwYWNlX2FmdGVyX2RpZ2l0cykge1xuICAgICAgICAgICAgcGF0dGVybiArPSAnKCAoPyEkKSk/JztcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5zeW1ib2xfYWZ0ZXJfZGlnaXRzKSB7XG4gICAgICAgICAgICBwYXR0ZXJuICs9IHN5bWJvbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdHRlcm4gPSBzeW1ib2wgKyBwYXR0ZXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmFsbG93X25lZ2F0aXZlcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGFyZW5zX2Zvcl9uZWdhdGl2ZXMpIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gJyhcXFxcKCcgKyBwYXR0ZXJuICsgJ1xcXFwpfCcgKyBwYXR0ZXJuICsgJyknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIShvcHRpb25zLm5lZ2F0aXZlX3NpZ25fYmVmb3JlX2RpZ2l0cyB8fCBvcHRpb25zLm5lZ2F0aXZlX3NpZ25fYWZ0ZXJfZGlnaXRzKSkge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBuZWdhdGl2ZSArIHBhdHRlcm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAnXicgK1xuICAgICAgICAgICAgLy8gZW5zdXJlIHRoZXJlJ3MgYSBkb2xsYXIgYW5kL29yIGRlY2ltYWwgYW1vdW50LCBhbmQgdGhhdCBpdCBkb2Vzbid0IHN0YXJ0IHdpdGggYSBzcGFjZSBvciBhIG5lZ2F0aXZlIHNpZ24gZm9sbG93ZWQgYnkgYSBzcGFjZVxuICAgICAgICAgICAgJyg/IS0/ICkoPz0uKlxcXFxkKScgK1xuICAgICAgICAgICAgcGF0dGVybiArXG4gICAgICAgICAgICAnJCdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB2YWxpZGF0b3IuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHZhbGlkYXRvcjtcblxufSk7XG4iLCIvKlxuXHRtaXRocmlsLmFuaW1hdGUgLSBDb3B5cmlnaHQgMjAxNCBqc2d1eVxuXHRNSVQgTGljZW5zZWQuXG4qL1xuKGZ1bmN0aW9uKCl7XG52YXIgbWl0aHJpbEFuaW1hdGUgPSBmdW5jdGlvbiAobSkge1xuXHQvL1x0S25vd24gcHJlZmlleFxuXHR2YXIgcHJlZml4ZXMgPSBbJ01veicsICdXZWJraXQnLCAnS2h0bWwnLCAnTycsICdtcyddLFxuXHR0cmFuc2l0aW9uUHJvcHMgPSBbJ1RyYW5zaXRpb25Qcm9wZXJ0eScsICdUcmFuc2l0aW9uVGltaW5nRnVuY3Rpb24nLCAnVHJhbnNpdGlvbkRlbGF5JywgJ1RyYW5zaXRpb25EdXJhdGlvbicsICdUcmFuc2l0aW9uRW5kJ10sXG5cdHRyYW5zZm9ybVByb3BzID0gWydyb3RhdGUnLCAncm90YXRleCcsICdyb3RhdGV5JywgJ3NjYWxlJywgJ3NrZXcnLCAndHJhbnNsYXRlJywgJ3RyYW5zbGF0ZXgnLCAndHJhbnNsYXRleScsICdtYXRyaXgnXSxcblxuXHRkZWZhdWx0RHVyYXRpb24gPSA0MDAsXG5cblx0ZXJyID0gZnVuY3Rpb24obXNnKXtcblx0XHQodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiKSAmJiB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmVycm9yICYmIGNvbnNvbGUuZXJyb3IobXNnKTtcblx0fSxcblx0XG5cdC8vXHRDYXBpdGFsaXNlXHRcdFxuXHRjYXAgPSBmdW5jdGlvbihzdHIpe1xuXHRcdHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc3Vic3RyKDEpO1xuXHR9LFxuXG5cdC8vXHRGb3IgY2hlY2tpbmcgd2hhdCB2ZW5kb3IgcHJlZml4ZXMgYXJlIG5hdGl2ZVxuXHRkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcblxuXHQvL1x0dmVuZG9yIHByZWZpeCwgaWU6IHRyYW5zaXRpb25EdXJhdGlvbiBiZWNvbWVzIE1velRyYW5zaXRpb25EdXJhdGlvblxuXHR2cCA9IGZ1bmN0aW9uIChwcm9wKSB7XG5cdFx0dmFyIHBmO1xuXHRcdC8vXHRIYW5kbGUgdW5wcmVmaXhlZFxuXHRcdGlmIChwcm9wIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fVxuXG5cdFx0Ly9cdEhhbmRsZSBrZXlmcmFtZXNcblx0XHRpZihwcm9wID09IFwiQGtleWZyYW1lc1wiKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdC8vXHRUZXN0aW5nIHVzaW5nIHRyYW5zaXRpb25cblx0XHRcdFx0cGYgPSBwcmVmaXhlc1tpXSArIFwiVHJhbnNpdGlvblwiO1xuXHRcdFx0XHRpZiAocGYgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiQC1cIiArIHByZWZpeGVzW2ldLnRvTG93ZXJDYXNlKCkgKyBcIi1rZXlmcmFtZXNcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0cGYgPSBwcmVmaXhlc1tpXSArIGNhcChwcm9wKTtcblx0XHRcdGlmIChwZiBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdFx0cmV0dXJuIHBmO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvL1x0Q2FuJ3QgZmluZCBpdCAtIHJldHVybiBvcmlnaW5hbCBwcm9wZXJ0eS5cblx0XHRyZXR1cm4gcHJvcDtcblx0fSxcblxuXHQvL1x0U2VlIGlmIHdlIGNhbiB1c2UgbmF0aXZlIHRyYW5zaXRpb25zXG5cdHN1cHBvcnRzVHJhbnNpdGlvbnMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgYiA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXHRcdFx0cyA9IGIuc3R5bGUsXG5cdFx0XHRwID0gJ3RyYW5zaXRpb24nO1xuXG5cdFx0aWYgKHR5cGVvZiBzW3BdID09ICdzdHJpbmcnKSB7IHJldHVybiB0cnVlOyB9XG5cblx0XHQvLyBUZXN0cyBmb3IgdmVuZG9yIHNwZWNpZmljIHByb3Bcblx0XHRwID0gcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHAuc3Vic3RyKDEpO1xuXG5cdFx0Zm9yICh2YXIgaT0wOyBpPHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodHlwZW9mIHNbcHJlZml4ZXNbaV0gKyBwXSA9PSAnc3RyaW5nJykgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHQvL1x0Q29udmVydHMgQ1NTIHRyYW5zaXRpb24gdGltZXMgdG8gTVNcblx0Z2V0VGltZWluTVMgPSBmdW5jdGlvbihzdHIpIHtcblx0XHR2YXIgcmVzdWx0ID0gMCwgdG1wO1xuXHRcdHN0ciArPSBcIlwiO1xuXHRcdHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmKHN0ci5pbmRleE9mKFwibXNcIikgIT09IC0xKSB7XG5cdFx0XHR0bXAgPSBzdHIuc3BsaXQoXCJtc1wiKTtcblx0XHRcdHJlc3VsdCA9IE51bWJlcih0bXBbMF0pO1xuXHRcdH0gZWxzZSBpZihzdHIuaW5kZXhPZihcInNcIikgIT09IC0xKSB7XG5cdFx0XHQvL1x0c1xuXHRcdFx0dG1wID0gc3RyLnNwbGl0KFwic1wiKTtcblx0XHRcdHJlc3VsdCA9IE51bWJlcih0bXBbMF0pICogMTAwMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHN0cik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1hdGgucm91bmQocmVzdWx0KTtcblx0fSxcblxuXHQvL1x0U2V0IHN0eWxlIHByb3BlcnRpZXNcblx0c2V0U3R5bGVQcm9wcyA9IGZ1bmN0aW9uKG9iaiwgcHJvcHMpe1xuXHRcdGZvcih2YXIgaSBpbiBwcm9wcykge2lmKHByb3BzLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRvYmouc3R5bGVbdnAoaSldID0gcHJvcHNbaV07XG5cdFx0fX1cblx0fSxcblxuXHQvL1x0U2V0IHByb3BzIGZvciB0cmFuc2l0aW9ucyBhbmQgdHJhbnNmb3JtcyB3aXRoIGJhc2ljIGRlZmF1bHRzXG5cdHNldFRyYW5zaXRpb25Qcm9wcyA9IGZ1bmN0aW9uKGFyZ3Mpe1xuXHRcdHZhciBwcm9wcyA9IHtcblx0XHRcdFx0Ly9cdGVhc2UsIGxpbmVhciwgZWFzZS1pbiwgZWFzZS1vdXQsIGVhc2UtaW4tb3V0LCBjdWJpYy1iZXppZXIobixuLG4sbikgaW5pdGlhbCwgaW5oZXJpdFxuXHRcdFx0XHRUcmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IFwiZWFzZVwiLFxuXHRcdFx0XHRUcmFuc2l0aW9uRHVyYXRpb246IGRlZmF1bHREdXJhdGlvbiArIFwibXNcIixcblx0XHRcdFx0VHJhbnNpdGlvblByb3BlcnR5OiBcImFsbFwiXG5cdFx0XHR9LFxuXHRcdFx0cCwgaSwgdG1wLCB0bXAyLCBmb3VuZDtcblxuXHRcdC8vXHRTZXQgYW55IGFsbG93ZWQgcHJvcGVydGllcyBcblx0XHRmb3IocCBpbiBhcmdzKSB7IGlmKGFyZ3MuaGFzT3duUHJvcGVydHkocCkpIHtcblx0XHRcdHRtcCA9ICdUcmFuc2l0aW9uJyArIGNhcChwKTtcblx0XHRcdHRtcDIgPSBwLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRmb3VuZCA9IGZhbHNlO1xuXG5cdFx0XHQvL1x0TG9vayBhdCB0cmFuc2l0aW9uIHByb3BzXG5cdFx0XHRmb3IoaSA9IDA7IGkgPCB0cmFuc2l0aW9uUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0aWYodG1wID09IHRyYW5zaXRpb25Qcm9wc1tpXSkge1xuXHRcdFx0XHRcdHByb3BzW3RyYW5zaXRpb25Qcm9wc1tpXV0gPSBhcmdzW3BdO1xuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL1x0TG9vayBhdCB0cmFuc2Zvcm0gcHJvcHNcblx0XHRcdGZvcihpID0gMDsgaSA8IHRyYW5zZm9ybVByb3BzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdGlmKHRtcDIgPT0gdHJhbnNmb3JtUHJvcHNbaV0pIHtcblx0XHRcdFx0XHRwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gPSBwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gfHwgXCJcIjtcblx0XHRcdFx0XHRwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gKz0gXCIgXCIgK3AgKyBcIihcIiArIGFyZ3NbcF0gKyBcIilcIjtcblx0XHRcdFx0XHRmb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYoIWZvdW5kKSB7XG5cdFx0XHRcdHByb3BzW3BdID0gYXJnc1twXTtcblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiBwcm9wcztcblx0fSxcblxuXHQvL1x0Rml4IGFuaW1hdGl1b24gcHJvcGVydGllc1xuXHQvL1x0Tm9ybWFsaXNlcyB0cmFuc2Zvcm1zLCBlZzogcm90YXRlLCBzY2FsZSwgZXRjLi4uXG5cdG5vcm1hbGlzZVRyYW5zZm9ybVByb3BzID0gZnVuY3Rpb24oYXJncyl7XG5cdFx0dmFyIHByb3BzID0ge30sXG5cdFx0XHR0bXBQcm9wLFxuXHRcdFx0cCwgaSwgZm91bmQsXG5cdFx0XHRub3JtYWwgPSBmdW5jdGlvbihwcm9wcywgcCwgdmFsdWUpe1xuXHRcdFx0XHR2YXIgdG1wID0gcC50b0xvd2VyQ2FzZSgpLFxuXHRcdFx0XHRcdGZvdW5kID0gZmFsc2UsIGk7XG5cblx0XHRcdFx0Ly9cdExvb2sgYXQgdHJhbnNmb3JtIHByb3BzXG5cdFx0XHRcdGZvcihpID0gMDsgaSA8IHRyYW5zZm9ybVByb3BzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdFx0aWYodG1wID09IHRyYW5zZm9ybVByb3BzW2ldKSB7XG5cdFx0XHRcdFx0XHRwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gPSBwcm9wc1t2cChcInRyYW5zZm9ybVwiKV0gfHwgXCJcIjtcblx0XHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSArPSBcIiBcIiArcCArIFwiKFwiICsgdmFsdWUgKyBcIilcIjtcblx0XHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCFmb3VuZCkge1xuXHRcdFx0XHRcdHByb3BzW3BdID0gdmFsdWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly9cdFJlbW92ZSB0cmFuc2Zvcm0gcHJvcGVydHlcblx0XHRcdFx0XHRkZWxldGUgcHJvcHNbcF07XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHQvL1x0U2V0IGFueSBhbGxvd2VkIHByb3BlcnRpZXMgXG5cdFx0Zm9yKHAgaW4gYXJncykgeyBpZihhcmdzLmhhc093blByb3BlcnR5KHApKSB7XG5cdFx0XHQvL1x0SWYgd2UgaGF2ZSBhIHBlcmNlbnRhZ2UsIHdlIGhhdmUgYSBrZXkgZnJhbWVcblx0XHRcdGlmKHAuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG5cdFx0XHRcdGZvcihpIGluIGFyZ3NbcF0pIHsgaWYoYXJnc1twXS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0XHRcdG5vcm1hbChhcmdzW3BdLCBpLCBhcmdzW3BdW2ldKTtcblx0XHRcdFx0fX1cblx0XHRcdFx0cHJvcHNbcF0gPSBhcmdzW3BdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9ybWFsKHByb3BzLCBwLCBhcmdzW3BdKTtcblx0XHRcdH1cblx0XHR9fVxuXG5cdFx0cmV0dXJuIHByb3BzO1xuXHR9LFxuXG5cblx0Ly9cdElmIGFuIG9iamVjdCBpcyBlbXB0eVxuXHRpc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG5cdFx0Zm9yKHZhciBpIGluIG9iaikge2lmKG9iai5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH19XG5cdFx0cmV0dXJuIHRydWU7IFxuXHR9LFxuXHQvL1x0Q3JlYXRlcyBhIGhhc2hlZCBuYW1lIGZvciB0aGUgYW5pbWF0aW9uXG5cdC8vXHRVc2UgdG8gY3JlYXRlIGEgdW5pcXVlIGtleWZyYW1lIGFuaW1hdGlvbiBzdHlsZSBydWxlXG5cdGFuaU5hbWUgPSBmdW5jdGlvbihwcm9wcyl7XG5cdFx0cmV0dXJuIFwiYW5pXCIgKyBKU09OLnN0cmluZ2lmeShwcm9wcykuc3BsaXQoL1t7fSwlXCI6XS8pLmpvaW4oXCJcIik7XG5cdH0sXG5cdGFuaW1hdGlvbnMgPSB7fSxcblxuXHQvL1x0U2VlIGlmIHdlIGNhbiB1c2UgdHJhbnNpdGlvbnNcblx0Y2FuVHJhbnMgPSBzdXBwb3J0c1RyYW5zaXRpb25zKCk7XG5cblx0Ly9cdElFMTArIGh0dHA6Ly9jYW5pdXNlLmNvbS8jc2VhcmNoPWNzcy1hbmltYXRpb25zXG5cdG0uYW5pbWF0ZVByb3BlcnRpZXMgPSBmdW5jdGlvbihlbCwgYXJncywgY2Ipe1xuXHRcdGVsLnN0eWxlID0gZWwuc3R5bGUgfHwge307XG5cdFx0dmFyIHByb3BzID0gc2V0VHJhbnNpdGlvblByb3BzKGFyZ3MpLCB0aW1lO1xuXG5cdFx0aWYodHlwZW9mIHByb3BzLlRyYW5zaXRpb25EdXJhdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHByb3BzLlRyYW5zaXRpb25EdXJhdGlvbiA9IGdldFRpbWVpbk1TKHByb3BzLlRyYW5zaXRpb25EdXJhdGlvbikgKyBcIm1zXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHByb3BzLlRyYW5zaXRpb25EdXJhdGlvbiA9IGRlZmF1bHREdXJhdGlvbiArIFwibXNcIjtcblx0XHR9XG5cblx0XHR0aW1lID0gZ2V0VGltZWluTVMocHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uKSB8fCAwO1xuXG5cdFx0Ly9cdFNlZSBpZiB3ZSBzdXBwb3J0IHRyYW5zaXRpb25zXG5cdFx0aWYoY2FuVHJhbnMpIHtcblx0XHRcdHNldFN0eWxlUHJvcHMoZWwsIHByb3BzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9cdFRyeSBhbmQgZmFsbCBiYWNrIHRvIGpRdWVyeVxuXHRcdFx0Ly9cdFRPRE86IFN3aXRjaCB0byB1c2UgdmVsb2NpdHksIGl0IGlzIGJldHRlciBzdWl0ZWQuXG5cdFx0XHRpZih0eXBlb2YgJCAhPT0gJ3VuZGVmaW5lZCcgJiYgJC5mbiAmJiAkLmZuLmFuaW1hdGUpIHtcblx0XHRcdFx0JChlbCkuYW5pbWF0ZShwcm9wcywgdGltZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoY2Ipe1xuXHRcdFx0c2V0VGltZW91dChjYiwgdGltZSsxKTtcblx0XHR9XG5cdH07XG5cblx0Ly9cdFRyaWdnZXIgYSB0cmFuc2l0aW9uIGFuaW1hdGlvblxuXHRtLnRyaWdnZXIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgb3B0aW9ucywgY2Ipe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHZhciBhbmkgPSBhbmltYXRpb25zW25hbWVdO1xuXHRcdGlmKCFhbmkpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgbm90IGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oZSl7XG5cdFx0XHR2YXIgYXJncyA9IGFuaS5mbihmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gdHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbic/IHZhbHVlKCk6IHZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vXHRBbGxvdyBvdmVycmlkZSB2aWEgb3B0aW9uc1xuXHRcdFx0Zm9yKGkgaW4gb3B0aW9ucykgaWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdFx0YXJnc1tpXSA9IG9wdGlvbnNbaV07XG5cdFx0XHR9fVxuXG5cdFx0XHRtLmFuaW1hdGVQcm9wZXJ0aWVzKGUudGFyZ2V0LCBhcmdzLCBjYik7XG5cdFx0fTtcblx0fTtcblxuXHQvL1x0QWRkcyBhbiBhbmltYXRpb24gZm9yIGJpbmRpbmdzIGFuZCBzbyBvbi5cblx0bS5hZGRBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lLCBmbiwgb3B0aW9ucyl7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRpZihhbmltYXRpb25zW25hbWVdKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIGFscmVhZHkgZGVmaW5lZC5cIik7XG5cdFx0fSBlbHNlIGlmKHR5cGVvZiBmbiAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIGlzIGJlaW5nIGFkZGVkIGFzIGEgdHJhbnNpdGlvbiBiYXNlZCBhbmltYXRpb24sIGFuZCBtdXN0IHVzZSBhIGZ1bmN0aW9uLlwiKTtcblx0XHR9XG5cblx0XHRvcHRpb25zLmR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiB8fCBkZWZhdWx0RHVyYXRpb247XG5cblx0XHRhbmltYXRpb25zW25hbWVdID0ge1xuXHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdGZuOiBmblxuXHRcdH07XG5cblx0XHQvL1x0QWRkIGEgZGVmYXVsdCBiaW5kaW5nIGZvciB0aGUgbmFtZVxuXHRcdG0uYWRkQmluZGluZyhuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdG0uYmluZEFuaW1hdGlvbihuYW1lLCB0aGlzLCBmbiwgcHJvcCk7XG5cdFx0fSwgdHJ1ZSk7XG5cdH07XG5cblx0bS5hZGRLRkFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZywgb3B0aW9ucyl7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRpZihhbmltYXRpb25zW25hbWVdKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIGFscmVhZHkgZGVmaW5lZC5cIik7XG5cdFx0fVxuXG5cdFx0dmFyIGluaXQgPSBmdW5jdGlvbihwcm9wcykge1xuXHRcdFx0dmFyIGFuaUlkID0gYW5pTmFtZShwcm9wcyksXG5cdFx0XHRcdGhhc0FuaSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuaUlkKSxcblx0XHRcdFx0a2Y7XG5cblx0XHRcdC8vXHRPbmx5IGluc2VydCBvbmNlXG5cdFx0XHRpZighaGFzQW5pKSB7XG5cdFx0XHRcdGFuaW1hdGlvbnNbbmFtZV0uaWQgPSBhbmlJZDtcblxuXHRcdFx0XHRwcm9wcyA9IG5vcm1hbGlzZVRyYW5zZm9ybVByb3BzKHByb3BzKTtcblx0XHRcdFx0Ly8gIENyZWF0ZSBrZXlmcmFtZXNcblx0XHRcdFx0a2YgPSB2cChcIkBrZXlmcmFtZXNcIikgKyBcIiBcIiArIGFuaUlkICsgXCIgXCIgKyBKU09OLnN0cmluZ2lmeShwcm9wcylcblx0XHRcdFx0XHQuc3BsaXQoXCJcXFwiXCIpLmpvaW4oXCJcIilcblx0XHRcdFx0XHQuc3BsaXQoXCJ9LFwiKS5qb2luKFwifVxcblwiKVxuXHRcdFx0XHRcdC5zcGxpdChcIixcIikuam9pbihcIjtcIilcblx0XHRcdFx0XHQuc3BsaXQoXCIlOlwiKS5qb2luKFwiJSBcIik7XG5cblx0XHRcdFx0dmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdFx0XHRzLnNldEF0dHJpYnV0ZSgnaWQnLCBhbmlJZCk7XG5cdFx0XHRcdHMuaWQgPSBhbmlJZDtcblx0XHRcdFx0cy50ZXh0Q29udGVudCA9IGtmO1xuXHRcdFx0XHQvLyAgTWlnaHQgbm90IGhhdmUgaGVhZD9cblx0XHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzKTtcblx0XHRcdH1cblxuXHRcdFx0YW5pbWF0aW9uc1tuYW1lXS5pc0luaXRpYWxpc2VkID0gdHJ1ZTtcblx0XHRcdGFuaW1hdGlvbnNbbmFtZV0ub3B0aW9ucy5hbmltYXRlSW1tZWRpYXRlbHkgPSB0cnVlO1xuXHRcdH07XG5cblx0XHRvcHRpb25zLmR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiB8fCBkZWZhdWx0RHVyYXRpb247XG5cdFx0b3B0aW9ucy5hbmltYXRlSW1tZWRpYXRlbHkgPSBvcHRpb25zLmFuaW1hdGVJbW1lZGlhdGVseSB8fCBmYWxzZTtcblxuXHRcdGFuaW1hdGlvbnNbbmFtZV0gPSB7XG5cdFx0XHRpbml0OiBpbml0LFxuXHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdGFyZzogYXJnXG5cdFx0fTtcblxuXHRcdC8vXHRBZGQgYSBkZWZhdWx0IGJpbmRpbmcgZm9yIHRoZSBuYW1lXG5cdFx0bS5hZGRCaW5kaW5nKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0bS5iaW5kQW5pbWF0aW9uKG5hbWUsIHRoaXMsIGFyZywgcHJvcCk7XG5cdFx0fSwgdHJ1ZSk7XG5cdH07XG5cblxuXHQvKlx0T3B0aW9ucyAtIGRlZmF1bHRzIC0gd2hhdCBpdCBkb2VzOlxuXG5cdFx0RGVsYXkgLSB1bmVkZWZpbmVkIC0gZGVsYXlzIHRoZSBhbmltYXRpb25cblx0XHREaXJlY3Rpb24gLSBcblx0XHREdXJhdGlvblxuXHRcdEZpbGxNb2RlIC0gXCJmb3J3YXJkXCIgbWFrZXMgc3VyZSBpdCBzdGlja3M6IGh0dHA6Ly93d3cudzNzY2hvb2xzLmNvbS9jc3NyZWYvY3NzM19wcl9hbmltYXRpb24tZmlsbC1tb2RlLmFzcFxuXHRcdEl0ZXJhdGlvbkNvdW50LCBcblx0XHROYW1lLCBQbGF5U3RhdGUsIFRpbWluZ0Z1bmN0aW9uXG5cdFxuXHQqL1xuXG5cdC8vXHRVc2VmdWwgdG8ga25vdywgJ3RvJyBhbmQgJ2Zyb20nOiBodHRwOi8vbGVhLnZlcm91Lm1lLzIwMTIvMTIvYW5pbWF0aW9ucy13aXRoLW9uZS1rZXlmcmFtZS9cblx0bS5hbmltYXRlS0YgPSBmdW5jdGlvbihuYW1lLCBlbCwgb3B0aW9ucywgY2Ipe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHZhciBhbmkgPSBhbmltYXRpb25zW25hbWVdLCBpLCBwcm9wcyA9IHt9O1xuXHRcdGlmKCFhbmkpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgbm90IGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHQvL1x0QWxsb3cgb3ZlcnJpZGUgdmlhIG9wdGlvbnNcblx0XHRhbmkub3B0aW9ucyA9IGFuaS5vcHRpb25zIHx8IHt9O1xuXHRcdGZvcihpIGluIG9wdGlvbnMpIGlmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRhbmkub3B0aW9uc1tpXSA9IG9wdGlvbnNbaV07XG5cdFx0fX1cblxuXHRcdGlmKCFhbmkuaXNJbml0aWFsaXNlZCAmJiBhbmkuaW5pdCkge1xuXHRcdFx0YW5pLmluaXQoYW5pLmFyZyk7XG5cdFx0fVxuXG5cdFx0Ly9cdEFsbG93IGFuaW1hdGUgb3ZlcnJpZGVzXG5cdFx0Zm9yKGkgaW4gYW5pLm9wdGlvbnMpIGlmKGFuaS5vcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0cHJvcHNbdnAoXCJhbmltYXRpb25cIiArIGNhcChpKSldID0gYW5pLm9wdGlvbnNbaV07XG5cdFx0fX1cblxuXHRcdC8vXHRTZXQgcmVxdWlyZWQgaXRlbXMgYW5kIGRlZmF1bHQgdmFsdWVzIGZvciBwcm9wc1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uTmFtZVwiKV0gPSBhbmkuaWQ7XG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV0gPSAocHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV0/IHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildOiBkZWZhdWx0RHVyYXRpb24pICsgXCJtc1wiO1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uRGVsYXlcIildID0gcHJvcHNbdnAoXCJhbmltYXRpb25EZWxheVwiKV0/IHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildICsgXCJtc1wiOiB1bmRlZmluZWQ7XG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25GaWxsTW9kZVwiKV0gPSBwcm9wc1t2cChcImFuaW1hdGlvbkZpbGxNb2RlXCIpXSB8fCBcImZvcndhcmRzXCI7XG5cblx0XHRlbC5zdHlsZSA9IGVsLnN0eWxlIHx8IHt9O1xuXG5cdFx0Ly9cdFVzZSBmb3IgY2FsbGJhY2tcblx0XHR2YXIgZW5kQW5pID0gZnVuY3Rpb24oKXtcblx0XHRcdC8vXHRSZW1vdmUgbGlzdGVuZXJcblx0XHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgZW5kQW5pLCBmYWxzZSk7XG5cdFx0XHRpZihjYil7XG5cdFx0XHRcdGNiKGVsKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly9cdFJlbW92ZSBhbmltYXRpb24gaWYgYW55XG5cdFx0ZWwuc3R5bGVbdnAoXCJhbmltYXRpb25cIildID0gXCJcIjtcblx0XHRlbC5zdHlsZVt2cChcImFuaW1hdGlvbk5hbWVcIildID0gXCJcIjtcblxuXHRcdC8vXHRNdXN0IHVzZSB0d28gcmVxdWVzdCBhbmltYXRpb24gZnJhbWUgY2FsbHMsIGZvciBGRiB0b1xuXHRcdC8vXHR3b3JrIHByb3Blcmx5LCBkb2VzIG5vdCBzZWVtIHRvIGhhdmUgYW55IGFkdmVyc2UgZWZmZWN0c1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdC8vXHRBcHBseSBwcm9wc1xuXHRcdFx0XHRmb3IoaSBpbiBwcm9wcykgaWYocHJvcHMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRcdFx0ZWwuc3R5bGVbaV0gPSBwcm9wc1tpXTtcblx0XHRcdFx0fX1cblxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwiYW5pbWF0aW9uZW5kXCIsIGVuZEFuaSwgZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH07XG5cblx0bS50cmlnZ2VyS0YgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdG0uYW5pbWF0ZUtGKG5hbWUsIHRoaXMsIG9wdGlvbnMpO1xuXHRcdH07XG5cdH07XG5cblx0bS5iaW5kQW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSwgZWwsIG9wdGlvbnMsIHByb3ApIHtcblx0XHR2YXIgYW5pID0gYW5pbWF0aW9uc1tuYW1lXTtcblxuXHRcdGlmKCFhbmkgJiYgIWFuaS5uYW1lKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0aWYoYW5pLmZuKSB7XG5cdFx0XHRtLmFuaW1hdGVQcm9wZXJ0aWVzKGVsLCBhbmkuZm4ocHJvcCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgb2xkQ29uZmlnID0gZWwuY29uZmlnO1xuXHRcdFx0ZWwuY29uZmlnID0gZnVuY3Rpb24oZWwsIGlzSW5pdCl7XG5cdFx0XHRcdGlmKCFhbmkuaXNJbml0aWFsaXNlZCAmJiBhbmkuaW5pdCkge1xuXHRcdFx0XHRcdGFuaS5pbml0KG9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHByb3AoKSAmJiBpc0luaXQpIHtcblx0XHRcdFx0XHRtLmFuaW1hdGVLRihuYW1lLCBlbCwgb3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYob2xkQ29uZmlnKSB7XG5cdFx0XHRcdFx0b2xkQ29uZmlnLmFwcGx5KGVsLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxuXG5cblx0LyogRGVmYXVsdCB0cmFuc2Zvcm0yZCBiaW5kaW5ncyAqL1xuXHR2YXIgYmFzaWNCaW5kaW5ncyA9IFsnc2NhbGUnLCAnc2NhbGV4JywgJ3NjYWxleScsICd0cmFuc2xhdGUnLCAndHJhbnNsYXRleCcsICd0cmFuc2xhdGV5JywgXG5cdFx0J21hdHJpeCcsICdiYWNrZ3JvdW5kQ29sb3InLCAnYmFja2dyb3VuZFBvc2l0aW9uJywgJ2JvcmRlckJvdHRvbUNvbG9yJywgXG5cdFx0J2JvcmRlckJvdHRvbVdpZHRoJywgJ2JvcmRlckxlZnRDb2xvcicsICdib3JkZXJMZWZ0V2lkdGgnLCAnYm9yZGVyUmlnaHRDb2xvcicsIFxuXHRcdCdib3JkZXJSaWdodFdpZHRoJywgJ2JvcmRlclNwYWNpbmcnLCAnYm9yZGVyVG9wQ29sb3InLCAnYm9yZGVyVG9wV2lkdGgnLCAnYm90dG9tJywgXG5cdFx0J2NsaXAnLCAnY29sb3InLCAnZm9udFNpemUnLCAnZm9udFdlaWdodCcsICdoZWlnaHQnLCAnbGVmdCcsICdsZXR0ZXJTcGFjaW5nJywgXG5cdFx0J2xpbmVIZWlnaHQnLCAnbWFyZ2luQm90dG9tJywgJ21hcmdpbkxlZnQnLCAnbWFyZ2luUmlnaHQnLCAnbWFyZ2luVG9wJywgJ21heEhlaWdodCcsIFxuXHRcdCdtYXhXaWR0aCcsICdtaW5IZWlnaHQnLCAnbWluV2lkdGgnLCAnb3BhY2l0eScsICdvdXRsaW5lQ29sb3InLCAnb3V0bGluZVdpZHRoJywgXG5cdFx0J3BhZGRpbmdCb3R0b20nLCAncGFkZGluZ0xlZnQnLCAncGFkZGluZ1JpZ2h0JywgJ3BhZGRpbmdUb3AnLCAncmlnaHQnLCAndGV4dEluZGVudCcsIFxuXHRcdCd0ZXh0U2hhZG93JywgJ3RvcCcsICd2ZXJ0aWNhbEFsaWduJywgJ3Zpc2liaWxpdHknLCAnd2lkdGgnLCAnd29yZFNwYWNpbmcnLCAnekluZGV4J10sXG5cdFx0ZGVnQmluZGluZ3MgPSBbJ3JvdGF0ZScsICdyb3RhdGV4JywgJ3JvdGF0ZXknLCAnc2tld3gnLCAnc2tld3knXSwgaTtcblxuXHQvL1x0QmFzaWMgYmluZGluZ3Mgd2hlcmUgd2UgcGFzcyB0aGUgcHJvcCBzdHJhaWdodCB0aHJvdWdoXG5cdGZvcihpID0gMDsgaSA8IGJhc2ljQmluZGluZ3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHQoZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRtLmFkZEFuaW1hdGlvbihuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdFx0dmFyIG9wdGlvbnMgPSB7fTtcblx0XHRcdFx0b3B0aW9uc1tuYW1lXSA9IHByb3AoKTtcblx0XHRcdFx0cmV0dXJuIG9wdGlvbnM7XG5cdFx0XHR9KTtcblx0XHR9KGJhc2ljQmluZGluZ3NbaV0pKTtcblx0fVxuXG5cdC8vXHREZWdyZWUgYmFzZWQgYmluZGluZ3MgLSBjb25kaXRpb25hbGx5IHBvc3RmaXggd2l0aCBcImRlZ1wiXG5cdGZvcihpID0gMDsgaSA8IGRlZ0JpbmRpbmdzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0KGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0bS5hZGRBbmltYXRpb24obmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRcdHZhciBvcHRpb25zID0ge30sIHZhbHVlID0gcHJvcCgpO1xuXHRcdFx0XHRvcHRpb25zW25hbWVdID0gaXNOYU4odmFsdWUpPyB2YWx1ZTogdmFsdWUgKyBcImRlZ1wiO1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH0pO1xuXHRcdH0oZGVnQmluZGluZ3NbaV0pKTtcblx0fVxuXG5cdC8vXHRBdHRyaWJ1dGVzIHRoYXQgcmVxdWlyZSBtb3JlIHRoYW4gb25lIHByb3Bcblx0bS5hZGRBbmltYXRpb24oXCJza2V3XCIsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHZhciB2YWx1ZSA9IHByb3AoKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2tldzogW1xuXHRcdFx0XHR2YWx1ZVswXSArIChpc05hTih2YWx1ZVswXSk/IFwiXCI6XCJkZWdcIiksIFxuXHRcdFx0XHR2YWx1ZVsxXSArIChpc05hTih2YWx1ZVsxXSk/IFwiXCI6XCJkZWdcIilcblx0XHRcdF1cblx0XHR9O1xuXHR9KTtcblxuXG5cblx0Ly9cdEEgZmV3IG1vcmUgYmluZGluZ3Ncblx0bSA9IG0gfHwge307XG5cdC8vXHRIaWRlIG5vZGVcblx0bS5hZGRCaW5kaW5nKFwiaGlkZVwiLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLnN0eWxlID0ge1xuXHRcdFx0ZGlzcGxheTogbS51bndyYXAocHJvcCk/IFwibm9uZVwiIDogXCJcIlxuXHRcdH07XG5cdH0sIHRydWUpO1xuXG5cdC8vXHRUb2dnbGUgYm9vbGVhbiB2YWx1ZSBvbiBjbGlja1xuXHRtLmFkZEJpbmRpbmcoJ3RvZ2dsZScsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMub25jbGljayA9IGZ1bmN0aW9uKCl7XG5cdFx0XHR2YXIgdmFsdWUgPSBwcm9wKCk7XG5cdFx0XHRwcm9wKCF2YWx1ZSk7XG5cdFx0fVxuXHR9LCB0cnVlKTtcblxuXHQvL1x0U2V0IGhvdmVyIHN0YXRlcywgYSdsYSBqUXVlcnkgcGF0dGVyblxuXHRtLmFkZEJpbmRpbmcoJ2hvdmVyJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbm1vdXNlb3ZlciA9IHByb3BbMF07XG5cdFx0aWYocHJvcFsxXSkge1xuXHRcdFx0dGhpcy5vbm1vdXNlb3V0ID0gcHJvcFsxXTtcblx0XHR9XG5cdH0sIHRydWUgKTtcblxuXG59O1xuXG5cblxuXG5cblxuXG5pZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IG1pdGhyaWxBbmltYXRlO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1pdGhyaWxBbmltYXRlO1xuXHR9KTtcbn0gZWxzZSB7XG5cdG1pdGhyaWxBbmltYXRlKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIj8gd2luZG93Lm0gfHwge306IHt9KTtcbn1cblxufSgpKTsiLCIvLyAgU21vb3RoIHNjcm9sbGluZyBmb3IgbGlua3Ncbi8vICBVc2FnZTogICAgICBBKHtjb25maWc6IHNtb290aFNjcm9sbChjdHJsKSwgaHJlZjogXCIjdG9wXCJ9LCBcIkJhY2sgdG8gdG9wXCIpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGN0cmwpe1xuXHQvL3ZhciByb290ID0gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpPyBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDogdGhpcyxcblx0dmFyIHJvb3QgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpPyAvZmlyZWZveHx0cmlkZW50L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IGRvY3VtZW50LmJvZHk6IG51bGwsXG5cdFx0ZWFzZUluT3V0U2luZSA9IGZ1bmN0aW9uICh0LCBiLCBjLCBkKSB7XG5cdFx0XHQvLyAgaHR0cDovL2dpem1hLmNvbS9lYXNpbmcvXG5cdFx0XHRyZXR1cm4gLWMvMiAqIChNYXRoLmNvcyhNYXRoLlBJKnQvZCkgLSAxKSArIGI7XG5cdFx0fTtcblxuXHRyZXR1cm4gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCkge1xuXHRcdGlmKCFpc0luaXRpYWxpemVkKSB7XG5cdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHZhciBzdGFydFRpbWUsXG5cdFx0XHRcdFx0c3RhcnRQb3MgPSByb290LnNjcm9sbFRvcCxcblx0XHRcdFx0XHRlbmRQb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgvW14jXSskLy5leGVjKHRoaXMuaHJlZilbMF0pLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCxcblx0XHRcdFx0XHRoYXNoID0gdGhpcy5ocmVmLnN1YnN0cih0aGlzLmhyZWYubGFzdEluZGV4T2YoXCIjXCIpKSxcblx0XHRcdFx0XHRtYXhTY3JvbGwgPSByb290LnNjcm9sbEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCxcblx0XHRcdFx0XHRzY3JvbGxFbmRWYWx1ZSA9IChzdGFydFBvcyArIGVuZFBvcyA8IG1heFNjcm9sbCk/IGVuZFBvczogbWF4U2Nyb2xsIC0gc3RhcnRQb3MsXG5cdFx0XHRcdFx0ZHVyYXRpb24gPSB0eXBlb2YgY3RybC5kdXJhdGlvbiAhPT0gJ3VuZGVmaW5lZCc/IGN0cmwuZHVyYXRpb246IDE1MDAsXG5cdFx0XHRcdFx0c2Nyb2xsRnVuYyA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuXHRcdFx0XHRcdFx0c3RhcnRUaW1lID0gc3RhcnRUaW1lIHx8IHRpbWVzdGFtcDtcblx0XHRcdFx0XHRcdHZhciBlbGFwc2VkID0gdGltZXN0YW1wIC0gc3RhcnRUaW1lLFxuXHRcdFx0XHRcdFx0XHRwcm9ncmVzcyA9IGVhc2VJbk91dFNpbmUoZWxhcHNlZCwgc3RhcnRQb3MsIHNjcm9sbEVuZFZhbHVlLCBkdXJhdGlvbik7XG5cdFx0XHRcdFx0XHRyb290LnNjcm9sbFRvcCA9IHByb2dyZXNzO1xuXHRcdFx0XHRcdFx0aWYoZWxhcHNlZCA8IGR1cmF0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxGdW5jKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGlmKGhpc3RvcnkucHVzaFN0YXRlKSB7XG5cdFx0XHRcdFx0XHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgaGFzaCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0bG9jYXRpb24uaGFzaCA9IGhhc2g7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbEZ1bmMpXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyByZXR1cm4ge1wiQXBpLm1kXCI6XCI8cD5UaGUgZGF0YSBhcGlzIGluIG1pc28gYXJlIGEgd2F5IHRvIGNyZWF0ZSBhIFJFU1RmdWwgZW5kcG9pbnQgdGhhdCB5b3UgY2FuIGludGVyYWN0IHdpdGggdmlhIGFuIGVhc3kgdG8gdXNlIEFQSS48L3A+XFxuPGJsb2NrcXVvdGU+XFxuTm90ZTogeW91IG11c3QgZW5hYmxlIHlvdXIgYXBpIGJ5IGFkZGluZyBpdCB0byB0aGUgJnF1b3Q7YXBpJnF1b3Q7IGF0dHJpYnV0ZSBpbiB0aGUgPGNvZGU+L2NmZy9zZXJ2ZXIuZGV2ZWxvcG1lbnQuanNvbjwvY29kZT4gZmlsZSwgb3Igd2hhdGV2ZXIgZW52aXJvbm1lbnQgeW91IGFyZSB1c2luZy5cXG48L2Jsb2NrcXVvdGU+XFxuXFxuPGgyPjxhIG5hbWU9XFxcImhvdy1kb2VzLWFuLWFwaS13b3JrLVxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2hvdy1kb2VzLWFuLWFwaS13b3JrLVxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ib3cgZG9lcyBhbiBhcGkgd29yaz88L3NwYW4+PC9hPjwvaDI+PHA+VGhlIGFwaXMgaW4gbWlzbyBkbyBhIG51bWJlciBvZiB0aGluZ3M6PC9wPlxcbjx1bD5cXG48bGk+QWxsb3cgZGF0YWJhc2UgYWNjZXNzIHZpYSBhIHRoaW4gd3JhcHBlciwgZm9yIGV4YW1wbGUgdG8gYWNjZXNzIG1vbmdvZGIsIHdlIHdyYXAgdGhlIHBvcHVsYXIgPGEgaHJlZj1cXFwiL2RvYy9tb25nb29zZS5tZFxcXCI+bW9uZ29vc2UgbnBtPC9hPiBPRE0gcGFja2FnZTwvbGk+XFxuPGxpPldhaXRzIHRpbGwgbWl0aHJpbCBpcyByZWFkeSAtIG1pdGhyaWwgaGFzIGEgdW5pcXVlIGZlYXR1cmUgZW5zdXJlcyB0aGUgdmlldyBkb2VzbiYjMzk7dCByZW5kZXIgdGlsbCBkYXRhIGhhcyBiZWVuIHJldHJpZXZlZCAtIHRoZSBhcGkgbWFrZXMgc3VyZSB3ZSBhZGhlcmUgdG8gdGhpczwvbGk+XFxuPGxpPkFwaXMgY2FuIHdvcmsgYXMgYSBwcm94eSwgc28gaWYgeW91IHdhbnQgdG8gYWNjZXNzIGEgM3JkIHBhcnR5IHNlcnZpY2UsIGFuIGFwaSBpcyBhIGdvb2Qgd2F5IHRvIGRvIHRoYXQgLSB5b3UgY2FuIHRoZW4gYWxzbyBidWlsZCBpbiBjYWNoaW5nLCBvciBhbnkgb3RoZXIgZmVhdHVyZXMgeW91IG1heSB3aXNoIHRvIGFkZC48L2xpPlxcbjxsaT5BcGlzIGNhbiBiZSByZXN0cmljdGVkIGJ5IHBlcm1pc3Npb25zIChjb21pbmcgc29vbikgPC9saT5cXG48L3VsPlxcbjxoMj48YSBuYW1lPVxcXCJob3ctc2hvdWxkLXlvdS11c2UtYXBpc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2hvdy1zaG91bGQteW91LXVzZS1hcGlzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkhvdyBzaG91bGQgeW91IHVzZSBhcGlzPC9zcGFuPjwvYT48L2gyPjxwPlRoZXJlIGFyZSBudW1lcm91cyBzY2VuYXJpb3Mgd2hlcmUgeW91IG1pZ2h0IHdhbnQgdG8gdXNlIGFuIGFwaTo8L3A+XFxuPHVsPlxcbjxsaT5Gb3IgZGF0YWJhc2UgYWNjZXNzIChtaXNvIGNvbWVzIHdpdGggYSBidW5jaCBvZiBkYXRhYmFzZSBhcGlzKTwvbGk+XFxuPGxpPkZvciBjYWxsaW5nIDNyZCBwYXJ0eSBlbmQtcG9pbnRzIC0gdXNpbmcgYW4gYXBpIHdpbGwgYWxsb3cgeW91IHRvIGNyZWF0ZSBjYWNoaW5nIGFuZCBzZXR1cCBwZXJtaXNzaW9ucyBvbiB0aGUgZW5kLXBvaW50PC9saT5cXG48L3VsPlxcbjxoMj48YSBuYW1lPVxcXCJleHRlbmRpbmctYW4tZXhpc3RpbmctYXBpXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZXh0ZW5kaW5nLWFuLWV4aXN0aW5nLWFwaVxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5FeHRlbmRpbmcgYW4gZXhpc3RpbmcgYXBpPC9zcGFuPjwvYT48L2gyPjxwPklmIHlvdSB3YW50IHRvIGFkZCB5b3VyIG93biBtZXRob2RzIHRvIGFuIGFwaSwgeW91IGNhbiBzaW1wbHkgZXh0ZW5kIG9uZSBvZiB0aGUgZXhpc3RpbmcgYXBpcywgZm9yIGV4YW1wbGUsIHRvIGV4dGVuZCB0aGUgPGNvZGU+ZmxhdGZpbGVkYjwvY29kZT4gQVBJLCBjcmVhdGUgYSBuZXcgZGlyZWN0b3J5IGFuZCBmaWxlIGluIDxjb2RlPi9tb2R1bGVzL2FwaS9hZGFwdC9hZGFwdC5hcGkuanM8L2NvZGU+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBkYiA9IHJlcXVpcmUoJiMzOTsuLi8uLi8uLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvZmxhdGZpbGVkYi5hcGkuanMmIzM5Oyk7XFxuXFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcXG4gICAgdmFyIGFkID0gZGIobSk7XFxuICAgIGFkLmhlbGxvID0gZnVuY3Rpb24oY2IsIGVyciwgYXJncywgcmVxKXtcXG4gICAgICAgIGNiKCZxdW90O3dvcmxkJnF1b3Q7KTtcXG4gICAgfTtcXG4gICAgcmV0dXJuIGFkO1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZW4gYWRkIHRoZSBhcGkgdG8gdGhlIDxjb2RlPi9jZmcvc2VydmVyLmRldmVsb3BtZW50Lmpzb248L2NvZGU+IGZpbGUgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4mcXVvdDthcGkmcXVvdDs6ICZxdW90O2FkYXB0JnF1b3Q7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZW4gcmVxdWlyZSB0aGUgbmV3IGFwaSBmaWxlIGluIHlvdXIgbXZjIGZpbGUgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5kYiA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9hZGFwdC9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5Zb3UgY2FuIG5vdyBhZGQgYW4gYXBpIGNhbGwgaW4gdGhlIGNvbnRyb2xsZXIgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5kYi5oZWxsbyh7fSkudGhlbihmdW5jdGlvbihkYXRhKXtcXG4vLyBkbyBzb21ldGhpbmcgd2l0aCBkYXRhLnJlc3VsdFxcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGUgYXJndW1lbnRzIHRvIGVhY2ggYXBpIGVuZHBvaW50IG11c3QgYmUgdGhlIHNhbWUsIGllOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmZ1bmN0aW9uKGNiLCBlcnIsIGFyZ3MsIHJlcSlcXG48L2NvZGU+PC9wcmU+XFxuPHA+V2hlcmU6PC9wPlxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5Bcmd1bWVudDwvdGg+XFxuPHRoPlB1cnBvc2U8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5jYjwvdGQ+XFxuPHRkPkEgY2FsbGJhY2sgeW91IG11c3QgY2FsbCB3aGVuIHlvdSBhcmUgZG9uZSAtIGFueSBkYXRhIHlvdSByZXR1cm4gd2lsbCBiZSBhdmFpbGFibGUgb24gPGNvZGU+ZGF0YS5yZXN1bHQ8L2NvZGU+IGluIHRoZSByZXNwb25zZTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmVycjwvdGQ+XFxuPHRkPkEgY2FsbGJhY2sgeW91IG11c3QgY2FsbCBpZiBhbiB1bnJlY292ZXJhYmxlIGVycm9yIG9jY3VycmVkLCBlZzogJnF1b3Q7ZGF0YWJhc2UgY29ubmVjdGlvbiB0aW1lb3V0JnF1b3Q7LiBEbyBub3QgdXNlIGZvciB0aGluZ3MgbGlrZSAmcXVvdDtubyBkYXRhIGZvdW5kJnF1b3Q7PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+YXJnczwvdGQ+XFxuPHRkPkEgc2V0IG9mIGFyZ3VtZW50cyBwYXNzZWQgaW4gdG8gdGhlIGFwaSBtZXRob2Q8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5yZXE8L3RkPlxcbjx0ZD5UaGUgcmVxdWVzdCBvYmplY3QgZnJvbSB0aGUgcmVxdWVzdDwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+VGhlIGNvbXBsZXRlIG12YyBleGFtcGxlIGxvb2tzIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGRiID0gcmVxdWlyZSgmIzM5Oy4uL21vZHVsZXMvYXBpL2FkYXB0L2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuXFxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgICAgIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTthZGFwdF9pZCYjMzk7LCBwYXJhbXMpO1xcblxcbiAgICAgICAgZGIuaGVsbG8oe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgY3RybC5tb2RlbC53aG8oZGF0YS5yZXN1bHQpO1xcbiAgICAgICAgfSk7XFxuXFxuICAgICAgICBjdHJsLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IHdob30pO1xcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIERJVigmcXVvdDtHJiMzOTtkYXkgJnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSk7XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48aDI+PGEgbmFtZT1cXFwiY3JlYXRpbmctY3VzdG9tLWFwaXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjcmVhdGluZy1jdXN0b20tYXBpc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5DcmVhdGluZyBjdXN0b20gYXBpczwvc3Bhbj48L2E+PC9oMj48cD5Zb3UgY2FuIGFkZCB5b3VyIG93biBjdXN0b20gYXBpcyBpbiB0aGUgPGNvZGU+L21vZHVsZXMvYXBpczwvY29kZT4gZGlyZWN0b3J5LCB0aGV5IGhhdmUgdGhlIHNhbWUgZm9ybWF0IGFzIHRoZSBpbmNsdWRlZCBhcGlzLCBoZXJlIGlzIGFuIGV4YW1wbGUgYXBpIHRoYXQgY2FsbHMgdGhlIGZsaWNrciBBUEk6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Ly8gICAgZW5kcG9pbnQgYXBpIHRvIG1ha2UgaHR0cCByZXF1ZXN0cyB2aWEgZmxpY2tyXFxudmFyIHJlcXVlc3QgPSByZXF1aXJlKCYjMzk7cmVxdWVzdCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi8uLi8uLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICAvLyAgICBQYXJzZSBvdXQgdGhlIHVud2FudGVkIHBhcnRzIG9mIHRoZSBqc29uXFxuICAgIC8vICAgIHR5cGljYWxseSB0aGlzIHdvdWxkIGJlIHJ1biBvbiB0aGUgY2xpZW50XFxuICAgIC8vICAgIHdlIHJ1biB0aGlzIHVzaW5nICZxdW90O3JlcXVlc3QmcXVvdDsgb24gIHRoZSBzZXJ2ZXIsIHNvXFxuICAgIC8vICAgIG5vIG5lZWQgZm9yIHRoZSBqc29ucCBjYWxsYmFja1xcbiAgICBqc29uUGFyc2VyID0gZnVuY3Rpb24oanNvbnBEYXRhKXtcXG4gICAgICAgIHZhciBqc29uLCBzdGFydFBvcywgZW5kUG9zO1xcbiAgICAgICAgdHJ5IHtcXG4gICAgICAgICAgICBzdGFydFBvcyA9IGpzb25wRGF0YS5pbmRleE9mKCYjMzk7KHsmIzM5Oyk7XFxuICAgICAgICAgICAgZW5kUG9zID0ganNvbnBEYXRhLmxhc3RJbmRleE9mKCYjMzk7fSkmIzM5Oyk7XFxuICAgICAgICAgICAganNvbiA9IGpzb25wRGF0YVxcbiAgICAgICAgICAgICAgICAuc3Vic3RyaW5nKHN0YXJ0UG9zKzEsIGVuZFBvcysxKVxcbiAgICAgICAgICAgICAgICAuc3BsaXQoJnF1b3Q7XFxcXG4mcXVvdDspLmpvaW4oJnF1b3Q7JnF1b3Q7KVxcbiAgICAgICAgICAgICAgICAuc3BsaXQoJnF1b3Q7XFxcXFxcXFwmIzM5OyZxdW90Oykuam9pbigmcXVvdDsmIzM5OyZxdW90Oyk7XFxuXFxuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoanNvbik7XFxuICAgICAgICB9IGNhdGNoKGV4KSB7XFxuICAgICAgICAgICAgY29uc29sZS5sb2coJnF1b3Q7RVJST1ImcXVvdDssIGV4KTtcXG4gICAgICAgICAgICByZXR1cm4gJnF1b3Q7e30mcXVvdDs7XFxuICAgICAgICB9XFxuICAgIH07XFxuXFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1dGlscyl7XFxuICAgIHJldHVybiB7XFxuICAgICAgICBwaG90b3M6IGZ1bmN0aW9uKGNiLCBlcnIsIGFyZ3MsIHJlcSl7XFxuICAgICAgICAgICAgYXJncyA9IGFyZ3MgfHwge307XFxuICAgICAgICAgICAgdmFyIHVybCA9ICZxdW90O2h0dHA6Ly9hcGkuZmxpY2tyLmNvbS9zZXJ2aWNlcy9mZWVkcy9waG90b3NfcHVibGljLmduZT9mb3JtYXQ9anNvbiZxdW90OztcXG4gICAgICAgICAgICAvLyAgICBBZGQgcGFyYW1ldGVyc1xcbiAgICAgICAgICAgIHVybCArPSBtaXNvLmVhY2goYXJncywgZnVuY3Rpb24odmFsdWUsIGtleSl7XFxuICAgICAgICAgICAgICAgIHJldHVybiAmcXVvdDsmYW1wOyZxdW90OyArIGtleSArICZxdW90Oz0mcXVvdDsgKyB2YWx1ZTtcXG4gICAgICAgICAgICB9KTtcXG5cXG4gICAgICAgICAgICByZXF1ZXN0KHVybCwgZnVuY3Rpb24gKGVycm9yLCByZXNwb25zZSwgYm9keSkge1xcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yICZhbXA7JmFtcDsgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9PSAyMDApIHtcXG4gICAgICAgICAgICAgICAgICAgIGNiKGpzb25QYXJzZXIoYm9keSkpO1xcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xcbiAgICAgICAgICAgICAgICAgICAgZXJyKGVycm9yKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgfVxcbiAgICB9O1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRvIHVzZSBpdCBpbiB5b3VyIG12YyBmaWxlLCBzaW1wbHk6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZmxpY2tyID0gcmVxdWlyZSgmIzM5Oy4uL21vZHVsZXMvYXBpL2ZsaWNrci9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5BbmQgdGhlbiBjYWxsIGl0IGxpa2Ugc28gaW4geW91ciBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmZsaWNrci5waG90b3Moe3RhZ3M6ICZxdW90O1N5ZG5leSBvcGVyYSBob3VzZSZxdW90OywgdGFnbW9kZTogJnF1b3Q7YW55JnF1b3Q7fSkudGhlbihmdW5jdGlvbihkYXRhKXtcXG4gICAgY3RybC5tb2RlbC5mbGlja3JEYXRhKGRhdGEucmVzdWx0Lml0ZW1zKTtcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuXCIsXCJBdXRoZW50aWNhdGlvbi5tZFwiOlwiPGgyPjxhIG5hbWU9XFxcImF1dGhlbnRpY2F0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjYXV0aGVudGljYXRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+QXV0aGVudGljYXRpb248L3NwYW4+PC9hPjwvaDI+PHA+QXV0aGVudGljYXRpb24gaXMgdGhlIHByb2Nlc3Mgb2YgbWFraW5nIHN1cmUgYSB1c2VyIGlzIHdobyB0aGV5IHNheSB0aGV5IGFyZSAtIHVzdWFsbHkgdGhpcyBpcyBkb25lIGJ5IHVzaW5nIGEgdXNlcm5hbWUgYW5kIHBhc3N3b3JkLCBidXQgaXQgY2FuIGFsc28gYmUgZG9uZSB2aWEgYW4gYWNjZXNzIHRva2VuLCAzcmQtcGFydHkgc2VydmljZXMgc3VjaCBhcyBPQXV0aCwgb3Igc29tZXRoaW5nIGxpa2UgT3BlbklELCBvciBpbmRlZWQgR29vZ2xlLCBGYWNlYm9vaywgR2l0SFViLCBldGMuLi48L3A+XFxuPHA+SW4gbWlzbywgdGhlIGF1dGhlbnRpY2F0aW9uIGZlYXR1cmUgaGFzOjwvcD5cXG48dWw+XFxuPGxpPlRoZSBhYmlsaXR5IHRvIHNlZSBpZiB0aGUgdXNlciBoYXMgbG9nZ2VkIGluICh2aWEgYSBzZWNyZXQgdmFsdWUgb24gdGhlIHNlcnZlci1zaWRlIHNlc3Npb24pPC9saT5cXG48bGk+VGhlIGFiaWxpdHkgdG8gcmVkaXJlY3QgdG8gYSBsb2dpbiBwYWdlIGlmIHRoZXkgaGF2ZW4mIzM5O3QgbG9nZ2VkIGluPC9saT5cXG48L3VsPlxcbjxwPllvdSBjYW4gY29uZmlndXJlIHRoZSBhdXRoZW50aWNhdGlvbiBpbiA8Y29kZT4vY2ZnL3NlcnZlci5qc29uPC9jb2RlPiwgYW5kIHNldCB0aGUgYXV0aGVudGljYXRpb24gYXR0cmlidXRlIG9uIHRoZSBhY3Rpb24gdGhhdCByZXF1aXJlcyBpdC48L3A+XFxuPHA+Rm9yIGV4YW1wbGUsIGluIDxjb2RlPi9jZmcvc2VydmVyLmpzb248L2NvZGU+LCB5b3UgY2FuIHNldDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4mcXVvdDthdXRoZW50aWNhdGlvbiZxdW90Ozoge1xcbiAgICAmcXVvdDtlbmFibGVkJnF1b3Q7OiB0cnVlLFxcbiAgICAmcXVvdDthbGwmcXVvdDs6IGZhbHNlLFxcbiAgICAmcXVvdDtzZWNyZXQmcXVvdDs6ICZxdW90O2ltLXNvLW1pc28mcXVvdDssXFxuICAgICZxdW90O3N0cmF0ZWd5JnF1b3Q7OiAmcXVvdDtkZWZhdWx0JnF1b3Q7LFxcbiAgICAmcXVvdDtsb2dpblVybFBhdHRlcm4mcXVvdDs6ICZxdW90Oy9sb2dpbj91cmw9W09SSUdJTkFMVVJMXSZxdW90O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+V2hlcmU6PC9wPlxcbjx1bD5cXG48bGk+PHN0cm9uZz5lbmFibGVkPC9zdHJvbmc+IHdpbGwgZW5hYmxlIG91ciBhdXRoZW50aWNhdGlvbiBiZWhhdmlvdXI8L2xpPlxcbjxsaT48c3Ryb25nPmFsbDwvc3Ryb25nPiB3aWxsIHNldCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgb2YgYXV0aGVudGljYXRpb24gZm9yIGFsbCBhY3Rpb25zLCBkZWZhdWx0IGlzICZxdW90O2ZhbHNlJnF1b3Q7LCBpZTogbm8gYXV0aGVudGljYXRpb24gcmVxdWlyZWQ8L2xpPlxcbjxsaT48c3Ryb25nPnNlY3JldDwvc3Ryb25nPiBpcyB0aGUgc2VjcmV0IHZhbHVlIHRoYXQgaXMgc2V0IG9uIHRoZSBzZXNzaW9uPC9saT5cXG48bGk+PHN0cm9uZz5sb2dpblVybFBhdHRlcm48L3N0cm9uZz4gaXMgYSBVUkwgcGF0dGVybiB3aGVyZSB3ZSB3aWxsIHN1YnN0aXR1dGUgJnF1b3Q7W09SSUdJTkFMVVJMXSZxdW90OyBmb3IgdGhlIG9yaWdpbmFsbHkgcmVxdWVzdGVkIFVSTC48L2xpPlxcbjxsaT48c3Ryb25nPm1pZGRsZXdhcmU8L3N0cm9uZz4gaXMgdGhlIGF1dGhlbnRpY2F0aW9uIG1pZGRsZXdhcmUgdG8gdXNlLCBkZWZhdWx0IGlzICZxdW90Oy4uL3N5c3RlbS9hdXRoX21pZGRsZSZxdW90OzwvbGk+XFxuPC91bD5cXG48cD5Ob3csIGlmIHlvdSB3YW50IGEgcGFydGljdWxhciBhY3Rpb24gdG8gYmUgYXV0aGVudGljYXRlZCwgeW91IGNhbiBvdmVycmlkZSB0aGUgZGVmYXVsdCAoYWxsKSB2YWx1ZSBpbiBlYWNoIG9mIHlvdXIgYWN0aW9ucywgZm9yIGV4YW1wbGUgdG8gbmVlZCBhdXRoZW50aWNhdGlvbiBvbiB0aGUgPGNvZGU+aW5kZXg8L2NvZGU+IGFjdGlvbiBvZiB5b3VyIHRvZG9zIGFwcCwgc2V0OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICAuLi4sXFxuICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgJnF1b3Q7YWxsJnF1b3Q7IGF0dHJpYnV0ZSBmb3JtIHRoZSBzZXJ2ZXIgY29uZmlnIGF1dGhlbnRpY2F0aW9uIGFuZCBtYWtlIGF1dGhlbnRpY2F0aW9uIHJlcXVpcmVkIG9uIHRoaXMgYWN0aW9uLlxcbklmIHlvdXIgYXBwIGlzIG1haW5seSBhIHNlY3VyZSBhcHAsIHlvdSYjMzk7bGwgd2FudCB0byBzZXQgJnF1b3Q7YWxsJnF1b3Q7IGF0dHJpYnV0ZSB0byB0cnVlIGFuZCBvdmVycmlkZSB0aGUgJnF1b3Q7bG9naW4mcXVvdDsgYW5kLCAoaWYgeW91IGhhdmUgb25lKSwgdGhlICZxdW90O2ZvcmdvdCBwYXNzd29yZCZxdW90OyBwYWdlcywgYW5kIHNvIGFzIHRvIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uLCBpZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgLi4uLFxcbiAgICBhdXRoZW50aWNhdGU6IGZhbHNlXFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPGgzPjxhIG5hbWU9XFxcInNhbXBsZS1pbXBsZW1lbnRhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3NhbXBsZS1pbXBsZW1lbnRhdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5TYW1wbGUgaW1wbGVtZW50YXRpb248L3NwYW4+PC9hPjwvaDM+PHA+SW4gTWlzbywgd2UgaGF2ZSBhIHNhbXBsZSBpbXBsZW1lbnRhdGlvbiBvZiBhdXRoZW50aWNhdGlvbiB0aGF0IHVzZXMgdGhlIGZsYXRmaWxlZGIgYXBpLiBUaGVyZSBhcmUgNCBtYWluIGNvbXBvbmVudHMgaW4gdGhlIHNhbXBsZSBhdXRoZW50aWNhdGlvbiBwcm9jZXNzOjwvcD5cXG48dWw+XFxuPGxpPjxwPlRoZSBhdXRoZW50aWNhdGUgYXBpIDxjb2RlPi9zeXN0ZW0vYXBpL2F1dGhlbnRpY2F0ZTwvY29kZT4gLSBoYW5kbGVzIHNhdmluZyBhbmQgbG9hZGluZyBvZiB1c2VycywgcGx1cyBjaGVja2luZyBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlcy48L3A+XFxuPC9saT5cXG48bGk+PHA+VGhlIGxvZ2luIG1lY2hhbmlzbSA8Y29kZT4vbXZjL2xvZ2luLmpzPC9jb2RlPiAtIHNpbXBseSBhbGxvd3MgeW91IHRvIGVudGVyIGEgdXNlcm5hbWUgYW5kIHBhc3N3b3JkIGFuZCB1c2VzIHRoZSBhdXRoZW50aWNhdGlvbiBhcGkgdG8gbG9nIHlvdSBpbjwvcD5cXG48L2xpPlxcbjxsaT48cD5Vc2VyIG1hbmFnZW1lbnQgPGNvZGU+L212Yy91c2Vycy5qczwvY29kZT4gLSBVc2VzIHRoZSBhdXRoZW50aWNhdGlvbiBhcGkgdG8gYWRkIGEgdXNlciB3aXRoIGFuIGVuY3J5cHRlZCBwYXNzd29yZDwvcD5cXG48L2xpPlxcbjxsaT48cD5BdXRoZW50aWNhdGlvbiBtaWRkbGV3YXJlIDxjb2RlPi9zeXN0ZW0vYXV0aF9taWRkbGUuanM8L2NvZGU+IC0gYXBwbGllcyBhdXRoZW50aWNhdGlvbiBvbiB0aGUgc2VydmVyIGZvciBhY3Rpb25zIC0gdGhpcyBpcyBhIGNvcmUgZmVhdHVyZSBvZiBob3cgbWlzbyBkb2VzIHRoZSBhdXRoZW50aWNhdGlvbiAtIGl0IHNpbXBseSBjaGVja3MgaWYgdGhlIHNlY3JldCBpcyBzZXQgb24gdGhlIHNlc3Npb24sIGFuZCByZWRpcmVjdHMgdG8gdGhlIGNvbmZpZ3VyZWQgJnF1b3Q7bG9naW5VcmxQYXR0ZXJuJnF1b3Q7IFVSTCBpZiBpdCBkb2VzbiYjMzk7dCBtYXRjaCB0aGUgc2VjcmV0LjwvcD5cXG48L2xpPlxcbjwvdWw+XFxuPHA+SWRlYWxseSB5b3Ugd2lsbCBub3QgbmVlZCB0byBjaGFuZ2UgdGhlIGF1dGhlbnRpY2F0aW9uIG1pZGRsZXdhcmUsIGFzIHRoZSBpbXBsZW1lbnRhdGlvbiBzaW1wbHkgcmVxdWlyZXMgeW91IHRvIHNldCB0aGUgJnF1b3Q7YXV0aGVudGljYXRpb25TZWNyZXQmcXVvdDsgb24gdGhlIHJlcXVlc3Qgb2JqZWN0IHNlc3Npb24gLSB5b3UgY2FuIHNlZSBob3cgdGhpcyB3b3JrcyBpbiA8Y29kZT4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGUvYXV0aGVudGljYXRlLmFwaS5qczwvY29kZT4uPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJob3ctdGhlLXNhbXBsZS1pbXBsZW1lbnRhdGlvbi13b3Jrc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2hvdy10aGUtc2FtcGxlLWltcGxlbWVudGF0aW9uLXdvcmtzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkhvdyB0aGUgc2FtcGxlIGltcGxlbWVudGF0aW9uIHdvcmtzPC9zcGFuPjwvYT48L2gzPjx1bD5cXG48bGk+V2hlbiBhdXRoZW50aWNhdGlvbiBpcyByZXF1aXJlZCBmb3IgYWNjZXNzIHRvIGFuIGFjdGlvbiwgYW5kIHlvdSBoYXZlbiYjMzk7dCBhdXRoZW50aWNhdGVkLCB5b3UgYXJlIHJlZGlyZWN0ZWQgdG8gdGhlIDxjb2RlPi9sb2dpbjwvY29kZT4gYWN0aW9uPC9saT5cXG48bGk+QXQgPGNvZGU+L2xvZ2luPC9jb2RlPiB5b3UgY2FuIGF1dGhlbnRpY2F0ZSB3aXRoIGEgdXNlcm5hbWUgYW5kIHBhc3N3b3JkICh3aGljaCBjYW4gYmUgY3JlYXRlZCBhdCA8Y29kZT4vdXNlcnM8L2NvZGU+KTwvbGk+XFxuPGxpPldoZW4gYXV0aGVudGljYXRlZCwgYSBzZWNyZXQga2V5IGlzIHNldCBvbiB0aGUgc2Vzc2lvbiwgdGhpcyBpcyB1c2VkIHRvIGNoZWNrIGlmIGEgdXNlciBpcyBsb2dnZWQgaW4gZXZlcnkgdGltZSB0aGV5IGFjY2VzcyBhbiBhY3Rpb24gdGhhdCByZXF1aXJlcyBhdXRoZW50aWNhdGlvbi48L2xpPlxcbjwvdWw+XFxuPHA+Tm90ZTogdGhlIGF1dGhlbnRpY2F0aW9uIHNlY3JldCBpcyBvbmx5IGV2ZXIga2VwdCBvbiB0aGUgc2VydmVyLCBzbyB0aGUgY2xpZW50IGNvZGUgc2ltcGx5IGhhcyBhIGJvb2xlYW4gdG8gc2F5IGlmIGl0IGlzIGxvZ2dlZCBpbiAtIHRoaXMgbWVhbnMgaXQgd2lsbCB0cnkgdG8gYWNjZXNzIGF1dGhlbnRpY2F0ZWQgdXJscyBpZiA8Y29kZT5taXNvR2xvYmFsLmlzTG9nZ2VkSW48L2NvZGU+IGlzIHNldCB0byAmcXVvdDt0cnVlJnF1b3Q7LiBPZiBjb3Vyc2UgdGhlIHNlcnZlciB3aWxsIGRlbnkgYWNjZXNzIHRvIGFueSBkYXRhIGFwaSBlbmQgcG9pbnRzLCBzbyB5b3VyIGRhdGEgaXMgc2FmZS48L3A+XFxuPGgyPjxhIG5hbWU9XFxcInNlc3Npb25zXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjc2Vzc2lvbnNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+U2Vzc2lvbnM8L3NwYW4+PC9hPjwvaDI+PHA+V2hlbiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLCB0aGV5IGFyZSBwcm92aWRlZCB3aXRoIGEgc2Vzc2lvbiAtIHRoaXMgY2FuIGJlIHVzZWQgdG8gc3RvcmUgdGVtcG9yYXJ5IGRhdGEgYW5kIGlzIGFjY2Vzc2libGUgdmlhIDxjb2RlPi9zeXN0ZW0vYXBpL3Nlc3Npb24vYXBpLnNlcnZlci5qczwvY29kZT4uIFlvdSBjYW4gdXNlIGl0IGxpa2Ugc28gaW4geW91ciA8Y29kZT5tdmM8L2NvZGU+IGZpbGVzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBzZXNzaW9uID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvc2Vzc2lvbi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnNlc3Npb24uZ2V0KHtrZXk6ICYjMzk7dXNlck5hbWUmIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuICAgIGNvbnNvbGUubG9nKGRhdGEucmVzdWx0KTtcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlc2UgYXJlIHRoZSBtZXRob2RzIGF2YWlsYWJsZSBvbiB0aGUgc2Vzc2lvbiBhcGk6PC9wPlxcbjx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5NZXRob2Q8L3RoPlxcbjx0aD5QdXJwb3NlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+Z2V0KHtrZXk6IGtleX0pPC90ZD5cXG48dGQ+UmV0cmlldmVzIGEgdmFsdWUgZnJvbSB0aGUgc2Vzc2lvbiBmb3IgdGhlIGdpdmVuIGtleTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPnNldCh7a2V5OiBrZXksIHZhbHVlOiB2YWx1ZX0pPC90ZD5cXG48dGQ+U2V0cyBhIHZhbHVlIGluIHRoZSBzZXNzaW9uIGZvciB0aGUgZ2l2ZW4ga2V5PC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5Ob3RlOiBFYWNoIHVzZXIgb2YgeW91ciBhcHAgaGFzIGEgc2Vzc2lvbiB0aGF0IGlzIHN0b3JlZCBvbiB0aGUgc2VydmVyLCBzbyBlYWNoIHRpbWUgeW91IGFjY2VzcyBpdCwgaXQgd2lsbCBtYWtlIGEgWEhSIHJlcXVlc3QuIFVzZSBpdCBzcGFyaW5nbHkhPC9wPlxcblwiLFwiQ29udHJpYnV0aW5nLm1kXCI6XCI8cD5JbiBvcmRlciB0byBjb250cmlidXRlIHRvIG1pc29qcywgcGxlYXNlIGtlZXAgdGhlIGZvbGxvd2luZyBpbiBtaW5kOjwvcD5cXG48aDI+PGEgbmFtZT1cXFwid2hlbi1hZGRpbmctYS1wdWxsLXJlcXVlc3RcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN3aGVuLWFkZGluZy1hLXB1bGwtcmVxdWVzdFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5XaGVuIGFkZGluZyBhIHB1bGwgcmVxdWVzdDwvc3Bhbj48L2E+PC9oMj48dWw+XFxuPGxpPkJlIHN1cmUgdG8gb25seSBtYWtlIHNtYWxsIGNoYW5nZXMsIGFueXRoaW5nIG1vcmUgdGhhbiA0IGZpbGVzIHdpbGwgbmVlZCB0byBiZSByZXZpZXdlZDwvbGk+XFxuPGxpPk1ha2Ugc3VyZSB5b3UgZXhwbGFpbiA8ZW0+d2h5PC9lbT4geW91JiMzOTtyZSBtYWtpbmcgdGhlIGNoYW5nZSwgc28gd2UgdW5kZXJzdGFuZCB3aGF0IHRoZSBjaGFuZ2UgaXMgZm9yPC9saT5cXG48bGk+QWRkIGEgdW5pdCB0ZXN0IGlmIGFwcHJvcHJpYXRlPC9saT5cXG48bGk+RG8gbm90IGJlIG9mZmVuZGVkIGlmIHdlIGFzayB5b3UgdG8gYWRkIGEgdW5pdCB0ZXN0IGJlZm9yZSBhY2NlcHRpbmcgYSBwdWxsIHJlcXVlc3Q8L2xpPlxcbjxsaT5Vc2UgdGFicyBub3Qgc3BhY2VzICh3ZSBhcmUgbm90IGZsZXhpYmxlIG9uIHRoaXMgLSBpdCBpcyBhIG1vb3QgZGlzY3Vzc2lvbiAtIEkgcmVhbGx5IGRvbiYjMzk7dCBjYXJlLCB3ZSBqdXN0IG5lZWRlZCB0byBwaWNrIG9uZSwgYW5kIHRhYnMgaXQgaXMpPC9saT5cXG48L3VsPlxcblwiLFwiQ3JlYXRpbmctYS10b2RvLWFwcC1wYXJ0LTItcGVyc2lzdGVuY2UubWRcIjpcIjxwPkluIHRoaXMgYXJ0aWNsZSB3ZSB3aWxsIGFkZCBkYXRhIHBlcnNpc3RlbmNlIGZ1bmN0aW9uYWxpdHkgdG8gb3VyIHRvZG8gYXBwIGZyb20gdGhlIDxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC5tZFxcXCI+Q3JlYXRpbmcgYSB0b2RvIGFwcDwvYT4gYXJ0aWNsZS4gV2UgcmVjb21tZW5kIHlvdSBmaXJzdCByZWFkIHRoYXQgYXMgd2UgYXJlIGdvaW5nIHRvIHVzZSB0aGUgYXBwIHlvdSBtYWRlIGluIHRoaXMgYXJ0aWNsZSwgc28gaWYgeW91IGRvbiYjMzk7dCBhbHJlYWR5IGhhdmUgb25lLCBncmFiIGEgY29weSBvZiBpdCA8YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAjY29tcGxldGVkLXRvZG8tYXBwLm1kXFxcIj5mcm9tIGhlcmU8L2E+LCBhbmQgc2F2ZSBpdCBpbiA8Y29kZT4vbXZjL3RvZG8uanM8L2NvZGU+LjwvcD5cXG48cD5GaXJzdCBhZGQgdGhlIDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IGFwaSB0byB0aGUgPGNvZGU+Y2ZnL3NlcnZlci5kZXZlbG9wbWVudC5qc29uPC9jb2RlPiBmaWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPiZxdW90O2FwaSZxdW90OzogJnF1b3Q7ZmxhdGZpbGVkYiZxdW90O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIG1ha2VzIG1pc28gbG9hZCB0aGUgYXBpIGFuZCBleHBvc2UgaXQgYXQgdGhlIGNvbmZpZ3VyZWQgQVBJIHVybCwgZGVmYXVsdCBpcyAmcXVvdDsvYXBpJnF1b3Q7ICsgYXBpIG5hbWUsIHNvIGZvciB0aGUgZmxhdGZpbGVkYiBpdCB3aWxsIGJlIDxjb2RlPi9hcGkvZmxhdGZpbGVkYjwvY29kZT4uIFRoaXMgaXMgYWxsIGFic3RyYWN0ZWQgYXdheSwgc28geW91IGRvIG5vdCBuZWVkIHRvIHdvcnJ5IGFib3V0IHdoYXQgdGhlIFVSTCBpcyB3aGVuIHVzaW5nIHRoZSBhcGkgLSB5b3Ugc2ltcGx5IGNhbGwgdGhlIG1ldGhvZCB5b3Ugd2FudCwgYW5kIHRoZSBtaXNvIGFwaSB0YWtlcyBjYXJlIG9mIHRoZSByZXN0LjwvcD5cXG48cD5Ob3cgcmVxdWlyZSB0aGUgZGIgYXBpIGF0IHRoZSB0aGUgdG9wIG9mIHRoZSB0b2RvLmpzIGZpbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIgPSByZXF1aXJlKCYjMzk7Li4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5leHQgYWRkIHRoZSBmb2xsb3dpbmcgaW4gdGhlIDxjb2RlPmN0cmwuYWRkVG9kbzwvY29kZT4gZnVuY3Rpb24gdW5kZXJuZWF0aCB0aGUgbGluZSB0aGF0IHJlYWRzIDxjb2RlPmN0cmwudm0uaW5wdXQoJnF1b3Q7JnF1b3Q7KTs8L2NvZGU+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiLnNhdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBtb2RlbDogbmV3VG9kbyB9ICkudGhlbihmdW5jdGlvbihyZXMpe1xcbiAgICBuZXdUb2RvLl9pZCA9IHJlcy5yZXN1bHQ7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBzYXZlIHRoZSB0b2RvIHRvIHRoZSBkYXRhYmFzZSB3aGVuIHlvdSBjbGljayB0aGUgJnF1b3Q7QWRkJnF1b3Q7IGJ1dHRvbi48L3A+XFxuPHA+TGV0IHVzIHRha2UgYSBxdWljayBsb29rIGF0IGhvdyB0aGUgYXBpIHdvcmtzIC0gdGhlIHdheSB0aGF0IHlvdSBtYWtlIHJlcXVlc3RzIHRvIHRoZSBhcGkgZGVwZW5kcyBlbnRpcmVseSBvbiB3aGljaCBhcGkgeW91IGFyZSB1c2luZywgZm9yIGV4YW1wbGUgZm9yIHRoZSBmbGF0ZmlsZWRiLCB3ZSBoYXZlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+TWV0aG9kPC90aD5cXG48dGg+QWN0aW9uPC90aD5cXG48dGg+UGFyYW1ldGVyczwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPnNhdmU8L3RkPlxcbjx0ZD5TYXZlIG9yIHVwZGF0ZXMgYSBtb2RlbDwvdGQ+XFxuPHRkPnsgdHlwZTogVFlQRSwgbW9kZWw6IE1PREVMIH08L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5maW5kPC90ZD5cXG48dGQ+RmluZHMgb25lIG9yIG1vcmUgbW9kZWxzIG9mIHRoZSBnaXZlIHR5cGU8L3RkPlxcbjx0ZD57IHR5cGU6IFRZUEUsIHF1ZXJ5OiBRVUVSWSB9PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+cmVtb3ZlPC90ZD5cXG48dGQ+UmVtb3ZlcyBhbiBpbnN0YW5jZSBvZiBhIG1vZGVsPC90ZD5cXG48dGQ+eyB0eXBlOiBUWVBFLCBpZDogSUQgfTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+V2hlcmUgdGhlIGF0dHJpYnV0ZXMgYXJlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+QXR0cmlidXRlPC90aD5cXG48dGg+VXNlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+VFlQRTwvdGQ+XFxuPHRkPlRoZSBuYW1lc3BhY2Ugb2YgdGhlIG1vZGVsLCBzYXkgeW91IGhhdmUgdG9kby5qcywgYW5kIHRoZSBtb2RlbCBpcyBvbiA8Y29kZT5tb2R1bGUuZXhwb3J0cy5pbmRleC5tb2R1bGVzLnRvZG88L2NvZGU+LCB0aGUgdHlwZSB3b3VsZCBiZSAmcXVvdDt0b2RvLmluZGV4LnRvZG8mcXVvdDs8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5NT0RFTDwvdGQ+XFxuPHRkPlRoaXMgaXMgYW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kZWwgLSBlZzogYSBzdGFuZGFyZCBtaXRocmlsIG1vZGVsPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UVVFUlk8L3RkPlxcbjx0ZD5BbiBvYmplY3Qgd2l0aCBhdHRyaWJ1dGVzIHRvIGZpbHRlciB0aGUgcXVlcnkgcmVzdWx0czwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPklEPC90ZD5cXG48dGQ+QSB1bmlxdWUgSUQgZm9yIGEgcmVjb3JkPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5FdmVyeSBtZXRob2QgcmV0dXJucyBhIDxhIGhyZWY9XFxcIi9kb2MvbWl0aHJpbC5kZWZlcnJlZC5odG1sI2RpZmZlcmVuY2VzLWZyb20tcHJvbWlzZXMtYS0ubWRcXFwiPm1pdGhyaWwgc3R5bGUgcHJvbWlzZTwvYT4sIHdoaWNoIG1lYW5zIHlvdSBtdXN0IGF0dGFjaCBhIDxjb2RlPi50aGVuPC9jb2RlPiBjYWxsYmFjayBmdW5jdGlvbi5cXG5CZSBzdXJlIHRvIGNoZWNrIHRoZSBtZXRob2RzIGZvciBlYWNoIGFwaSwgYXMgZWFjaCB3aWxsIHZhcnksIGRlcGVuZGluZyBvbiB0aGUgZnVuY3Rpb25hbGl0eS48L3A+XFxuPHA+Tm93LCBsZXQgdXMgYWRkIHRoZSBjYXBhYmlsaXR5IHRvIGxvYWQgb3VyIHRvZG9zLCBhZGQgdGhlIGZvbGxvd2luZyB0byB0aGUgc3RhcnQgb2YgdGhlIGNvbnRyb2xsZXIsIGp1c3QgYWZ0ZXIgdGhlIDxjb2RlPnZhciBjdHJsID0gdGhpczwvY29kZT46PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIuZmluZCh7dHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xcbiAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKGRhdGEucmVzdWx0W2tleV0pO1xcbiAgICB9KTtcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGxvYWQgeW91ciB0b2RvcyB3aGVuIHRoZSBhcHAgbG9hZHMgdXAuIEJlIHN1cmUgdG8gcmVtb3ZlIHRoZSBvbGQgc3RhdGljIGxpc3QsIGllOiByZW1vdmUgdGhlc2UgbGluZXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcblxcbmN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKG15VG9kb3Nba2V5XSk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5vdyB5b3UgY2FuIHRyeSBhZGRpbmcgYSB0b2RvLCBhbmQgaXQgd2lsbCBzYXZlIGFuZCBsb2FkITwvcD5cXG48cD5OZXh0IGxldCB1cyBhZGQgdGhlIGFiaWxpdHkgdG8gcmVtb3ZlIHlvdXIgY29tcGxldGVkIHRvZG9zIGluIHRoZSBhcmNoaXZlIG1ldGhvZCAtIGV4dGVuZCB0aGUgPGNvZGU+aWY8L2NvZGU+IHN0YXRlbWVudCBieSBhZGRpbmcgYW4gPGNvZGU+ZWxzZTwvY29kZT4gbGlrZSBzbzogPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+fSBlbHNlIHtcXG4gICAgYXBpLnJlbW92ZSh7IHR5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTssIF9pZDogdG9kby5faWQgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XFxuICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5yZXN1bHQpO1xcbiAgICB9KTtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCByZW1vdmUgdGhlIHRvZG8gZnJvbSB0aGUgZGF0YSBzdG9yZS48L3A+XFxuPHA+WW91IG5vdyBoYXZlIGEgY29tcGxldGUgdG9kbyBhcHAsIHlvdXIgYXBwIHNob3VsZCBsb29rIGxpa2UgdGhpczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGRiID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IG0ucHJvcChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzO1xcblxcbiAgICAgICAgZGIuZmluZCh7dHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xcbiAgICAgICAgICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhkYXRhLnJlc3VsdFtrZXldKTtcXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xcbiAgICAgICAgICAgIGlmKHZhbHVlKSB7XFxuICAgICAgICAgICAgICAgIHZhciBuZXdUb2RvID0gbmV3IHNlbGYubW9kZWxzLnRvZG8oe1xcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogY3RybC52bS5pbnB1dCgpLFxcbiAgICAgICAgICAgICAgICAgICAgZG9uZTogZmFsc2VcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7XFxuICAgICAgICAgICAgICAgIGRiLnNhdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBtb2RlbDogbmV3VG9kbyB9ICkudGhlbihmdW5jdGlvbihyZXMpe1xcbiAgICAgICAgICAgICAgICAgICAgbmV3VG9kby5faWQgPSByZXMucmVzdWx0O1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLmFyY2hpdmUgPSBmdW5jdGlvbigpe1xcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW107XFxuICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICAgICAgICAgIGlmKCF0b2RvLmRvbmUoKSkge1xcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHRvZG8pOyBcXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgIGRiLnJlbW92ZSh7IHR5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTssIF9pZDogdG9kby5faWQgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzdWx0KTtcXG4gICAgICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgY3RybC5saXN0ID0gbGlzdDtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLnZtID0ge1xcbiAgICAgICAgICAgIGxlZnQ6IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICAgICAgY291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudDtcXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XFxuICAgICAgICAgICAgICAgICAgICB0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgaW5wdXQ6IG0ucHJvcCgmcXVvdDsmcXVvdDspXFxuICAgICAgICB9O1xcblxcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgU1RZTEUoJnF1b3Q7LmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fSZxdW90OyksXFxuICAgICAgICAgICAgICAgIEgxKCZxdW90O1RvZG9zIC0gJnF1b3Q7ICsgY3RybC52bS5sZWZ0KCkgKyAmcXVvdDsgb2YgJnF1b3Q7ICsgY3RybC5saXN0Lmxlbmd0aCArICZxdW90OyByZW1haW5pbmcmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBCVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgJnF1b3Q7QXJjaGl2ZSZxdW90OyksXFxuICAgICAgICAgICAgICAgIFVMKFtcXG4gICAgICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyAmcXVvdDtkb25lJnF1b3Q7OiAmcXVvdDsmcXVvdDssIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xcbiAgICAgICAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICAgICAgXSksXFxuICAgICAgICAgICAgICAgIEZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcXG4gICAgICAgICAgICAgICAgICAgIElOUFVUKHsgdHlwZTogJnF1b3Q7dGV4dCZxdW90OywgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiAmcXVvdDtBZGQgdG9kbyZxdW90O30pLFxcbiAgICAgICAgICAgICAgICAgICAgQlVUVE9OKHsgdHlwZTogJnF1b3Q7c3VibWl0JnF1b3Q7fSwgJnF1b3Q7QWRkJnF1b3Q7KVxcbiAgICAgICAgICAgICAgICBdKVxcbiAgICAgICAgICAgIF1cXG4gICAgICAgIH07XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG5cIixcIkNyZWF0aW5nLWEtdG9kby1hcHAubWRcIjpcIjxwPkluIHRoaXMgYXJ0aWNsZSB3ZSB3aWxsIGNyZWF0ZSBhIGZ1bmN0aW9uYWwgdG9kbyBhcHAgLSB3ZSByZWNvbW1lbmQgeW91IGZpcnN0IHJlYWQgdGhlIDxhIGhyZWY9XFxcIi9kb2MvR2V0dGluZy1zdGFydGVkLm1kXFxcIj5HZXR0aW5nIHN0YXJ0ZWQ8L2E+IGFydGljbGUsIGFuZCB1bmRlcnN0YW5kIHRoZSBtaXNvIGZ1bmRhbWVudGFscyBzdWNoIGFzIHdoZXJlIHRvIHBsYWNlIG1vZGVscyBhbmQgaG93IHRvIGNyZWF0ZSBhIG1pc28gY29udHJvbGxlci48L3A+XFxuPGgyPjxhIG5hbWU9XFxcInRvZG8tYXBwXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjdG9kby1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+VG9kbyBhcHA8L3NwYW4+PC9hPjwvaDI+PHA+V2Ugd2lsbCBub3cgY3JlYXRlIGEgbmV3IGFwcCB1c2luZyB0aGUgPGEgaHJlZj1cXFwiL2RvYy9QYXR0ZXJucyNzaW5nbGUtdXJsLW12Yy5tZFxcXCI+c2luZ2xlIHVybCBwYXR0ZXJuPC9hPiwgd2hpY2ggbWVhbnMgaXQgaGFuZGxlcyBhbGwgYWN0aW9ucyBhdXRvbm9tb3VzbHksIHBsdXMgbG9va3MgYSBsb3QgbGlrZSBhIG5vcm1hbCBtaXRocmlsIGFwcC48L3A+XFxuPHA+SW4gPGNvZGU+L212YzwvY29kZT4gc2F2ZSBhIG5ldyBmaWxlIGFzIDxjb2RlPnRvZG8uanM8L2NvZGU+IHdpdGggdGhlIGZvbGxvd2luZyBjb250ZW50OiA8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge30sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzO1xcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHJldHVybiAmcXVvdDtUT0RPJnF1b3Q7O1xcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+Tm93IG9wZW46IDxhIGhyZWY9XFxcIi9kb2MvdG9kb3MubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3Q6NjQ3Ni90b2RvczwvYT4gYW5kIHlvdSYjMzk7bGwgc2VlIHRoZSB3b3JkICZxdW90O1RPRE8mcXVvdDsuIFlvdSYjMzk7bGwgbm90aWNlIHRoYXQgdGhlIHVybCBpcyAmcXVvdDsvdG9kb3MmcXVvdDsgd2l0aCBhbiAmIzM5O3MmIzM5OyBvbiB0aGUgZW5kIC0gYXMgd2UgYXJlIHVzaW5nIDxhIGhyZWY9XFxcIi9kb2MvSG93LW1pc28td29ya3Mjcm91dGUtYnktY29udmVudGlvbi5tZFxcXCI+cm91dGUgYnkgY29udmVudGlvbjwvYT4gdG8gbWFwIG91ciByb3V0ZS48L3A+XFxuPHA+TmV4dCBsZXQmIzM5O3MgY3JlYXRlIHRoZSBtb2RlbCBmb3Igb3VyIHRvZG9zIC0gY2hhbmdlIHRoZSA8Y29kZT5tb2RlbHM8L2NvZGU+IGF0dHJpYnV0ZSB0byB0aGUgZm9sbG93aW5nOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZGVsczoge1xcbiAgICB0b2RvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgIHRoaXMuZG9uZSA9IG0ucChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgdGhpcy5faWQgPSBkYXRhLl9pZDtcXG4gICAgfVxcbn0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkVhY2ggbGluZSBpbiB0aGUgbW9kZWwgZG9lcyB0aGUgZm9sbG93aW5nOjwvcD5cXG48dWw+XFxuPGxpPjxjb2RlPnRoaXMudGV4dDwvY29kZT4gLSBUaGUgdGV4dCB0aGF0IGlzIHNob3duIG9uIHRoZSB0b2RvPC9saT5cXG48bGk+PGNvZGU+dGhpcy5kb25lPC9jb2RlPiAtIFRoaXMgcmVwcmVzZW50cyBpZiB0aGUgdG9kbyBoYXMgYmVlbiBjb21wbGV0ZWQgLSB3ZSBlbnN1cmUgdGhhdCB3ZSBoYW5kbGUgdGhlICZxdW90O2ZhbHNlJnF1b3Q7IHZhbHVlcyBjb3JyZWN0bHksIGFzIGFqYXggcmVzcG9uc2VzIGFyZSBhbHdheXMgc3RyaW5ncy48L2xpPlxcbjxsaT48Y29kZT50aGlzLl9pZDwvY29kZT4gLSBUaGUga2V5IGZvciB0aGUgdG9kbzwvbGk+XFxuPC91bD5cXG48cD5UaGUgbW9kZWwgY2FuIG5vdyBiZSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyZWl2ZSB0b2RvcyAtIG1pc28gYXV0b21hdGljYWxseSBwaWNrcyB1cCBhbnkgb2JqZWN0cyBvbiB0aGUgPGNvZGU+bW9kZWxzPC9jb2RlPiBhdHRyaWJ1dGUgb2YgeW91ciBtdmMgZmlsZSwgYW5kIG1hcHMgaXQgaW4gdGhlIEFQSS4gV2Ugd2lsbCBzb29uIHNlZSBob3cgdGhhdCB3b3Jrcy4gTmV4dCBhZGQgdGhlIGZvbGxvd2luZyBjb2RlIGFzIHRoZSBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICBteVRvZG9zID0gW3t0ZXh0OiAmcXVvdDtMZWFybiBtaXNvJnF1b3Q7fSwge3RleHQ6ICZxdW90O0J1aWxkIG1pc28gYXBwJnF1b3Q7fV07XFxuICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbiAgICB9KTtcXG4gICAgcmV0dXJuIGN0cmw7XFxufSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBkb2VzIHRoZSBmb2xsb3dpbmc6PC9wPlxcbjx1bD5cXG48bGk+Q3JlYXRlcyA8Y29kZT5teVRvZG9zPC9jb2RlPiB3aGljaCBpcyBhIGxpc3Qgb2Ygb2JqZWN0cyB0aGF0IHJlcHJlc2VudHMgdG9kb3M8L2xpPlxcbjxsaT48Y29kZT50aGlzLmxpc3Q8L2NvZGU+IC0gY3JlYXRlcyBhIGxpc3Qgb2YgdG9kbyBtb2RlbCBvYmplY3RzIGJ5IHVzaW5nIDxjb2RlPm5ldyBzZWxmLm1vZGVscy50b2RvKC4uLjwvY29kZT4gb24gZWFjaCBteVRvZG9zIG9iamVjdC48L2xpPlxcbjxsaT48Y29kZT5yZXR1cm4gdGhpczwvY29kZT4gbXVzdCBiZSBkb25lIGluIGFsbCBjb250cm9sbGVycywgaXQgbWFrZXMgc3VyZSB0aGF0IG1pc28gY2FuIGNvcnJlY3RseSBnZXQgYWNjZXNzIHRvIHRoZSBjb250cm9sbGVyIG9iamVjdC48L2xpPlxcbjwvdWw+XFxuPHA+Tm90ZTogd2UgYWx3YXlzIGNyZWF0ZSBhIGxvY2FsIHZhcmlhYmxlIDxjb2RlPmN0cmw8L2NvZGU+IHRoYXQgcG9pbnRzIHRvIHRoZSBjb250cm9sbGVyLCBhcyBpdCBjYW4gYmUgdXNlZCB0byBhY2Nlc3MgdmFyaWFibGVzIGluIHRoZSBjb250cm9sbGVyIGZyb20gbmVzdGVkIGZ1bmN0aW9ucy4gWW91IHdpbGwgc2VlIHRoaXMgdXNhZ2UgbGF0ZXIgb24gaW4gdGhpcyBhcnRpY2xlLjwvcD5cXG48cD5Ob3cgdXBkYXRlIHRoZSB2aWV3IGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICByZXR1cm4gbSgmcXVvdDtVTCZxdW90OywgW1xcbiAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICByZXR1cm4gbSgmcXVvdDtMSSZxdW90OywgdG9kby50ZXh0KVxcbiAgICAgICAgfSlcXG4gICAgXSk7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgaXRlcmF0ZSBvbiB5b3VyIG5ld2x5IGNyZWF0ZWQgbGlzdCBvZiB0b2RvIG1vZGVsIG9iamVjdHMgYW5kIGRpc3BsYXkgdGhlIG9uIHNjcmVlbi4gWW91ciB0b2RvIGFwcCBzaG91bGQgbm93IGxvb2sgbGlrZSB0aGlzOjwvcD5cXG48aDM+PGEgbmFtZT1cXFwiaGFsZi13YXktcG9pbnRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNoYWxmLXdheS1wb2ludFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5IYWxmLXdheSBwb2ludDwvc3Bhbj48L2E+PC9oMz48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5Oyk7XFxuXFxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICB0b2RvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XFxuICAgICAgICAgICAgdGhpcy5kb25lID0gbS5wKGRhdGEuZG9uZSA9PSAmcXVvdDtmYWxzZSZxdW90Oz8gZmFsc2U6IGRhdGEuZG9uZSk7XFxuICAgICAgICAgICAgdGhpcy5faWQgPSBkYXRhLl9pZDtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgY3RybCA9IHRoaXMsXFxuICAgICAgICAgICAgbXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcbiAgICAgICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMobXlUb2RvcykubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbiAgICAgICAgfSk7XFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgcmV0dXJuIG0oJnF1b3Q7VUwmcXVvdDssIFtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgmcXVvdDtMSSZxdW90OywgdG9kby50ZXh0KVxcbiAgICAgICAgICAgIH0pXFxuICAgICAgICBdKTtcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxibG9ja3F1b3RlPlxcblNvIGZhciB3ZSBoYXZlIG9ubHkgdXNlZCBwdXJlIG1pdGhyaWwgdG8gY3JlYXRlIG91ciBhcHAgLSBtaXNvIGRpZCBkbyBzb21lIG9mIHRoZSBncnVudC13b3JrIGJlaGluZCB0aGUgc2NlbmVzLCBidXQgd2UgY2FuIGRvIG11Y2ggbW9yZS5cXG48L2Jsb2NrcXVvdGU+XFxuXFxuXFxuPHA+TGV0IHVzIGFkZCBzb21lIHVzZWZ1bCBsaWJyYXJpZXMsIGNoYW5nZSB0aGUgdG9wIHNlY3Rpb24gdG86PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBiaW5kaW5ncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5iaW5kaW5ncy5ub2RlLmpzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgaW5jbHVkZSB0aGUgZm9sbG93aW5nIGxpYnJhcmllczo8L3A+XFxuPHVsPlxcbjxsaT48YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuc3VnYXJ0YWdzLm1kXFxcIj5taXRocmlsLnN1Z2FydGFnczwvYT4gLSBhbGxvd3MgcmVuZGVyaW5nIEhUTUwgdXNpbmcgdGFncyB0aGF0IGxvb2sgYSBsaXR0bGUgbW9yZSBsaWtlIEhUTUwgdGhhbiBzdGFuZGFyZCBtaXRocmlsPC9saT5cXG48bGk+PGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLmJpbmRpbmdzLm1kXFxcIj5taXRocmlsLmJpbmRpbmdzPC9hPiBCaS1kaXJlY3Rpb25hbCBkYXRhIGJpbmRpbmdzIGZvciByaWNoZXIgbW9kZWxzPC9saT5cXG48L3VsPlxcbjxwPkxldCB1cyBzdGFydCB3aXRoIHRoZSBzdWdhciB0YWdzLCB1cGRhdGUgdGhlIHZpZXcgdG8gcmVhZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICByZXR1cm4gVUwoW1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgIHJldHVybiBMSSh0b2RvLnRleHQpXFxuICAgICAgICAgICAgfSlcXG4gICAgICAgIF0pXFxuICAgIH07XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5TbyB1c2luZyBzdWdhcnRhZ3MgYWxsb3dzIHVzIHRvIHdyaXRlIG1vcmUgY29uY2lzZSB2aWV3cywgdGhhdCBsb29rIG1vcmUgbGlrZSBuYXR1cmFsIEhUTUwuPC9wPlxcbjxwPk5leHQgbGV0IHVzIGFkZCBhIDxhIGhyZWY9XFxcIi9kb2Mvd2hhdC1pcy1hLXZpZXctbW9kZWwuaHRtbC5tZFxcXCI+dmlldyBtb2RlbDwvYT4gdG8gdGhlIGNvbnRyb2xsZXIuIEEgdmlldyBtb2RlbCBpcyBzaW1wbHkgYSBtb2RlbCB0aGF0IGNvbnRhaW5zIGRhdGEgYWJvdXQgdGhlIHZpZXcsIGFuZCBhdXhpbGxhcnkgZnVuY3Rpb25hbGl0eSwgaWU6IGRhdGEgYW5kIG90aGVyIHRoaW5ncyB0aGF0IHdlIGRvbiYjMzk7dCB3YW50IHRvIHBlcnNpc3QuIEFkZCB0aGlzIHRvIHRoZSBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmN0cmwudm0gPSB7XFxuICAgIGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xcbiAgICAgICAgICAgIHRvZG8uZG9uZSghdG9kby5kb25lKCkpO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHRvZ2dsZXMgdGhlIDxjb2RlPmRvbmU8L2NvZGU+IGF0dHJpYnV0ZSBvbiB0aGUgcGFzc2VkIGluIHRvZG8uIDwvcD5cXG48YmxvY2txdW90ZT5cXG5Zb3UgbWlnaHQgYmUgdGVtcHRlZCB0byBwdXQgdGhpcyBmdW5jdGlvbmFsaXR5IGludG8gdGhlIG1vZGVsLCBidXQgaW4gbWlzbywgd2UgbmVlZCB0byBzdHJpY3RseSBrZWVwIGRhdGEgaW4gdGhlIGRhdGEgbW9kZWwsIGFzIHdlIGFyZSBhYmxlIHRvIHBlcnNpc3QgaXQuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwPk5leHQgdXBkYXRlIHRoZSB2aWV3IHRvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgU1RZTEUoJnF1b3Q7LmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fSZxdW90OyksXFxuICAgICAgICAgICAgVUwoW1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyAmcXVvdDtkb25lJnF1b3Q7OiAmcXVvdDsmcXVvdDssIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xcbiAgICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgIF0pXFxuICAgICAgICBdXFxuICAgIH07XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbWFrZSB0aGUgbGlzdCBvZiB0b2RvcyBjbGlja2FibGUsIGFuZCBwdXQgYSBzdHJpa2UtdGhyb3VnaCB0aGUgdG9kbyB3aGVuIGl0IGlzIHNldCB0byAmcXVvdDtkb25lJnF1b3Q7LCBuZWF0ITwvcD5cXG48cD5Ob3cgbGV0IHVzIGFkZCBhIGNvdW50ZXIsIHRvIHNob3cgaG93IG1hbnkgdG9kb3MgYXJlIGxlZnQsIHB1dCB0aGlzIGludG8gdGhlIHZpZXcgbW9kZWwgeW91IGNyZWF0ZWQgaW4gdGhlIHByZXZpb3VzIHN0ZXA6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bGVmdDogZnVuY3Rpb24oKXtcXG4gICAgdmFyIGNvdW50ID0gMDtcXG4gICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICBjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xcbiAgICB9KTtcXG4gICAgcmV0dXJuIGNvdW50O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIGluIHRoZSB2aWV3LCBhZGQgdGhlIGZvbGxvd2luZyBhYm92ZSB0aGUgVUw6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+SDEoJnF1b3Q7VG9kb3MgLSAmcXVvdDsgKyBjdHJsLnZtLmxlZnQoKSArICZxdW90OyBvZiAmcXVvdDsgKyBjdHJsLmxpc3QubGVuZ3RoICsgJnF1b3Q7IHJlbWFpbmluZyZxdW90OyksXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBub3cgZGlzcGxheSBhIG5pY2UgaGVhZGVyIHNob3dpbmcgaG93IG1hbnkgdG9kb3MgYXJlIGxlZnQuPC9wPlxcbjxwPk5leHQgbGV0IHVzIGFkZCBhbiBpbnB1dCBmaWVsZCwgc28geW91IGNhbiBhZGQgbmV3IHRvZG9zLCBpbiB0aGUgdmlldyBtb2RlbCwgKHRoZSA8Y29kZT5jdHJsLnZtPC9jb2RlPiBvYmplY3QpLCBhZGQgdGhlIGZvbGxvd2luZyBsaW5lOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmlucHV0OiBtLnAoJnF1b3Q7JnF1b3Q7KVxcbjwvY29kZT48L3ByZT5cXG48cD5JbiB0aGUgY29udHJvbGxlciwgYWRkOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xcbiAgICB2YXIgdmFsdWUgPSBjdHJsLnZtLmlucHV0KCk7XFxuICAgIGlmKHZhbHVlKSB7XFxuICAgICAgICB2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcXG4gICAgICAgICAgICB0ZXh0OiBjdHJsLnZtLmlucHV0KCksXFxuICAgICAgICAgICAgZG9uZTogZmFsc2VcXG4gICAgICAgIH0pO1xcbiAgICAgICAgY3RybC5saXN0LnB1c2gobmV3VG9kbyk7XFxuICAgICAgICBjdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7XFxuICAgIH1cXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xcbiAgICByZXR1cm4gZmFsc2U7XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3IHRvZG8gYmFzZWQgb24gdGhlIGlucHV0IHRleHQsIGFuZCBhZGRzIGl0IHRvIHRoZSBsaXN0IG9mIHRvZG9zLjwvcD5cXG48cD5BbmQgaW4gdGhlIHZpZXcganVzdCBiZWxvdyB0aGUgVUwsIGFkZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5GT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXFxuICAgIElOUFVUKHsgdHlwZTogJnF1b3Q7dGV4dCZxdW90OywgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiAmcXVvdDtBZGQgdG9kbyZxdW90O30pLFxcbiAgICBCVVRUT04oeyB0eXBlOiAmcXVvdDtzdWJtaXQmcXVvdDt9LCAmcXVvdDtBZGQmcXVvdDspXFxuXSlcXG48L2NvZGU+PC9wcmU+XFxuPHA+QXMgeW91IGNhbiBzZWUsIHdlIGFzc2lnbiB0aGUgPGNvZGU+YWRkVG9kbzwvY29kZT4gbWV0aG9kIG9mIHRoZSBjb250cm9sbGVyIHRvIHRoZSBvbnN1Ym1pdCBmdW5jdGlvbiBvZiB0aGUgZm9ybSwgc28gdGhhdCBpdCB3aWxsIGNvcnJlY3RseSBhZGQgdGhlIHRvZG8gd2hlbiB5b3UgY2xpY2sgdGhlICZxdW90O0FkZCZxdW90OyBidXR0b24uPC9wPlxcbjxwPk5leHQsIGxldCB1cyBhZGQgdGhlIGFiaWxpdHkgdG8gYXJjaGl2ZSBvbGQgdG9kb3MsIGFkZCB0aGUgZm9sbG93aW5nIGludG8gdGhlIGNvbnRyb2xsZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcXG4gICAgdmFyIGxpc3QgPSBbXTtcXG4gICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICBpZighdG9kby5kb25lKCkpIHtcXG4gICAgICAgICAgICBsaXN0LnB1c2godG9kbyk7IFxcbiAgICAgICAgfVxcbiAgICB9KTtcXG4gICAgY3RybC5saXN0ID0gbGlzdDtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5BbmQgdGhpcyBidXR0b24gYmVsb3cgdGhlIEgxOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCAmcXVvdDtBcmNoaXZlJnF1b3Q7KSxcXG48L2NvZGU+PC9wcmU+XFxuPGgzPjxhIG5hbWU9XFxcImNvbXBsZXRlZC10b2RvLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NvbXBsZXRlZC10b2RvLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Db21wbGV0ZWQgdG9kbyBhcHA8L3NwYW4+PC9hPjwvaDM+PHA+QW5kIHlvdSBjYW4gbm93IGFyY2hpdmUgeW91ciB0b2Rvcy4gVGhpcyBjb21wbGV0ZXMgdGhlIHRvZG8gYXBwIGZ1bmN0aW9uYWxseSwgeW91ciBjb21wbGV0ZSB0b2RvIGFwcCBzaG91bGQgbG9vayBsaWtlIHRoaXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBiaW5kaW5ncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5iaW5kaW5ncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IG0ucHJvcChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgICAgIG15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG5cXG4gICAgICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XFxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xcbiAgICAgICAgICAgIGlmKHZhbHVlKSB7XFxuICAgICAgICAgICAgICAgIHZhciBuZXdUb2RvID0gbmV3IHNlbGYubW9kZWxzLnRvZG8oe1xcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogY3RybC52bS5pbnB1dCgpLFxcbiAgICAgICAgICAgICAgICAgICAgZG9uZTogZmFsc2VcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xcbiAgICAgICAgICAgICAgICBjdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICBpZighdG9kby5kb25lKCkpIHtcXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTsgXFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICBjdHJsLmxpc3QgPSBsaXN0O1xcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIGN0cmwudm0gPSB7XFxuICAgICAgICAgICAgbGVmdDogZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKSB7XFxuICAgICAgICAgICAgICAgICAgICBjb3VudCArPSB0b2RvLmRvbmUoKSA/IDAgOiAxO1xcbiAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50O1xcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgZG9uZTogZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcXG4gICAgICAgICAgICAgICAgICAgIHRvZG8uZG9uZSghdG9kby5kb25lKCkpO1xcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgICAgICBpbnB1dDogbS5wKCZxdW90OyZxdW90OylcXG4gICAgICAgIH07XFxuXFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBTVFlMRSgmcXVvdDsuZG9uZXt0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDt9JnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgSDEoJnF1b3Q7VG9kb3MgLSAmcXVvdDsgKyBjdHJsLnZtLmxlZnQoKSArICZxdW90OyBvZiAmcXVvdDsgKyBjdHJsLmxpc3QubGVuZ3RoICsgJnF1b3Q7IHJlbWFpbmluZyZxdW90OyksXFxuICAgICAgICAgICAgICAgIEJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCAmcXVvdDtBcmNoaXZlJnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgVUwoW1xcbiAgICAgICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTEkoeyBjbGFzczogdG9kby5kb25lKCk/ICZxdW90O2RvbmUmcXVvdDs6ICZxdW90OyZxdW90Oywgb25jbGljazogY3RybC52bS5kb25lKHRvZG8pIH0sIHRvZG8udGV4dCk7XFxuICAgICAgICAgICAgICAgICAgICB9KVxcbiAgICAgICAgICAgICAgICBdKSxcXG4gICAgICAgICAgICAgICAgRk9STSh7IG9uc3VibWl0OiBjdHJsLmFkZFRvZG8gfSwgW1xcbiAgICAgICAgICAgICAgICAgICAgSU5QVVQoeyB0eXBlOiAmcXVvdDt0ZXh0JnF1b3Q7LCB2YWx1ZTogY3RybC52bS5pbnB1dCwgcGxhY2Vob2xkZXI6ICZxdW90O0FkZCB0b2RvJnF1b3Q7fSksXFxuICAgICAgICAgICAgICAgICAgICBCVVRUT04oeyB0eXBlOiAmcXVvdDtzdWJtaXQmcXVvdDt9LCAmcXVvdDtBZGQmcXVvdDspXFxuICAgICAgICAgICAgICAgIF0pXFxuICAgICAgICAgICAgXVxcbiAgICAgICAgfTtcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5leHQgd2UgcmVjb21tZW5kIHlvdSByZWFkPC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC1wYXJ0LTItcGVyc2lzdGVuY2UubWRcXFwiPkNyZWF0aW5nIGEgdG9kbyBhcHAgcGFydCAyIC0gcGVyc2lzdGVuY2U8L2E+LCB3aGVyZSB3ZSB3aWxsIGdvIHRocm91Z2ggYWRkaW5nIGRhdGEgcGVyc2lzdGVuY2UgZnVuY3Rpb25hbGl0eS48L3A+XFxuXCIsXCJEZWJ1Z2dpbmcubWRcIjpcIjxoMT48YSBuYW1lPVxcXCJkZWJ1Z2dpbmctYS1taXNvLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2RlYnVnZ2luZy1hLW1pc28tYXBwXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkRlYnVnZ2luZyBhIG1pc28gYXBwPC9zcGFuPjwvYT48L2gxPjxwPkluIG9yZGVyIHRvIGRlYnVnIGEgbWlzbyBhcHAsIChvciBhbnkgaXNvbW9ycGhpYyBKYXZhU2NyaXB0IGFwcCBmb3IgdGhhdCBtYXR0ZXIpLCB5b3UmIzM5O2xsIG5lZWQgdG8gYmUgYWJsZSB0byBkZWJ1ZyBvbiBib3RoIHRoZSBjbGllbnQgYW5kIHRoZSBzZXJ2ZXIuIEhlcmUgd2Ugd2lsbCBkZW1vbnN0cmF0ZSBkZWJ1Z2dpbmcgdGhlIGNsaWVudC1zaWRlIGNvZGUgdXNpbmcgQ2hyb21lLCBhbmQgdGhlIHNlcnZlciBjb2RlIHVzaW5nIEpldEJyYWlucyBXZWJTdG9ybSA5LiBNaXNvIGNhbiBhY3R1YWxseSBiZSBkZWJ1Z2dlZCB1c2luZyBhbnkgc3RhbmRhcmQgbm9kZSBhbmQgY2xpZW50LXNpZGUgZGVidWdnaW5nIHRvb2xzIHRoYXQgc3VwcG9ydCBzb3VyY2UgbWFwcy48L3A+XFxuPHA+SW4gdGhpcyBleGFtcGxlIHdlJiMzOTtyZSBnb2luZyB0byBkZWJ1ZyB0aGUgZXhhbXBsZSA8Y29kZT50b2RvczwvY29kZT4gYXBwLCBzbyBiZSBzdXJlIHlvdSBrbm93IGhvdyBpdCB3b3JrcywgYW5kIHlvdSBrbm93IGhvdyB0byBpbnN0YWxsIGl0IC0gaWYgeW91IGRvbiYjMzk7dCBrbm93IGhvdywgcGxlYXNlIHJlYWQgdGhlIDxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC5tZFxcXCI+dG9kb3MgYXBwIHR1dG9yaWFsPC9hPiBmaXJzdC48L3A+XFxuPGJsb2NrcXVvdGU+XFxuT25lIHRoaW5nIHRvIGtlZXAgaW4gbWluZCBpcyBob3cgbWlzbyB3b3JrczogaXQgaXMgaXNvbW9ycGhpYyB3aGljaCBtZWFucyB0aGF0IHRoZSBjb2RlIHdlIGhhdmUgaXMgYWJsZSB0byBydW4gYm90aCBzZXJ2ZXIgYW5kIGNsaWVudCBzaWRlLiBPZiBjb3Vyc2UgaXQgZG9lc24mIzM5O3QgYWx3YXlzIHJ1biBvbiBib3RoIHNpZGVzLCBzbyBoZXJlIGlzIGEgaGFuZHkgbGl0dGxlIHRhYmxlIHRvIGV4cGxhaW4gd2hhdCB0eXBpY2FsbHkgcnVucyB3aGVyZSBhbmQgd2hlbiwgZm9yIHRoZSB0b2RvcyBleGFtcGxlOlxcbjwvYmxvY2txdW90ZT5cXG5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+RmlsZTwvdGg+XFxuPHRoPmFjdGlvbjwvdGg+XFxuPHRoPlNlcnZlcjwvdGg+XFxuPHRoPkNsaWVudDwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPi9tdmMvdG9kby5qczwvdGQ+XFxuPHRkPmluZGV4PC90ZD5cXG48dGQ+UnVucyB3aGVuIGEgYnJvd3NlciBsb2FkcyB1cCA8Y29kZT4vdG9kb3M8L2NvZGU+PC90ZD5cXG48dGQ+UnVucyB3aGVuIHlvdSBpbnRlcmFjdCB3aXRoIGFueXRoaW5nPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+L3N5c3RlbS9hcGkvZmxhdGZpbGVkYi5hcGkuanM8L3RkPlxcbjx0ZD5maW5kPC90ZD5cXG48dGQ+UnVucyB3aGVuIGluZGV4IGlzIHJ1biBlaXRoZXIgc2VydmVyIChkaXJlY3RseSkgb3IgY2xpZW50IHNpZGUgKHRocm91Z2ggdGhlIGFwaSk8L3RkPlxcbjx0ZD5OZXZlciBydW5zIG9uIHRoZSBjbGllbnQgLSBhbiBhamF4IHJlcXVlc3QgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgbWlzbzwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+VGhvc2UgYXJlIHRoZSBvbmx5IGZpbGVzIHRoYXQgYXJlIHVzZWQgaW4gdGhlIHRvZG9zIGV4YW1wbGUuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJjbGllbnQtc2lkZS1taXNvLWRlYnVnZ2luZ1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NsaWVudC1zaWRlLW1pc28tZGVidWdnaW5nXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNsaWVudC1zaWRlIG1pc28gZGVidWdnaW5nPC9zcGFuPjwvYT48L2gyPjxwPkZpcnN0bHkgbGV0IHVzIG1ha2Ugc3VyZSB0aGF0IHdlJiMzOTt2ZSBjb25maWd1cmVkIENocm9tZSBjb3JyZWN0bHk6PC9wPlxcbjx1bD5cXG48bGk+T3BlbiB0aGUgZGV2IHRvb2xzIChDTUQgKyBBTFQgKyBKIG9uIE1hYywgRjEyIG9uIFBDKTwvbGk+XFxuPGxpPkNsaWNrIHRoZSBzZXR0aW5nIGNvZyA8L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX2NvZy5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIGNvZ1xcXCI+PC9wPlxcbjx1bD5cXG48bGk+U2Nyb2xsIGRvd24gdG8gdGhlICZxdW90O1NvdXJjZXMmcXVvdDsgc2VjdGlvbjwvbGk+XFxuPGxpPk1ha2Ugc3VyZSB0aGF0ICZxdW90O0VuYWJsZSBKYXZhU2NyaXB0IHNvdXJjZSBtYXBzJnF1b3Q7IGlzIHRpY2tlZCBhbmQgY2xvc2UgdGhlIHNldHRpbmdzLjwvbGk+XFxuPC91bD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfc2V0dGluZ3MuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5Ob3cgQ2hyb21lIGlzIHJlYWR5IHRvIGludGVyYWN0IHdpdGggbWlzby4gTmV4dCBydW4gdGhlIG1pc28gdG9kbyBhcHAgaW4gZGV2ZWxvcG1lbnQgbW9kZSAtIGkuZS4gaW4gdGhlIGRpcmVjdG9yeSB5b3Ugc2V0dXAgbWlzbywgcnVuIHRoZSBmb2xsb3dpbmc6PC9wPlxcbjxwcmU+PGNvZGU+bWlzbyBydW5cXG48L2NvZGU+PC9wcmU+PHA+V2hlbiB5b3UmIzM5O3JlIHVwIGFuZCBydW5uaW5nLCBnbyB0byB0aGUgdG9kb3MgVVJMLCBpZiBldmVyeXRoaW5nIGlzIHNldHVwIHdpdGggZGVmYXVsdHMsIGl0IHdpbGwgYmU6PC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvdG9kb3MubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3Q6NjQ3Ni90b2RvczwvYT48L3A+XFxuPHA+TmV4dCBvcGVuIHRoZSBkZXYgdG9vbHMgaW4gQ2hyb21lIGFuZDo8L3A+XFxuPHVsPlxcbjxsaT5DbGljayB0aGUgJnF1b3Q7U291cmNlcyZxdW90OyB0YWI8L2xpPlxcbjxsaT5PcGVuIHRoZSAmcXVvdDttdmMmcXVvdDsgZm9sZGVyPC9saT5cXG48bGk+Q2xpY2sgb24gdGhlICZxdW90O3RvZG8uanMmcXVvdDsgZmlsZTwvbGk+XFxuPC91bD5cXG48cD5Zb3Ugc2hvdWxkIG5vdyBzZWUgYSB0b2RvLmpzIGZpbGUgaW4gdGhlIHJpZ2h0LWhhbmQgcGFuZTwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfc291cmNlX3RvZG9zLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHVsPlxcbjxsaT5TY3JvbGwgZG93biB0byB0aGUgbGFzdCBsaW5lIGluc2lkZSB0aGUgPGNvZGU+YWRkVG9kbzwvY29kZT4gbWV0aG9kPC9saT5cXG48bGk+Q2xpY2sgb24gdGhlIGxpbmUtbnVtYmVyIG5leHQgdG8gdGhlIHJldHVybiBzdGF0ZW1lbnQgdG8gc2V0IGEgYnJlYWtwb2ludDwvbGk+XFxuPC91bD5cXG48cD5Zb3Ugc2hvdWxkIG5vdyBzZWUgYSBtYXJrIG5leHQgdG8gdGhlIGxpbmUsIGFuZCBhIGJyZWFrcG9pbnQgaW4gdGhlIGxpc3Qgb2YgYnJlYWtwb2ludHMuPC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL2Nocm9tZV9icmVha3BvaW50LmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+Tm93IHdlIHdhbnQgdG8gdHJ5IGFuZCB0cmlnZ2VyIHRoYXQgYnJlYWtwb2ludDo8L3A+XFxuPHVsPlxcbjxsaT5FbnRlciBhIHZhbHVlIGluIHRoZSAmcXVvdDtBZGQgdG9kbyZxdW90OyBib3g8L2xpPlxcbjxsaT5DbGljayB0aGUgJnF1b3Q7QWRkJnF1b3Q7IGJ1dHRvbjwvbGk+XFxuPC91bD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9taXNvX3RvZG9zX2FkZC5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPllvdSBzaG91bGQgbm93IHNlZSB0aGUgYnJlYWtwb2ludCBpbiBhY3Rpb24sIGNvbXBsZXRlIHdpdGggeW91ciB2YWx1ZSBpbiB0aGUgbG9jYWwgc2NvcGUuPC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL2Nocm9tZV9icmVha3BvaW50X2FjdGl2ZS5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPkFuZCB0aGF0JiMzOTtzIGl0IGZvciBjbGllbnQtc2lkZSBkZWJ1Z2dpbmcgLSB5b3UgY2FuIG5vdyB1c2UgdGhlIENocm9tZSBkZWJ1Z2dlciB0byBpbnNwZWN0IGFuZCBtYW5pcHVsYXRlIHZhbHVlcywgZXRjLi4uPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJzZXJ2ZXItc2lkZS1taXNvLWRlYnVnZ2luZ1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3NlcnZlci1zaWRlLW1pc28tZGVidWdnaW5nXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlNlcnZlci1zaWRlIG1pc28gZGVidWdnaW5nPC9zcGFuPjwvYT48L2gyPjxibG9ja3F1b3RlPlxcbk5vdGU6IFBsZWFzZSBjbGVhciBhbnkgYnJlYWtwb2ludCB5b3UgbWlnaHQgaGF2ZSBzZXQgaW4gQ2hyb21lLCBzbyBpdCB3b24mIzM5O3QgaW50ZXJmZXJlIHdpdGggb3VyIHNlcnZlci1zaWRlIGRlYnVnZ2luZyBzZXNzaW9uIC0gb2YgY291cnNlIHlvdSBjYW4gdXNlIGJvdGggdG9nZXRoZXIsIGJ1dCBmb3Igbm93IGxldCB1cyBjbGVhciB0aGVtLCBhbmQgYWxzbyBzdG9wIHRoZSBtaXNvIHNlcnZlciwgaWYgaXQgaXMgc3RpbGwgcnVubmluZywgYXMgd2Ugd2lsbCBnZXQgV2ViU3Rvcm0gdG8gaGFuZGxlIGl0IGZvciB1cy5cXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHA+SW4gdGhpcyBleGFtcGxlIHdlJiMzOTtyZSBnb2luZyB0byB1c2UgPGEgaHJlZj1cXFwiL2RvYy8ubWRcXFwiPldlYlN0b3JtPC9hPiAtIHlvdSBjYW4gdXNlIGFueSBJREUgdGhhdCBzdXBwb3J0cyBub2RlIGRlYnVnZ2luZywgb3IgZnJlZSB0b29scyBzdWNoIGFzIDxhIGhyZWY9XFxcIi9kb2Mvbm9kZS1pbnNwZWN0b3IubWRcXFwiPm5vZGUtaW5zcGVjdG9yPC9hPiwgc28gdGhpcyBpcyBzaW1wbHkgZm9yIGlsbHVzdHJhdGl2ZSBwdXJwb3Nlcy48L3A+XFxuPHA+Rmlyc3Qgd2UgbmVlZCB0byBzZXR1cCBvdXIgcHJvamVjdCwgc28gaW4gV2Vic3Rvcm06PC9wPlxcbjx1bD5cXG48bGk+Q3JlYXRlIGEgbmV3IHByb2plY3QsIHNldHRpbmcgeW91ciBtaXNvIGRpcmVjdG9yeSBhcyB0aGUgcm9vdC48L2xpPlxcbjxsaT5BZGQgYSBuZXcgbm9kZSBwcm9qZWN0IGNvbmZpZ3VyYXRpb24sIHdpdGggdGhlIGZvbGxvd2luZyBzZXR0aW5nczo8L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvd2Vic3Rvcm1fY29uZmlndXJlX3Byb2plY3QuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48dWw+XFxuPGxpPk5vdyBoaXQgdGhlIGRlYnVnIGJ1dHRvbjwvbGk+XFxuPC91bD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy93ZWJzdG9ybV9kZWJ1Z19idXR0b24uanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5Zb3Ugc2hvdWxkIHNlZSBtaXNvIHJ1bm5pbmcgaW4gdGhlIFdlYlN0b3JtIGNvbnNvbGUgbGlrZSBzbzo8L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvd2Vic3Rvcm1fY29uc29sZS5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjx1bD5cXG48bGk+Tm93IG9wZW4gPGNvZGU+L3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9mbGF0ZmlsZWRiLmFwaS5qczwvY29kZT4sIGFuZCBwdXQgYSBicmVha3BvaW50IG9uIHRoZSBsYXN0IGxpbmUgb2YgdGhlIDxjb2RlPmZpbmQ8L2NvZGU+IG1ldGhvZC48L2xpPlxcbjwvdWw+XFxuPHA+Tm93IGlmIHlvdSBnbyBiYWNrIHRvIHlvdXIgYnJvd3NlciB0b2RvcyBhcHA6PC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvdG9kb3MubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3Q6NjQ3Ni90b2RvczwvYT48L3A+XFxuPHA+UmVsb2FkIHRoZSBwYWdlLCBhbmQgeW91IHdpbGwgc2VlIHRoZSBicmVha3BvaW50IGJlaW5nIGFjdGl2YXRlZCBpbiBXZWJTdG9ybTo8L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvd2Vic3Rvcm1fYnJlYWtwb2ludF9hY3RpdmUuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5Ob3cgY2xpY2sgdGhlICZxdW90O3Jlc3VtZSBwcm9ncmFtIGJ1dHRvbiZxdW90OywgYW5kIHlvdSYjMzk7bGwgc2VlIHRoYXQgdGhlIGJyZWFrcG9pbnQgaXQgaXMgaW1tZWRpYXRlbHkgaW52b2tlZCBhZ2FpbiEgPC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2JyZWFrcG9pbnRfZGF0YS5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPlRoaXMgaXMgc2ltcGx5IGJlY2F1c2UgbWlzbyByZW5kZXJzIHRoZSBmaXJzdCBwYWdlIG9uIHRoZSBzZXJ2ZXIgLSBzbyBkZXBlbmRpbmcgb24gaG93IHlvdSBzdHJ1Y3R1cmUgeW91ciBxdWVyaWVzLCBpdCB3aWxsIHVzZSB0aGUgQVBJIHR3aWNlIC0gb25jZSBmcm9tIHRoZSBzZXJ2ZXIgc2lkZSByZW5kZXJpbmcsIGFuZCBvbmNlIGZyb20gdGhlIGNsaWVudC1zaWRlLiBEb24mIzM5O3Qgd29ycnkgLSB0aGlzIG9ubHkgaGFwcGVucyBvbiBpbml0aWFsIHBhZ2UgbG9hZCBpbiBvcmRlciB0byByZW5kZXIgdGhlIGZpcnN0IHBhZ2UgYm90aCBzZXJ2ZXIgc2lkZSBhbmQgY2xpZW50IHNpZGUsIHlvdSBjYW4gcmVhZCBtb3JlIGFib3V0IGhvdyB0aGF0IHdvcmtzIGhlcmU6PC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvSG93LW1pc28td29ya3MjZmlyc3QtcGFnZS1sb2FkLm1kXFxcIj5Ib3cgbWlzbyB3b3JrczogRmlyc3QgcGFnZSBsb2FkPC9hPjwvcD5cXG48cD5TbywgeW91IGFyZSBub3cgYWJsZSB0byBpbnNwZWN0IHRoZSB2YWx1ZXMsIGFuZCBkbyBhbnkga2luZCBvZiBzZXJ2ZXIgc2lkZSBkZWJ1Z2dpbmcgeW91IGxpa2UuPC9wPlxcblwiLFwiR2V0dGluZy1zdGFydGVkLm1kXCI6XCI8cD5UaGlzIGd1aWRlIHdpbGwgdGFrZSB5b3UgdGhyb3VnaCBtYWtpbmcgeW91ciBmaXJzdCBtaXNvIGFwcCwgaXQgaXMgYXNzdW1lZCB0aGF0IHlvdSBrbm93IHRoZSBiYXNpY3Mgb2YgaG93IHRvIHVzZSBub2RlanMgYW5kIG1pdGhyaWwuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJpbnN0YWxsYXRpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNpbnN0YWxsYXRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SW5zdGFsbGF0aW9uPC9zcGFuPjwvYT48L2gyPjxwPlRvIGluc3RhbGwgbWlzbywgdXNlIG5wbTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5ucG0gaW5zdGFsbCBtaXNvanMgLWdcXG48L2NvZGU+PC9wcmU+XFxuPHA+VG8gY3JlYXRlIGFuZCBydW4gYSBtaXNvIGFwcCBpbiBhIG5ldyBkaXJlY3Rvcnk6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bWlzbyAtbiBteWFwcFxcbmNkIG15YXBwXFxubWlzbyBydW5cXG48L2NvZGU+PC9wcmU+XFxuPHA+WW91IHNob3VsZCBub3cgc2VlIHNvbWV0aGluZyBsaWtlOjwvcD5cXG48cHJlPjxjb2RlPk1pc28gaXMgbGlzdGVuaW5nIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6NjQ3NiBpbiBkZXZlbG9wbWVudCBtb2RlXFxuPC9jb2RlPjwvcHJlPjxwPk9wZW4geW91ciBicm93c2VyIGF0IDxjb2RlPmh0dHA6Ly9sb2NhbGhvc3Q6NjQ3NjwvY29kZT4gYW5kIHlvdSB3aWxsIHNlZSB0aGUgZGVmYXVsdCBtaXNvIHNjcmVlbjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiaGVsbG8td29ybGQtYXBwXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaGVsbG8td29ybGQtYXBwXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkhlbGxvIHdvcmxkIGFwcDwvc3Bhbj48L2E+PC9oMj48cD5DcmVhdGUgYSBuZXcgZmlsZSA8Y29kZT5oZWxsby5qczwvY29kZT4gaW4gPGNvZGU+bXlhcHAvbXZjPC9jb2RlPiBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pO1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7aGVsbG9faWQmIzM5OywgcGFyYW1zKTtcXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XFxuICAgICAgICByZXR1cm4gdGhpcztcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gRElWKCZxdW90O0hlbGxvICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlbiBvcGVuIDxhIGhyZWY9XFxcIi9kb2MvWU9VUk5BTUUubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3Q6NjQ3Ni9oZWxsby9ZT1VSTkFNRTwvYT4gYW5kIHlvdSBzaG91bGQgc2VlICZxdW90O0hlbGxvIFlPVVJOQU1FJnF1b3Q7LiBDaGFuZ2UgdGhlIHVybCB0byBoYXZlIHlvdXIgYWN0dWFsIG5hbWUgaW5zdGVhZCBvZiBZT1VSTkFNRSwgeW91IG5vdyBrbm93IG1pc28gOik8L3A+XFxuPHA+TGV0IHVzIHRha2UgYSBsb29rIGF0IHdoYXQgZWFjaCBwaWVjZSBvZiB0aGUgY29kZSBpcyBhY3R1YWxseSBkb2luZzo8L3A+XFxuPGgzPjxhIG5hbWU9XFxcImluY2x1ZGVzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaW5jbHVkZXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SW5jbHVkZXM8L3NwYW4+PC9hPjwvaDM+PGJsb2NrcXVvdGU+XFxuU3VtbWFyeTogTWl0aHJpbCBpcyB0aGUgb25seSByZXF1aXJlZCBsaWJyYXJ5IHdoZW4gYXBwcywgYnV0IHVzaW5nIG90aGVyIGluY2x1ZGVkIGxpYnJhcmllcyBpcyB2ZXJ5IHVzZWZ1bFxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5IZXJlIHdlIGdyYWIgbWl0aHJpbCwgdGhlbiBtaXNvIHV0aWxpdGllcyBhbmQgc3VnYXIgdGFncyAtIHRlY2huaWNhbGx5IHNwZWFraW5nLCB3ZSByZWFsbHkgb25seSBuZWVkIG1pdGhyaWwsIGJ1dCB0aGUgb3RoZXIgbGlicmFyaWVzIGFyZSB2ZXJ5IHVzZWZ1bCBhcyB3ZWxsIGFzIHdlIHdpbGwgc2VlLjwvcD5cXG48aDM+PGEgbmFtZT1cXFwibW9kZWxzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbW9kZWxzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk1vZGVsczwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBVc2UgdGhlIGF1dG9tYXRpYyByb3V0aW5nIHdoZW4geW91IGNhbiwgYWx3YXlzIHB1dCBtb2RlbHMgb24gdGhlICYjMzk7bW9kZWxzJiMzOTsgYXR0cmlidXRlIG9mIHlvdXIgbXZjIGZpbGVcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+SGVyZSBhIGZldyBpbXBvcnRhbnQgdGhpbmdzIGFyZSBnb2luZyBvbjo8L3A+XFxuPHVsPlxcbjxsaT48cD5CeSBwbGFjaW5nIG91ciA8Y29kZT5tdmM8L2NvZGU+IG9iamVjdCBvbiA8Y29kZT5tb2R1bGUuZXhwb3J0cy5lZGl0PC9jb2RlPiwgYXV0b21hdGljIHJvdXRpbmcgaXMgYXBwbGllZCBieSBtaXNvIC0geW91IGNhbiByZWFkIG1vcmUgYWJvdXQgPGEgaHJlZj1cXFwiL2RvYy9Ib3ctbWlzby13b3JrcyNyb3V0ZS1ieS1jb252ZW50aW9uLm1kXFxcIj5ob3cgdGhlIGF1dG9tYXRpYyByb3V0aW5nIHdvcmtzIGhlcmU8L2E+LiA8L3A+XFxuPC9saT5cXG48bGk+PHA+UGxhY2luZyBvdXIgPGNvZGU+aGVsbG88L2NvZGU+IG1vZGVsIG9uIHRoZSA8Y29kZT5tb2RlbHM8L2NvZGU+IGF0dHJpYnV0ZSBvZiB0aGUgb2JqZWN0IGVuc3VyZXMgdGhhdCBtaXNvIGNhbiBmaWd1cmUgb3V0IHdoYXQgeW91ciBtb2RlbHMgYXJlLCBhbmQgd2lsbCBjcmVhdGUgYSBwZXJzaXN0ZW5jZSBBUEkgYXV0b21hdGljYWxseSBmb3IgeW91IHdoZW4gdGhlIHNlcnZlciBzdGFydHMgdXAsIHNvIHRoYXQgeW91IGNhbiBzYXZlIHlvdXIgbW9kZWxzIGludG8gdGhlIGRhdGFiYXNlLjwvcD5cXG48L2xpPlxcbjwvdWw+XFxuPGgzPjxhIG5hbWU9XFxcImNvbnRyb2xsZXJcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjb250cm9sbGVyXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNvbnRyb2xsZXI8L3NwYW4+PC9hPjwvaDM+PGJsb2NrcXVvdGU+XFxuU3VtbWFyeTogRE8gTk9UIGZvcmdldCB0byAmIzM5O3JldHVybiB0aGlzOyYjMzk7IGluIHRoZSBjb250cm9sbGVyLCBpdCBpcyB2aXRhbCFcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgdmFyIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTtoZWxsb19pZCYjMzk7LCBwYXJhbXMpO1xcbiAgICB0aGlzLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IHdob30pO1xcbiAgICByZXR1cm4gdGhpcztcXG59LFxcbjwvY29kZT48L3ByZT5cXG48cD5UaGUgY29udHJvbGxlciB1c2VzIDxjb2RlPm1pc28uZ2V0UGFyYW08L2NvZGU+IHRvIHJldHJlaXZlIHRoZSBwYXJhbWV0ZXIgLSB0aGlzIGlzIHNvIHRoYXQgaXQgY2FuIHdvcmsgc2VhbWxlc3NseSBvbiBib3RoIHRoZSBzZXJ2ZXIgYW5kIGNsaWVudCBzaWRlLiBXZSBjcmVhdGUgYSBuZXcgbW9kZWwsIGFuZCB2ZXJ5IGltcG9ydGFudGx5IDxjb2RlPnJldHVybiB0aGlzPC9jb2RlPiBlbnN1cmVzIHRoYXQgbWlzbyBjYW4gZ2V0IGFjY2VzcyB0byB0aGUgY29udHJvbGxlciBjb3JyZWN0bHkuPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJ2aWV3XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjdmlld1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5WaWV3PC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IFVzZSBzdWdhcnRhZ3MgdG8gbWFrZSB0aGUgdmlldyBsb29rIG1vcmUgbGlrZSBIVE1MXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgcmV0dXJuIERJVigmcXVvdDtIZWxsbyAmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpKTtcXG4gICAgfVxcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIHZpZXcgaXMgc2ltcGx5IGEgamF2YXNjcmlwdCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdHJ1Y3R1cmUuIEhlcmUgd2UgdXNlIHRoZSA8Y29kZT5zdWdhcnRhZ3M8L2NvZGU+IGxpYnJhcnkgdG8gcmVuZGVyIHRoZSBESVYgdGFnIC0gdGhpcyBpcyBzdHJpY3RseSBub3QgcmVxdWlyZWQsIGJ1dCBJIGZpbmQgdGhhdCBwZW9wbGUgdGVuZCB0byB1bmRlcnN0YW5kIHRoZSBzdWdhcnRhZ3Mgc3ludGF4IGJldHRlciB0aGFuIHB1cmUgbWl0aHJpbCwgYXMgaXQgbG9va3MgYSBsaXR0bGUgbW9yZSBsaWtlIEhUTUwsIHRob3VnaCBvZiBjb3Vyc2UgeW91IGNvdWxkIHVzZSBzdGFuZGFyZCBtaXRocmlsIHN5bnRheCBpZiB5b3UgcHJlZmVyLjwvcD5cXG48aDM+PGEgbmFtZT1cXFwibmV4dFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI25leHRcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TmV4dDwvc3Bhbj48L2E+PC9oMz48cD5Zb3Ugbm93IGhhdmUgYSBjb21wbGV0ZSBoZWxsbyB3b3JsZCBhcHAsIGFuZCB1bmRlcnN0YW5kIHRoZSBmdW5kYW1lbnRhbHMgb2YgdGhlIHN0cnVjdHVyZSBvZiBhIG1pc28gbXZjIGFwcGxpY2F0aW9uLjwvcD5cXG48cD5XZSBoYXZlIG9ubHkganVzdCBzY3JhcGVkIHRoZSBzdXJmYWNlIG9mIHdoYXQgbWlzbyBpcyBjYXBhYmxlIG9mLCBzbyBuZXh0IHdlIHJlY29tbWVuZCB5b3UgcmVhZDo8L3A+XFxuPHA+PGEgaHJlZj1cXFwiL2RvYy9DcmVhdGluZy1hLXRvZG8tYXBwLm1kXFxcIj5DcmVhdGluZyBhIHRvZG8gYXBwPC9hPjwvcD5cXG5cIixcIkdvYWxzLm1kXCI6XCI8aDE+PGEgbmFtZT1cXFwicHJpbWFyeS1nb2Fsc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3ByaW1hcnktZ29hbHNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+UHJpbWFyeSBnb2Fsczwvc3Bhbj48L2E+PC9oMT48dWw+XFxuPGxpPkVhc3kgc2V0dXAgb2YgPGEgaHJlZj1cXFwiL2RvYy8ubWRcXFwiPmlzb21vcnBoaWM8L2E+IGFwcGxpY2F0aW9uIGJhc2VkIG9uIDxhIGhyZWY9XFxcIi9kb2MvbWl0aHJpbC5qcy5tZFxcXCI+bWl0aHJpbDwvYT48L2xpPlxcbjxsaT5Ta2VsZXRvbiAvIHNjYWZmb2xkIC8gQm9pbGVycGxhdGUgdG8gYWxsb3cgdXNlcnMgdG8gdmVyeSBxdWlja2x5IGdldCB1cCBhbmQgcnVubmluZy48L2xpPlxcbjxsaT5taW5pbWFsIGNvcmU8L2xpPlxcbjxsaT5lYXN5IGV4dGVuZGlibGU8L2xpPlxcbjxsaT5EQiBhZ25vc3RpYyAoZS4gRy4gcGx1Z2lucyBmb3IgZGlmZmVyZW50IE9STS9PRE0pPC9saT5cXG48L3VsPlxcbjxoMT48YSBuYW1lPVxcXCJjb21wb25lbnRzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY29tcG9uZW50c1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Db21wb25lbnRzPC9zcGFuPjwvYT48L2gxPjx1bD5cXG48bGk+Um91dGluZzwvbGk+XFxuPGxpPlZpZXcgcmVuZGVyaW5nPC9saT5cXG48bGk+aTE4bi9sMTBuPC9saT5cXG48bGk+UmVzdC1BUEkgKGNvdWxkIHVzZSByZXN0aWZ5OiA8YSBocmVmPVxcXCIvZG9jLy5tZFxcXCI+aHR0cDovL21jYXZhZ2UubWUvbm9kZS1yZXN0aWZ5LzwvYT4pPC9saT5cXG48bGk+b3B0aW9uYWwgV2Vic29ja2V0cyAoY291bGQgdXNlIHJlc3RpZnk6IDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5odHRwOi8vbWNhdmFnZS5tZS9ub2RlLXJlc3RpZnkvPC9hPik8L2xpPlxcbjxsaT5lYXN5IHRlc3RpbmcgKGhlYWRsZXNzIGFuZCBCcm93c2VyLVRlc3RzKTwvbGk+XFxuPGxpPmxvZ2luL3Nlc3Npb24gaGFuZGxpbmc8L2xpPlxcbjxsaT5tb2RlbHMgd2l0aCB2YWxpZGF0aW9uPC9saT5cXG48L3VsPlxcbjxoMT48YSBuYW1lPVxcXCJ1c2VmdWwtbGlic1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3VzZWZ1bC1saWJzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlVzZWZ1bCBsaWJzPC9zcGFuPjwvYT48L2gxPjxwPkhlcmUgYXJlIHNvbWUgbGlicmFyaWVzIHdlIGFyZSBjb25zaWRlcmluZyB1c2luZywgKGluIG5vIHBhcnRpY3VsYXIgb3JkZXIpOjwvcD5cXG48dWw+XFxuPGxpPmxldmVsZGI8L2xpPlxcbjxsaT5taXRocmlsLXF1ZXJ5PC9saT5cXG48bGk+dHJhbnNsYXRlLmpzPC9saT5cXG48bGk+aTE4bmV4dDwvbGk+XFxuPC91bD5cXG48cD5BbmQgc29tZSB0aGF0IHdlJiMzOTtyZSBhbHJlYWR5IHVzaW5nOjwvcD5cXG48dWw+XFxuPGxpPmV4cHJlc3M8L2xpPlxcbjxsaT5icm93c2VyaWZ5PC9saT5cXG48bGk+bW9jaGEvZXhwZWN0PC9saT5cXG48bGk+bWl0aHJpbC1ub2RlLXJlbmRlcjwvbGk+XFxuPGxpPm1pdGhyaWwtc3VnYXJ0YWdzPC9saT5cXG48bGk+bWl0aHJpbC1iaW5kaW5nczwvbGk+XFxuPGxpPm1pdGhyaWwtYW5pbWF0ZTwvbGk+XFxuPGxpPmxvZGFzaDwvbGk+XFxuPGxpPnZhbGlkYXRvcjwvbGk+XFxuPC91bD5cXG5cIixcIkhvbWUubWRcIjpcIjxwPldlbGNvbWUgdG8gdGhlIG1pc29qcyB3aWtpITwvcD5cXG48aDI+PGEgbmFtZT1cXFwiZ2V0dGluZy1zdGFydGVkXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZ2V0dGluZy1zdGFydGVkXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkdldHRpbmcgc3RhcnRlZDwvc3Bhbj48L2E+PC9oMj48cD5SZWFkIHRoZSA8YSBocmVmPVxcXCIvZG9jL0dldHRpbmctc3RhcnRlZC5tZFxcXCI+R2V0dGluZyBzdGFydGVkPC9hPiBndWlkZSE8L3A+XFxuPGgyPjxhIG5hbWU9XFxcIm1vcmUtaW5mb1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI21vcmUtaW5mb1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Nb3JlIGluZm88L3NwYW4+PC9hPjwvaDI+PHA+U2VlIHRoZSA8YSBocmVmPVxcXCIvZG9jL21pc29qcyNpbnN0YWxsLm1kXFxcIj5pbnN0YWxsIGd1aWRlPC9hPi5cXG5SZWFkIDxhIGhyZWY9XFxcIi9kb2MvSG93LW1pc28td29ya3MubWRcXFwiPmhvdyBtaXNvIHdvcmtzPC9hPiwgYW5kIGNoZWNrIG91dCA8YSBocmVmPVxcXCIvZG9jL1BhdHRlcm5zLm1kXFxcIj50aGUgcGF0dGVybnM8L2E+LCB0aGVuIGNyZWF0ZSBzb21ldGhpbmcgY29vbCE8L3A+XFxuXCIsXCJIb3ctbWlzby13b3Jrcy5tZFwiOlwiPGgyPjxhIG5hbWU9XFxcIm1vZGVscy12aWV3cy1jb250cm9sbGVyc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI21vZGVscy12aWV3cy1jb250cm9sbGVyc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Nb2RlbHMsIHZpZXdzLCBjb250cm9sbGVyczwvc3Bhbj48L2E+PC9oMj48cD5XaGVuIGNyZWF0aW5nIGEgcm91dGUsIHlvdSBtdXN0IGFzc2lnbiBhIGNvbnRyb2xsZXIgYW5kIGEgdmlldyB0byBpdCAtIHRoaXMgaXMgYWNoaWV2ZWQgYnkgY3JlYXRpbmcgYSBmaWxlIGluIHRoZSA8Y29kZT4vbXZjPC9jb2RlPiBkaXJlY3RvcnkgLSBieSBjb252ZW50aW9uLCB5b3Ugc2hvdWxkIG5hbWUgaXQgYXMgcGVyIHRoZSBwYXRoIHlvdSB3YW50LCAoc2VlIHRoZSA8YSBocmVmPVxcXCIvZG9jLyNyb3V0aW5nLm1kXFxcIj5yb3V0aW5nIHNlY3Rpb248L2E+IGZvciBkZXRhaWxzKS48L3A+XFxuPHA+SGVyZSBpcyBhIG1pbmltYWwgZXhhbXBsZSB1c2luZyB0aGUgc3VnYXJ0YWdzLCBhbmQgZ2V0dGluZyBhIHBhcmFtZXRlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5zdWdhcnRhZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB0aGlzLndobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTt3aG8mIzM5OywgcGFyYW1zLCAmIzM5O3dvcmxkJiMzOTspO1xcbiAgICAgICAgcmV0dXJuIHRoaXM7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gRElWKCYjMzk7SGVsbG8gJiMzOTsgKyBjdHJsLndobyk7XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5TYXZlIHRoaXMgaW50byBhIGZpbGUgPGNvZGU+L212Yy9oZWxsby5qczwvY29kZT4sIGFuZCBvcGVuIDxhIGhyZWY9XFxcIi9kb2MvaGVsbG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0L2hlbGxvczwvYT4sIHRoaXMgd2lsbCBzaG93ICZxdW90O0hlbGxvIHdvcmxkJnF1b3Q7LiBOb3RlIHRoZSAmIzM5O3MmIzM5OyBvbiB0aGUgZW5kIC0gdGhpcyBpcyBkdWUgdG8gaG93IHRoZSA8YSBocmVmPVxcXCIvZG9jLyNyb3V0ZS1ieS1jb252ZW50aW9uLm1kXFxcIj5yb3V0ZSBieSBjb252ZW50aW9uPC9hPiB3b3Jrcy48L3A+XFxuPHA+Tm93IG9wZW4gPGNvZGU+L2NmZy9yb3V0ZXMuanNvbjwvY29kZT4sIGFuZCBhZGQgdGhlIGZvbGxvd2luZyByb3V0ZXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ICAgICZxdW90Oy9oZWxsbyZxdW90OzogeyAmcXVvdDttZXRob2QmcXVvdDs6ICZxdW90O2dldCZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7aGVsbG8mcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfSxcXG4gICAgJnF1b3Q7L2hlbGxvLzp3aG8mcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtnZXQmcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O2hlbGxvJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH1cXG48L2NvZGU+PC9wcmU+XFxuPHA+U2F2ZSB0aGUgZmlsZSwgYW5kIGdvIGJhY2sgdG8gdGhlIGJyb3dzZXIsIGFuZCB5b3UmIzM5O2xsIHNlZSBhbiBlcnJvciEgVGhpcyBpcyBiZWNhdXNlIHdlIGhhdmUgbm93IG92ZXJyaWRkZW4gdGhlIGF1dG9tYXRpYyByb3V0ZS4gT3BlbiA8YSBocmVmPVxcXCIvZG9jL2hlbGxvLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0L2hlbGxvPC9hPiwgYW5kIHlvdSYjMzk7bGwgc2VlIG91ciBhY3Rpb24uIE5vdyBvcGVuIDxhIGhyZWY9XFxcIi9kb2MvWU9VUk5BTUUubWRcXFwiPmh0dHA6Ly9sb2NhbGhvc3QvaGVsbG8vWU9VUk5BTUU8L2E+LCBhbmQgeW91JiMzOTtsbCBzZWUgaXQgZ2V0dGluZyB0aGUgZmlyc3QgcGFyYW1ldGVyLCBhbmQgZ3JlZXRpbmcgeW91ITwvcD5cXG48aDI+PGEgbmFtZT1cXFwicm91dGluZ1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JvdXRpbmdcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Um91dGluZzwvc3Bhbj48L2E+PC9oMj48cD5UaGUgcm91dGluZyBjYW4gYmUgZGVmaW5lZCBpbiBvbmUgb2YgdHdvIHdheXM8L3A+XFxuPGgzPjxhIG5hbWU9XFxcInJvdXRlLWJ5LWNvbnZlbnRpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyb3V0ZS1ieS1jb252ZW50aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJvdXRlIGJ5IGNvbnZlbnRpb248L3NwYW4+PC9hPjwvaDM+PHA+WW91IGNhbiB1c2UgYSBuYW1pbmcgY29udmVudGlvbiBhcyBmb2xsb3dzOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+QWN0aW9uPC90aD5cXG48dGg+TWV0aG9kPC90aD5cXG48dGg+VVJMPC90aD5cXG48dGg+RGVzY3JpcHRpb248L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5pbmRleDwvdGQ+XFxuPHRkPkdFVDwvdGQ+XFxuPHRkPltjb250cm9sbGVyXSArICYjMzk7cyYjMzk7PC90ZD5cXG48dGQ+TGlzdCB0aGUgaXRlbXM8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5lZGl0PC90ZD5cXG48dGQ+R0VUPC90ZD5cXG48dGQ+W2NvbnRyb2xsZXJdL1tpZF08L3RkPlxcbjx0ZD5EaXNwbGF5IGEgZm9ybSB0byBlZGl0IHRoZSBpdGVtPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+bmV3PC90ZD5cXG48dGQ+R0VUPC90ZD5cXG48dGQ+W2NvbnRyb2xsZXJdICsgJiMzOTtzJiMzOTsgKyAmIzM5Oy9uZXcmIzM5OzwvdGQ+XFxuPHRkPkRpc3BsYXkgYSBmb3JtIHRvIGFkZCBhIG5ldyBpdGVtPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG48cD5TYXkgeW91IGhhdmUgYSBtdmMgZmlsZSBuYW1lZCAmcXVvdDt1c2VyLmpzJnF1b3Q7LCBhbmQgeW91IGRlZmluZSBhbiBhY3Rpb24gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHsuLi5cXG48L2NvZGU+PC9wcmU+XFxuPHA+TWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgbWFwIGEgJnF1b3Q7R0VUJnF1b3Q7IHRvICZxdW90Oy91c2VycyZxdW90Oy48YnI+Tm93IHNheSB5b3UgaGF2ZSBhIG12YyBmaWxlIG5hbWVkICZxdW90O3VzZXIuanMmcXVvdDssIGFuZCB5b3UgZGVmaW5lIGFuIGFjdGlvbiBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmVkaXQgPSB7Li4uXFxuPC9jb2RlPjwvcHJlPlxcbjxwPk1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IG1hcCBhICZxdW90O0dFVCZxdW90OyB0byAmcXVvdDsvdXNlci86dXNlcl9pZCZxdW90Oywgc28gdGhhdCB1c2VycyBjYW4gYWNjZXNzIHZpYSBhIHJvdXRlIHN1Y2ggYXMgJnF1b3Q7L3VzZXIvMjcmcXVvdDsgZm9yIHVzZSB3aXRoIElEIG9mIDI3LiA8ZW0+Tm90ZTo8L2VtPiBZb3UgY2FuIGdldCB0aGUgdXNlcl9pZCB1c2luZyBhIG1pc28gdXRpbGl0eTogPGNvZGU+dmFyIHVzZXJJZCA9IG1pc28uZ2V0UGFyYW0oJiMzOTt1c2VyX2lkJiMzOTssIHBhcmFtcyk7PC9jb2RlPi48L3A+XFxuPGgzPjxhIG5hbWU9XFxcInJvdXRlLWJ5LWNvbmZpZ3VyYXRpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyb3V0ZS1ieS1jb25maWd1cmF0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJvdXRlIGJ5IGNvbmZpZ3VyYXRpb248L3NwYW4+PC9hPjwvaDM+PHA+QnkgdXNpbmcgPGNvZGU+L2NmZy9yb3V0ZXMuanNvbjwvY29kZT4gY29uZmlnIGZpbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+e1xcbiAgICAmcXVvdDtbUGF0dGVybl0mcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtbTWV0aG9kXSZxdW90OywgJnF1b3Q7bmFtZSZxdW90OzogJnF1b3Q7W1JvdXRlIG5hbWVdJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O1tBY3Rpb25dJnF1b3Q7IH1cXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPldoZXJlOjwvcD5cXG48dWw+XFxuPGxpPjxzdHJvbmc+UGF0dGVybjwvc3Ryb25nPiAtIHRoZSA8YSBocmVmPVxcXCIvZG9jLyNyb3V0aW5nLXBhdHRlcm5zLm1kXFxcIj5yb3V0ZSBwYXR0ZXJuPC9hPiB3ZSB3YW50LCBpbmNsdWRpbmcgYW55IHBhcmFtZXRlcnM8L2xpPlxcbjxsaT48c3Ryb25nPk1ldGhvZDwvc3Ryb25nPiAtIG9uZSBvZiAmIzM5O0dFVCYjMzk7LCAmIzM5O1BPU1QmIzM5OywgJiMzOTtQVVQmIzM5OywgJiMzOTtERUxFVEUmIzM5OzwvbGk+XFxuPGxpPjxzdHJvbmc+Um91dGU8L3N0cm9uZz4gbmFtZSAtIG5hbWUgb2YgeW91ciByb3V0ZSBmaWxlIGZyb20gL212YzwvbGk+XFxuPGxpPjxzdHJvbmc+QWN0aW9uPC9zdHJvbmc+IC0gbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGNhbGwgb24geW91ciByb3V0ZSBmaWxlIGZyb20gL212YzwvbGk+XFxuPC91bD5cXG48cD48c3Ryb25nPkV4YW1wbGU8L3N0cm9uZz48L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj57XFxuICAgICZxdW90Oy8mcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtnZXQmcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O2hvbWUmcXVvdDssICZxdW90O2FjdGlvbiZxdW90OzogJnF1b3Q7aW5kZXgmcXVvdDsgfVxcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIG1hcCBhICZxdW90O0dFVCZxdW90OyB0byB0aGUgcm9vdCBvZiB0aGUgVVJMIGZvciB0aGUgPGNvZGU+aW5kZXg8L2NvZGU+IGFjdGlvbiBpbiA8Y29kZT5ob21lLmpzPC9jb2RlPjwvcD5cXG48cD48c3Ryb25nPk5vdGU6PC9zdHJvbmc+IFRoZSByb3V0aW5nIGNvbmZpZyB3aWxsIG92ZXJyaWRlIGFueSBhdXRvbWF0aWNhbGx5IGRlZmluZWQgcm91dGVzLCBzbyBpZiB5b3UgbmVlZCBtdWx0aXBsZSByb3V0ZXMgdG8gcG9pbnQgdG8gdGhlIHNhbWUgYWN0aW9uLCB5b3UgbXVzdCBtYW51YWxseSBkZWZpbmUgdGhlbS4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIGEgbXZjIGZpbGUgbmFtZWQgJnF1b3Q7dGVybS5qcyZxdW90OywgYW5kIHlvdSBkZWZpbmUgYW4gYWN0aW9uIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7Li4uXFxuPC9jb2RlPjwvcHJlPlxcbjxwPk1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IG1hcCBhICZxdW90O0dFVCZxdW90OyB0byAmcXVvdDsvdGVybXMmcXVvdDsuIE5vdywgaWYgeW91IHdhbnQgdG8gbWFwIGl0IGFsc28gdG8gJnF1b3Q7L0FHQiZxdW90OywgeW91IHdpbGwgbmVlZCB0byBhZGQgdHdvIGVudHJpZXMgaW4gdGhlIHJvdXRlcyBjb25maWc6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+e1xcbiAgICAmcXVvdDsvdGVybXMmcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtnZXQmcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O3Rlcm1zJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH0sXFxuICAgICZxdW90Oy9BR0ImcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtnZXQmcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O3Rlcm1zJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH1cXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgaXMgYmVjYXVzZSBNaXNvIGFzc3VtZXMgdGhhdCBpZiB5b3Ugb3ZlcnJpZGUgdGhlIGRlZmF1bHRlZCByb3V0ZXMsIHlvdSBhY3R1YWxseSB3YW50IHRvIHJlcGxhY2UgdGhlbSwgbm90IGp1c3Qgb3ZlcnJpZGUgdGhlbS4gPGVtPk5vdGU6PC9lbT4gdGhpcyBpcyBjb3JyZWN0IGJlaGF2aW91ciwgYXMgaXQgbWlub3JpdHkgY2FzZSBpcyB3aGVuIHlvdSB3YW50IG1vcmUgdGhhbiBvbmUgcm91dGUgcG9pbnRpbmcgdG8gdGhlIHNhbWUgYWN0aW9uLjwvcD5cXG48aDM+PGEgbmFtZT1cXFwicm91dGluZy1wYXR0ZXJuc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JvdXRpbmctcGF0dGVybnNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Um91dGluZyBwYXR0ZXJuczwvc3Bhbj48L2E+PC9oMz48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+VHlwZTwvdGg+XFxuPHRoPkV4YW1wbGU8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5QYXRoPC90ZD5cXG48dGQ+JnF1b3Q7L2FiY2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UGF0aCBQYXR0ZXJuPC90ZD5cXG48dGQ+JnF1b3Q7L2FiYz9kJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZCBhbmQgL2FiZDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlBhdGggUGF0dGVybjwvdGQ+XFxuPHRkPiZxdW90Oy9hYitjZCZxdW90OyAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2QsIC9hYmJjZCwgL2FiYmJiYmNkIGFuZCBzbyBvbjwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlBhdGggUGF0dGVybjwvdGQ+XFxuPHRkPiZxdW90Oy9hYipjZCZxdW90OyAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2QsIC9hYnhjZCwgL2FiRk9PY2QsIC9hYmJBcmNkIGFuZCBzbyBvbjwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlBhdGggUGF0dGVybjwvdGQ+XFxuPHRkPiZxdW90Oy9hKGJjKT9kJnF1b3Q7IC0gd2lsbCBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hZCBhbmQgL2FiY2Q8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5SZWd1bGFyIEV4cHJlc3Npb248L3RkPlxcbjx0ZD4vXFxcXC9hYmMmIzEyNDtcXFxcL3h5ei8gLSB3aWxsIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiYyBhbmQgL3h5ejwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPkFycmF5PC90ZD5cXG48dGQ+WyZxdW90Oy9hYmNkJnF1b3Q7LCAmcXVvdDsveHl6YSZxdW90OywgL1xcXFwvbG1uJiMxMjQ7XFxcXC9wcXIvXSAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2QsIC94eXphLCAvbG1uLCBhbmQgL3BxcjwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPGgzPjxhIG5hbWU9XFxcImxpbmtzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbGlua3NcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TGlua3M8L3NwYW4+PC9hPjwvaDM+PHA+V2hlbiB5b3UgY3JlYXRlIGxpbmtzLCBpbiBvcmRlciB0byBnZXQgdGhlIGFwcCB0byB3b3JrIGFzIGFuIFNQQSwgeW91IG11c3QgcGFzcyBpbiBtLnJvdXRlIGFzIGEgY29uZmlnLCBzbyB0aGF0IHRoZSBoaXN0b3J5IHdpbGwgYmUgdXBkYXRlZCBjb3JyZWN0bHksIGZvciBleGFtcGxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkEoe2hyZWY6JnF1b3Q7L3VzZXJzL25ldyZxdW90OywgY29uZmlnOiBtLnJvdXRlfSwgJnF1b3Q7QWRkIG5ldyB1c2VyJnF1b3Q7KVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgY29ycmVjdGx5IHdvcmsgYXMgYSBTUEEuIElmIHlvdSBsZWF2ZSBvdXQgPGNvZGU+Y29uZmlnOiBtLnJvdXRlPC9jb2RlPiwgdGhlIGFwcCB3aWxsIHN0aWxsIHdvcmssIGJ1dCB0aGUgcGFnZSB3aWxsIHJlbG9hZCBldmVyeSB0aW1lIHRoZSBsaW5rIGlzIGZvbGxvd2VkLjwvcD5cXG48cD5Ob3RlOiBpZiB5b3UgYXJlIHBsYW5uaW5nIHRvIG1hbnVhbGx5IHJvdXRlLCBpZTogdXNlIDxjb2RlPm0ucm91dGU8L2NvZGU+LCBiZSBzdXJlIHRvIHVzZSB0aGUgbmFtZSBvZiB0aGUgcm91dGUsIG5vdCBhIFVSTC4gSWU6IGlmIHlvdSBoYXZlIGEgcm91dGUgJnF1b3Q7L2FjY291bnQmcXVvdDssIHVzaW5nIDxjb2RlPm0ucm91dGUoJnF1b3Q7aHR0cDovL3AxLmlvL2FjY291bnQmcXVvdDspPC9jb2RlPiB3b24mIzM5O3QgbWF0Y2gsIG1pdGhyaWwgaXMgZXhwZWN0aW5nIDxjb2RlPm0ucm91dGUoJnF1b3Q7L2FjY291bnQmcXVvdDspPC9jb2RlPiBpbnN0ZWFkIG9mIHRoZSBmdWxsIFVSTC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImRhdGEtbW9kZWxzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZGF0YS1tb2RlbHNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RGF0YSBtb2RlbHM8L3NwYW4+PC9hPjwvaDI+PHA+RGF0YSBtb2RlbHMgYXJlIHByb2dyZXNzaXZlbHkgZW5oYW5jZWQgbWl0aHJpbCBtb2RlbHMgLSB5b3Ugc2ltcGx5IGNyZWF0ZSB5b3VyIG1vZGVsIGFzIHVzdWFsLCB0aGVuIGFkZCB2YWxpZGF0aW9uIGFuZCB0eXBlIGluZm9ybWF0aW9uIGFzIGl0IGJlY29tZXMgcGVydGluZW50LlxcbkZvciBleGFtcGxlLCBzYXkgeW91IGhhdmUgYSBtb2RlbCBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciB1c2VyTW9kZWwgPSBmdW5jdGlvbihkYXRhKXtcXG4gICAgdGhpcy5uYW1lID0gbS5wKGRhdGEubmFtZXx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5lbWFpbCA9IG0ucChkYXRhLmVtYWlsfHwmcXVvdDsmcXVvdDspO1xcbiAgICB0aGlzLmlkID0gbS5wKGRhdGEuX2lkfHwmcXVvdDsmcXVvdDspO1xcbiAgICByZXR1cm4gdGhpcztcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkluIG9yZGVyIHRvIG1ha2UgaXQgdmFsaWRhdGFibGUsIGFkZCB0aGUgdmFsaWRhdG9yIG1vZHVsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgdmFsaWRhdGUgPSByZXF1aXJlKCYjMzk7dmFsaWRhdG9yLm1vZGVsYmluZGVyJiMzOTspO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIGFkZCBhIDxjb2RlPmlzVmFsaWQ8L2NvZGU+IHZhbGlkYXRpb24gbWV0aG9kIHRvIHlvdXIgbW9kZWwsIHdpdGggYW55IGRlY2xhcmF0aW9ucyBiYXNlZCBvbiA8YSBocmVmPVxcXCIvZG9jL3ZhbGlkYXRvci5qcyN2YWxpZGF0b3JzLm1kXFxcIj5ub2RlIHZhbGlkYXRvcjwvYT46PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIHVzZXJNb2RlbCA9IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICB0aGlzLm5hbWUgPSBtLnAoZGF0YS5uYW1lfHwmcXVvdDsmcXVvdDspO1xcbiAgICB0aGlzLmVtYWlsID0gbS5wKGRhdGEuZW1haWx8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuaWQgPSBtLnAoZGF0YS5faWR8fCZxdW90OyZxdW90Oyk7XFxuXFxuICAgIC8vICAgIFZhbGlkYXRlIHRoZSBtb2RlbCAgICAgICAgXFxuICAgIHRoaXMuaXNWYWxpZCA9IHZhbGlkYXRlLmJpbmQodGhpcywge1xcbiAgICAgICAgbmFtZToge1xcbiAgICAgICAgICAgIGlzUmVxdWlyZWQ6ICZxdW90O1lvdSBtdXN0IGVudGVyIGEgbmFtZSZxdW90O1xcbiAgICAgICAgfSxcXG4gICAgICAgIGVtYWlsOiB7XFxuICAgICAgICAgICAgaXNSZXF1aXJlZDogJnF1b3Q7WW91IG11c3QgZW50ZXIgYW4gZW1haWwgYWRkcmVzcyZxdW90OyxcXG4gICAgICAgICAgICBpc0VtYWlsOiAmcXVvdDtNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzcyZxdW90O1xcbiAgICAgICAgfVxcbiAgICB9KTtcXG5cXG4gICAgcmV0dXJuIHRoaXM7XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBjcmVhdGVzIGEgbWV0aG9kIHRoYXQgdGhlIG1pc28gZGF0YWJhc2UgYXBpIGNhbiB1c2UgdG8gdmFsaWRhdGUgeW91ciBtb2RlbC5cXG5Zb3UgZ2V0IGZ1bGwgYWNjZXNzIHRvIHRoZSB2YWxpZGF0aW9uIGluZm8gYXMgd2VsbCwgc28geW91IGNhbiBzaG93IGFuIGVycm9yIG1lc3NhZ2UgbmVhciB5b3VyIGZpZWxkLCBmb3IgZXhhbXBsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj51c2VyLmlzVmFsaWQoJiMzOTtlbWFpbCYjMzk7KVxcbjwvY29kZT48L3ByZT5cXG48cD5XaWxsIHJldHVybiA8Y29kZT50cnVlPC9jb2RlPiBpZiB0aGUgPGNvZGU+ZW1haWw8L2NvZGU+IHByb3BlcnR5IG9mIHlvdXIgdXNlciBtb2RlbCBpcyB2YWxpZCwgb3IgYSBsaXN0IG9mIGVycm9ycyBtZXNzYWdlcyBpZiBpdCBpcyBpbnZhbGlkOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPlsmcXVvdDtZb3UgbXVzdCBlbnRlciBhbiBlbWFpbCBhZGRyZXNzJnF1b3Q7LCAmcXVvdDtNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzcyZxdW90O11cXG48L2NvZGU+PC9wcmU+XFxuPHA+U28geW91IGNhbiBmb3IgZXhhbXBsZSBhZGQgYSBjbGFzcyBuYW1lIHRvIGEgZGl2IHN1cnJvdW5kaW5nIHlvdXIgZmllbGQgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5ESVYoe2NsYXNzOiAoY3RybC51c2VyLmlzVmFsaWQoJiMzOTtlbWFpbCYjMzk7KSA9PSB0cnVlPyAmcXVvdDt2YWxpZCZxdW90OzogJnF1b3Q7aW52YWxpZCZxdW90Oyl9LCBbLi4uXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFuZCBzaG93IHRoZSBlcnJvciBtZXNzYWdlcyBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPlNQQU4oY3RybC51c2VyLmlzVmFsaWQoJiMzOTtlbWFpbCYjMzk7KSA9PSB0cnVlPyAmcXVvdDsmcXVvdDs6IGN0cmwudXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5Oykuam9pbigmcXVvdDssICZxdW90OykpXFxuPC9jb2RlPjwvcHJlPlxcbjxoMj48YSBuYW1lPVxcXCJkYXRhYmFzZS1hcGktYW5kLW1vZGVsLWludGVyYWN0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZGF0YWJhc2UtYXBpLWFuZC1tb2RlbC1pbnRlcmFjdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5EYXRhYmFzZSBhcGkgYW5kIG1vZGVsIGludGVyYWN0aW9uPC9zcGFuPjwvYT48L2gyPjxwPk1pc28gdXNlcyB0aGUgbW9kZWwgZGVmaW5pdGlvbnMgdGhhdCB5b3UgZGVjbGFyZSBpbiB5b3VyIDxjb2RlPm12YzwvY29kZT4gZmlsZSB0byBidWlsZCB1cCBhIHNldCBvZiBtb2RlbHMgdGhhdCB0aGUgQVBJIGNhbiB1c2UsIHRoZSBtb2RlbCBkZWZpbml0aW9ucyB3b3JrIGxpa2UgdGhpczo8L3A+XFxuPHVsPlxcbjxsaT5PbiB0aGUgbW9kZWxzIGF0dHJpYnV0ZSBvZiB0aGUgbXZjLCB3ZSAgZGVmaW5lIGEgc3RhbmRhcmQgbWl0aHJpbCBkYXRhIG1vZGVsLCAoaWU6IGEgamF2YXNjcmlwdCBvYmplY3Qgd2hlcmUgcHJvcGVydGllcyBjYW4gYmUgZWl0aGVyIHN0YW5kYXJkIGphdmFzY3JpcHQgZGF0YSB0eXBlcywgb3IgYSBmdW5jdGlvbiB0aGF0IHdvcmtzIGFzIGEgZ2V0dGVyL3NldHRlciwgZWc6IDxjb2RlPm0ucHJvcDwvY29kZT4pPC9saT5cXG48bGk+T24gc2VydmVyIHN0YXJ0dXAsIG1pc28gcmVhZHMgdGhpcyBhbmQgY3JlYXRlcyBhIGNhY2hlIG9mIHRoZSBtb2RlbCBvYmplY3RzLCBpbmNsdWRpbmcgdGhlIG5hbWUgc3BhY2Ugb2YgdGhlIG1vZGVsLCBlZzogJnF1b3Q7aGVsbG8uZWRpdC5oZWxsbyZxdW90OzwvbGk+XFxuPGxpPk1vZGVscyBjYW4gb3B0aW9uYWxseSBpbmNsdWRlIGRhdGEgdmFsaWRhdGlvbiBpbmZvcm1hdGlvbiwgYW5kIHRoZSBkYXRhYmFzZSBhcGkgd2lsbCBnZXQgYWNjZXNzIHRvIHRoaXMuPC9saT5cXG48L3VsPlxcbjxwPkFzc3VtaW5nIHdlIGhhdmUgYSBtb2RlbCBpbiB0aGUgaGVsbG8ubW9kZWxzIG9iamVjdCBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICB0aGlzLmlzVmFsaWQgPSB2YWxpZGF0ZS5iaW5kKHRoaXMsIHtcXG4gICAgICAgIHdobzoge1xcbiAgICAgICAgICAgIGlzUmVxdWlyZWQ6ICZxdW90O1lvdSBtdXN0IGtub3cgd2hvIHlvdSBhcmUgdGFsa2luZyB0byZxdW90O1xcbiAgICAgICAgfVxcbiAgICB9KTtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZSBBUEkgd29ya3MgbGlrZSB0aGlzOjwvcD5cXG48dWw+XFxuPGxpPldlIGNyZWF0ZSBhbiBlbmRwb2ludCBhdCA8Y29kZT4vYXBpPC9jb2RlPiB3aGVyZSBlYWNoIHdlIGxvYWQgd2hhdGV2ZXIgYXBpIGlzIGNvbmZpZ3VyZWQgaW4gPGNvZGU+L2NmZy9zZXJ2ZXIuanNvbjwvY29kZT4sIGFuZCBleHBvc2UgZWFjaCBtZXRob2QuIEZvciBleGFtcGxlIDxjb2RlPi9hcGkvc2F2ZTwvY29kZT4gaXMgYXZhaWxhYmxlIGZvciB0aGUgZGVmYXVsdCA8Y29kZT5mbGF0ZmlsZWRiPC9jb2RlPiBhcGkuPC9saT5cXG48bGk+TmV4dCB3ZSBjcmVhdGUgYSBzZXQgb2YgQVBJIGZpbGVzIC0gb25lIGZvciBjbGllbnQsICgvc3lzdGVtL2FwaS5jbGllbnQuanMpLCBhbmQgb25lIGZvciBzZXJ2ZXIgKC9zeXN0ZW0vYXBpLnNlcnZlci5qcykgLSBlYWNoIGhhdmUgdGhlIHNhbWUgbWV0aG9kcywgYnV0IGRvIHZhc3RseSBkaWZmZXJlbnQgdGhpbmdzOjx1bD5cXG48bGk+YXBpLmNsaWVudC5qcyBpcyBhIHRoaW4gd3JhcHBlciB0aGF0IHVzZXMgbWl0aHJpbCYjMzk7cyBtLnJlcXVlc3QgdG8gY3JlYXRlIGFuIGFqYXggcmVxdWVzdCB0byB0aGUgc2VydmVyIEFQSSwgaXQgc2ltcGx5IHBhc3NlcyBtZXNzYWdlcyBiYWNrIGFuZCBmb3J0aCAoaW4gSlNPTiBSUEMgMi4wIGZvcm1hdCkuPC9saT5cXG48bGk+YXBpLnNlcnZlci5qcyBjYWxscyB0aGUgZGF0YWJhc2UgYXBpIG1ldGhvZHMsIHdoaWNoIGluIHR1cm4gaGFuZGxlcyBtb2RlbHMgYW5kIHZhbGlkYXRpb24gc28gZm9yIGV4YW1wbGUgd2hlbiBhIHJlcXVlc3QgaXMgbWFkZSBhbmQgYSA8Y29kZT50eXBlPC9jb2RlPiBhbmQgPGNvZGU+bW9kZWw8L2NvZGU+IGlzIGluY2x1ZGVkLCB3ZSBjYW4gcmUtY29uc3RydWN0IHRoZSBkYXRhIG1vZGVsIGJhc2VkIG9uIHRoaXMgaW5mbywgZm9yIGV4YW1wbGUgeW91IG1pZ2h0IHNlbmQ6IHt0eXBlOiAmIzM5O2hlbGxvLmVkaXQuaGVsbG8mIzM5OywgbW9kZWw6IHt3aG86ICYjMzk7RGF2ZSYjMzk7fX0sIHRoaXMgY2FuIHRoZW4gYmUgY2FzdCBiYWNrIGludG8gYSBtb2RlbCB0aGF0IHdlIGNhbiBjYWxsIHRoZSA8Y29kZT5pc1ZhbGlkPC9jb2RlPiBtZXRob2Qgb24uPC9saT5cXG48L3VsPlxcbjwvbGk+XFxuPC91bD5cXG48cD48c3Ryb25nPk5vdywgdGhlIGltcG9ydGFudCBiaXQ6PC9zdHJvbmc+IFRoZSByZWFzb24gZm9yIGFsbCB0aGlzIGZ1bmN0aW9uYWxpdHkgaXMgdGhhdCBtaXRocmlsIGludGVybmFsbHkgZGVsYXlzIHJlbmRlcmluZyB0byB0aGUgRE9NIHdoaWxzdCBhIHJlcXVlc3QgaXMgZ29pbmcgb24sIHNvIHdlIG5lZWQgdG8gaGFuZGxlIHRoaXMgd2l0aGluIG1pc28gLSBpbiBvcmRlciB0byBiZSBhYmxlIHRvIHJlbmRlciB0aGluZ3Mgb24gdGhlIHNlcnZlciAtIHNvIHdlIGhhdmUgYSBiaW5kaW5nIHN5c3RlbSB0aGF0IGRlbGF5cyByZW5kZXJpbmcgd2hpbHN0IGFuIGFzeW5jIHJlcXVlc3QgaXMgc3RpbGwgYmVpbmcgZXhlY3V0ZWQuIFRoYXQgbWVhbnMgbWl0aHJpbC1saWtlIGNvZGUgbGlrZSB0aGlzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XFxuICAgIHZhciBjdHJsID0gdGhpcztcXG4gICAgYXBpLmZpbmQoe3R5cGU6ICYjMzk7aGVsbG8uaW5kZXguaGVsbG8mIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xcbiAgICAgICAgdmFyIGxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgICAgIHZhciBteUhlbGxvID0gZGF0YS5yZXN1bHRba2V5XTtcXG4gICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLmhlbGxvKG15SGVsbG8pO1xcbiAgICAgICAgfSk7XFxuICAgICAgICBjdHJsLm1vZGVsID0gbmV3IGN0cmwudm0udG9kb0xpc3QobGlzdCk7XFxuICAgIH0pO1xcbiAgICByZXR1cm4gY3RybDtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPldpbGwgc3RpbGwgd29yay4gTm90ZTogdGhlIG1hZ2ljIGhlcmUgaXMgdGhhdCB0aGVyZSBpcyBhYnNvbHV0ZWx5IG5vdGhpbmcgaW4gdGhlIGNvZGUgYWJvdmUgdGhhdCBydW5zIGEgY2FsbGJhY2sgdG8gbGV0IG1pdGhyaWwga25vdyB0aGUgZGF0YSBpcyByZWFkeSAtIHRoaXMgaXMgYSBkZXNpZ24gZmVhdHVyZSBvZiBtaXRocmlsIHRvIGRlbGF5IHJlbmRlcmluZyBhdXRvbWF0aWNhbGx5IHdoaWxzdCBhbiA8Y29kZT5tLnJlcXVlc3Q8L2NvZGU+IGlzIGluIHByb2dyZXNzLCBzbyB3ZSBjYXRlciBmb3IgdGhpcyB0byBoYXZlIHRoZSBhYmlsaXR5IHRvIHJlbmRlciB0aGUgcGFnZSBzZXJ2ZXItc2lkZSBmaXJzdCwgc28gdGhhdCBTRU8gd29ya3Mgb3V0IG9mIHRoZSBib3guPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJjbGllbnQtdnMtc2VydmVyLWNvZGVcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjbGllbnQtdnMtc2VydmVyLWNvZGVcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q2xpZW50IHZzIHNlcnZlciBjb2RlPC9zcGFuPjwvYT48L2gyPjxwPkluIG1pc28sIHlvdSBpbmNsdWRlIGZpbGVzIHVzaW5nIHRoZSBzdGFuZGFyZCBub2RlanMgPGNvZGU+cmVxdWlyZTwvY29kZT4gZnVuY3Rpb24uIFdoZW4geW91IG5lZWQgdG8gZG8gc29tZXRoaW5nIHRoYXQgd29ya3MgZGlmZmVyZW50bHkgaW4gdGhlIGNsaWVudCB0aGFuIHRoZSBzZXJ2ZXIsIHRoZXJlIGFyZSBhIGZldyB3YXlzIHlvdSBjYW4gYWNoaWV2ZSBpdDo8L3A+XFxuPHVsPlxcbjxsaT5UaGUgcmVjb21tZW5kZWQgd2F5IGlzIHRvIGNyZWF0ZSBhbmQgcmVxdWlyZSBhIGZpbGUgaW4gdGhlIDxjb2RlPm1vZHVsZXMvPC9jb2RlPiBkaXJlY3RvcnksIGFuZCB0aGVuIGNyZWF0ZSB0aGUgc2FtZSBmaWxlIHdpdGggYSAmcXVvdDsuY2xpZW50JnF1b3Q7IGJlZm9yZSB0aGUgZXh0ZW5zaW9uLCBhbmQgbWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgbG9hZCB0aGF0IGZpbGUgZm9yIHlvdSBvbiB0aGUgY2xpZW50IHNpZGUgaW5zdGVhZC4gRm9yIGV4YW1wbGUgaWYgeW91IGhhdmUgPGNvZGU+L21vZHVsZXMvc29tZXRoaW5nLmpzPC9jb2RlPiwgaWYgeW91IGNyZWF0ZSA8Y29kZT4vbW9kdWxlcy9zb21ldGhpbmcuY2xpZW50LmpzPC9jb2RlPiwgbWlzbyB3aWxsIGF1dG9tYXRpY2FsbHkgdXNlIHRoYXQgb24gdGhlIGNsaWVudC48L2xpPlxcbjxsaT5Bbm90aGVyIG9wdGlvbiBpcyB0byB1c2UgPGNvZGU+bWlzby51dGlsPC9jb2RlPiAtIHlvdSBjYW4gdXNlIDxjb2RlPm1pc28udXRpbC5pc1NlcnZlcigpPC9jb2RlPiB0byB0ZXN0IGlmIHlvdSYjMzk7cmUgb24gdGhlIHNlcnZlciBvciBub3QsIHRob3VnaCBpdCBpcyBiZXR0ZXIgcHJhY3RpY2UgdG8gdXNlIHRoZSAmcXVvdDsuY2xpZW50JnF1b3Q7IG1ldGhvZCBtZW50aW9uZWQgYWJvdmUgLSBvbmx5IHVzZSA8Y29kZT5pc1NlcnZlcjwvY29kZT4gaWYgeW91IGFic29sdXRlbHkgaGF2ZSBubyBvdGhlciBvcHRpb24uPC9saT5cXG48L3VsPlxcbjxoMj48YSBuYW1lPVxcXCJmaXJzdC1wYWdlLWxvYWRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNmaXJzdC1wYWdlLWxvYWRcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Rmlyc3QgcGFnZSBsb2FkPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gYSBuZXcgdXNlciBlbnRlcnMgeW91ciBzaXRlIHZpYSBhIFVSTCwgYW5kIG1pc28gbG9hZHMgdGhlIGZpcnN0IHBhZ2UsIGEgbnVtYmVyIG9mIHRoaW5ncyBoYXBwZW46PC9wPlxcbjx1bD5cXG48bGk+VGhlIHNlcnZlciBnZW5lcmF0ZXMgdGhlIHBhZ2UsIGluY2x1ZGluZyBhbnkgZGF0YSB0aGUgdXNlciBtaWdodCBoYXZlIGFjY2VzcyB0by4gVGhpcyBpcyBtYWlubHkgZm9yIFNFTyBwdXJwb3NlcywgYnV0IGFsc28gdG8gbWFrZSB0aGUgcGVyY2VwdGlibGUgbG9hZGluZyB0aW1lIGxlc3MsIHBsdXMgcHJvdmlkZSBiZWF1dGlmdWwgdXJscyBvdXQgb2YgdGhlIGJveC4gPC9saT5cXG48bGk+T25jZSB0aGUgcGFnZSBoYXMgbG9hZGVkLCBtaXRocmlsIGtpY2tzIGluIGFuZCBjcmVhdGVzIGEgWEhSIChhamF4KSByZXF1ZXN0IHRvIHJldHJlaXZlIHRoZSBkYXRhLCBhbmQgc2V0dXAgYW55IGV2ZW50cyBhbmQgdGhlIHZpcnR1YWwgRE9NLCBldGMuPC9saT5cXG48L3VsPlxcbjxwPk5vdyB5b3UgbWlnaHQgYmUgdGhpbmtpbmc6IHdlIGRvbiYjMzk7dCByZWFsbHkgbmVlZCB0aGF0IDJuZCByZXF1ZXN0IGZvciBkYXRhIC0gaXQmIzM5O3MgYWxyZWFkeSBpbiB0aGUgcGFnZSwgcmlnaHQ/IFdlbGwsIHNvcnQgb2YgLSB5b3Ugc2VlIG1pc28gZG9lcyBub3QgbWFrZSBhbnkgYXNzdW1wdGlvbnMgYWJvdXQgdGhlIHN0cnVjdHVyZSBvZiB5b3VyIGRhdGEsIG9yIGhvdyB5b3Ugd2FudCB0byB1c2UgaXQgaW4geW91ciBtb2RlbHMsIHNvIHRoZXJlIGlzIG5vIHdheSBmb3IgdXMgdG8gcmUtdXNlIHRoYXQgZGF0YSwgYXMgaXQgY291bGQgYmUgYW55IHN0cnVjdHVyZS5cXG5Bbm90aGVyIGtleSBmZWF0dXJlIG9mIG1pc28gaXMgdGhlIGZhY3QgdGhhdCBhbGwgYWN0aW9ucyBjYW4gYmUgYm9va21hcmthYmxlIC0gZm9yIGV4YW1wbGUgdGhlIDxhIGhyZWY9XFxcIi9kb2MvdXNlcnMubWRcXFwiPi91c2VyczwvYT4gYXBwIC0gY2xpY2sgb24gYSB1c2VyLCBhbmQgc2VlIHRoZSB1cmwgY2hhbmdlIC0gd2UgZGlkbiYjMzk7dCBkbyBhbm90aGVyIHNlcnZlciByb3VuZC10cmlwLCBidXQgcmF0aGVyIGp1c3QgYSBYSFIgcmVxdWVzdCB0aGF0IHJldHVybmVkIHRoZSBkYXRhIHdlIHJlcXVpcmVkIC0gdGhlIFVJIHdhcyBjb21wbGV0ZWx5IHJlbmRlcmVkIGNsaWVudCBzaWRlIC0gc28gaXQmIzM5O3MgcmVhbGx5IG9uIHRoYXQgZmlyc3QgdGltZSB3ZSBsb2FkIHRoZSBwYWdlIHRoYXQgeW91IGVuZCB1cCBsb2FkaW5nIHRoZSBkYXRhIHR3aWNlLjwvcD5cXG48cD5TbyB0aGF0IGlzIHRoZSByZWFzb24gdGhlIGFyY2hpdGVjdHVyZSB3b3JrcyB0aGUgd2F5IGl0IGRvZXMsIGFuZCBoYXMgdGhhdCBzZWVtaW5nbHkgcmVkdW5kYW50IDJuZCByZXF1ZXN0IGZvciB0aGUgZGF0YSAtIGl0IGlzIGEgc21hbGwgcHJpY2UgdG8gcGF5IGZvciBTRU8sIGFuZCBwZXJjZXB0aWJseSBxdWljayBsb2FkaW5nIHBhZ2VzIGFuZCBhcyBtZW50aW9uZWQsIGl0IG9ubHkgZXZlciBoYXBwZW5zIG9uIHRoZSBmaXJzdCBwYWdlIGxvYWQuPC9wPlxcbjxwPk9mIGNvdXJzZSB5b3UgY291bGQgaW1wbGVtZW50IGNhY2hpbmcgb2YgdGhlIGRhdGEgeW91cnNlbGYsIGlmIHRoZSAybmQgcmVxdWVzdCBpcyBhbiBpc3N1ZSAtIGFmdGVyIGFsbCB5b3UgbWlnaHQgYmUgbG9hZGluZyBxdWl0ZSBhIGJpdCBvZiBkYXRhLiBPbmUgd2F5IHRvIGRvIHRoaXMgd291bGQgYmUgbGlrZSBzbyAod2FybmluZzogcmF0aGVyIGNvbnRyaXZlZCBleGFtcGxlIGZvbGxvd3MpOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vbW9kdWxlcy9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgZGIgPSByZXF1aXJlKCYjMzk7Li4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2FwaS5zZXJ2ZXIuanMmIzM5OykobSk7XFxuXFxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgICAgIHdobyA9IG1pc28uZ2V0UGFyYW0oJiMzOTtoZWxsb19pZCYjMzk7LCBwYXJhbXMpO1xcblxcbiAgICAgICAgLy8gICAgQ2hlY2sgaWYgb3VyIGRhdGEgaXMgYXZhaWxhYmxlLCBpZiBzbzogdXNlIGl0LlxcbiAgICAgICAgaWYodHlwZW9mIG15UGVyc29uICE9PSAmcXVvdDt1bmRlZmluZWQmcXVvdDspIHtcXG4gICAgICAgICAgICBjdHJsLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IG15UGVyc29ufSk7XFxuICAgICAgICB9IGVsc2Uge1xcbiAgICAgICAgLy8gICAgSWYgbm90LCBsb2FkIGl0IGZpcnN0LlxcbiAgICAgICAgICAgIGRiLmZpbmQoe3R5cGU6ICYjMzk7dXNlci5lZGl0LnVzZXImIzM5O30pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xcbiAgICAgICAgICAgICAgICBjdHJsLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IGRhdGEucmVzdWx0WzBdLm5hbWV9KTtcXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIC8vICAgIEFkZCBhIGNsaWVudCBzaWRlIGdsb2JhbCB2YXJpYWJsZSB3aXRoIG91ciBkYXRhXFxuICAgICAgICAgICAgICAgIFNDUklQVCgmcXVvdDt2YXIgbXlQZXJzb24gPSAmIzM5OyZxdW90OyArIGN0cmwubW9kZWwud2hvKCkgKyAmcXVvdDsmIzM5OyZxdW90OyksXFxuICAgICAgICAgICAgICAgIERJVigmcXVvdDtHJiMzOTtkYXkgJnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSlcXG4gICAgICAgICAgICBdXFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5TbyB0aGlzIHdpbGwgb25seSBsb2FkIHRoZSBkYXRhIG9uIHRoZSBzZXJ2ZXIgc2lkZSAtIGFzIHlvdSBjYW4gc2VlLCB3ZSBuZWVkIHRvIGtub3cgdGhlIHNoYXBlIG9mIHRoZSBkYXRhIHRvIHVzZSBpdCwgYW5kIHdlIGFyZSB1c2luZyBhIGdsb2JhbCB2YXJpYWJsZSBoZXJlIHRvIHN0b3JlIHRoZSBkYXRhIGNsaWVudCBzaWRlIC0gSSBkb24mIzM5O3QgcmVhbGx5IHJlY29tbWVuZCB0aGlzIGFwcHJvYWNoLCBhcyBpdCBzZWVtcyBsaWtlIGEgbG90IG9mIHdvcmsgdG8gc2F2ZSBhIHNpbmdsZSBYSFIgcmVxdWVzdC4gSG93ZXZlciBJIHVuZGVyc3RhbmQgeW91IG1pZ2h0IGhhdmUgdW5pcXVlIGNpcmN1bXN0YW5jZXMgd2hlcmUgdGhlIGZpcnN0IGRhdGEgbG9hZCBjb3VsZCBiZSBhIHByb2JsZW0sIHNvIGF0IGxlYXN0IHRoaXMgaXMgYW4gb3B0aW9uIHlvdSBjYW4gdXNlIHRvIGNhY2hlIHRoZSBkYXRhIG9uIGZpcnN0IHBhZ2UgbG9hZC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcInJlcXVpcmluZy1maWxlc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3JlcXVpcmluZy1maWxlc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5SZXF1aXJpbmcgZmlsZXM8L3NwYW4+PC9hPjwvaDI+PHA+V2hlbiByZXF1aXJpbmcgZmlsZXMsIGJlIHN1cmUgdG8gZG8gc28gaW4gYSBzdGF0aWMgbWFubmVyIHNvIHRoYXQgYnJvd3NlcmlmeSBpcyBhYmxlIHRvIGNvbXBpbGUgdGhlIGNsaWVudCBzaWRlIHNjcmlwdC4gQWx3YXlzIHVzZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspO1xcbjwvY29kZT48L3ByZT5cXG48cD5ORVZFUiBETyBBTlkgT0YgVEhFU0U6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Ly8gIERPTiYjMzk7VCBETyBUSElTIVxcbnZhciBtaXNvID0gbmV3IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgY3JlYXRlIGFuIG9iamVjdCwgd2hpY2ggbWVhbnMgPGEgaHJlZj1cXFwiL2RvYy84MjQubWRcXFwiPmJyb3dzZXJpZnkgY2Fubm90IHJlc29sdmUgaXQgc3RhdGljYWxseTwvYT4sIGFuZCB3aWxsIGlnbm9yZSBpdC48L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4vLyAgRE9OJiMzOTtUIERPIFRISVMhXFxudmFyIHRoaW5nID0gJiMzOTttaXNvJiMzOTs7XFxudmFyIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyLyYjMzk7K3RoaW5nKyYjMzk7LnV0aWwuanMmIzM5Oyk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBjcmVhdGUgYW4gZXhwcmVzc2lvbiwgd2hpY2ggbWVhbnMgPGEgaHJlZj1cXFwiL2RvYy84MjQubWRcXFwiPmJyb3dzZXJpZnkgY2Fubm90IHJlc29sdmUgaXQgc3RhdGljYWxseTwvYT4sIGFuZCB3aWxsIGlnbm9yZSBpdC48L3A+XFxuXCIsXCJQYXR0ZXJucy5tZFwiOlwiPHA+VGhlcmUgYXJlIHNldmVyYWwgd2F5cyB5b3UgY2FuIHdyaXRlIHlvdXIgYXBwIGFuZCBtaXNvIGlzIG5vdCBvcGluaW9uYXRlZCBhYm91dCBob3cgeW91IGdvIGFib3V0IHRoaXMgc28gaXQgaXMgaW1wb3J0YW50IHRoYXQgeW91IGNob29zZSBhIHBhdHRlcm4gdGhhdCBzdWl0cyB5b3VyIG5lZWRzLiBCZWxvdyBhcmUgYSBmZXcgc3VnZ2VzdGVkIHBhdHRlcm5zIHRvIGZvbGxvdyB3aGVuIGRldmVsb3BpbmcgYXBwcy48L3A+XFxuPHA+PHN0cm9uZz5Ob3RlOjwvc3Ryb25nPiBtaXNvIGlzIGEgc2luZ2xlIHBhZ2UgYXBwIHRoYXQgbG9hZHMgc2VydmVyIHJlbmRlcmVkIEhUTUwgZnJvbSBhbnkgVVJMLCBzbyB0aGF0IFNFTyB3b3JrcyBvdXQgb2YgdGhlIGJveC48L3A+XFxuPGgyPjxhIG5hbWU9XFxcInNpbmdsZS11cmwtbXZjXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjc2luZ2xlLXVybC1tdmNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+U2luZ2xlIHVybCBtdmM8L3NwYW4+PC9hPjwvaDI+PHA+SW4gdGhpcyBwYXR0ZXJuIGV2ZXJ5dGhpbmcgdGhhdCB5b3VyIG12YyBuZWVkcyB0byBkbyBpcyBkb25lIG9uIGEgc2luZ2xlIHVybCBmb3IgYWxsIHRoZSBhc3NvY2lhdGVkIGFjdGlvbnMuIFRoZSBhZHZhbnRhZ2UgZm9yIHRoaXMgc3R5bGUgb2YgZGV2ZWxvcG1lbnQgaXMgdGhhdCB5b3UgaGF2ZSBldmVyeXRoaW5nIGluIG9uZSBtdmMgY29udGFpbmVyLCBhbmQgeW91IGRvbiYjMzk7dCBuZWVkIHRvIG1hcCBhbnkgcm91dGVzIC0gb2YgY291cnNlIHRoZSBkb3duc2lkZSBiZWluZyB0aGF0IHRoZXJlIGFyZSBubyByb3V0ZXMgZm9yIHRoZSB1c2VyIHRvIGJvb2ttYXJrLiBUaGlzIGlzIHBhdHRlcm4gd29ya3Mgd2VsbCBmb3Igc21hbGxlciBlbnRpdGllcyB3aGVyZSB0aGVyZSBhcmUgbm90IHRvbyBtYW55IGludGVyYWN0aW9ucyB0aGF0IHRoZSB1c2VyIGNhbiBkbyAtIHRoaXMgaXMgZXNzZW50aWFsbHkgaG93IG1vc3QgbWl0aHJpbCBhcHBzIGFyZSB3cml0dGVuIC0gc2VsZi1jb250YWluZWQsIGFuZCBhdCBhIHNpbmdsZSB1cmwuPC9wPlxcbjxwPkhlcmUgaXMgYSAmcXVvdDtoZWxsbyB3b3JsZCZxdW90OyBleGFtcGxlIHVzaW5nIHRoZSBzaW5nbGUgdXJsIHBhdHRlcm48L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuc3VnYXJ0YWdzLm5vZGUuanMmIzM5OykobSk7XFxuXFxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICAvLyAgICBPdXIgbW9kZWxcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBzZWxmLm1vZGVscy5oZWxsbyh7d2hvOiAmcXVvdDt3b3JsZCZxdW90O30pO1xcbiAgICAgICAgcmV0dXJuIHRoaXM7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHZhciBtb2RlbCA9IGN0cmwubW9kZWw7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIERJVigmcXVvdDtIZWxsbyAmcXVvdDsgKyBtb2RlbC53aG8oKSlcXG4gICAgICAgICAgICBdO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3b3VsZCBleHBvc2UgYSB1cmwgL2hlbGxvcyAobm90ZTogdGhlICYjMzk7cyYjMzk7KSwgYW5kIHdvdWxkIGRpc3BsYXkgJnF1b3Q7SGVsbG8gd29ybGQmcXVvdDsuIChZb3UgY2FuIGNoYW5nZSB0aGUgcm91dGUgdXNpbmcgY3VzdG9tIHJvdXRpbmcpPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJtdWx0aS11cmwtbXZjXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjbXVsdGktdXJsLW12Y1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5NdWx0aSB1cmwgbXZjPC9zcGFuPjwvYT48L2gyPjxwPkluIHRoaXMgcGF0dGVybiB3ZSBleHBvc2UgbXVsdGlwbGUgbXZjIHJvdXRlcyB0aGF0IGluIHR1cm4gdHJhbnNsYXRlIHRvIG11bHRpcGxlIFVSTHMuIFRoaXMgaXMgdXNlZnVsIGZvciBzcGxpdHRpbmcgdXAgeW91ciBhcHAsIGFuZCBlbnN1cmluZyBlYWNoIG12YyBoYXMgaXRzIG93biBzZXRzIG9mIGNvbmNlcm5zLjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLnN1Z2FydGFncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIC8vICAgIE91ciBtb2RlbFxcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IGluZGV4Lm1vZGVscy5oZWxsbyh7d2hvOiAmcXVvdDt3b3JsZCZxdW90O30pO1xcbiAgICAgICAgcmV0dXJuIHRoaXM7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHZhciBtb2RlbCA9IGN0cmwubW9kZWw7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIERJVigmcXVvdDtIZWxsbyAmcXVvdDsgKyBtb2RlbC53aG8oKSksXFxuICAgICAgICAgICAgICAgIEEoe2hyZWY6ICZxdW90Oy9oZWxsby9MZW8mcXVvdDssIGNvbmZpZzogbS5yb3V0ZX0sICZxdW90O0NsaWNrIG1lIGZvciB0aGUgZWRpdCBhY3Rpb24mcXVvdDspXFxuICAgICAgICAgICAgXTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuXFxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7aGVsbG9faWQmIzM5OywgcGFyYW1zKTtcXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmhlbGxvKHt3aG86IHdob30pO1xcbiAgICAgICAgcmV0dXJuIHRoaXM7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHZhciBtb2RlbCA9IGN0cmwubW9kZWw7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIERJVigmcXVvdDtIZWxsbyAmcXVvdDsgKyBtb2RlbC53aG8oKSlcXG4gICAgICAgICAgICBdO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+SGVyZSB3ZSBhbHNvIGV4cG9zZSBhICZxdW90Oy9oZWxsby9bTkFNRV0mcXVvdDsgdXJsLCB0aGF0IHdpbGwgc2hvdyB5b3VyIG5hbWUgd2hlbiB5b3UgdmlzaXQgL2hlbGxvL1tZT1VSIE5BTUVdLCBzbyB0aGVyZSBhcmUgbm93IG11bHRpcGxlIHVybHMgZm9yIG91ciBTUEE6PC9wPlxcbjx1bD5cXG48bGk+PHN0cm9uZz4vaGVsbG9zPC9zdHJvbmc+IC0gdGhpcyBpcyBpbnRlbmRlZCB0byBiZSBhbiBpbmRleCBwYWdlIHRoYXQgbGlzdHMgYWxsIHlvdXIgJnF1b3Q7aGVsbG9zJnF1b3Q7PC9saT5cXG48bGk+PHN0cm9uZz4vaGVsbG8vW05BTUVdPC9zdHJvbmc+IC0gdGhpcyBpcyBpbnRlbmRlZCB0byBiZSBhbiBlZGl0IHBhZ2Ugd2hlcmUgeW91IGNhbiBlZGl0IHlvdXIgJnF1b3Q7aGVsbG9zJnF1b3Q7PC9saT5cXG48L3VsPlxcbjxwPk5vdGUgdGhhdCB0aGUgYW5jaG9yIHRhZyBoYXMgPGNvZGU+Y29uZmlnOiBtLnJvdXRlPC9jb2RlPiBpbiBpdCYjMzk7cyBvcHRpb25zIC0gdGhpcyBpcyBzbyB0aGF0IHdlIGNhbiByb3V0ZSBhdXRvbWF0aWNhbGx5IHRob3VnaCBtaXRocmlsPC9wPlxcblwifTsgfTsiLCIvKiBOT1RFOiBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUsIHBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LCB5b3VyIGNoYW5nZXMgd2lsbCBiZSBsb3N0ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG0pe1xuXHR2YXIgZ2V0TW9kZWxEYXRhID0gZnVuY3Rpb24obW9kZWwpe1xuXHRcdHZhciBpLCByZXN1bHQgPSB7fTtcblx0XHRmb3IoaSBpbiBtb2RlbCkge2lmKG1vZGVsLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRpZihpICE9PSAnaXNWYWxpZCcpIHtcblx0XHRcdFx0aWYoaSA9PSAnaWQnKSB7XG5cdFx0XHRcdFx0cmVzdWx0WydfaWQnXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdFtpXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fX1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHRyZXR1cm4ge1xuJ2ZpbmQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9maW5kJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzYXZlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vc2F2ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4ncmVtb3ZlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vcmVtb3ZlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidhdXRoZW50aWNhdGUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9hdXRoZW50aWNhdGlvbi9hdXRoZW50aWNhdGUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2xvZ2luJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vbG9naW4nLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2xvZ291dCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL2xvZ291dCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nZmluZFVzZXJzJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvYXV0aGVudGljYXRpb24vZmluZFVzZXJzJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzYXZlVXNlcic6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2F1dGhlbnRpY2F0aW9uL3NhdmVVc2VyJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufVxuXHR9O1xufTsiLCIvKiBOT1RFOiBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUsIHBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LCB5b3VyIGNoYW5nZXMgd2lsbCBiZSBsb3N0ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG0pe1xuXHR2YXIgZ2V0TW9kZWxEYXRhID0gZnVuY3Rpb24obW9kZWwpe1xuXHRcdHZhciBpLCByZXN1bHQgPSB7fTtcblx0XHRmb3IoaSBpbiBtb2RlbCkge2lmKG1vZGVsLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRpZihpICE9PSAnaXNWYWxpZCcpIHtcblx0XHRcdFx0aWYoaSA9PSAnaWQnKSB7XG5cdFx0XHRcdFx0cmVzdWx0WydfaWQnXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdFtpXSA9ICh0eXBlb2YgbW9kZWxbaV0gPT0gJ2Z1bmN0aW9uJyk/IG1vZGVsW2ldKCk6IG1vZGVsW2ldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fX1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXHRyZXR1cm4ge1xuJ2ZpbmQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9mbGF0ZmlsZWRiL2ZpbmQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NhdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9mbGF0ZmlsZWRiL3NhdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3JlbW92ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6ICcvYXBpL2ZsYXRmaWxlZGIvcmVtb3ZlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidhdXRoZW50aWNhdGUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9mbGF0ZmlsZWRiL2F1dGhlbnRpY2F0ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn1cblx0fTtcbn07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcblx0dmFyIGdldE1vZGVsRGF0YSA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgaSwgcmVzdWx0ID0ge307XG5cdFx0Zm9yKGkgaW4gbW9kZWwpIHtpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0aWYoaSAhPT0gJ2lzVmFsaWQnKSB7XG5cdFx0XHRcdGlmKGkgPT0gJ2lkJykge1xuXHRcdFx0XHRcdHJlc3VsdFsnX2lkJ10gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblx0cmV0dXJuIHtcbidnZXQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiAnL2FwaS9zZXNzaW9uL2dldCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nc2V0JzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogJy9hcGkvc2Vzc2lvbi9zZXQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59XG5cdH07XG59OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi92YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKTt2YXIgc3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKTt2YXIgYmluZGluZ3MgPSByZXF1aXJlKCdtaXRocmlsLmJpbmRpbmdzJykobSk7dmFyIGFuaW1hdGUgPSByZXF1aXJlKCcuLi9wdWJsaWMvanMvbWl0aHJpbC5hbmltYXRlLmpzJykobSk7dmFyIHBlcm1pc3Npb25zID0gcmVxdWlyZSgnLi4vc3lzdGVtL21pc28ucGVybWlzc2lvbnMuanMnKTt2YXIgbGF5b3V0ID0gcmVxdWlyZSgnLi4vbXZjL2xheW91dF9taXNvLmpzJyk7dmFyIHJlc3RyaWN0ID0gZnVuY3Rpb24ocm91dGUsIGFjdGlvbk5hbWUpe1x0cmV0dXJuIHJvdXRlO30scGVybWlzc2lvbk9iaiA9IHt9O3ZhciB1c2VyID0gcmVxdWlyZSgnLi4vbXZjL3VzZXIuanMnKTtcbnZhciBob21lID0gcmVxdWlyZSgnLi4vbXZjL2hvbWUuanMnKTtcbnZhciBkb2MgPSByZXF1aXJlKCcuLi9tdmMvZG9jLmpzJyk7XG5cbnZhciBoZWxsbyA9IHJlcXVpcmUoJy4uL212Yy9oZWxsby5qcycpO1xudmFyIGxvZ2luID0gcmVxdWlyZSgnLi4vbXZjL2xvZ2luLmpzJyk7XG52YXIgdG9kbyA9IHJlcXVpcmUoJy4uL212Yy90b2RvLmpzJyk7XG5cbmlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHR3aW5kb3cubSA9IG07fVx0bS5yb3V0ZS5tb2RlID0gJ3BhdGhuYW1lJzttLnJvdXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNvQXR0YWNobWVudE5vZGUnKSwgJy8nLCB7Jy91c2Vycy9uZXcnOiByZXN0cmljdCh1c2VyLm5ldywgJ3VzZXIubmV3JyksXG4nLyc6IHJlc3RyaWN0KGhvbWUuaW5kZXgsICdob21lLmluZGV4JyksXG4nL2RvYy86ZG9jX2lkJzogcmVzdHJpY3QoZG9jLmVkaXQsICdkb2MuZWRpdCcpLFxuJy9kb2NzJzogcmVzdHJpY3QoZG9jLmluZGV4LCAnZG9jLmluZGV4JyksXG4nL2hlbGxvLzpoZWxsb19pZCc6IHJlc3RyaWN0KGhlbGxvLmVkaXQsICdoZWxsby5lZGl0JyksXG4nL2xvZ2luJzogcmVzdHJpY3QobG9naW4uaW5kZXgsICdsb2dpbi5pbmRleCcpLFxuJy90b2Rvcyc6IHJlc3RyaWN0KHRvZG8uaW5kZXgsICd0b2RvLmluZGV4JyksXG4nL3VzZXIvOnVzZXJfaWQnOiByZXN0cmljdCh1c2VyLmVkaXQsICd1c2VyLmVkaXQnKSxcbicvdXNlcnMnOiByZXN0cmljdCh1c2VyLmluZGV4LCAndXNlci5pbmRleCcpfSk7bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIgPSBmdW5jdGlvbihvYmope1x0dmFyIGhlYWRlck5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzb0hlYWRlck5vZGUnKTtcdGlmKGhlYWRlck5vZGUpe1x0XHRtLnJlbmRlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzb0hlYWRlck5vZGUnKSwgbGF5b3V0LmhlYWRlckNvbnRlbnQ/IGxheW91dC5oZWFkZXJDb250ZW50KHttaXNvR2xvYmFsOiBvYmogfHwgbWlzb0dsb2JhbH0pOiAnJyk7XHR9fTttaXNvR2xvYmFsLnJlbmRlckhlYWRlcigpOyIsIi8qXHRtaXNvIHBlcm1pc3Npb25zXG5cdFBlcm1pdCB1c2VycyBhY2Nlc3MgdG8gY29udHJvbGxlciBhY3Rpb25zIGJhc2VkIG9uIHJvbGVzIFxuKi9cbnZhciBtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0aGFzUm9sZSA9IGZ1bmN0aW9uKHVzZXJSb2xlcywgcm9sZXMpe1xuXHRcdHZhciBoYXNSb2xlID0gZmFsc2U7XG5cdFx0Ly9cdEFsbCByb2xlc1xuXHRcdGlmKHVzZXJSb2xlcyA9PSBcIipcIikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdC8vXHRTZWFyY2ggZWFjaCB1c2VyIHJvbGVcblx0XHRtaXNvLmVhY2godXNlclJvbGVzLCBmdW5jdGlvbih1c2VyUm9sZSl7XG5cdFx0XHR1c2VyUm9sZSA9ICh0eXBlb2YgdXNlclJvbGUgIT09IFwic3RyaW5nXCIpPyB1c2VyUm9sZTogW3VzZXJSb2xlXTtcblx0XHRcdC8vXHRTZWFyY2ggZWFjaCByb2xlXG5cdFx0XHRtaXNvLmVhY2gocm9sZXMsIGZ1bmN0aW9uKHJvbGUpe1xuXHRcdFx0XHRpZih1c2VyUm9sZSA9PSByb2xlKSB7XG5cdFx0XHRcdFx0aGFzUm9sZSA9IHRydWU7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRyZXR1cm4gaGFzUm9sZTtcblx0fTtcblxuLy9cdERldGVybWluZSBpZiB0aGUgdXNlciBoYXMgYWNjZXNzIHRvIGFuIEFQUCBhY3Rpb25cbi8vXHRUT0RPOiBcbm1vZHVsZS5leHBvcnRzLmFwcCA9IGZ1bmN0aW9uKHBlcm1pc3Npb25zLCBhY3Rpb25OYW1lLCB1c2VyUm9sZXMpe1xuXHQvL1x0VE9ETzogUHJvYmFibHkgbmVlZCB0byB1c2UgcGFzcz1mYWxzZSBieSBkZWZhdWx0LCBidXQgZmlyc3Q6XG5cdC8vXG5cdC8vXHQqIEFkZCBnbG9iYWwgY29uZmlnIGZvciBwYXNzIGRlZmF1bHQgaW4gc2VydmVyLmpzb25cblx0Ly9cdCogXG5cdC8vXG5cdHZhciBwYXNzID0gdHJ1ZTtcblxuXHQvL1x0QXBwbHkgZGVueSBmaXJzdCwgdGhlbiBhbGxvdy5cblx0aWYocGVybWlzc2lvbnMgJiYgdXNlclJvbGVzKXtcblx0XHRpZihwZXJtaXNzaW9ucy5kZW55KSB7XG5cdFx0XHRwYXNzID0gISBoYXNSb2xlKHVzZXIucm9sZXMsIHBlcm1pc3Npb25zLmRlbnkpO1xuXHRcdH1cblx0XHRpZihwZXJtaXNzaW9ucy5hbGxvdykge1xuXHRcdFx0cGFzcyA9IGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuYWxsb3cpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBwYXNzO1xufTtcblxuXG4vL1x0RGV0ZXJtaW5lIGlmIHRoZSB1c2VyIGhhcyBhY2Nlc3MgdG8gYW4gQVBJIGFjdGlvblxuLy9cdFRPRE86IFxubW9kdWxlLmV4cG9ydHMuYXBpID0gZnVuY3Rpb24ocGVybWlzc2lvbnMsIGFjdGlvbk5hbWUsIHVzZXJSb2xlcyl7XG5cdC8vXHRUT0RPOiBQcm9iYWJseSBuZWVkIHRvIHVzZSBwYXNzPWZhbHNlIGJ5IGRlZmF1bHQsIGJ1dCBmaXJzdDpcblx0Ly9cblx0Ly9cdCogQWRkIGdsb2JhbCBjb25maWcgZm9yIHBhc3MgZGVmYXVsdCBpbiBzZXJ2ZXIuanNvblxuXHQvL1x0KiBcblx0Ly9cblx0dmFyIHBhc3MgPSB0cnVlO1xuXG5cdC8vXHRBcHBseSBkZW55IGZpcnN0LCB0aGVuIGFsbG93LlxuXHRpZihwZXJtaXNzaW9ucyAmJiB1c2VyUm9sZXMpe1xuXHRcdGlmKHBlcm1pc3Npb25zLmRlbnkpIHtcblx0XHRcdHBhc3MgPSAhIGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuZGVueSk7XG5cdFx0fVxuXHRcdGlmKHBlcm1pc3Npb25zLmFsbG93KSB7XG5cdFx0XHRwYXNzID0gaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5hbGxvdyk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHBhc3M7XG59OyJdfQ==
