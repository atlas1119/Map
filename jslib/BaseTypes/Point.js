/*
* 点坐标类
*/

Atlas.Point = function (/*Number*/x, /*Number*/y, /*Boolean*/round) {
    this.x = (round ? Math.round(x) : x);
    this.y = (round ? Math.round(y) : y);
};

Atlas.Point.prototype = {
    add: function (point) {
        return this.clone()._add(Atlas.point(point));
    },

    _add: function (point) {
        this.x += point.x;
        this.y += point.y;
        return this;
    },

    subtract: function (point) {
        return this.clone()._subtract(Atlas.point(point));
    },

    // destructive subtract (faster)
    _subtract: function (point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    },

    divideBy: function (num, round) {
        return new Atlas.Point(this.x / num, this.y / num, round);
    },

    multiplyBy: function (num, round) {
        return new Atlas.Point(this.x * num, this.y * num, round);
    },

    distanceTo: function (point) {
        point = Atlas.point(point);

        var x = point.x - this.x,
			y = point.y - this.y;

        return Math.sqrt(x * x + y * y);
    },

    round: function () {
        return this.clone()._round();
    },


    _round: function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    },

    floor: function () {
        return this.clone()._floor();
    },

    _floor: function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    },

    clone: function () {
        return new Atlas.Point(this.x, this.y);
    },

    toString: function () {
        return 'Point(' +
				Atlas.Util.formatNum(this.x) + ', ' +
				Atlas.Util.formatNum(this.y) + ')';
    }
};

Atlas.point = function (x, y, round) {
    if (x instanceof Atlas.Point) {
        return x;
    }
    if (x instanceof Array) {
        return new Atlas.Point(x[0], x[1]);
    }
    if (isNaN(x)) {
        return x;
    }
    return new Atlas.Point(x, y, round);
};
