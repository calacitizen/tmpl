define('Core/tmpl/js/helpers/straightFromFile', ['Core/tmpl/js/helpers/State', 'Core/tmpl/js/helpers/requireFile'], function straightFromFileLoader(State, requireFile) {
   return function straightFromFile(name) {
      var stateMark = State.make();
      requireFile.call(this, name).when(
         function includeTraverse(templateData) {
            this.traversingAST(templateData).when(
               function includeTraverseState(modAST) {
                  stateMark.keep(modAST);
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
      return stateMark.promise;
   };
});
