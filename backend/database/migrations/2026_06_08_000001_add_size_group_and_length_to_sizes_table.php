<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sizes', function (Blueprint $table) {
            $table->renameColumn('category', 'size_group');
            $table->string('length')->nullable()->after('hips');
        });
    }

    public function down(): void
    {
        Schema::table('sizes', function (Blueprint $table) {
            $table->renameColumn('size_group', 'category');
            $table->dropColumn('length');
        });
    }
};
