<?php

namespace App\Http\Controllers\Actifs;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\Equipement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AffectationController extends Controller
{
    public function index(): JsonResponse
    {
        $latestAffectationsPerEquipement = Affectation::query()
            ->selectRaw('MAX(id)')
            ->groupBy('equipement_id');

        $affectations = Affectation::with(['employe:id,nom,prenom', 'equipement:id,designation,numero_serie,statut,etat'])
            ->whereIn('id', $latestAffectationsPerEquipement)
            ->whereHas('equipement', function ($query) {
                $query->where('statut', 'Affecte');
            })
            ->orderByDesc('id')
            ->get();

        return response()->json($affectations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employe_id' => ['required', 'exists:employes,id'],
            'equipement_id' => ['required', 'exists:equipements,id'],
            'date_attribution' => ['required', 'date'],
            'commentaire' => ['nullable', 'string'],
        ]);

        $affectation = DB::transaction(function () use ($validated) {
            $equipement = Equipement::lockForUpdate()->findOrFail($validated['equipement_id']);

            if ($equipement->statut !== 'Disponible') {
                throw ValidationException::withMessages([
                    'equipement_id' => 'Cet equipement nest pas disponible pour une affectation.',
                ]);
            }

            $affectation = Affectation::create(array_merge($validated, [
                'etat' => $equipement->etat,
            ]));

            $equipement->update([
                'statut' => 'Affecte',
            ]);

            return $affectation;
        });

        return response()->json(
            $affectation->load(['employe:id,nom,prenom', 'equipement:id,designation,numero_serie,statut,etat']),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $affectation = Affectation::findOrFail($id);

        $validated = $request->validate([
            'employe_id' => ['required', 'exists:employes,id'],
            'equipement_id' => ['required', 'exists:equipements,id'],
            'date_attribution' => ['required', 'date'],
            'commentaire' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $affectation) {
            $previousEquipementId = (int) $affectation->equipement_id;
            $newEquipementId = (int) $validated['equipement_id'];

            if ($previousEquipementId !== $newEquipementId) {
                $oldEquipement = Equipement::lockForUpdate()->findOrFail($previousEquipementId);
                $newEquipement = Equipement::lockForUpdate()->findOrFail($newEquipementId);

                if ($newEquipement->statut !== 'Disponible') {
                    throw ValidationException::withMessages([
                        'equipement_id' => 'Le nouvel equipement selectionne est indisponible.',
                    ]);
                }

                $oldEquipement->update(['statut' => 'Disponible']);
                $newEquipement->update([
                    'statut' => 'Affecte',
                ]);

                $validated['etat'] = $newEquipement->etat;
            } else {
                $equipement = Equipement::lockForUpdate()->findOrFail($newEquipementId);
                $updates = [];

                if ($equipement->statut === 'Disponible') {
                    $updates['statut'] = 'Affecte';
                }

                if (!empty($updates)) {
                    $equipement->update($updates);
                }

                $validated['etat'] = $equipement->etat;
            }

            $affectation->update($validated);
        });

        return response()->json($affectation->load(['employe:id,nom,prenom', 'equipement:id,designation,numero_serie,statut,etat']));
    }

    public function delete(int $id): JsonResponse
    {
        $affectation = Affectation::findOrFail($id);

        DB::transaction(function () use ($affectation) {
            $equipement = Equipement::lockForUpdate()->find($affectation->equipement_id);
            if ($equipement) {
                $equipement->update(['statut' => 'Disponible']);
            }

            $affectation->delete();
        });

        return response()->json(['message' => 'Affectation supprimee avec succes']);
    }
}
