/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* global Uint8Array */
var byteWriters = {};
var extend = require("extend");
var jsuError = require("./jsunicode.error");

var register = function (name, byteWriter) {
    byteWriters[name] = byteWriter;
};

register("hex", function (options) {
    var bytes = [];
    options = extend({}, { upperCase: false }, options);

    var write = function (currentByte) {
        if (currentByte === 0) {
            bytes.push("00");
        }
        else {
            var result = currentByte.toString(16);
            if (result.length < 2) {
                result = "0" + result;
            }

            if (options.upperCase) {
                result = result.toUpperCase();
            }
            else {
                result = result.toLowerCase();
            }

            bytes.push(result);
        }
    };

    var finish = function () {
        return bytes.join("");
    };

    return {
        write: write,
        finish: finish
    };
});

register("byteArray", function () {
    var bytes = [];

    var write = function (currentByte) {
        bytes.push(currentByte);
    };

    var finish = function () {
        return bytes;
    };

    return {
        write: write,
        finish: finish
    };
});

register("Uint8Array", function () {
    var bytes = [];

    var write = function (currentByte) {
        bytes.push(currentByte);
    };

    var finish = function () {
        return new Uint8Array(bytes);
    };

    return {
        write: write,
        finish: finish
    };
});

register("count", function () {
    var byteCount = 0;
    var write = function () {
        byteCount++;
    };

    var finish = function () {
        return byteCount;
    };

    return {
        write: write,
        finish: finish
    };
});

var b64 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
    "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
    "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g",
    "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r",
    "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2",
    "3", "4", "5", "6", "7", "8", "9", "+", "/"];

register("base64", function () {
    var result = [];
    var firstByte = null;
    var secondByte = null;

    var write = function (currentByte) {
        if (firstByte === null) {
            firstByte = currentByte;
        }
        else if (secondByte === null) {
            secondByte = currentByte;
        }
        else {
            result.push(b64[firstByte >> 2]);
            result.push(b64[((firstByte & 0x3) << 4) + (secondByte >> 4)]);
            result.push(b64[((secondByte & 0xf) << 2) + (currentByte >> 6)]);
            result.push(b64[currentByte & 0x3f]);
            firstByte = null;
            secondByte = null;
        }
    };

    var finish = function () {
        if (firstByte !== null) {
            if (secondByte !== null) {
                result.push(b64[firstByte >> 2]);
                result.push(b64[((firstByte & 0x3) << 4) + (secondByte >> 4)]);
                result.push(b64[((secondByte & 0xf) << 2)]);
                result.push("=");
            }
            else {
                result.push(b64[firstByte >> 2]);
                result.push(b64[((firstByte & 0x3) << 4)]);
                result.push("==");
            }
        }
        return result.join("");
    };

    return {
        write: write,
        finish: finish
    };
});

var get = function (name, options) {
    var writer = byteWriters[name];
    if (typeof(writer) === "function") {
        writer = writer(options);
    }
    else if (writer === undefined) {
        return undefined;
    }
    else {
        writer.options = options;
    }

    return {
        write: function (currentByte) {
            if (typeof(currentByte) !== "number" || currentByte < 0 || currentByte > 255) {
                throw new jsuError("Invalid byte");
            }

            return writer.write(currentByte);
        },
        finish: writer.finish
    };
};

var list = function () {
    return Object.keys(byteWriters);
};

exports.register = register;
exports.get = get;
exports.list = list;

