var jsunicodeError = function (message) {
    var error = Error.call(this, message);

    this.name = "jsunicodeException";
    this.message = error.message;
    this.stack = error.stack;
};

var intermediateInheritor = function () {};
intermediateInheritor.prototype = Error.prototype;
jsunicodeError.prototype = new intermediateInheritor();

module.exports = jsunicodeError;

