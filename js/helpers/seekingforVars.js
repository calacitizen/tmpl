var utils = require('./utils'),
    jsResolver = require('../jison/jsCat'),
    decorators = require('./decorators');
module.exports = function seekForVars(textData, scopeData) {
    if (textData.type === 'expression') {
        return jsResolver.parse(textData.expression)(scopeData, decorators);
    }
    if (textData.type === 'var') {
        return jsResolver.parse(textData.name)(scopeData, decorators);
    }
    return textData.value;
};
