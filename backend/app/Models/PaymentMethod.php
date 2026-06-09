<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'code',
        'icon',
        'gateway',
        'supports_refund',
        'supports_partial_payment',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'supports_refund' => 'boolean',
            'supports_partial_payment' => 'boolean',
            'status' => 'boolean',
        ];
    }
}
