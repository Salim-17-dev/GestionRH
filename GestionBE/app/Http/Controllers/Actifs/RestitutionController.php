<?php

namespace App\Http\Controllers\Actifs;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use App\Models\Equipement;
use App\Models\Restitution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RestitutionController extends Controller
{
    public function index(): JsonResponse
    {
        $restitutions = Restitution::with([
            'equipement:id,designation,numero_serie',
            'employeActuel:id,nom,prenom',
            'nouvelEmploye:id,nom,prenom',
        ])->orderByDesc('id')->get();

        return response()->json($restitutions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipement_id' => ['required', 'exists:equipements,id'],
            'statut' => ['required', Rule::in(['restitue', 'transfere'])],
            'etat' => ['nullable', Rule::in(['en attente', 'valide', 'validé'])],
            'date_retour' => ['nullable', 'date', 'required_if:statut,restitue'],
            'etat_retour' => ['nullable', 'string', 'max:120', 'required_if:statut,restitue'],
            'nouvel_employe_id' => ['nullable', 'exists:employes,id', 'required_if:statut,transfere'],
            'date_transfert' => ['nullable', 'date', 'required_if:statut,transfere'],
            'commentaire' => ['nullable', 'string'],
        ]);

        if (($validated['etat'] ?? null) === 'valide') {
            $validated['etat'] = 'validé';
        }

        $restitution = DB::transaction(function () use ($validated) {
            $equipement = Equipement::lockForUpdate()->findOrFail($validated['equipement_id']);

            if ($equipement->statut !== 'Affecte') {
                throw ValidationException::withMessages([
                    'equipement_id' => 'Seuls les equipements affectes peuvent etre restitues ou transferes.',
                ]);
            }

            $currentAffectation = Affectation::where('equipement_id', $equipement->id)
                ->orderByDesc('id')
                ->first();

            if (!$currentAffectation) {
                throw ValidationException::withMessages([
                    'equipement_id' => 'Aucune affectation en cours trouvee pour cet equipement.',
                ]);
            }

            $payload = [
                'equipement_id' => $equipement->id,
                'affectation_id' => $currentAffectation->id,
                'employe_actuel_id' => $currentAffectation->employe_id,
                'date_attribution' => $currentAffectation->date_attribution,
                'etat' => $validated['etat'] ?? 'en attente',
                'statut' => $validated['statut'],
                'date_retour' => $validated['date_retour'] ?? null,
                'etat_retour' => $validated['etat_retour'] ?? null,
                'nouvel_employe_id' => $validated['nouvel_employe_id'] ?? null,
                'date_transfert' => $validated['date_transfert'] ?? null,
                'commentaire' => $validated['commentaire'] ?? null,
            ];

            $restitution = Restitution::create($payload);

            if ($validated['statut'] === 'restitue') {
                $equipement->update([
                    'statut' => 'Disponible',
                    'etat' => $validated['etat_retour'],
                ]);
            } else {
                Affectation::create([
                    'employe_id' => $validated['nouvel_employe_id'],
                    'equipement_id' => $equipement->id,
                    'date_attribution' => $validated['date_transfert'],
                    'etat' => $equipement->etat ?: $currentAffectation->etat,
                    'commentaire' => $validated['commentaire'] ?? 'Transfert automatique',
                ]);

                $equipement->update(['statut' => 'Affecte']);
            }

            return $restitution;
        });

        return response()->json(
            $restitution->load(['equipement:id,designation,numero_serie', 'employeActuel:id,nom,prenom', 'nouvelEmploye:id,nom,prenom']),
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $restitution = Restitution::findOrFail($id);

        $validated = $request->validate([
            'statut' => ['nullable', Rule::in(['restitue', 'transfere'])],
            'etat' => ['nullable', Rule::in(['en attente', 'valide', 'validé'])],
            'commentaire' => ['nullable', 'string'],
            'date_retour' => ['nullable', 'date'],
            'etat_retour' => ['nullable', 'string', 'max:120'],
            'nouvel_employe_id' => ['nullable', 'exists:employes,id'],
            'date_transfert' => ['nullable', 'date'],
        ]);

        if (($validated['etat'] ?? null) === 'valide') {
            $validated['etat'] = 'validé';
        }

        DB::transaction(function () use ($restitution, $validated) {
            $restitution->update($validated);
            $this->syncEquipementFromRestitution($restitution->fresh());
        });

        return response()->json(
            $restitution->load(['equipement:id,designation,numero_serie', 'employeActuel:id,nom,prenom', 'nouvelEmploye:id,nom,prenom'])
        );
    }

    public function delete(int $id): JsonResponse
    {
        $restitution = Restitution::findOrFail($id);

        DB::transaction(function () use ($restitution) {
            $equipementId = $restitution->equipement_id;
            $restitution->delete();

            $latestRestitution = Restitution::where('equipement_id', $equipementId)
                ->orderByDesc('id')
                ->first();

            if ($latestRestitution) {
                $this->syncEquipementFromRestitution($latestRestitution);
                return;
            }

            $equipement = Equipement::lockForUpdate()->find($equipementId);

            if (!$equipement) {
                return;
            }

            $hasAffectation = Affectation::where('equipement_id', $equipementId)->exists();
            $equipement->update(['statut' => $hasAffectation ? 'Affecte' : 'Disponible']);
        });

        return response()->json(['message' => 'Operation de restitution/transfert supprimee avec succes']);
    }

    private function syncEquipementFromRestitution(Restitution $restitution): void
    {
        $equipement = Equipement::lockForUpdate()->find($restitution->equipement_id);

        if (!$equipement) {
            return;
        }

        if ($restitution->statut === 'restitue') {
            $updates = ['statut' => 'Disponible'];

            if ($restitution->etat_retour) {
                $updates['etat'] = $restitution->etat_retour;
            }

            $equipement->update($updates);
            return;
        }

        if ($restitution->statut === 'transfere') {
            $equipement->update(['statut' => 'Affecte']);
        }
    }
}
