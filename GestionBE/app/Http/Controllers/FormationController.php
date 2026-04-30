<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $formations = Formation::orderBy('votes', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $formations,
                'count' => count($formations),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des formations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'domaine' => 'nullable|string|max:255',
                'duree' => 'nullable|string|max:255',
                'type' => 'nullable|string|max:255',
                'votes' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:En attente,Acceptee,Refusee',
            ]);

            $formation = Formation::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Formation créée avec succès',
                'data' => $formation,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $formation = Formation::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $formation,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Formation non trouvée',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $formation = Formation::findOrFail($id);

            $validated = $request->validate([
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'domaine' => 'nullable|string|max:255',
                'duree' => 'nullable|string|max:255',
                'type' => 'nullable|string|max:255',
                'votes' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:En attente,Acceptee,Refusee',
            ]);

            $formation->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Formation mise à jour avec succès',
                'data' => $formation,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Formation non trouvée',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $formation = Formation::findOrFail($id);
            $formation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Formation supprimée avec succès',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Formation non trouvée',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
