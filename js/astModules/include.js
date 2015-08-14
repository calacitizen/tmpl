var VOW = require('../helpers/VOW'),
    utils = require('../helpers/utils');
module.exports = {
  module: function requireOrRetire(tag, data, cb) {
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
        vow = VOW.make();
      try {
        fs = requirejs('fs');
      } catch (e) {
        throw new Error("There is no requirejs for node included");
      }
      fs.readFile('./' + url, function readFileCallback(err, data) {
        if (err) {
          vow.break(err);
        } else {
          vow.keep(this.parse(data));
        }
      }.bind(this));
      return vow.promise;
    }

    function workOutAsync(req) {
      var vow = VOW.make();
      req.onreadystatechange = function requestHandler() {
        if (req.readyState == 4 && req.status == 200) {
          vow.keep(this.parse(req.responseText));
        }
      }.bind(this);
      return vow.promise;
    }

    function resolveInclude(object) {
      data[assignModuleVar] = object;
      return data;
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
