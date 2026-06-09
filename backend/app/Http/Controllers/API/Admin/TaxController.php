<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxClass;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $classes = TaxClass::when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->country, fn($q, $c) => $q->where('country', $c))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Tax classes retrieved', ['tax_classes' => $classes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'status' => 'nullable|boolean',
        ]);

        $class = TaxClass::create($validated);

        return $this->success('Tax class created', ['class' => $class], 201);
    }

    public function show($id)
    {
        $class = TaxClass::find($id);
        if (!$class) return $this->notFound('Tax class not found');

        return $this->success('Tax class retrieved', ['tax_class' => $class]);
    }

    public function update(Request $request, $id)
    {
        $class = TaxClass::find($id);
        if (!$class) return $this->notFound('Tax class not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'rate' => 'sometimes|numeric|min:0|max:100',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'status' => 'nullable|boolean',
        ]);

        $class->update($validated);

        return $this->success('Tax class updated', ['class' => $class]);
    }

    public function destroy($id)
    {
        $class = TaxClass::find($id);
        if (!$class) return $this->notFound('Tax class not found');

        $class->delete();
        return $this->success('Tax class deleted');
    }
}
