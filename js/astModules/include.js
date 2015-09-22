var requireFile = require('../helpers/requireFile'),
    entityHelpers = require('../helpers/entityHelpers'),
    State = require('../helpers/State');
module.exports = {
    parse: function requireOrRetire(tag) {
        var name = tag.attribs.name.trim(),
            template = tag.attribs.template.trim();

        function resolveInclude(object) {
            return object;
        }

        function resolveStatement() {
            var unState = State.make();
            this._includeStack[name] = requireFile.call(this, template).when(resolveInclude);
            unState.keep(entityHelpers.createDataRequest(name));
            return unState.promise;
        }

        return function includeResolve() {
            return resolveStatement.call(this);
        };
    }
};
