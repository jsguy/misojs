## Authentication

Authentication is the process of making sure a user is who they say they are - usually this is done by using a username and password, but it can also be done via an access token, 3rd-party services such as OAuth, or something like OpenID, or indeed Google, Facebook, GitHUb, etc...

In miso, the authentication module has:

* The ability to see if the user has logged in (ie: has a session)
* The ability to redirect to a login page if they haven't logged in

This is quite configurable and flexible, and it comes with a few strategies to get you started.

You can configure authentication in `/cfg/server.json`


## Sessions

When the user is authenticated, they are provided with a session - this can be used to store data and is accessible via miso.util method: session. You can use it like so in your `mvc` files:

```javascript
var miso = require('../server/miso.util.js');
...
miso.session.get('value');
```

These are the methods available:

| Method | Purpose |
|--------|---------|
| get | Retreives a value from the session |
| set | Sets a value in the session |

Note: When using set, this will automatically create a request when used on the client, so the session data is stored.

## Permissions

permissions is the act of limiting access to certain things within the system - in miso, the permissions module can perform the following actions:

* Check if the user has access to an mvc action
* Check if the user has access to an API endpoint
* Check various levels of granularity if the user has access to API actions and models

When a user does not have access, we will simply show "Access denied" as authentication will take care of the logging in.

The developer will have access to checking which user roles the user has access to, and can use this to show/hide certain elements, such as a link to an action.

You configure permissions in `/cfg/permissions.json`, there are two parts to it as follows:

### Application level permissions

These limit access to actions on mvc controllers, for example in `/cfg/permissions.json` you might have:

```javascript
"app": {
	"hello.edit": {
		"deny": "*",
		"allow": ["support"]
	}
}
```

This will limit access to the `hello.edit` action to only be accessed by users that have the "support" role.

If you want to set default values for all actions, you could do something like:

```javascript
"app": {
	"*": {
		"deny": ["support"]
	}
}
```

This means that by default, all support roles will be denied access

### API level permissions

These limit access to the API methods on the model level, so for example you might have:

```javascript
"_COMMENT5": "First level is the adaptor name, it can also be * for all adaptors",
"api": {
	"flatfiledb": {
		"_COMMENT6": "We default all actions to NO access",
		"*": {
			"deny": "*"
		},
		"_COMMENT7": "Set access for the /find method ",
		"find": {
			"_COMMENT8": "We could set a * here to override all defaults for the find action",
			"_COMMENT9": "Set allow for todo models, admin and support",
			"todo.index.todo": {
				"allow": ["admin", "support"]
			}
		}
	}
}
```

```javascript
"api": {
	"/find": {
		"todo.index.todo": {
			"allow": ["admin", "support"]
		}
	}
}
```