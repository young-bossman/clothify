<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    //  use HasFactory;

    protected $fillable = [
        'order_id',
        'product_variant_id',
        'quantity',
        'price_at_purchase',
        'cost_at_purchase',
    ];

    // Order item belongs to an order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Order item belongs to a product variant
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
