/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var allNotes = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
                 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62,
                 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77,
                 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92,
                 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106,
                 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
                 119, 120, 121, 122, 123, 124, 125, 126, 127 ];
var alesisSR18 = [ 36, 37, 38, 41, 42, 44, 46, 47, 48, 49, 51, 53, 60, 61, 62,
                   63, 64, 65, 66, 67, 68, 69 ];
var cMaj = [ 60, 62, 64, 65, 67, 69, 71, 72 ];
var cMin = [ 60, 62, 63, 65, 67, 69, 70, 72 ];
var dMaj = [ 62, 64, 66, 67, 69, 71, 73, 74 ];
var dMin = [ 62, 64, 65, 67, 69, 71, 72, 74 ];
var eMaj = [ 64, 66, 68, 69, 71, 73, 75, 76 ];
var eMin = [ 64, 66, 67, 69, 71, 73, 74, 76 ];
var fMaj = [ 66, 68, 70, 71, 73, 75, 77, 78 ];
var fMin = [ 66, 68, 69, 71, 73, 75, 76, 78 ];
var gMaj = [ 67, 69, 71, 72, 74, 76, 78, 79 ];
var gMin = [ 67, 69, 70, 72, 74, 76, 77, 79 ];
var aMaj = [ 69, 71, 73, 74, 76, 78, 80, 81 ];
var aMin = [ 69, 71, 72, 74, 76, 78, 79, 81 ];
var bMaj = [ 71, 73, 75, 76, 78, 80, 82, 83 ];
var bMin = [ 71, 73, 74, 76, 78, 80, 81, 83 ];

var list = { allNotes: allNotes,
             alesisSR18: alesisSR18,
             cMaj: cMaj,
             cMin: cMin,
             dMaj: dMaj,
             dMin: dMin,
             eMaj: eMaj,
             eMin: eMin,
             fMaj: fMaj,
             fMin: fMin,
             gMaj: gMaj,
             gMin: gMin,
             aMaj: aMaj,
             aMin: aMin,
             bMaj: bMaj,
             bMin: bMin };


/**
 * Select a random key in the given map based on the given seed.
 * @param {Number} seed The integer seed for generating the random key.
 * @param {String} midiMap The name of the midimap.
 */
function randomKey(seed, midiMap) {
  var map = list[midiMap];

  // Undefined midimap, return random in range 0-127
  if(!map) {
    return seed % 128;
  }

  return map[seed % map.length];
}


module.exports.list = list;
module.exports.randomKey = randomKey;
