<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class InventoryLogController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $logs = InventoryLog::with(['product', 'warehouse'])
            ->when($request->product_id, fn ($q, $v) => $q->where('product_id', $v))
            ->when($request->variant_id, fn ($q, $v) => $q->where('variant_id', $v))
            ->when($request->warehouse_id, fn ($q, $v) => $q->where('warehouse_id', $v))
            ->when($request->movement_type, fn ($q, $v) => $q->where('movement_type', $v))
            ->when($request->from, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 50);

        return $this->success('Inventory logs retrieved', ['inventory_logs' => $logs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'movement_type' => 'required|string|in:in,out,adjustment',
            'quantity' => 'required|integer',
            'remarks' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $log = InventoryLog::create($validated);

        return $this->success('Inventory log created', ['log' => $log], 201);
    }
}
