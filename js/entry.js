var traversing = require("./traverse"),
    processing = require("./processing");
module.exports = {
  parse: traversing.parse,
  html: function html(ast, data) {
    return processing.getHTMLString(ast, data);
  },
  traverse: function traverse(ast) {
    return {
      handle: function handleTraverse(success, broke) {
        traversing.traverse(ast).when(success, broke);
      }
    };
  }
};
