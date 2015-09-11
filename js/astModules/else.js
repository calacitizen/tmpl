var conditional = require('../helpers/conditional');
module.exports = {
    module: function elseModule(tag, data) {
        var source;
        if (tag.prev === undefined || tag.prev.name !== 'ws-if') {
            throw new Error('There is no "if" for "else" module to use');
        }

        source =  tag.prev.attribs.data.trim();

        function resolveStatement() {
            if (!conditional(source, data)) {
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
