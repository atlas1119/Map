
Atlas.ZoomControl = Atlas.Control.extend({
	options: {
		position: 'topright'
	},


	onAdd: function (map) {
		var className = 'atlas-control-zoom',
		    container = Atlas.DomUtil.create('div', className);

		this._createButton('∑≈¥Û', className + '-in', container, map.zoomIn, map);
		this._createButton('Àı–°', className + '-out', container, map.zoomOut, map);

		return container;
	},

	_createButton: function (title, className, container, fn, context) {
		var divElement = Atlas.DomUtil.create('div', className, container);
		
		divElement.title = title;

		Atlas.DomEvent.on(divElement, 'click', fn, context);

		return divElement;
	}
});

