function logistic_plot() {
    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    
    // update plot
    document.getElementById("plot").src="/logistic/plot/?L=" + L
	+ "&k=" + k
	+ "&center=" + center
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_logistic(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: logistic(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function logistic(x) {
    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    return L / (1.0 + Math.exp(-k * (x - center)))
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
    logistic_plot();
}

update_to($("#select_layer").val());
