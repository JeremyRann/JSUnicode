/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var encodings = require("./jsunicode.encodings");
var utf32 = require("./jsunicode.encoding.utf32");
var utf16 = require("./jsunicode.encoding.utf16");
var utf8 = require("./jsunicode.encoding.utf8");
var byteReader = require("./jsunicode.bytereader");
var byteWriter = require("./jsunicode.bytewriter");
var jsunicodeError = require("./jsunicode.error");
var constants = require("./jsunicode.constants");

encodings.register(constants.encoding.utf8, utf8);
encodings.register(constants.encoding.utf16, utf16);
encodings.register(constants.encoding.utf16be, utf16);
encodings.register(constants.encoding.utf16le, utf16);
encodings.register(constants.encoding.utf32, utf32);
encodings.register(constants.encoding.utf32be, utf32);
encodings.register(constants.encoding.utf32le, utf32);

var countEncodedBytes = function (inpString, encoding) {
    if (encoding === undefined) {
        encoding = constants.encoding.utf8;
    }

    var result = encodings.encode(inpString, {
        encoding: encoding,
        byteWriter: constants.binaryFormat.count,
        throwOnError: true
    });

    return result;
};

var convertBytes = function (inpBytes, byteReaderName, byteWriterName, options) {
    options = options || {};
    options.byteReaderOptions = options.byteReaderOptions || {};
    options.byteWriterOptions = options.byteWriterOptions || {};

    var currentByteReader = byteReader.get(byteReaderName, options.byteReaderOptions);
    var currentByteWriter = byteWriter.get(byteWriterName, options.byteWriterOptions);

    currentByteReader.begin(inpBytes);
    var currentByte = currentByteReader.read();
    while (currentByte !== null) {
        currentByteWriter.write(currentByte);
        currentByte = currentByteReader.read();
    }

    return currentByteWriter.finish();
};

exports.constants = constants;
exports.decode = encodings.decode;
exports.encode = encodings.encode;
exports.createPeekableByteReader = encodings.createPeekableByteReader;
exports.byteReader = byteReader;
exports.byteWriter = byteWriter;
exports.convertBytes = convertBytes;
exports.countEncodedBytes = countEncodedBytes;
exports.jsunicodeError = jsunicodeError;

