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
	options = options || {};
	var requestObj = {
		method:'post', 
		url: '/api/flatfiledb/find',
		data: args
	};
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	if(requestObj.background) {
		m.startComputation();
	}
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background) {
			m.endComputation();
		}
	});
	return myDeferred.promise;
},
'save': function(args, options){
	options = options || {};
	var requestObj = {
		method:'post', 
		url: '/api/flatfiledb/save',
		data: args
	};
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	if(requestObj.background) {
		m.startComputation();
	}
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background) {
			m.endComputation();
		}
	});
	return myDeferred.promise;
},
'remove': function(args, options){
	options = options || {};
	var requestObj = {
		method:'post', 
		url: '/api/flatfiledb/remove',
		data: args
	};
	for(var i in options) {if(options.hasOwnProperty(i)){
		requestObj[i] = options[i];
	}}
	if(args.model) {
 		args.model = getModelData(args.model);
	}
	if(requestObj.background) {
		m.startComputation();
	}
	var myDeferred = m.deferred();
	m.request(requestObj).then(function(){
		myDeferred.resolve.apply(this, arguments);
		if(requestObj.background) {
			m.endComputation();
		}
	});
	return myDeferred.promise;
}
	};
};