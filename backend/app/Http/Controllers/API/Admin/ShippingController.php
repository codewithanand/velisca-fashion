<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Models\ShippingRate;
use App\Models\ShippingZone;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    use ApiResponseTrait;

    // ─── Shipping Methods ───────────────────────────────────────────

    public function methods(Request $request)
    {
        $methods = ShippingMethod::withCount('rates')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Shipping methods retrieved', ['methods' => $methods]);
    }

    public function storeMethod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:shipping_methods,code',
            'type' => 'nullable|string|max:50',
            'delivery_time' => 'nullable|string|max:100',
            'base_cost' => 'nullable|numeric|min:0',
            'status' => 'nullable|boolean',
        ]);

        $method = ShippingMethod::create($validated);

        return $this->success('Shipping method created', ['method' => $method], 201);
    }

    public function updateMethod(Request $request, $id)
    {
        $method = ShippingMethod::find($id);
        if (! $method) {
            return $this->notFound('Shipping method not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:shipping_methods,code,'.$id,
            'type' => 'nullable|string|max:50',
            'delivery_time' => 'nullable|string|max:100',
            'base_cost' => 'nullable|numeric|min:0',
            'status' => 'nullable|boolean',
        ]);

        $method->update($validated);

        return $this->success('Shipping method updated', ['method' => $method]);
    }

    public function deleteMethod($id)
    {
        $method = ShippingMethod::find($id);
        if (! $method) {
            return $this->notFound('Shipping method not found');
        }

        $method->rates()->delete();
        $method->delete();

        return $this->success('Shipping method deleted');
    }

    // ─── Shipping Zones ─────────────────────────────────────────────

    public function zones(Request $request)
    {
        $zones = ShippingZone::when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Shipping zones retrieved', ['zones' => $zones]);
    }

    public function storeZone(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'status' => 'nullable|boolean',
        ]);

        $zone = ShippingZone::create($validated);

        return $this->success('Shipping zone created', ['zone' => $zone], 201);
    }

    public function updateZone(Request $request, $id)
    {
        $zone = ShippingZone::find($id);
        if (! $zone) {
            return $this->notFound('Shipping zone not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'status' => 'nullable|boolean',
        ]);

        $zone->update($validated);

        return $this->success('Shipping zone updated', ['zone' => $zone]);
    }

    public function deleteZone($id)
    {
        $zone = ShippingZone::find($id);
        if (! $zone) {
            return $this->notFound('Shipping zone not found');
        }

        $zone->delete();

        return $this->success('Shipping zone deleted');
    }

    // ─── Shipping Rates ─────────────────────────────────────────────

    public function rates(Request $request)
    {
        $query = ShippingRate::with(['shippingMethod', 'shippingZone']);

        if ($request->shipping_method_id) {
            $query->where('shipping_method_id', $request->shipping_method_id);
        }

        if ($request->shipping_zone_id) {
            $query->where('shipping_zone_id', $request->shipping_zone_id);
        }

        $rates = $query->orderBy('minimum_order')->get();

        return $this->success('Shipping rates retrieved', ['rates' => $rates]);
    }

    public function storeRate(Request $request)
    {
        $validated = $request->validate([
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'shipping_zone_id' => 'nullable|exists:shipping_zones,id',
            'minimum_order' => 'nullable|numeric|min:0',
            'maximum_order' => 'nullable|numeric|min:0|gte:minimum_order',
            'rate' => 'required|numeric|min:0',
        ]);

        $rate = ShippingRate::create($validated);

        return $this->success('Shipping rate created', ['rate' => $rate], 201);
    }

    public function updateRate(Request $request, $id)
    {
        $rate = ShippingRate::find($id);
        if (! $rate) {
            return $this->notFound('Shipping rate not found');
        }

        $validated = $request->validate([
            'shipping_method_id' => 'sometimes|exists:shipping_methods,id',
            'shipping_zone_id' => 'nullable|exists:shipping_zones,id',
            'minimum_order' => 'nullable|numeric|min:0',
            'maximum_order' => 'nullable|numeric|min:0|gte:minimum_order',
            'rate' => 'sometimes|numeric|min:0',
        ]);

        $rate->update($validated);

        return $this->success('Shipping rate updated', ['rate' => $rate]);
    }

    public function deleteRate($id)
    {
        $rate = ShippingRate::find($id);
        if (! $rate) {
            return $this->notFound('Shipping rate not found');
        }

        $rate->delete();

        return $this->success('Shipping rate deleted');
    }
}
