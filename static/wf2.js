var layer_url = document.currentScript.getAttribute('layer_url');

function wf2_plot() {

    var fp = $('#fp').val();

    // update plot
    document.getElementById("plot").src="/wf2/plot/?fp=" + fp
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_wf2(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: wf2(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function bojorquezSerrano(fp, minimum, maximum) {
    var categories = 5,
	the_sum = 0;

    for (i=0; i<categories; i++) {
	the_sum += Math.pow(fp, i);
    }

    var bit = (maximum - minimum) / the_sum;
    var cuts = new Array();
    cuts.push(minimum)
    for (i=0; i<categories; i++) {
	prev = cuts[i];
	cut = prev + Math.pow(fp, i) * bit;
	cuts.push(cut);
    }

    return cuts;
}

function wf2(x){
    fp = $('#fp').val();
    minimum = range['min'];
    maximum = range['max'];
    
    x_cuts = bojorquezSerrano(fp, minimum, maximum);
    y_cuts =  bojorquezSerrano(fp, 0, 1);
    
    var x1 = x_cuts[1],
	x2 = x_cuts[2],
	x3 = x_cuts[3],
	x4 = x_cuts[4];

    if (x < x1) {
	return y_cuts[1];
    } else if (x >= x1 && x < x2) {
	return y_cuts[2]
    } else if (x >= x2 && x < x3) {
	return y_cuts[3]
    } else if (x >= x3 && x < x4) {
	return y_cuts[4]
    } else if (x >= x4) {
	return 1.0
    }
}


function wf2_args_from_range() {
    $('#fp').val(2);
}


function update_to(url) {
    set_layer(url);
    range = get_range();
    wf2_args_from_range();
    apply_wf2();
    wf2_plot();
}


function latex_equation() {
    var fp = $('#fp').val();

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

