/*global describe it */
(function (global) {
    "use strict";

    /* I find C# to have a useful reference implementation of unicode. Here's how to encode/decode:
        // Encode UTF-8
        Console.WriteLine(String.Join(", ", Encoding.UTF8.GetBytes("\x23\ud799\ud83d\ude02\u00b1\x24").Select(b => "0x" + b.ToString("X2"))));
        // Decode UTF-8
        Console.WriteLine(Encoding.UTF8.GetString(new byte[] { 0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24 }));
        // Encode UTF-16 (BE, the sane default)
        Console.WriteLine(String.Join(", ", Encoding.BigEndianUnicode.GetBytes("\x23\ud799\ud83d\ude02\u00b1\x24").Select(b => "0x" + b.ToString("X2"))));
        // Decode UTF-16 (BE, the sane default)
        Console.WriteLine(Encoding.BigEndianUnicode.GetString(new byte[] { 0x00, 0x23, 0xD7, 0x99, 0xD8, 0x3D, 0xDE, 0x02, 0x00, 0xB1, 0x00, 0x24 }));
        // Encode UTF-16 (LE)
        Console.WriteLine(String.Join(", ", Encoding.Unicode.GetBytes("\x23\ud799\ud83d\ude02\u00b1\x24").Select(b => "0x" + b.ToString("X2"))));
        // Decode UTF-16 (LE)
        Console.WriteLine(Encoding.Unicode.GetString(new byte[] { 0x23, 0x00, 0x99, 0xD7, 0x3D, 0xD8, 0x02, 0xDE, 0xB1, 0x00, 0x24, 0x00 }));
    */
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
        describe("UTF-8", function () {
            describe("Encode", function () {
                it("Encodes a string as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4", function () {
                    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { throwOnError: true }).toUpperCase();
                    expect(encoded).to.equal("23ED9E99F09F9882C2B124");
                });
            });
            describe("Decode (valid)", function () {
                it("Decodes a string encoded as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4", function () {
                    var plainText = jsunicode.decode("23ED9E99F09F9882C2B124", { throwOnError: true });
                    expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
                });
            });
        });
        describe("UTF-16", function () {
            describe("Encode", function () {
                it("Encodes a string as UTF-16 in hex which includes a non-BMP character", function () {
                    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
                        encoding: "UTF-16",
                        throwOnError: true
                    }).toUpperCase();

                    expect(encoded).to.equal("0023D799D83DDE0200B10024");
                });
            });
            describe("Decode (valid)", function () {
                it("Decodes a string encoded as UTF-16 in hex which includes a non-BMP character", function () {
                    var plainText = jsunicode.decode("0023D799D83DDE0200B10024", { encoding: "UTF-16", throwOnError: true });
                    expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
                });
            });
        });
    });
}(this));
