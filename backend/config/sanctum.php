<?php

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', '')),

    'guard' => ['web'],

    'expiration' => 15,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    ],

];
