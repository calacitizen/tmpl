var State = require('../helpers/State'),
    utils = require('../helpers/utils');
module.exports = {
  module: function requireOrRetire(tag) {
    var assignModuleVar = tag.attribs.name.trim(),
      template = tag.attribs.template.trim(),
      templatePath = template + '.tmpl',
      templateBody, req, text, ast,
      isNode = utils.isNode();

      if (isNode === false) {
        define('fs', function restrainFs() {
          return {};
        });
      }

    function createRequest(url) {
      var request = new XMLHttpRequest();
      request.open('GET', url);
      request.send();
      return request;
    }

    function readFile(url) {
      var fs,
        state = State.make();
      try {
        fs = requirejs('fs');
      } catch (e) {
        throw new Error("There is no requirejs for node included");
      }
      fs.readFile('./' + url, function readFileCallback(err, data) {
        if (err) {
          state.break(err);
        } else {
          state.keep(this.parse(data));
        }
      }.bind(this));
      return state.promise;
    }

    function workOutAsync(req) {
      var state = State.make();
      req.onreadystatechange = function requestHandler() {
        if (req.readyState == 4 && req.status == 200) {
          state.keep(this.parse(req.responseText));
        }
      }.bind(this);
      return state.promise;
    }

    function resolveInclude(object) {
      return object;
    }

    function resolveStatement() {
      if (isNode === false) {
        req = createRequest(templatePath);
        return workOutAsync.call(this, req).when(resolveInclude);
      }
      return readFile.call(this, templatePath).when(resolveInclude);
    }

    return function includeResolve() {
      return resolveStatement.call(this);
    }
  }
}
