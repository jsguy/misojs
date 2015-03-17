var m = require('mithril'),
	miso = require('../modules/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	flickr = require('../modules/api/flickr/api.server.js')(m);

var index = module.exports.index = {
	models: {
		pics: function(data){
			this.flickrData = m.prop(data.flickrData);
		}
	},
	controller: function(params) {
		var ctrl = this;
		flickr.photos({tags: "Sydney opera house", tagmode: "any"}).then(function(data){
			ctrl.model.flickrData(data.result.items);
		});
		ctrl.model = new index.models.pics({flickrData: {}});
		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV([
				miso.each(ctrl.model.flickrData(), function(item){
					return IMG({src: item.media.m});
				})
			]);
		}
	}
};