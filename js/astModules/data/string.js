module.exports = function stringTag(types, tag) {
    var children,
        string = '',
        i;
    if (tag.children) {
        children = tag.children;
        for (i = 0; i < children.length; i++) {
            if (children[i].type === "text") {
                string += children[i].data;
            }
        }
    }
    return string;
}