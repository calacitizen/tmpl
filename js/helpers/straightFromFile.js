define('straightFromFile', ['State', 'requireFile'], function straightFromFileLoader() {
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
