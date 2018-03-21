var layer_url = document.currentScript.getAttribute('layer_url');
var show_map =  document.currentScript.getAttribute('show_map');
function_name = "convexa_decreciente";
function convexa_decreciente_plot() {
    var gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    params = n + "," + gama + "," + range['min'] + "," + range['max']
    
    // update plot
    document.getElementById("plot").src="/convexa_decreciente/plot/?params=" + params ;
}


function apply_convexa_decreciente(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: convexa_decreciente(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function convexa_decreciente(x) {
    var gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    var xmax = range['max'];
    var xmin = range['min'];
    //return (1-(Math.exp((x-30)/gama)) - (1-(Math.exp((xmax-30)/gama)))) / (1-(Math.exp((xmin-30)/gama)) - (1-(Math.exp((xmax-30)/gama))))
    return 1.0 - ((Math.exp(gama * (100*(x - xmin)/(xmax - xmin) ) ) ) - 1) / ( Math.exp(gama * 100) -1 )
    

}

function convexa_decreciente_args_from_range() {
    if ($('#gama').val() == 'nan') {
        //gama = 2 * Math.pow(range['max'],1/1.5);
        var saturacion = 1;
    } else {
        saturacion = parseInt($('#gama').val());
    }


    gama_max = gama * 3.0;
    gama_min = gama / 10.0;
    //aqui hay que hacer el algebra
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
    apply_convexa_decreciente();
    convexa_decreciente_plot();
    
    gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    window.history.replaceState({}, "", `?gama=${gama}&show_map=${show_map}&max=${range['max']}&min=${range['min']}`);
    //update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_value_range();
    convexa_decreciente_args_from_range();
    apply_convexa_decreciente();
    convexa_decreciente_plot();
}

function latex_equation() {

    var gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );

    var restale = 1-(Math.exp((range['max']-30)/gama));
    var denominador = (1-(Math.exp((range['min']-30)/gama)) - (1-(Math.exp((range['max']-30)/gama))));

    return `fv(x)=\\frac{1 - e^{\\left(\\frac{x-30}{${gama}}\\right)}-${restale}}{${denominador}}`;
}

function update_equation() {
    katex.render(latex_equation(), equation_1);
}


update_to(layer_url);
//update_equation();
