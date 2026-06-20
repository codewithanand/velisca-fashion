<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Database\Eloquent\Collection;

class AddressService
{
    public function getAddresses(int $userId): Collection
    {
        return Address::where('user_id', $userId)
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getAddress(int $id, int $userId): Address
    {
        return Address::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function create(int $userId, array $data): Address
    {
        $data['user_id'] = $userId;

        if (! isset($data['is_default'])) {
            $data['is_default'] = ! Address::where('user_id', $userId)->exists();
        }

        return Address::create($data);
    }

    public function update(int $id, int $userId, array $data): Address
    {
        $address = $this->getAddress($id, $userId);
        $address->update($data);

        return $address->fresh();
    }

    public function delete(int $id, int $userId): void
    {
        $address = $this->getAddress($id, $userId);
        $address->delete();
    }

    public function setDefault(int $id, int $userId): Address
    {
        $address = $this->getAddress($id, $userId);

        Address::where('user_id', $userId)
            ->where('id', '!=', $address->id)
            ->update(['is_default' => false]);

        $address->update(['is_default' => true]);

        return $address->fresh();
    }
}
