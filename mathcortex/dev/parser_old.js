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

var TAB = '\t';

var Look;

var outp;
var inp;
var inp_pos;
	
var vars=[];
var const_vars=[];
var end_of_prog = false;
var label_count=0;
var labels = new Array(1000);
var console = "";
var disable_cpu = false; // posible optimization

////////////// Types and stacks
var int_stack = new Array(100);
var int_stack_pos = 0;

var real_stack = new Array(100);
var real_stack_pos = 0;

var matrix_stack = new Array(100);
var matrix_stack_pos = 0;

var string_stack = new Array(100);
var string_stack_pos = 0;

function cpu_push_real_stack(val)
{
	//if (type==2)
	//{
		real_stack[real_stack_pos++] = val;
	/*}
	else
	{
		Error_p("not supported yet!!");
	}*/
}

function cpu_pop_real_stack()
{
	var val;
	//if (type==2)
	//{
		real_stack_pos--;
		val = real_stack[real_stack_pos];		
		return val;
	/*}
	else
	{
		Error_p("not supported yet!!");
	}*/
	
	//return val;
}
//////////////


/////////  Database
function cpu_savevar(varname, value)
{
	if (disable_cpu==false)
		vars[varname] = value;
}

function cpu_savevar_const(varname, value)
{
	const_vars[varname] = value;
}

function cpu_getvar(varname)
{
	var r = vars[varname];
	
	if (r===undefined)
	{
		r = const_vars[varname];
	}
		
	if (r===undefined)
	{
		Error_p("undefined variable : " + varname);
		
		return 0;
	}
	return r;
}

function cpu_print_vars()
{
	var s="";
	for (var v in vars)
	{
		s += v + ' : ' + vars[v] + '   \n';
	}

	return s;
}

function cpu_call_1(func,param1)
{
	/*if (func == 'cos')
	{
		return Math.cos(param1);
	}*/	
	
	return (eval("Math."+func))(param1);
	//var myFucn = new Function("Math."+func);
	//return myFucn(param1);
}

function cpu_call_0(func)
{	
	return (eval("Math."+func))();
}

function cpu_print(s)
{
	console +=s+"\n";
}

function Error_p(s)
{
	alert(s);
	throw new Error('This is not an error. This is just to abort javascript');
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
		if (disable_cpu == false)
			end_of_prog = true;
	}
}

function Expected(s)
{
	alert(s + " Expected");
	throw new Error('This is not an error. This is just to abort javascript');
}

function SkipWhite()
{
	while (Look == ' ' || Look == '\t' || Look == '\n' || Look == '\r')
	{
		GetChar();
	}
}

function IsAlpha(c)
{			
	return ( (c>='a') && (c<='z')) || ((c>='A') && (c<='Z'));
}

function  IsAlNum(c)
{			
	return IsAlpha(c) || IsDigit(c);
}

function IsDigit(c)
{
	var code = c.charCodeAt(0);
	return ((code>=48) && (code<=57)) || code==46;
} 

function IsAddop(c)
{
	return c == '+' || c == '-';
}

// Recognize a Boolean Literal
/*function IsBoolean(c)
{
   return (c.toUpperCase() == 'T') || (c.toUpperCase() =='F');
}*/

//Recognize a Relop }
function IsRelop(c)
{
	return c == '=' || c == '#' || c == '<' || c == '>';
}

//Recognize a Boolean Orop
function IsOrOp(c)
{
	return c == '|';
}

//Get a Boolean Literal 
/*function GetBoolean()
{
   if (!IsBoolean(Look) )
		Expected('Boolean Literal');
		
   var r = Look.toUpperCase() == 'T';
   GetChar();
   SkipWhite();
   
   return r;
}*/

function GetName()
{
	var Token = "";

	if (!IsAlpha(Look))
		Expected("Name");

	while (IsAlNum(Look))
	{
		Token += Look;
		GetChar();
	}

	SkipWhite();
	return Token;
}

function GetNum()
{
	var Value = "";

	if (!IsDigit(Look))
		Expected("Integer");

	while (IsDigit(Look))
	{
		Value += Look;
		GetChar();
	}

	SkipWhite();

	return parseFloat(Value);
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


////////////// PARSER

//Parse and Translate a Relation
function Relation()
{
	var Value = Expression();
	var r;
	if (IsRelop(Look))
	{
		switch(Look)
		{
		case '=': 
			Match('=');
			r = (Value == Expression());
			break;
		case '#': 
			Match('#');
			r = (Value != Expression());
			break;
		case '<': 
			Match('<');
			r = (Value < Expression());
			break;
		case '>': 
			Match('>');
			r = (Value > Expression());
			break;
		}
	}
	else
	{
		r = Value;
	}
	
	return r;
}

//Parse and Translate a Boolean Factor }
function BoolFactor()
{
	var Value;
	if (Look == '(')
	{
		Match('(');
		Value = BoolExpression();
		Match(')');
	}

	else 
	{
		return Relation();
	}
		
	return Value;
}

//Parse and Translate a Boolean Factor with NOT
function NotFactor()
{
	var Value;
	if (Look == '!') 
	{
		Match('!');
		Value = !BoolFactor();

	}
	else
		return BoolFactor();

	return Value;
}

//Parse and Translate a Boolean Term
function BoolTerm()
{
	var Value = NotFactor();
	while (Look == '&')
	{
		Match('&');
		Value = (NotFactor() && Value);
	}

	return Value;
}

//Parse and Translate a Boolean Expression
function BoolExpression()
{
	var Value = BoolTerm();
	while (IsOrOp(Look))
	{
		switch(Look)
		{
			case '|': 
				Match('|');
				Value = (BoolTerm() || Value);
			break;
			//case '^': 
			//Match('^');
			//Value ^= BoolTerm();
			//break;
		}
	}
	
	return Value;
}


///////////////////////////////////////

function Term()
{
	var Value;
	
	Value = SignedFactor();
	while (Look == '*' || Look == '/')
	{

		switch (Look)
		{
		case '*':
			Match('*');
			Value *= Factor();
			break;
		case '/':
			Match('/');
			Value /= Factor();
			break;
		default: Expected("Mulop");
			break;
		}
	}

	return Value;
} 

function Factor()
{
	var Value;
	var Sign = '+';
	
	if (Look == '-')
	{
		Sign = Look;
		GetChar();
	}
		
	if (Look == '(')
	{
		Match('(');
		Value = Expression();
		Match(')');
	}
	else if (IsAlpha(Look))
	{
		Value = Ident();
	}
	else
	{
		Value = GetNum();	
	}
	
	if (Sign == '-')
		Value = -Value;

	return Value;
}


function SignedFactor()
{
	var Value;
	
	if (Look == '+')
	{
		GetChar();
	}
	if (Look == '-')
	{
		GetChar();
		if (IsDigit(Look))
		{
			Value = -GetNum();
		}
		else
		{
			Value = Factor();
		}
	}
	else
	{
		Value = Factor();
	}

	return Value;
}

function Func(Name)
{
	var Value;
	
	Match('(');
	// parse function params
	var count = 0;
	var params=new Array(20);
	while( Look != ')')
	{		   
	   params[count] = Expression();
	   count++;
	   if (Look != ')')
		Match(',');
	}
	
	Match(')');
	switch (count)
	{
		case 0: 
			Value = cpu_call_0(Name);
		break;
		case 1: 
			Value = cpu_call_1(Name, params[0]);
		break;
	}
	
	return Value;
}

function Ident()
{
	var Value = 0;

	var Name = GetName();

	if (Look == '(')
	{
		Value = Func(Name);
	}
	/*else if (IsBoolean(Name))
	{
		Value = Name.toUpperCase() == 'T';
	}*/
	else
	{
		Value = cpu_getvar(Name);
	}

	return Value;
}

function Expression()
{
	var Value;
	
	if (IsAddop(Look))
		Value = 0;
	else
		Value = Term();

	while (Look == '+' || Look == '-')
	{
		switch (Look)
		{
		case '+':
			Match('+');
			Value += Term();
			break;
		case '-':
			Match('-');
			Value -= Term();
			break;
		default: Expected("Addop");
			break;
		}
	}

	return Value;
}
/////////////////////// 
// Control
function PostLabel()
{
	labels[label_count] = inp_pos-1;
	label_count++;
	
	return label_count-1;
}

function GotoLabel(l)
{
	inp_pos = labels[l];
	GetChar();
	SkipWhite();	
}


/*function Assignment()
{
	var Name = GetName();
	Match('=');

	cpu_savevar(Name, Expression());
	Match(';');
}

function Statement()
{
	var Name = GetName();
	
	Match('=');

	cpu_savevar(Name, Expression());
	Match(';');
}*/
function DoWhile()
{
	Match('(');
	var w_lb_exp = PostLabel();
	disable_cpu = true;
	BoolExpression();
	Match(')');
	Match('{');
	Block();
	Match('}');
	Match(';');
	disable_cpu = false;
	var w_lb_exit = PostLabel();
	
	GotoLabel(w_lb_exp);
	
	while (1)
	{
		var w_exp = BoolExpression();
		
		if (!w_exp)
		{
			GotoLabel(w_lb_exit);
			break;
		}
		
		Match(')');
		Match('{');
		Block();
		cpu_print(cpu_getvar("a"));
		Match('}');
		GotoLabel(w_lb_exp);
	}	
	
	//Match(';');
}

function DoLoop(is_zero_begin)
{
	Match('(');
	
	var loop_var = GetName();
	Match(',');
	var iter_begin;
	if (is_zero_begin)
		iter_begin = 0;
	else
	{
		iter_begin = Expression();
		Match(',');
	}
	var iter_end = Expression();		
	Match(')');
		
	var w_lb_begin = PostLabel(); // optimize
	Match('{');	
	disable_cpu = true;
	Block();
	Match('}');
	Match(';');
	disable_cpu = false;
	
	var w_lb_exit = PostLabel();
	
	GotoLabel(w_lb_begin);
	
	while (1)
	{
		cpu_savevar(loop_var, iter_begin);
		
		if (iter_begin >= iter_end)
		{
			GotoLabel(w_lb_exit);
			break;
		}		
				
		Match('{');
		Block();
		cpu_print(cpu_getvar("a"));
		iter_begin = cpu_getvar(loop_var)+1;		
		Match('}');
		GotoLabel(w_lb_begin);
	}	
	
	//Match(';');
}


function DoIf()
{
	Match('(');
	var w_lb_exp = PostLabel();
	disable_cpu = true;  //optimize
	BoolExpression();
	Match(')');
	Match('{');
	Block();
	Match('}');
	Match(';');
	disable_cpu = false;
	var w_lb_exit = PostLabel();
	
	GotoLabel(w_lb_exp);
		
	var w_exp = BoolExpression();
		
	if (!w_exp)
	{
		GotoLabel(w_lb_exit);
	}
	else
	{		
		Match(')');
		Match('{');
		Block();
		cpu_print(cpu_getvar("a"));
		Match('}');		
	}	
	
	//Match(';');
}


function Block()
{	
	while(Look != '}' && !end_of_prog)
	{
		if (Look=='{')
		{
			Match('{');
			Block();
			Match('}');
		}
		else
		{		
			var Name = GetName();
			
			if (Name == "while")
			{
				DoWhile();
			}
			else if (Name == "if")
			{
				DoIf();
			}
			else if (Name == "loop0")
			{
				DoLoop(true);
			}
			else if (Name == "loop")
			{
				DoLoop(false);
			}
			else if (Look == '=')
			{
				Match('=');
				cpu_savevar(Name, Expression());				
			}
			else
			{
				Func(Name);				
			}
			
			Match(';');
		}
	}	
}

function Program()
{
	//Match('{');
	Block();
	//Match('}');
}

function Init(code_exe)
{
	inp = code_exe;
	inp_pos = 0;
	end_of_prog = false;
	label_count = 0;
	console = "";
	disable_cpu = false;
	
	cpu_savevar_const('true', true);
	cpu_savevar_const('false', false);
	
	GetChar();
	SkipWhite();
}


function parse_m(code_inp)
{
    
	Init(code_inp);
	
	Program();

	outp = cpu_print_vars();
	outp+= "\nconsole : \n"+console;

	document.getElementById('var_val').value = outp;
}


