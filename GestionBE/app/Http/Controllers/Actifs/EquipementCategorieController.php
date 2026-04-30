<?php

namespace App\Http\Controllers\Actifs;

use App\Http\Controllers\Controller;
use App\Models\EquipementCategorie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EquipementCategorieController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            EquipementCategorie::query()
                ->orderBy('nom')
                ->get(['id', 'nom'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:120', 'unique:equipement_categories,nom'],
        ]);

        $categorie = EquipementCategorie::create([
            'nom' => trim($validated['nom']),
        ]);

        return response()->json($categorie, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $categorie = EquipementCategorie::findOrFail($id);

        $validated = $request->validate([
            'nom' => [
                'required',
                'string',
                'max:120',
                Rule::unique('equipement_categories', 'nom')->ignore($categorie->id),
            ],
        ]);

        $categorie->update([
            'nom' => trim($validated['nom']),
        ]);

        return response()->json($categorie);
    }

    public function destroy(int $id): JsonResponse
    {
        $categorie = EquipementCategorie::findOrFail($id);
        $categorie->delete();

        return response()->json([
            'message' => 'Categorie supprimee avec succes',
        ]);
    }
}
