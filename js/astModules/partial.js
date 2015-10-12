var State = require('../helpers/State'),
    utils = require('../helpers/utils'),
    injectedDataForce = require('../helpers/injectedDataForce');
module.exports = {
    parse: function partialParse(tag) {
        var tagData = tag.children;
        function resolveStatement() {
            var state = State.make(),
                attribs = this._traverseTagAttributes(tag.attribs),
                template = attribs.template.data;
            if (template.length > 0) {
                tag.injectedTemplate = template[0];
                state.keep(tag);
            } else {
                template = template.value.trim();
                if (this.includeStack[template] === undefined) {
                    throw new Error('Include tag for "' + template + '" is not found!');
                }
                this.includeStack[template].when(
                    function partialInclude(modAST) {
                        if (modAST) {
                            tag.children = modAST;
                            if (tagData) {
                                this.traversingAST(tagData).when(
                                    function dataTraversing(tagDataAst) {
                                        tag.injectedData = tagDataAst;
                                        state.keep(tag);
                                    }.bind(this)
                                );
                            } else {
                                state.keep(tag);
                            }
                        } else {
                            state.break('Include tag for "' + template + '" is not found!');
                        }
                    }.bind(this),
                    function brokenPartial(reason) {
                        throw new Error(reason);
                    }
                );
            }
            return state.promise;
        }

        return function partialResolve() {
            return resolveStatement.call(this);
        };
    },
    module: function partialModule(tag, data) {

        var assignModuleVar = tag.attribs.data,
            rootVar = '__root',
            scopeData = {},
            injected = {};

        function resolveStatement() {
            if (tag.injectedData) {
                injected = injectedDataForce.call(this, tag.injectedData, data);
            }
            if (tag.injectedTemplate) {
                assignModuleVar = tag.injectedTemplate.name.trim();
                scopeData = injected;
                scopeData[rootVar] = scopeData;
                return this._process(data[assignModuleVar], scopeData);
            }
            scopeData = (injected ? injected : data[assignModuleVar.trim()]);
            scopeData[rootVar] = scopeData;
            return this._process(tag.children, scopeData);
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    }
};
