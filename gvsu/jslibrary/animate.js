var dx = 4;

var td_a = document.getElementById("td_a");
var td_b = document.getElementById("td_b");
var td_c = document.getElementById("td_c");
var td_d = document.getElementById("td_d");
var td_e = document.getElementById("td_e");
var td_f = document.getElementById("td_f");

function force_int(val) {
    // this helps to reduce frustrations in trying to set up exact
    // integer values using the sliders
    if (Math.abs(Math.round(val) - val) < 0.015) {
        return Math.round(val);
    }
    return val;
}


var reset = document.getElementById("reset");
reset.onclick = function () {
	left.resetBaseTransform();
	right.resetBaseTransform();
	sliders[0].reset(1);
	sliders[1].reset(0);
	sliders[2].reset(0);
	sliders[3].reset(0);
	sliders[4].reset(1);
	sliders[5].reset(0);
	update();
}
var compose = document.getElementById("compose");
compose.onclick = function () {
	var af = getCurrentTransform();
	left.composeBaseTransform(af);
	right.composeBaseTransform(af);
	sliders[0].reset(1);
	sliders[1].reset(0);
	sliders[2].reset(0);
	sliders[3].reset(0);
	sliders[4].reset(1);
	sliders[5].reset(0);
	update();
}

var getCurrentTransform = function () {
	var matrix = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	matrix[0][0] = force_int(sliders[0].coordinate());
	matrix[0][1] = force_int(sliders[1].coordinate());
	matrix[0][2] = force_int(sliders[2].coordinate());
	matrix[1][0] = force_int(sliders[3].coordinate());
	matrix[1][1] = force_int(sliders[4].coordinate());
	matrix[1][2] = force_int(sliders[5].coordinate());

    td_a.innerHTML = Math.round(matrix[0][0] * 100) / 100.;
    td_b.innerHTML = Math.round(matrix[0][1] * 100) / 100.;
    td_e.innerHTML = Math.round(matrix[0][2] * 100) / 100.;
    td_c.innerHTML = Math.round(matrix[1][0] * 100) / 100.;
    td_d.innerHTML = Math.round(matrix[1][1] * 100) / 100.;
    td_f.innerHTML = Math.round(matrix[1][2] * 100) / 100.;

	var af = new AffineTransformation();
	af.matrix = matrix;
	return af;
}

var update = function () {
	var af = getCurrentTransform();
	left.woody.draw();
	right.setDrawTransform(af);
	right.woody.draw();
}

function ASlider(id, xpos, color) {
	this.slider = document.getElementById(id);
	this.slider.id = id;
    this.slider.color = color;
	this.slider.ctx = this.slider.getContext("2d");
	this.slider.margin = 5;
	this.deltaX = (this.slider.width - 2 * this.slider.margin) / 4.0;
	this.slider.locationX = this.slider.margin + (2 + xpos) * this.deltaX;
	this.slider.locationY = this.slider.height / 2.0;
	this.slider.moving = false;
	this.coordinate = function () {
		var coord = (this.slider.locationX - this.slider.margin) / this.deltaX -
			2.0;
		return coord
	}
	this.reset = function (xpos) {
		this.slider.locationX = this.slider.margin + (2 + xpos) * this.deltaX;
		this.slider.draw();
	}

	this.slider.onmousedown = function (event) {
		var x = event.offsetX;
		var y = event.offsetY;
		if (Math.abs(x - this.locationX) <= dx &&
			Math.abs(y - this.locationY) <= dx) {
			this.moving = true;
		} else return;
		if (x < this.margin || x > this.width - this.margin) return;
		this.locationX = x;
		this.draw();
		update();
	}

	this.slider.onmousemove = function (event) {
		if (!this.moving) return;
		var x = event.offsetX;
		var y = event.offsetY;
		if (x < this.margin || x > this.width - this.margin) return;
		this.locationX = x;
		this.draw();
		update();
	}

	this.slider.onmouseup = function (event) {
		if (!this.moving) return;
		this.moving = false;
		var x = event.offsetX;
		var y = event.offsetY;
		if (x < this.margin || x > this.width - this.margin) return;
		this.locationX = x;
		this.draw();
		update();
	}

	this.slider.draw = function () {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.beginPath();
		this.ctx.moveTo(this.margin, this.locationY);
		this.ctx.lineTo(this.width - this.margin, this.locationY);
		this.ctx.stroke();

		var deltaX = (this.width - 2 * this.margin) / 4.0;
		var xtick = this.margin;
		var tickheight = 5;
		var fontsize = 12;
		this.ctx.font = fontsize + "px Arial";
		this.ctx.textAlign = "center";

		for (var i = -2; i <= 2; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(xtick, this.locationY - tickheight);
			this.ctx.lineTo(xtick, this.locationY + tickheight);
			this.ctx.stroke();
			this.ctx.fillText(i, xtick, this.locationY + fontsize + tickheight);
			xtick += deltaX;
		}

		this.ctx.font = "14px Arial";
		this.ctx.textAlign = "left";
		this.ctx.fillText(this.id, this.margin + 5, this.locationY - 10);

		this.ctx.save();
		this.ctx.lineWidth = 2;
		this.ctx.moveTo(this.margin + 2 * deltaX, this.locationY - tickheight);
		this.ctx.lineTo(this.margin + 2 * deltaX, this.locationY + tickheight);
		this.ctx.stroke();
		this.ctx.restore();

		var x = this.locationX - dx;
		var y = this.locationY - dx;

		this.ctx.save();
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(x, y, 2 * dx, 2 * dx);
		this.ctx.strokeRect(x, y, 2 * dx, 2 * dx);
		this.ctx.restore();
	}
}

function AffineTransformation() {
	this.matrix = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	this.inverse = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	this.multiply = function (m, n) {
		var newMatrix = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				for (var k = 0; k < 3; k++) {
					newMatrix[i][j] += m[i][k] *
						n[k][j]
				}
			}
		}
		return newMatrix;
	}
	this.compose = function (af) {
		this.matrix = this.multiply(this.matrix, af.matrix);
	}
	this.translate = function (tx, ty) {
		var translate = [
			[1, 0, tx],
			[0, 1, ty],
			[0, 0, 1]
		]
		var inverseTranslate = [
			[1, 0, -tx],
			[0, 1, -ty],
			[0, 0, 1]
		]
		this.matrix = this.multiply(this.matrix, translate);
		this.inverse = this.multiply(inverseTranslate, this.inverse);
	}
	this.scale = function (sx, sy) {
		var scaling = [
			[sx, 0, 0],
			[0, sy, 0],
			[0, 0, 1]
		];
		var inverseScaling = [
			[1.0 / sx, 0, 0],
			[0, 1.0 / sy, 0],
			[0, 0, 1]
		];
		this.matrix = this.multiply(this.matrix, scaling);
		this.inverse = this.multiply(inverseScaling, this.inverse);
	}
	this.actOnPoint = function (x, y) {
		var newx = this.matrix[0][0] * x +
			this.matrix[0][1] * y +
			this.matrix[0][2];
		var newy = this.matrix[1][0] * x +
			this.matrix[1][1] * y +
			this.matrix[1][2];
		return [newx, newy];
	}
	this.inverseOnPoint = function (x, y) {
		var newx = this.inverse[0][0] * x +
			this.inverse[0][1] * y + this.inverse[0][2];
		var newy = this.inverse[1][0] * x +
			this.inverse[1][1] * y + this.inverse[1][2];
		return [newx, newy];
	}
	this.clone = function () {
		var tform = new AffineTransformation();
		var mat = [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		];
		var inv = [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		];
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				mat[i][j] = this.matrix[i][j];
				inv[i][j] = this.inverse[i][j];
			}
		}
		tform.matrix = mat;
		tform.inverse = inv;
		return tform;
	}

}

function Woody(id, color) {
	this.woody = document.getElementById(id);
    this.color = color;
    this.woody.parent = this;
	this.woody.ctx = this.woody.getContext("2d");
	var halfSize = this.woody.width / 2.0
	this.woody.transform = new AffineTransformation();
	this.woody.transform.translate(halfSize, halfSize);
	this.woody.transform.scale(1, -1);

	this.woody.baseTransform = new AffineTransformation();
	this.composeBaseTransform = function (af) {
		var newaf = new AffineTransformation();
		newaf.compose(af);
		newaf.compose(this.woody.baseTransform);
		this.woody.baseTransform = newaf;
		//	this.woody.baseTransform.compose(af);
	}
	this.resetBaseTransform = function () {
		this.woody.baseTransform = new AffineTransformation();
	}

	var scale = halfSize / 4;
	this.woody.transform.scale(scale, scale);

	this.woody.drawTransform = new AffineTransformation();
	this.setDrawTransform = function (af) {
		this.woody.drawTransform = af;
	}
	this.woody.move = function (x, y) {
		var point = this.transform.actOnPoint(x, y);
		this.ctx.moveTo(point[0], point[1]);
	}
	this.woody.line = function (x, y) {
		var point = this.transform.actOnPoint(x, y);
		this.ctx.lineTo(point[0], point[1]);
	}

	this.woody.draw = function () {
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.ctx.beginPath();
		for (var i = -4; i <= 4; i++) {
			this.move(-4, i);
			this.line(4, i);
			this.move(i, -4);
			this.line(i, 4);
		}
		this.ctx.strokeStyle = "lightgray";
		this.ctx.stroke();

		this.ctx.strokeStyle = "black";
		this.ctx.beginPath();
		this.move(-4, 0);
		this.line(4, 0);
		this.move(0, -4);
		this.line(0, 4);
		this.ctx.stroke();

		var defTransform = this.transform.clone();
		var drawTransformClone = this.drawTransform.clone();
		drawTransformClone.compose(this.baseTransform);

		this.transform.compose(drawTransformClone);
		this.ctx.save();
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = this.parent.color;

		this.transform.translate(0, 2);
		this.transform.scale(0.5, 0.5);

		// right arm
		this.ctx.beginPath();
		this.move(0, -1);
		this.line(0, -3);

		this.move(1, -1)
		this.line(-1, -3);

		this.move(0, -3);
		this.line(1, -4);

		this.move(0, -3);
		this.line(-1, -4);

		var N = 100;
		var dangle = 2 * Math.PI / N;
		var angle = 0;
		this.transform.scale(0.5, 1);
		this.move(1, 0);
		for (var i = 0; i < N; i++) {
			angle += dangle;
			this.line(Math.cos(angle), Math.sin(angle));
		}
		this.ctx.closePath();

		this.ctx.stroke();

		this.ctx.restore();
		this.transform = defTransform;

		this.ctx.strokeRect(0, 0, this.width, this.height);
	}
}

sliders = [new ASlider("a", 1, "blue"),
           new ASlider("b", 0, "blue"),
           new ASlider("e", 0, "red"),
	       new ASlider("c", 0, "blue"),
           new ASlider("d", 1, "blue"),
           new ASlider("f", 0, "red")
];
for (var i = 0; i < sliders.length; i++) {
	sliders[i].slider.draw();
}

var left = new Woody("left", "blue");
var right = new Woody("right", "black");
left.woody.draw();
right.woody.draw();
