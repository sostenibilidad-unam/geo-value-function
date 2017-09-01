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


def bell(min_v, max_v, a, center):
    return 1


@app.route("/bell/plot/")
def bell_plot():
    L = float(request.args.get('L', 1))
    k = float(request.args.get('k', 0.02))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    center = float(request.args.get('center', (max_v - min_v) / 2.0))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [bell(t, L, k, center) for t in x]

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


@app.route("/logistic/")
def logistic_form():
    template = env.get_template('logistic.html')
    return template.render(layers=get_layers(), function_name='Logistic')


@app.route("/bell/")
def bell_form():
    template = env.get_template('bell.html')
    return template.render(layers=get_layers(), function_name='Bell')


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
