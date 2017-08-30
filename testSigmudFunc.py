import math
import pylab
import numpy

     
x = numpy.linspace(2200, 3000, 100)  # 100 linearly spaced numbers

L = 1
k = 0.04
center = 2600

logistica = lambda t: L / (1.0 + math.exp(-k * (t - center)))
vfunc = numpy.vectorize(logistica)
y = vfunc(x)


pylab.plot(x, y)  # sin(x)/x
pylab.show()  # show the plot

