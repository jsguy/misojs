var fs = require('fs'),
	_ = require('lodash');

module.exports = function(environment) {
	var serverConfig = require('../cfg/server.json'),
		envCfgFile;

	if(environment !== 'production') {
		envCfgFile = __dirname + '/../cfg/server.' + environment +'.json';

		if(fs.existsSync(envCfgFile) && fs.statSync(envCfgFile).isFile()){
			serverConfig = _.assign(serverConfig, require(envCfgFile));
		}
	}

	serverConfig.environment = environment;

	//	Expose this to the whole app
	GLOBAL.serverConfig = serverConfig;

	return serverConfig;
};