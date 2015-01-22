misojs
======

misojs: MIthril iSOmorphic JavaScript framework

_NOTE:_ Not for public consumption just yet!

## Install

* Download this [zip file](https://github.com/jsguy/misojs/archive/master.zip) and expand in a directory somewhere.
* `npm install`
* chmod +x bin/miso.bin.js
* bin/miso.bin.js
* http://localhost:6476/ (6476 = miso if you typed it on a keypad)

You can now click the link to get to the user edit page - click it, then re-load that url, and you'll see that it can load that URL in the browser, and render it on the backend, whilst initalizing the app on the frontend, ie: isomorphic!

## Future install

```javascript
npm install misojs -g
```

Then to create and run a project:

```javascript
miso -n myApp -s todo
cd myApp && npm install
miso run
```

This creates a new project with the 'todo' skeleton applied, and runs it on http://localhost:6476

Documentation is in [the wiki](wiki)