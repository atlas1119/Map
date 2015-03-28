

Atlas.Polygon = Atlas.Class.extend({

    initialize: function () {
    	
    	this.npoints = 0;
    	this.xpoints = [];
    	this.ypoints = [];
    	
    },

    addPoint:function(x,y){
    	
    	this.xpoints.push(x);
		this.ypoints.push(y);
		
    	this.npoints++;
    },
    
    getBound:function(){
    	var points =[];
    	for(var i =0;i<this.npoints;i++){
    		points.push(new Atlas.Point(this.xpoints[i],this.ypoints[i]));
    	}
    	
    	return new Atlas.Bounds(points);
    },
    
    containsPoint: function (p) {
		var inside = false,
			part, p1, p2,
			i, j, k,
			len, len2;

    	var points =[];
    	for(var i =0;i<this.npoints;i++){
    		points.push(new Atlas.Point(this.xpoints[i],this.ypoints[i]));
    	}
    	

		//射线法
		for (j = 0, len2 = points.length, k = len2 - 1; j < len2; k = j++) {
			p1 = points[j];
			p2 = points[k];

			if (((p1.y > p.y) !== (p2.y > p.y)) &&
					(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
				inside = !inside;
			}
		}

		return inside;
	}

});


   