<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ColorController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Colors retrieved', [
            'colors' => Color::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:colors,slug',
            'hex_code' => 'nullable|string|max:7',
            'color_family' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $color = Color::create($validated);

        return $this->success('Color created', ['color' => $color], 201);
    }

    public function update(Request $request, $id)
    {
        $color = Color::find($id);
        if (! $color) {
            return $this->notFound('Color not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:colors,slug,'.$id,
            'hex_code' => 'nullable|string|max:7',
            'color_family' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $color->update($validated);

        return $this->success('Color updated', ['color' => $color]);
    }

    public function destroy($id)
    {
        $color = Color::find($id);
        if (! $color) {
            return $this->notFound('Color not found');
        }
        $color->delete();

        return $this->success('Color deleted');
    }
}
