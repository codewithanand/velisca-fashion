<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    use ApiResponseTrait;

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $existing = Newsletter::where('email', $validated['email'])->first();

        if ($existing) {
            if ($existing->status === 'unsubscribed') {
                $existing->update(['status' => 'subscribed', 'subscribed_at' => now()]);

                return $this->success('Successfully resubscribed');
            }

            return $this->success('Already subscribed');
        }

        Newsletter::create([
            'email' => $validated['email'],
            'status' => 'subscribed',
            'subscribed_at' => now(),
        ]);

        return $this->success('Successfully subscribed to newsletter', [], 201);
    }

    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $newsletter = Newsletter::where('email', $validated['email'])->first();
        if ($newsletter) {
            $newsletter->update(['status' => 'unsubscribed']);
        }

        return $this->success('Successfully unsubscribed');
    }
}
