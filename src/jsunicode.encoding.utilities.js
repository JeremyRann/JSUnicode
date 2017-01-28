/*
The MIT License (MIT)
Copyright (c) 2016 Jeremy Rann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var jsuError = require("./jsunicode.error");

// This polyfill is necessary for browsers without String.fromCodePoint (sigh)
// I suppose I could just use the fromCharCode option always, but I'm a bit worried that
// at some point a JavaScript implementation will complain that fromCharCode is nonsense
// for a low surrogate value (in other words, String.fromCharCode(0xde02) doesn't really
// make sense)
var fromCodePoint = function (highSurrogate, lowSurrogate) {
    var codePoint;
    // In this case, only one argument was passed in, which is the code point
    if (lowSurrogate === undefined) {
        codePoint = highSurrogate;
        if (String.hasOwnProperty("fromCodePoint")) {
            return String.fromCodePoint(codePoint);
        }
        else {
            if (codePoint >= 0x10000) {
                var basis = codePoint - 0x10000;
                highSurrogate = 0xd800 + (basis >> 10);
                lowSurrogate = 0xdc00 + (basis & 0x3ff);
                return String.fromCharCode(highSurrogate) + String.fromCharCode(lowSurrogate);
            }
            else {
                return String.fromCharCode(codePoint);
            }
        }
    }
    else { // Otherwise, we have a surrogate pair
        if (String.hasOwnProperty("fromCodePoint")) {
            codePoint = 0x10000 + ((highSurrogate - 0xD800) << 10) + (lowSurrogate - 0xDC00);
            return String.fromCodePoint(codePoint);
        }
        else {
            return String.fromCharCode(highSurrogate) + String.fromCharCode(lowSurrogate);
        }
    }
};

var validateCodePoint = function (codePoint) {
    if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
        return false;
    }
    else if (codePoint > 0x10ffff) {
        return false;
    }

    return true;
};

var errorString = function (err, throwOnError) {
    if (throwOnError === true) {
        throw new jsuError(err);
    }
    else if (throwOnError === false) {
        return "\ufffd";
    }
    else {
        // Throw Error instead of jsuError since this is a "should never happen" error
        throw new Error("throwOnError argument required");
    }
};

exports.fromCodePoint = fromCodePoint;
exports.errorString = errorString;
exports.validateCodePoint = validateCodePoint;

