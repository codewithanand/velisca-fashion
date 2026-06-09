<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReviewStatus;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReviewStatusController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $statuses = ReviewStatus::when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Review statuses retrieved', ['review_statuses' => $statuses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:review_statuses,slug',
            'color' => 'nullable|string|max:20',
            'status' => 'nullable|boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $status = ReviewStatus::create($validated);

        return $this->success('Review status created', ['status' => $status], 201);
    }

    public function update(Request $request, $id)
    {
        $status = ReviewStatus::find($id);
        if (!$status) return $this->notFound('Review status not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:review_statuses,slug,' . $id,
            'color' => 'nullable|string|max:20',
            'status' => 'nullable|boolean',
        ]);

        if (isset($validated['name']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $status->update($validated);

        return $this->success('Review status updated', ['status' => $status]);
    }

    public function destroy($id)
    {
        $status = ReviewStatus::find($id);
        if (!$status) return $this->notFound('Review status not found');

        $status->delete();
        return $this->success('Review status deleted');
    }
}
