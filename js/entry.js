var traversing = require("./traverse"),
    processing = require("./processing");
module.exports = {
    template: function template(html, resolver) {
        var parsed = traversing.parse(html);
        return {
            handle: function handleTraverse(success, broke) {
                traversing.traverse(parsed, resolver).when(success, broke);
            }
        };
    },
    html: function html(ast, data) {
        return processing.getHTMLString(ast, data);
    }
};
