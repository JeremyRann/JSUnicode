/*global describe it */
(function (global) {
    "use strict";

    /* I find C# to have a useful reference implementation of unicode. Here's some example code for encode/decode:
    var sourceString = "\x23\ud799\U0001f602\u00b1\x24";
    var result = new StringBuilder();

    result.AppendLine("Encode UTF-8");
    result.AppendLine(String.Join(", ", Encoding.UTF8.GetBytes(sourceString).Select(b => "0x" + b.ToString("X2"))));
    result.AppendLine("Decode UTF-8");
    result.AppendLine(Encoding.UTF8.GetString(new byte[] { 0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24 }));
    result.AppendLine("Encode UTF-16 (BE, default)");
    result.AppendLine(String.Join(", ", Encoding.BigEndianUnicode.GetBytes(sourceString).Select(b => "0x" + b.ToString("X2"))));
    result.AppendLine("Decode UTF-16 (BE, default)");
    result.AppendLine(Encoding.BigEndianUnicode.GetString(new byte[] { 0x00, 0x23, 0xD7, 0x99, 0xD8, 0x3D, 0xDE, 0x02, 0x00, 0xB1, 0x00, 0x24 }));
    result.AppendLine("Encode UTF-16 (LE)");
    result.AppendLine(String.Join(", ", Encoding.Unicode.GetBytes(sourceString).Select(b => "0x" + b.ToString("X2"))));
    result.AppendLine("Decode UTF-16 (LE)");
    result.AppendLine(Encoding.Unicode.GetString(new byte[] { 0x23, 0x00, 0x99, 0xD7, 0x3D, 0xD8, 0x02, 0xDE, 0xB1, 0x00, 0x24, 0x00 }));
    result.AppendLine("Encode UTF-32 (BE, default)");
    result.AppendLine(String.Join(", ", (new UTF32Encoding(true, false)).GetBytes(sourceString).Select(b => "0x" + b.ToString("X2"))));
    result.AppendLine("Decode UTF-32 (BE, default)");
    result.AppendLine((new UTF32Encoding(true, false)).GetString(new byte[] { 0x00, 0x00, 0x00, 0x23, 0x00, 0x00, 0xD7, 0x99, 0x00, 0x01, 0xF6, 0x02, 0x00, 0x00, 0x00, 0xB1, 0x00, 0x00, 0x00, 0x24 }));
    result.AppendLine("Encode UTF-32 (LE)");
    result.AppendLine(String.Join(", ", Encoding.UTF32.GetBytes(sourceString).Select(b => "0x" + b.ToString("X2"))));
    result.AppendLine("Decode UTF-32 (LE)");
    result.AppendLine(Encoding.UTF32.GetString(new byte[] { 0x23, 0x00, 0x00, 0x00, 0x99, 0xD7, 0x00, 0x00, 0x02, 0xF6, 0x01, 0x00, 0xB1, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x00 }));
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
            it("Encodes a string as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4", function () {
                var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { throwOnError: true }).toUpperCase();
                expect(encoded).to.equal("23ED9E99F09F9882C2B124");
            });
            it("Decodes a string encoded as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4", function () {
                var plainText = jsunicode.decode("23ED9E99F09F9882C2B124", { throwOnError: true });
                expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
            });
        });
        describe("UTF-16", function () {
            it("Encodes a string as UTF-16 in hex which includes a non-BMP character", function () {
                var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
                    encoding: "UTF-16",
                    throwOnError: true
                }).toUpperCase();

                expect(encoded).to.equal("0023D799D83DDE0200B10024");
            });
            it("Decodes a string encoded as UTF-16 in hex which includes a non-BMP character", function () {
                var plainText = jsunicode.decode("0023D799D83DDE0200B10024", { encoding: "UTF-16", throwOnError: true });
                expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
            });
            it("Encodes a string as UTF-16 (Little Endian) in hex which includes a non-BMP character", function () {
                var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
                    encoding: "UTF-16LE",
                    throwOnError: true
                }).toUpperCase();

                expect(encoded).to.equal("230099D73DD802DEB1002400");
            });
            it("Decodes a string encoded as UTF-16 (Little Endian) in hex which includes a non-BMP character", function () {
                var plainText = jsunicode.decode("230099D73DD802DEB1002400", { encoding: "UTF-16LE", throwOnError: true });
                expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
            });
        });
        describe("UTF-32", function () {
            it("Encodes a string as UTF-32 in hex which includes a non-BMP character", function () {
                var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
                    encoding: "UTF-32",
                    throwOnError: true
                }).toUpperCase();

                expect(encoded).to.equal("000000230000D7990001F602000000B100000024");
            });
            it("Decodes a string encoded as UTF-32 in hex which includes a non-BMP character", function () {
                var plainText = jsunicode.decode("000000230000D7990001F602000000B100000024", { encoding: "UTF-32", throwOnError: true });
                expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
            });
            it("Encodes a string as UTF-32 (Little Endian) in hex which includes a non-BMP character", function () {
                var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
                    encoding: "UTF-32LE",
                    throwOnError: true
                }).toUpperCase();

                expect(encoded).to.equal("2300000099D7000002F60100B100000024000000");
            });
            it("Decodes a string encoded as UTF-32 (Little Endian) in hex which includes a non-BMP character", function () {
                var plainText = jsunicode.decode("2300000099D7000002F60100B100000024000000", { encoding: "UTF-32LE", throwOnError: true });
                expect(plainText).to.equal("\x23\ud799\ud83d\ude02\u00b1\x24");
            });
        });
        describe("Count", function () {
            it("Counts bytes in UTF-8", function () {
                expect(jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24")).to.equal(11);
            });
            it("Counts bytes in UTF-16", function () {
                expect(jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24", "UTF-16")).to.equal(12);
            });
            it("Counts bytes in UTF-32", function () {
                expect(jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24", "UTF-32")).to.equal(20);
            });
        });
    });
}(this));
