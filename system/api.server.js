/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var utils = require('../system/adaptor/adaptor.js')().utils;
var miso = require('../server/miso.util.js');
var myAdaptor = require('../system/adaptor/mongoose/mongoose.adaptor.js')(utils);
module.exports = function(m, scope){
	return {
'find': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'find',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){throw 'called doneFunc too soon...';};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	scope._misoReadyBinding = miso.readyBinderFactory();
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(successResult);
			}
		});
	}};
},
'save': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'save',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){throw 'called doneFunc too soon...';};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	scope._misoReadyBinding = miso.readyBinderFactory();
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(successResult);
			}
		});
	}};
},
'findById': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'findById',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){throw 'called doneFunc too soon...';};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	scope._misoReadyBinding = miso.readyBinderFactory();
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(successResult);
			}
		});
	}};
},
'findByModel': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'findByModel',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){throw 'called doneFunc too soon...';};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	scope._misoReadyBinding = miso.readyBinderFactory();
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(successResult);
			}
		});
	}};
}
	};
};