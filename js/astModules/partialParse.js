var utils = require('../helpers/utils');
module.exports = {
    module: function partialModule(tag, data) {
        var assignModuleVar = tag.attribs.data.trim(),
            template = tag.attribs.template.trim(),
            rootVar = 'root',
            scopeData = {};

        function resolveStatement() {
            var clonedData = data;
            scopeData[rootVar] = clonedData[assignModuleVar];
            return this._process(tag.children, scopeData);
        }

        return function partialResolve() {
            return resolveStatement.call(this);
        }
    }
}
