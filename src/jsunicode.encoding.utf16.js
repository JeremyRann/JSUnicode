/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var encUtil = require("./jsunicode.encoding.utilities");
var constants = require("./jsunicode.constants");

var decode = function (reader, options) {
    var textBuilder = encUtil.textBuilder(options.throwOnError, options.lineEndingConversion, options.validate);
    var isLittleEndian = false;

    if (options.encoding === constants.encoding.utf16le || options.isLittleEndian) {
        isLittleEndian = true;
    }

    var firstByte = reader.read();
    var secondByte = reader.read();
    var codePoint;
    var surrogateCodePoint = null;
    while (firstByte !== null) {
        if (secondByte === null) {
            textBuilder.addError("Odd number of bytes in byte stream (must be even for UTF-16)");
        }
        else if (firstByte < 0 || firstByte > 0xff || secondByte < 0 || secondByte > 0xff) {
            textBuilder.addError("Invalid byte");
        }
        else {
            if (isLittleEndian) {
                codePoint = secondByte * 0x100 + firstByte;
            }
            else {
                codePoint = firstByte * 0x100 + secondByte;
            }

            if (surrogateCodePoint !== null) {
                if (codePoint < 0xDC00 || codePoint > 0xDFFF) {
                    textBuilder.addError("Surrogate code point not found when expected");
                }
                else {
                    textBuilder.addCodePoint(surrogateCodePoint, codePoint);
                }
                surrogateCodePoint = null;
            }
            else {
                if (codePoint >= 0xDC00 && codePoint <= 0xDFFF) {
                    textBuilder.addError("Invalid code point (in high surrogate range)");
                    surrogateCodePoint = null;
                }
                else if (codePoint >= 0xD800 && codePoint <= 0xDBFF) {
                    surrogateCodePoint = codePoint;
                }
                else {
                    textBuilder.addCodePoint(codePoint);
                    surrogateCodePoint = null;
                }
            }
        }
        firstByte = reader.read();
        secondByte = reader.read();
    }
    if (surrogateCodePoint !== null) {
        textBuilder.addError("High surrogate code point at end of byte stream (expected corresponding low surrogate code point)");
    }

    return textBuilder.getResult();
};

var encode = function (codePoints, writer, options) {
    var isLittleEndian = false;

    if (options.encoding === constants.encoding.utf16le || options.isLittleEndian) {
        isLittleEndian = true;
    }

    var writeTwoBytes = function (number) {
        if (isLittleEndian) {
            writer.write(number & 0xff);
            writer.write((number & 0xff00) >> 8);
        }
        else {
            writer.write((number & 0xff00) >> 8);
            writer.write(number & 0xff);
        }
    };

    for (var i = 0; i < codePoints.length; i++) {
        var codePoint = codePoints[i];
        // We're not going to bother validating code points here; the encoding library should take care of that
        // for us before we get here
        if (codePoint < 0x10000) {
            writeTwoBytes(codePoint);
        }
        else {
            var basis = codePoint - 0x10000;
            var highSurrogate = 0xd800 + (basis >> 10);
            var lowSurrogate = 0xdc00 + (basis & 0x3ff);
            writeTwoBytes(highSurrogate);
            writeTwoBytes(lowSurrogate);
        }
    }
};

exports.decode = decode;
exports.encode = encode;

