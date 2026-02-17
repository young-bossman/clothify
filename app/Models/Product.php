<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    
//use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'price',
        'cost_price',
        'stock_quantity',
        'description',
        'image',
        'is_active',
        'category_id'
    ];

    // A product has many variants (sizes/colors)
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Each product belongs to one Category
        public function category()
        {
            return $this->belongsTo(Category::class);
        }

    // A product has many stock movements
            public function stockMovements()
        {
            return $this->hasMany(StockMovement::class);
        }



}
