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

