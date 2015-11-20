define('Core/tmpl/js/helpers/challengeModuleValues', function () {
   return function challenge(tag, property, isText) {
      var source;
      try {
         if (tag.attribs.hasOwnProperty(property)) {
            source = {
               fromAttr: true,
               value: isText ? tag.attribs[property].data.value.trim() : tag.attribs[property].data[0].name.trim()
            };
         } else {
            source = {
               fromAttr: false,
               value: isText ? tag.attribs.data.data.value.trim() : tag.attribs.data.data[0].name.trim()
            };
         }
      } catch (err) {
         throw new Error('There is no data for "' + property + '" module to use');
      }
      return source;
   };
});