<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->text('cover_letter')->nullable();
            $table->string('status')->default('pending'); // pending, accepted, rejected
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Le candidat
             $table->foreignId('job_id')->constrained('job_offers')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('applications');
    }
};