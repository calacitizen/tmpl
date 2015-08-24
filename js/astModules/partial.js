var State = require('../helpers/State'),
    utils = require('../helpers/utils');
module.exports = {
  module: function partialModule(tag) {
    var assignModuleVar = tag.attribs.data.trim(),
        template = tag.attribs.template.trim();
    function resolveStatement() {
      var state = State.make();
      if (this._includeStack[template] === undefined) {
        throw new Error('Include tag for "' + template + '" is not found!');
      }
      this._includeStack[template].when(
        function partialInclude(templateData) {
          if (templateData) {
            this.traversingAST(templateData).when(function partialTraversing(modAST) {
              tag.children = modAST;
              state.keep(tag);
            }, function brokenTraverse(reason) {
              throw new Error(reason);
            });
          } else {
            state.break('Include tag for "' + template + '" is not found!');
          }
        }.bind(this),
        function brokenPartial(reason) {
          throw new Error(reason);
        }
      );
      return state.promise;
    }

    return function partialResolve() {
      return resolveStatement.call(this);
    }
  }
}
