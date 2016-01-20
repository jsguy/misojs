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

	//	Get cordova or normal relative url
	url: function(relativeUrl){
		var myCordova = typeof cordova !== "undefined"? cordova: {
			file: {
				applicationDirectory: ""
			}
		};
		return myCordova.file.applicationDirectory + relativeUrl;
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
},{"mithril":12}],2:[function(require,module,exports){
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
},{"../modules/miso.util.client.js":1,"../public/miso.documentation.js":18,"mithril":12,"mithril.sugartags":11}],3:[function(require,module,exports){
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
},{"../modules/miso.util.client.js":1,"mithril":12,"mithril.sugartags":11}],4:[function(require,module,exports){
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

},{"../public/js/mithril.smoothscroll.js":17,"mithril":12,"mithril.sugartags":11}],5:[function(require,module,exports){
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
					LINK({href: '/css/reset.css', rel:'stylesheet'}),
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
},{"../system/api/authentication/api.client.js":19,"mithril":12,"mithril.sugartags":11}],6:[function(require,module,exports){
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
},{"../modules/miso.util.client.js":1,"../system/api/authentication/api.client.js":19,"../system/api/session/api.client.js":22,"mithril":12,"mithril.sugartags":11}],7:[function(require,module,exports){
var m = require('mithril'),
	miso = require("../modules/miso.util.client.js"),
	sugartags = require('mithril.sugartags')(m),
	animate = require('../public/js/mithril.animate.nobind.js')(m),
	flickr = require("../system/api/flickr/api.client.js")(m);

var self = module.exports.index = {
	models: {
		home: function(data){
			var me = this;
			me.toggleMenu = function(){
				me.menuOffset(me.menuOffset() == 0? 240: 0);
			};
			me.menuOffset = m.p(0);
			me.flickrData = m.prop(data.flickrData);
		}
	},

	controller: function(params) {
		var ctrl = this;
		ctrl.model = new self.models.home({flickrData: {}});

		//	Load some pictures
		flickr.photos({tags: "Sydney opera house", tagmode: "any"}, {background: true, initialValue: []}).then(function(data){
			if(data.result.errno) {
				if(data.result.errno == "ENOTFOUND") {
					//	Offline error?
					ctrl.model.flickrData([]);
				} else {
					//	Something else?
					ctrl.model.flickrData([]);
				}

			} else {
				ctrl.model.flickrData(data.result.items || []);
			}
		},

		//	This error runs serverside only!
		function(errorData){
			console.log(errorData);
		}

		);


		//	Set header
		if(typeof misoGlobal !== "undefined") {
			misoGlobal.header.text("Home");
		}
		return ctrl;
	},
	view: function(ctrl) {
		var o = ctrl.model;
		with(sugartags) {
			return [
				DIV({className: "intro"}, [
					DIV({className: "photo-thumb"}, 
						IMG({src: "/img/photos/flower_thumb_square.jpg"})
					),
					DIV({className: "intro-items"}, [
						DIV({className: "intro-item intro-posts"}, [
							DIV({className: "intro-count posts-count"}, "179"),
							DIV({className: "intro-label posts-label"}, "posts")
						]),
						DIV({className: "intro-item intro-followers"}, [
							DIV({className: "intro-count follower-count"}, "110"),
							DIV({className: "intro-label follower-label"}, "followers")
						]),
						DIV({className: "intro-item intro-following"}, [
							DIV({className: "intro-count following-count"}, "71"),
							DIV({className: "intro-label following-label"}, "following")
						]),
						DIV({className: "follow-items"}, [
							DIV({className: "follow-item follow-button"}, "+ FOLLOW"),
							DIV({className: "follow-item follow-button-dropdown"}, I({className: "fa fa-caret-down"}))
						])
					]),
					DIV({className: "user-summary"},[
						DIV({className: "user-name"}, "Zerocool"),
						DIV({className: "user-status"}, "Hack the planet!")
					])
				]),
				DIV({className: "photo-container"}, [
					miso.each(ctrl.model.flickrData(), function(item){
						//	Must use m.trust, to allow onload
						return DIV({className: "photo-item"}, m.trust('<IMG onload="this.style.opacity=1" src="' +item.media.m + '" class ="photo-small">'));
					})
				])
			];
		}
	}
};


//	TESTING
var self2 = module.exports.test = {
	controller: function(params) {
		this.message = "hello";

		//	Set header
		if(typeof misoGlobal !== "undefined") {
			misoGlobal.header.text("Testing");
		}

		return this;
	},
	view: function(ctrl) {
		var o = ctrl;
		with(sugartags) {
			return [
	  			H1("Why hello there!"),
				A({href:"/mobilehome", config: m.route}, "home"),
			]
		};
	}
};
},{"../modules/miso.util.client.js":1,"../public/js/mithril.animate.nobind.js":16,"../system/api/flickr/api.client.js":21,"mithril":12,"mithril.sugartags":11}],8:[function(require,module,exports){
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
},{"../system/api/flatfiledb/api.client.js":20,"mithril":12,"mithril.sugartags":11}],9:[function(require,module,exports){
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

},{"../modules/miso.util.client.js":1,"../system/api/authentication/api.client.js":19,"mithril":12,"mithril.bindings":10,"mithril.sugartags":11,"validator.modelbinder":13}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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
},{"validator":14}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
		typeof window !== "undefined" && window.console && console.error && console.error(msg);
	},
	
	//	Capitalise		
	cap = function(str){
		return str.charAt(0).toUpperCase() + str.substr(1);
	},

	//	For checking what vendor prefixes are native
	div = typeof document !== "undefined"?
		document.createElement('div'):
		null,

	//	vendor prefix, ie: transitionDuration becomes MozTransitionDuration
	vp = function (prop, dashed) {
		var pf;
		//	Handle unprefixed
		if (!div || prop in div.style) {
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
			if(dashed) {
				pf = "-" +(prefixes[i] + "-" + prop).toLowerCase();
			} else {
				pf = prefixes[i] + cap(prop);
			}
			if (pf in div.style) {
				return pf;
			}
		}
		//	Can't find it - return original property.
		return prop;
	},

	//	See if we can use native transitions
	supportsTransitions = function() {
		if(typeof document == "undefined") {
			return false;
		}
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
						props[vp("transform", true)] = props[vp("transform", true)] || "";
						props[vp("transform", true)] += " " +p + "(" + value + ")";
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

		options.duration = typeof options.duration !== "undefined"?
			options.duration:
			defaultDuration;

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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
module.exports = function(){ return {"Api.md":"<p>The data apis in miso are a way to create a RESTful endpoint that you can interact with via an easy to use API.</p>\n<blockquote>\nNote: you must enable your api by adding it to the &quot;api&quot; attribute in the <code>/cfg/server.development.json</code> file, or whatever environment you are using.\n</blockquote>\n\n<h2><a name=\"how-does-an-api-work-\" class=\"anchor\" href=\"#how-does-an-api-work-\"><span class=\"header-link\">How does an api work?</span></a></h2><p>The apis in miso do a number of things:</p>\n<ul>\n<li>Allow database access via a thin wrapper, for example to access mongodb, we wrap the popular <a href=\"/doc/mongoose.md\">mongoose npm</a> ODM package</li>\n<li>Waits till mithril is ready - mithril has a unique feature ensures the view doesn&#39;t render till data has been retrieved - the api makes sure we adhere to this</li>\n<li>Apis can work as a proxy, so if you want to access a 3rd party service, an api is a good way to do that - you can then also build in caching, or any other features you may wish to add.</li>\n<li>Apis can be restricted by permissions (coming soon) </li>\n</ul>\n<h2><a name=\"how-should-you-use-apis\" class=\"anchor\" href=\"#how-should-you-use-apis\"><span class=\"header-link\">How should you use apis</span></a></h2><p>There are numerous scenarios where you might want to use an api:</p>\n<ul>\n<li>For database access (miso comes with a bunch of database apis)</li>\n<li>For calling 3rd party end-points - using an api will allow you to create caching and setup permissions on the end-point</li>\n</ul>\n<h2><a name=\"extending-an-existing-api\" class=\"anchor\" href=\"#extending-an-existing-api\"><span class=\"header-link\">Extending an existing api</span></a></h2><p>If you want to add your own methods to an api, you can simply extend one of the existing apis, for example, to extend the <code>flatfiledb</code> API, create a new directory and file in <code>/modules/api/adapt/adapt.api.js</code>:</p>\n<pre><code class=\"lang-javascript\">var db = require(&#39;../../../system/api/flatfiledb/flatfiledb.api.js&#39;);\n\nmodule.exports = function(m){\n    var ad = db(m);\n    ad.hello = function(cb, err, args, req){\n        cb(&quot;world&quot;);\n    };\n    return ad;\n};\n</code></pre>\n<p>Then add the api to the <code>/cfg/server.development.json</code> file like so:</p>\n<pre><code class=\"lang-javascript\">&quot;api&quot;: &quot;adapt&quot;\n</code></pre>\n<p>Then require the new api file in your mvc file like so:</p>\n<pre><code class=\"lang-javascript\">db = require(&#39;../modules/api/adapt/api.server.js&#39;)(m);\n</code></pre>\n<p>You can now add an api call in the controller like so:</p>\n<pre><code class=\"lang-javascript\">db.hello({}).then(function(data){\n// do something with data.result\n});\n</code></pre>\n<p>The arguments to each api endpoint must be the same, ie:</p>\n<pre><code class=\"lang-javascript\">function(cb, err, args, req)\n</code></pre>\n<p>Where:</p>\n<table>\n<thead>\n<tr>\n<th>Argument</th>\n<th>Purpose</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>cb</td>\n<td>A callback you must call when you are done - any data you return will be available on <code>data.result</code> in the response</td>\n</tr>\n<tr>\n<td>err</td>\n<td>A callback you must call if an unrecoverable error occurred, eg: &quot;database connection timeout&quot;. Do not use for things like &quot;no data found&quot;</td>\n</tr>\n<tr>\n<td>args</td>\n<td>A set of arguments passed in to the api method</td>\n</tr>\n<tr>\n<td>req</td>\n<td>The request object from the request</td>\n</tr>\n</tbody>\n</table>\n<p>The complete mvc example looks like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../modules/api/adapt/api.server.js&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            who = miso.getParam(&#39;adapt_id&#39;, params);\n\n        db.hello({}).then(function(data){\n            ctrl.model.who(data.result);\n        });\n\n        ctrl.model = new edit.models.hello({who: who});\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;G&#39;day &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<h2><a name=\"creating-custom-apis\" class=\"anchor\" href=\"#creating-custom-apis\"><span class=\"header-link\">Creating custom apis</span></a></h2><p>You can add your own custom apis in the <code>/modules/apis</code> directory, they have the same format as the included apis, here is an example api that calls the flickr API:</p>\n<pre><code class=\"lang-javascript\">//    endpoint api to make http requests via flickr\nvar request = require(&#39;request&#39;),\n    miso = require(&#39;../../../server/miso.util.js&#39;),\n    //    Parse out the unwanted parts of the json\n    //    typically this would be run on the client\n    //    we run this using &quot;request&quot; on  the server, so\n    //    no need for the jsonp callback\n    jsonParser = function(jsonpData){\n        var json, startPos, endPos;\n        try {\n            startPos = jsonpData.indexOf(&#39;({&#39;);\n            endPos = jsonpData.lastIndexOf(&#39;})&#39;);\n            json = jsonpData\n                .substring(startPos+1, endPos+1)\n                .split(&quot;\\n&quot;).join(&quot;&quot;)\n                .split(&quot;\\\\&#39;&quot;).join(&quot;&#39;&quot;);\n\n            return JSON.parse(json);\n        } catch(ex) {\n            console.log(&quot;ERROR&quot;, ex);\n            return &quot;{}&quot;;\n        }\n    };\n\nmodule.exports = function(utils){\n    return {\n        photos: function(cb, err, args, req){\n            args = args || {};\n            var url = &quot;http://api.flickr.com/services/feeds/photos_public.gne?format=json&quot;;\n            //    Add parameters\n            url += miso.each(args, function(value, key){\n                return &quot;&amp;&quot; + key + &quot;=&quot; + value;\n            });\n\n            request(url, function (error, response, body) {\n                if (!error &amp;&amp; response.statusCode == 200) {\n                    cb(jsonParser(body));\n                } else {\n                    err(error);\n                }\n            });\n        }\n    };\n};\n</code></pre>\n<p>To use it in your mvc file, simply:</p>\n<pre><code class=\"lang-javascript\">flickr = require(&#39;../modules/api/flickr/api.server.js&#39;)(m);\n</code></pre>\n<p>And then call it like so in your controller:</p>\n<pre><code class=\"lang-javascript\">flickr.photos({tags: &quot;Sydney opera house&quot;, tagmode: &quot;any&quot;}).then(function(data){\n    ctrl.model.flickrData(data.result.items);\n});\n</code></pre>\n","Authentication.md":"<h2><a name=\"authentication\" class=\"anchor\" href=\"#authentication\"><span class=\"header-link\">Authentication</span></a></h2><p>Authentication is the process of making sure a user is who they say they are - usually this is done by using a username and password, but it can also be done via an access token, 3rd-party services such as OAuth, or something like OpenID, or indeed Google, Facebook, GitHUb, etc...</p>\n<p>In miso, the authentication feature has:</p>\n<ul>\n<li>The ability to see if the user has logged in (via a secret value on the server-side session)</li>\n<li>The ability to redirect to a login page if they haven&#39;t logged in</li>\n</ul>\n<p>You can configure the authentication in <code>/cfg/server.json</code>, and set the authentication attribute on the action that requires it.</p>\n<p>For example, in <code>/cfg/server.json</code>, you can set:</p>\n<pre><code class=\"lang-javascript\">&quot;authentication&quot;: {\n    &quot;enabled&quot;: true,\n    &quot;all&quot;: false,\n    &quot;secret&quot;: &quot;im-so-miso&quot;,\n    &quot;strategy&quot;: &quot;default&quot;,\n    &quot;loginUrlPattern&quot;: &quot;/login?url=[ORIGINALURL]&quot;\n}\n</code></pre>\n<p>Where:</p>\n<ul>\n<li><strong>enabled</strong> will enable our authentication behaviour</li>\n<li><strong>all</strong> will set the default behaviour of authentication for all actions, default is &quot;false&quot;, ie: no authentication required</li>\n<li><strong>secret</strong> is the secret value that is set on the session</li>\n<li><strong>loginUrlPattern</strong> is a URL pattern where we will substitute &quot;[ORIGINALURL]&quot; for the originally requested URL.</li>\n<li><strong>middleware</strong> is the authentication middleware to use, default is &quot;../system/auth_middle&quot;</li>\n</ul>\n<p>Now, if you want a particular action to be authenticated, you can override the default (all) value in each of your actions, for example to need authentication on the <code>index</code> action of your todos app, set:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {\n    ...,\n    authenticate: true\n};\n</code></pre>\n<p>This will override the default value of the &quot;all&quot; attribute form the server config authentication and make authentication required on this action.\nIf your app is mainly a secure app, you&#39;ll want to set &quot;all&quot; attribute to true and override the &quot;login&quot; and, (if you have one), the &quot;forgot password&quot; pages, and so as to not require authentication, ie:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {\n    ...,\n    authenticate: false\n};\n</code></pre>\n<h3><a name=\"sample-implementation\" class=\"anchor\" href=\"#sample-implementation\"><span class=\"header-link\">Sample implementation</span></a></h3><p>In Miso, we have a sample implementation of authentication that uses the flatfiledb api. There are 4 main components in the sample authentication process:</p>\n<ul>\n<li><p>The authenticate api <code>/system/api/authenticate</code> - handles saving and loading of users, plus checking if the password matches.</p>\n</li>\n<li><p>The login mechanism <code>/mvc/login.js</code> - simply allows you to enter a username and password and uses the authentication api to log you in</p>\n</li>\n<li><p>User management <code>/mvc/users.js</code> - Uses the authentication api to add a user with an encrypted password</p>\n</li>\n<li><p>Authentication middleware <code>/system/auth_middle.js</code> - applies authentication on the server for actions - this is a core feature of how miso does the authentication - it simply checks if the secret is set on the session, and redirects to the configured &quot;loginUrlPattern&quot; URL if it doesn&#39;t match the secret.</p>\n</li>\n</ul>\n<p>Ideally you will not need to change the authentication middleware, as the implementation simply requires you to set the &quot;authenticationSecret&quot; on the request object session - you can see how this works in <code>/system/api/authenticate/authenticate.api.js</code>.</p>\n<h3><a name=\"how-the-sample-implementation-works\" class=\"anchor\" href=\"#how-the-sample-implementation-works\"><span class=\"header-link\">How the sample implementation works</span></a></h3><ul>\n<li>When authentication is required for access to an action, and you haven&#39;t authenticated, you are redirected to the <code>/login</code> action</li>\n<li>At <code>/login</code> you can authenticate with a username and password (which can be created at <code>/users</code>)</li>\n<li>When authenticated, a secret key is set on the session, this is used to check if a user is logged in every time they access an action that requires authentication.</li>\n</ul>\n<p>Note: the authentication secret is only ever kept on the server, so the client code simply has a boolean to say if it is logged in - this means it will try to access authenticated urls if <code>misoGlobal.isLoggedIn</code> is set to &quot;true&quot;. Of course the server will deny access to any data api end points, so your data is safe.</p>\n<h2><a name=\"sessions\" class=\"anchor\" href=\"#sessions\"><span class=\"header-link\">Sessions</span></a></h2><p>When the user is authenticated, they are provided with a session - this can be used to store temporary data and is accessible via <code>/system/api/session/api.server.js</code>. You can use it like so in your <code>mvc</code> files:</p>\n<pre><code class=\"lang-javascript\">var session = require(&#39;../system/api/session/api.server.js&#39;)(m);\n\nsession.get({key: &#39;userName&#39;}).then(function(data){\n    console.log(data.result);\n});\n</code></pre>\n<p>These are the methods available on the session api:</p>\n<table>\n<thead>\n<tr>\n<th>Method</th>\n<th>Purpose</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>get({key: key})</td>\n<td>Retrieves a value from the session for the given key</td>\n</tr>\n<tr>\n<td>set({key: key, value: value})</td>\n<td>Sets a value in the session for the given key</td>\n</tr>\n</tbody>\n</table>\n<p>Note: Each user of your app has a session that is stored on the server, so each time you access it, it will make a XHR request. Use it sparingly!</p>\n","Contributing.md":"<p>In order to contribute to misojs, please keep the following in mind:</p>\n<h2><a name=\"when-adding-a-pull-request\" class=\"anchor\" href=\"#when-adding-a-pull-request\"><span class=\"header-link\">When adding a pull request</span></a></h2><ul>\n<li>Be sure to only make small changes, anything more than 4 files will need to be reviewed</li>\n<li>Make sure you explain <em>why</em> you&#39;re making the change, so we understand what the change is for</li>\n<li>Add a unit test if appropriate</li>\n<li>Do not be offended if we ask you to add a unit test before accepting a pull request</li>\n<li>Use tabs not spaces (we are not flexible on this - it is a moot discussion - I really don&#39;t care, we just needed to pick one, and tabs it is)</li>\n</ul>\n","Creating-a-todo-app-part-2-persistence.md":"<p>In this article we will add data persistence functionality to our todo app from the <a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a> article. We recommend you first read that as we are going to use the app you made in this article, so if you don&#39;t already have one, grab a copy of it <a href=\"/doc/Creating-a-todo-app#completed-todo-app.md\">from here</a>, and save it in <code>/mvc/todo.js</code>.</p>\n<p>First add the <code>flatfiledb</code> api to the <code>cfg/server.development.json</code> file:</p>\n<pre><code class=\"lang-javascript\">&quot;api&quot;: &quot;flatfiledb&quot;\n</code></pre>\n<p>This makes miso load the api and expose it at the configured API url, default is &quot;/api&quot; + api name, so for the flatfiledb it will be <code>/api/flatfiledb</code>. This is all abstracted away, so you do not need to worry about what the URL is when using the api - you simply call the method you want, and the miso api takes care of the rest.</p>\n<p>Now require the db api at the the top of the todo.js file:</p>\n<pre><code class=\"lang-javascript\">db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n</code></pre>\n<p>Next add the following in the <code>ctrl.addTodo</code> function underneath the line that reads <code>ctrl.vm.input(&quot;&quot;);</code>:</p>\n<pre><code class=\"lang-javascript\">db.save({ type: &#39;todo.index.todo&#39;, model: newTodo } ).then(function(res){\n    newTodo._id = res.result;\n});\n</code></pre>\n<p>This will save the todo to the database when you click the &quot;Add&quot; button.</p>\n<p>Let us take a quick look at how the api works - the way that you make requests to the api depends entirely on which api you are using, for example for the flatfiledb, we have:</p>\n<table>\n<thead>\n<tr>\n<th>Method</th>\n<th>Action</th>\n<th>Parameters</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>save</td>\n<td>Save or updates a model</td>\n<td>{ type: TYPE, model: MODEL }</td>\n</tr>\n<tr>\n<td>find</td>\n<td>Finds one or more models of the give type</td>\n<td>{ type: TYPE, query: QUERY }</td>\n</tr>\n<tr>\n<td>remove</td>\n<td>Removes an instance of a model</td>\n<td>{ type: TYPE, id: ID }</td>\n</tr>\n</tbody>\n</table>\n<p>Where the attributes are:</p>\n<table>\n<thead>\n<tr>\n<th>Attribute</th>\n<th>Use</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>TYPE</td>\n<td>The namespace of the model, say you have todo.js, and the model is on <code>module.exports.index.modules.todo</code>, the type would be &quot;todo.index.todo&quot;</td>\n</tr>\n<tr>\n<td>MODEL</td>\n<td>This is an object representing the model - eg: a standard mithril model</td>\n</tr>\n<tr>\n<td>QUERY</td>\n<td>An object with attributes to filter the query results</td>\n</tr>\n<tr>\n<td>ID</td>\n<td>A unique ID for a record</td>\n</tr>\n</tbody>\n</table>\n<p>Every method returns a <a href=\"/doc/mithril.deferred.html#differences-from-promises-a-.md\">mithril style promise</a>, which means you must attach a <code>.then</code> callback function.\nBe sure to check the methods for each api, as each will vary, depending on the functionality.</p>\n<p>Now, let us add the capability to load our todos, add the following to the start of the controller, just after the <code>var ctrl = this</code>:</p>\n<pre><code class=\"lang-javascript\">db.find({type: &#39;todo.index.todo&#39;}).then(function(data) {\n    ctrl.list = Object.keys(data.result).map(function(key) {\n        return new self.models.todo(data.result[key]);\n    });\n});\n</code></pre>\n<p>This will load your todos when the app loads up. Be sure to remove the old static list, ie: remove these lines:</p>\n<pre><code class=\"lang-javascript\">myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n\nctrl.list = Object.keys(myTodos).map(function(key) {\n    return new self.models.todo(myTodos[key]);\n});\n</code></pre>\n<p>Now you can try adding a todo, and it will save and load!</p>\n<p>Next let us add the ability to remove your completed todos in the archive method - extend the <code>if</code> statement by adding an <code>else</code> like so: </p>\n<pre><code class=\"lang-javascript\">} else {\n    api.remove({ type: &#39;todo.index.todo&#39;, _id: todo._id }).then(function(response){\n        console.log(response.result);\n    });\n}\n</code></pre>\n<p>This will remove the todo from the data store.</p>\n<p>You now have a complete todo app, your app should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.prop(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this;\n\n        db.find({type: &#39;todo.index.todo&#39;}).then(function(data) {\n            ctrl.list = Object.keys(data.result).map(function(key) {\n                return new self.models.todo(data.result[key]);\n            });\n        });\n\n        ctrl.addTodo = function(e){\n            var value = ctrl.vm.input();\n            if(value) {\n                var newTodo = new self.models.todo({\n                    text: ctrl.vm.input(),\n                    done: false\n                });\n                ctrl.list.push(newTodo);\n                ctrl.vm.input(&quot;&quot;);\n                db.save({ type: &#39;todo.index.todo&#39;, model: newTodo } ).then(function(res){\n                    newTodo._id = res.result;\n                });\n            }\n            e.preventDefault();\n            return false;\n        };\n\n        ctrl.archive = function(){\n            var list = [];\n            ctrl.list.map(function(todo) {\n                if(!todo.done()) {\n                    list.push(todo); \n                } else {\n                    db.remove({ type: &#39;todo.index.todo&#39;, _id: todo._id }).then(function(response){\n                        console.log(response.result);\n                    });\n                }\n            });\n            ctrl.list = list;\n        };\n\n        ctrl.vm = {\n            left: function(){\n                var count = 0;\n                ctrl.list.map(function(todo) {\n                    count += todo.done() ? 0 : 1;\n                });\n                return count;\n            },\n            done: function(todo){\n                return function() {\n                    todo.done(!todo.done());\n                }\n            },\n            input: m.prop(&quot;&quot;)\n        };\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n                H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n                BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n                UL([\n                    ctrl.list.map(function(todo){\n                        return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                    })\n                ]),\n                FORM({ onsubmit: ctrl.addTodo }, [\n                    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n                    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n                ])\n            ]\n        };\n    }\n};\n</code></pre>\n","Creating-a-todo-app.md":"<p>In this article we will create a functional todo app - we recommend you first read the <a href=\"/doc/Getting-started.md\">Getting started</a> article, and understand the miso fundamentals such as where to place models and how to create a miso controller.</p>\n<h2><a name=\"todo-app\" class=\"anchor\" href=\"#todo-app\"><span class=\"header-link\">Todo app</span></a></h2><p>We will now create a new app using the <a href=\"/doc/Patterns#single-url-mvc.md\">single url pattern</a>, which means it handles all actions autonomously, plus looks a lot like a normal mithril app.</p>\n<p>In <code>/mvc</code> save a new file as <code>todo.js</code> with the following content: </p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {},\n    controller: function(params) {\n        var ctrl = this;\n        return ctrl;\n    },\n    view: function(ctrl) {\n        return &quot;TODO&quot;;\n    }\n};\n</code></pre>\n<p>Now open: <a href=\"/doc/todos.md\">http://localhost:6476/todos</a> and you&#39;ll see the word &quot;TODO&quot;. You&#39;ll notice that the url is &quot;/todos&quot; with an &#39;s&#39; on the end - as we are using <a href=\"/doc/How-miso-works#route-by-convention.md\">route by convention</a> to map our route.</p>\n<p>Next let&#39;s create the model for our todos - change the <code>models</code> attribute to the following:</p>\n<pre><code class=\"lang-javascript\">models: {\n    todo: function(data){\n        this.text = data.text;\n        this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n        this._id = data._id;\n    }\n},\n</code></pre>\n<p>Each line in the model does the following:</p>\n<ul>\n<li><code>this.text</code> - The text that is shown on the todo</li>\n<li><code>this.done</code> - This represents if the todo has been completed - we ensure that we handle the &quot;false&quot; values correctly, as ajax responses are always strings.</li>\n<li><code>this._id</code> - The key for the todo</li>\n</ul>\n<p>The model can now be used to store and retreive todos - miso automatically picks up any objects on the <code>models</code> attribute of your mvc file, and maps it in the API. We will soon see how that works. Next add the following code as the controller:</p>\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var ctrl = this,\n        myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n    ctrl.list = Object.keys(myTodos).map(function(key) {\n        return new self.models.todo(myTodos[key]);\n    });\n    return ctrl;\n},\n</code></pre>\n<p>This does the following:</p>\n<ul>\n<li>Creates <code>myTodos</code> which is a list of objects that represents todos</li>\n<li><code>this.list</code> - creates a list of todo model objects by using <code>new self.models.todo(...</code> on each myTodos object.</li>\n<li><code>return this</code> must be done in all controllers, it makes sure that miso can correctly get access to the controller object.</li>\n</ul>\n<p>Note: we always create a local variable <code>ctrl</code> that points to the controller, as it can be used to access variables in the controller from nested functions. You will see this usage later on in this article.</p>\n<p>Now update the view like so:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    return m(&quot;UL&quot;, [\n        ctrl.list.map(function(todo){\n            return m(&quot;LI&quot;, todo.text)\n        })\n    ]);\n}\n</code></pre>\n<p>This will iterate on your newly created list of todo model objects and display the on screen. Your todo app should now look like this:</p>\n<h3><a name=\"half-way-point\" class=\"anchor\" href=\"#half-way-point\"><span class=\"header-link\">Half-way point</span></a></h3><pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.p(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n        ctrl.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n        return ctrl;\n    },\n    view: function(ctrl) {\n        return m(&quot;UL&quot;, [\n            ctrl.list.map(function(todo){\n                return m(&quot;LI&quot;, todo.text)\n            })\n        ]);\n    }\n};\n</code></pre>\n<blockquote>\nSo far we have only used pure mithril to create our app - miso did do some of the grunt-work behind the scenes, but we can do much more.\n</blockquote>\n\n\n<p>Let us add some useful libraries, change the top section to:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m);\n</code></pre>\n<p>This will include the following libraries:</p>\n<ul>\n<li><a href=\"/doc/mithril.sugartags.md\">mithril.sugartags</a> - allows rendering HTML using tags that look a little more like HTML than standard mithril</li>\n<li><a href=\"/doc/mithril.bindings.md\">mithril.bindings</a> Bi-directional data bindings for richer models</li>\n</ul>\n<p>Let us start with the sugar tags, update the view to read:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return UL([\n            ctrl.list.map(function(todo){\n                return LI(todo.text)\n            })\n        ])\n    };\n}\n</code></pre>\n<p>So using sugartags allows us to write more concise views, that look more like natural HTML.</p>\n<p>Next let us add a <a href=\"/doc/what-is-a-view-model.html.md\">view model</a> to the controller. A view model is simply a model that contains data about the view, and auxillary functionality, ie: data and other things that we don&#39;t want to persist. Add this to the controller:</p>\n<pre><code class=\"lang-javascript\">ctrl.vm = {\n    done: function(todo){\n        return function() {\n            todo.done(!todo.done());\n        }\n    }\n};\n</code></pre>\n<p>This method will return a function that toggles the <code>done</code> attribute on the passed in todo. </p>\n<blockquote>\nYou might be tempted to put this functionality into the model, but in miso, we need to strictly keep data in the data model, as we are able to persist it.\n</blockquote>\n\n<p>Next update the view to:</p>\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return [\n            STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n            UL([\n                ctrl.list.map(function(todo){\n                    return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                })\n            ])\n        ]\n    };\n}\n</code></pre>\n<p>This will make the list of todos clickable, and put a strike-through the todo when it is set to &quot;done&quot;, neat!</p>\n<p>Now let us add a counter, to show how many todos are left, put this into the view model you created in the previous step:</p>\n<pre><code class=\"lang-javascript\">left: function(){\n    var count = 0;\n    ctrl.list.map(function(todo) {\n        count += todo.done() ? 0 : 1;\n    });\n    return count;\n}\n</code></pre>\n<p>And in the view, add the following above the UL:</p>\n<pre><code class=\"lang-javascript\">H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n</code></pre>\n<p>This will now display a nice header showing how many todos are left.</p>\n<p>Next let us add an input field, so you can add new todos, in the view model, (the <code>ctrl.vm</code> object), add the following line:</p>\n<pre><code class=\"lang-javascript\">input: m.p(&quot;&quot;)\n</code></pre>\n<p>In the controller, add:</p>\n<pre><code class=\"lang-javascript\">ctrl.addTodo = function(e){\n    var value = ctrl.vm.input();\n    if(value) {\n        var newTodo = new self.models.todo({\n            text: ctrl.vm.input(),\n            done: false\n        });\n        ctrl.list.push(newTodo);\n        ctrl.vm.input(&quot;&quot;);\n    }\n    e.preventDefault();\n    return false;\n};\n</code></pre>\n<p>This function creates a new todo based on the input text, and adds it to the list of todos.</p>\n<p>And in the view just below the UL, add:</p>\n<pre><code class=\"lang-javascript\">FORM({ onsubmit: ctrl.addTodo }, [\n    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n])\n</code></pre>\n<p>As you can see, we assign the <code>addTodo</code> method of the controller to the onsubmit function of the form, so that it will correctly add the todo when you click the &quot;Add&quot; button.</p>\n<p>Next, let us add the ability to archive old todos, add the following into the controller:</p>\n<pre><code class=\"lang-javascript\">ctrl.archive = function(){\n    var list = [];\n    ctrl.list.map(function(todo) {\n        if(!todo.done()) {\n            list.push(todo); \n        }\n    });\n    ctrl.list = list;\n};\n</code></pre>\n<p>And this button below the H1:</p>\n<pre><code class=\"lang-javascript\">BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n</code></pre>\n<h3><a name=\"completed-todo-app\" class=\"anchor\" href=\"#completed-todo-app\"><span class=\"header-link\">Completed todo app</span></a></h3><p>And you can now archive your todos. This completes the todo app functionally, your complete todo app should look like this:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    bindings = require(&#39;../server/mithril.bindings.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        todo: function(data){\n            this.text = data.text;\n            this.done = m.prop(data.done == &quot;false&quot;? false: data.done);\n            this._id = data._id;\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            myTodos = [{text: &quot;Learn miso&quot;}, {text: &quot;Build miso app&quot;}];\n\n        ctrl.list = Object.keys(myTodos).map(function(key) {\n            return new self.models.todo(myTodos[key]);\n        });\n\n        ctrl.addTodo = function(e){\n            var value = ctrl.vm.input();\n            if(value) {\n                var newTodo = new self.models.todo({\n                    text: ctrl.vm.input(),\n                    done: false\n                });\n                ctrl.list.push(newTodo);\n                ctrl.vm.input(&quot;&quot;);\n            }\n            e.preventDefault();\n            return false;\n        };\n\n        ctrl.archive = function(){\n            var list = [];\n            ctrl.list.map(function(todo) {\n                if(!todo.done()) {\n                    list.push(todo); \n                }\n            });\n            ctrl.list = list;\n        };\n\n        ctrl.vm = {\n            left: function(){\n                var count = 0;\n                ctrl.list.map(function(todo) {\n                    count += todo.done() ? 0 : 1;\n                });\n                return count;\n            },\n            done: function(todo){\n                return function() {\n                    todo.done(!todo.done());\n                }\n            },\n            input: m.p(&quot;&quot;)\n        };\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                STYLE(&quot;.done{text-decoration: line-through;}&quot;),\n                H1(&quot;Todos - &quot; + ctrl.vm.left() + &quot; of &quot; + ctrl.list.length + &quot; remaining&quot;),\n                BUTTON({ onclick: ctrl.archive }, &quot;Archive&quot;),\n                UL([\n                    ctrl.list.map(function(todo){\n                        return LI({ class: todo.done()? &quot;done&quot;: &quot;&quot;, onclick: ctrl.vm.done(todo) }, todo.text);\n                    })\n                ]),\n                FORM({ onsubmit: ctrl.addTodo }, [\n                    INPUT({ type: &quot;text&quot;, value: ctrl.vm.input, placeholder: &quot;Add todo&quot;}),\n                    BUTTON({ type: &quot;submit&quot;}, &quot;Add&quot;)\n                ])\n            ]\n        };\n    }\n};\n</code></pre>\n<p>Next we recommend you read</p>\n<p><a href=\"/doc/Creating-a-todo-app-part-2-persistence.md\">Creating a todo app part 2 - persistence</a>, where we will go through adding data persistence functionality.</p>\n","Debugging.md":"<h1><a name=\"debugging-a-miso-app\" class=\"anchor\" href=\"#debugging-a-miso-app\"><span class=\"header-link\">Debugging a miso app</span></a></h1><p>In order to debug a miso app, (or any isomorphic JavaScript app for that matter), you&#39;ll need to be able to debug on both the client and the server. Here we will demonstrate debugging the client-side code using Chrome, and the server code using JetBrains WebStorm 9. Miso can actually be debugged using any standard node and client-side debugging tools that support source maps.</p>\n<p>In this example we&#39;re going to debug the example <code>todos</code> app, so be sure you know how it works, and you know how to install it - if you don&#39;t know how, please read the <a href=\"/doc/Creating-a-todo-app.md\">todos app tutorial</a> first.</p>\n<blockquote>\nOne thing to keep in mind is how miso works: it is isomorphic which means that the code we have is able to run both server and client side. Of course it doesn&#39;t always run on both sides, so here is a handy little table to explain what typically runs where and when, for the todos example:\n</blockquote>\n\n<table>\n<thead>\n<tr>\n<th>File</th>\n<th>action</th>\n<th>Server</th>\n<th>Client</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>/mvc/todo.js</td>\n<td>index</td>\n<td>Runs when a browser loads up <code>/todos</code></td>\n<td>Runs when you interact with anything</td>\n</tr>\n<tr>\n<td>/system/api/flatfiledb.api.js</td>\n<td>find</td>\n<td>Runs when index is run either server (directly) or client side (through the api)</td>\n<td>Never runs on the client - an ajax request is automatically generated by miso</td>\n</tr>\n</tbody>\n</table>\n<p>Those are the only files that are used in the todos example.</p>\n<h2><a name=\"client-side-miso-debugging\" class=\"anchor\" href=\"#client-side-miso-debugging\"><span class=\"header-link\">Client-side miso debugging</span></a></h2><p>Firstly let us make sure that we&#39;ve configured Chrome correctly:</p>\n<ul>\n<li>Open the dev tools (CMD + ALT + J on Mac, F12 on PC)</li>\n<li>Click the setting cog </li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/chrome_cog.jpg\" alt=\"Chrome cog\"></p>\n<ul>\n<li>Scroll down to the &quot;Sources&quot; section</li>\n<li>Make sure that &quot;Enable JavaScript source maps&quot; is ticked and close the settings.</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/chrome_settings.jpg\" alt=\"Chrome todos source\"></p>\n<p>Now Chrome is ready to interact with miso. Next run the miso todo app in development mode - i.e. in the directory you setup miso, run the following:</p>\n<pre><code>miso run\n</code></pre><p>When you&#39;re up and running, go to the todos URL, if everything is setup with defaults, it will be:</p>\n<p><a href=\"/doc/todos.md\">http://localhost:6476/todos</a></p>\n<p>Next open the dev tools in Chrome and:</p>\n<ul>\n<li>Click the &quot;Sources&quot; tab</li>\n<li>Open the &quot;mvc&quot; folder</li>\n<li>Click on the &quot;todo.js&quot; file</li>\n</ul>\n<p>You should now see a todo.js file in the right-hand pane</p>\n<p><img src=\"http://jsguy.com/miso_img/chrome_source_todos.jpg\" alt=\"Chrome todos source\"></p>\n<ul>\n<li>Scroll down to the last line inside the <code>addTodo</code> method</li>\n<li>Click on the line-number next to the return statement to set a breakpoint</li>\n</ul>\n<p>You should now see a mark next to the line, and a breakpoint in the list of breakpoints.</p>\n<p><img src=\"http://jsguy.com/miso_img/chrome_breakpoint.jpg\" alt=\"Chrome todos source\"></p>\n<p>Now we want to try and trigger that breakpoint:</p>\n<ul>\n<li>Enter a value in the &quot;Add todo&quot; box</li>\n<li>Click the &quot;Add&quot; button</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/miso_todos_add.jpg\" alt=\"Chrome todos source\"></p>\n<p>You should now see the breakpoint in action, complete with your value in the local scope.</p>\n<p><img src=\"http://jsguy.com/miso_img/chrome_breakpoint_active.jpg\" alt=\"Chrome todos source\"></p>\n<p>And that&#39;s it for client-side debugging - you can now use the Chrome debugger to inspect and manipulate values, etc...</p>\n<h2><a name=\"server-side-miso-debugging\" class=\"anchor\" href=\"#server-side-miso-debugging\"><span class=\"header-link\">Server-side miso debugging</span></a></h2><blockquote>\nNote: Please clear any breakpoint you might have set in Chrome, so it won&#39;t interfere with our server-side debugging session - of course you can use both together, but for now let us clear them, and also stop the miso server, if it is still running, as we will get WebStorm to handle it for us.\n</blockquote>\n\n<p>In this example we&#39;re going to use <a href=\"/doc/.md\">WebStorm</a> - you can use any IDE that supports node debugging, or free tools such as <a href=\"/doc/node-inspector.md\">node-inspector</a>, so this is simply for illustrative purposes.</p>\n<p>First we need to setup our project, so in Webstorm:</p>\n<ul>\n<li>Create a new project, setting your miso directory as the root.</li>\n<li>Add a new node project configuration, with the following settings:</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_configure_project.jpg\" alt=\"Chrome todos source\"></p>\n<ul>\n<li>Now hit the debug button</li>\n</ul>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_debug_button.jpg\" alt=\"Chrome todos source\"></p>\n<p>You should see miso running in the WebStorm console like so:</p>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_console.jpg\" alt=\"Chrome todos source\"></p>\n<ul>\n<li>Now open <code>/system/api/flatfiledb/flatfiledb.api.js</code>, and put a breakpoint on the last line of the <code>find</code> method.</li>\n</ul>\n<p>Now if you go back to your browser todos app:</p>\n<p><a href=\"/doc/todos.md\">http://localhost:6476/todos</a></p>\n<p>Reload the page, and you will see the breakpoint being activated in WebStorm:</p>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_breakpoint_active.jpg\" alt=\"Chrome todos source\"></p>\n<p>Now click the &quot;resume program button&quot;, and you&#39;ll see that the breakpoint it is immediately invoked again! </p>\n<p><img src=\"http://jsguy.com/miso_img/webstorm_breakpoint_data.jpg\" alt=\"Chrome todos source\"></p>\n<p>This is simply because miso renders the first page on the server - so depending on how you structure your queries, it will use the API twice - once from the server side rendering, and once from the client-side. Don&#39;t worry - this only happens on initial page load in order to render the first page both server side and client side, you can read more about how that works here:</p>\n<p><a href=\"/doc/How-miso-works#first-page-load.md\">How miso works: First page load</a></p>\n<p>So, you are now able to inspect the values, and do any kind of server side debugging you like.</p>\n","Getting-started.md":"<p>This guide will take you through making your first miso app, it is assumed that you know the basics of how to use nodejs and mithril.</p>\n<h2><a name=\"installation\" class=\"anchor\" href=\"#installation\"><span class=\"header-link\">Installation</span></a></h2><p>To install miso, use npm:</p>\n<pre><code class=\"lang-javascript\">npm install misojs -g\n</code></pre>\n<p>To create and run a miso app in a new directory:</p>\n<pre><code class=\"lang-javascript\">miso -n myapp\ncd myapp\nmiso run\n</code></pre>\n<p>You should now see something like:</p>\n<pre><code>Miso is listening at http://localhost:6476 in development mode\n</code></pre><p>Open your browser at <code>http://localhost:6476</code> and you will see the default miso screen</p>\n<h2><a name=\"hello-world-app\" class=\"anchor\" href=\"#hello-world-app\"><span class=\"header-link\">Hello world app</span></a></h2><p>Create a new file <code>hello.js</code> in <code>myapp/mvc</code> like so:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new edit.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return DIV(&quot;Hello &quot; + ctrl.model.who());\n        }\n    }\n};\n</code></pre>\n<p>Then open <a href=\"/doc/YOURNAME.md\">http://localhost:6476/hello/YOURNAME</a> and you should see &quot;Hello YOURNAME&quot;. Change the url to have your actual name instead of YOURNAME, you now know miso :)</p>\n<p>Let us take a look at what each piece of the code is actually doing:</p>\n<h3><a name=\"includes\" class=\"anchor\" href=\"#includes\"><span class=\"header-link\">Includes</span></a></h3><blockquote>\nSummary: Mithril is the only required library when apps, but using other included libraries is very useful\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m);\n</code></pre>\n<p>Here we grab mithril, then miso utilities and sugar tags - technically speaking, we really only need mithril, but the other libraries are very useful as well as we will see.</p>\n<h3><a name=\"models\" class=\"anchor\" href=\"#models\"><span class=\"header-link\">Models</span></a></h3><blockquote>\nSummary: Use the automatic routing when you can, always put models on the &#39;models&#39; attribute of your mvc file\n</blockquote>\n\n<pre><code class=\"lang-javascript\">var edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n</code></pre>\n<p>Here a few important things are going on:</p>\n<ul>\n<li><p>By placing our <code>mvc</code> object on <code>module.exports.edit</code>, automatic routing is applied by miso - you can read more about <a href=\"/doc/How-miso-works#route-by-convention.md\">how the automatic routing works here</a>. </p>\n</li>\n<li><p>Placing our <code>hello</code> model on the <code>models</code> attribute of the object ensures that miso can figure out what your models are, and will create a persistence API automatically for you when the server starts up, so that you can save your models into the database.</p>\n</li>\n</ul>\n<h3><a name=\"controller\" class=\"anchor\" href=\"#controller\"><span class=\"header-link\">Controller</span></a></h3><blockquote>\nSummary: DO NOT forget to &#39;return this;&#39; in the controller, it is vital!\n</blockquote>\n\n<pre><code class=\"lang-javascript\">controller: function(params) {\n    var who = miso.getParam(&#39;hello_id&#39;, params);\n    this.model = new edit.models.hello({who: who});\n    return this;\n},\n</code></pre>\n<p>The controller uses <code>miso.getParam</code> to retreive the parameter - this is so that it can work seamlessly on both the server and client side. We create a new model, and very importantly <code>return this</code> ensures that miso can get access to the controller correctly.</p>\n<h3><a name=\"view\" class=\"anchor\" href=\"#view\"><span class=\"header-link\">View</span></a></h3><blockquote>\nSummary: Use sugartags to make the view look more like HTML\n</blockquote>\n\n<pre><code class=\"lang-javascript\">view: function(ctrl) {\n    with(sugartags) {\n        return DIV(&quot;Hello &quot; + ctrl.model.who());\n    }\n}\n</code></pre>\n<p>The view is simply a javascript function that returns a structure. Here we use the <code>sugartags</code> library to render the DIV tag - this is strictly not required, but I find that people tend to understand the sugartags syntax better than pure mithril, as it looks a little more like HTML, though of course you could use standard mithril syntax if you prefer.</p>\n<h3><a name=\"next\" class=\"anchor\" href=\"#next\"><span class=\"header-link\">Next</span></a></h3><p>You now have a complete hello world app, and understand the fundamentals of the structure of a miso mvc application.</p>\n<p>We have only just scraped the surface of what miso is capable of, so next we recommend you read:</p>\n<p><a href=\"/doc/Creating-a-todo-app.md\">Creating a todo app</a></p>\n","Goals.md":"<h1><a name=\"primary-goals\" class=\"anchor\" href=\"#primary-goals\"><span class=\"header-link\">Primary goals</span></a></h1><ul>\n<li>Easy setup of <a href=\"/doc/.md\">isomorphic</a> application based on <a href=\"/doc/mithril.js.md\">mithril</a></li>\n<li>Skeleton / scaffold / Boilerplate to allow users to very quickly get up and running.</li>\n<li>minimal core</li>\n<li>easy extendible</li>\n<li>DB agnostic (e. G. plugins for different ORM/ODM)</li>\n</ul>\n<h1><a name=\"components\" class=\"anchor\" href=\"#components\"><span class=\"header-link\">Components</span></a></h1><ul>\n<li>Routing</li>\n<li>View rendering</li>\n<li>i18n/l10n</li>\n<li>Rest-API (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>optional Websockets (could use restify: <a href=\"/doc/.md\">http://mcavage.me/node-restify/</a>)</li>\n<li>easy testing (headless and Browser-Tests)</li>\n<li>login/session handling</li>\n<li>models with validation</li>\n</ul>\n<h1><a name=\"useful-libs\" class=\"anchor\" href=\"#useful-libs\"><span class=\"header-link\">Useful libs</span></a></h1><p>Here are some libraries we are considering using, (in no particular order):</p>\n<ul>\n<li>leveldb</li>\n<li>mithril-query</li>\n<li>translate.js</li>\n<li>i18next</li>\n</ul>\n<p>And some that we&#39;re already using:</p>\n<ul>\n<li>express</li>\n<li>browserify</li>\n<li>mocha/expect</li>\n<li>mithril-node-render</li>\n<li>mithril-sugartags</li>\n<li>mithril-bindings</li>\n<li>mithril-animate</li>\n<li>lodash</li>\n<li>validator</li>\n</ul>\n","Home.md":"<p>Welcome to the misojs wiki!</p>\n<h2><a name=\"getting-started\" class=\"anchor\" href=\"#getting-started\"><span class=\"header-link\">Getting started</span></a></h2><p>Read the <a href=\"/doc/Getting-started.md\">Getting started</a> guide!</p>\n<h2><a name=\"more-info\" class=\"anchor\" href=\"#more-info\"><span class=\"header-link\">More info</span></a></h2><p>See the <a href=\"/doc/misojs#install.md\">install guide</a>.\nRead <a href=\"/doc/How-miso-works.md\">how miso works</a>, and check out <a href=\"/doc/Patterns.md\">the patterns</a>, then create something cool!</p>\n","How-miso-works.md":"<h2><a name=\"models-views-controllers\" class=\"anchor\" href=\"#models-views-controllers\"><span class=\"header-link\">Models, views, controllers</span></a></h2><p>When creating a route, you must assign a controller and a view to it - this is achieved by creating a file in the <code>/mvc</code> directory - by convention, you should name it as per the path you want, (see the <a href=\"/doc/#routing.md\">routing section</a> for details).</p>\n<p>Here is a minimal example using the sugartags, and getting a parameter:</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nmodule.exports.index = {\n    controller: function(params) {\n        this.who = miso.getParam(&#39;who&#39;, params, &#39;world&#39;);\n        return this;\n    },\n    view: function(ctrl){\n        with(sugartags) {\n            return DIV(&#39;Hello &#39; + ctrl.who);\n        }\n    }\n};\n</code></pre>\n<p>Save this into a file <code>/mvc/hello.js</code>, and open <a href=\"/doc/hellos.md\">http://localhost/hellos</a>, this will show &quot;Hello world&quot;. Note the &#39;s&#39; on the end - this is due to how the <a href=\"/doc/#route-by-convention.md\">route by convention</a> works.</p>\n<p>Now open <code>/cfg/routes.json</code>, and add the following routes:</p>\n<pre><code class=\"lang-javascript\">    &quot;/hello&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/hello/:who&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;hello&quot;, &quot;action&quot;: &quot;index&quot; }\n</code></pre>\n<p>Save the file, and go back to the browser, and you&#39;ll see an error! This is because we have now overridden the automatic route. Open <a href=\"/doc/hello.md\">http://localhost/hello</a>, and you&#39;ll see our action. Now open <a href=\"/doc/YOURNAME.md\">http://localhost/hello/YOURNAME</a>, and you&#39;ll see it getting the first parameter, and greeting you!</p>\n<h2><a name=\"routing\" class=\"anchor\" href=\"#routing\"><span class=\"header-link\">Routing</span></a></h2><p>The routing can be defined in one of two ways</p>\n<h3><a name=\"route-by-convention\" class=\"anchor\" href=\"#route-by-convention\"><span class=\"header-link\">Route by convention</span></a></h3><p>You can use a naming convention as follows:</p>\n<table>\n<thead>\n<tr>\n<th>Action</th>\n<th>Method</th>\n<th>URL</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>index</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39;</td>\n<td>List the items</td>\n</tr>\n<tr>\n<td>edit</td>\n<td>GET</td>\n<td>[controller]/[id]</td>\n<td>Display a form to edit the item</td>\n</tr>\n<tr>\n<td>new</td>\n<td>GET</td>\n<td>[controller] + &#39;s&#39; + &#39;/new&#39;</td>\n<td>Display a form to add a new item</td>\n</tr>\n</tbody>\n</table>\n<p>Say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/users&quot;.<br>Now say you have a mvc file named &quot;user.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.edit = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/user/:user_id&quot;, so that users can access via a route such as &quot;/user/27&quot; for use with ID of 27. <em>Note:</em> You can get the user_id using a miso utility: <code>var userId = miso.getParam(&#39;user_id&#39;, params);</code>.</p>\n<h3><a name=\"route-by-configuration\" class=\"anchor\" href=\"#route-by-configuration\"><span class=\"header-link\">Route by configuration</span></a></h3><p>By using <code>/cfg/routes.json</code> config file:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;[Pattern]&quot;: { &quot;method&quot;: &quot;[Method]&quot;, &quot;name&quot;: &quot;[Route name]&quot;, &quot;action&quot;: &quot;[Action]&quot; }\n}\n</code></pre>\n<p>Where:</p>\n<ul>\n<li><strong>Pattern</strong> - the <a href=\"/doc/#routing-patterns.md\">route pattern</a> we want, including any parameters</li>\n<li><strong>Method</strong> - one of &#39;GET&#39;, &#39;POST&#39;, &#39;PUT&#39;, &#39;DELETE&#39;</li>\n<li><strong>Route</strong> name - name of your route file from /mvc</li>\n<li><strong>Action</strong> - name of the action to call on your route file from /mvc</li>\n</ul>\n<p><strong>Example</strong></p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;home&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This will map a &quot;GET&quot; to the root of the URL for the <code>index</code> action in <code>home.js</code></p>\n<p><strong>Note:</strong> The routing config will override any automatically defined routes, so if you need multiple routes to point to the same action, you must manually define them. For example, if you have a mvc file named &quot;term.js&quot;, and you define an action like so:</p>\n<pre><code class=\"lang-javascript\">module.exports.index = {...\n</code></pre>\n<p>Miso will automatically map a &quot;GET&quot; to &quot;/terms&quot;. Now, if you want to map it also to &quot;/AGB&quot;, you will need to add two entries in the routes config:</p>\n<pre><code class=\"lang-javascript\">{\n    &quot;/terms&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; },\n    &quot;/AGB&quot;: { &quot;method&quot;: &quot;get&quot;, &quot;name&quot;: &quot;terms&quot;, &quot;action&quot;: &quot;index&quot; }\n}\n</code></pre>\n<p>This is because Miso assumes that if you override the defaulted routes, you actually want to replace them, not just override them. <em>Note:</em> this is correct behaviour, as it minority case is when you want more than one route pointing to the same action.</p>\n<h3><a name=\"routing-patterns\" class=\"anchor\" href=\"#routing-patterns\"><span class=\"header-link\">Routing patterns</span></a></h3><table>\n<thead>\n<tr>\n<th>Type</th>\n<th>Example</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Path</td>\n<td>&quot;/abcd&quot; - match paths starting with /abcd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/abc?d&quot; - match paths starting with /abcd and /abd</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab+cd&quot; - match paths starting with /abcd, /abbcd, /abbbbbcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/ab*cd&quot; - match paths starting with /abcd, /abxcd, /abFOOcd, /abbArcd and so on</td>\n</tr>\n<tr>\n<td>Path Pattern</td>\n<td>&quot;/a(bc)?d&quot; - will match paths starting with /ad and /abcd</td>\n</tr>\n<tr>\n<td>Regular Expression</td>\n<td>/\\/abc&#124;\\/xyz/ - will match paths starting with /abc and /xyz</td>\n</tr>\n<tr>\n<td>Array</td>\n<td>[&quot;/abcd&quot;, &quot;/xyza&quot;, /\\/lmn&#124;\\/pqr/] - match paths starting with /abcd, /xyza, /lmn, and /pqr</td>\n</tr>\n</tbody>\n</table>\n<h3><a name=\"links\" class=\"anchor\" href=\"#links\"><span class=\"header-link\">Links</span></a></h3><p>When you create links, in order to get the app to work as an SPA, you must pass in m.route as a config, so that the history will be updated correctly, for example:</p>\n<pre><code class=\"lang-javascript\">A({href:&quot;/users/new&quot;, config: m.route}, &quot;Add new user&quot;)\n</code></pre>\n<p>This will correctly work as a SPA. If you leave out <code>config: m.route</code>, the app will still work, but the page will reload every time the link is followed.</p>\n<p>Note: if you are planning to manually route, ie: use <code>m.route</code>, be sure to use the name of the route, not a URL. Ie: if you have a route &quot;/account&quot;, using <code>m.route(&quot;http://p1.io/account&quot;)</code> won&#39;t match, mithril is expecting <code>m.route(&quot;/account&quot;)</code> instead of the full URL.</p>\n<h2><a name=\"data-models\" class=\"anchor\" href=\"#data-models\"><span class=\"header-link\">Data models</span></a></h2><p>Data models are progressively enhanced mithril models - you simply create your model as usual, then add validation and type information as it becomes pertinent.\nFor example, say you have a model like so:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n    return this;\n}\n</code></pre>\n<p>In order to make it validatable, add the validator module:</p>\n<pre><code class=\"lang-javascript\">var validate = require(&#39;validator.modelbinder&#39;);\n</code></pre>\n<p>Then add a <code>isValid</code> validation method to your model, with any declarations based on <a href=\"/doc/validator.js#validators.md\">node validator</a>:</p>\n<pre><code class=\"lang-javascript\">var userModel = function(data){\n    this.name = m.p(data.name||&quot;&quot;);\n    this.email = m.p(data.email||&quot;&quot;);\n    this.id = m.p(data._id||&quot;&quot;);\n\n    //    Validate the model        \n    this.isValid = validate.bind(this, {\n        name: {\n            isRequired: &quot;You must enter a name&quot;\n        },\n        email: {\n            isRequired: &quot;You must enter an email address&quot;,\n            isEmail: &quot;Must be a valid email address&quot;\n        }\n    });\n\n    return this;\n};\n</code></pre>\n<p>This creates a method that the miso database api can use to validate your model.\nYou get full access to the validation info as well, so you can show an error message near your field, for example:</p>\n<pre><code class=\"lang-javascript\">user.isValid(&#39;email&#39;)\n</code></pre>\n<p>Will return <code>true</code> if the <code>email</code> property of your user model is valid, or a list of errors messages if it is invalid:</p>\n<pre><code class=\"lang-javascript\">[&quot;You must enter an email address&quot;, &quot;Must be a valid email address&quot;]\n</code></pre>\n<p>So you can for example add a class name to a div surrounding your field like so:</p>\n<pre><code class=\"lang-javascript\">DIV({class: (ctrl.user.isValid(&#39;email&#39;) == true? &quot;valid&quot;: &quot;invalid&quot;)}, [...\n</code></pre>\n<p>And show the error messages like so:</p>\n<pre><code class=\"lang-javascript\">SPAN(ctrl.user.isValid(&#39;email&#39;) == true? &quot;&quot;: ctrl.user.isValid(&#39;email&#39;).join(&quot;, &quot;))\n</code></pre>\n<h2><a name=\"database-api-and-model-interaction\" class=\"anchor\" href=\"#database-api-and-model-interaction\"><span class=\"header-link\">Database api and model interaction</span></a></h2><p>Miso uses the model definitions that you declare in your <code>mvc</code> file to build up a set of models that the API can use, the model definitions work like this:</p>\n<ul>\n<li>On the models attribute of the mvc, we  define a standard mithril data model, (ie: a javascript object where properties can be either standard javascript data types, or a function that works as a getter/setter, eg: <code>m.prop</code>)</li>\n<li>On server startup, miso reads this and creates a cache of the model objects, including the name space of the model, eg: &quot;hello.edit.hello&quot;</li>\n<li>Models can optionally include data validation information, and the database api will get access to this.</li>\n</ul>\n<p>Assuming we have a model in the hello.models object like so:</p>\n<pre><code class=\"lang-javascript\">hello: function(data){\n    this.who = m.prop(data.who);\n    this.isValid = validate.bind(this, {\n        who: {\n            isRequired: &quot;You must know who you are talking to&quot;\n        }\n    });\n}\n</code></pre>\n<p>The API works like this:</p>\n<ul>\n<li>We create an endpoint at <code>/api</code> where each we load whatever api is configured in <code>/cfg/server.json</code>, and expose each method. For example <code>/api/save</code> is available for the default <code>flatfiledb</code> api.</li>\n<li>Next we create a set of API files - one for client, (/system/api.client.js), and one for server (/system/api.server.js) - each have the same methods, but do vastly different things:<ul>\n<li>api.client.js is a thin wrapper that uses mithril&#39;s m.request to create an ajax request to the server API, it simply passes messages back and forth (in JSON RPC 2.0 format).</li>\n<li>api.server.js calls the database api methods, which in turn handles models and validation so for example when a request is made and a <code>type</code> and <code>model</code> is included, we can re-construct the data model based on this info, for example you might send: {type: &#39;hello.edit.hello&#39;, model: {who: &#39;Dave&#39;}}, this can then be cast back into a model that we can call the <code>isValid</code> method on.</li>\n</ul>\n</li>\n</ul>\n<p><strong>Now, the important bit:</strong> The reason for all this functionality is that mithril internally delays rendering to the DOM whilst a request is going on, so we need to handle this within miso - in order to be able to render things on the server - so we have a binding system that delays rendering whilst an async request is still being executed. That means mithril-like code like this:</p>\n<pre><code class=\"lang-javascript\">controller: function(){\n    var ctrl = this;\n    api.find({type: &#39;hello.index.hello&#39;}).then(function(data) {\n        var list = Object.keys(data.result).map(function(key) {\n            var myHello = data.result[key];\n            return new self.models.hello(myHello);\n        });\n        ctrl.model = new ctrl.vm.todoList(list);\n    });\n    return ctrl;\n}\n</code></pre>\n<p>Will still work. Note: the magic here is that there is absolutely nothing in the code above that runs a callback to let mithril know the data is ready - this is a design feature of mithril to delay rendering automatically whilst an <code>m.request</code> is in progress, so we cater for this to have the ability to render the page server-side first, so that SEO works out of the box.</p>\n<h2><a name=\"client-vs-server-code\" class=\"anchor\" href=\"#client-vs-server-code\"><span class=\"header-link\">Client vs server code</span></a></h2><p>In miso, you include files using the standard nodejs <code>require</code> function. When you need to do something that works differently in the client than the server, there are a few ways you can achieve it:</p>\n<ul>\n<li>The recommended way is to create and require a file in the <code>modules/</code> directory, and then create the same file with a &quot;.client&quot; before the extension, and miso will automatically load that file for you on the client side instead. For example if you have <code>/modules/something.js</code>, if you create <code>/modules/something.client.js</code>, miso will automatically use that on the client.</li>\n<li>Another option is to use <code>miso.util</code> - you can use <code>miso.util.isServer()</code> to test if you&#39;re on the server or not, though it is better practice to use the &quot;.client&quot; method mentioned above - only use <code>isServer</code> if you absolutely have no other option.</li>\n</ul>\n<h2><a name=\"first-page-load\" class=\"anchor\" href=\"#first-page-load\"><span class=\"header-link\">First page load</span></a></h2><p>When a new user enters your site via a URL, and miso loads the first page, a number of things happen:</p>\n<ul>\n<li>The server generates the page, including any data the user might have access to. This is mainly for SEO purposes, but also to make the perceptible loading time less, plus provide beautiful urls out of the box. </li>\n<li>Once the page has loaded, mithril kicks in and creates a XHR (ajax) request to retreive the data, and setup any events and the virtual DOM, etc.</li>\n</ul>\n<p>Now you might be thinking: we don&#39;t really need that 2nd request for data - it&#39;s already in the page, right? Well, sort of - you see miso does not make any assumptions about the structure of your data, or how you want to use it in your models, so there is no way for us to re-use that data, as it could be any structure.\nAnother key feature of miso is the fact that all actions can be bookmarkable - for example the <a href=\"/doc/users.md\">/users</a> app - click on a user, and see the url change - we didn&#39;t do another server round-trip, but rather just a XHR request that returned the data we required - the UI was completely rendered client side - so it&#39;s really on that first time we load the page that you end up loading the data twice.</p>\n<p>So that is the reason the architecture works the way it does, and has that seemingly redundant 2nd request for the data - it is a small price to pay for SEO, and perceptibly quick loading pages and as mentioned, it only ever happens on the first page load.</p>\n<p>Of course you could implement caching of the data yourself, if the 2nd request is an issue - after all you might be loading quite a bit of data. One way to do this would be like so (warning: rather contrived example follows):</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../modules/miso.util.js&#39;),\n    sugartags = require(&#39;mithril.sugartags&#39;)(m),\n    db = require(&#39;../system/api/flatfiledb/api.server.js&#39;)(m);\n\nvar edit = module.exports.edit = {\n    models: {\n        hello: function(data){\n            this.who = m.prop(data.who);\n        }\n    },\n    controller: function(params) {\n        var ctrl = this,\n            who = miso.getParam(&#39;hello_id&#39;, params);\n\n        //    Check if our data is available, if so: use it.\n        if(typeof myPerson !== &quot;undefined&quot;) {\n            ctrl.model = new edit.models.hello({who: myPerson});\n        } else {\n        //    If not, load it first.\n            db.find({type: &#39;user.edit.user&#39;}).then(function(data) {\n                ctrl.model = new edit.models.hello({who: data.result[0].name});\n            });\n        }\n\n        return ctrl;\n    },\n    view: function(ctrl) {\n        with(sugartags) {\n            return [\n                //    Add a client side global variable with our data\n                SCRIPT(&quot;var myPerson = &#39;&quot; + ctrl.model.who() + &quot;&#39;&quot;),\n                DIV(&quot;G&#39;day &quot; + ctrl.model.who())\n            ]\n        }\n    }\n};\n</code></pre>\n<p>So this will only load the data on the server side - as you can see, we need to know the shape of the data to use it, and we are using a global variable here to store the data client side - I don&#39;t really recommend this approach, as it seems like a lot of work to save a single XHR request. However I understand you might have unique circumstances where the first data load could be a problem, so at least this is an option you can use to cache the data on first page load.</p>\n<h2><a name=\"requiring-files\" class=\"anchor\" href=\"#requiring-files\"><span class=\"header-link\">Requiring files</span></a></h2><p>When requiring files, be sure to do so in a static manner so that browserify is able to compile the client side script. Always use:</p>\n<pre><code class=\"lang-javascript\">var miso = require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>NEVER DO ANY OF THESE:</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar miso = new require(&#39;../server/miso.util.js&#39;);\n</code></pre>\n<p>This will create an object, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n<pre><code class=\"lang-javascript\">//  DON&#39;T DO THIS!\nvar thing = &#39;miso&#39;;\nvar miso = require(&#39;../server/&#39;+thing+&#39;.util.js&#39;);\n</code></pre>\n<p>This will create an expression, which means <a href=\"/doc/824.md\">browserify cannot resolve it statically</a>, and will ignore it.</p>\n","Patterns.md":"<p>There are several ways you can write your app and miso is not opinionated about how you go about this so it is important that you choose a pattern that suits your needs. Below are a few suggested patterns to follow when developing apps.</p>\n<p><strong>Note:</strong> miso is a single page app that loads server rendered HTML from any URL, so that SEO works out of the box.</p>\n<h2><a name=\"single-url-mvc\" class=\"anchor\" href=\"#single-url-mvc\"><span class=\"header-link\">Single url mvc</span></a></h2><p>In this pattern everything that your mvc needs to do is done on a single url for all the associated actions. The advantage for this style of development is that you have everything in one mvc container, and you don&#39;t need to map any routes - of course the downside being that there are no routes for the user to bookmark. This is pattern works well for smaller entities where there are not too many interactions that the user can do - this is essentially how most mithril apps are written - self-contained, and at a single url.</p>\n<p>Here is a &quot;hello world&quot; example using the single url pattern</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar self = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new self.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>This would expose a url /hellos (note: the &#39;s&#39;), and would display &quot;Hello world&quot;. (You can change the route using custom routing)</p>\n<h2><a name=\"multi-url-mvc\" class=\"anchor\" href=\"#multi-url-mvc\"><span class=\"header-link\">Multi url mvc</span></a></h2><p>In this pattern we expose multiple mvc routes that in turn translate to multiple URLs. This is useful for splitting up your app, and ensuring each mvc has its own sets of concerns.</p>\n<pre><code class=\"lang-javascript\">var m = require(&#39;mithril&#39;),\n    miso = require(&#39;../server/miso.util.js&#39;),\n    sugartags = require(&#39;../server/mithril.sugartags.node.js&#39;)(m);\n\nvar index = module.exports.index = {\n    models: {\n        //    Our model\n        hello: function(data){\n            this.who = m.p(data.who);\n        }\n    },\n    controller: function(params) {\n        this.model = new index.models.hello({who: &quot;world&quot;});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who()),\n                A({href: &quot;/hello/Leo&quot;, config: m.route}, &quot;Click me for the edit action&quot;)\n            ];\n        }\n    }\n};\n\nvar edit = module.exports.edit = {\n    controller: function(params) {\n        var who = miso.getParam(&#39;hello_id&#39;, params);\n        this.model = new index.models.hello({who: who});\n        return this;\n    },\n    view: function(ctrl) {\n        var model = ctrl.model;\n        with(sugartags) {\n            return [\n                DIV(&quot;Hello &quot; + model.who())\n            ];\n        }\n    }\n};\n</code></pre>\n<p>Here we also expose a &quot;/hello/[NAME]&quot; url, that will show your name when you visit /hello/[YOUR NAME], so there are now multiple urls for our SPA:</p>\n<ul>\n<li><strong>/hellos</strong> - this is intended to be an index page that lists all your &quot;hellos&quot;</li>\n<li><strong>/hello/[NAME]</strong> - this is intended to be an edit page where you can edit your &quot;hellos&quot;</li>\n</ul>\n<p>Note that the anchor tag has <code>config: m.route</code> in it&#39;s options - this is so that we can route automatically though mithril</p>\n"}; };
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
var apiClientPath = '';
	return {
'find': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: apiClientPath + '/api/authentication/find',
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
			url: apiClientPath + '/api/authentication/save',
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
			url: apiClientPath + '/api/authentication/remove',
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
			url: apiClientPath + '/api/authentication/authenticate',
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
			url: apiClientPath + '/api/authentication/login',
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
			url: apiClientPath + '/api/authentication/logout',
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
			url: apiClientPath + '/api/authentication/findUsers',
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
			url: apiClientPath + '/api/authentication/saveUser',
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
var apiClientPath = '';
	return {
'find': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: apiClientPath + '/api/flatfiledb/find',
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
			url: apiClientPath + '/api/flatfiledb/save',
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
			url: apiClientPath + '/api/flatfiledb/remove',
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
			url: apiClientPath + '/api/flatfiledb/authenticate',
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
},{}],21:[function(require,module,exports){
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
var apiClientPath = '';
	return {
'photos': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: apiClientPath + '/api/flickr/photos',
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
},{}],22:[function(require,module,exports){
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
var apiClientPath = '';
	return {
'get': function(args, options){
	args = args || {};
	options = options || {};
	var requestObj = {
			method:'post', 
			url: apiClientPath + '/api/session/get',
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
			url: apiClientPath + '/api/session/set',
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
},{}],23:[function(require,module,exports){
/* NOTE: This is a generated file, please do not modify it, your changes will be lost */var m = require('mithril');var sugartags = require('mithril.sugartags')(m);var bindings = require('mithril.bindings')(m);var animate = require('../public/js/mithril.animate.js')(m);var permissions = require('../system/miso.permissions.js');var layout = require('../mvc/layout_miso.js');var restrict = function(route, actionName){	return route;},permissionObj = {};var misoGlobal = misoGlobal || {};if(typeof window !== "undefined"){	window.misoGlobal = misoGlobal;}var user = require('../mvc/user.js');
var home = require('../mvc/home.js');
var doc = require('../mvc/doc.js');

var hello = require('../mvc/hello.js');
var login = require('../mvc/login.js');
var mobilehome = require('../mvc/mobilehome.js');

var todo = require('../mvc/todo.js');

if(typeof window !== 'undefined') {	window.m = m;}	m.route.mode = 'pathname';m.route(document.getElementById('misoAttachmentNode'), '/', {'/users/new': restrict(user.new, 'user.new'),
'/': restrict(home.index, 'home.index'),
'/doc/:doc_id': restrict(doc.edit, 'doc.edit'),
'/docs': restrict(doc.index, 'doc.index'),
'/hello/:hello_id': restrict(hello.edit, 'hello.edit'),
'/login': restrict(login.index, 'login.index'),
'/mobilehome': restrict(mobilehome.index, 'mobilehome.index'),
'/mobiletest': restrict(mobilehome.test, 'mobilehome.test'),
'/todos': restrict(todo.index, 'todo.index'),
'/user/:user_id': restrict(user.edit, 'user.edit'),
'/users': restrict(user.index, 'user.index')});misoGlobal.renderHeader = function(obj){	var headerNode = document.getElementById('misoHeaderNode');	if(headerNode){		m.render(document.getElementById('misoHeaderNode'), layout.headerContent? layout.headerContent({misoGlobal: obj || misoGlobal}): '');	}};misoGlobal.renderHeader();
},{"../mvc/doc.js":2,"../mvc/hello.js":3,"../mvc/home.js":4,"../mvc/layout_miso.js":5,"../mvc/login.js":6,"../mvc/mobilehome.js":7,"../mvc/todo.js":8,"../mvc/user.js":9,"../public/js/mithril.animate.js":15,"../system/miso.permissions.js":24,"mithril":12,"mithril.bindings":10,"mithril.sugartags":11}],24:[function(require,module,exports){
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
},{"../modules/miso.util.client.js":1}]},{},[23])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtb2R1bGVzL21pc28udXRpbC5jbGllbnQuanMiLCJtdmMvZG9jLmpzIiwibXZjL2hlbGxvLmpzIiwibXZjL2hvbWUuanMiLCJtdmMvbGF5b3V0X21pc28uanMiLCJtdmMvbG9naW4uanMiLCJtdmMvbW9iaWxlaG9tZS5qcyIsIm12Yy90b2RvLmpzIiwibXZjL3VzZXIuanMiLCJub2RlX21vZHVsZXMvbWl0aHJpbC5iaW5kaW5ncy9kaXN0L21pdGhyaWwuYmluZGluZ3MuanMiLCJub2RlX21vZHVsZXMvbWl0aHJpbC5zdWdhcnRhZ3MvbWl0aHJpbC5zdWdhcnRhZ3MuanMiLCJub2RlX21vZHVsZXMvbWl0aHJpbC9taXRocmlsLmpzIiwibm9kZV9tb2R1bGVzL3ZhbGlkYXRvci5tb2RlbGJpbmRlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92YWxpZGF0b3IvdmFsaWRhdG9yLmpzIiwicHVibGljL2pzL21pdGhyaWwuYW5pbWF0ZS5qcyIsInB1YmxpYy9qcy9taXRocmlsLmFuaW1hdGUubm9iaW5kLmpzIiwicHVibGljL2pzL21pdGhyaWwuc21vb3Roc2Nyb2xsLmpzIiwicHVibGljL21pc28uZG9jdW1lbnRhdGlvbi5qcyIsInN5c3RlbS9hcGkvYXV0aGVudGljYXRpb24vYXBpLmNsaWVudC5qcyIsInN5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuY2xpZW50LmpzIiwic3lzdGVtL2FwaS9mbGlja3IvYXBpLmNsaWVudC5qcyIsInN5c3RlbS9hcGkvc2Vzc2lvbi9hcGkuY2xpZW50LmpzIiwic3lzdGVtL21haW4uanMiLCJzeXN0ZW0vbWlzby5wZXJtaXNzaW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdm9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2h1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vXHRWYXJpb3VzIHV0aWxpdGllcyB0aGF0IG5vcm1hbGlzZSB1c2FnZSBiZXR3ZWVuIGNsaWVudCBhbmQgc2VydmVyXG4vL1x0VGhpcyBpcyB0aGUgY2xpZW50IHZlcnNpb24gLSBzZWUgbWlzby51dGlsLmpzIGZvciBzZXJ2ZXIgdmVyc2lvblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHQvL1x0QXJlIHdlIG9uIHRoZSBzZXJ2ZXI/XG5cdGlzU2VydmVyOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdFxuXHQvL1x0RWFjaCBhYnN0cmFjdGlvblxuXHQvL1x0XG5cdC8vXHRtaXNvLmVhY2goWydoZWxsbycsICd3b3JsZCddLCBmdW5jdGlvbih2YWx1ZSwga2V5KXtcblx0Ly9cdFx0Y29uc29sZS5sb2codmFsdWUsIGtleSk7XG5cdC8vXHR9KTtcblx0Ly9cdC8vXHRoZWxsbyAwXFxuaGVsbG8gMVxuXHQvL1xuXHQvLyBcdG1pc28uZWFjaCh7J2hlbGxvJzogJ3dvcmxkJ30sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xuXHQvL1x0XHRjb25zb2xlLmxvZyh2YWx1ZSwga2V5KTtcblx0Ly9cdH0pO1xuXHQvL1x0Ly9cdHdvcmxkIGhlbGxvXG5cdC8vXG5cdGVhY2g6IGZ1bmN0aW9uKG9iaiwgZm4pIHtcblx0XHRpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJyApIHtcblx0XHRcdHJldHVybiBvYmoubWFwKGZuKTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIG9iaiA9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uKGtleSl7XG5cdFx0XHRcdHJldHVybiBmbihvYmpba2V5XSwga2V5KTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZm4ob2JqKTtcblx0XHR9XG5cdH0sXG5cblx0cmVhZHlCaW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGJpbmRpbmdzID0gW107XG5cdFx0cmV0dXJuIHtcblx0XHRcdGJpbmQ6IGZ1bmN0aW9uKGNiKSB7XG5cdFx0XHRcdGJpbmRpbmdzLnB1c2goY2IpO1xuXHRcdFx0fSxcblx0XHRcdHJlYWR5OiBmdW5jdGlvbigpe1xuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgYmluZGluZ3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRiaW5kaW5nc1tpXSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fSxcblxuXHQvL1x0R2V0IHBhcmFtZXRlcnMgZm9yIGFuIGFjdGlvblxuXHRnZXRQYXJhbTogZnVuY3Rpb24oa2V5LCBwYXJhbXMsIGRlZil7XG5cdFx0cmV0dXJuIHR5cGVvZiBtLnJvdXRlLnBhcmFtKGtleSkgIT09IFwidW5kZWZpbmVkXCI/IG0ucm91dGUucGFyYW0oa2V5KTogZGVmO1xuXHR9LFxuXG5cdC8vXHRHZXQgY29yZG92YSBvciBub3JtYWwgcmVsYXRpdmUgdXJsXG5cdHVybDogZnVuY3Rpb24ocmVsYXRpdmVVcmwpe1xuXHRcdHZhciBteUNvcmRvdmEgPSB0eXBlb2YgY29yZG92YSAhPT0gXCJ1bmRlZmluZWRcIj8gY29yZG92YToge1xuXHRcdFx0ZmlsZToge1xuXHRcdFx0XHRhcHBsaWNhdGlvbkRpcmVjdG9yeTogXCJcIlxuXHRcdFx0fVxuXHRcdH07XG5cdFx0cmV0dXJuIG15Q29yZG92YS5maWxlLmFwcGxpY2F0aW9uRGlyZWN0b3J5ICsgcmVsYXRpdmVVcmw7XG5cdH0sXG5cblx0Ly9cdEdldCBpbmZvIGZvciBhbiBhY3Rpb24gZnJvbSB0aGUgcGFyYW1zXG5cdHJvdXRlSW5mbzogZnVuY3Rpb24ocGFyYW1zKXtcblx0XHQvKlxuXG5cdFx0XHRwYXRoOiByZXEucGF0aCxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblxuXHRcdCovXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdGg6IG0ucm91dGUoKSxcblx0XHRcdHBhcmFtczogcmVxLnBhcmFtcywgXG5cdFx0XHRxdWVyeTogcmVxLnF1ZXJ5LCBcblx0XHRcdHNlc3Npb246IHNlc3Npb25cblx0XHR9XG5cdH1cbn07IiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHQvL1x0R3JhYiB0aGUgZ2VuZXJhdGVkIGNsaWVudCB2ZXJzaW9uLi4uXG5cdGRvY3MgPSByZXF1aXJlKCcuLi9wdWJsaWMvbWlzby5kb2N1bWVudGF0aW9uLmpzJyk7XG5cbnZhciBpbmRleCA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHQvL1x0T3VyIG1vZGVsXG5cdFx0ZG9jczogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLmRvY3MgPSBkYXRhLmRvY3M7XG5cdFx0XHR0aGlzLmlkID0gZGF0YS5pZDtcblx0XHRcdHRoaXMubmljZU5hbWUgPSBmdW5jdGlvbihuYW1lKXtcblx0XHRcdFx0cmV0dXJuIG5hbWUuc3Vic3RyKDAsbmFtZS5sYXN0SW5kZXhPZihcIi5tZFwiKSkuc3BsaXQoXCItXCIpLmpvaW4oXCIgXCIpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgaW5kZXgubW9kZWxzLmRvY3Moe1xuXHRcdFx0ZG9jczogZG9jcygpXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdERJVihcIkJlbG93IGlzIGEgbGlzdCBvZiBkb2N1bWVudGF0aW9uIGZvciBtaXNvOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdG1pc28uZWFjaChtb2RlbC5kb2NzLCBmdW5jdGlvbihkb2MsIGtleSl7XG5cdFx0XHRcdFx0XHQvL1x0U2tpcCBob21lIHBhZ2UuLi5cblx0XHRcdFx0XHRcdGlmKGtleSAhPT0gXCJIb21lLm1kXCIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIExJKFxuXHRcdFx0XHRcdFx0XHRcdEEoe2hyZWY6IFwiL2RvYy9cIiArIGtleSwgY29uZmlnOiBtLnJvdXRlfSwgbW9kZWwubmljZU5hbWUoa2V5KSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihcIkV4YW1wbGVzOlwiKSxcblx0XHRcdFx0VUwoW1xuXHRcdFx0XHRcdExJKEEoe2hyZWY6IFwiL3RvZG9zXCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiVG9kb3MgZXhhbXBsZVwiKSksXG5cdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvdXNlcnNcIiwgY29uZmlnOiBtLnJvdXRlfSwgXCJVc2VycyBleGFtcGxlXCIpKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Ly9cdFVzZSBtYW51YWwgcHJpc20sIHNvIHRoYXQgaXQgd29ya3MgaW4gU1BBIG1vZGVcblx0XHRcdFx0U0NSSVBUKHtzcmM6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmpzXCIsIFwiZGF0YS1tYW51YWxcIjogXCJcIn0pXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cbn07XG5cbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGRvY19pZCA9IG1pc28uZ2V0UGFyYW0oJ2RvY19pZCcsIHBhcmFtcyk7XG5cdFx0dGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuZG9jcyh7XG5cdFx0XHRkb2NzOiBkb2NzKCksXG5cdFx0XHRpZDogZG9jX2lkXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6IFwiZG9jIGN3XCJ9LCBbXG5cdFx0XHRcdExJTksoe2hyZWY6IFwiL2V4dGVybmFsL3ByaXNtL3ByaXNtLmNzc1wiLCByZWw6IFwic3R5bGVzaGVldFwifSksXG5cdFx0XHRcdEgxKG1vZGVsLm5pY2VOYW1lKG1vZGVsLmlkKSksXG5cdFx0XHRcdEFSVElDTEUobS50cnVzdChtb2RlbC5kb2NzW21vZGVsLmlkXSkpLFxuXHRcdFx0XHQvL1x0VXNlIG1hbnVhbCBwcmlzbSwgc28gdGhhdCBpdCB3b3JrcyBpbiBTUEEgbW9kZVxuXHRcdFx0XHRTQ1JJUFQoe3NyYzogXCIvZXh0ZXJuYWwvcHJpc20vcHJpc20uanNcIiwgXCJkYXRhLW1hbnVhbFwiOiBcIlwifSksXG5cdFx0XHRcdFNDUklQVChcIlByaXNtLmhpZ2hsaWdodEFsbCgpO1wiKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKTtcblxudmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xuXHRtb2RlbHM6IHtcblx0XHRoZWxsbzogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgnaGVsbG9faWQnLCBwYXJhbXMpO1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgZWRpdC5tb2RlbHMuaGVsbG8oe3dobzogd2hvfSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVihcIkcnZGF5IFwiICsgY3RybC5tb2RlbC53aG8oKSk7XG5cdFx0fVxuXHR9XG59OyIsInZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRzdWdhcnRhZ3MgPSByZXF1aXJlKCdtaXRocmlsLnN1Z2FydGFncycpKG0pLFxuXHRzbW9vdGhTY3JvbGwgPSByZXF1aXJlKCcuLi9wdWJsaWMvanMvbWl0aHJpbC5zbW9vdGhzY3JvbGwuanMnKTtcblxuLy9cdEhvbWUgcGFnZVxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0aW50cm86IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50ZXh0ID0gbS5wKFwiQ3JlYXRlIGFwcHMgaW4gYSBzbmFwIVwiKTtcblx0XHRcdHRoaXMuYW5pID0gbS5wKDApO1xuXHRcdFx0dGhpcy5kZW1vSW1nU3JjID0gbS5wKFwiaW1nL21pc29kZW1vLmdpZlwiKTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXG5cdFx0Y3RybC5yZXBsYXkgPSBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIHRtcFNyYyA9IGN0cmwubW9kZWwuZGVtb0ltZ1NyYygpO1xuXHRcdFx0Y3RybC5tb2RlbC5kZW1vSW1nU3JjKFwiXCIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRjdHJsLm1vZGVsLmRlbW9JbWdTcmModG1wU3JjKTtcblx0XHRcdH0sMCk7XG5cdFx0fTtcblxuXHRcdGN0cmwubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaW50cm8oKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKXtcblx0XHR2YXIgbyA9IGN0cmwubW9kZWw7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoW1xuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJpbnRyb1wifSwgW1xuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImludHJvVGV4dFwifSwgby50ZXh0KCkpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImRlbW9JbWdcIn0sIFtcblx0XHRcdFx0XHRcdElNRyh7aWQ6IFwiZGVtb0ltZ1wiLCBzcmM6IG8uZGVtb0ltZ1NyYygpfSksXG5cdFx0XHRcdFx0XHRTUEFOKHtcImNsYXNzXCI6IFwicmVwbGF5QnV0dG9uXCIsIG9uY2xpY2s6IGN0cmwucmVwbGF5fSwgXCJSZXBsYXlcIilcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiaW5zdGFsbEJ1dHRvblwiLCBjb25maWc6IHNtb290aFNjcm9sbChjdHJsKSwgaHJlZjogXCIjaW5zdGFsbGF0aW9uXCJ9LCBcIkluc3RhbGwgbWlzbyBub3dcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcIndoYXRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJXaGF0IGlzIG1pc28/XCIpICksXG5cdFx0XHRcdFx0UChcIk1pc28gaXMgYW4gb3BlbiBzb3VyY2UgaXNvbW9ycGhpYyBqYXZhc2NyaXB0IGZyYW1ld29yayB0aGF0IGFsbG93cyB5b3UgdG8gd3JpdGUgY29tcGxldGUgYXBwcyB3aXRoIG11Y2ggbGVzcyBlZmZvcnQgdGhhbiBvdGhlciBmcmFtZXdvcmtzLiBNaXNvIGZlYXR1cmVzOlwiLFtcblx0XHRcdFx0XHRcdFVMKHtcImNsYXNzXCI6IFwiZG90TGlzdFwifSwgW1xuXHRcdFx0XHRcdFx0XHRMSShcIlNpbmdsZSBwYWdlIGFwcHMgd2l0aCBzZXJ2ZXJzaWRlIHJlbmRlcmVkIEhUTUwgZm9yIHRoZSBmaXJzdCBwYWdlIC0gd29ya3MgcGVyZmVjdGx5IHdpdGggU0VPIGFuZCBvbGRlciBicm93c2Vyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJCZWF1dGlmdWwgVVJMcyAtIHdpdGggYSBmbGV4aWJsZSByb3V0aW5nIHN5c3RlbTogYXV0b21hdGUgc29tZSByb3V0ZXMsIHRha2UgZnVsbCBjb250cm9sIG9mIG90aGVyc1wiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJUaW55IGNsaWVudHNpZGUgZm9vdHByaW50IC0gbGVzcyB0aGFuIDI1a2IgKGd6aXBwZWQgYW5kIG1pbmlmaWVkKVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJGYXN0IGxpdmUtY29kZSByZWxvYWQgLSBzbWFydGVyIHJlbG9hZCB0byBoZWxwIHlvdSB3b3JrIGZhc3RlclwiKSxcblx0XHRcdFx0XHRcdFx0TEkoW1wiSGlnaCBwZXJmb3JtYW5jZSAtIHZpcnR1YWwgZG9tIGVuZ2luZSwgdGlueSBmb290cHJpbnQsIGZhc3RlciB0aGFuIHRoZSByZXN0XCIsIEEoe2hyZWY6IFwiaHR0cDovL2xob3JpZS5naXRodWIuaW8vbWl0aHJpbC9iZW5jaG1hcmtzLmh0bWxcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCIqXCIpXSksXG5cdFx0XHRcdFx0XHRcdExJKFwiTXVjaCBsZXNzIGNvZGUgLSBjcmVhdGUgYSBkZXBsb3lhYmxlIGFwcCBpbiBsZXNzIHRoYW4gMzAgbGluZXMgb2YgY29kZVwiKSxcblx0XHRcdFx0XHRcdFx0TEkoXCJPcGVuIHNvdXJjZSAtIE1JVCBsaWNlbnNlZFwiKVxuXHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRQKFwiTWlzbyB1dGlsaXNlcyBleGNlbGxlbnQgb3BlbiBzb3VyY2UgbGlicmFyaWVzIGFuZCBmcmFtZXdvcmtzIHRvIGNyZWF0ZSBhbiBleHRyZW1lbHkgZWZmaWNpZW50IGZ1bGwgd2ViIHN0YWNrLiBUaGVzZSBmcmFtZXdvcmtzIGluY2x1ZGU6XCIpLFxuXHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZyYW1ld29ya3NcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImZ3Y29udGFpbmVyIGNmXCJ9LFtcblx0XHRcdFx0XHRcdFx0QSh7XCJjbGFzc1wiOiBcImZ3TGlua1wiLCBocmVmOiBcImh0dHA6Ly9saG9yaWUuZ2l0aHViLmlvL21pdGhyaWwvXCIsIHRhcmdldDogXCJfYmxhbmtcIn0sXG5cdFx0XHRcdFx0XHRcdFNQQU4oe1wiY2xhc3NcIjogXCJmdyBtaXRocmlsXCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vZXhwcmVzc2pzLmNvbS9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgZXhwcmVzc1wifSkpLFxuXHRcdFx0XHRcdFx0XHRBKHtcImNsYXNzXCI6IFwiZndMaW5rXCIsIGhyZWY6IFwiaHR0cDovL2Jyb3dzZXJpZnkub3JnL1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LFNQQU4oe1wiY2xhc3NcIjogXCJmdyBicm93c2VyaWZ5XCJ9KSksXG5cdFx0XHRcdFx0XHRcdEEoe1wiY2xhc3NcIjogXCJmd0xpbmtcIiwgaHJlZjogXCJodHRwOi8vbm9kZW1vbi5pby9cIiwgdGFyZ2V0OiBcIl9ibGFua1wifSxTUEFOKHtcImNsYXNzXCI6IFwiZncgbm9kZW1vblwifSkpXG5cdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdF0pLFxuXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImN3XCJ9LCBbXG5cdFx0XHRcdFx0SDIoe2lkOiBcImluc3RhbGxhdGlvblwifSwgQSh7bmFtZTogXCJpbnN0YWxsYXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJJbnN0YWxsYXRpb25cIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gaW5zdGFsbCBtaXNvLCB1c2UgbnBtOlwiKSxcblx0XHRcdFx0XHRQUkUoe1wiY2xhc3NcIjogXCJqYXZhc2NyaXB0XCJ9LFtcblx0XHRcdFx0XHRcdENPREUoXCJucG0gaW5zdGFsbCBtaXNvanMgLWdcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblxuXHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJjd1wifSwgW1xuXHRcdFx0XHRcdEgyKEEoe25hbWU6IFwiZ2V0dGluZ3N0YXJ0ZWRcIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sXCJHZXR0aW5nIHN0YXJ0ZWRcIikgKSxcblx0XHRcdFx0XHRQKFwiVG8gY3JlYXRlIGFuZCBydW4gYSBtaXNvIGFwcCBpbiBhIG5ldyBkaXJlY3Rvcnk6XCIpLFxuXHRcdFx0XHRcdFBSRSh7XCJjbGFzc1wiOiBcImphdmFzY3JpcHRcIn0sW1xuXHRcdFx0XHRcdFx0Q09ERShcIm1pc28gLW4gbXlBcHBcXG5jZCBteUFwcFxcbm1pc28gcnVuXCIpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0UChcIkNvbmdyYXR1bGF0aW9ucywgeW91IGFyZSBub3cgcnVubmluZyB5b3VyIHZlcnkgb3duIG1pc28gYXBwIGluIHRoZSAnbXlBcHAnIGRpcmVjdG9yeSFcIilcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0RElWKHtcImNsYXNzXCI6IFwiY3dcIn0sIFtcblx0XHRcdFx0XHRIMihBKHtuYW1lOiBcImV4YW1wbGVzXCIsIFwiY2xhc3NcIjogXCJoZWFkaW5nXCJ9LFwiRXhhbXBsZXNcIikpLFxuXHRcdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRcdExJKEEoeyBocmVmOiAnL3RvZG9zJywgY29uZmlnOiBtLnJvdXRlfSwgXCJUb2RvcyBleGFtcGxlIChzaW5nbGUgdXJsIFNQQSlcIikpLFxuXHRcdFx0XHRcdFx0TEkoQSh7IGhyZWY6ICcvdXNlcnMnLCBjb25maWc6IG0ucm91dGV9LCBcIlVzZXJzIGV4YW1wbGUgKG11bHRpcGxlIHVybCBTUEEpXCIpKVxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdEgyKHtuYW1lOiBcImRvY3VtZW50YXRpb25cIiwgXCJjbGFzc1wiOiBcImhlYWRpbmdcIn0sIFwiRG9jdW1lbnRhdGlvblwiKSxcblx0XHRcdFx0XHRBKHtocmVmOlwiL2RvY3NcIn0sIFwiRG9jdW1lbnRhdGlvbiBjYW4gYmUgZm91bmQgaGVyZVwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG59O1xuIiwiLypcdE1pc28gbGF5b3V0IHBhZ2VcblxuXHRUaGlzIGxheW91dCBkZXRlcm1pbmVzIHRoZSBIVE1MIHN1cnJvdW5kIGZvciBlYWNoIG9mIHlvdXIgbXZjIHJvdXRlcy5cblx0RmVlbCBmcmVlIHRvIG1vZGlmeSBhcyB5b3Ugc2VlIGZpdCAtIGFzIGxvbmcgYXMgdGhlIGF0dGFjaGVtbnQgbm9kZSBpcyBcblx0cHJlc2VudCwgaXQgc2hvdWxkIHdvcmsuXG5cblx0Tm90ZTogdGhpcyBpcyB0aGUgb25seSBtdmMgdGhhdCBkb2VzIG5vdCByZXF1aXJlIGEgY29udHJvbGxlci5cbiovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YXV0aGVudGljYXRpb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG4vL1x0VGhlIGhlYWRlciAtIHRoaXMgY2FuIGFsc28gYmUgcmVuZGVyZWQgY2xpZW50IHNpZGVcbm1vZHVsZS5leHBvcnRzLmhlYWRlckNvbnRlbnQgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gRElWKHtcImNsYXNzXCI6ICdjdyBjZid9LCBbXG5cdFx0XHRESVYoe1wiY2xhc3NcIjogJ2xvZ28nfSxcblx0XHRcdFx0QSh7YWx0OiAnTUlTTycsIGhyZWY6Jy8nLCBjb25maWc6IG0ucm91dGV9LCBbXG5cdFx0XHRcdFx0SU1HKHtzcmM6ICcvaW1nL21pc29fbG9nby5wbmcnfSlcblx0XHRcdFx0XSlcblx0XHRcdCksXG5cdFx0XHROQVYoe1wiY2xhc3NcIjogXCJsZWZ0XCJ9LCBVTChbXG5cdFx0XHRcdExJKEEoe2hyZWY6IFwiaHR0cDovL21pc29qcy5jb20vZG9jc1wiLCB0YXJnZXQ6IFwiX2JsYW5rXCJ9LCBcIkRvY3VtZW50YXRpb25cIikpXG5cdFx0XHRdKSksXG5cdFx0XHROQVYoe1wiY2xhc3NcIjogXCJyaWdodFwifSwgVUwoW1xuXHRcdFx0XHRMSShBKHtocmVmOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9qc2d1eS9taXNvanNcIiwgdGFyZ2V0OiBcIl9ibGFua1wifSwgXCJHaXRodWJcIikpLFxuXHRcdFx0XHQvL1x0VGhpcyBsaW5rIGNvdWxkIGdvIHRvIGFuIGFjY291bnQgXG5cdFx0XHRcdC8vXHRwYWdlIG9yIHNvbWV0aGluZyBsaWtlIHRoYXRcblxuXHRcdFx0XHQoY3RybC5taXNvR2xvYmFsLmF1dGhlbnRpY2F0aW9uRW5hYmxlZD9cblx0XHRcdFx0XHQoY3RybC5taXNvR2xvYmFsLmlzTG9nZ2VkSW4gJiYgY3RybC5taXNvR2xvYmFsLnVzZXJOYW1lPyBcblx0XHRcdFx0XHRcdExJKEEoe29uY2xpY2s6IGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdsb2dnaW5nIG91dCwgcGxlYXNlIHdhaXQuLi4nKTtcblx0XHRcdFx0XHRcdFx0XHRhdXRoZW50aWNhdGlvbi5sb2dvdXQoe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIllvdSd2ZSBiZWVuIGxvZ2dlZCBvdXRcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRtLnJvdXRlKFwiL2xvZ2luXCIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fSwgaHJlZjogXCIjXCIsIGlkOiBcIm1pc29Vc2VyTmFtZVwifSxcblx0XHRcdFx0XHRcdFx0XCJMb2dvdXQgXCIgKyBjdHJsLm1pc29HbG9iYWwudXNlck5hbWUpXG5cdFx0XHRcdFx0XHQpOlxuXHRcdFx0XHRcdFx0TEkoQSh7aHJlZjogXCIvbG9naW5cIn0sIFwiTG9naW5cIikpXG5cdFx0XHRcdFx0KTogXG5cdFx0XHRcdFx0XCJcIlxuXHRcdFx0XHQpXG5cblx0XHRcdF0pKVxuXHRcdF0pO1xuXHR9XG59O1xuXG4vL1x0VGhlIGZ1bGwgbGF5b3V0IC0gYWx3YXlzIG9ubHkgcmVuZGVyZWQgc2VydmVyIHNpZGVcbm1vZHVsZS5leHBvcnRzLnZpZXcgPSBmdW5jdGlvbihjdHJsKXtcblx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0bS50cnVzdChcIjwhZG9jdHlwZSBodG1sPlwiKSxcblx0XHRcdEhUTUwoW1xuXHRcdFx0XHRIRUFEKFtcblx0XHRcdFx0XHRMSU5LKHtocmVmOiAnL2Nzcy9yZXNldC5jc3MnLCByZWw6J3N0eWxlc2hlZXQnfSksXG5cdFx0XHRcdFx0TElOSyh7aHJlZjogJy9jc3Mvc3R5bGUuY3NzJywgcmVsOidzdHlsZXNoZWV0J30pLFxuXHRcdFx0XHRcdC8vXHRBZGQgaW4gdGhlIG1pc29HbG9iYWwgb2JqZWN0Li4uXG5cdFx0XHRcdFx0U0NSSVBUKFwidmFyIG1pc29HbG9iYWwgPSBcIisoY3RybC5taXNvR2xvYmFsPyBKU09OLnN0cmluZ2lmeShjdHJsLm1pc29HbG9iYWwpOiB7fSkrXCI7XCIpXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRCT0RZKHtcImNsYXNzXCI6ICdmaXhlZC1oZWFkZXInIH0sIFtcblx0XHRcdFx0XHRIRUFERVIoe2lkOiBcIm1pc29IZWFkZXJOb2RlXCJ9LCBjdHJsLmhlYWRlckNvbnRlbnQoY3RybCkpLFxuXHRcdFx0XHRcdFNFQ1RJT04oe2lkOiBjdHJsLm1pc29BdHRhY2htZW50Tm9kZX0sIGN0cmwuY29udGVudCksXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IFwibG9hZGVyXCJ9LCBbXG5cdFx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogXCJsb2FkZXJcIn0pXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0U0VDVElPTih7aWQ6IFwiZm9vdGVyXCJ9LCBbXG5cdFx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogJ2N3IGNmJ30sIG0udHJ1c3QoXCJDb3B5cmlnaHQgJmNvcHk7IDIwMTUganNndXlcIikpXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0Ly9TQ1JJUFQoe3NyYzogJy9taXNvLmpzJyArIChjdHJsLnJlbG9hZD8gXCI/Y2FjaGVLZXk9XCIgKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpOiBcIlwiKX0pLFxuXHRcdFx0XHRcdFNDUklQVCh7c3JjOiAnL21pc28uanMnfSksXG5cdFx0XHRcdFx0KGN0cmwucmVsb2FkPyBTQ1JJUFQoe3NyYzogJy9yZWxvYWQuanMnfSk6IFwiXCIpXG5cdFx0XHRcdF0pXG5cdFx0XHRdKVxuXHRcdF07XG5cdH1cbn07IiwiLyogRXhhbXBsZSBsb2dpbiBtdmMgKi9cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRtaXNvID0gcmVxdWlyZShcIi4uL21vZHVsZXMvbWlzby51dGlsLmNsaWVudC5qc1wiKSxcblx0c3VnYXJ0YWdzID0gcmVxdWlyZSgnbWl0aHJpbC5zdWdhcnRhZ3MnKShtKSxcblx0YXV0aGVudGljYXRpb24gPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pLFxuXHRzZXNzaW9uID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvc2Vzc2lvbi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG52YXIgaW5kZXggPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0bG9naW46IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0dGhpcy51cmwgPSBkYXRhLnVybDtcblx0XHRcdHRoaXMuaXNMb2dnZWRJbiA9IG0ucHJvcChmYWxzZSk7XG5cdFx0XHR0aGlzLnVzZXJuYW1lID0gbS5wcm9wKGRhdGEudXNlcm5hbWV8fFwiXCIpO1xuXHRcdFx0dGhpcy5wYXNzd29yZCA9IG0ucHJvcChcIlwiKTtcblx0XHR9XG5cdH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcyxcblx0XHRcdHVybCA9IG1pc28uZ2V0UGFyYW0oJ3VybCcsIHBhcmFtcyksXG5cdFx0XHRsb2dvdXQgPSBtaXNvLmdldFBhcmFtKCdsb2dvdXQnLCBwYXJhbXMpO1xuXG5cdFx0Y3RybC5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMubG9naW4oe3VybDogdXJsfSk7XG5cblx0XHQvL1x0Tm90ZTogdGhpcyBkb2VzIG5vdCBleGVjdXRlIG9uIHRoZSBzZXJ2ZXIgYXMgaXQgXG5cdFx0Ly9cdGlzIGEgRE9NIGV2ZW50LlxuXHRcdGN0cmwubG9naW4gPSBmdW5jdGlvbihlKXtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdC8vXHRDYWxsIHRoZSBzZXJ2ZXIgbWV0aG9kIHRvIHNlZSBpZiB3ZSdyZSBsb2dnZWQgaW5cblx0XHRcdGF1dGhlbnRpY2F0aW9uLmxvZ2luKHt0eXBlOiAnbG9naW4uaW5kZXgubG9naW4nLCBtb2RlbDogY3RybC5tb2RlbH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdGlmKGRhdGEucmVzdWx0LmlzTG9nZ2VkSW4gPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdC8vXHRXb290LCB3ZSdyZSBpbiFcblx0XHRcdFx0XHRtaXNvR2xvYmFsLmlzTG9nZ2VkSW4gPSB0cnVlO1xuXHRcdFx0XHRcdG1pc29HbG9iYWwudXNlck5hbWUgPSBkYXRhLnJlc3VsdC51c2VyTmFtZTtcblx0XHRcdFx0XHRjdHJsLm1vZGVsLmlzTG9nZ2VkSW4odHJ1ZSk7XG5cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIldlbGNvbWUgXCIgKyBtaXNvR2xvYmFsLnVzZXJOYW1lICsgXCIsIHlvdSd2ZSBiZWVuIGxvZ2dlZCBpblwiKTtcblxuXHRcdFx0XHRcdC8vXHRXaWxsIHNob3cgdGhlIHVzZXJuYW1lIHdoZW4gbG9nZ2VkIGluXG5cdFx0XHRcdFx0bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIoKTtcblxuXHRcdFx0XHRcdGlmKHVybCl7XG5cdFx0XHRcdFx0XHRtLnJvdXRlKHVybCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vXHRHbyB0byBkZWZhdWx0IFVSTD9cblx0XHRcdFx0XHRcdG0ucm91dGUoXCIvXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblxuXHRcdGlmKGxvZ291dCkge1xuXHRcdFx0Ly9cdFRPRE86IEhhbmRsZSBlcnJvclxuXHRcdFx0YXV0aGVudGljYXRpb24ubG9nb3V0KHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIllvdSd2ZSBiZWVuIGxvZ2dlZCBvdXRcIik7XG5cdFx0XHRcdC8vXHRXb290LCB3ZSdyZSBvdXQhXG5cdFx0XHRcdGN0cmwubW9kZWwuaXNMb2dnZWRJbihmYWxzZSk7XG5cdFx0XHRcdC8vIG1pc29HbG9iYWwuaXNMb2dnZWRJbiA9IGZhbHNlO1xuXHRcdFx0XHQvLyBkZWxldGUgbWlzb0dsb2JhbC51c2VyTmFtZTtcblx0XHRcdFx0Ly9cdFdpbGwgcmVtb3ZlIHRoZSB1c2VybmFtZSB3aGVuIGxvZ2dlZCBvdXRcblx0XHRcdFx0bWlzb0dsb2JhbC5yZW5kZXJIZWFkZXIoKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBESVYoe1wiY2xhc3NcIjogXCJjdyBjZlwifSwgXG5cdFx0XHRcdGN0cmwubW9kZWwuaXNMb2dnZWRJbigpPyBcIllvdSd2ZSBiZWVuIGxvZ2dlZCBpblwiOiBbXG5cdFx0XHRcdERJVihjdHJsLm1vZGVsLnVybD8gXCJQbGVhc2UgbG9nIGluIHRvIGdvIHRvIFwiICsgY3RybC5tb2RlbC51cmw6IFwiUGxlYXNlIGxvZyBpblwiKSxcblx0XHRcdFx0Rk9STSh7IG9uc3VibWl0OiBjdHJsLmxvZ2luIH0sIFtcblx0XHRcdFx0XHRESVYoXG5cdFx0XHRcdFx0XHRJTlBVVCh7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogY3RybC5tb2RlbC51c2VybmFtZSwgcGxhY2Vob2xkZXI6IFwiVXNlcm5hbWVcIn0pXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRESVYoXG5cdFx0XHRcdFx0XHRJTlBVVCh7IHR5cGU6IFwicGFzc3dvcmRcIiwgdmFsdWU6IGN0cmwubW9kZWwucGFzc3dvcmR9KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0QlVUVE9OKHsgdHlwZTogXCJzdWJtaXRcIn0sIFwiTG9naW5cIilcblx0XHRcdFx0XSlcblx0XHRcdF0pO1xuXHRcdH1cblx0fSxcblx0YXV0aGVudGljYXRlOiBmYWxzZVxufTsiLCJ2YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0bWlzbyA9IHJlcXVpcmUoXCIuLi9tb2R1bGVzL21pc28udXRpbC5jbGllbnQuanNcIiksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGFuaW1hdGUgPSByZXF1aXJlKCcuLi9wdWJsaWMvanMvbWl0aHJpbC5hbmltYXRlLm5vYmluZC5qcycpKG0pLFxuXHRmbGlja3IgPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9mbGlja3IvYXBpLmNsaWVudC5qc1wiKShtKTtcblxudmFyIHNlbGYgPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcblx0bW9kZWxzOiB7XG5cdFx0aG9tZTogZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHR2YXIgbWUgPSB0aGlzO1xuXHRcdFx0bWUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdG1lLm1lbnVPZmZzZXQobWUubWVudU9mZnNldCgpID09IDA/IDI0MDogMCk7XG5cdFx0XHR9O1xuXHRcdFx0bWUubWVudU9mZnNldCA9IG0ucCgwKTtcblx0XHRcdG1lLmZsaWNrckRhdGEgPSBtLnByb3AoZGF0YS5mbGlja3JEYXRhKTtcblx0XHR9XG5cdH0sXG5cblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzO1xuXHRcdGN0cmwubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaG9tZSh7ZmxpY2tyRGF0YToge319KTtcblxuXHRcdC8vXHRMb2FkIHNvbWUgcGljdHVyZXNcblx0XHRmbGlja3IucGhvdG9zKHt0YWdzOiBcIlN5ZG5leSBvcGVyYSBob3VzZVwiLCB0YWdtb2RlOiBcImFueVwifSwge2JhY2tncm91bmQ6IHRydWUsIGluaXRpYWxWYWx1ZTogW119KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0aWYoZGF0YS5yZXN1bHQuZXJybm8pIHtcblx0XHRcdFx0aWYoZGF0YS5yZXN1bHQuZXJybm8gPT0gXCJFTk9URk9VTkRcIikge1xuXHRcdFx0XHRcdC8vXHRPZmZsaW5lIGVycm9yP1xuXHRcdFx0XHRcdGN0cmwubW9kZWwuZmxpY2tyRGF0YShbXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly9cdFNvbWV0aGluZyBlbHNlP1xuXHRcdFx0XHRcdGN0cmwubW9kZWwuZmxpY2tyRGF0YShbXSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3RybC5tb2RlbC5mbGlja3JEYXRhKGRhdGEucmVzdWx0Lml0ZW1zIHx8IFtdKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly9cdFRoaXMgZXJyb3IgcnVucyBzZXJ2ZXJzaWRlIG9ubHkhXG5cdFx0ZnVuY3Rpb24oZXJyb3JEYXRhKXtcblx0XHRcdGNvbnNvbGUubG9nKGVycm9yRGF0YSk7XG5cdFx0fVxuXG5cdFx0KTtcblxuXG5cdFx0Ly9cdFNldCBoZWFkZXJcblx0XHRpZih0eXBlb2YgbWlzb0dsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0bWlzb0dsb2JhbC5oZWFkZXIudGV4dChcIkhvbWVcIik7XG5cdFx0fVxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG5cdFx0dmFyIG8gPSBjdHJsLm1vZGVsO1xuXHRcdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRESVYoe2NsYXNzTmFtZTogXCJpbnRyb1wifSwgW1xuXHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcInBob3RvLXRodW1iXCJ9LCBcblx0XHRcdFx0XHRcdElNRyh7c3JjOiBcIi9pbWcvcGhvdG9zL2Zsb3dlcl90aHVtYl9zcXVhcmUuanBnXCJ9KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0RElWKHtjbGFzc05hbWU6IFwiaW50cm8taXRlbXNcIn0sIFtcblx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcImludHJvLWl0ZW0gaW50cm8tcG9zdHNcIn0sIFtcblx0XHRcdFx0XHRcdFx0RElWKHtjbGFzc05hbWU6IFwiaW50cm8tY291bnQgcG9zdHMtY291bnRcIn0sIFwiMTc5XCIpLFxuXHRcdFx0XHRcdFx0XHRESVYoe2NsYXNzTmFtZTogXCJpbnRyby1sYWJlbCBwb3N0cy1sYWJlbFwifSwgXCJwb3N0c1wiKVxuXHRcdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0XHRESVYoe2NsYXNzTmFtZTogXCJpbnRyby1pdGVtIGludHJvLWZvbGxvd2Vyc1wifSwgW1xuXHRcdFx0XHRcdFx0XHRESVYoe2NsYXNzTmFtZTogXCJpbnRyby1jb3VudCBmb2xsb3dlci1jb3VudFwifSwgXCIxMTBcIiksXG5cdFx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcImludHJvLWxhYmVsIGZvbGxvd2VyLWxhYmVsXCJ9LCBcImZvbGxvd2Vyc1wiKVxuXHRcdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0XHRESVYoe2NsYXNzTmFtZTogXCJpbnRyby1pdGVtIGludHJvLWZvbGxvd2luZ1wifSwgW1xuXHRcdFx0XHRcdFx0XHRESVYoe2NsYXNzTmFtZTogXCJpbnRyby1jb3VudCBmb2xsb3dpbmctY291bnRcIn0sIFwiNzFcIiksXG5cdFx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcImludHJvLWxhYmVsIGZvbGxvd2luZy1sYWJlbFwifSwgXCJmb2xsb3dpbmdcIilcblx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdFx0RElWKHtjbGFzc05hbWU6IFwiZm9sbG93LWl0ZW1zXCJ9LCBbXG5cdFx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcImZvbGxvdy1pdGVtIGZvbGxvdy1idXR0b25cIn0sIFwiKyBGT0xMT1dcIiksXG5cdFx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcImZvbGxvdy1pdGVtIGZvbGxvdy1idXR0b24tZHJvcGRvd25cIn0sIEkoe2NsYXNzTmFtZTogXCJmYSBmYS1jYXJldC1kb3duXCJ9KSlcblx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0RElWKHtjbGFzc05hbWU6IFwidXNlci1zdW1tYXJ5XCJ9LFtcblx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcInVzZXItbmFtZVwifSwgXCJaZXJvY29vbFwiKSxcblx0XHRcdFx0XHRcdERJVih7Y2xhc3NOYW1lOiBcInVzZXItc3RhdHVzXCJ9LCBcIkhhY2sgdGhlIHBsYW5ldCFcIilcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRdKSxcblx0XHRcdFx0RElWKHtjbGFzc05hbWU6IFwicGhvdG8tY29udGFpbmVyXCJ9LCBbXG5cdFx0XHRcdFx0bWlzby5lYWNoKGN0cmwubW9kZWwuZmxpY2tyRGF0YSgpLCBmdW5jdGlvbihpdGVtKXtcblx0XHRcdFx0XHRcdC8vXHRNdXN0IHVzZSBtLnRydXN0LCB0byBhbGxvdyBvbmxvYWRcblx0XHRcdFx0XHRcdHJldHVybiBESVYoe2NsYXNzTmFtZTogXCJwaG90by1pdGVtXCJ9LCBtLnRydXN0KCc8SU1HIG9ubG9hZD1cInRoaXMuc3R5bGUub3BhY2l0eT0xXCIgc3JjPVwiJyAraXRlbS5tZWRpYS5tICsgJ1wiIGNsYXNzID1cInBob3RvLXNtYWxsXCI+JykpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0pXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxufTtcblxuXG4vL1x0VEVTVElOR1xudmFyIHNlbGYyID0gbW9kdWxlLmV4cG9ydHMudGVzdCA9IHtcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dGhpcy5tZXNzYWdlID0gXCJoZWxsb1wiO1xuXG5cdFx0Ly9cdFNldCBoZWFkZXJcblx0XHRpZih0eXBlb2YgbWlzb0dsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0bWlzb0dsb2JhbC5oZWFkZXIudGV4dChcIlRlc3RpbmdcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR2YXIgbyA9IGN0cmw7XG5cdFx0d2l0aChzdWdhcnRhZ3MpIHtcblx0XHRcdHJldHVybiBbXG5cdCAgXHRcdFx0SDEoXCJXaHkgaGVsbG8gdGhlcmUhXCIpLFxuXHRcdFx0XHRBKHtocmVmOlwiL21vYmlsZWhvbWVcIiwgY29uZmlnOiBtLnJvdXRlfSwgXCJob21lXCIpLFxuXHRcdFx0XVxuXHRcdH07XG5cdH1cbn07IiwidmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGRiID0gcmVxdWlyZShcIi4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuY2xpZW50LmpzXCIpKG0pO1xuXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRtb2RlbHM6IHtcblx0XHR0b2RvOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdHRoaXMudGV4dCA9IGRhdGEudGV4dDtcblx0XHRcdHRoaXMuZG9uZSA9IG0ucHJvcChkYXRhLmRvbmUgPT0gXCJmYWxzZVwiPyBmYWxzZTogZGF0YS5kb25lKTtcblx0XHRcdHRoaXMuX2lkID0gZGF0YS5faWQ7XG5cdFx0fVxuXHR9LFxuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXM7XG5cblx0XHRjdHJsLmxpc3QgPSBbXTtcblxuXHRcdGRiLmZpbmQoe3R5cGU6ICd0b2RvLmluZGV4LnRvZG8nfSwge2JhY2tncm91bmQ6IHRydWUsIGluaXRpYWxWYWx1ZTogW119KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRcdHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhkYXRhLnJlc3VsdFtrZXldKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Y3RybC5hZGRUb2RvID0gZnVuY3Rpb24oZSl7XG5cdFx0XHR2YXIgdmFsdWUgPSBjdHJsLnZtLmlucHV0KCk7XG5cdFx0XHRpZih2YWx1ZSkge1xuXHRcdFx0XHR2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcblx0XHRcdFx0XHR0ZXh0OiBjdHJsLnZtLmlucHV0KCksXG5cdFx0XHRcdFx0ZG9uZTogZmFsc2Vcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xuXHRcdFx0XHRjdHJsLnZtLmlucHV0KFwiXCIpO1xuXHRcdFx0XHRkYi5zYXZlKHsgdHlwZTogJ3RvZG8uaW5kZXgudG9kbycsIG1vZGVsOiBuZXdUb2RvIH0gKS50aGVuKGZ1bmN0aW9uKHJlcyl7XG5cdFx0XHRcdFx0bmV3VG9kby5faWQgPSByZXMucmVzdWx0O1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXG5cdFx0Y3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciBsaXN0ID0gW107XG5cdFx0XHRjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcblx0XHRcdFx0aWYoIXRvZG8uZG9uZSgpKSB7XG5cdFx0XHRcdFx0bGlzdC5wdXNoKHRvZG8pOyBcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRkYi5yZW1vdmUoeyB0eXBlOiAndG9kby5pbmRleC50b2RvJywgX2lkOiB0b2RvLl9pZCB9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlc3VsdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Y3RybC5saXN0ID0gbGlzdDtcblx0XHR9O1xuXG5cdFx0Y3RybC52bSA9IHtcblx0XHRcdGxlZnQ6IGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBjb3VudCA9IDA7XG5cdFx0XHRcdGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xuXHRcdFx0XHRcdGNvdW50ICs9IHRvZG8uZG9uZSgpID8gMCA6IDE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gY291bnQ7XG5cdFx0XHR9LFxuXHRcdFx0ZG9uZTogZnVuY3Rpb24odG9kbyl7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGlucHV0OiBtLnByb3AoXCJcIilcblx0XHR9O1xuXG5cdFx0cmV0dXJuIGN0cmw7XG5cdH0sXG5cdHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7XCJjbGFzc1wiOiBcImN3IGNmXCJ9LCBbXG5cdFx0XHRcdFNUWUxFKFwiLmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fVwiKSxcblx0XHRcdFx0SDEoXCJUb2RvcyAtIFwiICsgY3RybC52bS5sZWZ0KCkgKyBcIiBvZiBcIiArIGN0cmwubGlzdC5sZW5ndGggKyBcIiByZW1haW5pbmdcIiksXG5cdFx0XHRcdEJVVFRPTih7IG9uY2xpY2s6IGN0cmwuYXJjaGl2ZSB9LCBcIkFyY2hpdmVcIiksXG5cdFx0XHRcdFVMKFtcblx0XHRcdFx0XHRjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xuXHRcdFx0XHRcdFx0cmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyBcImRvbmVcIjogXCJcIiwgb25jbGljazogY3RybC52bS5kb25lKHRvZG8pIH0sIHRvZG8udGV4dCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdEZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcblx0XHRcdFx0XHRJTlBVVCh7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogY3RybC52bS5pbnB1dCwgcGxhY2Vob2xkZXI6IFwiQWRkIHRvZG9cIn0pLFxuXHRcdFx0XHRcdEJVVFRPTih7IHR5cGU6IFwic3VibWl0XCJ9LCBcIkFkZFwiKVxuXHRcdFx0XHRdKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHR9XG5cdC8vXHRUZXN0IGF1dGhlbnRpY2F0ZVxuXHQvLyxhdXRoZW50aWNhdGU6IHRydWVcbn07IiwiLypcblx0VGhpcyBpcyBhIHNhbXBsZSB1c2VyIG1hbmFnZW1lbnQgYXBwIHRoYXQgdXNlcyB0aGVcblx0bXVsdGlwbGUgdXJsIG1pc28gcGF0dGVybi5cbiovXG52YXIgbWlzbyA9IHJlcXVpcmUoXCIuLi9tb2R1bGVzL21pc28udXRpbC5jbGllbnQuanNcIiksXG5cdHZhbGlkYXRlID0gcmVxdWlyZSgndmFsaWRhdG9yLm1vZGVsYmluZGVyJyksXG5cdG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSksXG5cdGJpbmRpbmdzID0gcmVxdWlyZSgnbWl0aHJpbC5iaW5kaW5ncycpKG0pLFxuXHRhcGkgPSByZXF1aXJlKFwiLi4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGlvbi9hcGkuY2xpZW50LmpzXCIpKG0pLFxuXHRzZWxmID0gbW9kdWxlLmV4cG9ydHM7XG5cbi8vXHRTaGFyZWQgdmlld1xudmFyIGVkaXRWaWV3ID0gZnVuY3Rpb24oY3RybCl7XG5cdHdpdGgoc3VnYXJ0YWdzKSB7XG5cdFx0cmV0dXJuIERJVih7IGNsYXNzOiBcImN3XCIgfSwgW1xuXHRcdFx0SDIoe1wiY2xhc3NcIjogXCJwYWdlSGVhZGVyXCJ9LCBjdHJsLmhlYWRlciksXG5cdFx0XHRjdHJsLnVzZXIgPyBbXG5cdFx0XHRcdERJVihbXG5cdFx0XHRcdFx0TEFCRUwoXCJOYW1lXCIpLCBJTlBVVCh7dmFsdWU6IGN0cmwudXNlci5uYW1lfSksXG5cdFx0XHRcdFx0RElWKHtcImNsYXNzXCI6IChjdHJsLnVzZXIuaXNWYWxpZCgnbmFtZScpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJ2YWxpZFwiOiBcImludmFsaWRcIikgKyBcIiBpbmRlbnRlZFwifSwgW1xuXHRcdFx0XHRcdFx0Y3RybC51c2VyLmlzVmFsaWQoJ25hbWUnKSA9PSB0cnVlIHx8ICFjdHJsLnNob3dFcnJvcnM/IFwiXCI6IGN0cmwudXNlci5pc1ZhbGlkKCduYW1lJykuam9pbihcIiwgXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihbXG5cdFx0XHRcdFx0TEFCRUwoXCJFbWFpbFwiKSwgSU5QVVQoe3ZhbHVlOiBjdHJsLnVzZXIuZW1haWx9KSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogKGN0cmwudXNlci5pc1ZhbGlkKCdlbWFpbCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJ2YWxpZFwiOiBcImludmFsaWRcIikgKyBcIiBpbmRlbnRlZFwiIH0sIFtcblx0XHRcdFx0XHRcdGN0cmwudXNlci5pc1ZhbGlkKCdlbWFpbCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJcIjogY3RybC51c2VyLmlzVmFsaWQoJ2VtYWlsJykuam9pbihcIiwgXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVihbXG5cdFx0XHRcdFx0TEFCRUwoXCJQYXNzd29yZFwiKSwgSU5QVVQoe3ZhbHVlOiBjdHJsLnVzZXIucGFzc3dvcmQsIHR5cGU6ICdwYXNzd29yZCd9KSxcblx0XHRcdFx0XHRESVYoe1wiY2xhc3NcIjogKGN0cmwudXNlci5pc1ZhbGlkKCdwYXNzd29yZCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJ2YWxpZFwiOiBcImludmFsaWRcIikgKyBcIiBpbmRlbnRlZFwiIH0sIFtcblx0XHRcdFx0XHRcdGN0cmwudXNlci5pc1ZhbGlkKCdwYXNzd29yZCcpID09IHRydWUgfHwgIWN0cmwuc2hvd0Vycm9ycz8gXCJcIjogY3RybC51c2VyLmlzVmFsaWQoJ3Bhc3N3b3JkJykuam9pbihcIiwgXCIpXG5cdFx0XHRcdFx0XSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdERJVih7XCJjbGFzc1wiOiBcImluZGVudGVkXCJ9LFtcblx0XHRcdFx0XHRCVVRUT04oe29uY2xpY2s6IGN0cmwuc2F2ZSwgY2xhc3M6IFwicG9zaXRpdmVcIn0sIFwiU2F2ZSB1c2VyXCIpLFxuXHRcdFx0XHRcdEJVVFRPTih7b25jbGljazogY3RybC5yZW1vdmUsIGNsYXNzOiBcIm5lZ2F0aXZlXCJ9LCBcIkRlbGV0ZSB1c2VyXCIpXG5cdFx0XHRcdF0pXG5cdFx0XHRdOiBESVYoXCJVc2VyIG5vdCBmb3VuZFwiKVxuXHRcdF0pO1xuXHR9XG59O1xuXG5cbi8vXHRVc2VyIGxpc3Rcbm1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xuXHRjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcblx0XHR2YXIgY3RybCA9IHRoaXM7XG5cblx0XHRjdHJsLnZtID0ge1xuXHRcdFx0dXNlckxpc3Q6IGZ1bmN0aW9uKHVzZXJzKXtcblx0XHRcdFx0dGhpcy51c2VycyA9IG0ucCh1c2Vycyk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGFwaS5maW5kVXNlcnMoe3R5cGU6ICd1c2VyLmVkaXQudXNlcid9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGlmKGRhdGEuZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJFcnJvciBcIiArIGRhdGEuZXJyb3IpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZihkYXRhLnJlc3VsdCkge1xuXHRcdFx0XHR2YXIgbGlzdCA9IE9iamVjdC5rZXlzKGRhdGEucmVzdWx0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBzZWxmLmVkaXQubW9kZWxzLnVzZXIoZGF0YS5yZXN1bHRba2V5XSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGN0cmwudXNlcnMgPSBuZXcgY3RybC52bS51c2VyTGlzdChsaXN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN0cmwudXNlcnMgPSBuZXcgY3RybC52bS51c2VyTGlzdChbXSk7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oKXtcblx0XHRcdGNvbnNvbGUubG9nKCdFcnJvcicsIGFyZ3VtZW50cyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0dmlldzogZnVuY3Rpb24oY3RybCl7XG5cdFx0dmFyIGMgPSBjdHJsLFxuXHRcdFx0dSA9IGMudXNlcnM7XG5cblx0XHR3aXRoKHN1Z2FydGFncykge1xuXHRcdFx0cmV0dXJuIERJVih7IGNsYXNzOiBcImN3XCIgfSwgW1xuXHRcdFx0XHRVTChbXG5cdFx0XHRcdFx0dS51c2VycygpLm1hcChmdW5jdGlvbih1c2VyLCBpZHgpe1xuXHRcdFx0XHRcdFx0cmV0dXJuIExJKEEoeyBocmVmOiAnL3VzZXIvJyArIHVzZXIuaWQoKSwgY29uZmlnOiBtLnJvdXRlfSwgdXNlci5uYW1lKCkgKyBcIiAtIFwiICsgdXNlci5lbWFpbCgpKSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XSksXG5cdFx0XHRcdEEoe1wiY2xhc3NcIjpcImJ1dHRvbiBwb3NpdGl2ZSBtdG9wXCIsIGhyZWY6XCIvdXNlcnMvbmV3XCIsIGNvbmZpZzogbS5yb3V0ZX0sIFwiQWRkIG5ldyB1c2VyXCIpXG5cdFx0XHRdKTtcblx0XHR9XG5cdH1cbn07XG5cblxuLy9cdE5ldyB1c2VyXG5tb2R1bGUuZXhwb3J0cy5uZXcgPSB7XG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xuXHRcdHZhciBjdHJsID0gdGhpcztcblx0XHRjdHJsLnVzZXIgPSBuZXcgc2VsZi5lZGl0Lm1vZGVscy51c2VyKHtuYW1lOiBcIlwiLCBlbWFpbDogXCJcIn0pO1xuXHRcdGN0cmwuaGVhZGVyID0gXCJOZXcgdXNlclwiO1xuXHRcdGN0cmwuc2hvd0Vycm9ycyA9IGZhbHNlO1xuXG5cdFx0Y3RybC5zYXZlID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGN0cmwudXNlci5pc1ZhbGlkKCkgIT09IHRydWUpIHtcblx0XHRcdFx0Y3RybC5zaG93RXJyb3JzID0gdHJ1ZTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgaXMgbm90IHZhbGlkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcGkuc2F2ZVVzZXIoeyB0eXBlOiAndXNlci5lZGl0LnVzZXInLCBtb2RlbDogY3RybC51c2VyIH0gKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJBZGRlZCB1c2VyXCIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0bS5yb3V0ZShcIi91c2Vyc1wiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBjdHJsO1xuXHR9LFxuXHR2aWV3OiBlZGl0Vmlld1xufTtcblxuXG4vL1x0RWRpdCB1c2VyXG5tb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xuXHRtb2RlbHM6IHtcblx0XHR1c2VyOiBmdW5jdGlvbihkYXRhKXtcblx0XHRcdHRoaXMubmFtZSA9IG0ucChkYXRhLm5hbWV8fFwiXCIpO1xuXHRcdFx0dGhpcy5lbWFpbCA9IG0ucChkYXRhLmVtYWlsfHxcIlwiKTtcblx0XHRcdC8vXHRQYXNzd29yZCBpcyBhbHdheXMgZW1wdHkgZmlyc3Rcblx0XHRcdHRoaXMucGFzc3dvcmQgPSBtLnAoZGF0YS5wYXNzd29yZHx8XCJcIik7XG5cdFx0XHR0aGlzLmlkID0gbS5wKGRhdGEuX2lkfHxcIlwiKTtcblxuXHRcdFx0Ly9cdFZhbGlkYXRlIHRoZSBtb2RlbFxuXHRcdFx0dGhpcy5pc1ZhbGlkID0gdmFsaWRhdGUuYmluZCh0aGlzLCB7XG5cdFx0XHRcdG5hbWU6IHtcblx0XHRcdFx0XHRpc1JlcXVpcmVkOiBcIllvdSBtdXN0IGVudGVyIGEgbmFtZVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHBhc3N3b3JkOiB7XG5cdFx0XHRcdFx0aXNSZXF1aXJlZDogXCJZb3UgbXVzdCBlbnRlciBhIHBhc3N3b3JkXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW1haWw6IHtcblx0XHRcdFx0XHRpc1JlcXVpcmVkOiBcIllvdSBtdXN0IGVudGVyIGFuIGVtYWlsIGFkZHJlc3NcIixcblx0XHRcdFx0XHRpc0VtYWlsOiBcIk11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCJcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0fSxcblx0Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XG5cdFx0dmFyIGN0cmwgPSB0aGlzLFxuXHRcdFx0dXNlcklkID0gbWlzby5nZXRQYXJhbSgndXNlcl9pZCcsIHBhcmFtcyk7XG5cblx0XHRjdHJsLmhlYWRlciA9IFwiRWRpdCB1c2VyIFwiICsgdXNlcklkO1xuXG5cdFx0Ly9cdExvYWQgb3VyIHVzZXJcblx0XHRhcGkuZmluZFVzZXJzKHt0eXBlOiAndXNlci5lZGl0LnVzZXInLCBxdWVyeToge19pZDogdXNlcklkfX0pLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0dmFyIHVzZXIgPSBkYXRhLnJlc3VsdDtcblx0XHRcdGlmKHVzZXIgJiYgdXNlci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGN0cmwudXNlciA9IG5ldyBzZWxmLmVkaXQubW9kZWxzLnVzZXIodXNlclswXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnVXNlciBub3QgZm91bmQnLCB1c2VySWQpO1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKCl7XG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3InLCBhcmd1bWVudHMpO1xuXHRcdH0pO1xuXG5cdFx0Y3RybC5zYXZlID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGN0cmwudXNlci5pc1ZhbGlkKCkgIT09IHRydWUpIHtcblx0XHRcdFx0Y3RybC5zaG93RXJyb3JzID0gdHJ1ZTtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1VzZXIgaXMgbm90IHZhbGlkJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcGkuc2F2ZVVzZXIoeyB0eXBlOiAndXNlci5lZGl0LnVzZXInLCBtb2RlbDogY3RybC51c2VyIH0gKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJTYXZlZCB1c2VyXCIsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0bS5yb3V0ZShcIi91c2Vyc1wiKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGN0cmwucmVtb3ZlID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmKGNvbmZpcm0oXCJEZWxldGUgdXNlcj9cIikpIHtcblx0XHRcdFx0YXBpLnJlbW92ZSh7IHR5cGU6ICd1c2VyLmVkaXQudXNlcicsIF9pZDogdXNlcklkIH0pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YS5yZXN1bHQpO1xuXHRcdFx0XHRcdG0ucm91dGUoXCIvdXNlcnNcIik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gY3RybDtcblx0fSxcblx0dmlldzogZWRpdFZpZXdcblx0Ly9cdEFueSBhdXRoZW50aWNhdGlvbiBpbmZvXG5cdC8vLCBhdXRoZW50aWNhdGU6IHRydWVcbn07XG4iLCIvL1x0TWl0aHJpbCBiaW5kaW5ncy5cbi8vXHRDb3B5cmlnaHQgKEMpIDIwMTQganNndXkgKE1pa2tlbCBCZXJnbWFubilcbi8vXHRNSVQgbGljZW5zZWRcbihmdW5jdGlvbigpe1xudmFyIG1pdGhyaWxCaW5kaW5ncyA9IGZ1bmN0aW9uKG0pe1xuXHRtLmJpbmRpbmdzID0gbS5iaW5kaW5ncyB8fCB7fTtcblxuXHQvL1x0UHViL1N1YiBiYXNlZCBleHRlbmRlZCBwcm9wZXJ0aWVzXG5cdG0ucCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0c3VicyA9IFtdLFxuXHRcdFx0cHJldlZhbHVlLFxuXHRcdFx0ZGVsYXkgPSBmYWxzZSxcblx0XHRcdC8vICBTZW5kIG5vdGlmaWNhdGlvbnMgdG8gc3Vic2NyaWJlcnNcblx0XHRcdG5vdGlmeSA9IGZ1bmN0aW9uICh2YWx1ZSwgcHJldlZhbHVlKSB7XG5cdFx0XHRcdHZhciBpO1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgc3Vicy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdHN1YnNbaV0uZnVuYy5hcHBseShzdWJzW2ldLmNvbnRleHQsIFt2YWx1ZSwgcHJldlZhbHVlXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRwcm9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBhcmd1bWVudHNbMF07XG5cdFx0XHRcdFx0aWYgKHByZXZWYWx1ZSAhPT0gdmFsdWUpIHtcblx0XHRcdFx0XHRcdHZhciB0bXBQcmV2ID0gcHJldlZhbHVlO1xuXHRcdFx0XHRcdFx0cHJldlZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdFx0XHRub3RpZnkodmFsdWUsIHRtcFByZXYpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9O1xuXG5cdFx0Ly9cdEFsbG93IHB1c2ggb24gYXJyYXlzXG5cdFx0cHJvcC5wdXNoID0gZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRpZih2YWx1ZS5wdXNoICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0dmFsdWUucHVzaCh2YWwpO1xuXHRcdFx0fVxuXHRcdFx0cHJvcCh2YWx1ZSk7XG5cdFx0fTtcblxuXHRcdC8vXHRTdWJzY3JpYmUgZm9yIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXNcblx0XHRwcm9wLnN1YnNjcmliZSA9IGZ1bmN0aW9uIChmdW5jLCBjb250ZXh0KSB7XG5cdFx0XHRzdWJzLnB1c2goeyBmdW5jOiBmdW5jLCBjb250ZXh0OiBjb250ZXh0IHx8IHNlbGYgfSk7XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9O1xuXG5cdFx0Ly9cdEFsbG93IHByb3BlcnR5IHRvIG5vdCBhdXRvbWF0aWNhbGx5IHJlbmRlclxuXHRcdHByb3AuZGVsYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0ZGVsYXkgPSAhIXZhbHVlO1xuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fTtcblxuXHRcdC8vXHRBdXRvbWF0aWNhbGx5IHVwZGF0ZSByZW5kZXJpbmcgd2hlbiBhIHZhbHVlIGNoYW5nZXNcblx0XHQvL1x0QXMgbWl0aHJpbCB3YWl0cyBmb3IgYSByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSwgdGhpcyBzaG91bGQgYmUgb2suXG5cdFx0Ly9cdFlvdSBjYW4gdXNlIC5kZWxheSh0cnVlKSB0byBiZSBhYmxlIHRvIG1hbnVhbGx5IGhhbmRsZSB1cGRhdGVzXG5cdFx0cHJvcC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsKXtcblx0XHRcdGlmKCFkZWxheSkge1xuXHRcdFx0XHRtLnN0YXJ0Q29tcHV0YXRpb24oKTtcblx0XHRcdFx0bS5lbmRDb21wdXRhdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByb3A7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gcHJvcDtcblx0fTtcblxuXHQvL1x0RWxlbWVudCBmdW5jdGlvbiB0aGF0IGFwcGxpZXMgb3VyIGV4dGVuZGVkIGJpbmRpbmdzXG5cdC8vXHROb3RlOiBcblx0Ly9cdFx0LiBTb21lIGF0dHJpYnV0ZXMgY2FuIGJlIHJlbW92ZWQgd2hlbiBhcHBsaWVkLCBlZzogY3VzdG9tIGF0dHJpYnV0ZXNcblx0Ly9cdFxuXHRtLmUgPSBmdW5jdGlvbihlbGVtZW50LCBhdHRycywgY2hpbGRyZW4pIHtcblx0XHRmb3IgKHZhciBuYW1lIGluIGF0dHJzKSB7XG5cdFx0XHRpZiAobS5iaW5kaW5nc1tuYW1lXSkge1xuXHRcdFx0XHRtLmJpbmRpbmdzW25hbWVdLmZ1bmMuYXBwbHkoYXR0cnMsIFthdHRyc1tuYW1lXV0pO1xuXHRcdFx0XHRpZihtLmJpbmRpbmdzW25hbWVdLnJlbW92ZWFibGUpIHtcblx0XHRcdFx0XHRkZWxldGUgYXR0cnNbbmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG0oZWxlbWVudCwgYXR0cnMsIGNoaWxkcmVuKTtcblx0fTtcblxuXHQvL1x0QWRkIGJpbmRpbmdzIG1ldGhvZFxuXHQvL1x0Tm9uLXN0YW5kYXJkIGF0dHJpYnV0ZXMgZG8gbm90IG5lZWQgdG8gYmUgcmVuZGVyZWQsIGVnOiB2YWx1ZUlucHV0XG5cdC8vXHRzbyB0aGV5IGFyZSBzZXQgYXMgcmVtb3ZhYmxlXG5cdG0uYWRkQmluZGluZyA9IGZ1bmN0aW9uKG5hbWUsIGZ1bmMsIHJlbW92ZWFibGUpe1xuXHRcdG0uYmluZGluZ3NbbmFtZV0gPSB7XG5cdFx0XHRmdW5jOiBmdW5jLFxuXHRcdFx0cmVtb3ZlYWJsZTogcmVtb3ZlYWJsZVxuXHRcdH07XG5cdH07XG5cblx0Ly9cdEdldCB0aGUgdW5kZXJseWluZyB2YWx1ZSBvZiBhIHByb3BlcnR5XG5cdG0udW53cmFwID0gZnVuY3Rpb24ocHJvcCkge1xuXHRcdHJldHVybiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKT8gcHJvcCgpOiBwcm9wO1xuXHR9O1xuXG5cdC8vXHRCaS1kaXJlY3Rpb25hbCBiaW5kaW5nIG9mIHZhbHVlXG5cdG0uYWRkQmluZGluZyhcInZhbHVlXCIsIGZ1bmN0aW9uKHByb3ApIHtcblx0XHRpZiAodHlwZW9mIHByb3AgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aGlzLnZhbHVlID0gcHJvcCgpO1xuXHRcdFx0dGhpcy5vbmNoYW5nZSA9IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBwcm9wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy52YWx1ZSA9IHByb3A7XG5cdFx0fVxuXHR9KTtcblxuXHQvL1x0QmktZGlyZWN0aW9uYWwgYmluZGluZyBvZiBjaGVja2VkIHByb3BlcnR5XG5cdG0uYWRkQmluZGluZyhcImNoZWNrZWRcIiwgZnVuY3Rpb24ocHJvcCkge1xuXHRcdGlmICh0eXBlb2YgcHJvcCA9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHRoaXMuY2hlY2tlZCA9IHByb3AoKTtcblx0XHRcdHRoaXMub25jaGFuZ2UgPSBtLndpdGhBdHRyKFwiY2hlY2tlZFwiLCBwcm9wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jaGVja2VkID0gcHJvcDtcblx0XHR9XG5cdH0pO1xuXG5cdC8vXHRIaWRlIG5vZGVcblx0bS5hZGRCaW5kaW5nKFwiaGlkZVwiLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLnN0eWxlID0ge1xuXHRcdFx0ZGlzcGxheTogbS51bndyYXAocHJvcCk/IFwibm9uZVwiIDogXCJcIlxuXHRcdH07XG5cdH0sIHRydWUpO1xuXG5cdC8vXHRUb2dnbGUgdmFsdWUocykgb24gY2xpY2tcblx0bS5hZGRCaW5kaW5nKCd0b2dnbGUnLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9uY2xpY2sgPSBmdW5jdGlvbigpe1xuXHRcdFx0Ly9cdFRvZ2dsZSBhbGxvd3MgYW4gZW51bSBsaXN0IHRvIGJlIHRvZ2dsZWQsIGVnOiBbcHJvcCwgdmFsdWUyLCB2YWx1ZTJdXG5cdFx0XHR2YXIgaXNGdW5jID0gdHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicsIHRtcCwgaSwgdmFscyA9IFtdLCB2YWwsIHRWYWw7XG5cblx0XHRcdC8vXHRUb2dnbGUgYm9vbGVhblxuXHRcdFx0aWYoaXNGdW5jKSB7XG5cdFx0XHRcdHZhbHVlID0gcHJvcCgpO1xuXHRcdFx0XHRwcm9wKCF2YWx1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL1x0VG9nZ2xlIGVudW1lcmF0aW9uXG5cdFx0XHRcdHRtcCA9IHByb3BbMF07XG5cdFx0XHRcdHZhbCA9IHRtcCgpO1xuXHRcdFx0XHR2YWxzID0gcHJvcC5zbGljZSgxKTtcblx0XHRcdFx0dFZhbCA9IHZhbHNbMF07XG5cblx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGlmKHZhbCA9PSB2YWxzW2ldKSB7XG5cdFx0XHRcdFx0XHRpZih0eXBlb2YgdmFsc1tpKzFdICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0XHR0VmFsID0gdmFsc1tpKzFdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRtcCh0VmFsKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9LCB0cnVlKTtcblxuXHQvL1x0U2V0IGhvdmVyIHN0YXRlcywgYSdsYSBqUXVlcnkgcGF0dGVyblxuXHRtLmFkZEJpbmRpbmcoJ2hvdmVyJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbm1vdXNlb3ZlciA9IHByb3BbMF07XG5cdFx0aWYocHJvcFsxXSkge1xuXHRcdFx0dGhpcy5vbm1vdXNlb3V0ID0gcHJvcFsxXTtcblx0XHR9XG5cdH0sIHRydWUgKTtcblxuXHQvL1x0QWRkIHZhbHVlIGJpbmRpbmdzIGZvciB2YXJpb3VzIGV2ZW50IHR5cGVzIFxuXHR2YXIgZXZlbnRzID0gW1wiSW5wdXRcIiwgXCJLZXl1cFwiLCBcIktleXByZXNzXCJdLFxuXHRcdGNyZWF0ZUJpbmRpbmcgPSBmdW5jdGlvbihuYW1lLCBldmUpe1xuXHRcdFx0Ly9cdEJpLWRpcmVjdGlvbmFsIGJpbmRpbmcgb2YgdmFsdWVcblx0XHRcdG0uYWRkQmluZGluZyhuYW1lLCBmdW5jdGlvbihwcm9wKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgcHJvcCA9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0aGlzLnZhbHVlID0gcHJvcCgpO1xuXHRcdFx0XHRcdHRoaXNbZXZlXSA9IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCBwcm9wKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZhbHVlID0gcHJvcDtcblx0XHRcdFx0fVxuXHRcdFx0fSwgdHJ1ZSk7XG5cdFx0fTtcblxuXHRmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0dmFyIGV2ZSA9IGV2ZW50c1tpXTtcblx0XHRjcmVhdGVCaW5kaW5nKFwidmFsdWVcIiArIGV2ZSwgXCJvblwiICsgZXZlLnRvTG93ZXJDYXNlKCkpO1xuXHR9XG5cblxuXHQvL1x0U2V0IGEgdmFsdWUgb24gYSBwcm9wZXJ0eVxuXHRtLnNldCA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRwcm9wKHZhbHVlKTtcblx0XHR9O1xuXHR9O1xuXG5cdC8qXHRSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjYW4gdHJpZ2dlciBhIGJpbmRpbmcgXG5cdFx0VXNhZ2U6IG9uY2xpY2s6IG0udHJpZ2dlcignYmluZGluZycsIHByb3ApXG5cdCovXG5cdG0udHJpZ2dlciA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0dmFyIG5hbWUgPSBhcmdzWzBdLFxuXHRcdFx0XHRhcmdMaXN0ID0gYXJncy5zbGljZSgxKTtcblx0XHRcdGlmIChtLmJpbmRpbmdzW25hbWVdKSB7XG5cdFx0XHRcdG0uYmluZGluZ3NbbmFtZV0uZnVuYy5hcHBseSh0aGlzLCBhcmdMaXN0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiBtLmJpbmRpbmdzO1xufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsQmluZGluZ3M7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbWl0aHJpbEJpbmRpbmdzO1xuXHR9KTtcbn0gZWxzZSB7XG5cdG1pdGhyaWxCaW5kaW5ncyh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSk7XG59XG5cbn0oKSk7IiwiLy9cdE1pdGhyaWwgc3VnYXIgdGFncy5cbi8vXHRDb3B5cmlnaHQgKEMpIDIwMTUganNndXkgKE1pa2tlbCBCZXJnbWFubilcbi8vXHRNSVQgbGljZW5zZWRcbihmdW5jdGlvbigpe1xudmFyIG1pdGhyaWxTdWdhcnRhZ3MgPSBmdW5jdGlvbihtLCBzY29wZSl7XG5cdG0uc3VnYXJUYWdzID0gbS5zdWdhclRhZ3MgfHwge307XG5cdHNjb3BlID0gc2NvcGUgfHwgbTtcblxuXHR2YXIgYXJnID0gZnVuY3Rpb24obDEsIGwyKXtcblx0XHRcdHZhciBpO1xuXHRcdFx0Zm9yIChpIGluIGwyKSB7aWYobDIuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdFx0bDEucHVzaChsMltpXSk7XG5cdFx0XHR9fVxuXHRcdFx0cmV0dXJuIGwxO1xuXHRcdH0sIFxuXHRcdGdldENsYXNzTGlzdCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuXHRcdFx0dmFyIGksIHJlc3VsdDtcblx0XHRcdGZvcihpIGluIGFyZ3MpIHtcblx0XHRcdFx0aWYoYXJnc1tpXSAmJiBhcmdzW2ldLmNsYXNzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiAoYXJnc1tpXS5jbGFzcyA9PSBcInN0cmluZ1wiKT8gXG5cdFx0XHRcdFx0XHRhcmdzW2ldLmNsYXNzLnNwbGl0KFwiIFwiKTpcblx0XHRcdFx0XHRcdGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRtYWtlU3VnYXJUYWcgPSBmdW5jdGlvbih0YWcpIHtcblx0XHRcdHZhciBjLCBlbDtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdFx0XHQvL1x0aWYgY2xhc3MgaXMgc3RyaW5nLCBhbGxvdyB1c2Ugb2YgY2FjaGVcblx0XHRcdFx0aWYoYyA9IGdldENsYXNzTGlzdChhcmdzKSkge1xuXHRcdFx0XHRcdGVsID0gW3RhZyArIFwiLlwiICsgYy5qb2luKFwiLlwiKV07XG5cdFx0XHRcdFx0Ly9cdFJlbW92ZSBjbGFzcyB0YWcsIHNvIHdlIGRvbid0IGR1cGxpY2F0ZVxuXHRcdFx0XHRcdGZvcih2YXIgaSBpbiBhcmdzKSB7XG5cdFx0XHRcdFx0XHRpZihhcmdzW2ldICYmIGFyZ3NbaV0uY2xhc3MpIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIGFyZ3NbaV0uY2xhc3M7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGVsID0gW3RhZ107XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIChtLmU/IG0uZTogbSkuYXBwbHkodGhpcywgYXJnKGVsLCBhcmdzKSk7XG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0dGFnTGlzdCA9IFtcIkFcIixcIkFCQlJcIixcIkFDUk9OWU1cIixcIkFERFJFU1NcIixcIkFSRUFcIixcIkFSVElDTEVcIixcIkFTSURFXCIsXCJBVURJT1wiLFwiQlwiLFwiQkRJXCIsXCJCRE9cIixcIkJJR1wiLFwiQkxPQ0tRVU9URVwiLFwiQk9EWVwiLFwiQlJcIixcIkJVVFRPTlwiLFwiQ0FOVkFTXCIsXCJDQVBUSU9OXCIsXCJDSVRFXCIsXCJDT0RFXCIsXCJDT0xcIixcIkNPTEdST1VQXCIsXCJDT01NQU5EXCIsXCJEQVRBTElTVFwiLFwiRERcIixcIkRFTFwiLFwiREVUQUlMU1wiLFwiREZOXCIsXCJESVZcIixcIkRMXCIsXCJEVFwiLFwiRU1cIixcIkVNQkVEXCIsXCJGSUVMRFNFVFwiLFwiRklHQ0FQVElPTlwiLFwiRklHVVJFXCIsXCJGT09URVJcIixcIkZPUk1cIixcIkZSQU1FXCIsXCJGUkFNRVNFVFwiLFwiSDFcIixcIkgyXCIsXCJIM1wiLFwiSDRcIixcIkg1XCIsXCJINlwiLFwiSEVBRFwiLFwiSEVBREVSXCIsXCJIR1JPVVBcIixcIkhSXCIsXCJIVE1MXCIsXCJJXCIsXCJJRlJBTUVcIixcIklNR1wiLFwiSU5QVVRcIixcIklOU1wiLFwiS0JEXCIsXCJLRVlHRU5cIixcIkxBQkVMXCIsXCJMRUdFTkRcIixcIkxJXCIsXCJMSU5LXCIsXCJNQVBcIixcIk1BUktcIixcIk1FVEFcIixcIk1FVEVSXCIsXCJOQVZcIixcIk5PU0NSSVBUXCIsXCJPQkpFQ1RcIixcIk9MXCIsXCJPUFRHUk9VUFwiLFwiT1BUSU9OXCIsXCJPVVRQVVRcIixcIlBcIixcIlBBUkFNXCIsXCJQUkVcIixcIlBST0dSRVNTXCIsXCJRXCIsXCJSUFwiLFwiUlRcIixcIlJVQllcIixcIlNBTVBcIixcIlNDUklQVFwiLFwiU0VDVElPTlwiLFwiU0VMRUNUXCIsXCJTTUFMTFwiLFwiU09VUkNFXCIsXCJTUEFOXCIsXCJTUExJVFwiLFwiU1RST05HXCIsXCJTVFlMRVwiLFwiU1VCXCIsXCJTVU1NQVJZXCIsXCJTVVBcIixcIlRBQkxFXCIsXCJUQk9EWVwiLFwiVERcIixcIlRFWFRBUkVBXCIsXCJURk9PVFwiLFwiVEhcIixcIlRIRUFEXCIsXCJUSU1FXCIsXCJUSVRMRVwiLFwiVFJcIixcIlRSQUNLXCIsXCJUVFwiLFwiVUxcIixcIlZBUlwiLFwiVklERU9cIixcIldCUlwiXSxcblx0XHRsb3dlclRhZ0NhY2hlID0ge30sXG5cdFx0aTtcblxuXHQvL1x0Q3JlYXRlIHN1Z2FyJ2QgZnVuY3Rpb25zIGluIHRoZSByZXF1aXJlZCBzY29wZXNcblx0Zm9yIChpIGluIHRhZ0xpc3QpIHtpZih0YWdMaXN0Lmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0KGZ1bmN0aW9uKHRhZyl7XG5cdFx0XHR2YXIgbG93ZXJUYWcgPSB0YWcudG9Mb3dlckNhc2UoKTtcblx0XHRcdHNjb3BlW3RhZ10gPSBsb3dlclRhZ0NhY2hlW2xvd2VyVGFnXSA9IG1ha2VTdWdhclRhZyhsb3dlclRhZyk7XG5cdFx0fSh0YWdMaXN0W2ldKSk7XG5cdH19XG5cblx0Ly9cdExvd2VyY2FzZWQgc3VnYXIgdGFnc1xuXHRtLnN1Z2FyVGFncy5sb3dlciA9IGZ1bmN0aW9uKCl7XG5cdFx0cmV0dXJuIGxvd2VyVGFnQ2FjaGU7XG5cdH07XG5cblx0cmV0dXJuIHNjb3BlO1xufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsU3VnYXJ0YWdzO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuXHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG1pdGhyaWxTdWdhcnRhZ3M7XG5cdH0pO1xufSBlbHNlIHtcblx0bWl0aHJpbFN1Z2FydGFncyhcblx0XHR0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSxcblx0XHR0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdzoge31cblx0KTtcbn1cblxufSgpKTsiLCJ2YXIgbSA9IChmdW5jdGlvbiBhcHAod2luZG93LCB1bmRlZmluZWQpIHtcclxuXHR2YXIgT0JKRUNUID0gXCJbb2JqZWN0IE9iamVjdF1cIiwgQVJSQVkgPSBcIltvYmplY3QgQXJyYXldXCIsIFNUUklORyA9IFwiW29iamVjdCBTdHJpbmddXCIsIEZVTkNUSU9OID0gXCJmdW5jdGlvblwiO1xyXG5cdHZhciB0eXBlID0ge30udG9TdHJpbmc7XHJcblx0dmFyIHBhcnNlciA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbLis/XFxdKS9nLCBhdHRyUGFyc2VyID0gL1xcWyguKz8pKD86PShcInwnfCkoLio/KVxcMik/XFxdLztcclxuXHR2YXIgdm9pZEVsZW1lbnRzID0gL14oQVJFQXxCQVNFfEJSfENPTHxDT01NQU5EfEVNQkVEfEhSfElNR3xJTlBVVHxLRVlHRU58TElOS3xNRVRBfFBBUkFNfFNPVVJDRXxUUkFDS3xXQlIpJC87XHJcblx0dmFyIG5vb3AgPSBmdW5jdGlvbigpIHt9XHJcblxyXG5cdC8vIGNhY2hpbmcgY29tbW9ubHkgdXNlZCB2YXJpYWJsZXNcclxuXHR2YXIgJGRvY3VtZW50LCAkbG9jYXRpb24sICRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUsICRjYW5jZWxBbmltYXRpb25GcmFtZTtcclxuXHJcblx0Ly8gc2VsZiBpbnZva2luZyBmdW5jdGlvbiBuZWVkZWQgYmVjYXVzZSBvZiB0aGUgd2F5IG1vY2tzIHdvcmtcclxuXHRmdW5jdGlvbiBpbml0aWFsaXplKHdpbmRvdyl7XHJcblx0XHQkZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XHJcblx0XHQkbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb247XHJcblx0XHQkY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LmNsZWFyVGltZW91dDtcclxuXHRcdCRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5zZXRUaW1lb3V0O1xyXG5cdH1cclxuXHJcblx0aW5pdGlhbGl6ZSh3aW5kb3cpO1xyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQHR5cGVkZWYge1N0cmluZ30gVGFnXHJcblx0ICogQSBzdHJpbmcgdGhhdCBsb29rcyBsaWtlIC0+IGRpdi5jbGFzc25hbWUjaWRbcGFyYW09b25lXVtwYXJhbTI9dHdvXVxyXG5cdCAqIFdoaWNoIGRlc2NyaWJlcyBhIERPTSBub2RlXHJcblx0ICovXHJcblxyXG5cdC8qKlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtUYWd9IFRoZSBET00gbm9kZSB0YWdcclxuXHQgKiBAcGFyYW0ge09iamVjdD1bXX0gb3B0aW9uYWwga2V5LXZhbHVlIHBhaXJzIHRvIGJlIG1hcHBlZCB0byBET00gYXR0cnNcclxuXHQgKiBAcGFyYW0gey4uLm1Ob2RlPVtdfSBaZXJvIG9yIG1vcmUgTWl0aHJpbCBjaGlsZCBub2Rlcy4gQ2FuIGJlIGFuIGFycmF5LCBvciBzcGxhdCAob3B0aW9uYWwpXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtKCkge1xyXG5cdFx0dmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcblx0XHR2YXIgaGFzQXR0cnMgPSBhcmdzWzFdICE9IG51bGwgJiYgdHlwZS5jYWxsKGFyZ3NbMV0pID09PSBPQkpFQ1QgJiYgIShcInRhZ1wiIGluIGFyZ3NbMV0gfHwgXCJ2aWV3XCIgaW4gYXJnc1sxXSkgJiYgIShcInN1YnRyZWVcIiBpbiBhcmdzWzFdKTtcclxuXHRcdHZhciBhdHRycyA9IGhhc0F0dHJzID8gYXJnc1sxXSA6IHt9O1xyXG5cdFx0dmFyIGNsYXNzQXR0ck5hbWUgPSBcImNsYXNzXCIgaW4gYXR0cnMgPyBcImNsYXNzXCIgOiBcImNsYXNzTmFtZVwiO1xyXG5cdFx0dmFyIGNlbGwgPSB7dGFnOiBcImRpdlwiLCBhdHRyczoge319O1xyXG5cdFx0dmFyIG1hdGNoLCBjbGFzc2VzID0gW107XHJcblx0XHRpZiAodHlwZS5jYWxsKGFyZ3NbMF0pICE9IFNUUklORykgdGhyb3cgbmV3IEVycm9yKFwic2VsZWN0b3IgaW4gbShzZWxlY3RvciwgYXR0cnMsIGNoaWxkcmVuKSBzaG91bGQgYmUgYSBzdHJpbmdcIilcclxuXHRcdHdoaWxlIChtYXRjaCA9IHBhcnNlci5leGVjKGFyZ3NbMF0pKSB7XHJcblx0XHRcdGlmIChtYXRjaFsxXSA9PT0gXCJcIiAmJiBtYXRjaFsyXSkgY2VsbC50YWcgPSBtYXRjaFsyXTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbMV0gPT09IFwiI1wiKSBjZWxsLmF0dHJzLmlkID0gbWF0Y2hbMl07XHJcblx0XHRcdGVsc2UgaWYgKG1hdGNoWzFdID09PSBcIi5cIikgY2xhc3Nlcy5wdXNoKG1hdGNoWzJdKTtcclxuXHRcdFx0ZWxzZSBpZiAobWF0Y2hbM11bMF0gPT09IFwiW1wiKSB7XHJcblx0XHRcdFx0dmFyIHBhaXIgPSBhdHRyUGFyc2VyLmV4ZWMobWF0Y2hbM10pO1xyXG5cdFx0XHRcdGNlbGwuYXR0cnNbcGFpclsxXV0gPSBwYWlyWzNdIHx8IChwYWlyWzJdID8gXCJcIiA6dHJ1ZSlcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjaGlsZHJlbiA9IGhhc0F0dHJzID8gYXJncy5zbGljZSgyKSA6IGFyZ3Muc2xpY2UoMSk7XHJcblx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIHR5cGUuY2FsbChjaGlsZHJlblswXSkgPT09IEFSUkFZKSB7XHJcblx0XHRcdGNlbGwuY2hpbGRyZW4gPSBjaGlsZHJlblswXVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNlbGwuY2hpbGRyZW4gPSBjaGlsZHJlblxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRmb3IgKHZhciBhdHRyTmFtZSBpbiBhdHRycykge1xyXG5cdFx0XHRpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYXR0ck5hbWUpKSB7XHJcblx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBjbGFzc0F0dHJOYW1lICYmIGF0dHJzW2F0dHJOYW1lXSAhPSBudWxsICYmIGF0dHJzW2F0dHJOYW1lXSAhPT0gXCJcIikge1xyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGF0dHJzW2F0dHJOYW1lXSlcclxuXHRcdFx0XHRcdGNlbGwuYXR0cnNbYXR0ck5hbWVdID0gXCJcIiAvL2NyZWF0ZSBrZXkgaW4gY29ycmVjdCBpdGVyYXRpb24gb3JkZXJcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBjZWxsLmF0dHJzW2F0dHJOYW1lXSA9IGF0dHJzW2F0dHJOYW1lXVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSBjZWxsLmF0dHJzW2NsYXNzQXR0ck5hbWVdID0gY2xhc3Nlcy5qb2luKFwiIFwiKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGNlbGxcclxuXHR9XHJcblx0ZnVuY3Rpb24gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBwYXJlbnRDYWNoZSwgcGFyZW50SW5kZXgsIGRhdGEsIGNhY2hlZCwgc2hvdWxkUmVhdHRhY2gsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XHJcblx0XHQvL2BidWlsZGAgaXMgYSByZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCBtYW5hZ2VzIGNyZWF0aW9uL2RpZmZpbmcvcmVtb3ZhbCBvZiBET00gZWxlbWVudHMgYmFzZWQgb24gY29tcGFyaXNvbiBiZXR3ZWVuIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vdGhlIGRpZmYgYWxnb3JpdGhtIGNhbiBiZSBzdW1tYXJpemVkIGFzIHRoaXM6XHJcblx0XHQvLzEgLSBjb21wYXJlIGBkYXRhYCBhbmQgYGNhY2hlZGBcclxuXHRcdC8vMiAtIGlmIHRoZXkgYXJlIGRpZmZlcmVudCwgY29weSBgZGF0YWAgdG8gYGNhY2hlZGAgYW5kIHVwZGF0ZSB0aGUgRE9NIGJhc2VkIG9uIHdoYXQgdGhlIGRpZmZlcmVuY2UgaXNcclxuXHRcdC8vMyAtIHJlY3Vyc2l2ZWx5IGFwcGx5IHRoaXMgYWxnb3JpdGhtIGZvciBldmVyeSBhcnJheSBhbmQgZm9yIHRoZSBjaGlsZHJlbiBvZiBldmVyeSB2aXJ0dWFsIGVsZW1lbnRcclxuXHJcblx0XHQvL3RoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXMgcmVkcmF3J3MgYGRhdGFgIGRhdGEgc3RydWN0dXJlLCB3aXRoIGEgZmV3IGFkZGl0aW9uczpcclxuXHRcdC8vLSBgY2FjaGVkYCBhbHdheXMgaGFzIGEgcHJvcGVydHkgY2FsbGVkIGBub2Rlc2AsIHdoaWNoIGlzIGEgbGlzdCBvZiBET00gZWxlbWVudHMgdGhhdCBjb3JyZXNwb25kIHRvIHRoZSBkYXRhIHJlcHJlc2VudGVkIGJ5IHRoZSByZXNwZWN0aXZlIHZpcnR1YWwgZWxlbWVudFxyXG5cdFx0Ly8tIGluIG9yZGVyIHRvIHN1cHBvcnQgYXR0YWNoaW5nIGBub2Rlc2AgYXMgYSBwcm9wZXJ0eSBvZiBgY2FjaGVkYCwgYGNhY2hlZGAgaXMgKmFsd2F5cyogYSBub24tcHJpbWl0aXZlIG9iamVjdCwgaS5lLiBpZiB0aGUgZGF0YSB3YXMgYSBzdHJpbmcsIHRoZW4gY2FjaGVkIGlzIGEgU3RyaW5nIGluc3RhbmNlLiBJZiBkYXRhIHdhcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAsIGNhY2hlZCBpcyBgbmV3IFN0cmluZyhcIlwiKWBcclxuXHRcdC8vLSBgY2FjaGVkIGFsc28gaGFzIGEgYGNvbmZpZ0NvbnRleHRgIHByb3BlcnR5LCB3aGljaCBpcyB0aGUgc3RhdGUgc3RvcmFnZSBvYmplY3QgZXhwb3NlZCBieSBjb25maWcoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dClcclxuXHRcdC8vLSB3aGVuIGBjYWNoZWRgIGlzIGFuIE9iamVjdCwgaXQgcmVwcmVzZW50cyBhIHZpcnR1YWwgZWxlbWVudDsgd2hlbiBpdCdzIGFuIEFycmF5LCBpdCByZXByZXNlbnRzIGEgbGlzdCBvZiBlbGVtZW50czsgd2hlbiBpdCdzIGEgU3RyaW5nLCBOdW1iZXIgb3IgQm9vbGVhbiwgaXQgcmVwcmVzZW50cyBhIHRleHQgbm9kZVxyXG5cclxuXHRcdC8vYHBhcmVudEVsZW1lbnRgIGlzIGEgRE9NIGVsZW1lbnQgdXNlZCBmb3IgVzNDIERPTSBBUEkgY2FsbHNcclxuXHRcdC8vYHBhcmVudFRhZ2AgaXMgb25seSB1c2VkIGZvciBoYW5kbGluZyBhIGNvcm5lciBjYXNlIGZvciB0ZXh0YXJlYSB2YWx1ZXNcclxuXHRcdC8vYHBhcmVudENhY2hlYCBpcyB1c2VkIHRvIHJlbW92ZSBub2RlcyBpbiBzb21lIG11bHRpLW5vZGUgY2FzZXNcclxuXHRcdC8vYHBhcmVudEluZGV4YCBhbmQgYGluZGV4YCBhcmUgdXNlZCB0byBmaWd1cmUgb3V0IHRoZSBvZmZzZXQgb2Ygbm9kZXMuIFRoZXkncmUgYXJ0aWZhY3RzIGZyb20gYmVmb3JlIGFycmF5cyBzdGFydGVkIGJlaW5nIGZsYXR0ZW5lZCBhbmQgYXJlIGxpa2VseSByZWZhY3RvcmFibGVcclxuXHRcdC8vYGRhdGFgIGFuZCBgY2FjaGVkYCBhcmUsIHJlc3BlY3RpdmVseSwgdGhlIG5ldyBhbmQgb2xkIG5vZGVzIGJlaW5nIGRpZmZlZFxyXG5cdFx0Ly9gc2hvdWxkUmVhdHRhY2hgIGlzIGEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBwYXJlbnQgbm9kZSB3YXMgcmVjcmVhdGVkIChpZiBzbywgYW5kIGlmIHRoaXMgbm9kZSBpcyByZXVzZWQsIHRoZW4gdGhpcyBub2RlIG11c3QgcmVhdHRhY2ggaXRzZWxmIHRvIHRoZSBuZXcgcGFyZW50KVxyXG5cdFx0Ly9gZWRpdGFibGVgIGlzIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFuIGFuY2VzdG9yIGlzIGNvbnRlbnRlZGl0YWJsZVxyXG5cdFx0Ly9gbmFtZXNwYWNlYCBpbmRpY2F0ZXMgdGhlIGNsb3Nlc3QgSFRNTCBuYW1lc3BhY2UgYXMgaXQgY2FzY2FkZXMgZG93biBmcm9tIGFuIGFuY2VzdG9yXHJcblx0XHQvL2Bjb25maWdzYCBpcyBhIGxpc3Qgb2YgY29uZmlnIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIHRvcG1vc3QgYGJ1aWxkYCBjYWxsIGZpbmlzaGVzIHJ1bm5pbmdcclxuXHJcblx0XHQvL3RoZXJlJ3MgbG9naWMgdGhhdCByZWxpZXMgb24gdGhlIGFzc3VtcHRpb24gdGhhdCBudWxsIGFuZCB1bmRlZmluZWQgZGF0YSBhcmUgZXF1aXZhbGVudCB0byBlbXB0eSBzdHJpbmdzXHJcblx0XHQvLy0gdGhpcyBwcmV2ZW50cyBsaWZlY3ljbGUgc3VycHJpc2VzIGZyb20gcHJvY2VkdXJhbCBoZWxwZXJzIHRoYXQgbWl4IGltcGxpY2l0IGFuZCBleHBsaWNpdCByZXR1cm4gc3RhdGVtZW50cyAoZS5nLiBmdW5jdGlvbiBmb28oKSB7aWYgKGNvbmQpIHJldHVybiBtKFwiZGl2XCIpfVxyXG5cdFx0Ly8tIGl0IHNpbXBsaWZpZXMgZGlmZmluZyBjb2RlXHJcblx0XHQvL2RhdGEudG9TdHJpbmcoKSBtaWdodCB0aHJvdyBvciByZXR1cm4gbnVsbCBpZiBkYXRhIGlzIHRoZSByZXR1cm4gdmFsdWUgb2YgQ29uc29sZS5sb2cgaW4gRmlyZWZveCAoYmVoYXZpb3IgZGVwZW5kcyBvbiB2ZXJzaW9uKVxyXG5cdFx0dHJ5IHtpZiAoZGF0YSA9PSBudWxsIHx8IGRhdGEudG9TdHJpbmcoKSA9PSBudWxsKSBkYXRhID0gXCJcIjt9IGNhdGNoIChlKSB7ZGF0YSA9IFwiXCJ9XHJcblx0XHRpZiAoZGF0YS5zdWJ0cmVlID09PSBcInJldGFpblwiKSByZXR1cm4gY2FjaGVkO1xyXG5cdFx0dmFyIGNhY2hlZFR5cGUgPSB0eXBlLmNhbGwoY2FjaGVkKSwgZGF0YVR5cGUgPSB0eXBlLmNhbGwoZGF0YSk7XHJcblx0XHRpZiAoY2FjaGVkID09IG51bGwgfHwgY2FjaGVkVHlwZSAhPT0gZGF0YVR5cGUpIHtcclxuXHRcdFx0aWYgKGNhY2hlZCAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKHBhcmVudENhY2hlICYmIHBhcmVudENhY2hlLm5vZGVzKSB7XHJcblx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gaW5kZXggLSBwYXJlbnRJbmRleDtcclxuXHRcdFx0XHRcdHZhciBlbmQgPSBvZmZzZXQgKyAoZGF0YVR5cGUgPT09IEFSUkFZID8gZGF0YSA6IGNhY2hlZC5ub2RlcykubGVuZ3RoO1xyXG5cdFx0XHRcdFx0Y2xlYXIocGFyZW50Q2FjaGUubm9kZXMuc2xpY2Uob2Zmc2V0LCBlbmQpLCBwYXJlbnRDYWNoZS5zbGljZShvZmZzZXQsIGVuZCkpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2UgaWYgKGNhY2hlZC5ub2RlcykgY2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpXHJcblx0XHRcdH1cclxuXHRcdFx0Y2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3I7XHJcblx0XHRcdGlmIChjYWNoZWQudGFnKSBjYWNoZWQgPSB7fTsgLy9pZiBjb25zdHJ1Y3RvciBjcmVhdGVzIGEgdmlydHVhbCBkb20gZWxlbWVudCwgdXNlIGEgYmxhbmsgb2JqZWN0IGFzIHRoZSBiYXNlIGNhY2hlZCBub2RlIGluc3RlYWQgb2YgY29weWluZyB0aGUgdmlydHVhbCBlbCAoIzI3NylcclxuXHRcdFx0Y2FjaGVkLm5vZGVzID0gW11cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGF0YVR5cGUgPT09IEFSUkFZKSB7XHJcblx0XHRcdC8vcmVjdXJzaXZlbHkgZmxhdHRlbiBhcnJheVxyXG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdGlmICh0eXBlLmNhbGwoZGF0YVtpXSkgPT09IEFSUkFZKSB7XHJcblx0XHRcdFx0XHRkYXRhID0gZGF0YS5jb25jYXQuYXBwbHkoW10sIGRhdGEpO1xyXG5cdFx0XHRcdFx0aS0tIC8vY2hlY2sgY3VycmVudCBpbmRleCBhZ2FpbiBhbmQgZmxhdHRlbiB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBuZXN0ZWQgYXJyYXlzIGF0IHRoYXQgaW5kZXhcclxuXHRcdFx0XHRcdGxlbiA9IGRhdGEubGVuZ3RoXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgbm9kZXMgPSBbXSwgaW50YWN0ID0gY2FjaGVkLmxlbmd0aCA9PT0gZGF0YS5sZW5ndGgsIHN1YkFycmF5Q291bnQgPSAwO1xyXG5cclxuXHRcdFx0Ly9rZXlzIGFsZ29yaXRobTogc29ydCBlbGVtZW50cyB3aXRob3V0IHJlY3JlYXRpbmcgdGhlbSBpZiBrZXlzIGFyZSBwcmVzZW50XHJcblx0XHRcdC8vMSkgY3JlYXRlIGEgbWFwIG9mIGFsbCBleGlzdGluZyBrZXlzLCBhbmQgbWFyayBhbGwgZm9yIGRlbGV0aW9uXHJcblx0XHRcdC8vMikgYWRkIG5ldyBrZXlzIHRvIG1hcCBhbmQgbWFyayB0aGVtIGZvciBhZGRpdGlvblxyXG5cdFx0XHQvLzMpIGlmIGtleSBleGlzdHMgaW4gbmV3IGxpc3QsIGNoYW5nZSBhY3Rpb24gZnJvbSBkZWxldGlvbiB0byBhIG1vdmVcclxuXHRcdFx0Ly80KSBmb3IgZWFjaCBrZXksIGhhbmRsZSBpdHMgY29ycmVzcG9uZGluZyBhY3Rpb24gYXMgbWFya2VkIGluIHByZXZpb3VzIHN0ZXBzXHJcblx0XHRcdHZhciBERUxFVElPTiA9IDEsIElOU0VSVElPTiA9IDIgLCBNT1ZFID0gMztcclxuXHRcdFx0dmFyIGV4aXN0aW5nID0ge30sIHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IGZhbHNlO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNhY2hlZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmIChjYWNoZWRbaV0gJiYgY2FjaGVkW2ldLmF0dHJzICYmIGNhY2hlZFtpXS5hdHRycy5rZXkgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0c2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gdHJ1ZTtcclxuXHRcdFx0XHRcdGV4aXN0aW5nW2NhY2hlZFtpXS5hdHRycy5rZXldID0ge2FjdGlvbjogREVMRVRJT04sIGluZGV4OiBpfVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGd1aWQgPSAwXHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKGRhdGFbaV0gJiYgZGF0YVtpXS5hdHRycyAmJiBkYXRhW2ldLmF0dHJzLmtleSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBqID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGogPCBsZW47IGorKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoZGF0YVtqXSAmJiBkYXRhW2pdLmF0dHJzICYmIGRhdGFbal0uYXR0cnMua2V5ID09IG51bGwpIGRhdGFbal0uYXR0cnMua2V5ID0gXCJfX21pdGhyaWxfX1wiICsgZ3VpZCsrXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYgKHNob3VsZE1haW50YWluSWRlbnRpdGllcykge1xyXG5cdFx0XHRcdHZhciBrZXlzRGlmZmVyID0gZmFsc2VcclxuXHRcdFx0XHRpZiAoZGF0YS5sZW5ndGggIT0gY2FjaGVkLmxlbmd0aCkga2V5c0RpZmZlciA9IHRydWVcclxuXHRcdFx0XHRlbHNlIGZvciAodmFyIGkgPSAwLCBjYWNoZWRDZWxsLCBkYXRhQ2VsbDsgY2FjaGVkQ2VsbCA9IGNhY2hlZFtpXSwgZGF0YUNlbGwgPSBkYXRhW2ldOyBpKyspIHtcclxuXHRcdFx0XHRcdGlmIChjYWNoZWRDZWxsLmF0dHJzICYmIGRhdGFDZWxsLmF0dHJzICYmIGNhY2hlZENlbGwuYXR0cnMua2V5ICE9IGRhdGFDZWxsLmF0dHJzLmtleSkge1xyXG5cdFx0XHRcdFx0XHRrZXlzRGlmZmVyID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRicmVha1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZiAoa2V5c0RpZmZlcikge1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0aWYgKGRhdGFbaV0gJiYgZGF0YVtpXS5hdHRycykge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChkYXRhW2ldLmF0dHJzLmtleSAhPSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIga2V5ID0gZGF0YVtpXS5hdHRycy5rZXk7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoIWV4aXN0aW5nW2tleV0pIGV4aXN0aW5nW2tleV0gPSB7YWN0aW9uOiBJTlNFUlRJT04sIGluZGV4OiBpfTtcclxuXHRcdFx0XHRcdFx0XHRcdGVsc2UgZXhpc3Rpbmdba2V5XSA9IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiBNT1ZFLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpbmRleDogaSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZnJvbTogZXhpc3Rpbmdba2V5XS5pbmRleCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudDogY2FjaGVkLm5vZGVzW2V4aXN0aW5nW2tleV0uaW5kZXhdIHx8ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgYWN0aW9ucyA9IFtdXHJcblx0XHRcdFx0XHRmb3IgKHZhciBwcm9wIGluIGV4aXN0aW5nKSBhY3Rpb25zLnB1c2goZXhpc3RpbmdbcHJvcF0pXHJcblx0XHRcdFx0XHR2YXIgY2hhbmdlcyA9IGFjdGlvbnMuc29ydChzb3J0Q2hhbmdlcyk7XHJcblx0XHRcdFx0XHR2YXIgbmV3Q2FjaGVkID0gbmV3IEFycmF5KGNhY2hlZC5sZW5ndGgpXHJcblx0XHRcdFx0XHRuZXdDYWNoZWQubm9kZXMgPSBjYWNoZWQubm9kZXMuc2xpY2UoKVxyXG5cclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBjaGFuZ2U7IGNoYW5nZSA9IGNoYW5nZXNbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAoY2hhbmdlLmFjdGlvbiA9PT0gREVMRVRJT04pIHtcclxuXHRcdFx0XHRcdFx0XHRjbGVhcihjYWNoZWRbY2hhbmdlLmluZGV4XS5ub2RlcywgY2FjaGVkW2NoYW5nZS5pbmRleF0pO1xyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlLmluZGV4LCAxKVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmIChjaGFuZ2UuYWN0aW9uID09PSBJTlNFUlRJT04pIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgZHVtbXkgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuXHRcdFx0XHRcdFx0XHRkdW1teS5rZXkgPSBkYXRhW2NoYW5nZS5pbmRleF0uYXR0cnMua2V5O1xyXG5cdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGR1bW15LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlLmluZGV4XSB8fCBudWxsKTtcclxuXHRcdFx0XHRcdFx0XHRuZXdDYWNoZWQuc3BsaWNlKGNoYW5nZS5pbmRleCwgMCwge2F0dHJzOiB7a2V5OiBkYXRhW2NoYW5nZS5pbmRleF0uYXR0cnMua2V5fSwgbm9kZXM6IFtkdW1teV19KVxyXG5cdFx0XHRcdFx0XHRcdG5ld0NhY2hlZC5ub2Rlc1tjaGFuZ2UuaW5kZXhdID0gZHVtbXlcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0aWYgKGNoYW5nZS5hY3Rpb24gPT09IE1PVkUpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2NoYW5nZS5pbmRleF0gIT09IGNoYW5nZS5lbGVtZW50ICYmIGNoYW5nZS5lbGVtZW50ICE9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjaGFuZ2UuZWxlbWVudCwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2NoYW5nZS5pbmRleF0gfHwgbnVsbClcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FjaGVkW2NoYW5nZS5pbmRleF0gPSBjYWNoZWRbY2hhbmdlLmZyb21dXHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FjaGVkLm5vZGVzW2NoYW5nZS5pbmRleF0gPSBjaGFuZ2UuZWxlbWVudFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRjYWNoZWQgPSBuZXdDYWNoZWQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vZW5kIGtleSBhbGdvcml0aG1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBjYWNoZUNvdW50ID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdC8vZGlmZiBlYWNoIGl0ZW0gaW4gdGhlIGFycmF5XHJcblx0XHRcdFx0dmFyIGl0ZW0gPSBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGNhY2hlZCwgaW5kZXgsIGRhdGFbaV0sIGNhY2hlZFtjYWNoZUNvdW50XSwgc2hvdWxkUmVhdHRhY2gsIGluZGV4ICsgc3ViQXJyYXlDb3VudCB8fCBzdWJBcnJheUNvdW50LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcclxuXHRcdFx0XHRpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcclxuXHRcdFx0XHRpZiAoIWl0ZW0ubm9kZXMuaW50YWN0KSBpbnRhY3QgPSBmYWxzZTtcclxuXHRcdFx0XHRpZiAoaXRlbS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdFx0Ly9maXggb2Zmc2V0IG9mIG5leHQgZWxlbWVudCBpZiBpdGVtIHdhcyBhIHRydXN0ZWQgc3RyaW5nIHcvIG1vcmUgdGhhbiBvbmUgaHRtbCBlbGVtZW50XHJcblx0XHRcdFx0XHQvL3RoZSBmaXJzdCBjbGF1c2UgaW4gdGhlIHJlZ2V4cCBtYXRjaGVzIGVsZW1lbnRzXHJcblx0XHRcdFx0XHQvL3RoZSBzZWNvbmQgY2xhdXNlIChhZnRlciB0aGUgcGlwZSkgbWF0Y2hlcyB0ZXh0IG5vZGVzXHJcblx0XHRcdFx0XHRzdWJBcnJheUNvdW50ICs9IChpdGVtLm1hdGNoKC88W15cXC9dfFxcPlxccypbXjxdL2cpIHx8IFswXSkubGVuZ3RoXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Ugc3ViQXJyYXlDb3VudCArPSB0eXBlLmNhbGwoaXRlbSkgPT09IEFSUkFZID8gaXRlbS5sZW5ndGggOiAxO1xyXG5cdFx0XHRcdGNhY2hlZFtjYWNoZUNvdW50KytdID0gaXRlbVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghaW50YWN0KSB7XHJcblx0XHRcdFx0Ly9kaWZmIHRoZSBhcnJheSBpdHNlbGZcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvL3VwZGF0ZSB0aGUgbGlzdCBvZiBET00gbm9kZXMgYnkgY29sbGVjdGluZyB0aGUgbm9kZXMgZnJvbSBlYWNoIGl0ZW1cclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0XHRcdFx0aWYgKGNhY2hlZFtpXSAhPSBudWxsKSBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCBjYWNoZWRbaV0ubm9kZXMpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkgaWYgdGhlIG5ldyBhcnJheSBpcyBzaG9ydGVyIHRoYW4gdGhlIG9sZCBvbmVcclxuXHRcdFx0XHQvL2lmIGVycm9ycyBldmVyIGhhcHBlbiBoZXJlLCB0aGUgaXNzdWUgaXMgbW9zdCBsaWtlbHkgYSBidWcgaW4gdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgc29tZXdoZXJlIGVhcmxpZXIgaW4gdGhlIHByb2dyYW1cclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgbm9kZTsgbm9kZSA9IGNhY2hlZC5ub2Rlc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAobm9kZS5wYXJlbnROb2RlICE9IG51bGwgJiYgbm9kZXMuaW5kZXhPZihub2RlKSA8IDApIGNsZWFyKFtub2RlXSwgW2NhY2hlZFtpXV0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRhLmxlbmd0aCA8IGNhY2hlZC5sZW5ndGgpIGNhY2hlZC5sZW5ndGggPSBkYXRhLmxlbmd0aDtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChkYXRhICE9IG51bGwgJiYgZGF0YVR5cGUgPT09IE9CSkVDVCkge1xyXG5cdFx0XHR2YXIgdmlld3MgPSBbXSwgY29udHJvbGxlcnMgPSBbXVxyXG5cdFx0XHR3aGlsZSAoZGF0YS52aWV3KSB7XHJcblx0XHRcdFx0dmFyIHZpZXcgPSBkYXRhLnZpZXcuJG9yaWdpbmFsIHx8IGRhdGEudmlld1xyXG5cdFx0XHRcdHZhciBjb250cm9sbGVySW5kZXggPSBtLnJlZHJhdy5zdHJhdGVneSgpID09IFwiZGlmZlwiICYmIGNhY2hlZC52aWV3cyA/IGNhY2hlZC52aWV3cy5pbmRleE9mKHZpZXcpIDogLTFcclxuXHRcdFx0XHR2YXIgY29udHJvbGxlciA9IGNvbnRyb2xsZXJJbmRleCA+IC0xID8gY2FjaGVkLmNvbnRyb2xsZXJzW2NvbnRyb2xsZXJJbmRleF0gOiBuZXcgKGRhdGEuY29udHJvbGxlciB8fCBub29wKVxyXG5cdFx0XHRcdHZhciBrZXkgPSBkYXRhICYmIGRhdGEuYXR0cnMgJiYgZGF0YS5hdHRycy5rZXlcclxuXHRcdFx0XHRkYXRhID0gcGVuZGluZ1JlcXVlc3RzID09IDAgfHwgKGNhY2hlZCAmJiBjYWNoZWQuY29udHJvbGxlcnMgJiYgY2FjaGVkLmNvbnRyb2xsZXJzLmluZGV4T2YoY29udHJvbGxlcikgPiAtMSkgPyBkYXRhLnZpZXcoY29udHJvbGxlcikgOiB7dGFnOiBcInBsYWNlaG9sZGVyXCJ9XHJcblx0XHRcdFx0aWYgKGRhdGEuc3VidHJlZSA9PT0gXCJyZXRhaW5cIikgcmV0dXJuIGNhY2hlZDtcclxuXHRcdFx0XHRpZiAoa2V5KSB7XHJcblx0XHRcdFx0XHRpZiAoIWRhdGEuYXR0cnMpIGRhdGEuYXR0cnMgPSB7fVxyXG5cdFx0XHRcdFx0ZGF0YS5hdHRycy5rZXkgPSBrZXlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGNvbnRyb2xsZXIub251bmxvYWQpIHVubG9hZGVycy5wdXNoKHtjb250cm9sbGVyOiBjb250cm9sbGVyLCBoYW5kbGVyOiBjb250cm9sbGVyLm9udW5sb2FkfSlcclxuXHRcdFx0XHR2aWV3cy5wdXNoKHZpZXcpXHJcblx0XHRcdFx0Y29udHJvbGxlcnMucHVzaChjb250cm9sbGVyKVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICghZGF0YS50YWcgJiYgY29udHJvbGxlcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnQgdGVtcGxhdGUgbXVzdCByZXR1cm4gYSB2aXJ0dWFsIGVsZW1lbnQsIG5vdCBhbiBhcnJheSwgc3RyaW5nLCBldGMuXCIpXHJcblx0XHRcdGlmICghZGF0YS5hdHRycykgZGF0YS5hdHRycyA9IHt9O1xyXG5cdFx0XHRpZiAoIWNhY2hlZC5hdHRycykgY2FjaGVkLmF0dHJzID0ge307XHJcblxyXG5cdFx0XHR2YXIgZGF0YUF0dHJLZXlzID0gT2JqZWN0LmtleXMoZGF0YS5hdHRycylcclxuXHRcdFx0dmFyIGhhc0tleXMgPSBkYXRhQXR0cktleXMubGVuZ3RoID4gKFwia2V5XCIgaW4gZGF0YS5hdHRycyA/IDEgOiAwKVxyXG5cdFx0XHQvL2lmIGFuIGVsZW1lbnQgaXMgZGlmZmVyZW50IGVub3VnaCBmcm9tIHRoZSBvbmUgaW4gY2FjaGUsIHJlY3JlYXRlIGl0XHJcblx0XHRcdGlmIChkYXRhLnRhZyAhPSBjYWNoZWQudGFnIHx8IGRhdGFBdHRyS2V5cy5zb3J0KCkuam9pbigpICE9IE9iamVjdC5rZXlzKGNhY2hlZC5hdHRycykuc29ydCgpLmpvaW4oKSB8fCBkYXRhLmF0dHJzLmlkICE9IGNhY2hlZC5hdHRycy5pZCB8fCBkYXRhLmF0dHJzLmtleSAhPSBjYWNoZWQuYXR0cnMua2V5IHx8IChtLnJlZHJhdy5zdHJhdGVneSgpID09IFwiYWxsXCIgJiYgKCFjYWNoZWQuY29uZmlnQ29udGV4dCB8fCBjYWNoZWQuY29uZmlnQ29udGV4dC5yZXRhaW4gIT09IHRydWUpKSB8fCAobS5yZWRyYXcuc3RyYXRlZ3koKSA9PSBcImRpZmZcIiAmJiBjYWNoZWQuY29uZmlnQ29udGV4dCAmJiBjYWNoZWQuY29uZmlnQ29udGV4dC5yZXRhaW4gPT09IGZhbHNlKSkge1xyXG5cdFx0XHRcdGlmIChjYWNoZWQubm9kZXMubGVuZ3RoKSBjbGVhcihjYWNoZWQubm9kZXMpO1xyXG5cdFx0XHRcdGlmIChjYWNoZWQuY29uZmlnQ29udGV4dCAmJiB0eXBlb2YgY2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQgPT09IEZVTkNUSU9OKSBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCgpXHJcblx0XHRcdFx0aWYgKGNhY2hlZC5jb250cm9sbGVycykge1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvbnRyb2xsZXI7IGNvbnRyb2xsZXIgPSBjYWNoZWQuY29udHJvbGxlcnNbaV07IGkrKykge1xyXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGNvbnRyb2xsZXIub251bmxvYWQgPT09IEZVTkNUSU9OKSBjb250cm9sbGVyLm9udW5sb2FkKHtwcmV2ZW50RGVmYXVsdDogbm9vcH0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh0eXBlLmNhbGwoZGF0YS50YWcpICE9IFNUUklORykgcmV0dXJuO1xyXG5cclxuXHRcdFx0dmFyIG5vZGUsIGlzTmV3ID0gY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMDtcclxuXHRcdFx0aWYgKGRhdGEuYXR0cnMueG1sbnMpIG5hbWVzcGFjZSA9IGRhdGEuYXR0cnMueG1sbnM7XHJcblx0XHRcdGVsc2UgaWYgKGRhdGEudGFnID09PSBcInN2Z1wiKSBuYW1lc3BhY2UgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XHJcblx0XHRcdGVsc2UgaWYgKGRhdGEudGFnID09PSBcIm1hdGhcIikgbmFtZXNwYWNlID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MXCI7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoaXNOZXcpIHtcclxuXHRcdFx0XHRpZiAoZGF0YS5hdHRycy5pcykgbm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKTtcclxuXHRcdFx0XHRlbHNlIG5vZGUgPSBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZyk7XHJcblx0XHRcdFx0Y2FjaGVkID0ge1xyXG5cdFx0XHRcdFx0dGFnOiBkYXRhLnRhZyxcclxuXHRcdFx0XHRcdC8vc2V0IGF0dHJpYnV0ZXMgZmlyc3QsIHRoZW4gY3JlYXRlIGNoaWxkcmVuXHJcblx0XHRcdFx0XHRhdHRyczogaGFzS2V5cyA/IHNldEF0dHJpYnV0ZXMobm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIHt9LCBuYW1lc3BhY2UpIDogZGF0YS5hdHRycyxcclxuXHRcdFx0XHRcdGNoaWxkcmVuOiBkYXRhLmNoaWxkcmVuICE9IG51bGwgJiYgZGF0YS5jaGlsZHJlbi5sZW5ndGggPiAwID9cclxuXHRcdFx0XHRcdFx0YnVpbGQobm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIHRydWUsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gbm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIDpcclxuXHRcdFx0XHRcdFx0ZGF0YS5jaGlsZHJlbixcclxuXHRcdFx0XHRcdG5vZGVzOiBbbm9kZV1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdGNhY2hlZC52aWV3cyA9IHZpZXdzXHJcblx0XHRcdFx0XHRjYWNoZWQuY29udHJvbGxlcnMgPSBjb250cm9sbGVyc1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAsIGNvbnRyb2xsZXI7IGNvbnRyb2xsZXIgPSBjb250cm9sbGVyc1tpXTsgaSsrKSB7XHJcblx0XHRcdFx0XHRcdGlmIChjb250cm9sbGVyLm9udW5sb2FkICYmIGNvbnRyb2xsZXIub251bmxvYWQuJG9sZCkgY29udHJvbGxlci5vbnVubG9hZCA9IGNvbnRyb2xsZXIub251bmxvYWQuJG9sZFxyXG5cdFx0XHRcdFx0XHRpZiAocGVuZGluZ1JlcXVlc3RzICYmIGNvbnRyb2xsZXIub251bmxvYWQpIHtcclxuXHRcdFx0XHRcdFx0XHR2YXIgb251bmxvYWQgPSBjb250cm9sbGVyLm9udW5sb2FkXHJcblx0XHRcdFx0XHRcdFx0Y29udHJvbGxlci5vbnVubG9hZCA9IG5vb3BcclxuXHRcdFx0XHRcdFx0XHRjb250cm9sbGVyLm9udW5sb2FkLiRvbGQgPSBvbnVubG9hZFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmIChjYWNoZWQuY2hpbGRyZW4gJiYgIWNhY2hlZC5jaGlsZHJlbi5ub2RlcykgY2FjaGVkLmNoaWxkcmVuLm5vZGVzID0gW107XHJcblx0XHRcdFx0Ly9lZGdlIGNhc2U6IHNldHRpbmcgdmFsdWUgb24gPHNlbGVjdD4gZG9lc24ndCB3b3JrIGJlZm9yZSBjaGlsZHJlbiBleGlzdCwgc28gc2V0IGl0IGFnYWluIGFmdGVyIGNoaWxkcmVuIGhhdmUgYmVlbiBjcmVhdGVkXHJcblx0XHRcdFx0aWYgKGRhdGEudGFnID09PSBcInNlbGVjdFwiICYmIFwidmFsdWVcIiBpbiBkYXRhLmF0dHJzKSBzZXRBdHRyaWJ1dGVzKG5vZGUsIGRhdGEudGFnLCB7dmFsdWU6IGRhdGEuYXR0cnMudmFsdWV9LCB7fSwgbmFtZXNwYWNlKTtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2RlLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0bm9kZSA9IGNhY2hlZC5ub2Rlc1swXTtcclxuXHRcdFx0XHRpZiAoaGFzS2V5cykgc2V0QXR0cmlidXRlcyhub2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywgY2FjaGVkLmF0dHJzLCBuYW1lc3BhY2UpO1xyXG5cdFx0XHRcdGNhY2hlZC5jaGlsZHJlbiA9IGJ1aWxkKG5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCBmYWxzZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBub2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWU7XHJcblx0XHRcdFx0aWYgKGNvbnRyb2xsZXJzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0Y2FjaGVkLnZpZXdzID0gdmlld3NcclxuXHRcdFx0XHRcdGNhY2hlZC5jb250cm9sbGVycyA9IGNvbnRyb2xsZXJzXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSAmJiBub2RlICE9IG51bGwpIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbClcclxuXHRcdFx0fVxyXG5cdFx0XHQvL3NjaGVkdWxlIGNvbmZpZ3MgdG8gYmUgY2FsbGVkLiBUaGV5IGFyZSBjYWxsZWQgYWZ0ZXIgYGJ1aWxkYCBmaW5pc2hlcyBydW5uaW5nXHJcblx0XHRcdGlmICh0eXBlb2YgZGF0YS5hdHRyc1tcImNvbmZpZ1wiXSA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHR2YXIgY29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgfHwge307XHJcblxyXG5cdFx0XHRcdC8vIGJpbmRcclxuXHRcdFx0XHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbihkYXRhLCBhcmdzKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBkYXRhLmF0dHJzW1wiY29uZmlnXCJdLmFwcGx5KGRhdGEsIGFyZ3MpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRjb25maWdzLnB1c2goY2FsbGJhY2soZGF0YSwgW25vZGUsICFpc05ldywgY29udGV4dCwgY2FjaGVkXSkpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKHR5cGVvZiBkYXRhICE9IEZVTkNUSU9OKSB7XHJcblx0XHRcdC8vaGFuZGxlIHRleHQgbm9kZXNcclxuXHRcdFx0dmFyIG5vZGVzO1xyXG5cdFx0XHRpZiAoY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdGlmIChkYXRhLiR0cnVzdGVkKSB7XHJcblx0XHRcdFx0XHRub2RlcyA9IGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0bm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXTtcclxuXHRcdFx0XHRcdGlmICghcGFyZW50RWxlbWVudC5ub2RlTmFtZS5tYXRjaCh2b2lkRWxlbWVudHMpKSBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2Rlc1swXSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWNoZWQgPSBcInN0cmluZyBudW1iZXIgYm9vbGVhblwiLmluZGV4T2YodHlwZW9mIGRhdGEpID4gLTEgPyBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKSA6IGRhdGE7XHJcblx0XHRcdFx0Y2FjaGVkLm5vZGVzID0gbm9kZXNcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChjYWNoZWQudmFsdWVPZigpICE9PSBkYXRhLnZhbHVlT2YoKSB8fCBzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdG5vZGVzID0gY2FjaGVkLm5vZGVzO1xyXG5cdFx0XHRcdGlmICghZWRpdGFibGUgfHwgZWRpdGFibGUgIT09ICRkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XHJcblx0XHRcdFx0XHRpZiAoZGF0YS4kdHJ1c3RlZCkge1xyXG5cdFx0XHRcdFx0XHRjbGVhcihub2RlcywgY2FjaGVkKTtcclxuXHRcdFx0XHRcdFx0bm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdC8vY29ybmVyIGNhc2U6IHJlcGxhY2luZyB0aGUgbm9kZVZhbHVlIG9mIGEgdGV4dCBub2RlIHRoYXQgaXMgYSBjaGlsZCBvZiBhIHRleHRhcmVhL2NvbnRlbnRlZGl0YWJsZSBkb2Vzbid0IHdvcmtcclxuXHRcdFx0XHRcdFx0Ly93ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgdmFsdWUgcHJvcGVydHkgb2YgdGhlIHBhcmVudCB0ZXh0YXJlYSBvciB0aGUgaW5uZXJIVE1MIG9mIHRoZSBjb250ZW50ZWRpdGFibGUgZWxlbWVudCBpbnN0ZWFkXHJcblx0XHRcdFx0XHRcdGlmIChwYXJlbnRUYWcgPT09IFwidGV4dGFyZWFcIikgcGFyZW50RWxlbWVudC52YWx1ZSA9IGRhdGE7XHJcblx0XHRcdFx0XHRcdGVsc2UgaWYgKGVkaXRhYmxlKSBlZGl0YWJsZS5pbm5lckhUTUwgPSBkYXRhO1xyXG5cdFx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAobm9kZXNbMF0ubm9kZVR5cGUgPT09IDEgfHwgbm9kZXMubGVuZ3RoID4gMSkgeyAvL3dhcyBhIHRydXN0ZWQgc3RyaW5nXHJcblx0XHRcdFx0XHRcdFx0XHRjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZCk7XHJcblx0XHRcdFx0XHRcdFx0XHRub2RlcyA9IFskZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSldXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGVzWzBdLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpO1xyXG5cdFx0XHRcdFx0XHRcdG5vZGVzWzBdLm5vZGVWYWx1ZSA9IGRhdGFcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKTtcclxuXHRcdFx0XHRjYWNoZWQubm9kZXMgPSBub2Rlc1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgY2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWVcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gY2FjaGVkXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNvcnRDaGFuZ2VzKGEsIGIpIHtyZXR1cm4gYS5hY3Rpb24gLSBiLmFjdGlvbiB8fCBhLmluZGV4IC0gYi5pbmRleH1cclxuXHRmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKG5vZGUsIHRhZywgZGF0YUF0dHJzLCBjYWNoZWRBdHRycywgbmFtZXNwYWNlKSB7XHJcblx0XHRmb3IgKHZhciBhdHRyTmFtZSBpbiBkYXRhQXR0cnMpIHtcclxuXHRcdFx0dmFyIGRhdGFBdHRyID0gZGF0YUF0dHJzW2F0dHJOYW1lXTtcclxuXHRcdFx0dmFyIGNhY2hlZEF0dHIgPSBjYWNoZWRBdHRyc1thdHRyTmFtZV07XHJcblx0XHRcdGlmICghKGF0dHJOYW1lIGluIGNhY2hlZEF0dHJzKSB8fCAoY2FjaGVkQXR0ciAhPT0gZGF0YUF0dHIpKSB7XHJcblx0XHRcdFx0Y2FjaGVkQXR0cnNbYXR0ck5hbWVdID0gZGF0YUF0dHI7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vYGNvbmZpZ2AgaXNuJ3QgYSByZWFsIGF0dHJpYnV0ZXMsIHNvIGlnbm9yZSBpdFxyXG5cdFx0XHRcdFx0aWYgKGF0dHJOYW1lID09PSBcImNvbmZpZ1wiIHx8IGF0dHJOYW1lID09IFwia2V5XCIpIGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0Ly9ob29rIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBhdXRvLXJlZHJhd2luZyBzeXN0ZW1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkYXRhQXR0ciA9PT0gRlVOQ1RJT04gJiYgYXR0ck5hbWUuaW5kZXhPZihcIm9uXCIpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdG5vZGVbYXR0ck5hbWVdID0gYXV0b3JlZHJhdyhkYXRhQXR0ciwgbm9kZSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8vaGFuZGxlIGBzdHlsZTogey4uLn1gXHJcblx0XHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJzdHlsZVwiICYmIGRhdGFBdHRyICE9IG51bGwgJiYgdHlwZS5jYWxsKGRhdGFBdHRyKSA9PT0gT0JKRUNUKSB7XHJcblx0XHRcdFx0XHRcdGZvciAodmFyIHJ1bGUgaW4gZGF0YUF0dHIpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoY2FjaGVkQXR0ciA9PSBudWxsIHx8IGNhY2hlZEF0dHJbcnVsZV0gIT09IGRhdGFBdHRyW3J1bGVdKSBub2RlLnN0eWxlW3J1bGVdID0gZGF0YUF0dHJbcnVsZV1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBydWxlIGluIGNhY2hlZEF0dHIpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoIShydWxlIGluIGRhdGFBdHRyKSkgbm9kZS5zdHlsZVtydWxlXSA9IFwiXCJcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly9oYW5kbGUgU1ZHXHJcblx0XHRcdFx0XHRlbHNlIGlmIChuYW1lc3BhY2UgIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoYXR0ck5hbWUgPT09IFwiaHJlZlwiKSBub2RlLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcImhyZWZcIiwgZGF0YUF0dHIpO1xyXG5cdFx0XHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJjbGFzc05hbWVcIikgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBkYXRhQXR0cik7XHJcblx0XHRcdFx0XHRcdGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly9oYW5kbGUgY2FzZXMgdGhhdCBhcmUgcHJvcGVydGllcyAoYnV0IGlnbm9yZSBjYXNlcyB3aGVyZSB3ZSBzaG91bGQgdXNlIHNldEF0dHJpYnV0ZSBpbnN0ZWFkKVxyXG5cdFx0XHRcdFx0Ly8tIGxpc3QgYW5kIGZvcm0gYXJlIHR5cGljYWxseSB1c2VkIGFzIHN0cmluZ3MsIGJ1dCBhcmUgRE9NIGVsZW1lbnQgcmVmZXJlbmNlcyBpbiBqc1xyXG5cdFx0XHRcdFx0Ly8tIHdoZW4gdXNpbmcgQ1NTIHNlbGVjdG9ycyAoZS5nLiBgbShcIltzdHlsZT0nJ11cIilgKSwgc3R5bGUgaXMgdXNlZCBhcyBhIHN0cmluZywgYnV0IGl0J3MgYW4gb2JqZWN0IGluIGpzXHJcblx0XHRcdFx0XHRlbHNlIGlmIChhdHRyTmFtZSBpbiBub2RlICYmICEoYXR0ck5hbWUgPT09IFwibGlzdFwiIHx8IGF0dHJOYW1lID09PSBcInN0eWxlXCIgfHwgYXR0ck5hbWUgPT09IFwiZm9ybVwiIHx8IGF0dHJOYW1lID09PSBcInR5cGVcIiB8fCBhdHRyTmFtZSA9PT0gXCJ3aWR0aFwiIHx8IGF0dHJOYW1lID09PSBcImhlaWdodFwiKSkge1xyXG5cdFx0XHRcdFx0XHQvLyMzNDggZG9uJ3Qgc2V0IHRoZSB2YWx1ZSBpZiBub3QgbmVlZGVkIG90aGVyd2lzZSBjdXJzb3IgcGxhY2VtZW50IGJyZWFrcyBpbiBDaHJvbWVcclxuXHRcdFx0XHRcdFx0aWYgKHRhZyAhPT0gXCJpbnB1dFwiIHx8IG5vZGVbYXR0ck5hbWVdICE9PSBkYXRhQXR0cikgbm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0clxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHQvL3N3YWxsb3cgSUUncyBpbnZhbGlkIGFyZ3VtZW50IGVycm9ycyB0byBtaW1pYyBIVE1MJ3MgZmFsbGJhY2stdG8tZG9pbmctbm90aGluZy1vbi1pbnZhbGlkLWF0dHJpYnV0ZXMgYmVoYXZpb3JcclxuXHRcdFx0XHRcdGlmIChlLm1lc3NhZ2UuaW5kZXhPZihcIkludmFsaWQgYXJndW1lbnRcIikgPCAwKSB0aHJvdyBlXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8vIzM0OCBkYXRhQXR0ciBtYXkgbm90IGJlIGEgc3RyaW5nLCBzbyB1c2UgbG9vc2UgY29tcGFyaXNvbiAoZG91YmxlIGVxdWFsKSBpbnN0ZWFkIG9mIHN0cmljdCAodHJpcGxlIGVxdWFsKVxyXG5cdFx0XHRlbHNlIGlmIChhdHRyTmFtZSA9PT0gXCJ2YWx1ZVwiICYmIHRhZyA9PT0gXCJpbnB1dFwiICYmIG5vZGUudmFsdWUgIT0gZGF0YUF0dHIpIHtcclxuXHRcdFx0XHRub2RlLnZhbHVlID0gZGF0YUF0dHJcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNhY2hlZEF0dHJzXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGNsZWFyKG5vZGVzLCBjYWNoZWQpIHtcclxuXHRcdGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xyXG5cdFx0XHRpZiAobm9kZXNbaV0gJiYgbm9kZXNbaV0ucGFyZW50Tm9kZSkge1xyXG5cdFx0XHRcdHRyeSB7bm9kZXNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2Rlc1tpXSl9XHJcblx0XHRcdFx0Y2F0Y2ggKGUpIHt9IC8vaWdub3JlIGlmIHRoaXMgZmFpbHMgZHVlIHRvIG9yZGVyIG9mIGV2ZW50cyAoc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE5MjYwODMvZmFpbGVkLXRvLWV4ZWN1dGUtcmVtb3ZlY2hpbGQtb24tbm9kZSlcclxuXHRcdFx0XHRjYWNoZWQgPSBbXS5jb25jYXQoY2FjaGVkKTtcclxuXHRcdFx0XHRpZiAoY2FjaGVkW2ldKSB1bmxvYWQoY2FjaGVkW2ldKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAobm9kZXMubGVuZ3RoICE9IDApIG5vZGVzLmxlbmd0aCA9IDBcclxuXHR9XHJcblx0ZnVuY3Rpb24gdW5sb2FkKGNhY2hlZCkge1xyXG5cdFx0aWYgKGNhY2hlZC5jb25maWdDb250ZXh0ICYmIHR5cGVvZiBjYWNoZWQuY29uZmlnQ29udGV4dC5vbnVubG9hZCA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0Y2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKTtcclxuXHRcdFx0Y2FjaGVkLmNvbmZpZ0NvbnRleHQub251bmxvYWQgPSBudWxsXHJcblx0XHR9XHJcblx0XHRpZiAoY2FjaGVkLmNvbnRyb2xsZXJzKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBjb250cm9sbGVyOyBjb250cm9sbGVyID0gY2FjaGVkLmNvbnRyb2xsZXJzW2ldOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGNvbnRyb2xsZXIub251bmxvYWQgPT09IEZVTkNUSU9OKSBjb250cm9sbGVyLm9udW5sb2FkKHtwcmV2ZW50RGVmYXVsdDogbm9vcH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAoY2FjaGVkLmNoaWxkcmVuKSB7XHJcblx0XHRcdGlmICh0eXBlLmNhbGwoY2FjaGVkLmNoaWxkcmVuKSA9PT0gQVJSQVkpIHtcclxuXHRcdFx0XHRmb3IgKHZhciBpID0gMCwgY2hpbGQ7IGNoaWxkID0gY2FjaGVkLmNoaWxkcmVuW2ldOyBpKyspIHVubG9hZChjaGlsZClcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIGlmIChjYWNoZWQuY2hpbGRyZW4udGFnKSB1bmxvYWQoY2FjaGVkLmNoaWxkcmVuKVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKSB7XHJcblx0XHR2YXIgbmV4dFNpYmxpbmcgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdO1xyXG5cdFx0aWYgKG5leHRTaWJsaW5nKSB7XHJcblx0XHRcdHZhciBpc0VsZW1lbnQgPSBuZXh0U2libGluZy5ub2RlVHlwZSAhPSAxO1xyXG5cdFx0XHR2YXIgcGxhY2Vob2xkZXIgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcblx0XHRcdGlmIChpc0VsZW1lbnQpIHtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgbmV4dFNpYmxpbmcgfHwgbnVsbCk7XHJcblx0XHRcdFx0cGxhY2Vob2xkZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgZGF0YSk7XHJcblx0XHRcdFx0cGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwbGFjZWhvbGRlcilcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIG5leHRTaWJsaW5nLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGRhdGEpXHJcblx0XHR9XHJcblx0XHRlbHNlIHBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIGRhdGEpO1xyXG5cdFx0dmFyIG5vZGVzID0gW107XHJcblx0XHR3aGlsZSAocGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSAhPT0gbmV4dFNpYmxpbmcpIHtcclxuXHRcdFx0bm9kZXMucHVzaChwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdKTtcclxuXHRcdFx0aW5kZXgrK1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG5vZGVzXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGF1dG9yZWRyYXcoY2FsbGJhY2ssIG9iamVjdCkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0ZSA9IGUgfHwgZXZlbnQ7XHJcblx0XHRcdG0ucmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKTtcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHRyeSB7cmV0dXJuIGNhbGxiYWNrLmNhbGwob2JqZWN0LCBlKX1cclxuXHRcdFx0ZmluYWxseSB7XHJcblx0XHRcdFx0ZW5kRmlyc3RDb21wdXRhdGlvbigpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHZhciBodG1sO1xyXG5cdHZhciBkb2N1bWVudE5vZGUgPSB7XHJcblx0XHRhcHBlbmRDaGlsZDogZnVuY3Rpb24obm9kZSkge1xyXG5cdFx0XHRpZiAoaHRtbCA9PT0gdW5kZWZpbmVkKSBodG1sID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJodG1sXCIpO1xyXG5cdFx0XHRpZiAoJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICE9PSBub2RlKSB7XHJcblx0XHRcdFx0JGRvY3VtZW50LnJlcGxhY2VDaGlsZChub2RlLCAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgJGRvY3VtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xyXG5cdFx0XHR0aGlzLmNoaWxkTm9kZXMgPSAkZG9jdW1lbnQuY2hpbGROb2Rlc1xyXG5cdFx0fSxcclxuXHRcdGluc2VydEJlZm9yZTogZnVuY3Rpb24obm9kZSkge1xyXG5cdFx0XHR0aGlzLmFwcGVuZENoaWxkKG5vZGUpXHJcblx0XHR9LFxyXG5cdFx0Y2hpbGROb2RlczogW11cclxuXHR9O1xyXG5cdHZhciBub2RlQ2FjaGUgPSBbXSwgY2VsbENhY2hlID0ge307XHJcblx0bS5yZW5kZXIgPSBmdW5jdGlvbihyb290LCBjZWxsLCBmb3JjZVJlY3JlYXRpb24pIHtcclxuXHRcdHZhciBjb25maWdzID0gW107XHJcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgYmVpbmcgcGFzc2VkIHRvIG0ucm91dGUvbS5tb3VudC9tLnJlbmRlciBpcyBub3QgdW5kZWZpbmVkLlwiKTtcclxuXHRcdHZhciBpZCA9IGdldENlbGxDYWNoZUtleShyb290KTtcclxuXHRcdHZhciBpc0RvY3VtZW50Um9vdCA9IHJvb3QgPT09ICRkb2N1bWVudDtcclxuXHRcdHZhciBub2RlID0gaXNEb2N1bWVudFJvb3QgfHwgcm9vdCA9PT0gJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/IGRvY3VtZW50Tm9kZSA6IHJvb3Q7XHJcblx0XHRpZiAoaXNEb2N1bWVudFJvb3QgJiYgY2VsbC50YWcgIT0gXCJodG1sXCIpIGNlbGwgPSB7dGFnOiBcImh0bWxcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogY2VsbH07XHJcblx0XHRpZiAoY2VsbENhY2hlW2lkXSA9PT0gdW5kZWZpbmVkKSBjbGVhcihub2RlLmNoaWxkTm9kZXMpO1xyXG5cdFx0aWYgKGZvcmNlUmVjcmVhdGlvbiA9PT0gdHJ1ZSkgcmVzZXQocm9vdCk7XHJcblx0XHRjZWxsQ2FjaGVbaWRdID0gYnVpbGQobm9kZSwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNlbGwsIGNlbGxDYWNoZVtpZF0sIGZhbHNlLCAwLCBudWxsLCB1bmRlZmluZWQsIGNvbmZpZ3MpO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvbmZpZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIGNvbmZpZ3NbaV0oKVxyXG5cdH07XHJcblx0ZnVuY3Rpb24gZ2V0Q2VsbENhY2hlS2V5KGVsZW1lbnQpIHtcclxuXHRcdHZhciBpbmRleCA9IG5vZGVDYWNoZS5pbmRleE9mKGVsZW1lbnQpO1xyXG5cdFx0cmV0dXJuIGluZGV4IDwgMCA/IG5vZGVDYWNoZS5wdXNoKGVsZW1lbnQpIC0gMSA6IGluZGV4XHJcblx0fVxyXG5cclxuXHRtLnRydXN0ID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdHZhbHVlID0gbmV3IFN0cmluZyh2YWx1ZSk7XHJcblx0XHR2YWx1ZS4kdHJ1c3RlZCA9IHRydWU7XHJcblx0XHRyZXR1cm4gdmFsdWVcclxuXHR9O1xyXG5cclxuXHRmdW5jdGlvbiBnZXR0ZXJzZXR0ZXIoc3RvcmUpIHtcclxuXHRcdHZhciBwcm9wID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSBzdG9yZSA9IGFyZ3VtZW50c1swXTtcclxuXHRcdFx0cmV0dXJuIHN0b3JlXHJcblx0XHR9O1xyXG5cclxuXHRcdHByb3AudG9KU09OID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzdG9yZVxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gcHJvcFxyXG5cdH1cclxuXHJcblx0bS5wcm9wID0gZnVuY3Rpb24gKHN0b3JlKSB7XHJcblx0XHQvL25vdGU6IHVzaW5nIG5vbi1zdHJpY3QgZXF1YWxpdHkgY2hlY2sgaGVyZSBiZWNhdXNlIHdlJ3JlIGNoZWNraW5nIGlmIHN0b3JlIGlzIG51bGwgT1IgdW5kZWZpbmVkXHJcblx0XHRpZiAoKChzdG9yZSAhPSBudWxsICYmIHR5cGUuY2FsbChzdG9yZSkgPT09IE9CSkVDVCkgfHwgdHlwZW9mIHN0b3JlID09PSBGVU5DVElPTikgJiYgdHlwZW9mIHN0b3JlLnRoZW4gPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdHJldHVybiBwcm9waWZ5KHN0b3JlKVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBnZXR0ZXJzZXR0ZXIoc3RvcmUpXHJcblx0fTtcclxuXHJcblx0dmFyIHJvb3RzID0gW10sIGNvbXBvbmVudHMgPSBbXSwgY29udHJvbGxlcnMgPSBbXSwgbGFzdFJlZHJhd0lkID0gbnVsbCwgbGFzdFJlZHJhd0NhbGxUaW1lID0gMCwgY29tcHV0ZVByZVJlZHJhd0hvb2sgPSBudWxsLCBjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsLCBwcmV2ZW50ZWQgPSBmYWxzZSwgdG9wQ29tcG9uZW50LCB1bmxvYWRlcnMgPSBbXTtcclxuXHR2YXIgRlJBTUVfQlVER0VUID0gMTY7IC8vNjAgZnJhbWVzIHBlciBzZWNvbmQgPSAxIGNhbGwgcGVyIDE2IG1zXHJcblx0ZnVuY3Rpb24gcGFyYW1ldGVyaXplKGNvbXBvbmVudCwgYXJncykge1xyXG5cdFx0dmFyIGNvbnRyb2xsZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIChjb21wb25lbnQuY29udHJvbGxlciB8fCBub29wKS5hcHBseSh0aGlzLCBhcmdzKSB8fCB0aGlzXHJcblx0XHR9XHJcblx0XHR2YXIgdmlldyA9IGZ1bmN0aW9uKGN0cmwpIHtcclxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcmdzID0gYXJncy5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxyXG5cdFx0XHRyZXR1cm4gY29tcG9uZW50LnZpZXcuYXBwbHkoY29tcG9uZW50LCBhcmdzID8gW2N0cmxdLmNvbmNhdChhcmdzKSA6IFtjdHJsXSlcclxuXHRcdH1cclxuXHRcdHZpZXcuJG9yaWdpbmFsID0gY29tcG9uZW50LnZpZXdcclxuXHRcdHZhciBvdXRwdXQgPSB7Y29udHJvbGxlcjogY29udHJvbGxlciwgdmlldzogdmlld31cclxuXHRcdGlmIChhcmdzWzBdICYmIGFyZ3NbMF0ua2V5ICE9IG51bGwpIG91dHB1dC5hdHRycyA9IHtrZXk6IGFyZ3NbMF0ua2V5fVxyXG5cdFx0cmV0dXJuIG91dHB1dFxyXG5cdH1cclxuXHRtLmNvbXBvbmVudCA9IGZ1bmN0aW9uKGNvbXBvbmVudCkge1xyXG5cdFx0cmV0dXJuIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSlcclxuXHR9XHJcblx0bS5tb3VudCA9IG0ubW9kdWxlID0gZnVuY3Rpb24ocm9vdCwgY29tcG9uZW50KSB7XHJcblx0XHRpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBlbnN1cmUgdGhlIERPTSBlbGVtZW50IGV4aXN0cyBiZWZvcmUgcmVuZGVyaW5nIGEgdGVtcGxhdGUgaW50byBpdC5cIik7XHJcblx0XHR2YXIgaW5kZXggPSByb290cy5pbmRleE9mKHJvb3QpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgaW5kZXggPSByb290cy5sZW5ndGg7XHJcblx0XHRcclxuXHRcdHZhciBpc1ByZXZlbnRlZCA9IGZhbHNlO1xyXG5cdFx0dmFyIGV2ZW50ID0ge3ByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0aXNQcmV2ZW50ZWQgPSB0cnVlO1xyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IGNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGw7XHJcblx0XHR9fTtcclxuXHRcdGZvciAodmFyIGkgPSAwLCB1bmxvYWRlcjsgdW5sb2FkZXIgPSB1bmxvYWRlcnNbaV07IGkrKykge1xyXG5cdFx0XHR1bmxvYWRlci5oYW5kbGVyLmNhbGwodW5sb2FkZXIuY29udHJvbGxlciwgZXZlbnQpXHJcblx0XHRcdHVubG9hZGVyLmNvbnRyb2xsZXIub251bmxvYWQgPSBudWxsXHJcblx0XHR9XHJcblx0XHRpZiAoaXNQcmV2ZW50ZWQpIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIHVubG9hZGVyOyB1bmxvYWRlciA9IHVubG9hZGVyc1tpXTsgaSsrKSB1bmxvYWRlci5jb250cm9sbGVyLm9udW5sb2FkID0gdW5sb2FkZXIuaGFuZGxlclxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB1bmxvYWRlcnMgPSBbXVxyXG5cdFx0XHJcblx0XHRpZiAoY29udHJvbGxlcnNbaW5kZXhdICYmIHR5cGVvZiBjb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQgPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZChldmVudClcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYgKCFpc1ByZXZlbnRlZCkge1xyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImFsbFwiKTtcclxuXHRcdFx0bS5zdGFydENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHJvb3RzW2luZGV4XSA9IHJvb3Q7XHJcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikgY29tcG9uZW50ID0gc3ViY29tcG9uZW50KGNvbXBvbmVudCwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKVxyXG5cdFx0XHR2YXIgY3VycmVudENvbXBvbmVudCA9IHRvcENvbXBvbmVudCA9IGNvbXBvbmVudCA9IGNvbXBvbmVudCB8fCB7Y29udHJvbGxlcjogZnVuY3Rpb24oKSB7fX07XHJcblx0XHRcdHZhciBjb25zdHJ1Y3RvciA9IGNvbXBvbmVudC5jb250cm9sbGVyIHx8IG5vb3BcclxuXHRcdFx0dmFyIGNvbnRyb2xsZXIgPSBuZXcgY29uc3RydWN0b3I7XHJcblx0XHRcdC8vY29udHJvbGxlcnMgbWF5IGNhbGwgbS5tb3VudCByZWN1cnNpdmVseSAodmlhIG0ucm91dGUgcmVkaXJlY3RzLCBmb3IgZXhhbXBsZSlcclxuXHRcdFx0Ly90aGlzIGNvbmRpdGlvbmFsIGVuc3VyZXMgb25seSB0aGUgbGFzdCByZWN1cnNpdmUgbS5tb3VudCBjYWxsIGlzIGFwcGxpZWRcclxuXHRcdFx0aWYgKGN1cnJlbnRDb21wb25lbnQgPT09IHRvcENvbXBvbmVudCkge1xyXG5cdFx0XHRcdGNvbnRyb2xsZXJzW2luZGV4XSA9IGNvbnRyb2xsZXI7XHJcblx0XHRcdFx0Y29tcG9uZW50c1tpbmRleF0gPSBjb21wb25lbnRcclxuXHRcdFx0fVxyXG5cdFx0XHRlbmRGaXJzdENvbXB1dGF0aW9uKCk7XHJcblx0XHRcdHJldHVybiBjb250cm9sbGVyc1tpbmRleF1cclxuXHRcdH1cclxuXHR9O1xyXG5cdHZhciByZWRyYXdpbmcgPSBmYWxzZVxyXG5cdG0ucmVkcmF3ID0gZnVuY3Rpb24oZm9yY2UpIHtcclxuXHRcdGlmIChyZWRyYXdpbmcpIHJldHVyblxyXG5cdFx0cmVkcmF3aW5nID0gdHJ1ZVxyXG5cdFx0Ly9sYXN0UmVkcmF3SWQgaXMgYSBwb3NpdGl2ZSBudW1iZXIgaWYgYSBzZWNvbmQgcmVkcmF3IGlzIHJlcXVlc3RlZCBiZWZvcmUgdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lXHJcblx0XHQvL2xhc3RSZWRyYXdJRCBpcyBudWxsIGlmIGl0J3MgdGhlIGZpcnN0IHJlZHJhdyBhbmQgbm90IGFuIGV2ZW50IGhhbmRsZXJcclxuXHRcdGlmIChsYXN0UmVkcmF3SWQgJiYgZm9yY2UgIT09IHRydWUpIHtcclxuXHRcdFx0Ly93aGVuIHNldFRpbWVvdXQ6IG9ubHkgcmVzY2hlZHVsZSByZWRyYXcgaWYgdGltZSBiZXR3ZWVuIG5vdyBhbmQgcHJldmlvdXMgcmVkcmF3IGlzIGJpZ2dlciB0aGFuIGEgZnJhbWUsIG90aGVyd2lzZSBrZWVwIGN1cnJlbnRseSBzY2hlZHVsZWQgdGltZW91dFxyXG5cdFx0XHQvL3doZW4gckFGOiBhbHdheXMgcmVzY2hlZHVsZSByZWRyYXdcclxuXHRcdFx0aWYgKCRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgbmV3IERhdGUgLSBsYXN0UmVkcmF3Q2FsbFRpbWUgPiBGUkFNRV9CVURHRVQpIHtcclxuXHRcdFx0XHRpZiAobGFzdFJlZHJhd0lkID4gMCkgJGNhbmNlbEFuaW1hdGlvbkZyYW1lKGxhc3RSZWRyYXdJZCk7XHJcblx0XHRcdFx0bGFzdFJlZHJhd0lkID0gJHJlcXVlc3RBbmltYXRpb25GcmFtZShyZWRyYXcsIEZSQU1FX0JVREdFVClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJlZHJhdygpO1xyXG5cdFx0XHRsYXN0UmVkcmF3SWQgPSAkcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge2xhc3RSZWRyYXdJZCA9IG51bGx9LCBGUkFNRV9CVURHRVQpXHJcblx0XHR9XHJcblx0XHRyZWRyYXdpbmcgPSBmYWxzZVxyXG5cdH07XHJcblx0bS5yZWRyYXcuc3RyYXRlZ3kgPSBtLnByb3AoKTtcclxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XHJcblx0XHRpZiAoY29tcHV0ZVByZVJlZHJhd0hvb2spIHtcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2soKVxyXG5cdFx0XHRjb21wdXRlUHJlUmVkcmF3SG9vayA9IG51bGxcclxuXHRcdH1cclxuXHRcdGZvciAodmFyIGkgPSAwLCByb290OyByb290ID0gcm9vdHNbaV07IGkrKykge1xyXG5cdFx0XHRpZiAoY29udHJvbGxlcnNbaV0pIHtcclxuXHRcdFx0XHR2YXIgYXJncyA9IGNvbXBvbmVudHNbaV0uY29udHJvbGxlciAmJiBjb21wb25lbnRzW2ldLmNvbnRyb2xsZXIuJCRhcmdzID8gW2NvbnRyb2xsZXJzW2ldXS5jb25jYXQoY29tcG9uZW50c1tpXS5jb250cm9sbGVyLiQkYXJncykgOiBbY29udHJvbGxlcnNbaV1dXHJcblx0XHRcdFx0bS5yZW5kZXIocm9vdCwgY29tcG9uZW50c1tpXS52aWV3ID8gY29tcG9uZW50c1tpXS52aWV3KGNvbnRyb2xsZXJzW2ldLCBhcmdzKSA6IFwiXCIpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vYWZ0ZXIgcmVuZGVyaW5nIHdpdGhpbiBhIHJvdXRlZCBjb250ZXh0LCB3ZSBuZWVkIHRvIHNjcm9sbCBiYWNrIHRvIHRoZSB0b3AsIGFuZCBmZXRjaCB0aGUgZG9jdW1lbnQgdGl0bGUgZm9yIGhpc3RvcnkucHVzaFN0YXRlXHJcblx0XHRpZiAoY29tcHV0ZVBvc3RSZWRyYXdIb29rKSB7XHJcblx0XHRcdGNvbXB1dGVQb3N0UmVkcmF3SG9vaygpO1xyXG5cdFx0XHRjb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsXHJcblx0XHR9XHJcblx0XHRsYXN0UmVkcmF3SWQgPSBudWxsO1xyXG5cdFx0bGFzdFJlZHJhd0NhbGxUaW1lID0gbmV3IERhdGU7XHJcblx0XHRtLnJlZHJhdy5zdHJhdGVneShcImRpZmZcIilcclxuXHR9XHJcblxyXG5cdHZhciBwZW5kaW5nUmVxdWVzdHMgPSAwO1xyXG5cdG0uc3RhcnRDb21wdXRhdGlvbiA9IGZ1bmN0aW9uKCkge3BlbmRpbmdSZXF1ZXN0cysrfTtcclxuXHRtLmVuZENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRwZW5kaW5nUmVxdWVzdHMgPSBNYXRoLm1heChwZW5kaW5nUmVxdWVzdHMgLSAxLCAwKTtcclxuXHRcdGlmIChwZW5kaW5nUmVxdWVzdHMgPT09IDApIG0ucmVkcmF3KClcclxuXHR9O1xyXG5cdHZhciBlbmRGaXJzdENvbXB1dGF0aW9uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZiAobS5yZWRyYXcuc3RyYXRlZ3koKSA9PSBcIm5vbmVcIikge1xyXG5cdFx0XHRwZW5kaW5nUmVxdWVzdHMtLVxyXG5cdFx0XHRtLnJlZHJhdy5zdHJhdGVneShcImRpZmZcIilcclxuXHRcdH1cclxuXHRcdGVsc2UgbS5lbmRDb21wdXRhdGlvbigpO1xyXG5cdH1cclxuXHJcblx0bS53aXRoQXR0ciA9IGZ1bmN0aW9uKHByb3AsIHdpdGhBdHRyQ2FsbGJhY2spIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHR2YXIgY3VycmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCB0aGlzO1xyXG5cdFx0XHR3aXRoQXR0ckNhbGxiYWNrKHByb3AgaW4gY3VycmVudFRhcmdldCA/IGN1cnJlbnRUYXJnZXRbcHJvcF0gOiBjdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZShwcm9wKSlcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvL3JvdXRpbmdcclxuXHR2YXIgbW9kZXMgPSB7cGF0aG5hbWU6IFwiXCIsIGhhc2g6IFwiI1wiLCBzZWFyY2g6IFwiP1wifTtcclxuXHR2YXIgcmVkaXJlY3QgPSBub29wLCByb3V0ZVBhcmFtcywgY3VycmVudFJvdXRlLCBpc0RlZmF1bHRSb3V0ZSA9IGZhbHNlO1xyXG5cdG0ucm91dGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vbS5yb3V0ZSgpXHJcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRSb3V0ZTtcclxuXHRcdC8vbS5yb3V0ZShlbCwgZGVmYXVsdFJvdXRlLCByb3V0ZXMpXHJcblx0XHRlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIHR5cGUuY2FsbChhcmd1bWVudHNbMV0pID09PSBTVFJJTkcpIHtcclxuXHRcdFx0dmFyIHJvb3QgPSBhcmd1bWVudHNbMF0sIGRlZmF1bHRSb3V0ZSA9IGFyZ3VtZW50c1sxXSwgcm91dGVyID0gYXJndW1lbnRzWzJdO1xyXG5cdFx0XHRyZWRpcmVjdCA9IGZ1bmN0aW9uKHNvdXJjZSkge1xyXG5cdFx0XHRcdHZhciBwYXRoID0gY3VycmVudFJvdXRlID0gbm9ybWFsaXplUm91dGUoc291cmNlKTtcclxuXHRcdFx0XHRpZiAoIXJvdXRlQnlWYWx1ZShyb290LCByb3V0ZXIsIHBhdGgpKSB7XHJcblx0XHRcdFx0XHRpZiAoaXNEZWZhdWx0Um91dGUpIHRocm93IG5ldyBFcnJvcihcIkVuc3VyZSB0aGUgZGVmYXVsdCByb3V0ZSBtYXRjaGVzIG9uZSBvZiB0aGUgcm91dGVzIGRlZmluZWQgaW4gbS5yb3V0ZVwiKVxyXG5cdFx0XHRcdFx0aXNEZWZhdWx0Um91dGUgPSB0cnVlXHJcblx0XHRcdFx0XHRtLnJvdXRlKGRlZmF1bHRSb3V0ZSwgdHJ1ZSlcclxuXHRcdFx0XHRcdGlzRGVmYXVsdFJvdXRlID0gZmFsc2VcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHRcdHZhciBsaXN0ZW5lciA9IG0ucm91dGUubW9kZSA9PT0gXCJoYXNoXCIgPyBcIm9uaGFzaGNoYW5nZVwiIDogXCJvbnBvcHN0YXRlXCI7XHJcblx0XHRcdHdpbmRvd1tsaXN0ZW5lcl0gPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR2YXIgcGF0aCA9ICRsb2NhdGlvblttLnJvdXRlLm1vZGVdXHJcblx0XHRcdFx0aWYgKG0ucm91dGUubW9kZSA9PT0gXCJwYXRobmFtZVwiKSBwYXRoICs9ICRsb2NhdGlvbi5zZWFyY2hcclxuXHRcdFx0XHRpZiAoY3VycmVudFJvdXRlICE9IG5vcm1hbGl6ZVJvdXRlKHBhdGgpKSB7XHJcblx0XHRcdFx0XHRyZWRpcmVjdChwYXRoKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0Y29tcHV0ZVByZVJlZHJhd0hvb2sgPSBzZXRTY3JvbGw7XHJcblx0XHRcdHdpbmRvd1tsaXN0ZW5lcl0oKVxyXG5cdFx0fVxyXG5cdFx0Ly9jb25maWc6IG0ucm91dGVcclxuXHRcdGVsc2UgaWYgKGFyZ3VtZW50c1swXS5hZGRFdmVudExpc3RlbmVyIHx8IGFyZ3VtZW50c1swXS5hdHRhY2hFdmVudCkge1xyXG5cdFx0XHR2YXIgZWxlbWVudCA9IGFyZ3VtZW50c1swXTtcclxuXHRcdFx0dmFyIGlzSW5pdGlhbGl6ZWQgPSBhcmd1bWVudHNbMV07XHJcblx0XHRcdHZhciBjb250ZXh0ID0gYXJndW1lbnRzWzJdO1xyXG5cdFx0XHR2YXIgdmRvbSA9IGFyZ3VtZW50c1szXTtcclxuXHRcdFx0ZWxlbWVudC5ocmVmID0gKG0ucm91dGUubW9kZSAhPT0gJ3BhdGhuYW1lJyA/ICRsb2NhdGlvbi5wYXRobmFtZSA6ICcnKSArIG1vZGVzW20ucm91dGUubW9kZV0gKyB2ZG9tLmF0dHJzLmhyZWY7XHJcblx0XHRcdGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHRcdFx0XHRlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKTtcclxuXHRcdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCByb3V0ZVVub2J0cnVzaXZlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGVsZW1lbnQuZGV0YWNoRXZlbnQoXCJvbmNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpO1xyXG5cdFx0XHRcdGVsZW1lbnQuYXR0YWNoRXZlbnQoXCJvbmNsaWNrXCIsIHJvdXRlVW5vYnRydXNpdmUpXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vbS5yb3V0ZShyb3V0ZSwgcGFyYW1zLCBzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5KVxyXG5cdFx0ZWxzZSBpZiAodHlwZS5jYWxsKGFyZ3VtZW50c1swXSkgPT09IFNUUklORykge1xyXG5cdFx0XHR2YXIgb2xkUm91dGUgPSBjdXJyZW50Um91dGU7XHJcblx0XHRcdGN1cnJlbnRSb3V0ZSA9IGFyZ3VtZW50c1swXTtcclxuXHRcdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHNbMV0gfHwge31cclxuXHRcdFx0dmFyIHF1ZXJ5SW5kZXggPSBjdXJyZW50Um91dGUuaW5kZXhPZihcIj9cIilcclxuXHRcdFx0dmFyIHBhcmFtcyA9IHF1ZXJ5SW5kZXggPiAtMSA/IHBhcnNlUXVlcnlTdHJpbmcoY3VycmVudFJvdXRlLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKSkgOiB7fVxyXG5cdFx0XHRmb3IgKHZhciBpIGluIGFyZ3MpIHBhcmFtc1tpXSA9IGFyZ3NbaV1cclxuXHRcdFx0dmFyIHF1ZXJ5c3RyaW5nID0gYnVpbGRRdWVyeVN0cmluZyhwYXJhbXMpXHJcblx0XHRcdHZhciBjdXJyZW50UGF0aCA9IHF1ZXJ5SW5kZXggPiAtMSA/IGN1cnJlbnRSb3V0ZS5zbGljZSgwLCBxdWVyeUluZGV4KSA6IGN1cnJlbnRSb3V0ZVxyXG5cdFx0XHRpZiAocXVlcnlzdHJpbmcpIGN1cnJlbnRSb3V0ZSA9IGN1cnJlbnRQYXRoICsgKGN1cnJlbnRQYXRoLmluZGV4T2YoXCI/XCIpID09PSAtMSA/IFwiP1wiIDogXCImXCIpICsgcXVlcnlzdHJpbmc7XHJcblxyXG5cdFx0XHR2YXIgc2hvdWxkUmVwbGFjZUhpc3RvcnlFbnRyeSA9IChhcmd1bWVudHMubGVuZ3RoID09PSAzID8gYXJndW1lbnRzWzJdIDogYXJndW1lbnRzWzFdKSA9PT0gdHJ1ZSB8fCBvbGRSb3V0ZSA9PT0gYXJndW1lbnRzWzBdO1xyXG5cclxuXHRcdFx0aWYgKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSkge1xyXG5cdFx0XHRcdGNvbXB1dGVQcmVSZWRyYXdIb29rID0gc2V0U2Nyb2xsXHJcblx0XHRcdFx0Y29tcHV0ZVBvc3RSZWRyYXdIb29rID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR3aW5kb3cuaGlzdG9yeVtzaG91bGRSZXBsYWNlSGlzdG9yeUVudHJ5ID8gXCJyZXBsYWNlU3RhdGVcIiA6IFwicHVzaFN0YXRlXCJdKG51bGwsICRkb2N1bWVudC50aXRsZSwgbW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0XHRyZWRpcmVjdChtb2Rlc1ttLnJvdXRlLm1vZGVdICsgY3VycmVudFJvdXRlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdCRsb2NhdGlvblttLnJvdXRlLm1vZGVdID0gY3VycmVudFJvdXRlXHJcblx0XHRcdFx0cmVkaXJlY3QobW9kZXNbbS5yb3V0ZS5tb2RlXSArIGN1cnJlbnRSb3V0ZSlcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcblx0bS5yb3V0ZS5wYXJhbSA9IGZ1bmN0aW9uKGtleSkge1xyXG5cdFx0aWYgKCFyb3V0ZVBhcmFtcykgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgY2FsbCBtLnJvdXRlKGVsZW1lbnQsIGRlZmF1bHRSb3V0ZSwgcm91dGVzKSBiZWZvcmUgY2FsbGluZyBtLnJvdXRlLnBhcmFtKClcIilcclxuXHRcdHJldHVybiByb3V0ZVBhcmFtc1trZXldXHJcblx0fTtcclxuXHRtLnJvdXRlLm1vZGUgPSBcInNlYXJjaFwiO1xyXG5cdGZ1bmN0aW9uIG5vcm1hbGl6ZVJvdXRlKHJvdXRlKSB7XHJcblx0XHRyZXR1cm4gcm91dGUuc2xpY2UobW9kZXNbbS5yb3V0ZS5tb2RlXS5sZW5ndGgpXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHJvdXRlQnlWYWx1ZShyb290LCByb3V0ZXIsIHBhdGgpIHtcclxuXHRcdHJvdXRlUGFyYW1zID0ge307XHJcblxyXG5cdFx0dmFyIHF1ZXJ5U3RhcnQgPSBwYXRoLmluZGV4T2YoXCI/XCIpO1xyXG5cdFx0aWYgKHF1ZXJ5U3RhcnQgIT09IC0xKSB7XHJcblx0XHRcdHJvdXRlUGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhwYXRoLnN1YnN0cihxdWVyeVN0YXJ0ICsgMSwgcGF0aC5sZW5ndGgpKTtcclxuXHRcdFx0cGF0aCA9IHBhdGguc3Vic3RyKDAsIHF1ZXJ5U3RhcnQpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gR2V0IGFsbCByb3V0ZXMgYW5kIGNoZWNrIGlmIHRoZXJlJ3NcclxuXHRcdC8vIGFuIGV4YWN0IG1hdGNoIGZvciB0aGUgY3VycmVudCBwYXRoXHJcblx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJvdXRlcik7XHJcblx0XHR2YXIgaW5kZXggPSBrZXlzLmluZGV4T2YocGF0aCk7XHJcblx0XHRpZihpbmRleCAhPT0gLTEpe1xyXG5cdFx0XHRtLm1vdW50KHJvb3QsIHJvdXRlcltrZXlzIFtpbmRleF1dKTtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yICh2YXIgcm91dGUgaW4gcm91dGVyKSB7XHJcblx0XHRcdGlmIChyb3V0ZSA9PT0gcGF0aCkge1xyXG5cdFx0XHRcdG0ubW91bnQocm9vdCwgcm91dGVyW3JvdXRlXSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFwiXlwiICsgcm91dGUucmVwbGFjZSgvOlteXFwvXSs/XFwuezN9L2csIFwiKC4qPylcIikucmVwbGFjZSgvOlteXFwvXSsvZywgXCIoW15cXFxcL10rKVwiKSArIFwiXFwvPyRcIik7XHJcblxyXG5cdFx0XHRpZiAobWF0Y2hlci50ZXN0KHBhdGgpKSB7XHJcblx0XHRcdFx0cGF0aC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0dmFyIGtleXMgPSByb3V0ZS5tYXRjaCgvOlteXFwvXSsvZykgfHwgW107XHJcblx0XHRcdFx0XHR2YXIgdmFsdWVzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEsIC0yKTtcclxuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBrZXlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSByb3V0ZVBhcmFtc1trZXlzW2ldLnJlcGxhY2UoLzp8XFwuL2csIFwiXCIpXSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZXNbaV0pXHJcblx0XHRcdFx0XHRtLm1vdW50KHJvb3QsIHJvdXRlcltyb3V0ZV0pXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0cmV0dXJuIHRydWVcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRmdW5jdGlvbiByb3V0ZVVub2J0cnVzaXZlKGUpIHtcclxuXHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0aWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS53aGljaCA9PT0gMikgcmV0dXJuO1xyXG5cdFx0aWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGVsc2UgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0dmFyIGN1cnJlbnRUYXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQgfHwgZS5zcmNFbGVtZW50O1xyXG5cdFx0dmFyIGFyZ3MgPSBtLnJvdXRlLm1vZGUgPT09IFwicGF0aG5hbWVcIiAmJiBjdXJyZW50VGFyZ2V0LnNlYXJjaCA/IHBhcnNlUXVlcnlTdHJpbmcoY3VycmVudFRhcmdldC5zZWFyY2guc2xpY2UoMSkpIDoge307XHJcblx0XHR3aGlsZSAoY3VycmVudFRhcmdldCAmJiBjdXJyZW50VGFyZ2V0Lm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT0gXCJBXCIpIGN1cnJlbnRUYXJnZXQgPSBjdXJyZW50VGFyZ2V0LnBhcmVudE5vZGVcclxuXHRcdG0ucm91dGUoY3VycmVudFRhcmdldFttLnJvdXRlLm1vZGVdLnNsaWNlKG1vZGVzW20ucm91dGUubW9kZV0ubGVuZ3RoKSwgYXJncylcclxuXHR9XHJcblx0ZnVuY3Rpb24gc2V0U2Nyb2xsKCkge1xyXG5cdFx0aWYgKG0ucm91dGUubW9kZSAhPSBcImhhc2hcIiAmJiAkbG9jYXRpb24uaGFzaCkgJGxvY2F0aW9uLmhhc2ggPSAkbG9jYXRpb24uaGFzaDtcclxuXHRcdGVsc2Ugd2luZG93LnNjcm9sbFRvKDAsIDApXHJcblx0fVxyXG5cdGZ1bmN0aW9uIGJ1aWxkUXVlcnlTdHJpbmcob2JqZWN0LCBwcmVmaXgpIHtcclxuXHRcdHZhciBkdXBsaWNhdGVzID0ge31cclxuXHRcdHZhciBzdHIgPSBbXVxyXG5cdFx0Zm9yICh2YXIgcHJvcCBpbiBvYmplY3QpIHtcclxuXHRcdFx0dmFyIGtleSA9IHByZWZpeCA/IHByZWZpeCArIFwiW1wiICsgcHJvcCArIFwiXVwiIDogcHJvcFxyXG5cdFx0XHR2YXIgdmFsdWUgPSBvYmplY3RbcHJvcF1cclxuXHRcdFx0dmFyIHZhbHVlVHlwZSA9IHR5cGUuY2FsbCh2YWx1ZSlcclxuXHRcdFx0dmFyIHBhaXIgPSAodmFsdWUgPT09IG51bGwpID8gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgOlxyXG5cdFx0XHRcdHZhbHVlVHlwZSA9PT0gT0JKRUNUID8gYnVpbGRRdWVyeVN0cmluZyh2YWx1ZSwga2V5KSA6XHJcblx0XHRcdFx0dmFsdWVUeXBlID09PSBBUlJBWSA/IHZhbHVlLnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XHJcblx0XHRcdFx0XHRpZiAoIWR1cGxpY2F0ZXNba2V5XSkgZHVwbGljYXRlc1trZXldID0ge31cclxuXHRcdFx0XHRcdGlmICghZHVwbGljYXRlc1trZXldW2l0ZW1dKSB7XHJcblx0XHRcdFx0XHRcdGR1cGxpY2F0ZXNba2V5XVtpdGVtXSA9IHRydWVcclxuXHRcdFx0XHRcdFx0cmV0dXJuIG1lbW8uY29uY2F0KGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoaXRlbSkpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRyZXR1cm4gbWVtb1xyXG5cdFx0XHRcdH0sIFtdKS5qb2luKFwiJlwiKSA6XHJcblx0XHRcdFx0ZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcclxuXHRcdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHN0ci5wdXNoKHBhaXIpXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gc3RyLmpvaW4oXCImXCIpXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcoc3RyKSB7XHJcblx0XHRpZiAoc3RyLmNoYXJBdCgwKSA9PT0gXCI/XCIpIHN0ciA9IHN0ci5zdWJzdHJpbmcoMSk7XHJcblx0XHRcclxuXHRcdHZhciBwYWlycyA9IHN0ci5zcGxpdChcIiZcIiksIHBhcmFtcyA9IHt9O1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHZhciBwYWlyID0gcGFpcnNbaV0uc3BsaXQoXCI9XCIpO1xyXG5cdFx0XHR2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMF0pXHJcblx0XHRcdHZhciB2YWx1ZSA9IHBhaXIubGVuZ3RoID09IDIgPyBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSkgOiBudWxsXHJcblx0XHRcdGlmIChwYXJhbXNba2V5XSAhPSBudWxsKSB7XHJcblx0XHRcdFx0aWYgKHR5cGUuY2FsbChwYXJhbXNba2V5XSkgIT09IEFSUkFZKSBwYXJhbXNba2V5XSA9IFtwYXJhbXNba2V5XV1cclxuXHRcdFx0XHRwYXJhbXNba2V5XS5wdXNoKHZhbHVlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgcGFyYW1zW2tleV0gPSB2YWx1ZVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHBhcmFtc1xyXG5cdH1cclxuXHRtLnJvdXRlLmJ1aWxkUXVlcnlTdHJpbmcgPSBidWlsZFF1ZXJ5U3RyaW5nXHJcblx0bS5yb3V0ZS5wYXJzZVF1ZXJ5U3RyaW5nID0gcGFyc2VRdWVyeVN0cmluZ1xyXG5cdFxyXG5cdGZ1bmN0aW9uIHJlc2V0KHJvb3QpIHtcclxuXHRcdHZhciBjYWNoZUtleSA9IGdldENlbGxDYWNoZUtleShyb290KTtcclxuXHRcdGNsZWFyKHJvb3QuY2hpbGROb2RlcywgY2VsbENhY2hlW2NhY2hlS2V5XSk7XHJcblx0XHRjZWxsQ2FjaGVbY2FjaGVLZXldID0gdW5kZWZpbmVkXHJcblx0fVxyXG5cclxuXHRtLmRlZmVycmVkID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XHJcblx0XHRkZWZlcnJlZC5wcm9taXNlID0gcHJvcGlmeShkZWZlcnJlZC5wcm9taXNlKTtcclxuXHRcdHJldHVybiBkZWZlcnJlZFxyXG5cdH07XHJcblx0ZnVuY3Rpb24gcHJvcGlmeShwcm9taXNlLCBpbml0aWFsVmFsdWUpIHtcclxuXHRcdHZhciBwcm9wID0gbS5wcm9wKGluaXRpYWxWYWx1ZSk7XHJcblx0XHRwcm9taXNlLnRoZW4ocHJvcCk7XHJcblx0XHRwcm9wLnRoZW4gPSBmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0cmV0dXJuIHByb3BpZnkocHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCksIGluaXRpYWxWYWx1ZSlcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gcHJvcFxyXG5cdH1cclxuXHQvL1Byb21pei5taXRocmlsLmpzIHwgWm9sbWVpc3RlciB8IE1JVFxyXG5cdC8vYSBtb2RpZmllZCB2ZXJzaW9uIG9mIFByb21pei5qcywgd2hpY2ggZG9lcyBub3QgY29uZm9ybSB0byBQcm9taXNlcy9BKyBmb3IgdHdvIHJlYXNvbnM6XHJcblx0Ly8xKSBgdGhlbmAgY2FsbGJhY2tzIGFyZSBjYWxsZWQgc3luY2hyb25vdXNseSAoYmVjYXVzZSBzZXRUaW1lb3V0IGlzIHRvbyBzbG93LCBhbmQgdGhlIHNldEltbWVkaWF0ZSBwb2x5ZmlsbCBpcyB0b28gYmlnXHJcblx0Ly8yKSB0aHJvd2luZyBzdWJjbGFzc2VzIG9mIEVycm9yIGNhdXNlIHRoZSBlcnJvciB0byBiZSBidWJibGVkIHVwIGluc3RlYWQgb2YgdHJpZ2dlcmluZyByZWplY3Rpb24gKGJlY2F1c2UgdGhlIHNwZWMgZG9lcyBub3QgYWNjb3VudCBmb3IgdGhlIGltcG9ydGFudCB1c2UgY2FzZSBvZiBkZWZhdWx0IGJyb3dzZXIgZXJyb3IgaGFuZGxpbmcsIGkuZS4gbWVzc2FnZSB3LyBsaW5lIG51bWJlcilcclxuXHRmdW5jdGlvbiBEZWZlcnJlZChzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xyXG5cdFx0dmFyIFJFU09MVklORyA9IDEsIFJFSkVDVElORyA9IDIsIFJFU09MVkVEID0gMywgUkVKRUNURUQgPSA0O1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzLCBzdGF0ZSA9IDAsIHByb21pc2VWYWx1ZSA9IDAsIG5leHQgPSBbXTtcclxuXHJcblx0XHRzZWxmW1wicHJvbWlzZVwiXSA9IHt9O1xyXG5cclxuXHRcdHNlbGZbXCJyZXNvbHZlXCJdID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0aWYgKCFzdGF0ZSkge1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVTT0xWSU5HO1xyXG5cclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRzZWxmW1wicmVqZWN0XCJdID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0aWYgKCFzdGF0ZSkge1xyXG5cdFx0XHRcdHByb21pc2VWYWx1ZSA9IHZhbHVlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cclxuXHRcdFx0XHRmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gdGhpc1xyXG5cdFx0fTtcclxuXHJcblx0XHRzZWxmLnByb21pc2VbXCJ0aGVuXCJdID0gZnVuY3Rpb24oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcclxuXHRcdFx0dmFyIGRlZmVycmVkID0gbmV3IERlZmVycmVkKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcclxuXHRcdFx0aWYgKHN0YXRlID09PSBSRVNPTFZFRCkge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocHJvbWlzZVZhbHVlKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RFRCkge1xyXG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChwcm9taXNlVmFsdWUpXHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0bmV4dC5wdXNoKGRlZmVycmVkKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0XHR9O1xyXG5cclxuXHRcdGZ1bmN0aW9uIGZpbmlzaCh0eXBlKSB7XHJcblx0XHRcdHN0YXRlID0gdHlwZSB8fCBSRUpFQ1RFRDtcclxuXHRcdFx0bmV4dC5tYXAoZnVuY3Rpb24oZGVmZXJyZWQpIHtcclxuXHRcdFx0XHRzdGF0ZSA9PT0gUkVTT0xWRUQgJiYgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlVmFsdWUpIHx8IGRlZmVycmVkLnJlamVjdChwcm9taXNlVmFsdWUpXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gdGhlbm5hYmxlKHRoZW4sIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrLCBub3RUaGVubmFibGVDYWxsYmFjaykge1xyXG5cdFx0XHRpZiAoKChwcm9taXNlVmFsdWUgIT0gbnVsbCAmJiB0eXBlLmNhbGwocHJvbWlzZVZhbHVlKSA9PT0gT0JKRUNUKSB8fCB0eXBlb2YgcHJvbWlzZVZhbHVlID09PSBGVU5DVElPTikgJiYgdHlwZW9mIHRoZW4gPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdC8vIGNvdW50IHByb3RlY3RzIGFnYWluc3QgYWJ1c2UgY2FsbHMgZnJvbSBzcGVjIGNoZWNrZXJcclxuXHRcdFx0XHRcdHZhciBjb3VudCA9IDA7XHJcblx0XHRcdFx0XHR0aGVuLmNhbGwocHJvbWlzZVZhbHVlLCBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY291bnQrKykgcmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0c3VjY2Vzc0NhbGxiYWNrKClcclxuXHRcdFx0XHRcdH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoY291bnQrKykgcmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0ZmFpbHVyZUNhbGxiYWNrKClcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdFx0ZmFpbHVyZUNhbGxiYWNrKClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bm90VGhlbm5hYmxlQ2FsbGJhY2soKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZmlyZSgpIHtcclxuXHRcdFx0Ly8gY2hlY2sgaWYgaXQncyBhIHRoZW5hYmxlXHJcblx0XHRcdHZhciB0aGVuO1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdHRoZW4gPSBwcm9taXNlVmFsdWUgJiYgcHJvbWlzZVZhbHVlLnRoZW5cclxuXHRcdFx0fVxyXG5cdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdG0uZGVmZXJyZWQub25lcnJvcihlKTtcclxuXHRcdFx0XHRwcm9taXNlVmFsdWUgPSBlO1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cdFx0XHRcdHJldHVybiBmaXJlKClcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGVubmFibGUodGhlbiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c3RhdGUgPSBSRVNPTFZJTkc7XHJcblx0XHRcdFx0ZmlyZSgpXHJcblx0XHRcdH0sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHN0YXRlID0gUkVKRUNUSU5HO1xyXG5cdFx0XHRcdGZpcmUoKVxyXG5cdFx0XHR9LCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKHN0YXRlID09PSBSRVNPTFZJTkcgJiYgdHlwZW9mIHN1Y2Nlc3NDYWxsYmFjayA9PT0gRlVOQ1RJT04pIHtcclxuXHRcdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gc3VjY2Vzc0NhbGxiYWNrKHByb21pc2VWYWx1ZSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2UgaWYgKHN0YXRlID09PSBSRUpFQ1RJTkcgJiYgdHlwZW9mIGZhaWx1cmVDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdFx0XHRcdHByb21pc2VWYWx1ZSA9IGZhaWx1cmVDYWxsYmFjayhwcm9taXNlVmFsdWUpO1xyXG5cdFx0XHRcdFx0XHRzdGF0ZSA9IFJFU09MVklOR1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0bS5kZWZlcnJlZC5vbmVycm9yKGUpO1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gZTtcclxuXHRcdFx0XHRcdHJldHVybiBmaW5pc2goKVxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKHByb21pc2VWYWx1ZSA9PT0gc2VsZikge1xyXG5cdFx0XHRcdFx0cHJvbWlzZVZhbHVlID0gVHlwZUVycm9yKCk7XHJcblx0XHRcdFx0XHRmaW5pc2goKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdHRoZW5uYWJsZSh0aGVuLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdGZpbmlzaChSRVNPTFZFRClcclxuXHRcdFx0XHRcdH0sIGZpbmlzaCwgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRmaW5pc2goc3RhdGUgPT09IFJFU09MVklORyAmJiBSRVNPTFZFRClcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH1cclxuXHRtLmRlZmVycmVkLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRpZiAodHlwZS5jYWxsKGUpID09PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgIWUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvIEVycm9yLykpIHRocm93IGVcclxuXHR9O1xyXG5cclxuXHRtLnN5bmMgPSBmdW5jdGlvbihhcmdzKSB7XHJcblx0XHR2YXIgbWV0aG9kID0gXCJyZXNvbHZlXCI7XHJcblx0XHRmdW5jdGlvbiBzeW5jaHJvbml6ZXIocG9zLCByZXNvbHZlZCkge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0XHRyZXN1bHRzW3Bvc10gPSB2YWx1ZTtcclxuXHRcdFx0XHRpZiAoIXJlc29sdmVkKSBtZXRob2QgPSBcInJlamVjdFwiO1xyXG5cdFx0XHRcdGlmICgtLW91dHN0YW5kaW5nID09PSAwKSB7XHJcblx0XHRcdFx0XHRkZWZlcnJlZC5wcm9taXNlKHJlc3VsdHMpO1xyXG5cdFx0XHRcdFx0ZGVmZXJyZWRbbWV0aG9kXShyZXN1bHRzKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gdmFsdWVcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBkZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcclxuXHRcdHZhciBvdXRzdGFuZGluZyA9IGFyZ3MubGVuZ3RoO1xyXG5cdFx0dmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkob3V0c3RhbmRpbmcpO1xyXG5cdFx0aWYgKGFyZ3MubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRhcmdzW2ldLnRoZW4oc3luY2hyb25pemVyKGksIHRydWUpLCBzeW5jaHJvbml6ZXIoaSwgZmFsc2UpKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRlbHNlIGRlZmVycmVkLnJlc29sdmUoW10pO1xyXG5cclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0fTtcclxuXHRmdW5jdGlvbiBpZGVudGl0eSh2YWx1ZSkge3JldHVybiB2YWx1ZX1cclxuXHJcblx0ZnVuY3Rpb24gYWpheChvcHRpb25zKSB7XHJcblx0XHRpZiAob3B0aW9ucy5kYXRhVHlwZSAmJiBvcHRpb25zLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT09IFwianNvbnBcIikge1xyXG5cdFx0XHR2YXIgY2FsbGJhY2tLZXkgPSBcIm1pdGhyaWxfY2FsbGJhY2tfXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIFwiX1wiICsgKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDFlMTYpKS50b1N0cmluZygzNik7XHJcblx0XHRcdHZhciBzY3JpcHQgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuXHJcblx0XHRcdHdpbmRvd1tjYWxsYmFja0tleV0gPSBmdW5jdGlvbihyZXNwKSB7XHJcblx0XHRcdFx0c2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcclxuXHRcdFx0XHRvcHRpb25zLm9ubG9hZCh7XHJcblx0XHRcdFx0XHR0eXBlOiBcImxvYWRcIixcclxuXHRcdFx0XHRcdHRhcmdldDoge1xyXG5cdFx0XHRcdFx0XHRyZXNwb25zZVRleHQ6IHJlc3BcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gdW5kZWZpbmVkXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG5cclxuXHRcdFx0XHRvcHRpb25zLm9uZXJyb3Ioe1xyXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxyXG5cdFx0XHRcdFx0dGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRcdHN0YXR1czogNTAwLFxyXG5cdFx0XHRcdFx0XHRyZXNwb25zZVRleHQ6IEpTT04uc3RyaW5naWZ5KHtlcnJvcjogXCJFcnJvciBtYWtpbmcganNvbnAgcmVxdWVzdFwifSlcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3dbY2FsbGJhY2tLZXldID0gdW5kZWZpbmVkO1xyXG5cclxuXHRcdFx0XHRyZXR1cm4gZmFsc2VcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRzY3JpcHQuc3JjID0gb3B0aW9ucy51cmxcclxuXHRcdFx0XHQrIChvcHRpb25zLnVybC5pbmRleE9mKFwiP1wiKSA+IDAgPyBcIiZcIiA6IFwiP1wiKVxyXG5cdFx0XHRcdCsgKG9wdGlvbnMuY2FsbGJhY2tLZXkgPyBvcHRpb25zLmNhbGxiYWNrS2V5IDogXCJjYWxsYmFja1wiKVxyXG5cdFx0XHRcdCsgXCI9XCIgKyBjYWxsYmFja0tleVxyXG5cdFx0XHRcdCsgXCImXCIgKyBidWlsZFF1ZXJ5U3RyaW5nKG9wdGlvbnMuZGF0YSB8fCB7fSk7XHJcblx0XHRcdCRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdClcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR2YXIgeGhyID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdDtcclxuXHRcdFx0eGhyLm9wZW4ob3B0aW9ucy5tZXRob2QsIG9wdGlvbnMudXJsLCB0cnVlLCBvcHRpb25zLnVzZXIsIG9wdGlvbnMucGFzc3dvcmQpO1xyXG5cdFx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XHJcblx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkgb3B0aW9ucy5vbmxvYWQoe3R5cGU6IFwibG9hZFwiLCB0YXJnZXQ6IHhocn0pO1xyXG5cdFx0XHRcdFx0ZWxzZSBvcHRpb25zLm9uZXJyb3Ioe3R5cGU6IFwiZXJyb3JcIiwgdGFyZ2V0OiB4aHJ9KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdFx0aWYgKG9wdGlvbnMuc2VyaWFsaXplID09PSBKU09OLnN0cmluZ2lmeSAmJiBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5tZXRob2QgIT09IFwiR0VUXCIpIHtcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLThcIilcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAob3B0aW9ucy5kZXNlcmlhbGl6ZSA9PT0gSlNPTi5wYXJzZSkge1xyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQWNjZXB0XCIsIFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC8qXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb25maWcgPT09IEZVTkNUSU9OKSB7XHJcblx0XHRcdFx0dmFyIG1heWJlWGhyID0gb3B0aW9ucy5jb25maWcoeGhyLCBvcHRpb25zKTtcclxuXHRcdFx0XHRpZiAobWF5YmVYaHIgIT0gbnVsbCkgeGhyID0gbWF5YmVYaHJcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIGRhdGEgPSBvcHRpb25zLm1ldGhvZCA9PT0gXCJHRVRcIiB8fCAhb3B0aW9ucy5kYXRhID8gXCJcIiA6IG9wdGlvbnMuZGF0YVxyXG5cdFx0XHRpZiAoZGF0YSAmJiAodHlwZS5jYWxsKGRhdGEpICE9IFNUUklORyAmJiBkYXRhLmNvbnN0cnVjdG9yICE9IHdpbmRvdy5Gb3JtRGF0YSkpIHtcclxuXHRcdFx0XHR0aHJvdyBcIlJlcXVlc3QgZGF0YSBzaG91bGQgYmUgZWl0aGVyIGJlIGEgc3RyaW5nIG9yIEZvcm1EYXRhLiBDaGVjayB0aGUgYHNlcmlhbGl6ZWAgb3B0aW9uIGluIGBtLnJlcXVlc3RgXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0eGhyLnNlbmQoZGF0YSk7XHJcblx0XHRcdHJldHVybiB4aHJcclxuXHRcdH1cclxuXHR9XHJcblx0ZnVuY3Rpb24gYmluZERhdGEoeGhyT3B0aW9ucywgZGF0YSwgc2VyaWFsaXplKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIgJiYgeGhyT3B0aW9ucy5kYXRhVHlwZSAhPSBcImpzb25wXCIpIHtcclxuXHRcdFx0dmFyIHByZWZpeCA9IHhock9wdGlvbnMudXJsLmluZGV4T2YoXCI/XCIpIDwgMCA/IFwiP1wiIDogXCImXCI7XHJcblx0XHRcdHZhciBxdWVyeXN0cmluZyA9IGJ1aWxkUXVlcnlTdHJpbmcoZGF0YSk7XHJcblx0XHRcdHhock9wdGlvbnMudXJsID0geGhyT3B0aW9ucy51cmwgKyAocXVlcnlzdHJpbmcgPyBwcmVmaXggKyBxdWVyeXN0cmluZyA6IFwiXCIpXHJcblx0XHR9XHJcblx0XHRlbHNlIHhock9wdGlvbnMuZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcclxuXHRcdHJldHVybiB4aHJPcHRpb25zXHJcblx0fVxyXG5cdGZ1bmN0aW9uIHBhcmFtZXRlcml6ZVVybCh1cmwsIGRhdGEpIHtcclxuXHRcdHZhciB0b2tlbnMgPSB1cmwubWF0Y2goLzpbYS16XVxcdysvZ2kpO1xyXG5cdFx0aWYgKHRva2VucyAmJiBkYXRhKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIGtleSA9IHRva2Vuc1tpXS5zbGljZSgxKTtcclxuXHRcdFx0XHR1cmwgPSB1cmwucmVwbGFjZSh0b2tlbnNbaV0sIGRhdGFba2V5XSk7XHJcblx0XHRcdFx0ZGVsZXRlIGRhdGFba2V5XVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdXJsXHJcblx0fVxyXG5cclxuXHRtLnJlcXVlc3QgPSBmdW5jdGlvbih4aHJPcHRpb25zKSB7XHJcblx0XHRpZiAoeGhyT3B0aW9ucy5iYWNrZ3JvdW5kICE9PSB0cnVlKSBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcclxuXHRcdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xyXG5cdFx0dmFyIGlzSlNPTlAgPSB4aHJPcHRpb25zLmRhdGFUeXBlICYmIHhock9wdGlvbnMuZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29ucFwiO1xyXG5cdFx0dmFyIHNlcmlhbGl6ZSA9IHhock9wdGlvbnMuc2VyaWFsaXplID0gaXNKU09OUCA/IGlkZW50aXR5IDogeGhyT3B0aW9ucy5zZXJpYWxpemUgfHwgSlNPTi5zdHJpbmdpZnk7XHJcblx0XHR2YXIgZGVzZXJpYWxpemUgPSB4aHJPcHRpb25zLmRlc2VyaWFsaXplID0gaXNKU09OUCA/IGlkZW50aXR5IDogeGhyT3B0aW9ucy5kZXNlcmlhbGl6ZSB8fCBKU09OLnBhcnNlO1xyXG5cdFx0dmFyIGV4dHJhY3QgPSBpc0pTT05QID8gZnVuY3Rpb24oanNvbnApIHtyZXR1cm4ganNvbnAucmVzcG9uc2VUZXh0fSA6IHhock9wdGlvbnMuZXh0cmFjdCB8fCBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0cmV0dXJuIHhoci5yZXNwb25zZVRleHQubGVuZ3RoID09PSAwICYmIGRlc2VyaWFsaXplID09PSBKU09OLnBhcnNlID8gbnVsbCA6IHhoci5yZXNwb25zZVRleHRcclxuXHRcdH07XHJcblx0XHR4aHJPcHRpb25zLm1ldGhvZCA9ICh4aHJPcHRpb25zLm1ldGhvZCB8fCAnR0VUJykudG9VcHBlckNhc2UoKTtcclxuXHRcdHhock9wdGlvbnMudXJsID0gcGFyYW1ldGVyaXplVXJsKHhock9wdGlvbnMudXJsLCB4aHJPcHRpb25zLmRhdGEpO1xyXG5cdFx0eGhyT3B0aW9ucyA9IGJpbmREYXRhKHhock9wdGlvbnMsIHhock9wdGlvbnMuZGF0YSwgc2VyaWFsaXplKTtcclxuXHRcdHhock9wdGlvbnMub25sb2FkID0geGhyT3B0aW9ucy5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGUgPSBlIHx8IGV2ZW50O1xyXG5cdFx0XHRcdHZhciB1bndyYXAgPSAoZS50eXBlID09PSBcImxvYWRcIiA/IHhock9wdGlvbnMudW53cmFwU3VjY2VzcyA6IHhock9wdGlvbnMudW53cmFwRXJyb3IpIHx8IGlkZW50aXR5O1xyXG5cdFx0XHRcdHZhciByZXNwb25zZSA9IHVud3JhcChkZXNlcmlhbGl6ZShleHRyYWN0KGUudGFyZ2V0LCB4aHJPcHRpb25zKSksIGUudGFyZ2V0KTtcclxuXHRcdFx0XHRpZiAoZS50eXBlID09PSBcImxvYWRcIikge1xyXG5cdFx0XHRcdFx0aWYgKHR5cGUuY2FsbChyZXNwb25zZSkgPT09IEFSUkFZICYmIHhock9wdGlvbnMudHlwZSkge1xyXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmxlbmd0aDsgaSsrKSByZXNwb25zZVtpXSA9IG5ldyB4aHJPcHRpb25zLnR5cGUocmVzcG9uc2VbaV0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIGlmICh4aHJPcHRpb25zLnR5cGUpIHJlc3BvbnNlID0gbmV3IHhock9wdGlvbnMudHlwZShyZXNwb25zZSlcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZGVmZXJyZWRbZS50eXBlID09PSBcImxvYWRcIiA/IFwicmVzb2x2ZVwiIDogXCJyZWplY3RcIl0ocmVzcG9uc2UpXHJcblx0XHRcdH1cclxuXHRcdFx0Y2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRtLmRlZmVycmVkLm9uZXJyb3IoZSk7XHJcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGUpXHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHhock9wdGlvbnMuYmFja2dyb3VuZCAhPT0gdHJ1ZSkgbS5lbmRDb21wdXRhdGlvbigpXHJcblx0XHR9O1xyXG5cdFx0YWpheCh4aHJPcHRpb25zKTtcclxuXHRcdGRlZmVycmVkLnByb21pc2UgPSBwcm9waWZ5KGRlZmVycmVkLnByb21pc2UsIHhock9wdGlvbnMuaW5pdGlhbFZhbHVlKTtcclxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlXHJcblx0fTtcclxuXHJcblx0Ly90ZXN0aW5nIEFQSVxyXG5cdG0uZGVwcyA9IGZ1bmN0aW9uKG1vY2spIHtcclxuXHRcdGluaXRpYWxpemUod2luZG93ID0gbW9jayB8fCB3aW5kb3cpO1xyXG5cdFx0cmV0dXJuIHdpbmRvdztcclxuXHR9O1xyXG5cdC8vZm9yIGludGVybmFsIHRlc3Rpbmcgb25seSwgZG8gbm90IHVzZSBgbS5kZXBzLmZhY3RvcnlgXHJcblx0bS5kZXBzLmZhY3RvcnkgPSBhcHA7XHJcblxyXG5cdHJldHVybiBtXHJcbn0pKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IG07XHJcbmVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZnVuY3Rpb24oKSB7cmV0dXJuIG19KTtcclxuIiwidmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJ3ZhbGlkYXRvcicpO1xuXG4vKiBcdFRoaXMgYmluZGVyIGFsbG93cyB5b3UgdG8gY3JlYXRlIGEgdmFsaWRhdGlvbiBtZXRob2Qgb24gYSBtb2RlbCwgKHBsYWluIFxuXHRqYXZhc2NyaXB0IGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBzb21lIHByb3BlcnRpZXMpLCB0aGF0IGNhbiByZXR1cm4gYSBzZXQgXG5cdG9mIGVycm9yIG1lc3NhZ2VzIGZvciBpbnZhbGlkIHZhbHVlcy5cblx0XG5cdFRoZSB2YWxpZGF0aW9ucyBhcmUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY2hyaXNvL3ZhbGlkYXRvci5qc1x0XG5cblx0IyMgRXhhbXBsZVxuXG5cdFNheSB5b3UgaGF2ZSBhbiBvYmplY3QgbGlrZSBzbzpcblxuXHRcdHZhciBVc2VyID0gZnVuY3Rpb24oKXtcblx0XHRcdHRoaXMubmFtZSA9IFwiYm9iXCI7XG5cdFx0XHR0aGlzLmVtYWlsID0gXCJib2JfYXRfZW1haWwuY29tXCI7XG5cdFx0fSwgdXNlciA9IG5ldyBVc2VyKCk7XG5cblx0Tm93IGlmIHlvdSB3YW50ZWQgdG8gY3JlYXRlIGFuIGlzVmFsaWQgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBlbnN1cmUgXG5cdHlvdSBkb24ndCBoYXZlIGFuIGludmFsaWQgZW1haWwgYWRkcmVzcywgeW91IHNpbXBseSBhZGQ6XG5cblxuXHRUbyB5b3VyIG1vZGVsLCBzbyB5b3UgZ2V0OlxuXG5cdFx0dmFyIFVzZXIgPSBmdW5jdGlvbigpe1xuXHRcdFx0dGhpcy5uYW1lID0gXCJib2JcIjtcblx0XHRcdHRoaXMuZW1haWwgPSBcImJvYl9hdF9lbWFpbC5jb21cIjtcblx0XHRcdHRoaXMuaXNWYWxpZCA9IG1vZGVsYmluZGVyLmJpbmQodGhpcywge1xuXHRcdFx0XHRlbWFpbDoge1xuXHRcdFx0XHRcdCdpc0VtYWlsJzogXCJNdXN0IGJlIGEgdmFsaWQgZW1haWwgYWRkcmVzc1wiXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sIHVzZXIgPSBuZXcgVXNlcigpO1xuXG5cdFRoZW4ganVzdCBjYWxsIHRoZSBgaXNWYWxpZGAgbWV0aG9kIHRvIHNlZSBpZiBpdCBpcyB2YWxpZCAtIGlmIGl0IGlzXG5cdGludmFsaWQsIChhcyBpdCB3aWxsIGJlIGluIHRoaXMgY2FzZSksIHlvdSB3aWxsIGdldCBhbiBvYmplY3QgbGlrZSBzbzpcblxuXHRcdHVzZXIuaXNWYWxpZCgpXG5cdFx0Ly9cdFJldHVybnM6IHsgZW1haWw6IFtcIk11c3QgYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCJdIH1cblxuXHRZb3UgY2FuIGFsc28gY2hlY2sgaWYgYSBwYXJ0aWN1bGFyIGZpZWxkIGlzIHZhbGlkIGxpa2Ugc286XG5cblx0XHR1c2VyLmlzVmFsaWQoJ2VtYWlsJyk7XG5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGJpbmQ6IGZ1bmN0aW9uKHNlbGYsIHZPYmope1xuXHRcdHJldHVybiBmdW5jdGlvbihuYW1lKXtcblx0XHRcdHZhciByZXN1bHQgPSB7fSxcblx0XHRcdFx0dG1wLFxuXHRcdFx0XHRoYXNJbnZhbGlkRmllbGQgPSBmYWxzZSxcblx0XHRcdFx0Ly9cdEZvciBzb21lIHJlYXNvbiBub2RlLXZhbGlkYXRvciBkb2Vzbid0IGhhdmUgdGhpcy4uLlxuXHRcdFx0XHRpc05vdEVtcHR5ID0gZnVuY3Rpb24odmFsdWUpe1xuXHRcdFx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IFwiXCIgJiYgdmFsdWUgIT09IG51bGw7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vXHRHZXQgdmFsdWUgb2YgcHJvcGVydHkgZnJvbSAnc2VsZicsIHdoaWNoIGNhbiBiZSBhIGZ1bmN0aW9uLlxuXHRcdFx0XHRnZXRWYWx1ZSA9IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdFx0XHRcdHJldHVybiB0eXBlb2Ygc2VsZltuYW1lXSA9PSBcImZ1bmN0aW9uXCI/IHNlbGZbbmFtZV0oKTogc2VsZltuYW1lXTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly9cdFZhbGlkYXRlcyBhIHZhbHVlIGFnYWluc3QgYSBzZXQgb2YgdmFsaWRhdGlvbnNcblx0XHRcdFx0Ly9cdFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdmFsaWQsIG9yIGFuIG9iamVjdCBcblx0XHRcdFx0dmFsaWRhdGUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgdmFsaWRhdGlvbnMpIHtcblx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbixcblx0XHRcdFx0XHRcdHRtcCxcblx0XHRcdFx0XHRcdHJlc3VsdCA9IFtdO1xuXHRcdFx0XHRcdGZvcih2YWxpZGF0aW9uIGluIHZhbGlkYXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZih2YWxpZGF0aW9uID09IFwiaXNSZXF1aXJlZFwiKSB7XG5cdFx0XHRcdFx0XHRcdC8vXHR1c2Ugb3VyIFwiaXNSZXF1aXJlZFwiIGZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdHRtcCA9IGlzTm90RW1wdHkodmFsdWUpPyB0cnVlOiB2YWxpZGF0aW9uc1t2YWxpZGF0aW9uXTsgXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvL1x0VXNlIHZhbGlkYXRvciBtZXRob2Rcblx0XHRcdFx0XHRcdFx0dG1wID0gdmFsaWRhdG9yW3ZhbGlkYXRpb25dKHZhbHVlKT8gdHJ1ZTogdmFsaWRhdGlvbnNbdmFsaWRhdGlvbl07IFxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvL1x0SGFuZGxlIG11bHRpcGxlIG1lc3NhZ2VzXG5cdFx0XHRcdFx0XHRpZih0bXAgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gKHJlc3VsdCA9PT0gdHJ1ZSB8fCByZXN1bHQgPT0gXCJ1bmRlZmluZWRcIik/IFtdOiByZXN1bHQ7XG5cdFx0XHRcdFx0XHRcdHJlc3VsdC5wdXNoKHRtcCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRpZihuYW1lKSB7XG5cdFx0XHRcdHJlc3VsdCA9IHZhbGlkYXRlKG5hbWUsIGdldFZhbHVlKG5hbWUpLCB2T2JqW25hbWVdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vXHRWYWxpZGF0ZSB0aGUgd2hvbGUgbW9kZWxcblx0XHRcdFx0Zm9yKG5hbWUgaW4gdk9iaikge1xuXHRcdFx0XHRcdHRtcCA9IHZhbGlkYXRlKG5hbWUsIGdldFZhbHVlKG5hbWUpLCB2T2JqW25hbWVdKTtcblx0XHRcdFx0XHRpZih0bXAgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdGhhc0ludmFsaWRGaWVsZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IHRtcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZighaGFzSW52YWxpZEZpZWxkKSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0fVxufTsiLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNSBDaHJpcyBPJ0hhcmEgPGNvaGFyYTg3QGdtYWlsLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxuICogTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxuICogT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG4oZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24pIHtcbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKCk7XG4gICAgfVxufSkoJ3ZhbGlkYXRvcicsIGZ1bmN0aW9uICh2YWxpZGF0b3IpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhbGlkYXRvciA9IHsgdmVyc2lvbjogJzMuNDAuMCcgfTtcblxuICAgIHZhciBlbWFpbFVzZXIgPSAvXigoKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dKSsoXFwuKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dKSspKil8KChcXHgyMikoKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPygoW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZdfFxceDIxfFtcXHgyMy1cXHg1Yl18W1xceDVkLVxceDdlXSl8KFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSkkL2k7XG5cbiAgICB2YXIgZW1haWxVc2VyVXRmOCA9IC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpJC9pO1xuXG4gICAgdmFyIGRpc3BsYXlOYW1lID0gL14oPzpbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XFwuXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKD86W2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9flxcLl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl18XFxzKSo8KC4rKT4kL2k7XG5cbiAgICB2YXIgY3JlZGl0Q2FyZCA9IC9eKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldWzAtOV0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXwoPzoyMTMxfDE4MDB8MzVcXGR7M30pXFxkezExfSkkLztcblxuICAgIHZhciBpc2luID0gL15bQS1aXXsyfVswLTlBLVpdezl9WzAtOV0kLztcblxuICAgIHZhciBpc2JuMTBNYXliZSA9IC9eKD86WzAtOV17OX1YfFswLTldezEwfSkkL1xuICAgICAgLCBpc2JuMTNNYXliZSA9IC9eKD86WzAtOV17MTN9KSQvO1xuXG4gICAgdmFyIGlwdjRNYXliZSA9IC9eKFxcZCspXFwuKFxcZCspXFwuKFxcZCspXFwuKFxcZCspJC9cbiAgICAgICwgaXB2NkJsb2NrID0gL15bMC05QS1GXXsxLDR9JC9pO1xuXG4gICAgdmFyIHV1aWQgPSB7XG4gICAgICAgICczJzogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS0zWzAtOUEtRl17M30tWzAtOUEtRl17NH0tWzAtOUEtRl17MTJ9JC9pXG4gICAgICAsICc0JzogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS00WzAtOUEtRl17M30tWzg5QUJdWzAtOUEtRl17M30tWzAtOUEtRl17MTJ9JC9pXG4gICAgICAsICc1JzogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS01WzAtOUEtRl17M30tWzg5QUJdWzAtOUEtRl17M30tWzAtOUEtRl17MTJ9JC9pXG4gICAgICAsIGFsbDogL15bMC05QS1GXXs4fS1bMC05QS1GXXs0fS1bMC05QS1GXXs0fS1bMC05QS1GXXs0fS1bMC05QS1GXXsxMn0kL2lcbiAgICB9O1xuXG4gICAgdmFyIGFscGhhID0gL15bQS1aXSskL2lcbiAgICAgICwgYWxwaGFudW1lcmljID0gL15bMC05QS1aXSskL2lcbiAgICAgICwgbnVtZXJpYyA9IC9eWy0rXT9bMC05XSskL1xuICAgICAgLCBpbnQgPSAvXig/OlstK10/KD86MHxbMS05XVswLTldKikpJC9cbiAgICAgICwgZmxvYXQgPSAvXig/OlstK10/KD86WzAtOV0rKSk/KD86XFwuWzAtOV0qKT8oPzpbZUVdW1xcK1xcLV0/KD86WzAtOV0rKSk/JC9cbiAgICAgICwgaGV4YWRlY2ltYWwgPSAvXlswLTlBLUZdKyQvaVxuICAgICAgLCBoZXhjb2xvciA9IC9eIz8oWzAtOUEtRl17M318WzAtOUEtRl17Nn0pJC9pO1xuXG4gICAgdmFyIGFzY2lpID0gL15bXFx4MDAtXFx4N0ZdKyQvXG4gICAgICAsIG11bHRpYnl0ZSA9IC9bXlxceDAwLVxceDdGXS9cbiAgICAgICwgZnVsbFdpZHRoID0gL1teXFx1MDAyMC1cXHUwMDdFXFx1RkY2MS1cXHVGRjlGXFx1RkZBMC1cXHVGRkRDXFx1RkZFOC1cXHVGRkVFMC05YS16QS1aXS9cbiAgICAgICwgaGFsZldpZHRoID0gL1tcXHUwMDIwLVxcdTAwN0VcXHVGRjYxLVxcdUZGOUZcXHVGRkEwLVxcdUZGRENcXHVGRkU4LVxcdUZGRUUwLTlhLXpBLVpdLztcblxuICAgIHZhciBzdXJyb2dhdGVQYWlyID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vO1xuXG4gICAgdmFyIGJhc2U2NCA9IC9eKD86W0EtWjAtOStcXC9dezR9KSooPzpbQS1aMC05K1xcL117Mn09PXxbQS1aMC05K1xcL117M309fFtBLVowLTkrXFwvXXs0fSkkL2k7XG5cbiAgICB2YXIgcGhvbmVzID0ge1xuICAgICAgJ3poLUNOJzogL14oXFwrPzA/ODZcXC0/KT8xWzM0NTc4OV1cXGR7OX0kLyxcbiAgICAgICdlbi1aQSc6IC9eKFxcKz8yN3wwKVxcZHs5fSQvLFxuICAgICAgJ2VuLUFVJzogL14oXFwrPzYxfDApNFxcZHs4fSQvLFxuICAgICAgJ2VuLUhLJzogL14oXFwrPzg1MlxcLT8pP1s1NjldXFxkezN9XFwtP1xcZHs0fSQvLFxuICAgICAgJ2ZyLUZSJzogL14oXFwrPzMzfDApWzY3XVxcZHs4fSQvLFxuICAgICAgJ3B0LVBUJzogL14oXFwrMzUxKT85WzEyMzZdXFxkezd9JC8sXG4gICAgICAnZWwtR1InOiAvXihcXCszMCk/KCgyXFxkezl9KXwoNjlcXGR7OH0pKSQvLFxuICAgICAgJ2VuLUdCJzogL14oXFwrPzQ0fDApN1xcZHs5fSQvLFxuICAgICAgJ2VuLVVTJzogL14oXFwrPzEpP1syLTldXFxkezJ9WzItOV0oPyExMSlcXGR7Nn0kLyxcbiAgICAgICdlbi1aTSc6IC9eKFxcKzI2KT8wOVs1NjddXFxkezd9JC9cbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmV4dGVuZCA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgICAgICB2YWxpZGF0b3JbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBhcmdzWzBdID0gdmFsaWRhdG9yLnRvU3RyaW5nKGFyZ3NbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHZhbGlkYXRvciwgYXJncyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8vUmlnaHQgYmVmb3JlIGV4cG9ydGluZyB0aGUgdmFsaWRhdG9yIG9iamVjdCwgcGFzcyBlYWNoIG9mIHRoZSBidWlsdGluc1xuICAgIC8vdGhyb3VnaCBleHRlbmQoKSBzbyB0aGF0IHRoZWlyIGZpcnN0IGFyZ3VtZW50IGlzIGNvZXJjZWQgdG8gYSBzdHJpbmdcbiAgICB2YWxpZGF0b3IuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWxpZGF0b3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yW25hbWVdICE9PSAnZnVuY3Rpb24nIHx8IG5hbWUgPT09ICd0b1N0cmluZycgfHxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gJ3RvRGF0ZScgfHwgbmFtZSA9PT0gJ2V4dGVuZCcgfHwgbmFtZSA9PT0gJ2luaXQnKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0b3IuZXh0ZW5kKG5hbWUsIHZhbGlkYXRvcltuYW1lXSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvU3RyaW5nID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnICYmIGlucHV0ICE9PSBudWxsICYmIGlucHV0LnRvU3RyaW5nKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGlucHV0LnRvU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQgPT09IG51bGwgfHwgdHlwZW9mIGlucHV0ID09PSAndW5kZWZpbmVkJyB8fCAoaXNOYU4oaW5wdXQpICYmICFpbnB1dC5sZW5ndGgpKSB7XG4gICAgICAgICAgICBpbnB1dCA9ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlucHV0ICs9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnRvRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZGF0ZSkgPT09ICdbb2JqZWN0IERhdGVdJykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgICAgIH1cbiAgICAgICAgZGF0ZSA9IERhdGUucGFyc2UoZGF0ZSk7XG4gICAgICAgIHJldHVybiAhaXNOYU4oZGF0ZSkgPyBuZXcgRGF0ZShkYXRlKSA6IG51bGw7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0Zsb2F0ID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IudG9JbnQgPSBmdW5jdGlvbiAoc3RyLCByYWRpeCkge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyLCByYWRpeCB8fCAxMCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50b0Jvb2xlYW4gPSBmdW5jdGlvbiAoc3RyLCBzdHJpY3QpIHtcbiAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ciA9PT0gJzEnIHx8IHN0ciA9PT0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHIgIT09ICcwJyAmJiBzdHIgIT09ICdmYWxzZScgJiYgc3RyICE9PSAnJztcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmVxdWFscyA9IGZ1bmN0aW9uIChzdHIsIGNvbXBhcmlzb24pIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gdmFsaWRhdG9yLnRvU3RyaW5nKGNvbXBhcmlzb24pO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuY29udGFpbnMgPSBmdW5jdGlvbiAoc3RyLCBlbGVtKSB7XG4gICAgICAgIHJldHVybiBzdHIuaW5kZXhPZih2YWxpZGF0b3IudG9TdHJpbmcoZWxlbSkpID49IDA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5tYXRjaGVzID0gZnVuY3Rpb24gKHN0ciwgcGF0dGVybiwgbW9kaWZpZXJzKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGF0dGVybikgIT09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBtb2RpZmllcnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfZW1haWxfb3B0aW9ucyA9IHtcbiAgICAgICAgYWxsb3dfZGlzcGxheV9uYW1lOiBmYWxzZSxcbiAgICAgICAgYWxsb3dfdXRmOF9sb2NhbF9wYXJ0OiB0cnVlLFxuICAgICAgICByZXF1aXJlX3RsZDogdHJ1ZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNFbWFpbCA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfZW1haWxfb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfZGlzcGxheV9uYW1lKSB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheV9lbWFpbCA9IHN0ci5tYXRjaChkaXNwbGF5TmFtZSk7XG4gICAgICAgICAgICBpZiAoZGlzcGxheV9lbWFpbCkge1xuICAgICAgICAgICAgICAgIHN0ciA9IGRpc3BsYXlfZW1haWxbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoL1xccy8udGVzdChzdHIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJ0AnKVxuICAgICAgICAgICwgZG9tYWluID0gcGFydHMucG9wKClcbiAgICAgICAgICAsIHVzZXIgPSBwYXJ0cy5qb2luKCdAJyk7XG5cbiAgICAgICAgaWYgKCF2YWxpZGF0b3IuaXNGUUROKGRvbWFpbiwge3JlcXVpcmVfdGxkOiBvcHRpb25zLnJlcXVpcmVfdGxkfSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRpb25zLmFsbG93X3V0ZjhfbG9jYWxfcGFydCA/XG4gICAgICAgICAgICBlbWFpbFVzZXJVdGY4LnRlc3QodXNlcikgOlxuICAgICAgICAgICAgZW1haWxVc2VyLnRlc3QodXNlcik7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0X3VybF9vcHRpb25zID0ge1xuICAgICAgICBwcm90b2NvbHM6IFsgJ2h0dHAnLCAnaHR0cHMnLCAnZnRwJyBdXG4gICAgICAsIHJlcXVpcmVfdGxkOiB0cnVlXG4gICAgICAsIHJlcXVpcmVfcHJvdG9jb2w6IGZhbHNlXG4gICAgICAsIGFsbG93X3VuZGVyc2NvcmVzOiBmYWxzZVxuICAgICAgLCBhbGxvd190cmFpbGluZ19kb3Q6IGZhbHNlXG4gICAgICAsIGFsbG93X3Byb3RvY29sX3JlbGF0aXZlX3VybHM6IGZhbHNlXG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1VSTCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCF1cmwgfHwgdXJsLmxlbmd0aCA+PSAyMDgzIHx8IC9cXHMvLnRlc3QodXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZignbWFpbHRvOicpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfdXJsX29wdGlvbnMpO1xuICAgICAgICB2YXIgcHJvdG9jb2wsIGF1dGgsIGhvc3QsIGhvc3RuYW1lLCBwb3J0LFxuICAgICAgICAgICAgcG9ydF9zdHIsIHNwbGl0O1xuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnOi8vJyk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBwcm90b2NvbCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wcm90b2NvbHMuaW5kZXhPZihwcm90b2NvbCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucmVxdWlyZV9wcm90b2NvbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9ICBlbHNlIGlmIChvcHRpb25zLmFsbG93X3Byb3RvY29sX3JlbGF0aXZlX3VybHMgJiYgdXJsLnN1YnN0cigwLCAyKSA9PT0gJy8vJykge1xuICAgICAgICAgICAgc3BsaXRbMF0gPSB1cmwuc3Vic3RyKDIpO1xuICAgICAgICB9XG4gICAgICAgIHVybCA9IHNwbGl0LmpvaW4oJzovLycpO1xuICAgICAgICBzcGxpdCA9IHVybC5zcGxpdCgnIycpO1xuICAgICAgICB1cmwgPSBzcGxpdC5zaGlmdCgpO1xuXG4gICAgICAgIHNwbGl0ID0gdXJsLnNwbGl0KCc/Jyk7XG4gICAgICAgIHVybCA9IHNwbGl0LnNoaWZ0KCk7XG5cbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJy8nKTtcbiAgICAgICAgdXJsID0gc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgc3BsaXQgPSB1cmwuc3BsaXQoJ0AnKTtcbiAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGF1dGggPSBzcGxpdC5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKGF1dGguaW5kZXhPZignOicpID49IDAgJiYgYXV0aC5zcGxpdCgnOicpLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaG9zdG5hbWUgPSBzcGxpdC5qb2luKCdAJyk7XG4gICAgICAgIHNwbGl0ID0gaG9zdG5hbWUuc3BsaXQoJzonKTtcbiAgICAgICAgaG9zdCA9IHNwbGl0LnNoaWZ0KCk7XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBvcnRfc3RyID0gc3BsaXQuam9pbignOicpO1xuICAgICAgICAgICAgcG9ydCA9IHBhcnNlSW50KHBvcnRfc3RyLCAxMCk7XG4gICAgICAgICAgICBpZiAoIS9eWzAtOV0rJC8udGVzdChwb3J0X3N0cikgfHwgcG9ydCA8PSAwIHx8IHBvcnQgPiA2NTUzNSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkYXRvci5pc0lQKGhvc3QpICYmICF2YWxpZGF0b3IuaXNGUUROKGhvc3QsIG9wdGlvbnMpICYmXG4gICAgICAgICAgICAgICAgaG9zdCAhPT0gJ2xvY2FsaG9zdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5ob3N0X3doaXRlbGlzdCAmJlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaG9zdF93aGl0ZWxpc3QuaW5kZXhPZihob3N0KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5ob3N0X2JsYWNrbGlzdCAmJlxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaG9zdF9ibGFja2xpc3QuaW5kZXhPZihob3N0KSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSVAgPSBmdW5jdGlvbiAoc3RyLCB2ZXJzaW9uKSB7XG4gICAgICAgIHZlcnNpb24gPSB2YWxpZGF0b3IudG9TdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGlmICghdmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5pc0lQKHN0ciwgNCkgfHwgdmFsaWRhdG9yLmlzSVAoc3RyLCA2KTtcbiAgICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uID09PSAnNCcpIHtcbiAgICAgICAgICAgIGlmICghaXB2NE1heWJlLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgnLicpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0c1szXSA8PSAyNTU7XG4gICAgICAgIH0gZWxzZSBpZiAodmVyc2lvbiA9PT0gJzYnKSB7XG4gICAgICAgICAgICB2YXIgYmxvY2tzID0gc3RyLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICB2YXIgZm91bmRPbWlzc2lvbkJsb2NrID0gZmFsc2U7IC8vIG1hcmtlciB0byBpbmRpY2F0ZSA6OlxuXG4gICAgICAgICAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsIG9yIGZpbmFsIDo6XG4gICAgICAgICAgICBpZiAoc3RyID09PSAnOjonKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0ci5zdWJzdHIoMCwgMikgPT09ICc6OicpIHtcbiAgICAgICAgICAgICAgICBibG9ja3Muc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBibG9ja3Muc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBmb3VuZE9taXNzaW9uQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdHIuc3Vic3RyKHN0ci5sZW5ndGggLSAyKSA9PT0gJzo6Jykge1xuICAgICAgICAgICAgICAgIGJsb2Nrcy5wb3AoKTtcbiAgICAgICAgICAgICAgICBibG9ja3MucG9wKCk7XG4gICAgICAgICAgICAgICAgZm91bmRPbWlzc2lvbkJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAvLyB0ZXN0IGZvciBhIDo6IHdoaWNoIGNhbiBub3QgYmUgYXQgdGhlIHN0cmluZyBzdGFydC9lbmRcbiAgICAgICAgICAgICAgICAvLyBzaW5jZSB0aG9zZSBjYXNlcyBoYXZlIGJlZW4gaGFuZGxlZCBhYm92ZVxuICAgICAgICAgICAgICAgIGlmIChibG9ja3NbaV0gPT09ICcnICYmIGkgPiAwICYmIGkgPCBibG9ja3MubGVuZ3RoIC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3VuZE9taXNzaW9uQmxvY2spXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG11bHRpcGxlIDo6IGluIGFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgZm91bmRPbWlzc2lvbkJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpcHY2QmxvY2sudGVzdChibG9ja3NbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmb3VuZE9taXNzaW9uQmxvY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmxvY2tzLmxlbmd0aCA+PSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmxvY2tzLmxlbmd0aCA9PT0gODtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0X2ZxZG5fb3B0aW9ucyA9IHtcbiAgICAgICAgcmVxdWlyZV90bGQ6IHRydWVcbiAgICAgICwgYWxsb3dfdW5kZXJzY29yZXM6IGZhbHNlXG4gICAgICAsIGFsbG93X3RyYWlsaW5nX2RvdDogZmFsc2VcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRlFETiA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfZnFkbl9vcHRpb25zKTtcblxuICAgICAgICAvKiBSZW1vdmUgdGhlIG9wdGlvbmFsIHRyYWlsaW5nIGRvdCBiZWZvcmUgY2hlY2tpbmcgdmFsaWRpdHkgKi9cbiAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfdHJhaWxpbmdfZG90ICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09ICcuJykge1xuICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmIChvcHRpb25zLnJlcXVpcmVfdGxkKSB7XG4gICAgICAgICAgICB2YXIgdGxkID0gcGFydHMucG9wKCk7XG4gICAgICAgICAgICBpZiAoIXBhcnRzLmxlbmd0aCB8fCAhL14oW2EtelxcdTAwYTEtXFx1ZmZmZl17Mix9fHhuW2EtejAtOS1dezIsfSkkL2kudGVzdCh0bGQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIHBhcnQsIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnQgPSBwYXJ0c1tpXTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFsbG93X3VuZGVyc2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnQuaW5kZXhPZignX18nKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFydCA9IHBhcnQucmVwbGFjZSgvXy9nLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIS9eW2EtelxcdTAwYTEtXFx1ZmZmZjAtOS1dKyQvaS50ZXN0KHBhcnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnRbMF0gPT09ICctJyB8fCBwYXJ0W3BhcnQubGVuZ3RoIC0gMV0gPT09ICctJyB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LmluZGV4T2YoJy0tLScpID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0Jvb2xlYW4gPSBmdW5jdGlvbihzdHIpIHtcbiAgICAgICAgcmV0dXJuIChbJ3RydWUnLCAnZmFsc2UnLCAnMScsICcwJ10uaW5kZXhPZihzdHIpID49IDApO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBbHBoYSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGFscGhhLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQWxwaGFudW1lcmljID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gYWxwaGFudW1lcmljLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzTnVtZXJpYyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIG51bWVyaWMudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNIZXhhZGVjaW1hbCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGhleGFkZWNpbWFsLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSGV4Q29sb3IgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBoZXhjb2xvci50ZXN0KHN0cik7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0xvd2VyY2FzZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc1VwcGVyY2FzZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ciA9PT0gc3RyLnRvVXBwZXJDYXNlKCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0ludCA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHJldHVybiBpbnQudGVzdChzdHIpICYmICghb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbWluJykgfHwgc3RyID49IG9wdGlvbnMubWluKSAmJiAoIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ21heCcpIHx8IHN0ciA8PSBvcHRpb25zLm1heCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0Zsb2F0ID0gZnVuY3Rpb24gKHN0ciwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHN0ciAhPT0gJycgJiYgZmxvYXQudGVzdChzdHIpICYmICghb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbWluJykgfHwgc3RyID49IG9wdGlvbnMubWluKSAmJiAoIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ21heCcpIHx8IHN0ciA8PSBvcHRpb25zLm1heCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0RpdmlzaWJsZUJ5ID0gZnVuY3Rpb24gKHN0ciwgbnVtKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0b3IudG9GbG9hdChzdHIpICUgdmFsaWRhdG9yLnRvSW50KG51bSkgPT09IDA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc051bGwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIubGVuZ3RoID09PSAwO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBtaW4sIG1heCkge1xuICAgICAgICB2YXIgc3Vycm9nYXRlUGFpcnMgPSBzdHIubWF0Y2goL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZykgfHwgW107XG4gICAgICAgIHZhciBsZW4gPSBzdHIubGVuZ3RoIC0gc3Vycm9nYXRlUGFpcnMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gbGVuID49IG1pbiAmJiAodHlwZW9mIG1heCA9PT0gJ3VuZGVmaW5lZCcgfHwgbGVuIDw9IG1heCk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0J5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBtaW4sIG1heCkge1xuICAgICAgICByZXR1cm4gc3RyLmxlbmd0aCA+PSBtaW4gJiYgKHR5cGVvZiBtYXggPT09ICd1bmRlZmluZWQnIHx8IHN0ci5sZW5ndGggPD0gbWF4KTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVVVJRCA9IGZ1bmN0aW9uIChzdHIsIHZlcnNpb24pIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSB1dWlkW3ZlcnNpb24gPyB2ZXJzaW9uIDogJ2FsbCddO1xuICAgICAgICByZXR1cm4gcGF0dGVybiAmJiBwYXR0ZXJuLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRGF0ZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuICFpc05hTihEYXRlLnBhcnNlKHN0cikpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBZnRlciA9IGZ1bmN0aW9uIChzdHIsIGRhdGUpIHtcbiAgICAgICAgdmFyIGNvbXBhcmlzb24gPSB2YWxpZGF0b3IudG9EYXRlKGRhdGUgfHwgbmV3IERhdGUoKSlcbiAgICAgICAgICAsIG9yaWdpbmFsID0gdmFsaWRhdG9yLnRvRGF0ZShzdHIpO1xuICAgICAgICByZXR1cm4gISEob3JpZ2luYWwgJiYgY29tcGFyaXNvbiAmJiBvcmlnaW5hbCA+IGNvbXBhcmlzb24pO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCZWZvcmUgPSBmdW5jdGlvbiAoc3RyLCBkYXRlKSB7XG4gICAgICAgIHZhciBjb21wYXJpc29uID0gdmFsaWRhdG9yLnRvRGF0ZShkYXRlIHx8IG5ldyBEYXRlKCkpXG4gICAgICAgICAgLCBvcmlnaW5hbCA9IHZhbGlkYXRvci50b0RhdGUoc3RyKTtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsICYmIGNvbXBhcmlzb24gJiYgb3JpZ2luYWwgPCBjb21wYXJpc29uO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJbiA9IGZ1bmN0aW9uIChzdHIsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob3B0aW9ucykgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yIChpIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHZhbGlkYXRvci50b1N0cmluZyhvcHRpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcnJheS5pbmRleE9mKHN0cikgPj0gMDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmhhc093blByb3BlcnR5KHN0cik7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbmRleE9mKHN0cikgPj0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0NyZWRpdENhcmQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBzYW5pdGl6ZWQgPSBzdHIucmVwbGFjZSgvW14wLTldKy9nLCAnJyk7XG4gICAgICAgIGlmICghY3JlZGl0Q2FyZC50ZXN0KHNhbml0aXplZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3VtID0gMCwgZGlnaXQsIHRtcE51bSwgc2hvdWxkRG91YmxlO1xuICAgICAgICBmb3IgKHZhciBpID0gc2FuaXRpemVkLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBkaWdpdCA9IHNhbml0aXplZC5zdWJzdHJpbmcoaSwgKGkgKyAxKSk7XG4gICAgICAgICAgICB0bXBOdW0gPSBwYXJzZUludChkaWdpdCwgMTApO1xuICAgICAgICAgICAgaWYgKHNob3VsZERvdWJsZSkge1xuICAgICAgICAgICAgICAgIHRtcE51bSAqPSAyO1xuICAgICAgICAgICAgICAgIGlmICh0bXBOdW0gPj0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9ICgodG1wTnVtICUgMTApICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3VtICs9IHRtcE51bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaG91bGREb3VibGUgPSAhc2hvdWxkRG91YmxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhISgoc3VtICUgMTApID09PSAwID8gc2FuaXRpemVkIDogZmFsc2UpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNJU0lOID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICBpZiAoIWlzaW4udGVzdChzdHIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2hlY2tzdW1TdHIgPSBzdHIucmVwbGFjZSgvW0EtWl0vZywgZnVuY3Rpb24oY2hhcmFjdGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoY2hhcmFjdGVyLCAzNik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBzdW0gPSAwLCBkaWdpdCwgdG1wTnVtLCBzaG91bGREb3VibGUgPSB0cnVlO1xuICAgICAgICBmb3IgKHZhciBpID0gY2hlY2tzdW1TdHIubGVuZ3RoIC0gMjsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGRpZ2l0ID0gY2hlY2tzdW1TdHIuc3Vic3RyaW5nKGksIChpICsgMSkpO1xuICAgICAgICAgICAgdG1wTnVtID0gcGFyc2VJbnQoZGlnaXQsIDEwKTtcbiAgICAgICAgICAgIGlmIChzaG91bGREb3VibGUpIHtcbiAgICAgICAgICAgICAgICB0bXBOdW0gKj0gMjtcbiAgICAgICAgICAgICAgICBpZiAodG1wTnVtID49IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW0gKyAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN1bSArPSB0bXBOdW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdW0gKz0gdG1wTnVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hvdWxkRG91YmxlID0gIXNob3VsZERvdWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZUludChzdHIuc3Vic3RyKHN0ci5sZW5ndGggLSAxKSwgMTApID09PSAoMTAwMDAgLSBzdW0pICUgMTA7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc0lTQk4gPSBmdW5jdGlvbiAoc3RyLCB2ZXJzaW9uKSB7XG4gICAgICAgIHZlcnNpb24gPSB2YWxpZGF0b3IudG9TdHJpbmcodmVyc2lvbik7XG4gICAgICAgIGlmICghdmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5pc0lTQk4oc3RyLCAxMCkgfHwgdmFsaWRhdG9yLmlzSVNCTihzdHIsIDEzKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2FuaXRpemVkID0gc3RyLnJlcGxhY2UoL1tcXHMtXSsvZywgJycpXG4gICAgICAgICAgLCBjaGVja3N1bSA9IDAsIGk7XG4gICAgICAgIGlmICh2ZXJzaW9uID09PSAnMTAnKSB7XG4gICAgICAgICAgICBpZiAoIWlzYm4xME1heWJlLnRlc3Qoc2FuaXRpemVkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjaGVja3N1bSArPSAoaSArIDEpICogc2FuaXRpemVkLmNoYXJBdChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzYW5pdGl6ZWQuY2hhckF0KDkpID09PSAnWCcpIHtcbiAgICAgICAgICAgICAgICBjaGVja3N1bSArPSAxMCAqIDEwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGVja3N1bSArPSAxMCAqIHNhbml0aXplZC5jaGFyQXQoOSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoKGNoZWNrc3VtICUgMTEpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhc2FuaXRpemVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgIGlmICh2ZXJzaW9uID09PSAnMTMnKSB7XG4gICAgICAgICAgICBpZiAoIWlzYm4xM01heWJlLnRlc3Qoc2FuaXRpemVkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmYWN0b3IgPSBbIDEsIDMgXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY2hlY2tzdW0gKz0gZmFjdG9yW2kgJSAyXSAqIHNhbml0aXplZC5jaGFyQXQoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2FuaXRpemVkLmNoYXJBdCgxMikgLSAoKDEwIC0gKGNoZWNrc3VtICUgMTApKSAlIDEwKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIXNhbml0aXplZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5pc01vYmlsZVBob25lID0gZnVuY3Rpb24oc3RyLCBsb2NhbGUpIHtcbiAgICAgICAgaWYgKGxvY2FsZSBpbiBwaG9uZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBwaG9uZXNbbG9jYWxlXS50ZXN0KHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICB2YXIgZGVmYXVsdF9jdXJyZW5jeV9vcHRpb25zID0ge1xuICAgICAgICBzeW1ib2w6ICckJ1xuICAgICAgLCByZXF1aXJlX3N5bWJvbDogZmFsc2VcbiAgICAgICwgYWxsb3dfc3BhY2VfYWZ0ZXJfc3ltYm9sOiBmYWxzZVxuICAgICAgLCBzeW1ib2xfYWZ0ZXJfZGlnaXRzOiBmYWxzZVxuICAgICAgLCBhbGxvd19uZWdhdGl2ZXM6IHRydWVcbiAgICAgICwgcGFyZW5zX2Zvcl9uZWdhdGl2ZXM6IGZhbHNlXG4gICAgICAsIG5lZ2F0aXZlX3NpZ25fYmVmb3JlX2RpZ2l0czogZmFsc2VcbiAgICAgICwgbmVnYXRpdmVfc2lnbl9hZnRlcl9kaWdpdHM6IGZhbHNlXG4gICAgICAsIGFsbG93X25lZ2F0aXZlX3NpZ25fcGxhY2Vob2xkZXI6IGZhbHNlXG4gICAgICAsIHRob3VzYW5kc19zZXBhcmF0b3I6ICcsJ1xuICAgICAgLCBkZWNpbWFsX3NlcGFyYXRvcjogJy4nXG4gICAgICAsIGFsbG93X3NwYWNlX2FmdGVyX2RpZ2l0czogZmFsc2VcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzQ3VycmVuY3kgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWZhdWx0X2N1cnJlbmN5X29wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiBjdXJyZW5jeVJlZ2V4KG9wdGlvbnMpLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSlNPTiA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIEpTT04ucGFyc2Uoc3RyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNNdWx0aWJ5dGUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBtdWx0aWJ5dGUudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNBc2NpaSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGFzY2lpLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzRnVsbFdpZHRoID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gZnVsbFdpZHRoLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzSGFsZldpZHRoID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gaGFsZldpZHRoLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzVmFyaWFibGVXaWR0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGxXaWR0aC50ZXN0KHN0cikgJiYgaGFsZldpZHRoLnRlc3Qoc3RyKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmlzU3Vycm9nYXRlUGFpciA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN1cnJvZ2F0ZVBhaXIudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNCYXNlNjQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHJldHVybiBiYXNlNjQudGVzdChzdHIpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuaXNNb25nb0lkID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzSGV4YWRlY2ltYWwoc3RyKSAmJiBzdHIubGVuZ3RoID09PSAyNDtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLmx0cmltID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoJ15bJyArIGNoYXJzICsgJ10rJywgJ2cnKSA6IC9eXFxzKy9nO1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IucnRyaW0gPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICB2YXIgcGF0dGVybiA9IGNoYXJzID8gbmV3IFJlZ0V4cCgnWycgKyBjaGFycyArICddKyQnLCAnZycpIDogL1xccyskL2c7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZShwYXR0ZXJuLCAnJyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci50cmltID0gZnVuY3Rpb24gKHN0ciwgY2hhcnMpIHtcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBjaGFycyA/IG5ldyBSZWdFeHAoJ15bJyArIGNoYXJzICsgJ10rfFsnICsgY2hhcnMgKyAnXSskJywgJ2cnKSA6IC9eXFxzK3xcXHMrJC9nO1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH07XG5cbiAgICB2YWxpZGF0b3IuZXNjYXBlID0gZnVuY3Rpb24gKHN0cikge1xuICAgICAgICByZXR1cm4gKHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgICAgICAucmVwbGFjZSgvJy9nLCAnJiN4Mjc7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXC8vZywgJyYjeDJGOycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxgL2csICcmIzk2OycpKTtcbiAgICB9O1xuXG4gICAgdmFsaWRhdG9yLnN0cmlwTG93ID0gZnVuY3Rpb24gKHN0ciwga2VlcF9uZXdfbGluZXMpIHtcbiAgICAgICAgdmFyIGNoYXJzID0ga2VlcF9uZXdfbGluZXMgPyAnXFxcXHgwMC1cXFxceDA5XFxcXHgwQlxcXFx4MENcXFxceDBFLVxcXFx4MUZcXFxceDdGJyA6ICdcXFxceDAwLVxcXFx4MUZcXFxceDdGJztcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRvci5ibGFja2xpc3Qoc3RyLCBjaGFycyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci53aGl0ZWxpc3QgPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnW14nICsgY2hhcnMgKyAnXSsnLCAnZycpLCAnJyk7XG4gICAgfTtcblxuICAgIHZhbGlkYXRvci5ibGFja2xpc3QgPSBmdW5jdGlvbiAoc3RyLCBjaGFycykge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnWycgKyBjaGFycyArICddKycsICdnJyksICcnKTtcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRfbm9ybWFsaXplX2VtYWlsX29wdGlvbnMgPSB7XG4gICAgICAgIGxvd2VyY2FzZTogdHJ1ZVxuICAgIH07XG5cbiAgICB2YWxpZGF0b3Iubm9ybWFsaXplRW1haWwgPSBmdW5jdGlvbiAoZW1haWwsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlZmF1bHRfbm9ybWFsaXplX2VtYWlsX29wdGlvbnMpO1xuICAgICAgICBpZiAoIXZhbGlkYXRvci5pc0VtYWlsKGVtYWlsKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJ0cyA9IGVtYWlsLnNwbGl0KCdAJywgMik7XG4gICAgICAgIHBhcnRzWzFdID0gcGFydHNbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHBhcnRzWzFdID09PSAnZ21haWwuY29tJyB8fCBwYXJ0c1sxXSA9PT0gJ2dvb2dsZW1haWwuY29tJykge1xuICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xcLi9nLCAnJyk7XG4gICAgICAgICAgICBpZiAocGFydHNbMF1bMF0gPT09ICcrJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0uc3BsaXQoJysnKVswXTtcbiAgICAgICAgICAgIHBhcnRzWzFdID0gJ2dtYWlsLmNvbSc7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5sb3dlcmNhc2UpIHtcbiAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFydHMuam9pbignQCcpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtZXJnZShvYmosIGRlZmF1bHRzKSB7XG4gICAgICAgIG9iaiA9IG9iaiB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGRlZmF1bHRzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIG9ialtrZXldID0gZGVmYXVsdHNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbmN5UmVnZXgob3B0aW9ucykge1xuICAgICAgICB2YXIgc3ltYm9sID0gJyhcXFxcJyArIG9wdGlvbnMuc3ltYm9sLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKSArICcpJyArIChvcHRpb25zLnJlcXVpcmVfc3ltYm9sID8gJycgOiAnPycpXG4gICAgICAgICAgICAsIG5lZ2F0aXZlID0gJy0/J1xuICAgICAgICAgICAgLCB3aG9sZV9kb2xsYXJfYW1vdW50X3dpdGhvdXRfc2VwID0gJ1sxLTldXFxcXGQqJ1xuICAgICAgICAgICAgLCB3aG9sZV9kb2xsYXJfYW1vdW50X3dpdGhfc2VwID0gJ1sxLTldXFxcXGR7MCwyfShcXFxcJyArIG9wdGlvbnMudGhvdXNhbmRzX3NlcGFyYXRvciArICdcXFxcZHszfSkqJ1xuICAgICAgICAgICAgLCB2YWxpZF93aG9sZV9kb2xsYXJfYW1vdW50cyA9IFsnMCcsIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aG91dF9zZXAsIHdob2xlX2RvbGxhcl9hbW91bnRfd2l0aF9zZXBdXG4gICAgICAgICAgICAsIHdob2xlX2RvbGxhcl9hbW91bnQgPSAnKCcgKyB2YWxpZF93aG9sZV9kb2xsYXJfYW1vdW50cy5qb2luKCd8JykgKyAnKT8nXG4gICAgICAgICAgICAsIGRlY2ltYWxfYW1vdW50ID0gJyhcXFxcJyArIG9wdGlvbnMuZGVjaW1hbF9zZXBhcmF0b3IgKyAnXFxcXGR7Mn0pPyc7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gd2hvbGVfZG9sbGFyX2Ftb3VudCArIGRlY2ltYWxfYW1vdW50O1xuICAgICAgICAvLyBkZWZhdWx0IGlzIG5lZ2F0aXZlIHNpZ24gYmVmb3JlIHN5bWJvbCwgYnV0IHRoZXJlIGFyZSB0d28gb3RoZXIgb3B0aW9ucyAoYmVzaWRlcyBwYXJlbnMpXG4gICAgICAgIGlmIChvcHRpb25zLmFsbG93X25lZ2F0aXZlcyAmJiAhb3B0aW9ucy5wYXJlbnNfZm9yX25lZ2F0aXZlcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubmVnYXRpdmVfc2lnbl9hZnRlcl9kaWdpdHMpIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuICs9IG5lZ2F0aXZlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5uZWdhdGl2ZV9zaWduX2JlZm9yZV9kaWdpdHMpIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gbmVnYXRpdmUgKyBwYXR0ZXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFNvdXRoIEFmcmljYW4gUmFuZCwgZm9yIGV4YW1wbGUsIHVzZXMgUiAxMjMgKHNwYWNlKSBhbmQgUi0xMjMgKG5vIHNwYWNlKVxuICAgICAgICBpZiAob3B0aW9ucy5hbGxvd19uZWdhdGl2ZV9zaWduX3BsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gJyggKD8hXFxcXC0pKT8nICsgcGF0dGVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmFsbG93X3NwYWNlX2FmdGVyX3N5bWJvbCkge1xuICAgICAgICAgICAgcGF0dGVybiA9ICcgPycgKyBwYXR0ZXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuYWxsb3dfc3BhY2VfYWZ0ZXJfZGlnaXRzKSB7XG4gICAgICAgICAgICBwYXR0ZXJuICs9ICcoICg/ISQpKT8nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnN5bWJvbF9hZnRlcl9kaWdpdHMpIHtcbiAgICAgICAgICAgIHBhdHRlcm4gKz0gc3ltYm9sO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF0dGVybiA9IHN5bWJvbCArIHBhdHRlcm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dfbmVnYXRpdmVzKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5wYXJlbnNfZm9yX25lZ2F0aXZlcykge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSAnKFxcXFwoJyArIHBhdHRlcm4gKyAnXFxcXCl8JyArIHBhdHRlcm4gKyAnKSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghKG9wdGlvbnMubmVnYXRpdmVfc2lnbl9iZWZvcmVfZGlnaXRzIHx8IG9wdGlvbnMubmVnYXRpdmVfc2lnbl9hZnRlcl9kaWdpdHMpKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IG5lZ2F0aXZlICsgcGF0dGVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICdeJyArXG4gICAgICAgICAgICAvLyBlbnN1cmUgdGhlcmUncyBhIGRvbGxhciBhbmQvb3IgZGVjaW1hbCBhbW91bnQsIGFuZCB0aGF0IGl0IGRvZXNuJ3Qgc3RhcnQgd2l0aCBhIHNwYWNlIG9yIGEgbmVnYXRpdmUgc2lnbiBmb2xsb3dlZCBieSBhIHNwYWNlXG4gICAgICAgICAgICAnKD8hLT8gKSg/PS4qXFxcXGQpJyArXG4gICAgICAgICAgICBwYXR0ZXJuICtcbiAgICAgICAgICAgICckJ1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHZhbGlkYXRvci5pbml0KCk7XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yO1xuXG59KTtcbiIsIi8qXG5cdG1pdGhyaWwuYW5pbWF0ZSAtIENvcHlyaWdodCAyMDE0IGpzZ3V5XG5cdE1JVCBMaWNlbnNlZC5cbiovXG4oZnVuY3Rpb24oKXtcbnZhciBtaXRocmlsQW5pbWF0ZSA9IGZ1bmN0aW9uIChtKSB7XG5cdC8vXHRLbm93biBwcmVmaWV4XG5cdHZhciBwcmVmaXhlcyA9IFsnTW96JywgJ1dlYmtpdCcsICdLaHRtbCcsICdPJywgJ21zJ10sXG5cdHRyYW5zaXRpb25Qcm9wcyA9IFsnVHJhbnNpdGlvblByb3BlcnR5JywgJ1RyYW5zaXRpb25UaW1pbmdGdW5jdGlvbicsICdUcmFuc2l0aW9uRGVsYXknLCAnVHJhbnNpdGlvbkR1cmF0aW9uJywgJ1RyYW5zaXRpb25FbmQnXSxcblx0dHJhbnNmb3JtUHJvcHMgPSBbJ3JvdGF0ZScsICdyb3RhdGV4JywgJ3JvdGF0ZXknLCAnc2NhbGUnLCAnc2tldycsICd0cmFuc2xhdGUnLCAndHJhbnNsYXRleCcsICd0cmFuc2xhdGV5JywgJ21hdHJpeCddLFxuXG5cdGRlZmF1bHREdXJhdGlvbiA9IDQwMCxcblxuXHRlcnIgPSBmdW5jdGlvbihtc2cpe1xuXHRcdCh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIpICYmIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUuZXJyb3IgJiYgY29uc29sZS5lcnJvcihtc2cpO1xuXHR9LFxuXHRcblx0Ly9cdENhcGl0YWxpc2VcdFx0XG5cdGNhcCA9IGZ1bmN0aW9uKHN0cil7XG5cdFx0cmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zdWJzdHIoMSk7XG5cdH0sXG5cblx0Ly9cdEZvciBjaGVja2luZyB3aGF0IHZlbmRvciBwcmVmaXhlcyBhcmUgbmF0aXZlXG5cdGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuXG5cdC8vXHR2ZW5kb3IgcHJlZml4LCBpZTogdHJhbnNpdGlvbkR1cmF0aW9uIGJlY29tZXMgTW96VHJhbnNpdGlvbkR1cmF0aW9uXG5cdHZwID0gZnVuY3Rpb24gKHByb3ApIHtcblx0XHR2YXIgcGY7XG5cdFx0Ly9cdEhhbmRsZSB1bnByZWZpeGVkXG5cdFx0aWYgKHByb3AgaW4gZGl2LnN0eWxlKSB7XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9XG5cblx0XHQvL1x0SGFuZGxlIGtleWZyYW1lc1xuXHRcdGlmKHByb3AgPT0gXCJAa2V5ZnJhbWVzXCIpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0Ly9cdFRlc3RpbmcgdXNpbmcgdHJhbnNpdGlvblxuXHRcdFx0XHRwZiA9IHByZWZpeGVzW2ldICsgXCJUcmFuc2l0aW9uXCI7XG5cdFx0XHRcdGlmIChwZiBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJALVwiICsgcHJlZml4ZXNbaV0udG9Mb3dlckNhc2UoKSArIFwiLWtleWZyYW1lc1wiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJvcDtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRwZiA9IHByZWZpeGVzW2ldICsgY2FwKHByb3ApO1xuXHRcdFx0aWYgKHBmIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0XHRyZXR1cm4gcGY7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vXHRDYW4ndCBmaW5kIGl0IC0gcmV0dXJuIG9yaWdpbmFsIHByb3BlcnR5LlxuXHRcdHJldHVybiBwcm9wO1xuXHR9LFxuXG5cdC8vXHRTZWUgaWYgd2UgY2FuIHVzZSBuYXRpdmUgdHJhbnNpdGlvbnNcblx0c3VwcG9ydHNUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBiID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0XHRzID0gYi5zdHlsZSxcblx0XHRcdHAgPSAndHJhbnNpdGlvbic7XG5cblx0XHRpZiAodHlwZW9mIHNbcF0gPT0gJ3N0cmluZycpIHsgcmV0dXJuIHRydWU7IH1cblxuXHRcdC8vIFRlc3RzIGZvciB2ZW5kb3Igc3BlY2lmaWMgcHJvcFxuXHRcdHAgPSBwLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcC5zdWJzdHIoMSk7XG5cblx0XHRmb3IgKHZhciBpPTA7IGk8cHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0eXBlb2Ygc1twcmVmaXhlc1tpXSArIHBdID09ICdzdHJpbmcnKSB7IHJldHVybiB0cnVlOyB9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8vXHRDb252ZXJ0cyBDU1MgdHJhbnNpdGlvbiB0aW1lcyB0byBNU1xuXHRnZXRUaW1laW5NUyA9IGZ1bmN0aW9uKHN0cikge1xuXHRcdHZhciByZXN1bHQgPSAwLCB0bXA7XG5cdFx0c3RyICs9IFwiXCI7XG5cdFx0c3RyID0gc3RyLnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYoc3RyLmluZGV4T2YoXCJtc1wiKSAhPT0gLTEpIHtcblx0XHRcdHRtcCA9IHN0ci5zcGxpdChcIm1zXCIpO1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHRtcFswXSk7XG5cdFx0fSBlbHNlIGlmKHN0ci5pbmRleE9mKFwic1wiKSAhPT0gLTEpIHtcblx0XHRcdC8vXHRzXG5cdFx0XHR0bXAgPSBzdHIuc3BsaXQoXCJzXCIpO1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHRtcFswXSkgKiAxMDAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIoc3RyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gTWF0aC5yb3VuZChyZXN1bHQpO1xuXHR9LFxuXG5cdC8vXHRTZXQgc3R5bGUgcHJvcGVydGllc1xuXHRzZXRTdHlsZVByb3BzID0gZnVuY3Rpb24ob2JqLCBwcm9wcyl7XG5cdFx0Zm9yKHZhciBpIGluIHByb3BzKSB7aWYocHJvcHMuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdG9iai5zdHlsZVt2cChpKV0gPSBwcm9wc1tpXTtcblx0XHR9fVxuXHR9LFxuXG5cdC8vXHRTZXQgcHJvcHMgZm9yIHRyYW5zaXRpb25zIGFuZCB0cmFuc2Zvcm1zIHdpdGggYmFzaWMgZGVmYXVsdHNcblx0c2V0VHJhbnNpdGlvblByb3BzID0gZnVuY3Rpb24oYXJncyl7XG5cdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0XHQvL1x0ZWFzZSwgbGluZWFyLCBlYXNlLWluLCBlYXNlLW91dCwgZWFzZS1pbi1vdXQsIGN1YmljLWJlemllcihuLG4sbixuKSBpbml0aWFsLCBpbmhlcml0XG5cdFx0XHRcdFRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogXCJlYXNlXCIsXG5cdFx0XHRcdFRyYW5zaXRpb25EdXJhdGlvbjogZGVmYXVsdER1cmF0aW9uICsgXCJtc1wiLFxuXHRcdFx0XHRUcmFuc2l0aW9uUHJvcGVydHk6IFwiYWxsXCJcblx0XHRcdH0sXG5cdFx0XHRwLCBpLCB0bXAsIHRtcDIsIGZvdW5kO1xuXG5cdFx0Ly9cdFNldCBhbnkgYWxsb3dlZCBwcm9wZXJ0aWVzIFxuXHRcdGZvcihwIGluIGFyZ3MpIHsgaWYoYXJncy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuXHRcdFx0dG1wID0gJ1RyYW5zaXRpb24nICsgY2FwKHApO1xuXHRcdFx0dG1wMiA9IHAudG9Mb3dlckNhc2UoKTtcblx0XHRcdGZvdW5kID0gZmFsc2U7XG5cblx0XHRcdC8vXHRMb29rIGF0IHRyYW5zaXRpb24gcHJvcHNcblx0XHRcdGZvcihpID0gMDsgaSA8IHRyYW5zaXRpb25Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRpZih0bXAgPT0gdHJhbnNpdGlvblByb3BzW2ldKSB7XG5cdFx0XHRcdFx0cHJvcHNbdHJhbnNpdGlvblByb3BzW2ldXSA9IGFyZ3NbcF07XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vXHRMb29rIGF0IHRyYW5zZm9ybSBwcm9wc1xuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNmb3JtUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0aWYodG1wMiA9PSB0cmFuc2Zvcm1Qcm9wc1tpXSkge1xuXHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSA9IHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSB8fCBcIlwiO1xuXHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSArPSBcIiBcIiArcCArIFwiKFwiICsgYXJnc1twXSArIFwiKVwiO1xuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZm91bmQpIHtcblx0XHRcdFx0cHJvcHNbcF0gPSBhcmdzW3BdO1xuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHByb3BzO1xuXHR9LFxuXG5cdC8vXHRGaXggYW5pbWF0aXVvbiBwcm9wZXJ0aWVzXG5cdC8vXHROb3JtYWxpc2VzIHRyYW5zZm9ybXMsIGVnOiByb3RhdGUsIHNjYWxlLCBldGMuLi5cblx0bm9ybWFsaXNlVHJhbnNmb3JtUHJvcHMgPSBmdW5jdGlvbihhcmdzKXtcblx0XHR2YXIgcHJvcHMgPSB7fSxcblx0XHRcdHRtcFByb3AsXG5cdFx0XHRwLCBpLCBmb3VuZCxcblx0XHRcdG5vcm1hbCA9IGZ1bmN0aW9uKHByb3BzLCBwLCB2YWx1ZSl7XG5cdFx0XHRcdHZhciB0bXAgPSBwLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdFx0Zm91bmQgPSBmYWxzZSwgaTtcblxuXHRcdFx0XHQvL1x0TG9vayBhdCB0cmFuc2Zvcm0gcHJvcHNcblx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNmb3JtUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRpZih0bXAgPT0gdHJhbnNmb3JtUHJvcHNbaV0pIHtcblx0XHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSA9IHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSB8fCBcIlwiO1xuXHRcdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIildICs9IFwiIFwiICtwICsgXCIoXCIgKyB2YWx1ZSArIFwiKVwiO1xuXHRcdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIWZvdW5kKSB7XG5cdFx0XHRcdFx0cHJvcHNbcF0gPSB2YWx1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL1x0UmVtb3ZlIHRyYW5zZm9ybSBwcm9wZXJ0eVxuXHRcdFx0XHRcdGRlbGV0ZSBwcm9wc1twXTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdC8vXHRTZXQgYW55IGFsbG93ZWQgcHJvcGVydGllcyBcblx0XHRmb3IocCBpbiBhcmdzKSB7IGlmKGFyZ3MuaGFzT3duUHJvcGVydHkocCkpIHtcblx0XHRcdC8vXHRJZiB3ZSBoYXZlIGEgcGVyY2VudGFnZSwgd2UgaGF2ZSBhIGtleSBmcmFtZVxuXHRcdFx0aWYocC5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcblx0XHRcdFx0Zm9yKGkgaW4gYXJnc1twXSkgeyBpZihhcmdzW3BdLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdFx0bm9ybWFsKGFyZ3NbcF0sIGksIGFyZ3NbcF1baV0pO1xuXHRcdFx0XHR9fVxuXHRcdFx0XHRwcm9wc1twXSA9IGFyZ3NbcF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRub3JtYWwocHJvcHMsIHAsIGFyZ3NbcF0pO1xuXHRcdFx0fVxuXHRcdH19XG5cblx0XHRyZXR1cm4gcHJvcHM7XG5cdH0sXG5cblxuXHQvL1x0SWYgYW4gb2JqZWN0IGlzIGVtcHR5XG5cdGlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcblx0XHRmb3IodmFyIGkgaW4gb2JqKSB7aWYob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fX1cblx0XHRyZXR1cm4gdHJ1ZTsgXG5cdH0sXG5cdC8vXHRDcmVhdGVzIGEgaGFzaGVkIG5hbWUgZm9yIHRoZSBhbmltYXRpb25cblx0Ly9cdFVzZSB0byBjcmVhdGUgYSB1bmlxdWUga2V5ZnJhbWUgYW5pbWF0aW9uIHN0eWxlIHJ1bGVcblx0YW5pTmFtZSA9IGZ1bmN0aW9uKHByb3BzKXtcblx0XHRyZXR1cm4gXCJhbmlcIiArIEpTT04uc3RyaW5naWZ5KHByb3BzKS5zcGxpdCgvW3t9LCVcIjpdLykuam9pbihcIlwiKTtcblx0fSxcblx0YW5pbWF0aW9ucyA9IHt9LFxuXG5cdC8vXHRTZWUgaWYgd2UgY2FuIHVzZSB0cmFuc2l0aW9uc1xuXHRjYW5UcmFucyA9IHN1cHBvcnRzVHJhbnNpdGlvbnMoKTtcblxuXHQvL1x0SUUxMCsgaHR0cDovL2Nhbml1c2UuY29tLyNzZWFyY2g9Y3NzLWFuaW1hdGlvbnNcblx0bS5hbmltYXRlUHJvcGVydGllcyA9IGZ1bmN0aW9uKGVsLCBhcmdzLCBjYil7XG5cdFx0ZWwuc3R5bGUgPSBlbC5zdHlsZSB8fCB7fTtcblx0XHR2YXIgcHJvcHMgPSBzZXRUcmFuc2l0aW9uUHJvcHMoYXJncyksIHRpbWU7XG5cblx0XHRpZih0eXBlb2YgcHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uID0gZ2V0VGltZWluTVMocHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uKSArIFwibXNcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uID0gZGVmYXVsdER1cmF0aW9uICsgXCJtc1wiO1xuXHRcdH1cblxuXHRcdHRpbWUgPSBnZXRUaW1laW5NUyhwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24pIHx8IDA7XG5cblx0XHQvL1x0U2VlIGlmIHdlIHN1cHBvcnQgdHJhbnNpdGlvbnNcblx0XHRpZihjYW5UcmFucykge1xuXHRcdFx0c2V0U3R5bGVQcm9wcyhlbCwgcHJvcHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL1x0VHJ5IGFuZCBmYWxsIGJhY2sgdG8galF1ZXJ5XG5cdFx0XHQvL1x0VE9ETzogU3dpdGNoIHRvIHVzZSB2ZWxvY2l0eSwgaXQgaXMgYmV0dGVyIHN1aXRlZC5cblx0XHRcdGlmKHR5cGVvZiAkICE9PSAndW5kZWZpbmVkJyAmJiAkLmZuICYmICQuZm4uYW5pbWF0ZSkge1xuXHRcdFx0XHQkKGVsKS5hbmltYXRlKHByb3BzLCB0aW1lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihjYil7XG5cdFx0XHRzZXRUaW1lb3V0KGNiLCB0aW1lKzEpO1xuXHRcdH1cblx0fTtcblxuXHQvL1x0VHJpZ2dlciBhIHRyYW5zaXRpb24gYW5pbWF0aW9uXG5cdG0udHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvcHRpb25zLCBjYil7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV07XG5cdFx0aWYoIWFuaSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmdW5jdGlvbihlKXtcblx0XHRcdHZhciBhcmdzID0gYW5pLmZuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJz8gdmFsdWUoKTogdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9cdEFsbG93IG92ZXJyaWRlIHZpYSBvcHRpb25zXG5cdFx0XHRmb3IoaSBpbiBvcHRpb25zKSBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0XHRhcmdzW2ldID0gb3B0aW9uc1tpXTtcblx0XHRcdH19XG5cblx0XHRcdG0uYW5pbWF0ZVByb3BlcnRpZXMoZS50YXJnZXQsIGFyZ3MsIGNiKTtcblx0XHR9O1xuXHR9O1xuXG5cdC8vXHRBZGRzIGFuIGFuaW1hdGlvbiBmb3IgYmluZGluZ3MgYW5kIHNvIG9uLlxuXHRtLmFkZEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGZuLCBvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmKGFuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgYWxyZWFkeSBkZWZpbmVkLlwiKTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgaXMgYmVpbmcgYWRkZWQgYXMgYSB0cmFuc2l0aW9uIGJhc2VkIGFuaW1hdGlvbiwgYW5kIG11c3QgdXNlIGEgZnVuY3Rpb24uXCIpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMuZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIHx8IGRlZmF1bHREdXJhdGlvbjtcblxuXHRcdGFuaW1hdGlvbnNbbmFtZV0gPSB7XG5cdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0Zm46IGZuXG5cdFx0fTtcblxuXHRcdC8vXHRBZGQgYSBkZWZhdWx0IGJpbmRpbmcgZm9yIHRoZSBuYW1lXG5cdFx0bS5hZGRCaW5kaW5nKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0bS5iaW5kQW5pbWF0aW9uKG5hbWUsIHRoaXMsIGZuLCBwcm9wKTtcblx0XHR9LCB0cnVlKTtcblx0fTtcblxuXHRtLmFkZEtGQW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSwgYXJnLCBvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmKGFuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgYWxyZWFkeSBkZWZpbmVkLlwiKTtcblx0XHR9XG5cblx0XHR2YXIgaW5pdCA9IGZ1bmN0aW9uKHByb3BzKSB7XG5cdFx0XHR2YXIgYW5pSWQgPSBhbmlOYW1lKHByb3BzKSxcblx0XHRcdFx0aGFzQW5pID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pSWQpLFxuXHRcdFx0XHRrZjtcblxuXHRcdFx0Ly9cdE9ubHkgaW5zZXJ0IG9uY2Vcblx0XHRcdGlmKCFoYXNBbmkpIHtcblx0XHRcdFx0YW5pbWF0aW9uc1tuYW1lXS5pZCA9IGFuaUlkO1xuXG5cdFx0XHRcdHByb3BzID0gbm9ybWFsaXNlVHJhbnNmb3JtUHJvcHMocHJvcHMpO1xuXHRcdFx0XHQvLyAgQ3JlYXRlIGtleWZyYW1lc1xuXHRcdFx0XHRrZiA9IHZwKFwiQGtleWZyYW1lc1wiKSArIFwiIFwiICsgYW5pSWQgKyBcIiBcIiArIEpTT04uc3RyaW5naWZ5KHByb3BzKVxuXHRcdFx0XHRcdC5zcGxpdChcIlxcXCJcIikuam9pbihcIlwiKVxuXHRcdFx0XHRcdC5zcGxpdChcIn0sXCIpLmpvaW4oXCJ9XFxuXCIpXG5cdFx0XHRcdFx0LnNwbGl0KFwiLFwiKS5qb2luKFwiO1wiKVxuXHRcdFx0XHRcdC5zcGxpdChcIiU6XCIpLmpvaW4oXCIlIFwiKTtcblxuXHRcdFx0XHR2YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdFx0XHRcdHMuc2V0QXR0cmlidXRlKCdpZCcsIGFuaUlkKTtcblx0XHRcdFx0cy5pZCA9IGFuaUlkO1xuXHRcdFx0XHRzLnRleHRDb250ZW50ID0ga2Y7XG5cdFx0XHRcdC8vICBNaWdodCBub3QgaGF2ZSBoZWFkP1xuXHRcdFx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHMpO1xuXHRcdFx0fVxuXG5cdFx0XHRhbmltYXRpb25zW25hbWVdLmlzSW5pdGlhbGlzZWQgPSB0cnVlO1xuXHRcdFx0YW5pbWF0aW9uc1tuYW1lXS5vcHRpb25zLmFuaW1hdGVJbW1lZGlhdGVseSA9IHRydWU7XG5cdFx0fTtcblxuXHRcdG9wdGlvbnMuZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIHx8IGRlZmF1bHREdXJhdGlvbjtcblx0XHRvcHRpb25zLmFuaW1hdGVJbW1lZGlhdGVseSA9IG9wdGlvbnMuYW5pbWF0ZUltbWVkaWF0ZWx5IHx8IGZhbHNlO1xuXG5cdFx0YW5pbWF0aW9uc1tuYW1lXSA9IHtcblx0XHRcdGluaXQ6IGluaXQsXG5cdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0YXJnOiBhcmdcblx0XHR9O1xuXG5cdFx0Ly9cdEFkZCBhIGRlZmF1bHQgYmluZGluZyBmb3IgdGhlIG5hbWVcblx0XHRtLmFkZEJpbmRpbmcobmFtZSwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0XHRtLmJpbmRBbmltYXRpb24obmFtZSwgdGhpcywgYXJnLCBwcm9wKTtcblx0XHR9LCB0cnVlKTtcblx0fTtcblxuXG5cdC8qXHRPcHRpb25zIC0gZGVmYXVsdHMgLSB3aGF0IGl0IGRvZXM6XG5cblx0XHREZWxheSAtIHVuZWRlZmluZWQgLSBkZWxheXMgdGhlIGFuaW1hdGlvblxuXHRcdERpcmVjdGlvbiAtIFxuXHRcdER1cmF0aW9uXG5cdFx0RmlsbE1vZGUgLSBcImZvcndhcmRcIiBtYWtlcyBzdXJlIGl0IHN0aWNrczogaHR0cDovL3d3dy53M3NjaG9vbHMuY29tL2Nzc3JlZi9jc3MzX3ByX2FuaW1hdGlvbi1maWxsLW1vZGUuYXNwXG5cdFx0SXRlcmF0aW9uQ291bnQsIFxuXHRcdE5hbWUsIFBsYXlTdGF0ZSwgVGltaW5nRnVuY3Rpb25cblx0XG5cdCovXG5cblx0Ly9cdFVzZWZ1bCB0byBrbm93LCAndG8nIGFuZCAnZnJvbSc6IGh0dHA6Ly9sZWEudmVyb3UubWUvMjAxMi8xMi9hbmltYXRpb25zLXdpdGgtb25lLWtleWZyYW1lL1xuXHRtLmFuaW1hdGVLRiA9IGZ1bmN0aW9uKG5hbWUsIGVsLCBvcHRpb25zLCBjYil7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV0sIGksIHByb3BzID0ge307XG5cdFx0aWYoIWFuaSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdC8vXHRBbGxvdyBvdmVycmlkZSB2aWEgb3B0aW9uc1xuXHRcdGFuaS5vcHRpb25zID0gYW5pLm9wdGlvbnMgfHwge307XG5cdFx0Zm9yKGkgaW4gb3B0aW9ucykgaWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdGFuaS5vcHRpb25zW2ldID0gb3B0aW9uc1tpXTtcblx0XHR9fVxuXG5cdFx0aWYoIWFuaS5pc0luaXRpYWxpc2VkICYmIGFuaS5pbml0KSB7XG5cdFx0XHRhbmkuaW5pdChhbmkuYXJnKTtcblx0XHR9XG5cblx0XHQvL1x0QWxsb3cgYW5pbWF0ZSBvdmVycmlkZXNcblx0XHRmb3IoaSBpbiBhbmkub3B0aW9ucykgaWYoYW5pLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRwcm9wc1t2cChcImFuaW1hdGlvblwiICsgY2FwKGkpKV0gPSBhbmkub3B0aW9uc1tpXTtcblx0XHR9fVxuXG5cdFx0Ly9cdFNldCByZXF1aXJlZCBpdGVtcyBhbmQgZGVmYXVsdCB2YWx1ZXMgZm9yIHByb3BzXG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25OYW1lXCIpXSA9IGFuaS5pZDtcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXSA9IChwcm9wc1t2cChcImFuaW1hdGlvbkR1cmF0aW9uXCIpXT8gcHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV06IGRlZmF1bHREdXJhdGlvbikgKyBcIm1zXCI7XG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25EZWxheVwiKV0gPSBwcm9wc1t2cChcImFuaW1hdGlvbkRlbGF5XCIpXT8gcHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV0gKyBcIm1zXCI6IHVuZGVmaW5lZDtcblx0XHRwcm9wc1t2cChcImFuaW1hdGlvbkZpbGxNb2RlXCIpXSA9IHByb3BzW3ZwKFwiYW5pbWF0aW9uRmlsbE1vZGVcIildIHx8IFwiZm9yd2FyZHNcIjtcblxuXHRcdGVsLnN0eWxlID0gZWwuc3R5bGUgfHwge307XG5cblx0XHQvL1x0VXNlIGZvciBjYWxsYmFja1xuXHRcdHZhciBlbmRBbmkgPSBmdW5jdGlvbigpe1xuXHRcdFx0Ly9cdFJlbW92ZSBsaXN0ZW5lclxuXHRcdFx0ZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFuaW1hdGlvbmVuZFwiLCBlbmRBbmksIGZhbHNlKTtcblx0XHRcdGlmKGNiKXtcblx0XHRcdFx0Y2IoZWwpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL1x0UmVtb3ZlIGFuaW1hdGlvbiBpZiBhbnlcblx0XHRlbC5zdHlsZVt2cChcImFuaW1hdGlvblwiKV0gPSBcIlwiO1xuXHRcdGVsLnN0eWxlW3ZwKFwiYW5pbWF0aW9uTmFtZVwiKV0gPSBcIlwiO1xuXG5cdFx0Ly9cdE11c3QgdXNlIHR3byByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSBjYWxscywgZm9yIEZGIHRvXG5cdFx0Ly9cdHdvcmsgcHJvcGVybHksIGRvZXMgbm90IHNlZW0gdG8gaGF2ZSBhbnkgYWR2ZXJzZSBlZmZlY3RzXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7XG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKXtcblx0XHRcdFx0Ly9cdEFwcGx5IHByb3BzXG5cdFx0XHRcdGZvcihpIGluIHByb3BzKSBpZihwcm9wcy5oYXNPd25Qcm9wZXJ0eShpKSkge3tcblx0XHRcdFx0XHRlbC5zdHlsZVtpXSA9IHByb3BzW2ldO1xuXHRcdFx0XHR9fVxuXG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgZW5kQW5pLCBmYWxzZSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fTtcblxuXHRtLnRyaWdnZXJLRiA9IGZ1bmN0aW9uKG5hbWUsIG9wdGlvbnMpe1xuXHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0bS5hbmltYXRlS0YobmFtZSwgdGhpcywgb3B0aW9ucyk7XG5cdFx0fTtcblx0fTtcblxuXHRtLmJpbmRBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lLCBlbCwgb3B0aW9ucywgcHJvcCkge1xuXHRcdHZhciBhbmkgPSBhbmltYXRpb25zW25hbWVdO1xuXG5cdFx0aWYoIWFuaSAmJiAhYW5pLm5hbWUpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgbm90IGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHRpZihhbmkuZm4pIHtcblx0XHRcdG0uYW5pbWF0ZVByb3BlcnRpZXMoZWwsIGFuaS5mbihwcm9wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBvbGRDb25maWcgPSBlbC5jb25maWc7XG5cdFx0XHRlbC5jb25maWcgPSBmdW5jdGlvbihlbCwgaXNJbml0KXtcblx0XHRcdFx0aWYoIWFuaS5pc0luaXRpYWxpc2VkICYmIGFuaS5pbml0KSB7XG5cdFx0XHRcdFx0YW5pLmluaXQob3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYocHJvcCgpICYmIGlzSW5pdCkge1xuXHRcdFx0XHRcdG0uYW5pbWF0ZUtGKG5hbWUsIGVsLCBvcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihvbGRDb25maWcpIHtcblx0XHRcdFx0XHRvbGRDb25maWcuYXBwbHkoZWwsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXG5cblxuXHQvKiBEZWZhdWx0IHRyYW5zZm9ybTJkIGJpbmRpbmdzICovXG5cdHZhciBiYXNpY0JpbmRpbmdzID0gWydzY2FsZScsICdzY2FsZXgnLCAnc2NhbGV5JywgJ3RyYW5zbGF0ZScsICd0cmFuc2xhdGV4JywgJ3RyYW5zbGF0ZXknLCBcblx0XHQnbWF0cml4JywgJ2JhY2tncm91bmRDb2xvcicsICdiYWNrZ3JvdW5kUG9zaXRpb24nLCAnYm9yZGVyQm90dG9tQ29sb3InLCBcblx0XHQnYm9yZGVyQm90dG9tV2lkdGgnLCAnYm9yZGVyTGVmdENvbG9yJywgJ2JvcmRlckxlZnRXaWR0aCcsICdib3JkZXJSaWdodENvbG9yJywgXG5cdFx0J2JvcmRlclJpZ2h0V2lkdGgnLCAnYm9yZGVyU3BhY2luZycsICdib3JkZXJUb3BDb2xvcicsICdib3JkZXJUb3BXaWR0aCcsICdib3R0b20nLCBcblx0XHQnY2xpcCcsICdjb2xvcicsICdmb250U2l6ZScsICdmb250V2VpZ2h0JywgJ2hlaWdodCcsICdsZWZ0JywgJ2xldHRlclNwYWNpbmcnLCBcblx0XHQnbGluZUhlaWdodCcsICdtYXJnaW5Cb3R0b20nLCAnbWFyZ2luTGVmdCcsICdtYXJnaW5SaWdodCcsICdtYXJnaW5Ub3AnLCAnbWF4SGVpZ2h0JywgXG5cdFx0J21heFdpZHRoJywgJ21pbkhlaWdodCcsICdtaW5XaWR0aCcsICdvcGFjaXR5JywgJ291dGxpbmVDb2xvcicsICdvdXRsaW5lV2lkdGgnLCBcblx0XHQncGFkZGluZ0JvdHRvbScsICdwYWRkaW5nTGVmdCcsICdwYWRkaW5nUmlnaHQnLCAncGFkZGluZ1RvcCcsICdyaWdodCcsICd0ZXh0SW5kZW50JywgXG5cdFx0J3RleHRTaGFkb3cnLCAndG9wJywgJ3ZlcnRpY2FsQWxpZ24nLCAndmlzaWJpbGl0eScsICd3aWR0aCcsICd3b3JkU3BhY2luZycsICd6SW5kZXgnXSxcblx0XHRkZWdCaW5kaW5ncyA9IFsncm90YXRlJywgJ3JvdGF0ZXgnLCAncm90YXRleScsICdza2V3eCcsICdza2V3eSddLCBpO1xuXG5cdC8vXHRCYXNpYyBiaW5kaW5ncyB3aGVyZSB3ZSBwYXNzIHRoZSBwcm9wIHN0cmFpZ2h0IHRocm91Z2hcblx0Zm9yKGkgPSAwOyBpIDwgYmFzaWNCaW5kaW5ncy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdChmdW5jdGlvbihuYW1lKXtcblx0XHRcdG0uYWRkQW5pbWF0aW9uKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0XHR2YXIgb3B0aW9ucyA9IHt9O1xuXHRcdFx0XHRvcHRpb25zW25hbWVdID0gcHJvcCgpO1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9ucztcblx0XHRcdH0pO1xuXHRcdH0oYmFzaWNCaW5kaW5nc1tpXSkpO1xuXHR9XG5cblx0Ly9cdERlZ3JlZSBiYXNlZCBiaW5kaW5ncyAtIGNvbmRpdGlvbmFsbHkgcG9zdGZpeCB3aXRoIFwiZGVnXCJcblx0Zm9yKGkgPSAwOyBpIDwgZGVnQmluZGluZ3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHQoZnVuY3Rpb24obmFtZSl7XG5cdFx0XHRtLmFkZEFuaW1hdGlvbihuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdFx0dmFyIG9wdGlvbnMgPSB7fSwgdmFsdWUgPSBwcm9wKCk7XG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSBpc05hTih2YWx1ZSk/IHZhbHVlOiB2YWx1ZSArIFwiZGVnXCI7XG5cdFx0XHRcdHJldHVybiBvcHRpb25zO1xuXHRcdFx0fSk7XG5cdFx0fShkZWdCaW5kaW5nc1tpXSkpO1xuXHR9XG5cblx0Ly9cdEF0dHJpYnV0ZXMgdGhhdCByZXF1aXJlIG1vcmUgdGhhbiBvbmUgcHJvcFxuXHRtLmFkZEFuaW1hdGlvbihcInNrZXdcIiwgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dmFyIHZhbHVlID0gcHJvcCgpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRza2V3OiBbXG5cdFx0XHRcdHZhbHVlWzBdICsgKGlzTmFOKHZhbHVlWzBdKT8gXCJcIjpcImRlZ1wiKSwgXG5cdFx0XHRcdHZhbHVlWzFdICsgKGlzTmFOKHZhbHVlWzFdKT8gXCJcIjpcImRlZ1wiKVxuXHRcdFx0XVxuXHRcdH07XG5cdH0pO1xuXG5cblxuXHQvL1x0QSBmZXcgbW9yZSBiaW5kaW5nc1xuXHRtID0gbSB8fCB7fTtcblx0Ly9cdEhpZGUgbm9kZVxuXHRtLmFkZEJpbmRpbmcoXCJoaWRlXCIsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdHRoaXMuc3R5bGUgPSB7XG5cdFx0XHRkaXNwbGF5OiBtLnVud3JhcChwcm9wKT8gXCJub25lXCIgOiBcIlwiXG5cdFx0fTtcblx0fSwgdHJ1ZSk7XG5cblx0Ly9cdFRvZ2dsZSBib29sZWFuIHZhbHVlIG9uIGNsaWNrXG5cdG0uYWRkQmluZGluZygndG9nZ2xlJywgZnVuY3Rpb24ocHJvcCl7XG5cdFx0dGhpcy5vbmNsaWNrID0gZnVuY3Rpb24oKXtcblx0XHRcdHZhciB2YWx1ZSA9IHByb3AoKTtcblx0XHRcdHByb3AoIXZhbHVlKTtcblx0XHR9XG5cdH0sIHRydWUpO1xuXG5cdC8vXHRTZXQgaG92ZXIgc3RhdGVzLCBhJ2xhIGpRdWVyeSBwYXR0ZXJuXG5cdG0uYWRkQmluZGluZygnaG92ZXInLCBmdW5jdGlvbihwcm9wKXtcblx0XHR0aGlzLm9ubW91c2VvdmVyID0gcHJvcFswXTtcblx0XHRpZihwcm9wWzFdKSB7XG5cdFx0XHR0aGlzLm9ubW91c2VvdXQgPSBwcm9wWzFdO1xuXHRcdH1cblx0fSwgdHJ1ZSApO1xuXG5cbn07XG5cblxuXG5cblxuXG5cbmlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdG1vZHVsZS5leHBvcnRzID0gbWl0aHJpbEFuaW1hdGU7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG5cdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbWl0aHJpbEFuaW1hdGU7XG5cdH0pO1xufSBlbHNlIHtcblx0bWl0aHJpbEFuaW1hdGUodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiPyB3aW5kb3cubSB8fCB7fToge30pO1xufVxuXG59KCkpOyIsIi8qXG5cdG1pdGhyaWwuYW5pbWF0ZSAtIENvcHlyaWdodCAyMDE0IGpzZ3V5XG5cdE1JVCBMaWNlbnNlZC5cbiovXG4oZnVuY3Rpb24oKXtcblxudmFyIG1pdGhyaWxBbmltYXRlID0gZnVuY3Rpb24gKG0pIHtcblx0Ly9cdEtub3duIHByZWZpZXhcblx0dmFyIHByZWZpeGVzID0gWydNb3onLCAnV2Via2l0JywgJ0todG1sJywgJ08nLCAnbXMnXSxcblx0dHJhbnNpdGlvblByb3BzID0gWydUcmFuc2l0aW9uUHJvcGVydHknLCAnVHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uJywgJ1RyYW5zaXRpb25EZWxheScsICdUcmFuc2l0aW9uRHVyYXRpb24nLCAnVHJhbnNpdGlvbkVuZCddLFxuXHR0cmFuc2Zvcm1Qcm9wcyA9IFsncm90YXRlJywgJ3JvdGF0ZXgnLCAncm90YXRleScsICdzY2FsZScsICdza2V3JywgJ3RyYW5zbGF0ZScsICd0cmFuc2xhdGV4JywgJ3RyYW5zbGF0ZXknLCAnbWF0cml4J10sXG5cblx0ZGVmYXVsdER1cmF0aW9uID0gNDAwLFxuXG5cdGVyciA9IGZ1bmN0aW9uKG1zZyl7XG5cdFx0dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuY29uc29sZSAmJiBjb25zb2xlLmVycm9yICYmIGNvbnNvbGUuZXJyb3IobXNnKTtcblx0fSxcblx0XG5cdC8vXHRDYXBpdGFsaXNlXHRcdFxuXHRjYXAgPSBmdW5jdGlvbihzdHIpe1xuXHRcdHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc3Vic3RyKDEpO1xuXHR9LFxuXG5cdC8vXHRGb3IgY2hlY2tpbmcgd2hhdCB2ZW5kb3IgcHJlZml4ZXMgYXJlIG5hdGl2ZVxuXHRkaXYgPSB0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCI/XG5cdFx0ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk6XG5cdFx0bnVsbCxcblxuXHQvL1x0dmVuZG9yIHByZWZpeCwgaWU6IHRyYW5zaXRpb25EdXJhdGlvbiBiZWNvbWVzIE1velRyYW5zaXRpb25EdXJhdGlvblxuXHR2cCA9IGZ1bmN0aW9uIChwcm9wLCBkYXNoZWQpIHtcblx0XHR2YXIgcGY7XG5cdFx0Ly9cdEhhbmRsZSB1bnByZWZpeGVkXG5cdFx0aWYgKCFkaXYgfHwgcHJvcCBpbiBkaXYuc3R5bGUpIHtcblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH1cblxuXHRcdC8vXHRIYW5kbGUga2V5ZnJhbWVzXG5cdFx0aWYocHJvcCA9PSBcIkBrZXlmcmFtZXNcIikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHQvL1x0VGVzdGluZyB1c2luZyB0cmFuc2l0aW9uXG5cdFx0XHRcdHBmID0gcHJlZml4ZXNbaV0gKyBcIlRyYW5zaXRpb25cIjtcblx0XHRcdFx0aWYgKHBmIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0XHRcdHJldHVybiBcIkAtXCIgKyBwcmVmaXhlc1tpXS50b0xvd2VyQ2FzZSgpICsgXCIta2V5ZnJhbWVzXCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwcm9wO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdGlmKGRhc2hlZCkge1xuXHRcdFx0XHRwZiA9IFwiLVwiICsocHJlZml4ZXNbaV0gKyBcIi1cIiArIHByb3ApLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwZiA9IHByZWZpeGVzW2ldICsgY2FwKHByb3ApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBmIGluIGRpdi5zdHlsZSkge1xuXHRcdFx0XHRyZXR1cm4gcGY7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vXHRDYW4ndCBmaW5kIGl0IC0gcmV0dXJuIG9yaWdpbmFsIHByb3BlcnR5LlxuXHRcdHJldHVybiBwcm9wO1xuXHR9LFxuXG5cdC8vXHRTZWUgaWYgd2UgY2FuIHVzZSBuYXRpdmUgdHJhbnNpdGlvbnNcblx0c3VwcG9ydHNUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmKHR5cGVvZiBkb2N1bWVudCA9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHZhciBiID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG5cdFx0XHRzID0gYi5zdHlsZSxcblx0XHRcdHAgPSAndHJhbnNpdGlvbic7XG5cblx0XHRpZiAodHlwZW9mIHNbcF0gPT0gJ3N0cmluZycpIHsgcmV0dXJuIHRydWU7IH1cblxuXHRcdC8vIFRlc3RzIGZvciB2ZW5kb3Igc3BlY2lmaWMgcHJvcFxuXHRcdHAgPSBwLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcC5zdWJzdHIoMSk7XG5cblx0XHRmb3IgKHZhciBpPTA7IGk8cHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0eXBlb2Ygc1twcmVmaXhlc1tpXSArIHBdID09ICdzdHJpbmcnKSB7IHJldHVybiB0cnVlOyB9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8vXHRDb252ZXJ0cyBDU1MgdHJhbnNpdGlvbiB0aW1lcyB0byBNU1xuXHRnZXRUaW1laW5NUyA9IGZ1bmN0aW9uKHN0cikge1xuXHRcdHZhciByZXN1bHQgPSAwLCB0bXA7XG5cdFx0c3RyICs9IFwiXCI7XG5cdFx0c3RyID0gc3RyLnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYoc3RyLmluZGV4T2YoXCJtc1wiKSAhPT0gLTEpIHtcblx0XHRcdHRtcCA9IHN0ci5zcGxpdChcIm1zXCIpO1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHRtcFswXSk7XG5cdFx0fSBlbHNlIGlmKHN0ci5pbmRleE9mKFwic1wiKSAhPT0gLTEpIHtcblx0XHRcdC8vXHRzXG5cdFx0XHR0bXAgPSBzdHIuc3BsaXQoXCJzXCIpO1xuXHRcdFx0cmVzdWx0ID0gTnVtYmVyKHRtcFswXSkgKiAxMDAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBOdW1iZXIoc3RyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gTWF0aC5yb3VuZChyZXN1bHQpO1xuXHR9LFxuXG5cdC8vXHRTZXQgc3R5bGUgcHJvcGVydGllc1xuXHRzZXRTdHlsZVByb3BzID0gZnVuY3Rpb24ob2JqLCBwcm9wcyl7XG5cdFx0Zm9yKHZhciBpIGluIHByb3BzKSB7aWYocHJvcHMuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdG9iai5zdHlsZVt2cChpKV0gPSBwcm9wc1tpXTtcblx0XHR9fVxuXHR9LFxuXG5cdC8vXHRTZXQgcHJvcHMgZm9yIHRyYW5zaXRpb25zIGFuZCB0cmFuc2Zvcm1zIHdpdGggYmFzaWMgZGVmYXVsdHNcblx0c2V0VHJhbnNpdGlvblByb3BzID0gZnVuY3Rpb24oYXJncyl7XG5cdFx0dmFyIHByb3BzID0ge1xuXHRcdFx0XHQvL1x0ZWFzZSwgbGluZWFyLCBlYXNlLWluLCBlYXNlLW91dCwgZWFzZS1pbi1vdXQsIGN1YmljLWJlemllcihuLG4sbixuKSBpbml0aWFsLCBpbmhlcml0XG5cdFx0XHRcdFRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogXCJlYXNlXCIsXG5cdFx0XHRcdFRyYW5zaXRpb25EdXJhdGlvbjogZGVmYXVsdER1cmF0aW9uICsgXCJtc1wiLFxuXHRcdFx0XHRUcmFuc2l0aW9uUHJvcGVydHk6IFwiYWxsXCJcblx0XHRcdH0sXG5cdFx0XHRwLCBpLCB0bXAsIHRtcDIsIGZvdW5kO1xuXG5cdFx0Ly9cdFNldCBhbnkgYWxsb3dlZCBwcm9wZXJ0aWVzIFxuXHRcdGZvcihwIGluIGFyZ3MpIHsgaWYoYXJncy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuXHRcdFx0dG1wID0gJ1RyYW5zaXRpb24nICsgY2FwKHApO1xuXHRcdFx0dG1wMiA9IHAudG9Mb3dlckNhc2UoKTtcblx0XHRcdGZvdW5kID0gZmFsc2U7XG5cblx0XHRcdC8vXHRMb29rIGF0IHRyYW5zaXRpb24gcHJvcHNcblx0XHRcdGZvcihpID0gMDsgaSA8IHRyYW5zaXRpb25Qcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRpZih0bXAgPT0gdHJhbnNpdGlvblByb3BzW2ldKSB7XG5cdFx0XHRcdFx0cHJvcHNbdHJhbnNpdGlvblByb3BzW2ldXSA9IGFyZ3NbcF07XG5cdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vXHRMb29rIGF0IHRyYW5zZm9ybSBwcm9wc1xuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNmb3JtUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0aWYodG1wMiA9PSB0cmFuc2Zvcm1Qcm9wc1tpXSkge1xuXHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSA9IHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSB8fCBcIlwiO1xuXHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIpXSArPSBcIiBcIiArcCArIFwiKFwiICsgYXJnc1twXSArIFwiKVwiO1xuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighZm91bmQpIHtcblx0XHRcdFx0cHJvcHNbcF0gPSBhcmdzW3BdO1xuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHByb3BzO1xuXHR9LFxuXG5cdC8vXHRGaXggYW5pbWF0aXVvbiBwcm9wZXJ0aWVzXG5cdC8vXHROb3JtYWxpc2VzIHRyYW5zZm9ybXMsIGVnOiByb3RhdGUsIHNjYWxlLCBldGMuLi5cblx0bm9ybWFsaXNlVHJhbnNmb3JtUHJvcHMgPSBmdW5jdGlvbihhcmdzKXtcblx0XHR2YXIgcHJvcHMgPSB7fSxcblx0XHRcdHRtcFByb3AsXG5cdFx0XHRwLCBpLCBmb3VuZCxcblx0XHRcdG5vcm1hbCA9IGZ1bmN0aW9uKHByb3BzLCBwLCB2YWx1ZSl7XG5cdFx0XHRcdHZhciB0bXAgPSBwLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdFx0Zm91bmQgPSBmYWxzZSwgaTtcblxuXHRcdFx0XHQvL1x0TG9vayBhdCB0cmFuc2Zvcm0gcHJvcHNcblx0XHRcdFx0Zm9yKGkgPSAwOyBpIDwgdHJhbnNmb3JtUHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRpZih0bXAgPT0gdHJhbnNmb3JtUHJvcHNbaV0pIHtcblx0XHRcdFx0XHRcdHByb3BzW3ZwKFwidHJhbnNmb3JtXCIsIHRydWUpXSA9IHByb3BzW3ZwKFwidHJhbnNmb3JtXCIsIHRydWUpXSB8fCBcIlwiO1xuXHRcdFx0XHRcdFx0cHJvcHNbdnAoXCJ0cmFuc2Zvcm1cIiwgdHJ1ZSldICs9IFwiIFwiICtwICsgXCIoXCIgKyB2YWx1ZSArIFwiKVwiO1xuXHRcdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIWZvdW5kKSB7XG5cdFx0XHRcdFx0cHJvcHNbcF0gPSB2YWx1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL1x0UmVtb3ZlIHRyYW5zZm9ybSBwcm9wZXJ0eVxuXHRcdFx0XHRcdGRlbGV0ZSBwcm9wc1twXTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdC8vXHRTZXQgYW55IGFsbG93ZWQgcHJvcGVydGllcyBcblx0XHRmb3IocCBpbiBhcmdzKSB7IGlmKGFyZ3MuaGFzT3duUHJvcGVydHkocCkpIHtcblx0XHRcdC8vXHRJZiB3ZSBoYXZlIGEgcGVyY2VudGFnZSwgd2UgaGF2ZSBhIGtleSBmcmFtZVxuXHRcdFx0aWYocC5pbmRleE9mKFwiJVwiKSAhPT0gLTEpIHtcblx0XHRcdFx0Zm9yKGkgaW4gYXJnc1twXSkgeyBpZihhcmdzW3BdLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdFx0bm9ybWFsKGFyZ3NbcF0sIGksIGFyZ3NbcF1baV0pO1xuXHRcdFx0XHR9fVxuXHRcdFx0XHRwcm9wc1twXSA9IGFyZ3NbcF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRub3JtYWwocHJvcHMsIHAsIGFyZ3NbcF0pO1xuXHRcdFx0fVxuXHRcdH19XG5cblx0XHRyZXR1cm4gcHJvcHM7XG5cdH0sXG5cblxuXHQvL1x0SWYgYW4gb2JqZWN0IGlzIGVtcHR5XG5cdGlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcblx0XHRmb3IodmFyIGkgaW4gb2JqKSB7aWYob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fX1cblx0XHRyZXR1cm4gdHJ1ZTsgXG5cdH0sXG5cdC8vXHRDcmVhdGVzIGEgaGFzaGVkIG5hbWUgZm9yIHRoZSBhbmltYXRpb25cblx0Ly9cdFVzZSB0byBjcmVhdGUgYSB1bmlxdWUga2V5ZnJhbWUgYW5pbWF0aW9uIHN0eWxlIHJ1bGVcblx0YW5pTmFtZSA9IGZ1bmN0aW9uKHByb3BzKXtcblx0XHRyZXR1cm4gXCJhbmlcIiArIEpTT04uc3RyaW5naWZ5KHByb3BzKS5zcGxpdCgvW3t9LCVcIjpdLykuam9pbihcIlwiKTtcblx0fSxcblx0YW5pbWF0aW9ucyA9IHt9LFxuXG5cdC8vXHRTZWUgaWYgd2UgY2FuIHVzZSB0cmFuc2l0aW9uc1xuXHRjYW5UcmFucyA9IHN1cHBvcnRzVHJhbnNpdGlvbnMoKTtcblxuXHQvL1x0SUUxMCsgaHR0cDovL2Nhbml1c2UuY29tLyNzZWFyY2g9Y3NzLWFuaW1hdGlvbnNcblx0bS5hbmltYXRlUHJvcGVydGllcyA9IGZ1bmN0aW9uKGVsLCBhcmdzLCBjYil7XG5cdFx0ZWwuc3R5bGUgPSBlbC5zdHlsZSB8fCB7fTtcblx0XHR2YXIgcHJvcHMgPSBzZXRUcmFuc2l0aW9uUHJvcHMoYXJncyksIHRpbWU7XG5cblx0XHRpZih0eXBlb2YgcHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uID0gZ2V0VGltZWluTVMocHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uKSArIFwibXNcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcHMuVHJhbnNpdGlvbkR1cmF0aW9uID0gZGVmYXVsdER1cmF0aW9uICsgXCJtc1wiO1xuXHRcdH1cblxuXHRcdHRpbWUgPSBnZXRUaW1laW5NUyhwcm9wcy5UcmFuc2l0aW9uRHVyYXRpb24pIHx8IDA7XG5cblx0XHQvL1x0U2VlIGlmIHdlIHN1cHBvcnQgdHJhbnNpdGlvbnNcblx0XHRpZihjYW5UcmFucykge1xuXHRcdFx0c2V0U3R5bGVQcm9wcyhlbCwgcHJvcHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL1x0VHJ5IGFuZCBmYWxsIGJhY2sgdG8galF1ZXJ5XG5cdFx0XHQvL1x0VE9ETzogU3dpdGNoIHRvIHVzZSB2ZWxvY2l0eSwgaXQgaXMgYmV0dGVyIHN1aXRlZC5cblx0XHRcdGlmKHR5cGVvZiAkICE9PSAndW5kZWZpbmVkJyAmJiAkLmZuICYmICQuZm4uYW5pbWF0ZSkge1xuXHRcdFx0XHQkKGVsKS5hbmltYXRlKHByb3BzLCB0aW1lKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihjYil7XG5cdFx0XHRzZXRUaW1lb3V0KGNiLCB0aW1lKzEpO1xuXHRcdH1cblx0fTtcblxuXHQvL1x0VHJpZ2dlciBhIHRyYW5zaXRpb24gYW5pbWF0aW9uXG5cdG0udHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvcHRpb25zLCBjYil7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dmFyIGFuaSA9IGFuaW1hdGlvbnNbbmFtZV07XG5cdFx0aWYoIWFuaSkge1xuXHRcdFx0cmV0dXJuIGVycihcIkFuaW1hdGlvbiBcIiArIG5hbWUgKyBcIiBub3QgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmdW5jdGlvbihlKXtcblx0XHRcdHZhciBhcmdzID0gYW5pLmZuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJz8gdmFsdWUoKTogdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9cdEFsbG93IG92ZXJyaWRlIHZpYSBvcHRpb25zXG5cdFx0XHRmb3IoaSBpbiBvcHRpb25zKSBpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0XHRhcmdzW2ldID0gb3B0aW9uc1tpXTtcblx0XHRcdH19XG5cblx0XHRcdG0uYW5pbWF0ZVByb3BlcnRpZXMoZS50YXJnZXQsIGFyZ3MsIGNiKTtcblx0XHR9O1xuXHR9O1xuXG5cdC8vXHRBZGRzIGFuIGFuaW1hdGlvbiBmb3IgYmluZGluZ3MgYW5kIHNvIG9uLlxuXHRtLmFkZEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGZuLCBvcHRpb25zKXtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGlmKGFuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgYWxyZWFkeSBkZWZpbmVkLlwiKTtcblx0XHR9IGVsc2UgaWYodHlwZW9mIGZuICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgaXMgYmVpbmcgYWRkZWQgYXMgYSB0cmFuc2l0aW9uIGJhc2VkIGFuaW1hdGlvbiwgYW5kIG11c3QgdXNlIGEgZnVuY3Rpb24uXCIpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMuZHVyYXRpb24gPSB0eXBlb2Ygb3B0aW9ucy5kdXJhdGlvbiAhPT0gXCJ1bmRlZmluZWRcIj9cblx0XHRcdG9wdGlvbnMuZHVyYXRpb246XG5cdFx0XHRkZWZhdWx0RHVyYXRpb247XG5cblx0XHRhbmltYXRpb25zW25hbWVdID0ge1xuXHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdGZuOiBmblxuXHRcdH07XG5cblx0XHQvL1x0QWRkIGEgZGVmYXVsdCBiaW5kaW5nIGZvciB0aGUgbmFtZVxuXHRcdG0uYWRkQmluZGluZyhuYW1lLCBmdW5jdGlvbihwcm9wKXtcblx0XHRcdG0uYmluZEFuaW1hdGlvbihuYW1lLCB0aGlzLCBmbiwgcHJvcCk7XG5cdFx0fSwgdHJ1ZSk7XG5cdH07XG5cblx0bS5hZGRLRkFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIGFyZywgb3B0aW9ucyl7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRpZihhbmltYXRpb25zW25hbWVdKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIGFscmVhZHkgZGVmaW5lZC5cIik7XG5cdFx0fVxuXG5cdFx0dmFyIGluaXQgPSBmdW5jdGlvbihwcm9wcykge1xuXHRcdFx0dmFyIGFuaUlkID0gYW5pTmFtZShwcm9wcyksXG5cdFx0XHRcdGhhc0FuaSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuaUlkKSxcblx0XHRcdFx0a2Y7XG5cblx0XHRcdC8vXHRPbmx5IGluc2VydCBvbmNlXG5cdFx0XHRpZighaGFzQW5pKSB7XG5cdFx0XHRcdGFuaW1hdGlvbnNbbmFtZV0uaWQgPSBhbmlJZDtcblxuXHRcdFx0XHRwcm9wcyA9IG5vcm1hbGlzZVRyYW5zZm9ybVByb3BzKHByb3BzKTtcblx0XHRcdFx0Ly8gIENyZWF0ZSBrZXlmcmFtZXNcblx0XHRcdFx0a2YgPSB2cChcIkBrZXlmcmFtZXNcIikgKyBcIiBcIiArIGFuaUlkICsgXCIgXCIgKyBKU09OLnN0cmluZ2lmeShwcm9wcylcblx0XHRcdFx0XHQuc3BsaXQoXCJcXFwiXCIpLmpvaW4oXCJcIilcblx0XHRcdFx0XHQuc3BsaXQoXCJ9LFwiKS5qb2luKFwifVxcblwiKVxuXHRcdFx0XHRcdC5zcGxpdChcIixcIikuam9pbihcIjtcIilcblx0XHRcdFx0XHQuc3BsaXQoXCIlOlwiKS5qb2luKFwiJSBcIik7XG5cblx0XHRcdFx0dmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdFx0XHRzLnNldEF0dHJpYnV0ZSgnaWQnLCBhbmlJZCk7XG5cdFx0XHRcdHMuaWQgPSBhbmlJZDtcblx0XHRcdFx0cy50ZXh0Q29udGVudCA9IGtmO1xuXHRcdFx0XHQvLyAgTWlnaHQgbm90IGhhdmUgaGVhZD9cblx0XHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzKTtcblx0XHRcdH1cblxuXHRcdFx0YW5pbWF0aW9uc1tuYW1lXS5pc0luaXRpYWxpc2VkID0gdHJ1ZTtcblx0XHRcdGFuaW1hdGlvbnNbbmFtZV0ub3B0aW9ucy5hbmltYXRlSW1tZWRpYXRlbHkgPSB0cnVlO1xuXHRcdH07XG5cblx0XHRvcHRpb25zLmR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiB8fCBkZWZhdWx0RHVyYXRpb247XG5cdFx0b3B0aW9ucy5hbmltYXRlSW1tZWRpYXRlbHkgPSBvcHRpb25zLmFuaW1hdGVJbW1lZGlhdGVseSB8fCBmYWxzZTtcblxuXHRcdGFuaW1hdGlvbnNbbmFtZV0gPSB7XG5cdFx0XHRpbml0OiBpbml0LFxuXHRcdFx0b3B0aW9uczogb3B0aW9ucyxcblx0XHRcdGFyZzogYXJnXG5cdFx0fTtcblxuXHRcdC8vXHRBZGQgYSBkZWZhdWx0IGJpbmRpbmcgZm9yIHRoZSBuYW1lXG5cdFx0bS5hZGRCaW5kaW5nKG5hbWUsIGZ1bmN0aW9uKHByb3Ape1xuXHRcdFx0bS5iaW5kQW5pbWF0aW9uKG5hbWUsIHRoaXMsIGFyZywgcHJvcCk7XG5cdFx0fSwgdHJ1ZSk7XG5cdH07XG5cblxuXHQvKlx0T3B0aW9ucyAtIGRlZmF1bHRzIC0gd2hhdCBpdCBkb2VzOlxuXG5cdFx0RGVsYXkgLSB1bmVkZWZpbmVkIC0gZGVsYXlzIHRoZSBhbmltYXRpb25cblx0XHREaXJlY3Rpb24gLSBcblx0XHREdXJhdGlvblxuXHRcdEZpbGxNb2RlIC0gXCJmb3J3YXJkXCIgbWFrZXMgc3VyZSBpdCBzdGlja3M6IGh0dHA6Ly93d3cudzNzY2hvb2xzLmNvbS9jc3NyZWYvY3NzM19wcl9hbmltYXRpb24tZmlsbC1tb2RlLmFzcFxuXHRcdEl0ZXJhdGlvbkNvdW50LCBcblx0XHROYW1lLCBQbGF5U3RhdGUsIFRpbWluZ0Z1bmN0aW9uXG5cdFxuXHQqL1xuXG5cdC8vXHRVc2VmdWwgdG8ga25vdywgJ3RvJyBhbmQgJ2Zyb20nOiBodHRwOi8vbGVhLnZlcm91Lm1lLzIwMTIvMTIvYW5pbWF0aW9ucy13aXRoLW9uZS1rZXlmcmFtZS9cblx0bS5hbmltYXRlS0YgPSBmdW5jdGlvbihuYW1lLCBlbCwgb3B0aW9ucywgY2Ipe1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHZhciBhbmkgPSBhbmltYXRpb25zW25hbWVdLCBpLCBwcm9wcyA9IHt9O1xuXHRcdGlmKCFhbmkpIHtcblx0XHRcdHJldHVybiBlcnIoXCJBbmltYXRpb24gXCIgKyBuYW1lICsgXCIgbm90IGZvdW5kLlwiKTtcblx0XHR9XG5cblx0XHQvL1x0QWxsb3cgb3ZlcnJpZGUgdmlhIG9wdGlvbnNcblx0XHRhbmkub3B0aW9ucyA9IGFuaS5vcHRpb25zIHx8IHt9O1xuXHRcdGZvcihpIGluIG9wdGlvbnMpIGlmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRhbmkub3B0aW9uc1tpXSA9IG9wdGlvbnNbaV07XG5cdFx0fX1cblxuXHRcdGlmKCFhbmkuaXNJbml0aWFsaXNlZCAmJiBhbmkuaW5pdCkge1xuXHRcdFx0YW5pLmluaXQoYW5pLmFyZyk7XG5cdFx0fVxuXG5cdFx0Ly9cdEFsbG93IGFuaW1hdGUgb3ZlcnJpZGVzXG5cdFx0Zm9yKGkgaW4gYW5pLm9wdGlvbnMpIGlmKGFuaS5vcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7e1xuXHRcdFx0cHJvcHNbdnAoXCJhbmltYXRpb25cIiArIGNhcChpKSldID0gYW5pLm9wdGlvbnNbaV07XG5cdFx0fX1cblxuXHRcdC8vXHRTZXQgcmVxdWlyZWQgaXRlbXMgYW5kIGRlZmF1bHQgdmFsdWVzIGZvciBwcm9wc1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uTmFtZVwiKV0gPSBhbmkuaWQ7XG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV0gPSAocHJvcHNbdnAoXCJhbmltYXRpb25EdXJhdGlvblwiKV0/IHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildOiBkZWZhdWx0RHVyYXRpb24pICsgXCJtc1wiO1xuXHRcdHByb3BzW3ZwKFwiYW5pbWF0aW9uRGVsYXlcIildID0gcHJvcHNbdnAoXCJhbmltYXRpb25EZWxheVwiKV0/IHByb3BzW3ZwKFwiYW5pbWF0aW9uRHVyYXRpb25cIildICsgXCJtc1wiOiB1bmRlZmluZWQ7XG5cdFx0cHJvcHNbdnAoXCJhbmltYXRpb25GaWxsTW9kZVwiKV0gPSBwcm9wc1t2cChcImFuaW1hdGlvbkZpbGxNb2RlXCIpXSB8fCBcImZvcndhcmRzXCI7XG5cblx0XHRlbC5zdHlsZSA9IGVsLnN0eWxlIHx8IHt9O1xuXG5cdFx0Ly9cdFVzZSBmb3IgY2FsbGJhY2tcblx0XHR2YXIgZW5kQW5pID0gZnVuY3Rpb24oKXtcblx0XHRcdC8vXHRSZW1vdmUgbGlzdGVuZXJcblx0XHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgZW5kQW5pLCBmYWxzZSk7XG5cdFx0XHRpZihjYil7XG5cdFx0XHRcdGNiKGVsKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly9cdFJlbW92ZSBhbmltYXRpb24gaWYgYW55XG5cdFx0ZWwuc3R5bGVbdnAoXCJhbmltYXRpb25cIildID0gXCJcIjtcblx0XHRlbC5zdHlsZVt2cChcImFuaW1hdGlvbk5hbWVcIildID0gXCJcIjtcblxuXHRcdC8vXHRNdXN0IHVzZSB0d28gcmVxdWVzdCBhbmltYXRpb24gZnJhbWUgY2FsbHMsIGZvciBGRiB0b1xuXHRcdC8vXHR3b3JrIHByb3Blcmx5LCBkb2VzIG5vdCBzZWVtIHRvIGhhdmUgYW55IGFkdmVyc2UgZWZmZWN0c1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdC8vXHRBcHBseSBwcm9wc1xuXHRcdFx0XHRmb3IoaSBpbiBwcm9wcykgaWYocHJvcHMuaGFzT3duUHJvcGVydHkoaSkpIHt7XG5cdFx0XHRcdFx0ZWwuc3R5bGVbaV0gPSBwcm9wc1tpXTtcblx0XHRcdFx0fX1cblxuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwiYW5pbWF0aW9uZW5kXCIsIGVuZEFuaSwgZmFsc2UpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH07XG5cblx0bS50cmlnZ2VyS0YgPSBmdW5jdGlvbihuYW1lLCBvcHRpb25zKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdG0uYW5pbWF0ZUtGKG5hbWUsIHRoaXMsIG9wdGlvbnMpO1xuXHRcdH07XG5cdH07XG5cblx0bS5iaW5kQW5pbWF0aW9uID0gZnVuY3Rpb24obmFtZSwgZWwsIG9wdGlvbnMsIHByb3ApIHtcblx0XHR2YXIgYW5pID0gYW5pbWF0aW9uc1tuYW1lXTtcblxuXHRcdGlmKCFhbmkgJiYgIWFuaS5uYW1lKSB7XG5cdFx0XHRyZXR1cm4gZXJyKFwiQW5pbWF0aW9uIFwiICsgbmFtZSArIFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0aWYoYW5pLmZuKSB7XG5cdFx0XHRtLmFuaW1hdGVQcm9wZXJ0aWVzKGVsLCBhbmkuZm4ocHJvcCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgb2xkQ29uZmlnID0gZWwuY29uZmlnO1xuXHRcdFx0ZWwuY29uZmlnID0gZnVuY3Rpb24oZWwsIGlzSW5pdCl7XG5cdFx0XHRcdGlmKCFhbmkuaXNJbml0aWFsaXNlZCAmJiBhbmkuaW5pdCkge1xuXHRcdFx0XHRcdGFuaS5pbml0KG9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHByb3AoKSAmJiBpc0luaXQpIHtcblx0XHRcdFx0XHRtLmFuaW1hdGVLRihuYW1lLCBlbCwgb3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYob2xkQ29uZmlnKSB7XG5cdFx0XHRcdFx0b2xkQ29uZmlnLmFwcGx5KGVsLCBhcmd1bWVudHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0fTtcblxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBtaXRocmlsQW5pbWF0ZTtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBtaXRocmlsQW5pbWF0ZTtcblx0fSk7XG59IGVsc2Uge1xuXHRtaXRocmlsQW5pbWF0ZSh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCI/IHdpbmRvdy5tIHx8IHt9OiB7fSk7XG59XG5cbn0oKSk7IiwiLy8gIFNtb290aCBzY3JvbGxpbmcgZm9yIGxpbmtzXG4vLyAgVXNhZ2U6ICAgICAgQSh7Y29uZmlnOiBzbW9vdGhTY3JvbGwoY3RybCksIGhyZWY6IFwiI3RvcFwifSwgXCJCYWNrIHRvIHRvcFwiKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjdHJsKXtcblx0Ly92YXIgcm9vdCA9ICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKT8gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ6IHRoaXMsXG5cdHZhciByb290ID0gKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKT8gL2ZpcmVmb3h8dHJpZGVudC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiBkb2N1bWVudC5ib2R5OiBudWxsLFxuXHRcdGVhc2VJbk91dFNpbmUgPSBmdW5jdGlvbiAodCwgYiwgYywgZCkge1xuXHRcdFx0Ly8gIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuXHRcdFx0cmV0dXJuIC1jLzIgKiAoTWF0aC5jb3MoTWF0aC5QSSp0L2QpIC0gMSkgKyBiO1xuXHRcdH07XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpIHtcblx0XHRpZighaXNJbml0aWFsaXplZCkge1xuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHR2YXIgc3RhcnRUaW1lLFxuXHRcdFx0XHRcdHN0YXJ0UG9zID0gcm9vdC5zY3JvbGxUb3AsXG5cdFx0XHRcdFx0ZW5kUG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoL1teI10rJC8uZXhlYyh0aGlzLmhyZWYpWzBdKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AsXG5cdFx0XHRcdFx0aGFzaCA9IHRoaXMuaHJlZi5zdWJzdHIodGhpcy5ocmVmLmxhc3RJbmRleE9mKFwiI1wiKSksXG5cdFx0XHRcdFx0bWF4U2Nyb2xsID0gcm9vdC5zY3JvbGxIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQsXG5cdFx0XHRcdFx0c2Nyb2xsRW5kVmFsdWUgPSAoc3RhcnRQb3MgKyBlbmRQb3MgPCBtYXhTY3JvbGwpPyBlbmRQb3M6IG1heFNjcm9sbCAtIHN0YXJ0UG9zLFxuXHRcdFx0XHRcdGR1cmF0aW9uID0gdHlwZW9mIGN0cmwuZHVyYXRpb24gIT09ICd1bmRlZmluZWQnPyBjdHJsLmR1cmF0aW9uOiAxNTAwLFxuXHRcdFx0XHRcdHNjcm9sbEZ1bmMgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcblx0XHRcdFx0XHRcdHN0YXJ0VGltZSA9IHN0YXJ0VGltZSB8fCB0aW1lc3RhbXA7XG5cdFx0XHRcdFx0XHR2YXIgZWxhcHNlZCA9IHRpbWVzdGFtcCAtIHN0YXJ0VGltZSxcblx0XHRcdFx0XHRcdFx0cHJvZ3Jlc3MgPSBlYXNlSW5PdXRTaW5lKGVsYXBzZWQsIHN0YXJ0UG9zLCBzY3JvbGxFbmRWYWx1ZSwgZHVyYXRpb24pO1xuXHRcdFx0XHRcdFx0cm9vdC5zY3JvbGxUb3AgPSBwcm9ncmVzcztcblx0XHRcdFx0XHRcdGlmKGVsYXBzZWQgPCBkdXJhdGlvbikge1xuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsRnVuYyk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZihoaXN0b3J5LnB1c2hTdGF0ZSkge1xuXHRcdFx0XHRcdFx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGxGdW5jKVxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHtcIkFwaS5tZFwiOlwiPHA+VGhlIGRhdGEgYXBpcyBpbiBtaXNvIGFyZSBhIHdheSB0byBjcmVhdGUgYSBSRVNUZnVsIGVuZHBvaW50IHRoYXQgeW91IGNhbiBpbnRlcmFjdCB3aXRoIHZpYSBhbiBlYXN5IHRvIHVzZSBBUEkuPC9wPlxcbjxibG9ja3F1b3RlPlxcbk5vdGU6IHlvdSBtdXN0IGVuYWJsZSB5b3VyIGFwaSBieSBhZGRpbmcgaXQgdG8gdGhlICZxdW90O2FwaSZxdW90OyBhdHRyaWJ1dGUgaW4gdGhlIDxjb2RlPi9jZmcvc2VydmVyLmRldmVsb3BtZW50Lmpzb248L2NvZGU+IGZpbGUsIG9yIHdoYXRldmVyIGVudmlyb25tZW50IHlvdSBhcmUgdXNpbmcuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxoMj48YSBuYW1lPVxcXCJob3ctZG9lcy1hbi1hcGktd29yay1cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctZG9lcy1hbi1hcGktd29yay1cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SG93IGRvZXMgYW4gYXBpIHdvcms/PC9zcGFuPjwvYT48L2gyPjxwPlRoZSBhcGlzIGluIG1pc28gZG8gYSBudW1iZXIgb2YgdGhpbmdzOjwvcD5cXG48dWw+XFxuPGxpPkFsbG93IGRhdGFiYXNlIGFjY2VzcyB2aWEgYSB0aGluIHdyYXBwZXIsIGZvciBleGFtcGxlIHRvIGFjY2VzcyBtb25nb2RiLCB3ZSB3cmFwIHRoZSBwb3B1bGFyIDxhIGhyZWY9XFxcIi9kb2MvbW9uZ29vc2UubWRcXFwiPm1vbmdvb3NlIG5wbTwvYT4gT0RNIHBhY2thZ2U8L2xpPlxcbjxsaT5XYWl0cyB0aWxsIG1pdGhyaWwgaXMgcmVhZHkgLSBtaXRocmlsIGhhcyBhIHVuaXF1ZSBmZWF0dXJlIGVuc3VyZXMgdGhlIHZpZXcgZG9lc24mIzM5O3QgcmVuZGVyIHRpbGwgZGF0YSBoYXMgYmVlbiByZXRyaWV2ZWQgLSB0aGUgYXBpIG1ha2VzIHN1cmUgd2UgYWRoZXJlIHRvIHRoaXM8L2xpPlxcbjxsaT5BcGlzIGNhbiB3b3JrIGFzIGEgcHJveHksIHNvIGlmIHlvdSB3YW50IHRvIGFjY2VzcyBhIDNyZCBwYXJ0eSBzZXJ2aWNlLCBhbiBhcGkgaXMgYSBnb29kIHdheSB0byBkbyB0aGF0IC0geW91IGNhbiB0aGVuIGFsc28gYnVpbGQgaW4gY2FjaGluZywgb3IgYW55IG90aGVyIGZlYXR1cmVzIHlvdSBtYXkgd2lzaCB0byBhZGQuPC9saT5cXG48bGk+QXBpcyBjYW4gYmUgcmVzdHJpY3RlZCBieSBwZXJtaXNzaW9ucyAoY29taW5nIHNvb24pIDwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiaG93LXNob3VsZC15b3UtdXNlLWFwaXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctc2hvdWxkLXlvdS11c2UtYXBpc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ib3cgc2hvdWxkIHlvdSB1c2UgYXBpczwvc3Bhbj48L2E+PC9oMj48cD5UaGVyZSBhcmUgbnVtZXJvdXMgc2NlbmFyaW9zIHdoZXJlIHlvdSBtaWdodCB3YW50IHRvIHVzZSBhbiBhcGk6PC9wPlxcbjx1bD5cXG48bGk+Rm9yIGRhdGFiYXNlIGFjY2VzcyAobWlzbyBjb21lcyB3aXRoIGEgYnVuY2ggb2YgZGF0YWJhc2UgYXBpcyk8L2xpPlxcbjxsaT5Gb3IgY2FsbGluZyAzcmQgcGFydHkgZW5kLXBvaW50cyAtIHVzaW5nIGFuIGFwaSB3aWxsIGFsbG93IHlvdSB0byBjcmVhdGUgY2FjaGluZyBhbmQgc2V0dXAgcGVybWlzc2lvbnMgb24gdGhlIGVuZC1wb2ludDwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiZXh0ZW5kaW5nLWFuLWV4aXN0aW5nLWFwaVxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2V4dGVuZGluZy1hbi1leGlzdGluZy1hcGlcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RXh0ZW5kaW5nIGFuIGV4aXN0aW5nIGFwaTwvc3Bhbj48L2E+PC9oMj48cD5JZiB5b3Ugd2FudCB0byBhZGQgeW91ciBvd24gbWV0aG9kcyB0byBhbiBhcGksIHlvdSBjYW4gc2ltcGx5IGV4dGVuZCBvbmUgb2YgdGhlIGV4aXN0aW5nIGFwaXMsIGZvciBleGFtcGxlLCB0byBleHRlbmQgdGhlIDxjb2RlPmZsYXRmaWxlZGI8L2NvZGU+IEFQSSwgY3JlYXRlIGEgbmV3IGRpcmVjdG9yeSBhbmQgZmlsZSBpbiA8Y29kZT4vbW9kdWxlcy9hcGkvYWRhcHQvYWRhcHQuYXBpLmpzPC9jb2RlPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgZGIgPSByZXF1aXJlKCYjMzk7Li4vLi4vLi4vc3lzdGVtL2FwaS9mbGF0ZmlsZWRiL2ZsYXRmaWxlZGIuYXBpLmpzJiMzOTspO1xcblxcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XFxuICAgIHZhciBhZCA9IGRiKG0pO1xcbiAgICBhZC5oZWxsbyA9IGZ1bmN0aW9uKGNiLCBlcnIsIGFyZ3MsIHJlcSl7XFxuICAgICAgICBjYigmcXVvdDt3b3JsZCZxdW90Oyk7XFxuICAgIH07XFxuICAgIHJldHVybiBhZDtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIGFkZCB0aGUgYXBpIHRvIHRoZSA8Y29kZT4vY2ZnL3NlcnZlci5kZXZlbG9wbWVudC5qc29uPC9jb2RlPiBmaWxlIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+JnF1b3Q7YXBpJnF1b3Q7OiAmcXVvdDthZGFwdCZxdW90O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGVuIHJlcXVpcmUgdGhlIG5ldyBhcGkgZmlsZSBpbiB5b3VyIG12YyBmaWxlIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIgPSByZXF1aXJlKCYjMzk7Li4vbW9kdWxlcy9hcGkvYWRhcHQvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+WW91IGNhbiBub3cgYWRkIGFuIGFwaSBjYWxsIGluIHRoZSBjb250cm9sbGVyIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+ZGIuaGVsbG8oe30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuLy8gZG8gc29tZXRoaW5nIHdpdGggZGF0YS5yZXN1bHRcXG59KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIGFyZ3VtZW50cyB0byBlYWNoIGFwaSBlbmRwb2ludCBtdXN0IGJlIHRoZSBzYW1lLCBpZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpXFxuPC9jb2RlPjwvcHJlPlxcbjxwPldoZXJlOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+QXJndW1lbnQ8L3RoPlxcbjx0aD5QdXJwb3NlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+Y2I8L3RkPlxcbjx0ZD5BIGNhbGxiYWNrIHlvdSBtdXN0IGNhbGwgd2hlbiB5b3UgYXJlIGRvbmUgLSBhbnkgZGF0YSB5b3UgcmV0dXJuIHdpbGwgYmUgYXZhaWxhYmxlIG9uIDxjb2RlPmRhdGEucmVzdWx0PC9jb2RlPiBpbiB0aGUgcmVzcG9uc2U8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5lcnI8L3RkPlxcbjx0ZD5BIGNhbGxiYWNrIHlvdSBtdXN0IGNhbGwgaWYgYW4gdW5yZWNvdmVyYWJsZSBlcnJvciBvY2N1cnJlZCwgZWc6ICZxdW90O2RhdGFiYXNlIGNvbm5lY3Rpb24gdGltZW91dCZxdW90Oy4gRG8gbm90IHVzZSBmb3IgdGhpbmdzIGxpa2UgJnF1b3Q7bm8gZGF0YSBmb3VuZCZxdW90OzwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPmFyZ3M8L3RkPlxcbjx0ZD5BIHNldCBvZiBhcmd1bWVudHMgcGFzc2VkIGluIHRvIHRoZSBhcGkgbWV0aG9kPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+cmVxPC90ZD5cXG48dGQ+VGhlIHJlcXVlc3Qgb2JqZWN0IGZyb20gdGhlIHJlcXVlc3Q8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlRoZSBjb21wbGV0ZSBtdmMgZXhhbXBsZSBsb29rcyBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9hZGFwdC9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7YWRhcHRfaWQmIzM5OywgcGFyYW1zKTtcXG5cXG4gICAgICAgIGRiLmhlbGxvKHt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIGN0cmwubW9kZWwud2hvKGRhdGEucmVzdWx0KTtcXG4gICAgICAgIH0pO1xcblxcbiAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBESVYoJnF1b3Q7RyYjMzk7ZGF5ICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPGgyPjxhIG5hbWU9XFxcImNyZWF0aW5nLWN1c3RvbS1hcGlzXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY3JlYXRpbmctY3VzdG9tLWFwaXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q3JlYXRpbmcgY3VzdG9tIGFwaXM8L3NwYW4+PC9hPjwvaDI+PHA+WW91IGNhbiBhZGQgeW91ciBvd24gY3VzdG9tIGFwaXMgaW4gdGhlIDxjb2RlPi9tb2R1bGVzL2FwaXM8L2NvZGU+IGRpcmVjdG9yeSwgdGhleSBoYXZlIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgaW5jbHVkZWQgYXBpcywgaGVyZSBpcyBhbiBleGFtcGxlIGFwaSB0aGF0IGNhbGxzIHRoZSBmbGlja3IgQVBJOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICAgIGVuZHBvaW50IGFwaSB0byBtYWtlIGh0dHAgcmVxdWVzdHMgdmlhIGZsaWNrclxcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgmIzM5O3JlcXVlc3QmIzM5OyksXFxuICAgIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vLi4vLi4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KSxcXG4gICAgLy8gICAgUGFyc2Ugb3V0IHRoZSB1bndhbnRlZCBwYXJ0cyBvZiB0aGUganNvblxcbiAgICAvLyAgICB0eXBpY2FsbHkgdGhpcyB3b3VsZCBiZSBydW4gb24gdGhlIGNsaWVudFxcbiAgICAvLyAgICB3ZSBydW4gdGhpcyB1c2luZyAmcXVvdDtyZXF1ZXN0JnF1b3Q7IG9uICB0aGUgc2VydmVyLCBzb1xcbiAgICAvLyAgICBubyBuZWVkIGZvciB0aGUganNvbnAgY2FsbGJhY2tcXG4gICAganNvblBhcnNlciA9IGZ1bmN0aW9uKGpzb25wRGF0YSl7XFxuICAgICAgICB2YXIganNvbiwgc3RhcnRQb3MsIGVuZFBvcztcXG4gICAgICAgIHRyeSB7XFxuICAgICAgICAgICAgc3RhcnRQb3MgPSBqc29ucERhdGEuaW5kZXhPZigmIzM5Oyh7JiMzOTspO1xcbiAgICAgICAgICAgIGVuZFBvcyA9IGpzb25wRGF0YS5sYXN0SW5kZXhPZigmIzM5O30pJiMzOTspO1xcbiAgICAgICAgICAgIGpzb24gPSBqc29ucERhdGFcXG4gICAgICAgICAgICAgICAgLnN1YnN0cmluZyhzdGFydFBvcysxLCBlbmRQb3MrMSlcXG4gICAgICAgICAgICAgICAgLnNwbGl0KCZxdW90O1xcXFxuJnF1b3Q7KS5qb2luKCZxdW90OyZxdW90OylcXG4gICAgICAgICAgICAgICAgLnNwbGl0KCZxdW90O1xcXFxcXFxcJiMzOTsmcXVvdDspLmpvaW4oJnF1b3Q7JiMzOTsmcXVvdDspO1xcblxcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pO1xcbiAgICAgICAgfSBjYXRjaChleCkge1xcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCZxdW90O0VSUk9SJnF1b3Q7LCBleCk7XFxuICAgICAgICAgICAgcmV0dXJuICZxdW90O3t9JnF1b3Q7O1xcbiAgICAgICAgfVxcbiAgICB9O1xcblxcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXRpbHMpe1xcbiAgICByZXR1cm4ge1xcbiAgICAgICAgcGhvdG9zOiBmdW5jdGlvbihjYiwgZXJyLCBhcmdzLCByZXEpe1xcbiAgICAgICAgICAgIGFyZ3MgPSBhcmdzIHx8IHt9O1xcbiAgICAgICAgICAgIHZhciB1cmwgPSAmcXVvdDtodHRwOi8vYXBpLmZsaWNrci5jb20vc2VydmljZXMvZmVlZHMvcGhvdG9zX3B1YmxpYy5nbmU/Zm9ybWF0PWpzb24mcXVvdDs7XFxuICAgICAgICAgICAgLy8gICAgQWRkIHBhcmFtZXRlcnNcXG4gICAgICAgICAgICB1cmwgKz0gbWlzby5lYWNoKGFyZ3MsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gJnF1b3Q7JmFtcDsmcXVvdDsgKyBrZXkgKyAmcXVvdDs9JnF1b3Q7ICsgdmFsdWU7XFxuICAgICAgICAgICAgfSk7XFxuXFxuICAgICAgICAgICAgcmVxdWVzdCh1cmwsIGZ1bmN0aW9uIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpIHtcXG4gICAgICAgICAgICAgICAgaWYgKCFlcnJvciAmYW1wOyZhbXA7IHJlc3BvbnNlLnN0YXR1c0NvZGUgPT0gMjAwKSB7XFxuICAgICAgICAgICAgICAgICAgICBjYihqc29uUGFyc2VyKGJvZHkpKTtcXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgICAgICAgICAgICAgIGVycihlcnJvcik7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9KTtcXG4gICAgICAgIH1cXG4gICAgfTtcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UbyB1c2UgaXQgaW4geW91ciBtdmMgZmlsZSwgc2ltcGx5OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmZsaWNrciA9IHJlcXVpcmUoJiMzOTsuLi9tb2R1bGVzL2FwaS9mbGlja3IvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHRoZW4gY2FsbCBpdCBsaWtlIHNvIGluIHlvdXIgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5mbGlja3IucGhvdG9zKHt0YWdzOiAmcXVvdDtTeWRuZXkgb3BlcmEgaG91c2UmcXVvdDssIHRhZ21vZGU6ICZxdW90O2FueSZxdW90O30pLnRoZW4oZnVuY3Rpb24oZGF0YSl7XFxuICAgIGN0cmwubW9kZWwuZmxpY2tyRGF0YShkYXRhLnJlc3VsdC5pdGVtcyk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcblwiLFwiQXV0aGVudGljYXRpb24ubWRcIjpcIjxoMj48YSBuYW1lPVxcXCJhdXRoZW50aWNhdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2F1dGhlbnRpY2F0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkF1dGhlbnRpY2F0aW9uPC9zcGFuPjwvYT48L2gyPjxwPkF1dGhlbnRpY2F0aW9uIGlzIHRoZSBwcm9jZXNzIG9mIG1ha2luZyBzdXJlIGEgdXNlciBpcyB3aG8gdGhleSBzYXkgdGhleSBhcmUgLSB1c3VhbGx5IHRoaXMgaXMgZG9uZSBieSB1c2luZyBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCwgYnV0IGl0IGNhbiBhbHNvIGJlIGRvbmUgdmlhIGFuIGFjY2VzcyB0b2tlbiwgM3JkLXBhcnR5IHNlcnZpY2VzIHN1Y2ggYXMgT0F1dGgsIG9yIHNvbWV0aGluZyBsaWtlIE9wZW5JRCwgb3IgaW5kZWVkIEdvb2dsZSwgRmFjZWJvb2ssIEdpdEhVYiwgZXRjLi4uPC9wPlxcbjxwPkluIG1pc28sIHRoZSBhdXRoZW50aWNhdGlvbiBmZWF0dXJlIGhhczo8L3A+XFxuPHVsPlxcbjxsaT5UaGUgYWJpbGl0eSB0byBzZWUgaWYgdGhlIHVzZXIgaGFzIGxvZ2dlZCBpbiAodmlhIGEgc2VjcmV0IHZhbHVlIG9uIHRoZSBzZXJ2ZXItc2lkZSBzZXNzaW9uKTwvbGk+XFxuPGxpPlRoZSBhYmlsaXR5IHRvIHJlZGlyZWN0IHRvIGEgbG9naW4gcGFnZSBpZiB0aGV5IGhhdmVuJiMzOTt0IGxvZ2dlZCBpbjwvbGk+XFxuPC91bD5cXG48cD5Zb3UgY2FuIGNvbmZpZ3VyZSB0aGUgYXV0aGVudGljYXRpb24gaW4gPGNvZGU+L2NmZy9zZXJ2ZXIuanNvbjwvY29kZT4sIGFuZCBzZXQgdGhlIGF1dGhlbnRpY2F0aW9uIGF0dHJpYnV0ZSBvbiB0aGUgYWN0aW9uIHRoYXQgcmVxdWlyZXMgaXQuPC9wPlxcbjxwPkZvciBleGFtcGxlLCBpbiA8Y29kZT4vY2ZnL3NlcnZlci5qc29uPC9jb2RlPiwgeW91IGNhbiBzZXQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+JnF1b3Q7YXV0aGVudGljYXRpb24mcXVvdDs6IHtcXG4gICAgJnF1b3Q7ZW5hYmxlZCZxdW90OzogdHJ1ZSxcXG4gICAgJnF1b3Q7YWxsJnF1b3Q7OiBmYWxzZSxcXG4gICAgJnF1b3Q7c2VjcmV0JnF1b3Q7OiAmcXVvdDtpbS1zby1taXNvJnF1b3Q7LFxcbiAgICAmcXVvdDtzdHJhdGVneSZxdW90OzogJnF1b3Q7ZGVmYXVsdCZxdW90OyxcXG4gICAgJnF1b3Q7bG9naW5VcmxQYXR0ZXJuJnF1b3Q7OiAmcXVvdDsvbG9naW4/dXJsPVtPUklHSU5BTFVSTF0mcXVvdDtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPldoZXJlOjwvcD5cXG48dWw+XFxuPGxpPjxzdHJvbmc+ZW5hYmxlZDwvc3Ryb25nPiB3aWxsIGVuYWJsZSBvdXIgYXV0aGVudGljYXRpb24gYmVoYXZpb3VyPC9saT5cXG48bGk+PHN0cm9uZz5hbGw8L3N0cm9uZz4gd2lsbCBzZXQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIGF1dGhlbnRpY2F0aW9uIGZvciBhbGwgYWN0aW9ucywgZGVmYXVsdCBpcyAmcXVvdDtmYWxzZSZxdW90OywgaWU6IG5vIGF1dGhlbnRpY2F0aW9uIHJlcXVpcmVkPC9saT5cXG48bGk+PHN0cm9uZz5zZWNyZXQ8L3N0cm9uZz4gaXMgdGhlIHNlY3JldCB2YWx1ZSB0aGF0IGlzIHNldCBvbiB0aGUgc2Vzc2lvbjwvbGk+XFxuPGxpPjxzdHJvbmc+bG9naW5VcmxQYXR0ZXJuPC9zdHJvbmc+IGlzIGEgVVJMIHBhdHRlcm4gd2hlcmUgd2Ugd2lsbCBzdWJzdGl0dXRlICZxdW90O1tPUklHSU5BTFVSTF0mcXVvdDsgZm9yIHRoZSBvcmlnaW5hbGx5IHJlcXVlc3RlZCBVUkwuPC9saT5cXG48bGk+PHN0cm9uZz5taWRkbGV3YXJlPC9zdHJvbmc+IGlzIHRoZSBhdXRoZW50aWNhdGlvbiBtaWRkbGV3YXJlIHRvIHVzZSwgZGVmYXVsdCBpcyAmcXVvdDsuLi9zeXN0ZW0vYXV0aF9taWRkbGUmcXVvdDs8L2xpPlxcbjwvdWw+XFxuPHA+Tm93LCBpZiB5b3Ugd2FudCBhIHBhcnRpY3VsYXIgYWN0aW9uIHRvIGJlIGF1dGhlbnRpY2F0ZWQsIHlvdSBjYW4gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgKGFsbCkgdmFsdWUgaW4gZWFjaCBvZiB5b3VyIGFjdGlvbnMsIGZvciBleGFtcGxlIHRvIG5lZWQgYXV0aGVudGljYXRpb24gb24gdGhlIDxjb2RlPmluZGV4PC9jb2RlPiBhY3Rpb24gb2YgeW91ciB0b2RvcyBhcHAsIHNldDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgLi4uLFxcbiAgICBhdXRoZW50aWNhdGU6IHRydWVcXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlICZxdW90O2FsbCZxdW90OyBhdHRyaWJ1dGUgZm9ybSB0aGUgc2VydmVyIGNvbmZpZyBhdXRoZW50aWNhdGlvbiBhbmQgbWFrZSBhdXRoZW50aWNhdGlvbiByZXF1aXJlZCBvbiB0aGlzIGFjdGlvbi5cXG5JZiB5b3VyIGFwcCBpcyBtYWlubHkgYSBzZWN1cmUgYXBwLCB5b3UmIzM5O2xsIHdhbnQgdG8gc2V0ICZxdW90O2FsbCZxdW90OyBhdHRyaWJ1dGUgdG8gdHJ1ZSBhbmQgb3ZlcnJpZGUgdGhlICZxdW90O2xvZ2luJnF1b3Q7IGFuZCwgKGlmIHlvdSBoYXZlIG9uZSksIHRoZSAmcXVvdDtmb3Jnb3QgcGFzc3dvcmQmcXVvdDsgcGFnZXMsIGFuZCBzbyBhcyB0byBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvbiwgaWU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIC4uLixcXG4gICAgYXV0aGVudGljYXRlOiBmYWxzZVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxoMz48YSBuYW1lPVxcXCJzYW1wbGUtaW1wbGVtZW50YXRpb25cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzYW1wbGUtaW1wbGVtZW50YXRpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+U2FtcGxlIGltcGxlbWVudGF0aW9uPC9zcGFuPjwvYT48L2gzPjxwPkluIE1pc28sIHdlIGhhdmUgYSBzYW1wbGUgaW1wbGVtZW50YXRpb24gb2YgYXV0aGVudGljYXRpb24gdGhhdCB1c2VzIHRoZSBmbGF0ZmlsZWRiIGFwaS4gVGhlcmUgYXJlIDQgbWFpbiBjb21wb25lbnRzIGluIHRoZSBzYW1wbGUgYXV0aGVudGljYXRpb24gcHJvY2Vzczo8L3A+XFxuPHVsPlxcbjxsaT48cD5UaGUgYXV0aGVudGljYXRlIGFwaSA8Y29kZT4vc3lzdGVtL2FwaS9hdXRoZW50aWNhdGU8L2NvZGU+IC0gaGFuZGxlcyBzYXZpbmcgYW5kIGxvYWRpbmcgb2YgdXNlcnMsIHBsdXMgY2hlY2tpbmcgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXMuPC9wPlxcbjwvbGk+XFxuPGxpPjxwPlRoZSBsb2dpbiBtZWNoYW5pc20gPGNvZGU+L212Yy9sb2dpbi5qczwvY29kZT4gLSBzaW1wbHkgYWxsb3dzIHlvdSB0byBlbnRlciBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCBhbmQgdXNlcyB0aGUgYXV0aGVudGljYXRpb24gYXBpIHRvIGxvZyB5b3UgaW48L3A+XFxuPC9saT5cXG48bGk+PHA+VXNlciBtYW5hZ2VtZW50IDxjb2RlPi9tdmMvdXNlcnMuanM8L2NvZGU+IC0gVXNlcyB0aGUgYXV0aGVudGljYXRpb24gYXBpIHRvIGFkZCBhIHVzZXIgd2l0aCBhbiBlbmNyeXB0ZWQgcGFzc3dvcmQ8L3A+XFxuPC9saT5cXG48bGk+PHA+QXV0aGVudGljYXRpb24gbWlkZGxld2FyZSA8Y29kZT4vc3lzdGVtL2F1dGhfbWlkZGxlLmpzPC9jb2RlPiAtIGFwcGxpZXMgYXV0aGVudGljYXRpb24gb24gdGhlIHNlcnZlciBmb3IgYWN0aW9ucyAtIHRoaXMgaXMgYSBjb3JlIGZlYXR1cmUgb2YgaG93IG1pc28gZG9lcyB0aGUgYXV0aGVudGljYXRpb24gLSBpdCBzaW1wbHkgY2hlY2tzIGlmIHRoZSBzZWNyZXQgaXMgc2V0IG9uIHRoZSBzZXNzaW9uLCBhbmQgcmVkaXJlY3RzIHRvIHRoZSBjb25maWd1cmVkICZxdW90O2xvZ2luVXJsUGF0dGVybiZxdW90OyBVUkwgaWYgaXQgZG9lc24mIzM5O3QgbWF0Y2ggdGhlIHNlY3JldC48L3A+XFxuPC9saT5cXG48L3VsPlxcbjxwPklkZWFsbHkgeW91IHdpbGwgbm90IG5lZWQgdG8gY2hhbmdlIHRoZSBhdXRoZW50aWNhdGlvbiBtaWRkbGV3YXJlLCBhcyB0aGUgaW1wbGVtZW50YXRpb24gc2ltcGx5IHJlcXVpcmVzIHlvdSB0byBzZXQgdGhlICZxdW90O2F1dGhlbnRpY2F0aW9uU2VjcmV0JnF1b3Q7IG9uIHRoZSByZXF1ZXN0IG9iamVjdCBzZXNzaW9uIC0geW91IGNhbiBzZWUgaG93IHRoaXMgd29ya3MgaW4gPGNvZGU+L3N5c3RlbS9hcGkvYXV0aGVudGljYXRlL2F1dGhlbnRpY2F0ZS5hcGkuanM8L2NvZGU+LjwvcD5cXG48aDM+PGEgbmFtZT1cXFwiaG93LXRoZS1zYW1wbGUtaW1wbGVtZW50YXRpb24td29ya3NcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNob3ctdGhlLXNhbXBsZS1pbXBsZW1lbnRhdGlvbi13b3Jrc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Ib3cgdGhlIHNhbXBsZSBpbXBsZW1lbnRhdGlvbiB3b3Jrczwvc3Bhbj48L2E+PC9oMz48dWw+XFxuPGxpPldoZW4gYXV0aGVudGljYXRpb24gaXMgcmVxdWlyZWQgZm9yIGFjY2VzcyB0byBhbiBhY3Rpb24sIGFuZCB5b3UgaGF2ZW4mIzM5O3QgYXV0aGVudGljYXRlZCwgeW91IGFyZSByZWRpcmVjdGVkIHRvIHRoZSA8Y29kZT4vbG9naW48L2NvZGU+IGFjdGlvbjwvbGk+XFxuPGxpPkF0IDxjb2RlPi9sb2dpbjwvY29kZT4geW91IGNhbiBhdXRoZW50aWNhdGUgd2l0aCBhIHVzZXJuYW1lIGFuZCBwYXNzd29yZCAod2hpY2ggY2FuIGJlIGNyZWF0ZWQgYXQgPGNvZGU+L3VzZXJzPC9jb2RlPik8L2xpPlxcbjxsaT5XaGVuIGF1dGhlbnRpY2F0ZWQsIGEgc2VjcmV0IGtleSBpcyBzZXQgb24gdGhlIHNlc3Npb24sIHRoaXMgaXMgdXNlZCB0byBjaGVjayBpZiBhIHVzZXIgaXMgbG9nZ2VkIGluIGV2ZXJ5IHRpbWUgdGhleSBhY2Nlc3MgYW4gYWN0aW9uIHRoYXQgcmVxdWlyZXMgYXV0aGVudGljYXRpb24uPC9saT5cXG48L3VsPlxcbjxwPk5vdGU6IHRoZSBhdXRoZW50aWNhdGlvbiBzZWNyZXQgaXMgb25seSBldmVyIGtlcHQgb24gdGhlIHNlcnZlciwgc28gdGhlIGNsaWVudCBjb2RlIHNpbXBseSBoYXMgYSBib29sZWFuIHRvIHNheSBpZiBpdCBpcyBsb2dnZWQgaW4gLSB0aGlzIG1lYW5zIGl0IHdpbGwgdHJ5IHRvIGFjY2VzcyBhdXRoZW50aWNhdGVkIHVybHMgaWYgPGNvZGU+bWlzb0dsb2JhbC5pc0xvZ2dlZEluPC9jb2RlPiBpcyBzZXQgdG8gJnF1b3Q7dHJ1ZSZxdW90Oy4gT2YgY291cnNlIHRoZSBzZXJ2ZXIgd2lsbCBkZW55IGFjY2VzcyB0byBhbnkgZGF0YSBhcGkgZW5kIHBvaW50cywgc28geW91ciBkYXRhIGlzIHNhZmUuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJzZXNzaW9uc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3Nlc3Npb25zXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlNlc3Npb25zPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gdGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZCwgdGhleSBhcmUgcHJvdmlkZWQgd2l0aCBhIHNlc3Npb24gLSB0aGlzIGNhbiBiZSB1c2VkIHRvIHN0b3JlIHRlbXBvcmFyeSBkYXRhIGFuZCBpcyBhY2Nlc3NpYmxlIHZpYSA8Y29kZT4vc3lzdGVtL2FwaS9zZXNzaW9uL2FwaS5zZXJ2ZXIuanM8L2NvZGU+LiBZb3UgY2FuIHVzZSBpdCBsaWtlIHNvIGluIHlvdXIgPGNvZGU+bXZjPC9jb2RlPiBmaWxlczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgc2Vzc2lvbiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL3Nlc3Npb24vYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG5zZXNzaW9uLmdldCh7a2V5OiAmIzM5O3VzZXJOYW1lJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xcbiAgICBjb25zb2xlLmxvZyhkYXRhLnJlc3VsdCk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZXNlIGFyZSB0aGUgbWV0aG9kcyBhdmFpbGFibGUgb24gdGhlIHNlc3Npb24gYXBpOjwvcD5cXG48dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+TWV0aG9kPC90aD5cXG48dGg+UHVycG9zZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPmdldCh7a2V5OiBrZXl9KTwvdGQ+XFxuPHRkPlJldHJpZXZlcyBhIHZhbHVlIGZyb20gdGhlIHNlc3Npb24gZm9yIHRoZSBnaXZlbiBrZXk8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5zZXQoe2tleToga2V5LCB2YWx1ZTogdmFsdWV9KTwvdGQ+XFxuPHRkPlNldHMgYSB2YWx1ZSBpbiB0aGUgc2Vzc2lvbiBmb3IgdGhlIGdpdmVuIGtleTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+Tm90ZTogRWFjaCB1c2VyIG9mIHlvdXIgYXBwIGhhcyBhIHNlc3Npb24gdGhhdCBpcyBzdG9yZWQgb24gdGhlIHNlcnZlciwgc28gZWFjaCB0aW1lIHlvdSBhY2Nlc3MgaXQsIGl0IHdpbGwgbWFrZSBhIFhIUiByZXF1ZXN0LiBVc2UgaXQgc3BhcmluZ2x5ITwvcD5cXG5cIixcIkNvbnRyaWJ1dGluZy5tZFwiOlwiPHA+SW4gb3JkZXIgdG8gY29udHJpYnV0ZSB0byBtaXNvanMsIHBsZWFzZSBrZWVwIHRoZSBmb2xsb3dpbmcgaW4gbWluZDo8L3A+XFxuPGgyPjxhIG5hbWU9XFxcIndoZW4tYWRkaW5nLWEtcHVsbC1yZXF1ZXN0XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjd2hlbi1hZGRpbmctYS1wdWxsLXJlcXVlc3RcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+V2hlbiBhZGRpbmcgYSBwdWxsIHJlcXVlc3Q8L3NwYW4+PC9hPjwvaDI+PHVsPlxcbjxsaT5CZSBzdXJlIHRvIG9ubHkgbWFrZSBzbWFsbCBjaGFuZ2VzLCBhbnl0aGluZyBtb3JlIHRoYW4gNCBmaWxlcyB3aWxsIG5lZWQgdG8gYmUgcmV2aWV3ZWQ8L2xpPlxcbjxsaT5NYWtlIHN1cmUgeW91IGV4cGxhaW4gPGVtPndoeTwvZW0+IHlvdSYjMzk7cmUgbWFraW5nIHRoZSBjaGFuZ2UsIHNvIHdlIHVuZGVyc3RhbmQgd2hhdCB0aGUgY2hhbmdlIGlzIGZvcjwvbGk+XFxuPGxpPkFkZCBhIHVuaXQgdGVzdCBpZiBhcHByb3ByaWF0ZTwvbGk+XFxuPGxpPkRvIG5vdCBiZSBvZmZlbmRlZCBpZiB3ZSBhc2sgeW91IHRvIGFkZCBhIHVuaXQgdGVzdCBiZWZvcmUgYWNjZXB0aW5nIGEgcHVsbCByZXF1ZXN0PC9saT5cXG48bGk+VXNlIHRhYnMgbm90IHNwYWNlcyAod2UgYXJlIG5vdCBmbGV4aWJsZSBvbiB0aGlzIC0gaXQgaXMgYSBtb290IGRpc2N1c3Npb24gLSBJIHJlYWxseSBkb24mIzM5O3QgY2FyZSwgd2UganVzdCBuZWVkZWQgdG8gcGljayBvbmUsIGFuZCB0YWJzIGl0IGlzKTwvbGk+XFxuPC91bD5cXG5cIixcIkNyZWF0aW5nLWEtdG9kby1hcHAtcGFydC0yLXBlcnNpc3RlbmNlLm1kXCI6XCI8cD5JbiB0aGlzIGFydGljbGUgd2Ugd2lsbCBhZGQgZGF0YSBwZXJzaXN0ZW5jZSBmdW5jdGlvbmFsaXR5IHRvIG91ciB0b2RvIGFwcCBmcm9tIHRoZSA8YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAubWRcXFwiPkNyZWF0aW5nIGEgdG9kbyBhcHA8L2E+IGFydGljbGUuIFdlIHJlY29tbWVuZCB5b3UgZmlyc3QgcmVhZCB0aGF0IGFzIHdlIGFyZSBnb2luZyB0byB1c2UgdGhlIGFwcCB5b3UgbWFkZSBpbiB0aGlzIGFydGljbGUsIHNvIGlmIHlvdSBkb24mIzM5O3QgYWxyZWFkeSBoYXZlIG9uZSwgZ3JhYiBhIGNvcHkgb2YgaXQgPGEgaHJlZj1cXFwiL2RvYy9DcmVhdGluZy1hLXRvZG8tYXBwI2NvbXBsZXRlZC10b2RvLWFwcC5tZFxcXCI+ZnJvbSBoZXJlPC9hPiwgYW5kIHNhdmUgaXQgaW4gPGNvZGU+L212Yy90b2RvLmpzPC9jb2RlPi48L3A+XFxuPHA+Rmlyc3QgYWRkIHRoZSA8Y29kZT5mbGF0ZmlsZWRiPC9jb2RlPiBhcGkgdG8gdGhlIDxjb2RlPmNmZy9zZXJ2ZXIuZGV2ZWxvcG1lbnQuanNvbjwvY29kZT4gZmlsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj4mcXVvdDthcGkmcXVvdDs6ICZxdW90O2ZsYXRmaWxlZGImcXVvdDtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyBtYWtlcyBtaXNvIGxvYWQgdGhlIGFwaSBhbmQgZXhwb3NlIGl0IGF0IHRoZSBjb25maWd1cmVkIEFQSSB1cmwsIGRlZmF1bHQgaXMgJnF1b3Q7L2FwaSZxdW90OyArIGFwaSBuYW1lLCBzbyBmb3IgdGhlIGZsYXRmaWxlZGIgaXQgd2lsbCBiZSA8Y29kZT4vYXBpL2ZsYXRmaWxlZGI8L2NvZGU+LiBUaGlzIGlzIGFsbCBhYnN0cmFjdGVkIGF3YXksIHNvIHlvdSBkbyBub3QgbmVlZCB0byB3b3JyeSBhYm91dCB3aGF0IHRoZSBVUkwgaXMgd2hlbiB1c2luZyB0aGUgYXBpIC0geW91IHNpbXBseSBjYWxsIHRoZSBtZXRob2QgeW91IHdhbnQsIGFuZCB0aGUgbWlzbyBhcGkgdGFrZXMgY2FyZSBvZiB0aGUgcmVzdC48L3A+XFxuPHA+Tm93IHJlcXVpcmUgdGhlIGRiIGFwaSBhdCB0aGUgdGhlIHRvcCBvZiB0aGUgdG9kby5qcyBmaWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5OZXh0IGFkZCB0aGUgZm9sbG93aW5nIGluIHRoZSA8Y29kZT5jdHJsLmFkZFRvZG88L2NvZGU+IGZ1bmN0aW9uIHVuZGVybmVhdGggdGhlIGxpbmUgdGhhdCByZWFkcyA8Y29kZT5jdHJsLnZtLmlucHV0KCZxdW90OyZxdW90Oyk7PC9jb2RlPjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5kYi5zYXZlKHsgdHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5OywgbW9kZWw6IG5ld1RvZG8gfSApLnRoZW4oZnVuY3Rpb24ocmVzKXtcXG4gICAgbmV3VG9kby5faWQgPSByZXMucmVzdWx0O1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgc2F2ZSB0aGUgdG9kbyB0byB0aGUgZGF0YWJhc2Ugd2hlbiB5b3UgY2xpY2sgdGhlICZxdW90O0FkZCZxdW90OyBidXR0b24uPC9wPlxcbjxwPkxldCB1cyB0YWtlIGEgcXVpY2sgbG9vayBhdCBob3cgdGhlIGFwaSB3b3JrcyAtIHRoZSB3YXkgdGhhdCB5b3UgbWFrZSByZXF1ZXN0cyB0byB0aGUgYXBpIGRlcGVuZHMgZW50aXJlbHkgb24gd2hpY2ggYXBpIHlvdSBhcmUgdXNpbmcsIGZvciBleGFtcGxlIGZvciB0aGUgZmxhdGZpbGVkYiwgd2UgaGF2ZTo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPk1ldGhvZDwvdGg+XFxuPHRoPkFjdGlvbjwvdGg+XFxuPHRoPlBhcmFtZXRlcnM8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5zYXZlPC90ZD5cXG48dGQ+U2F2ZSBvciB1cGRhdGVzIGEgbW9kZWw8L3RkPlxcbjx0ZD57IHR5cGU6IFRZUEUsIG1vZGVsOiBNT0RFTCB9PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+ZmluZDwvdGQ+XFxuPHRkPkZpbmRzIG9uZSBvciBtb3JlIG1vZGVscyBvZiB0aGUgZ2l2ZSB0eXBlPC90ZD5cXG48dGQ+eyB0eXBlOiBUWVBFLCBxdWVyeTogUVVFUlkgfTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPnJlbW92ZTwvdGQ+XFxuPHRkPlJlbW92ZXMgYW4gaW5zdGFuY2Ugb2YgYSBtb2RlbDwvdGQ+XFxuPHRkPnsgdHlwZTogVFlQRSwgaWQ6IElEIH08L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPldoZXJlIHRoZSBhdHRyaWJ1dGVzIGFyZTo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkF0dHJpYnV0ZTwvdGg+XFxuPHRoPlVzZTwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPlRZUEU8L3RkPlxcbjx0ZD5UaGUgbmFtZXNwYWNlIG9mIHRoZSBtb2RlbCwgc2F5IHlvdSBoYXZlIHRvZG8uanMsIGFuZCB0aGUgbW9kZWwgaXMgb24gPGNvZGU+bW9kdWxlLmV4cG9ydHMuaW5kZXgubW9kdWxlcy50b2RvPC9jb2RlPiwgdGhlIHR5cGUgd291bGQgYmUgJnF1b3Q7dG9kby5pbmRleC50b2RvJnF1b3Q7PC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+TU9ERUw8L3RkPlxcbjx0ZD5UaGlzIGlzIGFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG1vZGVsIC0gZWc6IGEgc3RhbmRhcmQgbWl0aHJpbCBtb2RlbDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlFVRVJZPC90ZD5cXG48dGQ+QW4gb2JqZWN0IHdpdGggYXR0cmlidXRlcyB0byBmaWx0ZXIgdGhlIHF1ZXJ5IHJlc3VsdHM8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5JRDwvdGQ+XFxuPHRkPkEgdW5pcXVlIElEIGZvciBhIHJlY29yZDwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+RXZlcnkgbWV0aG9kIHJldHVybnMgYSA8YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuZGVmZXJyZWQuaHRtbCNkaWZmZXJlbmNlcy1mcm9tLXByb21pc2VzLWEtLm1kXFxcIj5taXRocmlsIHN0eWxlIHByb21pc2U8L2E+LCB3aGljaCBtZWFucyB5b3UgbXVzdCBhdHRhY2ggYSA8Y29kZT4udGhlbjwvY29kZT4gY2FsbGJhY2sgZnVuY3Rpb24uXFxuQmUgc3VyZSB0byBjaGVjayB0aGUgbWV0aG9kcyBmb3IgZWFjaCBhcGksIGFzIGVhY2ggd2lsbCB2YXJ5LCBkZXBlbmRpbmcgb24gdGhlIGZ1bmN0aW9uYWxpdHkuPC9wPlxcbjxwPk5vdywgbGV0IHVzIGFkZCB0aGUgY2FwYWJpbGl0eSB0byBsb2FkIG91ciB0b2RvcywgYWRkIHRoZSBmb2xsb3dpbmcgdG8gdGhlIHN0YXJ0IG9mIHRoZSBjb250cm9sbGVyLCBqdXN0IGFmdGVyIHRoZSA8Y29kZT52YXIgY3RybCA9IHRoaXM8L2NvZGU+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmRiLmZpbmQoe3R5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgY3RybC5saXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhkYXRhLnJlc3VsdFtrZXldKTtcXG4gICAgfSk7XFxufSk7XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBsb2FkIHlvdXIgdG9kb3Mgd2hlbiB0aGUgYXBwIGxvYWRzIHVwLiBCZSBzdXJlIHRvIHJlbW92ZSB0aGUgb2xkIHN0YXRpYyBsaXN0LCBpZTogcmVtb3ZlIHRoZXNlIGxpbmVzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG5cXG5jdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgIHJldHVybiBuZXcgc2VsZi5tb2RlbHMudG9kbyhteVRvZG9zW2tleV0pO1xcbn0pO1xcbjwvY29kZT48L3ByZT5cXG48cD5Ob3cgeW91IGNhbiB0cnkgYWRkaW5nIGEgdG9kbywgYW5kIGl0IHdpbGwgc2F2ZSBhbmQgbG9hZCE8L3A+XFxuPHA+TmV4dCBsZXQgdXMgYWRkIHRoZSBhYmlsaXR5IHRvIHJlbW92ZSB5b3VyIGNvbXBsZXRlZCB0b2RvcyBpbiB0aGUgYXJjaGl2ZSBtZXRob2QgLSBleHRlbmQgdGhlIDxjb2RlPmlmPC9jb2RlPiBzdGF0ZW1lbnQgYnkgYWRkaW5nIGFuIDxjb2RlPmVsc2U8L2NvZGU+IGxpa2Ugc286IDwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPn0gZWxzZSB7XFxuICAgIGFwaS5yZW1vdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBfaWQ6IHRvZG8uX2lkIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xcbiAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UucmVzdWx0KTtcXG4gICAgfSk7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgcmVtb3ZlIHRoZSB0b2RvIGZyb20gdGhlIGRhdGEgc3RvcmUuPC9wPlxcbjxwPllvdSBub3cgaGF2ZSBhIGNvbXBsZXRlIHRvZG8gYXBwLCB5b3VyIGFwcCBzaG91bGQgbG9vayBsaWtlIHRoaXM6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5O21pdGhyaWwuc3VnYXJ0YWdzJiMzOTspKG0pLFxcbiAgICBkYiA9IHJlcXVpcmUoJiMzOTsuLi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvYXBpLnNlcnZlci5qcyYjMzk7KShtKTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgICAgICB0aGlzLmRvbmUgPSBtLnByb3AoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgICAgICB0aGlzLl9pZCA9IGRhdGEuX2lkO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcztcXG5cXG4gICAgICAgIGRiLmZpbmQoe3R5cGU6ICYjMzk7dG9kby5pbmRleC50b2RvJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgICAgICAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhkYXRhLnJlc3VsdCkubWFwKGZ1bmN0aW9uKGtleSkge1xcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8oZGF0YS5yZXN1bHRba2V5XSk7XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIGN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN0cmwudm0uaW5wdXQoKTtcXG4gICAgICAgICAgICBpZih2YWx1ZSkge1xcbiAgICAgICAgICAgICAgICB2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGN0cmwudm0uaW5wdXQoKSxcXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlXFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcXG4gICAgICAgICAgICAgICAgY3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspO1xcbiAgICAgICAgICAgICAgICBkYi5zYXZlKHsgdHlwZTogJiMzOTt0b2RvLmluZGV4LnRvZG8mIzM5OywgbW9kZWw6IG5ld1RvZG8gfSApLnRoZW4oZnVuY3Rpb24ocmVzKXtcXG4gICAgICAgICAgICAgICAgICAgIG5ld1RvZG8uX2lkID0gcmVzLnJlc3VsdDtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC5hcmNoaXZlID0gZnVuY3Rpb24oKXtcXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xcbiAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICBpZighdG9kby5kb25lKCkpIHtcXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCh0b2RvKTsgXFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XFxuICAgICAgICAgICAgICAgICAgICBkYi5yZW1vdmUoeyB0eXBlOiAmIzM5O3RvZG8uaW5kZXgudG9kbyYjMzk7LCBfaWQ6IHRvZG8uX2lkIH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLnJlc3VsdCk7XFxuICAgICAgICAgICAgICAgICAgICB9KTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgIGN0cmwubGlzdCA9IGxpc3Q7XFxuICAgICAgICB9O1xcblxcbiAgICAgICAgY3RybC52bSA9IHtcXG4gICAgICAgICAgICBsZWZ0OiBmdW5jdGlvbigpe1xcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAwO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ICs9IHRvZG8uZG9uZSgpID8gMCA6IDE7XFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnQ7XFxuICAgICAgICAgICAgfSxcXG4gICAgICAgICAgICBkb25lOiBmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xcbiAgICAgICAgICAgICAgICAgICAgdG9kby5kb25lKCF0b2RvLmRvbmUoKSk7XFxuICAgICAgICAgICAgICAgIH1cXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGlucHV0OiBtLnByb3AoJnF1b3Q7JnF1b3Q7KVxcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgICAgIHJldHVybiBbXFxuICAgICAgICAgICAgICAgIFNUWUxFKCZxdW90Oy5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO30mcXVvdDspLFxcbiAgICAgICAgICAgICAgICBIMSgmcXVvdDtUb2RvcyAtICZxdW90OyArIGN0cmwudm0ubGVmdCgpICsgJnF1b3Q7IG9mICZxdW90OyArIGN0cmwubGlzdC5sZW5ndGggKyAmcXVvdDsgcmVtYWluaW5nJnF1b3Q7KSxcXG4gICAgICAgICAgICAgICAgQlVUVE9OKHsgb25jbGljazogY3RybC5hcmNoaXZlIH0sICZxdW90O0FyY2hpdmUmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBVTChbXFxuICAgICAgICAgICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gJnF1b3Q7ZG9uZSZxdW90OzogJnF1b3Q7JnF1b3Q7LCBvbmNsaWNrOiBjdHJsLnZtLmRvbmUodG9kbykgfSwgdG9kby50ZXh0KTtcXG4gICAgICAgICAgICAgICAgICAgIH0pXFxuICAgICAgICAgICAgICAgIF0pLFxcbiAgICAgICAgICAgICAgICBGT1JNKHsgb25zdWJtaXQ6IGN0cmwuYWRkVG9kbyB9LCBbXFxuICAgICAgICAgICAgICAgICAgICBJTlBVVCh7IHR5cGU6ICZxdW90O3RleHQmcXVvdDssIHZhbHVlOiBjdHJsLnZtLmlucHV0LCBwbGFjZWhvbGRlcjogJnF1b3Q7QWRkIHRvZG8mcXVvdDt9KSxcXG4gICAgICAgICAgICAgICAgICAgIEJVVFRPTih7IHR5cGU6ICZxdW90O3N1Ym1pdCZxdW90O30sICZxdW90O0FkZCZxdW90OylcXG4gICAgICAgICAgICAgICAgXSlcXG4gICAgICAgICAgICBdXFxuICAgICAgICB9O1xcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuXCIsXCJDcmVhdGluZy1hLXRvZG8tYXBwLm1kXCI6XCI8cD5JbiB0aGlzIGFydGljbGUgd2Ugd2lsbCBjcmVhdGUgYSBmdW5jdGlvbmFsIHRvZG8gYXBwIC0gd2UgcmVjb21tZW5kIHlvdSBmaXJzdCByZWFkIHRoZSA8YSBocmVmPVxcXCIvZG9jL0dldHRpbmctc3RhcnRlZC5tZFxcXCI+R2V0dGluZyBzdGFydGVkPC9hPiBhcnRpY2xlLCBhbmQgdW5kZXJzdGFuZCB0aGUgbWlzbyBmdW5kYW1lbnRhbHMgc3VjaCBhcyB3aGVyZSB0byBwbGFjZSBtb2RlbHMgYW5kIGhvdyB0byBjcmVhdGUgYSBtaXNvIGNvbnRyb2xsZXIuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJ0b2RvLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3RvZG8tYXBwXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlRvZG8gYXBwPC9zcGFuPjwvYT48L2gyPjxwPldlIHdpbGwgbm93IGNyZWF0ZSBhIG5ldyBhcHAgdXNpbmcgdGhlIDxhIGhyZWY9XFxcIi9kb2MvUGF0dGVybnMjc2luZ2xlLXVybC1tdmMubWRcXFwiPnNpbmdsZSB1cmwgcGF0dGVybjwvYT4sIHdoaWNoIG1lYW5zIGl0IGhhbmRsZXMgYWxsIGFjdGlvbnMgYXV0b25vbW91c2x5LCBwbHVzIGxvb2tzIGEgbG90IGxpa2UgYSBub3JtYWwgbWl0aHJpbCBhcHAuPC9wPlxcbjxwPkluIDxjb2RlPi9tdmM8L2NvZGU+IHNhdmUgYSBuZXcgZmlsZSBhcyA8Y29kZT50b2RvLmpzPC9jb2RlPiB3aXRoIHRoZSBmb2xsb3dpbmcgY29udGVudDogPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHt9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcztcXG4gICAgICAgIHJldHVybiBjdHJsO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICByZXR1cm4gJnF1b3Q7VE9ETyZxdW90OztcXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPk5vdyBvcGVuOiA8YSBocmVmPVxcXCIvZG9jL3RvZG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvdG9kb3M8L2E+IGFuZCB5b3UmIzM5O2xsIHNlZSB0aGUgd29yZCAmcXVvdDtUT0RPJnF1b3Q7LiBZb3UmIzM5O2xsIG5vdGljZSB0aGF0IHRoZSB1cmwgaXMgJnF1b3Q7L3RvZG9zJnF1b3Q7IHdpdGggYW4gJiMzOTtzJiMzOTsgb24gdGhlIGVuZCAtIGFzIHdlIGFyZSB1c2luZyA8YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzI3JvdXRlLWJ5LWNvbnZlbnRpb24ubWRcXFwiPnJvdXRlIGJ5IGNvbnZlbnRpb248L2E+IHRvIG1hcCBvdXIgcm91dGUuPC9wPlxcbjxwPk5leHQgbGV0JiMzOTtzIGNyZWF0ZSB0aGUgbW9kZWwgZm9yIG91ciB0b2RvcyAtIGNoYW5nZSB0aGUgPGNvZGU+bW9kZWxzPC9jb2RlPiBhdHRyaWJ1dGUgdG8gdGhlIGZvbGxvd2luZzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2RlbHM6IHtcXG4gICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICB0aGlzLnRleHQgPSBkYXRhLnRleHQ7XFxuICAgICAgICB0aGlzLmRvbmUgPSBtLnAoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgIH1cXG59LFxcbjwvY29kZT48L3ByZT5cXG48cD5FYWNoIGxpbmUgaW4gdGhlIG1vZGVsIGRvZXMgdGhlIGZvbGxvd2luZzo8L3A+XFxuPHVsPlxcbjxsaT48Y29kZT50aGlzLnRleHQ8L2NvZGU+IC0gVGhlIHRleHQgdGhhdCBpcyBzaG93biBvbiB0aGUgdG9kbzwvbGk+XFxuPGxpPjxjb2RlPnRoaXMuZG9uZTwvY29kZT4gLSBUaGlzIHJlcHJlc2VudHMgaWYgdGhlIHRvZG8gaGFzIGJlZW4gY29tcGxldGVkIC0gd2UgZW5zdXJlIHRoYXQgd2UgaGFuZGxlIHRoZSAmcXVvdDtmYWxzZSZxdW90OyB2YWx1ZXMgY29ycmVjdGx5LCBhcyBhamF4IHJlc3BvbnNlcyBhcmUgYWx3YXlzIHN0cmluZ3MuPC9saT5cXG48bGk+PGNvZGU+dGhpcy5faWQ8L2NvZGU+IC0gVGhlIGtleSBmb3IgdGhlIHRvZG88L2xpPlxcbjwvdWw+XFxuPHA+VGhlIG1vZGVsIGNhbiBub3cgYmUgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmVpdmUgdG9kb3MgLSBtaXNvIGF1dG9tYXRpY2FsbHkgcGlja3MgdXAgYW55IG9iamVjdHMgb24gdGhlIDxjb2RlPm1vZGVsczwvY29kZT4gYXR0cmlidXRlIG9mIHlvdXIgbXZjIGZpbGUsIGFuZCBtYXBzIGl0IGluIHRoZSBBUEkuIFdlIHdpbGwgc29vbiBzZWUgaG93IHRoYXQgd29ya3MuIE5leHQgYWRkIHRoZSBmb2xsb3dpbmcgY29kZSBhcyB0aGUgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgbXlUb2RvcyA9IFt7dGV4dDogJnF1b3Q7TGVhcm4gbWlzbyZxdW90O30sIHt0ZXh0OiAmcXVvdDtCdWlsZCBtaXNvIGFwcCZxdW90O31dO1xcbiAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG4gICAgfSk7XFxuICAgIHJldHVybiBjdHJsO1xcbn0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgZG9lcyB0aGUgZm9sbG93aW5nOjwvcD5cXG48dWw+XFxuPGxpPkNyZWF0ZXMgPGNvZGU+bXlUb2RvczwvY29kZT4gd2hpY2ggaXMgYSBsaXN0IG9mIG9iamVjdHMgdGhhdCByZXByZXNlbnRzIHRvZG9zPC9saT5cXG48bGk+PGNvZGU+dGhpcy5saXN0PC9jb2RlPiAtIGNyZWF0ZXMgYSBsaXN0IG9mIHRvZG8gbW9kZWwgb2JqZWN0cyBieSB1c2luZyA8Y29kZT5uZXcgc2VsZi5tb2RlbHMudG9kbyguLi48L2NvZGU+IG9uIGVhY2ggbXlUb2RvcyBvYmplY3QuPC9saT5cXG48bGk+PGNvZGU+cmV0dXJuIHRoaXM8L2NvZGU+IG11c3QgYmUgZG9uZSBpbiBhbGwgY29udHJvbGxlcnMsIGl0IG1ha2VzIHN1cmUgdGhhdCBtaXNvIGNhbiBjb3JyZWN0bHkgZ2V0IGFjY2VzcyB0byB0aGUgY29udHJvbGxlciBvYmplY3QuPC9saT5cXG48L3VsPlxcbjxwPk5vdGU6IHdlIGFsd2F5cyBjcmVhdGUgYSBsb2NhbCB2YXJpYWJsZSA8Y29kZT5jdHJsPC9jb2RlPiB0aGF0IHBvaW50cyB0byB0aGUgY29udHJvbGxlciwgYXMgaXQgY2FuIGJlIHVzZWQgdG8gYWNjZXNzIHZhcmlhYmxlcyBpbiB0aGUgY29udHJvbGxlciBmcm9tIG5lc3RlZCBmdW5jdGlvbnMuIFlvdSB3aWxsIHNlZSB0aGlzIHVzYWdlIGxhdGVyIG9uIGluIHRoaXMgYXJ0aWNsZS48L3A+XFxuPHA+Tm93IHVwZGF0ZSB0aGUgdmlldyBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgcmV0dXJuIG0oJnF1b3Q7VUwmcXVvdDssIFtcXG4gICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgcmV0dXJuIG0oJnF1b3Q7TEkmcXVvdDssIHRvZG8udGV4dClcXG4gICAgICAgIH0pXFxuICAgIF0pO1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGl0ZXJhdGUgb24geW91ciBuZXdseSBjcmVhdGVkIGxpc3Qgb2YgdG9kbyBtb2RlbCBvYmplY3RzIGFuZCBkaXNwbGF5IHRoZSBvbiBzY3JlZW4uIFlvdXIgdG9kbyBhcHAgc2hvdWxkIG5vdyBsb29rIGxpa2UgdGhpczo8L3A+XFxuPGgzPjxhIG5hbWU9XFxcImhhbGYtd2F5LXBvaW50XFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaGFsZi13YXktcG9pbnRcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+SGFsZi13YXkgcG9pbnQ8L3NwYW4+PC9hPjwvaDM+PHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgdG9kbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gZGF0YS50ZXh0O1xcbiAgICAgICAgICAgIHRoaXMuZG9uZSA9IG0ucChkYXRhLmRvbmUgPT0gJnF1b3Q7ZmFsc2UmcXVvdDs/IGZhbHNlOiBkYXRhLmRvbmUpO1xcbiAgICAgICAgICAgIHRoaXMuX2lkID0gZGF0YS5faWQ7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdmFyIGN0cmwgPSB0aGlzLFxcbiAgICAgICAgICAgIG15VG9kb3MgPSBbe3RleHQ6ICZxdW90O0xlYXJuIG1pc28mcXVvdDt9LCB7dGV4dDogJnF1b3Q7QnVpbGQgbWlzbyBhcHAmcXVvdDt9XTtcXG4gICAgICAgIGN0cmwubGlzdCA9IE9iamVjdC5rZXlzKG15VG9kb3MpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICByZXR1cm4gbmV3IHNlbGYubW9kZWxzLnRvZG8obXlUb2Rvc1trZXldKTtcXG4gICAgICAgIH0pO1xcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHJldHVybiBtKCZxdW90O1VMJnF1b3Q7LCBbXFxuICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJnF1b3Q7TEkmcXVvdDssIHRvZG8udGV4dClcXG4gICAgICAgICAgICB9KVxcbiAgICAgICAgXSk7XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48YmxvY2txdW90ZT5cXG5TbyBmYXIgd2UgaGF2ZSBvbmx5IHVzZWQgcHVyZSBtaXRocmlsIHRvIGNyZWF0ZSBvdXIgYXBwIC0gbWlzbyBkaWQgZG8gc29tZSBvZiB0aGUgZ3J1bnQtd29yayBiZWhpbmQgdGhlIHNjZW5lcywgYnV0IHdlIGNhbiBkbyBtdWNoIG1vcmUuXFxuPC9ibG9ja3F1b3RlPlxcblxcblxcbjxwPkxldCB1cyBhZGQgc29tZSB1c2VmdWwgbGlicmFyaWVzLCBjaGFuZ2UgdGhlIHRvcCBzZWN0aW9uIHRvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgYmluZGluZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuYmluZGluZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGluY2x1ZGUgdGhlIGZvbGxvd2luZyBsaWJyYXJpZXM6PC9wPlxcbjx1bD5cXG48bGk+PGEgaHJlZj1cXFwiL2RvYy9taXRocmlsLnN1Z2FydGFncy5tZFxcXCI+bWl0aHJpbC5zdWdhcnRhZ3M8L2E+IC0gYWxsb3dzIHJlbmRlcmluZyBIVE1MIHVzaW5nIHRhZ3MgdGhhdCBsb29rIGEgbGl0dGxlIG1vcmUgbGlrZSBIVE1MIHRoYW4gc3RhbmRhcmQgbWl0aHJpbDwvbGk+XFxuPGxpPjxhIGhyZWY9XFxcIi9kb2MvbWl0aHJpbC5iaW5kaW5ncy5tZFxcXCI+bWl0aHJpbC5iaW5kaW5nczwvYT4gQmktZGlyZWN0aW9uYWwgZGF0YSBiaW5kaW5ncyBmb3IgcmljaGVyIG1vZGVsczwvbGk+XFxuPC91bD5cXG48cD5MZXQgdXMgc3RhcnQgd2l0aCB0aGUgc3VnYXIgdGFncywgdXBkYXRlIHRoZSB2aWV3IHRvIHJlYWQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICB3aXRoKHN1Z2FydGFncykge1xcbiAgICAgICAgcmV0dXJuIFVMKFtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gTEkodG9kby50ZXh0KVxcbiAgICAgICAgICAgIH0pXFxuICAgICAgICBdKVxcbiAgICB9O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+U28gdXNpbmcgc3VnYXJ0YWdzIGFsbG93cyB1cyB0byB3cml0ZSBtb3JlIGNvbmNpc2Ugdmlld3MsIHRoYXQgbG9vayBtb3JlIGxpa2UgbmF0dXJhbCBIVE1MLjwvcD5cXG48cD5OZXh0IGxldCB1cyBhZGQgYSA8YSBocmVmPVxcXCIvZG9jL3doYXQtaXMtYS12aWV3LW1vZGVsLmh0bWwubWRcXFwiPnZpZXcgbW9kZWw8L2E+IHRvIHRoZSBjb250cm9sbGVyLiBBIHZpZXcgbW9kZWwgaXMgc2ltcGx5IGEgbW9kZWwgdGhhdCBjb250YWlucyBkYXRhIGFib3V0IHRoZSB2aWV3LCBhbmQgYXV4aWxsYXJ5IGZ1bmN0aW9uYWxpdHksIGllOiBkYXRhIGFuZCBvdGhlciB0aGluZ3MgdGhhdCB3ZSBkb24mIzM5O3Qgd2FudCB0byBwZXJzaXN0LiBBZGQgdGhpcyB0byB0aGUgY29udHJvbGxlcjo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jdHJsLnZtID0ge1xcbiAgICBkb25lOiBmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcXG4gICAgICAgICAgICB0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCB0b2dnbGVzIHRoZSA8Y29kZT5kb25lPC9jb2RlPiBhdHRyaWJ1dGUgb24gdGhlIHBhc3NlZCBpbiB0b2RvLiA8L3A+XFxuPGJsb2NrcXVvdGU+XFxuWW91IG1pZ2h0IGJlIHRlbXB0ZWQgdG8gcHV0IHRoaXMgZnVuY3Rpb25hbGl0eSBpbnRvIHRoZSBtb2RlbCwgYnV0IGluIG1pc28sIHdlIG5lZWQgdG8gc3RyaWN0bHkga2VlcCBkYXRhIGluIHRoZSBkYXRhIG1vZGVsLCBhcyB3ZSBhcmUgYWJsZSB0byBwZXJzaXN0IGl0LlxcbjwvYmxvY2txdW90ZT5cXG5cXG48cD5OZXh0IHVwZGF0ZSB0aGUgdmlldyB0bzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgIFNUWUxFKCZxdW90Oy5kb25le3RleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO30mcXVvdDspLFxcbiAgICAgICAgICAgIFVMKFtcXG4gICAgICAgICAgICAgICAgY3RybC5saXN0Lm1hcChmdW5jdGlvbih0b2RvKXtcXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMSSh7IGNsYXNzOiB0b2RvLmRvbmUoKT8gJnF1b3Q7ZG9uZSZxdW90OzogJnF1b3Q7JnF1b3Q7LCBvbmNsaWNrOiBjdHJsLnZtLmRvbmUodG9kbykgfSwgdG9kby50ZXh0KTtcXG4gICAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICBdKVxcbiAgICAgICAgXVxcbiAgICB9O1xcbn1cXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIG1ha2UgdGhlIGxpc3Qgb2YgdG9kb3MgY2xpY2thYmxlLCBhbmQgcHV0IGEgc3RyaWtlLXRocm91Z2ggdGhlIHRvZG8gd2hlbiBpdCBpcyBzZXQgdG8gJnF1b3Q7ZG9uZSZxdW90OywgbmVhdCE8L3A+XFxuPHA+Tm93IGxldCB1cyBhZGQgYSBjb3VudGVyLCB0byBzaG93IGhvdyBtYW55IHRvZG9zIGFyZSBsZWZ0LCBwdXQgdGhpcyBpbnRvIHRoZSB2aWV3IG1vZGVsIHlvdSBjcmVhdGVkIGluIHRoZSBwcmV2aW91cyBzdGVwOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmxlZnQ6IGZ1bmN0aW9uKCl7XFxuICAgIHZhciBjb3VudCA9IDA7XFxuICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgY291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcXG4gICAgfSk7XFxuICAgIHJldHVybiBjb3VudDtcXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFuZCBpbiB0aGUgdmlldywgYWRkIHRoZSBmb2xsb3dpbmcgYWJvdmUgdGhlIFVMOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPkgxKCZxdW90O1RvZG9zIC0gJnF1b3Q7ICsgY3RybC52bS5sZWZ0KCkgKyAmcXVvdDsgb2YgJnF1b3Q7ICsgY3RybC5saXN0Lmxlbmd0aCArICZxdW90OyByZW1haW5pbmcmcXVvdDspLFxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgbm93IGRpc3BsYXkgYSBuaWNlIGhlYWRlciBzaG93aW5nIGhvdyBtYW55IHRvZG9zIGFyZSBsZWZ0LjwvcD5cXG48cD5OZXh0IGxldCB1cyBhZGQgYW4gaW5wdXQgZmllbGQsIHNvIHlvdSBjYW4gYWRkIG5ldyB0b2RvcywgaW4gdGhlIHZpZXcgbW9kZWwsICh0aGUgPGNvZGU+Y3RybC52bTwvY29kZT4gb2JqZWN0KSwgYWRkIHRoZSBmb2xsb3dpbmcgbGluZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5pbnB1dDogbS5wKCZxdW90OyZxdW90OylcXG48L2NvZGU+PC9wcmU+XFxuPHA+SW4gdGhlIGNvbnRyb2xsZXIsIGFkZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jdHJsLmFkZFRvZG8gPSBmdW5jdGlvbihlKXtcXG4gICAgdmFyIHZhbHVlID0gY3RybC52bS5pbnB1dCgpO1xcbiAgICBpZih2YWx1ZSkge1xcbiAgICAgICAgdmFyIG5ld1RvZG8gPSBuZXcgc2VsZi5tb2RlbHMudG9kbyh7XFxuICAgICAgICAgICAgdGV4dDogY3RybC52bS5pbnB1dCgpLFxcbiAgICAgICAgICAgIGRvbmU6IGZhbHNlXFxuICAgICAgICB9KTtcXG4gICAgICAgIGN0cmwubGlzdC5wdXNoKG5ld1RvZG8pO1xcbiAgICAgICAgY3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspO1xcbiAgICB9XFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcXG4gICAgcmV0dXJuIGZhbHNlO1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgZnVuY3Rpb24gY3JlYXRlcyBhIG5ldyB0b2RvIGJhc2VkIG9uIHRoZSBpbnB1dCB0ZXh0LCBhbmQgYWRkcyBpdCB0byB0aGUgbGlzdCBvZiB0b2Rvcy48L3A+XFxuPHA+QW5kIGluIHRoZSB2aWV3IGp1c3QgYmVsb3cgdGhlIFVMLCBhZGQ6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Rk9STSh7IG9uc3VibWl0OiBjdHJsLmFkZFRvZG8gfSwgW1xcbiAgICBJTlBVVCh7IHR5cGU6ICZxdW90O3RleHQmcXVvdDssIHZhbHVlOiBjdHJsLnZtLmlucHV0LCBwbGFjZWhvbGRlcjogJnF1b3Q7QWRkIHRvZG8mcXVvdDt9KSxcXG4gICAgQlVUVE9OKHsgdHlwZTogJnF1b3Q7c3VibWl0JnF1b3Q7fSwgJnF1b3Q7QWRkJnF1b3Q7KVxcbl0pXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkFzIHlvdSBjYW4gc2VlLCB3ZSBhc3NpZ24gdGhlIDxjb2RlPmFkZFRvZG88L2NvZGU+IG1ldGhvZCBvZiB0aGUgY29udHJvbGxlciB0byB0aGUgb25zdWJtaXQgZnVuY3Rpb24gb2YgdGhlIGZvcm0sIHNvIHRoYXQgaXQgd2lsbCBjb3JyZWN0bHkgYWRkIHRoZSB0b2RvIHdoZW4geW91IGNsaWNrIHRoZSAmcXVvdDtBZGQmcXVvdDsgYnV0dG9uLjwvcD5cXG48cD5OZXh0LCBsZXQgdXMgYWRkIHRoZSBhYmlsaXR5IHRvIGFyY2hpdmUgb2xkIHRvZG9zLCBhZGQgdGhlIGZvbGxvd2luZyBpbnRvIHRoZSBjb250cm9sbGVyOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPmN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XFxuICAgIHZhciBsaXN0ID0gW107XFxuICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgaWYoIXRvZG8uZG9uZSgpKSB7XFxuICAgICAgICAgICAgbGlzdC5wdXNoKHRvZG8pOyBcXG4gICAgICAgIH1cXG4gICAgfSk7XFxuICAgIGN0cmwubGlzdCA9IGxpc3Q7XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+QW5kIHRoaXMgYnV0dG9uIGJlbG93IHRoZSBIMTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5CVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgJnF1b3Q7QXJjaGl2ZSZxdW90OyksXFxuPC9jb2RlPjwvcHJlPlxcbjxoMz48YSBuYW1lPVxcXCJjb21wbGV0ZWQtdG9kby1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjb21wbGV0ZWQtdG9kby1hcHBcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q29tcGxldGVkIHRvZG8gYXBwPC9zcGFuPjwvYT48L2gzPjxwPkFuZCB5b3UgY2FuIG5vdyBhcmNoaXZlIHlvdXIgdG9kb3MuIFRoaXMgY29tcGxldGVzIHRoZSB0b2RvIGFwcCBmdW5jdGlvbmFsbHksIHlvdXIgY29tcGxldGUgdG9kbyBhcHAgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciBtID0gcmVxdWlyZSgmIzM5O21pdGhyaWwmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKSxcXG4gICAgYmluZGluZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuYmluZGluZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG52YXIgc2VsZiA9IG1vZHVsZS5leHBvcnRzLmluZGV4ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIHRvZG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IGRhdGEudGV4dDtcXG4gICAgICAgICAgICB0aGlzLmRvbmUgPSBtLnByb3AoZGF0YS5kb25lID09ICZxdW90O2ZhbHNlJnF1b3Q7PyBmYWxzZTogZGF0YS5kb25lKTtcXG4gICAgICAgICAgICB0aGlzLl9pZCA9IGRhdGEuX2lkO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICBteVRvZG9zID0gW3t0ZXh0OiAmcXVvdDtMZWFybiBtaXNvJnF1b3Q7fSwge3RleHQ6ICZxdW90O0J1aWxkIG1pc28gYXBwJnF1b3Q7fV07XFxuXFxuICAgICAgICBjdHJsLmxpc3QgPSBPYmplY3Qua2V5cyhteVRvZG9zKS5tYXAoZnVuY3Rpb24oa2V5KSB7XFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy50b2RvKG15VG9kb3Nba2V5XSk7XFxuICAgICAgICB9KTtcXG5cXG4gICAgICAgIGN0cmwuYWRkVG9kbyA9IGZ1bmN0aW9uKGUpe1xcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGN0cmwudm0uaW5wdXQoKTtcXG4gICAgICAgICAgICBpZih2YWx1ZSkge1xcbiAgICAgICAgICAgICAgICB2YXIgbmV3VG9kbyA9IG5ldyBzZWxmLm1vZGVscy50b2RvKHtcXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGN0cmwudm0uaW5wdXQoKSxcXG4gICAgICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlXFxuICAgICAgICAgICAgICAgIH0pO1xcbiAgICAgICAgICAgICAgICBjdHJsLmxpc3QucHVzaChuZXdUb2RvKTtcXG4gICAgICAgICAgICAgICAgY3RybC52bS5pbnB1dCgmcXVvdDsmcXVvdDspO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xcbiAgICAgICAgfTtcXG5cXG4gICAgICAgIGN0cmwuYXJjaGl2ZSA9IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbXTtcXG4gICAgICAgICAgICBjdHJsLmxpc3QubWFwKGZ1bmN0aW9uKHRvZG8pIHtcXG4gICAgICAgICAgICAgICAgaWYoIXRvZG8uZG9uZSgpKSB7XFxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godG9kbyk7IFxcbiAgICAgICAgICAgICAgICB9XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgY3RybC5saXN0ID0gbGlzdDtcXG4gICAgICAgIH07XFxuXFxuICAgICAgICBjdHJsLnZtID0ge1xcbiAgICAgICAgICAgIGxlZnQ6IGZ1bmN0aW9uKCl7XFxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XFxuICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbykge1xcbiAgICAgICAgICAgICAgICAgICAgY291bnQgKz0gdG9kby5kb25lKCkgPyAwIDogMTtcXG4gICAgICAgICAgICAgICAgfSk7XFxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudDtcXG4gICAgICAgICAgICB9LFxcbiAgICAgICAgICAgIGRvbmU6IGZ1bmN0aW9uKHRvZG8pe1xcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XFxuICAgICAgICAgICAgICAgICAgICB0b2RvLmRvbmUoIXRvZG8uZG9uZSgpKTtcXG4gICAgICAgICAgICAgICAgfVxcbiAgICAgICAgICAgIH0sXFxuICAgICAgICAgICAgaW5wdXQ6IG0ucCgmcXVvdDsmcXVvdDspXFxuICAgICAgICB9O1xcblxcbiAgICAgICAgcmV0dXJuIGN0cmw7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIFtcXG4gICAgICAgICAgICAgICAgU1RZTEUoJnF1b3Q7LmRvbmV7dGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7fSZxdW90OyksXFxuICAgICAgICAgICAgICAgIEgxKCZxdW90O1RvZG9zIC0gJnF1b3Q7ICsgY3RybC52bS5sZWZ0KCkgKyAmcXVvdDsgb2YgJnF1b3Q7ICsgY3RybC5saXN0Lmxlbmd0aCArICZxdW90OyByZW1haW5pbmcmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBCVVRUT04oeyBvbmNsaWNrOiBjdHJsLmFyY2hpdmUgfSwgJnF1b3Q7QXJjaGl2ZSZxdW90OyksXFxuICAgICAgICAgICAgICAgIFVMKFtcXG4gICAgICAgICAgICAgICAgICAgIGN0cmwubGlzdC5tYXAoZnVuY3Rpb24odG9kbyl7XFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExJKHsgY2xhc3M6IHRvZG8uZG9uZSgpPyAmcXVvdDtkb25lJnF1b3Q7OiAmcXVvdDsmcXVvdDssIG9uY2xpY2s6IGN0cmwudm0uZG9uZSh0b2RvKSB9LCB0b2RvLnRleHQpO1xcbiAgICAgICAgICAgICAgICAgICAgfSlcXG4gICAgICAgICAgICAgICAgXSksXFxuICAgICAgICAgICAgICAgIEZPUk0oeyBvbnN1Ym1pdDogY3RybC5hZGRUb2RvIH0sIFtcXG4gICAgICAgICAgICAgICAgICAgIElOUFVUKHsgdHlwZTogJnF1b3Q7dGV4dCZxdW90OywgdmFsdWU6IGN0cmwudm0uaW5wdXQsIHBsYWNlaG9sZGVyOiAmcXVvdDtBZGQgdG9kbyZxdW90O30pLFxcbiAgICAgICAgICAgICAgICAgICAgQlVUVE9OKHsgdHlwZTogJnF1b3Q7c3VibWl0JnF1b3Q7fSwgJnF1b3Q7QWRkJnF1b3Q7KVxcbiAgICAgICAgICAgICAgICBdKVxcbiAgICAgICAgICAgIF1cXG4gICAgICAgIH07XFxuICAgIH1cXG59O1xcbjwvY29kZT48L3ByZT5cXG48cD5OZXh0IHdlIHJlY29tbWVuZCB5b3UgcmVhZDwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAtcGFydC0yLXBlcnNpc3RlbmNlLm1kXFxcIj5DcmVhdGluZyBhIHRvZG8gYXBwIHBhcnQgMiAtIHBlcnNpc3RlbmNlPC9hPiwgd2hlcmUgd2Ugd2lsbCBnbyB0aHJvdWdoIGFkZGluZyBkYXRhIHBlcnNpc3RlbmNlIGZ1bmN0aW9uYWxpdHkuPC9wPlxcblwiLFwiRGVidWdnaW5nLm1kXCI6XCI8aDE+PGEgbmFtZT1cXFwiZGVidWdnaW5nLWEtbWlzby1hcHBcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNkZWJ1Z2dpbmctYS1taXNvLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5EZWJ1Z2dpbmcgYSBtaXNvIGFwcDwvc3Bhbj48L2E+PC9oMT48cD5JbiBvcmRlciB0byBkZWJ1ZyBhIG1pc28gYXBwLCAob3IgYW55IGlzb21vcnBoaWMgSmF2YVNjcmlwdCBhcHAgZm9yIHRoYXQgbWF0dGVyKSwgeW91JiMzOTtsbCBuZWVkIHRvIGJlIGFibGUgdG8gZGVidWcgb24gYm90aCB0aGUgY2xpZW50IGFuZCB0aGUgc2VydmVyLiBIZXJlIHdlIHdpbGwgZGVtb25zdHJhdGUgZGVidWdnaW5nIHRoZSBjbGllbnQtc2lkZSBjb2RlIHVzaW5nIENocm9tZSwgYW5kIHRoZSBzZXJ2ZXIgY29kZSB1c2luZyBKZXRCcmFpbnMgV2ViU3Rvcm0gOS4gTWlzbyBjYW4gYWN0dWFsbHkgYmUgZGVidWdnZWQgdXNpbmcgYW55IHN0YW5kYXJkIG5vZGUgYW5kIGNsaWVudC1zaWRlIGRlYnVnZ2luZyB0b29scyB0aGF0IHN1cHBvcnQgc291cmNlIG1hcHMuPC9wPlxcbjxwPkluIHRoaXMgZXhhbXBsZSB3ZSYjMzk7cmUgZ29pbmcgdG8gZGVidWcgdGhlIGV4YW1wbGUgPGNvZGU+dG9kb3M8L2NvZGU+IGFwcCwgc28gYmUgc3VyZSB5b3Uga25vdyBob3cgaXQgd29ya3MsIGFuZCB5b3Uga25vdyBob3cgdG8gaW5zdGFsbCBpdCAtIGlmIHlvdSBkb24mIzM5O3Qga25vdyBob3csIHBsZWFzZSByZWFkIHRoZSA8YSBocmVmPVxcXCIvZG9jL0NyZWF0aW5nLWEtdG9kby1hcHAubWRcXFwiPnRvZG9zIGFwcCB0dXRvcmlhbDwvYT4gZmlyc3QuPC9wPlxcbjxibG9ja3F1b3RlPlxcbk9uZSB0aGluZyB0byBrZWVwIGluIG1pbmQgaXMgaG93IG1pc28gd29ya3M6IGl0IGlzIGlzb21vcnBoaWMgd2hpY2ggbWVhbnMgdGhhdCB0aGUgY29kZSB3ZSBoYXZlIGlzIGFibGUgdG8gcnVuIGJvdGggc2VydmVyIGFuZCBjbGllbnQgc2lkZS4gT2YgY291cnNlIGl0IGRvZXNuJiMzOTt0IGFsd2F5cyBydW4gb24gYm90aCBzaWRlcywgc28gaGVyZSBpcyBhIGhhbmR5IGxpdHRsZSB0YWJsZSB0byBleHBsYWluIHdoYXQgdHlwaWNhbGx5IHJ1bnMgd2hlcmUgYW5kIHdoZW4sIGZvciB0aGUgdG9kb3MgZXhhbXBsZTpcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkZpbGU8L3RoPlxcbjx0aD5hY3Rpb248L3RoPlxcbjx0aD5TZXJ2ZXI8L3RoPlxcbjx0aD5DbGllbnQ8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD4vbXZjL3RvZG8uanM8L3RkPlxcbjx0ZD5pbmRleDwvdGQ+XFxuPHRkPlJ1bnMgd2hlbiBhIGJyb3dzZXIgbG9hZHMgdXAgPGNvZGU+L3RvZG9zPC9jb2RlPjwvdGQ+XFxuPHRkPlJ1bnMgd2hlbiB5b3UgaW50ZXJhY3Qgd2l0aCBhbnl0aGluZzwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIuYXBpLmpzPC90ZD5cXG48dGQ+ZmluZDwvdGQ+XFxuPHRkPlJ1bnMgd2hlbiBpbmRleCBpcyBydW4gZWl0aGVyIHNlcnZlciAoZGlyZWN0bHkpIG9yIGNsaWVudCBzaWRlICh0aHJvdWdoIHRoZSBhcGkpPC90ZD5cXG48dGQ+TmV2ZXIgcnVucyBvbiB0aGUgY2xpZW50IC0gYW4gYWpheCByZXF1ZXN0IGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGJ5IG1pc288L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxwPlRob3NlIGFyZSB0aGUgb25seSBmaWxlcyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0b2RvcyBleGFtcGxlLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiY2xpZW50LXNpZGUtbWlzby1kZWJ1Z2dpbmdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNjbGllbnQtc2lkZS1taXNvLWRlYnVnZ2luZ1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5DbGllbnQtc2lkZSBtaXNvIGRlYnVnZ2luZzwvc3Bhbj48L2E+PC9oMj48cD5GaXJzdGx5IGxldCB1cyBtYWtlIHN1cmUgdGhhdCB3ZSYjMzk7dmUgY29uZmlndXJlZCBDaHJvbWUgY29ycmVjdGx5OjwvcD5cXG48dWw+XFxuPGxpPk9wZW4gdGhlIGRldiB0b29scyAoQ01EICsgQUxUICsgSiBvbiBNYWMsIEYxMiBvbiBQQyk8L2xpPlxcbjxsaT5DbGljayB0aGUgc2V0dGluZyBjb2cgPC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL2Nocm9tZV9jb2cuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSBjb2dcXFwiPjwvcD5cXG48dWw+XFxuPGxpPlNjcm9sbCBkb3duIHRvIHRoZSAmcXVvdDtTb3VyY2VzJnF1b3Q7IHNlY3Rpb248L2xpPlxcbjxsaT5NYWtlIHN1cmUgdGhhdCAmcXVvdDtFbmFibGUgSmF2YVNjcmlwdCBzb3VyY2UgbWFwcyZxdW90OyBpcyB0aWNrZWQgYW5kIGNsb3NlIHRoZSBzZXR0aW5ncy48L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX3NldHRpbmdzLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+Tm93IENocm9tZSBpcyByZWFkeSB0byBpbnRlcmFjdCB3aXRoIG1pc28uIE5leHQgcnVuIHRoZSBtaXNvIHRvZG8gYXBwIGluIGRldmVsb3BtZW50IG1vZGUgLSBpLmUuIGluIHRoZSBkaXJlY3RvcnkgeW91IHNldHVwIG1pc28sIHJ1biB0aGUgZm9sbG93aW5nOjwvcD5cXG48cHJlPjxjb2RlPm1pc28gcnVuXFxuPC9jb2RlPjwvcHJlPjxwPldoZW4geW91JiMzOTtyZSB1cCBhbmQgcnVubmluZywgZ28gdG8gdGhlIHRvZG9zIFVSTCwgaWYgZXZlcnl0aGluZyBpcyBzZXR1cCB3aXRoIGRlZmF1bHRzLCBpdCB3aWxsIGJlOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL3RvZG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvdG9kb3M8L2E+PC9wPlxcbjxwPk5leHQgb3BlbiB0aGUgZGV2IHRvb2xzIGluIENocm9tZSBhbmQ6PC9wPlxcbjx1bD5cXG48bGk+Q2xpY2sgdGhlICZxdW90O1NvdXJjZXMmcXVvdDsgdGFiPC9saT5cXG48bGk+T3BlbiB0aGUgJnF1b3Q7bXZjJnF1b3Q7IGZvbGRlcjwvbGk+XFxuPGxpPkNsaWNrIG9uIHRoZSAmcXVvdDt0b2RvLmpzJnF1b3Q7IGZpbGU8L2xpPlxcbjwvdWw+XFxuPHA+WW91IHNob3VsZCBub3cgc2VlIGEgdG9kby5qcyBmaWxlIGluIHRoZSByaWdodC1oYW5kIHBhbmU8L3A+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvY2hyb21lX3NvdXJjZV90b2Rvcy5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjx1bD5cXG48bGk+U2Nyb2xsIGRvd24gdG8gdGhlIGxhc3QgbGluZSBpbnNpZGUgdGhlIDxjb2RlPmFkZFRvZG88L2NvZGU+IG1ldGhvZDwvbGk+XFxuPGxpPkNsaWNrIG9uIHRoZSBsaW5lLW51bWJlciBuZXh0IHRvIHRoZSByZXR1cm4gc3RhdGVtZW50IHRvIHNldCBhIGJyZWFrcG9pbnQ8L2xpPlxcbjwvdWw+XFxuPHA+WW91IHNob3VsZCBub3cgc2VlIGEgbWFyayBuZXh0IHRvIHRoZSBsaW5lLCBhbmQgYSBicmVha3BvaW50IGluIHRoZSBsaXN0IG9mIGJyZWFrcG9pbnRzLjwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfYnJlYWtwb2ludC5qcGdcXFwiIGFsdD1cXFwiQ2hyb21lIHRvZG9zIHNvdXJjZVxcXCI+PC9wPlxcbjxwPk5vdyB3ZSB3YW50IHRvIHRyeSBhbmQgdHJpZ2dlciB0aGF0IGJyZWFrcG9pbnQ6PC9wPlxcbjx1bD5cXG48bGk+RW50ZXIgYSB2YWx1ZSBpbiB0aGUgJnF1b3Q7QWRkIHRvZG8mcXVvdDsgYm94PC9saT5cXG48bGk+Q2xpY2sgdGhlICZxdW90O0FkZCZxdW90OyBidXR0b248L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvbWlzb190b2Rvc19hZGQuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5Zb3Ugc2hvdWxkIG5vdyBzZWUgdGhlIGJyZWFrcG9pbnQgaW4gYWN0aW9uLCBjb21wbGV0ZSB3aXRoIHlvdXIgdmFsdWUgaW4gdGhlIGxvY2FsIHNjb3BlLjwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy9jaHJvbWVfYnJlYWtwb2ludF9hY3RpdmUuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5BbmQgdGhhdCYjMzk7cyBpdCBmb3IgY2xpZW50LXNpZGUgZGVidWdnaW5nIC0geW91IGNhbiBub3cgdXNlIHRoZSBDaHJvbWUgZGVidWdnZXIgdG8gaW5zcGVjdCBhbmQgbWFuaXB1bGF0ZSB2YWx1ZXMsIGV0Yy4uLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwic2VydmVyLXNpZGUtbWlzby1kZWJ1Z2dpbmdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNzZXJ2ZXItc2lkZS1taXNvLWRlYnVnZ2luZ1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5TZXJ2ZXItc2lkZSBtaXNvIGRlYnVnZ2luZzwvc3Bhbj48L2E+PC9oMj48YmxvY2txdW90ZT5cXG5Ob3RlOiBQbGVhc2UgY2xlYXIgYW55IGJyZWFrcG9pbnQgeW91IG1pZ2h0IGhhdmUgc2V0IGluIENocm9tZSwgc28gaXQgd29uJiMzOTt0IGludGVyZmVyZSB3aXRoIG91ciBzZXJ2ZXItc2lkZSBkZWJ1Z2dpbmcgc2Vzc2lvbiAtIG9mIGNvdXJzZSB5b3UgY2FuIHVzZSBib3RoIHRvZ2V0aGVyLCBidXQgZm9yIG5vdyBsZXQgdXMgY2xlYXIgdGhlbSwgYW5kIGFsc28gc3RvcCB0aGUgbWlzbyBzZXJ2ZXIsIGlmIGl0IGlzIHN0aWxsIHJ1bm5pbmcsIGFzIHdlIHdpbGwgZ2V0IFdlYlN0b3JtIHRvIGhhbmRsZSBpdCBmb3IgdXMuXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwPkluIHRoaXMgZXhhbXBsZSB3ZSYjMzk7cmUgZ29pbmcgdG8gdXNlIDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5XZWJTdG9ybTwvYT4gLSB5b3UgY2FuIHVzZSBhbnkgSURFIHRoYXQgc3VwcG9ydHMgbm9kZSBkZWJ1Z2dpbmcsIG9yIGZyZWUgdG9vbHMgc3VjaCBhcyA8YSBocmVmPVxcXCIvZG9jL25vZGUtaW5zcGVjdG9yLm1kXFxcIj5ub2RlLWluc3BlY3RvcjwvYT4sIHNvIHRoaXMgaXMgc2ltcGx5IGZvciBpbGx1c3RyYXRpdmUgcHVycG9zZXMuPC9wPlxcbjxwPkZpcnN0IHdlIG5lZWQgdG8gc2V0dXAgb3VyIHByb2plY3QsIHNvIGluIFdlYnN0b3JtOjwvcD5cXG48dWw+XFxuPGxpPkNyZWF0ZSBhIG5ldyBwcm9qZWN0LCBzZXR0aW5nIHlvdXIgbWlzbyBkaXJlY3RvcnkgYXMgdGhlIHJvb3QuPC9saT5cXG48bGk+QWRkIGEgbmV3IG5vZGUgcHJvamVjdCBjb25maWd1cmF0aW9uLCB3aXRoIHRoZSBmb2xsb3dpbmcgc2V0dGluZ3M6PC9saT5cXG48L3VsPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2NvbmZpZ3VyZV9wcm9qZWN0LmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHVsPlxcbjxsaT5Ob3cgaGl0IHRoZSBkZWJ1ZyBidXR0b248L2xpPlxcbjwvdWw+XFxuPHA+PGltZyBzcmM9XFxcImh0dHA6Ly9qc2d1eS5jb20vbWlzb19pbWcvd2Vic3Rvcm1fZGVidWdfYnV0dG9uLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+WW91IHNob3VsZCBzZWUgbWlzbyBydW5uaW5nIGluIHRoZSBXZWJTdG9ybSBjb25zb2xlIGxpa2Ugc286PC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2NvbnNvbGUuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48dWw+XFxuPGxpPk5vdyBvcGVuIDxjb2RlPi9zeXN0ZW0vYXBpL2ZsYXRmaWxlZGIvZmxhdGZpbGVkYi5hcGkuanM8L2NvZGU+LCBhbmQgcHV0IGEgYnJlYWtwb2ludCBvbiB0aGUgbGFzdCBsaW5lIG9mIHRoZSA8Y29kZT5maW5kPC9jb2RlPiBtZXRob2QuPC9saT5cXG48L3VsPlxcbjxwPk5vdyBpZiB5b3UgZ28gYmFjayB0byB5b3VyIGJyb3dzZXIgdG9kb3MgYXBwOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL3RvZG9zLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvdG9kb3M8L2E+PC9wPlxcbjxwPlJlbG9hZCB0aGUgcGFnZSwgYW5kIHlvdSB3aWxsIHNlZSB0aGUgYnJlYWtwb2ludCBiZWluZyBhY3RpdmF0ZWQgaW4gV2ViU3Rvcm06PC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJodHRwOi8vanNndXkuY29tL21pc29faW1nL3dlYnN0b3JtX2JyZWFrcG9pbnRfYWN0aXZlLmpwZ1xcXCIgYWx0PVxcXCJDaHJvbWUgdG9kb3Mgc291cmNlXFxcIj48L3A+XFxuPHA+Tm93IGNsaWNrIHRoZSAmcXVvdDtyZXN1bWUgcHJvZ3JhbSBidXR0b24mcXVvdDssIGFuZCB5b3UmIzM5O2xsIHNlZSB0aGF0IHRoZSBicmVha3BvaW50IGl0IGlzIGltbWVkaWF0ZWx5IGludm9rZWQgYWdhaW4hIDwvcD5cXG48cD48aW1nIHNyYz1cXFwiaHR0cDovL2pzZ3V5LmNvbS9taXNvX2ltZy93ZWJzdG9ybV9icmVha3BvaW50X2RhdGEuanBnXFxcIiBhbHQ9XFxcIkNocm9tZSB0b2RvcyBzb3VyY2VcXFwiPjwvcD5cXG48cD5UaGlzIGlzIHNpbXBseSBiZWNhdXNlIG1pc28gcmVuZGVycyB0aGUgZmlyc3QgcGFnZSBvbiB0aGUgc2VydmVyIC0gc28gZGVwZW5kaW5nIG9uIGhvdyB5b3Ugc3RydWN0dXJlIHlvdXIgcXVlcmllcywgaXQgd2lsbCB1c2UgdGhlIEFQSSB0d2ljZSAtIG9uY2UgZnJvbSB0aGUgc2VydmVyIHNpZGUgcmVuZGVyaW5nLCBhbmQgb25jZSBmcm9tIHRoZSBjbGllbnQtc2lkZS4gRG9uJiMzOTt0IHdvcnJ5IC0gdGhpcyBvbmx5IGhhcHBlbnMgb24gaW5pdGlhbCBwYWdlIGxvYWQgaW4gb3JkZXIgdG8gcmVuZGVyIHRoZSBmaXJzdCBwYWdlIGJvdGggc2VydmVyIHNpZGUgYW5kIGNsaWVudCBzaWRlLCB5b3UgY2FuIHJlYWQgbW9yZSBhYm91dCBob3cgdGhhdCB3b3JrcyBoZXJlOjwvcD5cXG48cD48YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzI2ZpcnN0LXBhZ2UtbG9hZC5tZFxcXCI+SG93IG1pc28gd29ya3M6IEZpcnN0IHBhZ2UgbG9hZDwvYT48L3A+XFxuPHA+U28sIHlvdSBhcmUgbm93IGFibGUgdG8gaW5zcGVjdCB0aGUgdmFsdWVzLCBhbmQgZG8gYW55IGtpbmQgb2Ygc2VydmVyIHNpZGUgZGVidWdnaW5nIHlvdSBsaWtlLjwvcD5cXG5cIixcIkdldHRpbmctc3RhcnRlZC5tZFwiOlwiPHA+VGhpcyBndWlkZSB3aWxsIHRha2UgeW91IHRocm91Z2ggbWFraW5nIHlvdXIgZmlyc3QgbWlzbyBhcHAsIGl0IGlzIGFzc3VtZWQgdGhhdCB5b3Uga25vdyB0aGUgYmFzaWNzIG9mIGhvdyB0byB1c2Ugbm9kZWpzIGFuZCBtaXRocmlsLjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiaW5zdGFsbGF0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjaW5zdGFsbGF0aW9uXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkluc3RhbGxhdGlvbjwvc3Bhbj48L2E+PC9oMj48cD5UbyBpbnN0YWxsIG1pc28sIHVzZSBucG06PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bnBtIGluc3RhbGwgbWlzb2pzIC1nXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRvIGNyZWF0ZSBhbmQgcnVuIGEgbWlzbyBhcHAgaW4gYSBuZXcgZGlyZWN0b3J5OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1pc28gLW4gbXlhcHBcXG5jZCBteWFwcFxcbm1pc28gcnVuXFxuPC9jb2RlPjwvcHJlPlxcbjxwPllvdSBzaG91bGQgbm93IHNlZSBzb21ldGhpbmcgbGlrZTo8L3A+XFxuPHByZT48Y29kZT5NaXNvIGlzIGxpc3RlbmluZyBhdCBodHRwOi8vbG9jYWxob3N0OjY0NzYgaW4gZGV2ZWxvcG1lbnQgbW9kZVxcbjwvY29kZT48L3ByZT48cD5PcGVuIHlvdXIgYnJvd3NlciBhdCA8Y29kZT5odHRwOi8vbG9jYWxob3N0OjY0NzY8L2NvZGU+IGFuZCB5b3Ugd2lsbCBzZWUgdGhlIGRlZmF1bHQgbWlzbyBzY3JlZW48L3A+XFxuPGgyPjxhIG5hbWU9XFxcImhlbGxvLXdvcmxkLWFwcFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2hlbGxvLXdvcmxkLWFwcFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5IZWxsbyB3b3JsZCBhcHA8L3NwYW4+PC9hPjwvaDI+PHA+Q3JlYXRlIGEgbmV3IGZpbGUgPGNvZGU+aGVsbG8uanM8L2NvZGU+IGluIDxjb2RlPm15YXBwL212YzwvY29kZT4gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKTtcXG5cXG52YXIgZWRpdCA9IG1vZHVsZS5leHBvcnRzLmVkaXQgPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgaGVsbG86IGZ1bmN0aW9uKGRhdGEpe1xcbiAgICAgICAgICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgICAgIH1cXG4gICAgfSxcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IGVkaXQubW9kZWxzLmhlbGxvKHt3aG86IHdob30pO1xcbiAgICAgICAgcmV0dXJuIHRoaXM7XFxuICAgIH0sXFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIERJVigmcXVvdDtIZWxsbyAmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpKTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZW4gb3BlbiA8YSBocmVmPVxcXCIvZG9jL1lPVVJOQU1FLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0OjY0NzYvaGVsbG8vWU9VUk5BTUU8L2E+IGFuZCB5b3Ugc2hvdWxkIHNlZSAmcXVvdDtIZWxsbyBZT1VSTkFNRSZxdW90Oy4gQ2hhbmdlIHRoZSB1cmwgdG8gaGF2ZSB5b3VyIGFjdHVhbCBuYW1lIGluc3RlYWQgb2YgWU9VUk5BTUUsIHlvdSBub3cga25vdyBtaXNvIDopPC9wPlxcbjxwPkxldCB1cyB0YWtlIGEgbG9vayBhdCB3aGF0IGVhY2ggcGllY2Ugb2YgdGhlIGNvZGUgaXMgYWN0dWFsbHkgZG9pbmc6PC9wPlxcbjxoMz48YSBuYW1lPVxcXCJpbmNsdWRlc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2luY2x1ZGVzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkluY2x1ZGVzPC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IE1pdGhyaWwgaXMgdGhlIG9ubHkgcmVxdWlyZWQgbGlicmFyeSB3aGVuIGFwcHMsIGJ1dCB1c2luZyBvdGhlciBpbmNsdWRlZCBsaWJyYXJpZXMgaXMgdmVyeSB1c2VmdWxcXG48L2Jsb2NrcXVvdGU+XFxuXFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTttaXRocmlsLnN1Z2FydGFncyYjMzk7KShtKTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+SGVyZSB3ZSBncmFiIG1pdGhyaWwsIHRoZW4gbWlzbyB1dGlsaXRpZXMgYW5kIHN1Z2FyIHRhZ3MgLSB0ZWNobmljYWxseSBzcGVha2luZywgd2UgcmVhbGx5IG9ubHkgbmVlZCBtaXRocmlsLCBidXQgdGhlIG90aGVyIGxpYnJhcmllcyBhcmUgdmVyeSB1c2VmdWwgYXMgd2VsbCBhcyB3ZSB3aWxsIHNlZS48L3A+XFxuPGgzPjxhIG5hbWU9XFxcIm1vZGVsc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI21vZGVsc1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Nb2RlbHM8L3NwYW4+PC9hPjwvaDM+PGJsb2NrcXVvdGU+XFxuU3VtbWFyeTogVXNlIHRoZSBhdXRvbWF0aWMgcm91dGluZyB3aGVuIHlvdSBjYW4sIGFsd2F5cyBwdXQgbW9kZWxzIG9uIHRoZSAmIzM5O21vZGVscyYjMzk7IGF0dHJpYnV0ZSBvZiB5b3VyIG12YyBmaWxlXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIGVkaXQgPSBtb2R1bGUuZXhwb3J0cy5lZGl0ID0ge1xcbiAgICBtb2RlbHM6IHtcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucHJvcChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuPC9jb2RlPjwvcHJlPlxcbjxwPkhlcmUgYSBmZXcgaW1wb3J0YW50IHRoaW5ncyBhcmUgZ29pbmcgb246PC9wPlxcbjx1bD5cXG48bGk+PHA+QnkgcGxhY2luZyBvdXIgPGNvZGU+bXZjPC9jb2RlPiBvYmplY3Qgb24gPGNvZGU+bW9kdWxlLmV4cG9ydHMuZWRpdDwvY29kZT4sIGF1dG9tYXRpYyByb3V0aW5nIGlzIGFwcGxpZWQgYnkgbWlzbyAtIHlvdSBjYW4gcmVhZCBtb3JlIGFib3V0IDxhIGhyZWY9XFxcIi9kb2MvSG93LW1pc28td29ya3Mjcm91dGUtYnktY29udmVudGlvbi5tZFxcXCI+aG93IHRoZSBhdXRvbWF0aWMgcm91dGluZyB3b3JrcyBoZXJlPC9hPi4gPC9wPlxcbjwvbGk+XFxuPGxpPjxwPlBsYWNpbmcgb3VyIDxjb2RlPmhlbGxvPC9jb2RlPiBtb2RlbCBvbiB0aGUgPGNvZGU+bW9kZWxzPC9jb2RlPiBhdHRyaWJ1dGUgb2YgdGhlIG9iamVjdCBlbnN1cmVzIHRoYXQgbWlzbyBjYW4gZmlndXJlIG91dCB3aGF0IHlvdXIgbW9kZWxzIGFyZSwgYW5kIHdpbGwgY3JlYXRlIGEgcGVyc2lzdGVuY2UgQVBJIGF1dG9tYXRpY2FsbHkgZm9yIHlvdSB3aGVuIHRoZSBzZXJ2ZXIgc3RhcnRzIHVwLCBzbyB0aGF0IHlvdSBjYW4gc2F2ZSB5b3VyIG1vZGVscyBpbnRvIHRoZSBkYXRhYmFzZS48L3A+XFxuPC9saT5cXG48L3VsPlxcbjxoMz48YSBuYW1lPVxcXCJjb250cm9sbGVyXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY29udHJvbGxlclxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Db250cm9sbGVyPC9zcGFuPjwvYT48L2gzPjxibG9ja3F1b3RlPlxcblN1bW1hcnk6IERPIE5PVCBmb3JnZXQgdG8gJiMzOTtyZXR1cm4gdGhpczsmIzM5OyBpbiB0aGUgY29udHJvbGxlciwgaXQgaXMgdml0YWwhXFxuPC9ibG9ja3F1b3RlPlxcblxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Y29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgIHZhciB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7aGVsbG9faWQmIzM5OywgcGFyYW1zKTtcXG4gICAgdGhpcy5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgcmV0dXJuIHRoaXM7XFxufSxcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlIGNvbnRyb2xsZXIgdXNlcyA8Y29kZT5taXNvLmdldFBhcmFtPC9jb2RlPiB0byByZXRyZWl2ZSB0aGUgcGFyYW1ldGVyIC0gdGhpcyBpcyBzbyB0aGF0IGl0IGNhbiB3b3JrIHNlYW1sZXNzbHkgb24gYm90aCB0aGUgc2VydmVyIGFuZCBjbGllbnQgc2lkZS4gV2UgY3JlYXRlIGEgbmV3IG1vZGVsLCBhbmQgdmVyeSBpbXBvcnRhbnRseSA8Y29kZT5yZXR1cm4gdGhpczwvY29kZT4gZW5zdXJlcyB0aGF0IG1pc28gY2FuIGdldCBhY2Nlc3MgdG8gdGhlIGNvbnRyb2xsZXIgY29ycmVjdGx5LjwvcD5cXG48aDM+PGEgbmFtZT1cXFwidmlld1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3ZpZXdcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Vmlldzwvc3Bhbj48L2E+PC9oMz48YmxvY2txdW90ZT5cXG5TdW1tYXJ5OiBVc2Ugc3VnYXJ0YWdzIHRvIG1ha2UgdGhlIHZpZXcgbG9vayBtb3JlIGxpa2UgSFRNTFxcbjwvYmxvY2txdW90ZT5cXG5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcXG4gICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgIHJldHVybiBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgY3RybC5tb2RlbC53aG8oKSk7XFxuICAgIH1cXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoZSB2aWV3IGlzIHNpbXBseSBhIGphdmFzY3JpcHQgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RydWN0dXJlLiBIZXJlIHdlIHVzZSB0aGUgPGNvZGU+c3VnYXJ0YWdzPC9jb2RlPiBsaWJyYXJ5IHRvIHJlbmRlciB0aGUgRElWIHRhZyAtIHRoaXMgaXMgc3RyaWN0bHkgbm90IHJlcXVpcmVkLCBidXQgSSBmaW5kIHRoYXQgcGVvcGxlIHRlbmQgdG8gdW5kZXJzdGFuZCB0aGUgc3VnYXJ0YWdzIHN5bnRheCBiZXR0ZXIgdGhhbiBwdXJlIG1pdGhyaWwsIGFzIGl0IGxvb2tzIGEgbGl0dGxlIG1vcmUgbGlrZSBIVE1MLCB0aG91Z2ggb2YgY291cnNlIHlvdSBjb3VsZCB1c2Ugc3RhbmRhcmQgbWl0aHJpbCBzeW50YXggaWYgeW91IHByZWZlci48L3A+XFxuPGgzPjxhIG5hbWU9XFxcIm5leHRcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNuZXh0XFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPk5leHQ8L3NwYW4+PC9hPjwvaDM+PHA+WW91IG5vdyBoYXZlIGEgY29tcGxldGUgaGVsbG8gd29ybGQgYXBwLCBhbmQgdW5kZXJzdGFuZCB0aGUgZnVuZGFtZW50YWxzIG9mIHRoZSBzdHJ1Y3R1cmUgb2YgYSBtaXNvIG12YyBhcHBsaWNhdGlvbi48L3A+XFxuPHA+V2UgaGF2ZSBvbmx5IGp1c3Qgc2NyYXBlZCB0aGUgc3VyZmFjZSBvZiB3aGF0IG1pc28gaXMgY2FwYWJsZSBvZiwgc28gbmV4dCB3ZSByZWNvbW1lbmQgeW91IHJlYWQ6PC9wPlxcbjxwPjxhIGhyZWY9XFxcIi9kb2MvQ3JlYXRpbmctYS10b2RvLWFwcC5tZFxcXCI+Q3JlYXRpbmcgYSB0b2RvIGFwcDwvYT48L3A+XFxuXCIsXCJHb2Fscy5tZFwiOlwiPGgxPjxhIG5hbWU9XFxcInByaW1hcnktZ29hbHNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNwcmltYXJ5LWdvYWxzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlByaW1hcnkgZ29hbHM8L3NwYW4+PC9hPjwvaDE+PHVsPlxcbjxsaT5FYXN5IHNldHVwIG9mIDxhIGhyZWY9XFxcIi9kb2MvLm1kXFxcIj5pc29tb3JwaGljPC9hPiBhcHBsaWNhdGlvbiBiYXNlZCBvbiA8YSBocmVmPVxcXCIvZG9jL21pdGhyaWwuanMubWRcXFwiPm1pdGhyaWw8L2E+PC9saT5cXG48bGk+U2tlbGV0b24gLyBzY2FmZm9sZCAvIEJvaWxlcnBsYXRlIHRvIGFsbG93IHVzZXJzIHRvIHZlcnkgcXVpY2tseSBnZXQgdXAgYW5kIHJ1bm5pbmcuPC9saT5cXG48bGk+bWluaW1hbCBjb3JlPC9saT5cXG48bGk+ZWFzeSBleHRlbmRpYmxlPC9saT5cXG48bGk+REIgYWdub3N0aWMgKGUuIEcuIHBsdWdpbnMgZm9yIGRpZmZlcmVudCBPUk0vT0RNKTwvbGk+XFxuPC91bD5cXG48aDE+PGEgbmFtZT1cXFwiY29tcG9uZW50c1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2NvbXBvbmVudHNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+Q29tcG9uZW50czwvc3Bhbj48L2E+PC9oMT48dWw+XFxuPGxpPlJvdXRpbmc8L2xpPlxcbjxsaT5WaWV3IHJlbmRlcmluZzwvbGk+XFxuPGxpPmkxOG4vbDEwbjwvbGk+XFxuPGxpPlJlc3QtQVBJIChjb3VsZCB1c2UgcmVzdGlmeTogPGEgaHJlZj1cXFwiL2RvYy8ubWRcXFwiPmh0dHA6Ly9tY2F2YWdlLm1lL25vZGUtcmVzdGlmeS88L2E+KTwvbGk+XFxuPGxpPm9wdGlvbmFsIFdlYnNvY2tldHMgKGNvdWxkIHVzZSByZXN0aWZ5OiA8YSBocmVmPVxcXCIvZG9jLy5tZFxcXCI+aHR0cDovL21jYXZhZ2UubWUvbm9kZS1yZXN0aWZ5LzwvYT4pPC9saT5cXG48bGk+ZWFzeSB0ZXN0aW5nIChoZWFkbGVzcyBhbmQgQnJvd3Nlci1UZXN0cyk8L2xpPlxcbjxsaT5sb2dpbi9zZXNzaW9uIGhhbmRsaW5nPC9saT5cXG48bGk+bW9kZWxzIHdpdGggdmFsaWRhdGlvbjwvbGk+XFxuPC91bD5cXG48aDE+PGEgbmFtZT1cXFwidXNlZnVsLWxpYnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiN1c2VmdWwtbGlic1xcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Vc2VmdWwgbGliczwvc3Bhbj48L2E+PC9oMT48cD5IZXJlIGFyZSBzb21lIGxpYnJhcmllcyB3ZSBhcmUgY29uc2lkZXJpbmcgdXNpbmcsIChpbiBubyBwYXJ0aWN1bGFyIG9yZGVyKTo8L3A+XFxuPHVsPlxcbjxsaT5sZXZlbGRiPC9saT5cXG48bGk+bWl0aHJpbC1xdWVyeTwvbGk+XFxuPGxpPnRyYW5zbGF0ZS5qczwvbGk+XFxuPGxpPmkxOG5leHQ8L2xpPlxcbjwvdWw+XFxuPHA+QW5kIHNvbWUgdGhhdCB3ZSYjMzk7cmUgYWxyZWFkeSB1c2luZzo8L3A+XFxuPHVsPlxcbjxsaT5leHByZXNzPC9saT5cXG48bGk+YnJvd3NlcmlmeTwvbGk+XFxuPGxpPm1vY2hhL2V4cGVjdDwvbGk+XFxuPGxpPm1pdGhyaWwtbm9kZS1yZW5kZXI8L2xpPlxcbjxsaT5taXRocmlsLXN1Z2FydGFnczwvbGk+XFxuPGxpPm1pdGhyaWwtYmluZGluZ3M8L2xpPlxcbjxsaT5taXRocmlsLWFuaW1hdGU8L2xpPlxcbjxsaT5sb2Rhc2g8L2xpPlxcbjxsaT52YWxpZGF0b3I8L2xpPlxcbjwvdWw+XFxuXCIsXCJIb21lLm1kXCI6XCI8cD5XZWxjb21lIHRvIHRoZSBtaXNvanMgd2lraSE8L3A+XFxuPGgyPjxhIG5hbWU9XFxcImdldHRpbmctc3RhcnRlZFxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2dldHRpbmctc3RhcnRlZFxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5HZXR0aW5nIHN0YXJ0ZWQ8L3NwYW4+PC9hPjwvaDI+PHA+UmVhZCB0aGUgPGEgaHJlZj1cXFwiL2RvYy9HZXR0aW5nLXN0YXJ0ZWQubWRcXFwiPkdldHRpbmcgc3RhcnRlZDwvYT4gZ3VpZGUhPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJtb3JlLWluZm9cXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtb3JlLWluZm9cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TW9yZSBpbmZvPC9zcGFuPjwvYT48L2gyPjxwPlNlZSB0aGUgPGEgaHJlZj1cXFwiL2RvYy9taXNvanMjaW5zdGFsbC5tZFxcXCI+aW5zdGFsbCBndWlkZTwvYT4uXFxuUmVhZCA8YSBocmVmPVxcXCIvZG9jL0hvdy1taXNvLXdvcmtzLm1kXFxcIj5ob3cgbWlzbyB3b3JrczwvYT4sIGFuZCBjaGVjayBvdXQgPGEgaHJlZj1cXFwiL2RvYy9QYXR0ZXJucy5tZFxcXCI+dGhlIHBhdHRlcm5zPC9hPiwgdGhlbiBjcmVhdGUgc29tZXRoaW5nIGNvb2whPC9wPlxcblwiLFwiSG93LW1pc28td29ya3MubWRcIjpcIjxoMj48YSBuYW1lPVxcXCJtb2RlbHMtdmlld3MtY29udHJvbGxlcnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNtb2RlbHMtdmlld3MtY29udHJvbGxlcnNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TW9kZWxzLCB2aWV3cywgY29udHJvbGxlcnM8L3NwYW4+PC9hPjwvaDI+PHA+V2hlbiBjcmVhdGluZyBhIHJvdXRlLCB5b3UgbXVzdCBhc3NpZ24gYSBjb250cm9sbGVyIGFuZCBhIHZpZXcgdG8gaXQgLSB0aGlzIGlzIGFjaGlldmVkIGJ5IGNyZWF0aW5nIGEgZmlsZSBpbiB0aGUgPGNvZGU+L212YzwvY29kZT4gZGlyZWN0b3J5IC0gYnkgY29udmVudGlvbiwgeW91IHNob3VsZCBuYW1lIGl0IGFzIHBlciB0aGUgcGF0aCB5b3Ugd2FudCwgKHNlZSB0aGUgPGEgaHJlZj1cXFwiL2RvYy8jcm91dGluZy5tZFxcXCI+cm91dGluZyBzZWN0aW9uPC9hPiBmb3IgZGV0YWlscykuPC9wPlxcbjxwPkhlcmUgaXMgYSBtaW5pbWFsIGV4YW1wbGUgdXNpbmcgdGhlIHN1Z2FydGFncywgYW5kIGdldHRpbmcgYSBwYXJhbWV0ZXI6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgbWlzbyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pdGhyaWwuc3VnYXJ0YWdzLm5vZGUuanMmIzM5OykobSk7XFxuXFxubW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdGhpcy53aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7d2hvJiMzOTssIHBhcmFtcywgJiMzOTt3b3JsZCYjMzk7KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcXG4gICAgICAgIHdpdGgoc3VnYXJ0YWdzKSB7XFxuICAgICAgICAgICAgcmV0dXJuIERJVigmIzM5O0hlbGxvICYjMzk7ICsgY3RybC53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+U2F2ZSB0aGlzIGludG8gYSBmaWxlIDxjb2RlPi9tdmMvaGVsbG8uanM8L2NvZGU+LCBhbmQgb3BlbiA8YSBocmVmPVxcXCIvZG9jL2hlbGxvcy5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdC9oZWxsb3M8L2E+LCB0aGlzIHdpbGwgc2hvdyAmcXVvdDtIZWxsbyB3b3JsZCZxdW90Oy4gTm90ZSB0aGUgJiMzOTtzJiMzOTsgb24gdGhlIGVuZCAtIHRoaXMgaXMgZHVlIHRvIGhvdyB0aGUgPGEgaHJlZj1cXFwiL2RvYy8jcm91dGUtYnktY29udmVudGlvbi5tZFxcXCI+cm91dGUgYnkgY29udmVudGlvbjwvYT4gd29ya3MuPC9wPlxcbjxwPk5vdyBvcGVuIDxjb2RlPi9jZmcvcm91dGVzLmpzb248L2NvZGU+LCBhbmQgYWRkIHRoZSBmb2xsb3dpbmcgcm91dGVzOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPiAgICAmcXVvdDsvaGVsbG8mcXVvdDs6IHsgJnF1b3Q7bWV0aG9kJnF1b3Q7OiAmcXVvdDtnZXQmcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O2hlbGxvJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH0sXFxuICAgICZxdW90Oy9oZWxsby86d2hvJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtoZWxsbyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNhdmUgdGhlIGZpbGUsIGFuZCBnbyBiYWNrIHRvIHRoZSBicm93c2VyLCBhbmQgeW91JiMzOTtsbCBzZWUgYW4gZXJyb3IhIFRoaXMgaXMgYmVjYXVzZSB3ZSBoYXZlIG5vdyBvdmVycmlkZGVuIHRoZSBhdXRvbWF0aWMgcm91dGUuIE9wZW4gPGEgaHJlZj1cXFwiL2RvYy9oZWxsby5tZFxcXCI+aHR0cDovL2xvY2FsaG9zdC9oZWxsbzwvYT4sIGFuZCB5b3UmIzM5O2xsIHNlZSBvdXIgYWN0aW9uLiBOb3cgb3BlbiA8YSBocmVmPVxcXCIvZG9jL1lPVVJOQU1FLm1kXFxcIj5odHRwOi8vbG9jYWxob3N0L2hlbGxvL1lPVVJOQU1FPC9hPiwgYW5kIHlvdSYjMzk7bGwgc2VlIGl0IGdldHRpbmcgdGhlIGZpcnN0IHBhcmFtZXRlciwgYW5kIGdyZWV0aW5nIHlvdSE8L3A+XFxuPGgyPjxhIG5hbWU9XFxcInJvdXRpbmdcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyb3V0aW5nXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJvdXRpbmc8L3NwYW4+PC9hPjwvaDI+PHA+VGhlIHJvdXRpbmcgY2FuIGJlIGRlZmluZWQgaW4gb25lIG9mIHR3byB3YXlzPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJyb3V0ZS1ieS1jb252ZW50aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGUtYnktY29udmVudGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0ZSBieSBjb252ZW50aW9uPC9zcGFuPjwvYT48L2gzPjxwPllvdSBjYW4gdXNlIGEgbmFtaW5nIGNvbnZlbnRpb24gYXMgZm9sbG93czo8L3A+XFxuPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPkFjdGlvbjwvdGg+XFxuPHRoPk1ldGhvZDwvdGg+XFxuPHRoPlVSTDwvdGg+XFxuPHRoPkRlc2NyaXB0aW9uPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+aW5kZXg8L3RkPlxcbjx0ZD5HRVQ8L3RkPlxcbjx0ZD5bY29udHJvbGxlcl0gKyAmIzM5O3MmIzM5OzwvdGQ+XFxuPHRkPkxpc3QgdGhlIGl0ZW1zPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+ZWRpdDwvdGQ+XFxuPHRkPkdFVDwvdGQ+XFxuPHRkPltjb250cm9sbGVyXS9baWRdPC90ZD5cXG48dGQ+RGlzcGxheSBhIGZvcm0gdG8gZWRpdCB0aGUgaXRlbTwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPm5ldzwvdGQ+XFxuPHRkPkdFVDwvdGQ+XFxuPHRkPltjb250cm9sbGVyXSArICYjMzk7cyYjMzk7ICsgJiMzOTsvbmV3JiMzOTs8L3RkPlxcbjx0ZD5EaXNwbGF5IGEgZm9ybSB0byBhZGQgYSBuZXcgaXRlbTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuPHA+U2F5IHlvdSBoYXZlIGEgbXZjIGZpbGUgbmFtZWQgJnF1b3Q7dXNlci5qcyZxdW90OywgYW5kIHlvdSBkZWZpbmUgYW4gYWN0aW9uIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+bW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7Li4uXFxuPC9jb2RlPjwvcHJlPlxcbjxwPk1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IG1hcCBhICZxdW90O0dFVCZxdW90OyB0byAmcXVvdDsvdXNlcnMmcXVvdDsuPGJyPk5vdyBzYXkgeW91IGhhdmUgYSBtdmMgZmlsZSBuYW1lZCAmcXVvdDt1c2VyLmpzJnF1b3Q7LCBhbmQgeW91IGRlZmluZSBhbiBhY3Rpb24gbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5tb2R1bGUuZXhwb3J0cy5lZGl0ID0gey4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5NaXNvIHdpbGwgYXV0b21hdGljYWxseSBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gJnF1b3Q7L3VzZXIvOnVzZXJfaWQmcXVvdDssIHNvIHRoYXQgdXNlcnMgY2FuIGFjY2VzcyB2aWEgYSByb3V0ZSBzdWNoIGFzICZxdW90Oy91c2VyLzI3JnF1b3Q7IGZvciB1c2Ugd2l0aCBJRCBvZiAyNy4gPGVtPk5vdGU6PC9lbT4gWW91IGNhbiBnZXQgdGhlIHVzZXJfaWQgdXNpbmcgYSBtaXNvIHV0aWxpdHk6IDxjb2RlPnZhciB1c2VySWQgPSBtaXNvLmdldFBhcmFtKCYjMzk7dXNlcl9pZCYjMzk7LCBwYXJhbXMpOzwvY29kZT4uPC9wPlxcbjxoMz48YSBuYW1lPVxcXCJyb3V0ZS1ieS1jb25maWd1cmF0aW9uXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjcm91dGUtYnktY29uZmlndXJhdGlvblxcXCI+PHNwYW4gY2xhc3M9XFxcImhlYWRlci1saW5rXFxcIj5Sb3V0ZSBieSBjb25maWd1cmF0aW9uPC9zcGFuPjwvYT48L2gzPjxwPkJ5IHVzaW5nIDxjb2RlPi9jZmcvcm91dGVzLmpzb248L2NvZGU+IGNvbmZpZyBmaWxlOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPntcXG4gICAgJnF1b3Q7W1BhdHRlcm5dJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7W01ldGhvZF0mcXVvdDssICZxdW90O25hbWUmcXVvdDs6ICZxdW90O1tSb3V0ZSBuYW1lXSZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtbQWN0aW9uXSZxdW90OyB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5XaGVyZTo8L3A+XFxuPHVsPlxcbjxsaT48c3Ryb25nPlBhdHRlcm48L3N0cm9uZz4gLSB0aGUgPGEgaHJlZj1cXFwiL2RvYy8jcm91dGluZy1wYXR0ZXJucy5tZFxcXCI+cm91dGUgcGF0dGVybjwvYT4gd2Ugd2FudCwgaW5jbHVkaW5nIGFueSBwYXJhbWV0ZXJzPC9saT5cXG48bGk+PHN0cm9uZz5NZXRob2Q8L3N0cm9uZz4gLSBvbmUgb2YgJiMzOTtHRVQmIzM5OywgJiMzOTtQT1NUJiMzOTssICYjMzk7UFVUJiMzOTssICYjMzk7REVMRVRFJiMzOTs8L2xpPlxcbjxsaT48c3Ryb25nPlJvdXRlPC9zdHJvbmc+IG5hbWUgLSBuYW1lIG9mIHlvdXIgcm91dGUgZmlsZSBmcm9tIC9tdmM8L2xpPlxcbjxsaT48c3Ryb25nPkFjdGlvbjwvc3Ryb25nPiAtIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBjYWxsIG9uIHlvdXIgcm91dGUgZmlsZSBmcm9tIC9tdmM8L2xpPlxcbjwvdWw+XFxuPHA+PHN0cm9uZz5FeGFtcGxlPC9zdHJvbmc+PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+e1xcbiAgICAmcXVvdDsvJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDtob21lJnF1b3Q7LCAmcXVvdDthY3Rpb24mcXVvdDs6ICZxdW90O2luZGV4JnF1b3Q7IH1cXG59XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd2lsbCBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gdGhlIHJvb3Qgb2YgdGhlIFVSTCBmb3IgdGhlIDxjb2RlPmluZGV4PC9jb2RlPiBhY3Rpb24gaW4gPGNvZGU+aG9tZS5qczwvY29kZT48L3A+XFxuPHA+PHN0cm9uZz5Ob3RlOjwvc3Ryb25nPiBUaGUgcm91dGluZyBjb25maWcgd2lsbCBvdmVycmlkZSBhbnkgYXV0b21hdGljYWxseSBkZWZpbmVkIHJvdXRlcywgc28gaWYgeW91IG5lZWQgbXVsdGlwbGUgcm91dGVzIHRvIHBvaW50IHRvIHRoZSBzYW1lIGFjdGlvbiwgeW91IG11c3QgbWFudWFsbHkgZGVmaW5lIHRoZW0uIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhIG12YyBmaWxlIG5hbWVkICZxdW90O3Rlcm0uanMmcXVvdDssIGFuZCB5b3UgZGVmaW5lIGFuIGFjdGlvbiBsaWtlIHNvOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPm1vZHVsZS5leHBvcnRzLmluZGV4ID0gey4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5NaXNvIHdpbGwgYXV0b21hdGljYWxseSBtYXAgYSAmcXVvdDtHRVQmcXVvdDsgdG8gJnF1b3Q7L3Rlcm1zJnF1b3Q7LiBOb3csIGlmIHlvdSB3YW50IHRvIG1hcCBpdCBhbHNvIHRvICZxdW90Oy9BR0ImcXVvdDssIHlvdSB3aWxsIG5lZWQgdG8gYWRkIHR3byBlbnRyaWVzIGluIHRoZSByb3V0ZXMgY29uZmlnOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPntcXG4gICAgJnF1b3Q7L3Rlcm1zJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDt0ZXJtcyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9LFxcbiAgICAmcXVvdDsvQUdCJnF1b3Q7OiB7ICZxdW90O21ldGhvZCZxdW90OzogJnF1b3Q7Z2V0JnF1b3Q7LCAmcXVvdDtuYW1lJnF1b3Q7OiAmcXVvdDt0ZXJtcyZxdW90OywgJnF1b3Q7YWN0aW9uJnF1b3Q7OiAmcXVvdDtpbmRleCZxdW90OyB9XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIGlzIGJlY2F1c2UgTWlzbyBhc3N1bWVzIHRoYXQgaWYgeW91IG92ZXJyaWRlIHRoZSBkZWZhdWx0ZWQgcm91dGVzLCB5b3UgYWN0dWFsbHkgd2FudCB0byByZXBsYWNlIHRoZW0sIG5vdCBqdXN0IG92ZXJyaWRlIHRoZW0uIDxlbT5Ob3RlOjwvZW0+IHRoaXMgaXMgY29ycmVjdCBiZWhhdmlvdXIsIGFzIGl0IG1pbm9yaXR5IGNhc2UgaXMgd2hlbiB5b3Ugd2FudCBtb3JlIHRoYW4gb25lIHJvdXRlIHBvaW50aW5nIHRvIHRoZSBzYW1lIGFjdGlvbi48L3A+XFxuPGgzPjxhIG5hbWU9XFxcInJvdXRpbmctcGF0dGVybnNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyb3V0aW5nLXBhdHRlcm5zXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlJvdXRpbmcgcGF0dGVybnM8L3NwYW4+PC9hPjwvaDM+PHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPlR5cGU8L3RoPlxcbjx0aD5FeGFtcGxlPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+UGF0aDwvdGQ+XFxuPHRkPiZxdW90Oy9hYmNkJnF1b3Q7IC0gbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWJjZDwvdGQ+XFxuPC90cj5cXG48dHI+XFxuPHRkPlBhdGggUGF0dGVybjwvdGQ+XFxuPHRkPiZxdW90Oy9hYmM/ZCZxdW90OyAtIG1hdGNoIHBhdGhzIHN0YXJ0aW5nIHdpdGggL2FiY2QgYW5kIC9hYmQ8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYWIrY2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkLCAvYWJiY2QsIC9hYmJiYmJjZCBhbmQgc28gb248L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYWIqY2QmcXVvdDsgLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkLCAvYWJ4Y2QsIC9hYkZPT2NkLCAvYWJiQXJjZCBhbmQgc28gb248L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5QYXRoIFBhdHRlcm48L3RkPlxcbjx0ZD4mcXVvdDsvYShiYyk/ZCZxdW90OyAtIHdpbGwgbWF0Y2ggcGF0aHMgc3RhcnRpbmcgd2l0aCAvYWQgYW5kIC9hYmNkPC90ZD5cXG48L3RyPlxcbjx0cj5cXG48dGQ+UmVndWxhciBFeHByZXNzaW9uPC90ZD5cXG48dGQ+L1xcXFwvYWJjJiMxMjQ7XFxcXC94eXovIC0gd2lsbCBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmMgYW5kIC94eXo8L3RkPlxcbjwvdHI+XFxuPHRyPlxcbjx0ZD5BcnJheTwvdGQ+XFxuPHRkPlsmcXVvdDsvYWJjZCZxdW90OywgJnF1b3Q7L3h5emEmcXVvdDssIC9cXFxcL2xtbiYjMTI0O1xcXFwvcHFyL10gLSBtYXRjaCBwYXRocyBzdGFydGluZyB3aXRoIC9hYmNkLCAveHl6YSwgL2xtbiwgYW5kIC9wcXI8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbjxoMz48YSBuYW1lPVxcXCJsaW5rc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2xpbmtzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkxpbmtzPC9zcGFuPjwvYT48L2gzPjxwPldoZW4geW91IGNyZWF0ZSBsaW5rcywgaW4gb3JkZXIgdG8gZ2V0IHRoZSBhcHAgdG8gd29yayBhcyBhbiBTUEEsIHlvdSBtdXN0IHBhc3MgaW4gbS5yb3V0ZSBhcyBhIGNvbmZpZywgc28gdGhhdCB0aGUgaGlzdG9yeSB3aWxsIGJlIHVwZGF0ZWQgY29ycmVjdGx5LCBmb3IgZXhhbXBsZTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5BKHtocmVmOiZxdW90Oy91c2Vycy9uZXcmcXVvdDssIGNvbmZpZzogbS5yb3V0ZX0sICZxdW90O0FkZCBuZXcgdXNlciZxdW90OylcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGNvcnJlY3RseSB3b3JrIGFzIGEgU1BBLiBJZiB5b3UgbGVhdmUgb3V0IDxjb2RlPmNvbmZpZzogbS5yb3V0ZTwvY29kZT4sIHRoZSBhcHAgd2lsbCBzdGlsbCB3b3JrLCBidXQgdGhlIHBhZ2Ugd2lsbCByZWxvYWQgZXZlcnkgdGltZSB0aGUgbGluayBpcyBmb2xsb3dlZC48L3A+XFxuPHA+Tm90ZTogaWYgeW91IGFyZSBwbGFubmluZyB0byBtYW51YWxseSByb3V0ZSwgaWU6IHVzZSA8Y29kZT5tLnJvdXRlPC9jb2RlPiwgYmUgc3VyZSB0byB1c2UgdGhlIG5hbWUgb2YgdGhlIHJvdXRlLCBub3QgYSBVUkwuIEllOiBpZiB5b3UgaGF2ZSBhIHJvdXRlICZxdW90Oy9hY2NvdW50JnF1b3Q7LCB1c2luZyA8Y29kZT5tLnJvdXRlKCZxdW90O2h0dHA6Ly9wMS5pby9hY2NvdW50JnF1b3Q7KTwvY29kZT4gd29uJiMzOTt0IG1hdGNoLCBtaXRocmlsIGlzIGV4cGVjdGluZyA8Y29kZT5tLnJvdXRlKCZxdW90Oy9hY2NvdW50JnF1b3Q7KTwvY29kZT4gaW5zdGVhZCBvZiB0aGUgZnVsbCBVUkwuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJkYXRhLW1vZGVsc1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2RhdGEtbW9kZWxzXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkRhdGEgbW9kZWxzPC9zcGFuPjwvYT48L2gyPjxwPkRhdGEgbW9kZWxzIGFyZSBwcm9ncmVzc2l2ZWx5IGVuaGFuY2VkIG1pdGhyaWwgbW9kZWxzIC0geW91IHNpbXBseSBjcmVhdGUgeW91ciBtb2RlbCBhcyB1c3VhbCwgdGhlbiBhZGQgdmFsaWRhdGlvbiBhbmQgdHlwZSBpbmZvcm1hdGlvbiBhcyBpdCBiZWNvbWVzIHBlcnRpbmVudC5cXG5Gb3IgZXhhbXBsZSwgc2F5IHlvdSBoYXZlIGEgbW9kZWwgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgdXNlck1vZGVsID0gZnVuY3Rpb24oZGF0YSl7XFxuICAgIHRoaXMubmFtZSA9IG0ucChkYXRhLm5hbWV8fCZxdW90OyZxdW90Oyk7XFxuICAgIHRoaXMuZW1haWwgPSBtLnAoZGF0YS5lbWFpbHx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5pZCA9IG0ucChkYXRhLl9pZHx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgcmV0dXJuIHRoaXM7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5JbiBvcmRlciB0byBtYWtlIGl0IHZhbGlkYXRhYmxlLCBhZGQgdGhlIHZhbGlkYXRvciBtb2R1bGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIHZhbGlkYXRlID0gcmVxdWlyZSgmIzM5O3ZhbGlkYXRvci5tb2RlbGJpbmRlciYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhlbiBhZGQgYSA8Y29kZT5pc1ZhbGlkPC9jb2RlPiB2YWxpZGF0aW9uIG1ldGhvZCB0byB5b3VyIG1vZGVsLCB3aXRoIGFueSBkZWNsYXJhdGlvbnMgYmFzZWQgb24gPGEgaHJlZj1cXFwiL2RvYy92YWxpZGF0b3IuanMjdmFsaWRhdG9ycy5tZFxcXCI+bm9kZSB2YWxpZGF0b3I8L2E+OjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPnZhciB1c2VyTW9kZWwgPSBmdW5jdGlvbihkYXRhKXtcXG4gICAgdGhpcy5uYW1lID0gbS5wKGRhdGEubmFtZXx8JnF1b3Q7JnF1b3Q7KTtcXG4gICAgdGhpcy5lbWFpbCA9IG0ucChkYXRhLmVtYWlsfHwmcXVvdDsmcXVvdDspO1xcbiAgICB0aGlzLmlkID0gbS5wKGRhdGEuX2lkfHwmcXVvdDsmcXVvdDspO1xcblxcbiAgICAvLyAgICBWYWxpZGF0ZSB0aGUgbW9kZWwgICAgICAgIFxcbiAgICB0aGlzLmlzVmFsaWQgPSB2YWxpZGF0ZS5iaW5kKHRoaXMsIHtcXG4gICAgICAgIG5hbWU6IHtcXG4gICAgICAgICAgICBpc1JlcXVpcmVkOiAmcXVvdDtZb3UgbXVzdCBlbnRlciBhIG5hbWUmcXVvdDtcXG4gICAgICAgIH0sXFxuICAgICAgICBlbWFpbDoge1xcbiAgICAgICAgICAgIGlzUmVxdWlyZWQ6ICZxdW90O1lvdSBtdXN0IGVudGVyIGFuIGVtYWlsIGFkZHJlc3MmcXVvdDssXFxuICAgICAgICAgICAgaXNFbWFpbDogJnF1b3Q7TXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3MmcXVvdDtcXG4gICAgICAgIH1cXG4gICAgfSk7XFxuXFxuICAgIHJldHVybiB0aGlzO1xcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgY3JlYXRlcyBhIG1ldGhvZCB0aGF0IHRoZSBtaXNvIGRhdGFiYXNlIGFwaSBjYW4gdXNlIHRvIHZhbGlkYXRlIHlvdXIgbW9kZWwuXFxuWW91IGdldCBmdWxsIGFjY2VzcyB0byB0aGUgdmFsaWRhdGlvbiBpbmZvIGFzIHdlbGwsIHNvIHlvdSBjYW4gc2hvdyBhbiBlcnJvciBtZXNzYWdlIG5lYXIgeW91ciBmaWVsZCwgZm9yIGV4YW1wbGU6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5OylcXG48L2NvZGU+PC9wcmU+XFxuPHA+V2lsbCByZXR1cm4gPGNvZGU+dHJ1ZTwvY29kZT4gaWYgdGhlIDxjb2RlPmVtYWlsPC9jb2RlPiBwcm9wZXJ0eSBvZiB5b3VyIHVzZXIgbW9kZWwgaXMgdmFsaWQsIG9yIGEgbGlzdCBvZiBlcnJvcnMgbWVzc2FnZXMgaWYgaXQgaXMgaW52YWxpZDo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5bJnF1b3Q7WW91IG11c3QgZW50ZXIgYW4gZW1haWwgYWRkcmVzcyZxdW90OywgJnF1b3Q7TXVzdCBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3MmcXVvdDtdXFxuPC9jb2RlPjwvcHJlPlxcbjxwPlNvIHlvdSBjYW4gZm9yIGV4YW1wbGUgYWRkIGEgY2xhc3MgbmFtZSB0byBhIGRpdiBzdXJyb3VuZGluZyB5b3VyIGZpZWxkIGxpa2Ugc286PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+RElWKHtjbGFzczogKGN0cmwudXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5OykgPT0gdHJ1ZT8gJnF1b3Q7dmFsaWQmcXVvdDs6ICZxdW90O2ludmFsaWQmcXVvdDspfSwgWy4uLlxcbjwvY29kZT48L3ByZT5cXG48cD5BbmQgc2hvdyB0aGUgZXJyb3IgbWVzc2FnZXMgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5TUEFOKGN0cmwudXNlci5pc1ZhbGlkKCYjMzk7ZW1haWwmIzM5OykgPT0gdHJ1ZT8gJnF1b3Q7JnF1b3Q7OiBjdHJsLnVzZXIuaXNWYWxpZCgmIzM5O2VtYWlsJiMzOTspLmpvaW4oJnF1b3Q7LCAmcXVvdDspKVxcbjwvY29kZT48L3ByZT5cXG48aDI+PGEgbmFtZT1cXFwiZGF0YWJhc2UtYXBpLWFuZC1tb2RlbC1pbnRlcmFjdGlvblxcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI2RhdGFiYXNlLWFwaS1hbmQtbW9kZWwtaW50ZXJhY3Rpb25cXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+RGF0YWJhc2UgYXBpIGFuZCBtb2RlbCBpbnRlcmFjdGlvbjwvc3Bhbj48L2E+PC9oMj48cD5NaXNvIHVzZXMgdGhlIG1vZGVsIGRlZmluaXRpb25zIHRoYXQgeW91IGRlY2xhcmUgaW4geW91ciA8Y29kZT5tdmM8L2NvZGU+IGZpbGUgdG8gYnVpbGQgdXAgYSBzZXQgb2YgbW9kZWxzIHRoYXQgdGhlIEFQSSBjYW4gdXNlLCB0aGUgbW9kZWwgZGVmaW5pdGlvbnMgd29yayBsaWtlIHRoaXM6PC9wPlxcbjx1bD5cXG48bGk+T24gdGhlIG1vZGVscyBhdHRyaWJ1dGUgb2YgdGhlIG12Yywgd2UgIGRlZmluZSBhIHN0YW5kYXJkIG1pdGhyaWwgZGF0YSBtb2RlbCwgKGllOiBhIGphdmFzY3JpcHQgb2JqZWN0IHdoZXJlIHByb3BlcnRpZXMgY2FuIGJlIGVpdGhlciBzdGFuZGFyZCBqYXZhc2NyaXB0IGRhdGEgdHlwZXMsIG9yIGEgZnVuY3Rpb24gdGhhdCB3b3JrcyBhcyBhIGdldHRlci9zZXR0ZXIsIGVnOiA8Y29kZT5tLnByb3A8L2NvZGU+KTwvbGk+XFxuPGxpPk9uIHNlcnZlciBzdGFydHVwLCBtaXNvIHJlYWRzIHRoaXMgYW5kIGNyZWF0ZXMgYSBjYWNoZSBvZiB0aGUgbW9kZWwgb2JqZWN0cywgaW5jbHVkaW5nIHRoZSBuYW1lIHNwYWNlIG9mIHRoZSBtb2RlbCwgZWc6ICZxdW90O2hlbGxvLmVkaXQuaGVsbG8mcXVvdDs8L2xpPlxcbjxsaT5Nb2RlbHMgY2FuIG9wdGlvbmFsbHkgaW5jbHVkZSBkYXRhIHZhbGlkYXRpb24gaW5mb3JtYXRpb24sIGFuZCB0aGUgZGF0YWJhc2UgYXBpIHdpbGwgZ2V0IGFjY2VzcyB0byB0aGlzLjwvbGk+XFxuPC91bD5cXG48cD5Bc3N1bWluZyB3ZSBoYXZlIGEgbW9kZWwgaW4gdGhlIGhlbGxvLm1vZGVscyBvYmplY3QgbGlrZSBzbzo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5oZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgIHRoaXMud2hvID0gbS5wcm9wKGRhdGEud2hvKTtcXG4gICAgdGhpcy5pc1ZhbGlkID0gdmFsaWRhdGUuYmluZCh0aGlzLCB7XFxuICAgICAgICB3aG86IHtcXG4gICAgICAgICAgICBpc1JlcXVpcmVkOiAmcXVvdDtZb3UgbXVzdCBrbm93IHdobyB5b3UgYXJlIHRhbGtpbmcgdG8mcXVvdDtcXG4gICAgICAgIH1cXG4gICAgfSk7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5UaGUgQVBJIHdvcmtzIGxpa2UgdGhpczo8L3A+XFxuPHVsPlxcbjxsaT5XZSBjcmVhdGUgYW4gZW5kcG9pbnQgYXQgPGNvZGU+L2FwaTwvY29kZT4gd2hlcmUgZWFjaCB3ZSBsb2FkIHdoYXRldmVyIGFwaSBpcyBjb25maWd1cmVkIGluIDxjb2RlPi9jZmcvc2VydmVyLmpzb248L2NvZGU+LCBhbmQgZXhwb3NlIGVhY2ggbWV0aG9kLiBGb3IgZXhhbXBsZSA8Y29kZT4vYXBpL3NhdmU8L2NvZGU+IGlzIGF2YWlsYWJsZSBmb3IgdGhlIGRlZmF1bHQgPGNvZGU+ZmxhdGZpbGVkYjwvY29kZT4gYXBpLjwvbGk+XFxuPGxpPk5leHQgd2UgY3JlYXRlIGEgc2V0IG9mIEFQSSBmaWxlcyAtIG9uZSBmb3IgY2xpZW50LCAoL3N5c3RlbS9hcGkuY2xpZW50LmpzKSwgYW5kIG9uZSBmb3Igc2VydmVyICgvc3lzdGVtL2FwaS5zZXJ2ZXIuanMpIC0gZWFjaCBoYXZlIHRoZSBzYW1lIG1ldGhvZHMsIGJ1dCBkbyB2YXN0bHkgZGlmZmVyZW50IHRoaW5nczo8dWw+XFxuPGxpPmFwaS5jbGllbnQuanMgaXMgYSB0aGluIHdyYXBwZXIgdGhhdCB1c2VzIG1pdGhyaWwmIzM5O3MgbS5yZXF1ZXN0IHRvIGNyZWF0ZSBhbiBhamF4IHJlcXVlc3QgdG8gdGhlIHNlcnZlciBBUEksIGl0IHNpbXBseSBwYXNzZXMgbWVzc2FnZXMgYmFjayBhbmQgZm9ydGggKGluIEpTT04gUlBDIDIuMCBmb3JtYXQpLjwvbGk+XFxuPGxpPmFwaS5zZXJ2ZXIuanMgY2FsbHMgdGhlIGRhdGFiYXNlIGFwaSBtZXRob2RzLCB3aGljaCBpbiB0dXJuIGhhbmRsZXMgbW9kZWxzIGFuZCB2YWxpZGF0aW9uIHNvIGZvciBleGFtcGxlIHdoZW4gYSByZXF1ZXN0IGlzIG1hZGUgYW5kIGEgPGNvZGU+dHlwZTwvY29kZT4gYW5kIDxjb2RlPm1vZGVsPC9jb2RlPiBpcyBpbmNsdWRlZCwgd2UgY2FuIHJlLWNvbnN0cnVjdCB0aGUgZGF0YSBtb2RlbCBiYXNlZCBvbiB0aGlzIGluZm8sIGZvciBleGFtcGxlIHlvdSBtaWdodCBzZW5kOiB7dHlwZTogJiMzOTtoZWxsby5lZGl0LmhlbGxvJiMzOTssIG1vZGVsOiB7d2hvOiAmIzM5O0RhdmUmIzM5O319LCB0aGlzIGNhbiB0aGVuIGJlIGNhc3QgYmFjayBpbnRvIGEgbW9kZWwgdGhhdCB3ZSBjYW4gY2FsbCB0aGUgPGNvZGU+aXNWYWxpZDwvY29kZT4gbWV0aG9kIG9uLjwvbGk+XFxuPC91bD5cXG48L2xpPlxcbjwvdWw+XFxuPHA+PHN0cm9uZz5Ob3csIHRoZSBpbXBvcnRhbnQgYml0Ojwvc3Ryb25nPiBUaGUgcmVhc29uIGZvciBhbGwgdGhpcyBmdW5jdGlvbmFsaXR5IGlzIHRoYXQgbWl0aHJpbCBpbnRlcm5hbGx5IGRlbGF5cyByZW5kZXJpbmcgdG8gdGhlIERPTSB3aGlsc3QgYSByZXF1ZXN0IGlzIGdvaW5nIG9uLCBzbyB3ZSBuZWVkIHRvIGhhbmRsZSB0aGlzIHdpdGhpbiBtaXNvIC0gaW4gb3JkZXIgdG8gYmUgYWJsZSB0byByZW5kZXIgdGhpbmdzIG9uIHRoZSBzZXJ2ZXIgLSBzbyB3ZSBoYXZlIGEgYmluZGluZyBzeXN0ZW0gdGhhdCBkZWxheXMgcmVuZGVyaW5nIHdoaWxzdCBhbiBhc3luYyByZXF1ZXN0IGlzIHN0aWxsIGJlaW5nIGV4ZWN1dGVkLiBUaGF0IG1lYW5zIG1pdGhyaWwtbGlrZSBjb2RlIGxpa2UgdGhpczo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj5jb250cm9sbGVyOiBmdW5jdGlvbigpe1xcbiAgICB2YXIgY3RybCA9IHRoaXM7XFxuICAgIGFwaS5maW5kKHt0eXBlOiAmIzM5O2hlbGxvLmluZGV4LmhlbGxvJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgICAgIHZhciBsaXN0ID0gT2JqZWN0LmtleXMoZGF0YS5yZXN1bHQpLm1hcChmdW5jdGlvbihrZXkpIHtcXG4gICAgICAgICAgICB2YXIgbXlIZWxsbyA9IGRhdGEucmVzdWx0W2tleV07XFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBzZWxmLm1vZGVscy5oZWxsbyhteUhlbGxvKTtcXG4gICAgICAgIH0pO1xcbiAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBjdHJsLnZtLnRvZG9MaXN0KGxpc3QpO1xcbiAgICB9KTtcXG4gICAgcmV0dXJuIGN0cmw7XFxufVxcbjwvY29kZT48L3ByZT5cXG48cD5XaWxsIHN0aWxsIHdvcmsuIE5vdGU6IHRoZSBtYWdpYyBoZXJlIGlzIHRoYXQgdGhlcmUgaXMgYWJzb2x1dGVseSBub3RoaW5nIGluIHRoZSBjb2RlIGFib3ZlIHRoYXQgcnVucyBhIGNhbGxiYWNrIHRvIGxldCBtaXRocmlsIGtub3cgdGhlIGRhdGEgaXMgcmVhZHkgLSB0aGlzIGlzIGEgZGVzaWduIGZlYXR1cmUgb2YgbWl0aHJpbCB0byBkZWxheSByZW5kZXJpbmcgYXV0b21hdGljYWxseSB3aGlsc3QgYW4gPGNvZGU+bS5yZXF1ZXN0PC9jb2RlPiBpcyBpbiBwcm9ncmVzcywgc28gd2UgY2F0ZXIgZm9yIHRoaXMgdG8gaGF2ZSB0aGUgYWJpbGl0eSB0byByZW5kZXIgdGhlIHBhZ2Ugc2VydmVyLXNpZGUgZmlyc3QsIHNvIHRoYXQgU0VPIHdvcmtzIG91dCBvZiB0aGUgYm94LjwvcD5cXG48aDI+PGEgbmFtZT1cXFwiY2xpZW50LXZzLXNlcnZlci1jb2RlXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjY2xpZW50LXZzLXNlcnZlci1jb2RlXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkNsaWVudCB2cyBzZXJ2ZXIgY29kZTwvc3Bhbj48L2E+PC9oMj48cD5JbiBtaXNvLCB5b3UgaW5jbHVkZSBmaWxlcyB1c2luZyB0aGUgc3RhbmRhcmQgbm9kZWpzIDxjb2RlPnJlcXVpcmU8L2NvZGU+IGZ1bmN0aW9uLiBXaGVuIHlvdSBuZWVkIHRvIGRvIHNvbWV0aGluZyB0aGF0IHdvcmtzIGRpZmZlcmVudGx5IGluIHRoZSBjbGllbnQgdGhhbiB0aGUgc2VydmVyLCB0aGVyZSBhcmUgYSBmZXcgd2F5cyB5b3UgY2FuIGFjaGlldmUgaXQ6PC9wPlxcbjx1bD5cXG48bGk+VGhlIHJlY29tbWVuZGVkIHdheSBpcyB0byBjcmVhdGUgYW5kIHJlcXVpcmUgYSBmaWxlIGluIHRoZSA8Y29kZT5tb2R1bGVzLzwvY29kZT4gZGlyZWN0b3J5LCBhbmQgdGhlbiBjcmVhdGUgdGhlIHNhbWUgZmlsZSB3aXRoIGEgJnF1b3Q7LmNsaWVudCZxdW90OyBiZWZvcmUgdGhlIGV4dGVuc2lvbiwgYW5kIG1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IGxvYWQgdGhhdCBmaWxlIGZvciB5b3Ugb24gdGhlIGNsaWVudCBzaWRlIGluc3RlYWQuIEZvciBleGFtcGxlIGlmIHlvdSBoYXZlIDxjb2RlPi9tb2R1bGVzL3NvbWV0aGluZy5qczwvY29kZT4sIGlmIHlvdSBjcmVhdGUgPGNvZGU+L21vZHVsZXMvc29tZXRoaW5nLmNsaWVudC5qczwvY29kZT4sIG1pc28gd2lsbCBhdXRvbWF0aWNhbGx5IHVzZSB0aGF0IG9uIHRoZSBjbGllbnQuPC9saT5cXG48bGk+QW5vdGhlciBvcHRpb24gaXMgdG8gdXNlIDxjb2RlPm1pc28udXRpbDwvY29kZT4gLSB5b3UgY2FuIHVzZSA8Y29kZT5taXNvLnV0aWwuaXNTZXJ2ZXIoKTwvY29kZT4gdG8gdGVzdCBpZiB5b3UmIzM5O3JlIG9uIHRoZSBzZXJ2ZXIgb3Igbm90LCB0aG91Z2ggaXQgaXMgYmV0dGVyIHByYWN0aWNlIHRvIHVzZSB0aGUgJnF1b3Q7LmNsaWVudCZxdW90OyBtZXRob2QgbWVudGlvbmVkIGFib3ZlIC0gb25seSB1c2UgPGNvZGU+aXNTZXJ2ZXI8L2NvZGU+IGlmIHlvdSBhYnNvbHV0ZWx5IGhhdmUgbm8gb3RoZXIgb3B0aW9uLjwvbGk+XFxuPC91bD5cXG48aDI+PGEgbmFtZT1cXFwiZmlyc3QtcGFnZS1sb2FkXFxcIiBjbGFzcz1cXFwiYW5jaG9yXFxcIiBocmVmPVxcXCIjZmlyc3QtcGFnZS1sb2FkXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPkZpcnN0IHBhZ2UgbG9hZDwvc3Bhbj48L2E+PC9oMj48cD5XaGVuIGEgbmV3IHVzZXIgZW50ZXJzIHlvdXIgc2l0ZSB2aWEgYSBVUkwsIGFuZCBtaXNvIGxvYWRzIHRoZSBmaXJzdCBwYWdlLCBhIG51bWJlciBvZiB0aGluZ3MgaGFwcGVuOjwvcD5cXG48dWw+XFxuPGxpPlRoZSBzZXJ2ZXIgZ2VuZXJhdGVzIHRoZSBwYWdlLCBpbmNsdWRpbmcgYW55IGRhdGEgdGhlIHVzZXIgbWlnaHQgaGF2ZSBhY2Nlc3MgdG8uIFRoaXMgaXMgbWFpbmx5IGZvciBTRU8gcHVycG9zZXMsIGJ1dCBhbHNvIHRvIG1ha2UgdGhlIHBlcmNlcHRpYmxlIGxvYWRpbmcgdGltZSBsZXNzLCBwbHVzIHByb3ZpZGUgYmVhdXRpZnVsIHVybHMgb3V0IG9mIHRoZSBib3guIDwvbGk+XFxuPGxpPk9uY2UgdGhlIHBhZ2UgaGFzIGxvYWRlZCwgbWl0aHJpbCBraWNrcyBpbiBhbmQgY3JlYXRlcyBhIFhIUiAoYWpheCkgcmVxdWVzdCB0byByZXRyZWl2ZSB0aGUgZGF0YSwgYW5kIHNldHVwIGFueSBldmVudHMgYW5kIHRoZSB2aXJ0dWFsIERPTSwgZXRjLjwvbGk+XFxuPC91bD5cXG48cD5Ob3cgeW91IG1pZ2h0IGJlIHRoaW5raW5nOiB3ZSBkb24mIzM5O3QgcmVhbGx5IG5lZWQgdGhhdCAybmQgcmVxdWVzdCBmb3IgZGF0YSAtIGl0JiMzOTtzIGFscmVhZHkgaW4gdGhlIHBhZ2UsIHJpZ2h0PyBXZWxsLCBzb3J0IG9mIC0geW91IHNlZSBtaXNvIGRvZXMgbm90IG1ha2UgYW55IGFzc3VtcHRpb25zIGFib3V0IHRoZSBzdHJ1Y3R1cmUgb2YgeW91ciBkYXRhLCBvciBob3cgeW91IHdhbnQgdG8gdXNlIGl0IGluIHlvdXIgbW9kZWxzLCBzbyB0aGVyZSBpcyBubyB3YXkgZm9yIHVzIHRvIHJlLXVzZSB0aGF0IGRhdGEsIGFzIGl0IGNvdWxkIGJlIGFueSBzdHJ1Y3R1cmUuXFxuQW5vdGhlciBrZXkgZmVhdHVyZSBvZiBtaXNvIGlzIHRoZSBmYWN0IHRoYXQgYWxsIGFjdGlvbnMgY2FuIGJlIGJvb2ttYXJrYWJsZSAtIGZvciBleGFtcGxlIHRoZSA8YSBocmVmPVxcXCIvZG9jL3VzZXJzLm1kXFxcIj4vdXNlcnM8L2E+IGFwcCAtIGNsaWNrIG9uIGEgdXNlciwgYW5kIHNlZSB0aGUgdXJsIGNoYW5nZSAtIHdlIGRpZG4mIzM5O3QgZG8gYW5vdGhlciBzZXJ2ZXIgcm91bmQtdHJpcCwgYnV0IHJhdGhlciBqdXN0IGEgWEhSIHJlcXVlc3QgdGhhdCByZXR1cm5lZCB0aGUgZGF0YSB3ZSByZXF1aXJlZCAtIHRoZSBVSSB3YXMgY29tcGxldGVseSByZW5kZXJlZCBjbGllbnQgc2lkZSAtIHNvIGl0JiMzOTtzIHJlYWxseSBvbiB0aGF0IGZpcnN0IHRpbWUgd2UgbG9hZCB0aGUgcGFnZSB0aGF0IHlvdSBlbmQgdXAgbG9hZGluZyB0aGUgZGF0YSB0d2ljZS48L3A+XFxuPHA+U28gdGhhdCBpcyB0aGUgcmVhc29uIHRoZSBhcmNoaXRlY3R1cmUgd29ya3MgdGhlIHdheSBpdCBkb2VzLCBhbmQgaGFzIHRoYXQgc2VlbWluZ2x5IHJlZHVuZGFudCAybmQgcmVxdWVzdCBmb3IgdGhlIGRhdGEgLSBpdCBpcyBhIHNtYWxsIHByaWNlIHRvIHBheSBmb3IgU0VPLCBhbmQgcGVyY2VwdGlibHkgcXVpY2sgbG9hZGluZyBwYWdlcyBhbmQgYXMgbWVudGlvbmVkLCBpdCBvbmx5IGV2ZXIgaGFwcGVucyBvbiB0aGUgZmlyc3QgcGFnZSBsb2FkLjwvcD5cXG48cD5PZiBjb3Vyc2UgeW91IGNvdWxkIGltcGxlbWVudCBjYWNoaW5nIG9mIHRoZSBkYXRhIHlvdXJzZWxmLCBpZiB0aGUgMm5kIHJlcXVlc3QgaXMgYW4gaXNzdWUgLSBhZnRlciBhbGwgeW91IG1pZ2h0IGJlIGxvYWRpbmcgcXVpdGUgYSBiaXQgb2YgZGF0YS4gT25lIHdheSB0byBkbyB0aGlzIHdvdWxkIGJlIGxpa2Ugc28gKHdhcm5pbmc6IHJhdGhlciBjb250cml2ZWQgZXhhbXBsZSBmb2xsb3dzKTo8L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL21vZHVsZXMvbWlzby51dGlsLmpzJiMzOTspLFxcbiAgICBzdWdhcnRhZ3MgPSByZXF1aXJlKCYjMzk7bWl0aHJpbC5zdWdhcnRhZ3MmIzM5OykobSksXFxuICAgIGRiID0gcmVxdWlyZSgmIzM5Oy4uL3N5c3RlbS9hcGkvZmxhdGZpbGVkYi9hcGkuc2VydmVyLmpzJiMzOTspKG0pO1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnByb3AoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHZhciBjdHJsID0gdGhpcyxcXG4gICAgICAgICAgICB3aG8gPSBtaXNvLmdldFBhcmFtKCYjMzk7aGVsbG9faWQmIzM5OywgcGFyYW1zKTtcXG5cXG4gICAgICAgIC8vICAgIENoZWNrIGlmIG91ciBkYXRhIGlzIGF2YWlsYWJsZSwgaWYgc286IHVzZSBpdC5cXG4gICAgICAgIGlmKHR5cGVvZiBteVBlcnNvbiAhPT0gJnF1b3Q7dW5kZWZpbmVkJnF1b3Q7KSB7XFxuICAgICAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiBteVBlcnNvbn0pO1xcbiAgICAgICAgfSBlbHNlIHtcXG4gICAgICAgIC8vICAgIElmIG5vdCwgbG9hZCBpdCBmaXJzdC5cXG4gICAgICAgICAgICBkYi5maW5kKHt0eXBlOiAmIzM5O3VzZXIuZWRpdC51c2VyJiMzOTt9KS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcXG4gICAgICAgICAgICAgICAgY3RybC5tb2RlbCA9IG5ldyBlZGl0Lm1vZGVscy5oZWxsbyh7d2hvOiBkYXRhLnJlc3VsdFswXS5uYW1lfSk7XFxuICAgICAgICAgICAgfSk7XFxuICAgICAgICB9XFxuXFxuICAgICAgICByZXR1cm4gY3RybDtcXG4gICAgfSxcXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICAvLyAgICBBZGQgYSBjbGllbnQgc2lkZSBnbG9iYWwgdmFyaWFibGUgd2l0aCBvdXIgZGF0YVxcbiAgICAgICAgICAgICAgICBTQ1JJUFQoJnF1b3Q7dmFyIG15UGVyc29uID0gJiMzOTsmcXVvdDsgKyBjdHJsLm1vZGVsLndobygpICsgJnF1b3Q7JiMzOTsmcXVvdDspLFxcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7RyYjMzk7ZGF5ICZxdW90OyArIGN0cmwubW9kZWwud2hvKCkpXFxuICAgICAgICAgICAgXVxcbiAgICAgICAgfVxcbiAgICB9XFxufTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+U28gdGhpcyB3aWxsIG9ubHkgbG9hZCB0aGUgZGF0YSBvbiB0aGUgc2VydmVyIHNpZGUgLSBhcyB5b3UgY2FuIHNlZSwgd2UgbmVlZCB0byBrbm93IHRoZSBzaGFwZSBvZiB0aGUgZGF0YSB0byB1c2UgaXQsIGFuZCB3ZSBhcmUgdXNpbmcgYSBnbG9iYWwgdmFyaWFibGUgaGVyZSB0byBzdG9yZSB0aGUgZGF0YSBjbGllbnQgc2lkZSAtIEkgZG9uJiMzOTt0IHJlYWxseSByZWNvbW1lbmQgdGhpcyBhcHByb2FjaCwgYXMgaXQgc2VlbXMgbGlrZSBhIGxvdCBvZiB3b3JrIHRvIHNhdmUgYSBzaW5nbGUgWEhSIHJlcXVlc3QuIEhvd2V2ZXIgSSB1bmRlcnN0YW5kIHlvdSBtaWdodCBoYXZlIHVuaXF1ZSBjaXJjdW1zdGFuY2VzIHdoZXJlIHRoZSBmaXJzdCBkYXRhIGxvYWQgY291bGQgYmUgYSBwcm9ibGVtLCBzbyBhdCBsZWFzdCB0aGlzIGlzIGFuIG9wdGlvbiB5b3UgY2FuIHVzZSB0byBjYWNoZSB0aGUgZGF0YSBvbiBmaXJzdCBwYWdlIGxvYWQuPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJyZXF1aXJpbmctZmlsZXNcXFwiIGNsYXNzPVxcXCJhbmNob3JcXFwiIGhyZWY9XFxcIiNyZXF1aXJpbmctZmlsZXNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+UmVxdWlyaW5nIGZpbGVzPC9zcGFuPjwvYT48L2gyPjxwPldoZW4gcmVxdWlyaW5nIGZpbGVzLCBiZSBzdXJlIHRvIGRvIHNvIGluIGEgc3RhdGljIG1hbm5lciBzbyB0aGF0IGJyb3dzZXJpZnkgaXMgYWJsZSB0byBjb21waWxlIHRoZSBjbGllbnQgc2lkZSBzY3JpcHQuIEFsd2F5cyB1c2U6PC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG1pc28gPSByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+TkVWRVIgRE8gQU5ZIE9GIFRIRVNFOjwvcD5cXG48cHJlPjxjb2RlIGNsYXNzPVxcXCJsYW5nLWphdmFzY3JpcHRcXFwiPi8vICBET04mIzM5O1QgRE8gVEhJUyFcXG52YXIgbWlzbyA9IG5ldyByZXF1aXJlKCYjMzk7Li4vc2VydmVyL21pc28udXRpbC5qcyYjMzk7KTtcXG48L2NvZGU+PC9wcmU+XFxuPHA+VGhpcyB3aWxsIGNyZWF0ZSBhbiBvYmplY3QsIHdoaWNoIG1lYW5zIDxhIGhyZWY9XFxcIi9kb2MvODI0Lm1kXFxcIj5icm93c2VyaWZ5IGNhbm5vdCByZXNvbHZlIGl0IHN0YXRpY2FsbHk8L2E+LCBhbmQgd2lsbCBpZ25vcmUgaXQuPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+Ly8gIERPTiYjMzk7VCBETyBUSElTIVxcbnZhciB0aGluZyA9ICYjMzk7bWlzbyYjMzk7O1xcbnZhciBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci8mIzM5Oyt0aGluZysmIzM5Oy51dGlsLmpzJiMzOTspO1xcbjwvY29kZT48L3ByZT5cXG48cD5UaGlzIHdpbGwgY3JlYXRlIGFuIGV4cHJlc3Npb24sIHdoaWNoIG1lYW5zIDxhIGhyZWY9XFxcIi9kb2MvODI0Lm1kXFxcIj5icm93c2VyaWZ5IGNhbm5vdCByZXNvbHZlIGl0IHN0YXRpY2FsbHk8L2E+LCBhbmQgd2lsbCBpZ25vcmUgaXQuPC9wPlxcblwiLFwiUGF0dGVybnMubWRcIjpcIjxwPlRoZXJlIGFyZSBzZXZlcmFsIHdheXMgeW91IGNhbiB3cml0ZSB5b3VyIGFwcCBhbmQgbWlzbyBpcyBub3Qgb3BpbmlvbmF0ZWQgYWJvdXQgaG93IHlvdSBnbyBhYm91dCB0aGlzIHNvIGl0IGlzIGltcG9ydGFudCB0aGF0IHlvdSBjaG9vc2UgYSBwYXR0ZXJuIHRoYXQgc3VpdHMgeW91ciBuZWVkcy4gQmVsb3cgYXJlIGEgZmV3IHN1Z2dlc3RlZCBwYXR0ZXJucyB0byBmb2xsb3cgd2hlbiBkZXZlbG9waW5nIGFwcHMuPC9wPlxcbjxwPjxzdHJvbmc+Tm90ZTo8L3N0cm9uZz4gbWlzbyBpcyBhIHNpbmdsZSBwYWdlIGFwcCB0aGF0IGxvYWRzIHNlcnZlciByZW5kZXJlZCBIVE1MIGZyb20gYW55IFVSTCwgc28gdGhhdCBTRU8gd29ya3Mgb3V0IG9mIHRoZSBib3guPC9wPlxcbjxoMj48YSBuYW1lPVxcXCJzaW5nbGUtdXJsLW12Y1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI3NpbmdsZS11cmwtbXZjXFxcIj48c3BhbiBjbGFzcz1cXFwiaGVhZGVyLWxpbmtcXFwiPlNpbmdsZSB1cmwgbXZjPC9zcGFuPjwvYT48L2gyPjxwPkluIHRoaXMgcGF0dGVybiBldmVyeXRoaW5nIHRoYXQgeW91ciBtdmMgbmVlZHMgdG8gZG8gaXMgZG9uZSBvbiBhIHNpbmdsZSB1cmwgZm9yIGFsbCB0aGUgYXNzb2NpYXRlZCBhY3Rpb25zLiBUaGUgYWR2YW50YWdlIGZvciB0aGlzIHN0eWxlIG9mIGRldmVsb3BtZW50IGlzIHRoYXQgeW91IGhhdmUgZXZlcnl0aGluZyBpbiBvbmUgbXZjIGNvbnRhaW5lciwgYW5kIHlvdSBkb24mIzM5O3QgbmVlZCB0byBtYXAgYW55IHJvdXRlcyAtIG9mIGNvdXJzZSB0aGUgZG93bnNpZGUgYmVpbmcgdGhhdCB0aGVyZSBhcmUgbm8gcm91dGVzIGZvciB0aGUgdXNlciB0byBib29rbWFyay4gVGhpcyBpcyBwYXR0ZXJuIHdvcmtzIHdlbGwgZm9yIHNtYWxsZXIgZW50aXRpZXMgd2hlcmUgdGhlcmUgYXJlIG5vdCB0b28gbWFueSBpbnRlcmFjdGlvbnMgdGhhdCB0aGUgdXNlciBjYW4gZG8gLSB0aGlzIGlzIGVzc2VudGlhbGx5IGhvdyBtb3N0IG1pdGhyaWwgYXBwcyBhcmUgd3JpdHRlbiAtIHNlbGYtY29udGFpbmVkLCBhbmQgYXQgYSBzaW5nbGUgdXJsLjwvcD5cXG48cD5IZXJlIGlzIGEgJnF1b3Q7aGVsbG8gd29ybGQmcXVvdDsgZXhhbXBsZSB1c2luZyB0aGUgc2luZ2xlIHVybCBwYXR0ZXJuPC9wPlxcbjxwcmU+PGNvZGUgY2xhc3M9XFxcImxhbmctamF2YXNjcmlwdFxcXCI+dmFyIG0gPSByZXF1aXJlKCYjMzk7bWl0aHJpbCYjMzk7KSxcXG4gICAgc3VnYXJ0YWdzID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXRocmlsLnN1Z2FydGFncy5ub2RlLmpzJiMzOTspKG0pO1xcblxcbnZhciBzZWxmID0gbW9kdWxlLmV4cG9ydHMuaW5kZXggPSB7XFxuICAgIG1vZGVsczoge1xcbiAgICAgICAgLy8gICAgT3VyIG1vZGVsXFxuICAgICAgICBoZWxsbzogZnVuY3Rpb24oZGF0YSl7XFxuICAgICAgICAgICAgdGhpcy53aG8gPSBtLnAoZGF0YS53aG8pO1xcbiAgICAgICAgfVxcbiAgICB9LFxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihwYXJhbXMpIHtcXG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgc2VsZi5tb2RlbHMuaGVsbG8oe3dobzogJnF1b3Q7d29ybGQmcXVvdDt9KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgbW9kZWwud2hvKCkpXFxuICAgICAgICAgICAgXTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPlRoaXMgd291bGQgZXhwb3NlIGEgdXJsIC9oZWxsb3MgKG5vdGU6IHRoZSAmIzM5O3MmIzM5OyksIGFuZCB3b3VsZCBkaXNwbGF5ICZxdW90O0hlbGxvIHdvcmxkJnF1b3Q7LiAoWW91IGNhbiBjaGFuZ2UgdGhlIHJvdXRlIHVzaW5nIGN1c3RvbSByb3V0aW5nKTwvcD5cXG48aDI+PGEgbmFtZT1cXFwibXVsdGktdXJsLW12Y1xcXCIgY2xhc3M9XFxcImFuY2hvclxcXCIgaHJlZj1cXFwiI211bHRpLXVybC1tdmNcXFwiPjxzcGFuIGNsYXNzPVxcXCJoZWFkZXItbGlua1xcXCI+TXVsdGkgdXJsIG12Yzwvc3Bhbj48L2E+PC9oMj48cD5JbiB0aGlzIHBhdHRlcm4gd2UgZXhwb3NlIG11bHRpcGxlIG12YyByb3V0ZXMgdGhhdCBpbiB0dXJuIHRyYW5zbGF0ZSB0byBtdWx0aXBsZSBVUkxzLiBUaGlzIGlzIHVzZWZ1bCBmb3Igc3BsaXR0aW5nIHVwIHlvdXIgYXBwLCBhbmQgZW5zdXJpbmcgZWFjaCBtdmMgaGFzIGl0cyBvd24gc2V0cyBvZiBjb25jZXJucy48L3A+XFxuPHByZT48Y29kZSBjbGFzcz1cXFwibGFuZy1qYXZhc2NyaXB0XFxcIj52YXIgbSA9IHJlcXVpcmUoJiMzOTttaXRocmlsJiMzOTspLFxcbiAgICBtaXNvID0gcmVxdWlyZSgmIzM5Oy4uL3NlcnZlci9taXNvLnV0aWwuanMmIzM5OyksXFxuICAgIHN1Z2FydGFncyA9IHJlcXVpcmUoJiMzOTsuLi9zZXJ2ZXIvbWl0aHJpbC5zdWdhcnRhZ3Mubm9kZS5qcyYjMzk7KShtKTtcXG5cXG52YXIgaW5kZXggPSBtb2R1bGUuZXhwb3J0cy5pbmRleCA9IHtcXG4gICAgbW9kZWxzOiB7XFxuICAgICAgICAvLyAgICBPdXIgbW9kZWxcXG4gICAgICAgIGhlbGxvOiBmdW5jdGlvbihkYXRhKXtcXG4gICAgICAgICAgICB0aGlzLndobyA9IG0ucChkYXRhLndobyk7XFxuICAgICAgICB9XFxuICAgIH0sXFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKHBhcmFtcykge1xcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBpbmRleC5tb2RlbHMuaGVsbG8oe3dobzogJnF1b3Q7d29ybGQmcXVvdDt9KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgbW9kZWwud2hvKCkpLFxcbiAgICAgICAgICAgICAgICBBKHtocmVmOiAmcXVvdDsvaGVsbG8vTGVvJnF1b3Q7LCBjb25maWc6IG0ucm91dGV9LCAmcXVvdDtDbGljayBtZSBmb3IgdGhlIGVkaXQgYWN0aW9uJnF1b3Q7KVxcbiAgICAgICAgICAgIF07XFxuICAgICAgICB9XFxuICAgIH1cXG59O1xcblxcbnZhciBlZGl0ID0gbW9kdWxlLmV4cG9ydHMuZWRpdCA9IHtcXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24ocGFyYW1zKSB7XFxuICAgICAgICB2YXIgd2hvID0gbWlzby5nZXRQYXJhbSgmIzM5O2hlbGxvX2lkJiMzOTssIHBhcmFtcyk7XFxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IGluZGV4Lm1vZGVscy5oZWxsbyh7d2hvOiB3aG99KTtcXG4gICAgICAgIHJldHVybiB0aGlzO1xcbiAgICB9LFxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XFxuICAgICAgICB2YXIgbW9kZWwgPSBjdHJsLm1vZGVsO1xcbiAgICAgICAgd2l0aChzdWdhcnRhZ3MpIHtcXG4gICAgICAgICAgICByZXR1cm4gW1xcbiAgICAgICAgICAgICAgICBESVYoJnF1b3Q7SGVsbG8gJnF1b3Q7ICsgbW9kZWwud2hvKCkpXFxuICAgICAgICAgICAgXTtcXG4gICAgICAgIH1cXG4gICAgfVxcbn07XFxuPC9jb2RlPjwvcHJlPlxcbjxwPkhlcmUgd2UgYWxzbyBleHBvc2UgYSAmcXVvdDsvaGVsbG8vW05BTUVdJnF1b3Q7IHVybCwgdGhhdCB3aWxsIHNob3cgeW91ciBuYW1lIHdoZW4geW91IHZpc2l0IC9oZWxsby9bWU9VUiBOQU1FXSwgc28gdGhlcmUgYXJlIG5vdyBtdWx0aXBsZSB1cmxzIGZvciBvdXIgU1BBOjwvcD5cXG48dWw+XFxuPGxpPjxzdHJvbmc+L2hlbGxvczwvc3Ryb25nPiAtIHRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgYW4gaW5kZXggcGFnZSB0aGF0IGxpc3RzIGFsbCB5b3VyICZxdW90O2hlbGxvcyZxdW90OzwvbGk+XFxuPGxpPjxzdHJvbmc+L2hlbGxvL1tOQU1FXTwvc3Ryb25nPiAtIHRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgYW4gZWRpdCBwYWdlIHdoZXJlIHlvdSBjYW4gZWRpdCB5b3VyICZxdW90O2hlbGxvcyZxdW90OzwvbGk+XFxuPC91bD5cXG48cD5Ob3RlIHRoYXQgdGhlIGFuY2hvciB0YWcgaGFzIDxjb2RlPmNvbmZpZzogbS5yb3V0ZTwvY29kZT4gaW4gaXQmIzM5O3Mgb3B0aW9ucyAtIHRoaXMgaXMgc28gdGhhdCB3ZSBjYW4gcm91dGUgYXV0b21hdGljYWxseSB0aG91Z2ggbWl0aHJpbDwvcD5cXG5cIn07IH07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcblx0dmFyIGdldE1vZGVsRGF0YSA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgaSwgcmVzdWx0ID0ge307XG5cdFx0Zm9yKGkgaW4gbW9kZWwpIHtpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0aWYoaSAhPT0gJ2lzVmFsaWQnKSB7XG5cdFx0XHRcdGlmKGkgPT0gJ2lkJykge1xuXHRcdFx0XHRcdHJlc3VsdFsnX2lkJ10gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcbnZhciBhcGlDbGllbnRQYXRoID0gJyc7XG5cdHJldHVybiB7XG4nZmluZCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9hdXRoZW50aWNhdGlvbi9maW5kJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzYXZlJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogYXBpQ2xpZW50UGF0aCArICcvYXBpL2F1dGhlbnRpY2F0aW9uL3NhdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3JlbW92ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9hdXRoZW50aWNhdGlvbi9yZW1vdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2F1dGhlbnRpY2F0ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9hdXRoZW50aWNhdGlvbi9hdXRoZW50aWNhdGUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2xvZ2luJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogYXBpQ2xpZW50UGF0aCArICcvYXBpL2F1dGhlbnRpY2F0aW9uL2xvZ2luJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidsb2dvdXQnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiBhcGlDbGllbnRQYXRoICsgJy9hcGkvYXV0aGVudGljYXRpb24vbG9nb3V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidmaW5kVXNlcnMnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiBhcGlDbGllbnRQYXRoICsgJy9hcGkvYXV0aGVudGljYXRpb24vZmluZFVzZXJzJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidzYXZlVXNlcic6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9hdXRoZW50aWNhdGlvbi9zYXZlVXNlcicsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn1cblx0fTtcbn07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcblx0dmFyIGdldE1vZGVsRGF0YSA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgaSwgcmVzdWx0ID0ge307XG5cdFx0Zm9yKGkgaW4gbW9kZWwpIHtpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0aWYoaSAhPT0gJ2lzVmFsaWQnKSB7XG5cdFx0XHRcdGlmKGkgPT0gJ2lkJykge1xuXHRcdFx0XHRcdHJlc3VsdFsnX2lkJ10gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcbnZhciBhcGlDbGllbnRQYXRoID0gJyc7XG5cdHJldHVybiB7XG4nZmluZCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9mbGF0ZmlsZWRiL2ZpbmQnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ3NhdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiBhcGlDbGllbnRQYXRoICsgJy9hcGkvZmxhdGZpbGVkYi9zYXZlJyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufSxcbidyZW1vdmUnOiBmdW5jdGlvbihhcmdzLCBvcHRpb25zKXtcblx0YXJncyA9IGFyZ3MgfHwge307XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR2YXIgcmVxdWVzdE9iaiA9IHtcblx0XHRcdG1ldGhvZDoncG9zdCcsIFxuXHRcdFx0dXJsOiBhcGlDbGllbnRQYXRoICsgJy9hcGkvZmxhdGZpbGVkYi9yZW1vdmUnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59LFxuJ2F1dGhlbnRpY2F0ZSc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9mbGF0ZmlsZWRiL2F1dGhlbnRpY2F0ZScsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn1cblx0fTtcbn07IiwiLyogTk9URTogVGhpcyBpcyBhIGdlbmVyYXRlZCBmaWxlLCBwbGVhc2UgZG8gbm90IG1vZGlmeSBpdCwgeW91ciBjaGFuZ2VzIHdpbGwgYmUgbG9zdCAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtKXtcblx0dmFyIGdldE1vZGVsRGF0YSA9IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgaSwgcmVzdWx0ID0ge307XG5cdFx0Zm9yKGkgaW4gbW9kZWwpIHtpZihtb2RlbC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuXHRcdFx0aWYoaSAhPT0gJ2lzVmFsaWQnKSB7XG5cdFx0XHRcdGlmKGkgPT0gJ2lkJykge1xuXHRcdFx0XHRcdHJlc3VsdFsnX2lkJ10gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHRbaV0gPSAodHlwZW9mIG1vZGVsW2ldID09ICdmdW5jdGlvbicpPyBtb2RlbFtpXSgpOiBtb2RlbFtpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH19XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcbnZhciBhcGlDbGllbnRQYXRoID0gJyc7XG5cdHJldHVybiB7XG4ncGhvdG9zJzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogYXBpQ2xpZW50UGF0aCArICcvYXBpL2ZsaWNrci9waG90b3MnLFxuXHRcdFx0ZGF0YTogYXJnc1xuXHRcdH0sXG5cdFx0cm9vdE5vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcblx0Zm9yKHZhciBpIGluIG9wdGlvbnMpIHtpZihvcHRpb25zLmhhc093blByb3BlcnR5KGkpKXtcblx0XHRyZXF1ZXN0T2JqW2ldID0gb3B0aW9uc1tpXTtcblx0fX1cblx0aWYoYXJncy5tb2RlbCkge1xuIFx0XHRhcmdzLm1vZGVsID0gZ2V0TW9kZWxEYXRhKGFyZ3MubW9kZWwpO1xuXHR9XG5cdHJvb3ROb2RlLmNsYXNzTmFtZSArPSAnIGxvYWRpbmcnO1xuXHR2YXIgbXlEZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcblx0bS5yZXF1ZXN0KHJlcXVlc3RPYmopLnRoZW4oZnVuY3Rpb24oKXtcblx0XHRyb290Tm9kZS5jbGFzc05hbWUgPSByb290Tm9kZS5jbGFzc05hbWUuc3BsaXQoJyBsb2FkaW5nJykuam9pbignJyk7XG5cdFx0bXlEZWZlcnJlZC5yZXNvbHZlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0aWYocmVxdWVzdE9iai5iYWNrZ3JvdW5kKXtcblx0XHRcdG0ucmVkcmF3KHRydWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBteURlZmVycmVkLnByb21pc2U7XG59XG5cdH07XG59OyIsIi8qIE5PVEU6IFRoaXMgaXMgYSBnZW5lcmF0ZWQgZmlsZSwgcGxlYXNlIGRvIG5vdCBtb2RpZnkgaXQsIHlvdXIgY2hhbmdlcyB3aWxsIGJlIGxvc3QgKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obSl7XG5cdHZhciBnZXRNb2RlbERhdGEgPSBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIGksIHJlc3VsdCA9IHt9O1xuXHRcdGZvcihpIGluIG1vZGVsKSB7aWYobW9kZWwuaGFzT3duUHJvcGVydHkoaSkpIHtcblx0XHRcdGlmKGkgIT09ICdpc1ZhbGlkJykge1xuXHRcdFx0XHRpZihpID09ICdpZCcpIHtcblx0XHRcdFx0XHRyZXN1bHRbJ19pZCddID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0W2ldID0gKHR5cGVvZiBtb2RlbFtpXSA9PSAnZnVuY3Rpb24nKT8gbW9kZWxbaV0oKTogbW9kZWxbaV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG52YXIgYXBpQ2xpZW50UGF0aCA9ICcnO1xuXHRyZXR1cm4ge1xuJ2dldCc6IGZ1bmN0aW9uKGFyZ3MsIG9wdGlvbnMpe1xuXHRhcmdzID0gYXJncyB8fCB7fTtcblx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdHZhciByZXF1ZXN0T2JqID0ge1xuXHRcdFx0bWV0aG9kOidwb3N0JywgXG5cdFx0XHR1cmw6IGFwaUNsaWVudFBhdGggKyAnL2FwaS9zZXNzaW9uL2dldCcsXG5cdFx0XHRkYXRhOiBhcmdzXG5cdFx0fSxcblx0XHRyb290Tm9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCB8fCBkb2N1bWVudC5ib2R5O1xuXHRmb3IodmFyIGkgaW4gb3B0aW9ucykge2lmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpe1xuXHRcdHJlcXVlc3RPYmpbaV0gPSBvcHRpb25zW2ldO1xuXHR9fVxuXHRpZihhcmdzLm1vZGVsKSB7XG4gXHRcdGFyZ3MubW9kZWwgPSBnZXRNb2RlbERhdGEoYXJncy5tb2RlbCk7XG5cdH1cblx0cm9vdE5vZGUuY2xhc3NOYW1lICs9ICcgbG9hZGluZyc7XG5cdHZhciBteURlZmVycmVkID0gbS5kZWZlcnJlZCgpO1xuXHRtLnJlcXVlc3QocmVxdWVzdE9iaikudGhlbihmdW5jdGlvbigpe1xuXHRcdHJvb3ROb2RlLmNsYXNzTmFtZSA9IHJvb3ROb2RlLmNsYXNzTmFtZS5zcGxpdCgnIGxvYWRpbmcnKS5qb2luKCcnKTtcblx0XHRteURlZmVycmVkLnJlc29sdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRpZihyZXF1ZXN0T2JqLmJhY2tncm91bmQpe1xuXHRcdFx0bS5yZWRyYXcodHJ1ZSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG15RGVmZXJyZWQucHJvbWlzZTtcbn0sXG4nc2V0JzogZnVuY3Rpb24oYXJncywgb3B0aW9ucyl7XG5cdGFyZ3MgPSBhcmdzIHx8IHt9O1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0dmFyIHJlcXVlc3RPYmogPSB7XG5cdFx0XHRtZXRob2Q6J3Bvc3QnLCBcblx0XHRcdHVybDogYXBpQ2xpZW50UGF0aCArICcvYXBpL3Nlc3Npb24vc2V0Jyxcblx0XHRcdGRhdGE6IGFyZ3Ncblx0XHR9LFxuXHRcdHJvb3ROb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG5cdGZvcih2YXIgaSBpbiBvcHRpb25zKSB7aWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSl7XG5cdFx0cmVxdWVzdE9ialtpXSA9IG9wdGlvbnNbaV07XG5cdH19XG5cdGlmKGFyZ3MubW9kZWwpIHtcbiBcdFx0YXJncy5tb2RlbCA9IGdldE1vZGVsRGF0YShhcmdzLm1vZGVsKTtcblx0fVxuXHRyb290Tm9kZS5jbGFzc05hbWUgKz0gJyBsb2FkaW5nJztcblx0dmFyIG15RGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG5cdG0ucmVxdWVzdChyZXF1ZXN0T2JqKS50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0cm9vdE5vZGUuY2xhc3NOYW1lID0gcm9vdE5vZGUuY2xhc3NOYW1lLnNwbGl0KCcgbG9hZGluZycpLmpvaW4oJycpO1xuXHRcdG15RGVmZXJyZWQucmVzb2x2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdGlmKHJlcXVlc3RPYmouYmFja2dyb3VuZCl7XG5cdFx0XHRtLnJlZHJhdyh0cnVlKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gbXlEZWZlcnJlZC5wcm9taXNlO1xufVxuXHR9O1xufTsiLCIvKiBOT1RFOiBUaGlzIGlzIGEgZ2VuZXJhdGVkIGZpbGUsIHBsZWFzZSBkbyBub3QgbW9kaWZ5IGl0LCB5b3VyIGNoYW5nZXMgd2lsbCBiZSBsb3N0ICovdmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyk7dmFyIHN1Z2FydGFncyA9IHJlcXVpcmUoJ21pdGhyaWwuc3VnYXJ0YWdzJykobSk7dmFyIGJpbmRpbmdzID0gcmVxdWlyZSgnbWl0aHJpbC5iaW5kaW5ncycpKG0pO3ZhciBhbmltYXRlID0gcmVxdWlyZSgnLi4vcHVibGljL2pzL21pdGhyaWwuYW5pbWF0ZS5qcycpKG0pO3ZhciBwZXJtaXNzaW9ucyA9IHJlcXVpcmUoJy4uL3N5c3RlbS9taXNvLnBlcm1pc3Npb25zLmpzJyk7dmFyIGxheW91dCA9IHJlcXVpcmUoJy4uL212Yy9sYXlvdXRfbWlzby5qcycpO3ZhciByZXN0cmljdCA9IGZ1bmN0aW9uKHJvdXRlLCBhY3Rpb25OYW1lKXtcdHJldHVybiByb3V0ZTt9LHBlcm1pc3Npb25PYmogPSB7fTt2YXIgbWlzb0dsb2JhbCA9IG1pc29HbG9iYWwgfHwge307aWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIil7XHR3aW5kb3cubWlzb0dsb2JhbCA9IG1pc29HbG9iYWw7fXZhciB1c2VyID0gcmVxdWlyZSgnLi4vbXZjL3VzZXIuanMnKTtcbnZhciBob21lID0gcmVxdWlyZSgnLi4vbXZjL2hvbWUuanMnKTtcbnZhciBkb2MgPSByZXF1aXJlKCcuLi9tdmMvZG9jLmpzJyk7XG5cbnZhciBoZWxsbyA9IHJlcXVpcmUoJy4uL212Yy9oZWxsby5qcycpO1xudmFyIGxvZ2luID0gcmVxdWlyZSgnLi4vbXZjL2xvZ2luLmpzJyk7XG52YXIgbW9iaWxlaG9tZSA9IHJlcXVpcmUoJy4uL212Yy9tb2JpbGVob21lLmpzJyk7XG5cbnZhciB0b2RvID0gcmVxdWlyZSgnLi4vbXZjL3RvZG8uanMnKTtcblxuaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcdHdpbmRvdy5tID0gbTt9XHRtLnJvdXRlLm1vZGUgPSAncGF0aG5hbWUnO20ucm91dGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc29BdHRhY2htZW50Tm9kZScpLCAnLycsIHsnL3VzZXJzL25ldyc6IHJlc3RyaWN0KHVzZXIubmV3LCAndXNlci5uZXcnKSxcbicvJzogcmVzdHJpY3QoaG9tZS5pbmRleCwgJ2hvbWUuaW5kZXgnKSxcbicvZG9jLzpkb2NfaWQnOiByZXN0cmljdChkb2MuZWRpdCwgJ2RvYy5lZGl0JyksXG4nL2RvY3MnOiByZXN0cmljdChkb2MuaW5kZXgsICdkb2MuaW5kZXgnKSxcbicvaGVsbG8vOmhlbGxvX2lkJzogcmVzdHJpY3QoaGVsbG8uZWRpdCwgJ2hlbGxvLmVkaXQnKSxcbicvbG9naW4nOiByZXN0cmljdChsb2dpbi5pbmRleCwgJ2xvZ2luLmluZGV4JyksXG4nL21vYmlsZWhvbWUnOiByZXN0cmljdChtb2JpbGVob21lLmluZGV4LCAnbW9iaWxlaG9tZS5pbmRleCcpLFxuJy9tb2JpbGV0ZXN0JzogcmVzdHJpY3QobW9iaWxlaG9tZS50ZXN0LCAnbW9iaWxlaG9tZS50ZXN0JyksXG4nL3RvZG9zJzogcmVzdHJpY3QodG9kby5pbmRleCwgJ3RvZG8uaW5kZXgnKSxcbicvdXNlci86dXNlcl9pZCc6IHJlc3RyaWN0KHVzZXIuZWRpdCwgJ3VzZXIuZWRpdCcpLFxuJy91c2Vycyc6IHJlc3RyaWN0KHVzZXIuaW5kZXgsICd1c2VyLmluZGV4Jyl9KTttaXNvR2xvYmFsLnJlbmRlckhlYWRlciA9IGZ1bmN0aW9uKG9iail7XHR2YXIgaGVhZGVyTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNvSGVhZGVyTm9kZScpO1x0aWYoaGVhZGVyTm9kZSl7XHRcdG0ucmVuZGVyKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNvSGVhZGVyTm9kZScpLCBsYXlvdXQuaGVhZGVyQ29udGVudD8gbGF5b3V0LmhlYWRlckNvbnRlbnQoe21pc29HbG9iYWw6IG9iaiB8fCBtaXNvR2xvYmFsfSk6ICcnKTtcdH19O21pc29HbG9iYWwucmVuZGVySGVhZGVyKCk7IiwiLypcdG1pc28gcGVybWlzc2lvbnNcblx0UGVybWl0IHVzZXJzIGFjY2VzcyB0byBjb250cm9sbGVyIGFjdGlvbnMgYmFzZWQgb24gcm9sZXMgXG4qL1xudmFyIG1pc28gPSByZXF1aXJlKFwiLi4vbW9kdWxlcy9taXNvLnV0aWwuY2xpZW50LmpzXCIpLFxuXHRoYXNSb2xlID0gZnVuY3Rpb24odXNlclJvbGVzLCByb2xlcyl7XG5cdFx0dmFyIGhhc1JvbGUgPSBmYWxzZTtcblx0XHQvL1x0QWxsIHJvbGVzXG5cdFx0aWYodXNlclJvbGVzID09IFwiKlwiKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0Ly9cdFNlYXJjaCBlYWNoIHVzZXIgcm9sZVxuXHRcdG1pc28uZWFjaCh1c2VyUm9sZXMsIGZ1bmN0aW9uKHVzZXJSb2xlKXtcblx0XHRcdHVzZXJSb2xlID0gKHR5cGVvZiB1c2VyUm9sZSAhPT0gXCJzdHJpbmdcIik/IHVzZXJSb2xlOiBbdXNlclJvbGVdO1xuXHRcdFx0Ly9cdFNlYXJjaCBlYWNoIHJvbGVcblx0XHRcdG1pc28uZWFjaChyb2xlcywgZnVuY3Rpb24ocm9sZSl7XG5cdFx0XHRcdGlmKHVzZXJSb2xlID09IHJvbGUpIHtcblx0XHRcdFx0XHRoYXNSb2xlID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiBoYXNSb2xlO1xuXHR9O1xuXG4vL1x0RGV0ZXJtaW5lIGlmIHRoZSB1c2VyIGhhcyBhY2Nlc3MgdG8gYW4gQVBQIGFjdGlvblxuLy9cdFRPRE86IFxubW9kdWxlLmV4cG9ydHMuYXBwID0gZnVuY3Rpb24ocGVybWlzc2lvbnMsIGFjdGlvbk5hbWUsIHVzZXJSb2xlcyl7XG5cdC8vXHRUT0RPOiBQcm9iYWJseSBuZWVkIHRvIHVzZSBwYXNzPWZhbHNlIGJ5IGRlZmF1bHQsIGJ1dCBmaXJzdDpcblx0Ly9cblx0Ly9cdCogQWRkIGdsb2JhbCBjb25maWcgZm9yIHBhc3MgZGVmYXVsdCBpbiBzZXJ2ZXIuanNvblxuXHQvL1x0KiBcblx0Ly9cblx0dmFyIHBhc3MgPSB0cnVlO1xuXG5cdC8vXHRBcHBseSBkZW55IGZpcnN0LCB0aGVuIGFsbG93LlxuXHRpZihwZXJtaXNzaW9ucyAmJiB1c2VyUm9sZXMpe1xuXHRcdGlmKHBlcm1pc3Npb25zLmRlbnkpIHtcblx0XHRcdHBhc3MgPSAhIGhhc1JvbGUodXNlci5yb2xlcywgcGVybWlzc2lvbnMuZGVueSk7XG5cdFx0fVxuXHRcdGlmKHBlcm1pc3Npb25zLmFsbG93KSB7XG5cdFx0XHRwYXNzID0gaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5hbGxvdyk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHBhc3M7XG59O1xuXG5cbi8vXHREZXRlcm1pbmUgaWYgdGhlIHVzZXIgaGFzIGFjY2VzcyB0byBhbiBBUEkgYWN0aW9uXG4vL1x0VE9ETzogXG5tb2R1bGUuZXhwb3J0cy5hcGkgPSBmdW5jdGlvbihwZXJtaXNzaW9ucywgYWN0aW9uTmFtZSwgdXNlclJvbGVzKXtcblx0Ly9cdFRPRE86IFByb2JhYmx5IG5lZWQgdG8gdXNlIHBhc3M9ZmFsc2UgYnkgZGVmYXVsdCwgYnV0IGZpcnN0OlxuXHQvL1xuXHQvL1x0KiBBZGQgZ2xvYmFsIGNvbmZpZyBmb3IgcGFzcyBkZWZhdWx0IGluIHNlcnZlci5qc29uXG5cdC8vXHQqIFxuXHQvL1xuXHR2YXIgcGFzcyA9IHRydWU7XG5cblx0Ly9cdEFwcGx5IGRlbnkgZmlyc3QsIHRoZW4gYWxsb3cuXG5cdGlmKHBlcm1pc3Npb25zICYmIHVzZXJSb2xlcyl7XG5cdFx0aWYocGVybWlzc2lvbnMuZGVueSkge1xuXHRcdFx0cGFzcyA9ICEgaGFzUm9sZSh1c2VyLnJvbGVzLCBwZXJtaXNzaW9ucy5kZW55KTtcblx0XHR9XG5cdFx0aWYocGVybWlzc2lvbnMuYWxsb3cpIHtcblx0XHRcdHBhc3MgPSBoYXNSb2xlKHVzZXIucm9sZXMsIHBlcm1pc3Npb25zLmFsbG93KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcGFzcztcbn07Il19
