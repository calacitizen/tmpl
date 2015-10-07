var utils = require('../../helpers/utils');
module.exports = function objectTag(types, injected, scopeData) {
    var tObject = {}, typeFunction, nameExists, i;
    if (injected.children) {
        injected = injected.children;
    }
    for (i = 0; i < injected.length; i++) {
        nameExists = utils.splitWs(injected[i].name);
        if (nameExists) {
            if (injected[i].children) {
                typeFunction = types[nameExists];
                if (typeFunction) {
                    return typeFunction.call(this, types, injected[i], scopeData);
                }
                tObject[nameExists] = objectTag.call(this, types, injected[i].children, scopeData);
            }
        }
    }
    return tObject;
};
