misojs
======

misojs: MIthril iSOmorphic JavaScript framework

## Install

Prerequisites: [npm and node](http://nodejs.org/)

```javascript
npm install misojs -g
```

Then to create and run a project:

```javascript
miso -n myApp -s todo
cd myApp
miso run
```

This creates a new project with the 'todo' skeleton applied, and runs it on http://localhost:6476

PS: 6476 = miso if you typed it on a keypad!

Documentation is in [the wiki](../../wiki)

## miso development install

Use one of these methods, if you want to work on improving miso the framework, instead of creating a miso app.

### archive download

* Download this [zip file](https://github.com/jsguy/misojs/archive/master.zip) and expand in a directory somewhere.
* `npm install`
* chmod +x bin/miso.bin.js
* bin/miso.bin.js run
* Open http://localhost:6476 within your browser

### clone repository

* Clone this repository to a directory somewhere `git clone https://github.com/jsguy/misojs.git`
* cd misojs
* `npm install`
* chmod +x bin/miso.bin.js
* bin/miso.bin.js run
* Open http://localhost:6476 within your browser

## IE8 support

Mithril needs a bunch of polyfills - grab [from here](https://gist.github.com/jsguy/edc7e51ae56e0ab37a5c) if you need to support IE8, and conditionally include it.

TODO: Do this automatically in miso.
