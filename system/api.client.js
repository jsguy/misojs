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
'find': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/find',
		data: args
	});
},
'save': function(args){
	args.model = args.model? getModelData(args.model): {};
	return m.request({
		method:'post', 
		url: '/api/save',
		data: args
	});
}
	};
};