//	miso login adaptor example
var ffdb = require('../../../system/adaptor/flatfiledb/api.server.js');

//	Extend the flatfiledb adaptor with login-specfic methods
module.exports = function(m){
	var db = ffdb(m);

	db.login = function(cb, err, args){

		db.find({type: 'user.edit.user'}).then(function(data) {
			console.log('users', data);
			cb(data);
		});


		// console.log('args', args);
		// cb(args.model);
	};

	return db;
};