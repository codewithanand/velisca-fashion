<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class NotificationTemplateController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request)
    {
        $templates = NotificationTemplate::when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->status !== null, fn($q) => $q->where('status', $request->status))
            ->orderBy('name')
            ->get();

        return $this->success('Notification templates retrieved', ['templates' => $templates]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'status' => 'nullable|boolean',
        ]);

        $template = NotificationTemplate::create($validated);

        return $this->success('Notification template created', ['template' => $template], 201);
    }

    public function show($id)
    {
        $template = NotificationTemplate::find($id);
        if (!$template) return $this->notFound('Notification template not found');

        return $this->success('Notification template retrieved', ['template' => $template]);
    }

    public function update(Request $request, $id)
    {
        $template = NotificationTemplate::find($id);
        if (!$template) return $this->notFound('Notification template not found');

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'nullable|string|max:100',
            'subject' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
            'variables' => 'nullable|array',
            'status' => 'nullable|boolean',
        ]);

        $template->update($validated);

        return $this->success('Notification template updated', ['template' => $template]);
    }

    public function destroy($id)
    {
        $template = NotificationTemplate::find($id);
        if (!$template) return $this->notFound('Notification template not found');

        $template->delete();
        return $this->success('Notification template deleted');
    }
}
