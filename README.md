# JSUnicode

## Overview

JSUnicode is a set of JavaScript utilities for handling Unicode. JSUnicode's capabilities include:

* Encode JavaScript strings as Unicode in binary representations (such as byte arrays, hex strings, and more)
* Decode binary representations into JavaScript strings
* Create custom binary representations to interop with other systems
* Convert between representations
* Built-in support for 5 Unicode encodings:
  * UTF-8
  * UTF-16 Big Endian (JSUnicode's default)
  * UTF-16 Little Endian
  * UTF-32 Big Endian (JSUnicode's default)
  * UTF-32 Little Endian

JSUnicode is designed to be small (requiring no runtime dependencies) and to work in [node.js](http://nodejs.org) or in a browser. See [doc/api-reference.md](https://github.com/JeremyRann/JSUnicode/blob/master/doc/api-reference.md) for complete documentation.

## Example Usage

There are many reasons you may wish to encode or decode data in Unicode, but here are a few examples of use cases that may be common.

### Byte Count

Often, data persistence layers have limits on encoded data storage. For instance, a database may specify that it stores VARCHAR fields in a UTF-8 collation, and a particular field may have a 200-byte limit. If your application accepts a user-input string that will be stored in such a field, you may wish to inform the user how many characters they have left in realtime, but JavaScript's `string.length` will be insufficient for this case, which provides a "character count" of sorts.

This use case is sufficiently common for JSUnicode to come equipped with a convenience function to provide byte counts for particular encodings. For instance, to get the byte count of the variable `myString`, you might do something like: 

```javascript
var jsunicode = require("jsunicode");

var byteCount = jsunicode.countEncodedBytes(myString);
```

This will default to UTF-8. If you're interested in the UTF-16 byte count instead, you could do something like:

```javascript
var jsunicode = require("jsunicode");

var byteCount = jsunicode.countEncodedBytes(myString, jsunicode.constants.encoding.utf16);
```

### Read UTF-16BE File

Node.js buffers only support reading UTF-16 as Little Endian; JSUnicode can be used to handle UTF-16BE. For instance, you may use code like the following to read a UTF-16LE file using Node's built-in functionality:

```javascript
var fs = require("fs");

fs.readFile("./myfile.txt", {
    encoding: "utf-16le"
}, function (err, contents) { console.log(contents); });
```

If you want to use JSUnicode to ready a UTF-16BE file, you might do something like this:

```javascript
var fs = require("fs");
var jsunicode = require("jsunicode");

fs.readFile("./myfile.txt", function (err, contents) {
    console.log(jsunicode.decode(contents, {
        byteReader: jsunicode.constants.binaryFormat.buffer,
        encoding: jsunicode.constants.encoding.utf16be
    }));
});
```

Note that [Byte order marks](https://en.wikipedia.org/wiki/Byte_order_mark) are not handled by JSUnicode at this time (although it's planned for a future release), so you may see an extra character at the start of data you read from a file.

### Write UTF-16BE File

Similarly to the above example, it's also possible to take a string and write it to a UTF-16BE buffer (or any other binary format). A node example might look like:

```javascript
var fs = require("fs");
var jsunicode = require("jsunicode");

fs.writeFile("./myfile.txt", jsunicode.encode(myString, {
    encoding: jsunicode.constants.encoding.utf16be,
    byteWriter: jsunicode.constants.binaryFormat.buffer
}), function (err) { console.log(err); })
```

Again, note that no BOM handling is built-in yet, so if in the previous example `myString` doesn't have a BOM at the beginning, your file might be impossible to read by external systems. As a quick-fix, if you need to add a BOM, you can insert it in a string before encoding with something like: `myString = "\uFEFF" + myString;`; afterwards JSUnicode will encode the BOM and output it as expected.


