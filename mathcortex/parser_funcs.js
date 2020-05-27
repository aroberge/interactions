// Parser for online matrix language
// Copyright (c) 2012 Gorkem Gencay. All rights reserved.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//
// Changed by André Roberge with permission from Gorkem Gencay.

"use strict";

var linked_functions = [];

function function_def(name, args, retvals, body, assignment_copy_needed)
{
	this.name = name;
	this.args = args;
	this.retvals = retvals;
	this.body = body;
	this.assignment_copy_needed = assignment_copy_needed;
}


var function_list = new Array(
new function_def("erreur", [ 4 ], [4], "	Error_run(param0);" , false),
new function_def("somme", [ 3 ], [2 ], "	asm_reg0 = numeric.sum(param0);" , false),
new function_def("det", [ 3 ], [2 ], "	asm_reg0 = numeric.det(param0);" , false),
new function_def("inv", [ 3 ], [3 ], "	asm_reg0 = numeric.inv(param0);" , false),
new function_def("trans", [ 3 ], [3 ], "	asm_reg0 = numeric.transpose(param0);" , false),
new function_def("diag", [ 3 ], [3 ], "	asm_reg0 = numeric.diag(param0[0]);" , false),
new function_def("uns", [ 2 ], [3 ], "	asm_reg0 = numeric.rep([param0,param0],1);" , false),
new function_def("uns", [ 2,2 ], [3 ], "	asm_reg0 = numeric.rep([param0,param1],1);" , false),
new function_def("zeros", [ 2 ], [3 ], "	asm_reg0 = numeric.rep([param0,param0],0);" , false),
new function_def("zeros", [ 2,2 ], [3 ], "	asm_reg0 = numeric.rep([param0,param1],0);" , false),
new function_def("rand", [ 2 ], [3 ], "	asm_reg0 = numeric.random([param0,param0]);" , false),
new function_def("rand", [ 2,2 ], [3 ], "	asm_reg0 = numeric.random([param0,param1]);" , false),
new function_def("identite", [ 2 ], [3 ], "	asm_reg0 = numeric.identity([param0]);" , false),
new function_def("linspace", [ 2,2,2 ], [3 ], "	asm_reg0 = [numeric.linspace(param0, param1, param2)];" , false),
new function_def("linspace", [ 2,2 ], [3 ], "	asm_reg0 = [numeric.linspace(param0, param1, 100)];" , false),
new function_def("svd", [3 ], [ 3,3,3 ],
'\	var r = numeric.svd(param0); \
\n\	asm_reg0 = r.U ; \
\n\	stack[asm_sp++] = asm_reg0; \
\n\	asm_reg0 = [r.S]; \
\n\	stack[asm_sp++] = asm_reg0;\
\n\	asm_reg0 = r.V;' , false),
new function_def("resoudre", [3,3], [ 3 ],
"\	if(param0.length != param0[0].length) Error_run('La matrice doit être carrée.');\
\n\	if(param0[0].length != param1.length) Error_run('Les matrices sont incompatibles.');\
\n\	asm_reg0 =  asm_util_array_to_column_matrix(numeric.solve(param0, asm_util_column_matrix_to_array(param1), false));" , false),
new function_def("lu", [3], [ 3,3 ],
"\	if(param0.length != param0[0].length) Error_run('La matrice doit être carrée.');\
\	var r = numeric.LU(param0); \
\n\	asm_reg0 = r.LU ; \
\n\	stack[asm_sp++] = asm_reg0;\
\n\	asm_reg0 = [r.P];" , false),
new function_def("cholesky", [3], [ 3 ],
"\	if(param0.length != param0[0].length) Error_run('La matrice doit être carrée.');\
\	var r = cortex.cholesky(param0); \
\n\	asm_reg0 = r; " , false),
new function_def("propre", [3], [ 3,3,3,3 ],
"\	if(param0.length != param0[0].length) Error_run('La matrice doit être carrée.');\
\n\	var r = numeric.eig(param0); \
\n\	asm_reg0 = asm_util_array_to_column_matrix(r.lambda.x); \
\n\	stack[asm_sp++] = asm_reg0;\
\n\	asm_reg0 = r.E.x;\
\n\	stack[asm_sp++] = asm_reg0;\
\n\	if(r.lambda.y != undefined) { \
\n\		console_print('La matrice a des vecteurs complexes');\
\n\		asm_reg0 = asm_util_array_to_column_matrix(r.lambda.y);\
\n\		stack[asm_sp++] = asm_reg0;\
\n\		asm_reg0 = r.E.y;\n	} else\n	{\
\n\		asm_reg0 = numeric.rep([param0.length, 1],0);\
\n\		stack[asm_sp++] = asm_reg0;\
\n\		asm_reg0 = numeric.rep([param0.length,param0.length],0);\n	}"
, false),
new function_def("plot", [3 ], [ ], "	plotArray(param0);" , false),
new function_def("plot", [3,3], [ ], "	plotArray(param0, param1);" , false),
new function_def("imshow", [3 ], [ ], "	showImage(param0);" , false),
new function_def("imshow", [3,3,3 ], [ ], "	showImage(param0,param1,param2);" , false),
new function_def("imread", [ 4 ], [ 3,3,3 ],
'\	var r = imageRead(param0); \
\n\	asm_reg0 = r.R ; \
\n\	stack[asm_sp++] = asm_reg0; \
\n\	asm_reg0 = r.G; \
\n\	stack[asm_sp++] = asm_reg0;\
\n\	asm_reg0 = r.B;' , false),
new function_def("im2bw", [ 3,2 ], [3 ],
"\	param0 = numeric.clone(param0); \
\n\	asm_util_matrix_map(param0, function(x){ return x < param1 ? 0: 255 } ); \
\n\	asm_reg0 = param0;" , false),
new function_def("nb_cols", [3], [ 2 ],
"\	asm_reg0 = param0[0].length;" , false),
new function_def("nb_lignes", [3], [ 2 ],
"\	asm_reg0 = param0.length;" , false)

);
var function_list_lib_size = function_list.length;

function FindFunctionIndex(name, args)
{
	for (var i=0; i< function_list.length; i++)
	{
		if(args.length == function_list[i].args.length && name == function_list[i].name )
		{
			var r = true;

			for(var arg_i=0;arg_i< args.length; arg_i++)
			{
				if (args[arg_i]!==function_list[i].args[arg_i])
				{
					r = false;
					break;
				}
			}

			if (r)
				return i;
		}
	}

	return -1;
}

function ErrorInvalidFunctionParam(name, args)
{
	var name_match_ind;

	var best_match_ind = -1, best_match_count = -1, is_name_match = false;

	for (var name_match_ind=0; name_match_ind< function_list.length; name_match_ind++)
	{
		if ( name == function_list[name_match_ind].name)
		{
			is_name_match = true;

			if( function_list[name_match_ind].args.length === args.length )
			{
				var c = 0;

				for(i = 0; i < function_list[name_match_ind].args.length; i++)
				{
					if (args[i]===function_list[name_match_ind].args[i])
						c++;
				}

				if (c > best_match_count)
				{
					best_match_count = c;
					best_match_ind = name_match_ind;
				}
			}
		}
	}

	if( best_match_ind !=-1 )
	{
		for(var i=0;i< function_list[best_match_ind].args.length; i++)
			if (args[i]!==function_list[best_match_ind].args[i])
				Error_p('Paramètre invalide : "' + name + '" ' + (i+1) + '. parameter.' );
	}
	else
	{
		if (is_name_match)
			Error_p("Nombre de paramètres invalide : '" + name + "'.");
		else
			Error_p("Fonction non définie : '" + name + "'.");
	}

	Error_p('Assertion imprévue.');
}

function StandartFunctions(Name, func_name, params_count, params_type)
{
	var return_types;
	EmitFuncln( 'function asm_func_' + func_name + '()');
	EmitFuncln( '{');

	var param_str = "";
	for (var i = params_count-1; i>=0; i--)
	{
		EmitFuncln( '	var param' + i + ';');
		EmitFuncln( '	asm_pop();');

		EmitFuncln( '	param' + i + ' = asm_reg0;');
		EmitFuncln('');

		if ( i==params_count-1)
			param_str += ' param' + i;
		else
			param_str += ', param' + i;
	}

	var ismath = Name.lastIndexOf(".") == -1 &&  eval('Math.' + Name);
	if(ismath)
	{
		if ( params_type[0] == 3)
		{
			//assignment_copy_needed = false
			return_types = [3];
			EmitFuncln( '	param0 = numeric.clone(param0);');
			EmitFuncln( '	asm_util_matrix_map(param0, Math.' + Name + ');');
			EmitFuncln( '	asm_reg0 = param0;');
		}
		else
		{
			return_types = [2];
			EmitFuncln( '	asm_reg0 = Math.' + Name + '(' + param_str + ');');
		}
	}
	else if ( Name =='print')
	{
		var style = 0; //document.getElementById('format_style').selectedIndex;
		var format = true; // document.getElementById('pres_check').checked;

		if ( params_count > 1)
			Error_p('print : Nombre de paramètres invalide.');

		if (params_type[0] ==3)
			EmitFuncln( '	console_print( asm_matrix_print( param0, ' + format + ' , ' + style + ') );');

		else if	(params_type[0] ==2)
			EmitFuncln( '	console_print( asm_format_number( param0, ' + format + ' , ' + style + ') );');
		else
			EmitFuncln( '	console_print( param0 );');

		return_types = [];
	}
	else
	{
		var ind = FindFunctionIndex(Name, params_type);

		if (ind==-1)
			ErrorInvalidFunctionParam(Name, params_type);
		return_types = function_list[ind].retvals;

		EmitFuncln( function_list[ind].body);
	}

	EmitFuncln( '}');
	EmitFuncln('');

	return return_types;
}

function LinkFunc(Name, params_count, params_type)
{
	var return_types;

	var func_suffix = "";
	for (var i = params_count-1; i>=0; i--)
	{
		func_suffix += params_type[i];
	}

	var func_name = Name + func_suffix;
	func_name = func_name.replace(".", "_");

	if(linked_functions[func_name] == undefined)
	{
		linked_functions[func_name] = [2];
		for (var i=0;i < function_list.length; i++)
			if (function_list[i].name == Name)
				{
					linked_functions[func_name] = [function_list[i].retvals[0]];
					break;
				}

		if (user_func_codes[Name] != undefined)
		{
			report_pos = user_func_codes_pos[Name];
			return_types = DoFunctionLink(func_name, user_func_codes[Name], params_count, params_type);
			report_pos = 0;
			rvalue[rvalue_pos] = false;
		}
		else
		{
			return_types = StandartFunctions(Name, func_name, params_count, params_type);
			rvalue[rvalue_pos] = true;
		}

		linked_functions[func_name] = return_types;
	}
	else
	{
		return_types = linked_functions[func_name];

		if( user_func_codes[Name] == undefined)
			rvalue[rvalue_pos] = true;
	}


	return return_types;
}
