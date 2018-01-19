var layer_url = document.currentScript.getAttribute('layer_url');

function concava_decreciente_plot() {
    var gama = $('#gama').val();

    // update plot
    document.getElementById("plot").src="/concava_decreciente/plot/?gama=" + gama
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
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
    var gama = $('#gama').val();
    var xmax = range['max'];
    var xmin = range['min'];
    return ((Math.exp((0.0 - gama) * x)) - Math.exp((0.0 - gama) * xmax)) / (Math.exp((0.0 - gama) * xmin) - Math.exp((0.0 - gama) * xmax))

}

function concava_decreciente_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    var gama = 0;
    if (range['min'] > 0){
	gama = (1.38 / center) * (1 + (Math.log(range['min']) / 2))
    }else{
	gama = (1.38 / center)
    }

    gama_max = gama * 5.0;
    gama_min = gama / 10.0;


    //aqui hay que hacer el algebra
    $('#gama').val(gama);
    $( "#gama_slider" ).slider({max: gama_max,
			     min: gama_min,
			     value: gama,
			     step: (gama_max - gama_min) / 100.0,
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
    update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range();
    concava_decreciente_args_from_range();
    apply_concava_decreciente();
    concava_decreciente_plot();
}

function latex_equation() {

    var gama = $('#gama').val();

    var restale = Math.exp((0.0 - gama) * range['max']);
    var denominador = Math.exp((0.0 - gama) * range['min']) - Math.exp((0.0 - gama) * range['max'])

    return `fv(x)=\\frac{e^{-(${gama}*x})-${restale}}{${denominador}}`;
}


function update_equation() {
    katex.render(latex_equation(), equation);
}

update_to(layer_url);
update_equation();
