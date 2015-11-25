define('Core/tmpl/tmpl', ['Core/tmpl/js/traverse', 'Core/tmpl/js/processing'], function (traversing, processing) {
   return {
      template: function template(html, resolver) {
         var parsed = traversing.parse(html);
         return {
            handle: function handleTraverse(success, broke) {
               traversing.traverse(parsed, resolver).when(success, broke);
            }
         };
      },
      html: function html(ast, data) {
         return processing.getHTMLString(ast, data);
      }
   };
});