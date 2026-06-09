<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $query = Setting::orderBy('group')->orderBy('key');

        if ($request->group) {
            $query->where('group', $request->group);
        }

        $settings = $query->get()->groupBy('group');

        return $this->success('Settings retrieved', ['settings' => $settings]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $item) {
            Setting::updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'] ?? '',
                    'group' => $item['group'] ?? 'general',
                ]
            );
        }

        return $this->success('Settings updated');
    }

    public function groups()
    {
        $groups = Setting::select('group')
            ->distinct()
            ->orderBy('group')
            ->pluck('group');

        return $this->success('Setting groups retrieved', ['groups' => $groups]);
    }
}
