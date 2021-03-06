﻿/*
* Dom操作类（参照Openlayers）
*/

Atlas.DomUtil = {
    get: function (id) {
        return (typeof id === 'string' ? document.getElementById(id) : id);
    },

    getStyle: function (el, style) {
        var value = el.style[style];
        if (!value && el.currentStyle) {
            value = el.currentStyle[style];
        }
        if (!value || value === 'auto') {
            var css = document.defaultView.getComputedStyle(el, null);
            value = css ? css[style] : null;
        }
        return (value === 'auto' ? null : value);
    },

    getViewportOffset: function (element) {
        var top = 0,
			left = 0,
			el = element,
			docBody = document.body;

        do {
            top += el.offsetTop || 0;
            left += el.offsetLeft || 0;

            if (el.offsetParent === docBody &&
					Atlas.DomUtil.getStyle(el, 'position') === 'absolute') {
                break;
            }
            if (Atlas.DomUtil.getStyle(el, 'position') === 'fixed') {
                top += docBody.scrollTop || 0;
                left += docBody.scrollLeft || 0;
                break;
            }

            el = el.offsetParent;
        } while (el);

        el = element;

        do {
            if (el === docBody) {
                break;
            }

            top -= el.scrollTop || 0;
            left -= el.scrollLeft || 0;

            el = el.parentNode;
        } while (el);

        return new Atlas.Point(left, top);
    },

    create: function (tagName, className, container) {
        var el = document.createElement(tagName);
        el.className = className;
        if (container) {
            container.appendChild(el);
        }
        return el;
    },

    disableTextSelection: function () {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        }
        if (!this._onselectstart) {
            this._onselectstart = document.onselectstart;
            document.onselectstart = Atlas.Util.falseFn;
        }
    },

    enableTextSelection: function () {
        document.onselectstart = this._onselectstart;
        this._onselectstart = null;
    },

    hasClass: function (el, name) {
        return (el.className.length > 0) &&
				new RegExp("(^|\\s)" + name + "(\\s|$)").test(el.className);
    },

    addClass: function (el, name) {
        if (!Atlas.DomUtil.hasClass(el, name)) {
            el.className += (el.className ? ' ' : '') + name;
        }
    },

    removeClass: function (el, name) {
        function replaceFn(w, match) {
            if (match === name) {
                return '';
            }
            return w;
        }
        el.className = el.className
				.replace(/(\S+)\s*/g, replaceFn)
				.replace(/(^\s+|\s+$)/, '');
    },

    setOpacity: function (el, value) {

        if ('opacity' in el.style) {
            el.style.opacity = value;

        } else if (Atlas.Browser.ie) {

            var filter = false,
				filterName = 'DXImageTransform.Microsoft.Alpha';

            // filters collection throws an error if we try to retrieve a filter that doesn't exist
            try { filter = el.filters.item(filterName); } catch (e) { }

            value = Math.round(value * 100);

            if (filter) {
                filter.Enabled = (value !== 100);
                filter.Opacity = value;
            } else {
                el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
            }
        }
    },

    testProp: function (props) {
        var style = document.documentElement.style;

        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    },

    getTranslateString: function (point) {

        var is3d = Atlas.Browser.webkit3d,
			open = 'translate' + (is3d ? '3d' : '') + '(',
			close = (is3d ? ',0' : '') + ')';

        return open + point.x + 'px,' + point.y + 'px' + close;
    },

    getScaleString: function (scale, origin) {

        var preTranslateStr = Atlas.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
		    scaleStr = ' scale(' + scale + ') ';

        return preTranslateStr + scaleStr;
    },

    setPosition: function (el, point, disable3D) {
        el._atlas_pos = point;
        if (!disable3D && Atlas.Browser.any3d) {
            el.style[Atlas.DomUtil.TRANSFORM] = Atlas.DomUtil.getTranslateString(point);

        } else {
            el.style.left = point.x + 'px';
            el.style.top = point.y + 'px';
        }
    },

    getPosition: function (el) {
        return el._atlas_pos;
    }
};

Atlas.Util.extend(Atlas.DomUtil, {
    TRANSITION: Atlas.DomUtil.testProp(['transition', 'webkitTransition', 'OTransition', 'MozTransition', 'msTransition']),
    TRANSFORM: Atlas.DomUtil.testProp(['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'])
});
