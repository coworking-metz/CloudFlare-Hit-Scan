<?php

$data = json_decode(file_get_contents('php://input'), true);
if($data) {
    $_POST = $data;
}
$verbose = isset($_GET['verbose']);


if(isset($_GET['debug'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', 'On');
}

// require 'vendor/autoload.php';
include 'config.inc.php';


define('URL_SITE',(empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]/");
define('CHEMIN_SITE',realpath(__DIR__.'/..').'/');

include 'cloudflare.inc.php';
include 'utils.inc.php';
include 'redis.inc.php';
include 'cache.inc.php';
