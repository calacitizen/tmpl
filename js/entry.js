var Traverse = require("./traverse"),
    functionalStrategy = require("./functionalStrategy");
module.exports = {
  parse: Traverse.parse,
  traverse: function traverse(ast, data) {
    return {
      handle: function (success, broke) {
        Traverse.traverse(ast, data).when(success, broke);
      }
    }
  },
  getHTML: functionalStrategy
};
