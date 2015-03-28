/*
  经纬度坐标类
*/

Atlas.LatLng = function (rawLat, rawLng, noWrap) { // (Number, Number[, Boolean])
    var lat = parseFloat(rawLat),
		lng = parseFloat(rawLng);

    if (isNaN(lat) || isNaN(lng)) {
        throw new Error('无效的经纬度: (' + rawLat + ', ' + rawLng + ')');
    }

    if (noWrap !== true) {
        lat = Math.max(Math.min(lat, 90), -90); 				// clamp latitude into -90..90
        lng = (lng + 180) % 360 + ((lng < -180 || lng === 180) ? 180 : -180); // wrap longtitude into -180..180
    }

    this.lat = lat;
    this.lng = lng;
};

Atlas.Util.extend(Atlas.LatLng, {
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

Atlas.LatLng.prototype = {
    equals: function (obj) { // (LatLng) -> Boolean
        if (!obj) { return false; }

        obj = Atlas.latLng(obj);

        var margin = Math.max(Math.abs(this.lat - obj.lat), Math.abs(this.lng - obj.lng));
        return margin <= L.LatLng.MAX_MARGIN;
    },

    toString: function () { // -> String
        return 'LatLng(' +
				Atlas.Util.formatNum(this.lat) + ', ' +
				Atlas.Util.formatNum(this.lng) + ')';
    },

    // 两个经纬度坐标点的距离
    distanceTo: function (other) { // (LatLng) -> Number
        other = Atlas.latLng(other);

        var R = 6378137, // 地球半径（米）
			d2r = Atlas.LatLng.DEG_TO_RAD,
			dLat = (other.lat - this.lat) * d2r,
			dLon = (other.lng - this.lng) * d2r,
			lat1 = this.lat * d2r,
			lat2 = other.lat * d2r,
			sin1 = Math.sin(dLat / 2),
			sin2 = Math.sin(dLon / 2);

        var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
};

Atlas.latLng = function (a, b, c) { // (LatLng) or ([Number, Number]) or (Number, Number, Boolean)
    if (a instanceof Atlas.LatLng) {
        return a;
    }
    if (a instanceof Array) {
        return new Atlas.LatLng(a[0], a[1]);
    }
    if (isNaN(a)) {
        return a;
    }
    return new Atlas.LatLng(a, b, c);
};
 