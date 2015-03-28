/*
* Atlas.Map
*/

Atlas.Map = Atlas.Class.extend({

    includes: Atlas.Custom.Events,

    options: {
        //openlayers
        crs: Atlas.CRS.EPSG3857,

        /*
        layers: Array,
        maxBounds:null,                                                               //（地图范围，必填）
        zoomAnimation: false,
        */
        zoomAnimation: true,
        dragging: true,                                                                  //支持地图拖拽
        scrollWheelZoom: true,                                                  //是否加入滚轴事件实现放大缩小
        trackResize: true                                                              //窗口发生变化时，矢量地图复位
    },

    initialize: function (id, options) { // (HTMLElement or String, Object)
        options = Atlas.Util.setOptions(this, options);

        this._initContainer(id);
        this._initLayout();
        this._initHooks();
        this._initEvents();

        if (options.maxBounds) {
            this.setMaxBounds(options.maxBounds);
            //显示到适合bounds位置
            this.fitBounds(options.maxBounds);
        }

        this._initLayers(options.layers);
    },


    setView: function (center, zoom) {
        this._resetView(Atlas.latLng(center), this._limitZoom(zoom));
        return this;
    },

    setZoom: function (zoom) { // (Number)
        return this.setView(this.getCenter(), zoom);
    },

    zoomIn: function () {
        return this.setZoom(this._zoom + 1);
    },

    zoomOut: function () {
        return this.setZoom(this._zoom - 1);
    },

    fitBounds: function (bounds) { // (LatLngBounds)
        var zoom = this.getBoundsZoom(bounds);
        return this.setView(Atlas.latLngBounds(bounds).getCenter(), zoom);
    },

    fitWorld: function () {
        var sw = new Atlas.LatLng(-60, -170),
		    ne = new Atlas.LatLng(85, 179);

        return this.fitBounds(new Atlas.LatLngBounds(sw, ne));
    },

    panTo: function (center) { // (LatLng)
        return this.setView(center, this._zoom);
    },

    panBy: function (offset) { // (Point)
        this.fire('movestart');

        this._rawPanBy(Atlas.point(offset));

        this.fire('move');
        return this.fire('moveend');
    },

    setMaxBounds: function (bounds) {
        bounds = Atlas.latLngBounds(bounds);

        this.options.maxBounds = bounds;

        if (!bounds) {
            this._boundsMinZoom = null;
            return this;
        }

        var minZoom = this.getBoundsZoom(bounds, true);

        this._boundsMinZoom = minZoom;

        if (this._loaded) {
            this.panInsideBounds(bounds);
        }

        return this;
    },

    panInsideBounds: function (bounds) {
        bounds = Atlas.latLngBounds(bounds);

        var viewBounds = this.getBounds(),
		    viewSw = this.project(viewBounds.getSouthWest()),
		    viewNe = this.project(viewBounds.getNorthEast()),
		    sw = this.project(bounds.getSouthWest()),
		    ne = this.project(bounds.getNorthEast()),
		    dx = 0,
		    dy = 0;

        if (viewNe.y < ne.y) { // north
            dy = ne.y - viewNe.y;
        }
        if (viewNe.x > ne.x) { // east
            dx = ne.x - viewNe.x;
        }
        if (viewSw.y > sw.y) { // south
            dy = sw.y - viewSw.y;
        }
        if (viewSw.x < sw.x) { // west
            dx = sw.x - viewSw.x;
        }

        return this.panBy(new Atlas.Point(dx, dy, true));
    },

    addLayer: function (layer) {
        // TODO method is too big, refactor

        var id = Atlas.Util.stamp(layer);

        if (this._layers[id]) { return this; }

        this._layers[id] = layer;

        var onMapLoad = function () {
            layer.onAdd(this);
            this.fire('layeradd', { layer: layer });
        };

        if (this._loaded) {
            onMapLoad.call(this);
        } else {
            this.on('load', onMapLoad, this);
        }

        return this;
    },
    
    addLayers: function (layers) {
        layers = layers ? (layers instanceof Array ? layers : [layers]) : [];

        var i, len;

        for (i = 0, len = layers.length; i < len; i++) {
            this.addLayer(layers[i]);
        }
        
        //加载完成
        this.fire('alllayeradded');
        
        return this;
    },

    removeLayer: function (layer) {
        var id = Atlas.Util.stamp(layer);

        if (!this._layers[id]) { return; }

        layer.onRemove(this);

        delete this._layers[id];

        return this.fire('layerremove', { layer: layer });
    },

    hasLayer: function (layer) {
        var id = Atlas.Util.stamp(layer);
        return this._layers.hasOwnProperty(id);
    },
    
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	removeControl: function (control) {
		control.removeFrom(this);
		return this;
	},
	
    //窗口发生变化时
    invalidateSize: function (animate) {
        var oldSize = this.getSize();

        this._sizeChanged = true;

        if (this.options.maxBounds) {
            this.setMaxBounds(this.options.maxBounds);
        }

        if (!this._loaded) { return this; }

        var offset = oldSize.subtract(this.getSize()).divideBy(2, true);

        if (animate === true) {
            this.panBy(offset);
        } else {
            this._rawPanBy(offset);

            this.fire('move');

            clearTimeout(this._sizeTimer);
            this._sizeTimer = setTimeout(Atlas.Util.bind(this.fire, this, 'moveend'), 200);
        }
        return this;
    },

    // TODO 添加句柄
    addHandler: function (name, HandlerClass) {
        if (!HandlerClass) { return; }

        this[name] = new HandlerClass(this);

        if (this.options[name]) {
            this[name].enable();
        }

        return this;
    },


    // 公用方法

    getCenter: function () { // (Boolean) -> LatLng
        return this.layerPointToLatLng(this._getCenterLayerPoint());
    },

    getZoom: function () {
        return this._zoom;
    },

    getBounds: function () {
        var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

        return new Atlas.LatLngBounds(sw, ne);
    },
    //获取最小级数
    getMinZoom: function () {
        //矢量地图级数最小负无穷
        return Number.NEGATIVE_INFINITY;
    },
    //获取最大级数
    getMaxZoom: function () {
        //矢量地图级数最大正无穷
        return Number.POSITIVE_INFINITY;
    },

    getBoundsZoom: function (bounds, inside) { // (LatLngBounds, Boolean) -> Number
        bounds = Atlas.latLngBounds(bounds);

        var size = this.getSize(),
		    zoom = 0,
		    maxZoom = this.getMaxZoom(),
		    ne = bounds.getNorthEast(),
		    sw = bounds.getSouthWest(),
		    boundsSize,
		    nePoint,
		    swPoint,
		    zoomNotFound = true;

        if (inside) {
            zoom--;
        }

        do {
            zoom++;
            nePoint = this.project(ne, zoom);
            swPoint = this.project(sw, zoom);
            boundsSize = new Atlas.Point(Math.abs(nePoint.x - swPoint.x), Math.abs(swPoint.y - nePoint.y));

            if (!inside) {
                zoomNotFound = boundsSize.x <= size.x && boundsSize.y <= size.y;
            } else {
                zoomNotFound = boundsSize.x < size.x || boundsSize.y < size.y;
            }
        } while (zoomNotFound && zoom <= maxZoom);

        if (zoomNotFound && inside) {
            return null;
        }

        return inside ? zoom : zoom - 1;
    },

    getSize: function () {
        if (!this._size || this._sizeChanged) {
            this._size = new Atlas.Point(
				this._container.clientWidth,
				this._container.clientHeight);

            this._sizeChanged = false;
        }
        return this._size;
    },

    getPixelBounds: function () {
        var topLeftPoint = this._getTopLeftPoint();
        return new Atlas.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
    },

    getPixelOrigin: function () {
        return this._initialTopLeftPoint;
    },

    getPanes: function () {
        return this._panes;
    },

    getContainer: function () {
        return this._container;
    },


    //

    getZoomScale: function (toZoom) {
        var crs = this.options.crs;
        return crs.scale(toZoom) / crs.scale(this._zoom);
    },

    getScaleZoom: function (scale) {
        return this._zoom + (Math.log(scale) / Math.LN2);
    },


    /********************************************************/
    /*                                                      */
    /*             地图坐标点转换                            */
    /*                                                      */
    /********************************************************/

    /**
    * APIMethod: project
    * 将经纬度转成几何坐标
    */
    project: function (latlng, zoom) { // (LatLng[, Number]) -> Point
        zoom = zoom === undefined ? this._zoom : zoom;
        return this.options.crs.latLngToPoint(Atlas.latLng(latlng), zoom);
    },
    /**
    * APIMethod: unproject
    * 将几何坐标转成经纬度
    */
    unproject: function (point, zoom) { // (Point[, Number]) -> LatLng
        zoom = zoom === undefined ? this._zoom : zoom;
        return this.options.crs.pointToLatLng(Atlas.point(point), zoom);
    },
    /**
    * APIMethod: layerPointToLatLng
    * 将图层坐标转成经纬度
    */
    layerPointToLatLng: function (point) { // (Point)
        var projectedPoint = Atlas.point(point).add(this._initialTopLeftPoint);
        return this.unproject(projectedPoint);
    },
    /**
    * APIMethod: latLngToLayerPoint
    * 将经纬度转成图层坐标
    */
    latLngToLayerPoint: function (latlng) { // (LatLng)
        var projectedPoint = this.project(Atlas.latLng(latlng))._round();
        return projectedPoint._subtract(this._initialTopLeftPoint);
    },
    /**
    * APIMethod: containerPointToLayerPoint
    * 将容器坐标转成图层坐标
    */
    containerPointToLayerPoint: function (point) { // (Point)
        return Atlas.point(point).subtract(this._getMapPanePos());
    },
    /**
    * APIMethod: layerPointToContainerPoint
    * 将图层坐标转成容器坐标
    */
    layerPointToContainerPoint: function (point) { // (Point)
        return Atlas.point(point).add(this._getMapPanePos());
    },
    /**
    * APIMethod: containerPointToLatLng
    * 将容器坐标转成经纬度
    */
    containerPointToLatLng: function (point) {
        var layerPoint = this.containerPointToLayerPoint(Atlas.point(point));
        return this.layerPointToLatLng(layerPoint);
    },
    /**
    * APIMethod: latLngToContainerPoint
    * 将经纬度转成容器坐标
    */
    latLngToContainerPoint: function (latlng) {
        return this.layerPointToContainerPoint(this.latLngToLayerPoint(Atlas.latLng(latlng)));
    },

    ///////////和鼠标结合///////////////////
    /**
    * APIMethod: mouseEventToContainerPoint
    * 将鼠标坐标转成容器坐标
    */
    mouseEventToContainerPoint: function (e) { // (MouseEvent)
        return Atlas.DomEvent.getMousePosition(e, this._container);
    },
    /**
    * APIMethod: mouseEventToLayerPoint
    * 将鼠标坐标转成图层坐标
    */
    mouseEventToLayerPoint: function (e) { // (MouseEvent)
        return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
    },
    /**
    * APIMethod: mouseEventToLatLng
    * 将鼠标坐标转成经纬度
    */
    mouseEventToLatLng: function (e) { // (MouseEvent)
        return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
    },


    /********************************************************/
    /*                                                      */
    /*             地图初始化                                */
    /*                                                      */
    /********************************************************/

    _initContainer: function (id) {
        var container = this._container = Atlas.DomUtil.get(id);

        if (container._atlas) {
            throw new Error("地图容器已经初始化！");
        }

        container._atlas = true;
    },
    /**
     * APIMethod: _initLayout
     * 初始化布局
     */
    _initLayout: function () {
        var container = this._container;

        container.innerHTML = '';
        Atlas.DomUtil.addClass(container, 'atlas-container');


        var position = Atlas.DomUtil.getStyle(container, 'position');

        if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
            container.style.position = 'relative';
        }

        this._initPanes();

        //初始化控件位置
        this._initControlPos();

    },
    /**
     * APIMethod: _initPanes
     * 初始化框架
     */
    _initPanes: function () {
        var panes = this._panes = {};

        this._mapPane = panes.mapPane = this._createPane('atlas-map-pane', this._container);
        //放置Canvas图层
        panes.overlayPane = this._createPane('atlas-layers-pane');
        
    },
    /**
     * APIMethod: _initControlPos
     * 初始化控件位置
     */
	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'atlas-',
		    container = this._controlContainer =
				this._createPane(l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] =
				this._createPane(className, container);
		}

		createCorner.call(this, 'top', 'left');
		createCorner.call(this, 'top', 'right');
		createCorner.call(this, 'bottom', 'left');
		createCorner.call(this, 'bottom', 'right');
	},

    _createPane: function (className, container) {
        return Atlas.DomUtil.create('div', className, container || this._mapPane);
    },

    _initializers: [],

    _initHooks: function () {
        var i, len;
        for (i = 0, len = this._initializers.length; i < len; i++) {
            this._initializers[i].call(this);
        }
    },

    _initLayers: function (layers) {
        layers = layers ? (layers instanceof Array ? layers : [layers]) : [];

        this._layers = {};

        var i, len;

        for (i = 0, len = layers.length; i < len; i++) {
            this.addLayer(layers[i]);
        }
    },


    // 地图显示（私有方法）

    _resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {

        var zoomChanged = (this._zoom !== zoom);

        if (!afterZoomAnim) {
            this.fire('movestart');

            if (zoomChanged) {
                this.fire('zoomstart');
            }
        }

        //是否有放大、缩小动画
        if (this.options.zoomAnimation && zoomChanged) {
            //实现放大、缩小
            this.fire('zoomanim', {
                center: center,
                zoom: zoom
            });
        }

        this._zoom = zoom;

        this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

        if (!preserveMapOffset) {
            Atlas.DomUtil.setPosition(this._mapPane, new Atlas.Point(0, 0));
        } else {
            this._initialTopLeftPoint._add(this._getMapPanePos());
        }

        this.fire('viewreset', { hard: !preserveMapOffset });

        this.fire('move');

        var that = this, _clearTimer;
        function _reset() {
            if (zoomChanged || afterZoomAnim) {
                that.fire('zoomend');
            }
            that.fire('moveend', { hard: !preserveMapOffset });
        };
        //是否有放大、缩小动画
        if (this.options.zoomAnimation && zoomChanged) {
            if (_clearTimer) {
                clearTimeout(_clearTimer);
            }
            _clearTimer = setTimeout(_reset, 300);
        } else {
            _reset();
        }

        if (!this._loaded) {
            this._loaded = true;
            this.fire('load');
        }
    },

    _rawPanBy: function (offset) {
        Atlas.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
    },

    /********************************************************/
    /*                                                      */
    /*             地图鼠标事件                              */
    /*                                                      */
    /********************************************************/

    _initEvents: function () {
        if (!Atlas.DomEvent) { return; }

        Atlas.DomEvent.on(this._container, 'click', this._onMouseClick, this);

        var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mousemove', 'contextmenu'],
			i, len;

        for (i = 0, len = events.length; i < len; i++) {
            Atlas.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
        }

        if (this.options.trackResize) {
            Atlas.DomEvent.on(window, 'resize', this._onResize, this);
        }
    },

    _onResize: function () {
        Atlas.Util.cancelAnimFrame(this._resizeRequest);
        this._resizeRequest = Atlas.Util.requestAnimFrame(this.invalidateSize, this, false, this._container);
    },

    _onMouseClick: function (e) {
        if (!this._loaded || (this.dragging && this.dragging.moved())) { return; }

        this.fire('preclick');
        this._fireMouseEvent(e);
    },

    _fireMouseEvent: function (e) {
        if (!this._loaded) { return; }

        var type = e.type;

        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

        if (!this.hasEventListeners(type)) { return; }

        if (type === 'contextmenu') {
            Atlas.DomEvent.preventDefault(e);
        }

        var containerPoint = this.mouseEventToContainerPoint(e),
			layerPoint = this.containerPointToLayerPoint(containerPoint),
			latlng = this.layerPointToLatLng(layerPoint);

        this.fire(type, {
            latlng: latlng,
            layerPoint: layerPoint,
            containerPoint: containerPoint,
            originalEvent: e
        });
    },


    // private methods for getting map state

    _getMapPanePos: function () {
        return Atlas.DomUtil.getPosition(this._mapPane);
    },

    _getTopLeftPoint: function () {
        if (!this._loaded) {
            throw new Error('请设置地图的中心点和级数！');
        }

        return this._initialTopLeftPoint.subtract(this._getMapPanePos());
    },

    _getNewTopLeftPoint: function (center, zoom) {
        var viewHalf = this.getSize().divideBy(2);

        return this.project(center, zoom)._subtract(viewHalf)._round();
    },

    _latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
        var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
        return this.project(latlng, newZoom)._subtract(topLeft);
    },

    _getCenterLayerPoint: function () {
        return this.containerPointToLayerPoint(this.getSize().divideBy(2));
    },

    _getCenterOffset: function (center) {
        return this.latLngToLayerPoint(center).subtract(this._getCenterLayerPoint());
    },

    _limitZoom: function (zoom) {
        var min = this.getMinZoom(),
			max = this.getMaxZoom();

        return Math.max(min, Math.min(max, zoom));
    }
});

Atlas.Map.addInitHook = function (fn) {
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initializers.push(init);
};

Atlas.map = function (id, options) {
    return new Atlas.Map(id, options);
};
