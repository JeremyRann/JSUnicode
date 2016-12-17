(function () {
    "use strict";

    requirejs.config({
        paths: {
            "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min"
        }
    });

    require(["smoke"], function () { });
}());
