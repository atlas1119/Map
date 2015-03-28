

Atlas.ProjectionLonLat = {
    project: function (latlng) {
        return new Atlas.Point(latlng.lng, latlng.lat);
    },

    unproject: function (point) {
        return new Atlas.LatLng(point.y, point.x, true);
    }
};