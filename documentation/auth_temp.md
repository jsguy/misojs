## Authentication

Authentication is the process of making sure a user is who they say they are - usually this is done by using a username and password, but it can also be done via an access token, 3rd-party services such as OAuth, or something like OpenID, or indeed Google, Facebook, GitHUb, etc...

In miso, the authentication feature has:

* The ability to see if the user has logged in (via a secret value on the server-side session)
* The ability to redirect to a login page if they haven't logged in

You can configure the authentication in `/cfg/server.json`, and set the authentication attribute on the action that requires it.

For example, in `/cfg/server.json`, you can set:

```javascript
"authentication": {
	"all": false,
	"secret": "im-so-miso",
	"strategy": "default",
	"loginUrlPattern": "/login?url=[ORIGINALURL]"
}
```

Where:

* _all_ will set the default behaviour of authentication for all actions, default is "false", ie: no authentication required
* _secret_ is the secret value that is set on the session
* _strategy_ is one of the available authentication strategies in `/modules/authentication/`, default is "default"
* _loginUrlPattern_ is a URL pattern where we will substitute "[ORIGINALURL]" for the originally requested URL.

Now, if you want a particluar action to be authenticated, you can override the default value in each of your actions, for example to need authentication on the `index` action of your todos app, set:

```javascript
module.exports.index = {
	...,
	authenticate: true
};
```

This will override the deafult value of the "all" attribute form the server config authentication and make autentication required on this action.
If your app is mainly a secure app, you'll want to set "all" attribute to true and override the "login" and, (if you have one), the "forgot password" pages, and so as to not require authentication.

### Sample implementation

In Miso, we have a sample implementation of authentication that uses the flatfiledb api, we will expand this to other apis when possible.

There are 4 main components in the sample authentication process:

* The authenticate api `/modules/api/authenticate` - handles saving and loading of users, plus checking if the password matches.

* The login mechanism `/mvc/login.js` - simply allows you to enter a username and password and uses the authentication api to log you in

* User management `/mvc/users.js` - Uses the authentication api to add a user with an encrypted password

* Authentication middleware `/system/auth.js` - applies authentication on the server for actions - this is a core feature of how miso does the authentication - it simply checks if the secret is set on the session, and redirects to the configured "loginUrlPattern" URL if it doesn't match the secret.

Ideally you will not need to change the authentication middleware, as the implementation simply requires you to set the "authenticationSecret" on the request object session - you can see how this works in `/modules/api/authenticate/authenticate.api.js`.

### How the sample implementation works

* When authentication is required for access to an action, and you haven't authenticated, you are redirected to the `/login` action
* At `/login` you can authenticate with a username and password (which can be created at `/users`)
* When authenticated, a secret key is set on the session, this is used to check if a user is logged in every time they access an action that requires authentication.

Note: the authentication secret is only ever kept on the server, so the client code simply has a boolean to say if it is logged in - this means it will try to access authenticated urls if `misoGlobal.isLoggedIn` is set to "true". Of course the server will deny access to any data api end points, so your data is safe.


## Sessions

When the user is authenticated, they are provided with a session - this can be used to store temporary data and is accessible via `/modules/api/session/api.server.js`. You can use it like so in your `mvc` files:


```javascript
var session = require('../modules/api/session/api.server.js')(m);

session.get({key: 'userName'}).then(function(data){
	console.log(data.result);
});
```

These are the methods available on the session api:

| Method | Purpose |
|--------|---------|
| get({key: key}) | Retreives a value from the session for the given key |
| set({key: key, value: value}) | Sets a value in the session for the given key |

Note: Each user of your app has a session that is stored on the server, so each time you access it, it will make a XHR request. Use it sparingly!


## Permissions

Permissions allow limiting access to certain things within the system - in miso, the permissions module can perform the following actions:

* Check if the user has access to an mvc action
* Check if the user has access to an API endpoint
* Check various levels of granularity if the user has access to API actions and models

When a user does not have access, we will simply show "Access denied" as authentication will take care of logging in, so the only time the user can hit an endpoint without having permission is if they follow a link to one, or try and access it manually.

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
"_COMMENT5": "First level is the api name, it can also be * for all apis",
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