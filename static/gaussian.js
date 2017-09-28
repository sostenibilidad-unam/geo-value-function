var layer_url = document.currentScript.getAttribute('layer_url');

function gaussian_plot() {
    var a = $('#a').val(),
	center = $('#center').val();
    
    // update plot
    document.getElementById("plot").src="/gaussian/plot/?a=" + a
	+ "&center=" + center
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_gaussian(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: gaussian(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function gaussian(x) {
    var a = $('#a').val(),
	center = $('#center').val();
    return Math.exp(0.0  - (((x - center)/a)*((x - center)/a)))
}

function gaussian_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    a =  (range['max'] - range['min']) / 4.0;
    $('#a').val(a);
    $('#center').val(center);
}


function update_to(url) {
    set_layer(url);
    range = get_range();
    gaussian_args_from_range();
    gaussian_plot();
}

function latex_equation() {

    var a = $('#a').val(),
	center = $('#center').val();
    
    return `$$ fv(x)=e^{-\\left(\\frac{x-${center}}{${a}}\\right)^{2}} $$`;
}


function update_equation() {
    $('#MathExample').text(latex_equation());
    var math = document.getElementById("MathExample");
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
}

update_to(layer_url);
update_equation();

