module.exports = function injectedDataForce(data) {
    var preparedObject,
        types = {
            string: require('../astModules/data/string')
        };

    function splitWs(string) {
        var ws;
        if (string !== undefined) {
            ws = string.split('ws:');
            return ws[1];
        }
        return undefined;
    }

    function traverseInjectedData(injected) {
        var mFunction, propName, tValue, tObject = {};
        for (var i=0; i<injected.length; i++) {
            if (splitWs(injected[i].name)) {
                if (injected[i].children) {
                    if (types[splitWs(injected[i].name)]) {
                        mFunction = types[splitWs(injected[i].name)](injected[i]);
                        return mFunction();
                    } else {
                        propName = splitWs(injected[i].name);
                        tObject[propName] = traverseInjectedData(injected[i].children);
                    }
                }
            }
        }
        return tObject;
    }
    return traverseInjectedData(data);
};