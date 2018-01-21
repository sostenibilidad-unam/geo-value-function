var layer_url = document.currentScript.getAttribute('layer_url');


function linear_plot() {
    var m = $('#m').val(),
	b = $('#b').val();

    // update plot
    document.getElementById("plot").src="/linear/plot/?n="+ n + "&m=" + m
	+ "&b=" + b
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

    y = parseFloat(m * x)+parseFloat(b);

    return y;
}

// function inverted_linear(y) {
//     var L = $('#L').val(),
//	k = $('#k').val(),
//	center = parseFloat($('#center').val());
//     return (Math.log((L/y)-1.0) / (0.0 - k)) + center
// }

// function to_percent(x) {
//     return ((x - range['min']) / (range['max'] - range['min'])) * 100.0
// }

function linear_args_from_range() {

    var m = 1 / (range['max'] - range['min']);
    var b = 0 - ( (range['min']) / (range['max'] - range['min']) );

    $('#m').val(m.toFixed(4));
    $('#b').val(b.toFixed(4));
}

function resize_bar(){
    console.log('juatever');
}

function sync_plot() {
    apply_linear();
    linear_plot();
    update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range("value");
    linear_args_from_range();
    apply_linear();
    linear_plot();
}


function latex_equation() {
    var m = $('#m').val(),
	b = $('#b').val();
    if (b < 0){
	babs = Math.abs(b);
	return `y=${m}x-${babs}`;
    } else {
	return `y=${m}x+${b}`;
    }

}

function update_equation() {
    katex.render(latex_equation(), equation);
}


update_to(layer_url);
update_equation();
