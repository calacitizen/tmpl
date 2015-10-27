var utils = require('./utils'),
    jsResolver = require('../jison/jsCat'),
    decorators = require('./decorators');
module.exports = function seekForVars(textData, scopeData) {
    function resolveVariable(variable, data) {
        return jsResolver.parse(variable)(data, decorators);
    }
    var res;
    if (textData.type === 'expression') {
        res = resolveVariable(textData.expression, scopeData);
        textData.value = res;
        return res;
    }
    if (textData.type === 'var') {
        res = resolveVariable(textData.name, scopeData);
        textData.value = res;
        return res;
    }
    return textData.value;
};
