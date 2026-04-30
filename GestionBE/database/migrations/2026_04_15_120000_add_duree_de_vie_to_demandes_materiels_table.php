<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes_materiels', function (Blueprint $table) {
            $table->date('duree_de_vie')->nullable()->after('equipement_souhaite');
        });
    }

    public function down(): void
    {
        Schema::table('demandes_materiels', function (Blueprint $table) {
            $table->dropColumn('duree_de_vie');
        });
    }
};
