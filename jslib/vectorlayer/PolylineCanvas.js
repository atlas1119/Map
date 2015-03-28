/*
* 线矢量绘制
*/
Atlas.PolylineCanvas = Atlas.PathCanvas.extend({

    options: {
        // 简化系数
        smoothFactor: 1.0,
        markerSmooth: 60
    },

    initialize: function (latlngs, options) {
        Atlas.PathCanvas.prototype.initialize.call(this, options);

        this._latlngs = this._convertLatLngs(latlngs);

    },

    projectLatlngs: function () {
        this._originalPoints = [];

        for (var i = 0, len = this._latlngs.length; i < len; i++) {
            this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
        }
    },

    getLatLngs: function () {
        return this._latlngs;
    },

    _drawPath: function () {
        //重写父类
        Atlas.PathCanvas.prototype._drawPath.call(this);

        var n, m, l1, l2, part,
        lu = Atlas.LineUtil,
        option = this.options,
        textLen = this._ctx.measureText(option.name).width,
        lineLen = 0,
        lineStep = 0,
        newPoints,
        textCount = option.name.length;

        if (option.marker) {
        	this._ctx.save();
            //设置字体样式
            this._ctx.fillStyle = option.fontColor;
            this._ctx.font = option.fontWeight + " " + option.fontStyle + " " + option.fontSize + "px " + option.fontFace;
          
            for (n = 0, l1 = this._parts.length; n < l1; n++) {
            	var pointsLen = this._parts[n].length;
            	if(pointsLen > textCount){
            		
                	lineLen = lu.computeLineLength(this._parts[n]);
                	lineStep = lineLen / textCount;
                	
                	newPoints = lu.computeLinePoints(this._parts[n],lineStep);
                	
                	for(var k =0,l2 = newPoints.length;k<l2;k++){
                    	this._ctx.fillText(option.name.charAt(k), newPoints[k].x, newPoints[k].y);
                    }
                	
                	
                	
                	
            	}else{
            		var p1 = this._parts[n][0],
            		    p2 = this._parts[n][pointsLen - 1],
            		    dx = p2.x - p1.x,
                        dy = p2.y - p1.y,
            		    rotation = 0;
            		
            		if (dy == 0 && dx >=0)
            			rotation = 0;
            		else if(dy == 0 && dx < 0)
            			rotation = Math.PI;
                    else if (dx == 0 && dy >= 0)
                    	rotation = Math.PI * 0.5;
                    else if(dx == 0 && dy < 0)
                    	rotation = 1.5*Math.PI;
                    else
                    {
                    	if(dx > 0){
                    		rotation =2*Math.PI - Math.atan(dy/dx);
                    		rotation = -rotation;
                    	}else{
                    		rotation =2*Math.PI - (Math.atan(dy/dx) - Math.PI);
                    		rotation = -rotation;
                    	}

                    }
            		
            		this._ctx.save();
            		this._ctx.translate(p1.x, p1.y);
            		this._ctx.rotate(rotation);
            		this._ctx.fillText(option.name, 0, 0);
            		
            		this._ctx.restore();
            		
            	}

            }
            //
            this._ctx.restore();
            
        }

    },

    setLatLngs: function (latlngs) {
        this._latlngs = this._convertLatLngs(latlngs);
        return this.redraw();
    },

    addLatLng: function (latlng) {
        this._latlngs.push(Atlas.latLng(latlng));
        return this.redraw();
    },

    closestLayerPoint: function (p) {
        var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

        for (var j = 0, jLen = parts.length; j < jLen; j++) {
            var points = parts[j];
            for (var i = 1, len = points.length; i < len; i++) {
                p1 = points[i - 1];
                p2 = points[i];
                var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
                if (sqDist < minDistance) {
                    minDistance = sqDist;
                    minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
                }
            }
        }
        if (minPoint) {
            minPoint.distance = Math.sqrt(minDistance);
        }
        return minPoint;
    },

    getBounds: function () {
        var b = new Atlas.LatLngBounds();
        var latLngs = this.getLatLngs();
        for (var i = 0, len = latLngs.length; i < len; i++) {
            b.extend(latLngs[i]);
        }
        return b;
    },


    onAdd: function (map) {
        Atlas.PathCanvas.prototype.onAdd.call(this, map);

    },

    onRemove: function (map) {

        Atlas.PathCanvas.prototype.onRemove.call(this, map);
    },

    _convertLatLngs: function (latlngs) {
        var i, len;
        for (i = 0, len = latlngs.length; i < len; i++) {
            if (latlngs[i] instanceof Array && typeof latlngs[i][0] !== 'number') {
                return;
            }
            latlngs[i] = Atlas.latLng(latlngs[i]);
        }
        return latlngs;
    },

    _initEvents: function () {
        Atlas.PathCanvas.prototype._initEvents.call(this);
    },
    // 对数据坐标点进行裁剪
    _clipPoints: function () {
        var points = this._originalPoints,
			len = points.length,
			i, k, segment;

        this._parts = [];

        var parts = this._parts,
			vp = this._map._pathViewport,
			lu = Atlas.LineUtil;

        for (i = 0, k = 0; i < len - 1; i++) {
            segment = lu.clipSegment(points[i], points[i + 1], vp, i);
            if (!segment) {
                continue;
            }

            parts[k] = parts[k] || [];
            parts[k].push(segment[0]);

            // 出了可视区域
            if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
                parts[k].push(segment[1]);
                k++;
            }
        }
    },

    // 对线面坐标进行简化
    _simplifyPoints: function () {
        var parts = this._parts,
			lu = Atlas.LineUtil;

        for (var i = 0, len = parts.length; i < len; i++) {
            parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
        }
    },

    _updatePath: function () {
        if (!this._map) { return; }

        this._clipPoints();
        this._simplifyPoints();

        Atlas.PathCanvas.prototype._updatePath.call(this);
    },
    
    _containsPoint: function (p, closed) {
		var i, j, k, len, len2, dist, part,
			w = this.options.weight;

		
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) {
					continue;
				}
                //计算点到某线段的距离
				dist = Atlas.LineUtil.pointToSegmentDistance(p, part[k], part[j]);

				if (dist <= w) {
					return true;
				}
			}
		}
		return false;
	}
    
});
