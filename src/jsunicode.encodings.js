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

var createPeekableByteReader = function (byteReader) {
    var buffer = [];

    var fillBuffer = function (count) {
        for (var i = buffer.length; i < count; i++) {
            buffer.push(byteReader.read());
        }
    };

    var begin = function (value) {
        return byteReader.begin(value);
    };

    var read = function () {
        if (buffer.length > 0) {
            return buffer.shift();
        }
        else {
            return byteReader.read();
        }
    };

    var peekArray = function (byteCount) {
        fillBuffer(byteCount);
        return buffer.slice(0, byteCount);
    };

    var peekByte = function () {
        return peekArray(1)[0];
    };

    var deserialize = function (inpStr) {
        return byteReader.deserialize(inpStr);
    };

    var skip = function (count) {
        if (!count) {
            count = 1;
        }

        fillBuffer(count);
        return buffer.splice(0, count);
    };

    // (this is a crappy compare; don't use it broadly)
    var arrayCompare = function (leftArray, rightArray) {
        for (var i = 0; i < leftArray.length; i++) {
            if (leftArray[i] !== rightArray[i]) {
                return false;
            }
        }

        return true;
    };

    var checkBOM = function (checkUTF32) {
        var firstBytes = peekArray(4);

        if (arrayCompare([0xef, 0xbb, 0xbf], firstBytes)) {
            return constants.encoding.utf8;
        }
        // Order matters here; a UTF-32LE BOM is a UTF-16LE BOM with two null bytes afterwards
        else if (checkUTF32 && arrayCompare([0x00, 0x00, 0xfe, 0xff], firstBytes)) {
            return constants.encoding.utf32be;
        }
        else if (checkUTF32 && arrayCompare([0xff, 0xfe, 0x00, 0x00], firstBytes)) {
            return constants.encoding.utf32le;
        }
        else if (arrayCompare([0xfe, 0xff], firstBytes)) {
            return constants.encoding.utf16be;
        }
        else if (arrayCompare([0xff, 0xfe], firstBytes)) {
            return constants.encoding.utf16le;
        }

        return null;
    };

    return { 
        begin: begin,
        checkBOM: checkBOM,
        deserialize: deserialize,
        peekArray: peekArray,
        peekByte: peekByte,
        read: read,
        skip: skip
    };
};

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
        encoding: options.encoding || constants.encoding.guess,
        byteReader: options.byteReader || constants.binaryFormat.hex,
        throwOnError: options.throwOnError || false,
        byteReaderOptions: options.byteReaderOptions || {},
        preserveBOM: options.preserveBOM || false,
        detectUTF32BOM: options.detectUTF32BOM || false,
        BOMMismatchBehavior: options.BOMMismatchBehavior || constants.BOMMismatchBehavior.throw
    };

    var reader = byteReader.get(options.byteReader, options.byteReaderOptions);
    if (reader === undefined) {
        throw new jsuError("Unrecognized byte reader name: " + options.byteReader);
    }
    reader = createPeekableByteReader(reader);

    if (options.encoding && options.encoding !== "guess") {
        if (!encodings.hasOwnProperty(options.encoding)) {
            throw new jsuError("Unrecognized encoding: " + options.encoding);
        }
    }

    if (inpBytes === null || inpBytes === undefined) {
        return inpBytes;
    }

    reader.begin(inpBytes);

    var bom = reader.checkBOM(options.detectUTF32BOM || options.encoding.startsWith(constants.encoding.utf32));
    if (bom) {
        // The value of "bom" might change if there's a mismatch (depending on options); go ahead and remove
        // the BOM first in case the number of bytes in the new BOM is different than the detected value
        if (!options.preserveBOM) {
            if (bom === constants.encoding.utf8) {
                reader.skip(3);
            }
            else if (bom.startsWith(constants.encoding.utf16)) {
                reader.skip(2);
            }
            else if (bom.startsWith(constants.encoding.utf32)) {
                reader.skip(4);
            }
        }

        var bomMismatch = false;
        if (options.encoding && options.encoding !== "guess") {
            switch (options.encoding) {
                case constants.encoding.utf16:
                    bomMismatch = [constants.encoding.utf16le, constants.encoding.utf16be].indexOf(bom) < 0;
                    break;
                case constants.encoding.utf32:
                    bomMismatch = [constants.encoding.utf32le, constants.encoding.utf32be].indexOf(bom) < 0;
                    break;
                default:
                    bomMismatch = options.encoding !== bom;
                    break;
            }
        }

        if (bomMismatch) {
            if (options.BOMMismatchBehavior === constants.BOMMismatchBehavior.throw) {
                throw new jsuError("Byte Order Mark/encoding mismatch");
            }
            else if (options.BOMMismatchBehavior === constants.BOMMismatchBehavior.trustRequest) {
                bom = options.encoding;
            }
        }

        options.encoding = bom;
    }

    if (options.encoding === "guess") {
        options.encoding = constants.encoding.utf8;
    }

    var encoding = getEncoding(options.encoding);
 
    var result = encoding.decode(reader, options);
    return result;
};

exports.createPeekableByteReader = createPeekableByteReader;
exports.register = registerEncoding;
exports.get = getEncoding;
exports.decode = decode;
exports.encode = encode;

