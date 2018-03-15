import math
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
from matplotlib import colors
import StringIO
import numpy
from os import listdir
import json

from jinja2 import Environment, FileSystemLoader

from flask import Flask, make_response, request, send_from_directory, redirect, Response
app = Flask(__name__)

env = Environment(loader=FileSystemLoader('templates'))

def logistic(x, k, center, xmax, xmin):
#def logistic(t, k, center):
    #return 1 / (1.0 + math.exp(-k * (t - center)))
    return 1 / (1.0 + math.exp(-k * (   (100 * ( x - xmin )/( xmax - xmin ) )  - ( 100 * ( center - xmin )/( xmax - xmin ) ) )) )


#def logistica_invertida(t, k, center):
def logistica_invertida(x, k, center, xmax, xmin):   
    return 1.0 - logistic(x, k, center, xmax, xmin)


#def gaussian(t, a, center):
def gaussian(x, a, center, xmax, xmin):
    #return math.exp(0.0 - (((t - center)/a)*((t - center) / a)))
    return math.exp(0.0 - (((   (100 * ( x - xmin )/( xmax - xmin ) )   - ( 100 * ( center - xmin )/( xmax - xmin ) )) / a )*((   (100 * ( x - xmin )/( xmax - xmin ) )   - ( 100 * ( center - xmin )/( xmax - xmin ) )) / a )))

def campana_invertida(t, a, center):
    return 1 - math.exp(0.0 - (((t - center)/a)*((t - center) / a)))


def bojorquezSerrano(fp, categories=5, maximum=1.0, minimum=0.0):
    the_sum = 0
    for i in range(categories):
        the_sum += ((fp) ** i)

    bit = (maximum - minimum) / the_sum
    cuts = []
    cuts.append(minimum)
    for i in range(categories):
        prev = cuts[i]
        cut = prev + fp ** i * bit
        cuts.append(cut)

    return cuts


def concava_decreciente(x, gama, xmax, xmin):
#    return ((math.exp(-gama * x)) - math.exp(-gama * xmax)) \
#        / (math.exp(-gama * xmin) - math.exp(-gama * xmax))
    return ( ( math.exp(gama * (100.0 - (100.0*(x - xmin)/(xmax - xmin) ) ) ) ) - 1 )  / ( math.exp(gama * 100) -1 )


def concava_creciente(x, gama, xmax, xmin):
#    return ((math.exp(gama * x)) - math.exp(gama * xmin)) \
#        / (math.exp(gama * xmax) - math.exp(gama * xmin))
    return ((math.exp(gama * (100*(x - xmin)/(xmax - xmin) ) ) ) - 1) / ( math.exp(gama * 100) -1 )


def convexa_decreciente(x, gama, xmax, xmin):
#    return (1-(math.exp((x-30)/gama)) - (1-(math.exp((xmax-30)/gama)))) \
#        / (1-(math.exp((xmin-30)/gama)) - (1-(math.exp((xmax-30)/gama))))
    return 1.0 - concava_creciente ( x, gama, xmax, xmin )


def convexa_creciente(x, gama, xmax, xmin):
#    return (1 - (math.exp((0.0 - x) * gama))
#            - (1-(math.exp((0.0 - xmin) * gama)))) \
#        / (1 - (math.exp((0.0 - xmax) * gama))
#           - (1-(math.exp((0.0 - xmin) * gama))))
    return 1.0 - concava_decreciente ( x, gama, xmax, xmin )


def wf(t, fp, min_v, max_v):
    x_cuts = bojorquezSerrano(fp, minimum=min_v, maximum=max_v)
    if t < x_cuts[1]:
        return 0.2
    elif t >= x_cuts[1] and t < x_cuts[2]:
        return 0.4
    elif t >= x_cuts[2] and t < x_cuts[3]:
        return 0.6
    elif t >= x_cuts[3] and t < x_cuts[4]:
        return 0.8
    elif t >= x_cuts[4]:
        return 1.0


def wf2(t, fp, min_v, max_v):
    x_cuts = bojorquezSerrano(fp, minimum=min_v, maximum=max_v)
    y_cuts = bojorquezSerrano(fp, minimum=0, maximum=1)
    if t < x_cuts[1]:
        return y_cuts[1]
    elif t >= x_cuts[1] and t < x_cuts[2]:
        return y_cuts[2]
    elif t >= x_cuts[2] and t < x_cuts[3]:
        return y_cuts[3]
    elif t >= x_cuts[3] and t < x_cuts[4]:
        return y_cuts[4]
    elif t >= x_cuts[4]:
        return 1.0


def linear(x, m, b):
    return (m * x) + b


def lineal_decreciente(x, m, b):
    return (m * x) + b


def normalize_max_min(y, maxy, miny):
    return (y - miny)/(maxy - miny)


def normalize01(y):
    maxy = max(y)
    miny = min(y)
    y_prima = [normalize_max_min(t, maxy, miny) for t in y]
    return y_prima


@app.route("/")
def root():
    return redirect('/setup/', code=302)


from pprint import pprint
@app.route("/setup/", methods=["GET", "POST"])
def setup():
    print "hola"
    if request.method == 'GET':
        template = env.get_template('setup.html')
        return template.render(layers=get_layers())
    else:
       f = request.values.get('function')
       l = request.values.get('layer')
       pprint(request.values)
       return redirect('/%s/%s' % (l, f),
                       code=302)


@app.route("/concava_creciente/plot/")
def concava_creciente_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    gama = float(params[1])
    min_v = float(params[2])
    max_v = float(params[3])

    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))
    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [concava_creciente(t, gama, max_v, min_v) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)


    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/concava_decreciente/plot/")
def concava_decreciente_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    gama = float(params[1])
    min_v = float(params[2])
    max_v = float(params[3])

    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [concava_decreciente(t, gama, max_v, min_v) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/convexa_decreciente/plot/")
def convexa_decreciente_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    gama = float(params[1])
    min_v = float(params[2])
    max_v = float(params[3])

    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [convexa_decreciente(t, gama, max_v, min_v) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/convexa_creciente/plot/")
def convexa_creciente_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    gama = float(params[1])
    min_v = float(params[2])
    max_v = float(params[3])

    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [convexa_creciente(t, gama, max_v, min_v) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)


    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/gaussian/plot/")
def gaussian_plot():

    params = request.args.get('params', "").split(",")
    n = int(params[0])
    a = float(params[1])
    center = float(params[2])
    min_v = float(params[3])
    max_v = float(params[4])

    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    yrow = [gaussian(t, a, center, max_v, min_v) for t in x]
    y = normalize01(yrow)
    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])

    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    #var paleta = ['rgba(74,190,181,0.8)', 'rgba(24,138,156,0.8)', 'rgba(0,69,132,0.8)', 'rgba(0,30,123,0.8)', 'rgba(16,0,90,0.8)'];
    ax = fig.add_subplot(grid[9:, 0])
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)


    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/campana_invertida/plot/")
def campana_invertida_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    a = float(params[1])
    center = float(params[2])
    min_v = float(params[3])
    max_v = float(params[4])
    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))


    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    yrow = [campana_invertida(t, a, center) for t in x]
    y = normalize01(yrow)
    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/logistic/plot/")
def logistic_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    k = float(params[1])
    center = float(params[2])
    min_v = float(params[3])
    max_v = float(params[4])
    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    yrow = [logistic(t, k, center, max_v, min_v) for t in x]
    y = normalize01(yrow)
    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/logistica_invertida/plot/")
def logistica_invertida_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    k = float(params[1])
    center = float(params[2])
    min_v = float(params[3])
    max_v = float(params[4])
    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    yrow = [logistica_invertida(t, k, center, max_v, min_v) for t in x]
    y = normalize01(yrow)
    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("",
                                                    ["#4ABEB5", "#10005A"],
                                                    N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/wf/plot/")
def wf_plot():

    fp = float(request.args.get('fp', 2))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))
    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [wf(t, fp, min_v=min_v, max_v=max_v) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)

    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap="GnBu", extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/wf2/plot/")
def wf2_plot():

    fp = float(request.args.get('fp', 2))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [wf2(t, fp, min_v=min_v, max_v=max_v) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)

    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap="GnBu", extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/linear/plot/")
def linear_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    m = float(params[1])
    b = float(params[2])
    min_v = float(params[3])
    max_v = float(params[4])
    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [linear(t, m, b) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/lineal_decreciente/plot/")
def lineal_decreciente_plot():
    params = request.args.get('params', "").split(",")
    n = int(params[0])
    m = float(params[1])
    b = float(params[2])
    min_v = float(params[3])
    max_v = float(params[4])
    value = float(request.args.get('value', -1))
    value_index = int(99 * ((value - min_v)/(max_v - min_v)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [lineal_decreciente(t, m, b) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    markers_on = []
    if value > -1:
        markers_on.append(value_index)

    ax.plot(x, y, '-bD', markevery=markers_on)
    cmap = colors.LinearSegmentedColormap.from_list("", ["#4ABEB5","#10005A"], N=n)
    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap=cmap, extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/<layer>/logistic/")
def logistic_form(layer):

    template = env.get_template('logistic.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           k=request.args.get('k', 'nan'),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Logistica')


@app.route("/<layer>/logistica_invertida/")
def logistica_invertida_form(layer):
    template = env.get_template('logistica_invertida.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           k=request.args.get('k', 'nan'),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Logistica Invertida')


@app.route("/<layer>/gaussian/")
def gaussian_form(layer):
    template = env.get_template('gaussian.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           a=request.args.get('a', 'nan'),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Campana')


@app.route("/<layer>/campana_invertida/")
def campana_invertida_form(layer):
    template = env.get_template('campana_invertida.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           a=request.args.get('a', 'nan'),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Campana invertida')


@app.route("/<layer>/wf2/")
def wf2_form(layer):
    template = env.get_template('wf2.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           show_map=request.args.get('show_map', False),
                           function_name='Webber-Feshner-2')


@app.route("/<layer>/wf/")
def wf_form(layer):
    template = env.get_template('wf.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           show_map=request.args.get('show_map', False),
                           function_name='Webber-Feshner')


@app.route("/<layer>/lineal_decreciente/")
def lineal_decreciente_form(layer):
    template = env.get_template('lineal_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           m=request.args.get('m', 'nan'),
                           b=request.args.get('b', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Lineal decreciente')


@app.route("/<layer>/linear/")
def linear_form(layer):
    template = env.get_template('linear.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           m=request.args.get('m', 'nan'),
                           b=request.args.get('b', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Lineal')


@app.route("/<layer>/concava_decreciente/")
def concava_decreciente_form(layer):
    template = env.get_template('concava_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Concava decreciente')


@app.route("/<layer>/concava_creciente/")
def concava_creciente_form(layer):
    template = env.get_template('concava_creciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Concava creciente')


@app.route("/<layer>/convexa_decreciente/")
def convexa_decreciente_form(layer):
    template = env.get_template('convexa_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Convexa decreciente')


@app.route("/<layer>/convexa_creciente/")
def convexa_creciente_form(layer):
    template = env.get_template('convexa_creciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Convexa creciente')


@app.route("/json/<layer>/<function_name>/")
def to_json(layer, function_name):
    params = request.url.split("?")[1].split("&")

    vf_dict = {"layer": layer, "function_name": function_name}
    for param_pair in params:
        key = param_pair.split("=")[0]
        value = param_pair.split("=")[1]
        vf_dict.update({key: value})

    return Response(json.dumps(vf_dict),
                    mimetype='application/json',
                    headers={'Content-Disposition':'attachment;filename=%s.json'
                             % layer})


def get_layers():
    layers = []
    for f in listdir('static/layers'):
        if f.endswith('.json'):
            layers.append({'name': f.replace('.json', ''),
                           'url': "/static/layers/%s" % f})
    return layers


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)


if __name__ == "__main__":
    app.run(host='0.0.0.0')
