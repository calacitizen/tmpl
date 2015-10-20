var traversing = require("./traverse"),
    processing = require("./vdom");
module.exports = {
    template: function template(html, resolver) {
        var parsed = traversing.parse(html);
        return {
            handle: function handleTraverse(success, broke) {
                traversing.traverse(parsed, resolver).when(success, broke);
            }
        };
    },
    vdom: function vdom(ast, data, vdomUtils) {
        return processing.getVdom(ast, data, vdomUtils);
    }
};
