var Traverse = require("./traverse"),
    functionalStrategy = require("./functionalStrategy");
module.exports = {
  parse: Traverse.parse,
  traverse: function traverse(ast) {
    return {
      handle: function (success, broke) {
        Traverse.traverse(ast).when(success, broke);
      }
    }
  },
  getHTML: functionalStrategy
};
