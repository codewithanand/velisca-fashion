<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title',
        'type',
        'banner_type',
        'image',
        'mobile_image',
        'link',
        'link_type',
        'link_reference',
        'button_text',
        'sort_order',
        'priority',
        'start_date',
        'end_date',
        'status',
        'homepage_visibility',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'homepage_visibility' => 'boolean',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'priority' => 'integer',
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

    public function scopeHomepage($query)
    {
        return $query->where('homepage_visibility', true);
    }
}
