<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reclamation_salaires', function (Blueprint $table) {
            $table->string('piece_jointe_nom')->nullable()->after('piece_jointe');
        });
    }

    public function down(): void
    {
        Schema::table('reclamation_salaires', function (Blueprint $table) {
            $table->dropColumn('piece_jointe_nom');
        });
    }
};
