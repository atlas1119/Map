
/*
* 投影系统类
*/

Atlas.CRS = {

    RATIO: 256,   //矢量图的缩放比例
     
    projection: Atlas.ProjectionLonLat,

    transformation: new Atlas.Transformation(1, 0, 1, 0),

    latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
        var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

        return this.transformation._transform(projectedPoint, scale);
    },

    pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
        var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

        return this.projection.unproject(untransformedPoint);
    },

    project: function (latlng) {
        return this.projection.project(latlng);
    },

    scale: function (zoom) {
        return this.RATIO * Math.pow(2, zoom);
    }
};