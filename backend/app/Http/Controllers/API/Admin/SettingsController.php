<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    use ApiResponseTrait;

    public function index()
    {
        return $this->success('Settings retrieved', [
            'settings' => [],
        ]);
    }

    public function update(Request $request)
    {
        return $this->success('Settings updated');
    }
}
