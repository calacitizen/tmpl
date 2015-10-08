var utils = require('../../helpers/utils'),
    entityHelpers = require('../../helpers/entityHelpers');
module.exports = function objectTag(types, injected, scopeData) {
    var tObject = {}, typeFunction, nameExists, i, objectForMerge;

    if (injected.children) {
        objectForMerge = entityHelpers.parseAttributesForData.call(this, injected.attribs, scopeData);
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
        } else {
            return injected[i];
        }
    }

    if (objectForMerge !== undefined) {
        tObject = utils.merge(tObject, objectForMerge);
    }

    return tObject;
};
