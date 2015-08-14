var VOW = require('../helpers/VOW');
module.exports = {
  module: function partialModule(tag, data) {
    var assignModuleVar = tag.attribs.data.trim(),
        template = tag.attribs.template.trim(),
        rootVar = 'root',
        scopeData = {};
    
    function resolveStatement(data) {
      var vow = VOW.make();
      this._includeStack[template].when(
        function partialInclude(templateData) {
          if (templateData[template]) {
            scopeData[rootVar] = data[assignModuleVar];
            this.traversingAST(templateData[template], scopeData).when(function partialTraversing(modAST) {
              vow.keep(modAST);
            }, function brokenTraverse(reason) {
              throw new Error(reason);
            });
          } else {
            vow.break('Include tag for "' + template + '" is not found!');
          }
        }.bind(this),
        function brokenPartial(reason) {
          throw new Error(reason);
        }
      );
      return vow.promise;
    }

    return function partialResolve() {
      return resolveStatement.call(this, data);
    }
  }
}
