function splitWs(string) {
    var ws;
    if (string !== undefined) {
        ws = string.split('ws:');
        return ws[1];
    }
    return undefined;
}

module.exports = function objectTag(types, injected) {
    var tObject = {}, typeFunction, nameExists, i;

    if (injected.children) {
        injected = injected.children;
    }

    for (i = 0; i < injected.length; i++) {
        nameExists = splitWs(injected[i].name);
        if (nameExists) {
            if (injected[i].children) {
                typeFunction = types[nameExists];
                if (typeFunction) {
                    return typeFunction(types, injected[i]);
                } else {
                    tObject[nameExists] = objectTag(types, injected[i].children);
                }
            }
        }
    }
    return tObject;
};
