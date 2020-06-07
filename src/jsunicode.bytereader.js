/*global Uint8Array */
var jsuError = require("./jsunicode.error.js");
var constants = require("./jsunicode.constants.js");
var byteReaders = {};

// DEPRECATED: Use registerFactory or registerPrototype instead
var register = function (name, byteReader) {
    byteReaders[name] = byteReader;
};

var registerFactory = function (name, byteReaderFactory) {
    if (typeof (byteReaderFactory) !== "function") {
        throw new Error("byteReaderFactory must be a function");
    }

    byteReaders[name] = byteReaderFactory;
};

var registerPrototype = function (name, byteReaderPrototype) {
    if (typeof (byteReaderPrototype) !== "function") {
        throw new Error("byteReaderPrototype must be a function");
    }

    byteReaders[name] = function () { return new byteReaderPrototype(); };
};

var unregister = function (name) {
    delete byteReaders[name];
};

registerFactory(constants.binaryFormat.hex, function () {
    var inpString;
    var index;

    var begin = function (value) {
        if (typeof(value) !== "string") {
            throw new Error("Invalid data type (expected type of string)");
        }
        inpString = value;
        index = 0;
        if (value.length % 2 !== 0) {
            throw new jsuError("Invalid hex string length");
        }
    };

    var read = function () {
        if (index >= inpString.length) {
            return null;
        }

        var currentByte = parseInt(inpString.substring(index, index + 2), 16);
        if (isNaN(currentByte)) {
            throw new jsuError("Invalid hex byte");
        }
        index = index + 2;
        return currentByte;
    };

    var deserialize = function (inpStr) {
        return inpStr;
    };

    return {
        begin: begin,
        read: read,
        deserialize: deserialize
    };
});

registerFactory(constants.binaryFormat.buffer, function () {
    var buffer;
    var index;

    var begin = function (value) {
        if (!(value instanceof Buffer)) {
            throw new Error("Invalid data type (expected instance of Buffer)");
        }
        buffer = value;
        index = 0;
    };

    var read = function () {
        if (index >= buffer.length) {
            return null;
        }

        return buffer.readUInt8(index++);
    };

    var deserialize = function (inpStr) {
        return JSON.parse(inpStr);
    };

    return {
        begin: begin,
        read: read,
        deserialize: deserialize
    };
});

var byteArrayReader = function (isTyped) {
    var arr;
    var index;

    var begin = function (value) {
        if (!(typeof(value) === "object")) {
            throw new Error("Invalid data type (expected typeof object)");
        }
        if (isTyped && !(value instanceof Uint8Array)) {
            throw new Error("Invalid data type (expected instance of Uint8Array)");
        }
        arr = value;
        index = 0;
    };

    var read = function () {
        if (index >= arr.length) {
            return null;
        }

        return arr[index++];
    };

    var deserialize;
    if (isTyped) {
        deserialize = function (inpStr) {
            return new Uint8Array(JSON.parse(inpStr));
        };
    }
    else {
        deserialize = function (inpStr) {
            return JSON.parse(inpStr);
        };
    }

    return {
        begin: begin,
        read: read,
        deserialize: deserialize
    };
};

registerFactory(constants.binaryFormat.byteArray, function () { return byteArrayReader(false); });
registerFactory(constants.binaryFormat.Uint8Array, function () { return byteArrayReader(true); });

var b64 = { "A":0, "B":1, "C":2, "D":3, "E":4, "F":5, "G":6, "H":7, "I":8,
    "J":9, "K":10, "L":11, "M":12, "N":13, "O":14, "P":15, "Q":16,
    "R":17, "S":18, "T":19, "U":20, "V":21, "W":22, "X":23, "Y":24,
    "Z":25, "a":26, "b":27, "c":28, "d":29, "e":30, "f":31, "g":32,
    "h":33, "i":34, "j":35, "k":36, "l":37, "m":38, "n":39, "o":40,
    "p":41, "q":42, "r":43, "s":44, "t":45, "u":46, "v":47, "w":48,
    "x":49, "y":50, "z":51, "0":52, "1":53, "2":54, "3":55, "4":56,
    "5":57, "6":58, "7":59, "8":60, "9":61, "+":62, "/":63
};

registerFactory(constants.binaryFormat.base64, function () {
    var inpString;
    var byteIndex;
    var charIndex;
    var buffer;
    var bufferedByteLength;

    var begin = function (value) {
        if (typeof(value) !== "string") {
            throw new Error("Invalid data type (expected typeof string)");
        }
        if (value.length % 4 !== 0) {
            throw new jsuError("base64 string length not divisible by 4 (padding is required)");
        }

        inpString = value;
        buffer = [null, null, null];
        byteIndex = 0;
        charIndex = 0;
        bufferedByteLength = (inpString.length / 4) * 3;
    };

    var read = function () {
        if (byteIndex >= bufferedByteLength) {
            return null;
        }

        if (byteIndex % 3 === 0) {
            var chars = inpString.substr(charIndex, 4);
            charIndex += 4;
            var byteParts = [null, null, null, null];
            for (var i = 0; i < 4; i++) {
                if (chars[i] === "=") {
                    // Padding characters should only be at the end, and if the 2nd to last char is =, the last must be too
                    if ((byteIndex + 3 < bufferedByteLength || i < 2) || (i === 2 && chars[3] !== "=")) {
                        throw new jsuError("Unexpected padding character");
                    }
                    else {
                        bufferedByteLength--;
                        byteParts[i] = null;
                    }
                }
                else {
                    byteParts[i] = b64[chars[i]];
                    if (byteParts[i] === undefined) {
                        throw new jsuError("Unrecognized base64 character");
                    }
                }
            }
            buffer[0] = (byteParts[0] << 2) + ((byteParts[1] & 0x30) >> 4);
            if (byteParts[2] !== null) {
                buffer[1] = ((byteParts[1] & 0xf) << 4) + ((byteParts[2] & 0x3C) >> 2);
            }
            if (byteParts[3] !== null) {
                buffer[2] = ((byteParts[2] & 0x3) << 6) + byteParts[3];
            }
        }

        var currentByte = buffer[byteIndex % 3];
        byteIndex++;
        return currentByte;
    };

    var deserialize = function (inpStr) {
        return inpStr;
    };

    return {
        begin: begin,
        read: read,
        deserialize: deserialize
    };
});

var get = function (name, options) {
    var reader = byteReaders[name];
    if (typeof(reader) === "function") {
        return reader(options);
    }
    else if (reader === undefined) {
        return undefined;
    }
    else {
        reader.options = options;
        return reader;
    }
};

var list = function () {
    return Object.keys(byteReaders);
};

exports.registerFactory = registerFactory;
exports.registerPrototype = registerPrototype;
exports.register = register;
exports.unregister = unregister;
exports.get = get;
exports.list = list;

