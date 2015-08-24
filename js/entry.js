var Traverse = require("./traverse"),
    processing = require("./processing");
module.exports = {
  parse: Traverse.parse,
  html: function html(ast, data) {
    return processing.getHTMLString(ast, data);
  },
  traverse: function traverse(ast) {
    return {
      handle: function (success, broke) {
        Traverse.traverse(ast).when(success, broke);
      }
    }
  },
  getHTML: functionalStrategy
};
