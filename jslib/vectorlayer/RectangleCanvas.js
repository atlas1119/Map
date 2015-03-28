
Atlas.RectangleCanvas = Atlas.PolygonCanvas.extend({
	initialize: function (latLngBounds, options) {
		Atlas.PolygonCanvas.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
		
		//this._bounds = Atlas.latLngBounds(latLngBounds);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = Atlas.latLngBounds(latLngBounds);
	    return [
	        latLngBounds.getSouthWest(),
	        latLngBounds.getNorthWest(),
	        latLngBounds.getNorthEast(),
	        latLngBounds.getSouthEast(),
	        latLngBounds.getSouthWest()
	    ];
	}
});