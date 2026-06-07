<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Size;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Sizes retrieved', [
            'sizes' => Size::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $size = Size::create($validated);

        return $this->success('Size created', ['size' => $size], 201);
    }

    public function update(Request $request, $id)
    {
        $size = Size::find($id);
        if (!$size) return $this->notFound('Size not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $size->update($validated);

        return $this->success('Size updated', ['size' => $size]);
    }

    public function destroy($id)
    {
        $size = Size::find($id);
        if (!$size) return $this->notFound('Size not found');
        $size->delete();
        return $this->success('Size deleted');
    }
}
