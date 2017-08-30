var webber_cuts = [0,33,66,98,131,164];
var paleta = ['rgba(74,190,181,0.8)', 'rgba(24,138,156,0.8)', 'rgba(0,69,132,0.8)', 'rgba(0,30,123,0.8)', 'rgba(16,0,90,0.8)'];
var borde = 'rgba(255,255,255,0)';
var styleCache_encharcamientos_ageb0={};

var style_encharcamientos_ageb0 = function(feature, resolution) {
    var ranges_encharcamientos_ageb0 = [[webber_cuts[0], webber_cuts[1], [ new ol.style.Style({
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
    var key = "Total_ench";                                                                   
    var style = ranges_encharcamientos_ageb0[0][2];
    
    if (!styleCache_encharcamientos_ageb0[key]){
	var text = new ol.style.Text({
	    font: '14.3px \'Ubuntu\', sans-serif',
	    
	    textBaseline: "center",
	    textAlign: "left",
	    offsetX: 5,
	    offsetY: 3,
	    fill: new ol.style.Fill({
		color: 'rgba(0, 0, 0, 255)'
	    }),
	});
	styleCache_encharcamientos_ageb0[key] = new ol.style.Style({"text": text})
    }
    var allStyles = [styleCache_encharcamientos_ageb0[key]];
    allStyles.push.apply(allStyles, style);
    return allStyles;
};

var format_encharcamientos_ageb0 = new ol.format.GeoJSON();
var features_encharcamientos_ageb0 = format_encharcamientos_ageb0.readFeatures(geojson_encharcamientos_ageb0,
									       {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_encharcamientos_ageb0 = new ol.source.Vector({
    attributions: [new ol.Attribution({html: '<a href=""></a>'})],
});

jsonSource_encharcamientos_ageb0.addFeatures(features_encharcamientos_ageb0);

var lyr_encharcamientos_ageb0 = new ol.layer.Vector({
    source:jsonSource_encharcamientos_ageb0,
    style: style_encharcamientos_ageb0,
    title: "enfermedadgastro",
    opacity: 0.85
});

console.log('huevos');
console.log(lyr_encharcamientos_ageb0);

function setIntervals(cuts){
    webber_cuts = cuts;
    lyr_encharcamientos_ageb0.setStyle(style_encharcamientos_ageb0);
    // lyr_encharcamientos_ageb0.redraw();
}

var stamenLayer = new ol.layer.Tile({
    source: new ol.source.Stamen({
	layer: 'terrain'
    })
});

map = new ol.Map({
    projection:"EPSG:4326",
    layers: [stamenLayer],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat([-99.15,19.36]),
	zoom: 11
    })
});



map.addLayer(lyr_encharcamientos_ageb0);
