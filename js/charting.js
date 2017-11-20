var defaults = {
	width: 600,
	height: 400,
	padding: {top:0, right:0, bottom:0, left:0},
	margins: {top:0, right:0, bottom:0, left:0},
};

function BarChart(targetId, options){
	options = options || {};
	var width = options.width || defaults.width;
	var height = options.height || defaults.height;
	var margins = (options.margins===undefined) ? defaults.margins : {
		top: options.margins.top || defaults.margins.top,
		right: options.margins.right || defaults.margins.right,
		bottom: options.margins.bottom || defaults.margins.bottom,
		left: options.margins.left || defaults.margins.left,
	};
	var padding = (options.padding===undefined) ? defaults.padding : {
		top: options.padding.top || defaults.padding.top,
		right: options.padding.right || defaults.padding.right,
		bottom: options.padding.bottom || defaults.padding.bottom,
		left: options.padding.left || defaults.padding.left,
	};

	// Compute sizes for svg and chart
	this.width = {
		chart: width - margins.left - margins.right - padding.left - padding.right,
		svg: width + margins.left + margins.right - padding.left - padding.right,
	};
	this.height = {
		chart: height - margins.top - margins.bottom - padding.top - padding.bottom,
		svg: height + margins.top + margins.bottom - padding.top - padding.bottom,
	};
	this.margins = margins;
	this.padding = padding;
	
	var defaultBarHeight = this.height;

	// Initial set up of our scales
	// input => domain | output => range
	var x = d3.scaleBand()
		.rangeRound([0, this.width.chart])
		.padding(0.1);
	var y = d3.scaleLinear()
		.domain([0, this.height.chart]) // placeholder for now until we know our maximum value
		.range([0, this.height.chart]);
		
	this.scales = { x:x, y:y };

	// Create svg element
	d3.select(targetId).selectAll("svg").remove();
	var svg = d3.select(targetId).append("svg")
		.attr("width", this.width.svg)
		.attr("height", this.height.svg)
		.style("padding", [this.padding.top, this.padding.right, this.padding.bottom, this.padding.left].join(" "))
		.append("g")
		.attr("transform", "translate(" + margins.left + "," + margins.top + ")");

	this.svg = svg;
}

BarChart.prototype.draw = function(data){
	var self = this;
	var x = this.scales.x;
	var y = this.scales.y;

	// Reset domains
	x.domain(data.map(function(d){ return d.key; }));
	y.domain([0, d3.max(data, function(d){ return d.value; })]);

	///////////
	// ENTER //
	///////////

	// Bind new data to chart bars
	
	// Create chart bars
	var bars = this.svg.selectAll("g.bar-container")
		.data(data, function(d){ return d.key; });
	var newBar = bars
		.enter()
		.append("g")
		.attr("class", "bar-container");

	// Add rectangles
	newBar.insert("rect")
		.attr("class", "bar")
		.attr("x", function(d){ return x(d.key); })
		.attr("y", function(d){ return self.height.chart - y(d.value); })
		.attr("height", function(d){ return y(d.value); })
		.attr("width", x.bandwidth());

	// Add value labels
	newBar.append("text")
		.attr("class","label")
		.attr("x", function(d) { return x(d.key)+x.bandwidth()/2; })
		.attr("y", function(d) { return self.height.chart - y(d.value)-5; })
		.attr("text-anchor", "middle")
		.text(function(d){ return d.value; });
	

	////////////
	// UPDATE //
	////////////

	// Update bar heights
	bars.select(".bar").transition()
		.duration(300)
		.attr("y", function(d){ return self.height.chart - y(d.value); })
		.attr("height", function(d){ return y(d.value); })

	// Update data labels
	var labelFormat = d3.format(",d");
	bars.select(".label").transition()
		.duration(300)
		.attr("y", function(d) { return self.height.chart - y(d.value)-5; })
		.tween("text", function(d){
			var el = d3.select(this);
			var i = d3.interpolate(+this.textContent.replace(/\,/g,""), +d.value);
			return function(t){
				el.text(labelFormat(i(t)));
			};
		});

	//////////
	// EXIT //
	//////////
	
	// Remove elements not in the list anymore
	bars.exit().remove();

	// Add x-axis to the histogram svg.
	this.svg.select("g.x.axis").remove(); // remove old axis if it exists
	this.svg.append("g").attr("class", "x axis")
		.attr("transform", "translate(0," + self.height.chart + ")")
		.call(d3.axisBottom(x))
		.attr("font-size", "18px");
}












// http://www.colourlovers.com/palette/937624/Dance_To_Forget
var colors = ['#FF4E50','#FC913A','#F9D423','#EDE574','#E1F5C4','#FF4E50','#FC913A','#F9D423'];
var barColor = "steelblue";
var rectWidth = 50;
var rectHeight = 50;
var cirRad = 5;
var chartWidth = 1200;
var chartHeight = 750;
var chartPadding = {
	x:20,
	y:30,
};
var chartFontSize = 20;

function MyOverlay (map) {
	this.map = map;
	this.svg = null;
	this.data = [
		{State:'AL',freq:{low:4786, mid:1319, high:249}},
		{State:'AZ',freq:{low:1101, mid:412, high:674}},
		{State:'CT',freq:{low:932, mid:2149, high:418}},
		{State:'DE',freq:{low:832, mid:1152, high:1862}},
		{State:'FL',freq:{low:4481, mid:3304, high:948}},
		{State:'GA',freq:{low:1619, mid:167, high:1063}},
		{State:'IA',freq:{low:1819, mid:247, high:1203}},
		{State:'IL',freq:{low:4498, mid:3852, high:942}},
		{State:'IN',freq:{low:797, mid:1849, high:1534}},
		{State:'KS',freq:{low:162, mid:379, high:471}},
	];

	this.setMap(map);
}

//MyOverlay.prototype = new google.maps.OverlayView();

MyOverlay.prototype.onAdd = function () {
	var self = this;
	var mapDiv = this.map.getDiv();
	this.rectTarget = this.map.getBounds().getCenter();
	this.targetLatLng = this.map.getBounds().getCenter();
	this.chartTarget = new google.maps.LatLng(35.4535404, -97.6020877);

	var overlay = d3.select(this.getPanes().overlayLayer);
	var mouseLayer = d3.select(this.getPanes().overlayMouseTarget);
	var rectLayer = overlay.append("div")
		.attr("class", "rect-container");
	var chartLayer = mouseLayer.append("div")
		.attr("class", "charts");
	var circleLayer = overlay.append("div")
		.attr("class", "circles");

	this.addRect(this.getProjection(), rectLayer);
	this.addCircle(this.getProjection(), circleLayer);

	// compute total for each state
	this.data.forEach(function(d){
		d.total = d.freq.low + d.freq.mid + d.freq.high;
	});

	var chartData = this.data.map(function(d){return [d.State,d.total];});
	this.buildHistogram(this.getProjection(), chartLayer, chartData);

	d3.select("body").on("keyup", function(){
		switch(d3.event.key){
			case "1": self.map.setCenter(self.chartTarget); break;
			case "2": self.map.setCenter(self.rectTarget); break;
		}
	});
};

MyOverlay.prototype.draw = function () {
	this.drawRect();
	this.drawCircle();
	this.drawHistogram();
}

MyOverlay.prototype.onRemove = function () {
	//TODO remove container and any listeners
};

MyOverlay.prototype.drawRect = function () {
	// map svg scale from 10% to 100% based off of gmaps zoom
	var zoomScale = d3.scaleLinear().range([0.1, 1]).domain([1, 20]);

	var proj = this.getProjection();
	var x = proj.fromLatLngToDivPixel(this.targetLatLng).x 
	var y = proj.fromLatLngToDivPixel(this.targetLatLng).y
	var newScale = zoomScale(this.map.getZoom());
	var scale = "scale(" + newScale + ")";
	var translate = "translate(" + (x-rectWidth/2) + "," + (y-rectHeight/2) + ")";

	var svg = d3.select(this.getPanes().overlayLayer).select(".rect-container").select("svg")
		.attr("transform", translate+scale);
	
	var cirTranslate = "translate(" + (x-cirRad) + "," + (y-cirRad) + ")";
	d3.select(this.getPanes().overlayLayer).select(".rect-container").select("svg:nth-child(2)")
		.attr("transform", cirTranslate+scale);
};

MyOverlay.prototype.drawCircle = function(){
	var zoomScale = d3.scaleLinear().range([0.1, 1]).domain([1, 20]);

	var proj = this.getProjection();
	var x = proj.fromLatLngToDivPixel(this.chartTarget).x 
	var y = proj.fromLatLngToDivPixel(this.chartTarget).y

	var newScale = zoomScale(this.map.getZoom());
	var scale = "scale(" + newScale + ")";
	var translate = "translate(" + (x-cirRad) + "," + (y-cirRad) + ")";

	d3.select(this.getPanes().overlayLayer).select(".circles").select("svg")
		.attr("transform", translate+scale);
};

MyOverlay.prototype.drawHistogram = function(){
	// setup custom scaling
	var zoomScale = d3.scaleQuantize()
		.domain([8, 16])
		.range([0.01, 0.02, 0.03, 0.05, 0.15, 0.35, 0.45, 0.6, 0.8]);

	var proj = this.getProjection();
	var x = proj.fromLatLngToDivPixel(this.chartTarget).x; 
	var y = proj.fromLatLngToDivPixel(this.chartTarget).y;

	var newScale = zoomScale(this.map.getZoom());
	var scale = "scale(" + newScale + ")";
	var translate = "translate(" + (x-chartWidth/2-chartPadding.x) + "," + (y-chartHeight/2-chartPadding.y) + ")";
	console.log("zoom:", this.map.getZoom(), "|", scale);

	d3.select(this.getPanes().overlayMouseTarget).select(".charts").select("svg")
		.attr("transform", translate+scale);
};

MyOverlay.prototype.addRect = function(proj, layer){
	var x = proj.fromLatLngToDivPixel(this.rectTarget).x 
	var y = proj.fromLatLngToDivPixel(this.rectTarget).y
	var translate = "translate(" + [x,y].join(",") + ")";
	var svg = layer.append("svg")
		.attr("transform", translate);

	svg.append("rect")
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.attr("fill", "magenta");

	var cirTranslate = "translate(" + [x,y].join(",") + ")";
	layer.append("svg")
			.style("width", cirRad*2)
			.style("height", cirRad*2)
			.attr("transform",cirTranslate)
		.append("circle")
			.attr("cx", cirRad)
			.attr("cy", cirRad)
			.attr('r', cirRad)
			.attr('fill', "black");
}

MyOverlay.prototype.addCircle = function(proj, layer){
	var x = proj.fromLatLngToDivPixel(this.chartTarget).x 
	var y = proj.fromLatLngToDivPixel(this.chartTarget).y
	var translate = "translate(" + [x,y].join(",") + ")";
	layer.append("svg")
			.style("width", cirRad*2)
			.style("height", cirRad*2)
			.attr("transform",translate)
		.append("circle")
			.attr("cx", cirRad)
			.attr("cy", cirRad)
			.attr('r', cirRad)
			.attr('fill', "magenta");
}

MyOverlay.prototype.buildHistogram = function(proj, layer, fData){
	var hG={},	  hGDim = {t: 60, r: 0, b: 30, l: 0};
	hGDim.w = chartWidth - hGDim.l - hGDim.r, 
	hGDim.h = chartHeight - hGDim.t - hGDim.b;

	var xPos = proj.fromLatLngToDivPixel(this.chartTarget).x;
	var yPos = proj.fromLatLngToDivPixel(this.chartTarget).y;
	var chartTranslate = "translate(" + [xPos,yPos].join(",") + ")";
	//create svg for histogram.
	var hGsvg = layer.append("svg")
		.style("padding", chartPadding.y + "px " + chartPadding.x + "px")
		.style("background-color", "white")
		.attr("width", hGDim.w + hGDim.l + hGDim.r)
		.attr("height", hGDim.h + hGDim.t + hGDim.b)
		.attr("transform", chartTranslate).append("g");

	// create function for x-axis mapping.
	var x = d3.scaleBand()
		.domain(fData.map(function(d) { return d[0]; }))
		.rangeRound([0, hGDim.w], 0.1);

	// Add x-axis to the histogram svg.
	hGsvg.append("g").attr("class", "x axis")
		.attr("transform", "translate(0," + hGDim.h + ")")
		.call(d3.axisBottom(x))
		.attr("font-size", chartFontSize + "px");

	// Create function for y-axis map.
	var y = d3.scaleLinear().range([hGDim.h, 0])
			.domain([0, d3.max(fData, function(d) { return d[1]; })]);

	// Create bars for histogram to contain rectangles and freq labels.
	var bars = hGsvg.selectAll(".bar").data(fData).enter()
			.append("g").attr("class", "bar");
	
	//create the rectangles.
	bars.append("rect")
		.attr("x", function(d) { return x(d[0]); })
		.attr("y", function(d) { return y(d[1]); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return hGDim.h - y(d[1]); })
		.attr('fill',barColor)
		//.on("mouseover",mouseover)// mouseover is defined below.
		//.on("mouseout",mouseout);// mouseout is defined below.
		
	//Create the frequency labels above the rectangles.
	bars.append("text").text(function(d){ return d3.format(",")(d[1])})
		.attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
		.attr("y", function(d) { return y(d[1])-5; })
		.attr("font-size", chartFontSize + "px")
		.attr("text-anchor", "middle");
	
	function mouseover(d){	// utility function to be called on mouseover.
		console.log("mouseover");
		// filter for selected state.
		var st = fData.filter(function(s){ return s.State == d[0];})[0],
			nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
		   
		// call update functions of pie-chart and legend.	 
		//pC.update(nD);
		//leg.update(nD);
	}
	
	function mouseout(d){	 // utility function to be called on mouseout.
		console.log("mouseout");
		// reset the pie-chart and legend.	  
		//pC.update(tF);
		//leg.update(tF);
	}
	
	// create function to update the bars. This will be used by pie-chart.
	//hG.update = function(nD, color){
	//	// update the domain of the y-axis map to reflect change in frequencies.
	//	y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
	//	
	//	// Attach the new data to the bars.
	//	var bars = hGsvg.selectAll(".bar").data(nD);
	//	
	//	// transition the height and color of rectangles.
	//	bars.select("rect").transition().duration(500)
	//		.attr("y", function(d) {return y(d[1]); })
	//		.attr("height", function(d) { return hGDim.h - y(d[1]); })
	//		.attr("fill", color);

	//	// transition the frequency labels location and change value.
	//	bars.select("text").transition().duration(500)
	//		.text(function(d){ return d3.format(",")(d[1])})
	//		.attr("y", function(d) {return y(d[1])-5; });			 
	//}		 
	return hG;
}
