var jsuError = require("./jsunicode.error");
var constants = require("./jsunicode.constants");

var textBuilder = function (throwOnError, lineEndingConversion, validate) {
    var textBuilderResult;
    var isValid = true;
    if (validate) {
        textBuilderResult = {};
    }
    else {
        textBuilderResult = [];
    }
    if (throwOnError !== true && throwOnError !== false) {
        // Throw Error instead of jsuError since this is a "should never happen" error
        throw new Error("throwOnError argument required");
    }

    var validateCodePoint = function (codePoint) {
        if (codePoint < 0) {
            return false;
        }
        else if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
            return false;
        }
        else if (codePoint > 0x10ffff) {
            return false;
        }

        return true;
    };

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

    var addError = function (err) {
        if (validate) {
            textBuilderResult[err] = textBuilderResult[err] || 0;
            textBuilderResult[err]++;
            isValid = false;
        }
        else if (throwOnError) {
            throw new jsuError(err);
        }
        else {
            textBuilderResult.push("\ufffd");
        }
    };

    var addCodePoint = function (highSurrogate, lowSurrogate) {
        if (!validate) {
            textBuilderResult.push(fromCodePoint(highSurrogate, lowSurrogate));
        }
    };

    var getResult = function () {
        if (validate) {
            return {
                isValid: isValid,
                exception: false,
                errors: textBuilderResult
            };
        }

        var stringResult = [];
        var i;
        switch (lineEndingConversion) {
            case constants.lineEndingConversion.none:
                stringResult = textBuilderResult;
                break;
            case constants.lineEndingConversion.lf:
                for (i = 0; i < textBuilderResult.length; i++) {
                    if (textBuilderResult[i] === "\r") {
                        if (textBuilderResult[i + 1] !== "\n") {
                            stringResult.push("\n");
                        }
                    }
                    else {
                        stringResult.push(textBuilderResult[i]);
                    }
                }
                break;
            case constants.lineEndingConversion.cr:
                for (i = 0; i < textBuilderResult.length; i++) {
                    if (textBuilderResult[i] === "\n") {
                        if (textBuilderResult[i - 1] !== "\r") {
                            stringResult.push("\r");
                        }
                    }
                    else {
                        stringResult.push(textBuilderResult[i]);
                    }
                }
                break;
            case constants.lineEndingConversion.crlf:
                for (i = 0; i < textBuilderResult.length; i++) {
                    if (textBuilderResult[i] === "\n") {
                        if (textBuilderResult[i - 1] !== "\r") {
                            stringResult.push("\r");
                            stringResult.push("\n");
                        }
                    }
                    else if (textBuilderResult[i] === "\r") {
                        if (textBuilderResult[i + 1] !== "\n") {
                            stringResult.push("\r");
                            stringResult.push("\n");
                        }
                    }
                    else {
                        stringResult.push(textBuilderResult[i]);
                    }
                }
                break;
            default:
                throw new Error("Unrecognized lineEndingConversion option");
        }

        return stringResult.join("");
    };

    return {
        addError: addError,
        addCodePoint: addCodePoint,
        validateCodePoint: validateCodePoint,
        getResult: getResult
    };
};

exports.textBuilder = textBuilder;

