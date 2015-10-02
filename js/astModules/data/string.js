module.exports = function stringTag(tag) {

    function resolveStatement() {
        var children,
            string = '';
        if (tag.children) {
            children = tag.children;
            for (var i=0; i < children.length; i++) {
                if (children[i].type === "text") {
                    string += children[i].data;
                }
            }
        }
        return string;
    }

    return function stringReturnable() {
        return resolveStatement.call(this);
    };
}