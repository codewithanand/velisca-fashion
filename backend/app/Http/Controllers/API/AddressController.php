<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AddressService;
use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AddressService $addressService,
    ) {}

    public function index(): JsonResponse
    {
        $addresses = $this->addressService->getAddresses(auth()->id());

        return $this->success('Addresses retrieved', [
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'address_type' => 'nullable|string|in:home,work,other',
            'is_default' => 'nullable|boolean',
        ]);

        $address = $this->addressService->create(auth()->id(), $validated);

        return $this->success('Address created', [
            'address' => $address,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'city' => 'sometimes|string|max:100',
            'postal_code' => 'sometimes|string|max:20',
            'address_line_1' => 'sometimes|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'address_type' => 'nullable|string|in:home,work,other',
            'is_default' => 'nullable|boolean',
        ]);

        try {
            $address = $this->addressService->update((int) $id, auth()->id(), $validated);
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Address not found');
        }

        return $this->success('Address updated', [
            'address' => $address,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->addressService->delete((int) $id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Address not found');
        }

        return $this->success('Address deleted');
    }

    public function setDefault(string $id): JsonResponse
    {
        try {
            $address = $this->addressService->setDefault((int) $id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFound('Address not found');
        }

        return $this->success('Default address updated', [
            'address' => $address,
        ]);
    }
}
