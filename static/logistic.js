var layer_url = document.currentScript.getAttribute('layer_url');


function logistic_plot() {
    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    
    // update plot
    document.getElementById("plot").src="/logistic/plot/?L=" + L
	+ "&k=" + k
	+ "&center=" + center
	+ "&min=" + range['min']
	+ "&max=" + range['max'];
}


function apply_logistic(){
    jsonSource_data_layer.getFeatures().forEach(function(feature){
	feature.setProperties({
	    fv: logistic(feature.get("value"))
	});
    });
    layer.setStyle(style_data_layer);
    resize_bar();
}


function logistic(x) {
    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    return L / (1.0 + Math.exp(-k * (x - center)))
}
function inverted_logistic(y) {
    var L = $('#L').val(),
	k = $('#k').val(),
	center = parseFloat($('#center').val());
    return (Math.log((L/y)-1.0) / (0.0 - k)) + center
}
function to_percent(x) {
    return ((x - range['min']) / (range['max'] - range['min'])) * 100.0
}

function logistic_args_from_range() {
    var center = range['min'] + ((range['max'] - range['min']) / 2);
    k = 2 * (-4 * Math.log(1/3)) / (range['max'] - range['min'])
    $('#k').val(k);
    $('#center').val(center);
}

function resize_bar(){
    
   
    
    c20 = to_percent(inverted_logistic(0.2));
    c40 = to_percent(inverted_logistic(0.4));
    c60 = to_percent(inverted_logistic(0.6));
    c80 = to_percent(inverted_logistic(0.8));
    c100 = to_percent(inverted_logistic(1.0));
    
    document.getElementById("c1").style.width = c20 + "%";
    document.getElementById("c2").style.left = c20 + "%";
    document.getElementById("c2").style.width = (c40 - c20) + "%";
    document.getElementById("c3").style.left = c40 + "%";
    document.getElementById("c3").style.width = (c60 - c40) + "%";
    document.getElementById("c4").style.left = c60 + "%";
    document.getElementById("c4").style.width = (c80 - c60) + "%";
    document.getElementById("c5").style.left = c80 + "%";
    document.getElementById("c5").style.width = (100.0 - c80) + "%";

}

function update_to(url) {
    set_layer(url);
    range = get_range();
    logistic_args_from_range();
    logistic_plot();
}

update_to(layer_url);



