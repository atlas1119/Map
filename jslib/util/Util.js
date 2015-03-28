/*
*  用途库
*/

Atlas.Util = {
    extend: function (dest) {	// merge src properties into dest
        var sources = Array.prototype.slice.call(arguments, 1);
        for (var j = 0, len = sources.length, src; j < len; j++) {
            src = sources[j] || {};
            for (var i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    },

    bind: function (fn, obj) { // (Function, Object) -> Function
        var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function () {
            return fn.apply(obj, args || arguments);
        };
    },

    stamp: (function () {
        var lastId = 0, key = '_atlas_id';
        return function (/*Object*/obj) {
            obj[key] = obj[key] || ++lastId;
            return obj[key];
        };
    } ()),

    limitExecByInterval: function (fn, time, context) {
        var lock, execOnUnlock;

        return function wrapperFn() {
            var args = arguments;

            if (lock) {
                execOnUnlock = true;
                return;
            }

            lock = true;

            setTimeout(function () {
                lock = false;

                if (execOnUnlock) {
                    wrapperFn.apply(context, args);
                    execOnUnlock = false;
                }
            }, time);

            fn.apply(context, args);
        };
    },

    falseFn: function () {
        return false;
    },

    nullFn: function () {
    },
    
    /** * @see 将json字符串转换为对象 * @param json字符串 * @return 返回object,array,string等对象 */
    evalJSON: function (strJson) {
        return eval("(" + strJson + ")");
    },

    formatNum: function (num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
    },

    splitWords: function (str) {
        return str.replace(/^\s+|\s+$/g, '').split(/\s+/);
    },

    setOptions: function (obj, options) {
        obj.options = Atlas.Util.extend({}, obj.options, options);
        return obj.options;
    }

};

(function () {

    function getPrefixed(name) {
        var i, fn,
			prefixes = ['webkit', 'moz', 'o', 'ms'];

        for (i = 0; i < prefixes.length && !fn; i++) {
            fn = window[prefixes[i] + name];
        }

        return fn;
    }

    function timeoutDefer(fn) {
        return window.setTimeout(fn, 1000 / 60);
    }

    var requestFn = window.requestAnimationFrame ||
			getPrefixed('RequestAnimationFrame') || timeoutDefer;

    var cancelFn = window.cancelAnimationFrame ||
			getPrefixed('CancelAnimationFrame') ||
			getPrefixed('CancelRequestAnimationFrame') ||
			function (id) {
			    window.clearTimeout(id);
			};


    Atlas.Util.requestAnimFrame = function (fn, context, immediate, element) {
        fn = Atlas.Util.bind(fn, context);

        if (immediate && requestFn === timeoutDefer) {
            fn();
        } else {
            return requestFn.call(window, fn, element);
        }
    };

    Atlas.Util.cancelAnimFrame = function (id) {
        if (id) {
            cancelFn.call(window, id);
        }
    };

} ());
