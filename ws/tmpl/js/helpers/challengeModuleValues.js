define('Core/tmpl/js/helpers/challengeModuleValues', ['Core/tmpl/js/helpers/processExpressions'], function (processExpressions) {
   return function challenge(tag, property, isText, data) {
      var source;
      try {
         if (tag.attribs.hasOwnProperty(property)) {
            source = {
               fromAttr: true,
               value: isText ? tag.attribs[property].data.value.trim() : processExpressions(tag.attribs[property].data[0].name, data)
            };
         } else {
            source = {
               fromAttr: false,
               value: isText ? tag.attribs.data.data.value.trim() : processExpressions(tag.attribs.data.data[0].name, data)
            };
         }
      } catch (err) {
         throw new Error('There is no data for "' + property + '" module to use');
      }
      return source;
   };
});