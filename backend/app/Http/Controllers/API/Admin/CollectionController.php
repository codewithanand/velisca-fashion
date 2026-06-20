<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $collections = Collection::withCount('products')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->success('Collections retrieved', [
            'collections' => $collections,
            'meta' => [
                'total' => $collections->total(),
                'page' => $collections->currentPage(),
                'per_page' => $collections->perPage(),
                'last_page' => $collections->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $collection = Collection::with('products')->find($id);
        if (! $collection) {
            return $this->notFound('Collection not found');
        }

        return $this->success('Collection retrieved', ['collection' => $collection]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:collections,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'banner' => 'nullable|string',
            'type' => 'nullable|string|in:manual,auto',
            'conditions' => 'nullable|array',
            'status' => 'nullable|boolean',
            'products' => 'nullable|array',
            'products.*' => 'exists:products,id',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $collection = Collection::create($validated);

        if (! empty($validated['products'])) {
            $collection->products()->sync($validated['products']);
        }

        return $this->success('Collection created', ['collection' => $collection], 201);
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::find($id);
        if (! $collection) {
            return $this->notFound('Collection not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:collections,slug,'.$id,
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'banner' => 'nullable|string',
            'type' => 'nullable|string|in:manual,auto',
            'conditions' => 'nullable|array',
            'status' => 'nullable|boolean',
            'products' => 'nullable|array',
            'products.*' => 'exists:products,id',
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $collection->update($validated);

        if ($request->has('products')) {
            $collection->products()->sync($validated['products'] ?? []);
        }

        return $this->success('Collection updated', ['collection' => $collection]);
    }

    public function destroy($id)
    {
        $collection = Collection::find($id);
        if (! $collection) {
            return $this->notFound('Collection not found');
        }

        $collection->delete();

        return $this->success('Collection deleted');
    }
}
