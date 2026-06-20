<?php

use Laravel\Sanctum\Http\Middleware\AuthenticateSession;

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', '')),

    'guard' => ['web'],

    'expiration' => (int) env('SANCTUM_EXPIRATION', 1440),

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
    ],

];
