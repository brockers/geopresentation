function initMap() {
	var pSlides = [
		['images/slide1.jpg', 35.1966130, -97.4822960 ],
		['images/slide2.jpg', 35.2349110, -97.3957860 ],
		['images/slide3.jpg', 35.2346300, -97.5255620 ],
		['images/slide4.jpg', 35.2297253, -97.3233108 ],
		['images/slide5.jpg', 35.2563629, -97.4599533 ],
		['images/slide6.jpg', 35.1992917, -97.4010734 ],
		['images/slide7.jpg', 35.2018867, -97.4314575 ],
		['images/slide8.jpg', 35.2104426, -97.4653606 ]
	];

	var swLatLng = {lat:pSlides[0][1], lng:pSlides[0][2]};
	var neLatLng = {lat:pSlides[0][1], lng:pSlides[0][2]};

	for(var i=1; i<pSlides.length; ++i){
		var el = pSlides[i];
		if(el[1] < swLatLng.lat){ swLatLng.lat = el[1]; }
		if(el[2] < swLatLng.lng){ swLatLng.lng = el[2]; }
		if(el[1] > neLatLng.lat){ neLatLng.lat = el[1]; }
		if(el[2] > neLatLng.lng){ neLatLng.lng = el[2]; }
	}

	var activeSlide = {
		index: 0,
		el: null,
	};
	var latofset = 0.006;
	var lngofset = 0.012;
	var bgofset = 0.0005;
	var map;
	var myzoom = 16;
	var nextslide = [];

	function initialize() {
		// Setup all our google maps components
		var newark = new google.maps.LatLng(35.196613, -97.482296);
		var geocoder = new google.maps.Geocoder();
		var myOptions = {
			zoom: myzoom,
			center: newark,
			mapTypeId: google.maps.MapTypeId.SATELLITE,
			disableDoubleClickZoom: true
		}

		map = new google.maps.Map(document.getElementById("map"), myOptions);

		var row;
		for (row = 0; row < pSlides.length; ++row) {

			var nlat = pSlides[row][1];
			var nlng = pSlides[row][2];
			var nrow = row + 1;

			if(nrow == pSlides.length) { nrow = 0; }

			var imageBounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(parseFloat(nlat - latofset), parseFloat(nlng - lngofset)),
				new google.maps.LatLng(parseFloat(nlat + latofset), parseFloat(nlng + lngofset)) );

			var bgBounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(parseFloat(nlat - latofset - bgofset), parseFloat(nlng - lngofset - bgofset)),
				new google.maps.LatLng(parseFloat(nlat + latofset + bgofset), parseFloat(nlng + lngofset + bgofset)) );

			var bgOverlay = new ProjectedOverlay(bgBounds, "images/background.png", map); // adds bg image behind slides
			var slideOverlay = new google.maps.GroundOverlay( pSlides[row][0], imageBounds );
			slideOverlay.setMap(map);
			//var slideOverlay = new ProjectedOverlay(imageBounds, pSlides[row][0], map, {isClickable:true});
			linkSlide(slideOverlay, nrow);


		}

		function linkSlide(curSlide, nextIndex) {

			var nxtlat =  pSlides[nextIndex][1];
			var nxtlng =  pSlides[nextIndex][2];

			var nextSlide = new google.maps.LatLng( parseFloat(nxtlat), parseFloat(nxtlng) );
			//curSlide.setNextSlide(nextSlide);

			google.maps.event.addListener(curSlide, "click", function(){
				map.setCenter(nextSlide);
				map.setZoom(16);
			});
		}

	}
	
	window.onload = initialize;
}
