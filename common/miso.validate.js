var validator = require('validator');

//	Various common utilities that work on bothe the client and server
module.exports = {
	validate: function(self, vObj){
		return function(name){
			var result = {},
				//	For some reason node-validator doesn't have this...
				isNotEmpty = function(value){
					return typeof value !== "undefined" && value !== "" && value !== null;
				},
				//	Get value of property from 'self', which can be a function.
				getValue = function(name){
					return typeof self[name] == "function"? self[name](): self[name];
				},
				validateEntry = function(name, value, validations) {
					var validation,
						tmp,
						result = {};
					for(validation in validations) {
						//	use our "isRequired"
						if(validation == "isRequired") {
							tmp = isNotEmpty(value)? true: validations[validation]; 
						} else {
							tmp = validator[validation](value)? true: validations[validation]; 
						}

						//	Handle multiple messages
						if(tmp !== true) {
							result[name] = (result[name] === true || result[name] == "undefined")? []: result[name];
							result[name].push(tmp);
						} else {
							result[name] = true;
						}
					}
					return result;
				};

			if(name) {
				result[name] = validateEntry(name, getValue(name), vObj[name]);
			} else {
				//	Validate the whole model
				for(name in vObj) {
					result[name] = validateEntry(name, getValue(name), vObj[name]);
				}
			}

			return result;
		}
	}
};