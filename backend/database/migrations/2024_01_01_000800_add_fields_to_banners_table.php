<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('banner_type')->default('hero')->after('title');
            $table->string('link_type')->nullable()->after('button_text');
            $table->unsignedBigInteger('link_reference')->nullable()->after('link_type');
            $table->boolean('homepage_visibility')->default(true)->after('status');
            $table->integer('priority')->default(0)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['banner_type', 'link_type', 'link_reference', 'homepage_visibility', 'priority']);
        });
    }
};
