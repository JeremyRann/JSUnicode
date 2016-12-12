/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";
    var byteReaders = {};

    var register = function (name, byteReader) {
        byteReaders[name] = byteReader;
    };

    register("hex", function () {
        var inpString;
        var index;

        var begin = function (value) {
            inpString = value;
            index = 0;
        };

        var read = function () {
            if (index >= inpString.length) {
                return null;
            }

            var currentByte = parseInt(inpString.substring(index, index + 2), 16);
            index = index + 2;
            return currentByte;
        };

        return {
            begin: begin,
            read: read
        };
    });

    var get = function (name) {
        var reader = byteReaders[name];
        if (typeof(reader) === "function") {
            return reader();
        }
        else {
            return reader;
        }
    };

    exports.register = register;
    exports.get = get;
}());

