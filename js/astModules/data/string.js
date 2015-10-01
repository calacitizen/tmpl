module.exports = function stringTag(tag, data) {

    function resolveStatement() {
        var children;
        if (tag.children) {
            children = tag.children;
            for (var i=0; i < children.length; i++) {

            }
        }
    }

    return function stringReturnable() {
        return resolveStatement.call(this);
    };
}