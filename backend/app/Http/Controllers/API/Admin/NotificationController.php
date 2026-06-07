<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Notifications retrieved', [
            'notifications' => [],
        ]);
    }

    public function store(Request $request)
    {
        return $this->success('Notification sent', [], 201);
    }

    public function markRead($id)
    {
        return $this->success('Notification marked as read');
    }

    public function destroy($id)
    {
        return $this->success('Notification deleted');
    }
}
