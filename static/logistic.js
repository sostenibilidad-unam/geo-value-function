var layer_url = document.currentScript.getAttribute('layer_url');
var show_map =  document.currentScript.getAttribute('show_map');

function_name = "logistic";
var range_y = [];
function logistic_plot() {
    var k = $('#k').val(),
	center = $('#center').val();
    params = n + "," + k + "," + center + "," + range['min'] + "," + range['max']
    // update plot
    document.getElementById("plot").src="/logistic/plot/?params=" + params ;

}


function apply_logistic(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: logistic(feature.get("value"))
	});
    });
    range_y = get_range("fv");
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: normalize_min_max(feature.get("fv"), range_y['min'], range_y['max'])
	});
    });
    layer.setStyle(style_data_layer);
}


function logistic(x) {
    var k = $('#k').val(),
	center = $('#center').val();
    return 1.0 / (1.0 + Math.exp(-k * (x - center)))
}

function logistic_args_from_range() {
    // if no arguments suplied on URL, calculate values from layer
    if ($('#k').val() == 'nan' | $('#center').val() == 'nan') {
	var center = range['min'] + ((range['max'] - range['min']) / 2.0),
	    k = 2 * (-4 * Math.log(1/3)) / (range['max'] - range['min']);
	$('#k').val(k);
	$('#center').val(center);
    } else {
	center = parseFloat($('#center').val());
	k = parseFloat($('#k').val());
    }

    center_max = range['max'];
    center_min = range['min'];

    k_max = k * 2.0;
    k_min = k / 10.0;

    $( "#k_slider" ).slider({max: k_max,
			     min: k_min,
			     value: k,
			     step: (k_max - k_min) / 100.0,
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
    apply_logistic();
    logistic_plot();

    center = parseFloat($('#center').val());
    k = parseFloat($('#k').val());
    window.history.replaceState({}, "", `?center=${center}&k=${k}&show_map=${show_map}`);
    //update_equation();
}


function update_to(url) {
    set_layer(url);
    range = get_range("value");
    logistic_args_from_range();
    apply_logistic();
    logistic_plot();
}

function latex_equation() {

    var k = $('#k').val(),
	center = $('#center').val();

    return `fv(x) = \\frac{1}{1+e^{-${k}(x-${center})}}`
}


function update_equation() {
    var k = $('#k').val(),
	center = $('#center').val();
    ymax = range_y['max']
    ymin = range_y['min']
    katex.render("fv(x) = \\frac{\\frac{1}{1+e^{-k(x-center)}}-ymin}{ymax-ymin}", equation_1);
    katex.render(`k=${k}`, equation_2);
    katex.render(`center=${center}`, equation_3);
    katex.render(`ymin=${ymin}`, equation_4);
    katex.render(`ymax=${ymax}`, equation_5);


}


update_to(layer_url);
//update_equation();
