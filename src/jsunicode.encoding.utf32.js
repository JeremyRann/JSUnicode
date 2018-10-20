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

    if (options.encoding === constants.encoding.utf32le || options.isLittleEndian) {
        isLittleEndian = true;
    }

    var bytes = [reader.read(), reader.read(), reader.read(), reader.read()];

    while (bytes[0] !== null) {
        if (bytes[1] === null || bytes[2] === null || bytes[3] === null) {
            textBuilder.addError("Unexpected end of input");
        }
        else if (bytes[0] < 0 || bytes[1] < 0 || bytes[2] < 0 || bytes[3] < 0 ||
                bytes[0] > 0xff || bytes[1] > 0xff || bytes[2] > 0xff || bytes[3] > 0xff) {
            textBuilder.addError("Invalid byte");
        }
        else {
            var codePoint;
            if (isLittleEndian) {
                codePoint = ((bytes[3] << 24) >>> 0) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
            }
            else {
                codePoint = ((bytes[0] << 24) >>> 0) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
            }

            textBuilder.addCodePoint(codePoint);
        }

        bytes = [reader.read(), reader.read(), reader.read(), reader.read()];
    }

    return textBuilder.getResult();
};

var encode = function (codePoints, writer, options) {
    var isLittleEndian = false;

    if (options.encoding === constants.encoding.utf32le || options.isLittleEndian) {
        isLittleEndian = true;
    }

    for (var i = 0; i < codePoints.length; i++) {
        var codePoint = codePoints[i];
        if (isLittleEndian) {
            writer.write(codePoint & 0xff);
            writer.write((codePoint & 0xff00) >> 8);
            writer.write((codePoint & 0xff0000) >> 16);
            writer.write((codePoint & 0xff000000) >>> 24);
        }
        else {
            writer.write((codePoint & 0xff000000) >>> 24);
            writer.write((codePoint & 0xff0000) >> 16);
            writer.write((codePoint & 0xff00) >> 8);
            writer.write(codePoint & 0xff);
        }
    }
};

exports.decode = decode;
exports.encode = encode;

