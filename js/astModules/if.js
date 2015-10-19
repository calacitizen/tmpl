var jsResolver = require('../jison/jsCat'),
    decorators = require('../helpers/decorators');
module.exports = {
    module: function ifModule(tag, data) {
        var source;
        if (tag.attribs.data.data === undefined) {
            throw new Error('There is no data for "if" module to use');
        }
        source =  tag.attribs.data.data.value.trim();
        function resolveStatement() {
            if (jsResolver.parse(source)(data, decorators)) {
                if (tag.children !== undefined) {
                    return this._process(tag.children, data);
                }
            }
            return;
        }
        return function ifModuleReturnable() {
            if (tag.children !== undefined) {
                return resolveStatement.call(this);
            }
        };
    }
};
