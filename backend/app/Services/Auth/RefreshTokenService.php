<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class RefreshTokenService
{
    public function __construct(
        private readonly TokenService $tokenService
    ) {}

    public function refresh(string $refreshToken): ?array
    {
        $personalAccessToken = $this->tokenService->findTokenByRefreshToken($refreshToken);

        if (!$personalAccessToken) {
            return null;
        }

        if ($this->isExpired($personalAccessToken)) {
            $personalAccessToken->delete();
            return null;
        }

        $user = $personalAccessToken->tokenable;

        $deviceName = $personalAccessToken->device_name ?? 'unknown';

        $this->tokenService->revokeCurrentToken($personalAccessToken);

        $accessToken = $this->tokenService->createAccessToken($user, $deviceName);

        $plainTextToken = $accessToken->plainTextToken;

        $newRefreshToken = $this->tokenService->createRefreshToken();

        $this->tokenService->storeRefreshToken($accessToken->accessToken, $newRefreshToken);

        $this->tokenService->storeTokenMetadata(
            $accessToken->accessToken,
            $deviceName,
            request()->ip() ?? '127.0.0.1',
            request()->userAgent()
        );

        return [
            'user' => $user,
            'access_token' => $plainTextToken,
            'refresh_token' => $newRefreshToken,
            'expires_in' => $this->tokenService->accessTokenExpiresIn(),
        ];
    }

    private function isExpired(PersonalAccessToken $token): bool
    {
        return $token->refresh_token_expires_at && $token->refresh_token_expires_at->isPast();
    }
}
