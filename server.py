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


def wf(t, x_cuts, fp):
    wf_cuts = bojorquezSerrano(fp)
    if t < x_cuts[0]:
        return wf_cuts[1]
    elif t >= x_cuts[0] and t < x_cuts[1]:
        return wf_cuts[2]
    elif t >= x_cuts[1] and t < x_cuts[2]:
        return wf_cuts[3]
    elif t >= x_cuts[2] and t < x_cuts[3]:
        return wf_cuts[4]
    elif t >= x_cuts[3]:
        return wf_cuts[5]


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

    x_cuts = [0, 0, 0, 0]
    x_cuts[0] = float(request.args.get('x1', 0.1))
    x_cuts[1] = float(request.args.get('x2', 0.3))
    x_cuts[2] = float(request.args.get('x3', 0.7))
    x_cuts[3] = float(request.args.get('x4', 0.9))
    fp = float(request.args.get('fp', 2))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [wf(t, x_cuts, fp) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


def logistic_latex(L, k, center):
    # http://docs.mathjax.org/en/latest/advanced/typeset.html#manipulating-individual-math-elements
    return "$$ \\frac{%s}{1+e^{-%s(t-%s)}} $$" % (L, k, center)


@app.route("/logistic/")
def logistic_form():
    template = env.get_template('logistic.html')
    return template.render(layers=get_layers(),
                           function_name='Logistic',
                           equation=logistic_latex(1, 1, 1))


@app.route("/gaussian/")
def gaussian_form():
    template = env.get_template('gaussian.html')
    return template.render(layers=get_layers(), function_name='Gaussian')


@app.route("/wf/")
def wf_form():
    template = env.get_template('wf.html')
    return template.render(layers=get_layers(), function_name='Webber-Feshner')


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
