<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $newsletters = Newsletter::when($request->search, fn ($q, $s) => $q->where('email', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->success('Newsletters retrieved', $newsletters);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:newsletters,email',
            'status' => 'nullable|string|in:subscribed,unsubscribed',
        ]);

        $newsletter = Newsletter::create($validated);

        return $this->success('Subscriber added', ['newsletter' => $newsletter], 201);
    }

    public function update(Request $request, $id)
    {
        $newsletter = Newsletter::find($id);
        if (! $newsletter) {
            return $this->notFound('Subscriber not found');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:subscribed,unsubscribed',
        ]);

        $newsletter->update($validated);

        return $this->success('Subscriber updated', ['newsletter' => $newsletter]);
    }

    public function destroy($id)
    {
        $newsletter = Newsletter::find($id);
        if (! $newsletter) {
            return $this->notFound('Subscriber not found');
        }
        $newsletter->delete();

        return $this->success('Subscriber deleted');
    }

    public function export()
    {
        $emails = Newsletter::subscribed()->pluck('email');

        return $this->success('Newsletter emails exported', ['emails' => $emails]);
    }
}
