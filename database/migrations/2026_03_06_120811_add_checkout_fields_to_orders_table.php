<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('ghana_post_gps')->nullable()->after('region');
            $table->string('landmark')->nullable()->after('ghana_post_gps');
            $table->text('notes')->nullable()->after('landmark');
            $table->string('payment_method')->default('cash_on_delivery')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['ghana_post_gps', 'landmark', 'notes', 'payment_method']);
        });
    }
};