
function update_editor()
{
	document.getElementById('var_table_cont').innerHTML = generate_var_table();;
	document.getElementById('workspace_cont').innerHTML = generate_workspace();
	var output_win_txt = document.getElementById('output_win_txt');
	output_win_txt.scrollTop = output_win_txt.scrollHeight;
	$('#view_gen_code').text(compiled_js);
}

function output_last_result()
{
	if (asm_reg0 == undefined)
		return;

	var style = 0; //var style = document.getElementById('format_style').selectedIndex;
	var format = true; //var format = document.getElementById('pres_check').checked;

	console_print(cpu_print_a_var(asm_reg0,"ans", format, style, false));

}

function generate_var_table()
{
	var tableHtml = '<table class="tight" style="white-space:nowrap;"><tbody>';

	var style = 0; //var style = document.getElementById('format_style').selectedIndex;
	var format = true; //var format = document.getElementById('pres_check').checked;

	var s="";
	for (var v in global_scope.vars)
	{
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
			tableHtml += '<img src="mathcortex/delete-icon.png" class="var_delete_icon" height="12" width="12" onclick="comp_clear_var(\'' + v + '\');update_editor();"></img>';
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
				tableHtml += '<img src="mathcortex/delete-icon.png" class="var_delete_icon" height="12" width="12" onclick="comp_clear_var(\'' + v + '\');update_editor();"></img>';
				tableHtml += '<br>' + s;
			}
			else
			{
				tableHtml += '<div style="min-width:230px;float:left;padding-top:3px">' + header + '';
				tableHtml += '<i>matrice de grande taille</i>&nbsp';
				tableHtml += '<button class="small white" style="padding-bottom:2px;padding-top:2px" onclick="tableviewArray( global_scope.get_var_value(\'' + v + '\' ) , ' + '\'' + v + '\' , '  + format + ' , ' + style + ' );">print(<em>matrice</em>)</button>' +
							 '</div>' +
							 '<img src="mathcortex/delete-icon.png" class="var_delete_icon" height="12" width="12" onclick="comp_clear_var(\'' + v + '\');update_editor();"></img>';

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

var history_arr = new Array();
var history_cur = 0;
function history_on_load()
{
	if (localStorage.history_txt)
	{
		document.getElementById('hist_txt').value = localStorage.history_txt;
		var history_arr_raw = localStorage.history_txt.split("\n");
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
	document.getElementById('hist_txt').value += cmd + "\n";

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

	var PlotWindow=window.open("mathcortex/plot.html#"+ind, "_blank", "resizable=yes,scrollbars=yes,status=yes,height=350, width=520");

}

var tableVar;

function tableviewArray(arr, varname, format, style)
{
	// modified from original to show output in console
	console_print(asm_matrix_print(arr, true, 0));
}

var imageVar = new Array;

function showImage(m1, m2, m3)
{
	if (m2 !== undefined)
		imageVar.push( {R : m1, G : m2, B : m3} );
	else
		imageVar.push( {R : m1, G : m1, B : m1} );

	var i = imageVar.length-1;
	var tableWindow=window.open("mathcortex/image.html#" + i, "_blank", "resizable=yes,scrollbars=yes,status=no,height=" + (imageVar[i].R.length + 65) + ", width=" + (imageVar[i].R[0].length + 30));
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
		preload_images[i].src = "imread.php?pic=" + encodeURIComponent(preload_list[i]);
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
		html += '<button class="small" style="float:right;margin:-3px;border-radius:0;padding-top:1px;padding-bottom:1px;font-size:10px" onclick="deletePageClick(' + i + ')"><img style="margin-right:2px;padding-top:2px" width="12" src="icons/file-mathcortex/delete-icon16.png" ></img><span style="position:relative;top:-2px">Delete</span></button>';
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
	$('#tabVariable').attr('class', 'tabActiveHeader3');
	$('#tabWorkspace').attr('class', '');

	$('#workspace_cont').css('display','none');
	$('#var_table_cont').css('display','inherit');
	$('#var_clear_all').css('display','inherit');

}

function showWorkspacePane()
{
	document.getElementById('workspace_cont').innerHTML = generate_workspace();
	$('#tabVariable').attr('class', '');
	$('#tabWorkspace').attr('class', 'tabActiveHeader3');

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
