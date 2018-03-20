var layer_url = document.currentScript.getAttribute('layer_url');
var show_map =  document.currentScript.getAttribute('show_map');
function_name = "gaussian";
function gaussian_plot() {
    var a = 0 + (parseFloat($('#a').val()) * (100 - 5) / 19.0 ),
	center = $('#center').val();
    params = n + "," + a + "," + center + "," + range['min'] + "," + range['max']
    // update plot
    document.getElementById("plot").src="/gaussian/plot/?params="+ params
    //document.getElementById("plot").src="/gaussian/plot/?n="+ n +"&a=" + a
	//+ "&center=" + center
	//+ "&min=" + range['min']
	//+ "&max=" + range['max'];
}


function apply_gaussian(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: gaussian(feature.get("value"))
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
function gaussian(x) {
    var a = 0 + (parseFloat($('#a').val()) * (100 - 5) / 19.0 ),
	center = $('#center').val();
    //return Math.exp(0.0  - (((x - center)/a)*((x - center)/a)))
    
    return Math.exp(0.0 - ((( normalize100(x) - normalize100(center)) / (  a ) ) **2))
}


function gaussian_args_from_range() {
    // if no arguments suplied on URL, calculate values from layerc
    if ($('#a').val() == 'nan' | $('#center').val() == 'nan') {
	var center = range['min'] + ((range['max'] - range['min']) / 2);
	var amplitud = 3;
    } else {
	amplitud = parseInt($('#a').val());
	center = parseFloat($('#center').val());
    }

    $('#a').val(amplitud);
    $('#center').val(center);

    center_max = range['max'];
    center_min = range['min'];

    a_max = a * 2.0;
    a_min = a / 10.0;

    $( "#a_slider" ).slider({max: 20,
			     min: 1,
			     value: amplitud,
			     step: 1,
			     change: function( event, ui ) {
				 sync_a();
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

function sync_a() {
    $('#a').val($("#a_slider").slider("option", "value"));
}

function sync_a_slider() {
    $("#a_slider").slider("option", "value",
			  $('#a').val());
}

function sync_plot() {
    apply_gaussian();
    gaussian_plot();
    center = parseFloat($('#center').val());
    a = 0 + (parseFloat($('#a').val()) * (100 - 5) / 19.0 );
    window.history.replaceState({}, "", `?center=${center}&a=${a}&show_map=${show_map}`)
    //update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range("value");
    gaussian_args_from_range();
    apply_gaussian();
    gaussian_plot();
}

function latex_equation() {

    var a = 0 + (parseFloat($('#a').val()) * (100 - 5) / 19.0 ),
	center = $('#center').val();

    return `fv(x)=e^{-\\left(\\frac{x-${center}}{${a}}\\right)^{2}}`;
}


function update_equation() {
    katex.render(latex_equation(), equation_1);
}

update_to(layer_url);
//update_equation();
