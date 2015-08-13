var whatType = require('./whatType');
module.exports = function checkSource(variableString, scopeData) {

  var varianleSeparator = '.',
      valueArray = variableString.split(varianleSeparator),
      type;

  function checkSourceIns(iterator, array, value) {
     var type = whatType(value);
     if (array.length > (iterator + 1) && type !== 'object') {
       throw new Error('У значения ' + array[iterator] + ' нет свойства: ' + array[iterator + 1]);
     }
     return type;
  }

  for (var i = 0; i < valueArray.length; i++) {
    if (i === 0) {
      chase = scopeData[valueArray[i]];
    } else {
      chase = chase[valueArray[i]];
    }
    type = checkSourceIns(i, valueArray, chase);
  }
  
  return type;
}
