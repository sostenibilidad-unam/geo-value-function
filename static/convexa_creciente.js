var layer_url = document.currentScript.getAttribute('layer_url');

function convexa_creciente_plot() {
    var gama = $('#gama').val();
    
    // update plot
    document.getElementById("plot").src="/convexa_creciente/plot/?gama=" + gama
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
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
    var gama = $('#gama').val();
    var xmax = range['max'];
    var xmin = range['min'];
    return (1-(Math.exp((0.0 - x)*gama)) - (1-(Math.exp((0.0 - xmin)*gama)))) / (1-(Math.exp((0.0 - xmax)*gama)) - (1-(Math.exp((0.0 - xmin)*gama))))

    
}

function convexa_creciente_args_from_range() {
    var gama = 4.0 / range['max'];
    gama_max = gama * 6.0;
    gama_min = gama / 10.0;    
        
    //var gama = 1.38/center; //qui hay que hacer el algebra
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
    apply_convexa_creciente();
    convexa_creciente_plot();
    update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range();
    convexa_creciente_args_from_range();
    apply_convexa_creciente();
    convexa_creciente_plot();
}

function latex_equation() {

    var gama = $('#gama').val();
    
    return `$$ fv(x)=e^{-\\left(\\frac{x-${gama}}{${gama}}\\right)^{2}} $$`;
}


function update_equation() {
    $('#MathExample').text(latex_equation());
    var math = document.getElementById("MathExample");
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
}

update_to(layer_url);
update_equation();

