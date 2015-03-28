

Atlas.LayersControl = Atlas.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		layerInfo:[]
	},

	initialize: function (overlays, options) {
		Atlas.Util.setOptions(this, options);

		this._layers = {};
		//this._lastZIndex = 0;

		for (i in overlays) {
			if (overlays.hasOwnProperty(i)) {
				this._addLayer(overlays[i], true);
			}
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._initItems();
		//this._update();

		return this._container;
	},

	addOverlay: function (layers,layerInfo) {
		
		for (i in layers) {
			if (layers.hasOwnProperty(i)) {
				this._addLayer(layers[i], true);
			}
		}
		if(layerInfo){
			this._update(layerInfo);
		}
		//this._addLayer(layer, true);
		
		return this;
	},

	removeOverlay: function (layerInfo) {
		var id = Atlas.Util.stamp(layer);
		
		delete this._layers[id];
		//this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'atlas-control-layers',
		    container = this._container = Atlas.DomUtil.create('div', className);

		
		Atlas.DomEvent.disableClickPropagation(container);
		

		var form = this._form = Atlas.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			Atlas.DomEvent
				.on(container, 'mouseover', this._expand, this)
				.on(container, 'mouseout', this._collapse, this);
			//className + '-toggle'
			var link = this._layersLink = Atlas.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = '图层控制';
			
			//var name = document.createTextNode("hdj");
			
			//link.appendChild(name);

			Atlas.DomEvent.on(link, 'focus', this._expand, this);
		
			this._map.on('movestart', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._overlaysList = Atlas.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},
	
	_initItems:function(infoObj){
		var label,
	    input,
	    layerInfo = this.options.layerInfo;
		
		if(infoObj){
			layerInfo.push(infoObj);
		}
	    //checked = this._map.hasLayer(obj.layer);
        
		if(layerInfo.length !=0){
			for(var i=0,len=layerInfo.length;i<len;i++){
				
				label = document.createElement('label');
				input = document.createElement('input');
				input.type = 'checkbox';
				input.defaultChecked = true;

			    input.layerId = layerInfo[i].id;
			    input.layerType = layerInfo[i].type;

			    Atlas.DomEvent.on(input, 'click', this._onInputClick, this);

			    var name = document.createTextNode(' ' + layerInfo[i].name);

			    label.appendChild(input);
			    label.appendChild(name);

			    //var container = ;
			    this._overlaysList.appendChild(label);
			}
			
		}
	    

	},

	_addLayer: function (layer, overlay) {
		var id = Atlas.Util.stamp(layer);
		
		this._layers[id] = {
				layer: layer,
				overlay: overlay
		};
		
        if(layer instanceof Atlas.PointsCanvas){
        	this._layers[id]['type'] = "Pnt";
        }else if(layer instanceof Atlas.PolygonCanvas){//顺序不能调换
        	this._layers[id]['type'] = "Reg";
        }else if(layer instanceof Atlas.PolylineCanvas){
        	this._layers[id]['type'] = "Lin";
        }
	

	},

	_update: function (infoObj) {
		if (!this._container) {
			return;
		}

		//this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = "";

        this._initItems(infoObj);
        

		//this._separator.style.display = (overlaysPresent && baseLayersPresent ? '' : 'none');
	},
	
	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.defaultChecked = true;
		}

		input.layerId = Atlas.Util.stamp(obj.layer);

		Atlas.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createTextNode(' ' + obj.name);

		label.appendChild(input);
		label.appendChild(name);

		//var container = ;
		this._overlaysList.appendChild(label);
	},

	_onInputClick: function (event) {
		var i, input, obj;
		input = event.target;
		
		for (var i in this._layers) {
			if (this._layers.hasOwnProperty(i)) {
				var obj = this._layers[i];
				if(input.layerType == obj.type && input.checked){
					this._map.addLayer(obj.layer);
					
				}else if(input.layerType == obj.type && !input.checked){
					this._map.removeLayer(obj.layer);
				}
			}
		}

	},

	_expand: function () {
		Atlas.DomUtil.addClass(this._container, 'atlas-control-layers-expanded');
		
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' atlas-control-layers-expanded', '');
		
	}
});

