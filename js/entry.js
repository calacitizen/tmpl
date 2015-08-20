var Traverse = require("./traverse"),
    fnAST = require("./stamping"),
    functionalStrategy = require("./functionalStrategy");
module.exports = {
  parse: Traverse.parse,
  stamping: function stamping(ast) {
    return fnAST.stamping(ast);
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
