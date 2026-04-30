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
        Schema::create('demandes_attestations', function (Blueprint $table) {
                $table->id();
                $table->string('employe');
                $table->string('type');
                $table->string('langue');
                $table->string('destinataire');
                $table->date('date_souhaitee');
                $table->string('statut')->default('En attente');
                $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_attestations');
    }
};
