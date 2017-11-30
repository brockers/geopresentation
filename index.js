// should only be called when gmaps is loaded
window.initMap = function() {
	function initialize(){
		var el = document.querySelector('#map');
		var google = window.google;

		var center = new google.maps.LatLng(35.4535404, -97.6020877);
		var map = new google.maps.Map(el, {
			center: center,
			zoom: 8,
			disableDefaultUI: true,
			noClear: true,
			mapTypeId: google.maps.MapTypeId.SATELLITE,
		});

		var data = HEADLINES; // from data/headlines
		var lastData;
		var margins = {bottom:25};
		var padding = {top:45, right:30, bottom:30, left:30};
		var chartOptions = {width:1200, height:750, margins:margins, padding:padding};

		var overlays = [];
		var valueDeltas = [];

		overlays.push(new MyOverlay(
			map, 
			new MapBarChart(center, HEADLINES, chartOptions)
		));
		valueDeltas.push(50);

		var freqData = FREQUENCY_DATA.map( d => ({
			key:d.key,
			value:d.freq.low + d.freq.mid + d.freq.high
		}) );
		overlays.push(new MyOverlay(
			map, 
			new MapBarChart(
				new google.maps.LatLng(35.532813, -97.952580),
				freqData, 
				chartOptions),
		));
		valueDeltas.push(250);

		overlays.push(new MyOverlay(
			map, 
			new MapBarChart(
				new google.maps.LatLng(35.544596, -97.529507),
				AGE_POPULATION_DATA, // from data/frequency
				chartOptions),
		));
		valueDeltas.push(500000);
		
		var randomHandle = setInterval(function(){
			function randomizeValue(delta){
				function randomizer(d, i){
					var min = Math.ceil(-delta);
					var max = Math.min(delta);
					return {
						key:d.key,
						value:d.value + Math.floor((Math.random() * (max-min) + min))
					};
				}
				return randomizer;
			}
			function sortDescendingValues(a, b){ return b.value - a.value; }

			overlays.forEach(function(overlay, i){
				var delta = valueDeltas[i];
				var values = overlay.chart.data().map(randomizeValue(delta));
				overlay.chart.data(values).draw();
			});
		}, 1000);


		var currentOverlay = 0;
		var swapInterval = setInterval(function(){
			overlays[currentOverlay++].focus();
			if(currentOverlay>2){ currentOverlay=0; }
		}, 5000);


		var panEasingAnim = EasingAnimator.makeFromCallback(function(latLng){
			map.setCenter(latLng);
		}, {duration:1000});

		d3.select("body").on("keyup", function(){
			switch(d3.event.key){
				case "1": // fallthrough
				case "2": // fallthrough
				case "3": overlays[(+d3.event.key)-1].focus(); break;
				case "ArrowRight": break;
				case "ArrowLeft": break;
				case "m": clearInterval(swapInterval); break;
				case "t": // currently smoothly pans and zooms 
					var next = currentOverlay+1;
					next = (next>2) ? 0 : next;
					var theOverlay = overlays[next];

					function smoothPan(){
						var point = map.getCenter();
						panEasingAnim.easeProp({
							lat: point.lat(),
							lng: point.lng(),
						}, {
							lat: theOverlay.chart.latLng().lat(),
							lng: theOverlay.chart.latLng().lng(),
						}, function(){
							// currently depending on gmaps 3.31 beta renderer 
							// for smooth zoom animations
							map.setZoom(16);								
						});
					}

					function smoothZoomOut(){
						// currently depending on gmaps 3.31 beta renderer 
						// for smooth zoom animations
						map.setZoom(12);
						var handle = setInterval(function(){
							if(map.getZoom()===12){
								clearInterval(handle);
								smoothPan();
							}
						}, 250); // interval same as chart svg transform transition duration
					}

					smoothZoomOut();
					currentOverlay = next;
					break;
			}
		});

	}
	window.onload = initialize;
};
