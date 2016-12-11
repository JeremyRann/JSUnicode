(function () {
    "use strict";
    var byteReader = require("./jsunicode.bytereader");

    var decodeUtf16 = function (byteReaderName, inpBytes) {
        if (inpBytes === null || inpBytes === undefined) {
            return inpBytes;
        }

        var reader = byteReader.get(byteReaderName);
        reader.begin(inpBytes);

        var resultBuilder = [];
        var firstByte = reader.read();
        var secondByte = reader.read();
        var codePoint;
        while (firstByte !== null) {
            codePoint = firstByte * 0x100 + secondByte;
            resultBuilder.push(String.fromCodePoint(codePoint));
            firstByte = reader.read();
            secondByte = reader.read();
        }

        return resultBuilder.join("");
    };

    exports.decodeUtf16 = decodeUtf16;
    exports.byteReader = byteReader;
}());

