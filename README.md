# JSUnicode
JSUnicode is a Unicode library for JavaScript, allowing users to encode/decode UTF-8, UTF-16, and UTF-32. The implementation complies with the Unicode specification and works with characters in supplementary code point ranges such as emoji (which can be troublesome in some other Unicode implementations).
## Table of Contents
* [Getting Started](#getting-started)
    * [In a browser](#in-a-browser)
    * [In node.js](#in-nodejs)
* [Usage](#usage)
    * [Couting bytes](#couting-bytes)
    * [Encoding](#encoding)
    * [Decoding](#decoding)
    * [Binary Formats](#binary-formats)
    * [Registering byteWriters](#registering-bytewriters)
    * [Retrieving existing byteWriters](#retrieving-existing-bytewriters)
    * [Registering byteReaders](#registering-bytereaders)
    * [Retrieving existing byteReaders](#retrieving-existing-bytereaders)
    * [Converting between binary representations](#converting-between-binary-representations)

## Getting Started
### In a browser
The simplest way to use JSUnicode in a browser is to download the minified release at [https://github.com/JeremyRann/JSUnicode/releases](https://github.com/JeremyRann/JSUnicode/releases) (the file will be called "jsunicode.min.js"), then include it in a script tag:
```html
<script type="text/javascript" src="jsunicode.min.js"></script>
```
This will create a global object called "jsunicode". You can also use JSUnicode within an AMD implementation such as [requirejs](http://requirejs.org); in that case, you can simply reference the same jsunicode minified release file as you normally would in requirejs.
```javascript
require(["jsunicode.min"], function (jsunicode) { /*...*/ });
```
JSunicode uses [Webpack's](https://webpack.github.io/) UMD output, so the script will intelligently decide to create a global object or rely on AMD depending on the context.
### In [node.js](http://nodejs.org/)
You can use NPM to install the latest release of JSUnicode:
```
npm install jsunicode
```
Then you can reference jsunicode as you would any other node dependency:
```javascript
var jsunicode = require("jsunicode");
```
## Usage
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
* byteWriterOptions: An options object that is passed along to the byteWriter. The only option used out-of-the-box is the upperCase option for hex encoding; hex encoding is by default done in lower case, setting this option to true converts to upper case.

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
* byteReaderOptions: An options object that is passed along to the byteReader. None of the built-in byteReaders have additional options, although any new byteReaders registered get access to this options object should they need it.

For example, to decode the above encoding example:
```javascript
jsunicode.decode("AEEAbgAgAGUAbQBvAGoAaQA6ACDYPd4C", { encoding: "UTF-16", byteReader: "base64" });
// An emoji: 😂
```
### Binary Formats
JavaScript has no universally agreed-on format for storing binary data, so JSUnicode is designed to be modular, supporting a few default binary formats and providing developers the ability to build new ones as needed. When encoding Unicode, a byteWriter is needed to output the encoded binary, and when decoding Unicode a byteReader is needed to provide the input.
### Registering byteWriters
It is possible to create your own byteWriter for use with JSUnicode. A byteWriter is an object that will have two methods; one named "write" which accepts one parameter (a number between 0 and 255), and another named "finish" which returns the finished binary collection. You can register either an object which will be the byteWriter or a function which will build your byteWriter. Your function will take a byteWriterOptions object, or if you register an object the object will have an options member set when the writer is retrieved. Note that this means your registered object probably shouldn't already have a member called "options", since JSUnicode will overwrite it. To allow JSUnicode to use your byteWriter, register it using the jsunicode.byteWriter.register function:
```javascript
jsunicode.byteWriter.register([name], [byteWriter]);
```
You can then specify your byteWriter name when encoding  to instruct jsunicode to use your byteWriter. You can of course browse the source code to see how the built-in byteWriters work.
### Retrieving existing byteWriters
You can see a list of which byteWriters are available at runtime with the byteWriter.list() function:
```javascript
jsunicode.bytwWriter.list();
```
This returns an array of all byteWriter names. If you want to use a byteWriter in the same way JSUnicode does, you can retrieve a byteWriter with:
```javascript
jsunicode.byteWriter.get([name], [options]);
```
Where options is an optional argument.
### Registering byteReaders
In much the same way as byteWriters, you can register your own byteReaders with jsunicode if you need to decode from a binary format which is not supported by default. A byteReader will have two functions; "begin" which accepts one parameter (the encoded binary in your custom format), and "read" which returns one byte when requested or returns null when there are no more bytes. You can register either a function which takes an options argument and produces a byteReader, or you can register an object which will have its options member set/overwritten. This is done with the jsunicode.byteReader.register function:
```javascript
jsunicode.byteReader.register([name], [byteReader]);
```
You can then specify your new byteReader name when decoding.
### Retrieving existing byteReaders
To list existing byteReaders, use:
```javascript
jsunicode.byteReader.list();
```
Which returns an array of byteReader names. You can get a byteReader for your own usage:
```javascript
jsunicode.byteReader.get([name], [options]);
```
Where, as with the byteWriter, the options argument is optional.
### Converting between binary representations
It may also sometimes be handy to convert between binary representations, so jsunicode provides the convertBytes function:
```javascript
jsunicode.convertBytes([inpBytes], [byteReaderName], [byteWriterName], [options])
```
Where inpBytes is the binary format you which to convert, byteReaderName specifies the format of inpBytes, byteWriterName specifies the destination format, and options is an optional object witha  byteReaderOptions member and a byteWriterOptions member to provide additional options if needed.
