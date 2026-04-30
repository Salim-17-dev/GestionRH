<?php

namespace App\Http\Controllers;

use App\Models\ReclamationRh;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReclamationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ReclamationRh::orderByDesc('id')->get());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(ReclamationRh::findOrFail($id));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employe' => ['required', 'string', 'max:255'],
            'type_reclamation' => ['required', 'string', 'max:255'],
            'montant' => ['nullable', 'numeric'],
            'date' => ['required', 'date'],
            'statut' => ['nullable', 'string', 'max:120'],
        ]);

        if (!isset($validated['statut']) || $validated['statut'] === '') {
            $validated['statut'] = 'En attente';
        }

        $reclamation = ReclamationRh::create($validated);

        return response()->json($reclamation, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $reclamation = ReclamationRh::findOrFail($id);

        $validated = $request->validate([
            'employe' => ['required', 'string', 'max:255'],
            'type_reclamation' => ['required', 'string', 'max:255'],
            'montant' => ['nullable', 'numeric'],
            'date' => ['required', 'date'],
            'statut' => ['nullable', 'string', 'max:120'],
        ]);

        $reclamation->update($validated);

        return response()->json($reclamation);
    }

    public function destroy(int $id): JsonResponse
    {
        $reclamation = ReclamationRh::findOrFail($id);
        $reclamation->delete();

        return response()->json(['message' => 'Reclamation supprimee avec succes']);
    }
}
