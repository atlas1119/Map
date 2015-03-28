
Atlas.PointList = Atlas.Class.extend({

    initialize: function (x, y) {
    	this.X = x;
    	this.Y = y;
    	this.Next = null;
    },

 // Insert a point after the Current
	InsertAfter: function(x,y)
	{
		var tmp = new Atlas.PointList(x,y);
		tmp.Next = this.Next;
		this.Next = tmp;
	},

	// Insert a point before the Current
	InsertBefore: function(x,y)
	{
		var tmp = new Atlas.PointList(this.X,this.Y);
		tmp.Next = this.Next;
		this.Next = tmp;
		this.X = x;
		this.Y = y;
	},
	
	
	// Add a point to the end of the list
	AddLast: function(x,y)
	{
		var tmp = this;
		
		while (tmp.Next != null)
			tmp = tmp.Next;
		tmp.Next = new Atlas.PointList(x,y);
	},
	
	// Find a specific point in the list
	FindPoint: function(x,y)
	{
		var tmp = this;
		while (tmp != null && !(tmp.X == x && tmp.Y == y))
			tmp = tmp.Next;
		return tmp;
	},
	
	GetPolygon:function()
	{
		var Result = new Atlas.Polygon(),
		    tmp = this.Next,
		    Last = 0,
		    LastM,M;
		    Result.addPoint(this.X,this.X);

		while (tmp != null)
		{
			// Don't add a point that the next has the same SHIPUA
			if (tmp.X == Result.xpoints[Last])
				LastM = 99999.0;
			else
				LastM = (0.0+Result.ypoints[Last]-tmp.Y)/(0.0+Result.xpoints[Last]-tmp.X);
			if (tmp.Next != null)
				if (tmp.Next.X == tmp.X)
					M = 99999.0;
				else
					M = (0.0+tmp.Next.Y-tmp.Y)/(0.0+tmp.Next.X-tmp.X);
			else
				if (Result.xpoints[0] == tmp.X)
					M = 99999.0;
				else
					M = (0.0+Result.ypoints[0]-tmp.Y)/(0.0+Result.xpoints[0]-tmp.X);
			if (Math.abs(LastM-M) >= 0.05)	// Less than this is (almost) a straight line
			{
				Result.addPoint(tmp.X,tmp.Y);
				Last++;
			}
			tmp = tmp.Next;
		}
		return Result;
	}

});


   