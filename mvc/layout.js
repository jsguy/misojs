/*	Miso layout page

	This layout determines the HTML surround for each of your mvc routes.
	Feel free to modify as you see fit - as long as the attachemnt node is 
	present, it should work.

	Note: this is the only mvc that does not require a controller.

*/
var m = require('mithril'),
	sugartags = require('mithril.sugartags')(m);

module.exports.index = function(ctrl){
	with(sugartags) {
		return [
		m.trust("<!doctype html>"),
		HTML([
			HEAD([
			 	LINK({href: '/css/style.css', rel:'stylesheet'})
			]),
		 	BODY({"class": 'fixed-header' }, [
			 	HEADER([
		 			DIV({"class": 'cw cf'}, [
		 				DIV({"class": 'logo'},
		 					A({alt: 'MISO', href:'/', config: m.route}, [
		 						IMG({src: '/img/miso_logo.png'})
		 					])
		 				),
		 				NAV({"class": "left"}, UL([
		 					LI(A({href: "http://misojs.com/docs", target: "_blank"}, "Documentation"))
		 				])),
		 				NAV({"class": "right"}, UL([
		 					LI(A({href: "https://github.com/jsguy/misojs", target: "_blank"}, "Github"))
		 				]))
		 			])
		 		]),
		 		SECTION({id: ctrl.misoAttachmentNode}, ctrl.content),
		 		SECTION({id: "loader"}, [
		 			DIV({"class": "loader"})
		 		]),
		 		SECTION({id: "footer"}, [
		 			DIV({"class": 'cw cf'}, m.trust("Copyright &copy; 2015 jsguy"))
		 		]),
				SCRIPT({src: '/miso.js' + (ctrl.reload? "?cacheKey=" + (new Date()).getTime(): "")}),
			 	(ctrl.reload? SCRIPT({src: '/reload.js'}): "")
			])
		])]
	}
};