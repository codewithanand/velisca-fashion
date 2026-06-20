<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Country;
use App\Models\State;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    use ApiResponseTrait;

    // ─── Countries ──────────────────────────────────────────────────

    public function countries(Request $request)
    {
        $countries = Country::withCount('states')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Countries retrieved', ['countries' => $countries]);
    }

    public function storeCountry(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'iso_code' => 'nullable|string|max:10|unique:countries,iso_code',
            'phone_code' => 'nullable|string|max:10',
            'currency' => 'nullable|string|max:10',
            'status' => 'nullable|boolean',
        ]);

        $country = Country::create($validated);

        return $this->success('Country created', ['country' => $country], 201);
    }

    public function updateCountry(Request $request, $id)
    {
        $country = Country::find($id);
        if (! $country) {
            return $this->notFound('Country not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'iso_code' => 'sometimes|string|max:10|unique:countries,iso_code,'.$id,
            'phone_code' => 'nullable|string|max:10',
            'currency' => 'nullable|string|max:10',
            'status' => 'nullable|boolean',
        ]);

        $country->update($validated);

        return $this->success('Country updated', ['country' => $country]);
    }

    public function deleteCountry($id)
    {
        $country = Country::find($id);
        if (! $country) {
            return $this->notFound('Country not found');
        }

        $country->states()->each(function ($state) {
            $state->cities()->delete();
        });
        $country->states()->delete();
        $country->delete();

        return $this->success('Country deleted');
    }

    // ─── States ─────────────────────────────────────────────────────

    public function states($countryId)
    {
        $country = Country::find($countryId);
        if (! $country) {
            return $this->notFound('Country not found');
        }

        $states = $country->states()->withCount('cities')->orderBy('name')->get();

        return $this->success('States retrieved', ['states' => $states]);
    }

    public function storeState(Request $request)
    {
        $validated = $request->validate([
            'country_id' => 'required|exists:countries,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'status' => 'nullable|boolean',
        ]);

        $state = State::create($validated);

        return $this->success('State created', ['state' => $state], 201);
    }

    public function updateState(Request $request, $id)
    {
        $state = State::find($id);
        if (! $state) {
            return $this->notFound('State not found');
        }

        $validated = $request->validate([
            'country_id' => 'sometimes|exists:countries,id',
            'name' => 'sometimes|string|max:255',
            'code' => 'nullable|string|max:10',
            'status' => 'nullable|boolean',
        ]);

        $state->update($validated);

        return $this->success('State updated', ['state' => $state]);
    }

    public function deleteState($id)
    {
        $state = State::find($id);
        if (! $state) {
            return $this->notFound('State not found');
        }

        $state->cities()->delete();
        $state->delete();

        return $this->success('State deleted');
    }

    // ─── Cities ─────────────────────────────────────────────────────

    public function cities($stateId)
    {
        $state = State::find($stateId);
        if (! $state) {
            return $this->notFound('State not found');
        }

        $cities = $state->cities()->orderBy('name')->get();

        return $this->success('Cities retrieved', ['cities' => $cities]);
    }

    public function storeCity(Request $request)
    {
        $validated = $request->validate([
            'state_id' => 'required|exists:states,id',
            'name' => 'required|string|max:255',
            'status' => 'nullable|boolean',
        ]);

        $city = City::create($validated);

        return $this->success('City created', ['city' => $city], 201);
    }

    public function updateCity(Request $request, $id)
    {
        $city = City::find($id);
        if (! $city) {
            return $this->notFound('City not found');
        }

        $validated = $request->validate([
            'state_id' => 'sometimes|exists:states,id',
            'name' => 'sometimes|string|max:255',
            'status' => 'nullable|boolean',
        ]);

        $city->update($validated);

        return $this->success('City updated', ['city' => $city]);
    }

    public function deleteCity($id)
    {
        $city = City::find($id);
        if (! $city) {
            return $this->notFound('City not found');
        }

        $city->delete();

        return $this->success('City deleted');
    }
}
