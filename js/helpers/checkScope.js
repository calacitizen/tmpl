module.exports = function checkScope(statement, scope) {
  var variableSeparator = '.',
      valueArray = statement.split(variableSeparator),
      newStatement = [];
  for (var i = 0; i < valueArray.length; i++) {
    if (scope.hasOwnProperty(valueArray[i])) {
      newStatement.push(scope[valueArray[i]]);
    } else {
      newStatement.push(valueArray[i]);
    }
  }
  return newStatement.join(variableSeparator);
}
