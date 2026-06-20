<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnnouncementBar;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class AnnouncementBarController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        $bars = AnnouncementBar::orderBy('created_at', 'desc')->get();

        return $this->success('Announcement bars retrieved', ['bars' => $bars]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'link' => 'nullable|string|max:255',
            'background_color' => 'nullable|string|max:20',
            'text_color' => 'nullable|string|max:20',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|boolean',
        ]);

        $bar = AnnouncementBar::create($validated);

        return $this->success('Announcement bar created', ['bar' => $bar], 201);
    }

    public function show($id)
    {
        $bar = AnnouncementBar::find($id);
        if (! $bar) {
            return $this->notFound('Announcement bar not found');
        }

        return $this->success('Announcement bar retrieved', ['bar' => $bar]);
    }

    public function update(Request $request, $id)
    {
        $bar = AnnouncementBar::find($id);
        if (! $bar) {
            return $this->notFound('Announcement bar not found');
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'link' => 'nullable|string|max:255',
            'background_color' => 'nullable|string|max:20',
            'text_color' => 'nullable|string|max:20',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|boolean',
        ]);

        $bar->update($validated);

        return $this->success('Announcement bar updated', ['bar' => $bar->fresh()]);
    }

    public function destroy($id)
    {
        $bar = AnnouncementBar::find($id);
        if (! $bar) {
            return $this->notFound('Announcement bar not found');
        }
        $bar->delete();

        return $this->success('Announcement bar deleted');
    }
}
