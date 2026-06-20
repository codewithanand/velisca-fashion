<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'name',
        'campaign_type',
        'description',
        'start_date',
        'end_date',
        'status',
        'settings_json',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'settings_json' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            });
    }
}
