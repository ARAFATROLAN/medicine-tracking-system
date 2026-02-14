<?php
function do_get($url){
    $res = @file_get_contents($url);
    global $http_response_header;
    $headers = isset($http_response_header) ? $http_response_header : [];
    echo "GET $url\n";
    echo implode("\n", $headers) . "\n\n";
    echo $res . "\n\n";
}

function do_post($url, $data){
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($data),
            'ignore_errors' => true,
        ],
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($url, false, $ctx);
    global $http_response_header;
    $headers = isset($http_response_header) ? $http_response_header : [];
    echo "POST $url\n";
    echo implode("\n", $headers) . "\n\n";
    echo $res . "\n\n";
}

$base = 'http://127.0.0.1:8000';

do_get($base . '/api/doctors');

do_post($base . '/api/login', ['email' => 'test@example.com', 'password' => 'password']);
