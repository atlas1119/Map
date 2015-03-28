/*
* 地图移动、放大、缩小等的句柄
*/

Atlas.Handler = Atlas.Class.extend({
    initialize: function (map) {
        this._map = map;
    },

    enable: function () {
        if (this._enabled) { return; }

        this._enabled = true;
        //子类继承实现
        this.addHooks();
    },

    disable: function () {
        if (!this._enabled) { return; }

        this._enabled = false;
        //子类继承实现
        this.removeHooks();
    },

    enabled: function () {
        return !!this._enabled;
    }
});