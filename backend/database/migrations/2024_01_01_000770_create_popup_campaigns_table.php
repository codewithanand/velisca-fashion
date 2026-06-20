<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('popup_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('popup_type')->default('newsletter');
            $table->string('image')->nullable();
            $table->text('message')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('trigger_type')->default('on_load');
            $table->integer('delay_seconds')->default(5);
            $table->boolean('show_on_mobile')->default(true);
            $table->json('settings_json')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('popup_campaigns');
    }
};
