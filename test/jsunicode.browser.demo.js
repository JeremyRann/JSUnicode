/*global $ */
$(document).ready(function () {
    "use strict";
    var jsunicode = null;

    // Look for load=dyanamic or load=static in URL params; if found, load jsunicode and load the UI
    if (window.location.search) {
        var search = window.location.search;
        if (search[0] === "?") {
            search = search.substr(1);
            var params = search.split("&");
            for (var i = 0; i < params.length; i++) {
                var tokens = params[i].split("=");
                if (tokens[0] === "load") {
                    if (tokens[1] === "dynamic") {
                        $.getScript("jsunicode.js").done(jsUnicodeLoaded).fail(function () {
                            $("pre.error").show().text("Error loading jsunicode");
                        });
                    }
                    else if (tokens[1] === "static") {
                        $.getScript("dist/jsunicode.js").done(jsUnicodeLoaded).fail(function () {
                            $("pre.error").show().text("Error loading jsunicode");
                        });
                    }
                    else if (tokens[1] === "test") {
                        $.getScript("jsunicode.test.js").done(function () {
                            $("body").removeClass("not-loaded").addClass("loaded").addClass("test");
                        }).fail(function () {
                            $("pre.error").show().text("Error loading tests");
                        });
                    }
                    else {
                        $("pre.error").show().text("Invalid load parameter");
                    }
                }
            }
        }
    }

    $("#decode").click(function () {
        $("pre.error").hide();
        try {
            var result = jsunicode.decode($("#decodeText").val(), {
                encoding: $("#textEncoding").val(),
                byteReader: $("#byteReader").val()
            });
            $("#encodeText").val(result);
            $("#output").text(result);
        } catch (err) {
            if (err instanceof jsunicode.jsunicodeError) {
                $("pre.error").show().text(err.toString());
            }
            else {
                $("pre.error").show().text("An unexpected error has occurred");
                throw err;
            }
        }
    });

    $("#encode").click(function () {
        $("pre.error").hide();
        try {
            var result = jsunicode.encode($("#encodeText").val(), {
                encoding: $("#textEncoding").val(),
                byteWriter: $("#byteWriter").val()
            });
            $("#decodeText").val(result);
            $("#output").text(result);
        } catch (err) {
            if (err instanceof jsunicode.jsunicodeError) {
                $("pre.error").show().text(err.toString());
            }
            else {
                $("pre.error").show().text("An unexpected error has occurred");
                throw err;
            }
        }
    });

    function jsUnicodeLoaded() {
        $("body").removeClass("not-loaded").addClass("loaded");
        jsunicode = window.jsunicode;
        $.each(jsunicode.byteReader.list(), function (i, item) {
            $("#byteReader").append($("<option>", {
                text: item
            }));
        });
        $.each(jsunicode.byteWriter.list(), function (i, item) {
            $("#byteWriter").append($("<option>", {
                text: item
            }));
        });
    }
});

