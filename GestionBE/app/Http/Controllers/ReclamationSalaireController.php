<?php

namespace App\Http\Controllers;

use App\Models\ReclamationSalaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReclamationSalaireController extends Controller
{
    public function index()
    {
        return ReclamationSalaire::with('employe')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employe_id' => 'nullable|exists:employes,id',
            'mois_concerne' => 'required',
            'type_probleme' => 'required',
            'description' => 'required',
            'piece_jointe' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'statut' => 'nullable',
        ]);

        if ($request->hasFile('piece_jointe')) {
            $data['piece_jointe_nom'] = $request->file('piece_jointe')->getClientOriginalName();
            $data['piece_jointe'] = $request->file('piece_jointe')->store('reclamations', 'public');
        }

        if (!isset($data['statut'])) {
            $data['statut'] = 'En attente';
        }

        $reclamation = ReclamationSalaire::create($data);

        return response()->json($reclamation->load('employe'), 201);
    }

    public function show(ReclamationSalaire $reclamationSalaire)
    {
        return $reclamationSalaire->load('employe');
    }

    public function update(Request $request, ReclamationSalaire $reclamationSalaire)
    {
        $data = $request->validate([
            'employe_id' => 'nullable|exists:employes,id',
            'mois_concerne' => 'sometimes|required',
            'type_probleme' => 'sometimes|required',
            'description' => 'sometimes|required',
            'piece_jointe' => 'nullable|file|mimes:jpg,jpeg,png,pdf',
            'statut' => 'nullable',
        ]);

        if ($request->hasFile('piece_jointe')) {
            if ($reclamationSalaire->piece_jointe) {
                Storage::disk('public')->delete($reclamationSalaire->piece_jointe);
            }

            $data['piece_jointe_nom'] = $request->file('piece_jointe')->getClientOriginalName();
            $data['piece_jointe'] = $request->file('piece_jointe')->store('reclamations', 'public');
        }

        $reclamationSalaire->update($data);

        return response()->json($reclamationSalaire->fresh()->load('employe'));
    }

    public function destroy(ReclamationSalaire $reclamationSalaire)
    {
        if ($reclamationSalaire->piece_jointe) {
            Storage::disk('public')->delete($reclamationSalaire->piece_jointe);
        }

        $reclamationSalaire->delete();

        return response()->json(['message' => 'supprime avec succes']);
    }
}
