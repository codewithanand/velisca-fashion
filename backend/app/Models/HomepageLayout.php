<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageLayout extends Model
{
    protected $fillable = [
        'name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function sections()
    {
        return $this->hasMany(HomeSection::class, 'layout_id')->orderBy('sort_order');
    }
}
