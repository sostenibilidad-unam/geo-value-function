var layer_url = document.currentScript.getAttribute('layer_url');

function wf_plot() {

    var fp = $('#fp').val();

    // update plot
    document.getElementById("plot").src="/wf/plot/?fp=" + fp
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_wf(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: wf(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
}


function bojorquezSerrano(fp) {
    var categories = 5,
	maximum = range['max'],
	minimum = range['min'],
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

function wf(x){
    fp = $('#fp').val();    
    cuts = bojorquezSerrano(fp);
    
    var x1 = cuts[1],
	x2 = cuts[2],
	x3 = cuts[3],
	x4 = cuts[4];

    if (x < x1) {
	return 0.2
    } else if (x >= x1 && x < x2) {
	return 0.4
    } else if (x >= x2 && x < x3) {
	return 0.6
    } else if (x >= x3 && x < x4) {
	return 0.8
    } else if (x >= x4) {
	return 1.0
    }
}


function wf_args_from_range() {
    $('#fp').val(2);
}


function update_to(url) {
    set_layer(url);
    range = get_range();
    wf_args_from_range();
    apply_wf();
    wf_plot();
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

