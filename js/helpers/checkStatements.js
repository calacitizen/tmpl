var utils = require('./utils'),
    jsResolver = require('../jison/jsCat'),
    decorators = require('./decorators');
module.exports = function checkStatementForInners(value, scopeData, arrVars) {
    var isVar = utils.inArray(arrVars, value);
    /**
     * Variable or node
     * @param  {Boolean} isVar
     * @param  {[type]}  value
     * @param  {String}  name
     * @return {Object}
     */
    function varOrNot(isVar, value, name) {
        if (isVar) {
            return {
                isVar: isVar,
                name: name,
                value: value
            };
        }
        return {
            isVar: isVar,
            value: value
        };
    }

    if (isVar === true) {
        return varOrNot(isVar, jsResolver.parse(value)(scopeData, decorators), value);
    }

    return varOrNot(isVar, value);
};
