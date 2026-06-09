<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderStatus;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderStatusController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $statuses = OrderStatus::when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('sort_order')
            ->get();

        return $this->success('Order statuses retrieved', ['order_statuses' => $statuses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:order_statuses,slug',
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer|min:0',
            'is_final' => 'nullable|boolean',
            'status' => 'nullable|boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $status = OrderStatus::create($validated);

        return $this->success('Order status created', ['status' => $status], 201);
    }

    public function show($id)
    {
        $status = OrderStatus::find($id);
        if (!$status) return $this->notFound('Order status not found');

        return $this->success('Order status retrieved', ['order_status' => $status]);
    }

    public function update(Request $request, $id)
    {
        $status = OrderStatus::find($id);
        if (!$status) return $this->notFound('Order status not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:order_statuses,slug,' . $id,
            'color' => 'nullable|string|max:20',
            'sort_order' => 'nullable|integer|min:0',
            'is_final' => 'nullable|boolean',
            'status' => 'nullable|boolean',
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $status->update($validated);

        return $this->success('Order status updated', ['status' => $status]);
    }

    public function destroy($id)
    {
        $status = OrderStatus::find($id);
        if (!$status) return $this->notFound('Order status not found');

        $status->delete();
        return $this->success('Order status deleted');
    }
}
