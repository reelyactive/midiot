/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var util = require('util');
var events = require('events');

var DEFAULT_MIN_KEY = 36;
var DEFAULT_MAX_KEY = 53;
var DEFAULT_CHANNEL = 0;
var DEFAULT_DURATION = 60;


/**
 * DevicesManager Class
 * Maintains the state of devices and manages their events
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function DevicesManager(options) {
  var self = this;

  self.minKey = options.minKey || DEFAULT_MIN_KEY;
  self.maxKey = options.maxKey || DEFAULT_MAX_KEY;
  self.baseChannel = options.baseChannel || DEFAULT_CHANNEL;
  self.defaultDuration = options.defaultDuration || DEFAULT_DURATION;

  self.devices = {};
  self.controls = { mute: false };

  events.EventEmitter.call(this);
}
util.inherits(DevicesManager, events.EventEmitter);


/**
 * Handle an event, update the state of the associated device.
 * @param {String} type The type of event.
 * @param {Object} tiraid The tiraid object.
 * @param {callback} callback Function to call on completion.
 */
DevicesManager.prototype.handleEvent = function(type, tiraid, callback) {
  var self = this;

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

  // New device, initialise with random key
  if(!self.devices.hasOwnProperty(id)) {
    var key = self.minKey + (parseInt(id, 16) % (self.maxKey - self.minKey));
    self.devices[id] = { channel: self.baseChannel, key: key,
                         duration: self.defaultDuration,
                         useBarnowl: true, useBarnacles: false,
                         category: "Instrument" };
  }

  self.devices[id].rssi = rssi;
  self.devices[id].strongestDecoder = strongestDecoder;
  self.devices[id].velocity = Math.min(127, Math.max(rssi-135,1) * 3);

  var status = self.devices[id];
  status.id = id;

  status.valid = false;
  if(self.controls.mute) {
    if((self.devices[id].category === 'Tap Tempo') && (type === 'decoding')) {
      status.valid = true;
      status.channel = 15;
      status.key = 0;
    }
    else if(self.devices[id].category === 'Controller') {
      status.valid = true;
    }
  }
  else if(self.devices[id].useBarnowl && (type === 'decoding')) {
    status.valid = true;
  }
  else if(self.devices[id].useBarnacles && ((type === 'appearance') ||
                                            (type === 'keep-alive') ||
                                            (type === 'displacement'))) {
    status.valid = true;
  }

  callback(status);
};


/**
 * Update the given device settings.
 * @param {Object} device The device settings.
 */
DevicesManager.prototype.update = function(device) {
  var self = this;

  var id = device.id;
  if(!self.devices.hasOwnProperty(id)) {
    return;
  }

  self.devices[id].key = device.key;
  self.devices[id].duration = device.duration;
  self.devices[id].channel = device.channel;
  self.devices[id].useBarnowl = device.useBarnowl;
  self.devices[id].useBarnacles = device.useBarnacles;
  self.devices[id].category = device.category;
};


/**
 * Update the global control settings.
 * @param {Object} controls The controls settings.
 */
DevicesManager.prototype.control = function(controls) {
  var self = this;

  self.controls.mute = controls.mute;
};


module.exports = DevicesManager;
