
Atlas.DrawShape = Atlas.Handler.extend({
	includes: Atlas.Custom.Events,

	initialize: function (map, options) {
		this._map = map;
		this._container = map._container;
		this._overlayPane = map._panes.overlayPane;
		//this._popupPane = map._panes.popupPane;

		// 合并图形样式
		if (options && options.shapeOptions) {
			options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
		}
		
		Atlas.Util.extend(this.options, options);
	},

	enable: function () {
		if (this._enabled) { return; }

		Atlas.Handler.prototype.enable.call(this);

		this.fire('enabled', { handler: this.type });

		this._map.fire('draw:drawstart', { layerType: this.type });
	},

	disable: function () {
		if (!this._enabled) { return; }

		Atlas.Handler.prototype.disable.call(this);

		this.fire('disabled', { handler: this.type });

		this._map.fire('draw:drawstop', { layerType: this.type });
	},

	addHooks: function () {
		if (this._map) {
			Atlas.DomUtil.disableTextSelection();

			//this._tooltip = new L.Tooltip(this._map);

			Atlas.DomEvent.addListener(this._container, 'keyup', this._cancelDrawing, this);
			
			
			this._map.dragging.disable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			//this._tooltip.updateContent({ text: this._initialLabelText });

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this);
			
			
		}
		
		
		
	},

	removeHooks: function () {
		if (this._map) {
			Atlas.DomUtil.enableTextSelection();

			//this._tooltip.dispose();
			//this._tooltip = null;

			Atlas.DomEvent.removeListener(this._container, 'keyup', this._cancelDrawing);
			
			
			this._map.dragging.enable();
			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this);

			Atlas.DomEvent.off(document, 'mouseup', this._onMouseUp);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
		}
		
		this._isDrawing = false;
	},
	
	_onMouseDown: function (e) {
		this._isDrawing = true;
		this._startLatLng = e.latlng;

		Atlas.DomEvent
			.on(document, 'mouseup', this._onMouseUp, this)
			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		//this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			//this._tooltip.updateContent({ text: 'Release mouse to finish drawing.' });
			//子类实现
			this._drawShape(latlng);
		}
	},

	_onMouseUp: function () {
		if (this._shape) {
			this._fireCreatedEvent();
		}

		//this.disable();
	},

	setOptions: function (options) {
		Atlas.setOptions(this, options);
	},

	_fireCreatedEvent: function (layer) {
		this._map.fire('draw:created', { layer: layer, layerType: this.type });
	},

	// Cancel drawing when the escape key is pressed
	_cancelDrawing: function (e) {
		if (e.keyCode === 27) {
			this.disable();
		}
	}
});
