var layer_url = document.currentScript.getAttribute('layer_url');


function linear_plot() {
    var m = $('#m').val(),
	b = $('#b').val();
    
    // update plot
    document.getElementById("plot").src="/linear/plot/?m=" + m
	+ "&b=" + b,
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_linear(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: linear(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
    resize_bar();
}


function linear(x) {
    var m = $('#m').val(),
	b = $('#b').val();
    return (m * x) + b;
}

// function inverted_linear(y) {
//     var L = $('#L').val(),
// 	k = $('#k').val(),
// 	center = parseFloat($('#center').val());
//     return (Math.log((L/y)-1.0) / (0.0 - k)) + center
// }

// function to_percent(x) {
//     return ((x - range['min']) / (range['max'] - range['min'])) * 100.0
// }

function linear_args_from_range() {

    var m = 1 / (range['max'] - range['min']);
    var b = 1 + (range['max'] / (range['max'] - range['min']));
    $('#b').val(b);
    $('#m').val(m);
}

function resize_bar(){
    console.log('juatever');
}

function update_to(url) {
    set_layer(url);
    range = get_range();
    linear_args_from_range();
    linear_plot();
}

update_to(layer_url);
