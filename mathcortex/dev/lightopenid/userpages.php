<?php
session_start();

//CREATE USER 'sec_user'@'localhost' IDENTIFIED BY 'eKcGZr59zAa2BEWU';
//GRANT SELECT, INSERT, UPDATE ON `secure_login`.* TO 'sec_user'@'localhost';

if (array_key_exists("user", $_SESSION) && array_key_exists("cmd", $_GET))
{
	//$dbconn = pg_connect("host=localhost dbname=cortex_data user=postgres password=logoss25") or die('Could not connect: ' . pg_last_error());
	$db_conn = new PDO("pgsql:host=localhost;dbname=cortex_data;", "postgres", "logoss25"); 
		
	if ($_GET["cmd"]=="save" )
	{
		if (array_key_exists("name", $_POST))
		{
			$stm = $db_conn->prepare('UPDATE pages SET text = ? , name = ? WHERE p_id = ?'); 
			$result =  $stm->execute( array($_POST["text"], $_POST["name"], $_POST["id"] ));
		}
		else
		{
			$stm = $db_conn->prepare('UPDATE pages SET text = ? WHERE p_id = ?'); 
			$result =  $stm->execute( array($_POST["text"], $_POST["id"] ));
		}
		
		echo "success";
	}
	else if ($_GET["cmd"]=="new" )
	{
		$stm = $db_conn->query("SELECT nextval('pages_seq');");
		$result = $stm->fetchAll();
		//$result = pg_query($query) or die('Query failed: ' . pg_last_error());
		//$id = pg_fetch_row($result);
		$id = $result[0][0];
		
		$stm = $db_conn->prepare("INSERT into pages VALUES ( ?, ?, ?)"); 
		$result =  $stm->execute( array($id, $_POST["text"], $_POST["name"]));
				
		
		$stm = $db_conn->prepare("UPDATE users SET pages=CONCAT(pages, ' $id') WHERE email= :mail"); // can not convert $id to placeholder !!!
		
		$stm -> execute(array($_SESSION["user"]));
		//$query = "UPDATE users SET pages=CONCAT(pages, ' $id[0]') WHERE email='" . $_SESSION["user"]. "'";
		//$result = pg_query($query) or die('Query failed: ' . pg_last_error());
		
		echo $id;
	}
	else if($_GET["cmd"]=="allpages" )
	{
		//$query = "SELECT * from Users WHERE email='" . $_SESSION["user"]. "'";
		//$result = pg_query($query) or die('Query failed: ' . pg_last_error());
		$stm = $db_conn->prepare('SELECT * from Users WHERE email = ?'); 
		$stm->execute(array($_SESSION["user"]));
		
		if ($line = $stm->fetch(PDO::FETCH_ASSOC))
		//if ($line = pg_fetch_array($result, null, PGSQL_ASSOC))
		{
			$pages = explode(" " , $line["pages"]);
			//print_r($pages);
		}
		else
		{
			//$query = "INSERT into Users VALUES ( nextval('users_seq'), '" . $_SESSION["user"] . "')";
			//$result = pg_query($query) or die('Query failed: ' . pg_last_error());
			$stm = $db_conn->prepare("INSERT into Users VALUES ( nextval('users_seq'), ?)");
			$stm->execute(array($_SESSION["user"]));
			
			$pages = array();
		}
		
		$myarray = array();
		foreach( $pages as $page)
		{
			if (strlen($page)==0 )
			   continue;
			//$query = "SELECT text,name,p_id FROM Pages WHERE p_id ='" . $page . "'";
			//$result = pg_query($query) or die('Query failed: ' . pg_last_error());
			$stm = $db_conn->prepare('SELECT text,name,p_id FROM Pages WHERE p_id = ?'); 
			$stm->execute(array( $page ));
			
			if ($line = $stm->fetch(PDO::FETCH_ASSOC))
			{
				$myarray[] = $line;
			}
			
		}
		echo json_encode($myarray);
	}
	else
	{	
		echo "unrecognized";
	}
}
else
	echo "?waitlogin";

?>