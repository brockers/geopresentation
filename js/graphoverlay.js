GraphOverlay.prototype = Object.create(ProjectedOverlay.prototype);
GraphOverlay.prototype.constructor = GraphOverlay;

function GraphOverlay(bounds, image, map, options){
	ProjectedOverlay.apply(this, arguments);
	this.data_ = options.data || [];
}

GraphOverlay.prototype.getFData = function(){
	return this.data_.map(function(d){return [d.State,d.total,d.latLng];});
}

GraphOverlay.prototype.onAdd = function(){
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	//svg.style.width = "960px";
	//svg.style.height = "500px";
	svg.style.position = "absolute";
	svg.style.top = 0;
	svg.style.left = 0;
	svg.id = "dashboard";
	svg.style.pointerEvents = "none";

	this.svg_ = svg;

	//this.getPanes().overlayMouseTarget.appendChild(div);
	//console.log(div);

	//d3dashboard("#dashboard", this.data_, this.getProjection(), this.bounds_);
	console.log("data",this.data_);

	///////////////////////////
	// build histogram
	///////////////////////////
	var barColor = "steelblue";
	function segColor(c){ return {low:"#807dba", mid:"#e08214", high:"#41ab5d"}[c]; }

	var center = this.map_.getBounds().getCenter();

	// compute total for each state
	this.data_.forEach(function(d){
		d.total = d.freq.low + d.freq.mid + d.freq.high;
		d.latLng = center;
	});

	// calculate total frequency by state for all segment.
	var fData = this.getFData();

	var bounds = this.map_.getBounds();
	var hG={};
	var hGDim = {t:60, r:0, b:30, l:0};
	hGDim.w = 500 - hGDim.l - hGDim.r;
	hGDim.h = 500 - hGDim.t - hGDim.b;
	this.hGDim_ = hGDim;
	console.log("hGDim",hGDim);

	var proj = this.getProjection();

	// create svg for histogram
	var hGsvg = d3.select(this.svg_)
		//.attr("width", hGDim.w + hGDim.l + hGDim.r)
		//.attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
		.attr("width", "100%")
		.attr("height", "100%").append("g")
		.attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
		//.attr("transform", "translate(" + proj.fromLatLngToContainerPixel(center).x + "," + proj.fromLatLngToContainerPixel(center).y + ")");

	// create function for x-axis mapping
	var x = d3.scaleBand()
		.domain(fData.map(function(d) { return d[0]; }))
		.rangeRound([0, hGDim.w], 0.1);

	// Add x-axis to the histogram svg.
	hGsvg.append("g").attr("class", "x axis")
		.attr("transform", "translate(0," + hGDim.h + ")")
		.call(d3.axisBottom(x));

	// Create function for y-axis map.
	var y = d3.scaleLinear().range([hGDim.h, 0])
			.domain([0, d3.max(fData, function(d) { return d[1]; })]);

	// Create bars for histogram to contain rectangles and freq labels.
	var bars = hGsvg.selectAll(".bar").data(fData).enter()
			.append("g").attr("class", "bar");

	console.log(fData);
	
	//create the rectangles.
	bars.append("rect")
		//.attr("x", function(d) { return x(d[0]); })
		.data(fData, (d) => {
			return d[0];
		})
		.attr("x", (d,i) => {
			var fromProj = proj.fromLatLngToContainerPixel(d[2]).x
			console.log("X: original", x(d[0]), "fromProj", x(fromProj));
			return fromProj + x(d[0]);
		})
		//.attr("y", function(d) { return y(d[1]); })
		.attr("y", function(d) { 
			var fromProj = proj.fromLatLngToContainerPixel(d[2]).y
			console.log("Y: original", y(d[1]), "fromProj", y(fromProj));
			return y(d[1]);
		})
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return hGDim.h - y(d[1]); })
		.attr('fill',barColor)
		
	//Create the frequency labels above the rectangles.
	bars.append("text").text(function(d){ return d3.format(",")(d[1])})
		.attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
		.attr("y", function(d) { return y(d[1])-5; })
		.attr("text-anchor", "middle");

	this.map.addListener("center_changed", this.onPan.bind(this));
	document.body.appendChild(this.svg_);
}

GraphOverlay.prototype.onPan = function(){
	var self = this;
	var proj = self.getProjection();
	var fData = self.getFData();
	var hGDim = self.hGDim_;
	var center = this.map_.getBounds().getCenter();

	// create function for x-axis mapping
	var x = d3.scaleBand()
		.domain(fData.map(function(d) { return d[0]; }))
		.rangeRound([0, hGDim.w], 0.1);
	// Create function for y-axis map.
	var y = d3.scaleLinear().range([hGDim.h, 0])
			.domain([0, d3.max(fData, function(d) { return d[1]; })]);

	d3.select("#dashboard").select("g")
		.selectAll(".bar").select("rect")
		.data(fData)
		.attr("x", function(d,i,group){
			return i * x.bandwidth() + proj.fromLatLngToContainerPixel(d[2]).x
		})
		.attr("y", function(d,i){
			return y(d[1]) + proj.fromLatLngToContainerPixel(d[2]).y - hGDim.h;
		})
		.attr("height", function(d,i){
			var fromProj = proj.fromLatLngToContainerPixel(d[2]).y
			//return hGDim.h - y(d[1]);
			return hGDim.h - y(d[1]);
		});
}

GraphOverlay.prototype.draw = function(){
}
