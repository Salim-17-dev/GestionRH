<?php

namespace App\Http\Controllers;

use App\Models\DemandeAdministration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DemandeAdministrationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DemandeAdministration::orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(DemandeAdministration::findOrFail($id));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employe' => ['required', 'string', 'max:255'],
            'type_demande' => ['required', 'string', 'max:255'],
            'date_demande' => ['required', 'date'],
            'statut' => ['nullable', 'string', 'max:120'],
            'commentaire' => ['nullable', 'string'],
        ]);

        if (!isset($validated['statut']) || $validated['statut'] === '') {
            $validated['statut'] = 'En attente';
        }

        $demande = DemandeAdministration::create($validated);

        return response()->json($demande, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $demande = DemandeAdministration::findOrFail($id);

        $validated = $request->validate([
            'employe' => ['required', 'string', 'max:255'],
            'type_demande' => ['required', 'string', 'max:255'],
            'date_demande' => ['required', 'date'],
            'statut' => ['nullable', 'string', 'max:120'],
            'commentaire' => ['nullable', 'string'],
        ]);

        $demande->update($validated);

        return response()->json($demande);
    }

    public function destroy(int $id): JsonResponse
    {
        $demande = DemandeAdministration::findOrFail($id);
        $demande->delete();

        return response()->json(['message' => 'Demande administrative supprimee avec succes']);
    }
}
