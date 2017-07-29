var test = require("tape-catch");
var isNode = require("detect-node");
var jsunicode = require("../src/jsunicode");

if (isNode) {
    var tapSpec = require("tap-spec");
    test.createStream()
        .pipe(tapSpec())
        .pipe(process.stdout);
}
else {
    var tapeworm = require("tape-worm");
    tapeworm.infect(test);
}

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

test("UTF-8", function (t) {
    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { throwOnError: true });
    t.equal("23ed9e99f09f9882c2b124", encoded, "Encode a string as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4");

    var plainText = jsunicode.decode("23ED9E99F09F9882C2B124", { throwOnError: true });
    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", plainText, "Decode a string encoded as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4");

    t.end();
});

test("UTF-16", function (t) {
    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-16",
        throwOnError: true
    });

    t.equal("0023d799d83dde0200b10024", encoded, "Encode a string as UTF-16 in hex which includes a non-BMP character");

    var plainText = jsunicode.decode("0023D799D83DDE0200B10024", { encoding: "UTF-16", throwOnError: true });
    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", plainText, "Decode a string encoded as UTF-16 in hex which includes a non-BMP character");

    encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-16LE",
        throwOnError: true
    });
    t.equal("230099d73dd802deb1002400", encoded, "Encode a string as UTF-16 (Little Endian) in hex which includes a non-BMP character");

    plainText = jsunicode.decode("230099D73DD802DEB1002400", { encoding: "UTF-16LE", throwOnError: true });
    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", plainText, "Decode a string encoded as UTF-16 (Little Endian) in hex which includes a non-BMP character");

    t.end();
});

test("UTF-32", function (t) {
    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-32",
        throwOnError: true
    });

    t.equal("000000230000d7990001f602000000b100000024", encoded, "Encode a string as UTF-32 in hex which includes a non-BMP character");

    var plainText = jsunicode.decode("000000230000D7990001F602000000B100000024", { encoding: "UTF-32", throwOnError: true });

    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", plainText, "Decode a string encoded as UTF-32 in hex which includes a non-BMP character");

    encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-32LE",
        throwOnError: true
    });

    t.equal("2300000099d7000002f60100b100000024000000", encoded, "Encode a string as UTF-32 (Little Endian) in hex which includes a non-BMP character");

    plainText = jsunicode.decode("2300000099D7000002F60100B100000024000000", { encoding: "UTF-32LE", throwOnError: true });

    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", plainText, "Decode a string encoded as UTF-32 (Little Endian) in hex which includes a non-BMP character");

    t.end();
});

test("Count", function (t) {
    t.equal(11, jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24"), "Count bytes in UTF-8");
    t.equal(12, jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24", "UTF-16"), "Count bytes in UTF-16");
    t.equal(20, jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24", "UTF-32"), "Count bytes in UTF-32");
    t.end();
});

test("Binary representations", function (t) {
    t.equal("I+2emfCfmILCsSQ=", jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { byteWriter: "base64" }), "Encode binary as base64 (13 bytes)");
    t.equal("I+2emfCfmILCsQ==", jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1", { byteWriter: "base64" }), "Encode binary as base64 (12 bytes)");
    t.equal("I+2emfCfmILCscKx", jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\u00b1", { byteWriter: "base64" }), "Encode binary as base64 (14 bytes)");
    t.equal("", jsunicode.encode("", { byteWriter: "base64" }), "Encode binary as base64 (empty)");

    t.deepEqual([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { byteWriter: "byteArray" }), "Encode binary as byte array");
    t.deepEqual([], jsunicode.encode("", { byteWriter: "byteArray" }), "Encode binary as byte array (empty)");

    t.deepEqual([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], Array.prototype.slice.call(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        byteWriter: "Uint8Array"
    })), "Encode binary as a Uint8Array");
    t.deepEqual([], Array.prototype.slice.call(jsunicode.encode("", {
        byteWriter: "Uint8Array"
    })), "Encode binary as a Uint8Array (empty)");

    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", jsunicode.decode("I+2emfCfmILCsSQ=", { byteReader: "base64" }), "Decode binary as base64 (13 bytes)");
    t.equal("\x23\ud799\ud83d\ude02\u00b1", jsunicode.decode("I+2emfCfmILCsQ==", { byteReader: "base64" }), "Decode binary as base64 (12 bytes)");
    t.equal("\x23\ud799\ud83d\ude02\u00b1\u00b1", jsunicode.decode("I+2emfCfmILCscKx", { byteReader: "base64" }), "Decode binary as base64 (14 bytes)");
    t.equal("", jsunicode.decode("", { byteReader: "base64" }), "Decode binary as base64 (empty)");

    t.equal("\x23\ud799\ud83d\ude02\u00b1\x24", jsunicode.decode([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], {
        byteReader: "byteArray"
    }), "Decode binary as a byte array");
    t.equal("", jsunicode.decode([], { byteReader: "byteArray" }), "Decode binary as a byte array (empty)");
    
    t.equal("23ed9e99f09f9882c2b124", jsunicode.convertBytes([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], "byteArray", "hex"), "Convert between binary representations");
    t.end();

    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        throwOnError: true, byteWriterOptions: {
            upperCase: true
        }
    });
    t.equal("23ED9E99F09F9882C2B124", encoded, "Pass an option to a byteWriter");
});

test("Error handling", function (t) {
    var jsuError = jsunicode.jsunicodeError;

    t.throws(function () {
        jsunicode.decode(null, { encoding: "bogus" });
    }, jsuError, "Decode throw when invalid byteReader settings are specified (encoding)");
    t.throws(function () {
        jsunicode.decode(null, { byteReader: "bogus" });
    }, jsuError, "Decode throw when invalid byteReader settings are specified (byteReader)");
    t.throws(function () {
        jsunicode.encode(null, { encoding: "bogus" });
    }, jsuError, "Encode throw when invalid byteWriter settings are specified (encoding)");
    t.throws(function () {
        jsunicode.encode(null, { byteWriter: "bogus" });
    }, jsuError, "Encode throw when invalid byteWriter settings are specified (byteWriter)");

    t.throws(function () {
        var reader = jsunicode.byteReader.get("hex");
        reader.begin("010");
    }, jsuError, "Throw on invalid hex decoding (char count)");
    t.throws(function () {
        var reader = jsunicode.byteReader.get("hex");
        reader.begin("zz");
        reader.read();
    }, jsuError, "Throw on invalid hex decoding (bad char)");

    t.throws(function () {
        jsunicode.decode("ab", { byteReader: "base64" });
    }, jsuError, "Throw on invalid base64 decoding (char count)");
    t.throws(function () {
        jsunicode.decode("a=bb", { byteReader: "base64" });
    }, jsuError, "Throw on invalid base64 decoding (wrong position)");
    t.throws(function () {
        jsunicode.decode("~123", { byteReader: "base64" });
    }, jsuError, "Throw on invalid base64 decoding (bad char)");
    t.throws(function () {
        jsunicode.decode("eda0bd", { throwOnError: true, allowEncodedSurrogatePair: true });
    }, jsuError, "Throw on invalid base64 decoding (bad encoded surrogate pair)");

    t.throws(function () {
        var writer = jsunicode.byteWriter.get("hex");
        writer.write(256);
    }, jsuError, "Throw on invalid byte in binary input");

    t.throws(function () {
        jsunicode.decode("ff", { throwOnError: true });
    }, jsuError, "Throw on invalid UTF-8 decoding (bad leading byte)");
    t.throws(function () {
        jsunicode.decode("e0", { throwOnError: true });
    }, jsuError, "Throw on invalid UTF-8 decoding (missing trailing byte)");
    t.throws(function () {
        jsunicode.decode("e0e0", { throwOnError: true });
    }, jsuError, "Throw on invalid UTF-8 decoding (bad trailing byte)");
    t.throws(function () {
        jsunicode.decode("f58fbfbf", { throwOnError: true });
    }, jsuError, "Throw on invalid UTF-8 decoding (bad code point)");

    t.throws(function () {
        jsunicode.decode("01", { encoding: "UTF-16", throwOnError: true });
    }, jsuError, "Throw on invalid UTF-16 decoding (bad byte count)");
    t.throws(function () {
        jsunicode.decode("d83d0001", { encoding: "UTF-16", throwOnError: true });
    }, jsuError, "Throw on invalid UTF-16 decoding (bad trailing byte)");
    t.throws(function () {
        jsunicode.decode("d83d", { encoding: "UTF-16", throwOnError: true });
    }, jsuError, "Throw on invalid UTF-16 decoding (missing trailing byte)");
    t.throws(function () {
        jsunicode.decode("dc00", { encoding: "UTF-16", throwOnError: true });
    }, jsuError, "Throw on invalid UTF-16 decoding (bad leading byte)");

    t.throws(function () {
        jsunicode.decode("01", { encoding: "UTF-32", throwOnError: true });
    }, jsuError, "Throw on invalid UTF-32 decoding (bad byte count)");

    t.throws(function () {
        jsunicode.encode("\ud800 ", { encoding: "UTF-8", throwOnError: true });
    }, jsuError, "Throw on invalid strings during encoding (bad trailing byte)");
    t.throws(function () {
        jsunicode.encode("\ud800", { encoding: "UTF-8", throwOnError: true });
    }, jsuError, "Throw on invalid strings during encoding (missing trailing byte)");
    t.throws(function () {
        jsunicode.encode("\ud800\ud800", { encoding: "UTF-8", throwOnError: true });
    }, jsuError, "Throw on invalid strings during encoding (double leading byte)");
    t.throws(function () {
        jsunicode.encode("\udc00", { encoding: "UTF-8", throwOnError: true });
    }, jsuError, "Throw on invalid strings during encoding (missing leading byte)");

    t.end();
});

