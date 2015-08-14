var State = require('../helpers/State');
module.exports = {
  module: function partialModule(tag, data) {
    var assignModuleVar = tag.attribs.data.trim(),
        template = tag.attribs.template.trim(),
        rootVar = 'root',
        scopeData = {};

    function resolveStatement(data) {
      var state = State.make();
      this._includeStack[template].when(
        function partialInclude(templateData) {
          if (templateData[template]) {
            scopeData[rootVar] = data[assignModuleVar];
            this.traversingAST(templateData[template], scopeData).when(function partialTraversing(modAST) {
              state.keep(modAST);
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
      return resolveStatement.call(this, data);
    }
  }
}
