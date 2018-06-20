var net = require('net');
var io = require('socket.io')();

var agile = require('agile-sdk')({
    api: 'http://' + process.env.RESIN_HOST_IP + ':8080',
    idm: 'http://' + process.env.RESIN_HOST_IP + ':3000',
    token: "token"
});

const AC_SWITCH_IP = process.env.TCP_SERVER_IP;     // IP address of AC switch
const AC_SWITCH_PORT = process.env.TCP_SERVER_PORT; // The port of AC switch
const APPLICATION_PORT = 3030;                      // The port of the serivce application

var socket_connections = [];

var client = new net.Socket();

io.on('connection', function(socketio) {
    // Connection array to hold all client sockets
    socket_connections.push(socketio);
    console.log('Connected socket ID = ' + socketio.id);
    console.log('Connected %s sockets connected', socket_connections.length);
    // Listen to all disconnect events and remove the client from connection array
    socketio.on('disconnect', function(data) {
        let index = -1;
        for (let i = 0; i < socket_connections.length; i++) {
            if (socket_connections[i].id === socketio.id) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            socket_connections.splice(index, 1);
        }
        console.log('Disonnected socket ID = ' + socketio.id);
        console.log('Disonnected %s sockets connected', socket_connections.length);
    });

    socketio.on('test', function(test_data) {
      // emit message back to socket client
      io.sockets.emit('test_callback', test_data);
    });

    socketio.on('intesis_message', function(io_data) {
        console.log(io_data);
        console.log(client.remoteAddress);
        if (!client.remoteAddress) {
            client = new net.Socket();
            client.connect(AC_SWITCH_PORT, AC_SWITCH_IP, function() {
                console.log('CONNECTED TO: ' + AC_SWITCH_IP + ':' + AC_SWITCH_PORT);

                // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
                client.write(io_data);
            });

            // Add a 'data' event handler for the client socket
            // data is what the server sent to this socket
            client.on('data', function(sock_data) {

                console.log('DATA: ' + sock_data);
                // Close the client socket completely
                client.destroy();
                // emit message back to socket client
                io.sockets.emit('intesis_callback', '' + sock_data);
            });

            // Add a 'close' event handler for the client socket
            client.on('close', function() {
                console.log('Connection closed');
            });
        } else {
            client.write(io_data);
        }

    });

    socketio.on('intesis_disconnect', function() {
        client.destroy();
    });

    socketio.on('agile', function(agile_data) {
        let command = agile_data.command;
        if (command == 'ScanDevices') {
            agile.protocolManager.devices().then(function(devices) {
                // emit message back to socket client
                io.sockets.emit('agile_scan_devices_callback', devices);
            }).catch(function(err) {
              console.log(err);
            });
        } else if (command == 'ConnectDevice') {
            let deviceId = agile_data.deviceId;
            agile.device.connect(deviceId).then(function() {
                console.log('Connected!');
            });
        } else if (command == 'DisconnectDevice') {
            let deviceId = agile_data.deviceId;
            agile.device.disconnect(deviceId).then(function() {
                console.log('Disconnected!');
            });
        } else if (command == 'ConnectionStatusDevice') {
            let deviceId = agile_data.deviceId;
            agile.device.status(deviceId).then(function(status) {
                // emit message back to socket client
                io.sockets.emit('agile_connection_status_callback', status);
            });
        } else if (command == 'readingDevice') {
            let deviceId = agile_data.deviceId;
            let componentId = agile_data.componentId;
            agile.device.get(deviceId, componentId).then(function(deviceComponent) {
                // emit message back to socket client
                io.sockets.emit('agile_reading_device_callback', deviceComponent);
            });
        }
    });
});
io.listen(APPLICATION_PORT);
