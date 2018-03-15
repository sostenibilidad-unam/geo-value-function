var layer_url = document.currentScript.getAttribute('layer_url');
var show_map =  document.currentScript.getAttribute('show_map');
function_name = "lineal_decreciente";

function lineal_decreciente_plot() {
    var m = $('#m').val(),
	b = $('#b').val();
    params = n + "," + m + "," + b + "," + range['min'] + "," + range['max']
    // update plot
    document.getElementById("plot").src="/lineal_decreciente/plot/?params=" + params ;
}


function apply_lineal_decreciente(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: lineal_decreciente(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
    
}


function lineal_decreciente(x) {
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

function lineal_decreciente_args_from_range() {

    var m = -(1 / (range['max'] - range['min']));
    var b = - ( m * range['max']);

    $('#m').val(m);
    $('#b').val(b);
}


function sync_plot() {
    apply_lineal_decreciente();
    lineal_decreciente_plot();
    //update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range("value");
    lineal_decreciente_args_from_range();
    apply_lineal_decreciente();
    lineal_decreciente_plot();
}


function latex_equation() {
    var m = $('#m').val(),
	b = $('#b').val();
    
	return `y = mx + b`;
    
 
}

function update_equation() {
    var m = $('#m').val(),
	b = $('#b').val();
    katex.render("f(x) = mx + b", equation_1);
    katex.render(`m=${m}`, equation_2);
    katex.render(`b=${b}`, equation_3);
}


update_to(layer_url);
//update_equation();
