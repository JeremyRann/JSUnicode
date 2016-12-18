/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";
    var extend = require("extend");
    var byteReader = require("./jsunicode.bytereader");
    var byteWriter = require("./jsunicode.bytewriter");
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
                throw message;
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

        return result;
    };

    var encode = function (inpString, options) {
        if (inpString === null || inpString === undefined) {
            return inpString;
        }

        options = extend({}, {
            encoding: "UTF-8",
            byteWriter: "hex",
            throwOnError: false
        }, options || {});

        var encoding = getEncoding(options.encoding);
        if (encoding === undefined) {
            throw "Unrecognized encoding: " + options.encoding;
        }

        var writer = byteWriter.get(options.byteWriter);
        if (writer === undefined) {
            throw "Unrecognized byte writer name: " + options.byteWriter;
        }

        var codePoints = getCodePoints(inpString, options.throwOnError);

        encoding.encode(codePoints, writer, options);

        var result = writer.finish();

        return result;
    };

    var decode = function (inpBytes, options) {
        if (inpBytes === null || inpBytes === undefined) {
            return inpBytes;
        }

        options = extend({}, {
            encoding: "UTF-8",
            byteReader: "hex",
            throwOnError: false
        }, options || {});

        var encoding = getEncoding(options.encoding);
        if (getEncoding === undefined) {
            throw "Unrecognized encoding: " + options.encoding;
        }

        var reader = byteReader.get(options.byteReader);
        if (reader === undefined) {
            throw "Unrecognized byte reader name: " + options.byteReader;
        }

        reader.begin(inpBytes);
        var result = encoding.decode(reader, options);
        return result;
    };

    exports.register = registerEncoding;
    exports.get = getEncoding;
    exports.decode = decode;
    exports.encode = encode;
}());

