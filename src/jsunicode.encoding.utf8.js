/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var encUtil = require("./jsunicode.encoding.utilities");

var decode = function (reader, options) {
    var resultBuilder = [];
    var currentByte = reader.read();
    var byteCount;
    var continuationByte;
    var codePoint;
    var toe = options.throwOnError;
    // Generally, it's invalid to encode a surrogate pair in UTF-8, but we'll allow a user
    // to specify that they have iffy data using the allowEncodedSurrogatePair option. In
    // that case, we still want to validate that the surrogate pair is really a pair.
    var highSurrogate = null;

    while (currentByte !== null) {
        if (currentByte < 0 || currentByte > 0xff) {
            resultBuilder.push(encUtil.errorString("Invalid byte", toe));
        }
        else if (currentByte < 0x80) {
            resultBuilder.push(encUtil.fromCodePoint(currentByte));
            highSurrogate = null;
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
                resultBuilder.push(encUtil.errorString("Invalid leading byte", toe));
            }


            for (var i = byteCount - 1; i > 0; i--) {
                continuationByte = reader.read();
                if (continuationByte === null) {
                    resultBuilder.push(encUtil.errorString("Unexpected end of byte stream", toe));
                }
                else if ((continuationByte & 0xc0) !== 0x80) {
                    resultBuilder.push(encUtil.errorString("Invalid continuation byte", toe));
                }
                else {
                    codePoint += (continuationByte - 0x80) << ((i - 1) * 6);
                }
            }

            if (!encUtil.validateCodePoint(codePoint)) {
                if (options.allowEncodedSurrogatePair && highSurrogate === null && codePoint >= 0xd800 && codePoint <= 0xdbff) {
                    highSurrogate = codePoint;
                }
                else if (options.allowEncodedSurrogatePair && highSurrogate !== null && codePoint >= 0xdc00 && codePoint <= 0xdfff) {
                    resultBuilder.push(encUtil.fromCodePoint(highSurrogate, codePoint));
                    highSurrogate = null;
                }
                else {
                    resultBuilder.push(encUtil.errorString("Invalid Unicode code point detected", toe));
                    highSurrogate = null;
                }
            }
            else {
                resultBuilder.push(encUtil.fromCodePoint(codePoint));
                highSurrogate = null;
            }
        }
        currentByte = reader.read();
    }

    if (options.allowEncodedSurrogatePair && highSurrogate !== null) {
        resultBuilder.push(encUtil.errorString("Unmatched encoded surrogate pair", toe));
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

