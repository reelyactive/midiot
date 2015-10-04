DEFAULT_SOCKET_URL = 'http://localhost:3006';


angular.module('midiot', [ 'ui.bootstrap', 'btford.socket-io' ])

  // Socket.io factory
  .factory('Socket', function(socketFactory) {
    return socketFactory( { ioSocket: io.connect(DEFAULT_SOCKET_URL) } );
  })

  // Midi controller
  .controller('MidiCtrl', function($scope, $http, $interval, Socket) {
    $scope.devices = {};
    $scope.controls = { mute: false };

    Socket.on('event', function(event) {
      var id = event.id;

      $scope.devices[id] = event;
    });

    $scope.update = function(device) {
      Socket.emit('update', device);
    };

    $scope.control = function() {
      Socket.emit('control', $scope.controls);
    };
  });
