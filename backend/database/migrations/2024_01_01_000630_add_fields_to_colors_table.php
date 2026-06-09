<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('colors', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->string('color_family')->nullable()->after('hex_code');
            $table->integer('sort_order')->default(0)->after('color_family');
        });
    }

    public function down(): void
    {
        Schema::table('colors', function (Blueprint $table) {
            $table->dropColumn(['slug', 'color_family', 'sort_order']);
        });
    }
};
