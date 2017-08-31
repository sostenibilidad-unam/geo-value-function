var webber_cuts = [0.0,0.2,0.4,0.6,0.8,1.0];
var paleta = ['rgba(74,190,181,0.8)', 'rgba(24,138,156,0.8)', 'rgba(0,69,132,0.8)', 'rgba(0,30,123,0.8)', 'rgba(16,0,90,0.8)'];
var borde = 'rgba(255,255,255,0)';
var styleCache_ageb0={};

var style_ageb0 = function(feature, resolution) {
    var ranges_ageb0 = [[webber_cuts[0], webber_cuts[1], [ new ol.style.Style({
	                                    stroke: new ol.style.Stroke({color: borde, lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),
	                                    fill: new ol.style.Fill({color: paleta[0]})})]],
					[webber_cuts[1], webber_cuts[2], [ new ol.style.Style({
					    stroke: new ol.style.Stroke({color: borde, lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),
					    fill: new ol.style.Fill({color: paleta[1]})})]],
					[webber_cuts[2], webber_cuts[3], [ new ol.style.Style({
					    stroke: new ol.style.Stroke({color: borde, lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),
					    fill: new ol.style.Fill({color: paleta[2]})})]],
					[webber_cuts[3], webber_cuts[4], [ new ol.style.Style({
					    stroke: new ol.style.Stroke({color: borde, lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),
					    fill: new ol.style.Fill({color: paleta[3]})})]],
					[webber_cuts[4], webber_cuts[5], [ new ol.style.Style({
					    stroke: new ol.style.Stroke({color: borde, lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0}),
					    fill: new ol.style.Fill({color: paleta[4]})
					})]]];
    var context = {
        feature: feature,
        variables: {}
    };
    var value = feature.get("fv");
     var style = ranges_ageb0[0][2];
            for (i = 0; i < ranges_ageb0.length; i++){
                var range = ranges_ageb0[i];
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
    
    if (!styleCache_ageb0[key]){
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
	styleCache_ageb0[key] = new ol.style.Style({"text": text})
    }
    var allStyles = [styleCache_ageb0[key]];
    allStyles.push.apply(allStyles, style);
    return allStyles;
};

var format_ageb0 = new ol.format.GeoJSON();
var features_ageb0 = format_ageb0.readFeatures(json_elev,{dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_ageb0 = new ol.source.Vector({
    attributions: [new ol.Attribution({html: '<a href=""></a>'})],
});

jsonSource_ageb0.addFeatures(features_ageb0);

var lyr_elev = new ol.layer.Vector({
    source:jsonSource_ageb0,
    style: style_ageb0,
    title: "altura",
    opacity: 0.85
});

function logistica(x){
    var L = $('#L').val(),
    k = $('#k').val(),
    center = $('#center').val();
    return L / (1.0 + Math.exp(-k * (x - center)))
    
}

function recalculate(){
    jsonSource_ageb0.getFeatures().forEach(function(feature){
       feature.setProperties({
           fv: logistica(feature.get("ELEV"))
       });
    });
    lyr_elev.setStyle(style_ageb0);
    //lyr_elev.redraw();
    
}

function setIntervals(cuts){
    webber_cuts = cuts;
    lyr_elev.setStyle(style_ageb0);
    lyr_elev.redraw();
   
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



map.addLayer(lyr_elev);
