<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = ['user_id', 'session_id', 'status'];

    protected $casts = [
        'status' => 'string',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activeItems(): HasMany
    {
        return $this->hasMany(CartItem::class)->where('save_for_later', false);
    }

    public function savedForLater(): HasMany
    {
        return $this->hasMany(CartItem::class)->where('save_for_later', true);
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->activeItems()->sum('subtotal');
    }

    public function getItemsCountAttribute(): int
    {
        return $this->activeItems()->sum('quantity');
    }
}
