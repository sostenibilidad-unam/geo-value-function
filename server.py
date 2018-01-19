import math
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
import StringIO
import numpy
from os import listdir

from jinja2 import Environment, FileSystemLoader

from flask import Flask, make_response, request, send_from_directory, redirect
app = Flask(__name__)

env = Environment(loader=FileSystemLoader('templates'))


def logistic(t, L, k, center):
    return L / (1.0 + math.exp(-k * (t - center)))


def logistica_invertida(t, L, k, center):
    return 1 - (L / (1.0 + math.exp(-k * (t - center))))


def gaussian(t, a, center):
    return math.exp(0.0 - (((t - center)/a)*((t - center) / a)))


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
    return ((math.exp(-gama * x)) - math.exp(-gama * xmax)) \
        / (math.exp(-gama * xmin) - math.exp(-gama * xmax))


def concava_creciente(x, gama, xmax, xmin):
    return ((math.exp(gama * x)) - math.exp(gama * xmin)) \
        / (math.exp(gama * xmax) - math.exp(gama * xmin))


def convexa_decreciente(x, gama, xmax, xmin):
    return (1-(math.exp((x-30)/gama)) - (1-(math.exp((xmax-30)/gama)))) \
        / (1-(math.exp((xmin-30)/gama)) - (1-(math.exp((xmax-30)/gama))))


def convexa_creciente(x, gama, xmax, xmin):
    return (1 - (math.exp((0.0 - x) * gama))
            - (1-(math.exp((0.0 - xmin) * gama)))) \
        / (1 - (math.exp((0.0 - xmax) * gama))
           - (1-(math.exp((0.0 - xmin) * gama))))


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


@app.route("/")
def root():
    return redirect('/elevacion/gaussian/', code=302)


@app.route("/concava_creciente/plot/")
def concava_creciente_plot():
    gama = float(request.args.get('gama', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [concava_creciente(t, gama, max_v, min_v) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/concava_decreciente/plot/")
def concava_decreciente_plot():
    gama = float(request.args.get('gama', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [concava_decreciente(t, gama, max_v, min_v) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/convexa_decreciente/plot/")
def convexa_decreciente_plot():
    gama = float(request.args.get('gama', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [convexa_decreciente(t, gama, max_v, min_v) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/convexa_creciente/plot/")
def convexa_creciente_plot():
    gama = float(request.args.get('gama', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [convexa_creciente(t, gama, max_v, min_v) for t in x]

    fig = Figure()
    ax = fig.add_subplot(111)
    ax.plot(x, y)

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/gaussian/plot/")
def gaussian_plot():
    a = float(request.args.get('a', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    center = float(request.args.get('center', min_v + ((max_v - min_v) / 2.0)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [gaussian(t, a, center) for t in x]

    fig = Figure(figsize=(6, 6))
    grid = plt.GridSpec(10, 1, hspace=0)

    ax = fig.add_subplot(grid[0:7, 0])
    # ax.figure()
    ax.plot(x, y)

    ax = fig.add_subplot(grid[9:, 0])
    ax.imshow([y, y], cmap="GnBu", extent=[0, 100, 0, 8])
    ax.get_xaxis().set_visible(False)
    ax.get_yaxis().set_visible(False)
    plt.subplots_adjust()

    canvas = FigureCanvas(fig)
    png_output = StringIO.StringIO()
    canvas.print_png(png_output)
    response = make_response(png_output.getvalue())
    response.headers['Content-Type'] = 'image/png'
    return response


@app.route("/campana_invertida/plot/")
def campana_invertida_plot():
    a = float(request.args.get('a', 0.5))

    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    center = float(request.args.get('center', min_v + ((max_v - min_v) / 2.0)))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [campana_invertida(t, a, center) for t in x]

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


@app.route("/logistica_invertida/plot/")
def logistica_invertida_plot():

    L = float(request.args.get('L', 1))
    k = float(request.args.get('k', 0.02))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))
    center = float(request.args.get('center', (max_v - min_v) / 2.0))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [logistica_invertida(t, L, k, center) for t in x]

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


@app.route("/wf2/plot/")
def wf2_plot():

    fp = float(request.args.get('fp', 2))
    min_v = float(request.args.get('min', 0))
    max_v = float(request.args.get('max', 1))

    x = numpy.linspace(min_v, max_v, 100)  # 100 linearly spaced numbers
    y = [wf2(t, fp, min_v=min_v, max_v=max_v) for t in x]

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


@app.route("/<layer>/logistica_invertida/")
def logistica_invertida_form(layer):
    template = env.get_template('logistica_invertida.html')
    print get_layers()
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Logistica Invertida')


@app.route("/<layer>/gaussian/")
def gaussian_form(layer):
    template = env.get_template('gaussian.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Gaussian')


@app.route("/<layer>/campana_invertida/")
def campana_invertida_form(layer):
    template = env.get_template('campana_invertida.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='campana_invertida')


@app.route("/<layer>/wf2/")
def wf2_form(layer):
    template = env.get_template('wf2.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='Webber-Feshner-2')


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


@app.route("/<layer>/concava_decreciente/")
def concava_decreciente_form(layer):
    template = env.get_template('concava_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='concava_decreciente')


@app.route("/<layer>/concava_creciente/")
def concava_creciente_form(layer):
    template = env.get_template('concava_creciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='concava_creciente')


@app.route("/<layer>/convexa_decreciente/")
def convexa_decreciente_form(layer):
    template = env.get_template('convexa_decreciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='convexa_decreciente')


@app.route("/<layer>/convexa_creciente/")
def convexa_creciente_form(layer):
    template = env.get_template('convexa_creciente.html')
    return template.render(layers=get_layers(),
                           layer_url="/static/layers/%s.json" % layer,
                           layer=layer,
                           function_name='convexa_creciente')


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
