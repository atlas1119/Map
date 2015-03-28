/*
* 将一个点放大或缩小scale倍
*/

Atlas.Transformation = Atlas.Class.extend({
    initialize: function (/*Number*/a, /*Number*/b, /*Number*/c, /*Number*/d) {
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
    },

    transform: function (point, scale) {
        return this._transform(point.clone(), scale);
    },

    // destructive transform (faster)
    _transform: function (/*Point*/point, /*Number*/scale) /*-> Point*/{
        scale = scale || 1;
        point.x = scale * (this._a * point.x + this._b);
        point.y = scale * (this._c * point.y + this._d);
        return point;
    },

    untransform: function (/*Point*/point, /*Number*/scale) /*-> Point*/{
        scale = scale || 1;
        return new Atlas.Point(
			(point.x / scale - this._b) / this._a,
			(point.y / scale - this._d) / this._c);
    }
});