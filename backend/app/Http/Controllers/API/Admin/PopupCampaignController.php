<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\PopupCampaign;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class PopupCampaignController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $popups = PopupCampaign::orderBy('created_at', 'desc')->get();

        return $this->success('Popup campaigns retrieved', ['popups' => $popups]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'popup_type' => 'required|string|max:50',
            'image' => 'nullable|string',
            'message' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'trigger_type' => 'nullable|string|max:50',
            'delay_seconds' => 'nullable|integer|min:0|max:300',
            'show_on_mobile' => 'nullable|boolean',
            'settings_json' => 'nullable|array',
            'status' => 'nullable|boolean',
        ]);

        $popup = PopupCampaign::create($validated);

        return $this->success('Popup campaign created', ['popup' => $popup], 201);
    }

    public function show($id)
    {
        $popup = PopupCampaign::find($id);
        if (! $popup) {
            return $this->notFound('Popup campaign not found');
        }

        return $this->success('Popup campaign retrieved', ['popup' => $popup]);
    }

    public function update(Request $request, $id)
    {
        $popup = PopupCampaign::find($id);
        if (! $popup) {
            return $this->notFound('Popup campaign not found');
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'popup_type' => 'sometimes|string|max:50',
            'image' => 'nullable|string',
            'message' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_link' => 'nullable|string|max:255',
            'trigger_type' => 'nullable|string|max:50',
            'delay_seconds' => 'nullable|integer|min:0|max:300',
            'show_on_mobile' => 'nullable|boolean',
            'settings_json' => 'nullable|array',
            'status' => 'nullable|boolean',
        ]);

        $popup->update($validated);

        return $this->success('Popup campaign updated', ['popup' => $popup->fresh()]);
    }

    public function destroy($id)
    {
        $popup = PopupCampaign::find($id);
        if (! $popup) {
            return $this->notFound('Popup campaign not found');
        }
        $popup->delete();

        return $this->success('Popup campaign deleted');
    }
}
