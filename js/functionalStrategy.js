module.exports = function universalHTMLGenerator(ast) {
  var HTMLString = astSlice(ast);

  function collectData(data) {
    var dataString = '';
    if (data !== undefined) {
      if (data.type !== undefined) {
        dataString += data.value;
      } else {
        for (var i = 0; i < data.length; i++) {
          if (data[i].value !== undefined) {
            dataString += data[i].value;
          }
        }
      }
    }
    return dataString;
  }

  function generateAttributes(attribs) {
    var attribsString = '';
    if (attribs !== undefined) {
      for (var value in attribs) {
        if (attribs.hasOwnProperty(value)) {
          attribsString = ' ' + value + '="' + collectData(attribs[value].data) + '"';
        }
      }
    }
    return attribsString;
  }

  function generateString(object) {
    if (object.type === 'text') {
      return collectData(object.data);
    }
    return '<' + object.name + generateAttributes(object.attribs) + '>' + astSlice(object.children) + '</' + object.name + '>';
  }

  function astSlice(ast) {
    var string = '';
    if (ast !== undefined) {
      for (var i = 0; i < ast.length; i++) {
        string += generateString(ast[i]);
      }
    }
    return string;
  }

  return HTMLString;
}
