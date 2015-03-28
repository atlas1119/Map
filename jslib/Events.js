/*
* 自定义事件类
*/

var key = '_atlas_events';

Atlas.Custom = {};

Atlas.Custom.Events = {

    addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])
        var events = this[key] = this[key] || {},
			type, i, len;

        // Types can be a map of types/handlers
        if (typeof types === 'object') {
            for (type in types) {
                if (types.hasOwnProperty(type)) {
                    this.addEventListener(type, types[type], fn);
                }
            }

            return this;
        }

        types = Atlas.Util.splitWords(types);

        for (i = 0, len = types.length; i < len; i++) {
            events[types[i]] = events[types[i]] || [];
            events[types[i]].push({
                action: fn,
                context: context || this
            });
        }

        return this;
    },

    hasEventListeners: function (type) { // (String) -> Boolean
        return (key in this) && (type in this[key]) && (this[key][type].length > 0);
    },

    removeEventListener: function (types, fn, context) { // (String[, Function, Object]) or (Object[, Object])
        var events = this[key],
			type, i, len, listeners, j;

        if (typeof types === 'object') {
            for (type in types) {
                if (types.hasOwnProperty(type)) {
                    this.removeEventListener(type, types[type], fn);
                }
            }

            return this;
        }

        types = Atlas.Util.splitWords(types);

        for (i = 0, len = types.length; i < len; i++) {

            if (this.hasEventListeners(types[i])) {
                listeners = events[types[i]];

                for (j = listeners.length - 1; j >= 0; j--) {
                    if (
						(!fn || listeners[j].action === fn) &&
						(!context || (listeners[j].context === context))
					) {
                        listeners.splice(j, 1);
                    }
                }
            }
        }

        return this;
    },

    fireEvent: function (type, data) { // (String[, Object])
        if (!this.hasEventListeners(type)) {
            return this;
        }

        var event = Atlas.Util.extend({
            type: type,
            target: this
        }, data);

        var listeners = this[key][type].slice();

        for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i].action.call(listeners[i].context || this, event);
        }

        return this;
    }
};
//快捷方式
Atlas.Custom.Events.on = Atlas.Custom.Events.addEventListener;
Atlas.Custom.Events.off = Atlas.Custom.Events.removeEventListener;
Atlas.Custom.Events.fire = Atlas.Custom.Events.fireEvent;
