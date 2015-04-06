/*
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');
 
db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");
 
  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();
 
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});
 
db.close();
*/
//	Flat-file-db miso api example

//	TODO: Move connection to a /cfg file somewhere...
var flatfile = require('flat-file-db'),
	_ = require('lodash'),
	uuid = require('node-uuid'),
	db = flatfile.sync('./system/api/flatfiledb/data/flat-data-file.db');

module.exports = function(utils){
	return {
		find: function(cb, err, args){
			var list = db.keys(),
				result = [], tmp, i, pass;

			for(i = 0; i < list.length; i += 1) {
				tmp = db.get(list[i]);
				if(args.type == tmp.type) {
					//	Apply query
					if(args.query) {
						pass = true;
						_.each(args.query, function(value, key){
							if(tmp[key] !== value) {
								pass = false;
								return false;
							}
						});
						if(pass){
							result.push(tmp);
						}
					} else {
						result.push(tmp);
					}
				}
			}
			cb(result);
		},
		save: function(cb, err, args){
			//	Get an instance of the model
			var Model = utils.getModel(args.type), model, validation;

			if(!Model) {
				return err("Model not found " + args.type);
			}

			model = new Model(args.model);
			validation = model.isValid? model.isValid(): true;

			//	Validate the model data
			if(validation === true) {
				var data = utils.getModelData(model);

				//	TODO: fix _id issue.
				data._id = data.id || data._id || uuid.v4();
				data.type = data.type || args.type;

				db.put(data._id, data, function (errorText) {
					if (errorText) {
						return err(errorText);
					}
					return cb(data._id);
				});
			} else {
				//	Send beack the validation errors
				return err(validation);
			}
		},
		remove: function(cb, err, args){
			var id = args._id || args.id;
			if(db.has(id)) {
				db.del(id, function(errorText){
					if (errorText) {
						return err(errorText);
					} else {
						return cb("Successfully deleted " + id);
					}
				});
			}
		}
	};
};