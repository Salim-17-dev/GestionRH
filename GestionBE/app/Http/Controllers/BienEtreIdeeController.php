<?php

namespace App\Http\Controllers;

use App\Models\BienEtreIdee;
use Illuminate\Http\Request;

class BienEtreIdeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $idees = BienEtreIdee::orderBy('votes', 'desc')->get();
            return response()->json([
                'success' => true,
                'data' => $idees,
                'count' => count($idees),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des idées',
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
                'budget' => 'nullable|string|max:255',
                'urgence' => 'nullable|string|in:Faible,Normal,Urgent',
                'pdfName' => 'nullable|string|max:255',
                'pdfDataUrl' => 'nullable|string',
                'votes' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:En attente,Validee,Refusee',
            ]);

            $idee = BienEtreIdee::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Idée créée avec succès',
                'data' => $idee,
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
                'message' => 'Erreur lors de la création de l\'idée',
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
            $idee = BienEtreIdee::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $idee,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Idée non trouvée',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'idée',
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
            $idee = BienEtreIdee::findOrFail($id);

            $validated = $request->validate([
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'type' => 'nullable|string|max:255',
                'budget' => 'nullable|string|max:255',
                'urgence' => 'nullable|string|in:Faible,Normal,Urgent',
                'pdfName' => 'nullable|string|max:255',
                'pdfDataUrl' => 'nullable|string',
                'votes' => 'nullable|integer|min:0',
                'status' => 'nullable|string|in:En attente,Validee,Refusee',
            ]);

            $idee->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Idée mise à jour avec succès',
                'data' => $idee,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Idée non trouvée',
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
                'message' => 'Erreur lors de la mise à jour de l\'idée',
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
            $idee = BienEtreIdee::findOrFail($id);
            $idee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Idée supprimée avec succès',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Idée non trouvée',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'idée',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
