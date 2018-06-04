# Changelog

## 1.1.0

1.1.0 is primarily intended to modernize/clean up JSUnicode's build structure and clean up the documentation; it should be easier to get a dev environment spun up now. As an added bonus, node Buffers, Byte Order Marks, and newline conversion are now supported.

### Bug Fixes

* Decode operations have more descriptive error messages if underlying binary representations are invalid in some way (see [Issue #5](https://github.com/JeremyRann/JSUnicode/issues/5))

### New Features

* Node Buffers are supported as an encode/decode byteWriter/byteReader
* Sourcemaps are now part of the build
* Interface for extending JSUnicode by adding new byteReaders/byteWriters is easier to understand (and supports object prototypes now)
* Encode and decode support numerous options for handling Byte Order Marks
* Newline conversions can now be performed as part of encode or decode

