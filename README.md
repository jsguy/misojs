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


## How it works in general

* Convention over configuration is used when possible
* Controllers can be manually configured, but are automatically routed based on actions (see c/index.js for details)
* Views are (by default) named [controller][action].js, for example: for the "user edit" action, the view is "user.edit.js"
* Client side code is generated from our rotes/controller/view/models - maybe we could use browserify instead?



## TODO before making public

The main philosophy for miso is to be easy to get up and running whilst providing full support for best practice development.

We need to address the following issues before making miso.js public.

### General

* Define what level of pluggability we want, for example
* Documentation for how this all works

### Models

A proper way to enhance standard mithril models - we want to be able to handle:

* Objects with native types, and "mithril prop" style getter/setters
* Data validation capabilities
* Collections
* Relations: has one, has many, belongs to one, belongs to many, etc...

I'm considering using restify to create an API, and then a "store" object similar to what you mentioned.

### V

* Handling of composed views
* Allow naming views anything - probably need to refactor routing setup a little to allow named views




