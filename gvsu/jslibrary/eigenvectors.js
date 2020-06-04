var matrix = new Canvas("sliders", [0, 0, 2, 1.5]);
var canvas = new Canvas("eigenvector", [-10, -10, 10, 10]);

var td_a = document.getElementById("td_a");
var td_b = document.getElementById("td_b");
var td_c = document.getElementById("td_c");
var td_d = document.getElementById("td_d");

var td_x = document.getElementById("td_x");
var td_y = document.getElementById("td_y");
var td_xprime = document.getElementById("td_xprime");
var td_yprime = document.getElementById("td_yprime");


matrix.margins = [20, 5, 20, 5];
matrix.setUpCoordinates();
canvas.margins = [5, 5, 5, 5];
canvas.setUpCoordinates();

var mkslider = function (xr, y) {
    var s = new Slider(xr, y, [-5, 5], update);
    s.ticks = [-5, 1, 5]
    s.labels = [-5, 1, 5]
    s.point.style = "box";
    s.point.fillColor = "blue"
    s.point.size = 4;
    matrix.addPlotable(s);
    matrix.addMoveable(s);
    return s;
}

function force_tenths(val) {
    // This forces values to be rounded to nearest tenth
    return Math.round(10 * val) / 10.;
}

var update = function () {
    var ma = force_tenths(a.coordinate());
    var mb = force_tenths(b.coordinate());
    var mc = force_tenths(c.coordinate());
    var md = force_tenths(d.coordinate());
    var x = force_tenths(v.head[0]);
    var y = force_tenths(v.head[1]);
    Av.head = [ma * x + mb * y, mc * x + md * y];
    matrix.draw();
    canvas.draw();

    td_a.innerHTML = ma;
    td_b.innerHTML = mb;
    td_c.innerHTML = mc;
    td_d.innerHTML = md;
    td_x.innerHTML = x;
    td_y.innerHTML = y;
    td_xprime.innerHTML = force_tenths(Av.head[0]);
    td_yprime.innerHTML = force_tenths(Av.head[1]);
}


var a = mkslider([0.1, 2], 1.2);
var b = mkslider([0.1, 2], 0.9);
var c = mkslider([0.1, 2], 0.6);
var d = mkslider([0.1, 2], 0.3);
a.init(1);
b.init(0);
c.init(0);
d.init(1);


var label_a = new Label("a", [0, 1.2]);
label_a.offset = [10, -5]
label_a.font = "italic 16px arial";
matrix.addPlotable(label_a);

var label_b = new Label("b", [0, 0.9]);
label_b.offset = [10, -4]
label_b.font = "italic 16px arial";
matrix.addPlotable(label_b);

var label_c = new Label("c", [0, 0.6]);
label_c.offset = [10, -5]
label_c.font = "italic 16px arial";
matrix.addPlotable(label_c);

var label_d = new Label("d", [0, 0.3]);
label_d.offset = [10, -4]
label_d.font = "italic 16px arial";
matrix.addPlotable(label_d);


var grid = new Grid([-10, 1, 10], [-10, 1, 10]);
canvas.addPlotable(grid);

var axes = new Axes();
axes.labels = [
    [-10, 1, 10],
    [-10, 1, 10]
]
axes.ticks = [
    [-10, 1, 10],
    [-10, 1, 10]
]
canvas.addPlotable(axes);

var v = new Vector([1, 0]);
v.move = function (p) {
    v.head = p;
    update();
}
v.fillColor = "red";

var Av = new Vector([1, 0]);
Av.fillColor = "gray";
canvas.addPlotable(Av);
canvas.addPlotable(v);
canvas.addMoveable(v);

update();
