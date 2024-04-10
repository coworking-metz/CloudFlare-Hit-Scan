<?php
include 'lib/main.inc.php';

cors();
noCacheHeaders();

$selector = $_GET['selector']??false;
if(!$selector) erreur(400);

$payload = ['urls'=>[]];
if($urls = cloudflare_get_cached($selector)) {
    $payload['urls']=$urls;
    cloudflare_purge_cache($urls);
    redis_purge_all($urls, 'cf');
}
_log('purge',$selector,count($payload['urls']));

if($verbose) {
    header('Content-type: application/json');
    echo json_encode($payload);
} else {
    http_response_code(204);
}