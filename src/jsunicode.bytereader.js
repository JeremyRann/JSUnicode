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

