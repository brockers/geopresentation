// http://www.colourlovers.com/palette/937624/Dance_To_Forget
var colors = ['#FF4E50','#FC913A','#F9D423','#EDE574','#E1F5C4','#FF4E50','#FC913A','#F9D423'];
var rectWidth = 50;
var rectHeight = 50;
var cirRad = 5;

function MyOverlay (map) {
	this.map = map;
	this.svg = null;
	this.coords = [];

	this.setMap(map);
}

MyOverlay.prototype = new google.maps.OverlayView();

MyOverlay.prototype.onAdd = function () {
	var mapDiv = this.map.getDiv();
	this.targetLatLng = this.map.getBounds().getCenter();

	var layer = d3.select(this.getPanes().overlayLayer).append("div")
		.attr("class", "rect-container");

	this.drawRect(this.getProjection(), layer);
};

MyOverlay.prototype.draw = function () {
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

MyOverlay.prototype.onRemove = function () {
	//TODO remove container and any listeners
};

MyOverlay.prototype.drawRect = function(proj, layer){
	var x = proj.fromLatLngToDivPixel(this.targetLatLng).x 
	var y = proj.fromLatLngToDivPixel(this.targetLatLng).y
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
