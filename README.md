misojs
======

misojs: MIthril iSOmorphic JavaScript framework

_NOTE:_ Not ready for public consumption just yet!

## Install

Prerequisites: [npm and node](http://nodejs.org/), [mongo DB](http://www.mongodb.org/)*

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

\* Note: mongo is simply used for the todo app.

## miso development install

Use this method, if you want to work on improving miso the framework, instead of creating a miso app.

* Download this [zip file](https://github.com/jsguy/misojs/archive/master.zip) and expand in a directory somewhere.
* `npm install`
* chmod +x bin/miso.bin.js
* bin/miso.bin.js
* http://localhost:6476

