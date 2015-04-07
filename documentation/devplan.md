# Development plan

* Finish authentication
	- Should consider implementing as a filter, so it is more flexible.
	* Add timeout, 15 minutes default
	* Add login strategy support for facebook
	* Add login strategy support for google

* Add permissions
	* See auth_temp.md for details

* Update mongoose provider
	* Should match flatfiledb capabilities, so we can use for production

* Implement the most important XSS protection points - see comment in  api_endpoint.js about xss.

* Add example sql adaptor
	* Tricky part may be to create the schema - it most likely better to just let the user control that.
	
* Add unit tests for the important bits (this is probably where the bulk of the work lies)