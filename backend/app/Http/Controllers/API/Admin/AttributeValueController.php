<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeValueController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $query = AttributeValue::with('attribute');

        if ($request->attribute_id) {
            $query->where('attribute_id', $request->attribute_id);
        }

        $values = $query->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('sort_order')
            ->get();

        return $this->success('Attribute values retrieved', ['attribute_values' => $values]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:attribute_values,slug',
            'color_code' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['value']);
        $value = AttributeValue::create($validated);

        return $this->success('Attribute value created', ['value' => $value], 201);
    }

    public function update(Request $request, $id)
    {
        $value = AttributeValue::find($id);
        if (! $value) {
            return $this->notFound('Attribute value not found');
        }

        $validated = $request->validate([
            'attribute_id' => 'sometimes|exists:attributes,id',
            'value' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:attribute_values,slug,'.$id,
            'color_code' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        if (isset($validated['value']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['value']);
        }

        $value->update($validated);

        return $this->success('Attribute value updated', ['value' => $value]);
    }

    public function destroy($id)
    {
        $value = AttributeValue::find($id);
        if (! $value) {
            return $this->notFound('Attribute value not found');
        }

        $value->delete();

        return $this->success('Attribute value deleted');
    }
}
