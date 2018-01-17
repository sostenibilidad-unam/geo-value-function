var webber_cuts = [0.0,0.2,0.4,0.6,0.8,1.0];
var paleta = ['rgba(74,190,181,0.8)', 'rgba(24,138,156,0.8)', 'rgba(0,69,132,0.8)', 'rgba(0,30,123,0.8)', 'rgba(16,0,90,0.8)'];
var borde = 'rgba(255,255,255,0)';
var styleCache_data_layer={};

var style_data_layer = function(feature, resolution) {
    var ranges_data_layer = [[webber_cuts[0], webber_cuts[1], [ new ol.style.Style({
	stroke: new ol.style.Stroke({color: borde, lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),
	fill: new ol.style.Fill({color: paleta[0]})})]],
			[webber_cuts[1], webber_cuts[2], [ new ol.style.Style({
			    stroke: new ol.style.Stroke({color: borde,
							 lineDash: null,
							 lineCap: 'butt',
							 lineJoin: 'miter',
							 width: 0}),
			    fill: new ol.style.Fill({color: paleta[1]})})]],
			[webber_cuts[2], webber_cuts[3], [ new ol.style.Style({
			    stroke: new ol.style.Stroke({color: borde,
							 lineDash: null,
							 lineCap: 'butt',
							 lineJoin: 'miter',
							 width: 0}),
			    fill: new ol.style.Fill({color: paleta[2]})})]],
			[webber_cuts[3], webber_cuts[4], [ new ol.style.Style({
			    stroke: new ol.style.Stroke({color: borde,
							 lineDash: null,
							 lineCap: 'butt',
							 lineJoin: 'miter',
							 width: 0}),
			    fill: new ol.style.Fill({color: paleta[3]})})]],
			[webber_cuts[4], webber_cuts[5], [ new ol.style.Style({
			    stroke: new ol.style.Stroke({color: borde,
							 lineDash: null,
							 lineCap: 'butt',
							 lineJoin: 'miter',
							 width: 0}),
			    fill: new ol.style.Fill({color: paleta[4]})
			})]]];
    var context = {
	feature: feature,
	variables: {}
    };
    var value = feature.get("fv");
    var style = ranges_data_layer[0][2];
    for (i = 0; i < ranges_data_layer.length; i++){
	var range = ranges_data_layer[i];
	if (value > range[0] && value<=range[1]){

	    style =  range[2];

	}
    };

    var labelText = "";
    var key = "";
    size = 0;
    var textAlign = "left";
    var offsetX = 8;
    var offsetY = 3;
    if ("" !== null) {
	labelText = String("");
    } else {
	labelText = ""
    }

    if (!styleCache_data_layer[key]){
	var text = new ol.style.Text({
	    font: '14.3px \'Ubuntu\', sans-serif',
	    text: labelText,
	    textBaseline: "center",
	    textAlign: "left",
	    offsetX: 5,
	    offsetY: 3,
	    fill: new ol.style.Fill({
		color: 'rgba(0, 0, 0, 255)'
	    }),
	});
	styleCache_data_layer[key] = new ol.style.Style({"text": text})
    }
    var allStyles = [styleCache_data_layer[key]];
    allStyles.push.apply(allStyles, style);
    return allStyles;
};



function get_features(url) {
    var data_layer = {};

    $.ajax({
	url: url,
	async: false,
	dataType: 'json',
	success: function(data) {
	    data_layer = data;
	}
    });
    var format_data_layer = new ol.format.GeoJSON();
    var features = format_data_layer.readFeatures(data_layer,
						  {dataProjection: 'EPSG:4326',
						   featureProjection: 'EPSG:3857'});

    return features;
}


var jsonSource_data_layer = new ol.source.Vector();
var layer = new ol.layer.Vector();
var range = {'min': 10000000,
	     'max': 0}


function set_layer(url) {
    map.removeLayer(layer);
    jsonSource_data_layer = new ol.source.Vector();
    jsonSource_data_layer.addFeatures(get_features(url));

    layer = new ol.layer.Vector({
	source: jsonSource_data_layer,
	style: style_data_layer,
	opacity: 0.85
    });
    map.addLayer(layer);
}


function get_range() {
    var max = 0, min = 1000000000;    
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	max = Math.max(max, feature.get("value"));
	min = Math.min(min, feature.get("value"));	
    });
    return {'max': max,
	    'min': min}
}


function setIntervals(cuts){
    webber_cuts = cuts;
    layer.setStyle(style_data_layer);
    layer.redraw();

}

var stamenLayer = new ol.layer.Tile({
    source: new ol.source.Stamen({
	layer: 'terrain'
    })
});
var polygon_style2 = new ol.style.Style({
	  fill: new ol.style.Fill({color: 'rgba(250,163,1,1)'}),
	  stroke: new ol.style.Stroke({color: 'rgba(250,163,1,1)',width: 1}),
	  text: new ol.style.Text({
		  	font: '12px Calibri,sans-serif',
		  	fill: new ol.style.Fill({color: 'rgba(250,163,1,1)'}),
	        stroke: new ol.style.Stroke({
	        		color: 'rgba(100,100,100,1)',
	        		width: 3
	        })
	  })
});
var vectorSource = new ol.source.Vector({projection: 'EPSG:4326'});
var miVector = new ol.layer.Vector({
    	source: vectorSource
}); 
miVector.setStyle(polygon_style2);
var map = new ol.Map({
    projection:"EPSG:4326",
    layers: [stamenLayer, miVector],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat([-99.10,19.44]),
	zoom: 11
    })
});
var highlightStyleCache = {};
var highlight;
var stats_div = document.getElementById('statistics');
var displayFeatureInfo = function (pixel) {

	var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
		    return feature;
	});

	if (feature) {
		
		stats_div.innerHTML = "value: " + feature.get("value") + "</br> normalized value: " + feature.get("fv") ;
	}else{
		vectorSource.clear();
	    
	    
	}

	if (feature !== highlight) {
		vectorSource.clear();
		//if (highlight) {
			//featureOverlay.getSource().removeFeature(highlight);
		//	vectorSource.removeFeature(highlight);
		//}
	    	if (feature) {
			vectorSource.addFeature(feature);
		}
		highlight = feature;
	}

};
map.on('pointermove', function(evt) {
    if (evt.dragging) {
      return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
  });
map.getViewport().addEventListener('mouseout', function(evt){
	vectorSource.clear();
    
    stats_div.innerHTML = "";
}, false);
