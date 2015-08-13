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
  }
]
