var encUtil = require("./jsunicode.encoding.utilities");
var constants = require("./jsunicode.constants");

var decode = function (reader, options) {
    var textBuilder = encUtil.textBuilder(options.throwOnError, options.lineEndingConversion, options.validate);
    var isLittleEndian = false;

    if (options.encoding === constants.encoding.utf32le || options.isLittleEndian) {
        isLittleEndian = true;
    }

    var bytes = [reader.read(), reader.read(), reader.read(), reader.read()];

    while (bytes[0] !== null) {
        if (bytes[1] === null || bytes[2] === null || bytes[3] === null) {
            textBuilder.addError("Unexpected end of input");
        }
        else if (bytes[0] < 0 || bytes[1] < 0 || bytes[2] < 0 || bytes[3] < 0 ||
                bytes[0] > 0xff || bytes[1] > 0xff || bytes[2] > 0xff || bytes[3] > 0xff) {
            textBuilder.addError("Invalid byte");
        }
        else {
            var codePoint;
            if (isLittleEndian) {
                codePoint = ((bytes[3] << 24) >>> 0) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
            }
            else {
                codePoint = ((bytes[0] << 24) >>> 0) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
            }

            textBuilder.addCodePoint(codePoint);
        }

        bytes = [reader.read(), reader.read(), reader.read(), reader.read()];
    }

    return textBuilder.getResult();
};

var encode = function (codePoints, writer, options) {
    var isLittleEndian = false;

    if (options.encoding === constants.encoding.utf32le || options.isLittleEndian) {
        isLittleEndian = true;
    }

    for (var i = 0; i < codePoints.length; i++) {
        var codePoint = codePoints[i];
        if (isLittleEndian) {
            writer.write(codePoint & 0xff);
            writer.write((codePoint & 0xff00) >> 8);
            writer.write((codePoint & 0xff0000) >> 16);
            writer.write((codePoint & 0xff000000) >>> 24);
        }
        else {
            writer.write((codePoint & 0xff000000) >>> 24);
            writer.write((codePoint & 0xff0000) >> 16);
            writer.write((codePoint & 0xff00) >> 8);
            writer.write(codePoint & 0xff);
        }
    }
};

exports.decode = decode;
exports.encode = encode;

