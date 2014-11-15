midiot
======

What's in a name?
-----------------

Musical Instrument Digital Interface of Things.  MIDI meets IoT: real-time, real-world sounds.


Installation
------------

    npm install midiot


Hello midiot
------------

```javascript
var midiot = require('midiot');
var soundscape = new midiot();

var MIDDLE_C_KEY = 60;

soundscape.bind( { barnowl: { protocol: 'test', path: 'default' } } );
console.log(soundscape.getPorts());
soundscape.openPort();

soundscape.on('event', function(data) {
  var key = MIDDLE_C_KEY + (parseInt(data.id, 16) % 12);
  var velocity = data.rssi / 2;
  soundscape.outputMessage( { noteOn: { channel: 0, key: key, velocity: velocity } } );
});
```


What's next?
------------

This is an active work in progress.  Expect regular changes and updates, as well as improved documentation!


License
-------

MIT License

Copyright (c) 2014 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
