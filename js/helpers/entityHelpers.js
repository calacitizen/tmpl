module.exports = {
  /**
   * Is tag?
   */
  isTag: function isTag(type) {
    return type === 'tag';
  },
  /**
   * Is text?
   */
  isText: function isText(type) {
    return type === 'text';
  },
  /**
   * Searching modules by the tag names
   */
  moduleMatcher: function moduleMatcher(tag) {
    return (this._modules[tag.name] !== undefined) ? this._modules[tag.name].module : false;
  },
  /**
   * Loading module function
   */
  loadModuleFunction: function loadModuleFunction(moduleFunction, tag, data) {
    var tagModule = moduleFunction(tag, data);
    return tagModule.call(this);
  },
  isTagInclude: function isTagInclude(name) {
    return name === 'include';
  }
};
