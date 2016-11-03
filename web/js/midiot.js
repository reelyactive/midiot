NOTE_MAP = [ 'C-1', 'C#-1', 'D-1', 'D#-1', 'E-1', 'F-1', 'F#-1', 'G-1', 'G#-1',
  'A-1', 'A#-1', 'B-1',
  'C0', 'C#0', 'D0', 'D#0', 'E0', 'F0', 'F#0', 'G0', 'G#0', 'A0', 'A#0', 'B0',
  'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6',
  'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7',
  'C8', 'C#8', 'D8', 'D#8', 'E8', 'F8', 'F#8', 'G8', 'G#8', 'A8', 'A#8', 'B8',
  'C9', 'C#9', 'D9', 'D#9', 'E9', 'F9', 'F#9', 'G9' ];


angular.module('midiot', [ 'ui.bootstrap', 'btford.socket-io' ])

  // Socket.io factory
  .factory('Socket', function(socketFactory, $location) {
    var url = $location.protocol() + '://' + $location.host() + ':' +
              $location.port();
    return socketFactory( { ioSocket: io.connect(url) } );
  })

  // Midi controller
  .controller('MidiCtrl', function($scope, $http, $interval, Socket) {
    $scope.devices = {};
    $scope.channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    // TODO: load all maps from an API
    $scope.midiMaps = [ 'cMaj', 'cMin', 'dMaj', 'dMin', 'eMaj', 'eMin',
                        'fMaj', 'fMin', 'gMaj', 'gMin', 'aMaj', 'aMin',
                        'bMaj', 'bMin', 'alesisSR18', 'allNotes' ];
    $scope.channelMaps = [ 'allOnOne', 'allChannels', 'allButSixteen' ];

    $scope.controls = { mute: false, midiMap: $scope.midiMaps[0],
                        channelMap: $scope.channelMaps[0],
                        solo: null };
    $scope.noteMap = NOTE_MAP;

    var audio = {};
    loadAudioFiles();

    Socket.on('event', function(event) {
      var id = event.id;

      if(event.type === 'disappearance') {
        delete $scope.devices[id];
      }

      else {
        $scope.devices[id] = event;

        if($scope.devices[id].type === 'noteOn') {
          handleNoteOn($scope.devices[id]);
        }
      }
    });

    $scope.update = function(device) {
      Socket.emit('update', device);
    };

    $scope.control = function() {
      Socket.emit('control', $scope.controls);
    };

    $scope.soloToggle = function(id) {
      if($scope.controls.solo === id) {
        $scope.controls.solo = null;
      }
      else {
        $scope.controls.solo = id;
      }
    }

    function loadAudioFiles() {
      audio.kick = new Audio('audio/kick.wav');
      audio.snare = new Audio('audio/snare.wav');
      audio.hatClosed = new Audio('audio/hatClosed.wav');
      audio.hatShort = new Audio('audio/hatShort.wav');
      audio.hatLong = new Audio('audio/hatLong.wav');
      audio.rimshot = new Audio('audio/rimshot.wav');
      audio.clap = new Audio('audio/clap.wav');
      audio.tambourine = new Audio('audio/tambourine.wav');
      audio.tomHigh = new Audio('audio/tomHigh.wav');
      audio.tomMid = new Audio('audio/tomMid.wav');
      audio.tomLow = new Audio('audio/tomLow.wav');
      audio.barnowl = new Audio('audio/barnowl.wav');
      audio.babybarnowl = new Audio('audio/babybarnowl.wav');
    }

    function handleNoteOn(device) {
      var volume = device.velocity / 128;

      switch(device.audio) {
        case 'Kick':
          audio.kick.volume = volume;
          audio.kick.play();
          break;
        case 'Snare':
          audio.snare.volume = volume;
          audio.snare.play();
          break;
        case 'Hat Closed':
          audio.hatClosed.volume = volume;
          audio.hatClosed.play();
          break;
        case 'Hat Short':
          audio.hatShort.volume = volume;
          audio.hatShort.play();
          break;
        case 'Hat Long':
          audio.hatLong.volume = volume;
          audio.hatLong.play();
          break;
        case 'Rimshot':
          audio.rimshot.volume = volume;
          audio.rimshot.play();
          break;
        case 'Clap':
          audio.clap.volume = volume;
          audio.clap.play();
          break;
        case 'Tambourine':
          audio.tambourine.volume = volume;
          audio.tambourine.play();
          break;
        case 'Tom High':
          audio.tomHigh.volume = volume;
          audio.tomHigh.play();
          break;
        case 'Tom Mid':
          audio.tomMid.volume = volume;
          audio.tomMid.play();
          break;
        case 'Tom Low':
          audio.tomLow.volume = volume;
          audio.tomLow.play();
          break;
        case 'Barn Owl':
          audio.barnowl.volume = volume;
          audio.barnowl.play();
          break;
        case 'Baby Barn Owl':
          audio.babybarnowl.volume = volume;
          audio.babybarnowl.play();
          break;
        default:
      }
    }
  });
