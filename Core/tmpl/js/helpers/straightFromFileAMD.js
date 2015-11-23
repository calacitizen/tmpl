define('Core/tmpl/js/helpers/straightFromFileAMD', ['Core/tmpl/js/helpers/State', 'Core/tmpl/js/helpers/requireFileAMD'], function straightFromFileLoader(State, requireFile) {
   return function straightFromFileAMD(name) {
      var stateMark = State.make();
      requireFile.call(this, name).when(
         function includeTraverse(templateData) {
            if (templateData.type !== 'control') {
               this.traversingAST(templateData).when(
                  function includeTraverseState(modAST) {
                     stateMark.keep(modAST);
                  }.bind(this),
                  function brokenTraverse(reason) {
                     throw new Error(reason);
                  }
               );
            } else {
               stateMark.keep([templateData]);
            }
         }.bind(this),
         function (reason) {
            throw new Error(reason);
         }
      );
      return stateMark.promise;
   };
});
