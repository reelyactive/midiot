/**
 * Copyright reelyActive 2024
 * We believe in an open Internet of Things
 */


const { WebMidi } = require('webmidi');


/**
 * MidiManager Class
 * Manages the MIDI interface.
 */
class MidiManager {

  /**
   * MidiManager constructor
   * @param {Object} options The configuration options.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    enableMidi(options);
  }

  /**
   * Play the given note.
   * @param {Note} note The note to play.
   */
  playNote(note, options) {
    if(WebMidi.enabled) {
      WebMidi.outputs.forEach((output) => { output.playNote(note, options); });
    }
  }

}


/**
 * Enable MIDI.
 * @param {MidiManager} instance The MidiManager instance.
 * @param {Object} options The configuration options.
 */
function enableMidi(instance, options) {
  WebMidi
    .enable()
    .then(() => { handleMidiEnabled(instance, options); })
    .catch((err) => console.log('MIDIoT error:', err));
}


/**
 * Handle the successful enablement of the MIDI interface.
 * @param {MidiManager} instance The MidiManager instance.
 * @param {Object} options The configuration options.
 */
function handleMidiEnabled(instance, options) {
  if(WebMidi.outputs.length === 0) {
    console.log('MIDIoT found 0 MIDI output devices.  Check connections?');
  }
  else {
    console.log('MIDIoT found', WebMidi.outputs.length, 'MIDI output devices:');
    WebMidi.outputs.forEach((output) => { console.log('-', output.name) });
  }
}


module.exports = MidiManager;