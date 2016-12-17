/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";

    // This polyfill is necessary for browsers without String.fromCodePoint (sigh)
    // I suppose I could just use the fromCharCode option always, but I'm a bit worried that
    // at some point a JavaScript implementation might complain that fromCharCode is sort of
    // nonsense for a low surrogate value
    var fromCodePoint = function (codePoint) {
        if (String.hasOwnProperty("fromCodePoint")) {
            return String.fromCodePoint(codePoint);
        }
        else {
            if (codePoint >= 0x10000) {
                var basis = codePoint - 0x10000;
                var highSurrogate = 0xd800 + (basis >> 10);
                var lowSurrogate = 0xdc00 + (basis & 0x3ff);
                return String.fromCharCode(highSurrogate) + String.fromCharCode(lowSurrogate);
            }
            else {
                return String.fromCharCode(codePoint);
            }
        }
    };

    var decode = function (reader, options) {
        var resultBuilder = [];
        var currentByte = reader.read();
        var byteCount;
        var continuationByte;
        var codePoint;

        var errorString = function (err) {
            if (options.throwOnError) {
                throw err;
            }
            else {
                return "\ufffd";
            }
        };

        while (currentByte !== null) {
            if (currentByte < 0x80) {
                resultBuilder.push(fromCodePoint(currentByte));
            }
            else {
                if ((currentByte & 0xe0) === 0xc0) {
                    byteCount = 2;
                    codePoint = (currentByte & 0x1f) << 6;
                }
                else if ((currentByte & 0xf0) === 0xe0) {
                    byteCount = 3;
                    codePoint = (currentByte & 0x0f) << 12;
                }
                else if ((currentByte & 0xf8) === 0xf0) {
                    byteCount = 4;
                    codePoint = (currentByte & 0x07) << 18;
                }
                else {
                    resultBuilder.push(errorString("Invalid leading byte"));
                }


                for (var i = byteCount - 1; i > 0; i--) {
                    continuationByte = reader.read();
                    if (continuationByte === null) {
                        resultBuilder.push(errorString("Unexpected end of byte stream"));
                    }
                    else if ((continuationByte & 0xc0) !== 0x80) {
                        resultBuilder.push(errorString("Invalid continuation byte"));
                    }
                    else {
                        codePoint += (continuationByte - 0x80) << ((i - 1) * 6);
                    }
                }

                resultBuilder.push(fromCodePoint(codePoint));
            }
            currentByte = reader.read();
        }

        return resultBuilder.join("");
    };

    var encode = function (codePoints, writer/*, options*/) {
        for (var i = 0; i < codePoints.length; i++) {
            var codePoint = codePoints[i];
            if (codePoint < 0x80) {
                writer.write(codePoint);
            }
            else if (codePoint < 0x800) {
                writer.write(0xc0 + (codePoint >> 6));
                writer.write(0x80 + (codePoint & 0x3f));
            }
            else if (codePoint < 0x10000) {
                writer.write(0xe0 + (codePoint >> 12));
                writer.write(0x80 + ((codePoint >> 6) & 0x3f));
                writer.write(0x80 + (codePoint & 0x3f));
            }
            else {
                writer.write(0xf0 + (codePoint >> 18));
                writer.write(0x80 + ((codePoint >> 12) & 0x3f));
                writer.write(0x80 + ((codePoint >> 6) & 0x3f));
                writer.write(0x80 + (codePoint & 0x3f));
            }
        }
    };

    exports.decode = decode;
    exports.encode = encode;
}());


