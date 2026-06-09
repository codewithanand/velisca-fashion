<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $banners = Banner::when($request->search, fn($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('sort_order')
            ->get();

        return $this->success('Banners retrieved', ['banners' => $banners]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'image' => 'nullable|string',
            'mobile_image' => 'nullable|string',
            'link' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|boolean',
        ]);

        $banner = Banner::create($validated);

        return $this->success('Banner created', ['banner' => $banner], 201);
    }

    public function show($id)
    {
        $banner = Banner::find($id);
        if (!$banner) return $this->notFound('Banner not found');

        return $this->success('Banner retrieved', ['banner' => $banner]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::find($id);
        if (!$banner) return $this->notFound('Banner not found');

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:50',
            'image' => 'nullable|string',
            'mobile_image' => 'nullable|string',
            'link' => 'nullable|string',
            'button_text' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|boolean',
        ]);

        $banner->update($validated);

        return $this->success('Banner updated', ['banner' => $banner]);
    }

    public function destroy($id)
    {
        $banner = Banner::find($id);
        if (!$banner) return $this->notFound('Banner not found');

        $banner->delete();
        return $this->success('Banner deleted');
    }

    public function toggle($id)
    {
        $banner = Banner::find($id);
        if (!$banner) return $this->notFound('Banner not found');

        $banner->update(['status' => !$banner->status]);

        return $this->success('Banner status toggled', ['banner' => $banner]);
    }
}
