/*
* 地图拖拽事件
*/

Atlas.Map.Drag = Atlas.Handler.extend({
    addHooks: function () {
        if (!this._draggable) {
            this._draggable = new Atlas.Draggable(this._map._mapPane, this._map._container);
            //对拖拽注册监听
            this._draggable.on({
                'dragstart': this._onDragStart,
                'drag': this._onDrag,
                'dragend': this._onDragEnd
            }, this);

        }
        this._draggable.enable();
    },

    removeHooks: function () {
        this._draggable.disable();
    },

    moved: function () {
        return this._draggable && this._draggable._moved;
    },

    _onDragStart: function () {
        var map = this._map;

        map
			.fire('movestart')
			.fire('dragstart');

    },

    _onDrag: function () {

        this._map
			.fire('move')
			.fire('drag');
    },

    _onDragEnd: function () {
        var map = this._map,
        options = map.options;

        map.fire('moveend');
        map.fire('dragend');

    }
});

Atlas.Map.addInitHook('addHandler', 'dragging', Atlas.Map.Drag);
