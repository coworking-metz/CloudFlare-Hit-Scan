<?php
include 'lib/main.inc.php';

noCacheHeaders();
cors();

$url = $_GET['url']??$_POST['url']??false;
$urls = $_GET['urls']??$_POST['urls']??false;

if(!$urls) {
    if($url) {
        $urls=[$url];
    }
}
if(!$urls) erreur(400);
$payloads=[];
foreach($urls as $url) {
    if(!isValidurl($url)) continue;
    $time = time();
    $payload = ['url'=>$url, 'time'=>$time];
    if(!redis_get('cf:'.$url))  {
        $payload['stored']=true;
        redis_set('cf:'.$url, $url);
    }
    $payloads[]=$payload;
}

_log('hit',count($payloads),array_column($payloads, 'url'));

if($verbose) {
    header('Content-type: application/json');
    echo json_encode(array_column($payloads, 'url'));
} else {
    http_response_code(204);
}