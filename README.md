midiot
======


MIDI events from low-power wireless traffic
-------------------------------------------

Converts real-time wireless traffic (Bluetooth Smart, Active RFID) into MIDI notes.  The key of the note is determined by the transmitter's identifier and the velocity of the note is determined by the RSSI (proximity).  Additional parameters can be adjusted live through a web browser, for instance:
- key
- duration
- channel
- real-time triggering (via [barnowl](https://www.npmjs.com/package/barnowl))
- periodic triggering (via [barnacles](https://www.npmjs.com/package/barnacles))
- role (instrument, controller, tap tempo)

![midiot screenshot](http://reelyactive.com/images/midiot-screenshot.png)


What's in a name?
-----------------

Musical Instrument Digital Interface of Things.  MIDI meets IoT: real-time, real-world sounds.  Watch [this short video](https://www.youtube.com/watch?v=CUhbfyi2ab4) to see, and hear, midiot in action.  There are also plenty of midiot-generated tracks on the [reelyActive SoundCloud](https://soundcloud.com/reelyactive).


Installation
------------

    npm install midiot


Hello midiot
------------

Run the following code to output two MIDI notes per second (without requiring any hardware):

```javascript
var midiot = require('midiot');
var barnowl = require('barnowl');
var barnacles = require('barnacles');

var middleware = new barnowl();
var notifications = new barnacles();
var soundscape = new midiot();

middleware.bind( { protocol: 'test', path: 'default' } );
notifications.bind( { barnowl: middleware } );
soundscape.bind( { barnowl: middleware } );
soundscape.bind( { barnacles: notifications } );

console.log(soundscape.getPorts()); // This will list available MIDI ports,
soundscape.openPort(0);             //   update the number if necessary
```

Point your browser to [localhost:3006/midiot.html](http://localhost:3006/midiot.html) to visualise and play with the settings in real time.


Now let's make some reel beats
------------------------------

Add a reelyActive [minimal starter kit](http://shop.reelyactive.com/products/starterkit-min) to capture real-time Bluetooth Smart traffic and generate some fat beats.  You'll need to install the serialport package:

    npm install serialport

Then start by running the following code which was used in [the demo video](https://www.youtube.com/watch?v=CUhbfyi2ab4).

```javascript
var midiot = require('midiot');
var barnowl = require('barnowl');
var barnacles = require('barnacles');

var middleware = new barnowl( { n: 1,
                                enableMixing: true,
                                mixingDelayMilliseconds: 240,
                                minMixingDelayMilliseconds: 120 } );
var notifications = new barnacles( { delayMilliseconds: 960,
                                     minDelayMilliseconds: 960,
                                     keepAliveMilliseconds: 4800 } );
var soundscape = new midiot( { midiMap: "alesisSR18",
                               channelMap: "allOnZero",
                               defaultDuration: 120 } );

middleware.bind( { protocol: 'serial', path: '/dev/ttyUSB0' } );
notifications.bind( { barnowl: middleware } );
soundscape.bind( { barnowl: middleware } );
soundscape.bind( { barnacles: notifications } );

console.log(soundscape.getPorts()); // This will list available MIDI ports,
soundscape.openPort(0);             //   update the number if necessary
```

Again, point your browser to [localhost:3006/midiot.html](http://localhost:3006/midiot.html) to visualise and play with the settings in real time.  Then experiment with the various settings, for instance:
- adjust midiMap to set the range of key values to which the transmitter identifiers are mapped: ("cMaj", "cMin", ..., "alesisSR18", "allNotes")
- adjust channelMap to set the range of channel values to which the transmitter identifiers are mapped: ("allOnZero", "allChannels", "allButFifteen")
- adjust the defaultDuration (in milliseconds) to set the default length of the notes
- adjust mixingDelayMilliseconds to set the minimum period between two successive real-time notes from the same transmitter
- adjust minMixingDelayMilliseconds to set the interval at which real-time notes will be emitted (this helps enormously to create consistent rhythms)
- adjust delayMilliseconds and minDelayMilliseconds similar to the above but for periodic notes
- adjust keepAliveMilliseconds to set the minimum period between two successive periodic notes from the same transmitter


Acknowledgements
----------------

Thanks to [Robin Cerutti for](http://robincerutti.com/#/profile) his collaboration on the original idea, and to [Evelyne Drouin](http://djmini.com/), [Olivier Lalonde](http://musicmotion.technology/about/) and [Claude Jr Belizaire](http://humanlevel.io/founder/) of the [beatr.org](http://beatr.org) team at [WearHacks 2015](https://montreal.wearhacks.com) for their creative direction of the project which won the "Most entertaining" and "Coup de Coeur" awards.


What's next?
------------

This is an active work in progress.  Expect regular changes and updates, as well as improved documentation!


License
-------

MIT License

Copyright (c) 2014-2015 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
