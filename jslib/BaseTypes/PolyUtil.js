/*
 * L.PolyUtil contains utilify functions for polygons (clipping, etc.).
 */

/*jshint bitwise:false */ // allow bitwise oprations here

Atlas.PolyUtil = {};

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
Atlas.PolyUtil.clipPolygon = function (points, bounds) {
	var min = bounds.min,
		max = bounds.max,
		clippedPoints,
		edges = [1, 4, 2, 8],
		i, j, k,
		a, b,
		len, edge, p,
		lu = Atlas.LineUtil;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = lu._getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = lu._getEdgeIntersection(b, a, edge, bounds);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = lu._getEdgeIntersection(b, a, edge, bounds);
				p._code = lu._getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
};

/*多边形的重心坐标 */
Atlas.PolyUtil.centerPoint = function(points){
	var temp,
	    area=0,i,len,
	    cx = 0, cy = 0;
	
	for (i = 0,len = points.length;i<len-1;i++)
	{
	  temp = points[i].x * points[i+1].y - points[i].y *points[i+1].x;
	  area+= temp;
	  cx+= temp * (points[i].x+points[i+1].x);
	  cy+= temp * (points[i].y+points[i+1].y);
	}
	
	temp = points[len-1].x * points[0].y - points[len-1].y *points[0].x;
	area+= temp;
	
	cx+= temp * (points[len-1].x+points[0].x);
	cy+= temp * (points[len-1].y+points[0].y);

	area = area/2;
	cx = cx/(6*area);
	cy = cy/(6*area);

	return new Atlas.Point(cx,cy);
	
};

/*jshint bitwise:true */
