/**
 * Copyright reelyActive 2015-2016
 * We believe in an open Internet of Things
 */


var http = require('http');
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
  var server = http.createServer(app);

  var instance = new MIDIoT(options);
  options.app = app;
  instance.configureRoutes(options);
  instance.createWebSocket( { server: server } );

  server.listen(httpPort, function() {
    console.log('midiot is listening on port', httpPort);
    console.log('\r\n********************************');
    console.log('Browse to http://localhost:' + httpPort);
    console.log('********************************\r\n');
  });

  return instance;
}


module.exports = MidiotServer;
module.exports.MIDIoT = MIDIoT;
