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
        if (tag.children === undefined || tag.children.length === 0) {
            throw new Error("There is got to be a children in ws-template tag");
        }
        function templateAST() {
            var unState = State.make();
            this.traversingAST(tag.children).when(
                function partialTraversing(modAST) {
                    unState.keep(modAST);
                },
                function brokenTraverse(reason) {
                    throw new Error(reason);
                }
            );
            return unState.promise;
        }
        function resolveStatement() {
            var requestState = State.make();
            this.includeStack[name] = templateAST.call(this);
            requestState.keep(entityHelpers.createDataRequest(name));
            return requestState.promise;
        }
        return function templateResolve() {
            return resolveStatement.call(this);
        };
    }
};