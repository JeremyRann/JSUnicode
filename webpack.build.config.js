const path = require("path");

module.exports = {
    entry: {
        "jsunicode": "./src/jsunicode.js",
    },
    output: {
        path: path.resolve(__dirname, "bin"),
        library: "jsunicode",
        libraryTarget: "umd",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ]
    },
    node: {
        fs: "empty"
    }

};

