<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Banners retrieved', [
            'banners' => [],
        ]);
    }

    public function store(Request $request)
    {
        return $this->success('Banner created', [], 201);
    }

    public function update($id, Request $request)
    {
        return $this->notFound('Banner not found');
    }

    public function destroy($id)
    {
        return $this->notFound('Banner not found');
    }

    public function toggle($id)
    {
        return $this->notFound('Banner not found');
    }
}
