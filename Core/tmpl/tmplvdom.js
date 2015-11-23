define('Core/tmpl/tmplvdom', ['Core/tmpl/js/traverse', 'Core/tmpl/js/vdom'], function (traversing, processing) {
   return {
      template: function template(html, resolver) {
         var parsed = traversing.parse(html);
         return {
            handle: function handleTraverse(success, broke) {
               traversing.traverse(parsed, resolver).when(success, broke);
            }
         };
      },
      vdom: function vdom(ast, data, vdomUtils) {
         return processing.getVdom(ast, data, vdomUtils);
      }
   };
});
