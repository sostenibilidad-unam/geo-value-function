var layer_url = document.currentScript.getAttribute('layer_url');

function concava_creciente_plot() {
    var gama = $('#gama').val();
    
    // update plot
    document.getElementById("plot").src="/concava_creciente/plot/?gama=" + gama
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_concava_creciente(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: concava_creciente(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function concava_creciente(x) {
    var gama = $('#gama').val();
    var xmax = range['max'];
    var xmin = range['min'];
    return ((Math.exp(gama * x)) - Math.exp(gama * xmin)) / (Math.exp(gama * xmax) - Math.exp(gama * xmin))
    
}

function concava_creciente_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    var gama = 0;
    if (range['min'] > 0){
        gama = (1.38 / center) * (1 + (Math.log(range['min']) / 2));
    }else{
        gama = (1.38 / center);
    }
        
    //var gama = 1.38/center; //qui hay que hacer el algebra
    $('#gama').val(gama);
    
}


function update_to(url) {
    set_layer(url);
    range = get_range();
    concava_creciente_args_from_range();
    apply_concava_creciente();
    concava_creciente_plot();
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

