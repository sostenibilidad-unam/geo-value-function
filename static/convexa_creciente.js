var layer_url = document.currentScript.getAttribute('layer_url');
var show_map =  document.currentScript.getAttribute('show_map');
function_name = "convexa_creciente";
function convexa_creciente_plot() {
    var gama = 0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    params = n + "," + gama + "," + range['min'] + "," + range['max']
    
    // update plot
    document.getElementById("plot").src="/convexa_creciente/plot/?params=" + params ;
}


function apply_convexa_creciente(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: convexa_creciente(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function convexa_creciente(x) {
    var gama =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    //var gama =  parseFloat($('#gama').val())
    var xmax = range['max'];
    var xmin = range['min'];
    //return (1-(Math.exp((0.0 - x)*gama)) - (1-(Math.exp((0.0 - xmin)*gama)))) / (1-(Math.exp((0.0 - xmax)*gama)) - (1-(Math.exp((0.0 - xmin)*gama))))
    return 1.0 - ( ( Math.exp(gama * (100.0 - (100.0*(x - xmin)/(xmax - xmin) ) ) ) ) - 1 )  / ( Math.exp(gama * 100) -1 )


}

function convexa_creciente_args_from_range() {
    if ($('#gama').val() == 'nan') {
        //gama = 4.0 / range['max'];
        saturacion = 1;
    } else {
        saturacion  =  parseInt($('#gama').val());
    }
    
    
    $('#gama').val(saturacion);
    $( "#gama_slider" ).slider({max: 20,
			     min: 0,
			     value: saturacion,
			     step: 1,
			     change: function( event, ui ) {
				 sync_gama();
				 sync_plot();
			     }
			    });
}

function sync_gama() {
    $('#gama').val($("#gama_slider").slider("option", "value"));
}

function sync_gama_slider() {
    $("#gama_slider").slider("option", "value",
			       $('#gama').val());
}

function sync_plot() {
    apply_convexa_creciente();
    convexa_creciente_plot();
    
    gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    window.history.replaceState({}, "", `?gama=${gama}&show_map=${show_map}`);
    //update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range("value");
    convexa_creciente_args_from_range();
    apply_convexa_creciente();
    convexa_creciente_plot();
}

function latex_equation() {

    var gama = 0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );

    return `fv(x)= \\frac{1-e^{-gama x}-ymin}{ymax-ymin}`;
}


function update_equation() {
    katex.render(latex_equation(), equation_1);
}


update_to(layer_url);
//update_equation();
