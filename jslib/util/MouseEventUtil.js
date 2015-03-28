/*
* Dom事件处理类
*/

Atlas.DomEvent = {
    /* inpired by John Resig, Dean Edwards and YUI addEvent implementations */
    addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

        var id = Atlas.Util.stamp(fn),
			key = '_atlas_' + type + id,
			handler, originalHandler, newType;

        if (obj[key]) { return this; }

        handler = function (e) {
            return fn.call(context || obj, e || Atlas.DomEvent._getEvent());
        };

        if ('addEventListener' in obj) {

            if (type === 'mousewheel') {
                obj.addEventListener('DOMMouseScroll', handler, false);
                obj.addEventListener(type, handler, false);

            } else if ((type === 'mouseenter') || (type === 'mouseleave')) {

                originalHandler = handler;
                newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

                handler = function (e) {
                    if (!Atlas.DomEvent._checkMouse(obj, e)) { return; }
                    return originalHandler(e);
                };

                obj.addEventListener(newType, handler, false);

            } else {
                obj.addEventListener(type, handler, false);
            }

        } else if ('attachEvent' in obj) {
            obj.attachEvent("on" + type, handler);
        }

        obj[key] = handler;

        return this;
    },

    removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

        var id = Atlas.Util.stamp(fn),
			key = '_atlas_' + type + id,
			handler = obj[key];

        if (!handler) { return; }

        if ('removeEventListener' in obj) {

            if (type === 'mousewheel') {
                obj.removeEventListener('DOMMouseScroll', handler, false);
                obj.removeEventListener(type, handler, false);

            } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
                obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
            } else {
                obj.removeEventListener(type, handler, false);
            }
        } else if ('detachEvent' in obj) {
            obj.detachEvent("on" + type, handler);
        }

        obj[key] = null;

        return this;
    },

    stopPropagation: function (e) {

        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
        return this;
    },

    disableClickPropagation: function (el) {

        var stop = Atlas.DomEvent.stopPropagation;

        return Atlas.DomEvent
			.addListener(el, Atlas.Draggable.START, stop)
			.addListener(el, 'click', stop)
			.addListener(el, 'dblclick', stop);
    },

    preventDefault: function (e) {

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return this;
    },

    stop: function (e) {
        return Atlas.DomEvent.preventDefault(e).stopPropagation(e);
    },

    getMousePosition: function (e, container) {

        var body = document.body,
			docEl = document.documentElement,
			x = e.pageX ? e.pageX : e.clientX + body.scrollLeft + docEl.scrollLeft,
			y = e.pageY ? e.pageY : e.clientY + body.scrollTop + docEl.scrollTop,
			pos = new Atlas.Point(x, y);

        return (container ? pos._subtract(Atlas.DomUtil.getViewportOffset(container)) : pos);
    },

    getWheelDelta: function (e) {

        var delta = 0;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            delta = -e.detail / 3;
        }
        return delta;
    },

    // check if element really left/entered the event target (for mouseenter/mouseleave)
    _checkMouse: function (el, e) {

        var related = e.relatedTarget;

        if (!related) { return true; }

        try {
            while (related && (related !== el)) {
                related = related.parentNode;
            }
        } catch (err) {
            return false;
        }
        return (related !== el);
    },

    /*jshint noarg:false */
    _getEvent: function () { // evil magic for IE

        var e = window.event;
        if (!e) {
            var caller = arguments.callee.caller;
            while (caller) {
                e = caller['arguments'][0];
                if (e && window.Event === e.constructor) {
                    break;
                }
                caller = caller.caller;
            }
        }
        return e;
    }
    /*jshint noarg:false */
};

Atlas.DomEvent.on = Atlas.DomEvent.addListener;
Atlas.DomEvent.off = Atlas.DomEvent.removeListener;