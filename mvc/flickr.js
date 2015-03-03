var m = require('mithril'),
	miso = require('../server/miso.util.js'),
	sugartags = require('mithril.sugartags')(m),
	flickr = require('../modules/adaptor/flickr/api.server.js')(m);

var index = module.exports.index = {
	models: {
		pics: function(data){
			this.flickrData = m.prop(data.flickrData);
		}
	},
	controller: function(params) {
		var ctrl = this;
		flickr.photos({}).then(function(data){
			ctrl.model.flickrData(data.result.items);
		});
		ctrl.model = new index.models.pics({flickrData: {}});
		return ctrl;
	},
	view: function(ctrl) {
		with(sugartags) {
			return DIV([
				ctrl.model.flickrData().map(function(item){
					return IMG({src: item.media.m});
				})
			]);
		}
	}
};