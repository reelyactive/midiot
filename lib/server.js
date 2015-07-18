/**
 * Copyright reelyActive 2014-2015
 * We believe in an open Internet of Things
 */

var midi = require('midi');
var util = require('util');
var events = require('events');


var VIRTUAL_PORT_NAME = "reelyActive";
var DEFAULT_MIDI_PORT_NUMBER = 0;
var DEFAULT_NOTE = 60;
var DEFAULT_VELOCITY = 127;
var STATUS_NOTE_ON = 0x90;
var STATUS_NOTE_OFF = 0x80;


/**
 * MIDIoT Class
 * Musical Instrument Digital Interface of Things.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function MIDIoT(options) {
  var self = this;
  options = options || {};

  this.midiOut = new midi.output();
  this.midiOut.openVirtualPort(VIRTUAL_PORT_NAME);

  events.EventEmitter.call(this);
};
util.inherits(MIDIoT, events.EventEmitter);


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

  if(message.noteOn) {
    self.midiOut.sendMessage(getMessageCodes('noteOn', message.noteOn));
  }
  else if(message.noteOff) {
    self.midiOut.sendMessage(getMessageCodes('noteOff', message.noteOff));
  }
  else {
    self.midiOut.sendMessage(getMessageCodes());
  } 
}


/**
 * Handle a notification from barnowl or barnacle
 * @param {MIDIoT} instance The given MIDIoT instance.
 * @param {String} type The notification type.
 * @param {Object} tiraid The notification tiraid.
 */
function handleNotification(instance, type, tiraid) {
  var id = tiraid.identifier.value;
  var rssi = tiraid.radioDecodings[0].rssi;
  var strongestDecoder = tiraid.radioDecodings[0].identifier.value;
  var decoders = tiraid.radioDecodings.length;
  var decodings = {};
  for(var cDecoding = 0; cDecoding < decoders; cDecoding++) {
    var decoderId = tiraid.radioDecodings[cDecoding].identifier.value;
    var decoderRssi = tiraid.radioDecodings[cDecoding].rssi;
    decodings[decoderId] = decoderRssi;
  }
  instance.emit('event', { id: id, rssi: rssi,
                           strongestDecoder: strongestDecoder,
                           decodings: decodings });
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
    default:
      return [STATUS_NOTE_ON, DEFAULT_NOTE, DEFAULT_VELOCITY];
  }
}


module.exports = MIDIoT;
