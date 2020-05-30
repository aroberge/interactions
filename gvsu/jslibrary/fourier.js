var w0 = 5;
var w1 = 1;
var w2 = 0;
var w3 = 0;

var update = function () {
    w0 = w0slider.coordinate();
    w1 = w1slider.coordinate();
    w2 = w2slider.coordinate();
    w3 = w3slider.coordinate();
    for (var i = 0; i < 8; i++) {
        points[i].point = [i, f(i)];
        lines[i].p1 = [i, f(i)];
    }
    fourier.draw();
}

var fourier = new Canvas("fourier", [0, -6, 7, 10]);

fourier.margins = [20, 10, 10, 10]
fourier.setUpCoordinates();

dy = 1.2
y0 = -2
y1 = y0 - dy
y2 = y1 - dy
y3 = y2 - dy
var w0l = new Label("a", [2, y0]);
var w1l = new Label("a", [2, y1]);
var w2l = new Label("a", [2, y2]);
var w3l = new Label("a", [2, y3]);
w0l.offset = [-23, -3];
w1l.offset = [-23, -3];
w2l.offset = [-23, -3];
w3l.offset = [-23, -3];
var w00 = new Label("0", [2, y0]);
var w10 = new Label("1", [2, y1]);
var w20 = new Label("2", [2, y2]);
var w30 = new Label("3", [2, y3]);
w00.offset = [-14, -8];
w10.offset = [-14, -8];
w20.offset = [-14, -8];
w30.offset = [-14, -8];
fourier.addPlotable([w0l, w1l, w2l, w3l, w00, w10, w20, w30])

var w0slider = new Slider([2, 6], y0, [0, 8], update);
w0slider.ticks = [0, 1, 8]
w0slider.labels = [0, 1, 8]
w0slider.point.style = "box";
w0slider.point.fillColor = "blue";
w0slider.point.size = 4;
w0slider.init(w0);
fourier.addPlotable(w0slider);
fourier.addMoveable(w0slider);

var w1slider = new Slider([2, 6], y1, [-2, 2], update);
w1slider.ticks = [-2, 1, 2]
w1slider.labels = [-2, 1, 2]
w1slider.point.style = "box";
w1slider.point.fillColor = "blue";
w1slider.point.size = 4
w1slider.init(w1);
fourier.addPlotable(w1slider);
fourier.addMoveable(w1slider);

var w2slider = new Slider([2, 6], y2, [-2, 2], update);
w2slider.ticks = [-2, 1, 2]
w2slider.labels = [-2, 1, 2]
w2slider.point.style = "box";
w2slider.point.fillColor = "blue";
w2slider.point.size = 4
w2slider.init(w2);
fourier.addPlotable(w2slider);
fourier.addMoveable(w2slider);

var w3slider = new Slider([2, 6], y3, [-2, 2], update);
w3slider.ticks = [-2, 1, 2]
w3slider.labels = [-2, 1, 2]
w3slider.point.style = "box";
w3slider.point.fillColor = "blue";
w3slider.point.size = 4
w3slider.init(w3);
fourier.addPlotable(w3slider);
fourier.addMoveable(w3slider);

var f = function (x) {
    return w0 + w1 * Math.cos(x) +
        w2 * Math.cos(2*x) + w3 * Math.cos(3*x);
    // return w0 + w1 * Math.cos(3 * Math.PI * (2 * x + 1) / 16.0) +
    //     w2 * Math.cos(7 * Math.PI * (2 * x + 1) / 16.0);
}

var graph = new Graph(new Function(f));
graph.lineWidth = 2;
graph.strokeColor = "gray"
fourier.addPlotable(graph);

var points = [];
var lines = [];
for (var i = 0; i < 8; i++) {
    var p = new Point([i, f(i)]);
    p.fillColor = "blue"
    points.push(p);

    var l = new Line([i, 0], [i, f(i)]);
    l.strokeColor = "lightgray";
    lines.push(l);
}
fourier.addPlotable(lines);
fourier.addPlotable(points);
axes = new Axes(true);  // true == draw y origin ticks
fourier.addPlotable(axes);
axes.ticks = [
    [0, 1, 7], [-2, 1, 10]
]
axes.labels = [
    [0, 1, 7], [-2, 1, 10]
]



update();
