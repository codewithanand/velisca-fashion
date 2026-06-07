<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        // TODO: Implement when products model/table exists
        return $this->success('Products retrieved', [
            'products' => [],
            'meta' => [
                'total' => 0,
                'page' => 1,
                'per_page' => 20,
                'last_page' => 1,
            ],
        ]);
    }

    public function show($id)
    {
        return $this->notFound('Product not found');
    }

    public function store(Request $request)
    {
        return $this->success('Product created', [], 201);
    }

    public function update($id, Request $request)
    {
        return $this->notFound('Product not found');
    }

    public function destroy($id)
    {
        return $this->notFound('Product not found');
    }
}
