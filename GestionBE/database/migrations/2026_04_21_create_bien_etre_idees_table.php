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
        Schema::create('bien_etre_idees', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->string('type')->nullable();
            $table->string('budget')->nullable();
            $table->string('urgence')->default('Normal'); // Faible, Normal, Urgent
            $table->string('pdfName')->nullable();
            $table->longText('pdfDataUrl')->nullable();
            $table->integer('votes')->default(0);
            $table->string('status')->default('En attente'); // En attente, Validee, Refusee
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bien_etre_idees');
    }
};
