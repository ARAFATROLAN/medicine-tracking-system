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
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    // Origins allowed to access API
    // During development, allow all; in production, restrict to frontend domains
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        env('APP_URL', 'http://localhost'),
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:8000',
    ],

    // Regex patterns for allowed origins (optional)
    'allowed_origins_patterns' => ['localhost:.*'],

    // Headers allowed in requests
    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    // Headers exposed to frontend
    'exposed_headers' => ['Authorization'],

    // Maximum age for preflight requests
    'max_age' => 86400,

    // Whether cookies/credentials are supported
    'supports_credentials' => true,

];
