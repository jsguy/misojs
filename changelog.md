# Changelog

## 06/04/2015

* Added authentication capability - you'll need to set 'authenticate.enabled' to true in `/cfg/server.json` to use it. [See this page](https://github.com/jsguy/misojs/wiki/Authentication) for details.
* Fixed [issue #25](https://github.com/jsguy/misojs/issues/25) in the config
* Added flickr api skeleton - a non-database based api, use `miso -n flickrApp -s flickr` to try it out.
* Added [session support](https://github.com/jsguy/misojs/wiki/Authentication#sessions) via api
* Exposed the request object to api endpoint methods
* Made layout header section client renderable

## 18/03/2015

* Refactored adaptors to be apis - this means you'll need to move your adaptors to /modules/api and rename them `*.api.js` instead of `*.adaptor.js`. This change was introduced to better fit whith what an API can actually do - ie: more than being just a database adaptor, eg: JSON endpoint, etc...
* Changed how client/server overrides work - this means if you have any .server modules with .client overrides, you need to move them to /modules, and remove the word "server", as it is no longer required. eg: `myfile.server.js` -> `myfile.js` and `myfile.client.js` remain the same, but just in the `/modules` directory. This was done, as it is a more elegant solution, and provides less confusion about how client and server code is used. Note: everything useful that was in `/client` is now in `/public`, which is how the express framework recommends to do it.