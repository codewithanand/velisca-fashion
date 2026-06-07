<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly TokenService $tokenService
    ) {}

    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => User::ROLE_CUSTOMER,
        ]);

        return $this->generateAuthTokens($user, $data['device_name'] ?? 'unknown');
    }

    public function login(array $data): ?array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return null;
        }

        return $this->generateAuthTokens($user, $data['device_name'] ?? 'unknown', $data['remember'] ?? false);
    }

    public function logout(User $user, ?string $currentTokenId = null): void
    {
        if ($currentTokenId) {
            $user->tokens()->where('id', $currentTokenId)->delete();
        }
    }

    public function logoutAllDevices(User $user): void
    {
        $this->tokenService->revokeAllTokens($user);
    }

    private function generateAuthTokens(User $user, string $deviceName, bool $remember = false): array
    {
        $user->load('roles', 'permissions');
        $accessToken = $this->tokenService->createAccessToken($user, $deviceName);

        $plainTextToken = $accessToken->plainTextToken;

        $refreshToken = $this->tokenService->createRefreshToken();

        $this->tokenService->storeRefreshToken($accessToken->accessToken, $refreshToken, $remember);

        $this->tokenService->storeTokenMetadata(
            $accessToken->accessToken,
            $deviceName,
            request()->ip() ?? '127.0.0.1',
            request()->userAgent()
        );

        return [
            'user' => $user,
            'access_token' => $plainTextToken,
            'refresh_token' => $refreshToken,
            'expires_in' => $this->tokenService->accessTokenExpiresIn(),
        ];
    }
}
