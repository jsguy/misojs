/* NOTE: This is a generated file, please do not modify it, your changes will be lost */
var Promiz = require('promiz');
module.exports = function(m){
	return {
'find': function(){
	var args = Array.prototype.slice.call(arguments, 0),
		method = function (cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type), model,
				conditions = args.conditions,
				fields = args.fields || null,
				options = args.options || {};

			console.log('FIND!!!!!');

			if(!Model) {
				return err("Model not found " + args.type);
			}


			model = new Model(args.model || {});

			console.log('FIND!!!!! 333');

			//	Get an instance of a mongoose model
			var MonModel = getMongooseModel(args.type, model);
			var modelInstance = MonModel(model);

			console.log('find', conditions, fields, options);

			modelInstance.find(conditions, fields, options, function (errorText, docs) {
				if (errorText) {
					console.log('ERROR', errorText);
					return err(errorText);
				}
				console.log('FOUND', docs);
				return cb(docs);
			});
		};
	return new Promiz(function(cb, err){
		args.unshift(cb, err);
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
				var modelInstance = MonModel(model);

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
	return new Promiz(function(cb, err){
		args.unshift(cb, err);
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
	return new Promiz(function(cb, err){
		args.unshift(cb, err);
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
	return new Promiz(function(cb, err){
		args.unshift(cb, err);
		method.apply(this, args);
	});
}
	};
};