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
    return name === 'include';
  }
};
