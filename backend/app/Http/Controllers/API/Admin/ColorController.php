<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

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
            'hex_code' => 'nullable|string|max:7',
            'status' => 'nullable|boolean',
        ]);

        $color = Color::create($validated);

        return $this->success('Color created', ['color' => $color], 201);
    }

    public function update(Request $request, $id)
    {
        $color = Color::find($id);
        if (!$color) return $this->notFound('Color not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'hex_code' => 'nullable|string|max:7',
            'status' => 'nullable|boolean',
        ]);

        $color->update($validated);

        return $this->success('Color updated', ['color' => $color]);
    }

    public function destroy($id)
    {
        $color = Color::find($id);
        if (!$color) return $this->notFound('Color not found');
        $color->delete();
        return $this->success('Color deleted');
    }
}
