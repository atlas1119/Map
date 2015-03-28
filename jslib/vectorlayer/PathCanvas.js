/*
* Canvas矢量图层
*/

Atlas.PathCanvas = Atlas.Class.extend({

    includes: [Atlas.Custom.Events],

    statics: {

        CLIP_PADDING: 0,  //系数
        CANVAS: true
    },

    options: {
        marker: false,                                    //是否添加标注
        fontWeight: "bold",                       //字体粗度
        fontStyle: "normal",                       //字体样式
        fontSize: "15",                                 //字体大小（px）
        fontFace: "serif",                            //文本字体
        fontColor: "#696969",                   //字体颜色
        name: "",                                          //标注点的名称
        
        featureInfo:null,                      //要素信息

        stroke: true,
        color: '#0033ff',                //边框颜色
        dashArray: null,
        weight: 1,                           //线宽
        opacity: 0.5,                       //线的透明度

        fill: false,                             //是否填充
        fillColor: null,                    //填充颜色
        fillOpacity: 0.2,                 //填充的透明度

        clickable: true                 //是否支持单击事件
    },

    initialize: function (options) {
        Atlas.Util.setOptions(this, options);
    },

    onAdd: function (map) {
        this._map = map;

        if (!this._container) {
            this._initElements();
            this._initEvents();
        }

        this.projectLatlngs();
        this._updatePath();

        if (this._container) {
            this._map._pathRoot.appendChild(this._container);
        }

        map.on({
            'viewreset': this.projectLatlngs,
            'moveend': this._updatePath
        }, this);
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    redraw: function () {
        if (this._map) {
            this.projectLatlngs();
            this._requestUpdate();
        }
        return this;
    },

    setStyle: function (style) {
        Atlas.Util.setOptions(this, style);

        if (this._map) {
            this._updateStyle();
            this._requestUpdate();
        }
        return this;
    },

    onRemove: function (map) {
        map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

        this._requestUpdate();

        this._map = null;
    },

    projectLatlngs: function () {
        //子类继承
        
    },

    _requestUpdate: function () {
        if (this._map) {
            Atlas.Util.cancelAnimFrame(this._fireMapMoveEnd);
            this._updateRequest = Atlas.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
        }
    },

    _fireMapMoveEnd: function () {
        this.fire('moveend');
    },

    _initElements: function () {
        this._map._initPathRoot();
        this._ctx = this._map._canvasCtx;
    },

    _updateStyle: function () {
        var options = this.options;

        if (options.stroke) {
            this._ctx.lineWidth = options.weight;
            this._ctx.strokeStyle = options.color;
        }
        if (options.fill) {
            this._ctx.fillStyle = options.fillColor || options.color;
        }


    },

    _drawPath: function () {
        var i, j, len, len2, point, drawMethod;

        this._ctx.beginPath();
        for (i = 0, len = this._parts.length; i < len; i++) {
            for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
                point = this._parts[i][j];
                drawMethod = (j === 0 ? 'move' : 'line') + 'To';

                this._ctx[drawMethod](point.x, point.y);

            }
            // 如果是面的话，就闭合路径
            if (this instanceof Atlas.PolygonCanvas) {
                this._ctx.closePath();
            }

        }
    },

    _checkIfEmpty: function () {
        return !this._parts.length;
    },

    _updatePath: function () {
        if (this._checkIfEmpty()) { return; }

        var ctx = this._ctx,
			options = this.options;

        this._drawPath();
        ctx.save();
        this._updateStyle();

        if (options.fill) {
            if (options.fillOpacity < 1) {
                ctx.globalAlpha = options.fillOpacity;
            }
            ctx.fill();
        }

        if (options.stroke) {
            if (options.opacity < 1) {
                ctx.globalAlpha = options.opacity;
            }
            ctx.stroke();
        }

        ctx.restore();
        
    },

    _initEvents: function () {
        if (this.options.clickable) {
            // TODO mouseover, mouseout, dblclick
            this._map.on('click', this._onClick, this);
            //this._map.on('mouseover', this._onMouseover, this);
            
        }
    },
    

    _onClick: function (e) {
        if (this._containsPoint(e.layerPoint)) {
        	var options = this.options,f,
        	info ="";
        	
        	var ctx = this._ctx;
        	
        	this._drawPath();
        	
        	ctx.save();
        	ctx.lineWidth = 5;
        	ctx.strokeStyle = "#FF3030";
            
        	ctx.stroke();
        	ctx.restore();
        	
        	if(options.featureInfo){
        		f = options.featureInfo;
        		info = info + "要素ID："+ f.fID + "\n";
        		if(f.ftype == "Pnt"){
        			info = info + "要素类型：点" + "\n";
        		}else if(f.ftype == "Lin"){
        			info = info + "要素类型：线" + "\n";
        		}else if(f.ftype == "Reg"){
        			info = info + "要素类型：面" + "\n";
        		}
        		
        		info = info + "要素属性：" + f.attValue;
        		
        		alert(info);
        	}
        	
            
        }
    }
});

Atlas.Map.include({
    /*
    * 更新矢量显示窗口
    */
    _updatePathViewport: function () {
        //计算Canvas容器的位置和大小（大小默认是地图容器的大小）
        var p = Atlas.PathCanvas.CLIP_PADDING, //系数
			size = this.getSize(),
			panePos = Atlas.DomUtil.getPosition(this._mapPane),
			min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)),
			max = min.add(size.multiplyBy(1 + p * 2));
        //始终显示的窗口位置(相对于mapPane的位置)
        this._pathViewport = new Atlas.Bounds(min, max);
        //alert(min.toString());
        //alert(max.toString());
    },

    _initPathRoot: function () {
        var root = this._pathRoot,
			ctx;

        if (!root) {
            root = this._pathRoot = document.createElement("canvas");
            root.style.position = 'absolute';
            //root.style.border = "1px solid black";

            ctx = this._canvasCtx = root.getContext('2d');

            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            this._panes.overlayPane.appendChild(root);
            //初始化监听放大和缩小时的动画
            if (this.options.zoomAnimation) {
                this.on('zoomanim', this._animatePathZoom);
                this.on('zoomend', this._endPathZoom);
            }

            this.on('moveend', this._updateCanvasViewport);
            this._updateCanvasViewport();
        }
    },
    /*
    *  放大、缩小之前的动画（用CSS3解决）
    */
    _animatePathZoom: function (opt) {
        var scale = this.getZoomScale(opt.zoom),
			offset = this._getCenterOffset(opt.center).divideBy(1 - 1 / scale),
			viewportPos = this.containerPointToLayerPoint(this.getSize().multiplyBy(-Atlas.PathCanvas.CLIP_PADDING)),
			origin = viewportPos.add(offset).round();

        this._pathRoot.className = 'atlas-zoom-animated';

        this._pathRoot.style[Atlas.DomUtil.TRANSFORM] = Atlas.DomUtil.getTranslateString((origin.multiplyBy(-1).add(Atlas.DomUtil.getPosition(this._pathRoot)).multiplyBy(scale).add(origin))) + ' scale(' + scale + ') ';

        this._pathZooming = true;
    },
    /*
    *  动画之后
    */
    _endPathZoom: function () {
        this._pathZooming = false;
        //将动画样式删除
        this._pathRoot.className = "";
    },
    /*
    *  更新Canvas窗口
    */
    _updateCanvasViewport: function () {
        if (this._pathZooming) {
            //zoom动画未结束
            return;
        }
        this._updatePathViewport();

        var vp = this._pathViewport,
			min = vp.min,
			size = vp.max.subtract(min),
			root = this._pathRoot;
        //将Canvas位于全部显示的位置
        Atlas.DomUtil.setPosition(root, min);
        root.width = size.x;
        root.height = size.y;
        //改变画布的原点
        root.getContext('2d').translate(-min.x, -min.y);
    }
});
