var express = require('express'),
  app = express(),
  m = require('mithril'),
  render = require('mithril-node-render'),
  _ = require('lodash'),
  Signal = require('signals'),
  models = require('./m')(),
  controllers = require('./c')(app, true),
  sugartags = require('./mithril.sugartags.node.js')(m),
  fs = require('fs'),
  vm = require('vm'),
  getView = function(fileName){
    return fs.readFileSync("view/" + fileName, "utf8");
  },
  //  Render a view
  renderView = function(view, ctrl){
    var script = vm.createScript(view, 'theview.js');
    sugartags.ctrl = ctrl;
    sugartags.m = m;
    return render(script.runInNewContext(sugartags), ctrl);
  };



//  Puts the lotion on its... 
function base(content) {
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '</head>',
    '<body>',
    content,
    '</body>',
    '</html>'
  ].join('');
}

//  Fake storage for now
var store = {
  load: function load(type, id) {
    return {
      then: function(cb){
        setTimeout(function(){
          cb(new models[type](id, "bob"));
        }, 10);
      }
    }
  }
};

userView = function(ctrl){

  return "DIV('waddup ' + ctrl.user.name + '!')";
};


function userController(params) {
  var userId = params ? params.id : m.route.param('id');
  var scope = {
    user: null,
    onReady: new Signal()
  };
  store.load('user', userId).then(function(loadedUser) {
    console.log('and then...', loadedUser);
    scope.user = loadedUser;
    scope.onReady.dispatch();
  });
  return scope;
};

 
/* 
var routes = {
  '/user/:id': { controller: userController, view: userView }
};

_.each(routes, function(module, route) {
  app.get(route, function(req, res) {
    var scope = module.controller(req.params);
    if (!scope || !scope.onReady) {
//      return res.end(base(render(module.view(scope))));
      return res.end(base(renderView(module.view(scope), scope)));
    }
    scope.onReady.addOnce(function() {
      console.log('render...');

      //res.end(base(render(module.view(scope))));
      res.end(base(renderView(module.view(scope), scope)));
    });
  });
});
*/
//module.exports = app;

var server = app.listen(3330, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})