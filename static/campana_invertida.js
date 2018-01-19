var layer_url = document.currentScript.getAttribute('layer_url');

function campana_invertida_plot() {
    var a = $('#a').val(),
	center = $('#center').val();

    // update plot
    document.getElementById("plot").src="/campana_invertida/plot/?a=" + a
	+ "&center=" + center
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_campana_invertida(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: campana_invertida(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function campana_invertida(x) {
    var a = $('#a').val(),
	center = $('#center').val();
    return 1 - (Math.exp(0.0  - (((x - center)/a)*((x - center)/a))))
}

function campana_invertida_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    center_max = range['max'];
    center_min = range['min'];
    a =  (range['max'] - range['min']) / 4.0;
    a_max = a * 2.0;
    a_min = a / 10.0;
    $('#a').val(a);
    $('#center').val(center);

    $( "#a_slider" ).slider({max: a_max,
			     min: a_min,
			     value: a,
			     step: (a_max - a_min) / 100.0,
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
    apply_campana_invertida();
    campana_invertida_plot();
    update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range();
    campana_invertida_args_from_range();
    apply_campana_invertida();
    campana_invertida_plot();
}

function latex_equation() {

    var a = $('#a').val(),
	center = $('#center').val();

    return `fv(x)=1-e^{-\\left(\\frac{x-${center}}{${a}}\\right)^{2}}`;
}


function update_equation() {
    katex.render(latex_equation(), equation);
}


update_to(layer_url);
update_equation();
