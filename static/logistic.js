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
    var center = range['min'] + ((range['max'] - range['min']) / 2),
	k = 2 * (-4 * Math.log(1/3)) / (range['max'] - range['min']);
    $('#k').val(k.toFixed(4));
    $('#center').val(center.toFixed(4));
    
    center_max = range['max'];
    center_min = range['min'];
    
    k_max = k * 2.0;
    k_min = k / 10.0;
   

    $( "#k_slider" ).slider({max: k_max,
			     min: k_min,
			     value: k,
			     step: (k_max - k_min) / 100.0,
			     change: function( event, ui ) {
				 sync_k();
				 sync_plot();
			     }
			    });


    $( "#center_slider" ).slider({max: center_max,
				  min: center_min,
				  value: center,
				  step: (center_max - center_min) / 100.0,
				  change: function( event, ui ) {
				      sync_center();
				      sync_plot();
				  }
				 });


}

function sync_center() {
    $('#center').val($("#center_slider").slider("option", "value"));
}

function sync_center_slider() {
    $("#center_slider").slider("option", "value",
			       $('#center').val());
}

function sync_k() {
    $('#k').val($("#k_slider").slider("option", "value"));
}

function sync_k_slider() {
    $("#k_slider").slider("option", "value",
			  $('#k').val());
}

function sync_plot() {
    apply_logistic();
    logistic_plot();
    update_equation();
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
    apply_logistic();
    logistic_plot();
}

function latex_equation() {

    var L = $('#L').val(),
	k = $('#k').val(),
	center = $('#center').val();
    
    return `$$ fv(x) = \\frac${L}{1+e^{-${k}(x-${center})}} $$`
}


function update_equation() {
    $('#MathExample').text(latex_equation());
    var math = document.getElementById("MathExample");
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, math]);
}


update_to(layer_url);
update_equation();


