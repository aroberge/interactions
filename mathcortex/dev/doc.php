<!DOCTYPE html>
<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>

<title>MathCortex - Function</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="description" content="MathCortex is a easy to use programming language built for mathematics and matrix operations that works on browsers."> 
<meta name="Author" content="Gorkem Gencay"/>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
<!--[if lt IE 9]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
<script type="text/javascript" src="kickstart/js/prettify.js"></script>
<script type="text/javascript" src="kickstart/js/kickstart.js"></script>
<link rel="stylesheet" type="text/css" href="kickstart/css/kickstart.css" media="all" />
<link rel="stylesheet" type="text/css" href="style.css" media="all" />   


</head>
<body  style=" font-size : 0.8em ">
<?php

function writeSyntax($f)
{
	echo $value[name] . "(";
}

$string = file_get_contents("functions.json");
$json_a=json_decode($string,true);
//echo  $json_a['John'][status];
//echo  $json_a['Jennifer'][status];
//echo '<br><br>';

foreach ($json_a as $value) {
	echo '<h6 class="funcname">' . $value[name] . '</h6>' ;
	echo $value[description]  . '<br>';

	if ( array_key_exists('example', $value ) )
	{
		foreach ($value[example] as $ex)
			echo $ex  . '<br>';
	}/*
	$i = 0;
	foreach ($value[param] as $p)
	{
		echo 'param ' . $i .' : ' . $p  . "<br>";
		$i++;
	}*/

	/*echo "\n<h6>" . 'Returns' . '</h6>' ;
	echo $value[returns]  . '<br>';*/
	echo "\n";
	
	//print_r($value);
}
?>

</body>

</html>