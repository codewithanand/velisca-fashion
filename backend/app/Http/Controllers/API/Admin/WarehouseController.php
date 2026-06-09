<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $warehouses = Warehouse::when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Warehouses retrieved', ['warehouses' => $warehouses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:warehouses,code',
            'location' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        $warehouse = Warehouse::create($validated);

        return $this->success('Warehouse created', ['warehouse' => $warehouse], 201);
    }

    public function show($id)
    {
        $warehouse = Warehouse::find($id);
        if (!$warehouse) return $this->notFound('Warehouse not found');

        return $this->success('Warehouse retrieved', ['warehouse' => $warehouse]);
    }

    public function update(Request $request, $id)
    {
        $warehouse = Warehouse::find($id);
        if (!$warehouse) return $this->notFound('Warehouse not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:warehouses,code,' . $id,
            'location' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        $warehouse->update($validated);

        return $this->success('Warehouse updated', ['warehouse' => $warehouse]);
    }

    public function destroy($id)
    {
        $warehouse = Warehouse::find($id);
        if (!$warehouse) return $this->notFound('Warehouse not found');

        $warehouse->delete();
        return $this->success('Warehouse deleted');
    }
}
