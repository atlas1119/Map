/*
 * 
 *
 */

Atlas.LineUtil = {


	simplify: function (/*Point[]*/ points, /*Number*/ tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		// stage 1: 减少靠近点数量
		points = this._reducePoints(points, sqTolerance);

		// stage 2: 化简
		points = this._simplifyDP(points, sqTolerance);

		return points;
	},

	// 点到线的距离
	pointToSegmentDistance:  function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
	},

	closestPointOnSegment: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return this._sqClosestPointOnSegment(p, p1, p2);
	},
	
	computeLineLength:function(/*Point[]*/ points){
		var len = points.length,
		    i,
		    lenCount = 0;

	    for (i = 0; i < len - 1; i++) {
	    	lenCount = lenCount + Math.sqrt(this._sqDist(points[i],points[i+1]));
	    }
	    
	    return lenCount;
	},
	
	computeLinePoints:function(/*Point[]*/ points,step){
		var len = points.length,
	    i,
	    lenCount = 0,
	    newPoints = [];
		
		newPoints.push(points[1]);
        for (i = 1; i < len - 1; i++) {
    	     lenCount = lenCount + Math.sqrt(this._sqDist(points[i],points[i+1]));
    	     if(lenCount >= step){
    	    	 newPoints.push(points[i+1]);
    	    	 lenCount = 0;
    	    	 //break;
    	     }
        }
        
        newPoints.push(points[len - 1]);
        
        return newPoints;
        
	},

	// Douglas-Peucker 算法, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	_simplifyDP: function (points, sqTolerance) {

		var len = points.length,
			ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
			markers = new ArrayConstructor(len);

		markers[0] = markers[len - 1] = 1;

		this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
			newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	},

	_simplifyDPStep: function (points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
			index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			//计算距离
			sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			this._simplifyDPStep(points, markers, sqTolerance, first, index);
			this._simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	},

	// 将非常接近的2个点合成一个点
	_reducePoints: function (points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
             //判断两个点之间的距离和阈值的大小关系
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	},

	// Cohen-Sutherland line 线裁剪算法
	// 

	clipSegment: function (a, b, bounds, useLastCode) {
		var min = bounds.min,
			max = bounds.max;

		var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
			codeB = this._getBitCode(b, bounds);

		// 保存用于下次使用
		this._lastCode = codeB;

		while (true) {
			// 如果在可视区域里面
			if (!(codeA | codeB)) {
				return [a, b];
			// 如果在可视区域外面
			} else if (codeA & codeB) {
				return false;
			// 其他情况
			} else {
				var codeOut = codeA || codeB,
					p = this._getEdgeIntersection(a, b, codeOut, bounds),
					newCode = this._getBitCode(p, bounds);

				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		}
	},

	_getEdgeIntersection: function (a, b, code, bounds) {
		var dx = b.x - a.x,
			dy = b.y - a.y,
			min = bounds.min,
			max = bounds.max;

		if (code & 8) { // top
		    return new Atlas.Point(a.x + dx * (max.y - a.y) / dy, max.y);
		} else if (code & 4) { // bottom
		    return new Atlas.Point(a.x + dx * (min.y - a.y) / dy, min.y);
		} else if (code & 2) { // right
		    return new Atlas.Point(max.x, a.y + dy * (max.x - a.x) / dx);
		} else if (code & 1) { // left
		    return new Atlas.Point(min.x, a.y + dy * (min.x - a.x) / dx);
		}
	},

	_getBitCode: function (/*Point*/ p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}
		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	},

	/*jshint bitwise:true */

	//
	_sqDist: function (p1, p2) {
		var dx = p2.x - p1.x,
			dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	},

	// 
	_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
		var x = p1.x,
			y = p1.y,
			dx = p2.x - x,
			dy = p2.y - y,
			dot = dx * dx + dy * dy,
			t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new Atlas.Point(x, y);
	}
};
