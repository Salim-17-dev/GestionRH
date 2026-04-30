<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restitutions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipement_id')->constrained('equipements')->cascadeOnDelete();
            $table->foreignId('affectation_id')->nullable()->constrained('affectations')->nullOnDelete();
            $table->foreignId('employe_actuel_id')->nullable()->constrained('employes')->nullOnDelete();
            $table->date('date_attribution')->nullable();
            $table->string('etat')->nullable();
            $table->enum('statut', ['restitue', 'transfere']);

            $table->date('date_retour')->nullable();
            $table->string('etat_retour')->nullable();

            $table->foreignId('nouvel_employe_id')->nullable()->constrained('employes')->nullOnDelete();
            $table->date('date_transfert')->nullable();

            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restitutions');
    }
};
