<?php

namespace App\Http\Controllers;

use App\Models\DemandeAttestation;
use Illuminate\Http\Request;

class DemandeAttestationController extends Controller
{
    public function index()
    {
        return DemandeAttestation::all();
    }

    public function show($id)
    {
        return DemandeAttestation::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employe' => 'required|string',
            'type' => 'required|string',
            'langue' => 'required|string',
            'destinataire' => 'required|string',
            'date_souhaitee' => 'required|date',
            'commentaire' => 'nullable|string',
            'statut' => 'nullable|string',
        ]);

        return DemandeAttestation::create($validated);
    }

    public function update(Request $request, $id)
    {
        $demande = DemandeAttestation::findOrFail($id);

        $validated = $request->validate([
            'employe' => 'sometimes|required|string',
            'type' => 'sometimes|required|string',
            'langue' => 'sometimes|required|string',
            'destinataire' => 'sometimes|required|string',
            'date_souhaitee' => 'sometimes|required|date',
            'commentaire' => 'nullable|string',
            'statut' => 'nullable|string',
        ]);

        $demande->update($validated);
        return $demande;
    }

    public function destroy($id)
    {
        $demande = DemandeAttestation::findOrFail($id);
        $demande->delete();
        return response()->json(['message' => 'Demande supprimée']);
    }
}
