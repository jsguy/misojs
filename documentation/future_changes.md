# Future changes

Immediate for next release:

[done] * Rename "adaptor" to "api", place it in /api.

[done] * Remove /client and /severs directories, and use an extension of "X.client.js" for non-server, (eg: for miso.util.js, to create a client replacement, add a file named: miso.util.client.js). Everything goes in /modules (this already works, I just need to refactor the code) - everything client will be in /public instead.

Near future:

* Add authentication capability (work on this is already underway)

* Add permissions capability (work on this is already underway)

* SQlite based api, so we support a real SQL database as well

* Unit testing for the important bits (this is probably where the bulk of the work lies)

After the above is done, we are feature complete, and need to concentrate on documentation to make sure it is clear how everything works.

--> At this point we are feature complete for "v1.0" <--


Future road-map:

* 
* Skeleton for mobile app development (all we really need is a localstorage API + api generator that bypasses m.request)
* More skeletons
* Blog posts about how everything works
* Maybe a few presentations, eg: sydjs, perhaps the one in Leipzig, etc...