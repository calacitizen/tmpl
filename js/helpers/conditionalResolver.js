module.exports = function conditionResolver(string) {
    var stArr = string.split(''),
        singleQuote = "'",
        quote = '"',
        colon = ":",
        questionMark = '?',
        boolArr = [],
        everyObj = {},
        qWas = false,
        quoteWas = false,
        length = stArr.length;

    function joinArray(array) {
        return array.splice(0, array.length).join('').trim();
    }

    function isQuote(string) {
        return string === singleQuote || string === quote;
    }

    function isQuestionMark(string) {
        return string === questionMark;
    }

    function isColon(string) {
        return string === colon;
    }

    function isCondition(string) {
        return isQuestionMark(string) && qWas === false && quoteWas === false;
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

    function switchTheQuote(quote) {
        if (quote === false) {
            return true;
        }
        return false;
    }

    for (var i = 0; i < length; i++) {
        if (isQuote(stArr[i])) {
            quoteWas = switchTheQuote(quoteWas);
        }
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