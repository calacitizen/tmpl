module.exports = {
    ucFirst: function ucFirst(string) {
        return string.replace(/^\w/, function (match) {
            return match.toUpperCase();
        });
    },
    toUpperCase: function toUpperCase(string) {
        return string.toUpperCase();
    },
    trim: function trim(string) {
        return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    },
    substr: function substr(string, start, length) {
        return string.substr(start, length);
    },
    replace: function replace(string, pattern, newPattern) {
        return string.replace(pattern, newPattern);
    }
};