<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnouncementBar extends Model
{
    protected $fillable = [
        'title',
        'message',
        'link',
        'background_color',
        'text_color',
        'start_date',
        'end_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
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
