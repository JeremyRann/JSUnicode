// A bit of a hack; this makes mocha tests easier, and I can play with a global jsunicode object
// in a browser more easily this way. So, not a hack I want to get rid of :P
window.jsunicode = require("../src/jsunicode");

require("script-loader!../test/jsunicode.test.js");
// Require the html so that the file watcher will pick this up; we don't really need the html
require("html-loader!../browser-demo.html");
