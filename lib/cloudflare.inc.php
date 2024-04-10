<?php
function cloudflare_get_cached($selector) {
    $keys = redis_get_all($selector, 'cf');

    return array_map(function($key) {
        return preg_replace('/^cf:/', '', $key);
    }, $keys);
}
/**
 * Purge URLs from Cloudflare cache in batches of 30.
 *
 * @param array $urls Array of URLs to purge from cache.
 * @return void
 */
function cloudflare_purge_cache(array $urls): void {
    $apiEndpoint = 'https://api.cloudflare.com/client/v4/zones/'.CF_ZONE_ID.'/purge_cache';
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer ".CF_API_KEY,
    ];

    // Split URLs into batches of 30
    $batches = array_chunk($urls, 30);

    foreach ($batches as $batch) {
        $data = json_encode(['files' => $batch]);
        $ch = curl_init($apiEndpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $response = curl_exec($ch);
        curl_close($ch);


    }
}
