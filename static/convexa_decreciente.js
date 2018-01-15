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
    return (1-(Math.exp((x-10)/gama)) - (1-(Math.exp((xmax-10)/gama)))) / (1-(Math.exp((xmin-10)/gama)) - (1-(Math.exp((xmax-10)/gama))))

    
}

function convexa_decreciente_args_from_range() {
    var gama = 2 * Math.pow(range['max'],1/1.5);
   
        
    //var gama = 1.38/center; //qui hay que hacer el algebra
    $('#gama').val(gama);
    
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
    
    return `$$ fv(x)=e^{-\\left(\\frac{x-${gama}}{${gama}}\\right)^{2}} $$`;
}


function update_equation() {
    $('#MathExample').text(latex_equation());
    var math = document.getElementById("MathExample");
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
}

update_to(layer_url);
update_equation();

