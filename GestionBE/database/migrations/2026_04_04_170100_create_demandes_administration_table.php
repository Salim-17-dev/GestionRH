<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_administration', function (Blueprint $table) {
            $table->id();
            $table->string('employe');
            $table->string('type_demande');
            $table->date('date_demande');
            $table->string('statut')->default('En attente');
            $table->text('commentaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_administration');
    }
};
