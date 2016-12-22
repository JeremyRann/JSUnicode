(function (global) {
    "use strict";

    var smoke = function ($, jsunicode) {
        $(document).ready(function () {
            $("#decode").click(function () {
                var result = jsunicode.decode($("#decodeText").val(), { encoding: "UTF-16" });
                $("#encodeText").val(result);
                $("#output").text(result);
            });

            $("#encode").click(function () {
                var result = jsunicode.encode($("#encodeText").val(), { encoding: "UTF-16" });
                $("#decodeText").val(result);
                $("#output").text(result);
            });
        });
    };

    if (!global.define) {
        smoke(global.$, global.jsunicode);
    }
    else {
        define(["jquery", "../bin/jsunicode.min"], smoke);
    }
} (this));
