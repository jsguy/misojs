var _ = require('lodash'),
	store = require('../server/store.js'),
	jsonResponse = function(obj){
		var result = {
			jsonrpc: "2.0",
			id: null
		};

		result = _.assign(result, obj);

		//	Can't have both result and error
		if(obj.error && obj.result) {
			delete obj.result;
		}

		return result;
	};

//	API to store models passed from the front
/*
	WARNING: This is a proof of concept, and not safe yet - still a 
	bunch of things to be done first.

	TODO:

	* Authentication, etc - this is totally open right now
	* XSS value checking - should filter by default - need a way to let the user get to the raw value as well
	* Probably more things...


	TODO: Should this call store.save, if we have a valid model?


 */
module.exports = function(app){
	//	API setup
	app.use("/api/:type", function(req, res, next){
		var type = req.params.type,
			subType = type.split("."),
			data = req.body,
			model = app.get(type);

		if(model){
			//	Create the model
			var model = new model(data);

			console.log(model.isValid() === true);

			//	TODO: This should be JSON RPC 2.0 response.
			res.json(jsonResponse({
				result: "Saved " + subType[0]
			}));
		} else {
			res.json(jsonResponse({
				error: "Unknown type: " + type
			}));
		}
	});
};