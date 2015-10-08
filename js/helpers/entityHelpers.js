module.exports = {
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
    /**
     * Match module by name
     * @param  {Object} tag
     * @return {Function}
     */
    parserMatcher: function parserMatcher(tag) {
        return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].parse : false;
    },
    /**
     * Match parse by name
     * @param  {Object} tag
     * @return {Function}
     */
    moduleMatcher: function moduleMatcher(tag) {
        return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].module : false;
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
    /**
     * is expression
     * @param  {String}  string
     * @return {Boolean}
     */
    isExpression: function isExpression(string) {
        return string.split('?').length > 1;
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
    parseAttributesForData: function parseAttributesForData(attrs, data) {
        var attr, obj = {};
        function processDataSequence(attributesData, data) {
            var string = '', attrData = attributesData.data, i;
            if (attrData.length) {
                if (attrData.length === 1) {
                    return this._processDataTypes(attrData[0], data);
                }
                for (i = 0; i < attrData.length; i++) {
                    string += this._processDataTypes(attrData[i], data);
                }
                return string;
            }
            return this._processDataTypes(attrData, data);
        }
        if (attrs !== undefined) {
            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    obj[attr] = processDataSequence.call(this, attrs[attr], data);
                }
            }
        }
        return obj;
    }
};
