/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
module.exports = function(m){
	return {
'save': function(args){
	return m.request({
		method:'post', 
		url: '/api/save',
		data: args
	});
},
'findById': function(args){
	return m.request({
		method:'post', 
		url: '/api/findById',
		data: args
	});
},
'findByModel': function(args){
	return m.request({
		method:'post', 
		url: '/api/findByModel',
		data: args
	});
}
	};
};