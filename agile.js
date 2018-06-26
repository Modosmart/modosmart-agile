var agile = require('agile-sdk')({
  api: 'http://192.168.1.63:8080',
  idm: 'http://192.168.1.63:3000',
  token: "token"
});

agile.protocolManager.discovery.start()
.then(function() {
  // console.log('started!')
})
.catch(function(err) {
  console.log(err)
});

// agile.protocolManager.devices().then(function(devices) {
//  console.log(devices);
// });
//
// agile.deviceManager.get('bleD94298C99EF2').then(function(device) {
//   console.log(device);
// }).catch(function(err) {
//   console.log(err)
// });
//
// agile.device.get('bleD94298C99EF2', 'Temperature').then(function(deviceComponent) {
//   console.log(deviceComponent);
// }).catch(function(err) {
//   console.log(err)
// });

// agile.device.connect('bleD94298C99EF2').then(function() {
//     console.log('Connected!');
// }).catch(function(err) {
//   console.log(err);
// });


agile.device.status('bleD4DB5788634C').then(function(status) {
  console.log('Window sensor');
  console.log(status);
});

agile.device.status('bleD94298C99EF2').then(function(status) {
  console.log('Room sensor');
  console.log(status);
});
