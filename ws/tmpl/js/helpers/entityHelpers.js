define('Core/tmpl/js/helpers/entityHelpers', ['Core/tmpl/js/helpers/utils', 'Core/tmpl/js/helpers/processExpressions'], function entityHelpersLoader(utils, processExpressions) {
   var entityHelpers = {
      /**
       * is entity - tag
       * @param  {String}  type
       * @return {Boolean}
       */
      isTag: function isTag(type) {
         return type === 'tag';
      },
      /**
       * is entity - text
       * @param  {String}  type
       * @return {Boolean}
       */
      isText: function isText(type) {
         return type === 'text';
      },
      isControl: function isText(type) {
         return type === 'control';
      },
      isControlClass: function isControlClass(controlClass) {
         if (controlClass && controlClass.prototype) {
            return controlClass.prototype.$constructor && controlClass.prototype.superclass;
         }
         return false;
      },
      isFunction: function isFunction(fn) {
         return Object.prototype.toString.call(fn) === '[object Function]';
      },
      /**
       * Match module by name
       * @param  {Object} tag
       * @return {Function}
       */
      parserMatcher: function parserMatcher(tag) {
         return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].parse : false;
      },
      /**
       * Match module by name
       * @param  {Object} name
       * @return {Function}
       */
      attributeParserMatcherByName: function attributeParserMatcherByName(name) {
         return (name !== undefined) ? this._attributeModules[name].module : false;
      },
      /**
       * Match parse by name
       * @param  {Object} tag
       * @return {Function}
       */
      moduleMatcher: function moduleMatcher(tag) {
         var moduleName = utils.splitWs(tag.name);
         return (this._modules[moduleName] !== undefined) ? this._modules[moduleName].module : false;
      },
      /**
       * Load module and execute function
       * @param  {Function} moduleFunction
       * @param  {Object} tag
       * @param  {Object} data
       * @return {Array}
       */
      loadModuleFunction: function loadModuleFunction(moduleFunction, tag, data) {
         var tagModule = moduleFunction(tag, data);
         return tagModule.call(this);
      },
      /**
       * is entity tag - include
       * @param  {String}  name
       * @return {Boolean}
       */
      isTagInclude: function isTagInclude(name) {
         return name === 'ws-include';
      },
      isTagRequirable: function isTagRequreable(name) {
         var wsName = utils.splitWs(name);
         if (wsName) {
            return utils.isUpperCase(utils.getFirstLetter(wsName));
         }
         return false;
      },
      isTagRequirableBool: function isTagRequreableBool(name) {
         return utils.isUpperCase(utils.getFirstLetter(name));
      },
      /**
       * is expression
       * @param  {String}  string
       * @return {Boolean}
       */
      isExpression: function isExpression(string) {
         return string.split('?').length > 1;
      },
      createControlNode: function createControlNode(fn, key) {
         return {
            type: 'control',
            key: key,
            fn: fn
         }
      },
      /**
       * Create data request
       * @param name
       * @returns {{type: string, name: *}}
       */
      createDataRequest: function createDataRequest(name) {
         return {
            type: 'request',
            name: name
         };
      },
      /**
       * Create data object for variable
       * @param  {String} name  lexical name of variable
       * @param  {Undefined} value
       * @return {Object}       data object
       */
      createDataVar: function createDataVar(name, value) {
         return {
            type: 'var',
            name: name,
            value: value
         };
      },
      /**
       * Creating text chuncks
       * @param  {String} value
       * @return {Object}       Object
       */
      createDataText: function createDataText(value) {
         return {
            type: 'text',
            value: value
         };
      },
      /**
       * Creating expression chuncks
       * @param  {String} value
       * @return {Object}       Object
       */
      createDataExpression: function createDataExpression(expression, valueOne, valueTwo) {
         return {
            type: 'expression',
            expression: expression.trim(),
            valueOne: valueOne,
            valueTwo: valueTwo
         };
      },
      createNumberFromString: function createNumberFromString(value) {
         return Number(value);
      },
      parseAttributesForData: function parseAttributesForData(attrs, data) {
         var attr, obj = {};
         function processDataSequence(attributesData, data) {
            var string = '', attrData = attributesData.data, i;
            if (attrData.length) {
               if (attrData.length === 1) {
                  return processExpressions(attrData[0], data, this.calculators);
               }
               for (i = 0; i < attrData.length; i++) {
                  string += processExpressions(attrData[i], data, this.calculators);
               }
               return string;
            }
            return processExpressions(attrData, data, this.calculators);
         }
         if (attrs !== undefined) {
            for (attr in attrs) {
               if (attrs.hasOwnProperty(attr) && attr !== 'template') {
                  obj[attr] = processDataSequence.call(this, attrs[attr], data);
               }
            }
         }
         return obj;
      }
   };
   return entityHelpers;
});