Issues in GitHub tagged as "bug" will generally take priority over new features here
* Rewrite README
* Begin changelog
* Handle BOMs
* Typescript type definitions should be added
* Consider using [flow](https://flow.org/)
* Support asynchronous operations
* Options to deal with newlines
  * Perhaps specify if decode should auto-convert newlines to LF/CRLF/CR or just assert line endings should be consistent
  * Also should consider implementing decode validation so binary can be checked without try/catching decode
* Support non-Unicode encodings (such as ASCII, CP-1252, ISO-8859-1, and UCS-2). Will need separate packages somehow so that sites who don't need it don't have to download encodings.
* Support collation (like other encodings, probably needs separate packages)
