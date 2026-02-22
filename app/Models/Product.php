<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// ADDED: import related models
use App\Models\Category;
use App\Models\StockMovement;
use App\Models\ProductVariant;

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

    // Adjust stock quantity and log the movement
    public function adjustStock($quantity, $type, $note = null, $userId = null)
    {
        $newStock = $this->stock_quantity + $quantity;

        if ($newStock < 0) {
            throw new \Exception('Insufficient stock');
        }

        $this->stock_quantity = $newStock;
        $this->save();

        $this->stockMovements()->create([
            'quantity' => $quantity,
            'type' => $type,
            'note' => $note,
            'user_id' => $userId,
        ]);
    }

}
