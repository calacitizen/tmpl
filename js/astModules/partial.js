var State = require('../helpers/State'),
    utils = require('../helpers/utils'),
    injectedDataForce = require('../helpers/injectedDataForce');
module.exports = {
    parse: function partialParse(tag) {
        var tagData = tag.children;
        function resolveInjectedData(state, tag, injectingData) {
            if (injectingData) {
                this.traversingAST(injectingData).when(
                    function dataTraversing(tagDataAst) {
                        tag.injectedData = tagDataAst;
                        state.keep(tag);
                    }.bind(this)
                );
            } else {
                state.keep(tag);
            }
            return state;
        }
        function resolveStatement() {
            var state = State.make(),
                attribs = this._traverseTagAttributes(tag.attribs),
                template;
            if (attribs.template === undefined) {
                throw new Error("No template tag for partial " + tag.name);
            }
            template = attribs.template.data;
            tag.attribs = attribs;
            if (template.length > 0) {
                tag.injectedTemplate = template[0];
                state = resolveInjectedData.call(this, state, tag, tagData);
            } else {
                template = template.value.trim();
                if (this.includeStack[template] === undefined) {
                    throw new Error('Include tag for "' + template + '" is not found!');
                }
                this.includeStack[template].when(
                    function partialInclude(modAST) {
                        if (modAST) {
                            tag.children = modAST;
                            state = resolveInjectedData.call(this, state, tag, tagData);
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
            scopeData = {};
        function resolveStatement() {
            scopeData = injectedDataForce.call(this, { children: tag.injectedData, attribs: tag.attribs }, data);
            scopeData[rootVar] = scopeData;
            if (tag.injectedTemplate) {
                assignModuleVar = tag.injectedTemplate.name.trim();
                return this._process(data[assignModuleVar], scopeData);
            }
            return this._process(tag.children, scopeData);
        }
        return function partialResolve() {
            return resolveStatement.call(this);
        };
    }
};
