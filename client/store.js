var m = require('mithril');

module.exports = function(scope) {

	//	Remove any unrequired model data
	var getModelData = function(model){
		var i, result = {};
		for(i in model) {if(model.hasOwnProperty(i)) {
			if(i !== "isValid") {
				result[i] = (typeof model[i] == "function")? model[i](): model[i];
			}
		}}
		return result;
	};



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
			var v = model.isValid(),
				data;
			if(1==1 || v === true) {
				data = getModelData(model);
				console.log('Save', type, data);
				return m.request({
					method: 'POST',
					//	Hard coded to different port for now...
					url: '/api/' + type,
					data: data
					//url: '/user.json'
				});
			} else {
				console.log('Model invalid', v);
			}
		}
	};
};