# Roadmap

Issues in GitHub tagged as "bug" will generally take priority over new features here
* Implement explicit decode validation so binary can be checked without try/catching decode
* Typescript type definitions should be added
* Consider using [flow](https://flow.org/)
* Tests should be reordered (I accidentally wrote all equals tests with the expected/actual arguments backwards)
    * Also, along the way, tests should use JSUnicode constants intead of string literals
* Support asynchronous operations
* Support non-Unicode encodings (such as ASCII, CP-1252, ISO-8859-1, and UCS-2). Will need separate packages somehow so that sites who don't need it don't have to download encodings.
* Support collation (like other encodings, probably needs separate packages)
