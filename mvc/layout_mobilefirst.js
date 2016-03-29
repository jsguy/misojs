var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m),
	authentication = require('../system/api/authentication/api.server.js')(m);

//	The layout is always ONLY rendered server side
module.exports.view = function(ctrl){
	with(sugartags) {
		return [
			m.trust("<!DOCTYPE html>"),
			HTML([
				HEAD([
					TITLE("Miso app"),
					META({name: "viewport", content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"}),
					META({charset: "utf-8"}),
					LINK({href: '/css/reset.css', rel:'stylesheet'})
					//	MDL
					,LINK({href: '/external/mdl/material.blue-red.min.css', rel:'stylesheet'})
					,LINK({href: '/external/mdl/mat_and_icons.css', rel:'stylesheet'})
					
					,LINK({href: '/css/layout.css', rel:'stylesheet'})
					,LINK({href: '/css/home.css', rel:'stylesheet'})
					,LINK({href: '/external/font-awesome/css/font-awesome.css', rel:'stylesheet'})
				]),
				BODY([
					SECTION({className: "miso-header"}),
					SECTION({className: "miso-nav"}),
					SECTION({id: ctrl.misoAttachmentNode}, ctrl.content),
					SECTION({className: "miso-footer"}),
					//	MDL TODO: integrate this in mithril.component.mdl?
					SCRIPT({src: '/external/mdl/material.min.js'}),
					SCRIPT({src: '/miso.js'}),
					(ctrl.reload? SCRIPT({src: '/reload.js'}): "")
				])
			])
		];
	}
};