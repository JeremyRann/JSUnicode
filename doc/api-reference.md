# JSUnicode API Reference

## Table of Contents

* [Core API](#core)
  * [encode](#encode)
  * [decode](#decode)
  * [countEncodedBytes](#countencodedbytes)
  * [convertBytes](#convertbytes)
  * [constants](#constants)
  * [validate](#validate)
  * [createPeekableByteReader](#create_peekable_byte_reader)
  * [jsunicodeError](#jsunicodeerror)
* [Byte Reader API](#bytereaderapi)
  * [registerFactory](#reader_registerfactory)
  * [registerPrototype](#reader_registerprototype)
  * [register (deprecated)](#reader_register)
  * [unregister](#reader_unregister)
  * [get](#reader_get)
  * [list](#reader_list)
* [Byte Writer API](#bytewriterapi)
  * [registerFactory](#writer_registerfactory)
  * [registerPrototype](#writer_registerprototype)
  * [register (deprecated)](#writer_register)
  * [unregister](#writer_unregister)
  * [get](#writer_get)
  * [list](#writer_list)

<a name="core"></a>
## Core API

<a name="encode"></a>
### encode

Encodes a JavaScript string into a binary value

```javascript
jsunicode.encode([inpString], [options]);
```
Where inpString is the string you wish to encode and options is an optional object specifying more detail about the encoding. The options object supports the following members:
* encoding: A string specifying the Unicode encoding variant to use. Default is "UTF-8". Encoding values are contained in the constants object `jsunicode.constants.encoding`. Supported values are:
    * UTF-8
    * UTF-16 (defaults to Big Endian)
    * UTF-16BE
    * UTF-16LE
    * UTF-32 (defaults to Big Endian)
    * UTF-32BE
    * UTF-32LE
* byteWriter: A string describing how jsunicode should output the bytes. Default is "hex". It is possible to add new byteWriters via the byteWriter API. The built-in values are listed in the constants object `jsunicode.constants.binaryFormat`. Supported values in addition to any manually-added byteWriters are:
    * hex
    * base64
    * byteArray
    * Uint8Array
    * buffer
    * count (outputs a count instead of the actual bytes; used by countEncodedBytes)
* throwOnError: A boolean to indicate if invalid strings should throw an error or be encoded as the non-printable character (0xfffd). Generally the only way to get an invalid string in JavaScript is to encode binary as a string, otherwise this should be very rare. Defaults to false.
* BOMBehavior: A string indicating how JSUnicode should write the byte output. Possible values are in the `jsunicode.constants.BOMBehavior` object: "never", "preserve", "auto", and "always" (default "never"). JSUnicode's default assumption is that you're probably not working with Byte Order Marks, so it will remove Byte Order Marks while encoding by default. If you change this option to "preserve", a BOM at the start of a string will remain when encoded. The "auto" option will add a BOM for UTF-16 encodings if not present, but remove a BOM if present for UTF-8 or UTF-32 encodings. Finally, the "always" option always adds a BOM to the output if it is not present in the string.
* lineEndingConversion: A string specifying if JSUnicode should attempt to alter line endings while encoding. Options are in `jsunicode.constants.lineEndingConversion`: "none", "lf", "crlf", and "cr" (default "none").
* byteWriterOptions: An options object that is passed along to the byteWriter. The only option used out-of-the-box is the upperCase option for hex encoding; hex encoding is by default done in lower case, setting this option to true converts to upper case.

For example, to encode a string in UTF-16 using base64 as the output:
```javascript
jsunicode.encode("An emoji: \ud83d\ude02", {
    encoding: jsunicode.constants.encoding.utf16,
    byteWriter: jsunicode.constants.binaryFormat.base64
});
// "AEEAbgAgAGUAbQBvAGoAaQA6ACDYPd4C"
```

<a name="decode"></a>
### decode

Decodes a binary value into a JavaScript string

```javascript
jsunicode.decode([inpBytes], [options]);
```
Where inpBytes specifies the encoded bytes which will be decoded into a string. As with encoding, the options argument is optional and supports the following members:
* encoding: A string specifying the Unicode encoding variant to use. Default is "guess", which will normally result in UTF-8 (see the description for `BOMMismatchBehaivor for more`). Encoding values are contained in the constants object `jsunicode.constants.encoding` (similar to the encode method). Also note that "guess" is only valid as an encoding opertion for decoding (an error will be thrown if you specify "guess" as the encoding for an encode operation).
* byteReader: A string specifying how to read the inpBytes argument; generally the mirror of encode's byteWriter. Default is "hex". It is possible to add new byteWriters via the byteWriter API. The built-in values are listed in the constants object `jsunicode.constants.binaryFormat`, except for `count` which is only supported for encoding.
* throwOnError: A boolean indicating if invalid bytes should cause errors to be thrown or simply output the non-printable character (0xfffd). Defaults to false.
* allowEncodedSurrogatePair: A boolean allowing for relaxed rules on encodings such as UTF-8 and UTF-32 which do not normally encode surrogate pairs. This may be useful if decoding binary which was originally encoded with an iffy Unicode implementation. Defaults to false.
* preserveBOM: A boolean indicating if a Byte Order Mark at the beginning of `inpBytes` will be kept. This defaults to false, which means leading BOMs (for instance from a file or HTTP call) will be removed by default unless this option is true.
* detectUTF32BOM: A boolean indicating if JSUnicode should look for UTF-32 Byte Order Marks. Defaults to false unless the encoding option is set to "UTF-32". By default, JSUnicode will use the presense of a ByteOrderMark as part of the encoding determination, but will ignore UTF-32 Byte Order Marks (since they are considered exceedingly rare). Set this property to true if you expect that your bytes might include a UTF-32 BOM and you want jsunicode to detect it without explicitly setting encoding to one of the UTF-32 options.
* BOMMismatchBehavior: A string specifying what JSUnicode should do if it receives conflicting information about a byte collection's encoding. This can happen if for instance the encoding option is set to UTF-8, but the input has a UTF-16BE BOM at the beginning. The possible options are in `jsunicode.constants.BOMMismatchBehavior`: "throw", "trustBOM", and "trustRequest" (the default is "throw"). Note that the encoding options "UTF-16" and "UTF-32" are somewhat loose; for those options, JSUnicode will use the presense of a Byte Order Mark to determine endianness but default to Big Endian if there is no BOM. If no encoding is specified (or it's set to "guess"), UTF-8 is assumed.
* lineEndingConversion: A string specifying if JSUnicode should attempt to alter line endings while decoding. Options are in `jsunicode.constants.lineEndingConversion`: "none", "lf", "crlf", and "cr" (default "none").
* byteReaderOptions: An options object that is passed along to the byteReader. None of the built-in byteReaders have additional options, although any new byteReaders registered get access to this options object should they need it.
* validate: A boolean indicating if the output should be the decoded string or a validation object (see validate function documentation below)

For example, to decode the above encoding example:
```javascript
jsunicode.decode("AEEAbgAgAGUAbQBvAGoAaQA6ACDYPd4C", {
    encoding: jsunicode.constants.encoding.utf16,
    byteReader: jsunicode.constants.binaryFormat.base64
});
// An emoji: 😂
```

<a name="countencodedbytes"></a>
### countEncodedBytes

Determines how many bytes a JavaScript string would require to encode as binary

```javascript
jsunicode.countEncodedBytes([inpString], [encoding]);
```
Where inpString is the string you want to count and encoding is an optional string argument specifying the Unicode encoding you're using ("UTF-8" is the default, but "UTF-16" and "UTF-32" are also supported). For example:
```javascript
jsunicode.countEncodedBytes("\ud799"); // Returns 3 for UTF-8 encoding
jsunicode.countEncodedBytes("\ud799", jsunicode.constants.encoding.utf16); // Returns 2 for UTF-16 encoding
```

<a name="convertbytes"></a>
### convertBytes

Converts between binary representations

```javascript
jsunicode.convertBytes([inpBytes], [byteReaderName], [byteWriterName], [options])
```
Where inpBytes is the binary format you which to convert, byteReaderName specifies the format of inpBytes, byteWriterName specifies the destination format, and options is an optional object with a byteReaderOptions member and a byteWriterOptions member to provide additional options if needed.

<a name="constants"></a>
### constants

A constants object is provided on the jsunicode object for convenience. Using the constants object ensures that you can more easily find references to particular encodings or binaryFormats in your code base for example, but there is no reason to expect that the actual string values of any of these constants will change in a future version of JSUnicode, so if you prefer to use string literals instead of references to this object, it should be perfectly safe.

<a name="validate"></a>
### validate

Validates a binary representation

```javascript
jsunicode.validate([inpBytes], [options])
```
Where inpBytes is the binary data you want to validate and options is an optional object which is passed to the decoder (exactly the same options as available in the decode function). The result of the validate function is an object with three properties:

* isValid: a boolean property indicating if the binary data is valid
* exception: a boolean property indicating if an exception was encountered (will always be false if isValid is true)
* errors: An object relating errors encountered with the count of each error (will always be an empty object if isValid is true)

For example, here's what validating good binary data looks like:

```javascript
jsunicode.validate("2020");
/*
{
    "isValid": true,
    "exception": false,
    "errors": {}
}
*/
```

An example of invalid binary data:

```javascript
jsunicode.validate("ffff");
/*
{
    "isValid": false,
    "exception": false,
    "errors": {
        "Invalid leading byte": 2
    }
}
*/
```

Note that if an exception is encountered, the error count for the error encountered will always be 1, and the error message will be the object key. Generally, validation errors that would cause invalid output in the result string if throwOnError is false will show as errors with the exception property set to true, and the count indicates how many invalid characters would be sent, whereas errors that would cause exceptions regardless of the throwOnError property will result in a validation object with the exception property set to true. Here is an example of validation output for a case where the binary representation itself is invalid:

```javascript
jsunicode.validate("zzzz");
/*
{
    "isValid": false,
    "exception": true,
    "errors": {
        "Unexpected JSUnicode exception encountered: Invalid hex byte": 1
    }
}
*/
```

<a name="jsunicodeerror"></a>
### jsunicodeError

Encoding errors are generally thrown as instances of `jsunicodeError`; any other error type thrown by JSUnicode generally indicates a bug or an incorrect invocation of JSUnicode.

<a name="create_peekable_byte_reader"></a>
### createPeekableByteReader

Extends an existing byteReader to have peek functions

```javascript
jsunicode.createPeekableByteReader([byteReader]);
```

Where byteReader is an object with byteReader functions (generally the result of `jsunicode.getByteReader()`).

This function is used internally (generally to look for Byte Order Marks), but you can access it via the jsunicode API; it will wrap an existing byteReader and add three functions:

* `peekArray([byteCount])`: returns an array of the next bytes in the reader
* `peekByte()`: returns the next byte in the reader
* `checkBOM(checkUTF32)`: Checks the next bytes in the reader to see if they are an encoding's Byte Order Mark; returns the encoding name (such as "UTF-8" or "UTF-16BE") if it is, null otherwise. Will ignore UTF-32 BOMs unless checkUTF32 is true

Calling peekArray and peekByte are like calling the reader's `read()` function, except that subsequent calls to read will not be affected.

<a name="bytereaderapi"></a>
## Byte Reader API

The Byte Reader API allows you to extend JSUnicode's built-in decoding mechanism such that it can read new binary formats. See [doc/extending.md](https://github.com/JeremyRann/JSUnicode/blob/master/doc/extending.md) for a deeper look at adding new binary formats to JSUnicode. The API is accessible through `jsunicode.byteReader`.

<a name="reader_registerfactory"></a>
### registerFactory

Register a new byteReader for JSUnicode's use by providing a function which returns a byteReader.

```javascript
jsunicode.byteReader.registerFactory([name], [byteReaderFactory]);
```

Where name is the name of the new byteReader and byteReaderFactory is a function which returns a byteReader object. A byteReader object is an object with a begin, read, and deserialize method.

<a name="reader_registerprototype"></a>
### registerPrototype

Register a new byteReader for JSUnicode's use by providing an object prototype which can be used to create new byteReaders. Similar to registerFactory, except that objects will be initialized with the `new` keyword.

```javascript
jsunicode.byteReader.registerPrototype([name], [byteReaderPrototype]);
```

Where name is the name of the new byteReader and byteReaderPrototype is an object prototype for a byteReader object. A byteReader object is an object with a begin, read, and deserialize method.

<a name="reader_register"></a>
### register (deprecated)

The old mechanism of registering byteReaders. This function is still included, but please use registerPrototype or registerFactory for any current/future development. This will likely be removed in the next major version of JSUnicode.

<a name="reader_unregister"></a>
### unregister

Remove a previously-registered byteReader

```javascript
jsunicode.byteReader.unregister([name])
```

Where name is the name of the byteReader to remove.

<a name="reader_get"></a>
### get

Retrieves a previously-registered byteReader

```javascript
jsunicode.byteReader.get([name])
```

Where name is the name of the byteReader to retrieve. This will always return an object, either created by invoking the object factory or using the `new` keyword on an object prototype.

<a name="reader_list"></a>
### list

Gets a string array of all names of currently-registered byteReaders

```javascript
jsunicode.byteReader.list()
```

<a name="bytewriterapi"></a>
## Byte Writer API

The Byte Writer API allows you to extend JSUnicode's built-in encoding mechanism such that it can write new binary formats. See [doc/extending.md](https://github.com/JeremyRann/JSUnicode/blob/master/doc/extending.md) for a deeper look at adding new binary formats to JSUnicode. The API is accessible through `jsunicode.byteWriter`.

<a name="writer_registerfactory"></a>
### registerFactory

Register a new byteWriter for JSUnicode's use by providing a function which returns a byteWriter.

```javascript
jsunicode.byteWriter.registerFactory([name], [byteWriterFactory]);
```

Where name is the name of the new byteWriter and byteWriterFactory is a function which returns a byteWriter object. A byteWriter object is an object with a write, finish, and serialize method.

<a name="writer_registerprototype"></a>
### registerPrototype

Register a new byteWriter for JSUnicode's use by providing an object prototype which can be used to create new byteWriters. Similar to registerFacotry, except that objects will be initialized with the `new` keyword.

```javascript
jsunicode.byteWriter.registerPrototype([name], [byteWriterPrototype]);
```

Where name is the name of the new byteWriter and byteWriterPrototype is an object prototype for a byteWriter object. A byteWriter object is an object with a write, finish, and serialize method.

<a name="writer_register"></a>
### register (deprecated)

The old mechanism of registering byteWriters. This function is still included, but please use registerPrototype or registerFactory for any current/future development. This will likely be removed in the next major version of JSUnicode.

<a name="writer_unregister"></a>
### unregister

Remove a previously-registered byteWriter

```javascript
jsunicode.byteWriter.unregister([name])
```

Where name is the name of the byteWriter to remove.

<a name="writer_get"></a>
### get

Retrieves a previously-registered byteWriter

```javascript
jsunicode.byteWriter.get([name])
```

Where name is the name of the byteWriter to retrieve. This will always return an object, either created by invoking the object factory or using the `new` keyword on an object prototype.

<a name="writer_list"></a>
### list

Gets a string array of all names of currently-registered byteWriters

```javascript
jsunicode.byteWriter.list()
```

