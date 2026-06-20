<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SectionItem extends Model
{
    protected $fillable = [
        'section_id',
        'reference_type',
        'reference_id',
        'sort_order',
        'settings_json',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'settings_json' => 'array',
        ];
    }

    public function section()
    {
        return $this->belongsTo(HomeSection::class, 'section_id');
    }

    public function reference()
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }
}
