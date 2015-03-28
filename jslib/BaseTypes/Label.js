
Atlas.Label = Atlas.Class.extend({

    initialize: function (labelBox,h_offset,v_offset,x,y) {	//(Point, Point) or Point[]
        if (!labelBox) { return; }
        
        this._labelBox = labelBox;
        
        this.h_offset = h_offset;
        this.v_offset = v_offset;
        
        this.x = x;
        this.y = y;
        
        this.overlap_vectors = {};
    },
    
    compareTo: function(otherLabelBox)
    {
        if (this._labelBox.intersects(otherLabelBox))
            return 0;
        else if (otherLabelBox.min.x > this._labelBox.max.x ||
        		otherLabelBox.min.y > this._labelBox.max.y)
            return 1;
        else
            return -1;
    },
    
    computeLabel:function(label){
    	
    	this._computeOverlapVector(label);
    	
		if(this.overlap_vectors["X"] != 0.0)
			this.h_offset = this.overlap_vectors["X"] >= 0 ? 0.0 : this._labelBox.getWidth();
		
		if(this.overlap_vectors["Y"] != 0.0)
			this.v_offset = this.overlap_vectors["Y"] >= 0 ? 0.0 : this._labelBox.getHeight();
			
		return {h_offset:this.h_offset,v_offset:this.v_offset};
    },
    
	/**
	 * Returns true, if the current label intersects the given label in horizontal direction.
	 * @param l2 a reference to the label to compare
	 */
	_doesIntersectHorizontal:function(label)
	{
		var tl1 = this._labelBox.min,
	    tl2 = label._labelBox.min;

		return ((tl2.x + label._labelBox.getWidth() > tl1.x && tl2.x < tl1.x + this._labelBox.getWidth()));
	},

	/**
	 * Returns true, if the current label intersects the given label in vertical direction.
	 * @param l2 a reference to the label to compare
	 */
	_doesIntersectVertical:function(label)
	{
		var tl1 = this._labelBox.min,
	    tl2 = label._labelBox.min;

		return ((tl2.y + label._labelBox.getHeight() > tl1.y && tl2.y < tl1.y + this._labelBox.getHeight()));
	},
	
	_computeOverlapVector: function(label)
	{
		//Label l1 = labels[i];
		
		
		this.overlap_vectors["X"] = this.overlap_vectors["Y"] = 0.0;


			if (this.compareTo(label._labelBox) == 0)
			{
				//label._labelBox.min
				
				var r = label._labelBox.createIntersection(this._labelBox),
				    dx = r.getWidth() / 2,
				    dy = r.getHeight() / 2;

				if (this.y < label.y) //l1 is on top of l2
					dy = -dy;

				if (this.x < label.x) //l1 is on top of l2
					dx = -dx;

				this.overlap_vectors["X"] += dx;
				this.overlap_vectors["Y"] += dy;
			}
		
	},
	
	
    
    /**
	 * returns the smallest distance between two rectangles, -1 if they overlap...
	 */
	getMinDistance: function(label)
	{
		var tl1 = this._labelBox.min,
		    tl2 = label._labelBox.min,
		    d = 0.0,
            h_intersect = this._doesIntersectHorizontal(label),
		    v_intersect = this._doesIntersectVertical(label);

		if (v_intersect && h_intersect)
		{
			d = -1.0;
		}
		else if (h_intersect)
		{
			d = Math.abs(tl1.y - tl2.y);
			if (tl1.y < tl2.y)
				d -= this._labelBox.getHeight();
			else
				d -= label._labelBox.getHeight();
		}
		else if (v_intersect)
		{
			d = Math.abs(tl1.x - tl2.x);
			if (tl1.x < tl2.x)
				d -= this._labelBox.getWidth();
			else
				d -= label._labelBox.getWidth();
		}
		else
		{
			var x1 = tl1.x,y1 = tl1.y,x2 = tl2.x,y2 = tl2.y;

			if (tl1.x > tl2.x)
			{
				if (tl1.y > tl2.y)
				{
					y1 += this._labelBox.getHeight();
					x2 += label._labelBox.getWidth();
				}
				else
				{
					x2 += label._labelBox.getWidth();
					y2 += label._labelBox.getHeight();
				}
			}
			else
			{
				if (tl1.y > tl2.y)
				{
					x1 += this._labelBox.getWidth();
					y1 += this._labelBox.getHeight();
				}
				else
				{
					y2 += label._labelBox.getHeight();
					x1 += this._labelBox.getWidth();
				}
			}

			var dx = x1 - x2,dy = y1 - y2;

			d = Math.sqrt(dx * dx + dy * dy);
		}

		return d;
	}

});
