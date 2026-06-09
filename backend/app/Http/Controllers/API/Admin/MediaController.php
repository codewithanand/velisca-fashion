<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaFolder;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    use ApiResponseTrait;

    // ─── Media Items ────────────────────────────────────────────────

    public function index(Request $request)
    {
        $items = Media::with('folder')
            ->when($request->folder_id, fn($q, $v) => $q->where('folder_id', $v))
            ->when($request->file_type, fn($q, $t) => $q->where('file_type', $t))
            ->when($request->search, fn($q, $s) => $q->where('file_name', 'like', "%{$s}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 50);

        return $this->success('Media items retrieved', ['media' => $items]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'folder_id' => 'nullable|exists:media_folders,id',
            'file_name' => 'required|string|max:255',
            'file_path' => 'required|string',
            'file_type' => 'nullable|string|max:50',
            'mime_type' => 'nullable|string|max:100',
            'file_size' => 'nullable|integer',
            'alt_text' => 'nullable|string|max:255',
        ]);

        $validated['uploaded_by'] = auth()->id();
        $media = Media::create($validated);

        return $this->success('Media item created', ['item' => $media], 201);
    }

    public function update(Request $request, $id)
    {
        $media = Media::find($id);
        if (!$media) return $this->notFound('Media item not found');

        $validated = $request->validate([
            'folder_id' => 'nullable|exists:media_folders,id',
            'file_name' => 'sometimes|string|max:255',
            'alt_text' => 'nullable|string|max:255',
        ]);

        $media->update($validated);

        return $this->success('Media item updated', ['item' => $media]);
    }

    public function destroy($id)
    {
        $media = Media::find($id);
        if (!$media) return $this->notFound('Media item not found');

        $media->delete();
        return $this->success('Media item deleted');
    }

    // ─── Media Folders ──────────────────────────────────────────────

    public function folders(Request $request)
    {
        $folders = MediaFolder::withCount('media')
            ->with('children')
            ->when($request->parent_id !== null, fn($q, $v) => $q->where('parent_id', $v), fn($q) => $q->whereNull('parent_id'))
            ->orderBy('name')
            ->get();

        return $this->success('Media folders retrieved', ['folders' => $folders]);
    }

    public function storeFolder(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        $folder = MediaFolder::create($validated);

        return $this->success('Media folder created', ['folder' => $folder], 201);
    }

    public function updateFolder(Request $request, $id)
    {
        $folder = MediaFolder::find($id);
        if (!$folder) return $this->notFound('Media folder not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        $folder->update($validated);

        return $this->success('Media folder updated', ['folder' => $folder]);
    }

    public function deleteFolder($id)
    {
        $folder = MediaFolder::find($id);
        if (!$folder) return $this->notFound('Media folder not found');

        $folder->media()->delete();
        $folder->children()->each(function ($child) {
            $child->media()->delete();
            $child->delete();
        });
        $folder->delete();
        return $this->success('Media folder deleted');
    }
}
