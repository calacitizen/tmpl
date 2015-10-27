var jsResolver = require('../jison/jsCat'),
    decorators = require('../helpers/decorators');
module.exports = {
    module: function elseModule(tag, data) {
        var source;
        if (tag.prev === undefined || tag.prev.name !== 'ws:if') {
            throw new Error('There is no "if" for "else" module to use');
        }
        source =  tag.prev.attribs.data.data[0].value;
        function resolveStatement() {
            if (!source) {
                if (tag.children !== undefined) {
                    return this._process(tag.children, data);
                }
            }
            return;
        }
        return function elseModuleReturnable() {
            if (tag.children !== undefined) {
                return resolveStatement.call(this);
            }
        };
    }
};
