/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var utils = require('../adaptor.js')().utils;
var miso = require('../../../server/miso.util.js');
var myAdaptor = require('../flatfiledb/flatfiledb.adaptor.js')(utils);
module.exports = function(m){
	return {
'find': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		isReady = false,
		doneFunc = function(){isReady = true;};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor['find'].apply(this, args);
	var bindScope = arguments.callee.caller;
	bindScope._misoReadyBinding = miso.readyBinderFactory();
	return { then: function(cb, err){
		doneFunc = bindScope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(miso.response(successResult[0]));
			}
		});
		if(isReady){
			process.nextTick(doneFunc)
		}
	}};
},
'save': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		isReady = false,
		doneFunc = function(){isReady = true;};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor['save'].apply(this, args);
	var bindScope = arguments.callee.caller;
	bindScope._misoReadyBinding = miso.readyBinderFactory();
	return { then: function(cb, err){
		doneFunc = bindScope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(miso.response(successResult[0]));
			}
		});
		if(isReady){
			process.nextTick(doneFunc)
		}
	}};
},
'remove': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		errResult,
		errFunc = function(){errResult=arguments; doneFunc()},
		successResult,
		successFunc = function(){successResult=arguments; doneFunc()},
		isReady = false,
		doneFunc = function(){isReady = true;};
	
	args.unshift(successFunc, errFunc);
	result = myAdaptor['remove'].apply(this, args);
	var bindScope = arguments.callee.caller;
	bindScope._misoReadyBinding = miso.readyBinderFactory();
	return { then: function(cb, err){
		doneFunc = bindScope._misoReadyBinding.bind(function(){
			if(errResult){
				err(errResult);
 			} else {
				cb(miso.response(successResult[0]));
			}
		});
		if(isReady){
			process.nextTick(doneFunc)
		}
	}};
}
	};
};