var layer_url = document.currentScript.getAttribute('layer_url');
var show_map =  document.currentScript.getAttribute('show_map');
function_name = "concava_decreciente";
function concava_decreciente_plot() {
    var gama = 0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    params = n + "," + gama + "," + range['min'] + "," + range['max']
    
    // update plot
    document.getElementById("plot").src="/concava_decreciente/plot/?params=" + params ;
}


function apply_concava_decreciente(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: concava_decreciente(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function concava_decreciente(x) {
    var gama = 0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    var xmax = range['max'];
    var xmin = range['min'];
    return ( ( Math.exp(gama * (100.0 - (100.0*(x - xmin)/(xmax - xmin) ) ) ) ) - 1 )  / ( Math.exp(gama * 100) -1 )

    //return ((Math.exp((0.0 - gama) * x)) - Math.exp((0.0 - gama) * xmax)) / (Math.exp((0.0 - gama) * xmin) - Math.exp((0.0 - gama) * xmax))

}

function concava_decreciente_args_from_range() {
    if ($('#gama').val() == 'nan') {
        var center = range['min'] + ((range['max'] - range['min']) / 2);
        saturacion = 1;
        //var gama = 0;
        //if (range['min'] > 0){
        //    	gama = (1.38 / center) * (1 + (Math.log(range['min']) / 2));
        //}else{
        //    	gama = (1.38 / center);
        //}
    } else {
        	 saturacion = parseInt($('#gama').val());
    }


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
    apply_concava_decreciente();
    concava_decreciente_plot();
    
    gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );
    window.history.replaceState({}, "", `?gama=${gama}&show_map=${show_map}`);
    //update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range("value");
    concava_decreciente_args_from_range();
    apply_concava_decreciente();
    concava_decreciente_plot();
}

function latex_equation() {

    var gama  =  0.005 + (parseFloat($('#gama').val()) * (0.3 - 0.005) / 20.0 );

    var restale = Math.exp((0.0 - gama) * range['max']);
    var denominador = Math.exp((0.0 - gama) * range['min']) - Math.exp((0.0 - gama) * range['max'])

    return `fv(x)=\\frac{e^{-(${gama}*x})-${restale}}{${denominador}}`;
}


function update_equation() {
    katex.render(latex_equation(), equation_1);
}

update_to(layer_url);
//update_equation();
