var layer_url = document.currentScript.getAttribute('layer_url');

function convexa_decreciente_plot() {
    var gama = $('#gama').val();
    
    // update plot
    document.getElementById("plot").src="/convexa_decreciente/plot/?gama=" + gama
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
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
    var gama = $('#gama').val();
    var xmax = range['max'];
    var xmin = range['min'];
    return (1-(Math.exp((x-30)/gama)) - (1-(Math.exp((xmax-30)/gama)))) / (1-(Math.exp((xmin-30)/gama)) - (1-(Math.exp((xmax-30)/gama))))

    
}

function convexa_decreciente_args_from_range() {
    var gama = 2 * Math.pow(range['max'],1/1.5);
   
    gama_max = gama * 3.0;
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
    apply_convexa_decreciente();
    convexa_decreciente_plot();
    update_equation();
}

function update_to(url) {
    set_layer(url);
    range = get_range();
    convexa_decreciente_args_from_range();
    apply_convexa_decreciente();
    convexa_decreciente_plot();
}

function latex_equation() {

    var gama = $('#gama').val();
    
    var restale = 1-(Math.exp((range['max']-30)/gama));
    var denominador = (1-(Math.exp((range['min']-30)/gama)) - (1-(Math.exp((range['max']-30)/gama))));
    
    return `$$ fv(x)=\\frac{1 - e^{\\left(\\frac{x-30}{${gama}}\\right)}-${restale}}{${denominador}} $$`;
}


function update_equation() {
    $('#MathExample').text(latex_equation());
    var math = document.getElementById("MathExample");
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
}

update_to(layer_url);
update_equation();
