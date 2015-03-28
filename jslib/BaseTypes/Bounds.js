/*
* 几何坐标Bounds.js  //shaojun wang
*/

Atlas.Bounds = Atlas.Class.extend({

    initialize: function (a, b) {	//(Point, Point) or Point[]
        if (!a) { return; }

        var points = b ? [a, b] : a;

        for (var i = 0, len = points.length; i < len; i++) {
            this.extend(points[i]);
        }
    },

    //
    extend: function (point) { // (Point)
        point = Atlas.point(point);

        if (!this.min && !this.max) {
            this.min = point.clone();
            this.max = point.clone();
        } else {
            this.min.x = Math.min(point.x, this.min.x);
            this.max.x = Math.max(point.x, this.max.x);
            this.min.y = Math.min(point.y, this.min.y);
            this.max.y = Math.max(point.y, this.max.y);
        }
        return this;
    },

    getCenter: function (round) { // (Boolean) -> Atlas.Point
        return new Atlas.Point(
				(this.min.x + this.max.x) / 2,
				(this.min.y + this.max.y) / 2, round);
    },

    getBottomLeft: function () { // -> Atlas.Point
        return new Atlas.Point(this.min.x, this.max.y);
    },

    getTopRight: function () { // -> Atlas.Point
        return new Atlas.Point(this.max.x, this.min.y);
    },
    
    getWidth:function(){
    	return Math.abs(this.max.x - this.min.x);
    },
    
    getHeight:function(){
    	return Math.abs(this.max.y - this.min.y);
    },
    
    createIntersection:function(bound){
    	
    	var x1 = Math.max(this.min.x, bound.min.x),
    	    y1 = Math.max(this.min.y, bound.min.y),
    	    x2 = Math.min(this.max.x, bound.max.x),
    	    y2 = Math.min(this.max.y, bound.max.y);
    	    
    	 return new Atlas.Bounds(new Atlas.Point(x1, y1),new Atlas.Point(x2, y2));

    },

    contains: function (obj) { // (Bounds) or (Point) -> Boolean
        var min, max;

        if (typeof obj[0] === 'number' || obj instanceof Atlas.Point) {
            obj = Atlas.point(obj);
        } else {
            obj = Atlas.bounds(obj);
        }

        if (obj instanceof Atlas.Bounds) {
            min = obj.min;
            max = obj.max;
        } else {
            min = max = obj;
        }

        return (min.x >= this.min.x) &&
				(max.x <= this.max.x) &&
				(min.y >= this.min.y) &&
				(max.y <= this.max.y);
    },

    intersects: function (bounds) { // (Bounds) -> Boolean
        bounds = Atlas.bounds(bounds);

        var min = this.min,
			max = this.max,
			min2 = bounds.min,
			max2 = bounds.max;

        var xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
			yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

        return xIntersects && yIntersects;
    }

});

Atlas.bounds = function (a, b) {
    if (!a || a instanceof Atlas.Bounds) {
        return a;
    }
    return new Atlas.Bounds(a, b);
};
