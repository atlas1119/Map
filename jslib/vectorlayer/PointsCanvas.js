/*
* 点矢量绘制
*/

Atlas.PointsCanvas = Atlas.PathCanvas.extend({
    options: {
        fontWeight:"normal",
        names: [],                                         //标注点的名称数组

        weight: 2,                       //线宽
        featureInfos:[],
        fill: false
    },

    /*
    * 初始化
    *  latlngs    Number/Array
    */
    initialize: function (latlngs, options) {
        Atlas.PathCanvas.prototype.initialize.call(this, options);

        this._latlngs = this._convertLatLngs(latlngs);
    },

    onAdd: function (map) {
        //执行父类
        Atlas.PathCanvas.prototype.onAdd.call(this, map);

    },

    onRemove: function (map) {
        //执行父类
        Atlas.PathCanvas.prototype.onRemove.call(this, map);
    },
    /*
    * 设置经纬度数组
    */
    setLatLngs: function (latlngs) {
        this._latlngs = this._convertLatLngs(latlngs);
        return this.redraw();
    },
    /*
    * 添加一个经纬度
    */
    addLatLng: function (latlng) {
        this._latlngs.push(Atlas.latLng(latlng));
        return this.redraw();
    },
    /*
    * 绘制点
    */
    _drawPath: function () {
        var i, len,
        option = this.options;
        //this._ctx.save();
        this._ctx.beginPath();
        if (option.marker) {
            //设置字体样式
            this._ctx.fillStyle = option.fontColor;
            this._ctx.font = option.fontWeight + " " + option.fontStyle + " " + option.fontSize + "px " + option.fontFace;

        }
        
        
        for (i = 0, len = this._parts.length; i < len; i++) {
            //this._ctx.moveTo(this._parts[i].x, this._parts[i].y);
            //this._ctx.arc(this._parts[i].x, this._parts[i].y, 5, 0, Math.PI * 2, true);
            this._ctx.rect(this._parts[i].x - 5, this._parts[i].y - 5, 10, 10);
            if (option.marker) {
                //绘制标注
                if (option.names[i]) {
                	
                	//计算标注点位置
                    var width_text = this._ctx.measureText(option.name[i]).width,
                    p1 = new Atlas.Point(this._parts[i].x + 10, this._parts[i].y + 5),
                        p2 = new Atlas.Point(p1.x + width_text,p1.y + 20),
                        label = new Atlas.Label(new Atlas.Bounds(p1,p2),10,5,this._parts[i].x,this._parts[i].y),
                        xy_offset;
                    
                    for(var h = i, len2 = this._parts.length; h < len2; h++){
                        var width_text_h = this._ctx.measureText(option.name[h]).width,
                            p1_h = new Atlas.Point(this._parts[h].x + 10, this._parts[h].y + 5),
                            p2_h = new Atlas.Point(p1_h.x + width_text_h,p1_h.y + 20),
                            label_h = new Atlas.Label(new Atlas.Bounds(p1_h,p2_h),10,5,this._parts[h].x,this._parts[h].y);
                        xy_offset = label.computeLabel(label_h);
                    }
                    
                    
                    this._ctx.fillText(option.names[i], this._parts[i].x + xy_offset.h_offset, this._parts[i].y + xy_offset.v_offset);
                    
                }
            }

        }
        
        //this._ctx.restore();

    },

    _updatePath: function () {
        if (!this._map) { return; }

        this._parts = this._originalPoints;

        Atlas.PathCanvas.prototype._updatePath.call(this);
    },
    
    

    projectLatlngs: function () {
        this._originalPoints = [];

        for (var i = 0, len = this._latlngs.length; i < len; i++) {
            this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
        }

    },
    /*
    * 处理经纬度坐标
    */
    _convertLatLngs: function (latlngs) {
        var i, len, latlngArr = [];
        if (latlngs instanceof Atlas.latLng) {
            latlngArr = [latlngs];

            return latlngArr;
        }

        for (i = 0, len = latlngs.length; i < len; i++) {
            if (latlngs[i] instanceof Array && typeof latlngs[i][0] !== 'number') {
                return;
            }
            latlngs[i] = Atlas.latLng(latlngs[i]);
        }

        latlngArr = latlngs;
        return latlngArr;
    },
    
    _containsPoint:function(p){
    	var inside = false,
    	i,len,w = this.options.weight,
    	p1,p2,point = null,index;
    	
    	for (i = 0, len = this._parts.length; i < len; i++) {
    		p1 = this._parts[i].subtract(new Atlas.Point(w + 5,w + 5));
    		p2 = this._parts[i].add(new Atlas.Point(w + 5,w + 5));
    		
    		if((p.x <= p2.x && p.y <= p2.y) && (p.x >= p1.x && p.y >= p1.y)){
    			inside = !inside;
    			point = this._parts[i];
    			index = i;
    		}
    	}
    	
    	return {inside:inside,point:point,index:index};
    },
    
    _onClick: function (e) {
    	var containsInfo = this._containsPoint(e.layerPoint);
        if (containsInfo.inside) {
        	var options = this.options,f,
        	info ="";
        	
        	var ctx = this._ctx;
        	
        	//this._drawPath();
        	ctx.beginPath();
        	ctx.rect(containsInfo.point.x - 5, containsInfo.point.y - 5, 10, 10);
        	ctx.save();
        	//alert("dadad");
        	
        	ctx.lineWidth = 5;
        	ctx.strokeStyle = "#FF3030";
            
        	ctx.stroke();
        	ctx.restore();
        	
        	if(options.featureInfos.length != 0){
        		f = options.featureInfos[containsInfo.index];
        		info = info + "要素ID："+ f.fID + "\n";
        		if(f.ftype == "Pnt"){
        			info = info + "要素类型：点" + "\n";
        		}
        		
        		info = info + "要素属性：" + f.attValue;
        		
        		alert(info);       
        	}
        	
            
        }
    }

});
