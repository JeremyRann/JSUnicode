/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";
    var byteReaders = {};

    var register = function (name, byteReader) {
        byteReaders[name] = byteReader;
    };

    register("hex", function () {
        var inpString;
        var index;

        var begin = function (value) {
            inpString = value;
            index = 0;
        };

        var read = function () {
            if (index >= inpString.length) {
                return null;
            }

            var currentByte = parseInt(inpString.substring(index, index + 2), 16);
            index = index + 2;
            return currentByte;
        };

        return {
            begin: begin,
            read: read
        };
    });

    var byteArrayReader = function () {
        var arr;
        var index;

        var begin = function (value) {
            arr = value;
            index = 0;
        };

        var read = function () {
            if (index >= arr.length) {
                return null;
            }

            return arr[index++];
        };

        return {
            begin: begin,
            read: read
        };
    };

    register("byteArray", byteArrayReader);
    register("Uint8Array", byteArrayReader);

    var b64 = { "A":0, "B":1, "C":2, "D":3, "E":4, "F":5, "G":6, "H":7, "I":8,
        "J":9, "K":10, "L":11, "M":12, "N":13, "O":14, "P":15, "Q":16,
        "R":17, "S":18, "T":19, "U":20, "V":21, "W":22, "X":23, "Y":24,
        "Z":25, "a":26, "b":27, "c":28, "d":29, "e":30, "f":31, "g":32,
        "h":33, "i":34, "j":35, "k":36, "l":37, "m":38, "n":39, "o":40,
        "p":41, "q":42, "r":43, "s":44, "t":45, "u":46, "v":47, "w":48,
        "x":49, "y":50, "z":51, "0":52, "1":53, "2":54, "3":55, "4":56,
        "5":57, "6":58, "7":59, "8":60, "9":61, "+":62, "/":63
    };

    register("base64", function () {
        var baseReader = byteArrayReader();

        var begin = function (inpStr) {
            // Instead of trying to pluck a value from the beginning of a base64 string,
            // we'll instead convert it to a byte array first
            if (inpStr.length % 4 !== 0) {
                throw "base64 string length not divisible by 4 (padding is required)";
            }

            var byteLength = (inpStr.length / 4) * 3;

            if (inpStr[inpStr.length - 2] === "=") {
                if (inpStr[inpStr.length - 1] !== "=") {
                    throw "Padding error";
                }

                byteLength -= 2;
            }
            else if (inpStr[inpStr.length - 1] === "=") {
                byteLength--;
            }

            var bytes = new Array(byteLength);

            for (var i = 0; i < inpStr.length; i += 4) {
                var chars = inpStr.substring(i, i + 4).split("");
                var byteParts = new Array(4);

                for (var j = 0; j < 4; j++) {
                    if (chars[j] === "=") {
                        if (j < 2 || i + 4 < inpStr.length) {
                            throw "Unexpected padding character";
                        }
                        byteParts[j] = null;
                    }
                    else {
                        byteParts[j] = b64[chars[j]];
                        if (byteParts[j] === undefined) {
                            throw "Unrecognized base64 character";
                        }
                    }
                }

                var byteIndex = (i / 4) * 3;
                bytes[byteIndex + 0] = (byteParts[0] << 2) + ((byteParts[1] & 0x30) >> 4);
                if (byteParts[2] !== null) {
                    bytes[byteIndex + 1] = ((byteParts[1] & 0xf) << 4) + ((byteParts[2] & 0x3C) >> 2);
                }
                if (byteParts[3] !== null) {
                    bytes[byteIndex + 2] = ((byteParts[2] & 0x3) << 6) + byteParts[3];
                }
            }

            baseReader.begin(bytes);
        };

        var read = baseReader.read;

        return {
            begin: begin,
            read: read
        };
    });

    var get = function (name) {
        var reader = byteReaders[name];
        if (typeof(reader) === "function") {
            return reader();
        }
        else {
            return reader;
        }
    };

    var list = function () {
        return Object.keys(byteReaders);
    };

    exports.register = register;
    exports.get = get;
    exports.list = list;
}());

