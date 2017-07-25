var debouncer = {
    debounce: function(func, wait) {
        var timeout;
        return function() {
            return new Promise((resolve, reject) => {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    resolve(func.apply(context, args));
                };
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(later, wait);
            })
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