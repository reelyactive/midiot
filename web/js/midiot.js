DEFAULT_SOCKET_URL = 'http://localhost:3006';


angular.module('midiot', [ 'ui.bootstrap', 'btford.socket-io' ])

  // Socket.io factory
  .factory('Socket', function(socketFactory) {
    return socketFactory( { ioSocket: io.connect(DEFAULT_SOCKET_URL) } );
  })

  // Midi controller
  .controller('MidiCtrl', function($scope, $http, $interval, Socket) {
    Socket.on('event', function(event) {
      $scope.event = JSON.stringify(event);
    });
  });
