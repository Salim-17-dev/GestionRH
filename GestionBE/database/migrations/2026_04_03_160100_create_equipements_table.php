<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipements', function (Blueprint $table) {
            $table->id();
            $table->string('designation');
            $table->string('categorie');
            $table->string('numero_serie')->unique();
            $table->decimal('valeur', 12, 2)->nullable();
            $table->string('etat')->default('Bon');
            $table->string('statut')->default('Disponible');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipements');
    }
};
