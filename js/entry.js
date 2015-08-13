var AST = require("./AST"),
    functionalStrategy = require("./functionalStrategy");
module.exports = {
  parse: AST.parse,
  traverse: function traverse(ast, data) {
    return {
      handle: function (success, broke) {
        AST.traverse(ast, data).when(success, broke);
      }
    }
  },
  getHTML: functionalStrategy
};
