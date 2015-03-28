
Atlas.CanvasMain = Atlas.Class.extend({

  options: {
        ip:"localhost",
        port: "8087",
        
        baseUrl: "CanvasMapServer/Atlas/Atlas",
        partUrl: "canvas/map"

    },

    initialize: function (options) {
        Atlas.Util.setOptions(this, options);
        
    },
    //------------公有方法--------------//
    /**
    * 获取get请求的结果,显示地图（入口）
    * @function
    * @grammar initMap(id)
    *  
    */
    initMap: function(id) {
	    options = this.options || {};

	    var ip = options.ip || "localhost",
        port = options.port || "8080",
	    baseUrl = options.baseUrl || "",
	    partUrl = options.partUrl || "",
	    restUrl,
	    that = this;
	    
	    this.restUrl = "http://" + ip + ":" + port + "/" + baseUrl + "/" + partUrl + "/";
	    //get请求获取服务第一页的结果
        Atlas.Ajax.get("/jsondata/0.json",function(xhr,data){
             var jsonObj;
            
             if(data){
            	 jsonObj = Atlas.Util.evalJSON(data);
            	 
            	 //that.dataBase = that._createDB();
            	 
            	 //that._insertLayers(jsonObj.Layers, that.dataBase);
            	 
            	 //that._insertFragments(jsonObj.Layers,0, that.dataBase);
            	 //that._insertHit(jsonObj.BBox, 0, 1, that.dataBase);
            	 
            	 that._createMap(id, jsonObj);
             }
             
       });
   },
   

   //------------私有方法--------------//
   _insertLayers:function(layers,dataBase){
       //插入数据
	   if(layers instanceof Array){
		
		dataBase.transaction(function(args) {
		    for(var i =0,len = layers.length;i< len;i++){
	             args.executeSql("insert into layer(id, layername, layer_date) values(?, ?, ?)", [layers[i].layerId,layers[i].layerName, layers[i].layerDate], null, null);
		    }
		});

	   }else{
		   dataBase.transaction(function(args) {
               args.executeSql("insert into layer(id, layername, layer_date) values(?, ?, ?)", [layers.layerId,layers.layerName, layers.layerDate], null, null);
		   });
		   

	   }

       
   },
   
   _insertFragments:function(layers,page,dataBase){
	 //插入数据
	   if(layers instanceof Array){
		   for(var i =0,len = layers.length;i< len;i++){
			   
				   dataBase.transaction(function(args) {
					   for(var j = 0,len1 = layers[i].features.length;j<len1;j++){
		                    args.executeSql("insert into fragments(fid, type, coord, layerid, fragment_code) values(?, ?, ?, ?, ?)", [layers[i].features[j].fID, layers[i].features[j].ftype,layers[i].features[j].fGeom.linGeom.line.arcs.dots.toString(),layers[i].layerId,page], null, null);
					   }
				   });
			  
			   
		   }
	       
   
	   }else{
		   
		      dataBase.transaction(function(args) {
		    	  for(var h = 0,len2 = layers.features.length;h<len2;h++){
                      args.executeSql("insert into fragments(fid, type, coord, layerid, fragment_code) values(?, ?, ?, ?, ?)", [layers.features[h].fID, layers.features[h].ftype, layers.features[h].fGeom.linGeom.line.arcs.dots.toString(),layers.layerId,page], null, null);
		    	  }
		      });
		   
	   }
   },
   
   _insertHit:function(bbox,page,count,dataBase){
	   
	   dataBase.transaction(function(args) {
           args.executeSql("insert into hit(fragment_code, bounds, count, create_time) values(?, ?, ?, ?)", [page,bbox,count,new Date().getTime()], null, null);
	   });
   },
   
   _createDB:function(){
	   var dataBase;
	   dataBase = openDatabase("cacheDB", "1.0", "缓存数据库", 20 * 1024 * 1024, function () { });
	   
	   if (!dataBase) {
           alert("数据库创建失败！");
           return;
       }
       
	   return dataBase;

   },
   /**
    * 初始化地图，并绘制矢量图层
    * @function
    * @grammar initMap()
    * @param {string} 	id 		地图容器id（div的id）
    *  
    */
    _createMap: function(id,jsonObj) {
       
       var bounds = this._getMapBounds(jsonObj.BBox),
           layerInfo = [];
       
       this.page = 1;
       this.layers = this._drawMapLayers(jsonObj.Layers);
 	   this.map = new Atlas.Map(id, {maxBounds: bounds });
 	   //添加放大缩小控件
 	   this.map.addControl(new Atlas.ZoomControl());
 	   //添加查询工具条
 	  //this.map.addControl(new Atlas.SelectToolBar());
 	   //添加图层控制图层
 	   if(jsonObj.Layers instanceof Array){
 		   for(var h=0,len = jsonObj.Layers.length;h<len;h++){
 			   layerInfo.push({id:jsonObj.Layers[h].layerId,name:jsonObj.Layers[h].layerName,type:jsonObj.Layers[h].layerType});
 		   }
 	   }else{
 		  layerInfo.push({id:jsonObj.Layers.layerId,name:jsonObj.Layers.layerName,type:jsonObj.Layers.layerType});
 	   }
 	   
 	   var layersControl = this._layersControl = new Atlas.LayersControl(this.layers,{layerInfo:layerInfo});
 	   this.map.addControl(layersControl);
 	   
 	   this.map.on({
 		   'alllayeradded': this._resetRequest
 	   },this);
 	   
 	   this.map.addLayers(this.layers);
       
    },
    
    _resetRequest: function(){
    	var that = this;
    	
    	if(!that.layers){
    		//alert("完成！");
    		return;
    	}
	    //get请求获取服务下一页的结果
        Atlas.Ajax.get("/jsondata/"+that.page+".json",function(xhr,data){
        	var jsonObj;
             if(data){
            	 jsonObj = Atlas.Util.evalJSON(data);
            	 
            	 //that._insertFragments(jsonObj.Layers,that.page, that.dataBase);
            	 
            	 //that._insertHit(jsonObj.BBox, that.page, 1, that.dataBase);
            	 
            	 that.layers = that._drawMapLayers(jsonObj.Layers);
            	 
            	 if(that.layers){
            		 that.page++;
            		 that.map.addLayers(that.layers);
            		 //添加要素
            		 that._layersControl.addOverlay(that.layers);
            	 }
             }
             
       });
    },
   /**
    * 获取地图的范围
    * @function
    * @grammar _getMapBounds()
    * @param {array} 	jsonBBox 		json对象
    *  
    */
   _getMapBounds: function(jsonBBox) {
	   
	   if(!jsonBBox){ return null;}
	   
	   var box = jsonBBox,
	   minLatLng = Atlas.latLng(box[1],box[0]),
	   maxLatLng = Atlas.latLng(box[3],box[2]),
	   bounds = Atlas.latLngBounds(minLatLng,maxLatLng);
       
	   return bounds;
   },
   /**
    * 绘制所有图层
    * @function
    * @grammar _getMapLayers()
    * @param {array} 	jsonBBox 		json对象
    *  
    */
   _drawMapLayers: function(jsonLayers){
	   
	   if(!jsonLayers){ return null;}
	   var layers = [],layer;
	   if(jsonLayers instanceof Array){
		   for(var i =0,len1 = jsonLayers.length;i< len1;i++){
			   
			   layer = this._drawLayer(jsonLayers[i]);
			   for(var j=0,len2 = layer.length;j<len2;j++){
				   layers.push(layer[j]);
			   }
		   }
	   }else{
		   layer = this._drawLayer(jsonLayers);
		   for(var f=0,lenlayer = layer.length;f<lenlayer;f++){
			   layers.push(layer[f]);
		   }
	   }

	   return layers;
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
   	 	  	     layers.push(new Atlas.PointsCanvas(latLngsPnt,{marker: true,names:attPnt,featureInfos:infos}));
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
  	 	  	    	layers.push(new Atlas.PolylineCanvas(latLngsLine,{marker: false,name:lineName,featureInfo:fInfo}));
  	 	  		    
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
  	  	 	  	    	
  	  	 	  	    	layers.push(new Atlas.PolygonCanvas([latLngsReg],{marker: false,name:regName,featureInfo:regInfo}));
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
  	    				
  	    				layers.push(new Atlas.PolygonCanvas(latLngsRegArr,{marker: false,name:regName,featureInfo:regInfo}));
  	    			}
  	 	  	    	
  	 	  		    
  	 		     }
  	    	 }
  	    	 
 	    	  break;
	   }
	   
	   return layers;
   }
   
   
});
