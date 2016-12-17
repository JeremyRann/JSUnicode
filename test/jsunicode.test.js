/*global describe it */
(function (global) {
    "use strict";

    var expect, jsunicode;
    if (global.chai && global.jsunicode) {
        expect = global.chai.expect;
        jsunicode = global.jsunicode;
    }
    else {
        expect = require("chai").expect;
        jsunicode = require("../src/jsunicode");
    }

    describe("JSUnicode", function() {
        describe("UTF-16", function () {
            describe("Decode (valid)", function () {
                it("Decodes string encoded as UTF-16 in hex which includes a non-BMP character", function () {
                    var plainText = jsunicode.decode("0023D799D83DDE020024", { encoding: "UTF-16", throwOnError: true });
                    expect(plainText).to.equal("\x23\ud799\ud83d\ude02\x24");
                });
            });
            describe("Encode", function () {
                it("Encodes a string as UTF-16 in hex which includes a non-BMP character", function () {
                    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\x24", {
                        encoding: "UTF-16",
                        throwOnError: true
                    }).toUpperCase();

                    expect(encoded).to.equal("0023D799D83DDE020024");
                });
            });
        });
    });
}(this));
