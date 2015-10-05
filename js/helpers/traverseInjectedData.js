function splitWs(string) {
    var ws;
    if (string !== undefined) {
        ws = string.split('ws:');
        return ws[1];
    }
    return undefined;
}

function dataFlowAssimilation(injected, types) {
    var nameExists = splitWs(injected.name),
        propName,
        typeFunction,
        mFunction;
    if (nameExists) {
        if (injected[i].children) {
            typeFunction = types[nameExists];
            if (typeFunction) {
                mFunction = typeFunction(types, injected);
                return mFunction();
            } else {
                propName = splitWs(injected.name);
                return traverseInjectedData(types, injected.children);
            }
        }
    }
}

module.exports = function traverseInjectedData(types, injected) {
    var mFunction,
        propName,
        tObject = {},
        typeFunction,
        nameExists;
    for (var i = 0; i < injected.length; i++) {

    }
    return tObject;
}