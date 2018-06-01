/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var jsuError = require("./jsunicode.error.js");
var byteReader = require("./jsunicode.bytereader");
var byteWriter = require("./jsunicode.bytewriter");
var constants = require("./jsunicode.constants");
var encodings = {};

var registerEncoding = function (encodingName, encoding) {
    encodings[encodingName] = encoding;
};

var getEncoding = function (encodingName) {
    return encodings[encodingName];
};

// Resolve a JavaScript string into an array of unicode code points
var getCodePoints = function (inpString, throwOnError) {
    var result = [];
    var searchingForSurrogate = false;
    var highSurrogate = null;
    var handleError = function (message) {
        if (throwOnError) {
            throw new jsuError(message);
        }
        else {
            result.push(0xfffd);
        }
    };

    for (var i = 0; i < inpString.length; i++) {
        var currentPoint = inpString.charCodeAt(i);
        // currentPoint < 0? Probably not possible, but covering bases anyway
        if (currentPoint > 0xffff || currentPoint < 0) {
            handleError("String contains invalid character data");
            // If we're looking for a low surrogate, we now have two errors; one for the missing pair,
            // and one for the strange found character
            if (searchingForSurrogate) {
                result.push(0xfffd);
                searchingForSurrogate = false;
            }
        }
        else if (currentPoint <= 0xd7ff || currentPoint >= 0xE000) {
            if (searchingForSurrogate === true) {
                handleError("Unmatched surrogate pair in string");
                searchingForSurrogate = false;
            }
            result.push(currentPoint);
        }
        else {
            if (searchingForSurrogate) {
                if (currentPoint < 0xdc00) {
                    handleError("Low surrogate value not valid");
                }
                else {
                    result.push((0x10000 + ((highSurrogate - 0xd800) << 10) + currentPoint - 0xdc00));
                }
                searchingForSurrogate = false;
            }
            else {
                if (currentPoint >= 0xdc00) {
                    handleError("Unexpected high surrogate found");
                }
                else {
                    searchingForSurrogate = true;
                    highSurrogate = currentPoint;
                }
            }
        }
    }

    if (searchingForSurrogate) {
        handleError("Unexpected end of string (unmatched surrogate pair)");
    }

    return result;
};

var encode = function (inpString, options) {
    if (inpString !== null && typeof(inpString) !== "string") {
        throw new Error("Invalid data type (expected type of string");
    }
    if (!options) { options = {}; }
    options = {
        encoding: options.encoding || constants.encoding.utf8,
        byteWriter: options.byteWriter || constants.binaryFormat.hex,
        throwOnError: options.throwOnError || false,
        byteWriterOptions: options.byteWriterOptions || {}
    };

    var encoding = getEncoding(options.encoding);
    if (encoding === undefined) {
        throw new jsuError("Unrecognized encoding: " + options.encoding);
    }

    var writer = byteWriter.get(options.byteWriter, options.byteWriterOptions);
    if (writer === undefined) {
        throw new jsuError("Unrecognized byte writer name: " + options.byteWriter);
    }

    if (inpString === null || inpString === undefined) {
        return inpString;
    }

    var codePoints = getCodePoints(inpString, options.throwOnError);

    encoding.encode(codePoints, writer, options);

    var result = writer.finish();

    return result;
};

var decode = function (inpBytes, options) {
    if (!options) { options = {}; }
    options = {
        encoding: options.encoding,
        byteReader: options.byteReader || constants.binaryFormat.hex,
        throwOnError: options.throwOnError || false,
        byteReaderOptions: options.byteReaderOptions || {}
    };

    var reader = byteReader.get(options.byteReader, options.byteReaderOptions);
    if (reader === undefined) {
        throw new jsuError("Unrecognized byte reader name: " + options.byteReader);
    }

    var encoding = null;
    if (options.encoding) {
        encoding = getEncoding(options.encoding);
        if (encoding === undefined) {
            throw new jsuError("Unrecognized encoding: " + options.encoding);
        }
    }

    if (inpBytes === null || inpBytes === undefined) {
        return inpBytes;
    }

    reader.begin(inpBytes);

    var firstBytes = [reader.read(), reader.read(), reader.read()];

    if (firstBytes[0] === 0xef &&
            firstBytes[1] === 0xbb &&
            firstBytes[2] === 0xbf) {
        options.encoding = constants.encoding.utf8;
        encoding = getEncoding(options.encoding);
        firstBytes = [];
    }
    else if (firstBytes[0] === 0xfe &&
            firstBytes[1] === 0xff) {
        options.encoding = constants.encoding.utf16be;
        encoding = getEncoding(options.encoding);
        firstBytes = [firstBytes[2]];
    }
    else if (firstBytes[0] === 0xff &&
            firstBytes[1] === 0xfe) {
        options.encoding = constants.encoding.utf16le;
        encoding = getEncoding(options.encoding);
        firstBytes = [firstBytes[2]];
    }

    if (!encoding) {
        options.encoding = constants.encoding.utf8;
        encoding = getEncoding(options.encoding);
    }
 
    var readerWrapper = {
        read: function () {
            return firstBytes.length > 0 ? firstBytes.shift() : reader.read();
        }
    };

    var result = encoding.decode(readerWrapper, options);
    return result;
};

exports.register = registerEncoding;
exports.get = getEncoding;
exports.decode = decode;
exports.encode = encode;

