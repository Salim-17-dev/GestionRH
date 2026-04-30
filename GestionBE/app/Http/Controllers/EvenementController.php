<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use Illuminate\Http\Request;

class EvenementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $evenements = Evenement::orderBy('budget', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $evenements,
                'count' => count($evenements),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des événements',
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
                'type' => 'nullable|string|max:255',
                'date' => 'nullable|string|max:255',
                'lieu' => 'nullable|string|max:255',
                'budget' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:En attente,Acceptee,Refusee,Completee',
            ]);

            $evenement = Evenement::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Événement créé avec succès',
                'data' => $evenement,
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
                'message' => 'Erreur lors de la création de l\'événement',
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
            $evenement = Evenement::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $evenement,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Événement non trouvé',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'événement',
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
            $evenement = Evenement::findOrFail($id);

            $validated = $request->validate([
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'type' => 'nullable|string|max:255',
                'date' => 'nullable|string|max:255',
                'lieu' => 'nullable|string|max:255',
                'budget' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:En attente,Acceptee,Refusee,Completee',
            ]);

            $evenement->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Événement mis à jour avec succès',
                'data' => $evenement,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Événement non trouvé',
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
                'message' => 'Erreur lors de la mise à jour de l\'événement',
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
            $evenement = Evenement::findOrFail($id);
            $evenement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Événement supprimé avec succès',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Événement non trouvé',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'événement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
