var layer_url = document.currentScript.getAttribute('layer_url');
var layer_field = document.currentScript.getAttribute('layer_field');
var show_map =  document.currentScript.getAttribute('show_map');
function_name = "logistica_invertida";

function logistica_invertida_plot() {
    var k = 0.01 + (parseFloat($('#k').val()) * (0.5 - 0.01) / 20.0 ),
	center = $('#center').val();
    params = n + "," + k + "," + center + "," + range['min'] + "," + range['max']
    // update plot
    document.getElementById("plot").src="/logistica_invertida/plot/?params=" + params ;
}


function apply_logistica_invertida(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: logistica_invertida(feature.get(layer_field))
	});
    });
    var range_y = get_range("fv");
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: normalize_min_max(feature.get("fv"), range_y['min'], range_y['max'])
	});
    });
    layer.setStyle(style_data_layer);
}
function normalize100(x){
    xmax = range['max'];
    xmin = range['min'];
    return (100.0 * ( x - xmin )/( xmax - xmin ) )

}

function logistica_invertida(x) {
    var k = 0.01 + (parseFloat($('#k').val()) * (0.5 - 0.01) / 20.0 ),
	center = $('#center').val();
	xmax = range['max'];
    xmin = range['min'];
    return 1.0 - ( 1 / (1.0 + Math.exp(-k * (   normalize100(x)  - normalize100(center) )) ) )

    //return 1.0 - (1.0 / (1.0 + Math.exp(-k * (x - center))))
}
function inverted_logistic(y) {
    var k = 0.01 + (parseFloat($('#k').val()) * (0.5 - 0.01) / 20.0 ),
	center = parseFloat($('#center').val());
    return (Math.log((1.0/y)-1.0) / (0.0 - k)) + center
}
function to_percent(x) {
    return ((x - range['min']) / (range['max'] - range['min'])) * 100.0
}

function logistica_invertida_args_from_range() {
    // if no arguments suplied on URL, calculate values from layer
    if ($('#k').val() == 'nan' | $('#center').val() == 'nan') {
	var center = range['min'] + ((range['max'] - range['min']) / 2),
	    //k = 2 * (-4 * Math.log(1/3)) / (range['max'] - range['min']);
	    saturacion = 3;

    } else {
	center = parseFloat($('#center').val());
	saturacion = parseInt($('#k').val());
    }
    $('#k').val(saturacion);
	$('#center').val(center.toFixed(4));
    center_max = range['max'];
    center_min = range['min'];

    k_max = k * 5.0;
    k_min = k / 10.0;

    $( "#k_slider" ).slider({max: 20,
			     min: 0,
			     value: saturacion,
			     step: 1,
			     change: function( event, ui ) {
				 sync_k();
				 sync_plot();
			     }
			    });

    $( "#center_slider" ).slider({max: center_max,
				  min: center_min,
				  value: center,
				  step: (center_max - center_min) / 100.0,
				  change: function( event, ui ) {
				      sync_center();
				      sync_plot();
				  }
				 });
}

function sync_center() {
    $('#center').val($("#center_slider").slider("option", "value"));
}

function sync_center_slider() {
    $("#center_slider").slider("option", "value",
			       $('#center').val());
}

function sync_k() {
    $('#k').val($("#k_slider").slider("option", "value"));
}

function sync_k_slider() {
    $("#k_slider").slider("option", "value",
			  $('#k').val());
}

function sync_plot() {
    apply_logistica_invertida();
    logistica_invertida_plot();

    center = parseFloat($('#center').val());
    k = 0.01 + (parseFloat($('#k').val()) * (0.5 - 0.01) / 20.0 );
    window.history.replaceState({}, "", `?center=${center}&k=${k}&show_map=${show_map}&max=${range['max']}&min=${range['min']}`);

    //update_equation();
}


function update_to(url, field) {
    set_layer(url);
    range = get_value_range(field);
    logistica_invertida_args_from_range();
    apply_logistica_invertida();
    logistica_invertida_plot();
}

function latex_equation() {

    var k = 0.01 + (parseFloat($('#k').val()) * (0.5 - 0.01) / 20.0 ),
	center = $('#center').val();

    return `fv(x) = 1 - \\frac{1}{1+e^{-${k}(x-${center})}}`
}

function update_equation() {
    katex.render(latex_equation(), equation_1);
}



update_to(layer_url, layer_field);
//update_equation();
