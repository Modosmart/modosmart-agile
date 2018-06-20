var agile = require('agile-sdk')({
  api: 'http://resin.local:8080',
  idm: 'http://resin.local:3000',
  token: "NPH7YIi2tPpXlzwzJIOnjsrvyu8pv8fwOpmKI6yml8JzQtMXACO3d2QUcWKz2izL"
});

agile.protocolManager.discovery.start()
.then(function() {
  // console.log('started!')
})
.catch(function(err) {
  console.log(err)
});

agile.protocolManager.devices().then(function(devices) {
 console.log(devices);
});

agile.deviceManager.get('ble240AC405E9EA').then(function(device) {
  console.log(device);
}).catch(function(err) {
  console.log(err)
});

agile.device.get('ble240AC405E9EA', 'Temperature').then(function(deviceComponent) {
  console.log(deviceComponent);
}).catch(function(err) {
  console.log(err)
});

// agile.device.connect('ble240AC405E9EA').then(function() {
//     console.log('Connected!');
// }).catch(function(err) {
//   console.log(err);
// });


// agile.device.status('ble240AC405E9EA').then(function(status) {
//  console.log(status);
// });
