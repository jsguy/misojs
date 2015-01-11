misojs
======

misojs: MIthril iSOmorphic JavaScript framework

NOTE: Not for public consumption just yet!

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



## TODO before making public

The main philosophy for miso is to be quick and easy, whilst providing support for best practice development.

We need to address the following before making it public.

### Models

A proper way to enhance standard mithril models - we want to be able to handle:

* Objects with native types, and "mithril prop" style getter/setters
* Data validation capabilities
* Collections
* Relations: has one, has many, belongs to one, belongs to many, etc...

I'm considering using restify to create an API, and then a "store" object similar to what you mentioned.

### V

* Handling of composed views

### Documentation for how the above works

