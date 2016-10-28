/**
 * Copyright reelyActive 2015-2016
 * We believe in an open Internet of Things
 */

var util = require('util');
var events = require('events');
var midimaps = require('./utils/midimaps');
var channelmaps = require('./utils/channelmaps');

var DEFAULT_MIDI_MAP = 'cMaj';
var DEFAULT_CHANNEL_MAP = 'allOnOne';
var DEFAULT_CHANNEL = 0;
var DEFAULT_DURATION = 60;
var DEFAULT_ON = { realTime: true, periodic: false };


/**
 * DevicesManager Class
 * Maintains the state of devices and manages their events
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function DevicesManager(options) {
  var self = this;

  self.midiMap = options.midiMap || DEFAULT_MIDI_MAP;
  self.channelMap = options.channelMap || DEFAULT_CHANNEL_MAP;
  self.defaultDuration = options.defaultDuration || DEFAULT_DURATION;
  self.defaultOn = options.defaultOn || DEFAULT_ON;

  self.devices = {};
  self.controls = { mute: false, midiMap: DEFAULT_MIDI_MAP,
                    channelMap: DEFAULT_CHANNEL_MAP };

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

  // For Nearables, use the Nearable ID instead of the advertiser address
  if(isNearable(tiraid)) {
    id = tiraid.identifier.advData.manufacturerSpecificData.nearable.id;
  }

  // Remove devices that have disappeared, except Nearables
  if((type === 'disappearance') && self.devices.hasOwnProperty(id) &&
     !isNearable(tiraid)) {
    delete self.devices[id];
    return callback( { id: id, disappearance: true, valid: true } );
  }

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
    var key = midimaps.randomKey(parseInt(id, 16), self.midiMap);
    var channel = channelmaps.randomChannel(parseInt(id, 16), self.channelMap);
    var category = 'Instrument';
    if(isNearable(tiraid)) {
      category = 'Controller';
      key = midimaps.randomKey(parseInt(id, 16) / 1000, 'allNotes');
    }
    self.devices[id] = { channel: channel, key: key,
                         duration: self.defaultDuration,
                         useBarnowl: self.defaultOn.realTime,
                         useBarnacles: self.defaultOn.periodic,
                         category: category, audio: "None" };
  }

  self.devices[id].rssi = rssi;
  self.devices[id].strongestDecoder = strongestDecoder;
  if(isNearable(tiraid)) {
    self.devices[id].velocity = Math.max(Math.min(Math.round(63 * (1 +
   tiraid.identifier.advData.manufacturerSpecificData.nearable.accelerationZ)),
   127), 0);
  }
  else {
    self.devices[id].velocity = Math.min(127, Math.max(rssi-135,1) * 3);
  }

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
  self.devices[id].audio = device.audio;
};


/**
 * Update the global control settings.
 * @param {Object} controls The controls settings.
 */
DevicesManager.prototype.control = function(controls) {
  var self = this;

  self.controls.mute = controls.mute;
  self.midiMap = controls.midiMap;
  self.channelMap = controls.channelMap;
};


/**
 * Is the given tiraid a nearable?
 * @param {Object} tiraid The given tiraid.
 */
function isNearable(tiraid) {
  if(tiraid.identifier.hasOwnProperty('advData') &&
     tiraid.identifier.advData.hasOwnProperty('manufacturerSpecificData') &&
     tiraid.identifier.advData.manufacturerSpecificData.hasOwnProperty(
                                                                'nearable')) {
    return true;
  }
  return false;
}

module.exports = DevicesManager;
