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

Schema::create('reclamation_salaires', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employe_id')->nullable()->constrained('employes')->nullOnDelete();
    $table->string('mois_concerne');
    $table->string('type_probleme');
    $table->text('description');
    $table->string('piece_jointe')->nullable();
    $table->string('statut')->default('En attente');

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamation_salaires');
    }
};
