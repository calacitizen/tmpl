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
    }
};
