<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PopupCampaign extends Model
{
    protected $fillable = [
        'title',
        'popup_type',
        'image',
        'message',
        'cta_text',
        'cta_link',
        'trigger_type',
        'delay_seconds',
        'show_on_mobile',
        'settings_json',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'delay_seconds' => 'integer',
            'show_on_mobile' => 'boolean',
            'status' => 'boolean',
            'settings_json' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}
