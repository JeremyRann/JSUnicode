/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    "use strict";
    var byteWriters = {};

    var register = function (name, byteWriter) {
        byteWriters[name] = byteWriter;
    };

    register("hex", function () {
        var bytes = [];

        var write = function (currentByte) {
            if (typeof(currentByte) !== "number" || currentByte < 0 || currentByte > 255) {
                throw "Invalid byte";
            }

            if (currentByte === 0) {
                bytes.push("00");
            }
            else {
                var result = currentByte.toString(16);
                if (result.length < 2) {
                    result = "0" + result;
                }
                bytes.push(result);
            }
        };

        var finish = function () {
            return bytes.join("");
        };

        return {
            write: write,
            finish: finish
        };
    });

    register("count", function () {
        var byteCount = 0;
        var write = function (currentByte) {
            if (typeof(currentByte) !== "number" || currentByte < 0 || currentByte > 255) {
                throw "Invalid byte";
            }

            byteCount++;
        };

        var finish = function () {
            return byteCount;
        };

        return {
            write: write,
            finish: finish
        };
    });

    var get = function (name) {
        var writer = byteWriters[name];
        if (typeof(writer) === "function") {
            return writer();
        }
        else {
            return writer;
        }
    };

    exports.register = register;
    exports.get = get;
}());


