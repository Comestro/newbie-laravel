<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retailer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('shop_name')->nullable();
            $table->text('shop_address')->nullable();
            $table->string('gst_number')->nullable();
            $table->string('shop_image')->nullable();
            $table->string('aadhaar_card')->nullable();
            $table->string('aadhaar_card_front')->nullable();
            $table->string('aadhaar_card_back')->nullable();
            $table->string('status')->default('PENDING'); // PENDING, VERIFIED, REJECTED
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retailer_profiles');
    }
};
