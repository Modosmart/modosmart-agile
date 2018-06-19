// var socket = require('socket.io-client')('http://localhost:3001');
// socket.on('connect', function(){});
// socket.on('event', function(data){});
// socket.on('disconnect', function(){});

var net = require('net');

var client = new net.Socket();

client.connect(3310, 'localhost', function() {

    console.log('CONNECTED TO: ' + 'localhost' + ':' + '3310');
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
    client.write('Hello');
    client.setTimeout(1000 * 10 * 1); // 5 minutes
    // console.log(client);
    client.destroy();
    // console.log(client);
});

client.on('close', function() {
    console.log('Connection closed');
    client = new net.Socket();
    client.connect(3310, 'localhost', function() {
      console.log('CONNECTED TO 2: ' + 'localhost' + ':' + '3310');
    });
});
