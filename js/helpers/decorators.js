module.exports = {
    ucFirst: function ucFirst() {
        return this.replace(/^\w/, function (match) {
            return match.toUpperCase();
        });
    },
    toUpperCase: function toUpperCase() {
        return this.toUpperCase();
    },
    trim: function trim() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    },
    substr: function substr(start, length) {
        return this.substr(start, length);
    },
    replace: function replace(pattern, newPattern) {
        return this.replace(pattern, newPattern);
    }
};