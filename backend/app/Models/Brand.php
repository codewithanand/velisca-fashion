<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo',
        'banner',
        'website',
        'featured',
        'sort_order',
        'status',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
