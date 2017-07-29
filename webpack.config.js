const path = require("path");

module.exports = {
    entry: {
        "jsunicode.browser-demo": "./bundle/jsunicode.browser-demo.js"
    },
    output: {
        path: path.resolve(__dirname, "bundle-out"),
        publicPath: "dev-bin",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ]
    }
};

