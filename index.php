<?php 
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    echo($uri);
    switch($uri) {
        case '/':
            readfile('frontend/index.html');
            break;
        case '/login':
            break;
        default:
            //Show 404 Page
            readfile('frontend/page-not-found.html');
            break;
    }
?>