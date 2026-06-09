<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('banner')->nullable()->after('logo');
            $table->boolean('featured')->default(false)->after('banner');
            $table->string('seo_title')->nullable()->after('featured');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->text('seo_keywords')->nullable()->after('seo_description');
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['banner', 'featured', 'seo_title', 'seo_description', 'seo_keywords']);
        });
    }
};
