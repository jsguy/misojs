var sockjs = require('sockjs');

module.exports = function reload (server, app) {
	//	Watch for misoready, init after 10s, if we somehow fail to get ready.
	var maxWait = 30000,
		interTime = 50,
		count = 0,
		inter = setInterval(function(){
			if(app.get("MISOREADY") || count >= (maxWait/interTime)) {
				clearInterval(inter);
				var reload = sockjs.createServer({log: function(){} });
				reload.installHandlers(server, {prefix: '/misoreload'})
			}
			count += 1;
		}, interTime);
};