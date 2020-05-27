<?php
error_reporting(E_ALL);
ini_set('display_errors', 'on');
session_cache_limiter('public');
session_cache_expire(21600); // in minutes 15*24*60 = 15days
session_start();

if(isset($_GET['pic']))
{
    //Only strip slashes if magic quotes is enabled.
    $pic = (get_magic_quotes_gpc()) ? stripslashes($_GET['pic']) : $_GET['pic'];

    if (filter_var($pic, FILTER_VALIDATE_URL) === FALSE) {
        http_response_code(404);
        die('Not a valid URL');
    }

    if (!eregi("\.(jpg|png|jpeg|gif)$", $pic)  )
    {
        http_response_code(403);
        die ("Not a valid file type");
    }

    // Getting headers sent by the client.
    $headers = apache_request_headers();


    // Checking if the client is validating his cache and if it is current.
    if ( isset($_SESSION, $_GET['pic']) &&isset($headers['If-Modified-Since']) && ( $headers['If-Modified-Since'] == $_SESSION[$_GET['pic']])) {
        // Client's cache IS current, so we just respond '304 Not Modified'.
        header('Last-Modified: '.$_SESSION[$_GET['pic']], true, 304);
    } else {
        // Image not cached or cache outdated, we respond '200 OK' and output the image.
        $remote_headers = get_headers($pic, 1);
        $size = getimagesize($pic);

        if ($size == null)
        {
            http_response_code(404);
            die('Url not found');
        }

        header('Last-Modified: '.$remote_headers['Last-Modified'], true, 200);
        header('Content-Length: '.$size['mime']);
        header('Content-Type: '.$mime_content_type['mime']);

        $_SESSION[$_GET['pic']] = $remote_headers['Last-Modified'];

        print file_get_contents($pic);
    }
}
?>