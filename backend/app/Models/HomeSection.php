<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSection extends Model
{
    protected $fillable = [
        'title',
        'section_type',
        'section_key',
        'sort_order',
        'status',
        'layout_id',
        'settings_json',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'sort_order' => 'integer',
            'settings_json' => 'array',
        ];
    }

    public function layout()
    {
        return $this->belongsTo(HomepageLayout::class, 'layout_id');
    }

    public function items()
    {
        return $this->hasMany(SectionItem::class, 'section_id')->orderBy('sort_order');
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
