const path = require("path");

module.exports = function (env) {
    // env can be dev or prod
    env = env || "dev";
    var min = process.env.MIN === "false" ? false : true;

    var entry;
    if (min) {
        entry = {
            "jsunicode.min": "./src/jsunicode.js"
        };
    }
    else {
        entry = {
            "jsunicode": "./src/jsunicode.js"
        };
    }

    if (env === "dev") {
        entry["jsunicode.test"] = "./test/jsunicode.test.js";
        entry["jsunicode.browser.demo"] = "./test/jsunicode.browser.demo.js";
    }

    return {
        mode: env === "dev" ? "development" : "production",
        entry: entry,
        devtool: env === "dev" ? "eval-source-map" : "source-map",
        output: {
            filename: "[name].js",
            libraryTarget: "umd",
            library: "jsunicode",
            globalObject: "this"
        },
        module: {
            rules: [{
                test: /\.js$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            }]
        },
        node: {
            fs: "empty",
            // This probably bears more research; if Buffer is true or unset here, webpack will bundle a
            // buffer shim with JSUnicode's build for no reason. However if it's false, the test package
            // fails (it seems like tape-catch is the issue). Since we only need the test package in dev
            // mode, we'll use the environment variable for now so builds are small but dev mode works.
            Buffer: (env === "dev")
        },
        optimization: {
            minimize: process.env.MIN === "false" ? false : true
        },
        devServer: {
            inline: true,
            contentBase: __dirname,
            watchContentBase: true,
            host: process.env.HOST || "localhost",
            port: process.env.PORT || 8080
        }
    };
};

