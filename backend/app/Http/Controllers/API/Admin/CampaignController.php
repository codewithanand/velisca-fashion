<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $campaigns = Campaign::when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->campaign_type, fn ($q, $t) => $q->where('campaign_type', $t))
            ->when($request->status !== null, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->success('Campaigns retrieved', $campaigns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'campaign_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|boolean',
            'settings_json' => 'nullable|array',
        ]);

        $campaign = Campaign::create($validated);

        return $this->success('Campaign created', ['campaign' => $campaign], 201);
    }

    public function show($id)
    {
        $campaign = Campaign::find($id);
        if (! $campaign) {
            return $this->notFound('Campaign not found');
        }

        return $this->success('Campaign retrieved', ['campaign' => $campaign]);
    }

    public function update(Request $request, $id)
    {
        $campaign = Campaign::find($id);
        if (! $campaign) {
            return $this->notFound('Campaign not found');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'campaign_type' => 'sometimes|string|max:50',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|boolean',
            'settings_json' => 'nullable|array',
        ]);

        $campaign->update($validated);

        return $this->success('Campaign updated', ['campaign' => $campaign->fresh()]);
    }

    public function destroy($id)
    {
        $campaign = Campaign::find($id);
        if (! $campaign) {
            return $this->notFound('Campaign not found');
        }
        $campaign->delete();

        return $this->success('Campaign deleted');
    }
}
