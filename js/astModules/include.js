var requireFile = require('../helpers/requireFile'),
    entityHelpers = require('../helpers/entityHelpers'),
    State = require('../helpers/State');
module.exports = {
    parse: function requireOrRetire(tag) {
        var name = tag.attribs.name.trim(),
            template = tag.attribs.template.trim();
        function straightFromFile() {
            var unState = State.make();
            requireFile.call(this, template).when(
                function includeTraverse(templateData) {
                    this.traversingAST(templateData).when(
                        function includeTraverseState(modAST) {
                            unState.keep(modAST);
                        }.bind(this),
                        function brokenTraverse(reason) {
                            throw new Error(reason);
                        }
                    );
                }.bind(this),
                function (reason) {
                    throw new Error(reason);
                }
            );
            return unState.promise;
        }

        function resolveStatement() {
            var st = State.make();
            this.includeStack[name] = straightFromFile.call(this);
            st.keep(entityHelpers.createDataRequest(name));
            return st.promise;
        }

        return function includeResolve() {
            return resolveStatement.call(this);
        };
    }
};
