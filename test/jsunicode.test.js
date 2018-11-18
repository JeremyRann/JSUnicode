/*global Uint8Array */
var test = require("tape-catch");
var isNode = require("detect-node");
var jsunicode = require("../src/jsunicode");
var jc = jsunicode.constants;
if (isNode) {
    var tapSpec = require("tap-spec");
    test.createStream()
        .pipe(tapSpec())
        .pipe(process.stdout);
}
else {
    var tapeworm = require("tape-worm");
    tapeworm.infect(test);
    // For convenience to get a jsunicode reference in the console
    // (for some reason window.jsunicode was an empty object when this was
    // loaded synchronously? Webpack UMD issue is my best guess)
    setTimeout(function () {
        window.jsunicode = jsunicode;
    }, 1);
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
    t.equal(encoded, "23ed9e99f09f9882c2b124", "Encode a string as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4");

    var plainText = jsunicode.decode("23ED9E99F09F9882C2B124", { throwOnError: true });
    t.equal(plainText, "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode a string encoded as UTF-8 in hex which includes encoded lengths of 1, 2, 3, and 4");

    t.end();
});

test("UTF-16", function (t) {
    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-16",
        throwOnError: true
    });

    t.equal(encoded, "0023d799d83dde0200b10024", "Encode a string as UTF-16 in hex which includes a non-BMP character");

    var plainText = jsunicode.decode("0023D799D83DDE0200B10024", { encoding: "UTF-16", throwOnError: true });
    t.equal(plainText, "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode a string encoded as UTF-16 in hex which includes a non-BMP character");

    encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-16LE",
        throwOnError: true
    });
    t.equal(encoded, "230099d73dd802deb1002400", "Encode a string as UTF-16 (Little Endian) in hex which includes a non-BMP character");

    plainText = jsunicode.decode("230099D73DD802DEB1002400", { encoding: "UTF-16LE", throwOnError: true });
    t.equal(plainText, "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode a string encoded as UTF-16 (Little Endian) in hex which includes a non-BMP character");

    t.end();
});

test("UTF-32", function (t) {
    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-32",
        throwOnError: true
    });

    t.equal(encoded, "000000230000d7990001f602000000b100000024", "Encode a string as UTF-32 in hex which includes a non-BMP character");

    var plainText = jsunicode.decode("000000230000D7990001F602000000B100000024", { encoding: "UTF-32", throwOnError: true });

    t.equal(plainText, "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode a string encoded as UTF-32 in hex which includes a non-BMP character");

    encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        encoding: "UTF-32LE",
        throwOnError: true
    });

    t.equal(encoded, "2300000099d7000002f60100b100000024000000", "Encode a string as UTF-32 (Little Endian) in hex which includes a non-BMP character");

    plainText = jsunicode.decode("2300000099D7000002F60100B100000024000000", { encoding: "UTF-32LE", throwOnError: true });

    t.equal(plainText, "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode a string encoded as UTF-32 (Little Endian) in hex which includes a non-BMP character");

    t.end();
});

test("Count", function (t) {
    t.equal(jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24"), 11, "Count bytes in UTF-8");
    t.equal(jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24", "UTF-16"), 12, "Count bytes in UTF-16");
    t.equal(jsunicode.countEncodedBytes("\x23\ud799\ud83d\ude02\u00b1\x24", "UTF-32"), 20, "Count bytes in UTF-32");
    t.end();
});

test("Binary representations", function (t) {
    t.equal(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { byteWriter: "base64" }), "I+2emfCfmILCsSQ=", "Encode binary as base64 (13 bytes)");
    t.equal(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1", { byteWriter: "base64" }), "I+2emfCfmILCsQ==", "Encode binary as base64 (12 bytes)");
    t.equal(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\u00b1", { byteWriter: "base64" }), "I+2emfCfmILCscKx", "Encode binary as base64 (14 bytes)");
    t.equal(jsunicode.encode("", { byteWriter: "base64" }), "", "Encode binary as base64 (empty)");

    t.deepEqual(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", { byteWriter: "byteArray" }), [0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], "Encode binary as byte array");
    t.deepEqual(jsunicode.encode("", { byteWriter: "byteArray" }), [], "Encode binary as byte array (empty)");

    t.deepEqual(Array.prototype.slice.call(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        byteWriter: "Uint8Array"
    })), [0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], "Encode binary as a Uint8Array");
    t.deepEqual(Array.prototype.slice.call(jsunicode.encode("", {
        byteWriter: "Uint8Array"
    })), [], "Encode binary as a Uint8Array (empty)");

    if (isNode) {
        t.deepEqual(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
            byteWriter: "buffer"
        }), Buffer.from([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24]), "Encode binary as a buffer");
        t.deepEqual(jsunicode.encode("", { byteWriter: "buffer" }), Buffer.from([]), "Encode binary as a buffer (empty)");
    }
    else {
        t.equal("", "", "NOTE: SKIPPED (only runs in node) Encode binary as a buffer");
        t.equal("", "", "NOTE: SKIPPED (only runs in node) Encode binary as a buffer (empty)");
    }
    

    t.equal(jsunicode.decode("I+2emfCfmILCsSQ=", { byteReader: "base64" }), "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode binary as base64 (13 bytes)");
    t.equal(jsunicode.decode("I+2emfCfmILCsQ==", { byteReader: "base64" }), "\x23\ud799\ud83d\ude02\u00b1", "Decode binary as base64 (12 bytes)");
    t.equal(jsunicode.decode("I+2emfCfmILCscKx", { byteReader: "base64" }), "\x23\ud799\ud83d\ude02\u00b1\u00b1", "Decode binary as base64 (14 bytes)");
    t.equal(jsunicode.decode("", { byteReader: "base64" }), "", "Decode binary as base64 (empty)");

    t.equal(jsunicode.decode([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], {
        byteReader: "byteArray"
    }), "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode binary as a byte array");
    t.equal(jsunicode.decode([], { byteReader: "byteArray" }), "", "Decode binary as a byte array (empty)");
    
    t.equal(jsunicode.decode(new Uint8Array([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24]), {
        byteReader: "Uint8Array"
    }), "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode binary as a Uint8Array");
    t.equal(jsunicode.decode(new Uint8Array([]), { byteReader: "Uint8Array" }), "", "Decode binary as a Uint8Array (empty)");
    
    if (isNode) {
        t.equal(jsunicode.decode(Buffer.from([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24]), {
            byteReader: "buffer"
        }), "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode binary as a buffer");
        t.equal(jsunicode.decode(Buffer.from([]), { byteReader: "buffer" }), "", "Decode binary as a buffer (empty)");
    }
    else {
        t.equal("", "", "NOTE: SKIPPED (only runs in node) Decode binary as a buffer");
        t.equal("", "", "NOTE: SKIPPED (only runs in node) Decode binary as a buffer (empty)");
    }
    
    t.equal(jsunicode.convertBytes([0x23, 0xED, 0x9E, 0x99, 0xF0, 0x9F, 0x98, 0x82, 0xC2, 0xB1, 0x24], "byteArray", "hex"), "23ed9e99f09f9882c2b124", "Convert between binary representations");

    var encoded = jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        throwOnError: true,
        byteWriterOptions: {
            upperCase: true
        }
    });
    t.equal(encoded, "23ED9E99F09F9882C2B124", "Pass an option to a byteWriter");

    jsunicode.byteReader.registerPrototype("testhex", function () {
        Object.assign(this, jsunicode.byteReader.get("hex"));
    });
    jsunicode.byteWriter.registerPrototype("testhex", function () {
        Object.assign(this, jsunicode.byteWriter.get("hex"));
    });
    t.equal(jsunicode.decode("23ed9e99f09f9882c2b124", {
        byteReader: "testhex"
    }), "\x23\ud799\ud83d\ude02\u00b1\x24", "Decode with custom byte reader");
    t.equal(jsunicode.encode("\x23\ud799\ud83d\ude02\u00b1\x24", {
        byteWriter: "testhex"
    }), "23ed9e99f09f9882c2b124", "Encode with custom byte writer");

    var peekableReader = jsunicode.createPeekableByteReader(jsunicode.byteReader.get(jc.binaryFormat.hex));
    peekableReader.begin("00102030405060");

    t.equal(peekableReader.peekByte(), 0x00, "Peek single byte");
    t.equal(peekableReader.peekByte(), 0x00, "Single peek doesn't iterate");
    peekableReader.read();
    t.equal(peekableReader.peekByte(), 0x10, "Peek single byte after read");
    t.equal(peekableReader.peekByte(), 0x10, "Single peek doesn't iterate after read");
    var peekBuffer = peekableReader.peekArray(20);
    t.deepEqual(peekBuffer, [0x10, 0x20, 0x30, 0x40, 0x50, 0x60, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null], "Peek array works");
    t.equal(peekableReader.peekByte(), 0x10, "Peek array doesn't iterate");
    
    jsunicode.byteReader.unregister("testhex");
    jsunicode.byteWriter.unregister("testhex");
    t.end();
});

test("Decode BOM handling", function (t) {
    var jsuError = jsunicode.jsunicodeError;

    t.equal(jsunicode.decode("efbbbf").length, 0, "UTF-8 BOM Ignored");
    t.equal(jsunicode.decode("feff", { encoding: jc.encoding.utf16be }).length, 0, "UTF-16BE BOM Ignored");
    t.equal(jsunicode.decode("fffe", { encoding: jc.encoding.utf16le }).length, 0, "UTF-16LE BOM Ignored");
    t.equal(jsunicode.decode("efbbbf", {
        preserveBOM: true
    }).length, 1, "UTF-8 BOM Preserved");
    t.equal(jsunicode.decode("feff", {
        encoding:jc.encoding.utf16be ,
        preserveBOM: true
    }).length, 1, "UTF-16BE BOM Preserved");
    t.equal(jsunicode.decode("fffe", {
        encoding: jc.encoding.utf16le,
        preserveBOM: true
    }).length, 1, "UTF-16LE BOM Preserved");
    t.equal(jsunicode.decode("efbbbf20"), " ", "UTF-8 BOM Autodetect");
    t.equal(jsunicode.decode("feff0020"), " ", "UTF-16BE BOM Autodetect");
    t.equal(jsunicode.decode("feff0020", {
        encoding: jc.encoding.utf16
    }), " ", "UTF-16BE BOM Autodetect (with hint)");
    t.equal(jsunicode.decode("fffe2000"), " ", "UTF-16LE BOM Autodetect");
    t.equal(jsunicode.decode("fffe2000", {
        encoding: jc.encoding.utf16
    }), " ", "UTF-16LE BOM Autodetect (with hint)");
    t.equal(jsunicode.decode("fffe2000", {
        encoding: jc.encoding.guess
    }), " ", "Explicitly specify guess encoding");
    t.equal(jsunicode.decode("feff0000"), "\u0000", "UTF-32LE BOM Ignored");
    t.equal(jsunicode.decode("0000fffe"), "\u0000\u0000\ufffd\ufffd", "UTF-32BE BOM Ignored");
    t.equal(jsunicode.decode("fffe0000", { detectUTF32BOM: true }), "", "UTF-32LE BOM Processed");
    t.equal(jsunicode.decode("0000feff", { detectUTF32BOM: true }), "", "UTF-32BE BOM Processed");
    t.equal(jsunicode.decode("fffe000020000000", {
        encoding: jc.encoding.utf32
    }), " ", "UTF-32LE BOM Auto-processed");
    t.equal(jsunicode.decode("0000feff00000020", {
        encoding: jc.encoding.utf32
    }), " ", "UTF-32BE BOM Auto-processed");
    t.throws(function () {
        jsunicode.decode("feff0020", { encoding: jc.encoding.utf16le });
    }, jsuError, "Throw on BOM mismatch");
    t.equal(jsunicode.decode("fffe0020", {
        encoding: jc.encoding.utf16be,
        BOMMismatchBehavior: jc.BOMMismatchBehavior.trustRequest
    }), " ", "Trust Request over BOM");
    t.equal(jsunicode.decode("feff0020", {
        encoding: jc.encoding.utf16le,
        BOMMismatchBehavior: jc.BOMMismatchBehavior.trustBOM
    }), " ", "Trust BOM over Request");
    t.equal(jsunicode.decode("efbbbf2000", {
        encoding: jc.encoding.utf16le,
        BOMMismatchBehavior: jc.BOMMismatchBehavior.trustRequest
    }), " ", "Trust Request over BOM with BOM size mismatch");
    t.equal(jsunicode.decode("efbbbf20", {
        encoding: jc.encoding.utf16le,
        BOMMismatchBehavior: jc.BOMMismatchBehavior.trustBOM
    }), " ", "Trust Request over BOM with BOM size mismatch");
    t.equal(jsunicode.decode("efbbbf0020", {
        encoding: jc.encoding.utf16,
        BOMMismatchBehavior: jc.BOMMismatchBehavior.trustRequest
    }), " ", "Trust Request over BOM with loosely-specified encoding");
    t.end();
});

test("Encode BOM handling", function (t) {
    t.equal(jsunicode.encode("\ufeff "), "20", "Remove BOM");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf16
    }), "0020", "Remove BOM (UTF-16BE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf16le
    }), "2000", "Remove BOM (UTF-16LE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf32
    }), "00000020", "Remove BOM (UTF-32BE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf32le
    }), "20000000", "Remove BOM (UTF-32LE)");

    t.equal(jsunicode.encode(" ", { BOMBehavior: jc.BOMBehavior.preserve }), "20", "Skip on preserve BOM");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf16,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "0020", "Skip on preserve BOM (UTF-16BE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf16le,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "2000", "Skip on preserve BOM (UTF-16LE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf32,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "00000020", "Skip on preserve BOM (UTF-32BE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf32le,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "20000000", "Skip on preserve BOM (UTF-32LE)");

    t.equal(jsunicode.encode("\ufeff ", { BOMBehavior: jc.BOMBehavior.preserve }), "efbbbf20", "Preserve BOM");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf16,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "feff0020", "Preserve BOM (UTF-16BE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf16le,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "fffe2000", "Preserve BOM (UTF-16LE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf32,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "0000feff00000020", "Preserve BOM (UTF-32BE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf32le,
        BOMBehavior: jc.BOMBehavior.preserve
    }), "fffe000020000000", "Preserve BOM (UTF-32LE)");

    t.equal(jsunicode.encode("\ufeff ", { BOMBehavior: jc.BOMBehavior.auto }), "20", "Auto add/remove BOM");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf16,
        BOMBehavior: jc.BOMBehavior.auto
    }), "feff0020", "Auto add/remove BOM (UTF-16BE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf16le,
        BOMBehavior: jc.BOMBehavior.auto
    }), "fffe2000", "Auto add/remove BOM (UTF-16LE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf32,
        BOMBehavior: jc.BOMBehavior.auto
    }), "00000020", "Auto add/remove BOM (UTF-32BE)");
    t.equal(jsunicode.encode("\ufeff ", {
        encoding: jc.encoding.utf32le,
        BOMBehavior: jc.BOMBehavior.auto
    }), "20000000", "Auto add/remove BOM (UTF-32LE)");

    t.equal(jsunicode.encode(" ", { BOMBehavior: jc.BOMBehavior.always }), "efbbbf20", "Add BOM");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf16,
        BOMBehavior: jc.BOMBehavior.always
    }), "feff0020", "Add BOM (UTF-16BE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf16le,
        BOMBehavior: jc.BOMBehavior.always
    }), "fffe2000", "Add BOM (UTF-16LE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf32,
        BOMBehavior: jc.BOMBehavior.always
    }), "0000feff00000020", "Add BOM (UTF-32BE)");
    t.equal(jsunicode.encode(" ", {
        encoding: jc.encoding.utf32le,
        BOMBehavior: jc.BOMBehavior.always
    }), "fffe000020000000", "Add BOM (UTF-32LE)");
    t.end();
});

test("Line ending conversion handling", function (t) {
    t.equal(jsunicode.decode("0a"), "\n", "Decode does not alter lf by default");
    t.equal(jsunicode.decode("0d"), "\r", "Decode does not alter cr by default");
    t.equal(jsunicode.decode("0d0a"), "\r\n", "Decode does not alter cr/lf by default");
    t.equal(jsunicode.decode("68690d0a7468657265", {
        lineEndingConversion: jc.lineEndingConversion.lf
    }), "hi\nthere", "Decode cr/lf to lf");
    t.equal(jsunicode.decode("68690d7468657265", {
        lineEndingConversion: jc.lineEndingConversion.lf
    }), "hi\nthere", "Decode cr to lf");
    t.equal(jsunicode.decode("68690a7468657265", {
        lineEndingConversion: jc.lineEndingConversion.crlf
    }), "hi\r\nthere", "Decode lf to cr/lf");
    t.equal(jsunicode.decode("68690a7468657265", {
        lineEndingConversion: jc.lineEndingConversion.cr
    }), "hi\rthere", "Decode lf to cr");

    t.equal(jsunicode.encode("\n"), "0a", "Encode does not alter lf by default");
    t.equal(jsunicode.encode("\r"), "0d", "Encode does not alter cr by default");
    t.equal(jsunicode.encode("\r\n"), "0d0a", "Encode does not alter cr/lf by default");
    t.equal(jsunicode.encode("hi\nthere", {
        lineEndingConversion: jc.lineEndingConversion.crlf
    }), "68690d0a7468657265", "Encode lf to cr/lf");
    t.equal(jsunicode.encode("hi\r\nthere", {
        lineEndingConversion: jc.lineEndingConversion.cr
    }), "68690d7468657265", "Encode cr/lf to cr");
    t.equal(jsunicode.encode("hi\nthere", {
        lineEndingConversion: jc.lineEndingConversion.cr
    }), "68690d7468657265", "Encode lf to cr");
    t.equal(jsunicode.encode("hi\r\nthere", {
        lineEndingConversion: jc.lineEndingConversion.lf
    }), "68690a7468657265", "Encode cr/lf to lf");
    t.equal(jsunicode.encode("hi\rthere", {
        lineEndingConversion: jc.lineEndingConversion.lf
    }), "68690a7468657265", "Encode cr to lf");
    t.end();
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

    t.throws(function () {
        jsunicode.decode(0, { byteReader: "hex" });
    }, /Invalid data type/, "Throw on decode non-string hex");
    t.throws(function () {
        jsunicode.decode(0, { byteReader: "buffer" });
    }, /Invalid data type/, "Throw on decode non-string buffer");
    t.throws(function () {
        jsunicode.decode(0, { byteReader: "byteArray" });
    }, /Invalid data type/, "Throw on decode non-string byteArray");
    t.throws(function () {
        jsunicode.decode(0, { byteReader: "Uint8Array" });
    }, /Invalid data type/, "Throw on decode non-string Uint8Array");
    t.throws(function () {
        jsunicode.decode(0, { byteReader: "base64" });
    }, /Invalid data type/, "Throw on decode non-string base64");
    t.throws(function () {
        jsunicode.encode(0);
    }, /Invalid data type/, "Throw on encode non-string");

    t.throws(function () {
        jsunicode.decode([-1], { byteReader: "byteArray", throwOnError: true });
    }, jsuError, "Throw on negative byte");
    t.throws(function () {
        jsunicode.decode([0, -1], { byteReader: "byteArray", encoding: "UTF-16", throwOnError: true });
    }, jsuError, "Throw on negative byte (UTF-16)");
    t.throws(function () {
        jsunicode.decode([0, 0, 0, -1], { byteReader: "byteArray", encoding: "UTF-32", throwOnError: true });
    }, jsuError, "Throw on negative byte (UTF-32)");
    t.throws(function () {
        jsunicode.decode([0x100], { byteReader: "byteArray", throwOnError: true });
    }, jsuError, "Throw on byte > 255");
    t.throws(function () {
        jsunicode.decode([0, 0x100], { byteReader: "byteArray", encoding: "UTF-16", throwOnError: true });
    }, jsuError, "Throw on byte > 255 (UTF-16)");
    t.throws(function () {
        jsunicode.decode([0, 0, 0, 0x100], { byteReader: "byteArray", encoding: "UTF-32", throwOnError: true });
    }, jsuError, "Throw on byte > 255 (UTF-32)");

    t.equal(jsunicode.decode([-1], {
        byteReader: "byteArray"
    }), "\ufffd", "Unknown character on negative byte");
    t.equal(jsunicode.decode([0, -1], {
        byteReader: "byteArray",
        encoding: "UTF-16"
    }), "\ufffd", "Unknown character on negative byte (UTF-16)");
    t.equal(jsunicode.decode([0, 0, 0, -1], {
        byteReader: "byteArray",
        encoding: "UTF-32"
    }), "\ufffd", "Unknown character on negative byte (UTF-32)");
    t.equal(jsunicode.decode([0x100], {
        byteReader: "byteArray"
    }), "\ufffd", "Unknown character on byte > 255");
    t.equal(jsunicode.decode([0, 0x100], {
        byteReader: "byteArray",
        encoding: "UTF-16"
    }), "\ufffd", "Unknown character on byte > 255 (UTF-16)");
    t.equal(jsunicode.decode([0, 0, 0, 0x100], {
        byteReader: "byteArray",
        encoding: "UTF-32"
    }), "\ufffd", "Unknown character on byte > 255 (UTF-32)");
    t.equal(jsunicode.decode("2020feff"), "  \ufffd\ufffd", "Unknown character on bad high byte");

    t.end();
});

test("Validation", function (t) {
    t.equal(jsunicode.validate("2020").isValid, true, "Validation passess for valid string");
    t.equal(jsunicode.validate("2020feff").isValid, false, "Validation catches bad high byte");
    t.equal(jsunicode.validate("feff0020", { encoding: jc.encoding.utf16le }).isValid, false, "Validation catches error condition");
    t.throws(function () {
        jsunicode.decode("2020", { validate: 1 });
    }, jsunicode.jsunicodeError, "Validation setting must be boolean");
});

