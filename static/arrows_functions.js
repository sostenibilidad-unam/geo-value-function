function forward(selector, sync_callback) {
    delta = (parseFloat($(selector).slider("option", "max")) - parseFloat($(selector).slider("option", "min"))) / 20.0;
    $(selector).slider("option", "value", parseFloat($(selector).slider("option", "value")) + delta); // aqui hay que ajustar el maximo del slider
    sync_callback();
    sync_plot();
}
function fforward(selector, sync_callback) {
    delta = ($(selector).slider("option", "max") - $(selector).slider("option", "min")) / 10.0;
    $(selector).slider("option", "value", parseFloat($(selector).slider("option", "value")) + delta);
    sync_callback();
    sync_plot();
}
function backward(selector, sync_callback) {
    delta = ($(selector).slider("option", "max") - $(selector).slider("option", "min")) / 20.0;
    $(selector).slider("option", "value", parseFloat($(selector).slider("option", "value")) - delta);
    sync_callback();
    sync_plot();
}
function fbackward(selector, sync_callback) {
    delta = ($(selector).slider("option", "max") - $(selector).slider("option", "min")) / 10.0;
    $(selector).slider("option", "value", parseFloat($(selector).slider("option", "value")) - delta);
    sync_callback();
    sync_plot();
}