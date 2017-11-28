const async = require("async");

const LILO = require('./lib/LILO');

LILO.discover(function (liloInstance) {
    console.log("LILO Discovered.");

    liloInstance.on('disconnect', function () {
        console.log('Disconnection.');
        process.exit(1);
    });

    async.series([
        function (callback) {
            console.log('Connecting...');
            liloInstance.connectAndSetup(callback);
        },
        function (callback) {
            console.log("Setting light state.")
            liloInstance.writeLightState("03", callback);
        },
        function (callback) {
            console.log("Reading light state.")
            liloInstance.readLightState(function(error, data) {
                console.log("Light state : ", data);
                callback();
            });
        },
        function (callback) {
            console.log("Setting time state.")
            liloInstance.writeTimeState(["09","00","23","00"], callback);
        },
        function (callback) {
            console.log("Reading time state.")
            liloInstance.readTimeState(function(error, data) {
                console.log("Time state : ", data);
                callback();
            });
        },
        function (callback) {
            liloInstance.disconnect(callback);
        }
    ]);
});