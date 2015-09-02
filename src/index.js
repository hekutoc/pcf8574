var i2c = require('i2c');
var Promise = require('bluebird');

var base_address = 0x70;


function pcf8574(address, _forceReadStateChange) {
    var forceReadStateChange = _forceReadStateChange;
    address = address | base_address;
    var wire = new i2c(address, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface


    var state = 0;

    function set(mask) {
        state = state | mask;
        return write(state);
    }

    function reset(mask) {
        state = state & mask;
        return write(state);
    }

    function _readForce(mask) {
        var storedState = state;

        return set(mask).then(function () {
            return _read(mask);
        }).then(function (readResult) {
            write(storedState);
            return readResult;
        });

    }

    function _read(mask) {

        var resolver = Promise.pending();
        wire.readByte(function (err, res) { // result is single byte
            if (err) resolver.reject(err);
            else {
                resolver.resolve(res & mask);
            }
        });
        return resolver.promise;
    }

    function write(mask) {
        var resolver = Promise.pending();
        wire.writeByte(mask, function (err) {
            if (err) resolver.reject(err);
            else {
                resolver.resolve(content);
            }
        });
        return resolver.promise;
    }

    function read(mask){
        if(forceReadStateChange){
            return _readForce(mask);
        } else {
            return _read(mask);
        }
    }

    return {
        read: read,
        write: write,
        set: set,
        reset: reset
    }
}