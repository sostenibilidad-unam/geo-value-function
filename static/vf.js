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


function logistic_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    k = 2 * (-4 * Math.log(1/3)) / (range['max'] - range['min'])
    $('#k').val(k);
    $('#center').val(center);
}



function update_to(url) {
    set_layer(url);
    range = get_range();
    logistic_args_from_range();
    update_plot();
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

function logistica(x){
    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    return L / (1.0 + Math.exp(-k * (x - center)))
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

var map = new ol.Map({
    projection:"EPSG:4326",
    layers: [stamenLayer],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat([-99.15,19.36]),
	zoom: 11
    })
});


function apply_vf(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: logistica(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function update_plot() {
    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    
    // update plot
    document.getElementById("plot").src="/plot_logistica/?L=" + L
	+ "&k=" + k
	+ "&center=" + center
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


update_to($("#select_layer").val());
