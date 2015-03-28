

Atlas.CRS.EPSG3857 = Atlas.Util.extend({}, Atlas.CRS, {
    code: 'EPSG:3857',

    projection: Atlas.ProjectionSphericalMercator,
    transformation: new Atlas.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

    project: function (latlng) { // (LatLng) -> Point
        var projectedPoint = this.projection.project(latlng),
			earthRadius = 6378137;
        return projectedPoint.multiplyBy(earthRadius);
    }
});

Atlas.CRS.EPSG900913 = Atlas.Util.extend({}, Atlas.CRS.EPSG3857, {
    code: 'EPSG:900913'
});