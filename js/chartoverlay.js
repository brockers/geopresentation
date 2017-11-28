function MyOverlay (map, chart) {
	this.map = map;
	this.setMap(map);
	this.chart = chart;
}

MyOverlay.prototype = new google.maps.OverlayView();

MyOverlay.prototype.onAdd = function () {
	this.rectTarget = this.map.getBounds().getCenter();
	this.targetLatLng = this.map.getBounds().getCenter();
	this.chartTarget = new google.maps.LatLng(35.4535404, -97.6020877);

	var overlay = d3.select(this.getPanes().overlayLayer);
	var mouseLayer = d3.select(this.getPanes().overlayMouseTarget);
	var chartLayer = mouseLayer.append("div")
		.attr("class", "charts");

	this.chart.attachChart(chartLayer);
	//this.chart.attachChart(mouseLayer); // use this layer if you wanted mouse events on chart
};

MyOverlay.prototype.draw = function () {
	this.chart.update(this.getProjection(), this.map.getZoom());
	this.chart.draw();
}

MyOverlay.prototype.onRemove = function () {
	//TODO remove container and any listeners
};

MyOverlay.prototype.focus = function(){
	this.map.setCenter(this.chart.latLng());
	this.map.setZoom(16);
};
