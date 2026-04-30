<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reclamations_rh', function (Blueprint $table) {
            $table->id();
            $table->string('employe');
            $table->string('type_reclamation');
            $table->decimal('montant', 12, 2)->nullable();
            $table->date('date');
            $table->string('statut')->default('En attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reclamations_rh');
    }
};
