
var AceEditSession = require("ace/edit_session").EditSession;
var AceUndoManager = require("ace/undomanager").UndoManager;

function NewPage(name, text, id, isdirty, isnamed, isdir)
{
	this.name = name;
	this.text = text;
	this.p_id = id;
	this.isdirty = isdirty;
	this.isnamed = isnamed;
	this.is_dir = isdir;
	this.ace_session = new AceEditSession(text);
	this.ace_session.setUseWorker(false);
    this.ace_session.setMode("ace/mode/javascript");
	this.ace_session.setUndoManager(new AceUndoManager());
	this.ace_session.on('change', on_code_text_change);
}

var server_pages = new Array();
var pages = new Array( /*new NewPage("Page 1","",-1, false, false,false)*/);
var curpage=-1;
var new_index = 1;

function SelectPage(index)
{
	if (index>=pages.length)
		return;

	if(curpage!=-1)
	{
		$('#pages_btn'+curpage).attr('class', '');
	}

	ace_editor.setSession(pages[index].ace_session);
	ace_editor.focus();
	$('#pages_btn'+index).attr('class', 'tabActiveHeader3');

	curpage = index;
}

function EnsureVisibility(index)
{
	if(startFit > index)
	{
		startFit = index;
		UpdatePagesButtons();
	}
	if(startFit + visiblePageCount <= index )
	{
		startFit = index - visiblePageCount+1;
		UpdatePagesButtons();
	}
}

function AddNewPage()
{
	pages.push(new NewPage( "Page "+new_index, "", -1, false, false, false));
	new_index++;

	startFit = pages.length-1;
	UpdatePagesButtons(pages.length-1);
	SelectPage(pages.length-1);
}

function RemovePage(index)
{
	if(pages[index].isdirty && !confirm("Page is not saved. Are you sure to close?"))
	{
		return;
	}

	pages.splice(index, 1);

	UpdatePagesButtons();

	if (curpage>index)
	{
		curpage--;
	}
	else if (curpage == index)
	{
		curpage=-1;
		if (pages.length == 0)
			OpenPageText("", "Page " + new_index++);
		SelectPage(index== 0? 0 :index-1);
		return;
	}

	SelectPage(curpage);

}

function OpenPageText(text, name)
{
	if (!name)
	{
		name = "Page " + new_index;
		new_index++;
		pages.push( new NewPage(name, text, -1, false, false, false) );
	}
	else
		pages.push( new NewPage(name, text, -1, false, true, false) );

	EnsureVisibility(pages.length-1);
	SelectPage(pages.length-1);
}

function OpenPage(serverindex)
{
	for(var i=0;i<pages.length;i++)
	{
		if(pages[i].name == server_pages[serverindex].name &&
			pages[i].p_id == server_pages[serverindex].p_id)
		{
			SelectPage(i);
			return;
		}
	}
	pages.push( new NewPage(server_pages[serverindex].name, server_pages[serverindex].text, server_pages[serverindex].p_id, false, server_pages[serverindex].isnamed, false) );

	EnsureVisibility(pages.length-1);
	SelectPage(pages.length-1);
}


var startFit = 0;
var visiblePageCount;
function UpdatePagesButtons()
{
	var numfit = Math.floor(($("#pagesToolbarCont").width()-80)/96);
	var isFitNeeded = pages.length > numfit;
	visiblePageCount = pages.length > numfit ? numfit : pages.length;

	var html = "";
	if (isFitNeeded)
		html = "<ul><button class='' style='float:left;' onclick='startFit--;UpdatePagesButtons();SelectPage(curpage);'><</button>";
	else
		html = "<ul>"
	$("#pagesToolbarCont").text("");

	var width = ($("#pagesToolbarCont").width()-40) / pages.length - 16;
	var max_char = (width/7 < 10 || isFitNeeded) ? 10 : width / 7;
	if(startFit<0)
		startFit = 0;
	while(startFit+visiblePageCount>pages.length)
		startFit--;
	for(var i=startFit;i<visiblePageCount+startFit;i++)
	{
		var name = (pages[i].name.length>max_char) ? pages[i].name.substr(0,max_char-1) + '...' : pages[i].name;
		name += pages[i].isdirty ? ' *' : '';

		if (isFitNeeded)
			html += "<li id='pages_btn" + i + "' title='";
		else
			html += "<li id='pages_btn" + i + "' style='width:" + width + "px' title='";

		// modified
		//var	title = $('#dirselect').val() == '/' ? pages[i].name : $('#dirselect').val() + '/' + pages[i].name;
		var	title =  pages[i].name;

		html += title + "' onclick='SelectPage(" + i + ")'>" + name;
		html += "<img class='' src='mathcortex/delete-icon.png' style='position:absolute;right:5px;' height='12' width='12'  onclick='RemovePage(" + i + ")'></img></li>";

	}

	if (isFitNeeded)
		html += "<button class='' style='float:left;' onclick='startFit++;UpdatePagesButtons();SelectPage(curpage);'>></button><button class='' onclick='AddNewPage()'>+</button></ul>" ;
	else
		html += "<button class='' onclick='AddNewPage()'>+</button></ul>" ;
	$("#pagesToolbarCont").append(html);

}



function UpdateWorkspace()
{
	document.getElementById('workspace_cont').innerHTML = generate_workspace();
}

/*
function deletePageClick()
{
	$('#deleteFile').text( "'" + server_pages[cur_workspace_item].name + "'");
	$('#delete_win').css('display','block');
	$('#name_win_modal').css('display','block');
}

function deleteConfirmClick()
{
	$('#delete_win').css('display','none');
	$('#name_win_modal').css('display','none');

	deletepage(server_pages[cur_workspace_item].p_id, server_pages[1].p_id);
	update_editor();
}

function renamePageClick()
{
	$('#renameFile').val(server_pages[cur_workspace_item].name);
	$('#name_win').css('display','block');
	$('#name_win_modal').css('display','block');
	$('#renameFile').select();

	$('#saveConfirm')[0].onclick = function(){ renameConfirmClick()};
}

function renameConfirmClick()
{
	server_pages[cur_workspace_item].isnamed = true;
	server_pages[cur_workspace_item].name = $('#renameFile').val();

	$('#name_win').css('display','none');
	$('#name_win_modal').css('display','none');

	mvfile( server_pages[cur_workspace_item].p_id,  $('#renameFile').val(),  server_pages[1].p_id);

}
*/

/*
function copyPageClick()
{
	if (server_pages[cur_workspace_item].is_dir)
	{
		status_print("Directory copy is not supported yet.");
		return;
	}
	$('#renameFile').val(server_pages[cur_workspace_item].name);
	$('#name_win').css('display','block');
	$('#name_win_modal').css('display','block');
	$('#renameFile').select();

	$('#saveConfirm')[0].onclick = function(){ copyConfirmClick()};
}

function copyConfirmClick()
{
	$('#name_win').css('display','none');
	$('#name_win_modal').css('display','none');

	server_pages[cur_workspace_item].isnamed = true;

	if (server_pages[cur_workspace_item].name == $('#renameFile').val())
	{
		status_print("Can not copy onto itself.");
		status_close(4000);
		return;
	}
	var copyPage = new NewPage($('#renameFile').val(), server_pages[cur_workspace_item].text, -1, false, true, false);
	savepage(copyPage, server_pages[1].p_id, $('#renameFile').val());
}

function savepageClick()
{
	if (server_pages.length < 2 || server_pages[1].p_id == -1)
	{
		status_print("You need to login to save.");
		status_close(4000);
		return;
	}

	$('#saveConfirm')[0].onclick = function(){ saveConfirmClick()};
	pages[curpage].text = pages[curpage].ace_session.getValue();
	if( !pages[curpage].isnamed)
	{
		$('#renameFile').val(pages[curpage].name);
		$('#name_win').css('display','block');
		$('#name_win_modal').css('display','block');
		$('#renameFile').select();
	}
	else
	{
		savepage(pages[curpage], server_pages[1].p_id, pages[curpage].name);
	}
}

function saveConfirmClick()
{
	$('#name_win').css('display','none');
	$('#name_win_modal').css('display','none');

	savepage(pages[curpage], server_pages[1].p_id, $('#renameFile').val());
}
*/

/*
function mkdirClick()
{
	$('#renameFile').val(pages[curpage].name);
	$('#name_win').css('display','block');
	$('#name_win_modal').css('display','block');
	$('#renameFile').select();

	$('#saveConfirm')[0].onclick = function(){
		$('#name_win').css('display','none');
		$('#name_win_modal').css('display','none');
		mkdir(server_pages[1].p_id);
		};
}


function mkdir(dir_id)
{
	$.post("pages_service.php?cmd=new", { key:555 ,text: '' , name:$('#renameFile').val() , dir_id: dir_id, is_dir:true})
			.done(function(data) {
				if (data=="fail")
				{
					status_print("Error could not save to server : " + data);
					status_close(4000);
				}
				else
				{
					try
					{
						var responseJson = JSON.parse(data);
					}
					catch(err)
					{
						status_print("Error could not add directory : " + data);
						status_close(4000);
						console_print(data);
						return;
					}
					var id = responseJson[0];
					status_print('New directory inserted : ' + id);
					server_pages.push( { name: $('#renameFile').val(), text: 'invalid', p_id: id, isnamed:true, is_dir:true});
					UpdateWorkspace();

					status_close(2500);
				}
			});
}
*/

/*
function mvfile(src_id, destpath, cur_dir_id)
{
	$.get("pages_service.php?cmd=mvfile", { key:555 ,src_file_id: src_id, destpath: destpath, cur_dir_id : cur_dir_id, src_path_id : cur_dir_id})
			.done(function(data) {
				try
				{
					var jsonresponse = JSON.parse(data);
				}
				catch(err)
				{
					status_print("Error could not move file : " + data);
					status_close(4000);
					console_print(data);
					return;
				}

				var target_dir = jsonresponse[0];
				var name = jsonresponse[1];
				if( !isNaN( target_dir ))
				{
					status_print("File move success: " + name  + '  ' + target_dir);
					status_close();

					if (target_dir != server_pages[1].p_id)
					{
						server_pages.splice(cur_workspace_item,1);
						UpdateWorkspace();
					}
					else
					{
						server_pages[cur_workspace_item].name = name;
						UpdateWorkspace();

						for(var i=0;i<pages.length;i++)
							if(pages[i].p_id == server_pages[cur_workspace_item].p_id)
							{
								pages[i].name = server_pages[cur_workspace_item].name;
								UpdatePagesButtons();
								SelectPage(curpage);
								break;
							}
					}

				}
				else
				{
					status_print("Error could not move file : " + data);
					status_close(4000);
				}
			});
}
*/

function on_code_text_change()
{
	if( !pages[curpage].isdirty)
	{
		pages[curpage].isdirty = true;
		UpdatePagesButtons();
		SelectPage(curpage);
	}
}

function status_print(text)
{
	var statusElm = $('#status');

	if (statusElm.css('display') == 'none')
	{
		statusElm.fadeIn('fast');
	}

	$('#statusText').text(text);
}

function status_close(time)
{
	if (!time)
		time = 1000;

	setTimeout( function(){$('#status').fadeOut('slow')}, time);
}

///////////// server communication via ajax

/*
function savepage(page, dir_id, new_name){
	status_print('Saving...');

	if( page["p_id"]!=-1)
	{
		$.post("pages_service.php?cmd=save", { id: page["p_id"], key:555 ,text: page.text , name:page.name  })
			.done(function(data) {
			if (data=="success")
			{
				status_print('Save success');
				page.isdirty = false;
				for(var i=0; i < server_pages.length;i++)
				{
					if(server_pages[i].p_id == page.p_id)
						server_pages[i].text = page.text;
				}
				UpdatePagesButtons();
				SelectPage(curpage);
				UpdateWorkspace();
				status_close();
			}
			else
			{
				status_print("Error could not save to server : " + data);
				status_close(4000);
			}
			});
	}
	else
	{
		var datajson;
		var basename;
		if (new_name.lastIndexOf('/') != -1)
		{
			datajson = { key:555 ,text: page.text , fullpath: new_name};
			basename = new_name.substr(new_name.lastIndexOf('/')+1);
		}
		else
		{
			datajson = { key:555 ,text: page.text , name: new_name , dir_id: dir_id};
			basename = new_name;
		}

		$.post("pages_service.php?cmd=new", datajson)
			.done(function(data) {
			if (data=="fail")
			{
				status_print("Error could not save to server : " + data);
				status_close(4000);
			}
			else
			{
				try
				{
					var responseJson = JSON.parse(data);
				}
				catch(err)
				{
					status_print("Error could not add file : " + data);
					status_close(4000);
					console_print(data);
					return;
				}

				var id = responseJson[0];
				if( !isNaN( responseJson[0] ))
				{
					var target_dir = responseJson[1];
					status_print('New page inserted : ' + id + ' ' + target_dir);
					page.p_id = id;
					page.name = basename;
					page.isnamed = true;
					if (dir_id == target_dir)
					{
						server_pages.push( { name: page.name, text: page.text, p_id: page.p_id, isnamed:true});
						UpdateWorkspace();
					}

					page.isdirty = false;
					UpdatePagesButtons();
					SelectPage(curpage);
					status_close(2500);
				}
			}
			});
	}
}

function deletepage(id, dir_id){
	if(id!=-1)
	{
		status_print("Deleting Page : '" + server_pages[cur_workspace_item].name) + "'";

		$.post("pages_service.php?cmd=delete", { id: id, key:555, dir_id: dir_id })
			.done(function(data) {
			if (data=="deleted")
			{
				status_print('Page deleted.');
				UpdatePagesButtons();
				server_pages.splice(cur_workspace_item, 1);
				for(var i=0;i<pages.length;i++)
					if(pages[i].p_id == id)
						pages[i].p_id = -1;

				UpdateWorkspace();
				SelectPage(curpage);
				status_close();
			}
			else
			{
				status_print("Error could not delete page : " + data);
				status_close(4000);
			}
			});
	}
}



function changedir( dirname)
{
	//$.get("pages_service.php", {cmd:"getfileid", dir_id, server_pages[1].p_id}).done(function(data) { alert(data) });
	if (dirname != '/' && dirname[dirname.length-1] == '/')
		dirname = dirname.substring(0, dirname.length-1);

	xmlhttp.open("GET","pages_service.php?cmd=getdir&fullpath=" + encodeURIComponent(dirname), true);
	xmlhttp.send();

	xmlhttp.onreadystatechange = ongetdir;
}


var timerId = undefined;
var timerCount=0;

function ongetdir()
{
	if (xmlhttp.readyState==4 && xmlhttp.status==200)
	{
		//xmlhttp.onreadystatechange = 0;
		//document.getElementById("loginOutput").innerHTML += xmlhttp.responseText + '  :  ';
		switch (xmlhttp.responseText)
		{
		case '?waitlogin':
			if(timerCount>1)
				document.getElementById("loginStatus").innerHTML= 'Waiting : ' + timerCount;
			break;
		case '?fail':
			//document.getElementById("loginStatus").innerHTML= 'Login failed.';
			console_print("Login failed.");
			stopTimer();
			break;
		default :
			try
			{
				var response = JSON.parse(xmlhttp.responseText);
			}
			catch(err)
			{
				status_print("Could not read directory : " + xmlhttp.responseText);
				status_close(4000);
				console_print(xmlhttp.responseText);
				break;
			}

			server_pages = response["contents"];
			for(var i=0; i < server_pages.length;i++)
			{
				//document.getElementById("loginStatus").innerHTML += '<textarea>' + pages[i]["text"] + '</textarea>';
				if (server_pages[i]["name"] == undefined || server_pages[i]["name"] == "")
				{
					server_pages[i]["name"] = "Page " + new_index;
					server_pages[i].isnamed = false;
					new_index++;
				}
				else
				{
					server_pages[i].isnamed = true;
				}

				//pages.push( new NewPage(server_pages[i].name, server_pages[i].text, server_pages[i].p_id, false, server_pages[i].isnamed) );

			}

			$('#dirselect').val(response["path"]);
			if (response["user"])
			{
				$('#logout').css("display","inline");
				$('#loginrequest').css("display","none");
				$('#logoutLink').text(response["user"]+'(Logout)');
			}

			//console_print(xmlhttp.responseText);

			document.getElementById("loginStatus").innerHTML= 'Success';
			console_print("Remote directory read : '" + response["path"] + "'" + " script time : " + response["scripttime"]);
			//UpdatePagesButtons();
			//SelectPage(0);
			UpdateWorkspace();

			stopTimer();
		break;
		}
	}
}

function stopTimer()
{
	if(timerId)
		clearInterval(timerId);

	timerId = undefined;
}

var xmlhttp = new XMLHttpRequest();;
function loadRootDoc()
{
	if (timerCount == 180)
	{
		stopTimer();
		document.getElementById("loginStatus").innerHTML= 'Failed!. Timeout';
		return;
	}

	if (xmlhttp.readyState == 4 || xmlhttp.readyState ==0)
	{
		xmlhttp.open("GET","pages_service.php?cmd=getroot", true);
		xmlhttp.send();

		xmlhttp.onreadystatechange = ongetdir;
	}

	timerCount++;
}

function requestLogin()
{
	timerCount = 0;
	stopTimer();
	timerId = setInterval(loadRootDoc, 1000);
	document.getElementById("loginStatus").innerHTML = "Waiting";
}
*/