/*
* 面矢量绘制
*/

Atlas.PolygonCanvas = Atlas.PolylineCanvas.extend({
    options: {
        fill: true
    },

    initialize: function (latlngs, options) {
        Atlas.PolylineCanvas.prototype.initialize.call(this, latlngs, options);

        //查看有没有洞
        if (latlngs && (latlngs[0] instanceof Array) && (typeof latlngs[0][0] !== 'number')) {
            this._latlngs = this._convertLatLngs(latlngs[0]);

            this._holes = latlngs.slice(1);
        }
    },

    projectLatlngs: function () {
        Atlas.PolylineCanvas.prototype.projectLatlngs.call(this);

        // 转换洞的坐标
        this._holePoints = [];

        if (!this._holes) {
            return;
        }

        for (var i = 0, len = this._holes.length, hole; i < len; i++) {
            this._holePoints[i] = [];

            for (var j = 0, len2 = this._holes[i].length; j < len2; j++) {
                this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
            }
        }
    },

    _drawPath: function () {
        //重写父类
        Atlas.PathCanvas.prototype._drawPath.call(this);

        var n, l1, point,
        option = this.options,
        textLen = this._ctx.measureText(option.name).width,
        textCount = option.name.length;

        if (option.marker) {
            //设置字体样式
            this._ctx.fillStyle = option.fontColor;
            this._ctx.font = option.fontWeight + " " + option.fontStyle + " " + option.fontSize + "px " + option.fontFace;
            this._ctx.textBaseline = "middle";
            for (n = 0, l1 = this._parts.length; n < l1; n++) {
                //bound = new Atlas.Bounds(this._parts[n]);
                
//                medial = new Atlas.MedialAxis(this._parts[n]);
//                points = medial.getMedialAxisPoints();
//                
//                lineLen = lu.computeLineLength(points);
//            	lineStep = lineLen / textCount;
//            	
//            	newPoints = lu.computeLinePoints(points,lineStep);
//            	
//            	for(var k =0,l2 = newPoints.length;k<l2;k++){
//                	this._ctx.fillText(option.name.charAt(k), newPoints[k].x, newPoints[k].y);
//                }
            	
                point = Atlas.PolyUtil.centerPoint(this._parts[n]);
                
//                var topLeft = new Atlas.Point(point.x - textLen / 2,point.y - 10),
//                    bottomRight = new Atlas.Point(point.x + textLen / 2,point.y + 10),
//                    textBound =  new Atlas.Bounds(topLeft,bottomRight);
                
                //point = bound.getCenter();
                //绘制标注
                this._ctx.fillText(option.name, point.x - textLen / 2, point.y);

            }

        }

    },
    

    _clipPoints: function () {
        var points = this._originalPoints,
			newParts = [];
        //将面坐标点和洞的坐标点连在一起
        this._parts = [points].concat(this._holePoints);

        for (var i = 0, len = this._parts.length; i < len; i++) {
            var clipped = Atlas.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
            if (!clipped.length) {
                continue;
            }
            newParts.push(clipped);
        }

        this._parts = newParts;
    },
    
    _containsPoint: function (p) {
		var inside = false,
			part, p1, p2,
			i, j, k,
			len, len2;

		//判断是否落在面边界上
		if (Atlas.PolylineCanvas.prototype._containsPoint.call(this, p, true)) {
			// click on polygon border
			return true;
		}

		//射线法
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) &&
						(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		return inside;
	}

});
