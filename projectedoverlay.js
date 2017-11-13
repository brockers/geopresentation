ProjectedOverlay.prototype = new google.maps.OverlayView();

function ProjectedOverlay(bounds, image, map, options) {
	// Initialize properties
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;
	this.options = options || {isClickable:false};
	this.nextSlide_ = null;

	// Define a property to hold the image's div. We'll
	// actually create this div upon receipt of the onAdd()
	// method so we'll leave it null for now
	this.div_ = null;

	// Expclicitly call setMap
	this.setMap(map);
}

// Called with the map's panes are ready and the overlay has been added to the map
ProjectedOverlay.prototype.onAdd = function() {
	var div = document.createElement("div");
	div.style.borderStyle = "none";
	div.style.borderWidth = "0px";
	div.style.position = "absolute";

	// Create the image element and attch it to the div
	var img = document.createElement("img");
	img.src = this.image_;
	img.style.width = "100%";
	img.style.height = "100%";
	img.style.position = "absolute";
	div.appendChild(img);

	this.div_ = div;

	// Add the element to the correct pane
	if(this.options.isClickable){
		this.getPanes().overlayMouseTarget.appendChild(div);
	}else{
		this.getPanes().overlayLayer.appendChild(div);
	}

	//if(this.nextSlide_){
	//	var self = this;
	//	google.maps.event.addDomListener(self.div_, "click", function(){
	//		self.map_.setCenter(self.nextSlide_);
	//		self.map_.setZoom(16);
	//	});
	//}
}

ProjectedOverlay.prototype.draw = function() {
	// We use the SW and NE coordinates of the overlay to peg it to the correct
	// position and size. To do this, we need to retrieve the projection from the overlay
	var overlayProjection = this.getProjection();

	// Retrieve the SW and NE coordinates of this overlay in LatLngs and convert them to pixel
	// coordinates. We'll use these coordinates to resize the div.
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

	// Resize the image's div to fit the indicated dimensions
	var div = this.div_;
	div.style.left = sw.x + "px";
	div.style.top = ne.y + "px";
	div.style.width = (ne.x - sw.x) + "px";
	div.style.height = (sw.y - ne.y) + "px";
}

ProjectedOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
	this.div_ = null;
}

ProjectedOverlay.prototype.hide = function() {
	if(this.div_){
		this.div_.style.visibility = "hidden";
	}
}

ProjectedOverlay.prototype.show = function() {
	if(this.div_){
		this.div_.style.visibility = "visible";
	}
}

ProjectedOverlay.prototype.toggle = function() {
	if(this.div_){
		if(this.div_.style.visibility==="hidden"){
			this.show();
		}else{
			this.hide();
		}
	}
}

ProjectedOverlay.prototype.setNextSlide = function(nextSlide){
	this.nextSlide_ = nextSlide;
}

ProjectedOverlay.prototype.getNextSlide = function(){
	return this.nextSlide_;
}

ProjectedOverlay.prototype.getDiv = function(){
	return this.div_;
}
