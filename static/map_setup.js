var webber_cuts = [0.0,0.2,0.4,0.6,0.8,1.0];
var paleta = ['rgba(74,190,181,0.8)', 'rgba(24,138,156,0.8)', 'rgba(0,69,132,0.8)', 'rgba(0,30,123,0.8)', 'rgba(16,0,90,0.8)'];
var borde = 'rgba(255,255,255,0)';
var styleCache_data_layer={};
var styleCache_mi_paleta={};
var n = 5;
var function_name = "linear";
function set_continous(){
    n = 100;
    style_data_layer = style_100;
    layer.setStyle(style_data_layer);
    document.getElementById("legend_categorias").style.display = "none";
    document.getElementById("legend_continua").style.display = "block";
    sync_plot();
}
function set_categories(){
    n = 5;
    style_data_layer = style_5;
    layer.setStyle(style_data_layer);
    document.getElementById("legend_continua").style.display = "none";
    document.getElementById("legend_categorias").style.display = "block";
    sync_plot();
}
function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";   
};

	
var colorscale = d3.scale.linear()
.domain([0,1])
.range(["#4ABEB5","#10005A"])
.interpolate(d3.interpolateLab);

var style_100 = function(feature, resolution){
	    var context = {
			feature: feature,
			variables: {}
	    };
	    var value = feature.get("fv");
	    
	    var size = 0;
	    var style_continuo = [ new ol.style.Style({
		    	stroke: new ol.style.Stroke({
			    		color: borde, 
						lineDash: null,
						lineCap: 'butt',
						lineJoin: 'miter',
						width: 0}),
				fill: new ol.style.Fill({color: hexToRGB(colorscale(value),0.85)})
	    //colorscale(normalize(value))
		})];
	    if ("" !== null) {
		var labelText = String("");
	    } else {
		var labelText = ""
	    }
	    var key = value + "_" + labelText

	    if (!styleCache_mi_paleta[key]){
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
		styleCache_mi_paleta[key] = new ol.style.Style({"text": text})
	    }
	    var allStyles_mi_paleta = [styleCache_mi_paleta[key]];
	    allStyles_mi_paleta.push.apply(allStyles_mi_paleta, style_continuo);
	    return allStyles_mi_paleta;
};
var style_5 = function(feature, resolution) {
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
var style_data_layer = style_5;
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
var range = {'min': 100000000,
	     'max': -100000000}


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
function normalize_min_max(y, miny, maxy){
    return (y - miny)/(maxy - miny);

}

function get_range(field) {
    var max = -100000000, min = 100000000;    
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	max = Math.max(max, feature.get(field));
	min = Math.min(min, feature.get(field));	
    });
    return {'max': max,
	    'min': min}
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
		
		stats_div.innerHTML = "value: " + feature.get("value") + "  normalized value: " + feature.get("fv").toFixed(4) ;
	}else{
         vectorSource.clear();
	    var a = $('#a').val(),
            center = $('#center').val();

                // update plot
         document.getElementById("plot").src="/" + function_name + "/plot/?params="+ params;
         stats_div.innerHTML = "";
	    
	}

	if (feature !== highlight) {
		vectorSource.clear();
		//if (highlight) {
			//featureOverlay.getSource().removeFeature(highlight);
		//	vectorSource.removeFeature(highlight);
		//}
	    	if (feature) {
			vectorSource.addFeature(feature);
			
			//esto tiene que ser general osea no para la gausian sino para la funcion que se este usando///////////////////////////////
        		var a = $('#a').val(),
                center = $('#center').val();

                // update plot
            document.getElementById("plot").src="/" + function_name + "/plot/?params="+ params +"&value=" + feature.get("value");
        		///////////////////////////////////////////////////////////////////////////////////////////////////////
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
    var a = $('#a').val(),
            center = $('#center').val();

                // update plot
         document.getElementById("plot").src="/" + function_name + "/plot/?params="+ params;
    stats_div.innerHTML = "";
}, false);
