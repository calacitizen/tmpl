var Traverse = require("./traverse"),
    processing = require("./processing"),
    functionalStrategy = require("./functionalStrategy");
module.exports = {
  parse: Traverse.parse,
  processingAST: function processingAST(ast, data) {
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
