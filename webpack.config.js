var webpack = require("webpack");
module.exports = [
    {
        target: 'web',
        entry: {
            tmpl: "./js/entry"
        },
        output: {
            // Make sure to use [name] or [id] in output.filename
            //  when using multiple entry points
            filename: "[name].js",
            chunkFilename: "[id].js",
            library: ["tmpl"],
            libraryTarget: "umd"
        }
    }, {
        target: 'web',
        entry: {
            tmpl: "./js/entry"
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ],
        output: {
            // Make sure to use [name] or [id] in output.filename
            //  when using multiple entry points
            filename: "[name].min.js",
            chunkFilename: "[id].min.js",
            library: ["tmpl"],
            libraryTarget: "umd"
        }
    }, {
        target: 'web',
        entry: {
            tmpl: "./js/entryvdom"
        },
        output: {
            // Make sure to use [name] or [id] in output.filename
            //  when using multiple entry points
            filename: "[name]vdom.js",
            chunkFilename: "[id]vdom.js",
            library: ["tmpl"],
            libraryTarget: "umd"
        }
    }, {
        target: 'web',
        entry: {
            tmpl: "./js/entryvdom"
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ],
        output: {
            // Make sure to use [name] or [id] in output.filename
            //  when using multiple entry points
            filename: "[name]vdom.min.js",
            chunkFilename: "[id]vdom.min.js",
            library: ["tmpl"],
            libraryTarget: "umd"
        }
    }
];
