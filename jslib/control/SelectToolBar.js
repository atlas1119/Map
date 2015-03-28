

Atlas.SelectToolBar = Atlas.Control.extend({
	options: {
		rectangle: {
			title: '矩形查询'
		},
		position: 'bottomleft'
	},

	initialize: function (options) {
		Atlas.Util.setOptions(this, options);
		
		
	},

	onAdd: function (map) {
		this._initLayout();

		return this._container;
	},

	_initLayout: function () {
		var className = 'atlas-control-selecttoolbar',
		    container = this._container = Atlas.DomUtil.create('div', className);
		//添加矩形
		if(this.options.rectangle){
			var rectangle_div = Atlas.DomUtil.create('div', "atlas-toolbar-rectangle");
			rectangle_div.title = this.options.rectangle.title;
			rectangle_div.style.cursor = 'pointer';
			
			Atlas.DomEvent.on(rectangle_div, 'click', this._onRectangleClick, this);
			container.appendChild(rectangle_div);
		}
		//添加圆
		if(this.options.circle){
			
		}
		
	},
	
	_onRectangleClick:function(){
		var rectangle = new Atlas.DrawRectangle(this._map);
		rectangle.enable();
	}
	
	
});

