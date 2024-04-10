<?php
include 'lib/main.inc.php';

cors();
noCacheHeaders();

$selector = $_GET['selector']??false;
if(!$selector) erreur(400);

$urls = cloudflare_get_cached($selector);

header('Content-type: application/json');
echo json_encode($urls);
