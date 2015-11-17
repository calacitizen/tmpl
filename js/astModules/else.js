var jsResolver = require('../jison/jsCat'),
   challenge = require('../helpers/challengeModuleValues'),
   utils = require('../helpers/utils'),
   decorators = require('../helpers/decorators');
module.exports = {
   module: function elseModule(tag, data) {
      'use strict';
      var source,
         elseSource,
         elseSourceValue,
         captureElse = false,
         checkSimpleElse = function checkSimpleElse(attribs) {
            var elseAttrib = attribs.else;
            if (elseAttrib) {
               if (elseAttrib.data.type === 'text' && elseAttrib.data.value === 'else') {
                  return false;
               }
            }
            return true;
         };
      try {
         if (tag.prev !== undefined && (tag.prev.name === 'ws:if' || tag.prev.name === 'ws:else')) {
            source = tag.prev.attribs.data.data[0].value;
         } else {
            if (tag.prev.attribs.if) {
               source = tag.prev.attribs.if.data[0].value;
            }
            if (tag.prev.attribs.else) {
               source = tag.prev.attribs.else.data[0].value;
            }
         }
      } catch (err) {
         throw new Error('There is no data for "else" module to use');
      }
      if (tag.attribs !== undefined) {
         captureElse = checkSimpleElse(tag.attribs);
         if (captureElse) {
            elseSource = challenge(tag, 'else');
            elseSourceValue = jsResolver.parse(elseSource.value)(data, decorators);
         }
      }
      function resolveStatement() {
         var clonedData, processed;
         if (captureElse) {
            if (!source) {
               if (elseSourceValue) {
                  if (elseSource.fromAttr) {
                     clonedData = utils.clone(tag.attribs.else.data[0]);
                     clonedData.value = elseSourceValue;
                     tag.attribs.else = undefined;
                     if (elseSourceValue) {
                        processed = this._process([tag], data);
                        tag.attribs.else = { data: [clonedData] };
                        return processed;
                     }
                     tag.attribs.else = { data: [clonedData] };
                  } else {
                     tag.attribs.data.data[0].value = elseSourceValue;
                     if (tag.children !== undefined) {
                        return this._process(tag.children, data);
                     }
                  }

               }
            }
         } else {
            if (!source) {
               if (tag.children !== undefined) {
                  return this._process(tag.children, data);
               }
            }
         }
         return;
      }
      return function elseModuleReturnable() {
         if (tag.children !== undefined) {
            return resolveStatement.call(this);
         }
      };
   }
};
