var traversing = require("./traverse"),
    processing = require("./processing");
module.exports = {
  template: function template(html) {
    var parsed = traversing.parse(html);
    return {
      handle: function handleTraverse(success, broke) {
        traversing.traverse(parsed).when(success, broke);
      }
    };
  },
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
