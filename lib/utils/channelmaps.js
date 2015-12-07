/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var allOnZero = [ 0 ];
var allChannels = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
var allButFifteen = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];

var list = { allOnZero: allOnZero,
             allChannels: allChannels,
             allButFifteen: allButFifteen };


/**
 * Select a random key in the given map based on the given seed.
 * @param {Number} seed The integer seed for generating the random key.
 * @param {String} midiMap The name of the midimap.
 */
function randomChannel(seed, channelMap) {
  var map = list[channelMap];

  // Undefined channelmap, return random in range 0-15
  if(!map) {
    return seed % 16;
  }

  return map[seed % map.length];
}


module.exports.list = list;
module.exports.randomChannel = randomChannel;
