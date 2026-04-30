<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE affectations ADD COLUMN duree_de_vie_days INT UNSIGNED NULL AFTER date_attribution');

        DB::statement("
            UPDATE affectations
            SET duree_de_vie_days = CASE
                WHEN duree_de_vie IS NULL OR date_attribution IS NULL THEN NULL
                ELSE GREATEST(DATEDIFF(duree_de_vie, date_attribution), 0)
            END
        ");

        DB::statement('ALTER TABLE affectations DROP COLUMN duree_de_vie');
        DB::statement('ALTER TABLE affectations CHANGE duree_de_vie_days duree_de_vie INT UNSIGNED NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE affectations ADD COLUMN duree_de_vie_date DATE NULL AFTER date_attribution');
        DB::statement("
            UPDATE affectations
            SET duree_de_vie_date = CASE
                WHEN duree_de_vie IS NULL OR date_attribution IS NULL THEN NULL
                ELSE DATE_ADD(date_attribution, INTERVAL duree_de_vie DAY)
            END
        ");

        DB::statement('ALTER TABLE affectations DROP COLUMN duree_de_vie');
        DB::statement('ALTER TABLE affectations CHANGE duree_de_vie_date duree_de_vie DATE NULL');
    }
};
