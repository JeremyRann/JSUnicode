#JSUnicode API Reference

## Table of Contents

* [Core API](#core)
  * [encode](#encode)
  * [decode](#decode)
  * [countEncodedBytes](#countencodedbytes)
  * [convertBytes](#convertbytes)
  * [constants](#constants)
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
* encoding: A string specifying the Unicode encoding variant to use. Default is "UTF-8". Encoding values are contained in the constants object `jsunicode.constants.encoding` (similar to the encode method).
* byteReader: A string specifying how to read the inpBytes argument; generally the mirror of encode's byteWriter. Default is "hex". It is possible to add new byteWriters via the byteWriter API. The built-in values are listed in the constants object `jsunicode.constants.binaryFormat`, except for `count` which is only supported for encoding.
* throwOnError: A boolean indicating if invalid bytes should cause errors to be thrown or simply output the non-printable character (0xfffd). Defaults to false.
* allowEncodedSurrogatePair: A boolean allowing for relaxed rules on encodings such as UTF-8 and UTF-32 which do not normally encode surrogate pairs. This may be useful if decoding binary which was originally encoded with an iffy Unicode implementation. Defaults to false.
* byteReaderOptions: An options object that is passed along to the byteReader. None of the built-in byteReaders have additional options, although any new byteReaders registered get access to this options object should they need it.

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

<a name="jsunicodeerror"></a>
### jsunicodeError

Encoding errors are generally thrown as instances of `jsunicodeError`; any other error type thrown by JSUnicode generally indicates a bug or an incorrect invocation of JSUnicode.

<a name="bytereaderapi"></a>
## Byte Reader API

<a name="reader_registerfactory"></a>
### registerFactory

<a name="reader_registerprototype"></a>
### registerPrototype

<a name="reader_register"></a>
### register (deprecated)

<a name="reader_unregister"></a>
### unregister

<a name="reader_get"></a>
### get

<a name="reader_list"></a>
### list

<a name="bytewriterapi"></a>
## Byte Writer API

<a name="writer_registerfactory"></a>
### registerFactory

<a name="writer_registerprototype"></a>
### registerPrototype

<a name="writer_register"></a>
### register (deprecated)

<a name="writer_unregister"></a>
### unregister

<a name="writer_get"></a>
### get

<a name="writer_list"></a>
### list
