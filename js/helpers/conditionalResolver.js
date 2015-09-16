module.exports = function conditionResolver(string) {
    var stArr = string.split(''),
        singleQuote = "'",
        quote = '"',
        colon = ":",
        questionMark = '?',
        boolArr = [],
        everyObj = {},
        qWas = false,
        length = stArr.length;

    function joinArray(array) {
        return array.splice(0, array.length).join('').trim();
    }

    function isQuestionMark(string) {
        return string === questionMark;
    }

    function isColon(string) {
        return string === colon;
    }

    function isCondition(string) {
        return isQuestionMark(string) && qWas === false;
    }

    function isFirstPartOfDeal(string) {
        return isColon(string) && qWas === true;
    }

    function isLast(iterator, length) {
        return (iterator + 1) === length && qWas === true;
    }

    function resolveValueOfConditional(object, array) {
        if (object.valOne === undefined) {
            object.valOne = joinArray(array);
        } else {
            object.valTwo = joinArray(array);
        }
        return object;
    }

    for (var i = 0; i < length; i++) {
        if (isCondition(stArr[i])) {
            everyObj.condition = joinArray(boolArr);
            qWas = true;
        }
        else if (isFirstPartOfDeal(stArr[i])) {
            everyObj.valOne = joinArray(boolArr);
        }
        else {
            boolArr.push(stArr[i]);
        }
        if (isLast(i, length)) {
            everyObj = resolveValueOfConditional(everyObj, boolArr);
        }
    }
    return everyObj;
};