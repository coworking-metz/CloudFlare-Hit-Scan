<?php

function redis_connect() {
    if(!isset($GLOBALS['redis-instance'])) {
        $redis = new Redis();
        $redis->connect('127.0.0.1', 6379);
        $redis->select(1);
        $GLOBALS['redis-instance'] = $redis;
    }
    return $GLOBALS['redis-instance'];
}

function redis_set($cle, $valeur,$expire=null) {
    $redis = redis_connect();

    if($expire) {
        return $redis->setex($cle, $expire, $valeur);
    } else {
        return $redis->set($cle, $valeur);
    }
}

function redis_get($cle) {
    $redis = redis_connect();
    return $redis->get($cle);
}


function redis_get_all($selector, $prefix=false, $withValues=false) {
    $redis = redis_connect();
    if($prefix) {
        $prefix.=':';
    }
    $keys = $redis->keys($prefix."*{$selector}*");
    if($withValues) {
        $results = [];
        foreach ($keys as $key) {
            $results[$key] = $redis->get($key);
        }
        return $results;
    } else {
        return $keys;
    }
}

function redis_purge_all($selectors, $prefix=false) {
    if(!$selectors) return;
    $redis = redis_connect();
    if($prefix) {
        $prefix.=':';
    }
    if(!is_array($selectors)) {
        $selectors = [$selectors];
    }
    foreach($selectors as $selector) {
        $keys = $redis->keys($prefix."*{$selector}*");
        foreach ($keys as $key) {
            $redis->del($key);
        }
    }
}
