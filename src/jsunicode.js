/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";

    var encodings = require("./jsunicode.encodings");
    var utf32 = require("./jsunicode.encoding.utf32");
    var utf16 = require("./jsunicode.encoding.utf16");
    var utf8 = require("./jsunicode.encoding.utf8");
    var byteReader = require("./jsunicode.bytereader");

    encodings.register("UTF-8", utf8);
    encodings.register("UTF-16", utf16);
    encodings.register("UTF-16BE", utf16);
    encodings.register("UTF-16LE", utf16);
    encodings.register("UTF-32", utf32);
    encodings.register("UTF-32BE", utf32);
    encodings.register("UTF-32LE", utf32);

    var countEncodedBytes = function (inpString, encoding) {
        if (encoding === undefined) {
            encoding = "UTF-8";
        }

        var result = encodings.encode(inpString, { encoding: encoding, byteWriter: "count", throwOnError: true });

        return result;
    };

    exports.decode = encodings.decode;
    exports.encode = encodings.encode;
    exports.byteReader = byteReader;
    exports.countEncodedBytes = countEncodedBytes;
}());

