var Q = require("rauricoste-promise-light");

var debouncer = {
    debounce: function(func, wait) {
        var timeout;
        return function() {
            var defer = Q.defer();
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                  defer.resolve(func.apply(context, args));
            };
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
            return defer.promise;
        };
    },
    debounceByKey: function(func, wait, keyGetter) {
        var debounce = this.debounce;
        var fctMap = {};
        return function() {
            var key = keyGetter.apply(null, arguments);
            var keyFct = fctMap[key];
            if (!keyFct) {
                keyFct = debounce(func, wait);
                fctMap[key] = keyFct;
            }
            return keyFct.apply(null, arguments);
        }
    }
}

module.exports = debouncer;