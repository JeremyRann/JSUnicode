(function () {
    "use strict";

    requirejs.config({
        paths: {
            "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min"
        }
    });

    requirejs(["jquery", "../bin/jsunicode.js"], function ($, jsunicode) {
        $(document).ready(function () {
            $("#decode").click(function () {
                $("#output").text(jsunicode.decode($("#decodeText").val(), { encoding: "UTF-16" }));
            });

            $("#encode").click(function () {
                $("#output").text("(not implemented yet)");
            });
        });
    });
}());
