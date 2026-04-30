<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipement extends Model
{
    use HasFactory;

    protected $fillable = [
        'designation',
        'categorie',
        'quantite',
        'numero_serie',
        'valeur',
        'date_expiration',
        'etat',
        'statut',
        'photo',
    ];

    protected $casts = [
        'date_expiration' => 'date:Y-m-d',
    ];

    public function affectations(): HasMany
    {
        return $this->hasMany(Affectation::class);
    }

    public function restitutions(): HasMany
    {
        return $this->hasMany(Restitution::class);
    }
}
