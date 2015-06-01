/*	Miso custom layout page
	Example custom layout page - it removes most components
*/
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	authentication = require('../system/api/authentication/api.server.js')(m);

//	The full layout - always only rendered server side
module.exports.view = function(ctrl){
	with(sugartags) {
		return [
			m.trust("<!doctype html>"),
			HTML([
				HEAD([
					TITLE("Miso app"),
					LINK({href: '/css/style.css', rel:'stylesheet'})
				]),
				BODY([
					SECTION({id: ctrl.misoAttachmentNode}, ctrl.content),
					SCRIPT({src: '/miso.js'}),
					(ctrl.reload? SCRIPT({src: '/reload.js'}): "")
				])
			])
		];
	}
};