<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');

        $response = $next($request);

        if ($response instanceof BinaryFileResponse) {
            return $response;
        }

        if ($response instanceof RedirectResponse) {
            return response()->json([
                'success' => false,
                'message' => 'Redirect not allowed for API requests',
            ], $response->getStatusCode());
        }

        return $response;
    }
}
