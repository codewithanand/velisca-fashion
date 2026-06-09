<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatus extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'color',
        'sort_order',
        'is_final',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_final' => 'boolean',
            'status' => 'boolean',
        ];
    }
}
