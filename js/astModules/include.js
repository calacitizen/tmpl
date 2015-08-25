var requireFile = require('../helpers/requireFile');
module.exports = {
  module: function requireOrRetire(tag) {
    var assignModuleVar = tag.attribs.name.trim(),
      template = tag.attribs.template.trim(),
      templatePath = template + '.tmpl';

    function resolveInclude(object) {
      return object;
    }

    function resolveStatement() {
      return requireFile.call(this, templatePath).when(resolveInclude);
    }

    return function includeResolve() {
      return resolveStatement.call(this);
    }
  }
}
