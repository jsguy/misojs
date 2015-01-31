/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var Promiz = require('promiz/promiz.mithril.js');
var utils = require('../system/adaptor/adaptor.js')().utils;
var miso = require('../server/miso.util.js');
var myAdaptor = require('../system/adaptor/mongoose/mongoose.adaptor.js')(utils);
module.exports = function(m, scope){
	//	Add a binding object, so we can block till ready
	scope._misoReadyBinding = miso.readyBinderFactory();
	return {
'find': function(){
	console.log('server generate action');
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'find',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){console.log('doneFunc too soon...')};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				console.log('ERROR fired!');
				err(errResult);
 			} else {
				console.log('SUCCESS fired!');
				cb(successResult);
			}
		});
	}};
},
'save': function(){
	console.log('server generate action');
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'save',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){console.log('doneFunc too soon...')};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				console.log('ERROR fired!');
				err(errResult);
 			} else {
				console.log('SUCCESS fired!');
				cb(successResult);
			}
		});
	}};
},
'findById': function(){
	console.log('server generate action');
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'findById',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){console.log('doneFunc too soon...')};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				console.log('ERROR fired!');
				err(errResult);
 			} else {
				console.log('SUCCESS fired!');
				cb(successResult);
			}
		});
	}};
},
'findByModel': function(){
	console.log('server generate action');
	var args = Array.prototype.slice.call(arguments, 0),
		methodName = 'findByModel',
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		doneFunc = function(){console.log('doneFunc too soon...')};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor[methodName].apply(this, args);
	
	return { then: function(cb, err){
		doneFunc = scope._misoReadyBinding.bind(function(){
			if(errResult){
				console.log('ERROR fired!');
				err(errResult);
 			} else {
				console.log('SUCCESS fired!');
				cb(successResult);
			}
		});
	}};
}
	};
};