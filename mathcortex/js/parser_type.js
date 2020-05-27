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

"use strict";

function parse_m(code_inp)
{
	try
	{
		Init(code_inp);
	
		Program();
		compiled_js+= '\n/// Functions ///\n\n' + functions_js + ftable_function();
		
	}
	catch(err)
	{
		compiled_js = "";
		console_print_error(err.message);
		
		return false;
	}
	
	return true;
}

var Look;

var inp;
var inp_pos;
	
var end_of_prog = false;

var compiled_js = "";
var functions_js = "";

//////////////
var cur_scope; 

var scope_stack = new Array();
var user_func_codes = new Array();
var user_func_codes_pos = new Array(); // used for error reporting only
var report_pos = 0; // used for error reporting only
var last_success_pos = 0; // used for error reporting only

var global_scope = new VariableScope(true);

var const_vars=[];
var const_vars_type=[];

var ftable_funcs = [];

var types = [ "reserved", "bool", "real", "matrix", "string", "function", "functionptr", "void"];

var block_depth_level; // used for clear

var preload_list;
var preload_list_alias;

function get_lineof_current_position()
{            
	var start, end;

	for (start = inp_pos-1; start > 0 ; start--)
	{
		if (inp[start] == '\n' || inp[start] == '\r')
		{
			start++;
			break;
		}
	}

	for (end = inp_pos-1; end < inp.Length && inp[end] != '\n' && inp[end] != '\r'; end++)
	{
	}

	return inp.substring(start,end+1);
}


function console_print(s)
{
	document.getElementById('output_win_txt').innerHTML += s + "<br>";
}

function console_print_error(s)
{
	document.getElementById('output_win_txt').innerHTML += "<span style='color:red' onclick='AceSetSelection(" + (last_success_pos + report_pos-1) + "," + (inp_pos + report_pos-1) + ");ace_editor.focus();var code_elm = document.getElementById(\"code_txt\");code_elm.focus();code_elm.setSelectionRange( " + (inp_pos + report_pos- 1) + "," + (inp_pos + report_pos-1) + " )'>error : " + s + "</span><br>";
}

function console_print_run_error(s)
{
	document.getElementById('output_win_txt').innerHTML += "<span style='color:red' >-- Runtime Error: <br>error : " + s + "</span><br>";
}

function Error_p(s)
{
	//alert(s);
	//throw new Error(s + " : '" + get_lineof_current_position() + "'");
	throw new Error(s);
}

function Error_run(s)
{
	//alert(s);
	throw new Error(s);
}

///////// lexer/scanner
function GetChar()
{
	if (inp_pos < inp.length)
	{
		Look = inp.charAt(inp_pos);
		inp_pos++;
	}
	else
	{
		Look = ";";		
		end_of_prog = true;
	}
}

// dont use a lot.
function LookAhead()
{
	if (inp_pos < inp.length-1)
	{
		return inp.charAt(inp_pos);		
	}
	else
	{
		return '';
	}
}

function Match(x)
{
	if (Look != x)
	{
		Expected("'" + x + "'");
	}
	else
	{
		GetChar();
		SkipWhite();
	}
}

function PreScanAssignmentOp()
{			
	//var r =inp.search("=");
	var i;
	for (i= inp_pos; i < inp.length; i++)
	{
		if (inp.charAt(i) == '/' && inp.charAt(i+1) == '*')
			for (; i < inp.length ; i++)
				if (inp.charAt(i) == '*' && inp.charAt(i+1) == '/')
					break;
			
		if (inp.charAt(i) == ';')
			return false;
			
		if ( inp.charAt(i) == '=' )
		{
			if (IsRelop(inp.charAt(i-1), inp.charAt(i)) || inp.charAt(i+1) == '=')
			{
				return false;
			}
			return true;
		}
	}
	
	return false;
}

function CheckAhead(x)
{
	var a = inp.substring(inp_pos-1,inp_pos+x.length-1);
	if ( a== x && !IsAlNum( inp[inp_pos+x.length-1] ) )
	 return true;
	 
	return false;
}

function Expected(s)
{
	Error_p(s + " expected");
}

function Emitln(s)
{
	compiled_js += s + "\n";
}

function EmitFuncln(s)
{
	functions_js += s + "\n";
}

function SkipWhite()
{	
	while(true)
	{
		var isThereChange = false;
		
		while (Look == ' ' || Look == '\t' || Look == '\n' || Look == '\r')
		{
			GetChar();
			isThereChange = true;
		}
		
		if (Look == '/' && LookAhead()  == '/')
		{
			while( 1)
			{					
				if (end_of_prog==true)
					break;
				if (Look == '\n')
				{
					//if (Look != '/' && LookAhead()  != '/')
					{
						break;
					}
				}
				
				GetChar();
			}
			
			isThereChange = true;
		}
		
		if (Look == '/' && LookAhead()  == '*')
		{
			while( 1)
			{					
				if (end_of_prog==true)
					break;
				if (Look == '*' && LookAhead()  == '/')
				{
					GetChar();
					GetChar();
					break;
				}
				
				GetChar();
			}
			
			isThereChange = true;
		}
		
		if(isThereChange ==false)
			break;
	}
}

function IsWhite()
{
	if (Look == ' ' || Look == '\t' || Look == '\n' || Look == '\r')
		return true;
	else
		return false;
}
/*
function SkipWhiteNotRet()
{
	while (Look == ' ' || Look == '\t')
	{
		GetChar();
	}
}*/

function IsAlpha(c)
{			
	return ( (c>='a') && (c<='z')) || ((c>='A') && (c<='Z')) || c=='_';
}

function  IsAlNum(c)
{			
	return (IsAlpha(c) || ( c>='0') && (c<='9') );
}

function IsDigit(c)
{
	var code = c.charCodeAt(0);
	return ((code>=48) && (code<=57)) || code==46;
} 

function IsHexChar(c)
{
	var code = c.charCodeAt(0);
	return ((code>=48) && (code<=57)) || ( ( (c>='a') && (c<='f')) || ((c>='A') && (c<='F')) );
} 

function IsAddop(c)
{
	return c == '+' || c == '-';
}

//Recognize a Relop 
function IsRelop(c, cnext)
{
	var op = c+cnext;
	return op == '==' || op == '!=' || c == '<' || c == '>' || op == '<=' || op == '>=';
}

//Recognize a Boolean Orop
function IsOrOp(c)
{
	return c == '|';
}

function escape_string(s)
{
	var r = "";
	for(var i = 0;i < s.length; i++)
	{
		switch(s[i])
		{
			case '\n' : r += '\\n';break;
			case '\t' : r += '\\t';break;
			case '\\' : r += '\\\\';break;
			case '"' : r += '\\\"';break;
			case "'" : r += '\\\'';break;
			default: r += s[i];
		}
	}
	
	return r;
}

function GetString()
{
	var Name = "";
	
	while (Look != '"')
	{
		if (Look == '\\')
		{
			GetChar();
			switch(Look)
			{
				case 'n' : Name += '\n';break;
				case 't' : Name += '\t';break;
				case '\\' : Name += '\\';break;
				case '\"' : Name += '\"';break;
				case '\'' : Name += '\'';break;
				default: Error_p("Unrecognized escape sequence : \\" + Look );
			}
		}
		else
			Name += Look;
			
		GetChar();
	}
	
	return Name;
}

function GetName()
{
	var Name = "";

	if (!IsAlpha(Look))
		Expected("Name");

	while (IsAlNum(Look) /*|| Look == '.'*/)
	{
		Name += Look;
		
		if (Look == '.')
		{
			GetChar();
			Name += GetName();
		}
		else
			GetChar();
	}

	SkipWhite();
	return Name;
}

function GetHex()
{
	var Value = "";
	
	GetChar(); // 0
	GetChar(); // x
	
	while (IsHexChar(Look))
	{
		Value += Look;
		GetChar();
	}
	
	SkipWhite();
	return parseInt("0x" + Value);
}

function GetNum()
{
	var Value = "";
	
	if (Look == '0' && (LookAhead() == 'x' || LookAhead() == 'X'))
		return GetHex();

	if (!IsDigit(Look))
		Expected("Real number");

	while (IsDigit(Look))
	{
		Value += Look;
		GetChar();
	}
	
	if(Look=='e')
	{
		Value += Look;
		GetChar();
		if (Look=='-')
		{
			Value += Look;
			GetChar();
		}
			
		if (!IsDigit(Look))
			Error_p("Error in number format.");
		
		while (IsDigit(Look))
		{
			if (Look == '.')
				Error_p("Error in number format.");
				
			Value += Look;
			GetChar();			
		}
	}

	SkipWhite();

	return parseFloat(Value);
}

function GetMatrix()
{
	var Value = "";
	var first_sep;
	var second_sep;
	var num_cols = -1, cur_col = 0;
	var num_rows = 1;
			
	while( 1)
	{
		var type = ArithmeticExpr();
		if (type == 2)
			PushLast(type);
		else 
		{
			Error_p("Only reals allowed for matrix elements.");
		}
		
		cur_col++;
		SkipWhite();
		if (Look==',')
		{
			Match(',');			
		}
		
		if (Look==']')
		{
			if (num_cols!=-1 && num_cols !=cur_col)
			{
				Error_p("Matrix size mismatch.");
			}
		   break;
		}
		else if(Look==';')
		{
			Match(';');
			if (num_cols==-1)
			{
			   num_cols = cur_col;
			}
			else if (num_cols !=cur_col)
			{
				Error_p("Matrix size mismatch.");
			}
			
			num_rows++;
			cur_col = 0;
		};
	}
	
	num_cols = cur_col;
	
	Emitln("asm_load_matrix(" + num_rows + "," + num_cols + ");");
	rvalue[rvalue_pos] = true;
}




////////////// PARSER
function AddSubOp(top_type, op)
{
	var prefix;
	if (op=='+')
	{
		Match('+');
		prefix = 'asm_add';
	}
	else
	{
		Match('-');
		prefix = 'asm_sub';
	}
	
	var reg0_type = Term();	
	
	var opmode = top_type + "_" + reg0_type;
	
	PopReg1();
	switch(opmode)
	{
		case "2_2":
			Emitln( prefix +"_real();" );
			return 2;
		case "2_3":
			Emitln( prefix +"_rm();" );
			rvalue[rvalue_pos] = true;
			return 3;
		case "3_2":
			Emitln( prefix +"_mr();" );
			rvalue[rvalue_pos] = true;
			return 3;
		case "3_3":
			Emitln( prefix +"_mm();" );
			rvalue[rvalue_pos] = true;
			return 3;
		case "4_4":
		case "4_2":
		case "2_4":
			if(op != '-')
			{
				Emitln( "asm_str_concat();" );
				rvalue[rvalue_pos] = true;
				return 4;
			}
			break;
	}
	
	Error_p( "'" + op +"' operator is not supported for types: '" + types[top_type] + "' and '" + types[reg0_type] + "'");
}

function MulDivOpElm(top_type, op)
{
	var instruction;
	if (op == './')
	{
		Match('.');
		Match('/');
		instruction = 'asm_elm_div';
	}
	else if (op == '.*')
	{
		Match('.');
		Match('*');
		instruction = 'asm_elm_mul';
	}
	
	var reg0_type = SignedFactor();
	
	if (top_type != 3 || reg0_type != 3)
		Error_p("Matrix type required for element wise matrix operations");
	
	PopReg1();
	Emitln( instruction +"();" );
	rvalue[rvalue_pos] = true;
	return 3;
}

function MulDivOp(top_type, op)
{
	var prefix;
	if (op=='*')
	{
		Match('*');
		prefix = 'asm_mul';
	}
	else
	{
		Match('/');
		prefix = 'asm_div';
	}
	
	var reg0_type = SignedFactor();
	
	if (top_type == 2)
	{
		if (reg0_type == 2)
		{
			PopReg1();
			Emitln( prefix +"_real();" );
			return 2;
		}
		else if (reg0_type == 3)
		{
			PopReg1();
			Emitln( prefix +"_rm();" );
			rvalue[rvalue_pos] = true;
			return 3;
		}		
	}
	else if (top_type == 3)
	{
		if (reg0_type == 2)
		{
			PopReg1();
			Emitln( prefix +"_mr();" );
			rvalue[rvalue_pos] = true;
			return 3;
		}
		else if(reg0_type == 3)
		{
			if (op=='*')
			{
				PopReg1();
				Emitln( prefix +"_mm();" );
				rvalue[rvalue_pos] = true;
				return 3;
			}
			else
			{
				Error_p("Matrix division is undefined.");
				return 3;
			}
		}
	}
	
	Error_p( "'" + op +"' operator is not supported for types: '" + types[top_type] + "' and '" + types[reg0_type] + "'");
}

///////////////////////////////////////
//Parse and Translate a Relation
function BoolOp(top_type, op)
{
	
	var prefix;
	
	if (op=='||')
	{
		Match('|');
		Match('|');
		prefix = 'asm_or_bool';
	}
	else if ( op == '&&')
	{
		Match('&');
		Match('&');
		prefix = 'asm_and_bool';
	}
	else if ( op == '!')
	{
		Match('!');		
		prefix = 'asm_not_bool';
	}
	else
	{
		Error_p("Invalid bool op : '" + op + "'.");
	}
	
	var reg0_type = BoolTerm();	
	if (reg0_type!=1)
	{
		if (op != '!' || top_type!=1)
		{
			Error_p('Boolean operations are supported only for boolean type');
			return 1;
		}
	}
	
	PopReg1();
	Emitln( prefix + '();');
	
	return reg0_type;
}

function RelOp(top_type, op)
{	
	var reg0_type = ArithmeticExpr();
	
	if (reg0_type ==4 && top_type==4)
	{
		if (op=='==')
		{
			prefix = 'asm_str_eq';
		}
		else if ( op == '!=')
		{		
			prefix = 'asm_str_neq';
		}
		else
		{
			Error_p("Invalid string operator.");
		}
		
		PopReg1();
		Emitln( prefix + '();');
	
		return 1;
	}
	else if(reg0_type ==3 && top_type==3)
	{
		if (op=='==')
		{
			prefix = 'asm_matrix_eq';
		}
		else if ( op == '!=')
		{		
			prefix = 'asm_matrix_neq';
		}
		else
		{
			Error_p("Invalid matrix operator.");
		}
		
		PopReg1();
		Emitln( prefix + '();');
		return 1;
	}
	
	var prefix;
	if (op=='==')
	{
		prefix = 'asm_eq';
	}
	else if ( op == '!=')
	{		
		prefix = 'asm_neq';
	}
	else if ( op == '<')
	{
		prefix = 'asm_le';
	}
	else if ( op == '>')
	{		
		prefix = 'asm_ge';
	}
	else if ( op == '>=')
	{		
		prefix = 'asm_geq';
	}
	else if ( op == '<=')
	{		
		prefix = 'asm_leq';
	}
	else
	{
		Error_p("Invalid bool op : '" + op + "'.");
	}
	
	
	if (reg0_type !=2 || top_type!=2)
	{
		Error_p('Relational operations are supported for reals and strings.');
		return 2;
	}	
	
	PopReg1();
	Emitln( prefix + '();');
	
	return 1;
}

function Relation()
{
	var type = ArithmeticExpr();
	var r;
	if (IsRelop(Look, LookAhead() ))
	{
		PushLast(type);
		switch(Look)
		{
		case '=': 
			Match('=');
			Match('=');
			type = RelOp(type,'==');
			break;
		case '!': 
			Match('!');
			Match('=');
			type = RelOp(type,'!=');
			break;
		case '<': 
			Match('<');
			if (Look=='=')
			{
				Match('=');
				type = RelOp(type,'<=');
			}
			else
				type = RelOp(type,'<');
			break;
		case '>': 
			Match('>');
			if (Look=='=')
			{
				Match('=');
				type = RelOp(type,'>=');
			}
			else
				type = RelOp(type,'>');
			break;
		}
	}
	else
	{
		r = type;
	}
	
	return type;
}

//Parse and Translate a Boolean Factor with NOT
function NotFactor()
{
	var type;
	if (Look == '!') 
	{		
		type = BoolOp(type, '!');
	}
	else
		type = Relation();

	return type;
}

//Parse and Translate a Boolean Term
function BoolTerm()
{
	var type = NotFactor();
	while (Look == '&' && LookAhead() == '&')
	{
		PushLast(type);		
		type = BoolOp(type, '&&');
	}

	return type;
}

//Parse and Translate an Expression
function Expression()
{
	var type;
	
	type = BoolTerm();
	while (Look == '|' && LookAhead() == '|')
	{
		PushLast(type);
		type = BoolOp(type, '||');
	}
	
	return type;
}


function Term()
{
	var type;
	
	type = SignedFactor();
	while (Look == '*' || Look == '/' || (Look == '.' && LookAhead() == '*')|| (Look == '.' && LookAhead() == '/'))
	{
		PushLast(type);
		switch (Look)
		{
		case '*':
			type = MulDivOp(type,'*');
			break;
		case '/':
			type = MulDivOp(type,'/');
			break;
		case '.':
			type = MulDivOpElm(type,'.' + LookAhead() );
			break;
		default: Expected("Mulop");
			break;
		}
	}

	return type;
} 

/*function add_slashes( str ) {
    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
}*/

function Factor()
{
	var type;
		
	if (Look == '(')
	{
		Match('(');
		type = Expression();
		Match(')');
	}
	else if (IsAlpha(Look))
	{
		type = Ident();
	}
	else if (Look == '[')
	{
		Match('[');
		GetMatrix();
		Match(']');
		type = 3;
	}	
	else if (Look == '"')
	{
		type = 4;
		GetChar();
		Emitln("asm_reg0 = \"" + escape_string(GetString()) + "\";");
		Match('"');
	}	
	else
	{
		Emitln("asm_reg0 =" + GetNum() + ";");
		type = 2;
	}

	return type;
}


function SignedFactor()
{
	var type;
	
	if (Look == '+')
	{
		GetChar();
	}
	if (Look == '-') //unary
	{
		GetChar();
		if (IsDigit(Look))
		{
			var num = -GetNum(); // seems redundant code?
			Emitln("asm_reg0 = " + num +";");
			type = 2;
		}
		else
		{
			type  = Factor();
		}
	}
	else
	{
		type = Factor();
	}

	return type;
}


function FuncCall(Name, IsCmd)
{
	var count = 0;
	var params_type=new Array();
		
	if(!IsCmd)
	{
		Match('(');
		
		// parse function params
		while( Look != ')')
		{		   
		   params_type[count] = Expression();
		   PushLast(params_type[count]);
		   count++;
		   if (Look != ')')
			Match(',');
		}
		
		Match(')');
	}
	else
	{
		while( Look != ';')
		{
			params_type[count] = 4;
			Emitln('asm_reg0 = "' + GetName() + '"');
			PushLast(params_type[count]);
			count++;
		}
	}
	
	var return_types = LinkFunc(Name, count, params_type);
	
	var func_suffix = "";
	for (var i = count-1; i>=0; i--)
	{
		func_suffix += params_type[i];
	}
	
	var func_name = Name + func_suffix;
	
	func_name = func_name.replace(".", "_");
	
	Emitln('asm_func_' + func_name + "();");

	return return_types;
}

function StringIndexer(Name)
{
	Match('[');
	var type = Expression();
	Match(']');
	
	if (type != 2)
	{
		Error_p("Invalid indexer type.");
	}
	
	PushLast(type);
	
	EmitReadVar(Name, type);
	
	PushLast(type);	
}

// A[1, :]
function IndexerOnlyColon(multiple, isrow)
{
	Match(':');
		
	Emitln("asm_reg0 = 0;");
	PushLast(2);
	Emitln("asm_reg0 = -1;");
	PushLast(2);
	
	if (isrow)
		multiple = 100; 
	else
	{
		multiple = (multiple == 100) ? 102 : 101;
	}
	
	return multiple;
}

// A[1:3, 2:4]
function IndexColonRange(multiple, isrow)
{
	Match(':');
	var type = Expression();

	if (type!=2)
	{
		Error_p("Invalid indexer type.");
	}
	
	PushLast(type);
	
	if (isrow)
		multiple = 100; 
	else
	{
		multiple = (multiple == 100) ? 102 : 101;
	}
	
	return multiple;
}

function MatrixIndexer(Name)
{
	var vector = false; //,mode;
	var multiple = 0;
	var type;
	//var rowbegin, rowend;
	
	Match('[');
	
	if (Look == ':')
	{
		multiple = IndexerOnlyColon(multiple, true);
	}
	else
	{
		type = Expression();
		
		if (type!=2)
		{
			Error_p("Invalid indexer type.");
		}
		
		PushLast(type);
		
		if (Look == ':')
		{
			multiple = IndexColonRange(multiple, true);
		}
	}
	
	
	if (Look==',')
	{
		Match(',');
		//mode = 1; // , mode
	}
	else if (Look==']')
	{
		Match(']');
		
		if(Look=='[')
			Match('[');
		else
			vector = true;
		//mode = 2; // c style
	}
	
	if (Look == ':')
	{
		multiple = IndexerOnlyColon(multiple, false);
	}
	else
	{
		if (!vector)
		{
			type = Expression();
		}
		else
		{
			Emitln("asm_reg0 = 0;");
			type = 2;
		}
			
		if (type!=2)
		{
			Error_p("Invalid indexer type.");
		}

		PushLast(type);	
		
		if (Look == ':')
		{
			multiple = IndexColonRange(multiple, false);
		}
	}
	
	EmitReadVar(Name, type);
	
	PushLast(type);
	
	if (!vector)
		Match(']');
		
	return multiple;
}

function FuncDelegateCall(Name)
{
	EmitReadVar(Name, 6);
	Emitln("asm_fjump_table(asm_reg0);//asm_call_reg0();");
	var type = ftable_funcs[Name];
	
	Match('(');
	Match(')');
	return type;
}

function Ident()
{
	var Name = GetName();

	var type = comp_try_get_var_type(Name);
	
	if (Look == '(')
	{
		if (type == 6)  // check if function delegate
		{
			type = FuncDelegateCall(Name);
		}
		else
		{
			var return_types = FuncCall(Name);
			ClearUnusedParams(return_types, 1, return_types.length);
			type = return_types[0];
		}
	}
	else if (Look == '[')
	{
		type = comp_get_var_type(Name);
		
		if (type==4)
		{
			StringIndexer(Name);
			Emitln("asm_string_get_elm();");
			type = 2;
		}
		else if (type==3)
		{
			var multiple = MatrixIndexer(Name);
			if (!multiple)
			{
				Emitln("asm_matrix_get_elm();");
				type = 2;
			}
			else
			{
				switch(multiple)
				{
					case 102:
						Emitln("asm_matrix_get_slice();");break;
					case 100:
						Emitln("asm_matrix_get_slice(1); // col ");break;
					case 101:
						Emitln("asm_matrix_get_slice(2); // row");break;
				}
				
				rvalue[rvalue_pos] = true;
				type = 3;
			}
		}
		else
			Error_p("Indexer [] operator only works for matrices and strings.");
	}
	else
	{
		type = comp_get_var_type(Name);
		
		EmitReadVar(Name, type);
		
		if (type==5)
		{
			var return_types = LinkFunc(Name, 0, []);
			/*var func_suffix = "";
			var params_count = 0;
			var params_type = [];
			for (var i = params_count-1; i>=0; i--)
			{
				func_suffix += params_type[i];
			}
			
			var func_name = Name + func_suffix;
			DoFunctionLink(func_name, user_func_codes[Name], params_count, params_type);*/
			
			ftable_funcs[Name] = const_vars[Name];
			//comp_define_var_const(Name, ftable_funcs.length, 5);

			type = 6;
		}
	}

	return type;
}

function PopReg0()
{
	Emitln("asm_sp--;");
	Emitln("asm_reg0 = stack[asm_sp];");
}

function PopReg1()
{
	Emitln("asm_sp--;");
	Emitln("asm_reg1 = stack[asm_sp];");
}

function PushLast(type)
{
	Emitln("stack[asm_sp] = asm_reg0;");
	Emitln("asm_sp++;");
	//Emitln("asm_push();");
}

var scope_ids = 0; // unused remove?

function VariableScope(use_heap)
{
	//this.id = ++scope_ids;
	this.vars = [];
	this.vars_type = [];
	this.vars_rel_pos = [];
	this.stack_rel_pos = 0;
	this.vars_deduced = [];
	
	this.param_count = 0;
	this.return_type;
	
	this.define_var = function(name, type)
	{
		if(this.vars[name]===undefined)
		{
			this.vars[name] = 0;
			this.vars_type[name] = type;
			this.vars_deduced[name] = type;
			this.vars_rel_pos[name] = this.stack_rel_pos++;
			
			if(use_heap)
				;//Emitln("asm_heap_pointer++;");
			else		
				Emitln("asm_sp++;");
		}
		else
		{
			if(this.vars_deduced[name]!==undefined && this.vars_deduced[name] != type)
			{		
				Error_p("Deduced type is different from previous defined type : '" + name + "'.");
			}
			
			this.vars_type[name] = type;
			this.vars_deduced[name] = type;
		}
	}
	
	this.define_param = function(name, type, rel_pos)
	{
		this.vars[name] = 0;
		this.vars_type[name] = type;
		this.vars_rel_pos[name] = rel_pos;
		this.param_count++;		
		
	}
	
	this.get_var_type = function(name)
	{
		return this.vars_type[name];
	}
	
	this.clear_all = function()
	{
		//this.id = ++scope_ids;
		this.vars = [];
		this.vars_type = [];
		this.vars_rel_pos = [];
		this.stack_rel_pos = 0;
		this.vars_deduced = [];
	}
	
	this.clear_var = function(name)
	{
		//this.id = ++scope_ids;
		
		delete this.vars[name]; 
	
		delete this.vars_type[name]; 
		
		delete this.vars_deduced[name]; 
	}
	
	this.get_var_value = function(name)
	{
		if(!use_heap)
			Error_p("Internal error. Heap")
			
		return heap[this.vars_rel_pos[name]];
	}
}


function ArithmeticExpr()
{
	var type;
	
	if (IsAddop(Look))
	{
		type = 2;
		Emitln("asm_reg0 = 0;");
	}
	else
	{
		type = Term();
	}

	while (Look == '+' || Look == '-')
	{
	    PushLast(type);
		switch (Look)
		{
		case '+':
			type = AddSubOp(type, '+');
			break;
		case '-':
			type = AddSubOp(type, '-');
			break;
		default: Expected("Addop");
			break;
		}
	}

	return type;
}


function DoFunction()
{
	var cur_pos = inp_pos-1;
	
	var braces = 0, firstBracesMet = false;
	
	var rtype_name = GetName();
	var rtype = 2;
	
	if (rtype_name != "function")
		for (var i=0;i<types.length;i++)
			if (types[i] == rtype_name) rtype = i;
	
	var Name = GetName();
	
	user_func_codes_pos[Name] = cur_pos;
	
	Name = Name.replace(".", "_");
	
	var code = "function "+ Name;
	code += Look;
	
	while(true)
	{
		GetChar();
		code += Look;
		
		if (Look =='{')
		{
		   braces++;
		   firstBracesMet =true;
		}
		else if (Look=='}')
			braces--;
		
		if(braces==0 && firstBracesMet)
			break;
		
		if(end_of_prog)
			Error_p("Unexpected end of file.");
	}
	
	Match('}');
	
	if(cur_scope)
	{
		Error_p("Inline functions are not supported.");
	}
	
	if (user_func_codes[Name] != undefined)
		Error_p("Function already defined: '" + Name + "'.");
	
	user_func_codes[Name] = code;
	
	function_list.push( new function_def(Name, [], [rtype] , "user", true) );
	//comp_define_var(Name, 5);
	comp_define_var_const(Name, function_list.length, 5);
}

function DoFunctionLink(func_name, code, params_count, params_type)
{
	var old_inp = inp;
	var old_inp_pos = inp_pos;
	var old_look = Look;
	
	inp = code;
	inp_pos = 0;
	end_of_prog = false; 
	
	GetChar();
	SkipWhite();
	
	if (GetName() != 'function')
		Error_p("Internal Error. ");
		
	var fName = GetName();
	
	Match('(');
	// parse function params
	var proto_param_count = 0;
	var proto_param_names=new Array();
	while( Look != ')')
	{		   
	   proto_param_names[proto_param_count] = GetName();
	   proto_param_count++;
	   if (Look != ')')
		Match(',');
	}
	Match(')');
	
	if ( proto_param_count != params_count)
	{
		Error_p("Invalid number of parameters.");
	}
	
	var compiled_js_saved = compiled_js;
	
	compiled_js = "";
	
	Emitln( 'function asm_func_' + func_name + '()');
	Emitln( '{');
	Match('{');
	
	cur_scope = new VariableScope();
	scope_stack.push(cur_scope);
	
	for(var i=0;i < params_count; i++)
	{
		cur_scope.define_param(proto_param_names[i], params_type[i], -params_count-1 +i);
	}
	
	Emitln("stack[asm_sp++] = asm_bp;");
	Emitln("asm_bp = asm_sp;");
	
	if (!Block())
	{
		Error_p("Not all code paths return a value.");
	}
	var rtype = cur_scope.return_type;
	
	
	/*Emitln("asm_sp = asm_bp;");
	Emitln("asm_bp = stack[--asm_sp];");
	
	if (params_count >0 )
		Emitln("asm_sp -= " + params_count + ";");*/
	
	scope_stack.pop();
	if(scope_stack.length == 0)
		cur_scope = undefined;
	else
		cur_scope = scope_stack[scope_stack.length-1];
		
	Match('}');
	Emitln("}");
	
	functions_js += compiled_js;
	compiled_js = compiled_js_saved;
	
	end_of_prog = false; 
	
	Look = old_look;
	inp = old_inp;
	inp_pos = old_inp_pos;
	
	return [rtype];
}

function DoReturn()
{
	if (!cur_scope)
		Error_p('Illegal return statement.');

	var rtype = Expression();
	 
	if (cur_scope.return_type != undefined && rtype != cur_scope.return_type)
		Error_p("Deduced return type is different from previous defined type.");
		
	cur_scope.return_type = rtype;

	Emitln("asm_sp = asm_bp;\nasm_bp = stack[--asm_sp];");
	if (cur_scope.param_count>0)
		Emitln("asm_sp -= " + cur_scope.param_count + ";");
	Emitln("return;");
	return rtype;	
}

/////// Flow Control ////

function DoIf()
{
	Match('(');
	var type = Expression();
	
	if (type==1)
	{
		Emitln("if ( asm_reg0 )\n{" );
	} 
	else if (type==2)
	{
		Emitln("if ( asm_reg0 )\n{" );
	}
	else
	{
		Error_p("Unsupported if condition");
	}
		
	Match(')');
	Match('{');
	var is_return_main = Block();
	Match('}');
	if (CheckAhead('else'))
	{
		Emitln("}\nelse\n{" );
		Match('e');Match('l');Match('s');Match('e');
		Match('{');
		var is_return_else = Block();
		Match('}');
	}
	Emitln("}");
		
	if (is_return_main && is_return_else)
		return true;
}


function DoWhile()
{	
	Match('(');
	Emitln("while(1) {");
	var type = Expression();
	
	if (type==1)
	{
		Emitln("if ( !asm_reg0 )\n\tbreak;" );
	} 
	else if (type==2)
	{
		Emitln("if ( !asm_reg0 )\n\tbreak;" );
	}
	else
	{
		Error_p("Unsupported if condition");
	}
		
	Match(')');
	Match('{');
	Block();
	Match('}');
	Emitln("}\n");
}

function DoLoop(is_zero_begin)
{	
	Match('(');
	var Name = GetName();	

	// loop begin expr.
	if (!is_zero_begin)
	{
		Match(',');			
		var exp_type_begin = Expression();
		comp_define_var(Name, exp_type_begin);
		EmitWriteVar(Name, exp_type_begin);
		//Emitln("asm_set_var( \"" + Name + "\", asm_reg0, " + exp_type_begin + " );");	
	}
	else
	{
		comp_define_var(Name, 2);
		Emitln("asm_reg0 = 0;")
		EmitWriteVar(Name, 2);
		//Emitln("asm_set_var( \"" + Name + "\",0 , " + 2 + " );");	
	}
	
	var type = comp_get_var_type(Name);
	
	if (type!=2)
		Error_p("Real type expected.");
	
	Emitln("while(1) {");
		
	Match(',');	
		
	//Emitln("asm_reg0_set( asm_get_var_val(\""+Name+"\")); ");
	EmitReadVar(Name, 2);
	PushLast(type);
	var exp_type_check = Expression();
	if (exp_type_check!=2)
		Error_p("Real type expected.");
	
	PopReg1();
	Emitln("asm_le();");
	
	Emitln("if ( !asm_reg0 )\n\tbreak;" );

	if (exp_type_check!=1 && exp_type_check!=2)
	{
		Error_p("Unsupported loop expression.");
	}
		
	Match(')');
	Match('{');
	Block();
	Match('}');
	
	//Emitln("asm_reg0_set( asm_get_var_val(\""+Name+"\")); ");
	EmitReadVar(Name, 2);
	PushLast(type);
	Emitln("asm_reg0 = 1;");
	PopReg1();
	Emitln("asm_add_real();");
	EmitWriteVar(Name, 2);
	//Emitln("asm_set_var( \""+Name+"\", asm_reg0, 2 );");
	
	Emitln("}\n");
}

function EmitReadVar(name, type)
{
	var is_global = cur_scope == undefined || cur_scope.get_var_type(name) == undefined;
	
	if (type < 1 || type > 6)
	{
		Error_p("Internal error. Type error 1.");
	}
	
	if ( const_vars[name] != undefined )
	{
		Emitln("asm_reg0 = " + const_vars[name] + ";" );
	}
	else if(is_global)
	{
		//Emitln("asm_reg0_set( asm_get_var_val(\"" + name +"\"));");
		Emitln("asm_reg0 = heap[" + global_scope.vars_rel_pos[name] + "]; // " + name);
	}
	else
	{
		Emitln("asm_reg0 = stack[asm_bp + " + cur_scope.vars_rel_pos[name] + "]; // " + name );
	}
}

function EmitWriteVar(name, type)
{
	var is_global = cur_scope == undefined || cur_scope.get_var_type(name) == undefined;
	
	if (type<1 || type > 6)
	{
		Error_p("Internal error. Type error 1.");
	}
	
	if ( const_vars[name] != undefined )
	{
		//Emitln("asm_reg0_set(" + const_vars[name] + ");" );
		Error_p("Can not change const value.")
	}
	else if (is_global)
	{
		//Emitln("asm_set_var( \"" + name + "\", asm_reg0_get_val(), " + type + " );");
		Emitln("heap[" + global_scope.vars_rel_pos[name] + "] = " + "asm_reg0;  //" + name );
	}
	else
	{
		Emitln("stack[asm_bp + " + cur_scope.vars_rel_pos[name] + "] = " + "asm_reg0;  //" + name );
	}
}

var rvalue = new Array(); // close to move constructor concept
var rvalue_pos = 0;
function Assignment(Name)
{
	
	if (Look == '[')
	{
		type = comp_get_var_type(Name);
		if (type == 4)
		{
			//in javascript Strings are immutable so it does not work in this simple form.
			Error_p("Strings are not supported yet.");
			/*StringIndexer(Name);
			Match('=');
			var type = Expression();
			
			Emitln("asm_string_set_elm()");*/
		}
		else
		{
			var multiple = MatrixIndexer(Name);
			Match('=');
			if (!multiple)
			{
				var type = Expression();
				if (type != 2)
					Error_p("Matrix elements should be real");
				Emitln("asm_matrix_set_elm()");
			}
			else
			{
				var type = Expression();
				if (type != 3)
					Error_p("Matrix expected");
					
				switch(multiple)
				{
					case 102:
						Emitln("asm_matrix_set_slice();");break;
					case 100:
						Emitln("asm_matrix_set_slice(1); // col ");break;
					case 101:
						Emitln("asm_matrix_set_slice(2); // row");break;
				}
			}
		}
		type = 2;
	}
	else
	{
		rvalue_pos++;
		rvalue[rvalue_pos] = false;
		
		Match('=');
		var type = Expression();
		
		comp_define_var(Name, type);
		
		if (rvalue[rvalue_pos]==false)
		{
			if (type==3)
			{
				Emitln("asm_reg0_dub_matrix();");
			}
			else if (type==4)
			{
				//javascript does not need copy for string but other virtual machines may need
				//Emitln("asm_reg0_dub_s();");
			}
		}
		
		rvalue_pos--;
		
		EmitWriteVar(Name, type);
		
			
		//Emitln("real_stack[real_asm_sp - " + cur_scope.vars_rel_pos[Name] + "] = " + "asm_reg0_get_val();" );	
		//Emitln("real_asm_sp++");
		//Emitln("asm_set_var( \"" + Name + "\", asm_reg0_get_val(), " + type + " );");	
	}
	
	return type;
}


function ClearUnusedParams(return_types, start, end)
{
	for (var i=start;i < end;i++)
	{
		PopReg0();
	}
}

function PeekCmdFuncName()
{
	if (!IsAlpha(Look))
		return "";
		
	var cur_inpos = inp_pos;
	var cur_look = Look;
	
	var name = GetName();
	if (Look == '(')
		name = "";
	
	inp_pos = cur_inpos;
	Look = cur_look;
	
	return name;
}


// Command style function call. ( clear all, plot x y)
// no return value. all parameters are string
function CommandFuncCall(Name)
{
	var return_types = FuncCall(Name, true);
	
	ClearUnusedParams(return_types, 1, return_types.length);
}

// [ s v d] = svd(A)
function MultiAssignment()
{
	Match('[');
	var Names = new Array(10);
	var num_names=0;
	while( 1)
	{
		Names[num_names] = GetName();
		num_names++;
		if (Look == ']')
		   break;
		if (Look == ',')
			Match(',');
	}
	
	Match(']');
	
	Match('=');
	
	var Name = GetName();
	
	var return_types = FuncCall(Name);	
	
	if (num_names > return_types.length)
		Error_p("Function '" +Name + "' does not have enough return values.");
	
	ClearUnusedParams(return_types, num_names, return_types.length);
	
	var type = return_types[num_names - 1];
	
	
	comp_define_var(Names[num_names - 1], type);
	if (type==3 /*&& assignment_copy_needed*/)
	{
		Emitln("asm_reg0_dub_matrix();");
	}
	
	EmitWriteVar(Names[num_names - 1], type);
	//Emitln("asm_set_var( \"" + Names[num_names - 1] + "\", asm_reg0, " + type + " );");

	for (var i=num_names - 2;i >=0 ;i--)
	{
		PopReg0();
	
		comp_define_var(Names[i], return_types[i]);
		
		if (return_types[i]==3 /*&& assignment_copy_needed*/)
		{
			Emitln("asm_reg0_dub_matrix();");
		}
		
		EmitWriteVar(Names[i], type);
		//Emitln("asm_set_var( \"" + Names[i] + "\", asm_reg0, " + return_types[i] + " );");
	}
	
}

function Block()
{	
	var all_paths_return = false; 
	block_depth_level++;
	
	while(Look != '}' && !end_of_prog)
	{
		if (Look=='{')
		{
			Match('{');
			if (Block())
				all_paths_return = true;
			Match('}');
		}
		else if (Look==';')
		{
			Match(';');
		}
		else
		{		
			if (CheckAhead("while"))
			{
				GetName();
				DoWhile();
			}
			else if (CheckAhead("loop0"))
			{
				GetName();
				DoLoop(true);
			}
			else if (CheckAhead("loop"))
			{
				GetName();
				DoLoop(false);
			}			
			else if (CheckAhead("if"))
			{
				GetName();
				if( DoIf() )
					all_paths_return = true;
			}
			else if (CheckAhead("function") || CheckAhead("real") || CheckAhead("matrix") || CheckAhead("string") || CheckAhead("bool"))
			{
				DoFunction();
			}
			else if (CheckAhead("return"))
			{
				GetName();
				DoReturn();
				all_paths_return = true;
				Match(';');
			}
			else if (CheckAhead("clear"))
			{
				if (block_depth_level!=1)
					Error_p('clear only allowed at topmost level');
				GetName();
				var var_name = GetName();
				if(var_name=="all")
					comp_clear_all();
				else
				{
					comp_clear_var(var_name);
				}
			}
			else 
			{
				if (/*cortex_is_command && */PreScanAssignmentOp() == false)
				{
					var cmd_style_name = PeekCmdFuncName();
					
					if (FindFunctionWithName(cmd_style_name) != -1)
					{
						CommandFuncCall(GetName());
					}
					else
					{
						Expression();
						Match(';');
					}
				}
				else
				{
					if (IsAlpha(Look))
					{
						var Name = GetName();				
						if (Look == '=' || Look == '[')
						{				
							Assignment(Name);	
							Match(';');
						}
						else
						{
							Error_p("Unexpected character.");
							//Error_p("Internal error. 101");
						}
					}
					else if (Look == '[')
					{
						MultiAssignment();
						Match(';');
					}
					else
					{
						Error_p("Invalid character.")
					}
				}
			}			
			
		}
		
		last_success_pos = inp_pos;
	}	
	
	return all_paths_return;
}

function Preload()
{
	asm_async_preload = false;
	
	if (CheckAhead("preload"))
	{
		GetName();
		Match('{');
		
		while ( Look != "}") 
		{
			asm_async_preload = true;
			Match('"');
			preload_list.push( GetString() );
			Match('"');
			
			if (CheckAhead("as"))
			{
				GetName();
				Match('"');
				preload_list_alias.push( GetString() );
				Match('"');
			}
			
			if (Look == "}")
				break;
				
			Match(",");
		}
		//Block();
		Match('}');
	}
}

function Program()
{
	block_depth_level = false;
	//Match('{');
	Preload();
	Block();
	//Match('}');
	if (!end_of_prog)
	{
		Error_p("Unexpected '}'.");
	}
}

// workaround function for js not allowing calls to functions in evaled code.
function ftable_function()
{	
	var s = "";
	
	s += "\nfunction asm_fjump_table(fname){\n  switch(fname)\n  {\n";
	
	var i = 0;
	for (var n in ftable_funcs)
	//for(var i=0;i < ftable_funcs.length; i++)
	{
		s += "  case " + ftable_funcs[n] + " : " + "asm_func_" + n + "(); break;\n";
		i++;
	}
	
	s += "  }\n}";
	
	if (i ==0)
		return "";
	
	return s;
}

function comp_define_var_const(varname, value, type)
{
	const_vars[varname] = value;
	const_vars_type[varname] = type;
}

function comp_define_var(varname, type)
{
	if (cur_scope && global_scope.get_var_type(varname) === undefined )
	{
		cur_scope.define_var(varname, type);	
	}
	else 
	{
		global_scope.define_var(varname, type);
	}
}

function comp_try_get_var_type(varname)
{
	var r = undefined;
	
	if (cur_scope)
		r = cur_scope.get_var_type(varname);
		
	if (r!=undefined)	
		return r;
	
	//r = vars_type[varname];
	r = global_scope.get_var_type(varname);
	
	if (r===undefined)
	{
		r = const_vars_type[varname];
	}
		
	return r;
}

function comp_get_var_type(varname)
{
	var r = comp_try_get_var_type(varname);
	if (r===undefined)
	{
		Error_p("Undefined variable : '" + varname + "'.");
		
		return 0;
	}
	
	return r;
}


function comp_clear_all()
{
	global_scope.clear_all();
	
	const_vars=[];
	const_vars_type=[];
	define_language_consts();
	
	heap = new Array(1000); 
	stack = new Array(1000);
}

function define_language_consts()
{
	comp_define_var_const('true',  1, 1);
	comp_define_var_const('false', 0, 1);
	comp_define_var_const('pi', Math.PI, 2);
}


function comp_clear_var(name)
{
	global_scope.clear_var(name);
}

function Init(code_exe)
{
	linked_functions = [];
	inp = code_exe;
	inp_pos = 0;
	end_of_prog = false;	
	//console_js = document.getElementById('output_win_txt').value ;
	compiled_js = "";
	functions_js = "";
	global_scope.vars_deduced = [];
	ftable_funcs = [];
	rvalue_pos = 0;
	user_func_codes = new Array();
	user_func_codes_pos = new Array();
	report_pos = 0;
	function_list.length = function_list_lib_size
	
	cur_scope = undefined;
	scope_stack = new Array();
	
	preload_list = new Array();
	preload_list_alias = new Array();
	
	asm_init();
	
	define_language_consts();
	
	GetChar();
	SkipWhite();
}




