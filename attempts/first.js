// http://www.colourlovers.com/palette/937624/Dance_To_Forget
var colors = ['#FF4E50','#FC913A','#F9D423','#EDE574','#E1F5C4','#FF4E50','#FC913A','#F9D423'];

function MyOverlay (map) {
	this.map = map;
	this.svg = null;
	this.coords = [];

	//this.onPan = this.onPan.bind(this);

	this.setMap(map);

	//this.map.addListener("zoom_changed", this.onZoom.bind(this));
}

MyOverlay.prototype = new google.maps.OverlayView();

MyOverlay.prototype.onAdd = function () {
	var mapDiv = this.map.getDiv();

	this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	this.svg.style.position = 'absolute';
	this.svg.style.top = 0;
	this.svg.style.left = 0;
	//this.svg.style.width = '960px';
	//this.svg.style.height = '500px';
	this.svg.style.width = '100%';
	this.svg.style.height = mapDiv.offsetHeight;
	this.svg.style.pointerEvents = 'none';

	var bounds = this.map.getBounds(),
			center = bounds.getCenter(),
			ne = bounds.getNorthEast(),
			sw = bounds.getSouthWest();
	this.targetLatLng = center;

	var layer = d3.select(this.getPanes().overlayLayer).append("div")
		.attr("class", "rect-container");

	var proj = this.getProjection();
	//this.drawCircles(proj);
	//this.onPan();
	//document.body.appendChild(this.svg);
	//this.map.addListener('center_changed', this.onPan);

	this.drawRect(proj, layer);
	console.log(layer.select(".rect-container"));
};

MyOverlay.prototype.draw = function () {
	var zoomScale = d3.scaleLinear().range([0.1, 1]).domain([0, 20]);


	var proj = this.getProjection();
	var x = proj.fromLatLngToDivPixel(this.targetLatLng).x 
	var y = proj.fromLatLngToDivPixel(this.targetLatLng).y
	var newScale = zoomScale(this.map.getZoom());
	var scale = "scale(" + newScale + ")";
	var translate = "translate(" + (x-25) + "," + (y-25) + ")";

	var svg = d3.select(this.getPanes().overlayLayer).select(".rect-container").select("svg")
		.attr("transform", translate+scale);

	
	var cirTranslate = "translate(" + (x-5) + "," + (y-5) + ")";
	d3.select(this.getPanes().overlayLayer).select(".rect-container").select("svg:nth-child(2)")
		.attr("transform", cirTranslate+scale);
};

//MyOverlay.prototype.onPan = function () {
//	var proj = this.getProjection();
//	d3.select(this.svg)
//		.select('.coords')
//		.selectAll('circle')
//		.data(this.coords)
//			//.attr('cx', (d,i) => {
//			//	if(i==0){console.log(proj.fromLatLngToContainerPixel(d.latLng).x);}
//			//	return proj.fromLatLngToContainerPixel(d.latLng).x;
//			//})
//			.attr('cx', (d) => proj.fromLatLngToContainerPixel(d.latLng).x)
//			.attr('cy', (d) => proj.fromLatLngToContainerPixel(d.latLng).y);
//};

//MyOverlay.prototype.onZoom = function(){
//	var mapZoom = this.map.getZoom();
//	var circleRadius;
//	if(mapZoom<=5){
//		circleRadius = 3;
//	}else if(mapZoom>5 && mapZoom<=7){
//		circleRadius = 4;
//	}else if(mapZoom>7 && mapZoom<=9){
//		circleRadius = 5;
//	}else{
//		circleRadius = 10;
//	}
//
//	d3.select(this.svg)
//		.select(".coords")
//		.selectAll("circle")
//		.attr("r", circleRadius);
//}

MyOverlay.prototype.onRemove = function () {
	this.map.removeListener('center_changed', this.onPan);
	this.svg.parentNode.removeChild(this.svg);
	this.svg = null;
};

MyOverlay.prototype.drawCircles = function(proj){
	for (var i = 0; i < 40; i++) {
		this.coords.push({
			id: i,
			color: colors[i % colors.length],
			//latLng: center
			latLng: new google.maps.LatLng(
				center.lat() + (Math.random() - 0.5) * Math.abs(ne.lat() - sw.lat()),
				center.lng() + (Math.random() - 0.5) * Math.abs(ne.lng() - sw.lng())
			)
		});
	}


	d3.select(this.svg)
			.attr('width', 960)
			.attr('height', 500)
		.append('g')
			.attr('class', 'coords')
			.selectAll('circle')
			.data(this.coords, (d) => {
				return d.id;
			})
			.enter().append('circle')
				.attr('cx', (d) => proj.fromLatLngToContainerPixel(d.latLng).x)
				.attr('cy', (d) => proj.fromLatLngToContainerPixel(d.latLng).y)
				.attr('r', 5)
				.attr('fill', (d) => d.color);
}

MyOverlay.prototype.drawRect = function(proj, layer){
	//layer.append("svg").append("rect")
	//	.attr("x", proj.fromLatLngToDivPixel(this.targetLatLng).x)
	//	.attr("y", proj.fromLatLngToDivPixel(this.targetLatLng).y)
	//	//.attr("x", proj.fromLatLngToContainerPixel(this.targetLatLng).x)
	//	//.attr("y", proj.fromLatLngToContainerPixel(this.targetLatLng).y)
	//	.attr("width", 50)
	//	.attr("height", 50)
	//	.attr("fill", "magenta");

	var x = proj.fromLatLngToDivPixel(this.targetLatLng).x 
	var y = proj.fromLatLngToDivPixel(this.targetLatLng).y
	var translate = "translate(" 
		+ (proj.fromLatLngToDivPixel(this.targetLatLng).x-25) + ","
		+ (proj.fromLatLngToDivPixel(this.targetLatLng).y+25) + ")";
	var svg = layer.append("svg")
		.attr("transform", translate);
		//.style("left", proj.fromLatLngToDivPixel(this.targetLatLng).x + "px")
		//.style("top", proj.fromLatLngToDivPixel(this.targetLatLng).y + "px");

	svg.append("rect")
		.attr("width", 50)
		.attr("height", 50)
		.attr("fill", "magenta");

	var cirTranslate = "translate(" 
		+ proj.fromLatLngToDivPixel(this.targetLatLng).x + ","
		+ proj.fromLatLngToDivPixel(this.targetLatLng).y + ")";
	layer.append("svg")
			.style("width","10")
			.style("height","10")
			.attr("transform",cirTranslate)
		.append("circle")
			//.attr('cx', proj.fromLatLngToContainerPixel(this.targetLatLng).x)
			//.attr('cy', proj.fromLatLngToContainerPixel(this.targetLatLng).y)
			.attr("cx", 5)
			.attr("cy", 5)
			.attr('r', 5)
			.attr('fill', "black");

	//this.getPanes().overlayMouseTarget.appendChild(this.svg);
	//console.log(this.svg);
}
