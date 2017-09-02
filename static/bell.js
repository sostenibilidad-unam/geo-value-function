function bell_plot() {
    var a = $('#a').val(),
	center = $('#center').val();
    
    // update plot
    document.getElementById("plot").src="/bell/plot/?a=" + a
	+ "&center=" + center
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_bell(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: bell(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function bell(x) {
    var a = $('#a').val(),
	center = $('#center').val();
    return Math.exp(0.0  - (((x - center)/a)*((x - center)/a)))
}

function bell_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    a =  (range['max'] - range['min']) / 4.0;
    $('#a').val(a);
    $('#center').val(center);
}


function update_to(url) {
    set_layer(url);
    range = get_range();
    bell_args_from_range();
    bell_plot();
}

update_to($("#select_layer").val());
