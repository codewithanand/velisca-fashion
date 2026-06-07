<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Paths
    |--------------------------------------------------------------------------
    |
    | The paths that should participate in CORS. API routes and the
    | Swagger documentation UI are included.
    |
    */

    'paths' => ['api/*', 'api/documentation'],

    /*
    |--------------------------------------------------------------------------
    | Allowed HTTP Methods
    |--------------------------------------------------------------------------
    |
    | HTTP verbs allowed for cross-origin requests.
    |
    */

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    |
    | Origins that are allowed to make cross-origin requests.
    | Set CORS_ALLOWED_ORIGINS in .env as a comma-separated list.
    | The FRONTEND_URL is automatically included.
    |
    | Examples:
    |   local:  http://localhost:5173,http://localhost:3000
    |   prod:   https://velisca.com,https://admin.velisca.com
    |
    */

    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:5173'))))),

    /*
    |--------------------------------------------------------------------------
    | Allowed Origin Patterns
    |--------------------------------------------------------------------------
    |
    | Regex patterns for matching origins. Useful for dynamic subdomains.
    |
    */

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    |
    | Headers that are allowed in preflight and actual requests.
    |
    */

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    |
    | Headers that the browser is allowed to expose to the frontend JS.
    | Content-Disposition is useful for file downloads.
    |
    */

    'exposed_headers' => [
        'Content-Disposition',
    ],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    |
    | Number of seconds the browser can cache the preflight response.
    | 86400 = 24 hours. Reduces preflight requests significantly.
    |
    */

    'max_age' => 86400,

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    |
    | Set to true if you use cookies (e.g., httpOnly refresh token cookie).
    | When true, allowed_origins CANNOT be '*' — you must specify them.
    | Our setup uses Bearer tokens in headers, so this stays false.
    |
    */

    'supports_credentials' => false,

];
