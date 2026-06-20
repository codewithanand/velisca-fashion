<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CourierController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $couriers = Courier::when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Couriers retrieved', ['couriers' => $couriers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tracking_url' => 'nullable|string',
            'contact_number' => 'nullable|string|max:50',
            'status' => 'nullable|boolean',
        ]);

        $courier = Courier::create($validated);

        return $this->success('Courier created', ['courier' => $courier], 201);
    }

    public function update(Request $request, $id)
    {
        $courier = Courier::find($id);
        if (! $courier) {
            return $this->notFound('Courier not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'tracking_url' => 'nullable|string',
            'contact_number' => 'nullable|string|max:50',
            'status' => 'nullable|boolean',
        ]);

        $courier->update($validated);

        return $this->success('Courier updated', ['courier' => $courier]);
    }

    public function destroy($id)
    {
        $courier = Courier::find($id);
        if (! $courier) {
            return $this->notFound('Courier not found');
        }

        $courier->delete();

        return $this->success('Courier deleted');
    }
}
