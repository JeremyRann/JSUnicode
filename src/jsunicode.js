/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";
    /* Roadmap: For a first pass, the basic functions will be:
    encode(string, options)
    decode(bytes, options)
    countEncodedBytes(string, encoding, byteReader)
    byteReader.Get(name)
    byteReader.Register(name, byteReader)
    byteWriter.Get(name)
    byteWriter.Register(name, byteReader)
    
    Supported encodings will be:
    UTF-8
    UTF-16BE
    UTF-16LE
    UTF-16 (assumed BE)
    
    Supported byte readers/writers will be:
    hex
    base64
    byteArray

    Encode/Decode options:
    encoding (default UTF-8)
    byteReader/byteWriter (default hex)
    throwOnError (default false)
    */
    var encodings = require("./jsunicode.encodings");
    var utf16 = require("./jsunicode.encoding.utf16");
    var byteReader = require("./jsunicode.bytereader");

    encodings.register("UTF-16", utf16);
    encodings.register("UTF-16BE", utf16);

    exports.decode = encodings.decode;
    exports.encode = encodings.encode;
    exports.byteReader = byteReader;
}());

