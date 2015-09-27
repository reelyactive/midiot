/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var midiot = require('./midiot');
var MIDIoT = midiot.MIDIoT;


var HTTP_PORT = 3006;


/**
 * MidiotServer Class
 * Server for midiot, returns an instance of midiot with its own Express
 * server listening on the given port.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function MidiotServer(options) {
  options = options || {};
  var specifiedHttpPort = options.httpPort || HTTP_PORT;
  var httpPort = process.env.PORT || specifiedHttpPort;

  var app = express();

  var instance = new MIDIoT(options);
  options.app = app;
  instance.configureRoutes(options);

  app.listen(httpPort, function() {
    console.log('midiot is listening on port', httpPort);
  });

  return instance;
}


module.exports = MidiotServer;
module.exports.MIDIoT = MIDIoT;
