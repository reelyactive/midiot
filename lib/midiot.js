/**
 * Copyright reelyActive 2014-2024
 * We believe in an open Internet of Things
 */


const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const Barnowl = require('barnowl');
const DevicesManager = require('./devicesmanager.js');
const MidiManager = require('./midimanager.js');


const PORT = process.env.PORT || 3006;


/**
 * MIDIoT Class
 * MIDI meets IoT.
 */
class MIDIoT {

  /**
   * MIDIoT constructor
   * @param {Object} options The configuration options.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.app = express();
    this.server = createServer(self.app, options);
    this.app.use('/', express.static(path.resolve(__dirname + '/../web')));
    this.barnowl = createBarnowl(self.app, self.server, options);
    this.devicesManager = new DevicesManager();
    this.midiManager = new MidiManager();

    // TODO: move this to manager
    this.barnowl.on('raddec', (raddec) => {
      let rssi = raddec.rssiSignature[0].rssi;
      let velocity = Math.min(127, rssi + 160);
      let note = parseInt(raddec.transmitterId, 16) % 34 + 36;
      self.midiManager.playNote(note, { rawAttack: velocity });
    });

    initialiseServer(self.server, options);
    console.log('reelyActive midiot instance is producing a soundscape in an open IoT');
  }

}


/**
 * Create the https server, if credentials found, else http.
 * @param {Express} app The Express instance.
 * @param {Object} options The configuration options.
 */
function createServer(app, options) {
  let server;

  try {
    let credentials = {
        cert: fs.readFileSync(path.resolve(CONFIG_PATH  + '/certificate.pem')),
        key: fs.readFileSync(path.resolve(CONFIG_PATH + '/key.pem'))
    };
    server = https.createServer(credentials, app);
  }
  catch(err) {
    console.log('MIDIoT by reelyActive is using HTTP');
    return http.createServer(app);
  }

  console.log('MIDIoT by reelyActive is using HTTPS');
  return server;
}


/**
 * Initialise the HTTP server by listening and handling errors.
 * @param {Server} server The server instance.
 * @param {Object} options The configuration options.
 */
function initialiseServer(server, options) {
  server.on('error', (error) => {
    if(error.code === 'EADDRINUSE') {
      console.log('Port', PORT, 'is already in use.',
                  'Is another MIDIoT instance running?');
    }
  });

  server.listen(PORT, () => {
    console.log('MIDIoT by reelyActive is running on port', PORT);
  });
}


/**
 * Create a barnowl instance with a UDP listener.
 * @param {Express} app The Express instance.
 * @param {Server} server The HTTP server instance.
 * @param {Object} options The configuration options.
 * @return {Barnowl} The Barnowl instance.
 */
function createBarnowl(app, server, options) {
  if(!options.hasOwnProperty('barnowl')) {
    options.barnowl = { enableMixing: true };
  }

  let barnowl = new Barnowl(options.barnowl);

  barnowl.addListener(Barnowl, {}, Barnowl.UdpListener,
                      { path: "0.0.0.0:50001" });

  return barnowl;
}


module.exports = MIDIoT;