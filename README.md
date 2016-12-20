# JSUnicode
JSUnicode is a unicode library for JavaScript. There are two scenarios this was primarily written to support:
1. UTF-8 encoded data must be stored in a database and the client should validate the byte length before submitting to a server
2. A string must be encoded as binary before being encrypted

## Usage
JSUnicode uses [Webpack's](https://webpack.github.io/) UMD output, so it is possible to use JSUnicode from within [NodeJS](https://nodejs.org/en/), in a browser with AMD (such as [requirejs](http://requirejs.org/), or in a browser without any module loading (a global variable named "jsunicode" is created in that case).
### Couting bytes
Once you have a jsunicode object, you can count encoded bytes with:
```javascript
jsunicode.countEncodedBytes([inpString], [encoding]);
```
Where inpString is the string you want to count and encoding is an optional string argument specifying the Unicode encoding you're using ("UTF-8" is the default, but "UTF-16" and "UTF-32" are also supported). For example:
```javascript
jsunicode.countEncodedBytes("\ud799"); // Returns 3 for UTF-8 encoding
jsunicode.countEncodedBytes("\ud799", "UTF-16"); // Returns 2 for UTF-16 encoding
```
### Encoding
The jsunicode object has an encode function:
```javascript
jsunicode.encode([inpString], [options]);
```
Where inpString is the string you wish to encode and options is an optional object specifying more detail about the encoding. The options object supports the following members:
* encoding: A string specifying the Unicode encoding variant to use. Default is "UTF-8". Supported values are:
    * UTF-8
    * UTF-16 (defaults to Big Endian)
    * UTF-16BE
    * UTF-16LE
    * UTF-32 (defaults to Big Endian)
    * UTF-32BE
    * UTF-32LE
* byteWriter: A string describing how jsunicode should output the bytes. Default is "hex". It is possible to add new byteWriters (see "Registering byteWriters" below). Supported values are:
    * hex
    * base64
    * byteArray
    * Uint8Array
    * count (outputs a count instead of the actual bytes; used by countEncodedBytes)
* throwOnError: A boolean to indicate if invalid strings should throw an error or be encoded as the non-printable character (0xfffd). Generally the only way to get an invalid string in JavaScript is to encode binary as a string, otherwise this should be very rare. Defaults to false.

For example, to encode a string in UTF-16 using base64 as the output:
```javascript
jsunicode.encode("An emoji: \ud83d\ude02", { encoding: "UTF-16", byteWriter: "base64" });
// "AEEAbgAgAGUAbQBvAGoAaQA6ACDYPd4C"
```
### Decoding
To decode:
```javascript
jsunicode.decode([inpBytes], [options]);
```
Where inpBytes specifies the encoded bytes which will be decoded into a string. As with encoding, the options argument is optional and supports the following members:
* encoding: A string specifying the Unicode encoding variant to use. Default is "UTF-8" (see encoding for values)
* byteReader: A string specifying how to read the inpBytes argument; generally the mirror of encode's byteWriter. Default is "hex", and new byteReaders can be registered (see "Registering byteReaders"). Supported values are:
    * hex
    * base64
    * byteArray
    * Uint8Array
* throwOnError: A boolean indicating if invalid bytes should cause errors to be thrown or ximply output the non-printable character (0xfffd). Defaults to false.
* allowEncodedSurrogatePair: A boolean allowing for relaxed rules on encodings such as UTF-8 and UTF-32 which do not normally encode surrogate pairs. This may be useful if decoding binary which was originally encoded with an iffy Unicode implementation. Defaults to false.

For example, to decode the above encoding example:
```javascript
jsunicode.decode("AEEAbgAgAGUAbQBvAGoAaQA6ACDYPd4C", { encoding: "UTF-16", byteReader: "base64" });
// An emoji: 😂
```
### Registering byteWriters
If you need to encode to a binary format which is not supported by default in JSUnicode, it is possible to create your own byteWriter. A byteWriter is an object will have two methods; one named "write" which accepts one parameter (a number between 0 and 255), and another named "finish" which returns the finished binary collection. You can register either an object which will be the byteWriter or a function which will build your byteWriter with jsunicde using the jsunicode.byteWriter.register function:
```javascript
jsunicode.byteWriter.register([name], [byteWriter]);
```
You can then specify your byteWriter name when encoding  to instruct jsunicode to use your byteWriter. If you want to see a list of which byteWriters are available at runtime, you can use the jsunicode.byteWriter.list() function (which takes no arguments) to get an array of all byteWriter names. You can also of course browse the source code to see how the built-in byteWriters work.
### Registering byteReaders
In much the same way as byteWriters, you can register your own byteReaders with jsunicode if you need to decode from a binary format which is not supported by default. A byteReader will have two functions; "begin" which accepts one parameter (the encoded binary in your custom format), and "read" which returns one byte when requested or returns null when there are no more bytes. You can register a byteReader with the jsunicode.byteReader.register function:
```javascript
jsunicode.byteReader.register([name], [byteReader]);
```
You can then specify your new byteReader name when decoding. To see a list of byteReaders at runtime, use the jsunicode.byteReader.list() function (which takes no arguments), and again you can look through the source code to see the built-in examples.
