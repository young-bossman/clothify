<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('stock_movements', function (Blueprint $table) {
        $table->id();

        $table->foreignId('product_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->integer('quantity');
        // Positive = stock in
        // Negative = stock out

        $table->string('type');
        // purchase, sale, adjustment, return, etc.

        $table->text('note')->nullable();

        $table->foreignId('user_id')
              ->nullable()
              ->constrained()
              ->nullOnDelete();

        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('stock_movements');
}

};
