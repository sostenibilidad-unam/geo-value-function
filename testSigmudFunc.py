import math
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import StringIO
import numpy

from jinja2 import Environment, FileSystemLoader

from flask import Flask, make_response, request
app = Flask(__name__)

env = Environment(loader=FileSystemLoader('templates'))


def logistica(t, L, k, center):
    return L / (1.0 + math.exp(-k * (t - center)))


@app.route("/plot_logistica/")
def plot_logistica():

    x = numpy.linspace(2200, 3000, 100)  # 100 linearly spaced numbers
    L = float(request.args.get('L', 1))
    k = float(request.args.get('k', 0.02))
    center = float(request.args.get('center', 2600))

    y = [logistica(t, L, k, center) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/")
def form():
    template = env.get_template('base.html')
    return template.render()


if __name__ == "__main__":
    app.run(host='0.0.0.0')
