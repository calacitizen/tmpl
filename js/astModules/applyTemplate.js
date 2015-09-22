var State = require('../helpers/State');
module.exports = {
    parse: function templateModule(tag) {
        var name;
        try {
            name = tag.attribs.name.trim();
        } catch (e) {
            throw new Error('Something wrong with name attribute in ws-applytemplate tag');
        }
        function resolveStatement() {
            var stateTemplate = State.make();
            if (this.templateStack[name] === undefined) {
                throw new Error('There is no ws-template tag with "' + name + '" name');
            }
            this.traversingAST(this.templateStack[name]).when(
                function partialTraversing(modAST) {
                    tag.children = modAST;
                    stateTemplate.keep(tag);
                },
                function brokenTraverse(reason) {
                    throw new Error(reason);
                }
            );
            return stateTemplate.promise;
        }
        return function templateResolve() {
            return resolveStatement.call(this);
        };
    },
    module: function templateModule(tag, data) {
        var assignVar;
        if (tag.attribs.data) {
            assignVar = tag.attribs.data.trim();
        }
        function resolveStatement() {
            return this._process(tag.children, data[assignVar]);
        }
        return function templateResolve() {
            return resolveStatement.call(this);
        };
    }
};