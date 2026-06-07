<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Categories retrieved', [
            'categories' => [],
        ]);
    }

    public function store(Request $request)
    {
        return $this->success('Category created', [], 201);
    }

    public function update($id, Request $request)
    {
        return $this->notFound('Category not found');
    }

    public function destroy($id)
    {
        return $this->notFound('Category not found');
    }
}
