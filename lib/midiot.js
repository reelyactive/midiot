/**
 * Copyright reelyActive 2014-2015
 * We believe in an open Internet of Things
 */

var midi = require('midi');
var osc = require('osc');
var util = require('util');
var events = require('events');
var express = require('express');
var path = require('path');
var socketio = require('socket.io');
var devicesManager = require('./devicesmanager');


var VIRTUAL_PORT_NAME = 'reelyActive';
var DEFAULT_OSC_ADDRESS = '127.0.0.1';
var DEFAULT_OSC_PORT = 57121;
var DEFAULT_PORT_ID = 0;
var DEFAULT_MIDI_PORT_NUMBER = 0;
var DEFAULT_NOTE = 60;
var DEFAULT_VELOCITY = 127;
var STATUS_NOTE_ON = 0x90;
var STATUS_NOTE_OFF = 0x80;
var STATUS_CONTROL_CHANGE = 0xb0;


/**
 * MIDIoT Class
 * Musical Instrument Digital Interface of Things.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function MIDIoT(options) {
  var self = this;
  options = options || {};

  self.oscLocalAddress = options.oscLocalAddress || DEFAULT_OSC_ADDRESS;
  self.oscLocalPort = options.oscLocalPort || DEFAULT_OSC_PORT;
  self.oscTargetAddress = options.oscTargetAddress || DEFAULT_OSC_ADDRESS;
  self.oscTargetPort = options.oscTargetPort || DEFAULT_OSC_PORT;

  self.devicesManager = new devicesManager(options);

  self.routes = {
    "/": express.static(path.resolve(__dirname + '/../web'))
  };

  self.midiOut = new midi.output();
  self.midiOut.openVirtualPort(VIRTUAL_PORT_NAME);

  self.udpPort = new osc.UDPPort( { localAddress: self.oscLocalAddress,
                                    localPort: self.oscLocalPort } );
  self.udpPort.open();

  console.log('reelyActive midiot instance is producing a soundscape in an open IoT');

  events.EventEmitter.call(self);
};
util.inherits(MIDIoT, events.EventEmitter);


/**
 * Configure the routes of the API.
 * @param {Object} options The options as a JSON object.
 */
MIDIoT.prototype.configureRoutes = function(options) {
  options = options || {};
  var self = this;

  if(options.app) {
    var app = options.app;

    app.use(function(req, res, next) {
      req.midiot = self;
      next();
    });

    for(var mountPath in self.routes) {
      var router = self.routes[mountPath];
      app.use(mountPath, router);
    }
  }
};


/**
 * Create the instance of socket.io on the given server.
 * @param {Object} options The options as a JSON object.
 */
MIDIoT.prototype.createWebSocket = function(options) {
  options = options || {};
  var self = this;

  if(options.server) {
    self.io = socketio(options.server);

    self.io.on('connection', function(socket) {
      self.socket = socket;
      socket.on('update', function(device) {
        self.devicesManager.update(device);
      });
      socket.on('control', function(control) {
        self.devicesManager.control(control);
      });
    });
  }
};


/**
 * Bind to the given data stream.
 * @param {Object} options The options as a JSON object.
 */
MIDIoT.prototype.bind = function(options) {
  options = options || {};
  var self = this;

  if(options.barnowl) {
    self.middleware = options.barnowl;
    self.middleware.on('visibilityEvent', function(tiraid) {
      handleNotification(self, 'decoding', tiraid);
    });
  }  
  if(options.barnacles) {
    self.notifications = options.barnacles;
    self.notifications.on('appearance', function(tiraid) {
      handleNotification(self, 'appearance', tiraid);
    });
    self.notifications.on('keep-alive', function(tiraid) {
      handleNotification(self, 'keep-alive', tiraid);
    });
    self.notifications.on('displacement', function(tiraid) {
      handleNotification(self, 'displacement', tiraid);
    });
    self.notifications.on('disappearance', function(tiraid) {
      handleNotification(self, 'disappearance', tiraid);
    });
  }
}


/**
 * Return the available output ports as a JSON object.
 */
MIDIoT.prototype.getPorts = function() {
  var self = this;
  var ports = {};
  var numberOfPorts = this.midiOut.getPortCount();

  for(var cPort = 0; cPort < numberOfPorts; cPort++) {
    ports[cPort] = self.midiOut.getPortName(cPort);
  }  
  return ports;
}


/**
 * Open the given output port.
 * @param {Number} portNumber The port number.
 */
MIDIoT.prototype.openPort = function(portNumber) {
  portNumber = portNumber || DEFAULT_MIDI_PORT_NUMBER;
  this.midiOut.openPort(portNumber);  
}


/**
 * Output a MIDI message.
 * @param {Object} message The MIDI message as a JSON object.
 */
MIDIoT.prototype.outputMessage = function(message) {
  message = message || {};
  var self = this;
  var messageCodes;

  if(message.noteOn) {
    messageCodes = getMessageCodes('noteOn', message.noteOn);
    self.midiOut.sendMessage(messageCodes);
    sendOscMessage(self, messageCodes);
  }
  else if(message.noteOff) {
    messageCodes = getMessageCodes('noteOff', message.noteOff);
    self.midiOut.sendMessage(messageCodes);
    sendOscMessage(self, messageCodes);
  }
  else if(message.controlChange) {
    messageCodes = getMessageCodes('controlChange', message.controlChange);
    self.midiOut.sendMessage(messageCodes);
    sendOscMessage(self, messageCodes);
  }
  else {
    messageCodes = getMessageCodes()
    self.midiOut.sendMessage(messageCodes);
    sendOscMessage(self, messageCodes);
  } 
}


/**
 * Handle a notification from barnowl or barnacles
 * @param {MIDIoT} instance The given MIDIoT instance.
 * @param {String} type The notification type.
 * @param {Object} tiraid The notification tiraid.
 */
function handleNotification(instance, type, tiraid) {
  instance.devicesManager.handleEvent(type, tiraid, function(status) {
    if(status.valid) {
      produceMessage(instance, status);
    }
    instance.emit('event', status);
  });
}


/**
 * Produce and output a message on MIDI and socket
 * @param {MIDIoT} instance The given MIDIoT instance.
 * @param {Object} status The message status.
 */
function produceMessage(instance, status) { // TODO: choose better names
  var parameters = { channel: status.channel,
                     key: status.key,
                     velocity: status.velocity };

  if(status.category === 'Controller') {
    instance.outputMessage( { controlChange: parameters } );
    if(instance.socket) {
      status.type = 'controlChange';
      instance.socket.emit('event', status);
    }
  }

  else {

    // Activate note
    instance.outputMessage( { noteOn: parameters } );
    if(instance.socket) {
      status.type = 'noteOn';
      instance.socket.emit('event', status);
    }
 
    // Deactivate note
    setTimeout(function() {
      instance.outputMessage({ noteOff: parameters });
      if(instance.socket) {
        status.type = 'noteOff';
        instance.socket.emit('event', status); // TODO: note off
      }
    }, status.duration);
  }
}


/**
 * Convert a message type and options into the corresponding MIDI code
 * @param {String} type The message type.
 * @param {Object} options The message options.
 */
function getMessageCodes(type, options) {
  switch(type) {
    case "noteOn":
      var channel = (options.channel % 16) || 0;
      var status = STATUS_NOTE_ON + channel;
      var data1 = (options.key % 127) || DEFAULT_NOTE;
      var data2 = (options.velocity % 127) || DEFAULT_VELOCITY;
      return [status, data1, data2];
    case "noteOff":
      var channel = (options.channel % 16) || 0;
      var status = STATUS_NOTE_OFF + channel;
      var data1 = (options.key % 127) || DEFAULT_NOTE;
      var data2 = (options.velocity % 127) || DEFAULT_VELOCITY;
      return [status, data1, data2];
    case "controlChange":
      var channel = (options.channel % 16) || 0;
      var status = STATUS_CONTROL_CHANGE + channel;
      var data1 = (options.key % 127) || DEFAULT_NOTE;
      var data2 = (options.velocity % 127) || DEFAULT_VELOCITY;
      return [status, data1, data2];
    default:
      return [STATUS_NOTE_ON, DEFAULT_NOTE, DEFAULT_VELOCITY];
  }
}


/**
 * Send an Open Sound Control message
 * @param {Array} message The message.
 */
function sendOscMessage(instance, message) {
  message.splice(0, 0, DEFAULT_PORT_ID); // Add Port ID
  var midiMessage = { address: "/midiMessage", args: message };
  instance.udpPort.send(midiMessage, instance.oscTargetAddress,
                        instance.oscTargetPort);
}


module.exports.MIDIoT = MIDIoT;
