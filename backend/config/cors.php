<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration allows your frontend to access the API from a
    | different origin during development. Adjust allowed_origins for
    | production to tighten security.
    |
    */

    // All paths starting with /api/* will have CORS applied
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // HTTP methods allowed
    'allowed_methods' => ['*'],

    // Origins allowed to access API
    // During development, allow all; in production, replace '*' with your frontend domain
    'allowed_origins' => ['*', 'http://localhost:5174'],

    // Regex patterns for allowed origins (optional)
    'allowed_origins_patterns' => [],

    // Headers allowed in requests
    'allowed_headers' => ['*'],

    // Headers exposed to frontend
    'exposed_headers' => [],

    // Maximum age for preflight requests
    'max_age' => 0,

    // Whether cookies/credentials are supported
    'supports_credentials' => false,

];
