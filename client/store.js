var m = require('mithril');

module.exports = function(scope) {
	return {
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
		save: function(type, model){
			var v = model.isValid();
			if(v === true) {
				console.log('Save', type, model);
				return m.request({
					method: 'GET',
					//url: 'api/' + type + '/' + id),
					url: '/user.json'
				});
			} else {
				console.log('Model invalid', v);
			}
		}
	};
};