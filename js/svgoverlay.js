// http://www.colourlovers.com/palette/937624/Dance_To_Forget
var colors = ['#FF4E50','#FC913A','#F9D423','#EDE574','#E1F5C4','#FF4E50','#FC913A','#F9D423'];

function SVGOverlay (map) {
	this.map = map;
	this.svg = null;
	this.coords = [];

	this.onPan = this.onPan.bind(this);

	this.setMap(map);

	this.map.addListener("zoom_changed", this.onZoom.bind(this));
}

SVGOverlay.prototype = new google.maps.OverlayView();

SVGOverlay.prototype.onAdd = function () {
	console.log("onAdd");

	this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	this.svg.style.position = 'absolute';
	this.svg.style.top = 0;
	this.svg.style.left = 0;
	//this.svg.style.width = '960px';
	//this.svg.style.height = '500px';
	this.svg.style.width = '100%';
	this.svg.style.height = '100%';
	this.svg.style.pointerEvents = 'none';

	var bounds = this.map.getBounds(),
			center = bounds.getCenter(),
			ne = bounds.getNorthEast(),
			sw = bounds.getSouthWest();
	for (var i = 0; i < 40; i++) {
		this.coords.push({
			id: i,
			color: colors[i % colors.length],
			latLng: center
			//latLng: new google.maps.LatLng(
			//	center.lat() + (Math.random() - 0.5) * Math.abs(ne.lat() - sw.lat()),
			//	center.lng() + (Math.random() - 0.5) * Math.abs(ne.lng() - sw.lng())
			//)
		});
	}

	var proj = this.getProjection();

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

	this.onPan();
	document.body.appendChild(this.svg);
	this.map.addListener('center_changed', this.onPan);
};

SVGOverlay.prototype.onPan = function () {
	var proj = this.getProjection();
	d3.select(this.svg)
		.select('.coords')
		.selectAll('circle')
		.data(this.coords)
			//.attr('cx', (d,i) => {
			//	if(i==0){console.log(proj.fromLatLngToContainerPixel(d.latLng).x);}
			//	return proj.fromLatLngToContainerPixel(d.latLng).x;
			//})
			.attr('cx', (d) => proj.fromLatLngToContainerPixel(d.latLng).x)
			.attr('cy', (d) => proj.fromLatLngToContainerPixel(d.latLng).y);
};

SVGOverlay.prototype.onZoom = function(){
	var mapZoom = this.map.getZoom();
	var circleRadius;
	if(mapZoom<=5){
		circleRadius = 3;
	}else if(mapZoom>5 && mapZoom<=7){
		circleRadius = 4;
	}else if(mapZoom>7 && mapZoom<=9){
		circleRadius = 5;
	}else{
		circleRadius = 10;
	}

	d3.select(this.svg)
		.select(".coords")
		.selectAll("circle")
		.attr("r", circleRadius);
}

SVGOverlay.prototype.onRemove = function () {
	this.map.removeListener('center_changed', this.onPan);
	this.svg.parentNode.removeChild(this.svg);
	this.svg = null;
};

SVGOverlay.prototype.draw = function () {
	console.log('draw');
};
