<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sizes', function (Blueprint $table) {
            $table->string('code')->nullable()->after('name');
            $table->string('international_size')->nullable()->after('code');
            $table->string('chest')->nullable()->after('international_size');
            $table->string('waist')->nullable()->after('chest');
            $table->string('hips')->nullable()->after('waist');
        });
    }

    public function down(): void
    {
        Schema::table('sizes', function (Blueprint $table) {
            $table->dropColumn(['code', 'international_size', 'chest', 'waist', 'hips']);
        });
    }
};
