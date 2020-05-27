
var ticTime;

if (typeof globals === "undefined") {
    globals = {};
};

function _(str) {  // same name as gettext common alias http://en.wikipedia.org/wiki/Gettext
	if (globals.translate == undefined) return str;
	if (globals.translate[str] == undefined) return str;
	return globals.translate[str];
}

function toggle_output_window(){
	var control = document.getElementById('toggle_output_window');
	if (control.title == _('Reduce')) {
		document.getElementById('out_win_div').style.height ='190px';
		document.getElementById('output_win_txt').style.height ='125px';
		document.getElementById('code_txt_div').style.bottom = '190px';
		document.getElementById('toggle_output_window').title = _("Expand");
		document.getElementById('toggle_output_window').innerHTML = "~";
	} else {
		document.getElementById('out_win_div').style.height ='400px';
		document.getElementById('output_win_txt').style.height ='335px';
		document.getElementById('code_txt_div').style.bottom = '400px';
		document.getElementById('toggle_output_window').title = _("Reduce");
		document.getElementById('toggle_output_window').innerHTML = "|";
	}

}

function codeUri(code)
{
	var coded = '';
	for( var i = 0; i < code.length; i++)
	{
		switch ( code[i] )
		{
			case ' ': coded += '_';
			break;
			case '_': coded += ' ';
			break;
			case ',': coded += 'l';
			break;
			case 'l': coded += ',';
			break;
			case '=': coded += '~';
			break;
			case '~': coded += '=';
			break;
			case '!': coded += '\n';
			break;
			case '\n': coded += '!';
			break;
			case ';': coded += '-';
			break;
			case '-': coded += ';';
			break;
			default:
				coded += code[i];
		}
	}

	return coded;
}

function checkURIVariables() {
  var query = window.location.hash.substring(1);//search.substring(1);
  if (query.length>0)
	window.location.hash = "";
  var vars = query.split("&");
  var cmd, code;
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
	switch( pair[0])
	{
		case 'cmd':
			cmd = decodeURIComponent(pair[1]);
			break;
		case 'code':
			code = codeUri(decodeURIComponent(pair[1]));
			break;
	}
  }

  return {cmd : cmd, code : code};
}

function on_tutorial_change(txt)
{
	if (txt === "bas_exp")
		return "a = 4 + sin(pi / 6) * cos(pi / 4);";
	var r = document.getElementById(txt).textContent;
	if (r === undefined)
	{
		r = document.getElementById(txt).innerText;
	}
	return r;
}


function on_view_code()
{
	toggle_anim(null,$('#view_gen_code'));
	var rr = $('#view_code_btn').position().left;
	$('#view_gen_code').css('left',rr );
	$('#view_gen_code').text(compiled_js);
}

function toggle_anim( cur,nx )
{
	if( nx.css('display') == 'none')
	{
		nx.fadeIn('fast');
	}
	else
	{
		nx.fadeOut('fast');
	}
}

function dump_pages_to_localstorage()
{
	var ind = 0;
	for(var i=0;i<pages.length;i++)
		if (pages[i].p_id == -1)
		{
			localStorage["page_text" + ind] = pages[i].text;
			localStorage["page_name" + ind] = pages[i].name;
			ind++;
		}

	localStorage.removeItem("page_text"+ind);
}

var ace_editor;
function on_load_page()
{

    $('.infolink').click(function(){
		var nx = $(this).next('.expandable');
		toggle_anim($(this),nx);
    });

	$('#about2').click(function(){
		var nx = $(this).next('.header_link_exp');
		toggle_anim($(this),nx);
    });

	document.getElementById("command_win").onkeydown=cmd_on_key;

	$("#dirselect").keyup(function(event){
		if(event.keyCode == 13){
			changedir($("#dirselect").val());
		}
	});

	document.getElementById("code_txt").onkeydown = on_code_text_change;
	document.getElementById("code_txt").onchange = on_code_text_change;
	document.getElementById("code_txt").oninput = on_code_text_change;

	var queryVar = checkURIVariables();

	if(typeof(Storage)!=="undefined" && localStorage)
	{
		history_on_load();
	}

	ace_editor = ace.edit("editor");
	ace_editor.renderer.setShowGutter(false);
	ace_editor.renderer.setShowPrintMargin(false);
    ace_editor.setTheme("ace/theme/textmate");
	ace_editor.getSession().on('change', function(){ on_code_text_change()});
	ace_editor.commands.addCommand({ name: 'myCommand',   bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},  exec: savepageClick,
    readOnly: true // false if this command should not apply in readOnly mode
		});

	if (queryVar.code)
	{
		OpenPageText(queryVar.code);
	}

	if(typeof(Storage)!=="undefined" && localStorage)
	{
		var i = 0;
		while(localStorage["page_text" + i] !== undefined)
		{
			OpenPageText(localStorage["page_text" + i],localStorage["page_name" + i]);
			i++;
			new_index++;
		}

		if (i==0)
			OpenPageText(on_tutorial_change("ex_plot_lorenz"),"lorenz");
	}
	else
	{
		OpenPageText(on_tutorial_change("ex_plot_lorenz"),"lorenz");
	}

	window.onbeforeunload = function(){
		if (localStorage)
		{
			dump_pages_to_localstorage();
		}

		if (document.getElementById("loginStatus") != null ) {  // login removed in simplified French version
			for(var i=0;i<pages.length;i++)
			{
				if (pages[i].isdirty)
					return 'There are unsaved pages';
			}
		}
	}

	toggle_help_col();

	UpdatePagesButtons();
	SelectPage(0);

	window.onresize = function(){
		UpdatePagesButtons();
		SelectPage(curpage);
	}

	$.get("php/login.php?checkquicklogin").done(function(data) { if (data=='success'){loadRootDoc();} });

	$("#renameFile").keyup(function(event){
			if(event.keyCode == 13){
				$("#saveConfirm").click();
			}
	});

	$("#code_txt").keydown(function(e) {
		if(e.keyCode === 9) { // tab was pressed
			// get caret position/selection
			var start = this.selectionStart;
				end = this.selectionEnd;

			var $this = $(this);

			// set textarea value to: text before caret + tab + text after caret
			$this.val($this.val().substring(0, start)
						+ "  "
						+ $this.val().substring(end));

			// put caret at right position again
			this.selectionStart = this.selectionEnd = start + 2;

			// prevent the focus lose
			return false;
		}
	});
};

var saveTimer;
function on_code_text_change()
{
	if( !pages[curpage].isdirty)
	{
		pages[curpage].isdirty = true;
		UpdatePagesButtons();
		SelectPage(curpage);
	}

	pages[curpage].text = pages[curpage].ace_session.getValue();

	if (localStorage)
	{
		if (saveTimer)
			clearTimeout(saveTimer);

		saveTimer = setTimeout(
			function(){

				dump_pages_to_localstorage();
				saveTimer = undefined;
			},1500);
	}

	return true;
}

function cmd_on_run()
{
	console_print(">> " + document.getElementById('command_win').value);
	add_to_hist(document.getElementById('command_win').value);
	parse_m(document.getElementById('command_win').value);
	asm_execute( function(result){
		if (result)
			output_last_result();

		document.getElementById('command_win').placeholder = "";
		document.getElementById('command_win').value = "";

		update_editor();
	});
}

function cmd_on_key(e)
{
	var evt=window.event? event : e;
	var keyunicode=evt.charCode || evt.keyCode;

	if (keyunicode==13)
	{
		cmd_on_run();

		return false;
	}
	else if (keyunicode == 40)
	{
		if (history_cur < history_arr.length-1)
		{
			history_cur++;
			document.getElementById('command_win').value = history_arr[history_cur];
		}
		else if (history_cur == history_arr.length-1)
		{
			history_cur++;
			document.getElementById('command_win').value = history_cmd_saved;
		}

	}
	else if (keyunicode == 38)
	{
		if (history_cur == history_arr.length)
		{
			history_cmd_saved = document.getElementById('command_win').value;
		}
		if (history_cur > 0)
		{
			history_cur--;
			document.getElementById('command_win').value = history_arr[history_cur];
		}
	}


	return true;
}

var is_help_col_visible = undefined;
function toggle_help_col()
{
	if(is_help_col_visible === undefined)
	{
		if(typeof(Storage)!=="undefined" && localStorage)
		{
			is_help_col_visible = localStorage["is_help_col_visible"] ? localStorage["is_help_col_visible"] == "true" : true;
		}
		else
			is_help_col_visible = true;
	}
	else
	{
		is_help_col_visible = !is_help_col_visible;
		localStorage["is_help_col_visible"] = is_help_col_visible;
	}

	if (is_help_col_visible)
	{
		$('#helpcol').css('width', '15%');
		$('#middlecol').css('width', '52%');
		$('#leftcontent').fadeIn('fast');
		$('#toggle_help_span').text('}');
	}
	else
	{
		$('#helpcol').css('width', '37px');
		$('#middlecol').css('width', '63%');
		$('#leftcontent').hide();
		$('#toggle_help_span').text('{');
	}

	UpdatePagesButtons();
	SelectPage(0);
}



function update_editor()
{
	document.getElementById('var_table_cont').innerHTML = generate_var_table();//cpu_print_vars();
	//document.getElementById('workspace_cont').innerHTML = generate_workspace();
	var output_win_txt = document.getElementById('output_win_txt');
	output_win_txt.scrollTop = output_win_txt.scrollHeight;
	$('#view_gen_code').text(compiled_js);
}

function output_last_result()
{
	if (asm_reg0 == undefined)
		return;

	var style = document.getElementById('format_style').selectedIndex;
	var format = document.getElementById('pres_check').checked;

	console_print(cpu_print_a_var(asm_reg0,"ans", format, style, false));

}

function generate_var_table()
{
	var tableHtml = '<table class="tight" style="white-space:nowrap;"><tbody>';

	var style = document.getElementById('format_style').selectedIndex;
	var format = document.getElementById('pres_check').checked;

	var s="";
	for (var v in global_scope.vars)
	{
		if (!global_scope.vars.hasOwnProperty(v))
			continue;

		tableHtml += '<tr>\n';
	    var varval = global_scope.get_var_value(v);
		var type = global_scope.get_var_type(v);
		var header;

		if (type == 5)
			continue;

		else if (typeof(varval) == 'number' || typeof(varval) == 'string' || varval==undefined)
		{
			header = v ;

			if (type == 6)
			{
				s = varval + (' <i>(function)</i>');
			}
			else
				s = cpu_print_a_var(varval, v, format, style, false);

			tableHtml += '<td style="">';
			tableHtml += '<div style="min-width:230px;float:left;padding-top:3px">' + header + ' = ';
			tableHtml += '' + s + '&nbsp</div>';
			tableHtml += '<span class="icon" onclick="comp_clear_var(\'' + v + '\');update_editor();" style="cursor:pointer;font-size:14px;">x</span><br>'
			tableHtml += '</td>';
		}
		else
		{
			header = cpu_matrix_print_header(v, varval, style);

			tableHtml += '<td style=";white-space:pre">';

			if (varval.length * varval[0].length < 100)
			{
				s = asm_matrix_print(varval,format,style);
				tableHtml += '<div style="min-width:230px;float:left;padding-top:3px">' + header + '</div>';
				tableHtml += '<span class="icon" onclick="comp_clear_var(\'' + v + '\');update_editor();" style="cursor:pointer;;font-size:14px;">x</span><br>'
				tableHtml += '<br>' + s;
			}
			else
			{
				tableHtml += '<div style="min-width:230px;float:left;padding-top:3px">' + header + '';
				tableHtml += '<i>large matrix</i>&nbsp';
				tableHtml += '<button class="small white" style="padding-bottom:2px;padding-top:2px" onclick="tableviewArray( global_scope.get_var_value(\'' + v + '\' ) , ' + '\'' + v + '\' , '  + format + ' , ' + style + ' );">View</button>' +
							 '</div>' +
							 '<span class="icon" onclick="comp_clear_var(\'' + v + '\');update_editor();" style="cursor:pointer;;font-size:14px;">x</span><br>'

			}

			tableHtml += '</td>';

			}

		tableHtml += '  </tr>\n';
	}

	tableHtml += ' </tbody></table>';

	return tableHtml;

}

function history_double_click(elm)
{
	var evt=window.event? event : elm;
	var target = evt.target || evt.srcElement;
	document.getElementById('command_win').value = target.code;
	cmd_on_run();
}

function convert_old_history_format()
{
	if (localStorage.history_txt.length > 0)
	{
		var parts = localStorage.history_txt.split("\n`");
		if (parts.length == 1)
		{
			var hists = localStorage.history_txt.split("\n");
			localStorage.history_txt = "";
			for (var i = 0; i < hists.length; i++)
				localStorage.history_txt += hists[i] + "\n`";
		}
	}
}

var history_arr = new Array();
var history_cur = 0;
function history_on_load()
{
	if (localStorage.history_txt)
	{
		convert_old_history_format();
		document.getElementById('hist_txt').value = localStorage.history_txt;
		var history_arr_raw = localStorage.history_txt.split("\n`");
		for (var i = 0; i < history_arr_raw.length; i++)
		{
			if (history_arr_raw[i].length!=0)
			{
				history_arr.push(history_arr_raw[i]);
			}
		}

		for (var i = 0; i < history_arr.length; i++)
		{
			history_add_table(history_arr[i]);
		}

		history_cur = history_arr.length;
	}
}

function history_add_table(code)
{
	var table=document.getElementById("hist_table");
	var row=table.insertRow(-1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	cell1.innerHTML=code;
	cell2.innerHTML=";";

	cell1.className = 'hist_table_text';
	cell2.className = 'hist_table_tool';

	cell1.ondblclick = history_double_click;
	cell2.onclick = history_double_click;
	cell1.code = code;
	cell2.code = code;
	row.title = _("Click to evaluate");

	var hist_div = document.getElementById('hist_div')
	hist_div.scrollTop = hist_div.scrollHeight;
}

var history_cmd_saved = "";
function add_to_hist(cmd)
{
	if (cmd.length==0)
	{
		return;
	}
	document.getElementById('hist_txt').value += cmd + "\n`";

	history_add_table(cmd);

	if(typeof(Storage)!=="undefined" && localStorage)
	{
		localStorage.history_txt = document.getElementById('hist_txt').value;
	}

	history_arr.push(cmd);
	history_cur = history_arr.length;
}

function hist_clear_all()
{
	if(typeof(Storage)!=="undefined" && localStorage)
	{
		delete localStorage.history_txt;
	}

	document.getElementById('hist_txt').value = "";
	var table=document.getElementById("hist_table");
	while(table.hasChildNodes())
	{
	   table.removeChild(table.firstChild);
	}

	history_arr = new Array();
	history_cur = 0;
}

function cpu_print_a_var(var_val, var_name, format, style, header)
{
	var s="";

	if (var_val!=null)
	{
		if ( typeof(var_val) == 'number')
		{
			var fs = asm_format_number(var_val, format)

			if (header)
				s += var_name + ' = ' + fs + '\n';
			else
				s += fs;
		}
		else if ( typeof(var_val) == 'string')
		{
			if (header)
				s += var_name + ' = "' + var_val + '"\n';
			else
				s += '"' + var_val + '"';
		}
		else
		{
			if(header)
				s += cpu_matrix_print_header( var_name, var_val, style);

			if (var_val.length * var_val[0].length< 100)
				s += asm_matrix_print(var_val,format,style) +"\n";
			else
				s += '\tlarge matrix(use \'disp\')';

		}
	}
	else
	{
		s += "<i>unassigned</i>";
	}

	return s;
}

function cpu_matrix_print_header(varname, M, style)
{
	var s=varname;

	var rows = M.length;
	var cols = M[0].length;

	if (style ==1)
	{
		// m style
		var sep_b = '[';
		var sep_e = '];';
		var sep_ln = ';\n ';
		var sep_elm = ', ';

		s += '[' + rows  + ', ' + cols + '] \n';
	}
	else if (style ==2)
	{
		// c style
		var sep_b = '[[';
		var sep_e = ']];';
		var sep_ln = '],\n[ ';
		var sep_elm = ', ';

		s += '[' + rows  + '][' + cols + '] \n';
	}
	else if (style ==3)
	{
		// LaTeX style
		var sep_b = '';
		var sep_e = '';
		var sep_ln = '\\\\\n';
		var sep_elm = '& ';

		s += '[' + rows  + ', ' + cols + '] \n';
	}
	else if (style ==0)
	{
		//plain
		var sep_b = '';
		var sep_e = '';
		var sep_ln = '\n';
		var sep_elm = '\t';

		s += '[' + rows  + ', ' + cols + '] \n';
	}

	return s;
}

function plotGetArray(mat)
{
	var arr;

	if (mat.length == 1)
	{
		arr = mat[0];
	}
	else
	{
		if (mat[0].length != 1)
		{
			Error_run('Plot error. Matrix should be 1 by n or n by 1.');
		}
		else
		{
			arr = new Array(mat.length);
			for (var i=0; i< arr.length;i++)
			{
				arr[i] = mat[i][0];
			}
		}
	}

	return arr;
}

var plotVar = new Array;

var openFigures = new Array;
function closeFigures(nameid)
{
	if (typeof(nameid) == 'string')
	{
		if(nameid == 'all')
		{
			for(var i = 0 ; i < openFigures.length ; i++)
			{
				if (!openFigures[i].closed)
					openFigures[i].close();
			}

			openFigures = new Array();
		}
		else
		{
			Error_run("close : unrecognized command")
		}
	}
	else if (typeof(nameid) == 'number')
	{
		if (nameid < openFigures.length && !openFigures[nameid].closed)
		{
			openFigures[nameid].close();
		}
		else
		{
			Error_run("close : invalid figure handle")
		}
	}
}

function plotArray(mat, mat2)
{
	var arrY, arrX;

	if (mat2 == undefined)
	{
		arrY = plotGetArray(mat);
	}
	else
	{
		arrX = plotGetArray(mat);
		arrY = plotGetArray(mat2);

		if (arrX.length != arrY.length)
			console_print( 'Warning : Plot array size mismatch.');
	}


	plotVar.push(new Array());
	var ind = plotVar.length - 1;

	for (var i=0; i< arrY.length;i++)
	{
		plotVar[ind][i] = [arrX ? arrX[i] : i , arrY[i]];
	}

	var PlotWindow = window.open("html/plot.html#"+ind, "_blank", "resizable=yes,scrollbars=yes,status=yes,height=350, width=520");

	return openFigures.push(PlotWindow) - 1;
}

/* Work in progress
var canvasWidth =33;
var canvasHeight =55;
var canvasCode;
var canvasDrawFunc;
var canvasInitFunc;

function openCanvas(w, h, code, draw_func, init_func)
{
	canvasWidth = w;
	canvasHeight = h;
	canvasCode = code;
	canvasDrawFunc = draw_func;
	canvasInitFunc = init_func;

	var canvasWindow = window.open("plot/canvas.html", "_blank", "resizable=yes,scrollbars=yes,status=yes,height=" + (h+100) + ", width= "+ (w+100));
}*/

var tableVar;

function tableviewArray(arr, varname, format, style)
{
	tableVar = {arr:arr, name:varname, format:format, style:style};
	var tableWindow=window.open("html/table.html", varname, "resizable=yes,scrollbars=yes,status=no,height=320, width=620");
}

var imageVar = new Array;

function showImage(m1, m2, m3)
{
	if (m2 !== undefined)
		imageVar.push( {R : m1, G : m2, B : m3} );
	else
		imageVar.push( {R : m1, G : m1, B : m1} );

	var i = imageVar.length-1;
	var tableWindow=window.open("html/image.html#" + i, "_blank", "resizable=yes,scrollbars=yes,status=no,height=" + (imageVar[i].R.length + 65) + ", width=" + (imageVar[i].R[0].length + 30));

	return openFigures.push(tableWindow) - 1;
}

var preload_images;
function imagePreload()
{
	preload_images = new Array();
	for(var i = 0; i < preload_list.length; i++)
	{
		var img = new Image;
		img.done = false;

		preload_images.push(img);

		img.onload = function() {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			canvas.width = this.width;
			canvas.height = this.height;
			ctx.drawImage( this, 0, 0 );
			this.done = true;

			this.imgPixels = ctx.getImageData(0, 0, this.width, this.height).data;

			console_print("Image loaded : " + this.src);

			var flag = true;
			for(var i=0;i<preload_images.length;i++)
			{
				if (preload_images[i].done == false)
				{
					flag = false;
					break;
				}
			}

			if (flag)
			{
				asm_preload_finish();
			}
		}

		img.onerror = function() {
			console_print("Error: The image could not be loaded : " + this.src);
		}
	}

	for(var i = 0; i < preload_list.length; i++)
	{
		preload_images[i].src = "php/imread.php?pic=" + encodeURIComponent(preload_list[i]);
		console_print("Image loading : " + preload_list[i]);
	}
}

function imageRead(url)
{
	for(var i = 0; i < preload_list.length; i++)
	{
		if (preload_list[i] == url || preload_list_alias[i] == url)
		{
			var img = preload_images[i];

			var width = img.width;
			var height = img.height;

			var pR = new Array(height);
			for(var i=0;i < height; i++)
				pR[i] = new Array(width);

			var pG = new Array(height);
			for(var i=0;i < height; i++)
				pG[i] = new Array(width);

			var pB = new Array(height);
			for(var i=0;i < height; i++)
				pB[i] = new Array(width);


			var pos = 0;

			for(var i=0;i < height; i++)
				for(var j=0;j < width; j++)
				{
					pR[i][j] = img.imgPixels[pos++];
					pG[i][j] = img.imgPixels[pos++];
					pB[i][j] = img.imgPixels[pos++];
					pos++; // skip alpha TODO
				}
			return {R:pR, G:pG, B:pB};

		}
	}

	Error_run("Image is not in preload list.");
}

var cur_workspace_item = -1;
function SelectWorkspaceItem(index)
{
	if (cur_workspace_item !=-1)
	{
		$("#wrksp_td"+cur_workspace_item).css('background-color','');
		$("#workspace_item_btns"+cur_workspace_item).css('display','none');
	}

	if(index !=-1)
	{
		$("#wrksp_td"+index).css('background-color','#E8E8FF');
		$("#workspace_item_btns"+index).css('display','inline');
	}

	cur_workspace_item = index;
}

function generate_workspace()
{
	var html = '';
	if (server_pages.length == 0)
	{
		html += '<form action="php/login.php?login" method="post" id="loginrequest" target="_blank" style="display:inline;position:absolute;top:30%;margin-left:50px" onsubmit="requestLogin()"  >';
		html += '<br><button type="submit" class="medium white" style="" >You need to login to access directory</button>';
		html += '</form>';
		return html;
	}

	html="<table><tbody>";
	for(var i=0;i< server_pages.length;i++)
	{
		if (i==1) // 1 is self, 0 is owner
			continue;
		else if (i==0)
		{
			html +="<tr ><td draggable='true'  class='highlight' id='wrksp_td" + i + "' style='padding:5px;/*background-color:#FF8*/' onclick='SelectWorkspaceItem(" + i + ")' ><a id='wrksp_pages_btn" + i + "' href='#' title='..' onclick=\"changedir(\'..\', true)\"><img src='icons/folder.png' height='12' style='position:relative;top:2px;margin-right:3px'></img>..</a>";
			html += "</td></tr>"
			continue;
		}
		if (server_pages[i].is_dir)
			html +="<tr ><td draggable='true'  class='highlight' id='wrksp_td" + i + "' style='padding:5px;/*background-color:#FF8*/' onclick='SelectWorkspaceItem(" + i + ")' ><a id='wrksp_pages_btn" + i + "' href='#' title='" + server_pages[i].name + "'" + ' onclick="changedir(\'' + server_pages[i].name + "\', false)\" ><img src='icons/folder.png' height='12' style='position:relative;top:2px;margin-right:3px'></img>" + server_pages[i].name + 	"</a>";
		else
			html +="<tr ><td draggable='true'  class='highlight' id='wrksp_td" + i + "' style='padding:5px' onclick='SelectWorkspaceItem(" + i + ")' ><a id='wrksp_pages_btn" + i + "' href='#' title='" + server_pages[i].name + "' onclick='OpenPage(" + i + ")'><img src='icons/document_num.png' height='12' style='position:relative;top:2px;margin-right:3px'></img>" + server_pages[i].name + 	"</a>";
		html +="<span id='workspace_item_btns" + i + "' style='display:none'>";
		html += '<button class="small" style="float:right;margin:-3px;border-radius:0;padding-top:1px;padding-bottom:1px;font-size:10px" onclick="deletePageClick(' + i + ')"><img style="margin-right:2px;padding-top:2px" width="12" src="icons/file-delete-icon16.png" ></img><span style="position:relative;top:-2px">Delete</span></button>';
		html += '<button class="small" style="float:right;margin:-3px;border-radius:0;padding-top:1px;padding-bottom:1px;font-size:10px" onclick="renamePageClick(' + i + ')"><img style="margin-right:2px;padding-top:2px" width="12" src="icons/document_move.png" ></img><span style="position:relative;top:-2px">Move</span></button>';
		html += '<button class="small" style="float:right;margin:-3px;border-radius:0;padding-top:1px;padding-bottom:1px;font-size:10px" onclick="copyPageClick  (' + i + ')"><img style="margin-right:2px;padding-top:2px" width="12" src="icons/page_copy.png" ></img><span style="position:relative;top:-2px">Copy</span></button>';

		html +="</span>";
		html += "</td></tr>"
	}

	html += "</tbody></table>"

	return html;
}

function showVariablePane()
{
	$('#tabVariable').attr('class', 'tabActiveHeader');
	$('#tabWorkspace').attr('class', '');

	$('#workspace_cont').css('display','none');
	$('#var_table_cont').css('display','inherit');
	$('#var_clear_all').css('display','inherit');

}

function showWorkspacePane()
{
	document.getElementById('workspace_cont').innerHTML = generate_workspace();
	$('#tabVariable').attr('class', '');
	$('#tabWorkspace').attr('class', 'tabActiveHeader');

	$('#workspace_cont').css('display','inherit');
	$('#var_table_cont').css('display','none');
	$('#var_clear_all').css('display','none');

	SelectWorkspaceItem(-1);
}

function AceSetSelection(pos_begin, pos_end)
{
	// var lengthArray = calculateCumulativeLength(editor.getSession());
	// Need to call this only if the document is updated after the last call.
	function calculateCumulativeLength(session){
		var cumLength = [];    // honestly! It took me 25 hours to notice this! *actually stands for CUMulativeLENGTH.
		var cnt = session.getLength();
		var cuml = 0, nlLength = session.getDocument().getNewLineCharacter().length;
		cumLength.push(cuml);
		var text = session.getLines(0, cnt);
		for(var i=0; i< cnt; i++){
			cuml += text[i].length + nlLength;
			cumLength.push(cuml);
		}

		return cumLength;
	}

	// Fast binary search implementation. Pass the cumulative length array here.
	function findRow(cumLength, rows, rowe, pos){
		if(rows > rowe)
			return null;

		if(rows + 1 === rowe)
			  return rows;

		var mid = Math.floor((rows + rowe) / 2);

		if(pos < cumLength[mid])
			return findRow(cumLength, rows, mid, pos);

		else if(pos > cumLength[mid])
			return findRow(cumLength, mid, rowe, pos);

		else return mid;
	}

	var cumLength = calculateCumulativeLength(ace_editor.getSession());

	var row = findRow(cumLength, 0, cumLength.length, pos_end );

	var sel = ace_editor.getSelection();
	var range = sel.getRange();
	range.setStart( row, pos_begin - cumLength[row] );
	range.setEnd( row, pos_end - cumLength[row]+1 );
	sel.setSelectionRange( range );
}
