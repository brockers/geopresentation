console.log("loading graphoverlay.js");
GraphOverlay.prototype = Object.create(ProjectedOverlay.prototype);
GraphOverlay.prototype.constructor = GraphOverlay;

GraphOverlay.prototype.onAdd = function(){
	console.log("GraphOverlay.onAdd");
	var div = document.createElement("div");
	div.id = "dashboard";
	div.style.borderStyle = "none";
	div.style.borderWidth = "0px";
	div.style.position = "absolute";

	this.div_ = div;

	this.getPanes().overlayMouseTarget.appendChild(div);
}
