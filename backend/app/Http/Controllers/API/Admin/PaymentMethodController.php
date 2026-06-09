<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $methods = PaymentMethod::when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->gateway, fn($q, $g) => $q->where('gateway', $g))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('sort_order')
            ->get();

        return $this->success('Payment methods retrieved', ['payment_methods' => $methods]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods,code',
            'icon' => 'nullable|string',
            'gateway' => 'nullable|string|max:100',
            'supports_refund' => 'nullable|boolean',
            'supports_partial_payment' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $method = PaymentMethod::create($validated);

        return $this->success('Payment method created', ['method' => $method], 201);
    }

    public function show($id)
    {
        $method = PaymentMethod::find($id);
        if (!$method) return $this->notFound('Payment method not found');

        return $this->success('Payment method retrieved', ['payment_method' => $method]);
    }

    public function update(Request $request, $id)
    {
        $method = PaymentMethod::find($id);
        if (!$method) return $this->notFound('Payment method not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:payment_methods,code,' . $id,
            'icon' => 'nullable|string',
            'gateway' => 'nullable|string|max:100',
            'supports_refund' => 'nullable|boolean',
            'supports_partial_payment' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'status' => 'nullable|boolean',
        ]);

        $method->update($validated);

        return $this->success('Payment method updated', ['method' => $method]);
    }

    public function destroy($id)
    {
        $method = PaymentMethod::find($id);
        if (!$method) return $this->notFound('Payment method not found');

        $method->delete();
        return $this->success('Payment method deleted');
    }

    public function toggle($id)
    {
        $method = PaymentMethod::find($id);
        if (!$method) return $this->notFound('Payment method not found');

        $method->update(['status' => !$method->status]);

        return $this->success('Payment method status toggled', ['method' => $method]);
    }
}
