var webpack = require("webpack");

module.exports = {
    entry: {
        "jsunicode": "./src/jsunicode.js",
    },
    output: {
        path: "bin",
        library: "jsunicode",
        libraryTarget: "umd",
        filename: "[name].min.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ minimize: true })
    ]
};

