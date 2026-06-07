<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id', 'product_id', 'variant_id',
        'product_name_snapshot', 'variant_snapshot', 'sku_snapshot',
        'price_snapshot', 'sale_price_snapshot',
        'quantity', 'subtotal', 'save_for_later',
    ];

    protected $casts = [
        'variant_snapshot' => 'array',
        'price_snapshot' => 'float',
        'sale_price_snapshot' => 'float',
        'subtotal' => 'float',
        'save_for_later' => 'boolean',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function getDisplayPriceAttribute(): float
    {
        return $this->sale_price_snapshot ?? $this->price_snapshot;
    }
}
