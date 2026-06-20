<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\RefreshTokenService;
use App\Traits\ApiResponseTrait;
use OpenApi\Attributes as OA;

class RefreshTokenController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RefreshTokenService $refreshTokenService
    ) {}

    #[OA\Post(
        path: '/auth/refresh',
        summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access token and refresh token pair. The old refresh token is revoked (rotated).',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/RefreshTokenRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token refreshed successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Token refreshed successfully'),
                        new OA\Property(property: 'data', ref: '#/components/schemas/AuthTokens'),
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(
                response: 401,
                description: 'Invalid or expired refresh token',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Invalid or expired refresh token'),
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ErrorResponse')
            ),
        ]
    )]
    public function refresh(RefreshTokenRequest $request)
    {
        $result = $this->refreshTokenService->refresh($request->validated()['refresh_token']);

        if (! $result) {
            return $this->error('Invalid or expired refresh token', null, 401);
        }

        return $this->success('Token refreshed successfully', [
            'user' => new UserResource($result['user']),
            'access_token' => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
            'expires_in' => $result['expires_in'],
        ]);
    }
}
