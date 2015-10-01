module.exports = function injectedDataForce(data) {
    var preparedObject = {},
        types = {
            string: require('../astModules/data/string')
        };

    function splitWs(string) {
        var ws = string.split('ws:');
        return ws[1];
    }

    function traverseInjectedData(injected) {
        for (var i=0; i<injected.length; i++) {
            if (injected[i].children) {
                console.log(splitWs(injected[i].name));
                traverseInjectedData(injected[i].children);
            }

        }
    }
    traverseInjectedData(data);
    return preparedObject;
};