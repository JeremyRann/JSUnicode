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
        describe("Decode UTF-16", function () {
            it("Decodes string encoded as UTF-16 in hex", function () {
                var plainText = jsunicode.decodeUtf16("hex", "0020");
                expect(plainText).to.equal(" ");
            });
        });
    });
}(this));
