var fs = require('fs'),
	_ = require('lodash');

module.exports = function(environment) {
	var serverConfig = require('../cfg/server.json'),
		envCfgFile;

	if(environment !== 'production') {
		envCfgFile = __dirname + '/../cfg/server.' + environment +'.json';

		if(fs.existsSync(envCfgFile) && fs.statSync(envCfgFile).isFile()){
			envCfg = require(envCfgFile);
			serverConfig = _.assign(serverConfig, envCfg);
		}
	}

	serverConfig.environment = environment;

	return serverConfig;
};