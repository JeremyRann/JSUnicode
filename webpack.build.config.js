module.exports = {
    entry: {
        "jsunicode": "./src/jsunicode.js",
    },
    output: {
        path: "bin",
        library: "jsunicode",
        libraryTarget: "umd",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ]
    }
};

