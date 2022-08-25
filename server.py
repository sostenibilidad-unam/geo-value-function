import math
import matplotlib
matplotlib.use('Agg')
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
from matplotlib import colors
from io import BytesIO
import numpy
from os import listdir
from os.path import basename
import json
from json import dumps
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import shapefile
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from flask import Flask, make_response, request, send_from_directory, redirect, Response


app = Flask(__name__)

ROOT = Path(__file__).resolve().parent
config = {}
config['UPLOAD_FOLDER'] = ROOT.joinpath('uploads/')
config['LAYER_FOLDER'] = ROOT.joinpath('static/layers/')

env = Environment(loader=FileSystemLoader(ROOT.joinpath('templates')))

def allowed_file(filename):
    ALLOWED_EXTENSIONS = ['prj', 'shp', 'dbf', 'shx']
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload/', methods=['POST'])
def upload():
    uploaded_files = request.files.getlist("file[]")
    filenames = []
    elShp = ""
    # falta un chek de que viene el shp, shx, prj y dbf
    for f in uploaded_files:
        if f and allowed_file(f.filename):
            filename = secure_filename(f.filename)
            f.save(os.path.join(config['UPLOAD_FOLDER'], filename))
            if f.filename.endswith(".shp"):
                elShp = f.filename
            filenames.append(filename)
    reader = shapefile.Reader(os.path.join(config['UPLOAD_FOLDER'], elShp))
    fields = reader.fields[1:]
    field_names = [field[0] for field in fields]
    buff = []
    for sr in reader.shapeRecords():
        atr = dict(zip(field_names, sr.record))
        geom = sr.shape.__geo_interface__
        buff.append(dict(type="Feature",
                         geometry=geom, properties=atr))

    # write the GeoJSON file
    nombre = basename(elShp).replace('.shp', '.json')
    with open(os.path.join(config['LAYER_FOLDER'], nombre),
              "w") as geojson:
        geojson.write(dumps({"type": "FeatureCollection",
                             "features": buff}, indent=0))


    return redirect("/")
    

def normalize100(x, xmax, xmin):
    return (100.0 * ( x - xmin )/( xmax - xmin ) )

def logistic(x, k, center, xmax, xmin):
    #\frac{1}{1+e^{-k\cdot  \left(\frac{100\cdot \left(x-xmin\right)}{xmax-xmin}-\frac{100\cdot \left(center-xmin\right)}{xmax-xmin}\right)}}
    return 1 / (1.0 + math.exp(-k * (   (100 * ( x - xmin )/( xmax - xmin ) )  - ( 100 * ( center - xmin )/( xmax - xmin ) ) )) )



def logistica_invertida(x, k, center, xmax, xmin):
    #1-\frac{1}{1+e^{-k\cdot  \left(\frac{100\cdot \left(x-xmin\right)}{xmax-xmin}-\frac{100\cdot \left(center-xmin\right)}{xmax-xmin}\right)}}
    return 1.0 - logistic(x, k, center, xmax, xmin)



def gaussian(x, a, center, xmax, xmin):

    return math.exp(0.0 - ((( normalize100(x, xmax, xmin) - normalize100(center, xmax, xmin)) / (  a  ) )**2))

def campana_invertida(x, a, center, xmax, xmin):
    return 1.0 - gaussian(x, a, center, xmax, xmin)


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
#\frac{e^{\left(\gamma \cdot \left(100-\frac{100\cdot \left(x-xmin\right)}{xmax-xmin}\right)\right)}-1}{e^{\left(\gamma\cdot100 \right)}-1}

    return ( ( math.exp(gama * (100.0 - (100.0*(x - xmin)/(xmax - xmin) ) ) ) ) - 1 )  / ( math.exp(gama * 100) -1 )


def concava_creciente(x, gama, xmax, xmin):
#\frac{e^{\left( \gamma \cdot \frac{100\cdot \left(x-xmin\right)}{xmax-xmin}\right )}-1}{e^{ \left (\gamma\cdot100  \right )}-1}
    return ((math.exp(gama * (100*(x - xmin)/(xmax - xmin) ) ) ) - 1) / ( math.exp(gama * 100) -1 )


def convexa_decreciente(x, gama, xmax, xmin):
#1-\frac{e^{\left( \gamma \cdot \frac{100\cdot \left(x-xmin\right)}{xmax-xmin}\right )}-1}{e^{ \left (\gamma\cdot100  \right )}-1}
    return 1.0 - concava_creciente ( x, gama, xmax, xmin )


def convexa_creciente(x, gama, xmax, xmin):
#1-\frac{e^{\left(\gamma \cdot \left(100-\frac{100\cdot \left(x-xmin\right)}{xmax-xmin}\right)\right)}-1}{e^{\left(\gamma\cdot100 \right)}-1}
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


@app.route("/setup/", methods=["GET", "POST"])
def setup():
    if request.method == 'GET':
        template = env.get_template('setup.html')
        return template.render(layers=get_layers())
    else:
       f = request.values.get('function')
       nombre = request.values.get('nombre')
       if ":" in nombre:
           l = nombre.split(":")[0]
           c = nombre.split(":")[1]
       else:
           l = nombre
           c = "none"
       minimo = request.values.get('minimo')
       maximo = request.values.get('maximo')

       return redirect('/%s/%s/%s?min=%s&max=%s' % (l, c, f, minimo, maximo),
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    yrow = [campana_invertida(t, a, center, max_v, min_v) for t in x]
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
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
    png_output = BytesIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/<layer>/<field>/logistic/")
def logistic_form(layer,field):

    template = env.get_template('logistic.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           k=request.args.get('k', 'nan'),
                           saturacion = int(round(20 * ( ( float(request.args.get('k', '0.1')) - 0.01 ) / (0.5 - 0.01) ))),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Logistica')


@app.route("/<layer>/<field>/logistica_invertida/")
def logistica_invertida_form(layer,field):
    template = env.get_template('logistica_invertida.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           k=request.args.get('k', 'nan'),
                           saturacion = int(round(20 * ( ( float(request.args.get('k', '0.1')) - 0.01 ) / (0.5 - 0.01) ))),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Logistica Invertida')


@app.route("/<layer>/<field>/gaussian/")
def gaussian_form(layer,field):
    template = env.get_template('gaussian.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           a=request.args.get('a', 'nan'),
                           amplitud = 1 + int(round(19 * ( ( float(request.args.get('a', '25')) - 5 ) / (100 - 5) ))),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Campana')


@app.route("/<layer>/<field>/campana_invertida/")
def campana_invertida_form(layer,field):
    template = env.get_template('campana_invertida.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           a=request.args.get('a', 'nan'),
                           amplitud = 1 + int(round(19 * ( ( float(request.args.get('a', '25')) - 5 ) / (100 - 5) ))),
                           center=request.args.get('center', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Campana invertida')


@app.route("/<layer>/<field>/wf2/")
def wf2_form(layer,field):
    template = env.get_template('wf2.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           show_map=request.args.get('show_map', False),
                           function_name='Webber-Feshner-2')


@app.route("/<layer>/<field>/wf/")
def wf_form(layer,field):
    template = env.get_template('wf.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           show_map=request.args.get('show_map', False),
                           function_name='Webber-Feshner')


@app.route("/<layer>/<field>/lineal_decreciente/")
def lineal_decreciente_form(layer,field):
    template = env.get_template('lineal_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           m=request.args.get('m', 'nan'),
                           b=request.args.get('b', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Lineal decreciente')


@app.route("/<layer>/<field>/linear/")
def linear_form(layer,field):
    template = env.get_template('linear.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           m=request.args.get('m', 'nan'),
                           b=request.args.get('b', 'nan'),
                           show_map=request.args.get('show_map', False),
                           function_name='Lineal')


@app.route("/<layer>/<field>/concava_decreciente/")
def concava_decreciente_form(layer,field):
    template = env.get_template('concava_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           saturacion= int(round(20 * ( ( float(request.args.get('gama', '0.05')) - 0.005 ) / (0.3 - 0.005) ))),
                           show_map=request.args.get('show_map', False),
                           function_name='Concava decreciente')


@app.route("/<layer>/<field>/concava_creciente/")
def concava_creciente_form(layer,field):
    template = env.get_template('concava_creciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           saturacion= int(round(20 * ( ( float(request.args.get('gama', '0.05')) - 0.005 ) / (0.3 - 0.005) ))),
                           show_map=request.args.get('show_map', False),
                           function_name='Concava creciente')


@app.route("/<layer>/<field>/convexa_decreciente/")
def convexa_decreciente_form(layer,field):
    template = env.get_template('convexa_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           saturacion= int(round(20 * ( ( float(request.args.get('gama', '0.05')) - 0.005 ) / (0.3 - 0.005) ))),
                           show_map=request.args.get('show_map', False),
                           function_name='Convexa decreciente')


@app.route("/<layer>/<field>/convexa_creciente/")
def convexa_creciente_form(layer,field):
    template = env.get_template('convexa_creciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer_field=field,
                           layer=layer,
                           gama=request.args.get('gama', 'nan'),
                           saturacion= int(round(20 * ( ( float(request.args.get('gama', '0.05')) - 0.005 ) / (0.3 - 0.005) ))),
                           show_map=request.args.get('show_map', False),
                           function_name='Convexa creciente')


@app.route("/json/<layer>/<field>/<function_name>/")
def to_json(layer, field, function_name):
    params = request.url.split("?")[1].split("&")

    vf_dict = {"layer": layer, "field": field, "function_name": function_name}
    for param_pair in params:
        key = param_pair.split("=")[0]
        value = param_pair.split("=")[1]
        vf_dict.update({key: value})

    return Response(json.dumps(vf_dict),
                    mimetype='application/json',
                    headers={'Content-Disposition':'attachment;filename=%s__%s.json'
                             % (layer, field)})


def get_layers():
    layers = [{'name' :"Sin Capa", 'url':"none"}]
    for f in listdir(config['LAYER_FOLDER']):
        if f.endswith('.json'):
            layers.append({'name': f.replace('.json', ''),
                           'url': "/static/layers/%s" % f})
    return layers


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)



if __name__ == "__main__":
    DEVMODE = True
    app.run(host='0.0.0.0')
else:    
    app = ProxyFix(app, x_for=1, x_host=1)
