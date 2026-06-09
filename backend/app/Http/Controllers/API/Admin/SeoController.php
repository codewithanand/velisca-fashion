<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoPage;
use App\Models\Redirect;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    use ApiResponseTrait;

    // ─── SEO Pages ──────────────────────────────────────────────────

    public function index(Request $request)
    {
        $pages = SeoPage::when($request->page_type, fn($q, $t) => $q->where('page_type', $t))
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('meta_title', 'like', "%{$s}%")
                  ->orWhere('meta_description', 'like', "%{$s}%");
            }))
            ->orderBy('page_type')
            ->get();

        return $this->success('SEO pages retrieved', ['seo_pages' => $pages]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'page_type' => 'required|string|max:100',
            'page_reference_id' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'canonical_url' => 'nullable|string',
        ]);

        $page = SeoPage::create($validated);

        return $this->success('SEO page created', ['page' => $page], 201);
    }

    public function update(Request $request, $id)
    {
        $page = SeoPage::find($id);
        if (!$page) return $this->notFound('SEO page not found');

        $validated = $request->validate([
            'page_type' => 'sometimes|string|max:100',
            'page_reference_id' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'canonical_url' => 'nullable|string',
        ]);

        $page->update($validated);

        return $this->success('SEO page updated', ['page' => $page]);
    }

    public function destroy($id)
    {
        $page = SeoPage::find($id);
        if (!$page) return $this->notFound('SEO page not found');

        $page->delete();
        return $this->success('SEO page deleted');
    }

    // ─── Redirects ──────────────────────────────────────────────────

    public function redirects(Request $request)
    {
        $redirects = Redirect::when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('source_url', 'like', "%{$s}%")
                  ->orWhere('destination_url', 'like', "%{$s}%");
            }))
            ->orderBy('source_url')
            ->get();

        return $this->success('Redirects retrieved', ['redirects' => $redirects]);
    }

    public function storeRedirect(Request $request)
    {
        $validated = $request->validate([
            'source_url' => 'required|string|unique:redirects,source_url',
            'destination_url' => 'required|string',
            'redirect_type' => 'nullable|integer|in:301,302',
        ]);

        $redirect = Redirect::create($validated);

        return $this->success('Redirect created', ['redirect' => $redirect], 201);
    }

    public function updateRedirect(Request $request, $id)
    {
        $redirect = Redirect::find($id);
        if (!$redirect) return $this->notFound('Redirect not found');

        $validated = $request->validate([
            'source_url' => 'sometimes|string|unique:redirects,source_url,' . $id,
            'destination_url' => 'sometimes|string',
            'redirect_type' => 'nullable|integer|in:301,302',
        ]);

        $redirect->update($validated);

        return $this->success('Redirect updated', ['redirect' => $redirect]);
    }

    public function deleteRedirect($id)
    {
        $redirect = Redirect::find($id);
        if (!$redirect) return $this->notFound('Redirect not found');

        $redirect->delete();
        return $this->success('Redirect deleted');
    }
}
