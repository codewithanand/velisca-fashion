<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\NewAccessToken;
use Laravel\Sanctum\PersonalAccessToken;

class TokenService
{
    public function createAccessToken(User $user, string $deviceName = 'unknown', array $abilities = ['*']): NewAccessToken
    {
        return $user->createToken(
            $deviceName,
            $abilities,
            now()->addMinutes(config('sanctum.expiration', 15))
        );
    }

    public function createRefreshToken(): string
    {
        return Str::random(128);
    }

    public function hashRefreshToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public function expiresAt(): int
    {
        return now()->addMinutes(config('sanctum.expiration', 15))->timestamp;
    }

    public function refreshTokenExpiresAt(): int
    {
        return now()->addDays(30)->timestamp;
    }

    public function isValidRefreshToken(?string $token): bool
    {
        return !is_null($token) && strlen($token) === 128;
    }

    public function revokeCurrentToken(PersonalAccessToken $token): void
    {
        $token->delete();
    }

    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    public function rotateRefreshToken(PersonalAccessToken $token): string
    {
        $newRefreshToken = $this->createRefreshToken();

        $token->update([
            'refresh_token' => $this->hashRefreshToken($newRefreshToken),
            'refresh_token_expires_at' => now()->addDays(30),
        ]);

        return $newRefreshToken;
    }

    public function findTokenByRefreshToken(string $refreshToken): ?PersonalAccessToken
    {
        $hashed = $this->hashRefreshToken($refreshToken);

        return PersonalAccessToken::where('refresh_token', $hashed)->first();
    }

    public function storeRefreshToken(PersonalAccessToken $token, string $refreshToken): void
    {
        $token->refresh_token = $this->hashRefreshToken($refreshToken);
        $token->refresh_token_expires_at = now()->addDays(30);
        $token->save();
    }

    public function storeTokenMetadata(PersonalAccessToken $token, string $deviceName, string $ip, ?string $userAgent): void
    {
        $token->device_name = $deviceName;
        $token->ip_address = $ip;
        $token->user_agent = $userAgent;
        $token->save();
    }

    public function accessTokenExpiresIn(): int
    {
        return config('sanctum.expiration', 15) * 60;
    }
}
