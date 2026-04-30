<?php

namespace App\Http\Controllers\Actifs;

use App\Http\Controllers\Controller;
use App\Models\Equipement;
use App\Models\EquipementCategorie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EquipementController extends Controller
{
    public function index(): JsonResponse
    {
        $equipements = Equipement::orderByDesc('id')->get()->map(
            fn (Equipement $equipement) => $this->transformEquipement($equipement)
        );

        return response()->json($equipements);
    }

    public function store(Request $request): JsonResponse
    {
        $this->normalizeOptionalFields($request);

        $validated = $request->validate([
            'designation' => 'required|string|max:255',
            'categorie' => 'required|string|max:100',
            'quantite' => 'nullable|integer|min:0',
            'numero_serie' => 'required|string|max:120|unique:equipements,numero_serie',
            'valeur' => 'nullable|numeric|min:0',
            'date_expiration' => 'nullable|date',
            'etat' => 'required|string|max:120',
            'statut' => 'required|string|max:120',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        if (($validated['valeur'] ?? null) === '') {
            $validated['valeur'] = null;
        }

        if (($validated['date_expiration'] ?? null) === '') {
            $validated['date_expiration'] = null;
        }

        if (($validated['quantite'] ?? null) === '') {
            $validated['quantite'] = null;
        }

        if ($request->hasFile('photo')) {
            $validated['photo'] = Storage::url($request->file('photo')->store('public/equipements'));
        }

        $this->ensureCategoryExists($validated['categorie']);
        $equipement = Equipement::create($validated);

        return response()->json($this->transformEquipement($equipement), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $equipement = Equipement::findOrFail($id);

        $this->normalizeOptionalFields($request);

        $validated = $request->validate([
            'designation' => 'required|string|max:255',
            'categorie' => 'required|string|max:100',
            'quantite' => 'nullable|integer|min:0',
            'numero_serie' => 'required|string|max:120|unique:equipements,numero_serie,' . $equipement->id,
            'valeur' => 'nullable|numeric|min:0',
            'date_expiration' => 'nullable|date',
            'etat' => 'required|string|max:120',
            'statut' => 'required|string|max:120',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        if (($validated['valeur'] ?? null) === '') {
            $validated['valeur'] = null;
        }

        if (($validated['date_expiration'] ?? null) === '') {
            $validated['date_expiration'] = null;
        }

        if (($validated['quantite'] ?? null) === '') {
            $validated['quantite'] = null;
        }

        if ($request->hasFile('photo')) {
            if ($equipement->photo) {
                Storage::delete($this->storagePathFromUrl($equipement->photo));
            }
            $validated['photo'] = Storage::url($request->file('photo')->store('public/equipements'));
        }

        $this->ensureCategoryExists($validated['categorie']);
        $equipement->update($validated);

        return response()->json($this->transformEquipement($equipement->fresh()));
    }

    public function delete(int $id): JsonResponse
    {
        $equipement = Equipement::findOrFail($id);
        if ($equipement->photo) {
            Storage::delete($this->storagePathFromUrl($equipement->photo));
        }
        $equipement->delete();

        return response()->json(['message' => 'Equipement supprime avec succes']);
    }

    private function transformEquipement(Equipement $equipement): array
    {
        $data = $equipement->toArray();
        $data['photo_url'] = $this->resolvePhotoUrl($equipement->photo);

        return $data;
    }

    private function resolvePhotoUrl(?string $photo): ?string
    {
        if (!$photo) {
            return null;
        }

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        if (str_starts_with($photo, '/storage/')) {
            return url($photo);
        }

        $cleanedPath = ltrim(preg_replace('#^storage/#', '', $photo), '/');

        return url('/storage/' . $cleanedPath);
    }

    private function storagePathFromUrl(string $photo): string
    {
        $cleanedPath = preg_replace('#^https?://[^/]+/#', '', $photo);
        $cleanedPath = ltrim($cleanedPath ?? $photo, '/');
        $cleanedPath = preg_replace('#^storage/#', 'public/', $cleanedPath);

        return $cleanedPath;
    }

    private function normalizeOptionalFields(Request $request): void
    {
        $request->merge([
            'valeur' => $this->normalizeNullableInput($request->input('valeur')),
            'date_expiration' => $this->normalizeNullableInput($request->input('date_expiration')),
        ]);
    }

    private function normalizeNullableInput(mixed $value): mixed
    {
        return $value === '' || $value === 'null' ? null : $value;
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
