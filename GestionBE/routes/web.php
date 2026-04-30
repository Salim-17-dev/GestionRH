<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupeClientController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\BienEtreIdeeController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\EvenementController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Bien-Etre Routes
Route::apiResource('/bien-etre-idees', BienEtreIdeeController::class);
Route::apiResource('/formations', FormationController::class);
Route::apiResource('/evenements', EvenementController::class);

// Legacy Routes
Route::apiResource('/groupes', GroupeClientController::class);
Route::apiResource('/clients', GroupeClientController::class);