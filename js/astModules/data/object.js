var utils = require('../../helpers/utils'),
    entityHelpers = require('../../helpers/entityHelpers');
module.exports = function objectTag(types, injected, scopeData) {
    var tObject = {}, typeFunction, nameExists, i, objectForMerge = {}, htmlArray = [];
    function isEntityUsefulOrHTML(nameExists) {
        return nameExists && !this._modules.hasOwnProperty(nameExists) && !entityHelpers.isTagRequirableBool(nameExists);
    }
    objectForMerge = entityHelpers.parseAttributesForData.call(this, injected.attribs, scopeData);
    if (injected.children) {
        injected = injected.children;
    }
    for (i = 0; i < injected.length; i++) {
        nameExists = utils.splitWs(injected[i].name);
        if (isEntityUsefulOrHTML.call(this, nameExists)) {
            if (injected[i].children) {
                typeFunction = types[nameExists];
                if (typeFunction) {
                    return typeFunction.call(this, types, injected[i], scopeData);
                }
                tObject[nameExists] = objectTag.call(this, types, injected[i].children, scopeData);
            }
        } else {
            htmlArray.push(injected[i]);
        }
    }
    if (objectForMerge !== undefined) {
        tObject = utils.merge(tObject, objectForMerge);
    }
    if (htmlArray.length > 0) {
        return htmlArray;
    }
    return tObject;
};
