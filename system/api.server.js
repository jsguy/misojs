/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var Promiz = require('promiz');
module.exports = function(m, scope){
	return {
'find': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		method = function (cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type), model,
				conditions = args.conditions,
				fields = args.fields || null,
				options = args.options || {};

			if(!Model) {
				return err("Model not found " + args.type);
			} else {
				model = new Model(args.model || {});
			}

			//	Get an instance of a mongoose model
			var MonModel = getMongooseModel(args.type, model);

			MonModel.find(conditions, fields, options, function (errorText, docs) {
				if (errorText) {
					return err(errorText);
				}
				return cb(docs);
			});
		};
	console.log('SCOPE', typeof scope._misoReadyBinding);
	
	return new Promiz(function(cb, err){
		args.unshift(function(){
			console.log('scope done!', arguments);
			cb.apply(this, arguments);
		}, err);
		method.apply(this, args);
	});
},
'save': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		method = function (cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type), model, validation;

			if(!Model) {
				return err("Model not found " + args.type);
			}

			model = new Model(args.model);
			validation = model.isValid? model.isValid(): true;

			//	Validate the model data
			if(validation === true) {
				//	Get an instance of a mongoose model
				var MonModel = getMongooseModel(args.type, model);
				var modelInstance = new MonModel(utils.getModelData(model));

				modelInstance.save(function (errorText) {
					if (errorText) {
						return err(errorText);
					}
					return cb("saved model!");
				});
			} else {
				//	Send beack the validation errors
				return err(validation);
			}
		};
	console.log('SCOPE', typeof scope._misoReadyBinding);
	
	return new Promiz(function(cb, err){
		args.unshift(function(){
			console.log('scope done!', arguments);
			cb.apply(this, arguments);
		}, err);
		method.apply(this, args);
	});
},
'findById': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		method = function (cb, err, args){
			console.log('findbyid', args);
			setTimeout(function(){
				cb("found by id: " + args.id);
			}, 200);
		};
	console.log('SCOPE', typeof scope._misoReadyBinding);
	
	return new Promiz(function(cb, err){
		args.unshift(function(){
			console.log('scope done!', arguments);
			cb.apply(this, arguments);
		}, err);
		method.apply(this, args);
	});
},
'findByModel': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		method = function (cb, err, args){
			console.log('findbymodel', args.model, args.whatever);
			setTimeout(function(){
				cb("found model!");
			}, 300);
		};
	console.log('SCOPE', typeof scope._misoReadyBinding);
	
	return new Promiz(function(cb, err){
		args.unshift(function(){
			console.log('scope done!', arguments);
			cb.apply(this, arguments);
		}, err);
		method.apply(this, args);
	});
}
	};
};