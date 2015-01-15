var fs = require('fs');
//	Simulated store
//	TODO: This should interact with the API once we have it.
module.exports = {
	load: function(type, args){
		var r;
		//	Just read the user.json file
		r = JSON.parse(fs.readFileSync("client/user.json", 'utf8'));
		return {
			then: function(cb){
				setTimeout(function(){
					cb(r);
				},0);
			}
		};
	},
	save: function(type, args){
		console.log('Save', type, args);
	}
};