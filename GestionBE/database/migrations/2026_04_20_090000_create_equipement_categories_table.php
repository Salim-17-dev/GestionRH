<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipement_categories', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 120)->unique();
            $table->timestamps();
        });

        $defaultCategories = [
            'Informatique',
            'Mobile',
            'Bureautique',
            'Mobilier',
            'Vehicule',
        ];

        $existingEquipementCategories = DB::table('equipements')
            ->whereNotNull('categorie')
            ->pluck('categorie');

        $existingDemandeCategories = DB::table('demandes_materiels')
            ->whereNotNull('categorie')
            ->pluck('categorie');

        $categories = (new Collection([
            ...$defaultCategories,
            ...$existingEquipementCategories->all(),
            ...$existingDemandeCategories->all(),
        ]))
            ->map(fn (mixed $value) => trim((string) $value))
            ->filter()
            ->unique(fn (string $value) => mb_strtolower($value))
            ->values();

        if ($categories->isEmpty()) {
            return;
        }

        $timestamp = now();

        DB::table('equipement_categories')->insert(
            $categories
                ->map(fn (string $value) => [
                    'nom' => $value,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])
                ->all()
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('equipement_categories');
    }
};
