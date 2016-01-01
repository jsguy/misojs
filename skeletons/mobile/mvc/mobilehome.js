var m = require('mithril'),
	miso = require('../modules/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	animate = require('../public/js/mithril.animate.nobind.js')(m),
	flickr = require('../system/api/flickr/api.server.js')(m);

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