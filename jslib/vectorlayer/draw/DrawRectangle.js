
Atlas.DrawRectangle = Atlas.DrawShape.extend({
	statics: {
		TYPE: 'rectangle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, 
			fillOpacity: 0.2,
			clickable: false
		}
	},

	initialize: function (map, options) {
		//
		this.type = Atlas.DrawRectangle.TYPE;
		Atlas.DrawShape.prototype.initialize.call(this, map, options);
		
		
	},
    //必须实现
	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new Atlas.RectangleCanvas(new Atlas.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new Atlas.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function () {
		var rectangle = new Atlas.RectangleCanvas(this._shape.getBounds(), this.options.shapeOptions);
		Atlas.DrawShape.prototype._fireCreatedEvent.call(this, rectangle);
		//查询要素
		var bounds = this._shape.getBounds(),
		that = this,
		restUrl = "http://localhost:8087/CanvasMapServer/Atlas/Atlas/canvas/map/att/0/0";
		
		restUrl = restUrl +"/"+ bounds.getSouthWest().lng +"/"+ bounds.getSouthWest().lat +"/"+ bounds.getNorthEast().lng + "/"+ bounds.getNorthEast().lat;
		//get请求获取服务
        Atlas.Ajax.get(restUrl,function(xhr,data){
        	var jsonObj,layers;
             if(data){
            	 jsonObj = Atlas.Util.evalJSON(data);
            	 if(jsonObj.Layers instanceof Array){
            		 
            	 }else{
            		layers = that._drawLayer(jsonObj.Layers);
            		//this._map
            		that._map.addLayers(layers);
            		var str = "";
            		for(var i=0,len= jsonObj.Layers.features.length;i<len;i++){
            			str = str + "要素ID:" + jsonObj.Layers.features[i].fID + "  要素属性：";
            			str = str + jsonObj.Layers.features[i].attValue.join("") + "\n";
               	    }
            		
            		that.disable();
            		alert(str);
            		
            	 }

             }
             
       });
		
	},
	
	 /**
	    * 绘制图层
	    * @function
	    * @grammar _getMapBounds()
	    * @param {array} 	jsonBBox 		json对象
	    *  
	    */
	   _drawLayer: function(jsonLayer){
		   if(!jsonLayer){ return null;}
		   var layers = [];
		   switch (jsonLayer.layerType) {
	 	      case "Pnt":
	   	    	 var latLngsPnt = [],point = [],attPnt = [],infos = [];
	   	    	 if(jsonLayer.features){
	   	 	  	     for(var i =0,len = jsonLayer.features.length;i< len;i++){
	   	 	  	    	
	   	 	  	    	point = [];
	   	 	  	    	point.push(jsonLayer.features[i].fGeom.pntGeom.dot.y);
	   	 	  	    	point.push(jsonLayer.features[i].fGeom.pntGeom.dot.x);
	   	 	  	    	latLngsPnt.push(point);
	   	 	  	        attPnt.push(jsonLayer.features[i].attValue[1]);
	   	 	  	        infos.push({fID:jsonLayer.features[i].fID,
	  	 	  	    		        ftype:jsonLayer.features[i].ftype,
	  	 	  	    		        attValue:jsonLayer.features[i].attValue});
	   	 		     }
	   	 	  	     layers.push(new Atlas.PointsCanvas(latLngsPnt,{marker: false,names:attPnt,featureInfos:infos,color:"#FF3030",weight:5}));
	   	    	 }

	 	  	     
			     break;
	 	      case "Lin":
	  	    	 var latLngsLine = [],line = [],lineName,fInfo;
	  	    	 
	  	    	 if(jsonLayer.features){
	  	    		for(var i =0,len1 = jsonLayer.features.length;i< len1;i++){
	  	 	  	    	latLngsLine = [];
	  	 	  	    	var len2 = jsonLayer.features[i].fGeom.linGeom.line.arcs.dots.length;
	  	 	  	    	lineName = jsonLayer.features[i].attValue[2];
	  	 	  	    	fInfo = {fID:jsonLayer.features[i].fID,
	  	 	  	    		     ftype:jsonLayer.features[i].ftype,
	  	 	  	    		     attValue:jsonLayer.features[i].attValue
	  	 	  	    			};
	  	 	  	    	
	  	 	  	    	for(var j=0;j<len2;j++){
	  	 	  	    		line = [];
	  	 	  	    		line.push(jsonLayer.features[i].fGeom.linGeom.line.arcs.dots[j].y);
	  	 	  	    		line.push(jsonLayer.features[i].fGeom.linGeom.line.arcs.dots[j].x);
	  	 	  	    		latLngsLine.push(line);
	  	 	  	    	}
	  	 	  	    	layers.push(new Atlas.PolylineCanvas(latLngsLine,{marker: false,name:lineName,featureInfo:fInfo,color:"#FF3030",weight:5}));
	  	 	  		    
	  	 		     }
	  	    	 }

	 	    	 break;
	 	    	 
	 	      case "Reg":
	  	    	 var latLngsReg = [],reg = [],regName,latLngsRegArr = [],regInfo;
	  	    	 
	  	    	 if(jsonLayer.features){
	  	    		for(var k =0,len3 = jsonLayer.features.length;k< len3;k++){
	  	    			latLngsReg = [];
	  	    			
	  	    			regName = jsonLayer.features[k].attValue[3];
	  	    			regInfo = {fID:jsonLayer.features[k].fID,
	 	 	  	    		     ftype:jsonLayer.features[k].ftype,
	 	 	  	    		     attValue:jsonLayer.features[k].attValue
	 	 	  	    			};
	  	 	  	    	
	  	    			if(!(jsonLayer.features[k].fGeom.regGeom.rings instanceof Array)){
	  	    				var len4 = jsonLayer.features[k].fGeom.regGeom.rings.arcs.dots.length;
	  	  	 	  	        
	  	  	 	  	    	for(var m=0;m<len4;m++){
	  	  	 	  	    	    reg = [];
	  	  	 	  	    	    reg.push(jsonLayer.features[k].fGeom.regGeom.rings.arcs.dots[m].y);
	  	  	 	  	            reg.push(jsonLayer.features[k].fGeom.regGeom.rings.arcs.dots[m].x);
	  	  	 	  	            latLngsReg.push(reg);
	  	  	 	  	    	}
	  	  	 	  	    	
	  	  	 	  	    	layers.push(new Atlas.PolygonCanvas([latLngsReg],{marker: false,name:regName,featureInfo:regInfo,color:"#FF3030",weight:5}));
	  	    			}else{
	  	    				//如果存在hold
	  	    				var len5 = jsonLayer.features[k].fGeom.regGeom.rings.length;
	  	    				latLngsRegArr = [];
	  	    				for(var n = 0;n<len5;n++){
	  	    					
	  	    					var len6 = jsonLayer.features[k].fGeom.regGeom.rings[n].arcs.dots.length;
	  	  	  	 	  	    	for(var h=0;h<len6;h++){
	  	  	  	 	  	    	    reg = [];
	  	  	  	 	  	    	    reg.push(jsonLayer.features[k].fGeom.regGeom.rings[n].arcs.dots[h].y);
	  	  	  	 	  	            reg.push(jsonLayer.features[k].fGeom.regGeom.rings[n].arcs.dots[h].x);
	  	  	  	 	  	            latLngsReg.push(reg);
	  	  	  	 	  	    	}
	  	  	  	 	  	        latLngsRegArr.push(latLngsReg);
	  	    				}
	  	    				
	  	    				layers.push(new Atlas.PolygonCanvas(latLngsRegArr,{marker: false,name:regName,featureInfo:regInfo,color:"#FF3030",weight:5}));
	  	    			}
	  	 	  	    	
	  	 	  		    
	  	 		     }
	  	    	 }
	  	    	 
	 	    	  break;
		   }
		   
		   return layers;
	   }
	
	
});


