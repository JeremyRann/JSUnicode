# Extending JSUnicode's Binary Representations

## Introduction

JSUnicode is primarily in the business of converting to and from binary representations. Although it is designed to cover common cases, there may be times it is convenient to make JSUnicode aware of a binary representation that is not built-in. One such case could be for usage in a cryptography library, where internally binary data might be stored in an array of 32-bit words for performance reasons. This document will provide an example of registering a new byteReader and byteWriter to JSUnicode for a fictitious library which requires 32-bit words internally. Note that there are more examples of registering byteReaders and byteWriters within the source code; JSUnicode internally uses the same mechanism to register byteReaders/byteWriters as seen here. You can see all built in byteReaders/byteWriters at [src/jsunicode.bytereader.js](https://github.com/JeremyRann/JSUnicode/blob/master/src/jsunicode.bytereader.js) and [src/jsunicode.bytewriter.js](https://github.com/JeremyRann/JSUnicode/blob/master/src/jsunicode.bytewriter.js). For this example. we expect a binary representation to be an object with a `length` property and a `words` property, such as this:

``` javascript
{
    length: 6,
    words: [0x68656c6c, 0x6f210000]
}
```

Where length is necessary for cases like this where the number of bytes is not divisible by 4. We will call our byteReader and byteWriter `word32`. Once our example is done, we expect to see this result:

``` javascript
jsunicode.encode("hello!", { byteWriter: "word32" });
// Result: { length: 6, words: [0x68656c6c, 0x6f210000] }
```

Or in reverse:

``` javascript
jsunicode.decode({ length: 6, words: [0x68656c6c, 0x6f210000] }, { byteReader: "word32" });
// Result: "hello!"
```

## The byteWriter

We'll use the `registerFactory` mechanism to register our new byteWriter, although you can use `registerPrototype` if you want to use an object prototype instead (which would be instantiated using the `new` keyword). So, we need a function that when called returns an object with three properties: write, finish, and serialize. This byteWriter object will also be expected to internally keep track of what's been written between it's initialization and when `finish` is called. We'll start with some scaffolding:

``` javascript
var word32ByteWriterFactory = function () {
    var bytes = {
        length: 0,
        words: []
    };

    var write = function (currentByte) {
    };

    var finish = function () {
    };

    var serialize = function (bytes) {
    };

    return {
        write: write,
        finish: finish,
        serialize: serialize
    };
};
```

The `write` function will be called for each byte during encoding, and will be passed a value we're calling `currentByte` here, which is a number between 0 and 255 inclusive. The `finish` function will be called once we're out of bytes to encode, and is expected to output a value which is the finished encoded binary representation. `serialize` is optional (although included on all built-in byteWriters), and is intended for convenience; although JSUnicode does not call it internally, it can be used to serialize previously-encoded data. For our purposes, we'll use JSON.stringify to serialize our data.

``` javascript
    var serialize = function (bytes) {
        return JSON.stringify(bytes);
    };
```

Also, our `finish` function will be fairly simple here; the plan is to update the `bytes` object as we go, and eventually return the updated object once we're done. We can fill in pretty close to what that will look like already:

``` javascript
    var finish = function () {
        return bytes;
    };
};
```

The write function will be an aggregator, keeping track of bytes as they're written. In this specific example, we can implement a buffer that dumps to an integer every 4 bytes. So, we can keep around a buffer array for bytes as they're added, then flush every 4th write.

``` javascript
var word32ByteWriterFactory = function () {
    var bytes = {
        length: 0,
        words: []
    };

    var buffer = [];

    var write = function (currentByte) {
        bytes.length++;

        buffer.push(currentByte);

        if (buffer.length === 4) {
            // TODO: Put flush logic here
            buffer = [];
        }
    };
//...
};
```

We'll now add a private flush function which converts the 4 bytes in the buffer to a 32-bit word and adds it to the byte array:

``` javascript
    var flush = function () {
        bytes.words.push(((buffer[0] << 24) >>> 0) + (buffer[1] << 16) + (buffer[2] << 8) + buffer[3]);
    };
```

Without going too much into detail about JavaScript bit operations, this basically glues together the four numbers in buffer as one 32-bit word. With that in place, all that's left is to change the finish function to flush if the buffer still has leftover bytes.

``` javascript
    var finish = function () {
        if (buffer.length > 0) {
            while (buffer.length < 4) {
                buffer.push(0);
            }
            flush();
        }
        return bytes;
    };
```

Putting it all together:

``` javascript
var word32ByteWriterFactory = function () {
    var bytes = {
        length: 0,
        words: []
    };

    var buffer = [];

    var flush = function () {
        bytes.words.push(((buffer[0] << 24) >>> 0) + (buffer[1] << 16) + (buffer[2] << 8) + buffer[3]);
    };

    var write = function (currentByte) {
        bytes.length++;

        buffer.push(currentByte);

        if (buffer.length === 4) {
            flush();
            buffer = [];
        }
    };

    var finish = function () {
        if (buffer.length > 0) {
            while (buffer.length < 4) {
                buffer.push(0);
            }
            flush();
        }
        return bytes;
    };

    var serialize = function (bytes) {
        return JSON.stringify(bytes);
    };

    return {
        write: write,
        finish: finish,
        serialize: serialize
    };
};
```

With this function in place, we're ready to register it for use with JSUnicode:

``` javascript
jsunicode.byteWriter.registerFactory("word32", word32ByteWriterFactory);
```

After that's done, you can use `word32` as an argument to encode or any other function that requires a byteWriter. If you're following along, you should see the following:

``` javascript
jsunicode.encode("hello!", { byteWriter: "word32" });
// Result: { length: 6, words: [0x68656c6c, 0x6f210000] }
// (note that your output will probably be in decimal, so something like [1751477356, 1864433664]
```

## The byteReader

This will very much be the mirror image of the byteWriter implementation. JSUnicode expects a byteReader to implement three functions: begin, read, and deserialize. This time, the call to the begin function will supply a binary value which the byteReader is expected to remember, and the byteReader should also remember an index where we're reading from. Here's the scaffolding:

``` javascript
var word32ByteReaderFactory = function () {
    var bytes;
    var index;

    var begin = function (value) {
    };

    var read = function () {
    };

    var deserialize = function (inpStr) {
    };

    return {
        begin: begin,
        read: read,
        deserialize: deserialize
    };
};
```

When JSUnicode begins decoding, it calls the `begin` function with the binary representation. This is strictly to initialize values, so it's easy enough in this case to set the reference to the `bytes` private variable. It's also a good practice to do some validation on the bytes input to make sure it's at least well-formed.

``` javascript
    var begin = function (value) {
        if (typeof(value) !== "object") {
            throw new Error("Invalid data type (expected type of object)");
        }
        if (!value.hasOwnProperty("length") || !value.hasOwnProperty("words")) {
            throw new Error("Invalid data structure (expected object with length and words properties)");
        }
        bytes = value;
        index = 0;
    };
```

Deserialize is also pretty simple in our example; it should be the opposite of our byteWriter's serialize object, so we can simply use JSON.parse:

``` javascript
    var deserialize = function (inpStr) {
        return JSON.parse(inpStr);
    };
```

Our read function is expected to return a byte (a number between 0 and 255 inclusive) or null if we've run to the end of the bytes. In our case, we'll find the current word we're reading and use some bit arithmetic to retrieve the byte from the word.

``` javascript
    var read = function () {
        if (index === bytes.length) {
            return null;
        }
        
        var currentWord = bytes.words[Math.floor(index / 4)];
        var result = null;

        switch (index % 4) {
            case 0:
                result = (0xff000000 & currentWord) >>> 24;
                break;
            case 1:
                result = (0xff0000 & currentWord) >> 16;
                break;
            case 2:
                result = (0xff00 & currentWord) >> 8;
                break;
            case 3:
                result = (0xff & currentWord);
                break;
        }

        index++;
        return result;
    };
```

The final result when put together is:

``` javascript
var word32ByteReaderFactory = function () {
    var bytes;
    var index;

    var begin = function (value) {
        if (typeof(value) !== "object") {
            throw new Error("Invalid data type (expected type of object)");
        }
        if (!value.hasOwnProperty("length") || !value.hasOwnProperty("words")) {
            throw new Error("Invalid data structure (expected object with length and words properties)");
        }
        bytes = value;
        index = 0;
    };

    var read = function () {
        if (index === bytes.length) {
            return null;
        }
        
        var currentWord = bytes.words[Math.floor(index / 4)];
        var result = null;

        switch (index % 4) {
            case 0:
                result = (0xff000000 & currentWord) >>> 24;
                break;
            case 1:
                result = (0xff0000 & currentWord) >> 16;
                break;
            case 2:
                result = (0xff00 & currentWord) >> 8;
                break;
            case 3:
                result = (0xff & currentWord);
                break;
        }

        index++;
        return result;
    };

    var deserialize = function (inpStr) {
        return JSON.parse(inpStr);
    };

    return {
        begin: begin,
        read: read,
        deserialize: deserialize
    };
};
```

Now that it's ready, we can register our byteReader for use with JSUnicode:

``` javascript
jsunicode.byteReader.registerFactory("word32", word32ByteReaderFactory);
```

After that's done, you can use `word32` as an argument to decode or any other function that requires a byteReader. If you're following along, you should see the following:

``` javascript
jsunicode.decode({ length: 6, words: [0x68656c6c, 0x6f210000] }, { byteReader: "word32" });
// Result: "hello!"
```

