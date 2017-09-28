var layer_url = document.currentScript.getAttribute('layer_url');

function wf_plot() {

    var x1 = $('#x1').val(),
	x2 = $('#x2').val(),
	x3 = $('#x3').val(),
	x4 = $('#x4').val(),
	fp = $('#fp').val();

    // update plot
    document.getElementById("plot").src="/wf/plot/?x1=" + x1
	+ "&x2=" + x2
	+ "&x3=" + x3
	+ "&x4=" + x4
	+ "&fp=" + fp
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
	maximum = 1,
	minimum = 0,
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

    var x1 = $('#x1').val(),
	x2 = $('#x2').val(),
	x3 = $('#x3').val(),
	x4 = $('#x4').val(),
	fp = $('#fp').val(),
	wf_cuts = bojorquezSerrano(fp);

    if (x < x1) {
	return wf_cuts[1]
    } else if (x >= x1 && x < x2) {
	return wf_cuts[2]
    } else if (x >= x2 && x < x3) {
	return wf_cuts[3]
    } else if (x >= x3 && x < x4) {
	return wf_cuts[4]
    } else if (x >= x4) {
	return wf_cuts[5]
    }
}


function wf_args_from_range() {

    diff = range['max'] - range['min']

    $('#x1').val(range['min'] + 0.1 * diff);
    $('#x2').val(range['min'] + 0.3 * diff);
    $('#x3').val(range['min'] + 0.7 * diff);
    $('#x4').val(range['min'] + 0.9 * diff);

    $('#fp').val(2);
}


function update_to(url) {
    set_layer(url);
    range = get_range();
    wf_args_from_range();
    wf_plot();
}

update_to(layer_url);
