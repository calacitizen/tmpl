var traverseInjectedData = require('../../helpers/traverseInjectedData');
module.exports = function arrayTag(types, tag) {

    function resolveStatement() {
        var children,
            array = [];
        if (tag.children) {
            children = tag.children;
            console.log(children);
            console.log(traverseInjectedData(types, children));
            //for (var i=0; i < children.length; i++) {
            //    console.log(traverseInjectedData(types, children[i]));
            //    array.push();
            //}

        }
        return array;
    }

    return function arrayReturnable() {
        return resolveStatement.call(this);
    };
}