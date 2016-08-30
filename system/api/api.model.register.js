module.exports = function(name, model, app){
	var key = "model." + name;

	GLOBAL.misoModels = GLOBAL.misoModels || {};
	if(app) {
		app.set(key, model);
	}
	GLOBAL.misoModels[key] = model;
	return key;
};