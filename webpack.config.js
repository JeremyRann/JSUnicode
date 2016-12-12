module.exports = {
    entry: {
        "jsunicode.browser-demo": "./bundle/jsunicode.browser-demo.js"
    },
    output: {
        path: "bundle-out",
        publicPath: "dev-bin",
        //library: "jsunicode",
        //libraryTarget: "umd",
        filename: "[name].js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
        ]
    }
};

