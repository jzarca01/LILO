const NobleDevice = require("noble-device");
const lights = require("./lights");

const LILOServiceUUID = "53e11631b8404b2193ce081726ddc739"
const LILOTimeCharacteristicUUID = "53e11633b8404b2193ce081726ddc739";
const LILOLightCharacteristicUUID = "53e11632b8404b2193ce081726ddc739";


const LILO = function(peripheral) {
    NobleDevice.call(this, peripheral);
};

LILO.is = function(peripheral) {
    return (peripheral.advertisement.localName === "LILO");
};

NobleDevice.Util.inherits(LILO, NobleDevice);

LILO.prototype.writeServiceDataCharacteristic = function(uuid, data, callback) {
    this.writeDataCharacteristic(LILOServiceUUID, uuid, data, callback);
};

LILO.prototype.readServiceDataCharacteristic = function(uuid, callback) {
    this.readDataCharacteristic(LILOServiceUUID, uuid, callback);
};

LILO.prototype.readLightState = function(callback) {
    this.readServiceDataCharacteristic(LILOLightCharacteristicUUID, function(error, data) {
        callback(error, data);
    });
};

LILO.prototype.writeLightState = function(value, callback) {
    if(value) {
        console.log(`Changing light settings to ${lights[value]}`);
        var data = Buffer.alloc(1);
        data.writeUInt8(parseInt(value), 0);

        this.writeServiceDataCharacteristic(LILOLightCharacteristicUUID, data, callback);
    }
};

LILO.prototype.readTimeState = function(callback) {
    this.readServiceDataCharacteristic(LILOTimeCharacteristicUUID, function(error, data) {
        callback(error, data);
    });
};

LILO.prototype.writeTimeState = function(value, callback) {
    if(value && value.length === 4) {
        console.log(`Changing time from ${value[0]}:${value[1]} to ${value[2]}:${value[3]}`);
        var data = Buffer.from(value);
        data.writeUInt8(parseInt(value), 0);

        this.writeServiceDataCharacteristic(LILOTimeCharacteristicUUID, data, callback);
    }
};

module.exports = LILO;
