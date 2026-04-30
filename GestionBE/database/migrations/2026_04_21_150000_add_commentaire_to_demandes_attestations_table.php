<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes_attestations', function (Blueprint $table) {
            $table->text('commentaire')->nullable()->after('date_souhaitee');
        });
    }

    public function down(): void
    {
        Schema::table('demandes_attestations', function (Blueprint $table) {
            $table->dropColumn('commentaire');
        });
    }
};
