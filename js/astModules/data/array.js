function splitWs(string) {
    var ws;
    if (string !== undefined) {
        ws = string.split('ws:');
        return ws[1];
    }
    return undefined;
}
module.exports = function arrayTag(types, tag) {
    var children,
        array = [],
        nameExists,
        typeFunction,
        i;
    if (tag.children) {
        children = tag.children;
        for (i = 0; i < children.length; i++) {
            nameExists = splitWs(children[i].name);
            if (nameExists) {
                if (children[i].children) {
                    typeFunction = types[nameExists];
                    if (typeFunction) {
                        array.push(typeFunction(types, children[i]));
                    } else {
                        throw new Error(children[i].name + ' property can\'t be in the root of ws:array tag');
                    }
                }
            }
        }
    }
    return array;
}