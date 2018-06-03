module.exports = {
    binaryFormat: {
        hex: "hex",
        buffer: "buffer",
        byteArray: "byteArray",
        Uint8Array: "Uint8Array",
        base64: "base64",
        count: "count"
    },
    encoding: {
        guess: "guess",
        utf8: "UTF-8",
        utf16: "UTF-16",
        utf16be: "UTF-16BE",
        utf16le: "UTF-16LE",
        utf32: "UTF-32",
        utf32be: "UTF-32BE",
        utf32le: "UTF-32LE"
    },
    BOMMismatchBehavior: {
        trustRequest: "trustRequest",
        "throw": "throw",
        trustBOM: "trustBOM",
    }
};
