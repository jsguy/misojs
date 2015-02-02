/*	Miso layout page

	This layout determines the HTML surround for each of your mvc routes.
	Feel free to modify as you see fit - as long as the attachemnt node is 
	present, it should work.

	Note: this is the only mvc that does not require a controller.

*/
var m = require('mithril'),
	sugartags = require('../server/mithril.sugartags.node.js')(m);

module.exports.index = function(ctrl){
	with(sugartags) {
		return [
		m.trust("<!doctype html>"),
		HTML([
			HEAD([
			 	LINK({href: '/css/style.css', rel:'stylesheet'}), 
			 	//	The reload functionality. TODO: use in development only
			 	(ctrl.environment == "development"? SCRIPT({src: '/reload.js'}): "")
			]),
		 	BODY([
			 	HEADER([
		 			DIV({class: 'cw cf'}, [
		 				A({alt: 'MISO', href:'/', config: m.route}, [
		 					IMG({src: '/img/miso_logo.png'})
		 				])
		 			])
		 		]),
		 		SECTION({class: 'cw', id: ctrl.misoAttachmentNode}, ctrl.content),
				SCRIPT({src: '/miso.js'})
			])
		])]
	}
};