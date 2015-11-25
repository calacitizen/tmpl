define('Core/tmpl/js/helpers/requireFileAMD', ['Core/tmpl/js/helpers/State', 'Core/tmpl/js/helpers/entityHelpers'], function requireFileAMDCall(State, entityHelpers) {
   return function requireFile(url) {
      function requireAmdFile(url) {
         var state = State.make();
         requirejs([url], function requireAmdFileHandler(prep) {
            if (prep) {
               state.keep(entityHelpers.createControlNode(prep));
            } else {
               state.break("Wrong including" + url);
            }
         });
         return state.promise;
      }
      return requireAmdFile.call(this, this.resolver(url));
   };
});

