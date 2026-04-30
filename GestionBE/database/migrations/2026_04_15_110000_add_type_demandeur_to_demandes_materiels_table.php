<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes_materiels', function (Blueprint $table) {
            $table->string('type_demandeur')->default('employe')->after('id');
        });

        DB::table('demandes_materiels')
            ->whereNull('type_demandeur')
            ->update(['type_demandeur' => 'employe']);
    }

    public function down(): void
    {
        Schema::table('demandes_materiels', function (Blueprint $table) {
            $table->dropColumn('type_demandeur');
        });
    }
};
