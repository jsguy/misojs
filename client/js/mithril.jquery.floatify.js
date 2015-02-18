//  jquery.floatify mithril integration
//	Requires: jQuery, jquery.floatify
//  Usage:      DIV({"class": "header", config: floatify({ surround: document.body})}, [ ... ])
var floatify = function(ctrl) {
	return function(element, isInitialized) {
		if (!isInitialized) {
			$(ctrl.surround).floatify(element);
		}
	};
};