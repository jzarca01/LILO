const noble = require("noble");
const async = require('async');

const LILOServiceUUID = "53e11631b8404b2193ce081726ddc739"
const LILOTimeCharacteristicUUID = "53e11633b8404b2193ce081726ddc739";
const LILOLightCharacteristicUUID = "53e11632b8404b2193ce081726ddc739";

const lights = require("./lights");

var LILOTimeCharacteristic = null;
var LILOLightCharacteristic = null;


noble.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        console.log('scanning...');
        noble.startScanning([], false);
    } else {
        noble.stopScanning();
    }
})

noble.on('discover', function (peripheral) {

    const advertisement = peripheral.advertisement;

    if (advertisement.localName === "LILO") {
        noble.stopScanning();

        console.log(advertisement.localName + ' found');
        explore(peripheral);
    }
});

function explore(peripheral) {

    peripheral.on('disconnect', function () {
        console.log("Disconnection...");
        process.exit(0);
    });

    peripheral.connect(function (error) {
        console.log("Connection...");
        peripheral.discoverServices([LILOServiceUUID], function (error, services) {
            console.log("LILO Service found");

            var serviceIndex = 0;

            async.whilst(
                function () {
                    return (serviceIndex < services.length);
                },
                function (callback) {
                    var service = services[serviceIndex];
                    var serviceInfo = service.uuid;

                    if (service.name) {
                        serviceInfo += ' (' + service.name + ')';
                    }
                    console.log(serviceInfo);

                    //service.discoverCharacteristics([LILOLightCharacteristicUUID], function (error, characteristics) {
                    service.discoverCharacteristics([LILOTimeCharacteristicUUID], function (error, characteristics) {
                            var characteristicIndex = 0;

                        async.whilst(
                            function () {
                                return (characteristicIndex < characteristics.length);
                            },
                            function (callback) {
                                var characteristic = characteristics[characteristicIndex];

                                if(characteristic.uuid === LILOLightCharacteristicUUID) {
                                    console.log("Light found");
                                    LILOLightCharacteristic = characteristic;
                                }

                                else if(characteristic.uuid === LILOTimeCharacteristicUUID) {
                                    console.log("Time found");                                    
                                    LILOTimeCharacteristic = characteristic;
                                }

                                var characteristicInfo = '  ' + characteristic.uuid;

                                if (characteristic.name) {
                                    characteristicInfo += ' (' + characteristic.name + ')';
                                }

                                async.series([
                                    function (callback) {
                                        characteristic.discoverDescriptors(function (error, descriptors) {
                                            async.detect(
                                                descriptors,
                                                function (descriptor, callback) {
                                                    return callback(descriptor.uuid === '2901');
                                                },
                                                function (userDescriptionDescriptor) {
                                                    if (userDescriptionDescriptor) {
                                                        userDescriptionDescriptor.readValue(function (error, data) {
                                                            if (data) {
                                                                characteristicInfo += ' (' + data.toString() + ')';
                                                            }
                                                        });
                                                        callback();
                                                    } else {
                                                        changeTime(["09","00","23","00"]);   
                                                        //changeLight("03");                                                     
                                                        callback();
                                                    }
                                                }
                                            );
                                        });
                                    },
                                    function (callback) {
                                        characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                                        if (characteristic.properties.indexOf('read') !== -1) {
                                            characteristic.read(function (error, data) {
                                                if (data) {
                                                    var string = data.toString('ascii');

                                                    characteristicInfo += '\n    value       ' + data.toString('hex');
                                                }
                                                callback();
                                            });
                                        } else {
                                            callback();
                                        }
                                    },
                                    function () {
                                        console.log(characteristicInfo);
                                        characteristicIndex++;
                                        callback();
                                    }
                                ]);
                            },
                            function (error) {
                                serviceIndex++;
                                callback();
                            }
                        );
                    });
                },
                function (err) {
                    console.log(err);
                    peripheral.disconnect();
                }
            );
        });

    });
}

function changeLight(newValue) {
    console.log(`Changing light settings to ${lights[newValue]}`);
    var newLight = new Buffer(1);
    newLight.writeUInt8(parseInt(newValue), 0);
    LILOLightCharacteristic.write(newLight, true, function(err) {
      if (!err) {
        console.log("all good");
      }
      else {
          console.log(err);
      }
    });
}

function changeTime(newValue) {
    var newTime = new Buffer(newValue);
    console.log(`Changing time to ${newValue.join('')}`);
    LILOTimeCharacteristic.write(newTime, true, function(err) {
      if (!err) {
        console.log("all good");
      }
      else {
          console.log(err);
      }
    });

}