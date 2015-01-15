var m = require('mithril');

module.exports = {
	load: function load(type, id) {
		if (!type) {
			throw new Error('no type provided to load model');
		}
		if (!id) {
			throw new Error('no id provided to load model');
		}
		return m.request({
			method: 'GET',
			//url: 'api/' + type + '/' + id),
			url: '/user.json'
		});
	},
	save: function(type, args){
		console.log('Save', type, args);
	}
};
