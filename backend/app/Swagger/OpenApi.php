<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[
    OA\Info(
        version: '1.0.0',
        title: 'Velisca Fashion API',
        description: 'Backend API for the Velisca luxury boutique web application. Provides authentication, token management, and password reset functionality.',
        contact: new OA\Contact(
            email: 'support@velisca.com',
            name: 'Velisca Support'
        ),
    ),
    OA\Server(
        url: 'http://localhost:8000/api',
        description: 'Local Development Server'
    ),
    OA\Server(
        url: 'https://api.velisca.com/api',
        description: 'Production Server'
    ),
]
interface OpenApi {}

#[
    OA\Schema(
        schema: 'User',
        description: 'User resource',
        properties: [
            new OA\Property(property: 'id', type: 'integer', example: 1),
            new OA\Property(property: 'name', type: 'string', example: 'Jane Doe'),
            new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
            new OA\Property(property: 'phone', type: 'string', example: '1234567890', nullable: true),
            new OA\Property(property: 'avatar', type: 'string', example: 'avatars/abc.jpg', nullable: true),
            new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
            new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
            new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
        ],
        type: 'object'
    )
]
interface UserSchema {}

#[
    OA\Schema(
        schema: 'AuthTokens',
        description: 'Access and refresh token pair',
        properties: [
            new OA\Property(property: 'user', ref: '#/components/schemas/User'),
            new OA\Property(property: 'access_token', type: 'string', example: '1|abc123def456...'),
            new OA\Property(property: 'refresh_token', type: 'string', example: 'a1b2c3d4e5...128chars'),
            new OA\Property(property: 'expires_in', type: 'integer', example: 900),
        ],
        type: 'object'
    )
]
interface AuthTokensSchema {}

#[
    OA\Schema(
        schema: 'SuccessResponse',
        description: 'Standard success response',
        properties: [
            new OA\Property(property: 'success', type: 'boolean', example: true),
            new OA\Property(property: 'message', type: 'string', example: 'Operation successful'),
            new OA\Property(property: 'data', properties: [
                new OA\Property(property: 'user', ref: '#/components/schemas/User'),
                new OA\Property(property: 'access_token', type: 'string'),
                new OA\Property(property: 'refresh_token', type: 'string'),
                new OA\Property(property: 'expires_in', type: 'integer'),
            ], type: 'object'),
        ],
        type: 'object'
    )
]
interface SuccessResponseSchema {}

#[
    OA\Schema(
        schema: 'ErrorResponse',
        description: 'Standard error response',
        properties: [
            new OA\Property(property: 'success', type: 'boolean', example: false),
            new OA\Property(property: 'message', type: 'string', example: 'Error description'),
            new OA\Property(property: 'errors', type: 'object', nullable: true, example: '{"email":["The email field is required."]}'),
        ],
        type: 'object'
    )
]
interface ErrorResponseSchema {}

#[
    OA\Schema(
        schema: 'RegisterRequest',
        description: 'Registration payload',
        properties: [
            new OA\Property(property: 'name', type: 'string', example: 'Jane Doe'),
            new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
            new OA\Property(property: 'phone', type: 'string', example: '1234567890'),
            new OA\Property(property: 'password', type: 'string', format: 'password', example: 'securePass1'),
            new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'securePass1'),
        ],
        type: 'object'
    )
]
interface RegisterRequestSchema {}

#[
    OA\Schema(
        schema: 'LoginRequest',
        description: 'Login payload',
        properties: [
            new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
            new OA\Property(property: 'password', type: 'string', format: 'password', example: 'securePass1'),
            new OA\Property(property: 'device_name', type: 'string', example: 'Chrome on Windows', nullable: true),
        ],
        type: 'object'
    )
]
interface LoginRequestSchema {}

#[
    OA\Schema(
        schema: 'RefreshTokenRequest',
        description: 'Refresh token payload',
        properties: [
            new OA\Property(property: 'refresh_token', type: 'string', example: 'a1b2c3d4e5...128chars'),
        ],
        type: 'object'
    )
]
interface RefreshTokenRequestSchema {}

#[
    OA\Schema(
        schema: 'ForgotPasswordRequest',
        description: 'Forgot password payload',
        properties: [
            new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
        ],
        type: 'object'
    )
]
interface ForgotPasswordRequestSchema {}

#[
    OA\Schema(
        schema: 'ResetPasswordRequest',
        description: 'Reset password payload',
        properties: [
            new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
            new OA\Property(property: 'token', type: 'string', example: 'reset-token-from-email'),
            new OA\Property(property: 'password', type: 'string', format: 'password', example: 'newSecurePass1'),
            new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'newSecurePass1'),
        ],
        type: 'object'
    )
]
interface ResetPasswordRequestSchema {}
