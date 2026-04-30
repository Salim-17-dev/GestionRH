<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_materiels', function (Blueprint $table) {
            $table->id();
            $table->string('demandeur');
            $table->string('categorie');
            $table->string('equipement_souhaite');
            $table->enum('urgence', ['Faible', 'Normal', 'Urgent']);
            $table->date('date_souhaitee')->nullable();
            $table->text('justificatif');
            $table->string('piece_jointe')->nullable();
            $table->string('statut')->default('En attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_materiels');
    }
};
