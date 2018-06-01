# Roadmap

Issues in GitHub tagged as "bug" will generally take priority over new features here
* Implement explicit decode validation so binary can be checked without try/catching decode
* Handle BOMs
* Options to deal with newlines
  * Perhaps specify if decode should auto-convert newlines to LF/CRLF/CR or just assert line endings should be consistent
* Typescript type definitions should be added
* Consider using [flow](https://flow.org/)
* Tests should be reordered (I accidentally wrote all equals tests with the expected/actual arguments backwards)
* Support asynchronous operations
* Support non-Unicode encodings (such as ASCII, CP-1252, ISO-8859-1, and UCS-2). Will need separate packages somehow so that sites who don't need it don't have to download encodings.
* Support collation (like other encodings, probably needs separate packages)
