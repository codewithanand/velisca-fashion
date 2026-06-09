<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewStatus extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'color',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }
}
