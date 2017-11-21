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

function MyOverlay (map, chart) {
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
	this.chart = chart;
}

MyOverlay.prototype = new google.maps.OverlayView();

MyOverlay.prototype.onAdd = function () {
	var self = this;
	var mapDiv = this.map.getDiv();
	this.rectTarget = this.map.getBounds().getCenter();
	this.targetLatLng = this.map.getBounds().getCenter();
	this.chartTarget = new google.maps.LatLng(35.4535404, -97.6020877);

	var overlay = d3.select(this.getPanes().overlayLayer);
	var mouseLayer = d3.select(this.getPanes().overlayMouseTarget);
	var chartLayer = mouseLayer.append("div")
		.attr("class", "charts");


	// compute total for each state
	this.data.forEach(function(d){
		d.total = d.freq.low + d.freq.mid + d.freq.high;
	});

	this.chart.attachChart(chartLayer);

};

MyOverlay.prototype.draw = function () {
	this.chart.update(this.getProjection(), this.map.getZoom());
	this.chart.draw(HEADLINES);
}

MyOverlay.prototype.onRemove = function () {
	//TODO remove container and any listeners
};

//MyOverlay.prototype.drawHistogram = function(){
//	// setup custom scaling
//	var zoomScale = d3.scaleQuantize()
//		.domain([8, 16])
//		.range([0.01, 0.02, 0.03, 0.05, 0.15, 0.35, 0.45, 0.6, 0.8]);
//
//	var proj = this.getProjection();
//	var x = proj.fromLatLngToDivPixel(this.chartTarget).x; 
//	var y = proj.fromLatLngToDivPixel(this.chartTarget).y;
//
//	var newScale = zoomScale(this.map.getZoom());
//	var scale = "scale(" + newScale + ")";
//	var translate = "translate(" + (x-chartWidth/2-chartPadding.x) + "," + (y-chartHeight/2-chartPadding.y) + ")";
//
//	d3.select(this.getPanes().overlayMouseTarget).select(".charts").select("svg")
//		.attr("transform", translate+scale);
//};
//
//MyOverlay.prototype.buildHistogram = function(proj, layer, fData){
//	var hG={},	  hGDim = {t: 60, r: 0, b: 30, l: 0};
//	hGDim.w = chartWidth - hGDim.l - hGDim.r, 
//	hGDim.h = chartHeight - hGDim.t - hGDim.b;
//
//	var xPos = proj.fromLatLngToDivPixel(this.chartTarget).x;
//	var yPos = proj.fromLatLngToDivPixel(this.chartTarget).y;
//	var chartTranslate = "translate(" + [xPos,yPos].join(",") + ")";
//	//create svg for histogram.
//	var hGsvg = layer.append("svg")
//		.style("padding", chartPadding.y + "px " + chartPadding.x + "px")
//		.style("background-color", "white")
//		.attr("width", hGDim.w + hGDim.l + hGDim.r)
//		.attr("height", hGDim.h + hGDim.t + hGDim.b)
//		.attr("transform", chartTranslate).append("g");
//
//	// create function for x-axis mapping.
//	var x = d3.scaleBand()
//		.domain(fData.map(function(d) { return d[0]; }))
//		.rangeRound([0, hGDim.w], 0.1);
//
//	// Add x-axis to the histogram svg.
//	hGsvg.append("g").attr("class", "x axis")
//		.attr("transform", "translate(0," + hGDim.h + ")")
//		.call(d3.axisBottom(x))
//		.attr("font-size", chartFontSize + "px");
//
//	// Create function for y-axis map.
//	var y = d3.scaleLinear().range([hGDim.h, 0])
//			.domain([0, d3.max(fData, function(d) { return d[1]; })]);
//
//	// Create bars for histogram to contain rectangles and freq labels.
//	var bars = hGsvg.selectAll(".bar").data(fData).enter()
//			.append("g").attr("class", "bar");
//	
//	//create the rectangles.
//	bars.append("rect")
//		.attr("x", function(d) { return x(d[0]); })
//		.attr("y", function(d) { return y(d[1]); })
//		.attr("width", x.bandwidth())
//		.attr("height", function(d) { return hGDim.h - y(d[1]); })
//		.attr('fill',barColor)
//		
//	//Create the frequency labels above the rectangles.
//	bars.append("text").text(function(d){ return d3.format(",")(d[1])})
//		.attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
//		.attr("y", function(d) { return y(d[1])-5; })
//		.attr("font-size", chartFontSize + "px")
//		.attr("text-anchor", "middle");
//	
//	return hG;
//}
