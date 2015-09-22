var State = require('../helpers/State'),
    entityHelpers = require('../helpers/entityHelpers');
module.exports = {
    parse: function templateParse(tag) {
        var name;
        try {
            name = tag.attribs.name.trim();
        } catch (e) {
            throw new Error("Something wrong with name attribute in ws-template tag");
        }
        if (tag.children.length === 0) {
            throw new Error("There is got to be a children in ws-template tag");
        }
        function resolveStatement() {
            var unState = State.make();
            this.templateStack[name] = tag.children;
            unState.keep(entityHelpers.createDataRequest(name));
            return unState.promise;
        }
        return function templateResolve() {
            return resolveStatement.call(this);
        };
    }
};