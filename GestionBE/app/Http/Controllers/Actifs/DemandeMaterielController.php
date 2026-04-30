<?php

namespace App\Http\Controllers\Actifs;

use App\Http\Controllers\Controller;
use App\Models\DemandeMateriel;
use App\Models\EquipementCategorie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DemandeMaterielController extends Controller
{
    public function index(): JsonResponse
    {
        $demandes = DemandeMateriel::orderByDesc('id')->get();

        return response()->json($demandes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type_demandeur' => ['nullable', Rule::in(['employe', 'service'])],
            'demandeur' => ['required', 'string', 'max:255'],
            'categorie' => ['required', 'string', 'max:120'],
            'quantite' => ['nullable', 'integer', 'min:1'],
            'equipement_souhaite' => ['required', 'string', 'max:255'],
            'urgence' => ['required', Rule::in(['Faible', 'Normal', 'Urgent'])],
            'date_souhaitee' => ['nullable', 'date'],
            'justificatif' => ['required', 'string'],
            'piece_jointe' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'statut' => ['nullable', 'string', 'max:120'],
        ]);

        if ($request->hasFile('piece_jointe')) {
            $validated['piece_jointe'] = $request->file('piece_jointe')->store('demandes_materiels', 'public');
        }

        $validated['type_demandeur'] = $validated['type_demandeur'] ?? 'employe';
        $validated['statut'] = $validated['statut'] ?? 'En attente';

        $this->ensureCategoryExists($validated['categorie']);
        $demande = DemandeMateriel::create($validated);

        return response()->json($demande, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $demande = DemandeMateriel::findOrFail($id);

        $validated = $request->validate([
            'type_demandeur' => ['nullable', Rule::in(['employe', 'service'])],
            'demandeur' => ['required', 'string', 'max:255'],
            'categorie' => ['required', 'string', 'max:120'],
            'quantite' => ['nullable', 'integer', 'min:1'],
            'equipement_souhaite' => ['required', 'string', 'max:255'],
            'urgence' => ['required', Rule::in(['Faible', 'Normal', 'Urgent'])],
            'date_souhaitee' => ['nullable', 'date'],
            'justificatif' => ['required', 'string'],
            'piece_jointe' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'statut' => ['required', 'string', 'max:120'],
        ]);

        if ($request->hasFile('piece_jointe')) {
            if ($demande->piece_jointe) {
                Storage::disk('public')->delete($demande->piece_jointe);
            }
            $validated['piece_jointe'] = $request->file('piece_jointe')->store('demandes_materiels', 'public');
        }

        $validated['type_demandeur'] = $validated['type_demandeur'] ?? 'employe';
        $this->ensureCategoryExists($validated['categorie']);
        $demande->update($validated);

        return response()->json($demande);
    }

    public function delete(int $id): JsonResponse
    {
        $demande = DemandeMateriel::findOrFail($id);

        if ($demande->piece_jointe) {
            Storage::disk('public')->delete($demande->piece_jointe);
        }

        $demande->delete();

        return response()->json(['message' => 'Demande supprimee avec succes']);
    }

    private function ensureCategoryExists(string $category): void
    {
        $normalizedCategory = trim($category);

        if ($normalizedCategory === '') {
            return;
        }

        EquipementCategorie::firstOrCreate([
            'nom' => $normalizedCategory,
        ]);
    }
}
