//	Test middleware
module.exports = function(args, req, res, next) {
	//	Do whatever you need to do here, using args, etc...
	//	Note: you will need to replicate the functionality on 
	//	the client side manually.
	//
	//	console.log(args.name);
	return next();
};