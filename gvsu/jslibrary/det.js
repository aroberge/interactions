var sliders = new Canvas("sliders", [0, 0, 2, 2]);
var graph = new Canvas("graph", [-5, -5, 5, 5]);

var det_a = document.getElementById("det_a");
var td_a = document.getElementById("td_a");
var td_b = document.getElementById("td_b");
var td_c = document.getElementById("td_c");
var td_d = document.getElementById("td_d");

function force_int(val) {
    // this helps to reduce frustrations in trying to set up exact
    // integer values using the sliders
    if (Math.abs(Math.round(val) - val) < 0.015) {
        return Math.round(val);
    }
    return val;
}

sliders.margins = [20, 5, 20, 5];
sliders.setUpCoordinates();
graph.margins = [5, 5, 5, 5]
graph.setUpCoordinates();

var dx = 0.05;
var mkslider = function (xr, y, canvas, method, label) {
    var s = new Slider(xr, y, [-3, 3], method);
    s.ticks = [-3, 1, 3]
    s.labels = [-3, 1, 3]
    s.point.style = "box";
    s.point.fillColor = "blue"
    s.point.size = 4;
    label = new Label(label, [xr[0], y])
    label.offset = [-8, 5]
    label.alignment = "rb"
    canvas.addPlotable(label)
    canvas.addPlotable(s);
    canvas.addMoveable(s);
    return s;
}

var sliders_update = function () {
    var ma = 1
    var mb = 0
    var mc = -1
    var md = -2
    var det = ma * md - mb * mc;
    var x = v.head[0];
    var y = v.head[1];
    var a1 = [ma, mc];
    var a2 = [mb, md];
    trgrid.a1 = a1;
    trgrid.a2 = a2;
    if (Math.abs(det) < 0.03) {
        trgrid.a2 = trgrid.a1;
    }
    Av.head = [ma * x + mc * y, mb * x + md * y];
    topleft.draw();
    topright.draw()
}

var graph_update = function () {
    var ma = ba.coordinate();
    var mb = bb.coordinate();
    var mc = bc.coordinate();
    var md = bd.coordinate();

    ma = force_int(ma);
    mb = force_int(mb);
    mc = force_int(mc);
    md = force_int(md);

    v1.head = [ma, mc];
    v2.head = [mb, md];
    var det = ma * md - mb * mc;
    if (det < 0) polygon.fillColor = "lightcoral";
    else polygon.fillColor = "skyblue";

    det_a.innerHTML = Math.round(det * 100) / 100.;
    td_a.innerHTML = Math.round(ma * 100) / 100.;
    td_b.innerHTML = Math.round(mb * 100) / 100.;
    td_c.innerHTML = Math.round(mc * 100) / 100.;
    td_d.innerHTML = Math.round(md * 100) / 100.;

    var a1 = [ma, mc];
    var a2 = [mb, md];
    tgrid.a1 = a1;
    tgrid.a2 = a2;
    if (Math.abs(det) < 0.03) {
        tgrid.a2 = tgrid.a1;
    }
    polygon.points = [
        [0, 0], a1, vadd(a1, a2), a2
    ];
    sliders.draw();
    graph.draw()
}

var ba = mkslider([dx, 1 - 2 * dx], 1.5, sliders, graph_update, "a");
var bb = mkslider([1 + 2 * dx, 2 - dx], 1.5, sliders, graph_update, "b");
var bc = mkslider([dx, 1 - 2 * dx], 0.5, sliders, graph_update, "c");
var bd = mkslider([1 + 2 * dx, 2 - dx], 0.5, sliders, graph_update, "d");
ba.init(1);
bb.init(0);
bc.init(0);
bd.init(1);
bb.point.fillColor = "red";
bd.point.fillColor = "red";

var braxes = new Axes();
braxes.labels = [
    [-4, 1, 4],
    [-4, 1, 4]
]
braxes.ticks = [
    [-4, 1, 4],
    [-4, 1, 4]
]

var tgrid = new TGrid([1, 0], [0, 1]);
graph.addPlotable(tgrid);

var polygon = new Polygon([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1]
]);
polygon.fillColor = "skyblue";
polygon.strokeColor = "gray";
graph.addPlotable(polygon);
graph.addPlotable(braxes);

var v1 = new Vector(1, 0);
v1.fillColor = "blue";
var v2 = new Vector(0, 1);
v2.fillColor = "red";
graph.addPlotable(v1);
graph.addPlotable(v2);

graph_update();
