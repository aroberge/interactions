// By André Roberge
// andre.roberge@gmail.com
// Feedback always welcome! :-)
//
// Originally adapted, but greatly modified, from two tutorials by Simon Harris
// http://simonsarris.com/blog/510-making-html5-canvas-useful
// http://simonsarris.com/blog/225-canvas-selecting-resizing-shape
//



// the following is to draw dashed line; code from
// http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas

var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;

CP.dashedLine = function(x, y, x2, y2, da) {
    if (!da) {
        da = [10,5];
    }
    this.save();
    var dx = (x2-x), dy = (y2-y);
    var len = Math.sqrt(dx*dx + dy*dy);
    var rot = Math.atan2(dy, dx);
    this.translate(x, y);
    this.moveTo(0, 0);
    this.rotate(rot);
    var dc = da.length;
    var di = 0, draw = true;
    x = 0;
    while (len > x) {
        x += da[di++ % dc];
        if (x > len) {
            x = len;
        }
        if(draw) {
            this.lineTo(x, 0);
        } else {
            this.moveTo(x, 0);
        }
        draw = !draw;
    }
    this.restore();
};

// adapted from http://stackoverflow.com/questions/8211745/draw-an-arrow-on-html5-canvas-between-two-objects
CP.arrow = function arrow(x1, y1, x2, y2, size){
  this.save();

  // Rotate the context to point along the path
  var dx = x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
  this.translate(x2,y2);
  this.rotate(Math.atan2(dy,dx));

  // line
  this.lineCap = 'round';
  this.beginPath();
  this.moveTo(0,0);
  this.lineTo(-len,0);
  this.closePath();
  this.stroke();

  // arrowhead
  this.beginPath();
  this.moveTo(0,0);
  this.lineTo(-size,-size);
  this.lineTo(-size, size);
  this.closePath();
  this.fill();

  this.restore();
};


function OpticalComponent (x, canvas_width, canvas_height, ctx){
    this.x = x;
    this.ctx = ctx;
    // the following two variables are used for drawing objects and images
    this.min_width = 2;
    this.height_to_width_ratio = 7;
    //
    this.optical_axis = canvas_height/2;
    this.world_height = canvas_height;
    this.world_width = canvas_width;
    //
    this.delta_x = 0;
    this.delta_y = 0;
    this.moveable = false;
    this.resizable = false;
    this.outlineWidth = 4;
    this.primary_focal_color = "red";
    this.secondary_focal_color = "orange";
    this.center_curvature_color = "maroon";
    this.center_color = "purple";
}

OpticalComponent.prototype.update = function (resizing) {
    if (resizing){
        this.resize_vertically();
    } else {
        this.move_horizontally();
    }
    // regardless of which motion type occurred, it's better to be safe and
    // reset both values to zero.
    this.delta_x = 0;
    this.delta_y = 0;
};

OpticalComponent.prototype.draw_ray = function (x1, y1, x2, y2, ray_type){
    var size = 7;
    this._draw_solid = function(x1, y1, x2, y2){
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.arrow(x1, y1, (x2+x1)/2, (y2+y1)/2, size);
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = "round";  // makes nicer joints than default
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    };
    this._draw_dashed = function(x1, y1, x2, y2, ray_type){
        var dash_type;
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        dash_type = (ray_type === "come from") ? [10, 5] : [3, 3];
        this.ctx.dashedLine(x1, y1, x2, y2, dash_type);
        this.ctx.stroke();
    };
    switch (ray_type) {
        case "center" :
            this.ctx.strokeStyle = this.center_color;
            this._draw_solid(x1, y1, x2, y2);
            break;
        case "center come from":
            this.ctx.strokeStyle = this.center_color;
            this._draw_dashed(x1, y1, x2, y2, "come from");
            break;
        case "center towards":
            this.ctx.strokeStyle = this.center_color;
            this._draw_dashed(x1, y1, x2, y2);
            break;
        case "primary focal":
            this.ctx.strokeStyle = this.primary_focal_color;

            this._draw_solid(x1, y1, x2, y2);
            break;
        case "primary focal come from":
            this.ctx.strokeStyle = this.primary_focal_color;
            this._draw_dashed(x1, y1, x2, y2, "come from");
            break;
        case "primary focal towards":
            this.ctx.strokeStyle = this.primary_focal_color;
            this._draw_dashed(x1, y1, x2, y2);
            break;
        case "secondary focal":
            this.ctx.strokeStyle = this.secondary_focal_color;
            this._draw_solid(x1, y1, x2, y2);
            break;
        case "secondary focal come from":
            this.ctx.strokeStyle = this.secondary_focal_color;
            this._draw_dashed(x1, y1, x2, y2, "come from");
            break;
        case "secondary focal towards":
            this.ctx.strokeStyle = this.secondary_focal_color;
            this._draw_dashed(x1, y1, x2, y2);
            break;
        case "curvature center":
            this.ctx.strokeStyle = this.center_curvature_color;
            this._draw_dashed(x1, y1, x2, y2);
            break;
        default:  // diagnostic
            console.log("ray_type from draw_ray ", ray_type);
            this.ctx.strokeStyle = "black";
            this._draw_solid(x1, y1, x2, y2);
    }
};

OpticalComponent.prototype._line = function (x1, y1, x2, y2){
    var m = (y2-y1)/(x2-x1);
    return {"slope": m, "intercept": y1-m*x1};
};

OpticalComponent.prototype.is_lens = function(){
    this.moveable = true;
    this.h = this.world_height-2;
    this.y = 1;
    this.w = 20;
    this.focal_length = 100.001;  // set it at a value slightly different from an integer to avoid NaN
    this.lens = true;  // false for mirrors
    this.sign = 1;  // -1 for mirror
    this.mirror = false;
    this.lineWidth = 1;
    this._move = function (){
        this.primary_focal_point.x += this.delta_x;
        this.secondary_focal_point.x += this.delta_x;
        this._object._update_params();
    };
    this._update_text = function(){
        try{
            $("span.lens").html("lens");
            $("span.dela").html("de la");
            $("span.une").html("une");
            $("span.elle").html("elle");
            $("span.lentille").html("lentille");
            $("#focal-length").html(Math.round(this.focal_length));
            $("#longueur-focale").html(Math.round(this.focal_length));
            if (this.focal_length > 0){
                $("#f-sign").html("positive");
                $("#f-signe").html("positive");
                $("#converging").html("converging");
                $("#convergente").html("convergente");
            } else {
                $("#f-sign").html("negative");
                $("#f-signe").html("négative");
                $("#converging").html("diverging");
                $("#convergente").html("divergente");
            }
        }catch(e){} // ignore
    };
    this._draw = function(selected, hovering){
        this.draw_principal_rays();
        this.fill = hovering ?  "rgba(127, 127, 127, 0.5)" : 'rgba(127, 255, 212, .5)';
        this.stroke = selected ?  "black" : 'rgb(64, 200, 200)';
        this.ctx.beginPath();
        if (this.focal_length > 0){
            this.ctx.moveTo(this.x, this.y);
            this.ctx.quadraticCurveTo(this.x - this.w, this.optical_axis, this.x, this.h);
            this.ctx.quadraticCurveTo(this.x + this.w, this.optical_axis, this.x, this.y);
        } else{
            this.ctx.moveTo(this.x - this.w/2, this.y);
            this.ctx.quadraticCurveTo(this.x + this.w/2, this.optical_axis, this.x - this.w/2, this.h);
            this.ctx.lineTo(this.x + this.w/2, this.h);
            this.ctx.quadraticCurveTo(this.x - this.w/2, this.optical_axis, this.x + this.w/2, this.y);
            this.ctx.lineTo(this.x - this.w/2, this.y);
        }
        this.ctx.fillStyle = this.fill;
        this.ctx.strokeStyle = this.stroke;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.fill();
        this.ctx.stroke();
    };
};

OpticalComponent.prototype.is_mirror = function(){
    this.moveable = true;
    this.h = this.world_height-2;
    this.y = 1;
    this.w = 20;
    this.focal_length = this.world_width/10;
    this.radius = 2*this.focal_length;
    this.lens = false;
    this.sign = -1;  // +1 for lens
    this.mirror = true;
    this.convergent = true;
    this.lineWidth = 1;
    //
    this._move = function (){
        this.primary_focal_point.x += this.delta_x;
        this.mirror_center.x += this.delta_x;
        this._object._update_params();
    };
    this._update_text = function(){
        try{
            $("span.lens").html("mirror");
            $("span.dela").html("du");
            $("span.une").html("un");
            $("span.lentille").html("miroir");
            $("#focal-length").html(Math.round(this.focal_length));
            $("#longueur-focale").html(Math.round(this.focal_length));
            if (this.focal_length > 0){
                $("#f-sign").html("positive");
                $("#f-signe").html("positive");
                $("#converging").html("concave");
                $("#convergente").html("concave");
            } else {
                $("#f-sign").html("negative");
                $("#f-signe").html("négative");
                $("#converging").html("convex");
                $("#convergente").html("convexe");
            }
        }catch(e){} // ignore
    };
    this._draw = function(selected, hovering){
        this.draw_principal_rays_mirror();
        this.fill = hovering ?  "rgba(127, 127, 127, 0.5)" : 'rgba(127, 255, 212, .5)';
        this.stroke = selected ?  "black" : 'rgb(64, 200, 200)';
        this.ctx.beginPath();
        this.ctx.lineWidth = this.lineWidth;
        if (this.focal_length < 0){
            this.ctx.moveTo(this.x + this.w, this.y);
            this.ctx.arcTo(this.x, this.y, this.x, this.h-this.w, this.w);
            this.ctx.lineTo(this.x, this.h-this.w);
            this.ctx.arcTo(this.x, this.h, this.x+this.w, this.h, this.w);
            this.ctx.lineTo(this.x + this.w, this.y);
        } else{
            this.ctx.moveTo(this.x + this.w, this.y);
            this.ctx.lineTo(this.x - 2*this.w, this.y);
            this.ctx.arcTo(this.x, this.y, this.x, this.h-2*this.w, 2*this.w);
            this.ctx.lineTo(this.x, this.h-2*this.w);
            this.ctx.arcTo(this.x, this.h, this.x-2*this.w, this.h, 2*this.w);
            this.ctx.lineTo(this.x + this.w, this.h);
            this.ctx.lineTo(this.x + this.w, this.y);
        }
        this.ctx.fillStyle = this.fill;
        this.ctx.strokeStyle = this.stroke;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.fill();
        this.ctx.stroke();
    };
};

OpticalComponent.prototype.is_special_point = function(source){
    this.source = source;
    this.h = 8;
    this.w = 8;
    this.y = this.optical_axis - this.h/2;
};

OpticalComponent.prototype.is_primary_focal_point = function(source){
    this.is_special_point(source);
    this.source.primary_focal_point = this;
    this.moveable = true;
    this.x = source.x + source.sign*source.focal_length;
    this.fill = this.primary_focal_color;

    this.lens_or_mirror = this.source;
    this.sign_convention = -1*this.source.sign;
    this.info_colour = "red";
    this.hoveringColor = "red";
    this.selectionColor = "yellow";
    this.info_vertical_position = this.world_height - 50.5;
    this.info_text = "f = ";

    this._move = function (){
        this.x += this.delta_x;
        this.source.focal_length = this.source.sign*(this.x - this.source.x);
        if (this.source.lens){
            this.source.secondary_focal_point.x -= this.delta_x;
        } else{
            this.source.mirror_center.x += 2*this.delta_x;
        }
        this.delta_x = 0;
        this.source._object._update_params();
    };
};

OpticalComponent.prototype.is_secondary_focal_point = function(source){
    this.is_special_point(source);
    this.source.secondary_focal_point = this;
    this.x = source.x - source.focal_length;
    this.fill = this.secondary_focal_color;
};

OpticalComponent.prototype.is_mirror_center = function(source){
    this.is_special_point(source);
    this.source.mirror_center = this;
    this.lens_or_mirror = this.source;
    this.x = source.x - 2*source.focal_length;
    this.fill = this.center_curvature_color;

    this.name = "mirror center";
    this.info_colour = "maroon";
    this.info_vertical_position = this.world_height - 70.5;
    this.info_text = "c = ";
};

OpticalComponent.prototype.is_point_source = function(){};
OpticalComponent.prototype.is_parallel_ray_source = function(){};

OpticalComponent.prototype.set_width = function(){
    this.w = Math.max(this.min_width, this.h/this.height_to_width_ratio);
};

OpticalComponent.prototype.is_object = function(lens_or_mirror) {
    this.lens_or_mirror = lens_or_mirror;
    this.primary_object = true;
    this.lens_or_mirror._object = this;
    this.moveable = true;
    this.resizable = true;
    this.h = this.world_height / 4;
    this.y = this.optical_axis - this.h;
    this.upright = true;

    this.sign_convention = 1;
    this.info_colour = "green";
    this.info_vertical_position = this.world_height - 10.5;
    this.info_text = "d_o = ";

    this.fill = "#000099";
    this.hoveringColor = "#0099ff";
    this.selectedColor = "#9900ff";
    this.handle_size = 16;
    this._draw = this.draw_arrow;
    this.set_fill = function(){
        var lingrad;
        try {
            lingrad = this.ctx.createLinearGradient(this.x-this.w, 0, this.x+this.w, 0);
            lingrad.addColorStop(0, "031");
            lingrad.addColorStop(0.25, '062');
            lingrad.addColorStop(0.5, '0f6');
            lingrad.addColorStop(0.75, '062');
            lingrad.addColorStop(1, '031');
            this.fill = lingrad;
        } catch(e) {
            this.fill = "0f6";
        }
        try{
            lingrad = this.ctx.createLinearGradient(this.x-this.w, 0, this.x+this.w, 0);
            lingrad.addColorStop(0, "093");
            lingrad.addColorStop(0.25, '093');
            lingrad.addColorStop(0.5, 'fff');
            lingrad.addColorStop(0.75, '093');
            lingrad.addColorStop(1, '093');
            this.hoveringColor = lingrad;
        }catch (e) {
            this.hoveringColor = "fff";
        }
        try {
            lingrad = this.ctx.createLinearGradient(this.x-this.w, 0, this.x+this.w, 0);
            lingrad.addColorStop(0, "999");
            lingrad.addColorStop(0.25, '999');
            lingrad.addColorStop(0.5, 'fff');
            lingrad.addColorStop(0.75, '999');
            lingrad.addColorStop(1, '999');
            this.selectedColor = lingrad;
        } catch (e) {
            this.selectionColor = "fff";
        }
    };
    this._update_text = function(){
        var d_o;
        d_o = this.lens_or_mirror.x - this.x;
        try{
            $("#d-objet").html(d_o);
            $("#d-object").html(d_o);
            if (d_o > 0){
                $("#o-reel").html("réel");
                $("#o-real").html("real");
                $("#d-o-signe").html("positive");
                $("#d-o-sign").html("positive");
            } else {
                $("#o-reel").html("virtuel");
                $("#o-real").html("virtual");
                $("#d-o-signe").html("négative");
                $("#d-o-sign").html("negative");
            }
        }catch(e){} // ignore
    };
    this._move = function(){
        this.x += this.delta_x;
        this.delta_x = 0;
        this._update_params();
    };
    this._update_params = function(){
        var dist_obj, dist_imag, f, obj_height;
        dist_obj = this.lens_or_mirror.x - this.x;
        f = this.lens_or_mirror.focal_length;
        dist_imag = 1.0/( 1.0/f - 1.0/dist_obj);
        this.image.x =  this.lens_or_mirror.sign*dist_imag + this.lens_or_mirror.x;
        if (this.upright){
            obj_height = this.h;
        } else {
            obj_height = -this.h;
        }
        this.image.set_height(- obj_height * dist_imag / dist_obj);
        this.image.set_width();
        this.set_fill();
    };
    this.set_width();
    this.set_fill();
};

OpticalComponent.prototype.is_image = function(source){
    this.source = source;   // object or primary image
    this.source.image = this;
    this.primary_image = false;
    if (source.primary_object){
        this.primary_image = true;
    }
    this.h = this.world_height / 4;
    this.upright = true;
    this.y = this.optical_axis - this.h;
    this.upright = true;

    this.sign_convention = -1;
    this.lens_or_mirror = this.source.lens_or_mirror;
    this.info_colour = "blue";
    this.info_vertical_position = this.world_height - 30.5;
    this.info_text = "d_i = ";

    this._update_text = function(){
        var d_i, d_o, m, infinity;
        infinity = false;
        d_i = -this.source.lens_or_mirror.sign * Math.round(this.source.lens_or_mirror.x - this.x);
        d_o = Math.round(this.source.lens_or_mirror.x - this.source.x);
        m = -(d_i/d_o).toPrecision(3);
        try{
            if (d_i < -1e5){
                $("#d-image").html("-&infin;");
                $("#d-image-fr").html("-&infin;");
                infinity = true;
            } else if (d_i > 1e5){
                $("#d-image").html("&infin;");
                $("#d-image-fr").html("&infin;");
                infinity = true;
            } else {
                $("#d-image").html(d_i);
                $("#d-image-fr").html(d_i);  //∞
            }
            if (d_i > 0){
                $("#i-reel").html("réelle");
                $("#i-real").html("real");
                $("#d-i-signe").html("positive");
                $("#d-i-sign").html("positive");
            } else {
                $("#i-reel").html("virtuelle");
                $("#i-real").html("virtual");
                $("#d-i-signe").html("négative");
                $("#d-i-sign").html("negative");
            }
            if (infinity){
                if (m > 0){
                    $("#magnification").html("&infin;");
                    $("#agrandissement").html("&infin;");
                } else {
                    $("#magnification").html("-&infin;");
                    $("#agrandissement").html("-&infin;");
                }
            } else{
                $("#magnification").html(m);
                $("#agrandissement").html(m);
            }
            if (m > 0){
                $("#m-positif").html("positif");
                $("#m-positive").html("positive");
                $("#m-meme").html("même que");
                $("#m-same").html("same as");
            } else {
                $("#m-positif").html("négatif");
                $("#m-positive").html("negative");
                $("#m-meme").html("l'opposée de");
                $("#m-same").html("inverse of");
            }
            if (Math.abs(m)> 1){
                $("#m-greater").html("greater");
                $("#m-greater2").html("greater");
                $("#m-grande").html("grande");
                $("#m-grande2").html("grande");
            } else {
                $("#m-greater").html("smaller");
                $("#m-greater2").html("smaller");
                $("#m-grande").html("petite");
                $("#m-grande2").html("petite");
            }
        }catch(e){} // ignore
    };

    this._draw = this.draw_arrow;
    this.set_fill = function(){
        var lingrad, w;
        w = this.w || 10;
        try {
            lingrad = this.ctx.createLinearGradient(Math.max(this.x-w, 0), 0, Math.min(this.x+w, this.world_width), 0);
            lingrad.addColorStop(0, "013");
            lingrad.addColorStop(0.25, '026');
            lingrad.addColorStop(0.5, '9ff');
            lingrad.addColorStop(0.75, '026');
            lingrad.addColorStop(1, '013');
            this.fill = lingrad;
        } catch (e){
            this.fill = "9ff";
        }
    };
    this.set_height = function(h){
        this.set_fill();
        if (h < 0){
            this.h = -h;
            this.y = this.optical_axis;
            this.upright = false;
        } else{
            this.h = h;
            this.y = this.optical_axis - this.h;
            this.upright = true;
        }
    };
    this.source._update_params();
};

OpticalComponent.prototype.draw_arrow= function (selected, hovering){

    //add a faint vertical line to locate the object
    this.ctx.strokeStyle = "#ddd";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, 0);
    this.ctx.lineTo(this.x, this.world_height);
    this.ctx.stroke();
    ///
    if (this.info_vertical_position){
        this.draw_distance_info();
    }
    this.ctx.fillStyle = this.fill;

    if (this.x < -this.world_width || this.x > 2*this.world_width ){
        return;
    }

    if (hovering){
        this.ctx.fillStyle = this.hoveringColor;
    } else if (selected){
        this.ctx.fillStyle = this.selectedColor;
    }
    // draw the object *centered* on position x
    if (this.upright){
        this.ctx.moveTo(this.x, this.y);
        this.ctx.beginPath();
        this.ctx.lineTo(this.x-this.w, this.y+this.w);
        this.ctx.lineTo(this.x+this.w, this.y+this.w);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.fill();
        this.ctx.fillRect(this.x-this.w/2, this.y+this.w-1, this.w, Math.max(this.h-this.w, this.min_width));
    } else{
        this.ctx.moveTo(this.x, this.y+this.h);
        this.ctx.beginPath();
        this.ctx.lineTo(this.x-this.w, this.y+this.h-this.w);
        this.ctx.lineTo(this.x+this.w, this.y+this.h-this.w);
        this.ctx.lineTo(this.x, this.y+this.h);
        this.ctx.fill();
        this.ctx.fillRect(this.x-this.w/2, this.y, this.w, Math.max(this.h-this.w+1, this.min_width));
    }
};

OpticalComponent.prototype.extend_left = function(line, world_height){
    // from the parameters defining a line, we obtain a point that correspond to the line's
    // left-most value
    var m = line.slope;
    var b = line.intercept;
    var x, y;
    if (m === 0){
        x = 0;
        y = b;
    } else if (m < 0){
        if (b > world_height){
            y = world_height;
            x = (y-b)/m;
        } else {
            x = 0;
            y = b;
        }
    } else {
        if (b < 0){
            y = 0;
            x = -b/m;
        } else {
            y = b;
            x = 0;
        }
    }
    return {"x": x, "y": y};
};

OpticalComponent.prototype.extend_right = function (line, world_width, world_height){
    // from the parameters defining a line, we obtain a point that correspond to the line's
    // right-most value
    var m = line.slope;
    var b = line.intercept;
    var x, y;
    if (m === 0){
        x = world_width;
        y = b;
    } else if (m > 0){
        if (m*world_width + b > world_height){
            y = world_height;
            x = (y-b)/m;
        } else {
            x = world_width;
            y = m*world_width + b;
        }
    } else {
        if (m*world_width + b < 0){
            y = 0;
            x = -b/m;
        } else {
            x = world_width;
            y = m*world_width + b;
        }
    }
    return {"x": x, "y": y};
};

// contains and handle_contains find if the mouse can cause interaction
OpticalComponent.prototype.contains = function(mx, my) {
    // Returns true if a point is inside the shape's bounds, provided the object can be moved
    if (!this.moveable){
        return false;
    }
    return  (this.x - this.w/2 <= mx) && (this.x + this.w/2 >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
};

OpticalComponent.prototype.handle_contains = function (mx, my){
    // Returns true if a point is inside the shape's resizing handle, provided the object can be moved
    if (!this.moveable){
        return false;
    }
    if (this.upright){
        return (this.x - this.handle_size <= mx) &&
               (this.x + this.handle_size >= mx) &&
               (this.y <= my) && (this.y + this.handle_size >= my);
    } else{
        return (this.x - this.handle_size <= mx) &&
               (this.x + this.handle_size >= mx) &&
               (this.y + this.h - this.handle_size <= my) && (this.y + this.h >= my);
    }
};

// Affecting properties of objects (position, size, lens type, etc.)
OpticalComponent.prototype.move_horizontally = function () {
    if (this._move !== undefined){
        this._move();
    }
    this.x += this.delta_x;
    this.delta_x = 0;
};

OpticalComponent.prototype.resize_vertically = function (){
    if (this.upright){
        this.h -= this.delta_y;
    } else {
        this.h += this.delta_y;
    }
    this.delta_y = 0;
    if (this.h < 0){
        this.h = -this.h;
        this.upright = !this.upright;
    }

    if (this.upright){
        this.y = this.optical_axis - this.h;
    } else {
        this.y = this.optical_axis;
    }
    if (this._move){
        this._move();   // keep things in sync
    }

    this.set_width();
};

OpticalComponent.prototype.draw = function(selected, hovering) {
    if (this._update_text !== undefined){
        this._update_text();
    }
    if (this._draw !== undefined){
        this._draw(selected, hovering);
        return;
    }
    // default method for those that do not implement their private one; this way, it is easy
    // to add new object and be able to visualize them right away.

    this.ctx.fillStyle = this.fill;
    // draw the object **centered** on position x
    this.ctx.fillRect(this.x-this.w/2, this.y, this.w, Math.max(this.h, this.outlineWidth));  // ensure something is always visible
    this.ctx.lineWidth = this.outlineWidth;
    if (this.info_vertical_position){
        this.draw_distance_info();
    }
    if (this.name !== undefined  && this.name !== "mirror center"){
        if (!this.moveable){
            return;
        }
    }
    var saved_lw, saved_st;
    saved_lw = this.ctx.lineWidth;
    saved_st = this.ctx.strokeStyle;
    //add a faint vertical line to locate the object
    this.ctx.strokeStyle = "#ddd";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, 0);
    this.ctx.lineTo(this.x, this.world_height);
    this.ctx.stroke();
    this.ctx.lineWidth = saved_lw;
    this.ctx.strokeStyle = saved_st;
    ///

    if (this.name !== undefined  && this.name === "mirror center"){
        return;
    }

    if (hovering){
        this.ctx.strokeStyle = this.hoveringColor;
    }
    else if (selected){
        this.ctx.strokeStyle = this.selectionColor;
    }
    if (hovering || selected){
        this.ctx.strokeRect(this.x-this.w/2, this.y, this.w, this.h);
        this.draw_handle(this.ctx.strokeStyle);
    }
};

OpticalComponent.prototype.draw_handle = function(colour){
    if (!this.resizable){
        return;
    }

    var size = this.handle_size;
    var hx, hy;

    hx = this.x - size/2;
    if (this.upright){
        hy = this.y;
    } else {
        hy = this.y + this.h - size;
    }
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(hx, hy, size, size);
};

OpticalComponent.prototype.draw_principal_rays = function(){

    if (Math.abs(this.x - this._object.x) < 1) {  // to prevent slope too large - can crash browser
        return;
    }
    if (this.focal_length < 0 &&  Math.abs(this.x - this.focal_length - this._object.x) < 1){
        return;
    }

    var x_obj, y_obj, x_img, y_img, line, point;

    x_obj = this._object.x;
    y_obj = this._object.upright ? this._object.y : this.optical_axis + this._object.h;

    x_img = this._object.image.x;
    y_img = this._object.image.upright ? this._object.image.y : this.optical_axis + this._object.image.h;

    // ================= center ===============
    line = this._line(x_obj, y_obj, this.x, this.optical_axis);  // line through center
    point = this.extend_right(line, this.world_width, this.world_height);
    this.draw_ray(x_obj, y_obj, point.x, point.y, "center");
    if ((this.x - x_obj < this.focal_length)  || (this.focal_length < 0 && this.x < x_obj) ){
        point = this.extend_left(line, this.world_height);
        if (this.x > x_obj){
            this.draw_ray(x_obj, y_obj, point.x, point.y, "center come from");
        } else {
            this.draw_ray(point.x, point.y, x_obj, y_obj, "center");
        }
    }
    // ================= primary focal point ===============
    if (this.x > x_obj){
        this.draw_ray(x_obj, y_obj, this.x, y_obj, "primary focal");  // object to lens
        line = this._line(this.x, y_obj, this.x + this.focal_length, this.optical_axis); // lens through focal point
        point = this.extend_right(line, this.world_width, this.world_height);
        this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal");
        if (this.focal_length > 0 && this.x - x_obj < this.focal_length){
            point = this.extend_left(line, this.world_height);
            this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal come from");
        }
        if (this.focal_length < 0){
            point = this.extend_left(line, this.world_width, this.world_height);
            this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal come from");
        }
    } else {
        this.draw_ray(0, y_obj, this.x, y_obj, "primary focal"); // incoming towards lens
        this.draw_ray(x_obj, y_obj, this.x, y_obj, "primary focal towards");  // lens to object
        line = this._line(this.x, y_obj, this.x + this.focal_length, this.optical_axis); // lens through focal point
        point = this.extend_right(line, this.world_width, this.world_height);
        this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal");
        if (this.focal_length < 0){
            point = this.extend_left(line, this.world_width, this.world_height);
            this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal come from");
        }
    }
    // ================= secondary focal point ===============
    if (this.x > x_obj){
        this.draw_ray(x_obj, y_obj, this.x, y_img, "secondary focal");  // object to lens
        line = this._line(this.x, y_img, x_img, y_img);  // just a parallel line at the height of the image
        point = this.extend_right(line, this.world_width, this.world_height);
        this.draw_ray(this.x, y_img, point.x, point.y, "secondary focal");
        if (this.focal_length < 0 ){
            point = this.extend_left(line, this.world_height);
            this.draw_ray(this.x, y_img, point.x, point.y, "secondary focal come from");
            this.draw_ray(this.x, y_img, this.x - this.focal_length, this.optical_axis, "secondary focal towards");
        }
        if (this.focal_length > 0 && this.x - x_obj < this.focal_length){
            this.draw_ray(x_obj, y_obj, this.x - this.focal_length, this.optical_axis, "secondary focal towards");
            this.draw_ray(this.x, y_img, 0, y_img, "secondary focal come from");
        }
    } else {
        this.draw_ray(this.x, y_img, this.world_width, y_img, "secondary focal");
        line = this._line(x_obj, y_obj, this.x - this.focal_length, this.optical_axis);
        if (this.focal_length > 0){
            this.draw_ray(x_obj, y_obj, this.x, y_img, "secondary focal towards");
            point = this.extend_left(line, this.world_height);
            this.draw_ray(point.x, point.y, this.x, y_img, "secondary focal");
        } else  {
            this.draw_ray(this.x, y_img, x_obj, y_obj, "secondary focal towards");
            line = this._line(this.x, y_img, this.x - this.focal_length, this.optical_axis);
            point = this.extend_left(line, this.world_height);
            this.draw_ray(point.x, point.y, this.x, y_img, "secondary focal");
        this.draw_ray(this.x, y_img, 0, y_img, "secondary focal come from");
        }
    }
};

OpticalComponent.prototype.draw_principal_rays_mirror = function(){

    if (Math.abs(this.x - this._object.x) < 1) {  // to prevent slope too large - can crash browser
        return;
    }
    if (this.focal_length < 0 &&  Math.abs(this.x - this.focal_length - this._object.x) < 1){
        return;
    }

    var x_obj, y_obj, x_img, y_img, line, point, point2;

    x_obj = this._object.x;
    y_obj = this._object.upright ? this._object.y : this.optical_axis + this._object.h;

    x_img = this._object.image.x;
    y_img = this._object.image.upright ? this._object.image.y : this.optical_axis + this._object.image.h;

    // ================= center ===============
    if (this.x > x_obj) {  // real object - left of mirror
        this.draw_ray(x_obj, y_obj, this.x, this.optical_axis, "center");
        if (this._object.upright){
            line = this._line(x_obj, this.optical_axis + this._object.h, this.x, this.optical_axis);
        } else {
            line = this._line(x_obj, this.optical_axis - this._object.h, this.x, this.optical_axis);
        }
        point = this.extend_left(line, this.world_height);
        this.draw_ray(this.x, this.optical_axis, point.x, point.y, "center");
        if (x_img > this.x){
            point = this.extend_right(line, this.world_width, this.world_height);
            this.draw_ray(this.x, this.optical_axis, point.x, point.y, "center come from");
        }
    } else {
        line = this._line(x_obj, this.optical_axis + this._object.h, this.x, this.optical_axis);
        point = this.extend_left(line, this.world_height);
        if (this._object.upright){
            this.draw_ray(this.x, this.optical_axis, point.x, point.y, "center");
        } else{
            this.draw_ray(point.x, point.y, this.x, this.optical_axis, "center");
        }

        if (this.focal_length < 0  && this.x - this.focal_length < x_obj){
            line = this._line(x_img, y_img, this.x, this.optical_axis);
            point = this.extend_right(line, this.world_width, this.world_height);
            this.draw_ray(this.x, this.optical_axis, point.x, point.y, "center come from");
        }
        line = this._line(x_obj, this.optical_axis - this._object.h, this.x, this.optical_axis);
        point = this.extend_left(line, this.world_height);
        if (this._object.upright){
            this.draw_ray(point.x, point.y, this.x, this.optical_axis, "center");
        } else {
            this.draw_ray(this.x, this.optical_axis, point.x, point.y, "center");
        }

        this.draw_ray(this.x, this.optical_axis, x_obj, y_obj, "center towards");
    }

    // ================= parallel ray ===============
    if (this.x > x_obj){
        this.draw_ray(x_obj, y_obj, this.x, y_obj, "primary focal");  // object to mirror
        line = this._line(this.x, y_obj, this.x - this.focal_length, this.optical_axis); // mirror through focal point
        point = this.extend_left(line, this.world_width, this.world_height);
        this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal");
        if (this.focal_length > 0 && this.x - x_obj < this.focal_length){
            point = this.extend_right(line, this.world_height);
            this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal come from");
        }
        if (this.focal_length < 0){
            point = this.extend_right(line, this.world_width, this.world_height);
            this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal come from");
        }
    } else {
        this.draw_ray(0, y_obj, this.x, y_obj, "primary focal"); // incoming towards mirror
        this.draw_ray(x_obj, y_obj, this.x, y_obj, "primary focal towards");  // mirror to object
        line = this._line(this.x, y_obj, this.x - this.focal_length, this.optical_axis); // mirror through focal point
        point = this.extend_left(line, this.world_width, this.world_height);
        this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal");
        if (this.focal_length < 0 && x_img > this.x){
            line = this._line(this.x, y_obj, this.x - this.focal_length, this.optical_axis);
            point = this.extend_right(line, this.world_width, this.world_height);
            this.draw_ray(this.x, y_obj, point.x, point.y, "primary focal come from");
        }
    }
    // ================= ray through focal point ===============
    if (this.x > x_obj){
        this.draw_ray(x_obj, y_obj, this.x, y_img, "secondary focal");  // object to mirror
        line = this._line(this.x, y_img, x_img, y_img);  // just a parallel line at the height of the image
        point = this.extend_left(line, this.world_width, this.world_height);
        this.draw_ray(this.x, y_img, point.x, point.y, "secondary focal");
        if (this.focal_length < 0 ){
            point = this.extend_right(line, this.world_width, this.world_height);
            this.draw_ray(this.x, y_img, point.x, point.y, "secondary focal come from");
            this.draw_ray(this.x, y_img, this.x - this.focal_length, this.optical_axis, "secondary focal towards");
        }
        if (this.focal_length > 0 && this.x - x_obj < this.focal_length){
            this.draw_ray(x_obj, y_obj, this.x - this.focal_length, this.optical_axis, "secondary focal towards");
            this.draw_ray(this.x, y_img, x_img, y_img, "secondary focal come from");
        }
    } else {
        //this.draw_ray(this.x, y_img, this.world_width, y_img, "secondary focal come from");
        //line = this._line(x_obj, y_obj, this.x - this.focal_length, this.optical_axis);
        if (this.focal_length > 0){
            this.draw_ray(x_obj, y_obj, this.x, y_img, "secondary focal towards");
            point = this.extend_left(line, this.world_height);
            this.draw_ray(this.x, y_img, 0, y_img, "secondary focal");
            line = this._line(this.x, y_img, this.x - this.focal_length, this.optical_axis);
            point = this.extend_left(line, this.world_height);
            this.draw_ray(point.x, point.y, this.x, y_img, "secondary focal");
        } else  {
            this.draw_ray(this.x, y_img, x_obj, y_obj, "secondary focal towards");
            line = this._line(this.x, y_img, this.x - this.focal_length, this.optical_axis);
            point = this.extend_left(line, this.world_height);
            this.draw_ray(point.x, point.y, this.x, y_img, "secondary focal");
            this.draw_ray(this.x, y_img, 0, y_img, "secondary focal");
            if (x_img > this.x) {
                this.draw_ray(this.x, y_img, this.world_width, y_img, "secondary focal come from");
            }
        }
    }

    // mirror center
    if (x_obj !== this.x){
        line = this._line(x_obj, y_obj, this.x - 2*this.focal_length, this.optical_axis);
        point = this.extend_left(line, this.world_height);
        point2 = this.extend_right(line, this.world_width, this.world_height);
        this.draw_ray(point.x, point.y, point2.x, point2.y, "curvature center");
    }
};

OpticalComponent.prototype.draw_distance_info = function(){
    var x1, x2, y, arrow_head, mid_point;
    x1 = this.x;
    x2 = this.lens_or_mirror.x;
    mid_point = ( (x1+x2)/2 < 0)? 0 : Math.min((x1+x2)/2, this.world_width- 100);
    y = this.info_vertical_position;
    arrow_head = 5;


    this.ctx.font = "10pt Helvetica";
    this.ctx.fillStyle = this.info_colour;
    if (Math.abs(x2-x1) > 1e5){
        this.ctx.fillText(this.info_text + "∞", mid_point, y-5);
    } else {
        if (this.primary_object || !this.lens_or_mirror.lens) {
            this.ctx.fillText(this.info_text + Math.round(x2-x1), mid_point, y-5);
        } else {
            this.ctx.fillText(this.info_text + Math.round(x1-x2), mid_point, y-5);
        }

    }

    x1 = (x1>0)? Math.min(x1, this.world_width) : 0;

    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(x1, y);
    this.ctx.lineTo(x1 + arrow_head, y + arrow_head);
    this.ctx.moveTo(x1, y);
    this.ctx.lineTo(x1 + arrow_head, y - arrow_head);
    this.ctx.moveTo(x1, y);
    this.ctx.lineTo(x2, y);
    this.ctx.lineTo(x2 - arrow_head, y + arrow_head);
    this.ctx.moveTo(x2, y);
    this.ctx.lineTo(x2 - arrow_head, y - arrow_head);

    this.ctx.strokeStyle = this.info_colour;
    this.ctx.stroke();
};

//OpticalComponent.prototype.draw_parallel_rays = function(source){};  // for parallel ray source

//OpticalComponent.prototype.draw_diverging_rays = function(source){};  // for point source


function CanvasState(canvas) {
    // **** First some setup! ****
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.optical_axis = this.height/2;
    this.ctx = canvas.getContext('2d');
    this.computeOffsets();   // computes offsets related to padding, etc., to properly locate the mouse

    // **** Keep track of state! ****

    this.must_redraw = true; // when set to false, the canvas will redraw everything
    this.shapes = [];  // the collection of things to be drawn
    this.dragging = false; // Keep track of when we are dragging a shape
    this.resizing = false;
    this.selection = null;  // no shape selected; this could be turned into an array if multiples selections were needed
    this.previous_x = 0;  // reset at ...
    this.previous_y = 0;  // ... mouse down  and mouse move event


    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    var myState = this;

    canvas.addEventListener('mousedown', function(e) {myState.onMouseDown(e);}, true);
    canvas.addEventListener('mousemove', function(e) {myState.onMouseMove(e);}, true);
    canvas.addEventListener('mouseup', function(e) {myState.onMouseUp(e);}, true);

    this.interval = 30;
    setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.computeOffsets = function() {
    // This fixes mouse co-ordinate problems when there's a border or padding.
    // See getMouse for more details about its uses
    var c;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        c = document.defaultView.getComputedStyle;
        this.stylePaddingLeft = parseInt(c(canvas, null)['paddingLeft'], 10) || 0; // jshint ignore:line
        this.stylePaddingTop  = parseInt(c(canvas, null)['paddingTop'], 10) || 0; // jshint ignore:line
        this.styleBorderLeft  = parseInt(c(canvas, null)['borderLeftWidth'], 10) || 0; // jshint ignore:line
        this.styleBorderTop   = parseInt(c(canvas, null)['borderTopWidth'], 10) || 0; // jshint ignore:line
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    this.htmlTop = document.body.parentNode.offsetTop;
    this.htmlLeft = document.body.parentNode.offsetLeft;
};

CanvasState.prototype.onMouseDown = function(e) {

    var mouse = this.getMouse(e);

    // prevent the cursor from turning into a text-selection when being dragged
    e.preventDefault();

    for (var i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].contains(mouse.x, mouse.y)) {
            this.selection = this.shapes[i];
            this.previous_x = mouse.x; // sets ...
            this.previous_y = mouse.y; // ... starting point
            this.dragging = true;
            this.hovering = false;
            if (!this.selection.handle_contains(mouse.x, mouse.y)){
                $("#canvas").removeClass("selectable");
                $("#canvas").addClass("draggable");
            }
            this.must_redraw = true;
            return;
        }
    }
};

CanvasState.prototype.onMouseMove = function(e) {

    var mouse = this.getMouse(e);

    if (this.dragging){
        // accumulate the motion as we don't necessarily (re)draw every time a mouse event occurs
        this.selection.delta_x += mouse.x - this.previous_x;
        this.selection.delta_y += mouse.y - this.previous_y;
        this.previous_x = mouse.x;
        this.previous_y = mouse.y;

        this.must_redraw = true;
        this.hovering = false;
    }
    else {
        if (this.selection){      // no longer dragging; deselect and redraw
            this.selection = null;
            this.must_redraw = true;
        }
        for (var i = this.shapes.length-1; i >= 0; i--) {
            if (this.shapes[i].contains(mouse.x, mouse.y)) {
                this.selection = this.shapes[i];
                this.must_redraw = true;
                this.hovering = true;
                if (this.selection.handle_contains(mouse.x, mouse.y)){
                    $("#canvas").addClass("resizable");
                    $("#canvas").removeClass("selectable");
                    this.resizing = true;
                } else{
                    $("#canvas").addClass("selectable");
                    $("#canvas").removeClass("resizable");
                    this.resizing = false;
                }
                return;
            }
        }
      $("#canvas").removeClass("selectable");
      $("#canvas").removeClass("resizable");
    }
};

CanvasState.prototype.onMouseUp = function(e){
    this.dragging = false;
    this.resizing = false;
    $("#canvas").removeClass("draggable");
    $("#canvas").addClass("selectable");
    return true;
};

CanvasState.prototype.addShape = function(shape) {
      this.shapes.push(shape);
      this.must_redraw = true;
};

CanvasState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

CanvasState.prototype.draw = function() {
    if (this.must_redraw) {
        var hovering_over_shape, shape_selected, lingrad;
        this.clear();

        // background
        lingrad = this.ctx.createLinearGradient(0,20,0,this.height-20);
        lingrad.addColorStop(0, '#fff');
        lingrad.addColorStop(0.5, '#eee');
        lingrad.addColorStop(1, '#fff');
        this.ctx.fillStyle = lingrad;
        this.ctx.fillRect(0, 0, this.width, this.height);
        // optical axis
        this.ctx.strokeStyle = "#060";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();  // not required here, but good habit
        this.ctx.moveTo(0, this.optical_axis);
        this.ctx.lineTo(this.width, this.optical_axis);
        this.ctx.stroke();


        if (this.selection){
            this.selection.update(this.resizing);
        }

        // draw all shapes
        for (var i = 0; i < this.shapes.length; i++) {
            hovering_over_shape = false;
            shape_selected = (this.selection === this.shapes[i]);
            if (shape_selected){
                if(this.hovering){
                    hovering_over_shape = true;
                }
            }
            this.shapes[i].draw(shape_selected, hovering_over_shape);
        }

        // ** Add stuff you want drawn on top all the time here **

        this.must_redraw = false;
    }
};

CanvasState.prototype.getMouse = function(e) {
    var element = this.canvas;
    var offsetX = 0, offsetY = 0;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset (computed in ... computeOffsets() !!)
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    return {x: e.pageX - offsetX, y: e.pageY - offsetY};
};
