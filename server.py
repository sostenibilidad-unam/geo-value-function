import math
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import StringIO
import numpy
from os import listdir

from jinja2 import Environment, FileSystemLoader

from flask import Flask, make_response, request, send_from_directory
app = Flask(__name__)

env = Environment(loader=FileSystemLoader('templates'))


def logistic(t, L, k, center):
    return L / (1.0 + math.exp(-k * (t - center)))


def gaussian(t, a, center):
    return math.exp(0.0 - (((t - center)/a)*((t - center) / a)))


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


def linear(x, m, b):
    return (m * x) + b


@app.route("/gaussian/plot/")
def gaussian_plot():
    a = float(request.args.get('a', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    center = float(request.args.get('center', min_v + ((max_v - min_v) / 2.0)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [gaussian(t, a, center) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/logistic/plot/")
def logistic_plot():

    L = float(request.args.get('L', 1))
    k = float(request.args.get('k', 0.02))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    center = float(request.args.get('center', (max_v - min_v) / 2.0))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [logistic(t, L, k, center) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

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

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [wf(t, fp, min_v=min_v, max_v=max_v) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/linear/plot/")
def linear_plot():

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    print "min= " + str(min_v) + ",max= " + str(max_v)
    m = float(request.args.get('m',
                               1 / (max_v - min_v)))
    b = float(request.args.get('b',
                               0 - (min_v / (max_v - min_v))))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [linear(t, m, b) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/<layer>/logistic/")
def logistic_form(layer):
    template = env.get_template('logistic.html')
    print get_layers()
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Logistic')


@app.route("/<layer>/gaussian/")
def gaussian_form(layer):
    template = env.get_template('gaussian.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Gaussian')


@app.route("/<layer>/wf/")
def wf_form(layer):
    template = env.get_template('wf.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Webber-Feshner')


@app.route("/<layer>/linear/")
def linear_form(layer):
    template = env.get_template('linear.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Linear')


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
